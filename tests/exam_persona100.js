/* 100명 가상 응시자(AI 시뮬레이션)로 모의시험 모드 전체를 돌려 OPIc 진행 규칙·학습 목적 준수 여부 점검 */
const {chromium}=require('playwright');const F=process.argv[2];
let seed=+(process.argv[3]||20261101);const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const pick=a=>a[Math.floor(rnd()*a.length)];
const JOBS=["CNC 엔지니어","공장 관리자","영업 팀장","간호사","대학생","주부","개발자","교사","자영업","취업 준비생","무역 담당","디자이너","은퇴자","공무원","승무원 준비"];
const CATS=["job","home","hobby","exercise","travel","events","food","shopping","tech","friends"];
const P=[];for(let i=0;i<100;i++){const nc=pick([2,3,3,4,5,6]);const cats=[];while(cats.length<nc){const c=pick(CATS);if(!cats.includes(c))cats.push(c)}
 P.push({i:i+1,job:pick(JOBS),lvl:1+Math.floor(rnd()*6),cats,ui:rnd()<.5?"ko":"vi",w:pick([320,375,390,768,1280]),mic:pick(["ok","ok","ok","denied","none"]),tts:pick(["ok","ok","none"]),strict:rnd()<.85,
  beh:pick(["normal","fast","slow","replay2s","replay7s","replayTwice","quit","fulltime"]),dur:pick([8,25,45,70,110,150])})}
