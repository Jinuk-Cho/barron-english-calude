const {chromium}=require('playwright');const F=process.argv[2];
// 결정적 난수
let seed=20261030;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const pick=a=>a[Math.floor(rnd()*a.length)];
const KO_EV=["지난주에 작은 대회에서 이겼어요","어릴 때 아버지와 처음 배웠어요","작년에 부상을 당했지만 회복했어요","친구와 처음 만난 날이 기억나요"];
const KO_TH=["계속 하고 싶어요","더 잘하고 싶어요","저에게 큰 힘이 돼요","평생 함께하고 싶어요"];
const KO_RS=["스트레스가 풀려요","건강해지려고","재미있어서","마음이 맑아져요","사람들을 만날 수 있어서"];
const VI_EV=["Tuần trước tôi thắng một giải nhỏ","Hồi nhỏ tôi học cùng bố","Năm ngoái tôi bị thương nhưng đã hồi phục"];
const VI_TH=["Tôi muốn tiếp tục","Tôi muốn giỏi hơn","Nó giúp tôi rất nhiều"];
const VI_RS=["Giải tỏa căng thẳng","Để khỏe mạnh hơn","Vì vui","Giúp tôi gặp gỡ nhiều người"];
const EN=["Last week I won a small match.","I want to keep going.","because it is fun","It keeps me healthy."];
const WEIRD=["<img src=x onerror=alert(1)>","😀😀😀","'\"&<>","   ","x".repeat(400),"???","1234567"];
const TNS=["테니스","독서","등산","요리","Tennis","quần vợt","đọc sách","수영","Hiking",""];
const PERS={job:["간호사","개발자","운전기사","교사","y tá","giáo viên","a nurse","CEO","우주비행사"],home:["부산","하노이","Hà Nội","Seoul","서울 강남구",""],interest:["독서","테니스","nấu ăn","hiking","낚시"],life:["바쁘지만 규칙적","bận rộn","busy but regular",""],trait:["차분함","điềm tĩnh","calm","꼼꼼하고 느긋함"]};
const CHO={when:["weekend","morning","evening","weekday",""],place:["home","park","gym",""],comp:["friends","family","alone",""],freq:["daily","weekly","monthly",""],ft:["happy","nervous","proud",""],fn:["happy","calm",""]};
const STY=["talk","calm","story","insight","D","crisp","light"];
const P=[];for(let i=0;i<100;i++){const spk=i<34?"virt":i<84?"real":"role";const lang=["en","zh","ja"][i%3];const ui=i%2?"vi":"ko";const lv=Math.floor(rnd()*3);
 const kind=pick(["ko","vi","en","mix","weird","empty"]);const pool=kind==="ko"?{ev:KO_EV,th:KO_TH,rs:KO_RS,past:KO_TH,now:KO_TH}:kind==="vi"?{ev:VI_EV,th:VI_TH,rs:VI_RS,past:VI_TH,now:VI_TH}:kind==="en"?{ev:EN,th:EN,rs:EN,past:EN,now:EN}:kind==="weird"?{ev:WEIRD,th:WEIRD,rs:WEIRD,past:WEIRD,now:WEIRD}:kind==="mix"?{ev:[...KO_EV,...VI_EV],th:[...KO_TH,...EN],rs:[...KO_RS,...VI_RS],past:KO_TH,now:VI_TH}:null;
 const me={};if(pool&&spk==="real"){["ev","th","rs","past","now"].forEach(k=>{if(rnd()<.7)me[k]=pick(pool[k])});me.tn=pick(TNS);me.ta=pick(TNS);for(const k in CHO)if(rnd()<.6)me[k]=pick(CHO[k])}
 const pers={};if(spk==="virt"&&rnd()<.7)for(const k in PERS)if(rnd()<.7)pers[k]=pick(PERS[k]);
 const cats=["hobby:0","hobby:1","hobby:2","hobby:3","hobby:4"];const sel=[pick(cats)];if(rnd()<.4)sel.push(pick(cats));
 P.push({i:i+1,spk,lang,ui,lv,kind,me,pers,sty:pick(STY),long:rnd()<.35,sel:[...new Set(sel)],qs:pick([[0],[0,1],[0,1,2,3],[2],[3]])})}
