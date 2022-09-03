<script lang="ts">
    import '../app.css';
    import { page } from '$app/stores';
</script>

<main>
    <div class="flex justify-around bg-gray-900 w-full min-h-screen">
        <div class="max-w-7xl flex-1 text-white">
            <header class="p-2 font-mono flex items-center gap-4">
                <img src="/laptop-small.png" class="h-16 w-16"/>
                <span class="text-2xl">trendy.dev</span>

                <div class="flex-1"></div>

                <a href="/" class:text-red-800={$page.url.pathname === "/"}>Top Starred</a>
                <a href="/actions/monthly" class:text-red-800={$page.url.pathname === "/actions/monthly"}>Trending</a>
            </header>
            <slot/>
        </div>
    </div>
</main>