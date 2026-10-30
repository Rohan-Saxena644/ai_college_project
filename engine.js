(function(root){
'use strict';
const W=16,H=12,DIR=[[1,0],[0,-1],[0,1],[-1,0]];
const key=(x,y)=>y*W+x;
function scenario(name='campus'){
 const cells=Array(W*H).fill(1);
 if(name!=='open'){
  for(let y=1;y<10;y++) if(y!==3&&y!==8) cells[key(6,y)]=0;
  for(let x=9;x<15;x++) if(x!==12) cells[key(x,5)]=0;
  for(let y=7;y<11;y++) cells[key(11,y)]=0;
  for(let x=2;x<6;x++) cells[key(x,6)]=6;
  for(let x=7;x<11;x++) cells[key(x,8)]=6;
 }
 if(name==='crowded') for(let x=7;x<15;x++) for(let y=1;y<4;y++) cells[key(x,y)]=6;
 if(name==='sealed') for(let y=0;y<H;y++) cells[key(8,y)]=0;
 return {cells,start:key(1,9),goal:key(14,2),zone:[key(8,2),key(8,3),key(8,4),key(8,5)],prior:.15,sensitivity:.85,falsePositive:.10,warning:false,sensor:false,risk:4,threshold:.5};
}
function posterior(m){if(!m.sensor)return m.prior; const a=m.warning?m.sensitivity:1-m.sensitivity,b=m.warning?m.falsePositive:1-m.falsePositive;return a*m.prior/(a*m.prior+b*(1-m.prior));}
function blocked(m,id){return m.cells[id]===0||(m.sensor&&posterior(m)>=m.threshold&&m.zone.includes(id));}
function cost(m,id){return m.cells[id]+(m.zone.includes(id)?m.risk*posterior(m):0);}
function neighbors(m,id){const x=id%W,y=Math.floor(id/W);return DIR.map(([dx,dy])=>[x+dx,y+dy]).filter(([a,b])=>a>=0&&b>=0&&a<W&&b<H).map(([a,b])=>key(a,b)).filter(i=>!blocked(m,i));}
function heuristic(a,b){return Math.abs(a%W-b%W)+Math.abs(Math.floor(a/W)-Math.floor(b/W));}
function search(m,algorithm='astar',start=m.start,goal=m.goal){
 const order=[],parent=new Map(),dist=new Map([[start,0]]),seen=new Set([start]),closed=new Set();let seq=0;
 let frontier=[{id:start,g:0,p:0,seq:seq++}],found=false;
 if(blocked(m,start)||blocked(m,goal))return {algorithm,path:[],expanded:[],steps:null,cost:null,found:false};
 while(frontier.length){
  if(algorithm==='astar'||algorithm==='greedy'||algorithm==='ucs')frontier.sort((a,b)=>a.p-b.p||a.seq-b.seq);
  const cur=algorithm==='dfs'?frontier.pop():frontier.shift();
  if(closed.has(cur.id))continue;
  if((algorithm==='astar'||algorithm==='ucs')&&cur.g!==dist.get(cur.id))continue;
  closed.add(cur.id);order.push(cur.id);
  if(cur.id===goal){found=true;break;}
  let ns=neighbors(m,cur.id);if(algorithm==='dfs')ns=ns.reverse();
  for(const id of ns){
   const g=cur.g+cost(m,id),weighted=algorithm==='astar'||algorithm==='ucs';
   if(weighted?g>=(dist.get(id)??Infinity):seen.has(id))continue;
   if(weighted&&closed.has(id))closed.delete(id);
   seen.add(id);parent.set(id,cur.id);dist.set(id,g);
   const p=algorithm==='astar'?g+heuristic(id,goal):algorithm==='ucs'?g:heuristic(id,goal);
   frontier.push({id,g,p,seq:seq++});
  }
 }
 const path=[];if(found){let v=goal;while(v!==undefined){path.push(v);if(v===start)break;v=parent.get(v);}path.reverse();}
 return {algorithm,path,expanded:order,steps:found?path.length-1:null,cost:found?path.slice(1).reduce((s,id)=>s+cost(m,id),0):null,found};
}
const api={W,H,key,scenario,posterior,blocked,cost,neighbors,heuristic,search};
if(typeof module!=='undefined')module.exports=api;root.CampusAI=api;
})(typeof window!=='undefined'?window:globalThis);
