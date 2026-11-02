/* 승인된 규칙(2026-11-02) 적용 확인: 기본=레벨 목표 분량, 문장 수 8~10/13~16/19~22, 고급 상한 230, 문체 예외 */
const {chromium}=require('playwright');const F=process.argv[2];let fail=0;const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m);if(!c)fail++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+F);await p.waitForTimeout(400);
const d=await p.evaluate(()=>({long:s.long,lenV:s.lenV,chip:[...document.querySelectorAll('#lenc .chip')].map(c=>c.textContent+(c.classList.contains('on')?"*":"")).join("|")}));
ok(d.long===true,"새 사용자 기본 = 레벨 목표 분량 (s.long="+d.long+")");ok(/레벨 목표 분량 \(기본\)\*/.test(d.chip),"분량 칩: "+d.chip);
const R=await p.evaluate(()=>{document.getElementById('uiko').click();s.spk="virt";s.lang="en";s.lv=0;s.long=true;draw();const lvi0=document.getElementById("lvinfo").textContent;
 const unit=(t,L)=>L==="en"?(t.match(/[A-Za-z0-9’']+/g)||[]).length:(L==="ko"||L==="vi")?(t.match(/[^\s.,!?。，、;:“”"()]+/g)||[]).length:[...t.replace(/[\s。！？，、.,!?「」『』（）()…]/g,"")].length;
 const tgt=(lv,L)=>{const x=LV[lv];return L==="en"?x.w:L==="zh"?x.z:L==="ja"?x.j:L==="ko"?x.k:x.v};const SR=[[8,10],[13,16],[19,22]];const o={};
 for(const L of ["en","zh","ja","ko","vi"])for(const lv of [0,1,2]){s.spk="virt";s.lang=L;s.lv=lv;s.sty="talk";s.me={};s.pers={};s.role={};s.qs=[0,1,2,3];s.sel=[];for(const c of Object.keys(D))D[c].i.forEach((_,j)=>s.sel.push(c+":"+j));
  const S=buildSets(),[lo,hi]=tgt(lv,L);const n=S.map(x=>unit(x.a,L)),sc=S.map(x=>x.S.filter(z=>(z[L]||"").trim()).length);
  o[L+lv]={n:S.length,avg:n.reduce((a,v)=>a+v,0)/n.length,inR:n.filter(v=>v>=lo&&v<=hi).length/n.length*100,lo,hi,sIn:sc.filter(v=>v>=SR[lv][0]&&v<=SR[lv][1]).length/sc.length*100,sAvg:sc.reduce((a,v)=>a+v,0)/sc.length}}
 const lvi=lvi0;s.spk="virt";s.lang="en";s.lv=0;s.long=false;draw();const lvs=document.getElementById('lvinfo').textContent,li=document.getElementById('leninfo').textContent;s.long=true;draw();
 return{o,lvi,lvs,li,hi2:LV[2].w[1]}});
for(const [k,v] of Object.entries(R.o))console.log(`  ${k} 목표 ${v.lo}-${v.hi} 평균 ${v.avg.toFixed(1)} 범위안 ${v.inR.toFixed(1)}% · 문장 평균 ${v.sAvg.toFixed(1)} 문장규칙안 ${v.sIn.toFixed(1)}%`);
ok(Object.values(R.o).every(v=>v.inR>=70),"기본 답변(talk) 범위 안 비율 ≥70% (모든 언어·레벨)");
ok(R.o.en0.inR>=95&&R.o.en1.inR>=95&&R.o.en2.inR>=95,"영어 기본 답변 범위 안 ≥95%");
ok(R.o.en0.sIn>=95&&R.o.en1.sIn>=95,"문장 수 새 규칙 초급 8~10·중급 13~16 안 ≥95%");console.log("  참고: 고급 19~22 안 비율 "+R.o.en2.sIn.toFixed(1)+"% (설명형은 18문장)");
ok(R.hi2===230,"고급 상한 230 유지");ok(/짧은 회화: 미적용/.test(R.lvs)&&!/미적용/.test(R.lvi),"짧은 회화 선택 시 '미적용' 표기")
/* 저장된 옛 상태(long:false, lenV 없음) → 1회 이전 */
await p.evaluate(()=>{localStorage.setItem("barron.opic.local.v1",JSON.stringify({version:1,state:Object.assign({},s,{long:false,lenV:undefined}),topics:{},progress:{},draft:""}))});await p.reload();await p.waitForTimeout(400);
ok((await p.evaluate(()=>s.long&&s.lenV===2)),"기존 저장 상태(짧은 답변)도 1회 레벨 목표 분량으로 이전");
await p.evaluate(()=>{s.long=false;persist()});await p.reload();await p.waitForTimeout(400);ok((await p.evaluate(()=>s.long===false)),"이전 후 사용자가 고른 '짧은 회화'는 유지");
/* 모의시험 모범답안도 레벨 분량 */
const ex=await p.evaluate(()=>{EX.cats=["hobby","travel"];EX.lvl=3;const q=exBuild().filter(x=>x.a&&!x.role);return q.map(x=>(x.a.match(/[A-Za-z0-9’']+/g)||[]).length)});
ok(ex.length>0&&ex.every(n=>n>=110),"모의시험 모범답안(자가진단 3=중급) 110단어 이상: "+ex.join(","));
ok(errs.length===0,"오류 0 "+(errs[0]||""));console.log("TOTAL FAIL",fail);await b.close()})();
