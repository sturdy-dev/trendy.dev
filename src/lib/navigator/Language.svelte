<script lang="ts">
	export let src;
	export let name;
</script>

<a
	href="/week/{name}"
	class="block py-2 px-4 w-18 h-18 inline-flex flex-col justify-between items-center bg-slate-700 text-slate-300 rounded-lg text-center space-y-4"
>
	<div class="max-h-10 w-full flex-1 inline-flex items-center flex-col justify-center">
		<img {src} class="max-h-10 " />
	</div>
	<span class="hidden sm:inline-block">{name}</span>
</a>
