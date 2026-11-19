(() => {
  const sidebar=document.getElementById('sections'),links=[...sidebar.querySelectorAll('a[href^="#"]')];
  const bar=document.querySelector('.topbar');
  new ResizeObserver(()=>document.documentElement.style.setProperty('--bar',Math.ceil(bar.getBoundingClientRect().height)+'px')).observe(bar);
  const small=matchMedia('(max-width:1100px)');if(small.matches)sidebar.open=false;
  function reveal(id){const a=links.find(x=>x.hash==='#'+id);if(a)for(let p=a.parentElement;p&&p!==sidebar;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}
  function setMode(mode,save=true){
    if(!['both','en','zh'].includes(mode))mode='both';
    document.body.classList.toggle('view-en',mode==='en');document.body.classList.toggle('view-zh',mode==='zh');
    document.documentElement.lang=mode==='en'?'en':'zh-Hans';
    document.querySelectorAll('[data-view]').forEach(a=>{a.classList.toggle('on',a.dataset.view===mode);a.setAttribute('aria-pressed',a.dataset.view===mode?'true':'false')});
    document.querySelectorAll('[data-en][data-zh]').forEach(e=>{e.textContent=mode==='en'?e.dataset.en:e.dataset.zh});
    if(save){try{localStorage.setItem('bilingual-view',mode)}catch{}const u=new URL(location.href);u.searchParams.set('view',mode);history.replaceState(null,'',u);}
  }
  let stored;try{stored=localStorage.getItem('bilingual-view')}catch{}
  setMode(new URLSearchParams(location.search).get('view')||stored||'both',false);
  document.querySelector('.langsw').addEventListener('click',e=>{const a=e.target.closest('[data-view]');if(!a)return;e.preventDefault();let anchor;for(const p of document.querySelectorAll('main>.pair,main>.equation'))if(p.getBoundingClientRect().bottom>bar.getBoundingClientRect().bottom+20){anchor=p;break;}const top=anchor?.getBoundingClientRect().top;setMode(a.dataset.view);if(anchor)window.scrollBy({top:anchor.getBoundingClientRect().top-top,behavior:'instant'});});
  document.getElementById('equation-jump').addEventListener('submit',e=>{e.preventDefault();const i=document.getElementById('eq-input');if(!i.validity.valid)return;const id='eq-'+i.valueAsNumber;reveal(id);if(location.hash==='#'+id)document.getElementById(id)?.scrollIntoView({block:'center'});else location.hash=id;});
  links.forEach(a=>a.addEventListener('click',()=>{reveal(a.hash.slice(1));if(small.matches)sidebar.open=false;}));
  addEventListener('hashchange',()=>reveal(location.hash.slice(1)));reveal(location.hash.slice(1));
  const targets=links.map(a=>document.getElementById(a.hash.slice(1))).filter(Boolean);let queued=false;
  function update(){queued=false;const offset=bar.getBoundingClientRect().height+65;let active=targets[0];for(const t of targets){if(t.getBoundingClientRect().top<=offset)active=t;else break;}links.forEach(a=>a.classList.toggle('active',a.hash==='#'+active?.id));}
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});update();
})();
