import {mkdirSync,writeFileSync} from 'node:fs';
import {Game,distance} from '../src/game.mjs';
const folder='tests/scenarios/phase-2';mkdirSync(folder,{recursive:true});
const quiet={random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false};
const cases=[];
function add(name,night,ticks,scenario,frames=[],expect={}){writeFileSync(`${folder}/${name}.json`,JSON.stringify({...quiet,...scenario},null,2)+'\n');writeFileSync(`${folder}/${name}.inputs.json`,JSON.stringify({frames},null,2)+'\n');cases.push({name,night,ticks,expect});}
add('movement-regression',1,60,{motes:[[0,0,1]]},[{tick:0,move:[0,1]}],{pos:[0,0,6],carried:1});
add('dash-air',1,12,{player:{pos:[0,2,0]}},[{tick:0,dash:true,move:[1,0]}],{pos:[2.8,2,0],events:['dash']});
add('pulse-3d',1,20,{player:{carried:6},shades:[{id:'Near',pos:[5,.8,0]},{id:'Above',pos:[0,6,0]}]},[{tick:0,pulse:true}],{events:['pulse'],carried:3,score:5});
add('hit-drops',1,1,{player:{carried:9},shades:[{pos:[0,.8,0]}]},[],{events:['player_hit'],carried:5,flames:2,motes:4});
add('fall-respawn',1,61,{player:{pos:[45,-11,0],carried:7,invuln_ticks:999}},[],{events:['player_hit'],flames:2,pos:[0,0,0],carried:0});
add('pause',1,120,{player:{dash_cd_ticks:70,charm_ticks:300}},[{tick:0,pause:true},{tick:1,pause:false},{tick:60,pause:true},{tick:61,pause:false}],{events:['paused','resumed'],sim_tick:60});
add('charm',2,15,{player:{pos:[35,0,0]}},[{tick:1,move:[1,0]},{tick:2,dash:true},{tick:3,dash:false},{tick:14,dash:true}],{events:['charm_picked','dash']});
add('drifter-steal',2,2,{player:{carried:8,invuln_ticks:90},drifters:[{id:'D1',pos:[0,.8,0]}]},[],{events:['drifter_steal'],carried:5,flames:3});
add('drifter-drop',2,120,{player:{carried:3},drifters:[{id:'D1',pos:[3,.8,0],state:'flee',stolen:3}]},[{tick:0,pulse:true}],{events:['drifter_drop','pulse'],motes:3});
add('pad-night2',2,100,{player:{pos:[20,0,18]}},[],{grounded:true});
add('bridge',2,100,{player:{pos:[26,0,0]},charms:[]},[{tick:0,move:[1,0]}],{pos:[36,0,0],flames:3});
add('pad-night3',3,56,{player:{pos:[0,3,13]}},[],{grounded:true,y:6});
add('ramp-night3',3,60,{player:{pos:[30*Math.cos(Math.PI/6),0,15]}},[{tick:0,move:[-Math.cos(Math.PI/6),-.5]}],{y:3});
add('wind-night3',3,2100,{wind_enabled:true},[],{});
add('spawn-night2',2,2400,{random_drifters:true,random_shades:true,lanterns:[{id:'L1',pos:[0,0,0],lit:true}]},[],{events:['shade_spawned']});
add('mote-spawn',1,480,{random_motes:true,motes:[]},[],{motes:2});
for(const night of [1,2,3]){
  const lamps=Array.from({length:night+4},(_,i)=>({id:`L${i+1}`,lit:i<night+3,...(i===night+3?{pos:[0,0,0]}:{})}));
  add(`win-night${night}`,night,60,{player:{carried:10},lanterns:lamps},[{tick:0,interact:true}],{state:'won',events:['deposit','lantern_lit','game_over']});
  add(`duration-night${night}`,night,21600,{random_shades:true,random_drifters:true,wind_enabled:false,lanterns:[{id:'L1',pos:[0,0,0],lit:true}]},[],{state:'lost',sim_tick:[18000,19800,21600][night-1]});
}
const layout=new Game(42,quiet),scenario={...quiet,motes:layout.lanterns.flatMap(l=>Array.from({length:10},()=>[...l.pos]))};
const g=new Game(42,scenario),frames=[];
for(const lamp of g.lanterns){const d=distance(g.player.pos,lamp.pos),move=[(lamp.pos[0]-g.player.pos[0])/d,(lamp.pos[2]-g.player.pos[2])/d];const start={tick:g.tick,move,interact:false};frames.push(start);g.step(start);while(distance(g.player.pos,lamp.pos)>.1&&g.tick<5000)g.step();const deposit={tick:g.tick,move:[0,0],interact:true};frames.push(deposit);g.step(deposit);}
if(g.state!=='won')throw Error('Full route did not win');
add('full-route',1,5000,scenario,frames,{state:'won',picked:50,lit:5});
writeFileSync(`${folder}/manifest.json`,JSON.stringify(cases,null,2)+'\n');console.log(`Generated ${cases.length} reproducible Contract v1.1 scenarios`);
