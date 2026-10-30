/* 가상 페르소나 50명: 베트남인 학습자 25(한국어 목표) + 한국인 학습자 25(베트남어 목표). 사람이 아니라 AI가 만든 시나리오다. */
const {chromium}=require('playwright');const F=process.argv[2];
let seed=+(process.argv[3]||20261031);const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const pick=a=>a[Math.floor(rnd()*a.length)];
const KO_IN={ev:["지난주에 작은 대회에서 이겼어요","어릴 때 아버지와 처음 배웠어요"],th:["계속 하고 싶어요","더 잘하고 싶어요"],rs:["재미있어서요","건강에 좋아서요"]};
const VI_IN={ev:["Tuần trước tôi thắng một giải nhỏ","Hồi nhỏ tôi học cùng bố"],th:["Tôi muốn tiếp tục","Tôi muốn giỏi hơn"],rs:["Vì nó vui","Vì nó tốt cho sức khỏe"]};
const EN_IN={ev:["Last week I won a small match"],th:["I want to keep going"],rs:["because it is fun"]};
const WEIRD=["'\"&<>","<img src=x onerror=alert(1)>","   ","ㅋㅋㅋ","!!!"];
const KO_N=["베트남 하노이 공장 직원","한국어 학원생","K-pop 팬 대학생","간호사","엔지니어","식당 주인","운전기사","주부","IT 개발자","영업 사원","교사","유학 준비생","결혼이주여성","호텔 직원","농업인","디자이너","회계사","물류 담당","미용사","건설 현장 반장","번역가","사업가","학생","은퇴자","프리랜서"];
const VI_N=["하노이 주재원","사업가","여행객","골프 즐기는 은퇴자","베트남어 번역가","공장 관리자","CNC 엔지니어","교민 주부","한국어 교사","유학생","호텔 매니저","무역 담당","통역사","식당 손님","의사","변호사","기자","영업 팀장","현장 소장","연구원","학생","배우자가 베트남인","대학교수","작가","프리랜서"];
const P=[];for(let i=0;i<50;i++){const vn=i<25,lang=vn?"ko":"vi",ui=vn?"vi":"ko";const spk=pick(["virt","virt","real","real","role"]);const kind=pick(["tgt","tgt","other","en","weird","empty"]);
 const pool=kind==="tgt"?(vn?KO_IN:VI_IN):kind==="other"?(vn?VI_IN:KO_IN):kind==="en"?EN_IN:null;const me={};
 if(spk==="real"){if(pool)["ev","th","rs"].forEach(k=>{if(rnd()<.8)me[k]=pick(pool[k]||pool.ev)});if(kind==="weird")me.ev=pick(WEIRD)}
 P.push({i:i+1,name:(vn?"VN:":"KR:")+(vn?KO_N:VI_N)[i%25],lang,ui,spk,kind,me,lv:Math.floor(rnd()*3),sty:pick(["talk","calm","story","insight","D"]),long:rnd()<.5,sel:[pick(["hobby:0","hobby:1","hobby:2","hobby:3","hobby:4"]),pick(["job:0","job:2","home:1","travel:0","exercise:5","food:1","tech:2","friends:0","events:1","shopping:2"])].filter((v,k,a)=>a.indexOf(v)===k),qs:pick([[0],[0,1],[0,1,2,3],[2],[3],[0,1,2,3,4]]),w:pick([320,375,390,1280])})}
