import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
const target = 'docs/employee-pilot';
await mkdir(target, {recursive:true});
for (const name of ['runtime', 'setup']) await build({entryPoints:[`src/${name}.js`],outfile:`${target}/${name}.js`,bundle:true,format:'iife',target:'es2020',minify:false,legalComments:'eof'});
