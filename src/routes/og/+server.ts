import type { RequestHandler } from '@sveltejs/kit';
import satori from 'satori';
import font from '$lib/fonts/Silkscreen-Regular.ttf'

export const GET: RequestHandler = async () => {
	const svg = await satori(
		{
			type: 'div',
			props: {
				children: 'Trendy Trends\n\n' + new Date().toISOString(),
				style: {
					color: '#FFFFFF',
					'background-color': '#111827',
					height: '100%',
					width: '100%',
					display: 'flex',
					textAlign: 'center',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: '100'
				}
			}
		},
		{
			width: 1200,
			height: 600,
			fonts: [
				{
					name: 'Silkscreen',
					data: font,
					weight: 400,
					style: 'normal'
				}
			]
		}
	);

	console.log(svg);

	return new Response(svg, {
		headers: {
			'content-type': 'image/svg+xml'
		}
	});
};
