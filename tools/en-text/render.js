const katex=require('/opt/npm-tools/node_modules/katex'); const fs=require('fs');
const o=JSON.parse(fs.readFileSync('paras_html2.json')); const out={}; let err=[], n=0, disp=0;
const unesc=s=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
for (const [p,h] of Object.entries(o)) {
  out[p]=h.replace(/<span class="(imath|dmath)" data-tex="([^"]*)"><\/span>/g,(m,cls,t)=>{
    n++; const tex=unesc(t); if(cls==='dmath') disp++;
    let r; try { r=katex.renderToString(tex,{throwOnError:true,strict:false,output:'html',displayMode:cls==='dmath'}); }
    catch(e){ err.push([p,tex,e.message.slice(0,80)]); r=katex.renderToString(tex,{throwOnError:false,strict:false,output:'html',displayMode:cls==='dmath'}); }
    return `<span class="${cls}" data-tex="${t}">${r}</span>`;
  });
}
fs.writeFileSync('paras_rendered.json',JSON.stringify(out));
console.log('math',n,'display',disp,'errors',err.length); console.log(err.slice(0,20));
