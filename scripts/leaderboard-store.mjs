import {readFileSync,mkdirSync,writeFileSync,renameSync,existsSync} from 'node:fs';import {dirname,resolve} from 'node:path';import {addEntry,rankEntries} from '../src/leaderboard.mjs';
export const defaultLeaderboardPath=()=>resolve(process.env.LANTERN_DATA_DIR??'data','leaderboard.json');
export function readLeaderboard(path=defaultLeaderboardPath()){
  if(!existsSync(path))return [];
  const value=JSON.parse(readFileSync(path,'utf8'));if(!Array.isArray(value.entries))throw Error('Tệp bảng xếp hạng không hợp lệ.');return rankEntries(value.entries);
}
export function saveEntry(entry,path=defaultLeaderboardPath()){
  const entries=addEntry(readLeaderboard(path),entry);mkdirSync(dirname(path),{recursive:true});writeFileSync(path+'.tmp',JSON.stringify({entries},null,2)+'\n');renameSync(path+'.tmp',path);return entries;
}
