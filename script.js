/* ===== SamudraFisika - script.js (dipakai semua halaman) ===== */
const $=id=>document.getElementById(id);
const fmt=(x,d=0,g=true)=>x.toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d,useGrouping:g});

/* 1. Ilustrasi header: langit senja, matahari, bulan, ombak bergerak, perahu layar (SVG buatan sendiri) */
const scene=$('scene');
if(scene){
  const wave=(y,c,o)=>`<path d="M-80 ${y} q60-24 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 L1200 270 L-80 270Z" fill="${c}" opacity="${o}"/>`;
  scene.innerHTML=`<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2a5e"/><stop offset=".6" stop-color="#e2557a"/><stop offset="1" stop-color="#ffb15c"/></linearGradient></defs>
  <rect width="1000" height="260" fill="url(#sk)"/>
  <circle cx="760" cy="140" r="46" fill="#ffe08a"/>
  <circle cx="150" cy="55" r="22" fill="#f1f5f9"/><circle cx="160" cy="50" r="22" fill="#0a2a5e" opacity=".55"/>
  <g fill="#fff" opacity=".8"><circle cx="300" cy="30" r="2"/><circle cx="420" cy="60" r="2"/><circle cx="560" cy="25" r="2"/><circle cx="880" cy="40" r="2"/></g>
  <g class="wv wv3">${wave(168,'#1d7fd1',.9)}</g>
  <g class="boat"><path d="M380 178 L520 178 L500 200 L400 200Z" fill="#7c2d12"/><line x1="450" y1="178" x2="450" y2="105" stroke="#3b2a1a" stroke-width="4"/><path d="M454 108 L454 172 L510 172Z" fill="#fff"/><path d="M446 118 L446 172 L402 172Z" fill="#fde68a"/></g>
  <g class="wv wv2">${wave(196,'#0b6fd6',.95)}</g>
  <g class="wv">${wave(224,'#0a4a9c',1)}</g>`;
}

/* 2. Mode terang/gelap (disimpan di browser) */
$('mode').onclick=()=>{
  const cur=document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  const next=cur==='dark'?'light':'dark';
  document.documentElement.dataset.theme=next;
  try{localStorage.theme=next}catch(e){}
};

/* 3. Artikel: estimasi waktu baca + daftar isi otomatis */
const art=document.querySelector('article');
if(art){
  const words=[...art.querySelectorAll('p,li,h2')].filter(e=>!e.closest('.src,.sim,.key')).map(e=>e.textContent).join(' ').split(/\s+/).length;
  const rd=art.querySelector('[data-read]');if(rd)rd.textContent=Math.max(1,Math.round(words/200));
  const toc=art.querySelector('.toc');
  art.querySelectorAll('h2').forEach((h,i)=>{h.id='bagian-'+i;
    const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;toc.appendChild(a)});
}

/* 4. Beranda: angka sorotan menghitung naik */
document.querySelectorAll('[data-n]').forEach(el=>{
  const target=+el.dataset.n;let t0=null;
  const step=ts=>{t0=t0||ts;const p=Math.min((ts-t0)/1200,1);
    el.textContent=fmt(Math.round(target*p));if(p<1)requestAnimationFrame(step)};
  requestAnimationFrame(step)});

