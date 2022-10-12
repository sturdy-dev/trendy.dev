import { createFilter } from '@rollup/pluginutils';

export default function ttf({ include, exclude } = {}) {
	// path filter
	const filter = createFilter(include, exclude);
	const filterExt = /\.(ttf)$/i;

	return {
		name: 'ttf',
		transform(source, id) {
			if (!filter(id)) return null;
			if (!filterExt.test(id)) return null;
			const code = `import fs from 'fs/promises'
console.log("this -->",\`${source}\`)
console.log("that -->",\`${id}\`)
export default await fs.readFile(\`${id}\`)`;
			const map = { mappings: '' };
			return {
				code,
				map
			};
		}
	};
}