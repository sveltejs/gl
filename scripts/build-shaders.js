const fs = require('fs');
const glob = require('tiny-glob/sync');

glob('**/*.glsl').forEach(file => {
	const src = fs.readFileSync(file, 'utf-8');
	const js = `export default ${JSON.stringify(src)};`;
	fs.writeFileSync(file + '.mjs', js);
});