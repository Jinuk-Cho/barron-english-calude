const {chromium}=require('playwright');const F=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+F);await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const o={};document.getElementById("uiko").click();
 for(const L of ["en","zh","ja","ko","vi"]){s.lang=L;s.spk="virt";draw();const e=[...document.querySelectorAll('#model .sn')];o[L]=e.length+" .sn, lang="+[...new Set(e.map(x=>x.lang))].join(",")}
 s.lang="vi";s.spk="real";s.me={ev:"Hôm qua tôi chơi tennis"};draw();
 const keys=Object.keys(localStorage);o.keys=keys.join(",");
 return o});console.log(JSON.stringify(r));
// 새로고침 후 언어 유지
await p.evaluate(()=>{s.lang="ko";draw()});await p.waitForTimeout(1200);await p.reload();await p.waitForTimeout(500);
console.log('reload lang=',await p.evaluate(()=>s.lang),'errs',errs.length);await b.close()})();
