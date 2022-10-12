import type { RequestHandler } from '@sveltejs/kit';
import satori from 'satori';
import fs from 'fs/promises'

export const GET: RequestHandler = async () => {
    const fontData = await fs.readFile('./fonts/Roboto-Regular.ttf')

	const svg = await satori(
		{
			type: 'div',
			props: {
				children: 'Trendy Trends',
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
					name: 'Roboto',
					data: fontData,
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
