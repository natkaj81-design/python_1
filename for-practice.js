"use strict";
function renderForPractice(){
 const root=document.getElementById('for-practice-root'); if(!root)return;
 root.innerHTML=`<a class="back" href="#for-examples">← До прикладів</a><section class="comic np-hero"><img class="np-cover" src="assets/exercises.webp" alt="Вправи"><div><span class="pill">🌟 Практикум Python</span><h1>Вправи: цикли</h1><p>Перевір знання про цикл for та range().</p></div></section><section class="comic np-work"><h2>Блок 1. Вправи: цикли</h2><p>Перший блок підготовлено для додавання інтерактивних завдань.</p></section>`;
}
