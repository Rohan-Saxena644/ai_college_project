const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Element{constructor(){this.children=[];this.checked=false;this.value='';this.disabled=false;this.classList={add(){},toggle(){}};this.dataset={};this.style={};}setAttribute(){}replaceChildren(){this.children=[];}appendChild(e){this.children.push(e);}prepend(e){this.children.unshift(e);}get lastChild(){const a=this.children;return{remove(){a.pop();}};}}
const elements=new Map();const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};get('algorithm').value='astar';get('scenario').value='campus';get('speed').value='50';
const tools=['wall','mud','erase','start','goal'].map(t=>{const e=new Element();e.dataset.tool=t;return e;}),stages=Array.from({length:3},()=>new Element());
let clock=0,jobs=new Map();const ctx={console,document:{getElementById:get,createElement:()=>new Element(),querySelectorAll:s=>s==='#tools button'?tools:stages},setTimeout:f=>{jobs.set(++clock,f);return clock;},clearTimeout:id=>jobs.delete(id)};ctx.window=ctx;vm.createContext(ctx);
for(const file of ['engine.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../'+file,'utf8'),ctx);
function drain(){let n=0;while(jobs.size){if(++n>1000)throw Error('Mission timer loop');const [id,f]=jobs.entries().next().value;jobs.delete(id);f();}}
get('compare').onclick();assert.equal(get('results').children.length,4);
get('run').onclick();assert.equal(get('plan').disabled,true);get('pause').onclick();assert.equal(get('pause').textContent,'Resume');get('pause').onclick();drain();assert.equal(get('badge').textContent,'Mission complete');assert.equal(get('plan').disabled,false);
get('reset').onclick();get('run').onclick();get('inject').onclick();drain();assert.equal(get('badge').textContent,'Mission complete');
get('sensor').checked=true;get('warning').checked=true;get('sensor').onchange();assert.equal(get('posterior').textContent,'60.0%');get('warning').checked=false;get('warning').onchange();assert.equal(get('posterior').textContent,'2.9%');
get('scenario').value='sealed';get('scenario').onchange();get('run').onclick();assert.equal(get('badge').textContent,'No route available');
get('scenario').value='campus';get('scenario').onchange();get('run').onclick();get('reset').onclick();drain();assert.equal(get('badge').textContent,'Ready to plan');
console.log('PASS Controller smoke checks: comparison, delivery/return, pause/resume, disruption/replan, sensor evidence, failure and reset cancellation.');
