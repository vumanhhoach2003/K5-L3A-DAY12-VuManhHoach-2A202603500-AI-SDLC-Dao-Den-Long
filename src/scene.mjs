import * as THREE from '../vendor/three.module.js';
import {PALETTE as c} from './palette.mjs';
const material=(color,options={})=>new THREE.MeshStandardMaterial({color,roughness:.9,...options});
export class WorldView {
  constructor(canvas){
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.setClearColor(c.sky);
    this.camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,240);this.camera.position.set(0,18,22);
    this.scene=new THREE.Scene();this.scene.fog=new THREE.FogExp2(c.fog,.007);
    this.ambient=new THREE.HemisphereLight(0xc7d9ff,0x243d42,.15);this.scene.add(this.ambient);
    const moon=new THREE.DirectionalLight(0xc0d6ff,2);moon.position.set(-30,60,10);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);Object.assign(moon.shadow.camera,{left:-60,right:100,top:60,bottom:-60});this.scene.add(moon);
    this.root=new THREE.Group();this.scene.add(this.root);this.motes=new Map();this.shades=new Map();this.drifters=new Map();this.charms=new Map();
    this.gold=material(c.mote,{emissive:c.halo,emissiveIntensity:1.8});this.shadeMaterial=material(c.shade,{emissive:c.shadeRim,emissiveIntensity:.12});
    this.player=this.createPlayer();this.scene.add(this.player);
    this.pulse=this.mesh(new THREE.RingGeometry(.94,1,48),new THREE.MeshBasicMaterial({color:c.lantern,transparent:true,opacity:0,side:THREE.DoubleSide}),this.scene);this.pulse.rotation.x=-Math.PI/2;this.pulseAge=10;
    this.leaves=new THREE.Group();this.scene.add(this.leaves);for(let i=0;i<18;i++){const leaf=this.mesh(new THREE.PlaneGeometry(.25,.7),new THREE.MeshBasicMaterial({color:c.gold,side:THREE.DoubleSide}),this.leaves);leaf.rotation.x=Math.PI/3;}
    this.resize();
  }
  mesh(geometry,mat,parent=this.root,pos=[0,0,0]){const m=new THREE.Mesh(geometry,mat);m.position.fromArray(pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  createPlayer(){const p=new THREE.Group(),wood=material(c.wood);
    this.mesh(new THREE.ConeGeometry(.45,1.1,10),material(c.coat),p,[0,.85,0]);this.mesh(new THREE.SphereGeometry(.3,12,8),material(0xf0c79b),p,[0,1.55,0]);
    this.mesh(new THREE.ConeGeometry(.8,.45,24),material(c.sand),p,[0,1.96,0]);this.mesh(new THREE.TorusGeometry(.25,.09,6,12),material(c.scarf),p,[0,1.3,0]).rotation.x=Math.PI/2;
    this.legs=[-.18,.18].map(x=>this.mesh(new THREE.CylinderGeometry(.1,.1,.55,6),material(0x273849),p,[x,.28,0]));
    this.mesh(new THREE.CylinderGeometry(.018,.018,.5,5),wood,p,[.65,1.45,0]);this.mesh(new THREE.SphereGeometry(.19,10,8),material(c.lantern,{emissive:c.core,emissiveIntensity:1}),p,[.65,1.1,0]);const light=new THREE.PointLight(c.lantern,16,12);light.position.set(.6,1.3,0);p.add(light);return p;
  }
  clearGroup(group){group.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])if(m!==this.gold&&m!==this.shadeMaterial)m.dispose();}});group.clear();}
  setNight(game){
    this.clearGroup(this.root);for(const map of [this.motes,this.shades,this.drifters,this.charms])map.clear();this.lamps=[];this.padViews=[];this.upperLayers=[];
    const grass=material(c.grass),stone=material(0x293e4b),wood=material(c.wood);
    for(const [cx,cz,r]of game.map.islands){this.mesh(new THREE.CylinderGeometry(r,r*.86,5,64),stone,this.root,[cx,-2.6,cz]);this.mesh(new THREE.CylinderGeometry(r,r,.2,64),grass,this.root,[cx,-.1,cz]);
      for(let i=0;i<22;i++){const a=i*Math.PI*2/22,radius=r-2,x=cx+Math.cos(a)*radius,z=cz+Math.sin(a)*radius;if(game.night===2&&Math.abs(z)<4)continue;this.mesh(new THREE.CylinderGeometry(.15,.3,2,5),wood,this.root,[x,1,z]);this.mesh(new THREE.ConeGeometry(1.3,3.5,6),grass,this.root,[x,3,z]);}
      for(let i=0;i<12;i++){const a=i*Math.PI/6;const cloud=this.mesh(new THREE.SphereGeometry(5,10,6),material(c.cloud,{transparent:true,opacity:.65}),this.root,[cx+Math.cos(a)*(r+6),-6,cz+Math.sin(a)*(r+6)]);cloud.scale.set(2,.4,1);cloud.castShadow=false;}
    }
    if(game.night===2){this.mesh(new THREE.BoxGeometry(18,.3,4),wood,this.root,[35,-.15,0]);for(let x=26;x<=44;x+=.6)this.mesh(new THREE.BoxGeometry(.08,.05,4),material(c.sand),this.root,[x,.03,0]);}
    if(game.night===3){
      const shape=new THREE.Shape();for(let i=0;i<=48;i++){const a=i*Math.PI/48;const x=Math.cos(a)*24,y=Math.sin(a)*24;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);}for(let i=48;i>=0;i--){const a=i*Math.PI/48;shape.lineTo(Math.cos(a)*12,Math.sin(a)*12);}shape.closePath();
      const platform=this.mesh(new THREE.ExtrudeGeometry(shape,{depth:3,bevelEnabled:false}),grass.clone(),this.root,[0,3,0]);platform.rotation.x=Math.PI/2;this.upperLayers.push({mesh:platform,height:3});
      const top=this.mesh(new THREE.CylinderGeometry(8,8,6,48),grass.clone(),this.root,[0,3,0]);this.upperLayers.push({mesh:top,height:6});this.mesh(new THREE.CylinderGeometry(2,2,8,16),wood,this.root,[0,10,0]);this.mesh(new THREE.ConeGeometry(3,1.6,8),material(c.sand),this.root,[0,14.8,0]);
      for(const a of [Math.PI/6,5*Math.PI/6]){const geometry=new THREE.BufferGeometry();const vertices=[];for(const [r,y,side]of [[30,0,-1.5],[30,0,1.5],[24,3,-1.5],[24,3,1.5]])vertices.push(Math.cos(a)*r-Math.sin(a)*side,y+.02,Math.sin(a)*r+Math.cos(a)*side);geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex([0,2,1,1,2,3]);geometry.computeVertexNormals();this.mesh(geometry,material(c.sand,{side:THREE.DoubleSide}));}
    }
    for(const pad of game.map.pads){const v=this.mesh(new THREE.CylinderGeometry(1,1,.15,24),material(c.drifter,{emissive:c.drifter,emissiveIntensity:.5}),this.root,[pad.pos[0],pad.pos[1]+.075,pad.pos[2]]);this.padViews.push(v);}
    for(const l of game.lanterns){const group=new THREE.Group();group.position.fromArray(l.pos);this.root.add(group);this.mesh(new THREE.CylinderGeometry(.22,.35,3.7,8),wood,group,[0,1.8,0]);const bulb=this.mesh(new THREE.CylinderGeometry(.85,.85,1.4,10),material(c.unlit,{emissive:c.lantern,emissiveIntensity:0}),group,[0,3.8,0]);const core=this.mesh(new THREE.SphereGeometry(.35,10,8),material(c.core,{emissive:c.core,emissiveIntensity:0}),group,[0,3.8,0]);this.mesh(new THREE.ConeGeometry(1.4,.75,6),material(c.wood),group,[0,4.9,0]);this.mesh(new THREE.CylinderGeometry(1.3,1.5,.25,10),stone,group,[0,.1,0]);const light=new THREE.PointLight(c.lantern,0,18,2);light.position.set(0,3.8,0);group.add(light);const ring=this.mesh(new THREE.RingGeometry(5.95,6,48),new THREE.MeshBasicMaterial({color:c.gold,transparent:true,opacity:0,side:THREE.DoubleSide}),group,[0,.025,0]);ring.rotation.x=-Math.PI/2;this.lamps.push({group,bulb,core,light,ring});}
    // Separate renderer-only stars never consume simulation randomness.
    const stars=[];for(let i=0;i<240;i++)stars.push(Math.sin(i*43.3)*110,35+(i%60),Math.cos(i*19.7)*110);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));this.root.add(new THREE.Points(geo,new THREE.PointsMaterial({color:c.text,size:.13})));
    this.camera.position.set(game.player.pos[0],game.player.pos[1]+18,game.player.pos[2]+22);this.yaw=0;
  }
  resize(benchmark=false){this.benchmark=benchmark;const width=benchmark?1280:innerWidth,height=benchmark?720:innerHeight;this.renderer.setPixelRatio(benchmark?1:Math.min(devicePixelRatio,1.5));this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();}
  sync(list,map,create,update){const active=new Set();for(const entity of list){active.add(entity.id);let view=map.get(entity.id);if(!view){view=create(entity);map.set(entity.id,view);}update(view,entity);}for(const [id,view]of map)if(!active.has(id)){this.root.remove(view);view.traverse(o=>o.geometry?.dispose());map.delete(id);}}
  triggerPulse(pos){this.pulseAge=0;this.pulse.position.set(pos[0],pos[1]+.05,pos[2]);}
  render(game,time,delta){
    const p=game.player;for(const layer of this.upperLayers){layer.mesh.material.transparent=p.pos[1]<layer.height-.2;layer.mesh.material.opacity=layer.mesh.material.transparent?.25:1;layer.mesh.material.depthWrite=!layer.mesh.material.transparent;}this.player.position.fromArray(p.pos);this.player.visible=!(game.invuln>0&&Math.floor(time*12)%2===0)&&game.respawn===0;this.player.rotation.y=Math.atan2(game.facing[0],game.facing[1]);
    const moving=Math.hypot(p.vel[0],p.vel[2])>.1;this.legs[0].rotation.x=moving?Math.sin(time*13)*.5:0;this.legs[1].rotation.x=-this.legs[0].rotation.x;
    this.sync(game.motes,this.motes,()=>{const v=this.mesh(new THREE.SphereGeometry(.16,6,6),this.gold);v.castShadow=false;return v;},(v,m)=>{v.position.set(m.pos[0],m.pos[1]+.55+Math.sin(time*3+m.pos[0])*.15,m.pos[2]);v.scale.setScalar(m.kind==='dropped'?.8:1);});
    this.sync(game.shades,this.shades,()=>{const g=new THREE.Group();this.root.add(g);this.mesh(new THREE.SphereGeometry(.65,10,8),this.shadeMaterial.clone(),g);const rim=this.mesh(new THREE.TorusGeometry(.65,.035,4,20),material(c.shadeRim,{emissive:c.shadeRim,emissiveIntensity:1}),g);rim.rotation.x=Math.PI/2;for(const x of [-.2,.2])this.mesh(new THREE.SphereGeometry(.075,6,6),material(c.shadeRim,{emissive:c.shadeRim,emissiveIntensity:2}),g,[x,.1,.55]);return g;},(v,s)=>{v.position.fromArray(s.pos);v.position.y+=Math.sin(time*3)*.1;v.lookAt(p.pos[0],v.position.y,p.pos[2]);v.children[0].material.color.setHex(s.state==='stunned'?c.stunned:c.shade);v.scale.setScalar(s.state==='spawning'?.4:1);});
    this.sync(game.drifters.filter(d=>d.state!=='removed'),this.drifters,()=>{const g=new THREE.Group();this.root.add(g);for(let i=0;i<5;i++)this.mesh(new THREE.PlaneGeometry(.4,.8),material(c.drifter,{side:THREE.DoubleSide,emissive:c.drifter,emissiveIntensity:.4}),g,[i*.25,0,0]);return g;},(v,d)=>{v.position.set(d.pos[0],d.pos[1]+.5,d.pos[2]);v.rotation.y=time;v.children.forEach((m,i)=>m.position.y=Math.sin(time*6-i)*.2);});
    this.sync(game.charms,this.charms,()=>{const v=this.mesh(new THREE.BoxGeometry(.45,.7,.08),material(c.scarf,{emissive:c.gold,emissiveIntensity:.2}));const border=this.mesh(new THREE.BoxGeometry(.52,.77,.04),material(c.gold),v,[0,0,-.04]);return v;},(v,ch)=>{v.visible=ch.available;v.position.set(ch.pos[0],ch.pos[1]+.8+Math.sin(time*2)*.12,ch.pos[2]);v.rotation.y=time;});
    const lit=game.lanterns.filter(l=>l.lit).length;this.ambient.intensity=.15+.55*lit/game.lanterns.length;
    game.lanterns.forEach((l,i)=>{const v=this.lamps[i];v.bulb.material.color.setHex(l.lit?c.lantern:c.unlit);v.bulb.material.emissiveIntensity=l.lit?.8:0;v.core.material.emissiveIntensity=l.lit?2:0;v.light.intensity=l.lit?35:0;v.ring.material.opacity=l.lit?.22:0;});
    if(game.state!=='paused')this.pulseAge+=delta;this.pulse.material.opacity=Math.max(0,1-this.pulseAge/.5)*.7;this.pulse.scale.setScalar(Math.max(.01,this.pulseAge/.5*5));
    this.leaves.visible=game.wind.warning||game.wind.active;this.leaves.position.fromArray(p.pos);this.leaves.children.forEach((v,i)=>{const a=time*2+i;v.position.set(Math.sin(a)*5,1+(i%5),Math.cos(a)*5);v.rotation.z=a;});
    const target=new THREE.Vector3(p.pos[0],p.pos[1]+1.2,p.pos[2]);const desired=new THREE.Vector3(target.x+Math.sin(this.yaw)*16,target.y+13,target.z+Math.cos(this.yaw)*16);this.camera.position.lerp(desired,1-Math.exp(-8*delta));this.camera.lookAt(target);this.renderer.render(this.scene,this.camera);
  }
}