(async()=>{const b=await chromium.launch({args:["--use-fake-device-for-media-stream","--use-fake-ui-for-media-stream"]});const iss=[];let tq=0,tc=0;
for(const p of P){const ctx=await b.newContext({viewport:{width:p.w,height:800},permissions:p.mic==="ok"?["microphone"]:[]});const pg=await ctx.newPage();const errs=[],reqs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('request',r=>{if(!/^(file|data|blob):/.test(r.url()))reqs.push(r.url())});pg.on('dialog',d=>{errs.push("DIALOG");d.dismiss()});
 await pg.addInitScript(({mic,tts})=>{window.__spoken=[];if(tts==="ok"){window.SpeechSynthesisUtterance=function(t){this.text=t};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),30)},cancel(){},getVoices(){return[]},resume(){},speaking:false,pending:false,onvoiceschanged:null}})}else{try{delete window.speechSynthesis}catch(e){}try{Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined})}catch(e){}}
  if(mic==="denied"&&navigator.mediaDevices)navigator.mediaDevices.getUserMedia=()=>Promise.reject(Object.assign(new Error("x"),{name:"NotAllowedError"}));if(mic==="none")delete window.MediaRecorder},{mic:p.mic,tts:p.tts});
 await pg.clock.install({time:Date.now()});await pg.goto('file://'+F);await pg.waitForTimeout(250);
 const bad=[];const add=m=>bad.push(m);
 try{await pg.evaluate(ui=>document.getElementById(ui==="vi"?"uivi":"uiko").click(),p.ui);
  await pg.evaluate(p=>{EX.cats=p.cats;EX.lvl=p.lvl;EX.strict=p.strict;renderExam()},p);
  const ov0=await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(ov0>0)add("설정 화면 가로 넘침 "+ov0);
  await pg.click('#exgo');await pg.waitForTimeout(500);await pg.clock.runFor(300);
  const info=await pg.evaluate(()=>({n:EX.qs.length,qs:EX.qs.map(x=>({k:x.key,q:x.q,qt:x.qt,a:x.a,role:!!x.role,un:!!x.unexp})),mic:!!EX.mic,micErr:EX.micErr||""}));
  const n=info.qs.length,exp=p.lvl<=2?12:15;tq+=n;
  if(n!==exp)add(`문항 수 ${n} ≠ ${exp}`);if(info.qs[0].k!=="intro")add("첫 문항이 자기소개 아님");
  if(new Set(info.qs.map(x=>x.qt)).size!==n)add("질문 중복");if(info.qs.some(x=>!x.qt||/undefined|\$\{|\[object|NaN/.test(x.qt)))add("질문 비어있음/깨짐");
  const nonIntro=info.qs.filter(x=>x.k!=="intro"&&!x.un);const sel=nonIntro.filter(x=>p.cats.includes(x.k.split(":")[0])).length;
  if(p.cats.length<10&&sel<nonIntro.length-(p.lvl>=3?1:0))add(`설문에서 고르지 않은 주제 질문 과다(${nonIntro.length-sel})`);
  if(p.lvl>=3&&!info.qs.some(x=>x.role))add("자가진단 3 이상인데 롤플레이 없음");if(p.lvl>=5&&!info.qs.some(x=>x.q===3))add("자가진단 5~6인데 비교 질문 없음");
  if(p.lvl<=2&&info.qs.some(x=>x.role))add("자가진단 1~2인데 롤플레이 출제");
  if(info.qs.some((x,i)=>x.a&&i>=0&&false))add("-");
  if(p.mic==="denied"&&!info.micErr)add("마이크 거부인데 안내 상태 없음");
  const txt0=await pg.evaluate(()=>document.getElementById("exam").innerText);
  if(info.qs.some(x=>x.a&&x.a.length>30&&txt0.includes(x.a.slice(0,30))))add("시험 중 모범답안 노출");
  if(p.tts==="none"&&!(await pg.evaluate(()=>!!document.querySelector("#exam .qq"))))add("TTS 없음인데 질문 글자 미표시");
  if(p.mic==="none"&&!/ghi âm|녹음/.test(txt0))add("-");
  /* 응시 행동 */
  let answered=0,replayOk=0,replayBad=0;const total=p.beh==="quit"?Math.max(2,Math.floor(n/2)):n;
  for(let k=0;k<total;k++){
   await pg.clock.runFor(100);const ph=await pg.evaluate(()=>EX.phase);if(ph!=="answer"){await pg.clock.runFor(8000)}
   if(p.beh.startsWith("replay")&&k<3){const wait=p.beh==="replay7s"?7000:2000;await pg.clock.runFor(wait);const before=await pg.evaluate(()=>EX.rep);const dis=await pg.evaluate(()=>document.getElementById("exrep").disabled);
    if(p.strict){if(p.beh==="replay7s"&&!dis)add("5초 지난 뒤 다시 듣기 가능");if(p.beh!=="replay7s"&&dis)add("5초 안인데 다시 듣기 불가");}
    if(!dis){await pg.click('#exrep',{force:true});await pg.waitForTimeout(80);await pg.clock.runFor(300);replayOk++;
     if(p.beh==="replayTwice"){await pg.clock.runFor(100);const d2=await pg.evaluate(()=>document.getElementById("exrep").disabled);if(p.strict&&!d2){add("다시 듣기 2회째 허용");replayBad++}}}}
   const secs=p.beh==="fast"?3:p.beh==="slow"?200:p.dur;await pg.clock.runFor(secs*1000);
   const left=await pg.evaluate(()=>EX.st);if(left!=="run")break;
   const ph2=await pg.evaluate(()=>EX.phase);if(ph2==="answer"){await pg.click('#exnext');answered++;await pg.waitForTimeout(40)}}
  if(p.beh==="fulltime"){await pg.clock.runFor(41*60*1000)}
  const st0=await pg.evaluate(()=>EX.st);
  if(st0==="run"){await pg.click('#exstop')}
  await pg.waitForTimeout(80);
  const R=await pg.evaluate(()=>({st:EX.st,txt:document.getElementById("exam").innerText,used:EX.used,auto:EX.auto,micOff:EX.mic===null,urls:(EX.recs||[]).filter(r=>r&&r.url).length,durs:(EX.recs||[]).map(r=>r&&r.dur||0),rows:document.querySelectorAll("#exam tbody tr").length,html:document.getElementById("exam").innerHTML}));
  if(R.st!=="review")add("복기 화면으로 안 넘어감: "+R.st);
  if(!/점수나 등급이 아닙니다|không phải điểm hay cấp độ/.test(R.txt))add("복기에 '점수 아님' 고지 없음");
  if(/(?:점수|score)\s*[:：]?\s*\d|등급\s*[:：]?\s*(?:NL|NM|NH|IL|IM|IH|AL)|you (?:are|got) (?:IM|IH|AL)/i.test(R.txt))add("점수·등급을 단정하는 문구");
  if(R.rows!==n)add(`복기 행 수 ${R.rows} ≠ ${n}`);if(!R.micOff)add("종료 후 마이크 해제 안 됨");
  if(p.beh==="fulltime"&&!(R.auto&&R.used>=2399&&R.used<=2402))add("40분 자동 종료 아님 (used "+R.used+")");
  if(p.mic==="ok"&&answered>0&&R.urls<1)add("녹음 가능한데 녹음 파일 없음");if(p.mic!=="ok"&&R.urls>0)add("마이크 없는데 녹음 있음");
  if(p.ui==="vi"&&/[가-힣]/.test(R.txt.replace(/\n/g," ")))add("베트남어 UI에 한글: "+(R.txt.match(/.{0,10}[가-힣]+.{0,6}/)||[""])[0]);
  const ov=await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(ov>0)add("복기 화면 가로 넘침 "+ov+"px");
  if(R.html.includes("<img src=x"))add("XSS");
  /* 복기→연습 연결 */
  const hasPr=await pg.evaluate(()=>!!document.querySelector("[data-pr]:not([disabled])"));if(hasPr){await pg.evaluate(()=>{document.querySelector("[data-pr]:not([disabled])").click()});await pg.waitForTimeout(100);
   const pr=await pg.evaluate(()=>({lang:s.lang,n:SETS.length,q:(document.getElementById("practice")||{}).innerText||""}));if(pr.lang!=="en"||pr.n<1||!/Q1/.test(pr.q))add("복기→연습 연결 실패")}
 }catch(e){add("예외 "+e.message.slice(0,90))}
 tc++;if(errs.length)add("pageerror "+errs[0].slice(0,80));if(reqs.length)add("외부 요청 "+reqs.length);
 if(bad.length)iss.push({i:p.i,job:p.job,lvl:p.lvl,ui:p.ui,w:p.w,mic:p.mic,tts:p.tts,beh:p.beh,strict:p.strict,bad:[...new Set(bad)].slice(0,4)});await ctx.close()}
console.log('personas',tc,'questions',tq,'with issues',iss.length);iss.slice(0,25).forEach(x=>console.log(JSON.stringify(x).slice(0,420)));await b.close()})();
