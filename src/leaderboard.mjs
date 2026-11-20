export function validateEntry(entry){
  if(!entry||typeof entry!=='object'||typeof entry.name!=='string'||!(/^[A-Za-z0-9_]{3,12}$/).test(entry.name))throw Error('Tên cần 3–12 ký tự A–Z, a–z, 0–9 hoặc _.');
  if(!Number.isSafeInteger(entry.score)||entry.score<0||!Number.isInteger(entry.nights_won)||entry.nights_won<0||entry.nights_won>3||!Number.isSafeInteger(entry.seed))throw Error('Điểm, số Đêm hoặc seed không hợp lệ.');
  if(typeof entry.achieved_at!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(entry.achieved_at)||!Number.isFinite(Date.parse(entry.achieved_at)))throw Error('Thời điểm cần ISO 8601 có múi giờ.');
  return {name:entry.name,score:entry.score,nights_won:entry.nights_won,achieved_at:entry.achieved_at,seed:entry.seed};
}
export function rankEntries(entries){return entries.map(validateEntry).sort((a,b)=>b.score-a.score||Date.parse(a.achieved_at)-Date.parse(b.achieved_at)).slice(0,10);}
export function addEntry(entries,entry){return rankEntries([...entries,entry]);}
