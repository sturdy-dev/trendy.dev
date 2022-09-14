<script lang="ts">
	import StarIcon from '$lib/StarIcon.svelte';
	import { goto } from '$app/navigation';
	import Newsletter from '$lib/Newsletter.svelte';
	import type { Repo } from '$lib/repos';

	export let title: string;
	export let language: string;
	export let dateRange: string;
	export let languages: { slug: string; title: string }[];
	export let repos: Repo[];

	const onDateRangeChange = (dateRange: string) => goto(`/repos/${dateRange}/${language}/`);
	const onLanguageChange = (language: string) => goto(`/repos/${dateRange}/${language}/`);

	const getDateRangeTitle = (date: string) => {
		if (date === 'top') return 'Top';
		if (date === 'day') return 'Trending today';
		if (date === 'week') return 'Trending this week';
		if (date === 'month') return 'Trending this month';
		return '';
	};
</script>

<h1 class="text-2xl text-mono text-center my-4">{title}</h1>

<form action="/" method="get" class="grid grid-cols-5 gap-4 max-w-md p-2 m-auto">
	<div class="col-span-2 flex flex-col gap-2">
		<label for="date-range">Show:</label>
		<select
			name="date-range"
			id="date-range"
			class="bg-inherit w-full"
			on:change={(e) => onDateRangeChange(e.currentTarget.value)}
		>
			{#each ['top', 'day', 'week', 'month'] as range}
				<option value={range} selected={dateRange === range}>{getDateRangeTitle(range)}</option>
			{/each}
		</select>
	</div>

	<div class="col-span-2 flex flex-col gap-2">
		<label for="language">Language:</label>
		<select
			name="language"
			id="language"
			class="bg-inherit w-full"
			on:change={(e) => onLanguageChange(e.currentTarget.value)}
		>
			{#each languages as { title, slug }}
				<option value={slug} selected={slug === language}>{title}</option>
			{/each}
		</select>
	</div>

	<div class="row-span-2 flex items-center">
		<button class="underline" type="submit">Go</button>
	</div>
</form>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	{#each repos as { html_url, full_name, description, stargazers_count, language, diff }, idx}
		<a
			href={html_url}
			class="bg-black text-white p-4 rounded-lg flex flex-col items-start gap-4 overflow-hidden"
		>
			<div class="flex items-start gap-4 w-full flex-1">
				<div class="flex-1">
					<div class="flex items-baseline gap-2">
						<h1 class="text-xl flex-1">{full_name}</h1>
						<div class="text-orange-400 inline-flex gap-2 items-center">
							<StarIcon />
							{new Intl.NumberFormat().format(stargazers_count)}
						</div>
					</div>
					<p class="text-gray-200 h-full">{description}</p>
				</div>
			</div>

			<div class="inline-flex gap-4 w-full">
				<span class="text-sm text-gray-400">#{idx + 1}</span>
				{#if language}
					<span class="text-sm text-gray-400">{language}</span>
				{/if}
				{#if diff}
					<span class="text-sm text-gray-400 flex-1 text-right"
						>{new Intl.NumberFormat().format(diff)} {diff === 1 ? 'star' : 'stars'}
						{#if dateRange === 'day'}
							today
						{:else if dateRange === 'week'}
							this week
						{:else if dateRange === 'month'}
							this month
						{/if}
					</span>
				{/if}
			</div>
		</a>
		{#if idx === 5}
			<Newsletter />
		{/if}
	{/each}
</div>
