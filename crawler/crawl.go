package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"github.com/google/go-github/v47/github"
	"golang.org/x/oauth2"
	"log"
	"os"
	"sort"
)

const (
	dbActionsPath     = "/Users/gustav/src/marketplace/db_actions.json"
	dbReposPath       = "/Users/gustav/src/marketplace/db_repos.json"
	exportActionsPath = "/Users/gustav/src/marketplace/src/lib/db/db_actions.ts"
	exportReposPath   = "/Users/gustav/src/marketplace/src/lib/db/db_actions.ts"
)

var (
	githubAccessToken = flag.String("github-access-token", "", "")
)

func main() {
	flag.Parse()

	log.Println(crawlRepos())

	// log.Println(crawlActions())
	// log.Println(annotateActions())
	// log.Println(export())

	log.Println()
}

type repo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	RepoURL     string `json:"repo_url"`
	Stars       int    `json:"stars"`
	Language    string `json:"language"`
}

func crawlRepos() error {
	allRepos, err := loadRepos()
	if err != nil {
		return err
	}
	for page := 1; page <= 10; page++ {
		repos, done, err := findReposLanguage("typescript", page)
		if err != nil {
			return err
		}
		for _, r := range repos {
			allRepos[r.RepoURL] = r
		}
		fmt.Println("COUNT", len(allRepos))
		if done {
			break
		}
	}
	if err := saveRepos(allRepos); err != nil {
		return err
	}
	if err := exportRepos(allRepos); err != nil {
		return err
	}
	return nil
}

func findReposLanguage(lang string, page int) ([]repo, bool, error) {
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: *githubAccessToken},
	)
	tc := oauth2.NewClient(ctx, ts)
	client := github.NewClient(tc)

	repos, resp, err := client.Search.Repositories(ctx, fmt.Sprintf("stars:>500 language:%s pushed:>2022-09-04", lang), &github.SearchOptions{
		Order: "updated",
		ListOptions: github.ListOptions{
			Page:    page,
			PerPage: 100,
		},
	})
	if err != nil {
		return nil, false, err
	}

	log.Println("total", repos.GetTotal())
	log.Println(resp.Rate)

	var res []repo

	for _, r := range repos.Repositories {
		res = append(res, repo{
			Name:        r.GetName(),
			RepoURL:     r.GetHTMLURL(),
			Description: r.GetDescription(),
			Stars:       r.GetStargazersCount(),
			Language:    lang,
		})
	}

	done := repos.GetTotal() < 100*page

	return res, done, nil
}

func saveRepos(r map[string]repo) error {
	d, err := json.Marshal(r)
	if err != nil {
		return err
	}
	if err := os.WriteFile(dbReposPath, d, 0644); err != nil {
		return err
	}
	return nil
}

func loadRepos() (map[string]repo, error) {
	data, err := os.ReadFile(dbReposPath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return make(map[string]repo), nil
		}
		return nil, err
	}

	var repos map[string]repo
	err = json.Unmarshal(data, &repos)
	if err != nil {
		return nil, err
	}

	return repos, nil
}

func exportRepos(repos map[string]repo) error {
	var list []repo
	for _, r := range repos {
		list = append(list, r)
	}

	// sort
	sort.Slice(list, func(i, j int) bool {
		return list[i].RepoURL < list[j].RepoURL
	})

	// format
	data, err := json.MarshalIndent(list, "", "    ")
	if err != nil {
		return err
	}

	// write
	res := []byte("import type { Repository} from \"./types\";\n\nexport const repos : Repository[] = ")
	res = append(res, data...)
	err = os.WriteFile(exportReposPath, res, 0644)
	if err != nil {
		return err
	}
	return nil
}
