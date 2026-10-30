const {chromium}=require('playwright');const F=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+F);await p.waitForTimeout(300);
const r=await p.evaluate(()=>{document.getElementById('uiko').click();const out=[];
const cnt=t=>(t.match(/[^\s.,!?。，、;:“”"()]+/g)||[]).length;
for(const spk of ['virt'])for(const lg of [false,true])for(const lv of [0,1,2])for(let q=0;q<5;q++){const acc={en:[],ko:[],vi:[]};
 s.spk=spk;s.lv=lv;s.sty='talk';s.long=lg;s.qs=[q];s.sel=[];for(const c of Object.keys(D))D[c].i.forEach((_,j)=>s.sel.push(c+":"+j));
 for(const L of ['en','ko','vi']){s.lang=L;buildSets().forEach(x=>acc[L].push(cnt(x.a)))}
 const m=a=>a.reduce((x,y)=>x+y,0)/a.length,sd=a=>{const u=m(a);return Math.sqrt(m(a.map(v=>(v-u)**2)))};
 out.push({lg,lv,q,n:acc.en.length,en:m(acc.en),ko:m(acc.ko),vi:m(acc.vi),rk:m(acc.ko)/m(acc.en),rv:m(acc.vi)/m(acc.en),cvk:sd(acc.ko)/m(acc.ko),cvv:sd(acc.vi)/m(acc.vi),cve:sd(acc.en)/m(acc.en),vmin:Math.min(...acc.vi),vmax:Math.max(...acc.vi),LVv:LV[lv].v,LVk:LV[lv].k,LVw:LV[lv].w})}
return out});
console.log('long lv q n | en ko vi | ko/en vi/en | CV(en ko vi) | vi min-max | target vi');
r.forEach(x=>console.log(x.lg?'L':'S',x.lv,x.q,x.n,'|',x.en.toFixed(0),x.ko.toFixed(0),x.vi.toFixed(0),'|',x.rk.toFixed(2),x.rv.toFixed(2),'|',x.cve.toFixed(2),x.cvk.toFixed(2),x.cvv.toFixed(2),'|',x.vmin+'-'+x.vmax,'|',JSON.stringify(x.LVv)));
await b.close()})();
