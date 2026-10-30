/* 한국어·베트남어 목표: 실제 나 / 가상 인물 입력 / 첨삭 / 로마자 / 화면 순도 */
const {chromium}=require('playwright');const F=process.argv[2];const R=[];const ok=(p,n,c,i)=>R.push([p,n,!!c,i===undefined?"":String(i).slice(0,200)]);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:900}})).newPage();const errs=[],reqs=[];p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))reqs.push(r.url())});
await p.goto('file://'+F);await p.waitForTimeout(300);
const run=(c)=>p.evaluate(c=>{document.getElementById(c.ui==='vi'?'uivi':'uiko').click();s.spk=c.spk;s.lang=c.lang;s.lv=c.lv??1;s.sty=c.sty||'talk';s.long=!!c.long;s.sel=c.sel||['hobby:0'];s.qs=c.qs||[0,1,2,3];s.me=c.me||{};s.pers=c.pers||{};s.role={};topicProfiles={};topicProfiles[(c.sel||['hobby:0'])[0]]=JSON.parse(JSON.stringify(c.me||{}));s.itemKey=(c.sel||['hobby:0'])[0];draw();
 return {sets:buildSets().map(x=>({q:x.q,mode:x.mode,fb:x.fb,txt:x.S.map(z=>z[c.lang]||'').filter(Boolean),all:x.S.map(z=>[z.ko,z.vi,z.en])})),xl:xlReport(),dom:document.getElementById('model').innerText}},c);
