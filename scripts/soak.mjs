import {writeFileSync} from 'node:fs';import {Game} from '../src/game.mjs';
const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i]?.replace(/^--/,'')]=process.argv[i+1];
try{
  const seed=Number(args.seed??7),nights=Number(args.nights??10);if(!Number.isSafeInteger(seed)||!Number.isInteger(nights)||nights<1||nights>1000||!args.out)throw Error('Usage: --seed int --nights positive-int --out file');
  const start=performance.now(),results=[],seeds=[],ticks=[],errors=[];let crashes=0;
  let game=new Game(seed);global.gc?.();const memStart=process.memoryUsage().rss/1048576;
  for(let i=0;i<nights;i++){
    const night=i%3+1,nightSeed=seed+i;seeds.push(nightSeed);if(i>0)game=new Game(nightSeed,{},night);
    let randomState=(nightSeed^0x9e3779b9)>>>0;const random=()=>{randomState=(Math.imul(1664525,randomState)+1013904223)>>>0;return randomState/4294967296;};let move=[0,0];
    try{while(game.state==='playing'&&game.sim_tick<game.map.duration*60){if(game.sim_tick%30===0){const a=random()*Math.PI*2;move=[Math.cos(a),Math.sin(a)];}game.step({move,jump:random()<.05,dash:random()<.03,pulse:random()<.02,interact:random()<.1});}results.push(game.state);ticks.push(game.sim_tick);}catch(error){crashes++;results.push('crashed');ticks.push(game.sim_tick);errors.push({index:i,message:error.message});}
    // Release each night's entities; the next iteration constructs a fresh Game.
    game=null;global.gc?.();
  }
  game=new Game(seed+nights,{},nights%3+1);global.gc?.();const memEnd=process.memoryUsage().rss/1048576;
  const report={nights,crashes,results,mem_start_mb:memStart,mem_end_mb:memEnd,duration_s:(performance.now()-start)/1000,seeds,sim_ticks:ticks,gc_available:typeof global.gc==='function',runtime_flags:process.execArgv,reset_definition:'previous Game released, next fresh Game loaded; garbage collection requested after reset',errors};
  writeFileSync(args.out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({nights,crashes,memory_ratio:memEnd/memStart,duration_s:report.duration_s}));
  if(crashes>0||memEnd>memStart*1.2)process.exitCode=1;
}catch(error){console.error(error.message);process.exitCode=1;}
