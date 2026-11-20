import {WorldView} from './scene.mjs';import {createBenchmarkGame,stepBenchmark,cameraOrbit,frameStatistics} from './bench-core.mjs';
const query=new URLSearchParams(location.search),seed=Number(query.get('seed')??42),duration=Number(query.get('duration')??30),game=createBenchmarkGame(seed),view=new WorldView(document.getElementById('world'));
view.setNight(game);view.resize(true);view.standardBenchmark=true;
let first=0,last=0,accumulator=0,measurementStart=0,measuring=false,finished=false,samples=[];
const status=document.getElementById('status');
addEventListener('error',event=>fetch('/api/bench/error',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({error:event.message})}));
function frame(now){
  if(finished)return;
  if(!first)first=last=now;const dt=now-last;last=now;const elapsed=(now-first)/1000;
  accumulator+=dt/1000;while(accumulator>=1/60){stepBenchmark(game);accumulator-=1/60;}
  view.benchmarkCamera=cameraOrbit(elapsed);view.render(game,elapsed,Math.min(dt/1000,.1));
  if(elapsed===0){fetch('/api/bench/first-frame',{method:'POST'});try{fetch('/api/bench/screenshot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({png:view.renderer.domElement.toDataURL('image/png')})});}catch{}}
  if(!measuring&&elapsed>=3){measuring=true;measurementStart=now;}
  else if(measuring){
    const previous=now-dt,limit=measurementStart+duration*1000,clipped=Math.min(now,limit)-Math.max(previous,measurementStart);if(clipped>0)samples.push(clipped);
    if(now>=limit){finished=true;const statistics=frameStatistics(samples);status.textContent=`Xong: ${statistics.avg_fps.toFixed(1)} FPS · p1 ${statistics.p1_low_fps.toFixed(1)}`;
      fetch('/api/bench/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...statistics,peak_mem_mb:null,vsync_off:false,renderer:'Three.js 0.181.2 / WebGL2 / requestAnimationFrame',measurement_ms:samples.reduce((a,b)=>a+b,0),viewport:[innerWidth,innerHeight],framebuffer:[view.renderer.domElement.width,view.renderer.domElement.height],seed})}).catch(error=>status.textContent=error.message);return;
    }
  }
  status.textContent=measuring?`Đang đo ${Math.min(duration,(now-measurementStart)/1000).toFixed(1)} / ${duration} giây`:`Khởi động ${elapsed.toFixed(1)} / 3 giây`;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
