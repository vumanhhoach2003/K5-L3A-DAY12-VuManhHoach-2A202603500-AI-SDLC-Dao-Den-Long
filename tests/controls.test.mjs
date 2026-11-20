import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3} from 'three';
import {movementForCamera} from '../src/controls.mjs';
import {Game} from '../src/game.mjs';

test('A/D move left/right on the rendered screen at every camera heading', () => {
  for (const angle of [0, Math.PI / 4, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const camera = new PerspectiveCamera(52, 16 / 9, .1, 220);
    camera.position.set(Math.sin(angle)*15, 14.2, Math.cos(angle)*15);
    camera.lookAt(0, 1.2, 0);
    camera.updateMatrixWorld();
    const origin = new Vector3(0,0,0).project(camera);
    for (const [key, sign] of [['KeyA',-1],['KeyD',1]]) {
      const game = new Game(42,{random_motes:false,random_shades:false});
      const move = movementForCamera(new Set([key]), [camera.position.x,camera.position.z]);
      game.step({move,cam_yaw_deg:0});
      const screen = new Vector3(...game.player.pos).project(camera);
      assert.ok((screen.x-origin.x)*sign > 0, `${key} at heading ${angle}`);
    }
    const forward = movementForCamera(new Set(['KeyW']),[camera.position.x,camera.position.z]);
    assert.ok(forward[0]*camera.position.x+forward[1]*camera.position.z < 0);
  }
  assert.deepEqual(movementForCamera(new Set(['KeyA','KeyD']),[0,15]),[0,-0]);
});
