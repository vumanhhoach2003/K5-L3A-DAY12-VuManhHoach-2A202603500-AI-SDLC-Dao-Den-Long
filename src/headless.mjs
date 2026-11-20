import {readFileSync,writeFileSync} from 'node:fs';
import {Game} from './game.mjs';
import {validateScenario,validateInputs} from './validation.mjs';
try {
  const args={};
  for(let i=2;i<process.argv.length;i+=2){const key=process.argv[i];if(!['--seed','--night','--scenario','--inputs','--ticks','--out','--snapshot-every'].includes(key)||process.argv[i+1]===undefined)throw Error('invalid arguments');args[key.slice(2)]=process.argv[i+1];}
  for(const k of ['seed','night','ticks'])if(!(k in args)||!Number.isSafeInteger(Number(args[k])))throw Error(`invalid --${k}`);
  if(![1,2,3].includes(Number(args.night))||Number(args.ticks)<0||!args.out)throw Error('night must be 1, 2 or 3; ticks >= 0; --out required');
  const interval=Number(args['snapshot-every']??10);if(!Number.isSafeInteger(interval)||interval<1)throw Error('invalid snapshot interval');
  let scenario={},inputs={frames:[]};
  try{if(args.scenario)scenario=JSON.parse(readFileSync(args.scenario,'utf8'));if(args.inputs)inputs=JSON.parse(readFileSync(args.inputs,'utf8'));validateScenario(scenario,Number(args.night));validateInputs(inputs);}catch(e){console.error(e.message);process.exit(2);}
  const game=new Game(Number(args.seed),scenario,Number(args.night));
  const lines=[JSON.stringify(game.snapshot()),JSON.stringify({type:'event',tick:0,name:'night_start',data:{night:game.night}})];let index=0;
  for(let i=0;i<Number(args.ticks)&&!['won','lost'].includes(game.state);i++){
    const frame=inputs.frames[index]?.tick===i?inputs.frames[index++]:{};
    for(const event of game.step(frame))lines.push(JSON.stringify(event));
    if(game.tick%interval===0)lines.push(JSON.stringify(game.snapshot()));
  }
  lines.push(JSON.stringify({type:'end',ticks:game.tick,state:game.state,score:game.score}));
  writeFileSync(args.out,lines.join('\n')+'\n');
}catch(e){console.error(e.message);process.exitCode=1;}
