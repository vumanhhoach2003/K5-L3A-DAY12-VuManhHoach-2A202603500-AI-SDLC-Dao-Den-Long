import {mkdirSync,copyFileSync,cpSync} from 'node:fs';
mkdirSync('dist/vendor',{recursive:true});mkdirSync('dist/src',{recursive:true});
for(const file of ['index.html','style.css'])copyFileSync(file,`dist/${file}`);
for(const file of ['game.mjs','view.mjs'])copyFileSync(`src/${file}`,`dist/src/${file}`);
copyFileSync('node_modules/three/build/three.module.js','dist/vendor/three.module.js');
copyFileSync('node_modules/three/build/three.core.js','dist/vendor/three.core.js');
copyFileSync('node_modules/three/LICENSE','dist/vendor/THREE-LICENSE.txt');
console.log('Built self-contained web game in dist/');
