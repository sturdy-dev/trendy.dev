import type { RequestHandler } from '@sveltejs/kit';
import satori from 'satori';
import silkscreen from '$lib/fonts/Silkscreen-Regular.ttf'
import type { ReactNode } from 'react';
// import {Resvg} from '@resvg/resvg-js'

const getSize = (str: string): number => {
    if (str.length < 5) {
        return 240
    }
    if (str.length < 13) {
        return 140
    }
    return 64
}

export const GET: RequestHandler = async ({ url }) => {
    const lang = url.searchParams.get("language") || "Trends"

    const el: ReactNode = {
        type: 'div',
        props: {
            children: [
                {
                    type: "div",
                    props: {
                        children: lang,
                        style: { fontSize: getSize(lang), width: '100%', justifyContent: 'center', alignItems: 'center', flex: "1 1 0%", fontFamily: "Silkscreen", },
                    },
                },
                {
                    type: "div",
                    props: {
                        children: [
                            {
                                type: "img",
                                props: {
                                    src: "https://trendy.dev/laptop-small.png",
                                    height: 64,
                                    style: { "margin-right": "8px", "margin-top": "4px", },
                                },
                            },
                            {
                                type: "div",
                                props: { children: "trendy.dev", },
                            },

                        ],
                        style: { display: "flex", color: "#9CA3AF", fontSize: '32', width: '100%', justifyContent: 'center', alignItems: 'center', },
                    },
                }
            ],
            style: {
                color: '#FFFFFF',
                'background-color': '#111827',
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: "column",
                padding: "64px",
            }
        }
    }

    const svg = await satori(
        el,
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'Silkscreen',
                    data: silkscreen,
                    weight: 400,
                    style: 'normal'
                },
            ],
        }
    );

    // const resvg = new Resvg(svg)
    // const pngData = resvg.render()
    // const pngBuffer = pngData.asPng()

    return new Response(svg, {
        headers: {
            'content-type': 'image/svg+xml'
        }
    });
};