// 1 ko 실제 나 (한국어 입력)
const me1={tn:'테니스',ta:'테니스를 쳐요',pref:'like',when:'weekend',place:'park',comp:'friends',freq:'weekly',rs:'스트레스가 풀려요',ft:'nervous',fn:'happy',th:'계속 하고 싶어요.',past:'',now:'',ev:'지난주에 작은 대회에서 이겼어요.'};
let r=await run({ui:'vi',spk:'real',lang:'ko',me:me1});let all=r.sets.flatMap(x=>x.txt).join(' ');
ok('K1 실제나(ko)','입력 사실 반영(주말·공원·친구)',/주말/.test(all)&&/공원/.test(all)&&/친구/.test(all),all.slice(0,120));
ok('K1','이유 문장: 스트레스가 풀려서',/스트레스가 풀려서/.test(all));
ok('K1','직접 쓴 사건 문장 그대로',/지난주에 작은 대회에서 이겼어요/.test(all));
ok('K1','입력 안 한 사실 미생성(사무실·클럽·하노이·CEO·대회에 나갔어요)',!/사무실|클럽|하노이|CEO|대회에 나갔/.test(all),all.match(/사무실|클럽|하노이|CEO|대회에 나갔/g));
ok('K1','가상 예시 표식 없음',!r.sets.some(x=>x.fb)&&!/가상 예시/.test(all));
ok('K1','플레이스홀더 없음',!/해석 없음|chưa có bản dịch|「/.test(all));
// 2 vi 실제 나 (베트남어 입력)
const me2={tn:'quần vợt',ta:'chơi quần vợt',pref:'like',when:'weekend',place:'park',comp:'friends',freq:'weekly',rs:'giải tỏa căng thẳng',ft:'nervous',fn:'happy',th:'Tôi muốn tiếp tục chơi.',ev:'Tuần trước tôi đã thắng một giải nhỏ.'};
r=await run({ui:'ko',spk:'real',lang:'vi',me:me2});all=r.sets.flatMap(x=>x.txt).join(' ');
ok('K2 실제나(vi)','입력 사실 반영(cuối tuần·công viên·bạn bè)',/cuối tuần/i.test(all)&&/công viên/i.test(all)&&/bạn bè/i.test(all),all.slice(0,120));
ok('K2','이유: giải tỏa căng thẳng',/vì giải tỏa căng thẳng/i.test(all)||/giải tỏa căng thẳng/i.test(all));
ok('K2','직접 쓴 사건 문장 그대로',/Tuần trước tôi đã thắng một giải nhỏ/.test(all));
ok('K2','입력 안 한 사실 미생성(công ty·câu lạc bộ·Hà Nội·giải nhỏ của câu lạc bộ)',!/công ty|câu lạc bộ|Hà Nội/i.test(all),all.match(/công ty|câu lạc bộ|Hà Nội/gi));
ok('K2','한글·가상표식 없음',!/[가-힣]/.test(all)&&!r.sets.some(x=>x.fb));
// 3 ko 목표 + 베트남어 입력(사전 번역 가능/불가)
r=await run({ui:'vi',spk:'real',lang:'ko',me:{tn:'quần vợt',when:'weekend',place:'park',comp:'friends',rs:'giải tỏa căng thẳng',ev:'Tuần trước tôi đã thắng một giải nhỏ.'}});all=r.sets.flatMap(x=>x.txt).join(' ');
ok('K3 vi입력→ko','사전에 있는 이유는 한국어로 변환',/스트레스/.test(all),all.slice(0,160));
ok('K3','번역 못 한 사건은 한국어 칸에 넣지 않음(베트남어 문장 유출 없음)',!/Tuần trước/.test(all));
ok('K3','번역 못 한 입력은 보고됨',r.xl.unknown.length>0,JSON.stringify(r.xl.unknown));
// 4 영어 입력 → 목표 ko/vi 칸에 영어 유출 없음
r=await run({ui:'ko',spk:'real',lang:'ko',me:{tn:'tennis',rs:'it is fun',ev:'Last week I won a small match.',when:'weekend'}});all=r.sets.flatMap(x=>x.txt).join(' ');
ok('K4 영어입력','ko 칸에 영어 문장 유출 없음',!/[A-Za-z]{4,}/.test(all.replace(/CNC|SNS/g,'')),all.slice(0,120));
// 5 가상 인물 입력
r=await run({ui:'vi',spk:'virt',lang:'ko',pers:{job:'하노이 유통회사 대표',home:'하노이',interest:'독서와 테니스',life:'바쁘지만 규칙적',trait:'차분하고 꼼꼼함'}});all=r.sets.flatMap(x=>x.txt).join(' ');
ok('K5 가상 인물(ko)','직업·거주 문장 반영',/하노이/.test(all),all.slice(0,160));
ok('K5','플레이스홀더 없음',!/가상 인물 설정|「/.test(all));
r=await run({ui:'ko',spk:'virt',lang:'vi',lv:2,pers:{job:'giám đốc công ty phân phối',home:'Hà Nội',interest:'đọc sách và quần vợt'}});all=r.sets.flatMap(x=>x.txt).join(' ');
ok('K6 가상 인물(vi)','베트남어 입력 반영',/Hà Nội|giám đốc/i.test(all),all.slice(0,160));ok('K6','한글 유출 없음',!/[가-힣]/.test(all));
// 7 첨삭
const chk=async(lang,ui,txt)=>p.evaluate(c=>{document.getElementById(c.ui==='vi'?'uivi':'uiko').click();s.lang=c.lang;s.spk='virt';s.qs=[0];s.sel=['hobby:0'];draw();document.getElementById('mine').value=c.txt;document.getElementById('chk').click();return document.getElementById('res').innerText},{lang,ui,txt});
let t=await chk('ko','vi','저는 테니스를 좋아해요. 주말에 책를 읽어요. 할수있어요. 안되요. 됬어요.');
ok('K7 첨삭(ko)','을/를·수있어요·안되요·됬어요 검출',/책을/.test(t)&&/할 수 있어요/.test(t)&&/안 돼요/.test(t)&&/됐어요/.test(t),t.replace(/\s+/g,' ').slice(0,200));
ok('K7','vi 화면에서 영어 문법 항목(주어-동사 일치) 문구 없음',!/hòa hợp chủ–vị|did 뒤/.test(t));
ok('K7','점수·합격 단정 없음',!/\d+\s*(점|điểm)|합격|đạt/.test(t));
t=await chk('vi','ko','tôi là thích quần vợt.  tôi chơi vào cuối tuần.');
ok('K8 첨삭(vi)','‘là’ 오용·대문자·이중공백 검출',/Tôi thích quần vợt/.test(t)||/là thích/.test(t),t.replace(/\s+/g,' ').slice(0,200));
t=await chk('vi','ko','toi thich quan vot vi no rat vui va giup toi khoe.');
ok('K8','성조 부호 없음 경고',/성조|dấu/.test(t),t.replace(/\s+/g,' ').slice(0,160));
t=await chk('ko','ko','저는 테니스를 좋아한다. 주말에 쳐요.');
ok('K7','말투 혼용 경고',/말투|-다/.test(t));
// 9 로마자 샘플
const rom=await p.evaluate(()=>['저는 테니스를 좋아해요.','주말에 공원에서 친구와 쳐요.','읽어요','국물','같이','많이 먹어요'].map(RRK));
ok('K9 로마자','샘플 6건 기대값 일치',JSON.stringify(rom)==JSON.stringify(['jeoneun teniseureul joahaeyo.','jumare gongwoneseo chinguwa chyeoyo.','ilgeoyo','gungmul','gachi','mani meogeoyo']),JSON.stringify(rom));
// 10 화면: vi UI + ko 목표 / ko UI + vi 목표 (구조·오버플로·칩)
for(const [ui,lang] of [['vi','ko'],['ko','vi']]){await p.setViewportSize({width:390,height:800});
 const o=await p.evaluate(c=>{document.getElementById(c.ui==='vi'?'uivi':'uiko').click();s.spk='virt';s.lang=c.lang;s.lv=2;s.long=true;s.sel=['hobby:0','food:2'];s.qs=[0,1,2,3,4];draw();
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n,h=[];while(n=w.nextNode()){const e=n.parentElement;if(/[가-힣]/.test(n.nodeValue)&&!e.closest('script,style,#stta,#xta,td[data-k=ko],.keepko,.sn,.tgt,.en,.chip,.uisw,.nt,#res,#pq,#xlnote,textarea,input,option'))h.push(n.nodeValue.trim().slice(0,40))}
  return{ov:document.documentElement.scrollWidth-document.documentElement.clientWidth,hg:h.slice(0,5),nh:h.length,chips:[...document.querySelectorAll('#lg .chip')].map(c=>c.innerText),on:document.querySelector('#lg .chip.on')?.innerText}},{ui,lang});
 ok('K10 '+ui+'/'+lang,'390px 가로 넘침 없음',o.ov<=1,o.ov);ok('K10 '+ui+'/'+lang,'언어 칩 5개·선택 표시',o.chips.length===5&&!!o.on,o.chips.join('|')+' → '+o.on);
 if(ui==='vi')ok('K10 vi/ko','vi 화면에 목표 언어 밖 한글 없음',o.nh===0,o.hg.join(' | '));
 await p.setViewportSize({width:1280,height:900})}
// 11 TTS 언어 코드
const v=await p.evaluate(()=>{const o={};for(const L of ['ko','vi']){s.lang=L;const m=[];const orig=window.speechSynthesis.speak.bind(window.speechSynthesis);window.speechSynthesis.speak=u=>{m.push(u.lang)};sayQ(['테스트입니다.']);o[L]=m[0];window.speechSynthesis.speak=orig}return o});
ok('K11 TTS','ko-KR / vi-VN 사용',v.ko==='ko-KR'&&v.vi==='vi-VN',JSON.stringify(v));
ok('KALL','오류 0·외부 요청 0',errs.length===0&&reqs.length===0,errs.join('|')+reqs.join(','));
let f=0;for(const x of R){if(!x[2])f++;console.log((x[2]?'PASS ':'FAIL ')+'['+x[0]+'] '+x[1]+(x[2]?'':'  ←  '+x[3]))}console.log('\nTOTAL',R.length,'FAIL',f);await b.close()})();
