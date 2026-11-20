const fail=message=>{throw Error(message);};
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const integer=v=>Number.isSafeInteger(v)&&v>=0;
const pos=v=>Array.isArray(v)&&v.length===3&&v.every(finite);
export function validateScenario(s,night){
  if(!object(s))fail('scenario must be an object');
  for(const key of ['random_motes','random_shades','random_drifters','wind_enabled'])if(key in s&&typeof s[key]!=='boolean')fail(`invalid ${key}`);
  if('time_left_s'in s&&(!finite(s.time_left_s)||s.time_left_s<0))fail('invalid time_left_s');
  if('player'in s){if(!object(s.player))fail('invalid player');const p=s.player;if('pos'in p&&!pos(p.pos))fail('invalid player.pos');for(const key of ['carried','flames','invuln_ticks','dash_cd_ticks','pulse_cd_ticks','charm_ticks'])if(key in p&&!integer(p[key]))fail(`invalid player.${key}`);}
  if('motes'in s&&(!Array.isArray(s.motes)||!s.motes.every(m=>pos(m)||(object(m)&&pos(m.pos)&&(!('kind'in m)||['random','dropped'].includes(m.kind))&&(!('ttl_ticks'in m)||integer(m.ttl_ticks))))))fail('invalid motes');
  for(const key of ['shades','drifters','charms','lanterns'])if(key in s){
    if(!Array.isArray(s[key]))fail(`invalid ${key}`);
    const ids=[];
    for(const [i,v] of s[key].entries()){
      if(!object(v)||('id'in v&&(typeof v.id!=='string'||!v.id)))fail(`invalid ${key} id`);
      if('pos'in v&&!pos(v.pos))fail(`invalid ${key}.pos`);
      if(['shades','drifters'].includes(key)&&!pos(v.pos))fail(`missing ${key}.pos`);
      ids.push(v.id??`${key[0].toUpperCase()}${i+1}`);
      if(key==='lanterns'){
        if(!new RegExp(`^L[1-${night+4}]$`).test(v.id))fail('invalid lantern id');
        if('lit'in v&&typeof v.lit!=='boolean')fail('invalid lantern lit');
        if('deposited'in v&&(!integer(v.deposited)||v.deposited>10))fail('invalid deposited');
      }
      if(key==='shades'&&'state'in v&&!['spawning','wander','chase','recoil','stunned'].includes(v.state))fail('invalid shade state');
      if(key==='drifters'&&'state'in v&&!['idle','chase','flee','removed'].includes(v.state))fail('invalid drifter state');
      for(const field of ['state_ticks_left','stolen','respawn_ticks'])if(field in v&&!integer(v[field]))fail(`invalid ${field}`);
      if('respawn_s'in v&&(!finite(v.respawn_s)||v.respawn_s<0))fail('invalid respawn_s');
      if('available'in v&&typeof v.available!=='boolean')fail('invalid available');
    }
    if(new Set(ids).size!==ids.length)fail(`duplicate ${key} id`);
  }
}
export function validateInputs(input){
  if(!object(input)||!Array.isArray(input.frames))fail('inputs.frames must be an array');
  let previous=-1;
  for(const f of input.frames){
    if(!object(f)||!integer(f.tick)||f.tick<=previous)fail('frame ticks must strictly increase');previous=f.tick;
    if('move'in f&&(!Array.isArray(f.move)||f.move.length!==2||!f.move.every(n=>finite(n)&&Math.abs(n)<=1)))fail('invalid move');
    if('cam_yaw_deg'in f&&!finite(f.cam_yaw_deg))fail('invalid cam_yaw_deg');
    for(const key of ['jump','interact','pulse','dash','pause'])if(key in f&&typeof f[key]!=='boolean')fail(`invalid ${key}`);
  }
}
