package main

import (
	"encoding/json"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

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

func crawlActions() error {
	allActions, err := load()
	if err != nil {
		return err
	}

	actionsByURL := make(map[string]action)
	for _, a := range allActions {
		actionsByURL[a.URL] = a
	}

	for page := 1; page <= 50; page++ {
		log.Println("Page", page, len(actionsByURL))

		actions, err := crawlActionsPage(page)
		if err != nil {
			return err
		}

		for _, a := range actions {
			actionsByURL[a.URL] = a
		}

		asList := []action{}
		for _, a := range actionsByURL {
			asList = append(asList, a)
		}

		err = save(dbActionsPath, asList)
		if err != nil {
			return err
		}

		time.Sleep(time.Second * 2)
	}

	return nil
}

func load() ([]action, error) {
	data, err := os.ReadFile(dbActionsPath)
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

func annotateActions() error {
	actions, err := load()
	if err != nil {
		return err
	}

	for i, a := range actions {
		// already crawled
		if a.UpdatedAt.After(time.Now().Add(-1 * time.Hour * 24)) {
			continue
		}

		log.Printf("Annotating %d of %d", i, len(actions))

		if n, err := annotateAction(a); err == nil {
			actions[i] = n
			a = n
		} else {
			log.Println(err)
		}

		// star growth
		if a.Stars > 1 {
			if h, err := fetchStarHistory(a.RepoURL, a.Stars); err == nil {
				a.StarsHistory = h
				actions[i] = a
			} else {
				log.Println(err)
			}
		}

		a.UpdatedAt = time.Now()

		// save all
		err = save(dbActionsPath, actions)
		if err != nil {
			return err
		}

		time.Sleep(time.Second / 2)
	}

	err = save(dbActionsPath, actions)
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
	err = os.WriteFile(exportActionsPath, res, 0644)
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

func crawlActionsPage(page int) ([]action, error) {
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

func annotateAction(a action) (action, error) {
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
