// Create a transparent end-to-end fixture: forty real pickups and five deposits.
import {Game,distance} from '../src/game.mjs';import {writeFileSync} from 'node:fs';
const layout=new Game(42,{random_motes:false,random_shades:false});
const scenario={random_motes:false,random_shades:false,motes:layout.lanterns.flatMap(l=>Array.from({length:8},()=>[...l.pos]))};
const g=new Game(42,scenario),frames=[];
for(const l of g.lanterns){const d=distance(g.player.pos,l.pos),move=[(l.pos[0]-g.player.pos[0])/d,(l.pos[2]-g.player.pos[2])/d];const start={tick:g.tick,move,interact:false};frames.push(start);g.step(start);while(distance(g.player.pos,l.pos)>.1)g.step();const deposit={tick:g.tick,move:[0,0],interact:true};frames.push(deposit);g.step(deposit);}
if(g.state!=='won'||g.score<900)throw Error('Route did not light all five lamps');
writeFileSync('tests/scenarios/full-route.json',JSON.stringify(scenario,null,2)+'\n');writeFileSync('tests/scenarios/full-route.inputs.json',JSON.stringify({frames},null,2)+'\n');console.log(`Full route wins in ${g.tick} ticks: ${g.score} points`);
