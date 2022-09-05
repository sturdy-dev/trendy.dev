<script lang="ts">
    import '../app.css';
    import {page} from '$app/stores';
</script>

<main>
    <div class="flex justify-around bg-gray-900 w-full min-h-screen">
        <div class="max-w-7xl flex-1 text-white">
            <header class="p-2 md:px-8 font-mono flex items-center gap-4 flex-col md:flex-row md:justify-between">

                <a href="/" class="inline-flex items-center gap-4">
                    <img src="/laptop-small.png" class="h-8 w-8 md:h-16 md:w-16"/>
                    <span class="md:text-2xl">trendy.dev</span>
                </a>


                <div class="inline-flex items-center gap-4 flex-col">
                    <div class="inline-flex items-center gap-4">
                        Actions:
                        <a href="/actions" class:text-red-800={$page.url.pathname === "/actions"}>Top</a>
                        <a href="/actions/monthly" class:text-red-800={$page.url.pathname === "/actions/monthly"}>Trending</a>
                    </div>
                    <!---
                    <div class="inline-flex items-center gap-4">
                        Lang:
                        <a href="/go" class:text-red-800={$page.url.pathname === "/go"}>Go</a>
                        <a href="/typescript" class:text-red-800={$page.url.pathname === "/typescript"}>TypeScript</a>
                    </div>
                    --->
                </div>
            </header>

            <slot/>
        </div>
    </div>
</main>