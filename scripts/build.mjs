import {mkdirSync,copyFileSync,cpSync} from 'node:fs';
mkdirSync('dist/vendor',{recursive:true});mkdirSync('dist/src',{recursive:true});
for(const file of ['index.html','bench.html','demo.html','style.css','phase3.css','phase4.css'])copyFileSync(file,`dist/${file}`);
for(const file of ['game.mjs','view.mjs','controls.mjs','maps.mjs','tuning.mjs','campaign.mjs','audio.mjs','scene.mjs','palette.mjs','lanterns.mjs','accessibility.mjs','actors.mjs','bench-core.mjs','bench-view.mjs','keybindings.mjs','leaderboard.mjs','ui4.mjs','demo-view.mjs'])copyFileSync(`src/${file}`,`dist/src/${file}`);
copyFileSync('node_modules/three/build/three.module.js','dist/vendor/three.module.js');
copyFileSync('node_modules/three/build/three.core.js','dist/vendor/three.core.js');
copyFileSync('node_modules/three/LICENSE','dist/vendor/THREE-LICENSE.txt');
console.log('Built self-contained web game in dist/');
