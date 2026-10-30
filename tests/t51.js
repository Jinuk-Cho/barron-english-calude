const {chromium}=require('playwright');const F=process.argv[2];const R=[];const ok=(n,c,i)=>R.push([n,!!c,i===undefined?"":String(i).slice(0,200)]);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:900}})).newPage();const errs=[],reqs=[];p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(!/^(file|blob|data):/.test(r.url()))reqs.push(r.url())});
await p.goto('file://'+F);
const setup=async(lang)=>{await p.evaluate(l=>{s.spk='real';s.lang=l;s.lv=2;s.long=false;s.sel=['hobby:0'];s.qs=[0,1,2,3];s.me={tn:'테니스',ta:'테니스 치기',when:'weekend',place:'park',ev:'지난주에 작은 대회에서 이겼어요',rs:'마음이 맑아져요',th:'더 잘하고 싶어요'};draw()},lang);await p.evaluate(()=>document.getElementById('openA').click());await p.waitForTimeout(250);await p.evaluate(()=>document.querySelectorAll('#modal details').forEach(d=>d.open=true))};
const body=()=>p.evaluate(()=>[...document.querySelectorAll('#model .qc')].map(c=>c.innerText).join('\n'));
await setup('en');
ok('요청문 생성',await p.evaluate(()=>/\[ev\] 지난주/.test(document.getElementById('txprompt').value)&&/\[rs\]/.test(document.getElementById('txprompt').value)&&/English/.test(document.getElementById('txprompt').value)),await p.evaluate(()=>document.getElementById('txprompt').value.slice(0,120)));
ok('적용 전: 미번역 보고',await p.evaluate(()=>xlReport().unknown.length>=2));
await p.fill('#txin','[ev] I won a small tournament last week.\n[rs] my mind becomes clear\n[th] 더 잘하고 싶어요\n[past] I rarely played.');
await p.click('#txapply');await p.waitForTimeout(500);
const res=await p.evaluate(()=>document.getElementById('txres').textContent);
ok('올바른 줄 적용·잘못된 줄 제외',/✅.*ev.*rs/.test(res)&&/th/.test(res)&&/past/.test(res),res);
const t1=await body();
ok('영어 이벤트 문장 반영',/I won a small tournament last week\./.test(t1));
ok('이유 절 반영(because 1회)',/because my mind becomes clear/.test(t1)&&!/because because/.test(t1));
ok('한국어 원문이 한국어 칸에 해석으로',/지난주에 작은 대회에서 이겼어요/.test(t1));
ok('베트남어 칸에 한글 없음',await p.evaluate(()=>![...document.querySelectorAll('#model td[data-k=vi]')].some(td=>/[가-힣]/.test(td.innerText))));
ok('영어 답변에 한글 누출 없음',await p.evaluate(()=>![...document.querySelectorAll('#model td:not([data-k])')].some(td=>/[가-힣]/.test(td.innerText))));
// 원문 수정하면 번역 폐기
await p.evaluate(()=>{s.me.ev='지난주에 대회에서 졌어요';draw()});const t2=await body();
ok('원문 바뀌면 이전 번역 사용 안 함',!/small tournament/.test(t2));
// 중국어: 영어 입력은 거부
await p.evaluate(()=>{s.lang='zh';s.me.ev='지난주에 작은 대회에서 이겼어요';draw()});await p.evaluate(()=>document.getElementById('openA')&&document.getElementById('openA').click());await p.waitForTimeout(250);await p.evaluate(()=>document.querySelectorAll('#modal details').forEach(d=>d.open=true));
await p.fill('#txin','[ev] I won a small tournament.\n[th] 我想做得更好。');await p.click('#txapply');await p.waitForTimeout(300);
const r2=await p.evaluate(()=>document.getElementById('txres').textContent);
ok('zh: 영어 줄 거부 / 중국어 줄 적용',/ev/.test(r2.split('⚠')[1]||'')&&/✅.*th/.test(r2),r2);
await p.fill('#txin','[ev] 我上周赢了一场小比赛。\n[rs] 心情变得清爽');await p.click('#txapply');await p.waitForTimeout(300);
const t3=await body();ok('zh 문장 반영',/我上周赢了一场小比赛/.test(t3)&&/因为心情变得清爽/.test(t3),t3.match(/因为[^。]*。/)?.[0]);
// ja
await p.evaluate(()=>{s.lang='ja';draw()});await p.evaluate(()=>document.getElementById('openA').click());await p.waitForTimeout(250);await p.evaluate(()=>document.querySelectorAll('#modal details').forEach(d=>d.open=true));
await p.fill('#txin','[ev] 先週、小さな大会で勝ちました。\n[rs] 気持ちがすっきりする');await p.click('#txapply');await p.waitForTimeout(300);
const t4=await body();ok('ja 반영',/先週、小さな大会で勝ちました/.test(t4)&&/気持ちがすっきりするので/.test(t4));
// 빈 입력/형식 없음
await p.fill('#txin','hello');await p.click('#txapply');await p.waitForTimeout(150);
ok('형식 없음 안내',await p.evaluate(()=>/찾지 못했어요/.test(document.getElementById('txres').textContent)));
// XSS
await p.fill('#txin','[ev] 先週、<img src=x onerror=alert(1)>');await p.click('#txapply');await p.waitForTimeout(300);
ok('XSS 없음',await p.evaluate(()=>!document.querySelector('#model img[src="x"]')));
// vi UI
await p.evaluate(()=>document.getElementById('uivi').click());await p.waitForTimeout(300);
ok('vi UI 도우미 표시',await p.evaluate(()=>/Dán bản dịch từ AI/.test(document.getElementById('modal').innerText||document.body.innerText)));
ok('외부 요청 0',reqs.length===0,reqs.join(','));ok('오류 0',errs.length===0,errs.join('|'));
R.forEach(r=>console.log(r[1]?'PASS':'FAIL',r[0],r[2]));console.log(R.filter(r=>!r[1]).length+' fail / '+R.length);await b.close()})();
