
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const sidebar=$("#sidebar"),shade=$("#shade");
$("#menuBtn")?.addEventListener("click",()=>{sidebar.classList.add("show");shade.classList.add("show")});
shade?.addEventListener("click",()=>{sidebar.classList.remove("show");shade.classList.remove("show")});
$$(".menu-group-title").forEach(b=>b.addEventListener("click",()=>b.parentElement.classList.toggle("open")));
$$(".copy").forEach(b=>b.addEventListener("click",async()=>{await navigator.clipboard.writeText(b.nextElementSibling.innerText);b.textContent="Copiado";setTimeout(()=>b.textContent="Copiar",1200)}));
$$("[data-complete]").forEach(c=>{let k="aso:"+c.dataset.complete;c.checked=localStorage.getItem(k)==="1";c.onchange=()=>localStorage.setItem(k,c.checked?"1":"0")});
$("#themeBtn")?.addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("aso-theme",document.body.classList.contains("dark")?"dark":"light")});
if(localStorage.getItem("aso-theme")==="dark")document.body.classList.add("dark");
const dlg=$("#searchDialog"),inp=$("#searchInput"),res=$("#searchResults");
$$("[data-open-search]").forEach(b=>b.addEventListener("click",()=>{dlg.showModal();setTimeout(()=>inp.focus(),50)}));
$("#closeSearch")?.addEventListener("click",()=>dlg.close());
let index=[];fetch(window.ASO_BASE+"search-index.json").then(r=>r.json()).then(j=>index=j);
inp?.addEventListener("input",()=>{let v=inp.value.toLowerCase().trim();res.innerHTML=v.length<2?"":index.filter(x=>(x.title+" "+x.text).toLowerCase().includes(v)).slice(0,20).map(x=>`<a class="result" href="${x.url}"><b>${x.title}</b><br><small>${x.text}</small></a>`).join("")});
let slides=[],slide=0;
function showSlide(n){slides=$$(".present-slide");if(!slides.length)return;slide=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle("active-slide",i===slide));$("#presentCount").textContent=`${slide+1} / ${slides.length}`}
function enterPresent(){document.body.classList.add("presentation");document.documentElement.requestFullscreen?.();showSlide(0)}
function exitPresent(){document.body.classList.remove("presentation");slides.forEach(s=>s.classList.remove("active-slide"));if(document.fullscreenElement)document.exitFullscreen?.()}
$("#presentBtn")?.addEventListener("click",enterPresent);$("#presentExit")?.addEventListener("click",exitPresent);$("#presentPrev")?.addEventListener("click",()=>showSlide(slide-1));$("#presentNext")?.addEventListener("click",()=>showSlide(slide+1));
document.addEventListener("keydown",e=>{if(!document.body.classList.contains("presentation"))return;if(["ArrowRight","PageDown"," "].includes(e.key)){e.preventDefault();showSlide(slide+1)}if(["ArrowLeft","PageUp"].includes(e.key)){e.preventDefault();showSlide(slide-1)}if(e.key==="Escape")exitPresent()});
