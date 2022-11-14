import fs from 'fs';
import { readFileSync } from 'fs';
import slugify from 'slugify';
import { createCanvas, loadImage, type CanvasRenderingContext2D, registerFont } from 'canvas';

// Configuration
const canvas = {
	height: 630,
	width: 1200
};

const title = {
	maxWidth: 1000,
	lineHeight: 100
};

const paths = {
	images: './static/og/',
	fonts: './fonts',
	database: './database.txt',
	logo: './static/laptop-small.png'
};

const customFonts = [
	{
		file: 'Roboto-Mono.ttf',
		name: 'Roboto Mono'
	}
];

const fonts = {
	postTitle: 'regular 120px Roboto Mono',
	site: 'bold 30pt Roboto Mono'
};

const colors = {
	background: '#111827',
	postTitle: '#FFFFFF',
	site: '#9CA3AF'
};

const siteName = 'trendy.dev';

customFonts.forEach((font) => {
	registerFont(`${paths.fonts}/${font.file}`, { family: font.name });
});

const languages = (): string[] => {
	const repos = JSON.parse(readFileSync('./src/lib/repos/db.json').toString());
	return Object.keys(repos);
};

const generateImage = async (language: string) => {
	console.info(`Generating image for ${language}`);

	const imageCanvas = createCanvas(canvas.width, canvas.height);
	const context = imageCanvas.getContext('2d');

	const textWidth = 400;

	// Define the canvas background
	context.fillStyle = colors.background;
	context.fillRect(0, 0, canvas.width, canvas.height);

	// Define the post title text
	context.font = fonts.postTitle;
	context.textAlign = 'center';
	context.textBaseline = 'top';

	// Define the area of the text
	context.fillRect(600 - textWidth / 2 - 10, 170 - 5, textWidth + 20, 120);

	// Color the text
	context.fillStyle = colors.postTitle;

	// Fills the text with appropriate word wrapping
	wrapText(context, `${language}`, 600, 80, title.maxWidth, title.lineHeight);

	const logo = await loadImage(paths.logo);
	// TODO: Add logo or something
	context.drawImage(logo, 12, canvas.height - 12 - logo.height);

	// Define the site name text
	context.fillStyle = colors.site;
	context.font = fonts.site;
	context.fillText(siteName, 580, 520);

	// Create the final image
	fs.writeFileSync(`${paths.images}/${slugify(language)}.png`, imageCanvas.toBuffer('image/png'));
};

const wrapText = (
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxTextWidth: number,
	lineHeight: number
) => {
	const words = text.split(' ');
	let line = '';

	for (let n = 0; n < words.length; n += 1) {
		const testLine = `${line + words[n]} `;
		const metrics = ctx.measureText(testLine);
		const testWidth = metrics.width;
		if (testWidth > maxTextWidth && n > 0) {
			ctx.fillText(line, x, y);
			line = `${words[n]} `;
			// eslint-disable-next-line no-param-reassign
			y += lineHeight * 1.2;
		} else {
			line = testLine;
		}
	}
	ctx.fillText(line, x, y);
};

(async () => {
	languages().forEach(async (l) => {
		await generateImage(l);
	});
})();
