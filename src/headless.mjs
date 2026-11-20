import {readFileSync,writeFileSync} from 'node:fs';
import {Game} from './game.mjs';
const fail=message=>{throw new Error(message);};
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const nonnegative=v=>finite(v)&&v>=0;
const pos=v=>Array.isArray(v)&&v.length===3&&v.every(finite);
function validateScenario(s){
 if(!object(s))fail('scenario must be an object');
 for(const key of ['random_motes','random_shades'])if(key in s&&typeof s[key]!=='boolean')fail(`invalid ${key}`);
 if('time_left_s' in s&&!nonnegative(s.time_left_s))fail('invalid time_left_s');
 if('player' in s){if(!object(s.player))fail('invalid player');const p=s.player;if('pos'in p&&!pos(p.pos))fail('invalid player.pos');for(const k of ['carried','flames'])if(k in p&&(!Number.isInteger(p[k])||p[k]<0))fail(`invalid ${k}`);}
 if('motes'in s&&(!Array.isArray(s.motes)||!s.motes.every(pos)))fail('invalid motes');
 if('shades'in s){if(!Array.isArray(s.shades)||!s.shades.every(v=>object(v)&&pos(v.pos)&&(!('id'in v)||typeof v.id==='string')))fail('invalid shades');const ids=s.shades.map((v,i)=>v.id??`S${i+1}`);if(new Set(ids).size!==ids.length)fail('duplicate shade id');}
 if('lanterns'in s){if(!Array.isArray(s.lanterns)||!s.lanterns.every(v=>object(v)&&/^L[1-5]$/.test(v.id)&&(!('pos'in v)||pos(v.pos))&&(!('deposited'in v)||Number.isInteger(v.deposited)&&v.deposited>=0&&v.deposited<=8)&&(!('lit'in v)||typeof v.lit==='boolean')))fail('invalid lanterns');if(new Set(s.lanterns.map(l=>l.id)).size!==s.lanterns.length)fail('duplicate lantern id');}
}
function validateInputs(i){if(!object(i)||!Array.isArray(i.frames))fail('inputs.frames must be an array');let previous=-1;for(const f of i.frames){if(!object(f)||!Number.isInteger(f.tick)||f.tick<=previous)fail('frame ticks must strictly increase');previous=f.tick;if('move'in f&&(!Array.isArray(f.move)||f.move.length!==2||!f.move.every(n=>finite(n)&&Math.abs(n)<=1)))fail('invalid move');if('cam_yaw_deg'in f&&!finite(f.cam_yaw_deg))fail('invalid cam_yaw_deg');for(const k of ['jump','interact','pulse','dash'])if(k in f&&typeof f[k]!=='boolean')fail(`invalid ${k}`);}}
try {
 const args={};for(let i=2;i<process.argv.length;i+=2){const key=process.argv[i];if(!['--seed','--night','--scenario','--inputs','--ticks','--out','--snapshot-every'].includes(key)||process.argv[i+1]===undefined)fail('invalid arguments');args[key.slice(2)]=process.argv[i+1];}
 for(const k of ['seed','night','ticks'])if(!(k in args)||!Number.isSafeInteger(Number(args[k])))fail(`invalid --${k}`);
 if(Number(args.night)!==1||Number(args.ticks)<0||!args.out)fail('night must be 1; ticks >= 0; --out required');
 const interval=Number(args['snapshot-every']??10);if(!Number.isSafeInteger(interval)||interval<1)fail('invalid snapshot interval');
 let scenario={},inputs={frames:[]};try{if(args.scenario)scenario=JSON.parse(readFileSync(args.scenario,'utf8'));if(args.inputs)inputs=JSON.parse(readFileSync(args.inputs,'utf8'));validateScenario(scenario);validateInputs(inputs);}catch(e){console.error(e.message);process.exit(2);}
 const game=new Game(Number(args.seed),scenario),lines=[JSON.stringify(game.snapshot())];let index=0;
 for(let i=0;i<Number(args.ticks)&&game.state==='playing';i++){const frame=inputs.frames[index]?.tick===i?inputs.frames[index++]:{};for(const event of game.step(frame))lines.push(JSON.stringify(event));if(game.tick%interval===0)lines.push(JSON.stringify(game.snapshot()));}
 lines.push(JSON.stringify({type:'end',ticks:game.tick,state:game.state,score:game.score}));writeFileSync(args.out,lines.join('\n')+'\n');
}catch(e){console.error(e.message);process.exitCode=1;}
