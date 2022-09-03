package main

import (
	"encoding/json"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

func main() {
	log.Println(export())
	log.Println(annotateAll())
	// log.Println(run())
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

func annotateAll() error {
	data, err := os.ReadFile("db.json")
	if err != nil {
		return err
	}

	var actions []action
	err = json.Unmarshal(data, &actions)
	if err != nil {
		return err
	}

	for i, a := range actions {
		// already crawled
		if a.UpdatedAt.After(time.Now().Add(-1 * time.Hour * 24)) {
			continue
		}

		log.Printf("Annotating %d of %d", i, len(actions))

		if n, err := annotate(a); err == nil {
			actions[i] = n
		} else {
			log.Println(err)
		}

		// save all
		err = save("db.json", actions)
		if err != nil {
			return err
		}
		log.Println(export())

		time.Sleep(time.Second / 2)
	}

	err = save("db.json", actions)
	if err != nil {
		return err
	}
	return nil
}

func export() error {
	data, err := os.ReadFile("db.json")
	if err != nil {
		return err
	}
	res := []byte("export const actions = ")
	res = append(res, data...)
	err = os.WriteFile("/Users/gustav/src/marketplace/src/lib/db.ts", res, 0644)
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
