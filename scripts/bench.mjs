import {spawn} from 'node:child_process';import {existsSync,mkdtempSync,writeFileSync,mkdirSync} from 'node:fs';import {tmpdir,platform,release,arch} from 'node:os';import {join,dirname,resolve} from 'node:path';import {createGameServer,readJSON,json} from './http-server.mjs';
const processStart=performance.now();let server,child,timeout,done=false;
function terminateOwnedBrowser(){if(!child?.pid)return;if(process.platform==='win32')spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});else child.kill('SIGTERM');}
function finish(code){if(done)return;done=true;clearTimeout(timeout);server?.close();terminateOwnedBrowser();process.exitCode=code;}
try{
  const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i]?.replace(/^--/,'')]=process.argv[i+1];
  const seed=Number(args.seed??42),duration=Number(args.duration??30);if(!Number.isSafeInteger(seed)||!Number.isFinite(duration)||duration<=0||duration>300||!args.out)throw Error('Usage: --seed int --duration seconds --out file');
  const candidates=[process.env.LANTERN_BROWSER,process.env.LOCALAPPDATA&&join(process.env.LOCALAPPDATA,'BraveSoftware/Brave-Browser/Application/brave.exe'),'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Brave Browser.app/Contents/MacOS/Brave Browser','/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/google-chrome'];
  const browser=candidates.find(p=>p&&existsSync(p));if(!browser)throw Error('Chromium browser not found. Set LANTERN_BROWSER to Chrome/Chromium/Brave/Edge executable.');
  let loadMs=null;
  server=createGameServer({customRoute:async(req,res,path)=>{
    if(path==='/api/bench/first-frame'){loadMs=performance.now()-processStart;json(res,200,{ok:true});return true;}
    if(path==='/api/bench/screenshot'){const {png}=await readJSON(req,8*1024*1024);if(typeof png!=='string'||!png.startsWith('data:image/png;base64,'))throw Error('Invalid screenshot');const imagePath=resolve(dirname(args.out),'benchmark.png');mkdirSync(dirname(imagePath),{recursive:true});writeFileSync(imagePath,Buffer.from(png.slice(png.indexOf(',')+1),'base64'));json(res,200,{ok:true});return true;}
    if(path==='/api/bench/error'){const body=await readJSON(req);console.error(body.error);json(res,200,{ok:false});finish(1);return true;}
    if(path==='/api/bench/result'){
      const report=await readJSON(req);if(!loadMs||!Number.isFinite(report.avg_fps)||report.frames<1||Math.abs(report.measurement_ms-duration*1000)>.1)throw Error('Incomplete or invalid benchmark measurement');
      const output={contract_version:'1.3',avg_fps:report.avg_fps,p1_low_fps:report.p1_low_fps,frame_ms_p95:report.frame_ms_p95,frames:report.frames,load_ms:loadMs,peak_mem_mb:null,vsync_off:false,renderer:report.renderer,os:`${platform()} ${release()} ${arch()}`,measurement_ms:report.measurement_ms,viewport:report.viewport,framebuffer:report.framebuffer,seed,duration_s:duration,warmup_s:3,scene:{shades:200,motes:100,lit_lanterns:['L1','L2','L3']}};
      writeFileSync(args.out,JSON.stringify(output,null,2)+'\n');json(res,200,{ok:true});console.log(JSON.stringify(output));setTimeout(()=>finish(0),300);return true;
    }return false;
  }});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const url=`http://127.0.0.1:${server.address().port}/bench.html?seed=${seed}&duration=${duration}`,profile=mkdtempSync(join(tmpdir(),'lantern-bench-'));
  const windowSize=process.env.LANTERN_BENCH_WINDOW_SIZE??(process.platform==='win32'?'1296,815':'1280,720');
  child=spawn(browser,[`--app=${url}`,`--window-size=${windowSize}`,'--force-device-scale-factor=1',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--disable-background-timer-throttling','--disable-renderer-backgrounding'],{stdio:'ignore',windowsHide:false});
  child.once('error',e=>{console.error(e.message);finish(1);});timeout=setTimeout(()=>{console.error('Benchmark timed out without a renderer report.');finish(1);},(duration+45)*1000);
  console.log(`Opened isolated benchmark window: ${url}`);
}catch(error){console.error(error.message);finish(1);}
