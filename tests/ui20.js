/* UI 전문가 20명 하네스 (AI가 만든 점검 관점, 실제 사람 아님)
   9개 해상도 × 라이트/다크 × 주요 화면 상태에서 20가지 관점으로 자동 점검
   사용: node tests/ui20.js <index.html> [결과 JSON] */
const {chromium}=require('playwright');const fs=require('fs');const F=process.argv[2],OUT=process.argv[3]||'';
const VPS=[[320,640],[375,812],[414,896],[768,1024],[1024,768],[1280,800],[1440,900],[1680,1050],[2000,1100],[2560,1440]];
const EXPERTS=["E01 레이아웃·반응형","E02 문장표 열 비율","E03 공간 효율","E04 타이포·줄 길이","E05 라이트 대비","E06 다크 대비","E07 터치 영역","E08 키보드 포커스","E09 접근 가능한 이름","E10 펼침 상태(aria)","E11 제목 구조","E12 언어 속성","E13 버튼 일관성","E14 중복 정보","E15 모션 줄이기","E16 아이콘 버튼","E17 성능","E18 표현 풀이 행","E19 폼 라벨","E20 오류·빈 상태"];
(async()=>{const b=await chromium.launch();const issues={};EXPERTS.forEach(e=>issues[e]=[]);const add=(e,m)=>issues[e].push(m);let runs=0;
for(const [w,h] of VPS)for(const scheme of ["light","dark"]){runs++;
 const mob=w<800;const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:scheme,isMobile:mob,hasTouch:mob,reducedMotion:"reduce"});const pg=await ctx.newPage();pg.setDefaultTimeout(4000);
 const errs=[],reqs=[];pg.on('pageerror',e=>errs.push(e.message.slice(0,100)));pg.on('console',m=>{if(m.type()==="error")errs.push(m.text().slice(0,100))});pg.on('request',r=>{if(!/^(file|data|blob):/.test(r.url()))reqs.push(r.url())});
 await pg.addInitScript(()=>{window.SpeechSynthesisUtterance=function(t){this.text=t};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){setTimeout(()=>u.onend&&u.onend(),10)},cancel(){},getVoices(){return[{name:"Google US English",lang:"en-US"}]},speaking:false,pending:false,onvoiceschanged:null,addEventListener(){}}})});
 await pg.goto('file://'+F);await pg.waitForTimeout(300);const tag=`${w}px ${scheme}`;
 /* 상태 A: 가상 인물·중급·긴 답변, 질문 2개, 첫 문장 표현 풀이 펼침 */
 const t0=Date.now();
 const A=await pg.evaluate(()=>{const t0=performance.now();s.spk='virt';s.lang='en';s.lv=1;s.long=true;s.sty='talk';s.sel=['exercise:0','hobby:0'];s.qs=[0,1];s.me={};s.pers={};draw();const dt=performance.now()-t0;
  const card=document.querySelector('#model>.qc');const t=card.querySelector('table.st');const btn=t.querySelector('[data-coach-jump]');const exp0=btn.getAttribute('aria-expanded');btn.click();const exp1=btn.getAttribute('aria-expanded');
  const cr=t.querySelector('tr.coach-row');const o={dt,exp0,exp1,nodes:document.querySelectorAll('*').length};
  o.interp=card.querySelectorAll('.interp').length;
  const rows=[...t.querySelectorAll('tr')].filter(r=>r.querySelector('td[data-k]'));o.nRows=rows.length;o.nSent=SETS[0].S.filter(z=>(z.en||'').trim()).length;
  o.koTexts=new Set([...card.querySelectorAll('td[data-k=ko]')].map(td=>td.textContent)).size;
  const th=[...t.querySelectorAll('tr:first-child th')].map(x=>x.getBoundingClientRect().width);o.thW=th;o.tW=t.getBoundingClientRect().width;o.hdr=getComputedStyle(t.querySelector('tr')).display;
  const rg=document.createRange();o.fill=rows.slice(0,6).map(r=>{const td=r.querySelector('td[data-k]');rg.selectNodeContents(td);return rg.getBoundingClientRect().width/Math.max(1,td.getBoundingClientRect().width)});
  o.rowH=rows.slice(0,6).map(r=>r.getBoundingClientRect().height);o.lh=parseFloat(getComputedStyle(rows[0].querySelector('td[data-k]')).lineHeight)||24;
  if(cr){const r=cr.getBoundingClientRect(),tr=t.getBoundingClientRect();o.cr={w:r.width/tr.width,align:getComputedStyle(cr.querySelector('td')).textAlign,inner:cr.querySelectorAll('tbody tr').length}}
  const ans=card.querySelector('.ans');const fs=parseFloat(getComputedStyle(ans).fontSize);o.ansCh=ans.getBoundingClientRect().width/(fs*0.5);o.baseFs=parseFloat(getComputedStyle(document.body).fontSize);o.bodyLh=parseFloat(getComputedStyle(document.body).lineHeight)/o.baseFs;
  return o});
 if(A.interp)add("E14 중복 정보",`${tag}: 전체 해석 패널이 남아 있음`);
 if(A.nRows!==A.nSent)add("E14 중복 정보",`${tag}: 문장 수 ${A.nSent} ≠ 해석 행 ${A.nRows}`);
 if(!mob&&w>=721&&A.hdr!=="none"){const [c1,c2,c3]=A.thW;if(c3/A.tW>0.40)add("E02 문장표 열 비율",`${tag}: 해석 열이 표의 ${(c3/A.tW*100).toFixed(0)}% (40% 이하 기대)`);if(c2<c3)add("E02 문장표 열 비율",`${tag}: 영어 열(${c2|0})이 해석 열(${c3|0})보다 좁음`)}
 if(w>=1024){const f=A.fill.reduce((a,b)=>a+b,0)/A.fill.length;if(f<0.35)add("E03 공간 효율",`${tag}: 해석 칸 평균 채움 ${(f*100).toFixed(0)}% (35% 이상 기대)`);
  const tall=A.rowH.slice(1).filter(x=>x>A.lh*3.2).length;if(tall>1)add("E03 공간 효율",`${tag}: 짧은 문장 행이 3줄 높이 이상 ${tall}개`)}
 if(A.exp0!=="false"||A.exp1!=="true")add("E10 펼침 상태(aria)",`${tag}: 표현 풀이 버튼 aria-expanded ${A.exp0}→${A.exp1}`);
 if(!A.cr)add("E18 표현 풀이 행",`${tag}: 표현 풀이 행이 안 생김`);else{if(A.cr.w<0.95)add("E18 표현 풀이 행",`${tag}: 풀이 행이 표 너비의 ${(A.cr.w*100)|0}%`);if(A.cr.align!=="left"&&A.cr.align!=="start")add("E18 표현 풀이 행",`${tag}: 풀이 글자 정렬 ${A.cr.align}`);if(A.cr.inner<1)add("E18 표현 풀이 행",`${tag}: 풀이 표현 0개`)}
 if(A.ansCh>120&&!mob)add("E04 타이포·줄 길이",`${tag}: 모범답안 한 줄 약 ${A.ansCh|0}자 (120자 이하 기대)`);if(A.baseFs<15.5)add("E04 타이포·줄 길이",`${tag}: 기본 글자 ${A.baseFs}px`);if(A.bodyLh<1.4)add("E04 타이포·줄 길이",`${tag}: 줄 간격 ${A.bodyLh.toFixed(2)}`);
 if(A.dt>150)add("E17 성능",`${tag}: 다시 그리기 ${A.dt|0}ms`);if(A.nodes>25000)add("E17 성능",`${tag}: DOM 요소 ${A.nodes}개`);
 /* 상태 B: 모의시험 복기 + 1·2회차 수업 열기 + 학습 노트 하나 펼침 */
 await pg.evaluate(async()=>{EX.cats=["hobby","travel"];EX.lvl=3;renderExam();document.getElementById("exgo").click();await new Promise(r=>setTimeout(r,500));document.getElementById("exstop").click();await new Promise(r=>setTimeout(r,200));const d=document.getElementById("classic-lessons");if(d)d.open=true;const st=document.querySelector('#model>.qc details.study');if(st)st.open=true});
 await pg.waitForTimeout(150);
 const B=await pg.evaluate(({mob})=>{const o={};const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return false;for(let a=e;a;a=a.parentElement){const cs=getComputedStyle(a);if(cs.display==="none"||cs.visibility==="hidden")return false;if(a.tagName==="DETAILS"&&!a.open){const sm=a.querySelector(':scope>summary');if(!(sm&&sm.contains(e)))return false}}return true};
  const inScroll=e=>{for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){if(/(auto|scroll)/.test(getComputedStyle(a).overflowX))return true}return false};
  o.ov=document.documentElement.scrollWidth-innerWidth;o.out=[...document.querySelectorAll('body *')].filter(e=>vis(e)&&!inScroll(e)&&e.children.length===0&&e.textContent.trim()&&e.getBoundingClientRect().right>innerWidth+2).map(e=>(e.className||e.tagName)+':'+e.textContent.trim().slice(0,16)).slice(0,5);
  const lum=c=>{const m=c.match(/[\d.]+/g);if(!m)return null;const [r,g,b]=m.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
  const bgOf=e=>{for(let a=e;a;a=a.parentElement){const c=getComputedStyle(a).backgroundColor;const m=c.match(/[\d.]+/g);if(m&&(m.length<4||+m[3]>0.5))return c}return getComputedStyle(document.body).backgroundColor};
  const low=[];let n=0;for(const e of document.querySelectorAll('p,span,b,td,th,li,label,button,h1,h2,h3,summary,div,a,small,strong,em')){if(n>900)break;if(!vis(e)||![...e.childNodes].some(x=>x.nodeType===3&&x.nodeValue.trim()))continue;n++;const cs=getComputedStyle(e);if(+cs.opacity<0.5||e.closest('[aria-hidden=true]'))continue;const a=lum(cs.color),bb=lum(bgOf(e));if(a==null||bb==null)continue;const cr=(Math.max(a,bb)+.05)/(Math.min(a,bb)+.05);const big=parseFloat(cs.fontSize)>=18.6||(parseFloat(cs.fontSize)>=14&&+cs.fontWeight>=700);if(cr<(big?3:4.5))low.push((e.className||e.tagName).toString().slice(0,22)+' '+cr.toFixed(2)+' «'+e.textContent.trim().slice(0,14)+'»')}o.low=low;
  o.small=[];if(mob)document.querySelectorAll('button,select,a[href],summary,.chip,input[type=checkbox],input[type=radio]').forEach(e=>{if(!vis(e)||e.closest('label'))return;const r=e.getBoundingClientRect();if(r.height<32||r.width<32)o.small.push((e.className||e.tagName)+':'+(e.textContent||'').trim().slice(0,10)+'('+(r.width|0)+'x'+(r.height|0)+')')});
  o.noName=[...document.querySelectorAll('button,select,input:not([type=hidden]),textarea,a[href]')].filter(e=>vis(e)&&!(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.textContent.trim()||e.title||(e.labels&&e.labels.length)||e.placeholder)).map(e=>e.id||e.className||e.tagName).slice(0,5);
  o.iconOnly=[...document.querySelectorAll('button')].filter(e=>vis(e)&&/^[\s▶■⏸◀🔍📌✎🔊🎤⏹⏺↺↻×✕+\-−]+$/.test(e.textContent)&&!e.getAttribute('aria-label')&&!e.title).map(e=>(e.className||e.id)+':'+e.textContent.trim()).slice(0,5);o.nIconOnly=[...document.querySelectorAll('button')].filter(e=>vis(e)&&/^[\s▶■⏸◀🔍📌✎🔊🎤⏹⏺↺↻×✕+\-−]+$/.test(e.textContent)&&!e.getAttribute('aria-label')&&!e.title).length;
  const hs=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).map(x=>+x.tagName[1]);o.h1=hs.filter(x=>x===1).length;o.jump=0;for(let i=1;i<hs.length;i++)if(hs[i]-hs[i-1]>1)o.jump++;
  o.lang=document.documentElement.lang;o.enNoLang=[...document.querySelectorAll('#model td:nth-child(2) span, .ans')].filter(e=>vis(e)&&/[A-Za-z]{3,}/.test(e.textContent)&&!(e.closest('[lang^=en]'))).length;
  const rows=[...document.querySelectorAll('#model>.qc>.row')].slice(0,1);o.btnH=rows.map(r=>[...r.querySelectorAll('.btn')].filter(vis).map(b=>Math.round(b.getBoundingClientRect().height)));
  o.unlabeled=[...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea')].filter(e=>vis(e)&&!(e.labels&&e.labels.length)&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>e.id||e.className).slice(0,6);
  o.smooth=getComputedStyle(document.documentElement).scrollBehavior;const anims=[...document.querySelectorAll('*')].filter(e=>vis(e)&&(parseFloat(getComputedStyle(e).animationDuration)>0.01&&getComputedStyle(e).animationName!=="none")).map(e=>e.className||e.tagName).slice(0,4);o.anims=anims;
  o.exRows=document.querySelectorAll('#exam tbody tr').length;
  return o},{mob});
 if(B.ov>0)add("E01 레이아웃·반응형",`${tag}: 가로 스크롤 ${B.ov}px`);if(B.out.length)add("E01 레이아웃·반응형",`${tag}: 화면 밖 글자 ${B.out.join(' | ')}`);
 if(B.low.length)add(scheme==="dark"?"E06 다크 대비":"E05 라이트 대비",`${tag}: 낮은 대비 ${B.low.length}곳 ${B.low.slice(0,3).join(' | ')}`);
 if(B.small.length)add("E07 터치 영역",`${tag}: 32px 미만 ${B.small.length}개 ${B.small.slice(0,3).join(' | ')}`);
 if(B.noName.length)add("E09 접근 가능한 이름",`${tag}: 이름 없는 컨트롤 ${B.noName.join(',')}`);
 if(B.nIconOnly)add("E16 아이콘 버튼",`${tag}: 글자 없는 아이콘 버튼 ${B.nIconOnly}개 (aria-label 없음) ${B.iconOnly.join(' | ')}`);
 if(B.h1!==1)add("E11 제목 구조",`${tag}: h1 ${B.h1}개`);if(B.jump)add("E11 제목 구조",`${tag}: 제목 단계 건너뜀 ${B.jump}곳`);
 if(B.lang!=="ko")add("E12 언어 속성",`${tag}: html lang=${B.lang}`);if(B.enNoLang)add("E12 언어 속성",`${tag}: lang=en 없는 영어 문장 ${B.enNoLang}개`);
 B.btnH.forEach(a=>{if(a.length>1&&Math.max(...a)-Math.min(...a)>6)add("E13 버튼 일관성",`${tag}: 같은 줄 버튼 높이 ${a.join('/')}`)});
 if(B.unlabeled.length)add("E19 폼 라벨",`${tag}: 라벨 없는 입력 ${B.unlabeled.join(',')}`);
 if(B.smooth==="smooth")add("E15 모션 줄이기",`${tag}: 동작 줄이기 설정에서도 부드러운 스크롤`);if(B.anims.length)add("E15 모션 줄이기",`${tag}: 동작 줄이기 설정에서도 애니메이션 ${B.anims.join(',')}`);
 if(B.exRows!==15)add("E20 오류·빈 상태",`${tag}: 모의시험 복기 행 ${B.exRows}`);
 /* 상태 C: 키보드 탭 이동 (처음 25개) */
 await pg.evaluate(()=>{window.scrollTo(0,0);document.activeElement&&document.activeElement.blur()});
 let noRing=[];const ringed=new Set();for(let i=0;i<25;i++){await pg.keyboard.press('Tab');const r=await pg.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e);const ring=(cs.outlineStyle!=="none"&&parseFloat(cs.outlineWidth)>0)||cs.boxShadow!=="none";const rc=e.getBoundingClientRect();return{id:(e.id||e.className||e.tagName).toString().slice(0,24),ring,vis:rc.width>0&&rc.height>0}});if(r&&r.vis){if(r.ring)ringed.add(r.id);else noRing.push(r.id)}}noRing=noRing.filter(x=>!ringed.has(x));
 if(noRing.length)add("E08 키보드 포커스",`${tag}: 포커스 표시 없는 요소 ${noRing.length}개 ${[...new Set(noRing)].slice(0,4).join(',')}`);
 /* 상태 D: 실제 나 + 빈 입력 */
 const D=await pg.evaluate(()=>{s.spk='real';s.me={};try{topicProfiles={}}catch(e){}draw();return document.getElementById('model').innerText.slice(0,4000)});
 if(!/가상|부족|입력/.test(D))add("E20 오류·빈 상태",`${tag}: 실제 나 빈 입력 안내 없음`);
 errs.forEach(e=>add("E20 오류·빈 상태",`${tag}: 페이지 오류 ${e}`));if(reqs.length)add("E20 오류·빈 상태",`${tag}: 외부 요청 ${reqs.length}`);
 await ctx.close()}
await b.close();let tot=0;for(const e of EXPERTS){const n=issues[e].length;tot+=n;console.log(`${n?"✗":"✓"} ${e}: ${n}건${n?"  · "+[...new Set(issues[e].map(x=>x.replace(/^[^:]+: /,"")))].slice(0,2).join(" / ").slice(0,220):""}`)}
console.log(`실행 ${runs}회(해상도 ${VPS.length} × 라이트/다크) · 전체 ${tot}건`);if(OUT)fs.writeFileSync(OUT,JSON.stringify(issues,null,1))})();
