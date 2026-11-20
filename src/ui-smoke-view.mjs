import {phase4Event,updateVisualCues} from './ui4.mjs';import * as THREE from '../vendor/three.module.js';
export async function runUISelfTest({show,game,campaign,settings,world}){
  const checks=[],$=id=>document.getElementById(id),check=(name,condition)=>{checks.push({name,passed:Boolean(condition)});if(!condition)throw Error(name);};
  const frames=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const until=async predicate=>{const start=performance.now();while(!predicate()){if(performance.now()-start>8000)throw Error('UI wait timed out');await frames();}};
  try{
    await document.fonts.ready;check('main menu initialized',$('start')&&$('settings'));
    show('settings');check('all9 action controls',document.querySelectorAll('.binding').length===9);
    const normalFont=parseFloat(getComputedStyle($('binding-message')).fontSize);check('normal UI font>=18px',normalFont>=18);
    $('large-text').checked=true;$('large-text').dispatchEvent(new Event('change'));await frames();check('large text1.25',Math.abs(parseFloat(getComputedStyle($('binding-message')).fontSize)/normalFont-1.25)<.01);
    $('reduce-motion').checked=true;$('reduce-motion').dispatchEvent(new Event('change'));check('reduced motion applied',world.reducedMotion===true);
    document.querySelector('[data-action=jump]').click();dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',bubbles:true}));check('duplicate key reported',$('binding-message').textContent.includes('đã dùng'));
    dispatchEvent(new KeyboardEvent('keydown',{code:'KeyJ',bubbles:true}));check('new jump binding stored',settings.bindings.jump==='KeyJ');check('settings saved',JSON.parse(localStorage.getItem('lantern-settings')).largeText===true);
    $('reset-bindings').click();check('reset defaults works',settings.bindings.jump==='Space');
    $('large-text').checked=false;$('large-text').dispatchEvent(new Event('change'));await frames();
    const small=[];for(const element of document.body.querySelectorAll('*')){if(!element.getClientRects().length||getComputedStyle(element).visibility==='hidden')continue;const hasText=[...element.childNodes].some(node=>node.nodeType===3&&node.textContent.trim());if(hasText&&parseFloat(getComputedStyle(element).fontSize)<18)small.push({tag:element.tagName,id:element.id,font:getComputedStyle(element).fontSize});}check('all visible settings/HUD text>=18px',small.length===0);
    campaign.scores=[123];campaign.night=2;game().state='lost';show('result');check('loss offers name save',$('player-name')!==null);
    const input=$('player-name');input.value='UiTest';input.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyR',bubbles:true}));check('typingR does not restart game',$('player-name')===input);
    input.form.requestSubmit();await until(()=>$('save-message').textContent.startsWith('Đã lưu'));check('local score submitted',true);
    const saved=await (await fetch('/api/leaderboard')).json();check('server persisted total won-score',saved.entries[0].score===123&&saved.entries[0].nights_won===1);
    show('leaderboard');await until(()=>$('ranking-content').textContent.includes('UiTest'));check('menu ranking displays stored row',true);
    const g=game();g.shades.push({id:'S999',pos:[20,.8,0],state:'wander'});phase4Event({name:'shade_spawned',data:{id:'S999'}},g);g.wind.warning=true;g.time_left_s=9;g.lanterns[0].lit=true;g.lanterns[0].fuel_units=1000;updateVisualCues(g,world,THREE.Vector3);
    check('spawn arrow visible',$('spawn-arrow').hidden===false);const subtitle=$('subtitles').textContent;check('all4 required visual cues',subtitle.includes('Bóng Mực')&&subtitle.includes('Gió')&&subtitle.includes('9 giây')&&subtitle.includes('Đèn yếu'));
    await fetch('/api/self-test/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({checks,passed:true,viewport:[innerWidth,innerHeight],fixture:'isolated UI fixture, not a gameplay result; server scores stored only in temporary directory'})});
  }catch(error){await fetch('/api/self-test/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({checks,passed:false,error:error.message,viewport:[innerWidth,innerHeight],outer:[outerWidth,outerHeight]})});}
}
