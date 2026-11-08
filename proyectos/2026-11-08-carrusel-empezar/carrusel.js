const { chromium } = require('playwright');
const out = process.argv[2];
const C = { mar:'#F4F3EE', car:'#1B1A16', ter:'#C36040', gri:'#5B5853', bei:'#D9CCBB', bla:'#FFFFFF' };
const base = `
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@300;400;700&display=block" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1080px;overflow:hidden}
body{background:var(--bg);font-family:'Oswald',sans-serif;color:${C.car};position:relative}
.safe{position:absolute;left:150px;top:90px;width:780px;height:900px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center;font:400 24px 'Oswald';letter-spacing:3px;color:${C.gri};text-transform:uppercase}
.top b{color:${C.ter};font-weight:700}
h1{font-family:'Anton';font-weight:400;text-transform:uppercase;line-height:1.04;letter-spacing:.5px}
.t{color:${C.ter}}
.sub{font:700 44px/1.15 'Oswald'}
.txt{font:300 34px/1.4 'Oswald';color:${C.gri}}
.foot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;font:400 24px 'Oswald';color:${C.gri};letter-spacing:1px}
.rule{height:3px;background:${C.bei};width:100%}
</style>`;
const top = (n, tag) => `<div class="top"><span>${tag}</span><span><b>0${n}</b> / 05</span></div>`;
const foot = (r) => `<div class="foot"><span>@carlosbarcoc</span><span>${r}</span></div>`;

const notebook = `
<svg width="780" height="280" viewBox="0 0 920 330">
 <defs>
  <linearGradient id="luz" x1="1" y1="0" x2="0" y2="1">
   <stop offset="0" stop-color="#F2C9A4" stop-opacity=".75"/><stop offset=".6" stop-color="#F4F3EE" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="mesa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4D7C6"/><stop offset="1" stop-color="#D9CCBB"/></linearGradient>
 </defs>
 <rect x="0" y="40" width="920" height="290" rx="22" fill="url(#mesa)"/>
 <line x1="0" y1="140" x2="920" y2="140" stroke="#CDBFAC" stroke-width="2"/>
 <line x1="0" y1="240" x2="920" y2="240" stroke="#CDBFAC" stroke-width="2"/>
 <polygon points="920,40 920,250 380,330 140,330 640,40" fill="url(#luz)"/>
 <g transform="translate(250,70)">
  <ellipse cx="215" cy="238" rx="250" ry="18" fill="#1B1A16" opacity=".14"/>
  <path d="M0 18 Q105 0 210 22 L210 232 Q105 212 0 228 Z" fill="#FFFFFF" stroke="#D9CCBB" stroke-width="3"/>
  <path d="M430 18 Q325 0 220 22 L220 232 Q325 212 430 228 Z" fill="#FFFFFF" stroke="#D9CCBB" stroke-width="3"/>
  <rect x="208" y="20" width="14" height="214" fill="#E9E1D6"/>
  ${[60,90,120,150,180].map(y=>`<line x1="28" y1="${y}" x2="186" y2="${y-3}" stroke="#D9CCBB" stroke-width="2"/><line x1="244" y1="${y-3}" x2="402" y2="${y}" stroke="#D9CCBB" stroke-width="2"/>`).join('')}
  <path d="M34 58 q30 -10 60 -2 t60 -4" stroke="#5B5853" stroke-width="3" fill="none"/>
  <path d="M34 88 q24 -8 48 0 t44 -2" stroke="#5B5853" stroke-width="3" fill="none"/>
  <path d="M250 55 l12 12 l22 -24" stroke="#C36040" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M300 56 q30 -8 70 -2" stroke="#5B5853" stroke-width="3" fill="none"/>
  <g transform="translate(470,120) rotate(-28)">
   <rect x="0" y="0" width="180" height="16" rx="8" fill="#1B1A16"/><polygon points="180,0 206,8 180,16" fill="#D9CCBB"/>
   <rect x="0" y="0" width="30" height="16" rx="8" fill="#C36040"/>
  </g>
 </g>
 <g transform="translate(90,95)">
  <ellipse cx="50" cy="118" rx="62" ry="10" fill="#1B1A16" opacity=".12"/>
  <path d="M0 20 L100 20 L92 112 Q50 122 8 112 Z" fill="#FFFFFF" stroke="#D9CCBB" stroke-width="3"/>
  <path d="M100 40 q34 4 26 34 q-6 20 -32 18" stroke="#D9CCBB" stroke-width="8" fill="none"/>
  <ellipse cx="50" cy="22" rx="48" ry="8" fill="#8A5A3C"/>
 </g>
</svg>`;

const clock = `
<svg width="260" height="260" viewBox="-150 -150 300 300">
 <circle r="140" fill="#FFFFFF" stroke="${C.bei}" stroke-width="6"/>
 <path d="M0 0 L0 -118 A118 118 0 0 1 102.2 59 Z" fill="${C.ter}" opacity=".9"/>
 ${Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return `<line x1="${Math.sin(a)*124}" y1="${-Math.cos(a)*124}" x2="${Math.sin(a)*134}" y2="${-Math.cos(a)*134}" stroke="${C.car}" stroke-width="4"/>`}).join('')}
 <circle r="10" fill="${C.car}"/>
</svg>`;

