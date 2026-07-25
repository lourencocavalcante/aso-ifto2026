
(()=>{"use strict";const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const side=$("#sidebar"),shade=$("#shade");
$("#menuBtn")?.addEventListener("click",()=>{side.classList.add("show");shade.classList.add("show")});
shade?.addEventListener("click",()=>{side.classList.remove("show");shade.classList.remove("show")});
$$(".menu-group-title").forEach(b=>b.addEventListener("click",()=>b.parentElement.classList.toggle("open")));
$$(".copy").forEach(b=>b.addEventListener("click",async()=>{const text=b.closest(".terminal").querySelector("code").innerText;try{await navigator.clipboard.writeText(text)}catch{const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();document.execCommand("copy");t.remove()}const old=b.textContent;b.textContent="Copiado";setTimeout(()=>b.textContent=old,1200)}));
$$("[data-complete]").forEach(c=>{const k="aso:"+c.dataset.complete;c.checked=localStorage.getItem(k)==="1";c.addEventListener("change",()=>localStorage.setItem(k,c.checked?"1":"0"))});
if(localStorage.getItem("aso-theme")==="dark")document.body.classList.add("dark");
$("#themeBtn")?.addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("aso-theme",document.body.classList.contains("dark")?"dark":"light")});
const dlg=$("#searchDialog"),input=$("#searchInput"),results=$("#searchResults");let index=[];
$$("[data-open-search]").forEach(b=>b.addEventListener("click",()=>{dlg.showModal();setTimeout(()=>input.focus(),50)}));
$("#closeSearch")?.addEventListener("click",()=>dlg.close());
fetch(window.ASO_BASE+"search-index.json").then(r=>{if(!r.ok)throw Error();return r.json()}).then(j=>index=j).catch(()=>{index=[]});
input?.addEventListener("input",()=>{const q=input.value.trim().toLowerCase();results.innerHTML=q.length<2?"":index.filter(x=>(x.title+" "+x.text).toLowerCase().includes(q)).slice(0,20).map(x=>`<a class="result" href="${x.url}"><b>${x.title}</b><br><small>${x.text.slice(0,150)}</small></a>`).join("")});
let slides=[],current=0;const count=$("#presentCount");
function show(n){slides=$$(".present-slide");if(!slides.length)return;current=Math.max(0,Math.min(n,slides.length-1));slides.forEach((s,i)=>s.classList.toggle("active-slide",i===current));if(count)count.textContent=`${current+1} / ${slides.length}`}
function enter(){document.body.classList.add("presentation");show(0);document.documentElement.requestFullscreen?.().catch(()=>{})}
function exit(){document.body.classList.remove("presentation");slides.forEach(s=>s.classList.remove("active-slide"));if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{})}
$("#presentBtn")?.addEventListener("click",enter);$("#presentPrev")?.addEventListener("click",()=>show(current-1));$("#presentNext")?.addEventListener("click",()=>show(current+1));$("#presentExit")?.addEventListener("click",exit);
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&document.body.classList.contains("presentation"))exit()});
document.addEventListener("keydown",e=>{if(!document.body.classList.contains("presentation"))return;if(["ArrowRight","PageDown"," "].includes(e.key)){e.preventDefault();show(current+1)}else if(["ArrowLeft","PageUp"].includes(e.key)){e.preventDefault();show(current-1)}else if(e.key==="Home")show(0);else if(e.key==="End")show(slides.length-1);else if(e.key==="Escape")exit()});
})();