import { getTrendingPeriod, type Repo } from "./aggregator"
import { test, expect } from '@jest/globals';

import {
    endOfDay
} from 'date-fns';


test('period with gaps kube-score', () => {
    const repos: Repo[] = [
        { "full_name": "zegl/kube-score", "html_url": "https://github.com/zegl/kube-score", "description": "Kubernetes object analysis with recommendations for improved reliability and security", "updated_at": "2022-09-29T01:45:34Z", "stargazers_count": 1700, "language": "Go", "fetchedAt": "2022-09-27T05:59:53.905Z" },
        { "full_name": "zegl/kube-score", "html_url": "https://github.com/zegl/kube-score", "description": "Kubernetes object analysis with recommendations for improved reliability and security", "updated_at": "2022-09-29T01:45:34Z", "stargazers_count": 1922, "language": "Go", "fetchedAt": "2022-09-29T05:59:53.905Z" },
        { "full_name": "zegl/kube-score", "html_url": "https://github.com/zegl/kube-score", "description": "Kubernetes object analysis with recommendations for improved reliability and security", "updated_at": "2022-10-03T00:57:35Z", "stargazers_count": 1927, "language": "Go", "fetchedAt": "2022-10-03T07:42:43.422Z" },
    ]

    expect(getTrendingPeriod(repos, [endOfDay(new Date("2022-10-02T00:00:00.000Z")), endOfDay(new Date("2022-10-04T00:00:00.000Z"))], 24)[0].diff).toEqual(2)
})

test('period use earliest known if no before', () => {
    const repos: Repo[] = [
        { "full_name": "zegl/kube-score", "html_url": "https://github.com/zegl/kube-score", "description": "Kubernetes object analysis with recommendations for improved reliability and security", "updated_at": "2022-09-29T01:45:34Z", "stargazers_count": 1700, "language": "Go", "fetchedAt": "2022-09-27T05:59:53.905Z" },
        { "full_name": "zegl/kube-score", "html_url": "https://github.com/zegl/kube-score", "description": "Kubernetes object analysis with recommendations for improved reliability and security", "updated_at": "2022-09-29T01:45:34Z", "stargazers_count": 1922, "language": "Go", "fetchedAt": "2022-09-29T05:59:53.905Z" },
        { "full_name": "zegl/kube-score", "html_url": "https://github.com/zegl/kube-score", "description": "Kubernetes object analysis with recommendations for improved reliability and security", "updated_at": "2022-10-03T00:57:35Z", "stargazers_count": 1927, "language": "Go", "fetchedAt": "2022-10-03T07:42:43.422Z" },
    ]

    expect(getTrendingPeriod(repos, [endOfDay(new Date("2022-09-02T00:00:00.000Z")), endOfDay(new Date("2022-10-04T00:00:00.000Z"))], 24 * 31)[0].diff).toEqual(227)
})

test('period with go-pkgz/auth', () => {
    const repos: Repo[] = [
        { "full_name": "go-pkgz/auth", "html_url": "https://github.com/go-pkgz/auth", "description": "Authenticator via oauth2, direct, email and telegram ", "updated_at": "2022-09-22T08:56:42Z", "stargazers_count": 267, "language": "Go", "fetchedAt": "2022-09-25T05:02:21.983Z" },
        { "full_name": "go-pkgz/auth", "html_url": "https://github.com/go-pkgz/auth", "description": "Authenticator via oauth2, direct, email and telegram ", "updated_at": "2022-09-22T08:56:42Z", "stargazers_count": 267, "language": "Go", "fetchedAt": "2022-09-28T06:33:47.121Z" },
        { "full_name": "go-pkgz/auth", "html_url": "https://github.com/go-pkgz/auth", "description": "Authenticator via oauth2, direct, email and telegram ", "updated_at": "2022-09-22T08:56:42Z", "stargazers_count": 267, "language": "Go", "fetchedAt": "2022-09-24T05:11:45.970Z" },
        { "full_name": "go-pkgz/auth", "html_url": "https://github.com/go-pkgz/auth", "description": "Authenticator via oauth2, direct, email and telegram ", "updated_at": "2022-10-03T07:13:38Z", "stargazers_count": 463, "language": "Go", "fetchedAt": "2022-10-03T07:18:23.648Z" },
        { "full_name": "go-pkgz/auth", "html_url": "https://github.com/go-pkgz/auth", "description": "Authenticator via oauth2, direct, email and telegram ", "updated_at": "2022-10-03T07:18:16Z", "stargazers_count": 464, "language": "Go", "fetchedAt": "2022-10-03T07:18:23.649Z" },
    ]

    expect(getTrendingPeriod(repos, [endOfDay(new Date("2022-10-02T00:00:00.000Z")), endOfDay(new Date("2022-10-04T00:00:00.000Z"))], 24)[0].diff).toEqual(40)
})

test('long period with few snapshots', () => {
    const repos: Repo[] = [
        { "full_name": "HavocFramework/Havoc", "html_url": "https://github.com/HavocFramework/Havoc", "description": "The Havoc Framework", "updated_at": "2022-10-03T07:33:33Z", "stargazers_count": 1000, "language": "Go", "fetchedAt": "2022-10-03T07:34:43.031Z" },
        { "full_name": "HavocFramework/Havoc", "html_url": "https://github.com/HavocFramework/Havoc", "description": "The Havoc Framework", "updated_at": "2022-10-04T10:01:14Z", "stargazers_count": 1259, "language": "Go", "fetchedAt": "2022-10-04T10:25:09.116Z" },
    ]

    expect(getTrendingPeriod(repos, [endOfDay(new Date("2022-09-04T00:00:00.000Z")), endOfDay(new Date("2022-10-04T00:00:00.000Z"))], 24 * 31)[0].diff).toEqual(259)
})