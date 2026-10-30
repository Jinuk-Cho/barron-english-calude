const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.Translator={availability:async()=>'available',create:async(o)=>({translate:async t=>o.targetLanguage==='en'?'It relieves my stress.':o.targetLanguage==='zh'?'它能缓解我的压力。':'ストレスが解消されます。'})}});
await p.goto('file://'+process.argv[2]);const R=[];const ok=(n,c,i)=>R.push([n,!!c,i]);
for(const lang of ['en','zh','ja']){await p.evaluate(l=>{s.spk='real';s.lang=l;s.lv=2;s.sel=['hobby:0'];s.qs=[0];s.me={tn:'tennis',when:'weekend',place:'park',rs:'스트레스가 풀려요',ev:'지난주에 이겼어요'};draw();document.getElementById('openA').click()},lang);await p.waitForTimeout(250);await p.evaluate(()=>document.querySelectorAll('#modal details').forEach(d=>d.open=true));
 ok(lang+' 버튼 표시',await p.evaluate(()=>!document.getElementById('txchrow').hidden));await p.click('#txchrome');await p.waitForTimeout(400);
 const v=await p.evaluate(()=>document.getElementById('txin').value);ok(lang+' 초안 채움',/\[rs\]/.test(v)&&/\[ev\]/.test(v),v.replace(/\n/g,' / '));await p.click('#txapply');await p.waitForTimeout(400);
 const res=await p.evaluate(()=>document.getElementById('txres').textContent);const txt=await p.evaluate(()=>document.getElementById('model').innerText);
 ok(lang+' 적용 결과',/✅/.test(res),res);if(lang==='en')ok('en 이유 절이 문장에 반영',/because it relieves my stress/.test(txt));await p.keyboard.press('Escape')}
// 미지원 브라우저
const q=await (await b.newContext()).newPage();await q.goto('file://'+process.argv[2]);await q.evaluate(()=>{s.spk='real';s.lang='en';draw();document.getElementById('openA').click()});await q.waitForTimeout(250);ok('미지원 브라우저: 버튼 숨김',await q.evaluate(()=>document.getElementById('txchrow').hidden));
ok('오류 0',errs.length===0,errs.join('|'));R.forEach(r=>console.log(r[1]?'PASS':'FAIL',r[0],r[2]||''));await b.close()})()
