import {mkdtempSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';import {tmpdir} from 'node:os';import {join,dirname,resolve} from 'node:path';import {spawnSync,spawn,execFileSync} from 'node:child_process';
const reportPath=resolve('docs/proof/phase-4/clean-checkout.json'),folder=mkdtempSync(join(tmpdir(),'lantern-clean-')),checkout=join(folder,'checkout'),archive=join(folder,'source.tar');mkdirSync(checkout);
function command(exe,args,cwd){const r=spawnSync(exe,args,{cwd,encoding:'utf8',timeout:120000});if(r.status!==0)throw Error(`${exe} ${args.join(' ')} failed: ${r.stderr||r.error||r.stdout}`);return r.stdout;}
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceTree=execFileSync('git',['rev-parse','HEAD:src'],{encoding:'utf8'}).trim();command('git',['archive','--format=tar',`--output=${archive}`,'HEAD'],process.cwd());command('tar',['-xf',archive,'-C',checkout],process.cwd());
const npmCandidates=[process.env.npm_execpath,join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),join(dirname(process.execPath),'../lib/node_modules/npm/bin/npm-cli.js'),'/usr/share/nodejs/npm/bin/npm-cli.js'];const npmCli=npmCandidates.find(p=>p&&existsSync(p));
function npm(args){return npmCli?command(process.execPath,[npmCli,...args],checkout):command('npm',args,checkout);}
const start=performance.now(),steps=[];let child;
try{
  npm(['ci','--no-audit','--no-fund']);steps.push('npm ci: passed');npm(['run','build']);steps.push('npm run build: passed');
  child=spawn(process.execPath,['scripts/run.mjs'],{cwd:checkout,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  const url=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('Clean startup timed out')),10000);child.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/http:\/\/127\.0\.0\.1:\d+\//);if(match){clearTimeout(timer);resolve(match[0]);}});child.once('error',reject);child.once('exit',code=>{if(code)reject(Error('Clean startup exited '+code));});});
  const resources=['','src/view.mjs','src/ui4.mjs','src/actors.mjs','src/keybindings.mjs','phase4.css','api/leaderboard'];for(const path of resources){const response=await fetch(url+path);if(response.status!==200)throw Error(`Clean HTTP ${path}: ${response.status}`);}
  steps.push('npm start equivalent entry point: passed, all requested resources HTTP200');npm(['run','verify']);steps.push('npm run verify: passed');
  writeFileSync(reportPath,JSON.stringify({source_commit:sourceCommit,source_tree:sourceTree,clean_directory:checkout,generated_at:new Date().toISOString(),node:process.version,setup_commands:3,steps,duration_s:(performance.now()-start)/1000},null,2)+'\n');console.log('Clean-checkout installation/startup/regression verified.');
}finally{child?.kill();}