const slides = [
// 1 Gancho
{bg:C.mar, html:`<div class="safe">
 ${top(1,'Marca personal · Marketing')}
 <h1 style="font-size:66px;margin-top:40px">Puedes empezar en marketing sin quitarle tiempo a tu familia</h1>
 <p class="sub" style="margin-top:26px">Tu día termina a las <span class="t">5 p. m.</span></p>
 <div style="margin-top:auto">${notebook}</div>
 <div class="foot" style="margin-top:22px"><span>@carlosbarcoc</span><span>Desliza →</span></div>
</div>`},
// 2 Tres pasos
{bg:C.bla, html:`<div class="safe">
 ${top(2,'El plan')}
 <h1 style="font-size:76px;margin-top:40px">3 pasos para <span class="t">empezar</span></h1>
 <div style="display:flex;flex-direction:column;flex:1;justify-content:space-evenly;padding:20px 0">
 ${[['Elige una sola habilidad.','Si quieres aprender todo, no avanzas en nada.'],
    ['Usa IA para organizar lo que aprendes.','Resúmenes, planes y repasos en minutos.'],
    ['Practica un contenido por semana.','La constancia pesa más que la intensidad.']].map((s,i)=>`
  <div style="display:flex;align-items:center;gap:34px;background:#fff;border:3px solid ${C.bei};border-radius:22px;padding:24px 30px;box-shadow:0 10px 0 ${C.mar}">
   <div style="font:400 92px/1 'Anton';color:${C.ter};width:70px;text-align:center">${i+1}</div>
   <div style="width:3px;align-self:stretch;background:${C.bei}"></div>
   <div><div style="font:700 36px/1.15 'Oswald'">${s[0]}</div><div style="font:300 28px/1.35 'Oswald';color:${C.gri};margin-top:6px">${s[1]}</div></div>
  </div>`).join('')}
 </div>
 ${foot('Sigue →')}
</div>`},
// 3 Tiempo
{bg:C.mar, html:`<div class="safe">
 ${top(3,'Tiempo realista')}
 <h1 style="font-size:76px;margin-top:40px">20 minutos al día</h1>
 <div class="rule" style="width:120px;margin-top:28px;background:${C.bei};height:6px"></div>
 <div style="display:flex;align-items:center;gap:40px;margin-top:auto;margin-bottom:auto">
  <div style="flex:none">${clock}</div>
  <div>
   <p class="sub" style="font-size:42px">No necesitas madrugar ni dejar tu empleo.</p>
   <p class="txt" style="margin-top:22px">Con constancia, <span class="t" style="font-weight:700">20 minutos</span> bastan para avanzar.</p>
  </div>
 </div>
 ${foot('Sigue →')}
</div>`},
// 4 Honestidad
{bg:C.car, html:`<div class="safe" style="color:#fff">
 <div class="top" style="color:#B9B4AA"><span>Honestidad</span><span><b>04</b> / 05</span></div>
 <div style="margin-top:auto;margin-bottom:auto">
  <h1 style="font-size:76px;color:#fff">Sin promesas de<br>dinero rápido</h1>
  <div style="height:2px;width:100%;background:${C.ter};margin:44px 0"></div>
  <p class="sub" style="color:#fff;font-size:42px">Esto es un proceso.</p>
  <p style="font:300 34px/1.45 'Oswald';color:#D8D3CA;margin-top:16px">Los resultados dependen de tu constancia y de cuánto practiques.</p>
 </div>
 <div class="foot" style="color:#B9B4AA"><span>@carlosbarcoc</span><span>Sigue →</span></div>
</div>`},
// 5 Cierre
{bg:C.mar, html:`<div class="safe" style="align-items:center;text-align:center">
 <div class="top" style="width:100%"><span>Tu turno</span><span><b>05</b> / 05</span></div>
 <h1 style="font-size:76px;margin-top:56px">Empieza hoy</h1>
 <p class="txt" style="margin-top:18px;color:${C.gri}">Escribe <b style="color:${C.ter};font-weight:700">START</b> y te comparto la guía para arrancar.</p>
 <div style="margin-top:auto;margin-bottom:auto;background:#fff;border:3px solid ${C.bei};border-radius:28px;padding:28px 90px">
  <div style="font:400 210px/1 'Anton';color:${C.ter};letter-spacing:6px">START</div>
 </div>
 <p class="txt" style="font-size:28px">Escríbelo en los comentarios 💬</p>
 <div style="margin-top:36px;font:700 26px 'Oswald';letter-spacing:2px;color:${C.car}">@carlosbarcoc</div>
</div>`},
];
(async()=>{
 const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1080,height:1080},deviceScaleFactor:1});
 for (let i=0;i<slides.length;i++){
  const s=slides[i];
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8">${base}<style>:root{--bg:${s.bg}}</style></head><body>${s.html}</body></html>`,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);
  const over = await p.evaluate(()=>[...document.querySelectorAll('.safe *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.left<149||r.top<89||r.right>931||r.bottom>991)}).map(e=>e.tagName+':'+e.textContent.slice(0,20)));
  if(over.length) console.log('slide',i+1,'fuera del margen:',over);
  await p.screenshot({path:`${out}/carrusel-0${i+1}.png`});
 }
 await b.close(); console.log('ok');
})();