(async()=>{const b=await chromium.launch();const iss=[];let n=0;
for(const p of P){const ctx=await b.newContext({viewport:{width:p.i%4?1280:375,height:900}});const pg=await ctx.newPage();const errs=[],reqs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});pg.on('request',r=>{if(!/^(file|blob|data):/.test(r.url()))reqs.push(r.url())});
 await pg.goto('file://'+F);await pg.waitForTimeout(150);
 const r=await pg.evaluate(p=>{try{document.getElementById(p.ui==="vi"?"uivi":"uiko").click();s.spk=p.spk;s.lang=p.lang;s.lv=p.lv;s.me=p.me;s.pers=p.pers;s.sty=p.sty;s.long=p.long;s.sel=p.sel;s.qs=p.qs;s.role={};draw();
  const out={cards:[],rep:xlReport()};
  document.querySelectorAll('#model .qc').forEach(c=>{const rows=[...c.querySelectorAll('table.st tbody tr, table.st tr')].filter(tr=>tr.querySelector('td'));
   const cells=rows.map(tr=>[...tr.querySelectorAll('td')].map(td=>({k:td.dataset.k||"",t:td.innerText})));
   out.cards.push({t:c.innerText,rows:cells.length,cells,ans:(c.querySelector('.ans')||{}).innerText||""})});
  out.scroll=document.documentElement.scrollWidth-innerWidth;out.html=document.body.innerHTML.includes('<img src=x');return out}catch(e){return{err:e.message+e.stack}}},p);
 const bad=[];const add=m=>bad.push(m);
 if(r.err)add('EXC '+r.err.slice(0,120));else{
  if(!r.cards.length)add('카드 없음');
  r.cards.forEach((c,ci)=>{if(/undefined|NaN|\[object|\{\{|null\b/.test(c.t))add('Q'+(ci+1)+' 쓰레기값:'+(c.t.match(/.{15}(undefined|NaN|\[object|\{\{|null\b).{10}/)||[''])[0]);
   if(p.spk!=="role"&&c.rows===0&&!/입력한 사실이 부족|정보가 부족|[Cc]hưa đủ|thiếu/.test(c.t))add('Q'+(ci+1)+' 문장표 없음');
   c.cells.forEach((row,ri)=>{row.forEach(cell=>{if(!cell.t.trim())add('Q'+(ci+1)+'r'+(ri+1)+' 빈 칸 '+(cell.k||'?'))});
    const vi=row.find(z=>z.k==="vi"),ko=row.find(z=>z.k==="ko"),tg=row.find(z=>z.k!=="ko"&&z.k!=="vi"&&z.t.trim());
    if(vi&&/[가-힣]/.test(vi.t))add('Q'+(ci+1)+'r'+(ri+1)+' vi칸에 한글:'+vi.t.slice(0,30));
    if(ko&&/[ăâđêôơưạảãệộ]{1}/i.test(ko.t)&&/[ạảãậặẹẻẽệịọỏỗộợụủữựỳỵỷỹ]/.test(ko.t)&&!/[가-힣]/.test(ko.t))add('Q'+(ci+1)+'r'+(ri+1)+' ko칸에 베트남어만:'+ko.t.slice(0,30))})})
  if(r.scroll>1&&p.i%4)add('가로 넘침 '+r.scroll);if(r.html)add('XSS 주입 DOM 생성');
  // 입력 무시(조용한 누락) 검사: real 모드에서 입력이 있는데 출력에도 보고에도 없음
  if(p.spk==="real"){const txt=r.cards.map(c=>c.t).join("\n");["ev","th","past","now","rs"].forEach(k=>{const v=(p.me[k]||"").trim();if(!v||/^[x\s?]+$|^[\d]+$/.test(v))return;const inOut=txt.includes(v);const rep=JSON.stringify(r.rep);const hasRep=rep.includes(v.slice(0,12).replace(/"/g,'\\"'))||r.rep.unknown.some(u=>u.includes(v.slice(0,6)));
    // 번역되었는지: 목표언어 칸에 입력 키워드가 반영되었는지는 어려우므로 '미번역 보고' 비율만 통계
    if(!inOut&&r.rep.unknown.length===0&&!r.rep.translated.some(t=>t.startsWith(v.slice(0,8))))add('입력 조용히 누락/미보고: '+k+'='+v.slice(0,20))})}
 }
 if(errs.length)add('오류 '+errs.join('|').slice(0,100));if(reqs.length)add('외부요청 '+reqs.length);
 // 통계
 p.unk=r.rep?r.rep.unknown.length:0;p.tr=r.rep?r.rep.translated.length:0;p.nin=Object.keys(p.me).filter(k=>/^(ev|th|past|now|rs)$/.test(k)&&(p.me[k]||"").trim()).length;
 if(bad.length)iss.push({i:p.i,spk:p.spk,lang:p.lang,ui:p.ui,lv:p.lv,kind:p.kind,bad});n++;await ctx.close()}
const agg={};iss.forEach(x=>x.bad.forEach(m=>{const k=m.replace(/[:=].*$/,'').replace(/Q\d+r?\d*/,'Q');agg[k]=(agg[k]||0)+1}));
console.log('personas',n,'with issues',iss.length);console.log(JSON.stringify(agg,null,1));
const rl=P.filter(p=>p.spk==="real"&&p.nin>0);const totIn=rl.reduce((a,p)=>a+p.nin,0),totUnk=rl.reduce((a,p)=>a+p.unk,0);
console.log('real personas w/ free inputs',rl.length,'free-input fields',totIn,'unknown(untranslated) reports',totUnk,'ratio',(totUnk/totIn*100).toFixed(0)+'%');
require('fs').writeFileSync('p100_issues.json',JSON.stringify(iss,null,1));iss.slice(0,12).forEach(x=>console.log(JSON.stringify(x).slice(0,420)));await b.close()})();
