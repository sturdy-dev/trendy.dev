package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"golang.org/x/oauth2"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/google/go-github/v47/github"
)

const (
	dbPath     = "/Users/gustav/src/marketplace/db.json"
	exportPath = "/Users/gustav/src/marketplace/src/lib/db.ts"
)

var (
	githubAccessToken = flag.String("github-access-token", "", "")
)

func main() {
	flag.Parse()

	log.Println(annotateAll())
	log.Println(export())
}

func run() error {
	var allActions []action

	for page := 1; page <= 50; page++ {
		log.Println("Page", page, len(allActions))

		actions, err := crawl(page)
		if err != nil {
			return err
		}

		fmt.Println(actions[0].Title)

		allActions = append(allActions, actions...)

		err = save("db.json", allActions)
		if err != nil {
			return err
		}

		time.Sleep(time.Second * 2)
	}

	return nil
}

func load() ([]action, error) {
	data, err := os.ReadFile(dbPath)
	if err != nil {
		return nil, err
	}

	var actions []action
	err = json.Unmarshal(data, &actions)
	if err != nil {
		return nil, err
	}

	return actions, nil
}

func annotateAll() error {
	actions, err := load()
	if err != nil {
		return err
	}

	for i, a := range actions {
		// already crawled
		if a.UpdatedAt.After(time.Now().Add(-1 * time.Hour * 24)) {
			// continue
		}
		if a.Stars < 50 {
			continue
		}
		if a.RepoURL != "https://github.com/getsentry/action-git-diff-suggestions" {
			// continue
		}

		log.Printf("Annotating %d of %d", i, len(actions))

		if false {
			if n, err := annotate(a); err == nil {
				actions[i] = n
				a = n
			} else {
				log.Println(err)
			}
		}

		// star growth
		if a.Stars > 1 {
			if n, err := history(a); err == nil {
				actions[i] = n
				a = n
			} else {
				log.Println(err)
			}
		}

		// save all
		err = save(dbPath, actions)
		if err != nil {
			return err
		}
		log.Println(export())

		time.Sleep(time.Second / 2)
	}

	err = save(dbPath, actions)
	if err != nil {
		return err
	}
	return nil
}

func export() error {
	actions, err := load()
	if err != nil {
		return err
	}

	// sort
	sort.Slice(actions, func(i, j int) bool {
		return actions[i].Title < actions[j].Title
	})

	// format
	data, err := json.MarshalIndent(actions, "", "    ")
	if err != nil {
		return err
	}

	// write
	res := []byte("export const actions = ")
	res = append(res, data...)
	err = os.WriteFile(exportPath, res, 0644)
	if err != nil {
		return err
	}
	return nil
}

func save(path string, actions []action) error {
	d, err := json.Marshal(actions)
	if err != nil {
		return err
	}
	if err := os.WriteFile(path, d, 0644); err != nil {
		return err
	}
	return nil
}

type action struct {
	URL          string        `json:"url"`
	RepoURL      string        `json:"repo_url"`
	Title        string        `json:"title"`
	Creator      string        `json:"creator"`
	SVG          string        `json:"svg"`
	Description  string        `json:"description"`
	Stars        int           `json:"stars"`
	StarsHistory []starHistory `json:"stars_history"`
	UpdatedAt    time.Time     `json:"updated_at"`
}

type starHistory struct {
	At    time.Time `json:"at"`
	Count int       `json:"count"`
}

func crawl(page int) ([]action, error) {
	resp, err := http.Get(fmt.Sprintf("https://github.com/marketplace?category=&page=%d&query=&type=actions&verification=", page))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Load the HTML document
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	var actions []action

	doc.Find(".MarketplaceBody a").Each(func(i int, s *goquery.Selection) {
		href, ok := s.Attr("href")
		if !ok {
			return
		}
		if !strings.HasPrefix(href, "/marketplace/actions/") {
			return
		}

		title := s.Find("h3").Text()

		creator := s.Find("p > span.color-fg-muted").Text()

		description := s.Find("p.wb-break-word").Text()

		logo, err := s.Find(".CircleBadge > svg").Parent().Html()
		if err != nil {
			log.Println(err)
		}

		actions = append(actions, action{
			URL:         href,
			Title:       title,
			Creator:     creator,
			SVG:         logo,
			Description: description,
		})
	})

	return actions, nil
}

func annotate(a action) (action, error) {
	resp, err := http.Get(fmt.Sprintf("https://github.com%s", a.URL))
	if err != nil {
		return a, err
	}
	defer resp.Body.Close()

	// Load the HTML document
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return a, err
	}

	stars := doc.Find("#repo-stars-counter-star")
	if s, err := strconv.Atoi(strings.TrimSpace(stars.Text())); err == nil {
		a.Stars = s
	}

	doc.Find("a").Each(func(i int, selection *goquery.Selection) {
		href, ok := selection.Attr("href")
		if ok && strings.HasSuffix(href, "/issues") {
			a.RepoURL = "https://github.com" + href[0:len(href)-len("/issues")]
		}
	})

	a.UpdatedAt = time.Now()

	return a, nil
}

func history(a action) (action, error) {
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: *githubAccessToken},
	)
	tc := oauth2.NewClient(ctx, ts)
	client := github.NewClient(tc)

	ownerName := a.RepoURL[len("https://github.com/"):]
	owner, name, ok := strings.Cut(ownerName, "/")
	if !ok {
		return a, fmt.Errorf("could not get repo owner/name for %s", a.RepoURL)
	}

	// second to last page
	stars1, _, err := client.Activity.ListStargazers(ctx, owner, name, &github.ListOptions{Page: a.Stars / 100, PerPage: 100})
	if err != nil {
		return a, err
	}

	// last page
	stars2, _, err := client.Activity.ListStargazers(ctx, owner, name, &github.ListOptions{Page: a.Stars/100 + 1, PerPage: 100})
	if err != nil {
		return a, err
	}

	stars := append(stars1, stars2...)

	// dedup
	newStars := []*github.Stargazer{}
	seen := make(map[int64]struct{})
	for _, s := range stars {
		if _, ok := seen[s.User.GetID()]; ok {
			continue
		}
		seen[s.User.GetID()] = struct{}{}
		newStars = append(newStars, s)
	}
	stars = newStars

	// sort
	sort.Slice(stars, func(i, j int) bool {
		return stars[i].StarredAt.Time.Before(stars[j].StarredAt.Time)
	})

	a.StarsHistory = []starHistory{}

	// Count number of stars per day
	for i, s := range stars {
		date := s.StarredAt.Time.Truncate(time.Hour * 24)

		if i+1 == len(stars) {
			a.StarsHistory = append(a.StarsHistory, starHistory{
				At:    date,
				Count: a.Stars - len(stars) + i + 1,
			})
		} else {
			y, m, d := s.StarredAt.Date()
			y2, m2, d2 := stars[i+1].StarredAt.Date()
			if y != y2 || m != m2 || d != d2 {
				a.StarsHistory = append(a.StarsHistory, starHistory{
					At:    date,
					Count: a.Stars - len(stars) + i + 1,
				})
			}
		}
	}

	return a, nil
}
