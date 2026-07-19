"use strict";(()=>{var p={title:"Chat with us",greeting:"Hi! How can I help you today?",primary_color:"#4f46e5",position:"right",launcher_label:"Chat"},h=document.currentScript;function m(){var i,a;let o=window;if(o.__aiTechSupportWidgetLoaded)return;let t=(i=h==null?void 0:h.getAttribute("data-public-key"))==null?void 0:i.trim();if(!t){console.warn("[AiTechSupport] widget: missing data-public-key");return}o.__aiTechSupportWidgetLoaded=!0;let s=`${(((a=h==null?void 0:h.getAttribute("data-api-base"))==null?void 0:a.trim())||"https://api.aitechsupport.my").replace(/\/+$/,"")}/api/v1/public/widget/${encodeURIComponent(t)}`;new u(t,s).init()}var u=class{constructor(t,e){this.publicKey=t;this.base=e;this.cfg=p;this.open=!1;this.busy=!1;this.greeted=!1;this.lastQuestion="";this.handoffDone=!1;this.sessionId=H(t)}init(){let t=document.createElement("div");t.setAttribute("data-aitechsupport-widget",""),document.body.appendChild(t),this.root=t.attachShadow({mode:"open"}),S(this.root),this.build(),this.loadConfig()}build(){let t=n("div","atsw-wrap");this.launcher=n("button","atsw-launcher"),this.launcher.type="button",this.launcher.setAttribute("aria-label","Open chat"),this.launcher.textContent=this.cfg.launcher_label,this.launcher.addEventListener("click",()=>this.toggle()),this.panel=n("section","atsw-panel"),this.panel.setAttribute("role","dialog"),this.panel.setAttribute("aria-modal","false"),this.panel.setAttribute("aria-label",this.cfg.title),this.panel.hidden=!0;let e=n("header","atsw-header"),s=n("span","atsw-title");s.textContent=this.cfg.title;let i=n("button","atsw-human");i.type="button",i.textContent="Talk to a human",i.addEventListener("click",()=>this.openHandoff());let a=n("button","atsw-close");a.type="button",a.setAttribute("aria-label","Close chat"),a.textContent="\xD7",a.addEventListener("click",()=>this.toggle(!1)),e.append(s,i,a),this.log=n("div","atsw-log"),this.log.setAttribute("role","log"),this.log.setAttribute("aria-live","polite");let r=n("form","atsw-form");this.form=r,this.input=n("textarea","atsw-input"),this.input.rows=1,this.input.placeholder="Type your message\u2026",this.input.setAttribute("aria-label","Message"),this.input.addEventListener("keydown",l=>{l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),this.send())}),this.sendBtn=n("button","atsw-send"),this.sendBtn.type="submit",this.sendBtn.textContent="Send",r.append(this.input,this.sendBtn),r.addEventListener("submit",l=>{l.preventDefault(),this.send()}),this.buildHandoff(),this.panel.append(e,this.log,r,this.handoffView),t.append(this.panel,this.launcher),this.root.appendChild(t),this.root.addEventListener("keydown",l=>{l.key==="Escape"&&this.open&&this.toggle(!1)})}async loadConfig(){try{let t=await fetch(`${this.base}/config`,{method:"GET"});t.ok&&(this.cfg={...p,...await t.json()})}catch{}this.applyConfig()}applyConfig(){let t=this.root.host;t.style.setProperty("--atsw-primary",this.cfg.primary_color||p.primary_color),t.setAttribute("data-position",this.cfg.position==="left"?"left":"right"),this.launcher.textContent=this.cfg.launcher_label||p.launcher_label,this.panel.querySelector(".atsw-title").textContent=this.cfg.title,this.panel.setAttribute("aria-label",this.cfg.title)}toggle(t){this.open=t!=null?t:!this.open,this.panel.hidden=!this.open,this.launcher.setAttribute("aria-label",this.open?"Close chat":"Open chat"),this.open&&(this.greeted||(this.greeted=!0,this.addMessage("assistant",this.cfg.greeting)),this.input.focus())}addMessage(t,e){let s=n("div",`atsw-msg atsw-${t}`),i=n("div","atsw-bubble");return i.textContent=e,s.appendChild(i),this.log.appendChild(s),this.log.scrollTop=this.log.scrollHeight,i}renderAnswer(t,e){t.textContent=e,this.log.scrollTop=this.log.scrollHeight}async send(){var s;let t=this.input.value.trim();if(!t||this.busy)return;this.lastQuestion=t,this.setBusy(!0),this.input.value="",this.addMessage("user",t);let e=this.addMessage("assistant","\u2026");(s=e.parentElement)==null||s.classList.add("atsw-pending");try{await this.streamChat(t,e)||await this.bufferedChat(t,e)}finally{this.setBusy(!1),this.input.focus()}}async streamChat(t,e){var l;let s;try{s=await fetch(`${this.base}/chat/stream`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:t,session_id:this.sessionId})})}catch{return!1}if((l=e.parentElement)==null||l.classList.remove("atsw-pending"),!s.ok||!s.body)return this.renderAnswer(e,c(s.status)),!0;let i="",a="",r=!1;try{let x=s.body.getReader(),v=new TextDecoder;for(;;){let{done:E,value:T}=await x.read();if(E)break;a+=v.decode(T,{stream:!0});let f;for(;(f=a.indexOf(`

`))>=0;){let M=a.slice(0,f);a=a.slice(f+2);let g=M.split(`
`).find(L=>L.startsWith("data:"));if(!g)continue;let d;try{d=JSON.parse(g.slice(5).trim())}catch{continue}if(d.type==="delta")i+=d.text||"",r=!0,this.renderAnswer(e,i);else if(d.type==="done")d.session_id&&(this.sessionId=d.session_id,b(this.publicKey,this.sessionId)),d.handoff&&this.offerHandoff();else if(d.type==="error")return d.detail==="busy"?(this.renderAnswer(e,"We're a bit busy right now \u2014 please try again in a moment."),!0):r?(this.renderAnswer(e,i+`

(Sorry \u2014 the reply was cut off.)`),!0):!1}}}catch{}return!!r}async bufferedChat(t,e){var s,i;try{let a=await fetch(`${this.base}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:t,session_id:this.sessionId})});if((s=e.parentElement)==null||s.classList.remove("atsw-pending"),a.ok){let r=await a.json();r.session_id&&(this.sessionId=r.session_id,b(this.publicKey,this.sessionId)),this.renderAnswer(e,String(r.answer||"")),r.handoff&&this.offerHandoff()}else this.renderAnswer(e,c(a.status))}catch{(i=e.parentElement)==null||i.classList.remove("atsw-pending"),this.renderAnswer(e,"Sorry, I couldn't reach the assistant. Please try again.")}}buildHandoff(){let t=n("form","atsw-handoff");t.hidden=!0;let e=n("div","atsw-h-intro");e.textContent="Leave your details and we'll get back to you.",this.hName=n("input","atsw-h-input"),this.hName.placeholder="Your name",this.hName.setAttribute("aria-label","Your name"),this.hEmail=n("input","atsw-h-input"),this.hEmail.type="email",this.hEmail.placeholder="Your email",this.hEmail.setAttribute("aria-label","Your email"),this.hMsg=n("textarea","atsw-h-input"),this.hMsg.rows=2,this.hMsg.placeholder="How can we help?",this.hMsg.setAttribute("aria-label","Message");let s=n("div","atsw-h-row"),i=n("button","atsw-send");i.type="submit",i.textContent="Send request";let a=n("button","atsw-h-cancel");a.type="button",a.textContent="Cancel",a.addEventListener("click",()=>this.closeHandoff()),s.append(a,i),t.append(e,this.hName,this.hEmail,this.hMsg,s),t.addEventListener("submit",r=>{r.preventDefault(),this.submitHandoff(i)}),this.handoffView=t}openHandoff(){this.handoffDone||(this.toggle(!0),this.hMsg.value=this.lastQuestion||"",this.form.hidden=!0,this.handoffView.hidden=!1,this.hName.focus())}closeHandoff(){this.handoffView.hidden=!0,this.form.hidden=!1,this.input.focus()}offerHandoff(){if(this.handoffDone)return;let t=n("div","atsw-msg atsw-assistant"),e=n("button","atsw-offer");e.type="button",e.textContent="\u{1F4AC} Talk to a human",e.addEventListener("click",()=>this.openHandoff()),t.appendChild(e),this.log.appendChild(t),this.log.scrollTop=this.log.scrollHeight}async submitHandoff(t){let e=this.hName.value.trim(),s=this.hEmail.value.trim();if(!e||!s||s.indexOf("@")<1){(e?this.hEmail:this.hName).focus();return}t.disabled=!0;try{let i=await fetch(`${this.base}/handoff`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:this.sessionId,name:e,email:s,message:this.hMsg.value.trim()})});i.ok?(this.handoffDone=!0,this.closeHandoff(),this.addMessage("assistant",`Thanks, ${e}! Someone will get back to you at ${s} soon.`)):(this.addMessage("assistant",c(i.status)),this.closeHandoff())}catch{this.addMessage("assistant","Sorry, we couldn't submit that. Please try again.")}finally{t.disabled=!1}}setBusy(t){this.busy=t,this.sendBtn.disabled=t,this.input.disabled=t}};function c(o){return o===429?"You're sending messages a bit fast \u2014 please wait a moment and try again.":o===402||o===503?"The assistant is unavailable right now. Please try again later.":o===404?"This chat is not available.":"Something went wrong. Please try again."}function H(o){try{let t=`ats_widget_session_${o}`,e=localStorage.getItem(t);return e||(e=w(),localStorage.setItem(t,e)),e}catch{return w()}}function b(o,t){try{localStorage.setItem(`ats_widget_session_${o}`,t)}catch{}}function w(){let o=globalThis.crypto;return o!=null&&o.randomUUID?o.randomUUID().replace(/-/g,""):`s${Date.now().toString(36)}${Math.floor(Math.random()*1e9).toString(36)}`}function n(o,t){let e=document.createElement(o);return e.className=t,e}function S(o){try{let t=new CSSStyleSheet;t.replaceSync(y),o.adoptedStyleSheets=[t]}catch{let t=document.createElement("style");t.textContent=y,o.appendChild(t)}}var y=`
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
.atsw-form[hidden] { display: none; }
.atsw-human { margin-left: auto; margin-right: 8px; background: rgba(255,255,255,.18); border: 0; color: #fff; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
.atsw-human:hover { background: rgba(255,255,255,.3); }
.atsw-offer { display: inline-block; background: #fff; border: 1px solid var(--atsw-primary, #4f46e5); color: var(--atsw-primary, #4f46e5); font-size: 13px; font-weight: 600; padding: 7px 12px; border-radius: 12px; cursor: pointer; }
.atsw-offer:hover { filter: brightness(.97); }
.atsw-handoff { display: flex; flex-direction: column; gap: 8px; padding: 12px; border-top: 1px solid #eee; background: #fff; }
.atsw-handoff[hidden] { display: none; }
.atsw-h-intro { font-size: 13px; color: #444; }
.atsw-h-input { width: 100%; padding: 8px 10px; border: 1px solid #d7d7dc; border-radius: 8px; font-size: 13px; outline: none; resize: none; font-family: inherit; }
.atsw-h-input:focus { border-color: var(--atsw-primary, #4f46e5); }
.atsw-h-row { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
.atsw-h-cancel { background: transparent; border: 0; color: #888; font-size: 13px; cursor: pointer; padding: 0 8px; }
@media (prefers-reduced-motion: no-preference) { .atsw-panel { animation: atsw-in .16s ease-out; } }
@keyframes atsw-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
`;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",m):m();})();
