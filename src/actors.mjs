import * as THREE from '../vendor/three.module.js';
import {PALETTE as c} from './palette.mjs';import {accessibilityPalette} from './accessibility.mjs';
export class ActorBatches {
  constructor(parent,gold,shadeMaterial){
    this.scratch=new THREE.Object3D();this.color=new THREE.Color();
    const batch=(geometry,mat,max,shadow=false)=>{const m=new THREE.InstancedMesh(geometry,mat,max);m.count=0;m.castShadow=shadow;m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);parent.add(m);return m;};
    this.motes=batch(new THREE.SphereGeometry(.16,6,6),gold,2048);
    const body=shadeMaterial.clone();body.color.setHex(0xffffff);this.bodies=batch(new THREE.SphereGeometry(.65,10,8),body,2048,true);
    this.rims=batch(new THREE.TorusGeometry(.65,.035,4,20).rotateX(Math.PI/2),new THREE.MeshStandardMaterial({color:c.shadeRim,emissive:c.shadeRim,emissiveIntensity:1}),2048);
    this.eyes=batch(new THREE.SphereGeometry(.075,6,6),new THREE.MeshStandardMaterial({color:c.shadeRim,emissive:c.shadeRim,emissiveIntensity:2}),4096);
  }
  matrix(mesh,index,pos,yaw=0,scale=1){this.scratch.position.fromArray(pos);this.scratch.rotation.set(0,yaw,0);this.scratch.scale.setScalar(scale);this.scratch.updateMatrix();mesh.setMatrixAt(index,this.scratch.matrix);}
  render(game,time,colorblind){
    if(game.motes.length>2048||game.shades.length>2048)throw Error('Renderer actor pool exceeded');
    this.motes.count=game.motes.length;game.motes.forEach((m,i)=>this.matrix(this.motes,i,[m.pos[0],m.pos[1]+.55+Math.sin(time*3+m.pos[0])*.15,m.pos[2]],0,m.kind==='dropped'?.8:1));this.motes.instanceMatrix.needsUpdate=true;
    const accent=accessibilityPalette(colorblind).shadeAccent;for(const mesh of [this.rims,this.eyes]){mesh.material.color.setHex(accent);mesh.material.emissive.setHex(accent);}
    this.bodies.count=this.rims.count=game.shades.length;this.eyes.count=game.shades.length*2;
    game.shades.forEach((s,i)=>{
      const y=s.pos[1]+Math.sin(time*3)*.1,yaw=Math.atan2(game.player.pos[0]-s.pos[0],game.player.pos[2]-s.pos[2]),scale=s.state==='spawning'?.4:1;
      for(const mesh of [this.bodies,this.rims])this.matrix(mesh,i,[s.pos[0],y,s.pos[2]],yaw,scale);
      this.bodies.setColorAt(i,this.color.setHex(s.state==='stunned'?c.stunned:c.shade));
      for(let eye=0;eye<2;eye++){const x=(eye===0?-.2:.2)*scale,z=.55*scale;this.matrix(this.eyes,i*2+eye,[s.pos[0]+Math.cos(yaw)*x+Math.sin(yaw)*z,y+.1*scale,s.pos[2]-Math.sin(yaw)*x+Math.cos(yaw)*z],yaw,scale);}
    });
    for(const mesh of [this.bodies,this.rims,this.eyes])mesh.instanceMatrix.needsUpdate=true;if(this.bodies.instanceColor)this.bodies.instanceColor.needsUpdate=true;
  }
}
