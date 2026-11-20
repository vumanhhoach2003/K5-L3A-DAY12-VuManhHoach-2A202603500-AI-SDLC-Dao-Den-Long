import {createMap, support, surfaces, horizontalBlocked} from './maps.mjs';
import {TUNING} from './tuning.mjs';
export {TUNING};
export const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const round=n=>Math.round(n*1000)/1000;
const vector=v=>v.map(round);
const direction=(from,to)=>{const d=distance(from,to);return d>1e-10?[(to[0]-from[0])/d,(to[2]-from[2])/d]:[1,0];};
const idOrder=(a,b)=>a.id.localeCompare(b.id,'en',{numeric:true});

export class Game {
  constructor(seed=1, scenario={}, night=1) {
    this.night=night; this.map=createMap(night); this.tuning=TUNING;
    this.tick=0; this.sim_tick=0; this.state='playing'; this.score=0; this.events=[];
    this.seed=seed>>>0; this.serial=0; this.shadeSerial=0; this.drifterSerial=0;
    this.random=()=>{this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;};
    this.input={move:[0,0],cam_yaw_deg:0,jump:false,interact:false,pulse:false,dash:false,pause:false};
    const p=scenario.player??{};
    this.player={pos:[...(p.pos??[0,0,0])],vel:[0,0,0],carried:p.carried??0,flames:p.flames??3,grounded:false};
    this.player.grounded=support(night,this.player.pos)!==null && Math.abs(support(night,this.player.pos)-this.player.pos[1])<.001;
    this.invuln=p.invuln_ticks??0; this.dashCD=p.dash_cd_ticks??0; this.pulseCD=p.pulse_cd_ticks??0; this.charm=p.charm_ticks??0;
    this.dashLeft=0; this.dashDir=[0,1]; this.facing=[0,1]; this.launch=null; this.respawn=0;
    this.duration=scenario.time_left_s??this.map.duration; this.time_left_s=this.duration;
    this.windEnabled=scenario.wind_enabled!==false && night===3;
    this.wind={active:false,dir_deg:0,warning:false};
    this.lanterns=this.map.lanterns.map(l=>({...l,pos:[...l.pos]}));
    for(const patch of scenario.lanterns??[]) {
      const l=this.lanterns.find(l=>l.id===patch.id); Object.assign(l,patch);
      l.pos=[...l.pos]; if(l.lit)l.deposited=10; if(l.deposited>=10)l.lit=true;
    }
    this.randomMotes=scenario.random_motes!==false; this.randomShades=scenario.random_shades!==false;
    this.randomDrifters=scenario.random_drifters!==false && night>=2;
    const initialPoints=[...this.map.motePoints];
    for(let i=initialPoints.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[initialPoints[i],initialPoints[j]]=[initialPoints[j],initialPoints[i]];}
    const motes=scenario.motes??(this.randomMotes?initialPoints.slice(0,20):[]);
    this.motes=motes.map(m=>this.makeMote(Array.isArray(m)?m:m.pos,Array.isArray(m)?'random':m.kind??'random',Array.isArray(m)?null:m.ttl_ticks??(m.kind==='dropped'?480:null)));
    this.shades=(scenario.shades??[]).map((s,i)=>{
      const state=s.state??'wander';
      return {id:s.id??`S${i+1}`,pos:[...s.pos],state,left:s.state_ticks_left??(state==='stunned'?120:state==='recoil'?60:state==='spawning'?60:0),pushLeft:0,pushDir:[1,0],recoilDir:[1,0]};
    });
    this.shadeSerial=this.shades.reduce((max,s)=>Math.max(max,Number(s.id.match(/^S(\d+)$/)?.[1]??0)),0);
    this.drifters=(scenario.drifters??[]).map((d,i)=>({id:d.id??`D${i+1}`,pos:[...d.pos],state:d.state??'idle',stolen:d.stolen??0,left:d.state_ticks_left??(d.state==='flee'?240:0),released:false}));
    this.drifterSerial=this.drifters.reduce((max,d)=>Math.max(max,Number(d.id.match(/^D(\d+)$/)?.[1]??0)),0);
    this.charms=(scenario.charms??this.map.charms).map((c,i)=>({id:c.id??`C${i+1}`,pos:[...(c.pos??this.map.charms.find(p=>p.id===c.id)?.pos??[0,0,0])],available:c.available??true,respawn:c.respawn_ticks??Math.round((c.respawn_s??0)*60)}));
  }
  makeMote(pos,kind='random',ttl=null){return {id:`M${++this.serial}`,pos:[...pos],kind,ttl,born:this.sim_tick};}
  emit(name,data){this.events.push({type:'event',tick:this.tick,name,data});}
  safe(pos){return this.lanterns.some(l=>l.lit&&distance(pos,l.pos)<=6+1e-9);}
  finish(state,reason){this.state=state;if(state==='won')this.score+=Math.floor(Math.max(0,this.time_left_s))*2+this.player.flames*50;this.emit('game_over',{result:state,reason});}
  dropMotes(amount,pos,scatter=true){for(let i=0;i<amount;i++){const angle=scatter?this.random()*Math.PI*2:0,r=scatter?1.5+this.random():0;const x=pos[0]+Math.cos(angle)*r,z=pos[2]+Math.sin(angle)*r;const ground=support(this.night,[x,pos[1],z]);this.motes.push(this.makeMote([x,ground??pos[1],z],'dropped',480));}}
  moveMob(m,dir,amount,avoidSafe=true){
    const next=[m.pos[0]+dir[0]*amount,m.pos[1],m.pos[2]+dir[1]*amount];
    const oldGround=support(this.night,m.pos),offset=oldGround===null?0:m.pos[1]-oldGround;
    const feet=[m.pos[0],m.pos[1]-offset,m.pos[2]],nextFeet=[next[0],feet[1],next[2]];
    if(horizontalBlocked(this.night,feet,nextFeet)||surfaces(this.night,next[0],next[2]).length===0)return;
    if(avoidSafe){for(const l of this.lanterns){if(!l.lit)continue;const oldD=distance(m.pos,l.pos),newD=distance(next,l.pos);if(oldD>=6-1e-9&&newD<6){
      // Binary search the segment so a chasing shade stops at the sanctuary edge.
      let lo=0,hi=1;for(let k=0;k<30;k++){const mid=(lo+hi)/2,point=[m.pos[0]+(next[0]-m.pos[0])*mid,m.pos[1],m.pos[2]+(next[2]-m.pos[2])*mid];if(distance(point,l.pos)>=6)lo=mid;else hi=mid;}
      next[0]=m.pos[0]+(next[0]-m.pos[0])*lo;next[2]=m.pos[2]+(next[2]-m.pos[2])*lo;
    }}}
    const ground=support(this.night,[next[0],feet[1],next[2]],.11);
    if(ground!==null)next[1]=ground+offset;
    m.pos=next;
  }
  movePlayer(input,old){
    const p=this.player;
    if(this.respawn>0){p.vel=[0,0,0];return;}
    let [x,z]=input.move;const length=Math.max(1,Math.hypot(x,z));x/=length;z/=length;
    const a=input.cam_yaw_deg*Math.PI/180;
    const move=[x*Math.cos(a)+z*Math.sin(a),-x*Math.sin(a)+z*Math.cos(a)];
    if(Math.hypot(...move)>1e-8)this.facing=direction([0,0,0],[move[0],0,move[1]]);
    if(input.jump&&!old.jump&&p.grounded&&this.dashLeft===0){p.vel[1]=7;p.grounded=false;}
    if(input.dash&&!old.dash&&this.dashLeft===0&&(this.dashCD===0||this.charm>0)){
      this.dashDir=[...this.facing];this.dashLeft=12;this.dashCD=this.charm>0?0:90;this.emit('dash',{});
    }
    this.wind.active=this.windEnabled&&this.sim_tick>=1800&&this.sim_tick%1800<300;
    this.wind.warning=this.windEnabled&&this.sim_tick%1800>=1680;
    if(this.windEnabled&&this.sim_tick%1800===1680)this.wind.dir_deg=this.random()*360;
    const oldPos=[...p.pos],dashing=this.dashLeft>0;
    const horizontal=dashing?this.dashDir.map(v=>v*14):this.launch?[...this.launch]:move.map(v=>v*(this.charm>0?7.2:6));
    if(this.wind.active){const a=this.wind.dir_deg*Math.PI/180;horizontal[0]+=Math.cos(a)*2;horizontal[1]+=Math.sin(a)*2;}
    p.vel[0]=horizontal[0];p.vel[2]=horizontal[1];
    const next=[p.pos[0]+horizontal[0]/60,p.pos[1],p.pos[2]+horizontal[1]/60];
    if(!horizontalBlocked(this.night,p.pos,next)){p.pos[0]=next[0];p.pos[2]=next[2];}else{p.vel[0]=0;p.vel[2]=0;}
    if(dashing){this.dashLeft--;}
    else {
      const oldGround=support(this.night,oldPos),nextGround=support(this.night,p.pos,.11);
      if(p.grounded&&nextGround!==null&&oldGround!==null&&Math.abs(nextGround-oldGround)<=.11){p.pos[1]=nextGround;p.vel[1]=0;}
      else {
        p.grounded=false;
        const beforeY=p.pos[1];p.pos[1]+=p.vel[1]/60;p.vel[1]-=20/60;
        const floors=surfaces(this.night,p.pos[0],p.pos[2]).filter(h=>h<=beforeY+.001&&h>=p.pos[1]-.001);
        if(p.vel[1]<=0&&floors.length){p.pos[1]=Math.max(...floors);p.vel[1]=0;p.grounded=true;this.launch=null;}
      }
    }
    if(!dashing&&p.grounded){const pad=this.map.pads.find(pad=>distance(p.pos,pad.pos)<=1&&Math.abs(p.pos[1]-pad.pos[1])<.01);if(pad){const dir=direction(pad.pos,pad.target);this.launch=dir.map(v=>v*pad.speed);p.vel=[this.launch[0],pad.vy,this.launch[1]];p.grounded=false;}}
    if(p.pos[1]<-10){const lost=p.carried;p.carried=0;p.flames--;this.respawn=60;this.dashLeft=0;this.launch=null;p.vel=[0,0,0];this.emit('player_hit',{by:'fall',flames:p.flames,dropped:0,lost});}
  }
  pickup(){
    const p=this.player;if(this.respawn>0)return;
    const canPick=pos=>distance(p.pos,pos)<=1+1e-9&&Math.abs(p.pos[1]-pos[1])<=1.5+1e-9;
    this.motes=this.motes.filter(m=>{if(p.carried<10&&canPick(m.pos)&&m.born<this.sim_tick){p.carried++;this.emit('mote_picked',{carried:p.carried});return false;}return true;});
    for(const c of this.charms)if(c.available&&canPick(c.pos)){c.available=false;c.respawn=2700;this.charm=600;this.emit('charm_picked',{charm_id:c.id,charm_ticks:600});}
  }
  deposit(input,old){
    if(this.respawn>0||!input.interact||old.interact)return;
    const p=this.player,l=this.lanterns.filter(l=>!l.lit&&distance(l.pos,p.pos)<=2+1e-9).sort((a,b)=>distance(a.pos,p.pos)-distance(b.pos,p.pos)||a.id.localeCompare(b.id))[0];
    if(!l||p.carried===0)return;const amount=Math.min(p.carried,10-l.deposited);p.carried-=amount;l.deposited+=amount;this.score+=amount*10;
    this.emit('deposit',{lantern_id:l.id,amount,deposited:l.deposited});if(l.deposited===10){l.lit=true;this.score+=100;this.emit('lantern_lit',{lantern_id:l.id});}
  }
  updateSanctuaries(){
    for(const s of this.shades){s.evacuating=false;for(const l of this.lanterns){if(l.lit&&distance(s.pos,l.pos)<6-1e-9){const d=direction(l.pos,s.pos);s.pos[0]=l.pos[0]+d[0]*6;s.pos[2]=l.pos[2]+d[1]*6;s.evacuating=true;}}}
  }
  pulse(input,old){
    if(this.respawn>0||!input.pulse||old.pulse||this.pulseCD>0||this.player.carried<3)return;
    const p=this.player;p.carried-=3;this.pulseCD=180;
    const hits=pos=>Math.hypot(pos[0]-p.pos[0],pos[1]-p.pos[1]-.8,pos[2]-p.pos[2])<=5+1e-9;
    const ids=[];
    for(const s of this.shades)if(hits(s.pos)){s.state='stunned';s.left=120;s.pushLeft=15;s.pushDir=direction(p.pos,s.pos);ids.push(s.id);this.score+=5;}
    for(const d of this.drifters)if(d.state!=='removed'&&hits(d.pos)){
      if(d.state==='chase'){d.state='flee';d.left=240;d.stolen=0;}
      else if(d.state==='flee'&&d.stolen>0){const amount=d.stolen;this.dropMotes(amount,d.pos,false);d.stolen=0;d.left=120;d.released=true;this.emit('drifter_drop',{drifter_id:d.id,amount});}
    }
    this.emit('pulse',{stunned_ids:ids});
  }
  moveEnemies(){
    const p=this.player;
    for(const s of this.shades){
      if(s.state==='spawning')continue;
      if(s.state==='stunned'){if(s.pushLeft>0){this.moveMob(s,s.pushDir,4/15);s.pushLeft--;}continue;}
      if(s.state==='recoil'){this.moveMob(s,s.recoilDir,2/60);continue;}
      const d=distance(s.pos,p.pos);
      if(s.state==='chase'&&d>18)s.state='wander';
      if(s.state==='wander'&&d<=12)s.state='chase';
      if(s.state==='chase'&&this.respawn===0)this.moveMob(s,direction(s.pos,p.pos),Math.min(d,(this.night===3?4.5:4)/60));
      else if(s.state==='wander'){const angle=(this.sim_tick/180+Number(s.id.replace(/\D/g,'')))*.5;this.moveMob(s,[Math.cos(angle),Math.sin(angle)],1/60);}
    }
    for(const d of this.drifters){
      if(d.state==='removed')continue;
      if(d.state==='flee'){if(d.left<=0){d.state='removed';continue;}const dir=direction(p.pos,d.pos);d.pos[0]+=dir[0]*7/60;d.pos[2]+=dir[1]*7/60;continue;}
      const chase=p.carried>=5&&distance(p.pos,d.pos)<=15&&this.respawn===0;d.state=chase?'chase':'idle';
      if(chase){const dir=direction(d.pos,p.pos),amount=Math.min(distance(d.pos,p.pos),7/60);d.pos[0]+=dir[0]*amount;d.pos[2]+=dir[1]*amount;}
      else{const a=this.sim_tick/120;d.pos[0]+=Math.cos(a)*2/60;d.pos[2]+=Math.sin(a)*2/60;}
    }
  }
  contacts(){
    const p=this.player;if(this.respawn>0)return;
    for(const d of [...this.drifters].sort(idOrder))if(d.state==='chase'&&distance(d.pos,p.pos)<=1.2+1e-9){const amount=Math.min(3,p.carried);p.carried-=amount;d.stolen=amount;d.state='flee';d.left=240;this.emit('drifter_steal',{drifter_id:d.id,amount,carried:p.carried});}
    if(this.invuln>0||this.safe(p.pos))return;
    for(const s of [...this.shades].sort(idOrder))if(!s.evacuating&&['wander','chase'].includes(s.state)&&distance(s.pos,p.pos)<=1+1e-9&&Math.abs(p.pos[1]-s.pos[1])<=1.5+1e-9){
      p.flames--;const dropped=Math.floor(p.carried/2);p.carried-=dropped;this.dropMotes(dropped,p.pos);this.invuln=90;s.state='recoil';s.left=60;s.recoilDir=direction(p.pos,s.pos);this.moveMob(s,s.recoilDir,2/60);this.emit('player_hit',{by:'shade',flames:p.flames,dropped});break;
    }
  }
  spawn(){
    if(this.randomMotes&&this.sim_tick%240===0&&this.motes.length<30){const free=this.map.motePoints.filter(p=>!this.motes.some(m=>distance(m.pos,p)<.001&&Math.abs(m.pos[1]-p[1])<.001));if(free.length)this.motes.push(this.makeMote(free[Math.floor(this.random()*free.length)]));}
    if(this.randomShades&&this.sim_tick>=300&&(this.sim_tick-300)%this.map.shadeInterval===0){const count=this.sim_tick===300?2:1;for(let i=0;i<count&&this.shades.length<this.map.shadeMax;i++){
      const valid=this.map.shadePoints.filter(pos=>distance(pos,this.player.pos)>=15&&!this.safe(pos)&&!this.shades.some(s=>distance(s.pos,pos)<1));
      if(!valid.length)break;const pos=[...valid[Math.floor(this.random()*valid.length)]];pos[1]+=.8;
      const s={id:`S${++this.shadeSerial}`,pos,state:'spawning',left:60,pushLeft:0,pushDir:[1,0],recoilDir:[1,0]};this.shades.push(s);this.emit('shade_spawned',{id:s.id});
    }}
    if(this.randomDrifters&&this.sim_tick%1200===0&&this.drifters.filter(d=>d.state!=='removed').length<2){const pos=[...this.map.shadePoints[Math.floor(this.random()*this.map.shadePoints.length)]];pos[1]+=.8;this.drifters.push({id:`D${++this.drifterSerial}`,pos,state:'idle',stolen:0,left:0,released:false});}
  }
  step(patch={}){
    if(this.state==='won'||this.state==='lost')return [];
    const old=this.input;this.input={...old,...patch};const input=this.input;this.events=[];this.tick++;
    if(input.pause&&!old.pause){this.state=this.state==='paused'?'playing':'paused';this.emit(this.state==='paused'?'paused':'resumed',{});}
    if(this.state==='paused')return this.events;
    this.sim_tick++;this.time_left_s=Math.max(0,this.duration-this.sim_tick/60);
    for(const key of ['invuln','dashCD','pulseCD','charm'])this[key]=Math.max(0,this[key]-1);
    for(const s of this.shades){if(s.left>0)s.left--;if(s.left===0&&['stunned','recoil','spawning'].includes(s.state)){s.state='wander';s.pushLeft=0;}}
    for(const d of this.drifters)if(d.left>0)d.left--;
    for(const c of this.charms)if(!c.available){if(c.respawn>0)c.respawn--;if(c.respawn===0)c.available=true;}
    this.motes=this.motes.filter(m=>m.ttl===null||--m.ttl>0);
    if(this.respawn>0){this.respawn--;if(this.respawn===0){this.player.pos=[0,0,0];this.player.vel=[0,0,0];this.player.grounded=true;this.invuln=90;}}
    this.movePlayer(input,old);
    this.pickup();this.deposit(input,old);this.updateSanctuaries();this.pulse(input,old);this.moveEnemies();this.contacts();this.spawn();
    if(this.player.flames<=0)this.finish('lost','no_flames');
    else if(this.lanterns.every(l=>l.lit))this.finish('won','all_lit');
    else if(this.time_left_s<=0)this.finish('lost','dawn');
    return this.events;
  }
  snapshot(){
    const p=this.player;
    return {type:'snapshot',tick:this.tick,sim_tick:this.sim_tick,night:this.night,state:this.state,time_left_s:round(this.time_left_s),score:this.score,
      wind:{active:this.wind.active,dir_deg:round(this.wind.dir_deg),warning:this.wind.warning},
      player:{pos:vector(p.pos),vel:vector(p.vel),grounded:p.grounded,flames:p.flames,carried:p.carried,invuln:this.invuln>0,invuln_ticks:this.invuln,dash_cd_s:round(this.dashCD/60),pulse_cd_s:round(this.pulseCD/60),charm_s:round(this.charm/60),respawn_s:round(this.respawn/60)},
      lanterns:this.lanterns.map(l=>({...l,pos:vector(l.pos)})),
      shades:this.shades.map(s=>({id:s.id,pos:vector(s.pos),state:s.state,state_ticks_left:s.left})),
      motes_active:this.motes.length,motes:this.motes.map(m=>({id:m.id,pos:vector(m.pos),kind:m.kind,ttl_s:m.ttl===null?null:round(m.ttl/60)})),
      drifters:this.drifters.map(d=>({id:d.id,pos:vector(d.pos),state:d.state,stolen:d.stolen})),
      charms:this.charms.map(c=>({id:c.id,pos:vector(c.pos),available:c.available,respawn_s:round(c.respawn/60)}))};
  }
}
