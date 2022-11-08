<script lang="ts">
	import archive from '$lib/archive/archive.json';
	import Newsletter from '$lib/Newsletter.svelte';
</script>

<div class="space-y-4">
	<h1 class="text-3xl">Newsletter Archive</h1>
	<p>All past issues of Trendy Dev Weekly</p>

    <Newsletter />

	<div>
		{#each archive as a}
			<a
				href={a.url}
				class="bg-black block text-white p-4 rounded-lg flex flex-col items-start gap-4 overflow-hidden"
			>
				<div class="flex items-start gap-4 w-full flex-1">
					<div class="flex-1">
						<div class="flex items-baseline gap-2">
							<h1 class="text-xl flex-1">{a.title}</h1>
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
