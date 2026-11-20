export class Campaign {
  constructor(){this.reset();}
  reset(){this.night=1;this.scores=[];this.screen='menu';}
  start(){this.night=1;this.scores=[];this.screen='intro';}
  play(){this.screen='playing';}
  complete(state,score){if(state==='won')this.scores[this.night-1]=score;this.result=state;this.screen=state==='won'&&this.night===3?'dawn':'result';}
  advance(){if(this.result==='won'&&this.night<3)this.night++;this.screen='intro';}
  get total(){return this.scores.reduce((sum,n)=>sum+(n??0),0);}
}
export const DEFAULT_SETTINGS={volume:.35,sensitivity:1,colorblind:false};
export function loadSettings(storage){try{const s=JSON.parse(storage.getItem('lantern-settings')??'{}');return {volume:Number.isFinite(s.volume)?Math.max(0,Math.min(1,s.volume)):.35,sensitivity:Number.isFinite(s.sensitivity)?Math.max(.2,Math.min(3,s.sensitivity)):1,colorblind:s.colorblind===true};}catch{return {...DEFAULT_SETTINGS};}}
export function saveSettings(storage,settings){try{storage.setItem('lantern-settings',JSON.stringify(settings));return true;}catch{return false;}}
