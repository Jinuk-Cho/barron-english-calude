/* 모의시험 모드 동작 검증: 구성·재생 제한·시간 제한·모범답안 숨김·복기 */
const {chromium}=require('playwright');const F=process.argv[2];let fail=0;const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m);if(!c)fail++};
(async()=>{const b=await chromium.launch({args:["--use-fake-device-for-media-stream","--use-fake-ui-for-media-stream"]});
for(const [lvl,exp] of [[1,12],[2,12],[3,15],[4,15],[5,15],[6,15]]){
 const ctx=await b.newContext({permissions:["microphone"]});const p=await ctx.newPage();const errs=[],reqs=[];p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(!/^(file|data|blob):/.test(r.url()))reqs.push(r.url())});
 await p.addInitScript(()=>{window.__spoken=[];const real=window.speechSynthesis;window.SpeechSynthesisUtterance=function(t){this.text=t};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),50)},cancel(){},getVoices(){return[]},resume(){},speaking:false,pending:false,onvoiceschanged:null}})});
 await p.clock.install({time:Date.now()});await p.goto('file://'+F);await p.waitForTimeout(300);
 await p.evaluate(()=>{document.getElementById("uiko").click()});
 const st=await p.evaluate(({lvl})=>{EX.cats=["job","hobby","travel"];EX.lvl=lvl;renderExam();const qs=exBuild();return{n:qs.length,types:qs.map(x=>x.key==="intro"?"I":x.role?"R":x.unexp?"U":x.q).join(""),leak:qs.filter(x=>/undefined|\$\{|\[object/.test(x.qt)).length,empty:qs.filter(x=>!x.qt).length,dup:qs.length-new Set(qs.map(x=>x.qt)).size}},{lvl});
 ok(st.n===exp,`자가진단 ${lvl}: ${st.n}문항 (기대 ${exp}) 구성=${st.types}`);ok(st.leak===0&&st.empty===0,`자가진단 ${lvl}: 질문 비어있음/깨짐 0`);ok(st.dup===0,`자가진단 ${lvl}: 질문 중복 0 (중복 ${st.dup})`);
 if(lvl===3){
  await p.click('#exgo');await p.waitForTimeout(600);await p.clock.runFor(200);
  const a=await p.evaluate(()=>({st:EX.st,ph:EX.phase,n:EX.qs.length,txt:document.getElementById("exam").innerText,ans:EX.qs.some(x=>x.a&&document.getElementById("exam").innerText.includes(x.a.slice(0,30))),spoken:window.__spoken.length}));
  ok(a.st==="run"&&a.ph==="answer","시작 후 답변 단계 진입");ok(!a.ans,"시험 중 모범답안 미노출");ok(a.spoken===1,"질문 음성 재생 1회 (실측 "+a.spoken+")");
  ok(!(await p.evaluate(()=>document.getElementById("exam").querySelector(".qq"))),"질문 글자 기본 숨김(음성 있을 때)");
  /* 다시 듣기: 5초 안 1회 */
  await p.click('#exrep');await p.waitForTimeout(100);await p.clock.runFor(200);let r=await p.evaluate(()=>({rep:EX.rep,dis:document.getElementById("exrep").disabled,spoken:window.__spoken.length}));
  ok(r.rep===1&&r.spoken===2,"다시 듣기 1회 동작 (rep "+r.rep+", spoken "+r.spoken+")");ok(r.dis,"다시 듣기 후 버튼 비활성(2회째 불가)");
  /* 5초 경과 시 불가 */
  await p.click('#exnext');await p.clock.runFor(200);await p.clock.runFor(6000);let r2=await p.evaluate(()=>document.getElementById("exrep").disabled);ok(r2,"질문 후 5초가 지나면 다시 듣기 비활성");
  /* 40분 자동 종료 */
  await p.clock.runFor(40*60*1000);const e=await p.evaluate(()=>({st:EX.st,auto:EX.auto,txt:document.getElementById("exam").innerText,used:EX.used}));
  ok(e.st==="review"&&e.auto,"40분 경과 시 자동 종료");ok(/복기/.test(e.txt),"복기 화면 표시");ok(/점수나 등급이 아닙니다/.test(e.txt),"복기에 '점수 아님' 고지");ok(e.used>=2399&&e.used<=2410,"사용 시간 약 40분 ("+e.used+"초)");
  const mic=await p.evaluate(()=>EX.mic===null);ok(mic,"종료 후 마이크 스트림 해제");
  /* 베트남어 UI */
  await p.evaluate(()=>{document.getElementById("uivi").click();EX.st="idle";renderExam()});const v=await p.evaluate(()=>document.getElementById("exam").innerText);ok(!/[가-힣]/.test(v),"베트남어 UI에 한글 없음");
  await p.evaluate(()=>{document.getElementById("uiko").click()});
 }
 ok(errs.length===0,`자가진단 ${lvl}: 오류 0`+(errs[0]?" "+errs[0]:""));ok(reqs.length===0,`자가진단 ${lvl}: 외부 요청 0`);await ctx.close()}
console.log("TOTAL FAIL",fail);await b.close()})();
