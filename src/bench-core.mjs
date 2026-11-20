import {Game} from './game.mjs';
export function createBenchmarkGame(seed=42){
  let state=seed>>>0;const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
  const points=count=>Array.from({length:count},(_,i)=>{const a=(i+random())*Math.PI*2/count,r=Math.sqrt((i*.61803398875)%1)*39;return [Math.cos(a)*r,0,Math.sin(a)*r];});
  return new Game(seed,{random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false,motes:points(100),shades:points(200).map((pos,i)=>({id:`S${i+1}`,pos:[pos[0],.8,pos[2]],state:'wander'})),lanterns:[1,2,3].map(i=>({id:`L${i}`,lit:true,fuel:100}))},1);
}
export function stepBenchmark(game){game.tick++;game.sim_tick++;game.updateSanctuaries();game.moveEnemies(true);}
export function cameraOrbit(elapsed){const a=elapsed/15*Math.PI*2;return [Math.cos(a)*30,15,Math.sin(a)*30];}
export function frameStatistics(samples){
  if(!samples.length||samples.some(n=>!Number.isFinite(n)||n<=0))throw Error('Frame samples must be positive');
  const sorted=[...samples].sort((a,b)=>a-b),k=Math.max(1,Math.ceil(samples.length*.01)),slow=sorted.slice(-k);
  return {avg_fps:1000*samples.length/samples.reduce((a,b)=>a+b,0),p1_low_fps:1000/(slow.reduce((a,b)=>a+b,0)/k),frame_ms_p95:sorted[Math.max(0,Math.ceil(sorted.length*.95)-1)],frames:samples.length};
}
