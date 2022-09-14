import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

console.warn(`using node ${process.version}`);

const config: UserConfig = {
	plugins: [sveltekit()]
};

export default config;
