import { createFilter } from '@rollup/pluginutils';
import { readFileSync } from 'fs';


export default function ttf({ include, exclude } = {}) {
	// path filter
	const filter = createFilter(include, exclude);
	const filterExt = /\.(ttf)$/i;

	return {
		name: 'ttf',
		transform(source, id) {
			if (!filter(id)) return null;
			if (!filterExt.test(id)) return null;

            const f64 = readFileSync(id).toString('base64');
			const code = `export default Buffer.from("${f64}", "base64")`
			const map = { mappings: '' };
			return {
				code,
				map
			};
		}
	};
}