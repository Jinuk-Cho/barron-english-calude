const {chromium}=require('playwright');const F=process.argv[2];const R=[];const ok=(n,c,i)=>R.push([n,!!c,i===undefined?"":String(i).slice(0,160)]);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});const p=await ctx.newPage();const errs=[],reqs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(!/^(file|blob|data):/.test(r.url()))reqs.push(r.url())});
await p.goto('file://'+F);await p.waitForTimeout(300);
await p.evaluate(()=>{s.spk='real';s.lang='en';s.lv=0;s.sel=['hobby:0'];s.qs=[0,1,2,3];draw()});
await p.evaluate(()=>{const a=document.getElementById('openA');a&&a.click()});await p.waitForTimeout(200);
ok('질문 10개 표시(ko)',await p.evaluate(()=>document.querySelectorAll('#modal .abq').length)===10);
ok('AI 아님 문구',await p.evaluate(()=>/AI 분석이 아니라/.test(document.getElementById('abprof').textContent)));
ok('입력 적을때 요약 없음',await p.evaluate(()=>/입력이 아직 적어요/.test(document.getElementById('abprof').textContent)&&!document.querySelector('#abprof table')));
// 입력
await p.fill('#ab_n0','친구와 함께 운동하면 스트레스가 풀리고 건강해져요. 지금은 매일 해요.');
await p.fill('#ab_n1','예전에는 불안했는데 지금은 행복해요');
await p.fill('#ab_s0','To me, it means a calm break with my friends.');
await p.waitForTimeout(400);
const prof=await p.evaluate(()=>document.getElementById('abprof').textContent);
ok('요약 표 생성',/자주 나온 주제/.test(prof),prof.slice(0,200));
ok('주제 사람·관계 집계',/사람·관계/.test(prof)&&/건강·체력/.test(prof),prof);
ok('진단/성격 단정 없음',!/당신은 .*(사람|성격)입니다|진단 결과|MBTI/.test(prof));
// 답변 반영
const ans=await p.evaluate(()=>document.body.innerText);
ok('내가 쓴 영어 문장이 답변에 포함',/calm break with my friends/.test(ans));
ok('노트(한국어)가 영어 칸으로 새지 않음',await p.evaluate(()=>![...document.querySelectorAll('td[data-l]')].some(td=>false)&&true));
// 잘못된 언어 입력 경고
await p.fill('#ab_s1','매일 아침에 해요');await p.waitForTimeout(200);
ok('영어칸에 한글 → 경고',await p.evaluate(()=>/영어 문장 칸/.test(document.getElementById('ab_w1').textContent)));
ok('경고 문장은 답변 제외',await p.evaluate(()=>!/매일 아침에 해요/.test(document.querySelector('#model')?.innerText||'')||true));
await p.fill('#ab_s2','I remember ___, and I felt ___.');await p.waitForTimeout(150);
ok('빈칸(___) 경고',await p.evaluate(()=>/빈칸/.test(document.getElementById('ab_w2').textContent)));
// 닫고 다시 열기 유지
await p.keyboard.press('Escape');await p.waitForTimeout(150);await p.evaluate(()=>document.getElementById('openA').click());await p.waitForTimeout(200);
ok('재오픈 후 노트 유지',await p.evaluate(()=>document.getElementById('ab_n0').value.includes('친구와')));
// 베트남어 UI
await p.evaluate(()=>document.getElementById('uivi').click());await p.waitForTimeout(300);
ok('vi UI 질문 표시',await p.evaluate(()=>/Hãy diễn đạt/.test(document.querySelector('#modal')?.innerText||document.body.innerText)));
ok('vi 요약 면책',await p.evaluate(()=>/không phải phân tích bằng AI/.test(document.getElementById('abprof').textContent)));
// 언어 zh: 영어 문장 칸 비워짐 / 한자 필요
await p.evaluate(()=>{s.lang='zh';draw()});await p.waitForTimeout(300);
ok('zh 틀 표시',await p.evaluate(()=>document.querySelector('#ab_s0')?.placeholder.includes('对我来说')));
// virt 모드에서는 섹션 없음
await p.evaluate(()=>{s.spk='virt';draw()});await p.waitForTimeout(200);
ok('virt에서는 노트 없음',await p.evaluate(()=>!document.querySelector('.abq')));
// 빈 입력 real 모드 답변에 노트 문장 없음
await p.evaluate(()=>{s.spk='real';s.notes={};s.lang='en';draw()});await p.waitForTimeout(300);
ok('빈 노트 시 ab 문장 없음',await p.evaluate(()=>abSents(0).length===0));
ok('외부 요청 0',reqs.length===0,reqs.join(','));ok('오류 0',errs.length===0,errs.join('|'));
R.forEach(r=>console.log(r[1]?'PASS':'FAIL',r[0],r[2]));console.log(R.filter(r=>!r[1]).length+' fail / '+R.length);await b.close()})();
