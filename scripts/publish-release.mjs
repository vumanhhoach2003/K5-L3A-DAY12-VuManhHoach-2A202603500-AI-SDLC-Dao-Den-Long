import {execFileSync,spawnSync} from 'node:child_process';import {readFileSync,writeFileSync,statSync} from 'node:fs';import {basename,extname} from 'node:path';import {createHash} from 'node:crypto';
try{
 const assets=process.argv.slice(2);if(!assets.length)throw Error('Provide prepared release asset paths.');
 const remote=execFileSync('git',['remote','get-url','origin'],{encoding:'utf8'}).trim(),match=remote.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);if(!match)throw Error('Origin is not a GitHub repository.');const [,owner,repo]=match;
 const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();for(const tag of ['phase-4','v1.0.0'])if(execFileSync('git',['rev-parse',`${tag}^{commit}`],{encoding:'utf8'}).trim()!==commit)throw Error(`${tag} does not match HEAD`);
 let token=process.env.GH_TOKEN??process.env.GITHUB_TOKEN;
 if(!token){const credential=spawnSync('git',['credential','fill'],{input:`protocol=https\nhost=github.com\npath=${owner}/${repo}.git\n\n`,encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0'}});if(credential.status!==0)throw Error('GitHub credential unavailable.');token=credential.stdout.split(/\r?\n/).find(line=>line.startsWith('password='))?.slice(9);}
 if(!token)throw Error('GitHub credential unavailable.');
 const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','User-Agent':'Dao-Den-Long-release'};
 const base=`https://api.github.com/repos/${owner}/${repo}`;
 const metadataResponse=await fetch(base,{headers});if(!metadataResponse.ok)throw Error(`Repository API status${metadataResponse.status}`);if((await metadataResponse.json()).private)throw Error('Repository must be public; not changing visibility automatically.');
 const current=await fetch(base+'/releases/tags/v1.0.0',{headers});let release;
 if(current.ok)release=await current.json();else if(current.status===404){const response=await fetch(base+'/releases',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({tag_name:'v1.0.0',target_commitish:commit,name:'v1.0.0 — Đảo Đèn Lồng: Bình minh',body:readFileSync('docs/release-notes.md','utf8'),draft:false,prerelease:false})});if(!response.ok)throw Error(`Create release API status${response.status}`);release=await response.json();}else throw Error(`Release API status${current.status}`);
 const uploaded=[];for(const path of assets){const name=basename(path),bytes=readFileSync(path),hash=createHash('sha256').update(bytes).digest('hex'),existing=release.assets?.find(a=>a.name===name);if(existing){if(existing.digest===`sha256:${hash}`){uploaded.push(name);continue;}throw Error(`Asset ${name} already exists; refusing to overwrite.`);}
   const types={'.zip':'application/zip','.mp4':'video/mp4','.json':'application/json','.txt':'text/plain'},upload=release.upload_url.replace(/\{.*$/,'')+'?name='+encodeURIComponent(name);const response=await fetch(upload,{method:'POST',headers:{...headers,'Content-Type':types[extname(path)]??'application/octet-stream','Content-Length':String(statSync(path).size)},body:bytes});if(!response.ok)throw Error(`Upload ${name} API status${response.status}`);uploaded.push(name);
 }
 const result={url:release.html_url,tag:'v1.0.0',source_commit:commit,assets:uploaded};writeFileSync('release/publish-result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}catch(error){console.error(error.message);process.exitCode=1;}
