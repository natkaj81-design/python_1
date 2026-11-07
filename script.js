"use strict";
const lessons=[
 {id:"variables",title:"Змінна",image:"variables.jpg",subtitle:"Ім’я для значення",intro:"Дізнайся, як зберігати значення у змінних і використовувати їх у програмі."},
 {id:"names",title:"Імена змінних",image:"names.jpg",subtitle:"Правила називання",intro:"Ознайомся з правилами створення імен змінних у Python."},
 {id:"constants",title:"Константа",image:"constants.jpg",subtitle:"Сталі значення",intro:"Дізнайся, для чого використовують константи та як їх прийнято називати."},
 {id:"syntax",title:"Синтаксис",image:"syntax.jpg",subtitle:"Правила запису коду",intro:"Розберися з відступами, двокрапкою та коментарями у Python."}
];
const app=document.getElementById("app"),nav=document.getElementById("nav");
function drawNav(active){nav.innerHTML=[["home","🏠 Головна"],...lessons.map(l=>[l.id,l.title]),["exercises","✏️ Вправи"]].map(([id,t])=>`<a href="#${id}" class="${id===active?'active':''}">${t}</a>`).join("")}
function home(){drawNav("home");app.innerHTML=`<section class="hero comic"><img src="assets/home.jpg" alt="Python з нуля — навчальний комікс"><div><h1>Python з нуля!</h1><p>Зрозумій код, а не зубри команди!</p><p class="hero-next">Теми. Вправи.<br><strong>А далі — миттєва перевірка!</strong></p><a class="cta" href="#variables">Почати навчання →</a></div></section><section class="tiles" aria-label="Навчальні теми">${lessons.map((l,i)=>`<a href="#${l.id}" class="tile comic"><img src="assets/${l.image}" alt="Комікс до теми ${l.title}"><h2>${i+1}. ${l.title}</h2><p>Переглянути тему</p></a>`).join("")}<a href="#exercises" class="tile comic"><img src="assets/exercises.png" alt="Комікс Вправи"><h2>5. Вправи</h2><p>5 варіантів · 3 вправи</p></a></section>`}
function lesson(id){const l=lessons.find(x=>x.id===id);if(!l){home();return}drawNav(id);app.innerHTML=`<a class="back" href="#home">← До головної</a><section class="lesson-head comic"><img class="lesson-cover" src="assets/${l.image}" alt="Навчальний комікс: ${l.title}"><div class="lesson-copy"><span class="pill">🐍 Тема ${lessons.indexOf(l)+1}</span><h1 class="lesson-title">${l.title}</h1><p class="subtitle">${l.subtitle}</p><p>${l.intro}</p></div></section><a class="back bottom-back" href="#home">← Повернутися до тем</a>`}
function route(){const id=decodeURIComponent(location.hash.slice(1))||"home";id==="home"?home():id==="exercises"?(drawNav("exercises"),app.innerHTML=`<div id="exercise-root"></div>`,renderExercises()):lesson(id);window.scrollTo(0,0)}
window.addEventListener("hashchange",route);route();
