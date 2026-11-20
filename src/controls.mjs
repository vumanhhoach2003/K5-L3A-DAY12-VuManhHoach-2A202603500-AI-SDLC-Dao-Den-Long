// Project keyboard input onto the camera's actual horizontal axes, including
// while the camera is easing toward a newly requested orbit angle.
export function movementForCamera(keys, cameraBack) {
  const length = Math.hypot(cameraBack[0], cameraBack[1]);
  const [backX, backZ] = length > 0
    ? cameraBack.map(value => value / length)
    : [0, 1];
  const right = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
  const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
  return [right * backZ - forward * backX, -right * backX - forward * backZ];
}
