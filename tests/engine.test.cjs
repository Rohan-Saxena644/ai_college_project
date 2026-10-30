const assert=require('node:assert/strict');const A=require('../engine.js');
let checks=0;function check(name,fn){fn();checks++;console.log('PASS '+name);}
function valid(m,r){if(!r.found)return;assert.equal(r.path[0],m.start);assert.equal(r.path.at(-1),m.goal);for(let i=1;i<r.path.length;i++){assert.equal(A.heuristic(r.path[i-1],r.path[i]),1);assert(!A.blocked(m,r.path[i]));}assert(Math.abs(r.cost-r.path.slice(1).reduce((s,id)=>s+A.cost(m,id),0))<1e-8);}
check('Open grid BFS has the Manhattan-optimal move count',()=>{const m=A.scenario('open');assert.equal(A.search(m,'bfs').steps,A.heuristic(m.start,m.goal));});
for(const name of ['open','campus','crowded','sealed'])check('Valid paths and A* optimal cost on '+name,()=>{const m=A.scenario(name);for(const alg of ['bfs','dfs','greedy','astar'])valid(m,A.search(m,alg));const a=A.search(m,'astar'),u=A.search(m,'ucs');assert.equal(a.found,u.found);assert.equal(a.cost,u.cost);if(name==='sealed')assert(!a.found);});
check('Bayes posterior is 60% for positive evidence',()=>{const m=A.scenario();m.sensor=true;m.warning=true;assert(Math.abs(A.posterior(m)-.6)<1e-8);assert(A.blocked(m,m.zone[0]));});
check('Negative evidence reduces posterior and reopens zone',()=>{const m=A.scenario();m.sensor=true;m.warning=false;assert(Math.abs(A.posterior(m)-.02857142857142857)<1e-8);assert(!A.blocked(m,m.zone[0]));});
check('Blocking a planned next cell forces a valid alternative',()=>{const m=A.scenario(),a=A.search(m);const next=a.path[1];m.cells[next]=0;const b=A.search(m);assert(b.found);valid(m,b);assert(!b.path.includes(next));});
check('Start at goal returns zero steps and zero cost',()=>{const m=A.scenario();m.goal=m.start;const r=A.search(m);assert.equal(r.steps,0);assert.equal(r.cost,0);});
check('Isolated start reports failure',()=>{const m=A.scenario('open');A.neighbors(m,m.start).forEach(i=>m.cells[i]=0);assert(!A.search(m).found);});
let seed=71;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
check('A* matches uniform-cost oracle on 120 seeded weighted maps',()=>{for(let n=0;n<120;n++){const m=A.scenario('open');m.cells=m.cells.map(()=>{const r=rand();return r<.22?0:r<.42?6:1;});m.cells[m.start]=m.cells[m.goal]=1;m.sensor=n%3===0;m.warning=n%2===0;const a=A.search(m),u=A.search(m,'ucs');assert.equal(a.found,u.found);if(a.found){valid(m,a);assert(Math.abs(a.cost-u.cost)<1e-8);}}});
console.log(checks+' checks passed.');