(async()=>{const b=await chromium.launch();const iss=[];let cards=0;
for(const p of P){const pg=await (await b.newContext({viewport:{width:p.w,height:844}})).newPage();const errs=[],reqs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:'))reqs.push(r.url())});
 await pg.goto('file://'+F);await pg.waitForTimeout(250);
 const r=await pg.evaluate(p=>{const bad=[];const add=m=>bad.push(m);try{document.getElementById(p.ui==="vi"?"uivi":"uiko").click();
  s.spk=p.spk;s.lang=p.lang;s.lv=p.lv;s.sty=p.sty;s.long=p.long;s.sel=p.sel;s.qs=p.qs;s.me=p.me;s.pers={};s.role={};topicProfiles={};p.sel.forEach(k=>topicProfiles[k]=JSON.parse(JSON.stringify(p.me)));s.itemKey=p.sel[0];draw();
  const HG=/[가-힣]/,VN=/[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;
  const S=buildSets();const cnt=t=>(t.match(/[^\s.,!?。，、;:“”"()]+/g)||[]).length;const L=p.lang;
  S.forEach(x=>{const t=x.a||"";
   if(/undefined|NaN|\$\{|\[object|\{\{/.test(t+x.qt))add("플레이스홀더/undefined: "+x.key+" q"+x.q);
   if(L==="ko"&&VN.test(t.replace(/[a-z0-9\s.,!?'’-]+/gi,"")) )add("한국어 답변에 베트남어 성조 문자: "+x.key+" q"+x.q);
   if(L==="vi"&&HG.test(t))add("베트남어 답변에 한글: "+x.key+" q"+x.q+" "+t.match(/.{0,12}[가-힣]+.{0,8}/)[0]);
   if(L==="vi"&&HG.test(x.qt))add("베트남어 질문에 한글");
   if(L==="ko"&&!/[.?!]$/.test(t.trim()))add("한국어 답변 끝 부호 없음");
   if(L==="vi"&&t&&!/[.?!"”)]$/.test(t.trim()))add("베트남어 답변 끝 부호 없음");
   if(L==="vi"&&!/^[A-ZÀ-Ỹ“"(]/.test(x.qt))add("베트남어 질문 소문자 시작");
   if(x.mode==="virt"&&x.long&&x.q!==4&&p.sty==="talk"){const [lo,hi]=LV[p.lv][L==="ko"?"k":"v"],n=cnt(t);if(n>hi)add("길이 초과 "+n+">"+hi);if(n<lo*0.94)add("길이 미달(6% 초과) "+n+"<"+lo)}
   if(x.S&&x.mode==="virt"&&x.align&&x.S.some(z=>!(z.ko||"").trim()||!(z.vi||"").trim()||!(z.en||"").trim()))add("정렬 누락(문장별 ko/vi/en 중 빈 칸): "+x.key+" q"+x.q);
   if(x.mode==="virt"&&L==="ko"&&x.q!==4&&/(습니다|입니다|합니다)[.?!]/.test(t))add("한국어 합쇼체 혼용");
  });
  const rep=typeof xlReport==="function"?xlReport():null;
  document.querySelectorAll("#model *").forEach(()=>{});
  const ov=document.documentElement.scrollWidth-innerWidth;if(ov>0)add("가로 넘침 "+ov+"px");
  if(p.ui==="vi"){const vis=[...document.querySelectorAll("body *")].filter(e=>!e.closest(".sn,.tgt,.en,.keepko,#pq,#res,#xlnote,.nt,script,style,textarea,td[data-k=ko],#uiko")&&e.children.length===0&&/[가-힣]/.test(e.textContent)).length;if(vis)add("베트남어 UI에 한글 "+vis+"곳")}
  if(document.body.innerHTML.includes("<img src=x"))add("XSS 입력이 HTML로 삽입됨");
  return{bad,n:S.length}}catch(e){return{bad:["오류 "+e.message],n:0}}},p);
 cards+=r.n;const bad=[...new Set(r.bad)];if(errs.length)bad.push("pageerror "+errs[0].slice(0,80));if(reqs.length)bad.push("외부 요청 "+reqs.length);
 if(bad.length)iss.push({i:p.i,name:p.name,spk:p.spk,lang:p.lang,lv:p.lv,sty:p.sty,long:p.long,kind:p.kind,bad:bad.slice(0,5)});await pg.context().close()}
console.log('personas',P.length,'(VN→ko 25, KR→vi 25) cards',cards,'with issues',iss.length);iss.forEach(x=>console.log(JSON.stringify(x).slice(0,400)));await b.close()})();
