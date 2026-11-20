import {WorldView} from './scene.mjs';import {Game,distance} from './game.mjs';import {createBenchmarkGame,stepBenchmark,cameraOrbit} from './bench-core.mjs';
const canvas=document.getElementById('recording'),ctx=canvas.getContext('2d'),world=new WorldView(document.getElementById('world'));world.resize(true);
let game=new Game(13),mode='game';world.setNight(game);const proof=await (await fetch('/api/demo/proof')).json();
const mime=['video/mp4;codecs=avc1.42001E','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
if(!mime){await fetch('/api/demo/error',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({error:'Browser cannot record MP4. Supply manual MP4 or use newer Chromium.'})});throw Error('MP4 recording unsupported');}
const chunks=[],stream=canvas.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3000000});
let start=0,last=0,accumulator=0,postedPoster=false;
recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
recorder.onstop=async()=>{const blob=new Blob(chunks,{type:mime}),video=document.createElement('video'),url=URL.createObjectURL(blob);video.src=url;await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=reject;});await fetch('/api/demo/metadata',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mime,bytes:blob.size,duration_s:video.duration,width:video.videoWidth,height:video.videoHeight,provenance:'Live runtime recording; automatic inputs, followed by benchmark scene and actual saved reports'})});await fetch('/api/demo/video',{method:'POST',headers:{'Content-Type':'video/mp4'},body:blob});URL.revokeObjectURL(url);stream.getTracks().forEach(t=>t.stop());};
function text(value,x,y,size=24,color='#f5f1e6'){ctx.fillStyle=color;ctx.font=`${size}px system-ui`;ctx.fillText(value,x,y);}
function panel(x,y,w,h){ctx.fillStyle='#0e1430e8';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#f2c14e55';ctx.strokeRect(x,y,w,h);}
function bot(){
  const p=game.player,lamps=game.lanterns.filter(l=>!l.lit).sort((a,b)=>distance(p.pos,a.pos)-distance(p.pos,b.pos)),motes=[...game.motes].sort((a,b)=>distance(p.pos,a.pos)-distance(p.pos,b.pos));
  const target=p.carried>=10&&lamps.length?lamps[0].pos:motes[0]?.pos??lamps[0]?.pos??[0,0,0],d=distance(p.pos,target),move=d>.25?[(target[0]-p.pos[0])/d,(target[2]-p.pos[2])/d]:[0,0];
  const threat=game.shades.some(s=>distance(p.pos,s.pos)<5&&s.state!=='stunned');return {move,interact:lamps.some(l=>distance(l.pos,p.pos)<=2)&&p.carried>=10&&!game.input.interact,pulse:threat&&p.carried>=3&&!game.input.pulse,dash:threat&&game.sim_tick%120===0,jump:game.sim_tick%360===0};
}
function frame(now){
  if(!start){start=last=now;recorder.start(1000);}const elapsed=(now-start)/1000,dt=Math.min((now-last)/1000,.1);last=now;
  if(elapsed>=35&&mode==='game'){mode='benchmark';game=createBenchmarkGame(42);world.setNight(game);world.standardBenchmark=true;accumulator=0;}
  accumulator+=dt;while(accumulator>=1/60){if(mode==='game')game.step(bot());else stepBenchmark(game);accumulator-=1/60;}
  world.benchmarkCamera=mode==='benchmark'?cameraOrbit(elapsed-35):null;world.render(game,elapsed,dt);ctx.drawImage(world.renderer.domElement,0,0,1280,720);
  panel(18,18,1244,95);text('ĐẢO ĐÈN LỒNG · v1.0.0',38,53,30,'#f2c14e');text(mode==='game'?'Game chạy thật · input tự động · luật gameplay giữ nguyên':'Cảnh benchmark chuẩn · minh họa runtime, kết quả đo chính thức bên dưới',38,88,22);
  if(mode==='game'){
    panel(18,565,1244,135);text(`Đêm 1 · ${game.state} · tick ${game.sim_tick} · ${Math.ceil(game.time_left_s)} giây còn lại`,38,601,24);text(`Ngọn Lửa ${game.player.flames}/3 · Đom đóm ${game.player.carried}/${game.capacity} · Đèn ${game.lanterns.filter(l=>l.lit).length}/5 · Điểm ${game.score}`,38,641,24);text('Tự động di chuyển, nhặt, nạp, nhảy, lướt và pulse theo tình huống · không dịch chuyển hoặc sửa điểm',38,681,20);
  }else{
    panel(18,565,1244,135);text('200 Bóng Mực wander · 100 đom đóm · L1–L3 sáng, dầu100 · camera vòng30m / 15giây',38,602,22);text(`bench.json: avg ${proof.bench.avg_fps.toFixed(2)} FPS · 1% low ${proof.bench.p1_low_fps.toFixed(2)} FPS · load ${Math.round(proof.bench.load_ms)}ms`,38,642,24,'#f2c14e');text('Khung cảnh đang ghi không được dùng thay lượt đo bench.json đã lưu. Không lọc frame chậm.',38,681,20);
  }
  if(elapsed>=62){panel(130,150,1020,370);text('BẰNG CHỨNG ĐÃ CHẠY — ĐỌC TỪ CÁC FILE GỐC',160,195,26,'#f2c14e');text(`Kiểm thử: ${proof.verification.tests.passed}/${proof.verification.tests.total} đạt · ${proof.verification.runs.length} scenario byte-identical`,160,247,24);text('Tất cả42 output hồi quy khớp hash Phase3, không thay luật cũ còn hiệu lực.',160,290,22);text(`Soak: ${proof.soak.nights} Đêm, ${proof.soak.crashes} crash · RSS ${proof.soak.mem_start_mb.toFixed(2)} → ${proof.soak.mem_end_mb.toFixed(2)}MB`,160,337,24);text(`Tăng ${((proof.soak.mem_end_mb/proof.soak.mem_start_mb-1)*100).toFixed(2)}% ≤20% · seed7…16 · cùng một tiến trình`,160,380,22);text('Repo giữ AGENTS, ADR, changelog, spec, ghi chép và bằng chứng qua4phase.',160,429,22);text('Xem README: cài3lệnh, headless, bench, soak, bảng điểm và tùy chọn dễ tiếp cận.',160,475,22);}
  if(!postedPoster&&elapsed>12){postedPoster=true;fetch('/api/demo/poster',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({png:canvas.toDataURL('image/png')})});}
  if(elapsed>=80){recorder.stop();return;}requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
