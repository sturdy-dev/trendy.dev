import type { RequestHandler } from '@sveltejs/kit';

import { languages } from '$lib/repos';

export const prerender = true;
export const csr = false;
export const ssr = true;

export const GET: RequestHandler = async () => {
	const url = 'https://trendy.dev';
	const periods = ['day', 'week', 'month'];

	const body = `<?xml version="1.0" encoding="UTF-8" ?>
  <urlset
    xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  >
    <url>
      <loc>${url}</loc>
      <changefreq>always</changefreq>
      <priority>1.0</priority>
    </url>
    ${languages
			.map((l) =>
				periods
					.map(
						(period) => `
    <url>
      <loc>${url}/${period}/${l.slug}</loc>
      <changefreq>daily</changefreq>
      <priority>0.5</priority>
    </url>
    `
					)
					.join('')
			)
			.join('')}
  </urlset>`;

	return new Response(body, {
		headers: {
			'Cache-Control': `max-age=0, s-maxage=${3600}`,
			'Content-Type': 'application/xml'
		}
	});
};
