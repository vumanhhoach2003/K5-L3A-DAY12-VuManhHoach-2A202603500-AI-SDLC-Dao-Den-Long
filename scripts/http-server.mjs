import {createServer} from 'node:http';import {readFile} from 'node:fs/promises';import {resolve,extname,sep} from 'node:path';
import {readLeaderboard,saveEntry} from './leaderboard-store.mjs';
export async function readJSON(req,limit=1024*1024){let body='';for await(const chunk of req){body+=chunk;if(body.length>limit)throw Error('Payload too large');}return JSON.parse(body);}
export function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
export function createGameServer({root=resolve('dist'),customRoute=null,leaderboardPath}={}){
  const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.png':'image/png','.mp4':'video/mp4'};
  return createServer(async(req,res)=>{
    try{
      const path=new URL(req.url,'http://localhost').pathname;
      if(customRoute&&await customRoute(req,res,path))return;
      if(path==='/api/leaderboard'){
        if(req.method==='GET')json(res,200,{entries:readLeaderboard(leaderboardPath)});
        else if(req.method==='POST'){const body=await readJSON(req,4096);json(res,200,{entries:saveEntry({...body,achieved_at:new Date().toISOString()},leaderboardPath)});}
        else json(res,405,{error:'Method not allowed'});return;
      }
      if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
      const file=resolve(root,'.'+decodeURIComponent(path==='/'?'/index.html':path));
      if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
      const content=await readFile(file);res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[extname(file)]??'application/octet-stream');res.end(req.method==='HEAD'?undefined:content);
    }catch(error){if(error.code==='ENOENT')json(res,404,{error:'Not found'});else json(res,400,{error:error.message});}
  });
}
