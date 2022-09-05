package main

import (
	"context"
	"fmt"
	"github.com/google/go-github/v47/github"
	"golang.org/x/oauth2"
	"sort"
	"strings"
	"time"
)

type starHistory struct {
	At    time.Time `json:"at"`
	Count int       `json:"count"`
}

func fetchStarHistory(repoURL string, starsNow int) ([]starHistory, error) {
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: *githubAccessToken},
	)
	tc := oauth2.NewClient(ctx, ts)
	client := github.NewClient(tc)

	ownerName := repoURL[len("https://github.com/"):]
	owner, name, ok := strings.Cut(ownerName, "/")
	if !ok {
		return nil, fmt.Errorf("could not get repo owner/name for %s", a.RepoURL)
	}

	// second to last page
	stars1, _, err := client.Activity.ListStargazers(ctx, owner, name, &github.ListOptions{Page: a.Stars / 100, PerPage: 100})
	if err != nil {
		return nil, err
	}

	// last page
	stars2, _, err := client.Activity.ListStargazers(ctx, owner, name, &github.ListOptions{Page: a.Stars/100 + 1, PerPage: 100})
	if err != nil {
		return nil, err
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

	res := []starHistory{}

	// Count number of stars per day
	for i, s := range stars {
		date := s.StarredAt.Time.Truncate(time.Hour * 24)

		if i+1 == len(stars) {
			res = append(res, starHistory{
				At:    date,
				Count: starsNow - len(stars) + i + 1,
			})
		} else {
			y, m, d := s.StarredAt.Date()
			y2, m2, d2 := stars[i+1].StarredAt.Date()
			if y != y2 || m != m2 || d != d2 {
				res = append(res, starHistory{
					At:    date,
					Count: starsNow - len(stars) + i + 1,
				})
			}
		}
	}

	return res, nil
}
