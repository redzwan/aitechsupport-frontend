"use strict";(()=>{var d={title:"Chat with us",greeting:"Hi! How can I help you today?",primary_color:"#4f46e5",position:"right",launcher_label:"Chat"},l=document.currentScript;function c(){var s,r;let i=window;if(i.__aiTechSupportWidgetLoaded)return;let t=(s=l==null?void 0:l.getAttribute("data-public-key"))==null?void 0:s.trim();if(!t){console.warn("[AiTechSupport] widget: missing data-public-key");return}i.__aiTechSupportWidgetLoaded=!0;let o=`${(((r=l==null?void 0:l.getAttribute("data-api-base"))==null?void 0:r.trim())||"https://api.aitechsupport.my").replace(/\/+$/,"")}/api/v1/public/widget/${encodeURIComponent(t)}`;new h(t,o).init()}var h=class{constructor(t,e){this.publicKey=t;this.base=e;this.cfg=d;this.open=!1;this.busy=!1;this.greeted=!1;this.sessionId=b(t)}init(){let t=document.createElement("div");t.setAttribute("data-aitechsupport-widget",""),document.body.appendChild(t),this.root=t.attachShadow({mode:"open"}),m(this.root),this.build(),this.loadConfig()}build(){let t=a("div","atsw-wrap");this.launcher=a("button","atsw-launcher"),this.launcher.type="button",this.launcher.setAttribute("aria-label","Open chat"),this.launcher.textContent=this.cfg.launcher_label,this.launcher.addEventListener("click",()=>this.toggle()),this.panel=a("section","atsw-panel"),this.panel.setAttribute("role","dialog"),this.panel.setAttribute("aria-modal","false"),this.panel.setAttribute("aria-label",this.cfg.title),this.panel.hidden=!0;let e=a("header","atsw-header"),o=a("span","atsw-title");o.textContent=this.cfg.title;let s=a("button","atsw-close");s.type="button",s.setAttribute("aria-label","Close chat"),s.textContent="\xD7",s.addEventListener("click",()=>this.toggle(!1)),e.append(o,s),this.log=a("div","atsw-log"),this.log.setAttribute("role","log"),this.log.setAttribute("aria-live","polite");let r=a("form","atsw-form");this.input=a("textarea","atsw-input"),this.input.rows=1,this.input.placeholder="Type your message\u2026",this.input.setAttribute("aria-label","Message"),this.input.addEventListener("keydown",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),this.send())}),this.sendBtn=a("button","atsw-send"),this.sendBtn.type="submit",this.sendBtn.textContent="Send",r.append(this.input,this.sendBtn),r.addEventListener("submit",n=>{n.preventDefault(),this.send()}),this.panel.append(e,this.log,r),t.append(this.panel,this.launcher),this.root.appendChild(t),this.root.addEventListener("keydown",n=>{n.key==="Escape"&&this.open&&this.toggle(!1)})}async loadConfig(){try{let t=await fetch(`${this.base}/config`,{method:"GET"});t.ok&&(this.cfg={...d,...await t.json()})}catch{}this.applyConfig()}applyConfig(){let t=this.root.host;t.style.setProperty("--atsw-primary",this.cfg.primary_color||d.primary_color),t.setAttribute("data-position",this.cfg.position==="left"?"left":"right"),this.launcher.textContent=this.cfg.launcher_label||d.launcher_label,this.panel.querySelector(".atsw-title").textContent=this.cfg.title,this.panel.setAttribute("aria-label",this.cfg.title)}toggle(t){this.open=t!=null?t:!this.open,this.panel.hidden=!this.open,this.launcher.setAttribute("aria-label",this.open?"Close chat":"Open chat"),this.open&&(this.greeted||(this.greeted=!0,this.addMessage("assistant",this.cfg.greeting)),this.input.focus())}addMessage(t,e){let o=a("div",`atsw-msg atsw-${t}`),s=a("div","atsw-bubble");return s.textContent=e,o.appendChild(s),this.log.appendChild(o),this.log.scrollTop=this.log.scrollHeight,s}renderAnswer(t,e){t.textContent=e,this.log.scrollTop=this.log.scrollHeight}async send(){var o,s,r;let t=this.input.value.trim();if(!t||this.busy)return;this.setBusy(!0),this.input.value="",this.addMessage("user",t);let e=this.addMessage("assistant","\u2026");(o=e.parentElement)==null||o.classList.add("atsw-pending");try{let n=await fetch(`${this.base}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:t,session_id:this.sessionId})});if((s=e.parentElement)==null||s.classList.remove("atsw-pending"),n.ok){let p=await n.json();p.session_id&&(this.sessionId=p.session_id,w(this.publicKey,this.sessionId)),this.renderAnswer(e,String(p.answer||""))}else this.renderAnswer(e,f(n.status))}catch{(r=e.parentElement)==null||r.classList.remove("atsw-pending"),this.renderAnswer(e,"Sorry, I couldn't reach the assistant. Please try again.")}finally{this.setBusy(!1),this.input.focus()}}setBusy(t){this.busy=t,this.sendBtn.disabled=t,this.input.disabled=t}};function f(i){return i===429?"You're sending messages a bit fast \u2014 please wait a moment and try again.":i===402||i===503?"The assistant is unavailable right now. Please try again later.":i===404?"This chat is not available.":"Something went wrong. Please try again."}function b(i){try{let t=`ats_widget_session_${i}`,e=localStorage.getItem(t);return e||(e=u(),localStorage.setItem(t,e)),e}catch{return u()}}function w(i,t){try{localStorage.setItem(`ats_widget_session_${i}`,t)}catch{}}function u(){let i=globalThis.crypto;return i!=null&&i.randomUUID?i.randomUUID().replace(/-/g,""):`s${Date.now().toString(36)}${Math.floor(Math.random()*1e9).toString(36)}`}function a(i,t){let e=document.createElement(i);return e.className=t,e}function m(i){try{let t=new CSSStyleSheet;t.replaceSync(g),i.adoptedStyleSheets=[t]}catch{let t=document.createElement("style");t.textContent=g,i.appendChild(t)}}var g=`
:host { all: initial; }
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.atsw-wrap { position: fixed; bottom: 20px; z-index: 2147483000; }
:host([data-position="left"]) .atsw-wrap { left: 20px; }
:host(:not([data-position="left"])) .atsw-wrap { right: 20px; }
.atsw-launcher {
  min-width: 56px; height: 56px; padding: 0 18px; border: 0; border-radius: 28px;
  background: var(--atsw-primary, #4f46e5); color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.22);
}
.atsw-launcher:hover { filter: brightness(1.05); }
.atsw-panel {
  position: absolute; bottom: 68px; width: 360px; max-width: calc(100vw - 40px);
  height: 520px; max-height: calc(100vh - 120px); display: flex; flex-direction: column;
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,.28); border: 1px solid rgba(0,0,0,.08);
}
.atsw-panel[hidden] { display: none; }
:host(:not([data-position="left"])) .atsw-panel { right: 0; }
:host([data-position="left"]) .atsw-panel { left: 0; }
.atsw-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; background: var(--atsw-primary, #4f46e5); color: #fff;
}
.atsw-title { font-weight: 600; font-size: 15px; }
.atsw-close { background: transparent; border: 0; color: #fff; font-size: 22px; line-height: 1; cursor: pointer; opacity: .9; }
.atsw-close:hover { opacity: 1; }
.atsw-log { flex: 1; overflow-y: auto; padding: 14px; background: #f7f7f9; }
.atsw-msg { display: flex; margin-bottom: 10px; }
.atsw-user { justify-content: flex-end; }
.atsw-bubble {
  max-width: 80%; padding: 9px 12px; border-radius: 12px; font-size: 14px; line-height: 1.4;
  white-space: pre-wrap; word-wrap: break-word;
}
.atsw-assistant .atsw-bubble { background: #fff; color: #111; border: 1px solid #eee; border-bottom-left-radius: 4px; }
.atsw-user .atsw-bubble { background: var(--atsw-primary, #4f46e5); color: #fff; border-bottom-right-radius: 4px; }
.atsw-pending .atsw-bubble { color: #999; }
.atsw-form { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #eee; background: #fff; }
.atsw-input {
  flex: 1; resize: none; max-height: 96px; padding: 9px 11px; border: 1px solid #d7d7dc;
  border-radius: 10px; font-size: 14px; outline: none;
}
.atsw-input:focus { border-color: var(--atsw-primary, #4f46e5); }
.atsw-send {
  border: 0; border-radius: 10px; padding: 0 16px; background: var(--atsw-primary, #4f46e5);
  color: #fff; font-weight: 600; font-size: 14px; cursor: pointer;
}
.atsw-send:disabled { opacity: .5; cursor: default; }
@media (prefers-reduced-motion: no-preference) { .atsw-panel { animation: atsw-in .16s ease-out; } }
@keyframes atsw-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
`;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",c):c();})();
