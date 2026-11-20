import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {Game,distance} from '../src/game.mjs';
const folder='tests/scenarios/phase-3';mkdirSync(folder,{recursive:true});
const quiet={random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false},cases=[];
function add(name,night,ticks,scenario,frames=[],expect={}){writeFileSync(`${folder}/${name}.json`,JSON.stringify({...quiet,...scenario},null,2)+'\n');writeFileSync(`${folder}/${name}.inputs.json`,JSON.stringify({frames},null,2)+'\n');cases.push({name,night,ticks,expect});}
const previous=JSON.parse(readFileSync('tests/scenarios/phase-2/manifest.json'));
for(const item of previous.filter(c=>!c.name.startsWith('win-')&&!c.name.startsWith('duration-')&&c.name!=='full-route')){
  const scenario=JSON.parse(readFileSync(`tests/scenarios/phase-2/${item.name}.json`)),inputs=JSON.parse(readFileSync(`tests/scenarios/phase-2/${item.name}.inputs.json`));
  add(item.name,item.night,item.ticks,scenario,inputs.frames,item.expect);
}
const lit=(count,fuel=100)=>Array.from({length:count},(_,i)=>({id:`L${i+1}`,lit:true,fuel}));
add('fuel-expiry',1,6000,{lanterns:lit(1)},[],{events:['lantern_out'],fuel:0,live_lamps:0,ever_lit:true});
add('no-early-win',1,60,{lanterns:lit(5)},[],{state:'playing',live_lamps:5,fuel:99});
add('refuel-ceil',1,1,{player:{carried:10},lanterns:[{id:'L1',lit:true,fuel:85,pos:[0,0,0]}]},[{tick:0,interact:true}],{events:['refuel'],fuel:100,carried:8,score:10});
add('relight-at-expiry',1,1,{player:{carried:5},lanterns:[{id:'L1',lit:true,fuel:1/60,pos:[0,0,0]}]},[{tick:0,interact:true}],{events:['lantern_out','deposit','lantern_lit'],fuel:100,capacity:12,relit_count:1,score:65});
add('capacity-growth',1,1,{player:{carried:10},motes:Array.from({length:10},()=>[0,0,0]),lanterns:[{id:'L1',pos:[0,0,0]}]},[{tick:0,interact:true}],{events:['lantern_lit'],capacity:12,score:150});
add('capacity-cap',1,1,{player:{successful_lights:6,carried:10},motes:Array.from({length:20},()=>[0,0,0])},[],{capacity:20,carried:20});
const draining={lanterns:[{id:'L1',pos:[20,0,0],lit:true,fuel:20}],shades:[{id:'S1',pos:[20,.8,0],state:'drain',target_lantern_id:'L1'},{id:'S2',pos:[21,.8,0],state:'drain',target_lantern_id:'L1'}]};
add('drain-stack',1,60,draining,[],{fuel:9,events:['fuel_drain']});
add('drain-pause',1,120,draining,[{tick:0,pause:true}],{state:'paused',sim_tick:0,fuel:20});
add('wander-to-drain',1,60,{lanterns:[{id:'L1',pos:[20,0,0],lit:true,fuel:20}],shades:[{pos:[18,.8,0]}]},[],{events:['fuel_drain'],shade_state:'drain',fuel:14.1});
add('restore-safety',1,1,{player:{pos:[20,0,0],carried:3},...draining},[{tick:0,interact:true}],{events:['refuel'],flames:3,fuel:49.8});
add('pulse-drain',1,1,{player:{pos:[16,0,0],carried:3},...draining},[{tick:0,pulse:true}],{events:['pulse'],shade_state:'stunned',score:30});
add('boundary-thirty',1,1,{lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:30+1/60}],shades:[{pos:[0,.8,0]}]},[],{flames:3,fuel:30});
for(const night of [1,2,3]){
  const required=[3,4,5][night-1];
  add(`dawn-win-night${night}`,night,60,{time_left_s:1,lanterns:lit(required)},[],{state:'won',reason:'dawn_survived',score:required*(50+99)+150});
  add(`dawn-loss-night${night}`,night,60,{time_left_s:1,lanterns:lit(required-1)},[],{state:'lost',reason:'dawn',score:0});
  add(`duration-night${night}`,night,18000,{player:{invuln_ticks:20000},random_motes:true,random_shades:true,random_drifters:true},[],{state:'lost',sim_tick:[14400,16200,18000][night-1]});
}
add('final-tick-out',1,1,{time_left_s:1/60,lanterns:[...lit(2),{id:'L3',pos:[0,0,0],lit:true,fuel:1/60}]},[],{state:'lost',reason:'dawn',events:['lantern_out']});
add('final-tick-relight',1,1,{time_left_s:1/60,player:{carried:5},lanterns:[...lit(2),{id:'L3',pos:[0,0,0],lit:true,fuel:1/60}]},[{tick:0,interact:true}],{state:'won',reason:'dawn_survived',events:['lantern_out','lantern_lit'],lamp_id:'L3',relit_count:1,capacity:12});
add('death-priority',1,1,{time_left_s:1/60,player:{flames:1,pos:[45,-11,0]},lanterns:lit(5)},[],{state:'lost',reason:'no_flames'});
const route=JSON.parse(readFileSync('tests/scenarios/phase-2/full-route.json')),routeInputs=JSON.parse(readFileSync('tests/scenarios/phase-2/full-route.inputs.json'));
add('full-route-no-early-win',1,1427,route,routeInputs.frames,{state:'playing',picked:50,lit:5,capacity:20,score:750});
// End-to-end maintenance fixture: three initially lit lamps, ordinary movement,
// pickup and interaction only. Motes are deliberately stocked to isolate upkeep.
const positions=[[0,0,10],[12,0,0],[-12,0,0]],scenario={...quiet,player:{carried:10},lanterns:positions.map((pos,i)=>({id:`L${i+1}`,pos,lit:true})),motes:positions.flatMap(pos=>Array.from({length:20},()=>pos))};
const g=new Game(42,scenario),frames=[];let previousInput='';
while(g.state==='playing'){
  const target=g.lanterns.filter(l=>l.lit).sort((a,b)=>a.fuel_units-b.fuel_units||a.id.localeCompare(b.id))[0];if(!target)throw Error('Maintenance bot lost its lamps');
  let goal=target.pos;if(g.player.carried<3&&g.motes.length)goal=[...g.motes].sort((a,b)=>distance(a.pos,g.player.pos)-distance(b.pos,g.player.pos))[0].pos;
  const d=distance(g.player.pos,goal),move=d>.3?[(goal[0]-g.player.pos[0])/d,(goal[2]-g.player.pos[2])/d].map(n=>Math.round(n*1e6)/1e6):[0,0];
  const interact=distance(g.player.pos,target.pos)<1.7&&target.fuel<70&&g.player.carried>0&&!g.input.interact;
  const patch={move,interact},encoded=JSON.stringify(patch);if(encoded!==previousInput){frames.push({tick:g.tick,...patch});previousInput=encoded;}g.step(patch);
}
if(g.state!=='won')throw Error('Maintenance fixture did not survive dawn');
add('maintain-to-dawn',1,14400,scenario,frames,{state:'won',reason:'dawn_survived',live_lamps:3,events:['refuel'],capacity:10});
writeFileSync(`${folder}/manifest.json`,JSON.stringify(cases,null,2)+'\n');console.log(`Generated ${cases.length} Contract v1.2 scenarios; maintenance won with ${g.score} points`);
