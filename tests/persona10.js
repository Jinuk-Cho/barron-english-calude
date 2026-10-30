const {chromium}=require('playwright');const F=process.argv[2];const R=[];
const ok=(p,n,c,i)=>R.push([p,n,!!c,i===undefined?"":String(i).slice(0,170)]);
const HG=/[가-힣]/,VI=/[ăâđêôơưạảãệộịọỏụủữựỳỵỷỹ]/i;
async function open(b,vp,init){const ctx=await b.newContext({viewport:vp||{width:1280,height:900},acceptDownloads:true});const p=await ctx.newPage();p.errs=[];p.reqs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>{p.errs.push('DLG '+d.message());d.dismiss()});p.on('request',r=>{if(!/^(file|blob|data):/.test(r.url()))p.reqs.push(r.url())});await p.goto('file://'+F);await p.waitForTimeout(150);return p}
const set=(p,c)=>p.evaluate(c=>{document.getElementById(c.ui==='vi'?'uivi':'uiko').click();s.spk=c.spk;s.lang=c.lang;s.lv=c.lv;s.sty=c.sty||'talk';s.long=!!c.long;s.sel=c.sel||['hobby:0'];s.qs=c.qs||[0,1,2,3];s.me=c.me||{};s.pers=c.pers||{};s.role={};draw()},c);
const cards=p=>p.evaluate(()=>[...document.querySelectorAll('#model .qc')].map(c=>({txt:c.innerText,rows:[...c.querySelectorAll('table.st tr')].filter(tr=>tr.querySelector('td')).map(tr=>[...tr.querySelectorAll('td')].map(td=>({k:td.dataset.k||'',t:td.innerText.trim()}))),ans:(c.querySelector('.ans')||{}).innerText||''})));
const words=t=>(t.match(/[A-Za-z']+/g)||[]).length;
(async()=>{const b=await chromium.launch();
// P1 초보 한국인
{const p=await open(b);await set(p,{ui:'ko',spk:'virt',lang:'en',lv:0});const c=await cards(p);
 ok('P1 초보','질문 4개 카드',c.length===4,c.length);
 ok('P1','초급 답변 단어 ≤60·문장 ≤6',c.every(x=>words(x.ans)<=60&&x.rows.length<=6),c.map(x=>words(x.ans)+'w/'+x.rows.length+'s').join(','));
 ok('P1','ko 칸에 영어 없음',c.every(x=>x.rows.every(r=>{const k=r.find(z=>z.k==='ko');return !k||!/[A-Za-z]{3,}/.test(k.t)})));
 ok('P1','모든 문장에 ko·vi 해석 존재',c.every(x=>x.rows.every(r=>r.some(z=>z.k==='ko'&&z.t)&&r.some(z=>z.k==='vi'&&z.t))));
 const c2=await cards(p);await set(p,{ui:'ko',spk:'virt',lang:'en',lv:0});const c3=await cards(p);ok('P1','같은 설정 재생성 시 동일(일관성)',JSON.stringify(c2.map(x=>x.ans))===JSON.stringify(c3.map(x=>x.ans)));
 await p.evaluate(()=>{document.getElementById('mine').value='Yesterday I play tennis with my friend. I am like it very much because fun.'});await p.click('#chk');await p.waitForTimeout(400);
 const fb=await p.evaluate(()=>document.getElementById('res').innerText);ok('P1','첨삭: 피드백 출력',fb.length>60,fb.slice(0,80));ok('P1','첨삭: 점수·등급 단정 없음("점"/"급 판정" 제외)',!/\d+\s*점|합격|불합격|미달/.test(fb));
 await p.evaluate(()=>document.querySelectorAll('#model details').forEach(d=>d.open=true));const st=await p.evaluate(()=>document.getElementById('model').innerText);ok('P1','학습 노트 ⑤ + 빈칸/실수 포함',/⑤/.test(st)&&/_____/.test(st)&&/❌/.test(st));
 ok('P1','상세 검증은 일반 화면에 비노출',!/상세 검증 보기/.test(st));ok('P1','오류·외부요청 0',p.errs.length===0&&p.reqs.length===0,p.errs.join('|')+p.reqs.join(','));await p.context().close()}
// P2 베트남 사용자 + 레벨 단조성
{const p=await open(b);const W=[];for(const lv of [0,1,2]){await set(p,{ui:'vi',spk:'virt',lang:'en',lv,sty:'story'});const c=await cards(p);W.push(c.reduce((a,x)=>a+words(x.ans),0));
  ok('P2 베트남','vi 화면에 한글 없음(L'+lv+')',await p.evaluate(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(/[가-힣]/.test(n.nodeValue)&&!n.parentElement.closest('script,style,#stta,#xta,td[data-k=ko],.keepko,#uiko'))return false}return true}));}
 ok('P2','레벨이 오를수록 분량 증가(단조)',W[0]<W[1]&&W[1]<=W[2]+1,W.join('<'));ok('P2','오류 0',p.errs.length===0,p.errs.join('|'));await p.context().close()}
// P3 고급 긴 답변
{const p=await open(b);await set(p,{ui:'ko',spk:'virt',lang:'en',lv:2,long:true,sty:'D'});const c=await cards(p);const w=c.map(x=>words(x.ans));
 ok('P3 고급','긴 답변 단어 ≥150',w.every(x=>x>=150),w.join(','));ok('P3','AL 업그레이드 기능 존재(연습 영역)',await p.evaluate(()=>!!document.getElementById('alrun')||/AL 업그레이드/.test(document.body.innerText)));
 ok('P3','문장 정렬(영어행=ko행=vi행)',c.every(x=>x.rows.every(r=>r.some(z=>z.k==='ko'&&z.t)&&r.some(z=>z.k==='vi'&&z.t))));ok('P3','오류 0',p.errs.length===0);await p.context().close()}
// P4 실제 나 전체 입력(한국어)
{const p=await open(b);await set(p,{ui:'ko',spk:'real',lang:'en',lv:2,me:{tn:'테니스',ta:'테니스 치기',when:'weekend',place:'park',comp:'friends',freq:'weekly',rs:'스트레스가 풀려요',ft:'nervous',fn:'happy',th:'계속 하고 싶어요',past:'어릴 때 했어요',now:'주말마다 해요',pref:'like'}});const c=await cards(p);const all=c.map(x=>x.ans).join(' ');
 ok('P4 실제나','입력한 사실 반영(weekend·park·friends)',/weekend/.test(all)&&/park/.test(all)&&/friends/.test(all));ok('P4','입력 안 한 사실 미생성(office·club·Hanoi·tournament)',!/office|club|Hanoi|tournament|CEO/i.test(all),all.match(/office|club|Hanoi|tournament|CEO/i));
 ok('P4','사전 번역 반영(stress·child·every weekend)',/stress/i.test(all)&&/child|young/i.test(all)&&/every weekend/i.test(all),all.slice(0,60));
 ok('P4','한국어 칸에 「」 괄호 없음',c.every(x=>x.rows.every(r=>!r.some(z=>z.k==='ko'&&/[「」]/.test(z.t)))));ok('P4','오류 0',p.errs.length===0);await p.context().close()}
// P5 실제 나 빈 입력
{const p=await open(b);await set(p,{ui:'ko',spk:'real',lang:'en',lv:1,me:{}});const c=await cards(p);
 ok('P5 빈입력','앱이 비어 보이지 않음(답변 문장 존재)',c.every(x=>x.rows.length>0),c.map(x=>x.rows.length).join(','));ok('P5','가상 예시 채움 고지',c.every(x=>/가상 인물 예시로 채웠어요|가상 예시/.test(x.txt)));ok('P5','오류 0',p.errs.length===0);await p.context().close()}
// P6 중국어
{const p=await open(b);await set(p,{ui:'ko',spk:'virt',lang:'zh',lv:1});const c=await cards(p);
 ok('P6 중국어','병음 표시',c.every(x=>x.rows.every(r=>r.some(z=>/[āáǎàēéěèīíǐìōóǒòūúǔùǖǚ]|[a-z]+ [a-z]+/.test(z.t)&&!HG.test(z.t)&&!/[一-鿿]/.test(z.t)))));
 ok('P6','중국어 칸에 한글·영어 문장 없음',c.every(x=>x.rows.every(r=>{const zh=r.find(z=>/[一-鿿]/.test(z.t)&&!z.k);return zh&&!HG.test(zh.t)&&!/[A-Za-z]{4,}/.test(zh.t)})));
 ok('P6','ko 칸 한글',c.every(x=>x.rows.every(r=>r.some(z=>z.k==='ko'&&HG.test(z.t)))));ok('P6','오류 0',p.errs.length===0);await p.context().close()}
// P7 일본어
{const p=await open(b);await set(p,{ui:'vi',spk:'virt',lang:'ja',lv:0});const c=await cards(p);
 ok('P7 일본어','가나 읽기 표시',c.every(x=>x.rows.every(r=>r.some(z=>/^[぀-ヿ、。\s]+$/.test(z.t)))));ok('P7','일본어 칸에 한글 없음',c.every(x=>x.rows.every(r=>!r.some(z=>!z.k&&/[぀-ヿ一-鿿]/.test(z.t)&&HG.test(z.t)))));
 ok('P7','vi 칸 베트남어(한글 없음)',c.every(x=>x.rows.every(r=>r.filter(z=>z.k==='vi').every(z=>!HG.test(z.t)))));ok('P7','오류 0',p.errs.length===0);await p.context().close()}
// P8 역할극
{const p=await open(b);await set(p,{ui:'ko',spk:'role',lang:'en',lv:1,qs:[0]});const c=await cards(p);
 ok('P8 역할극','대화 형식(🙋/💬 교대)',c.length>=1&&/🙋/.test(c[0].txt)&&/💬/.test(c[0].txt));ok('P8','독백 아님: 내 발화 문장 ≤ 4',(c[0].txt.match(/💬/g)||[]).length<=4,(c[0].txt.match(/💬/g)||[]).length);ok('P8','가상 상황 고지',/가상 상황/.test(c[0].txt));ok('P8','오류 0',p.errs.length===0);await p.context().close()}
// P9 문체 일관성
{const p=await open(b);const base={ui:'ko',spk:'virt',lang:'en',lv:1};await set(p,base);const b0=(await cards(p)).map(x=>x.ans);const diffs=[];let factOK=true,noDigit=true;
 for(const sty of ['calm','story','insight','D','crisp','light']){await set(p,{...base,sty});const c=(await cards(p)).map(x=>x.ans);diffs.push(sty+':'+(c.some((a,i)=>a!==b0[i])?'다름':'동일'));if(!/tennis/i.test(c.join(' ')))factOK=false;
  const extra=c.join(' ').replace(b0.join(' '),'');}
 ok('P9 문체','6개 문체가 기본(talk)과 다른 결과',diffs.every(d=>/다름/.test(d)),diffs.join(' '));ok('P9','모든 문체에서 핵심 사실(주제) 유지',factOK);
 await set(p,{...base,sty:'D',spk:'real',me:{tn:'테니스',ta:'테니스 치기',when:'weekend'}});const cr=await cards(p);ok('P9','실제 나+문체: 입력 안 한 숫자·고유명사 미생성',!/\b\d+\b|Hanoi|Seoul/.test(cr.map(x=>x.ans).join(' ')),cr.map(x=>x.ans).join(' ').match(/\b\d+\b|Hanoi|Seoul/));ok('P9','오류 0',p.errs.length===0);await p.context().close()}
// P10 저장·백업·모바일·접근성
{const p=await open(b,{width:375,height:760});await set(p,{ui:'ko',spk:'virt',lang:'en',lv:1});
 ok('P10 저장·모바일','375px 가로 넘침 없음',await p.evaluate(()=>document.documentElement.scrollWidth<=376));
 const f0=await p.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).fontSize));await p.evaluate(()=>document.querySelector('[data-font=up]').click());const f1=await p.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).fontSize));ok('P10','글자 크기 A+ 증가',f1>f0,f0+'→'+f1);
 await p.evaluate(()=>document.querySelector('[data-font=reset]').click());
 const dl=p.waitForEvent('download',{timeout:4000}).catch(()=>null);await p.evaluate(()=>document.getElementById('exportLocal').click());const d=await dl;ok('P10','백업 파일 내보내기 다운로드',!!d,d&&d.suggestedFilename());
 await p.evaluate(()=>{const e=document.getElementById('progressCheck');if(e){e.checked=true;e.dispatchEvent(new Event('change'))}});await p.waitForTimeout(500);
 await p.evaluate(()=>{s.lv=2;draw()});await p.waitForTimeout(600);await p.reload();await p.waitForTimeout(400);
 ok('P10','새로고침 후 레벨 유지(저장)',await p.evaluate(()=>s.lv===2),await p.evaluate(()=>s.lv));
 ok('P10','외부 요청 0·오류 0',p.reqs.length===0&&p.errs.length===0,p.errs.join('|')+p.reqs.join(','));
 await p.evaluate(()=>{s.spk='real';s.me={ev:'x',rs:'<img src=x onerror=alert(1)>',tn:'<b>t</b>'};draw()});ok('P10','XSS 입력이 DOM으로 실행되지 않음',await p.evaluate(()=>!document.querySelector('#model img[src="x"],#setcard img[src="x"],#xlnote img')),p.errs.join('|'));await p.context().close()}
await b.close();let cur='';R.forEach(r=>{if(r[0]!==cur&&r[0].startsWith('P'))cur=r[0];console.log((r[2]?'PASS':'FAIL')+' ['+r[0]+'] '+r[1]+(r[2]?'':'  ←  '+r[3]))});console.log('\nTOTAL',R.length,'FAIL',R.filter(r=>!r[2]).length)})();
