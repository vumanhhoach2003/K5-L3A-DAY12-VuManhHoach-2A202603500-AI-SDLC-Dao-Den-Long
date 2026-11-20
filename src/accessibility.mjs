export function accessibilityPalette(enabled){return {shadeAccent:enabled?0x00b3ff:0x7a3cff,danger:enabled?'#FFFFFF':'#FF5A5F',warningSymbol:enabled?'⚠ ':''};}
export function lanternAppearance(lamp,simTick){
  const weak=lamp.lit&&lamp.fuel<30;
  return {scaleY:lamp.lit?1:.8,torn:!lamp.lit,weak,blinkOn:!weak||simTick%60<30,fuelRatio:lamp.lit?lamp.fuel/100:0};
}
