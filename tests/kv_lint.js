/* 한국어·베트남어 목표 언어 전수 점검: 64주제 × 유형 × 레벨 × 문체 × 화자 */
const {chromium}=require('playwright');const F=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+F);await p.waitForTimeout(300);
const R=await p.evaluate(()=>{
 const out={n:0,bad:[],stat:{}};const add=(k,msg)=>{out.bad.push(k+" :: "+msg)};
 const HB=c=>{const n=c.charCodeAt(0)-0xAC00;return n>=0&&n<11172&&n%28!==0};
 const PH=/해석 없음|chưa có bản dịch|〔|Thiết lập|가상 인물 설정|undefined|NaN|\$\{|\[object|「|」/;
 const sty=["talk","calm","story","insight","D"];
 document.getElementById("uiko").click();
 for(const L of ["ko","vi"])for(const spk of ["virt","real","role"])for(const lv of [0,1,2])for(const st of (spk==="virt"?sty:["talk"]))for(const lg of (spk==="virt"?[false,true]:[false])){
  s.spk=spk;s.lang=L;s.lv=lv;s.sty=st;s.long=lg;s.me={};s.pers={};s.role={};s.qs=[0,1,2,3,4];s.sel=[];
  for(const c of Object.keys(D))D[c].i.forEach((_,j)=>s.sel.push(c+":"+j));
  const sets=buildSets();const tag=`${L}/${spk}/L${lv}/${st}/${lg?"long":"short"}`;
  const wc={};
  for(const x of sets){out.n++;
   const key=x.key+"#"+x.q;
   if(!x.qt||PH.test(x.qt))add(tag+" "+key,"질문 비정상: "+x.qt);
   if(L==="ko"&&!/[가-힣]/.test(x.qt))add(tag+" "+key,"ko 질문에 한글 없음");
   if(L==="ko"&&/[A-Za-zăâđêôơư]{3,}/.test(x.qt.replace(/TV|IT|SNS/g,"")))add(tag+" "+key,"ko 질문에 라틴 단어: "+x.qt);
   if(L==="vi"&&/[가-힣]/.test(x.qt))add(tag+" "+key,"vi 질문에 한글");
   if(L==="vi"&&!/^[A-ZÀ-Ỹ“"(]/.test(x.qt))add(tag+" "+key,"vi 질문 시작 소문자: "+x.qt);
   if(L==="ko"&&!/[?.]$/.test(x.qt))add(tag+" "+key,"ko 질문 끝 부호: "+x.qt);
   let tw=0;
   for(const z of x.S){const t=(z[L]||"").trim();if(!t)continue;
    if(PH.test(t))add(tag+" "+key,"자리표시/비정상: "+t);
    if(/\s{2}|\.\.|\s[,.!?]|[,.]{2}/.test(t))add(tag+" "+key,"공백·문장부호: "+t);
    if(!/[.!?]$/.test(t))add(tag+" "+key,"끝 부호 없음: "+t);
    if(L==="ko"){
     if(/[A-Za-z]*[a-z][A-Za-z]*/.test(t.replace(/\b[A-Z]{2,}\b/g,"")))add(tag+" "+key,"ko에 라틴: "+t);
     if(/[ăâđêôơưạảãệộịọỏụủữựỳỵỷỹ]/i.test(t))add(tag+" "+key,"ko에 베트남 글자: "+t);
     if(/[぀-ヿ一-鿿]/.test(t))add(tag+" "+key,"ko에 한자·가나: "+t);
     if(!/[가-힣]/.test(t))add(tag+" "+key,"ko에 한글 없음: "+t);
     t.split(/\s+/).forEach(w=>{const m=w.match(/^([가-힣]*)([가-힣])(를|을)$/);if(m){const w0=m[1]+m[2]+m[3];if(["마을","가을","고을"].includes(w0))return;if(m[3]==="를"&&HB(m[2]))add(tag+" "+key,"을/를 불일치: "+w);if(m[3]==="을"&&!HB(m[2]))add(tag+" "+key,"을/를 불일치: "+w)}});
     if(/를를|을을|은는|는은|가가|이이/.test(t))add(tag+" "+key,"조사 중복: "+t);
     if(x.mode!=="role"&&!/(요|니다|까|죠|네요|세요)[.!?]$/.test(t)&&!z.sty)add(tag+" "+key,"해요체 아님: "+t);
    }else{
     if(/[가-힣]/.test(t))add(tag+" "+key,"vi에 한글: "+t);
     if(/[぀-ヿ一-鿿]/.test(t))add(tag+" "+key,"vi에 한자·가나: "+t);
     if(!/^[A-ZÀ-Ỹ0-9“"(]/.test(t))add(tag+" "+key,"vi 문장 시작 소문자: "+t);
     {const ws=t.toLowerCase().replace(/[.,!?]/g,"").split(/\s+/);for(let i=1;i<ws.length;i++)if(ws[i]===ws[i-1]&&!["rất","nhất","lắm","vui","từng","dần","đều","nhẹ","rõ","mãi","xa","ngày","năm","lâu"].includes(ws[i])){add(tag+" "+key,"단어 반복: "+t);break}}
     if(/\bI\b|\bthe\b|\band\b/.test(t))add(tag+" "+key,"vi에 영어: "+t);
    }
    const o=L==="ko"?["vi","en"]:["ko","en"];
    for(const k of o){if(!(z[k]||"").trim()&&!z.raw)add(tag+" "+key,k+" 해석 없음: "+t)}
    tw+=(t.match(/[^\s.,!?]+/g)||[]).length}
   wc[key]=tw}
  out.stat[tag]=wc}
 return out});
const by={};R.bad.forEach(m=>{const k=m.split(" :: ")[1].replace(/:.*$/,"");by[k]=(by[k]||0)+1});
console.log("카드",R.n,"결함",R.bad.length);console.log(by);
require('fs').writeFileSync(process.argv[3]||'/tmp/kv_bad.json',JSON.stringify({bad:R.bad.slice(0,4000),by},null,1));
// monotonic
let mono=0,tot=0,badm=[];
for(const L of ["ko","vi"])for(const lg of ["short","long"]){for(const st of ["talk","calm","story","insight","D"]){const a=[0,1,2].map(lv=>R.stat[`${L}/virt/L${lv}/${st}/${lg}`]);if(!a[0])continue;for(const k of Object.keys(a[0])){tot++;if(a[0][k]<=a[1][k]&&a[1][k]<=a[2][k])mono++;else badm.push(`${L}/${lg}/${st}/${k}:${a.map(z=>z[k])}`)}}}
console.log("단조(초급≤중급≤고급)",mono,"/",tot,badm.slice(0,5));
// mean words per level
for(const L of ["ko","vi"]){for(const lv of [0,1,2]){const r=R.stat[`${L}/virt/L${lv}/talk/short`];const v=Object.entries(r).filter(([k])=>!k.endsWith("#4")).map(z=>z[1]);const per={};Object.entries(r).forEach(([k,w])=>{const q=k.split("#")[1];(per[q]=per[q]||[]).push(w)});const avg=a=>(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);console.log(L,"L"+lv,"문항당 평균 어절/음절",Object.entries(per).map(([q,a])=>q+":"+avg(a)+"("+Math.min(...a)+"-"+Math.max(...a)+")").join(" "))}}
console.log("page errors",errs.length,errs.slice(0,3));await b.close()})();
