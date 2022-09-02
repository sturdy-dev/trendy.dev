package main

import (
	"encoding/json"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

func main() {
	log.Println(run())
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
	URL         string `json:"url"`
	Title       string `json:"title"`
	Creator     string `json:"creator"`
	SVG         string `json:"svg"`
	Description string `json:"description"`
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
