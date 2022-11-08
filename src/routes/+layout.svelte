<script lang="ts">
	import '../app.css';
</script>

<main class="flex justify-around bg-gray-900 w-full min-h-screen">
	<div class="max-w-7xl flex-1 text-white">
		<header
			class="p-2 md:px-8 font-mono flex items-center gap-4 flex-col md:flex-row md:justify-between"
		>
			<a href="/" class="inline-flex items-center gap-4">
				<img src="/laptop-small.png" class="h-8 w-8 md:h-16 md:w-16" alt="icon" />
				<span class="md:text-2xl">trendy.dev</span>
			</a>

			<ul class="flex items-center gap-4 justify-center">
				<li>
					<a class="text-gray-400 hover:text-gray-300" href="/">Repositories</a>
				</li>
				<li>
					<a class="text-gray-400 hover:text-gray-300" href="/actions/monthly">Actions</a>
				</li>
				<li>
					<a class="text-gray-400 hover:text-gray-300" href="https://github.com/sturdy-dev/trendy.dev">GitHub</a>
				</li>
				<li>
					<a class="text-gray-400 hover:text-gray-300" href="/archive">Archive</a>
				</li>
			</ul>
		</header>

		<article class="p-4">
			<slot />
		</article>
	</div>
</main>
