const {chromium}=require('playwright');const F=process.argv[2];
let seed=77;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const pick=a=>a[Math.floor(rnd()*a.length)];
(async()=>{const b=await chromium.launch();const agg={};let n=0,bad=0;
for(let i=0;i<20;i++){const pg=await (await b.newContext({viewport:{width:i%3?1280:375,height:900}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto('file://'+F);
 const cfg={spk:pick(['virt','real','role']),lang:pick(['en','zh','ja']),lv:pick([0,1,2]),sty:pick(['talk','calm','story','insight','D','crisp','light']),long:rnd()<.4,cat:pick(['hobby','travel','home','music','sports','movies'].filter(()=>true)),it:0};
 const r=await pg.evaluate(async c=>{document.getElementById('uivi').click();await new Promise(r=>setTimeout(r,200));
  s.spk=c.spk;s.lang=c.lang;s.lv=c.lv;s.sty=c.sty;s.long=c.long;try{if(D[c.cat]){s.cat=c.cat;s.it=0;s.sel=[c.cat+':0']}}catch(e){}s.qs=[0,1,2,3];
  s.me=c.spk==='real'?{tn:'tennis',when:'weekend',rs:'Giải tỏa căng thẳng'}:{};draw();await new Promise(r=>setTimeout(r,250));
  document.querySelectorAll('details').forEach(d=>d.open=true);
  const out=[];const scan=()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const t=n.nodeValue.trim();if(!/[가-힣]/.test(t))continue;const e=n.parentElement;if(!e||e.closest('script,style,#xta,#stta,td[data-k=ko],.keepko,#uiko'))continue;out.push(t.slice(0,90))}
   document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(e=>{['placeholder','aria-label','title'].forEach(a=>{const v=e.getAttribute(a);if(v&&/[가-힣]/.test(v)&&!e.closest('#stta,#xta'))out.push('ATTR '+a+': '+v.slice(0,60))})})};
  scan();document.getElementById('openA')&&document.getElementById('openA').click();await new Promise(r=>setTimeout(r,200));document.querySelectorAll('#modal details').forEach(d=>d.open=true);scan();
  const m=document.getElementById('modal');if(m){const c=document.getElementById('mclose')||m.querySelector('.mdone');c&&c.click()}
  document.getElementById('openB')&&document.getElementById('openB').click();await new Promise(r=>setTimeout(r,200));scan();
  return out},cfg);
 const u=[...new Set(r)];u.forEach(x=>agg[x]=(agg[x]||0)+1);if(u.length)bad++;n++;if(errs.length)console.log('ERR',errs[0]);await pg.context().close()}
console.log('personas',n,'with Hangul in vi UI',bad);Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,60).forEach(([k,v])=>console.log(v,k));await b.close()})()
