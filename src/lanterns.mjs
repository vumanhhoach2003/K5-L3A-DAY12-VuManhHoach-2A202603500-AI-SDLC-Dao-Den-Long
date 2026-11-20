export const FUEL_SCALE=60;
export const MAX_FUEL_UNITS=6000;
export const fuelOutput=units=>Math.round(units/6)/10;
export const lightingCost=lamp=>lamp.ever_lit?5:10;
export const receivesMotes=lamp=>lamp.lit?lamp.fuel_units<MAX_FUEL_UNITS:lamp.deposited<lightingCost(lamp);
export const protects=lamp=>lamp.lit&&lamp.fuel_units>=1800;
export const requiredLights=count=>Math.ceil(.6*count);
export function createLantern(base,patch={}){
  const lamp={id:base.id,pos:[...(patch.pos??base.pos)],lit:patch.lit??false,deposited:patch.deposited??0,ever_lit:patch.ever_lit??false,relit_count:0};
  if(!('lit'in patch)&&lamp.deposited>=lightingCost(lamp))lamp.lit=true;
  lamp.ever_lit=lamp.ever_lit||lamp.lit;
  if(lamp.lit&& !('deposited'in patch))lamp.deposited=10;
  lamp.fuel_units=lamp.lit?Math.round((patch.fuel??100)*60):0;
  Object.defineProperty(lamp,'fuel',{get:()=>lamp.fuel_units/60});
  return lamp;
}
