"""Install one persistent reader-size control on both reading pages."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parent.parent
CSS='''
@media screen {
 :root{--reader-scale:1.15}
 .paper,.overview,.recap{font-size:calc(1.05rem * var(--reader-scale))}
 .guide{font-size:calc(.97rem * var(--reader-scale))}
 .plain{font-size:calc(.93rem * var(--reader-scale))}
 .plain-syms{font-size:calc(.9rem * var(--reader-scale))}
 .guide-tag,.plain-tag,.plain-sub,.gist-k{font-size:calc(.72rem * var(--reader-scale))}
 .sym-say,.skim{font-size:calc(.8rem * var(--reader-scale))}
 .howto{font-size:calc(.92rem * var(--reader-scale))}
 .ov-card{font-size:calc(.95rem * var(--reader-scale))}
 .ov-card h4{font-size:calc(1rem * var(--reader-scale))}
 .ov-table{font-size:calc(.9rem * var(--reader-scale))}
 .paper table{font-size:calc(.94rem * var(--reader-scale))}
 .paper .refs{font-size:calc(.93rem * var(--reader-scale))}
 .recap details{font-size:calc(.95rem * var(--reader-scale))}
 .unit-h2>.sec-h{font-size:calc(1.55rem * var(--reader-scale))}
 .unit-h3>.sec-h{font-size:calc(1.2rem * var(--reader-scale))}
 #reader-font-size{font-variant-numeric:tabular-nums;min-width:94px}
}
'''
CSS=CSS.replace(' .', ' html[lang] .')
CSS=CSS.replace(' #reader-font-size', ' .topbar .tools #reader-font-size')
CSS=CSS.replace('font-variant-numeric:tabular-nums;min-width:94px', 'font-variant-numeric:tabular-nums;min-width:94px;font-size:12px;line-height:18px')
CSS += '''
@media screen {
 html[lang="en"] .paper,html[lang="en"] .overview,html[lang="en"] .recap{font-size:calc(1.125rem * var(--reader-scale))}
 html[lang="en"] .plain,html[lang="en"] .guide,html[lang="en"] .ov-card{font-size:calc(1.0625rem * var(--reader-scale))}
 html[lang="en"] .plain-syms{font-size:.95em}
 html[lang="en"] .sym-say{font-size:.86em}
 html[lang="en"] .plain-sub,html[lang="en"] .guide-tag,html[lang="en"] .plain-tag{font-size:calc(.8rem * var(--reader-scale))}
 html[lang="en"] .howto,html[lang="en"] .ov-table{font-size:calc(1rem * var(--reader-scale))}
 html[lang="en"] .unit-h2>.sec-h{font-size:calc(1.6rem * var(--reader-scale))}
 html[lang="en"] .unit-h3>.sec-h{font-size:calc(1.3rem * var(--reader-scale))}
}
'''
SCRIPT='''
(() => {
 const levels=[1,1.15], key='ece723-reader-scale';
 let size=1.15;
 try { const saved=Number(localStorage.getItem(key)); if(levels.includes(saved))size=saved; } catch {}
 document.documentElement.style.setProperty('--reader-scale',size);
 function setup(){
  const tools=document.querySelector('.topbar .tools');
  if(!tools || document.getElementById('reader-font-size'))return;
  const zh=document.documentElement.lang.startsWith('zh');
  const button=document.createElement('button');button.type='button';button.id='reader-font-size';
  const hint=zh?'点击切换全局字号：100%、115%':'Change reader text size: 100%, 115%';
  button.title=hint;
  function label(){const value=Math.round(size*100)+'%';button.textContent=(zh?'字号：':'Text: ')+value;button.setAttribute('aria-label',hint+'; '+value);}
  label();button.addEventListener('click',()=>{
   size=levels[(levels.indexOf(size)+1)%levels.length];
   document.documentElement.style.setProperty('--reader-scale',size);
   try{localStorage.setItem(key,String(size));}catch{}
   label();
  });
  tools.insertBefore(button,tools.querySelector('.langsw'));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
'''
for name in ['reading.html','reading-en.html']:
    path=ROOT/name;html=path.read_text()
    html=re.sub(r'<style id="reader-size">.*?</style>\s*','',html,flags=re.S)
    html=re.sub(r'<script id="reader-size-control">.*?</script>\s*','',html,flags=re.S)
    html=html.replace('</head>',f'<style id="reader-size">{CSS}</style>\n<script id="reader-size-control">{SCRIPT}</script>\n</head>')
    path.write_text(html)
    print(name,'persistent global reader size installed')
