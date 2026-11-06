/* 최종 배포 전 하네스: 가상 사용자 50명(AI 시뮬레이션, 실제 사람 아님)
   - 기능/옵션 동작, 여러 해상도 UI, 결과물 일관성을 한 번에 점검
   - 사용: node tests/persona50_full.js <index.html 경로> [seed] [JSON 결과 경로] */
const {chromium}=require('playwright');const fs=require('fs');
const F=process.argv[2];let seed=+(process.argv[3]||20261106);const OUT=process.argv[4]||'';
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const pick=a=>a[Math.floor(rnd()*a.length)];
const VP=[[320,640],[360,740],[375,812],[390,844],[414,896],[768,1024],[820,1180],[1024,768],[1280,800],[1366,768],[1440,900],[1920,1080],[2560,1440]];
const JOB=["CNC 엔지니어","공장 관리자","영업 팀장","간호사","대학생","주부","개발자","교사","자영업","취업 준비생","무역 담당","디자이너","은퇴자","공무원","베트남 직원","한국어 학습 베트남인","교민 주재원","초등학부모","OPIc 재응시자","시각 약시(큰 글씨)"];
const CATS=["hobby","exercise","job","home","travel","events","food","shopping","tech","friends"];
const STY=["talk","calm","story","insight","D","crisp","light"];
const P=[];
for(let i=0;i<50;i++){
  const vp=VP[i%VP.length];const ui="ko";const lang="en";/* 배포본은 한국어 화면·영어 학습만 노출(언어 선택·UI 전환은 숨김) */
  const spk=pick(["virt","virt","real","real","role"]);const cats=[pick(CATS),pick(CATS)].filter((v,k,a)=>a.indexOf(v)===k);
  P.push({i:i+1,job:JOB[i%JOB.length],vp,ui,lang,spk,lv:i%3,sty:pick(STY),long:rnd()<.75,dark:rnd()<.3,font:pick([16,16,18,20,24]),
    sel:cats.map(c=>c+":"+(c==="hobby"||c==="exercise"?Math.floor(rnd()*20):Math.floor(rnd()*3))),qs:pick([[0],[0,1],[0,1,2,3],[2,3],[0,1,2,3,4],[4]]),
    me:spk==="real"?pick([{},{tn:"테니스",when:"weekend",place:"park",comp:"friends",rs:"스트레스가 풀려요",ev:"지난주에 작은 대회에서 이겼어요.",th:"계속 하고 싶어요"},{tn:"tennis",rs:"because it is fun",ev:"Last week I won a small match.",when:"weekday"},{tn:"<img src=x onerror=alert(1)>",ev:"'\"&<>"}]):{},
    pers:spk==="virt"&&rnd()<.4?{job:pick(["driver","하노이 유통회사 대표","nurse"]),home:pick(["Hanoi","서울"]),interest:"reading and tennis"}:{},
    act:{popup:rnd()<.5,practice:rnd()<.7,check:rnd()<.6,coach:rnd()<.5,lessons:rnd()<.5,exam:rnd()<.35,habit:rnd()<.5,expand:rnd()<.4,font:rnd()<.3,backup:rnd()<.2},mic:pick(["ok","ok","denied"]),tts:pick(["ok","ok","none"])});
}
(async()=>{const b=await chromium.launch({args:["--use-fake-device-for-media-stream","--use-fake-ui-for-media-stream"]});
const results=[];
const N=+(process.env.N||P.length);
for(const p of P.slice(0,N)){
 const ctx=await b.newContext({viewport:{width:p.vp[0],height:p.vp[1]},colorScheme:p.dark?"dark":"light",permissions:p.mic==="ok"?["microphone"]:[],acceptDownloads:true,hasTouch:p.vp[0]<800,isMobile:p.vp[0]<800});
 const pg=await ctx.newPage();pg.setDefaultTimeout(4000);const errs=[],reqs=[],dialogs=[];
 pg.on('pageerror',e=>errs.push(e.message.slice(0,140)));pg.on('console',m=>{if(m.type()==="error")errs.push("console: "+m.text().slice(0,120))});
 pg.on('request',r=>{if(!/^(file|data|blob):/.test(r.url()))reqs.push(r.url())});pg.on('dialog',d=>{dialogs.push(d.message().slice(0,60));d.dismiss().catch(()=>{})});
 await pg.addInitScript(({tts,mic})=>{window.__spoken=[];
  if(tts==="ok"){window.SpeechSynthesisUtterance=function(t){this.text=t;this.lang="";this.rate=1};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){window.__spoken.push([u.text,u.lang,u.rate]);setTimeout(()=>{u.onstart&&u.onstart();u.onend&&u.onend()},20)},cancel(){},pause(){},resume(){},getVoices(){return[{name:"Google US English",lang:"en-US"},{name:"Google 中文",lang:"zh-CN"},{name:"Google 日本語",lang:"ja-JP"},{name:"Google 한국의",lang:"ko-KR"},{name:"Microsoft HoaiMy Online (Natural)",lang:"vi-VN"}]},speaking:false,pending:false,paused:false,onvoiceschanged:null,addEventListener(){},removeEventListener(){}}})}
  else{try{Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined})}catch(e){}}
  if(mic==="denied"&&navigator.mediaDevices)navigator.mediaDevices.getUserMedia=()=>Promise.reject(Object.assign(new Error("denied"),{name:"NotAllowedError"}))},{tts:p.tts,mic:p.mic});
 const bad=[];const add=(sev,m)=>bad.push([sev,m]);const t0=Date.now();
 try{
  await pg.goto('file://'+F);await pg.waitForTimeout(350);
  /* 1. 설정 적용 (UI 언어는 실제 버튼 클릭) */
  const hid=await pg.evaluate(()=>({uisw:getComputedStyle(document.querySelector(".uisw")).display,lg:getComputedStyle(document.getElementById("lg").parentElement).display,ui:UI,lang:s.lang}));if(hid.uisw!=="none"||hid.lg!=="none")add("M","숨겨야 할 언어 선택이 보임");if(hid.ui!=="ko"||hid.lang!=="en")add("H","시작 상태가 한국어 화면·영어 학습이 아님: "+hid.ui+"/"+hid.lang);
  await pg.evaluate(p=>{s.spk=p.spk;s.lang=p.lang;s.lv=p.lv;s.sty=p.sty;s.long=p.long;s.sel=p.sel;s.qs=p.qs;s.me=JSON.parse(JSON.stringify(p.me));s.pers=p.pers;s.role={};
    try{topicProfiles={};p.sel.forEach(k=>topicProfiles[k]=JSON.parse(JSON.stringify(p.me)));s.itemKey=p.sel[0]}catch(e){}draw()},p);
  await pg.waitForTimeout(80);
  /* 2. 결과물 일관성 */
  const C=await pg.evaluate(p=>{const o={bad:[]};const L=p.lang;const S=buildSets();o.n=S.length;
   const unit=(t)=>L==="en"?(t.match(/[A-Za-z0-9’']+/g)||[]).length:(L==="ko"||L==="vi")?(t.match(/[^\s.,!?。，、;:“”"()]+/g)||[]).length:[...t.replace(/[\s。！？，、.,!?「」『』（）()…]/g,"")].length;
   const tg=L==="en"?LV[p.lv].w:L==="zh"?LV[p.lv].z:L==="ja"?LV[p.lv].j:L==="ko"?LV[p.lv].k:LV[p.lv].v;
   S.forEach(x=>{const id=x.key+"#"+x.q;
    if(/undefined|NaN|\$\{|\[object/.test((x.qt||"")+(x.a||"")))o.bad.push(["H","자리표시/undefined: "+id]);
    if(!x.qt)o.bad.push(["H","질문 없음: "+id]);
    const rows=(x.S||[]).filter(z=>(z[L]||"").trim());
    const seen=new Set();rows.forEach(z=>{const t=z[L].trim();if(seen.has(t)&&x.mode!=="role")o.bad.push(["M","같은 문장 반복: "+id+" "+t.slice(0,40)]);seen.add(t)});
    if(L==="en"&&rows.some(z=>/[가-힣]/.test(z.en)))o.bad.push(["H","영어 답변에 한글: "+id]);
    const tr=p.ui==="vi"?"vi":"ko";if(tr!==L&&x.align&&x.mode==="virt"&&rows.some(z=>!(z[tr]||"").trim()))o.bad.push(["M","해석 누락: "+id]);
    if(x.mode==="virt"&&p.long&&x.q!==4&&p.sty==="talk"){const n=unit(x.a||"");if(n<tg[0]*0.94||n>tg[1])o.bad.push(["M",`분량 범위 밖 ${n} (목표 ${tg[0]}-${tg[1]}) ${id}`])}
    if(x.mode==="real"&&p.me&&p.me.tn==="테니스"&&/office|club|Hanoi|CEO|company/i.test(x.a))o.bad.push(["H","실제 나: 입력 안 한 사실 생성 "+id]);
    if(L==="en")rows.forEach(z=>{const w=unit(z.en);if(w>25)o.bad.push(["L",`25단어 초과 문장(${w}) ${id}`])});
   });
   /* 화면에 그려진 카드 수와 내부 세트 수 */
   o.cards=document.querySelectorAll('#model>.qc').length;if(o.cards!==S.length)o.bad.push(["M",`카드 수 ${o.cards} ≠ 세트 ${S.length}`]);
   if(document.body.innerHTML.includes('<img src=x'))o.bad.push(["H","XSS: 입력이 HTML로 삽입됨"]);
   return o},p);
  C.bad.forEach(x=>add(x[0],x[1]));
  /* 3. 팝업 (실제 클릭) */
  if(p.act.popup){for(const id of ["#openA","#openB"]){if(!(await pg.$(id)))continue;await pg.click(id);await pg.waitForTimeout(60);
    const m=await pg.evaluate(()=>{const md=document.getElementById("modal");return{open:md&&!md.hidden&&getComputedStyle(md).display!=="none",focusIn:md&&md.contains(document.activeElement),ov:document.documentElement.scrollWidth-innerWidth,fit:md?(()=>{const r=(md.querySelector('.mbox,.sheet,[role=dialog]')||md).getBoundingClientRect();return r.right<=innerWidth+1&&r.left>=-1})():true}});
    if(!m.open)add("H","팝업이 열리지 않음 "+id);else{if(!m.focusIn)add("L","팝업 열림 후 포커스가 팝업 밖 "+id);if(!m.fit)add("M","팝업이 화면 밖으로 넘침 "+id)}
    await pg.keyboard.press("Escape");await pg.waitForTimeout(40);const closed=await pg.evaluate(()=>{const md=document.getElementById("modal");return!md||md.hidden||getComputedStyle(md).display==="none"});if(!closed)add("M","Esc로 팝업이 안 닫힘 "+id)}}
  /* 4. 말하기 연습 */
  if(p.act.practice){const r=await pg.evaluate(async()=>{const o={};const c=id=>{const e=document.getElementById(id);if(e&&!e.disabled){e.click();return true}return false};
    o.q=c("pq1");await new Promise(r=>setTimeout(r,60));o.sp=window.__spoken.length;o.var=c("pvar");o.fu=c("pfu");o.next=c("pnext");o.prev=c("pprev");
    o.rec=c("recbtn");await new Promise(r=>setTimeout(r,500));o.stop=c("recstop");await new Promise(r=>setTimeout(r,300));o.msg=(document.getElementById("recmsg")||{}).innerText||"";o.audio=!!(document.getElementById("recaudio")||{}).src;return o});
   if(p.tts==="ok"&&r.q&&r.sp<1)add("M","질문 듣기를 눌렀는데 음성 요청 없음");
   if(p.mic==="ok"&&r.rec&&!r.audio)add("M","마이크 허용인데 녹음 결과 없음");
   if(p.mic==="denied"&&r.rec&&!/권한|quyền|허용|micro|마이크/i.test(r.msg))add("M","마이크 거부 안내 없음: "+r.msg.slice(0,60))}
  /* 5. 첨삭 */
  if(p.act.check){await pg.evaluate(()=>{const m=document.getElementById("mine");if(m)m.value="I likes tennis. I play it yesterday. It make me happy.";});
   const ln=await pg.evaluate(()=>s.lang);if(ln==="en"){await pg.click("#chk");await pg.waitForTimeout(60);const t=await pg.evaluate(()=>document.getElementById("res").innerText);
    if(!/I like/.test(t)||!/played/.test(t)||!/makes/.test(t))add("H","첨삭: 예문 3개 오류 중 일부 미검출");if(/오류가 없습니다|문법이 맞습니다|không có lỗi/i.test(t))add("H","첨삭: '오류 없음' 단정")}}
  /* 6. 확장 연습 */
  if(p.act.expand&&await pg.$("#alin")){await pg.fill("#alin","I like tennis.").catch(e=>add("M","확장 연습 입력칸 사용 불가"));if(await pg.$("#alrun")){await pg.click("#alrun").catch(e=>add("M","확장 연습 실행 버튼 클릭 불가"));await pg.waitForTimeout(50);const t=await pg.evaluate(()=>(document.getElementById("alout")||{}).innerText||"");if(t.trim().length<10)add("M","확장 연습 결과 없음")}}
  /* 7. 발음 코치 */
  if(p.act.coach&&await pg.$("#coach-all")){await pg.evaluate(()=>{window.__spoken=[]});await pg.click("#coach-all").catch(e=>add("M","코치 전체 듣기 클릭 실패"));await pg.waitForTimeout(150);
   const n=await pg.evaluate(()=>window.__spoken.length);if(p.tts==="ok"&&n<1)add("M","발음 코치: 재생 요청 없음");await pg.click("#coach-stop").catch(e=>add("M","코치 정지 버튼 클릭 불가"));
   await pg.selectOption("#coach-rate","0.7").catch(()=>add("L","코치 속도 선택 실패"))}
  /* 8. 1·2회차 수업 */
  if(p.act.lessons&&await pg.$("#classic-lessons")){await pg.evaluate(()=>{document.getElementById("classic-lessons").open=true});await pg.waitForTimeout(60);
   const L1=await pg.evaluate(()=>document.getElementById("lesson-content").innerText.length);if(L1<100)add("H","1·2회차 수업 내용이 비어 있음");
   const tabs=await pg.$$("#classic-lessons .lesson-tab");if(tabs.length>1){await tabs[1].click();await pg.waitForTimeout(60);const L2=await pg.evaluate(()=>document.getElementById("lesson-content").innerText.slice(0,80));if(!L2)add("M","2회차 탭 전환 후 내용 없음")}
   await pg.click("#show-meaning").catch(e=>add("M","한국어 뜻 보기 토글 클릭 불가"));await pg.waitForTimeout(40);
   const btn=await pg.$("#lesson-content button");if(btn){await pg.evaluate(()=>{window.__spoken=[]});await btn.click().catch(e=>add("M","수업 재생 버튼 클릭 불가"));await pg.waitForTimeout(120);if(p.tts==="ok"&&!(await pg.evaluate(()=>window.__spoken.length)))add("L","수업 첫 버튼 눌러도 음성 요청 없음")}}
  /* 9. 모의시험 */
  if(p.act.exam&&await pg.$("#exam")){const r=await pg.evaluate(async()=>{EX.cats=["hobby","travel"];EX.lvl=3;renderExam();document.getElementById("exgo").click();await new Promise(r=>setTimeout(r,900));const o={st:EX.st,n:EX.qs.length};const nx=document.getElementById("exnext");if(nx&&!nx.disabled)nx.click();await new Promise(r=>setTimeout(r,300));document.getElementById("exstop")&&document.getElementById("exstop").click();await new Promise(r=>setTimeout(r,300));o.st2=EX.st;o.rows=document.querySelectorAll("#exam tbody tr").length;o.txt=document.getElementById("exam").innerText;return o});
   if(r.n!==15)add("H","모의시험 문항 수 "+r.n+" (자가진단3 → 15 기대)");if(r.st2!=="review")add("H","모의시험 종료 후 복기 화면 아님: "+r.st2);if(r.rows!==r.n)add("M","복기 행 수 불일치");if(!/점수나 등급이 아닙니다|không phải điểm/.test(r.txt))add("M","복기 '점수 아님' 고지 없음")}
  /* 10. 학습 습관 */
  if(p.act.habit&&await pg.$("#hgoal")){await pg.selectOption("#hgoal","5").catch(()=>add("L","목표 선택 실패"));const rb=await pg.$("#habit [data-rt='4']");if(rb){await rb.click();await pg.waitForTimeout(40)}
   const h=await pg.evaluate(()=>({goal:HAB.get().goal,rate:(HAB.get().days[HAB.ds()]||{}).rate}));if(h.goal!==5)add("M","습관 목표 저장 안 됨");if(rb&&h.rate!==4)add("M","만족도 저장 안 됨")}
  /* 11. 글자 크기 */
  if(p.act.font){const f0=await pg.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).fontSize));const up=pg.locator('[data-font=up]:visible').first();if(await up.count()){for(let k=0;k<4;k++){if(await up.isDisabled())break;await up.click().catch(e=>add("L","글자 크게 버튼 클릭 불가"))};const f1=await pg.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).fontSize));if(!(f1>f0))add("M","글자 크게 눌러도 크기 변화 없음 "+f0+"→"+f1)}else add("L","보이는 글자 크기 버튼 없음");await pg.waitForTimeout(60)}
  /* 12. 백업 내보내기 */
  if(p.act.backup&&await pg.$("#exportLocal")){try{const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:3000}),pg.click("#exportLocal")]);const v=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));if(!v.state)add("M","백업 파일에 state 없음")}catch(e){add("M","백업 내보내기 실패 "+e.message.slice(0,40))}}
  /* 13. 레이아웃 (현재 해상도, 모든 상호작용 이후) */
  await pg.evaluate(()=>{const d=document.getElementById("classic-lessons");if(d)d.open=true;document.querySelectorAll("#model details").forEach((x,i)=>{if(i<3)x.open=true})});await pg.waitForTimeout(80);
  const Lr=await pg.evaluate(isMobile=>{const o={};o.ov=document.documentElement.scrollWidth-innerWidth;
   const inScroll=e=>{for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const cs=getComputedStyle(a);if(/(auto|scroll)/.test(cs.overflowX))return true}return false};
   const vis=e=>{const r=e.getBoundingClientRect();if(r.width===0||r.height===0)return false;for(let a=e;a;a=a.parentElement){if(a.tagName==="DETAILS"&&!a.open&&!a.contains(document.activeElement)){const sm=a.querySelector("summary");if(!(sm&&sm.contains(e)))return false}const cs=getComputedStyle(a);if(cs.display==="none"||cs.visibility==="hidden")return false}return true};
   const outs=[];document.querySelectorAll("body *").forEach(e=>{if(!vis(e)||inScroll(e))return;const r=e.getBoundingClientRect();if(r.right>innerWidth+2&&e.children.length===0&&e.textContent.trim())outs.push((e.id||e.className||e.tagName)+":"+e.textContent.trim().slice(0,24))});o.outs=outs.slice(0,6);o.nOut=outs.length;
   const clip=[];document.querySelectorAll("body *").forEach(e=>{if(!vis(e))return;const cs=getComputedStyle(e);if(/(hidden|clip)/.test(cs.overflowX)&&e.scrollWidth>e.clientWidth+2&&e.textContent.trim()&&!/ellipsis/.test(cs.textOverflow)&&!inScroll(e)&&e.tagName!=="SELECT"&&!e.classList.contains("hero"))clip.push((e.id||e.className||e.tagName).toString().slice(0,30))});o.clip=clip.slice(0,6);o.nClip=clip.length;
   const small=[];if(isMobile)document.querySelectorAll("button,select,a[href],input[type=checkbox],input[type=radio],summary,.chip").forEach(e=>{if(!vis(e)||e.closest("label"))return;const r=e.getBoundingClientRect();if((r.height<32||r.width<32)&&!e.closest(".sn"))small.push((e.id||e.className||e.tagName)+":"+(e.textContent||"").trim().slice(0,12)+"("+Math.round(r.width)+"x"+Math.round(r.height)+")")});o.small=small.slice(0,6);o.nSmall=small.length;
   const noName=[];document.querySelectorAll("button,select,input:not([type=hidden]),textarea").forEach(e=>{if(!vis(e))return;const n=(e.getAttribute("aria-label")||e.textContent||e.title||(e.labels&&e.labels[0]&&e.labels[0].textContent)||e.placeholder||"").trim();if(!n)noName.push(e.id||e.className||e.tagName)});o.noName=noName.slice(0,6);o.nNoName=noName.length;
   /* 대비: 보이는 텍스트 요소 표본 */
   const lum=c=>{const m=c.match(/[\d.]+/g);if(!m)return null;const [r,g,b]=m.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
   const bgOf=e=>{for(let a=e;a;a=a.parentElement){const c=getComputedStyle(a).backgroundColor;const m=c.match(/[\d.]+/g);if(m&&(m.length<4||+m[3]>0.5))return c}return "rgb(255,255,255)"};
   const low=[];let cnt=0;for(const e of document.querySelectorAll("p,span,b,td,th,li,label,button,h1,h2,h3,summary,div")){if(cnt>600)break;if(!vis(e)||!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim()))continue;cnt++;const cs=getComputedStyle(e);if(+cs.opacity<0.5)continue;const a=lum(cs.color),bb=lum(bgOf(e));if(a===null||bb===null)continue;const cr=(Math.max(a,bb)+.05)/(Math.min(a,bb)+.05);const big=parseFloat(cs.fontSize)>=18.6||(parseFloat(cs.fontSize)>=14&&+cs.fontWeight>=700);if(cr<(big?3:4.5))low.push((e.id||e.className||e.tagName).toString().slice(0,24)+":"+cr.toFixed(2)+":"+e.textContent.trim().slice(0,16))}o.low=low.slice(0,6);o.nLow=low.length;
   /* 화면 언어 누수 */
   o.leak=[];if(document.getElementById("uivi").classList.contains("on")||document.documentElement.lang==="vi"){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const e=n.parentElement;if(/[가-힣]/.test(n.nodeValue)&&vis(e)&&!e.closest("script,style,textarea,#uiko,.sn,.tgt,.en,.keepko,td[data-k=ko],#pq,#res,#xlnote,.nt,option"))o.leak.push(n.nodeValue.trim().slice(0,30))}o.leak=[...new Set(o.leak)]}
   o.lang=document.documentElement.lang;o.dupIds=(()=>{const m={};document.querySelectorAll("[id]").forEach(e=>m[e.id]=(m[e.id]||0)+1);return Object.keys(m).filter(k=>m[k]>1)})();
   return o},p.vp[0]<800);
  if(Lr.ov>0)add("H",`가로 스크롤 ${Lr.ov}px`);if(Lr.nOut)add("M",`화면 밖으로 나간 글자 ${Lr.nOut}곳: ${Lr.outs.join(" | ")}`);if(Lr.nClip)add("M",`잘린 글자 ${Lr.nClip}곳: ${Lr.clip.join(" | ")}`);
  if(Lr.nSmall)add("L",`작은 터치 영역(<32px) ${Lr.nSmall}개: ${Lr.small.join(" | ")}`);if(Lr.nNoName)add("L",`이름 없는 입력/버튼 ${Lr.nNoName}개: ${Lr.noName.join(",")}`);
  if(Lr.nLow)add(p.dark?"M":"L",`낮은 글자 대비 ${Lr.nLow}곳(${p.dark?"다크":"라이트"}): ${Lr.low.join(" | ")}`);if(Lr.leak.length)add("M",`베트남어 화면에 한글 ${Lr.leak.length}종: ${Lr.leak.slice(0,4).join(" | ")}`);
  if(Lr.dupIds.length)add("M","중복 id: "+Lr.dupIds.join(","));
  /* 14. TTS 언어 코드 일관성 */
  const sp=await pg.evaluate(()=>window.__spoken||[]);const want={en:"en-US",zh:"zh-CN",ja:"ja-JP",ko:"ko-KR",vi:"vi-VN"}[p.lang];
  const wrong=sp.filter(x=>x[1]&&!/^en|^zh|^ja|^ko|^vi/.test(x[1]));if(wrong.length)add("L","알 수 없는 음성 언어 코드 "+wrong[0][1]);
 }catch(e){add("H","예외: "+e.message.slice(0,120))}
 errs.forEach(e=>add("H","페이지 오류: "+e));if(reqs.length)add("H","외부 요청 "+reqs.length+"건: "+reqs[0].slice(0,60));if(dialogs.length)add("L","브라우저 대화상자 "+dialogs.length+"건: "+dialogs[0]);
 console.error(`#${p.i} ${p.vp.join('x')} ${p.ui}/${p.lang}/${p.spk} ${Date.now()-t0}ms issues=${bad.length}`);
 results.push({i:p.i,job:p.job,vp:p.vp.join("x"),ui:p.ui,lang:p.lang,spk:p.spk,lv:p.lv,sty:p.sty,long:p.long,dark:p.dark,mic:p.mic,tts:p.tts,ms:Date.now()-t0,bad});
 await ctx.close()}
await b.close();
const sev={H:0,M:0,L:0};const kinds={};results.forEach(r=>r.bad.forEach(([s,m])=>{sev[s]++;const k=s+" "+m.replace(/[0-9]+/g,"#").replace(/:.*$/,"").slice(0,50);kinds[k]=(kinds[k]||0)+1}));
console.log(`personas ${results.length} · 문제 있는 페르소나 ${results.filter(r=>r.bad.length).length} · 심각도 H ${sev.H} / M ${sev.M} / L ${sev.L}`);
Object.entries(kinds).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(`  ${v}×  ${k}`));
if(OUT)fs.writeFileSync(OUT,JSON.stringify({P,results},null,1));
})();
