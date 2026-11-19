/* Shared compact header and persistent contents visibility on every study page. */
(() => {
  if(document.body.hasAttribute('data-site-chrome'))return;
  document.body.setAttribute('data-site-chrome','');
  const english=()=>document.documentElement.lang.startsWith('en');
  let toc=document.querySelector('.sidebar')||document.querySelector('nav.toc')||document.querySelector('.toolbar nav');
  let header=document.querySelector('.topbar')||document.querySelector('.toolbar');
  let bar=header?.querySelector('.bar-content,.bar,:scope>.wrap');
  let brand=bar?.querySelector('.brand'),tools=bar?.querySelector('.bar-tools,.tools');
  if(!header){
    const top=document.querySelector('main>.top');
    if(top){header=top;bar=top;brand=top.querySelector('.k');tools=top.querySelector('.langsw');}
    else{
      header=document.createElement('header');header.className='site-utilitybar';
      bar=document.createElement('div');brand=document.createElement('div');tools=document.createElement('div');
      const home=document.createElement('a');home.href='index.html';home.textContent='⌂';home.setAttribute('aria-label','Home / 首页');
      const title=document.createElement('span');title.textContent=location.pathname.includes('lecture-script')?'ECE723 · Lecture script':'ECE723 · 课堂复习';
      brand.append(home,title);bar.append(brand,tools);header.append(bar);document.body.prepend(header);
      const languages=toc?.querySelector('.langsw');if(languages)tools.append(languages);
    }
  }
  if(!bar)bar=header;
  if(!brand){brand=document.createElement('div');const home=document.createElement('a');home.href='index.html';home.textContent='⌂ ECE723';brand.append(home);bar.prepend(brand);}
  if(!tools){tools=document.createElement('div');for(const child of [...bar.children])if(child!==brand)tools.append(child);bar.append(tools);}
  header.classList.add('site-topbar');bar.classList.add('site-bar');brand.classList.add('site-brand');tools.classList.add('site-tools');
  let generated=false;
  if(!toc){
    generated=true;toc=document.createElement('aside');toc.className='site-generated-toc';toc.setAttribute('aria-label','目录 / Contents');document.body.append(toc);
  }
  toc.setAttribute('data-site-toc','');if(!toc.id)toc.id='site-page-toc';
  // Keep reading headers focused; secondary controls remain in the contents.
  if (/\/(?:reading(?:-en|-bilingual)?|bilingual)\.html$/.test(location.pathname)) {
    const extra=document.createElement('details');extra.className='site-extra-tools';
    const summary=document.createElement('summary');summary.textContent=english()?'More tools':'更多工具';
    const content=document.createElement('div');content.className='site-extra-body';
    for(const child of [...tools.children])if(!child.matches('.hl-open,.hl-mode,.langsw,#reader-font-size'))content.append(child);
    if(content.childElementCount){extra.append(summary,content);toc.append(extra);}
  }
  const toggle=document.createElement('button');toggle.type='button';toggle.className='site-toc-toggle';toggle.dataset.en='☰ Contents';toggle.dataset.zh='☰ 目录';toggle.textContent=english()?toggle.dataset.en:toggle.dataset.zh;toggle.setAttribute('aria-controls',toc.id);brand.prepend(toggle);
  function outline(){if(!generated)return;toc.replaceChildren();const label=document.createElement('strong');label.textContent=english()?'Contents':'目录';toc.append(label);[...document.querySelectorAll('main h2,main h3')].forEach((h,i)=>{if(!h.getClientRects().length||h.closest('[data-hl-ui]'))return;if(!h.id)h.id='site-heading-'+i;const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent.trim();toc.append(a);});}
  let open;try{const saved=localStorage.getItem('ece723:contents-visible');open=saved===null?!generated&&innerWidth>1000:saved==='1';}catch{open=!generated&&innerWidth>1000;}
  function setOpen(value,save=true){open=value;document.body.classList.toggle('site-toc-hidden',!open);toggle.setAttribute('aria-expanded',String(open));toggle.title=english()?(open?'Hide contents':'Show contents'):(open?'收起目录':'显示目录');if(open){const details=toc.querySelector(':scope>details');if(details)details.open=true;outline();}if(save)try{localStorage.setItem('ece723:contents-visible',open?'1':'0');}catch{}}
  setOpen(open,false);toggle.addEventListener('click',()=>setOpen(!open));
  document.addEventListener('click',e=>{if(generated&&e.target.closest('.langsw'))setTimeout(outline,0);});
  new ResizeObserver(()=>document.documentElement.style.setProperty('--bar',Math.ceil(header.getBoundingClientRect().height)+'px')).observe(header);
})();
