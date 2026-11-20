import {spawnSync} from 'node:child_process';import {mkdirSync,writeFileSync,readFileSync,unlinkSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';import {cpus,platform,arch} from 'node:os';import assert from 'node:assert/strict';
const output='docs/proof/phase-4';mkdirSync(output,{recursive:true});
const tests=spawnSync(process.execPath,['--test'],{encoding:'utf8'});writeFileSync(`${output}/tests.txt`,tests.stdout+tests.stderr);if(tests.status!==0){console.error(tests.stdout,tests.stderr);process.exit(tests.status??1);}
const runs=[],manifest=JSON.parse(readFileSync('tests/scenarios/phase-3/manifest.json')),baseline=JSON.parse(readFileSync('docs/proof/phase-3/verification.json')).runs;
for(const item of manifest){
  const {name,night,ticks,expect}=item;
  const args=['src/headless.mjs','--seed','42','--night',String(night),'--scenario',`tests/scenarios/phase-3/${name}.json`,'--inputs',`tests/scenarios/phase-3/${name}.inputs.json`,'--ticks',String(ticks),'--snapshot-every','60','--out',`${output}/${name}.jsonl`];
  const start=performance.now(),run=spawnSync(process.execPath,args,{encoding:'utf8',timeout:30000});if(run.status!==0)throw Error(`${name}: ${run.stderr||run.error}`);const elapsed=performance.now()-start;
  const first=readFileSync(`${output}/${name}.jsonl`),again=spawnSync(process.execPath,args,{encoding:'utf8',timeout:30000});if(again.status!==0||!first.equals(readFileSync(`${output}/${name}.jsonl`)))throw Error(`Not deterministic: ${name}`);
  const lines=first.toString().trim().split('\n').map(JSON.parse),end=lines.at(-1),snapshot=lines.filter(l=>l.type==='snapshot').at(-1),events=lines.filter(l=>l.type==='event');
  // For short scenarios whose last step is not on a snapshot boundary, replay
  // at interval1 for exact assertions; the saved evidence remains compact.
  const exactArgs=[...args];exactArgs[exactArgs.indexOf('--snapshot-every')+1]='1';exactArgs[exactArgs.indexOf('--out')+1]=`${output}/.exact.tmp`;
  let exact=snapshot;
  if(snapshot.tick!==end.ticks){const exactRun=spawnSync(process.execPath,exactArgs,{encoding:'utf8',timeout:30000});if(exactRun.status!==0)throw Error(exactRun.stderr);exact=readFileSync(`${output}/.exact.tmp`,'utf8').trim().split('\n').map(JSON.parse).filter(l=>l.type==='snapshot').at(-1);}
  if('state'in expect)assert.equal(end.state,expect.state,name);
  if('score'in expect)assert.equal(end.score,expect.score,name);
  for(const k of ['carried','flames','grounded','capacity'])if(k in expect)assert.equal(exact.player[k],expect[k],`${name}.${k}`);
  const lamp=exact.lanterns.find(l=>l.id===(expect.lamp_id??'L1'));
  for(const k of ['fuel','ever_lit','relit_count'])if(k in expect)assert.equal(lamp[k],expect[k],`${name}.${k}`);
  if('live_lamps'in expect)assert.equal(exact.lanterns.filter(l=>l.lit).length,expect.live_lamps,name);
  if('shade_state'in expect)assert.equal(exact.shades[0].state,expect.shade_state,name);
  if('reason'in expect)assert.equal(events.find(e=>e.name==='game_over')?.data.reason,expect.reason,name);
  if('pos'in expect)assert.deepEqual(exact.player.pos,expect.pos,name);
  if('y'in expect)assert.equal(exact.player.pos[1],expect.y,name);
  if('sim_tick'in expect)assert.equal(exact.sim_tick,expect.sim_tick,name);
  if('motes'in expect)assert.equal(exact.motes_active,expect.motes,name);
  if('picked'in expect)assert.equal(events.filter(e=>e.name==='mote_picked').length,expect.picked,name);
  if('lit'in expect)assert.equal(events.filter(e=>e.name==='lantern_lit').length,expect.lit,name);
  for(const e of expect.events??[])assert.ok(events.some(event=>event.name===e),`${name} missing ${e}`);
  assert.ok(elapsed<30000,`${name} exceeds30s`);
  const hash=createHash('sha256').update(first).digest('hex');assert.equal(hash,baseline.find(r=>r.scenario===name)?.sha256,`${name}: Phase3 regression output changed`);
  runs.push({scenario:name,night,repeat_byte_identical:true,phase3_hash_unchanged:true,assertions_passed:true,sha256:hash,headless_ms:Math.round(elapsed),end});
}
if(existsSync(`${output}/.exact.tmp`))unlinkSync(`${output}/.exact.tmp`);
// No claim about GPU performance: only measurements actually run here.
const bench=JSON.parse(readFileSync('bench.json')),soak=JSON.parse(readFileSync('soak.json'));
assert.equal(bench.contract_version,'1.3');assert.ok(bench.avg_fps>=60&&bench.p1_low_fps>=30&&bench.load_ms<=10000,'Benchmark threshold failed');assert.deepEqual(bench.framebuffer,[1280,720]);assert.equal(bench.scene.shades,200);assert.equal(bench.scene.motes,100);assert.equal(soak.nights,10);assert.equal(soak.crashes,0);assert.equal(soak.results.length,10);assert.ok(soak.mem_end_mb<=1.2*soak.mem_start_mb,'Soak RSS growth exceeds20%');
const count=label=>Number([...tests.stdout.matchAll(new RegExp('\\b'+label+' (\\d+)','g'))].at(-1)?.[1]??0);
writeFileSync(`${output}/verification.json`,JSON.stringify({contract_version:'1.3',generated_at:new Date().toISOString(),node:process.version,platform:platform(),arch:arch(),cpu:cpus()[0].model,tests_exit_code:tests.status,tests:{total:count('tests'),passed:count('pass'),failed:count('fail')},runs,bench,soak},null,2)+'\n');
console.log(`Tests and ${runs.length} scenarios passed; deterministic output and headless time<30s. Evidence: ${output}`);
