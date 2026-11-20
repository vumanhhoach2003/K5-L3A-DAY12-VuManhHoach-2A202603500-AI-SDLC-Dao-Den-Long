const ring = (count, radius, y = 0, cx = 0, cz = 0, offset = 0) =>
  Array.from({length: count}, (_, i) => {
    const a = (offset + i * 360 / count) * Math.PI / 180;
    return [cx + Math.cos(a) * radius, y, cz + Math.sin(a) * radius];
  });
const lamps = positions => positions.map((pos, i) => ({id: `L${i + 1}`, pos, deposited: 0, lit: false}));
export function createMap(night) {
  if (night === 1) return {
    name: 'Đảo Bến', duration: 300, radius: 40, islands: [[0,0,40]],
    lanterns: lamps([[0,0,25],[23.8,0,7.7],[14.7,0,-20.2],[-14.7,0,-20.2],[-23.8,0,7.7]]),
    motePoints: [...ring(8,12), ...ring(16,33)], shadePoints: ring(12,37,0,0,0,15),
    pads: [], charms: [], shadeInterval: 480, shadeMax: 6
  };
  if (night === 2) return {
    name: 'Đảo Cau', duration: 330, radius: 28, islands: [[0,0,28],[70,0,28]],
    lanterns: lamps([[0,0,20],[17,0,-10],[-17,0,-10],[70,0,20],[87,0,-10],[53,0,-10]]),
    motePoints: [0,70].flatMap(x => [...ring(4,10,0,x), ...ring(8,22,0,x)]),
    shadePoints: [0,70].flatMap(x => ring(8,26,0,x,0,22.5)),
    pads: [{pos:[20,0,18], target:[70,0,0], vy:14, speed:24}, {pos:[50,0,-18], target:[0,0,0], vy:14, speed:24}],
    charms: [{id:'C1',pos:[35,0,0]}], shadeInterval: 420, shadeMax: 8
  };
  return {
    name: 'Đảo Chuông', duration: 360, radius: 45, islands: [[0,0,45]],
    lanterns: lamps([[0,6,6],[18,3,10],[-18,3,10],[35,0,-10],[-35,0,-10],[20,0,-35],[-20,0,-35]]),
    motePoints: [...ring(18,34), ...Array.from({length:8},(_,i)=>{const a=(20+i*20)*Math.PI/180;return [18*Math.cos(a),3,18*Math.sin(a)];}), ...ring(4,5,6,0,0,45)],
    shadePoints: ring(16,43), pads: [{pos:[0,3,13], target:[0,3,0], vy:12, speed:8}],
    charms: [{id:'C1',pos:[30,0,25]},{id:'C2',pos:[-30,0,25]}], shadeInterval:360, shadeMax:10
  };
}
export function surfaces(night, x, z) {
  if (night === 1) return Math.hypot(x,z) <= 40 + 1e-9 ? [0] : [];
  if (night === 2) return Math.hypot(x,z)<=28+1e-9 || Math.hypot(x-70,z)<=28+1e-9 || (x>=26&&x<=44&&Math.abs(z)<=2) ? [0] : [];
  const r = Math.hypot(x,z);
  if (r>45+1e-9) return [];
  const floors = [0];
  if (r>=12-1e-9 && r<=24+1e-9 && z>0) floors.push(3);
  if (r<=8+1e-9) floors.push(6);
  for (const angle of [Math.PI/6,5*Math.PI/6]) {
    const along=x*Math.cos(angle)+z*Math.sin(angle), across=-x*Math.sin(angle)+z*Math.cos(angle);
    if(along>=24 && along<=30 && Math.abs(across)<=1.5) floors.push((30-along)/2);
  }
  return floors;
}
export function support(night, pos, tolerance = .001) {
  const candidates=surfaces(night,pos[0],pos[2]).filter(h=>h<=pos[1]+tolerance);
  return candidates.length ? Math.max(...candidates) : null;
}
export function horizontalBlocked(night, old, next) {
  if (night !== 3) return false;
  if (next[1]>=5.99 && next[1]<14 && Math.hypot(next[0],next[2])<2) return true;
  const oldFloors=surfaces(night,old[0],old[2]), newFloors=surfaces(night,next[0],next[2]);
  // A newly entered higher platform has a vertical wall. Ramps are continuous.
  return newFloors.some(h=>h>old[1]+.11 && !oldFloors.some(prev=>Math.abs(prev-h)<.11));
}
