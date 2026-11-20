import {ACTION_LABELS,DEFAULT_BINDINGS,keyLabel,rebind} from './keybindings.mjs';
import {addEntry,rankEntries} from './leaderboard.mjs';
import {saveSettings} from './campaign.mjs';
let dependencies,awaiting=null,entries=[],spawnAlerts=[];const saved=new WeakSet();
const $=id=>document.getElementById(id);
export function initializePhase4(config){dependencies=config;}
const persist=()=>{saveSettings(localStorage,dependencies.settings);dependencies.applySettings();updateControlHints();};
function bindingRows(){const {settings}=dependencies;$('binding-rows').innerHTML=Object.entries(ACTION_LABELS).map(([action,label])=>`<label>${label}<button type="button" class="binding" data-action="${action}">${keyLabel(settings.bindings[action])}</button></label>`).join('');for(const button of document.querySelectorAll('.binding'))button.onclick=()=>{awaiting=button.dataset.action;$('binding-message').textContent=`Nhấn phím mới cho “${ACTION_LABELS[awaiting]}”…`;button.textContent='Đang chờ phím…';};}
addEventListener('keydown',event=>{if(!awaiting)return;event.preventDefault();event.stopImmediatePropagation();try{dependencies.settings.bindings=rebind(dependencies.settings.bindings,awaiting,event.code);awaiting=null;persist();$('binding-message').textContent='Đã lưu phím điều khiển.';bindingRows();}catch(error){$('binding-message').textContent=error.message;}},true);
export function updateControlHints(){if(!dependencies)return;const b=dependencies.settings.bindings;if($('control-hints'))$('control-hints').textContent=`${[b.forward,b.left,b.backward,b.right].map(keyLabel).join('/')} Đi · ${keyLabel(b.jump)} Nhảy · ${keyLabel(b.interact)} Tương tác`;
  if($('camera-hints'))$('camera-hints').textContent=`Kéo chuột: camera · ${keyLabel(b.pause)}: tạm dừng`;
  for(const [id,action]of [['dash-cd','dash'],['pulse-cd','pulse']])$(id)?.parentElement.querySelector('kbd')?.replaceChildren(document.createTextNode(keyLabel(b[action])));
}
async function loadEntries(){try{const response=await fetch('/api/leaderboard');if(!response.ok)throw Error('static');entries=rankEntries((await response.json()).entries);localStorage.setItem('lantern-leaderboard',JSON.stringify({entries}));}catch{try{entries=rankEntries(JSON.parse(localStorage.getItem('lantern-leaderboard')??'{"entries":[]}').entries);}catch{entries=[];}}return entries;}
async function storeEntry(entry){let stored;try{const response=await fetch('/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry)});if(response.status===404||response.status===405)throw Object.assign(Error('static'),{static:true});const body=await response.json();if(!response.ok)throw Error(body.error);stored=rankEntries(body.entries);}catch(error){if(!error.static&&navigator.onLine&&location.protocol!=='file:')throw error;stored=addEntry(await loadEntries(),entry);}entries=stored;localStorage.setItem('lantern-leaderboard',JSON.stringify({entries}));return entries;}
export function renderPhase4(mode){
  if(!dependencies)return;awaiting=null;const {settings,show,game,campaign}=dependencies;
  if(mode==='menu'){
    const button=document.createElement('button');button.textContent='Bảng xếp hạng';button.onclick=()=>show('leaderboard');$('settings').before(button);
  }
  if(mode==='settings'){
    const area=document.createElement('section');area.className='accessibility-settings';area.innerHTML=`<label class="toggle"><input id="reduce-motion" type="checkbox" ${settings.reducedMotion?'checked':''}> Giảm chuyển động</label><label class="toggle"><input id="large-text" type="checkbox" ${settings.largeText?'checked':''}> Chữ lớn ×1,25</label><h3>Đổi phím</h3><div class="binding-grid" id="binding-rows"></div><p id="binding-message" role="status">Chọn một hành động rồi nhấn phím mới. Phím trùng sẽ bị từ chối.</p><button type="button" id="reset-bindings">Khôi phục mặc định</button>`;
    $('back').before(area);for(const [id,key]of [['reduce-motion','reducedMotion'],['large-text','largeText']])$(id).onchange=()=>{settings[key]=$(id).checked;persist();};bindingRows();$('reset-bindings').onclick=()=>{settings.bindings={...DEFAULT_BINDINGS};awaiting=null;persist();bindingRows();$('binding-message').textContent='Đã khôi phục phím mặc định.';};
  }
  if(mode==='leaderboard'){
    $('panel').innerHTML='<span class="eyebrow">NHỮNG NGƯỜI GIỮ LỬA</span><h2>Bảng xếp hạng</h2><div id="ranking-content">Đang đọc điểm đã lưu…</div><button id="export-rankings">Xuất JSON</button><button id="ranking-back">Về menu</button>';
    $('ranking-back').onclick=()=>show('menu');$('export-rankings').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({entries},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='leaderboard.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
    loadEntries().then(list=>{if(!$('ranking-content'))return;$('ranking-content').innerHTML=list.length?`<table class="rankings"><thead><tr><th>Tên</th><th>Điểm</th><th>Đêm thắng</th></tr></thead><tbody>${list.map(e=>`<tr><td>${e.name}</td><td>${e.score}</td><td>${e.nights_won}/3</td></tr>`).join('')}</tbody></table>`:'Chưa có điểm. Hãy bắt đầu một hành trình.';});
  }
  const current=game();if(mode==='dawn'||mode==='result'&&current.state==='lost'){
    const form=document.createElement('form');form.className='save-score';form.innerHTML='<label for="player-name">Tên người giữ đèn (3–12 ký tự A–Z, a–z, 0–9, _)</label><input id="player-name" name="name" minlength="3" maxlength="12" pattern="[A-Za-z0-9_]{3,12}" required autocomplete="nickname"><button type="submit">Lưu điểm</button><p id="save-message" role="status"></p>';$('panel').append(form);
    if(saved.has(current)){form.querySelector('button').disabled=true;$('save-message').textContent='Kết quả này đã được lưu.';}
    form.onsubmit=async event=>{event.preventDefault();if(saved.has(current)||!form.reportValidity())return;const button=form.querySelector('button');button.disabled=true;try{await storeEntry({name:$('player-name').value,score:campaign.total,nights_won:campaign.scores.filter(n=>Number.isFinite(n)).length,achieved_at:new Date().toISOString(),seed:campaign.seed});saved.add(current);$('save-message').textContent='Đã lưu. Xem top 10 từ menu chính.';}catch(error){$('save-message').textContent=error.message;button.disabled=false;}};
  }
  updateControlHints();
}
export function phase4Event(event,game){if(event.name==='shade_spawned'){const shade=game.shades.find(s=>s.id===event.data.id);if(shade)spawnAlerts.push({id:shade.id,pos:[...shade.pos],until:game.sim_tick+240});}}
export function resetVisualCues(){spawnAlerts=[];if($('spawn-arrow'))$('spawn-arrow').hidden=true;if($('subtitles'))$('subtitles').textContent='';}
export function updateVisualCues(game,world,Vector3){
  spawnAlerts=spawnAlerts.filter(a=>a.until>game.sim_tick);const seconds=Math.ceil(game.time_left_s),messages=[];
  if(spawnAlerts.length)messages.push('Bóng Mực xuất hiện: '+spawnAlerts.map(a=>a.id).join(', '));if(game.wind.warning)messages.push('⚠ Gió sắp thổi');if(seconds<=10)messages.push(`⚠ Bình minh sau ${seconds} giây`);
  const weak=game.lanterns.filter(l=>l.lit&&l.fuel<30);if(weak.length)messages.push('⚠ Đèn yếu: '+weak.map(l=>l.id).join(', '));const subtitle=messages.join(' · ');if($('subtitles').textContent!==subtitle)$('subtitles').textContent=subtitle;
  const alert=spawnAlerts.at(-1),arrow=$('spawn-arrow');arrow.hidden=!alert;if(alert){const p=new Vector3(...alert.pos).project(world.camera);let x=p.x,y=-p.y;if(p.z>1){x=-x;y=-y;}const angle=Math.atan2(y,x);arrow.style.left=`${50+Math.cos(angle)*44}%`;arrow.style.top=`${50+Math.sin(angle)*35}%`;arrow.firstElementChild.style.transform=`rotate(${angle*180/Math.PI+90}deg)`;arrow.lastElementChild.textContent=alert.id;}
}
