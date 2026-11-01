/* 학습 습관 대시보드 검증: 연속일·목표·XP·D-day·복습 큐·UI 언어·오류 */
const {chromium}=require('playwright');const F=process.argv[2];let fail=0;const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m);if(!c)fail++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();const errs=[],reqs=[];p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(!/^(file|data|blob):/.test(r.url()))reqs.push(r.url())});
await p.goto('file://'+F);await p.waitForTimeout(300);
const r=await p.evaluate(()=>{HAB.reset();const o={};const dd=n=>{const t=new Date();t.setDate(t.getDate()-n);return HAB.ds(t)};const D=HAB.get();
 o.s0=HAB.streak();HAB.log("rec");o.s1=HAB.streak();o.xp1=HAB.get().xp;
 D.days[dd(1)]={spoke:1,xp:10,act:1};D.days[dd(2)]={spoke:2,xp:20,act:2};o.s3=HAB.streak();
 D.days[dd(4)]={spoke:1,xp:10,act:1};o.sGap=HAB.streak();/* 3일째 비어 있으므로 3 */
 HAB.log("examq",3);o.spoke=HAB.get().days[HAB.ds()].spoke;
 D.exam=dd(-10);const pl=HAB.plan();o.plan=pl;D.exam=dd(1);o.past=HAB.plan();
 HAB.addWeak({key:"hobby:0",q:0,qt:"Tell me about X",lv:1});HAB.addWeak({key:"hobby:0",q:0,qt:"Tell me about X",lv:1});o.weak=HAB.get().weak.length;HAB.dropWeak("hobby:0",0);o.weak2=HAB.get().weak.length;
 HAB.reset();for(let i=0;i<15;i++)HAB.log("listen");o.listenCap=HAB.get().days[HAB.ds()].listen;o.listenXp=HAB.get().xp;
 for(let i=0;i<30;i++)HAB.log("exam");o.badge=Object.keys(HAB.get().badges).join(",");
 document.getElementById("uiko").click();o.ko=document.getElementById("habit").innerText;document.getElementById("uivi").click();o.vi=document.getElementById("habit").innerText;document.getElementById("uiko").click();
 HAB.reset();return o});
ok(r.s0===0&&r.s1===1,`연속일 시작 0→1 (${r.s0}→${r.s1})`);ok(r.xp1===10,"녹음 1회 = 10 XP");ok(r.s3===3,`3일 연속 (${r.s3})`);ok(r.sGap===3,`하루 비면 끊김 (${r.sGap})`);ok(r.spoke===4,`오늘 말하기 합계 4 (${r.spoke})`);
ok(r.plan&&r.plan.L===10&&r.plan.perDay>0,"D-10 계획 계산 "+JSON.stringify(r.plan));ok(r.past&&r.past.L===-1?false:true,"지난 시험일은 계획 없음(null)");ok(r.weak===1&&r.weak2===0,"복습 큐 중복 방지·삭제");
ok(r.listenCap===10&&r.listenXp===10,`듣기 XP 하루 10회 상한 (${r.listenCap}회, ${r.listenXp}XP)`);ok(/첫 모의시험/.test(r.ko)&&/모의시험 3회/.test(r.ko)&&/XP 500/.test(r.ko),"배지 지급");
ok(!/[가-힣]/.test(r.vi),"베트남어 UI에 한글 없음");ok(/점수나 시험 등급이 아닙니다/.test(r.ko),"점수 아님 고지");ok(errs.length===0,"오류 0 "+(errs[0]||""));ok(reqs.length===0,"외부 요청 0");
/* 만족도·추이·ics·백업 왕복 */
const r2=await p.evaluate(()=>{HAB.reset();const D=HAB.get(),dd=n=>{const t=new Date();t.setDate(t.getDate()-n);return HAB.ds(t)};D.days[dd(8)]={spoke:1,xp:1,act:1,rate:2};D.days[dd(9)]={spoke:1,xp:1,act:1,rate:3};HAB.rate(4);const t=HAB.trend();const ics=HAB.ics("21:30");document.getElementById("uiko").click();
 HAB.log("rec");const snap=JSON.stringify(HAB.get());HAB.reset();HAB.set(JSON.parse(snap));return{t,ics,same:JSON.stringify(HAB.get())===snap,txt:document.getElementById("habit").innerText}});
ok(r2.t.cur===4&&r2.t.prev===2.5,"7일 평균 추이 계산 "+JSON.stringify(r2.t));ok(/BEGIN:VCALENDAR/.test(r2.ics)&&/RRULE:FREQ=DAILY/.test(r2.ics)&&/T213000/.test(r2.ics),"ics 형식(매일 반복, 21:30)");ok(r2.same,"기록 복원 왕복 동일");ok(/실력 점수가 아닙니다/.test(r2.txt),"만족도는 실력 점수 아님 고지");
console.log("TOTAL FAIL",fail);await b.close()})();
