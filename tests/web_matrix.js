const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const R={};
for(const [w,h] of [[320,640],[375,812],[390,844],[768,1024],[1280,800]]){
 const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.argv[2]);await p.waitForTimeout(200);
 const r=await p.evaluate(()=>{const o=[];for(const ui of ["uiko","uivi"])for(const L of ["en","zh","ja","ko","vi"])for(const spk of ["virt","real","role"]){document.getElementById(ui).click();s.lang=L;s.spk=spk;s.lv=2;s.long=true;s.qs=[0,1,2,3,4];s.sel=["hobby:0","hobby:1"];s.me={};s.role={};const t0=performance.now();draw();const dt=performance.now()-t0;
 const ov=document.documentElement.scrollWidth-innerWidth;
 const nolang=[...document.querySelectorAll("#model .sn")].filter(e=>!e.getAttribute("lang")).length;
 o.push([ui,L,spk,Math.round(dt),ov,nolang,document.querySelectorAll('#model .qc').length])}return o});
 R[w]=r;R[w+"_err"]=errs.length;await p.close()}
const all=Object.entries(R).filter(([k])=>!k.endsWith('_err'));
for(const [w,r] of all){const mx=Math.max(...r.map(x=>x[3])),ov=r.filter(x=>x[4]>0).length,nl=r.filter(x=>x[5]>0).length;console.log(w,'draw max ms',mx,'overflow cases',ov,'rows with .sn lacking lang',nl,'/',r.length,'cards',r[0][6],'errs',R[w+"_err"])}
await b.close()})();
