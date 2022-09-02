<script lang="ts">
	import Actions from '$lib/Actions.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="flex justify-around bg-black w-full min-h-screen">

	<div class="max-w-7xl flex-1 text-white">
<div class="text-2xl p-2 font-mono">
	trendy.dev
</div>

<Actions />
</div>
</div>