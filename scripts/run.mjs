import {writeFileSync} from 'node:fs';import {readLeaderboard} from './leaderboard-store.mjs';import {createGameServer} from './http-server.mjs';
try{
  const args=process.argv.slice(2);
  if(args[0]==='--export-leaderboard'&&args.length===2){writeFileSync(args[1],JSON.stringify({entries:readLeaderboard()},null,2)+'\n');console.log(`Exported leaderboard: ${args[1]}`);}
  else if(args.length===0){const server=createGameServer();server.on('error',e=>{console.error(e.message);process.exitCode=1;});server.listen(Number(process.env.PORT??4173),'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}/`));}
  else throw Error('Usage: node scripts/run.mjs [--export-leaderboard out.json]');
}catch(error){console.error(error.message);process.exitCode=1;}
