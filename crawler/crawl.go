package main

import (
	"flag"
	"log"
)

const (
	dbActionsPath     = "../src/lib/db/db_actions.json"
	exportActionsPath = "../src/lib/db/db_actions.ts"
)

var (
	githubAccessToken = flag.String("github-access-token", "", "")
)

func main() {
	flag.Parse()

	log.Println(crawlActions())
	log.Println(annotateActions())
	log.Println(export())

	log.Println()
}
