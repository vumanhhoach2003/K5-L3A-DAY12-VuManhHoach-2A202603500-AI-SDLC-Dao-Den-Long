export const TUNING = Object.freeze({player_speed:6,carry_capacity:12,lantern_cost:8,lantern_count_night1:5,pickup_radius:1.5,interact_radius:3,pulse_cost:2,pulse_radius:7,night1_duration_s:300,flames:3,invuln_s:2,hit_drop_ratio:.25,pulse_stun_s:3,pulse_push_m:4,pulse_cooldown_s:1,safe_radius:6,shade_speed:2.3,shade_hit_radius:1,fall_enabled:false,score:{per_mote:10,per_lantern:100,per_stun:20,per_second_left:2,per_flame_left:50}});
export const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const round=n=>Math.round(n*1000)/1000;
export class Game {
 constructor(seed=1,scenario={}) {
  this.tuning=TUNING;this.tick=0;this.state='playing';this.score=0;this.events=[];this.seed=seed>>>0;this.serial=0;
  this.random=()=>{this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;};
  this.player={pos:[0,0,0],carried:0,flames:TUNING.flames,...scenario.player};this.player.pos=[...this.player.pos];
  this.duration=scenario.time_left_s??300;this.time_left_s=this.duration;this.invuln=0;this.cooldown=0;this.vy=0;
  this.input={move:[0,0],cam_yaw_deg:0,jump:false,interact:false,pulse:false,dash:false};
  this.lanterns=Array.from({length:5},(_,i)=>{const a=i*Math.PI*2/5;return {id:`L${i+1}`,pos:[Math.sin(a)*25,0,Math.cos(a)*25],deposited:0,lit:false};});
  for(const patch of scenario.lanterns??[]){const l=this.lanterns.find(l=>l.id===patch.id);Object.assign(l,patch);if(l.lit)l.deposited=TUNING.lantern_cost;else if(l.deposited>=TUNING.lantern_cost)l.lit=true;}
  const randomPos=()=>{const a=this.random()*Math.PI*2,r=Math.sqrt(this.random())*35;return [Math.sin(a)*r,0,Math.cos(a)*r];};
  const motes=scenario.motes??(scenario.random_motes===false?[]:Array.from({length:110},randomPos));
  this.motes=motes.map((pos,i)=>({id:`M${i+1}`,pos:[...pos]}));
  const shades=scenario.shades??(scenario.random_shades===false?[]:Array.from({length:4},(_,i)=>({pos:[Math.sin(i*1.7)*33,0,Math.cos(i*1.7)*33]})));
  this.shades=shades.map((s,i)=>({id:s.id??`S${i+1}`,pos:[...s.pos],state:'chase',stun:0}));
  this.randomShades=scenario.random_shades!==false;this.randomMotes=scenario.random_motes!==false;
 }
 emit(name,data){this.events.push({type:'event',tick:this.tick,name,data});}
 safe(pos){return this.lanterns.some(l=>l.lit&&distance(pos,l.pos)<=TUNING.safe_radius);}
 finish(state,reason){this.state=state;if(state==='won')this.score+=Math.floor(Math.max(0,this.time_left_s))*TUNING.score.per_second_left+this.player.flames*TUNING.score.per_flame_left;this.emit('game_over',{result:state,reason});}
 step(patch={}) {
  if(this.state!=='playing')return [];
  const old=this.input;this.input={...old,...patch};const input=this.input,t=TUNING,p=this.player;this.events=[];this.tick++;
  this.time_left_s=Math.max(0,this.duration-this.tick/60);this.invuln=Math.max(0,this.invuln-1);this.cooldown=Math.max(0,this.cooldown-1);
  if(p.flames<=0){this.finish('lost','no_flames');return this.events;}
  let [x,z]=input.move;const len=Math.max(1,Math.hypot(x,z));x/=len;z/=len;const a=input.cam_yaw_deg*Math.PI/180;
  p.pos[0]+=(x*Math.cos(a)+z*Math.sin(a))*t.player_speed/60;p.pos[2]+=(-x*Math.sin(a)+z*Math.cos(a))*t.player_speed/60;
  const radius=Math.hypot(p.pos[0],p.pos[2]);if(radius>39){p.pos[0]*=39/radius;p.pos[2]*=39/radius;}
  if(input.jump&&!old.jump&&p.pos[1]===0)this.vy=7;
  if(this.vy!==0||p.pos[1]>0){p.pos[1]=Math.max(0,p.pos[1]+this.vy/60);this.vy-=18/60;if(p.pos[1]===0)this.vy=0;}
  this.motes=this.motes.filter(m=>{if(p.carried<t.carry_capacity&&distance(p.pos,m.pos)<=t.pickup_radius){p.carried++;this.score+=t.score.per_mote;this.emit('mote_picked',{carried:p.carried});return false;}return true;});
  if(input.interact&&!old.interact){const l=this.lanterns.filter(l=>!l.lit&&distance(l.pos,p.pos)<=t.interact_radius).sort((a,b)=>distance(a.pos,p.pos)-distance(b.pos,p.pos))[0];if(l&&p.carried>0){const amount=Math.min(p.carried,t.lantern_cost-l.deposited);p.carried-=amount;l.deposited+=amount;this.emit('deposit',{lantern_id:l.id,amount,deposited:l.deposited});if(l.deposited>=t.lantern_cost){l.lit=true;this.score+=t.score.per_lantern;this.emit('lantern_lit',{lantern_id:l.id});}}}
  if(input.pulse&&!old.pulse&&p.carried>=t.pulse_cost&&this.cooldown===0){p.carried-=t.pulse_cost;this.cooldown=t.pulse_cooldown_s*60;const ids=[];for(const s of this.shades){if(distance(s.pos,p.pos)<=t.pulse_radius){ids.push(s.id);s.stun=t.pulse_stun_s*60;s.state='stunned';let dx=s.pos[0]-p.pos[0],dz=s.pos[2]-p.pos[2],d=Math.hypot(dx,dz);if(d===0){dx=1;dz=0;d=1;}s.pos[0]+=dx/d*t.pulse_push_m;s.pos[2]+=dz/d*t.pulse_push_m;this.score+=t.score.per_stun;}}this.emit('pulse',{stunned_ids:ids});}
  for(const s of this.shades){if(s.stun>0){s.stun--;s.state='stunned';continue;}s.state='chase';
   // A lit lantern repels even a shade placed inside its sanctuary by a scenario.
   for(const l of this.lanterns){if(!l.lit)continue;const d=distance(s.pos,l.pos);if(d<=t.safe_radius){const dx=s.pos[0]-l.pos[0],dz=s.pos[2]-l.pos[2];s.pos[0]=l.pos[0]+(d?dx/d:1)*(t.safe_radius+.001);s.pos[2]=l.pos[2]+(d?dz/d:0)*(t.safe_radius+.001);}}
   if(this.safe(p.pos)){s.state='afraid';continue;}
   const d=distance(s.pos,p.pos);if(d>0){const step=Math.min(d,t.shade_speed/60),candidate=[s.pos[0]+(p.pos[0]-s.pos[0])/d*step,s.pos[1],s.pos[2]+(p.pos[2]-s.pos[2])/d*step];if(!this.safe(candidate))s.pos=candidate;else s.state='afraid';}
   if(distance(s.pos,p.pos)<=t.shade_hit_radius&&this.invuln===0){p.flames--;const dropped=Math.floor(p.carried*t.hit_drop_ratio);p.carried-=dropped;this.invuln=t.invuln_s*60;this.emit('player_hit',{by:'shade',flames:p.flames,dropped});if(p.flames<=0){this.finish('lost','no_flames');break;}}
  }
  if(this.state==='playing'&&this.lanterns.every(l=>l.lit))this.finish('won','all_lit');
  if(this.state==='playing'&&this.time_left_s<=0)this.finish('lost','dawn');
  if(this.state==='playing'&&this.randomShades&&this.tick%900===0){const a=this.random()*Math.PI*2;const s={id:`S${this.shades.length+1}`,pos:[Math.sin(a)*37,0,Math.cos(a)*37],state:'chase',stun:0};this.shades.push(s);this.emit('shade_spawned',{id:s.id});}
  if(this.state==='playing'&&this.randomMotes&&this.tick%180===0&&this.motes.length<100){const a=this.random()*Math.PI*2,r=8+this.random()*25;this.motes.push({id:`R${++this.serial}`,pos:[Math.sin(a)*r,0,Math.cos(a)*r]});}
  return this.events;
 }
 snapshot(){return {type:'snapshot',tick:this.tick,sim_tick:this.tick,state:this.state,time_left_s:round(this.time_left_s),score:this.score,player:{...this.player,pos:this.player.pos.map(round)},lanterns:this.lanterns.map(l=>({...l,pos:l.pos.map(round)})),shades:this.shades.map(({id,pos,state})=>({id,pos:pos.map(round),state})),motes_active:this.motes.length,motes:this.motes.map(m=>({...m,pos:m.pos.map(round)}))};}
}