/* 5. Simulator kapal (prinsip Archimedes): V = m / rho ; sarat = V / (panjang x lebar) */
if($('ms')){
  const H=15,PX=4,WATER_Y=80; // tinggi lambung 15 m, skala 4 px per meter
  const upd=()=>{
    const m=+$('ms').value*1000,L=+$('pj').value,B=+$('lb').value,rho=+$('md').value;
    $('mso').textContent=fmt(+$('ms').value);$('pjo').textContent=L;$('lbo').textContent=B;
    const V=m/rho;                 // volume air yang harus dipindahkan (m3)
    const sarat=V/(L*B);           // kedalaman lambung yang terendam (m)
    const free=H-sarat;            // tinggi lambung di atas air (m)
    $('vo').textContent=fmt(V);$('sr').textContent=fmt(sarat,1);$('fb').textContent=fmt(Math.max(free,0),1);
    const top=Math.min(WATER_Y-free*PX,WATER_Y+50);     // posisi puncak lambung pada gambar
    $('ship').setAttribute('transform',`translate(0,${top-20})`);
    const st=$('st');
    if(free<=0)st.textContent='🔴 Tenggelam! Volume lambung tidak cukup untuk memindahkan air seberat kapal.';
    else if(free<3)st.textContent='🟠 Hampir tenggelam: lambung hanya '+fmt(free,1)+' m di atas air.';
    else st.textContent='🟢 Terapung: gaya apung sama dengan berat kapal.';
  };
  ['ms','pj','lb'].forEach(id=>$(id).oninput=upd);$('md').onchange=upd;upd();
}

/* 6. Simulator pasang surut: H(t) = cos(2pi t/12,42) + 0,456 cos(2pi t/12 + fase) ; fase = 2pi * hari / 14,77 */
if($('dy')){
  const Ps=0.456;                        // perbandingan amplitudo Matahari terhadap Bulan (1/2,19)
  const upd=()=>{
    const d=+$('dy').value;$('dyo').textContent=d;
    const phi=2*Math.PI*d/14.77;let pts=[],mx=-9,mn=9;
    for(let t=0;t<=48;t+=0.25){
      const h=Math.cos(2*Math.PI*t/12.42)+Ps*Math.cos(2*Math.PI*t/12+phi);
      mx=Math.max(mx,h);mn=Math.min(mn,h);
      pts.push((20+t/48*560).toFixed(1)+','+(75-h*42).toFixed(1));
    }
    $('tl').setAttribute('points',pts.join(' '));
    const ratio=(mx-mn)/(2*(1+Ps))*100;
    $('rg').textContent=Math.round(ratio);
    const near=(x)=>Math.min(Math.abs(d-x),Math.abs(d-x-29.5),Math.abs(d-x+29.5))<=1.5;
    let fase='Fase peralihan';
    if(near(0))fase='🌑 Bulan baru: Matahari, Bumi, Bulan segaris';
    else if(near(14.77))fase='🌕 Bulan purnama: Matahari, Bumi, Bulan segaris';
    else if(near(7.4))fase='🌓 Perbani awal (kuartal pertama): sudut siku-siku';
    else if(near(22.1))fase='🌗 Perbani akhir (kuartal ketiga): sudut siku-siku';
    $('fs').textContent=fase;
    $('jn').textContent=ratio>85?'Pasang purnama (spring tide)':ratio<55?'Pasang perbani (neap tide)':'Pasang peralihan';
  };
  $('dy').oninput=upd;upd();
}

/* 7. Simulator tsunami: v = sqrt(g d) ; waktu = jarak / v */
if($('dk')){
  const g=9.8;
  const upd=()=>{
    const d=+$('dk').value,km=+$('jr').value;
    $('dko').textContent=fmt(d);$('jro').textContent=fmt(km);
    const v=Math.sqrt(g*d);                 // m/s
    const sec=km*1000/v,min=sec/60;
    $('vm').textContent=fmt(v);$('vk').textContent=fmt(v*3.6);
    $('bv').style.width=(v/Math.sqrt(g*6000)*100)+'%';
    $('wt').textContent=min>=60?fmt(Math.floor(min/60))+' jam '+fmt(Math.round(min%60))+' menit':fmt(Math.max(1,Math.round(min)))+' menit';
    $('wn').textContent=min<5?'⚠️ Sangat cepat: kurang dari 5 menit. Bila merasakan gempa kuat di pantai, jangan menunggu peringatan, segera menjauh ke tempat tinggi.':'Waktu tiba lebih lama, tetapi tetap ikuti arahan BMKG dan BPBD setempat.';
  };
  $('dk').oninput=$('jr').oninput=upd;upd();
}
