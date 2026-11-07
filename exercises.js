'use strict';
let exerciseRoot=null;
let chosenVariant=1,answers={},testAnswers={},currentQuestion=0,results={};
const MAIL_ENDPOINT = window.PYTHON_RESULTS_ENDPOINT || '';
const sessionKey='python-comic-student-v1';
let studentInfo=(()=>{try{return JSON.parse(localStorage.getItem(sessionKey))||{name:'',className:''}}catch{return {name:'',className:''}}})();
let completedAt={};
function attemptKey(kind){return 'python-comic-attempts-v1-'+chosenVariant+'-'+kind+'-'+studentInfo.name.trim().toLocaleLowerCase('uk')+'-'+studentInfo.className.trim().toLocaleLowerCase('uk')}
function attempts(kind){return Number(localStorage.getItem(attemptKey(kind))||0)}
function recordResult(kind,score){
 const now=new Date();results[kind]=score;completedAt[kind]=now.toISOString();
 if(studentInfo.name.trim()&&studentInfo.className.trim())localStorage.setItem(attemptKey(kind),String(attempts(kind)+1));
 renderSubmitArea();
}
function renderSubmitArea(){
 const target=document.getElementById('submission-area');if(!target)return;
 const kinds=['yesno','test','truth'],ready=kinds.every(k=>Number.isInteger(results[k]));
 target.innerHTML=`<h2>📩 Результати учня</h2><p>Після виконання трьох вправ можна надіслати результати вчителю.</p><div class="student-fields"><label>Прізвище та ім’я<input id="student-name" autocomplete="name" maxlength="100" placeholder="Наприклад: Петренко Олена" value="${escapeHTML(studentInfo.name)}"></label><label>Клас<input id="student-class" maxlength="30" placeholder="Наприклад: 10-А" value="${escapeHTML(studentInfo.className)}"></label></div><p class="score-summary">Варіант ${chosenVariant} · Так або ні: <b>${results.yesno??'—'}/12</b> · Тест: <b>${results.test??'—'}/12</b> · Правда чи неправда: <b>${results.truth??'—'}/12</b></p><p class="score-summary">Кількість спроб: ${kinds.map((k,i)=>['Вправа 1','Вправа 2','Вправа 3'][i]+': '+attempts(k)).join(' · ')}</p><button type="button" class="action-check send-result" id="send-results" ${ready?'':'disabled'}>📨 Завершити та надіслати результат</button><div id="send-status" role="status" aria-live="polite"></div>`;
 for(const [id,key] of [['student-name','name'],['student-class','className']])document.getElementById(id).addEventListener('input',e=>{studentInfo[key]=e.target.value;localStorage.setItem(sessionKey,JSON.stringify(studentInfo))});
 document.getElementById('send-results').onclick=sendResults;
}
async function sendResults(){
 const status=document.getElementById('send-status'),btn=document.getElementById('send-results');
 if(!studentInfo.name.trim()||!studentInfo.className.trim()){status.textContent='Заповніть прізвище та ім’я, а також клас.';return}
 if(!MAIL_ENDPOINT){status.textContent='Надсилання ще не підключено. Учителю потрібно вказати адресу розгорнутого Apps Script у файлі config.js.';return}
 const now=new Date();const payload={name:studentInfo.name.trim(),className:studentInfo.className.trim(),variant:chosenVariant,score1:results.yesno,score2:results.test,score3:results.truth,average:Math.round((results.yesno+results.test+results.truth)/3),date:now.toLocaleDateString('uk-UA'),time:now.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',second:'2-digit'}),timestamp:now.toISOString(),attempt1:attempts('yesno'),attempt2:attempts('test'),attempt3:attempts('truth')};
 btn.disabled=true;status.textContent='Надсилаємо результати…';
 try{await fetch(MAIL_ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});status.textContent='Запит на надсилання відправлено. Через обмеження браузера підтвердити запис неможливо — перевірте Google Таблицю.'}catch(e){status.textContent='Не вдалося надіслати. Перевірте інтернет і адресу Apps Script.'}finally{btn.disabled=false}
}

