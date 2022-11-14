import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

import pluginTtf from './plugins/rollup-plugin-ttf.js';

console.warn(`using node ${process.version}`);

const config: UserConfig = {
	plugins: [sveltekit(), pluginTtf()]
};

export default config;