const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=()=>window.EXERCISES_DATA[chosenVariant-1];
const grade=n=>Math.round(n); // 12 tasks, 1 point each
function renderExercises(){
 exerciseRoot=document.getElementById('exercise-root');
 if(!exerciseRoot)return;
 exerciseRoot.innerHTML=`<section class="exercise-landing comic"><img src="assets/exercises.png" alt="Комікс ВПРАВИ — розумові завдання, тести й перевірка"><div class="exercise-welcome"><span class="pill">🐍 Тренажер Python</span><h1>ВПРАВИ!</h1><p>Обери варіант і перевір, наскільки добре розумієш змінні, константи, імена та синтаксис Python.</p><label for="variant-picker">Оберіть варіант</label><select id="variant-picker">${[1,2,3,4,5].map(i=>`<option value="${i}" ${i===chosenVariant?'selected':''}>Варіант ${i}</option>`).join('')}</select></div></section><section class="exercise-tabs" aria-label="Вибір вправи"><button type="button" data-ex="yesno">👍 Так або ні 👎</button><button type="button" data-ex="test">📝 Тест</button><button type="button" data-ex="truth">✅ Правда чи неправда ❌</button></section><div id="exercise-work"></div><section class="exercise-panel comic submission-panel" id="submission-area"></section>`;
 renderSubmitArea();
 document.getElementById('variant-picker').addEventListener('change',e=>{chosenVariant=Number(e.target.value);answers={};testAnswers={};currentQuestion=0;results={};showExercise('yesno');renderSubmitArea()});
 document.querySelectorAll('[data-ex]').forEach(b=>b.addEventListener('click',()=>showExercise(b.dataset.ex)));
 showExercise('yesno');
}
function showExercise(kind){
 renderSubmitArea();
 document.querySelectorAll('[data-ex]').forEach(b=>b.classList.toggle('active',b.dataset.ex===kind));
 if(kind==='test')renderTest();else renderBinary(kind);
}
function renderBinary(kind){
 const isNames=kind==='yesno',items=isNames?data().names:data().truth;
 const state=answers[kind]??(answers[kind]=Array(12).fill(null));
 const result=results[kind];
 const first=isNames?'👍 Так':'✅ Правда',second=isNames?'👎 Ні':'❌ Неправда';
 document.getElementById('exercise-work').innerHTML=`<section class="exercise-panel comic"><h2>${isNames?'Вправа 1. «Так або ні»':'Вправа 3. «Правда чи неправда»'}</h2><p class="exercise-instruction">${isNames?'Визнач, чи можна використати наведене ім’я для змінної або константи в Python.':'Оціни кожне твердження про змінні, константи та синтаксис Python.'} Усього 12 карток: 6 правильних і 6 неправильних.</p><div class="progress-line">Відповідей: <b id="answered-count">${state.filter(v=>v!==null).length}</b> із 12 <span>6 правильних · 6 неправильних</span></div><div class="statement-list">${items.map((it,i)=>`<article class="statement" data-row="${i}"><span class="statement-num">${i+1}.</span><div class="statement-body"><strong class="statement-text ${isNames?'code-name':''}">${escapeHTML(it.text)}</strong><div class="choice-row"><button type="button" data-choice="true" data-index="${i}" class="${state[i]===true?'chosen good':''}">${first}</button><button type="button" data-choice="false" data-index="${i}" class="${state[i]===false?'chosen bad':''}">${second}</button></div><div class="answer-feedback" id="feedback-${i}"></div></div></article>`).join('')}</div><div class="exercise-actions"><button class="action-check" id="check-binary">Перевірити відповіді</button><button class="action-reset" id="reset-binary">Спробувати ще раз</button></div><div class="result-box" id="binary-result" role="status" aria-live="polite"></div></section>`;
 document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{
  state[Number(b.dataset.index)]=b.dataset.choice==='true';results[kind]=null;
  const row=b.closest('.statement');row.querySelectorAll('[data-choice]').forEach(c=>c.className=state[Number(c.dataset.index)]===(c.dataset.choice==='true')?'chosen '+(c.dataset.choice==='true'?'good':'bad'):'');
  row.querySelector('.answer-feedback').textContent='';document.getElementById('binary-result').textContent='';document.getElementById('answered-count').textContent=state.filter(v=>v!==null).length;
 }));
 document.getElementById('check-binary').onclick=()=>{
  if(state.some(v=>v===null)){document.getElementById('binary-result').textContent='Спочатку оберіть відповідь для всіх 12 карток.';return}
  const alreadyChecked=Number.isInteger(results[kind]);
  let correct=0;items.forEach((it,i)=>{let ok=state[i]===it.correct;if(ok)correct++;let el=document.getElementById('feedback-'+i);el.className='answer-feedback '+(ok?'feedback-ok':'feedback-bad');el.textContent=(ok?'✓ Правильно. ':'✗ Помилка. Правильна відповідь: '+(it.correct?first:second)+'. ')+it.why});
  if(!alreadyChecked)recordResult(kind,correct);document.getElementById('binary-result').innerHTML=`<strong>Результат: ${correct} із 12 · Оцінка: ${grade(correct)}/12</strong><p>${correct===12?'Чудово! Усі відповіді правильні.':'Переглянь пояснення біля карток і спробуй ще раз.'}</p>`;
 };
 document.getElementById('reset-binary').onclick=()=>{answers[kind]=Array(12).fill(null);results[kind]=null;renderBinary(kind);renderSubmitArea()};
 if(result!=null)document.getElementById('check-binary').click();
}
function renderTest(){
 const qs=data().test;
 const q=qs[currentQuestion];const selected=testAnswers[currentQuestion]||[];
 document.getElementById('exercise-work').innerHTML=`<section class="exercise-panel comic"><h2>Вправа 2. «Тест»</h2><p class="exercise-instruction">12 запитань. Обери одну або кілька правильних відповідей — це зазначено біля кожного запитання. Кожне правильно виконане завдання — 1 бал.</p><div class="test-progress">Запитання <strong>${currentQuestion+1} з 12</strong><div class="test-progress-bar"><span style="width:${(currentQuestion+1)/12*100}%"></span></div></div><article class="question-card"><span class="pill">${q.multiple?'Обери всі правильні відповіді':'Обери одну правильну відповідь'}</span><h3>${escapeHTML(q.q)}</h3><div class="test-options">${q.options.map((o,i)=>`<button type="button" data-opt="${i}" class="${selected.includes(i)?'selected':''}"><span class="option-letter">${'АБВГ'[i]}</span><code>${escapeHTML(o)}</code>${selected.includes(i)?'<span aria-hidden="true">✓</span>':''}</button>`).join('')}</div></article><div class="exercise-actions"><button class="action-reset" id="test-prev" ${currentQuestion===0?'disabled':''}>← Назад</button><button class="action-check" id="test-next">${currentQuestion===11?'Перевірити тест':'Далі →'}</button><button class="action-reset" id="test-reset">Почати заново</button></div><div class="result-box" id="test-result" role="status" aria-live="polite"></div></section>`;
 document.querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>{const idx=Number(b.dataset.opt);let a=testAnswers[currentQuestion]||[];if(q.multiple){a=a.includes(idx)?a.filter(v=>v!==idx):[...a,idx]}else{a=[idx]}testAnswers[currentQuestion]=a;renderTest()});
 document.getElementById('test-prev').onclick=()=>{currentQuestion--;renderTest()};
 document.getElementById('test-reset').onclick=()=>{testAnswers={};currentQuestion=0;results.test=null;renderTest();renderSubmitArea()};
 document.getElementById('test-next').onclick=()=>{
  if(!(testAnswers[currentQuestion]||[]).length){document.getElementById('test-result').textContent='Оберіть відповідь, перш ніж продовжити.';return}
  if(currentQuestion<11){currentQuestion++;renderTest()}else showTestResults();
 };
}
function showTestResults(){
 const qs=data().test;
 const incomplete=qs.findIndex((_,i)=>!(testAnswers[i]||[]).length);
 if(incomplete!==-1){currentQuestion=incomplete;renderTest();document.getElementById('test-result').textContent='Дайте відповідь на це запитання.';return}
 let correct=0;const cards=qs.map((q,i)=>{
  const selected=[...(testAnswers[i]||[])].sort((a,b)=>a-b),expected=[...q.answers].sort((a,b)=>a-b);
  const ok=JSON.stringify(selected)===JSON.stringify(expected);if(ok)correct++;
  return `<article class="review-item ${ok?'review-ok':'review-bad'}"><strong>${i+1}. ${escapeHTML(q.q)}</strong><p>${ok?'✓ Правильно':'✗ Помилка'} · Твоя відповідь: ${selected.map(n=>'АБВГ'[n]).join(', ')} · Правильно: ${expected.map(n=>'АБВГ'[n]).join(', ')}</p><small>${escapeHTML(q.why)}</small></article>`;
 }).join('');
 recordResult('test',correct);
 document.getElementById('exercise-work').innerHTML=`<section class="exercise-panel comic"><h2>Результати тесту</h2><div class="result-box"><strong>Правильно: ${correct} із 12 · Оцінка: ${correct}/12</strong></div><div class="review-list">${cards}</div><div class="exercise-actions"><button class="action-check" id="test-again">Пройти тест ще раз</button></div></section>`;
 document.getElementById('test-again').onclick=()=>{testAnswers={};currentQuestion=0;results.test=null;renderTest();renderSubmitArea()};
}
window.renderExercises=renderExercises;
