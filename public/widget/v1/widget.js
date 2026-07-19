"use strict";(()=>{var c={title:"Chat with us",subtitle:"We typically reply in a few minutes",greeting:"Hi! How can I help you today?",primary_color:"#4f46e5",position:"right",launcher_label:"Chat",theme:"auto"},u=document.currentScript;function b(){var a,r;let n=window;if(n.__aiTechSupportWidgetLoaded)return;let t=(a=u==null?void 0:u.getAttribute("data-public-key"))==null?void 0:a.trim();if(!t){console.warn("[AiTechSupport] widget: missing data-public-key");return}n.__aiTechSupportWidgetLoaded=!0;let s=`${(((r=u==null?void 0:u.getAttribute("data-api-base"))==null?void 0:r.trim())||"https://api.aitechsupport.my").replace(/\/+$/,"")}/api/v1/public/widget/${encodeURIComponent(t)}`;new w(t,s).init()}var w=class{constructor(t,e){this.publicKey=t;this.base=e;this.cfg=c;this.open=!1;this.busy=!1;this.greeted=!1;this.lastQuestion="";this.handoffDone=!1;this.sessionId=k(t)}init(){let t=document.createElement("div");t.setAttribute("data-aitechsupport-widget",""),document.body.appendChild(t),this.root=t.attachShadow({mode:"open"}),S(this.root),this.build(),this.loadConfig()}build(){let t=i("div","atsw-wrap");this.launcher=i("button","atsw-launcher"),this.launcher.type="button",this.launcher.setAttribute("aria-label","Open chat"),this.launcher.setAttribute("aria-haspopup","dialog"),this.launcher.setAttribute("aria-expanded","false"),this.launcher.textContent=this.cfg.launcher_label,this.launcher.addEventListener("click",()=>this.toggle()),this.panel=i("section","atsw-panel"),this.panel.setAttribute("role","dialog"),this.panel.setAttribute("aria-modal","false"),this.panel.setAttribute("aria-label",this.cfg.title),this.panel.hidden=!0;let e=i("header","atsw-header"),s=i("div","atsw-titles"),a=i("span","atsw-title");a.textContent=this.cfg.title;let r=i("span","atsw-subtitle");r.hidden=!0,s.append(a,r);let o=i("button","atsw-human");o.type="button",o.textContent="Talk to a human",o.addEventListener("click",()=>this.openHandoff());let h=i("button","atsw-close");h.type="button",h.setAttribute("aria-label","Close chat"),h.textContent="\xD7",h.addEventListener("click",()=>this.toggle(!1)),e.append(s,o,h),this.log=i("div","atsw-log"),this.log.setAttribute("role","log"),this.log.setAttribute("aria-live","polite");let p=i("form","atsw-form");this.form=p,this.input=i("textarea","atsw-input"),this.input.rows=1,this.input.placeholder="Type your message\u2026",this.input.setAttribute("aria-label","Message"),this.input.addEventListener("keydown",l=>{l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),this.send())}),this.sendBtn=i("button","atsw-send"),this.sendBtn.type="submit",this.sendBtn.textContent="Send",p.append(this.input,this.sendBtn),p.addEventListener("submit",l=>{l.preventDefault(),this.send()}),this.buildHandoff(),this.panel.append(e,this.log,p,this.handoffView),t.append(this.panel,this.launcher),this.root.appendChild(t),this.root.addEventListener("keydown",l=>{l.key==="Escape"&&this.open&&this.toggle(!1)})}async loadConfig(){try{let t=await fetch(`${this.base}/config`,{method:"GET"});t.ok&&(this.cfg={...c,...await t.json()})}catch{}this.applyConfig()}applyConfig(){let t=this.root.host,e=this.cfg.primary_color||c.primary_color;t.style.setProperty("--atsw-primary",e),t.style.setProperty("--atsw-on-primary",C(e)),t.setAttribute("data-position",this.cfg.position==="left"?"left":"right");let s=this.cfg.theme==="dark"||this.cfg.theme==="light"?this.cfg.theme:"auto";s==="auto"?t.removeAttribute("data-theme"):t.setAttribute("data-theme",s),this.launcher.textContent=this.cfg.launcher_label||c.launcher_label,this.panel.querySelector(".atsw-title").textContent=this.cfg.title;let a=this.panel.querySelector(".atsw-subtitle");a.textContent=this.cfg.subtitle||"",a.hidden=!this.cfg.subtitle,this.panel.setAttribute("aria-label",this.cfg.title)}toggle(t){this.open=t!=null?t:!this.open,this.panel.hidden=!this.open,this.launcher.setAttribute("aria-expanded",this.open?"true":"false"),this.launcher.setAttribute("aria-label",this.open?"Close chat":"Open chat"),this.open?(this.greeted||(this.greeted=!0,this.addMessage("assistant",this.cfg.greeting)),this.input.focus()):this.launcher.focus()}addMessage(t,e){let s=i("div",`atsw-msg atsw-${t}`),a=i("div","atsw-bubble");return a.textContent=e,s.appendChild(a),this.log.appendChild(s),this.log.scrollTop=this.log.scrollHeight,a}renderAnswer(t,e){t.textContent=e,this.log.scrollTop=this.log.scrollHeight}async send(){var s;let t=this.input.value.trim();if(!t||this.busy)return;this.lastQuestion=t,this.setBusy(!0),this.input.value="",this.addMessage("user",t);let e=this.addMessage("assistant","\u2026");(s=e.parentElement)==null||s.classList.add("atsw-pending");try{await this.streamChat(t,e)||await this.bufferedChat(t,e)}finally{this.setBusy(!1),this.input.focus()}}async streamChat(t,e){var h;let s;try{s=await fetch(`${this.base}/chat/stream`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:t,session_id:this.sessionId})})}catch{return!1}if((h=e.parentElement)==null||h.classList.remove("atsw-pending"),!s.ok||!s.body)return this.renderAnswer(e,g(s.status)),!0;let a="",r="",o=!1;try{let p=s.body.getReader(),l=new TextDecoder;for(;;){let{done:T,value:M}=await p.read();if(T)break;r+=l.decode(M,{stream:!0});let f;for(;(f=r.indexOf(`

`))>=0;){let L=r.slice(0,f);r=r.slice(f+2);let m=L.split(`
`).find(H=>H.startsWith("data:"));if(!m)continue;let d;try{d=JSON.parse(m.slice(5).trim())}catch{continue}if(d.type==="delta")a+=d.text||"",o=!0,this.renderAnswer(e,a);else if(d.type==="done")d.session_id&&(this.sessionId=d.session_id,y(this.publicKey,this.sessionId)),d.handoff&&this.offerHandoff();else if(d.type==="error")return d.detail==="busy"?(this.renderAnswer(e,"We're a bit busy right now \u2014 please try again in a moment."),!0):o?(this.renderAnswer(e,a+`

(Sorry \u2014 the reply was cut off.)`),!0):!1}}}catch{}return!!o}async bufferedChat(t,e){var s,a;try{let r=await fetch(`${this.base}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:t,session_id:this.sessionId})});if((s=e.parentElement)==null||s.classList.remove("atsw-pending"),r.ok){let o=await r.json();o.session_id&&(this.sessionId=o.session_id,y(this.publicKey,this.sessionId)),this.renderAnswer(e,String(o.answer||"")),o.handoff&&this.offerHandoff()}else this.renderAnswer(e,g(r.status))}catch{(a=e.parentElement)==null||a.classList.remove("atsw-pending"),this.renderAnswer(e,"Sorry, I couldn't reach the assistant. Please try again.")}}buildHandoff(){let t=i("form","atsw-handoff");t.hidden=!0;let e=i("div","atsw-h-intro");e.textContent="Leave your details and we'll get back to you.",this.hName=i("input","atsw-h-input"),this.hName.placeholder="Your name",this.hName.setAttribute("aria-label","Your name"),this.hEmail=i("input","atsw-h-input"),this.hEmail.type="email",this.hEmail.placeholder="Your email",this.hEmail.setAttribute("aria-label","Your email"),this.hMsg=i("textarea","atsw-h-input"),this.hMsg.rows=2,this.hMsg.placeholder="How can we help?",this.hMsg.setAttribute("aria-label","Message");let s=i("div","atsw-h-row"),a=i("button","atsw-send");a.type="submit",a.textContent="Send request";let r=i("button","atsw-h-cancel");r.type="button",r.textContent="Cancel",r.addEventListener("click",()=>this.closeHandoff()),s.append(r,a),t.append(e,this.hName,this.hEmail,this.hMsg,s),t.addEventListener("submit",o=>{o.preventDefault(),this.submitHandoff(a)}),this.handoffView=t}openHandoff(){this.handoffDone||(this.toggle(!0),this.hMsg.value=this.lastQuestion||"",this.form.hidden=!0,this.handoffView.hidden=!1,this.hName.focus())}closeHandoff(){this.handoffView.hidden=!0,this.form.hidden=!1,this.input.focus()}offerHandoff(){if(this.handoffDone)return;let t=i("div","atsw-msg atsw-assistant"),e=i("button","atsw-offer");e.type="button",e.textContent="\u{1F4AC} Talk to a human",e.addEventListener("click",()=>this.openHandoff()),t.appendChild(e),this.log.appendChild(t),this.log.scrollTop=this.log.scrollHeight}async submitHandoff(t){let e=this.hName.value.trim(),s=this.hEmail.value.trim();if(!e||!s||s.indexOf("@")<1){(e?this.hEmail:this.hName).focus();return}t.disabled=!0;try{let a=await fetch(`${this.base}/handoff`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:this.sessionId,name:e,email:s,message:this.hMsg.value.trim()})});a.ok?(this.handoffDone=!0,this.closeHandoff(),this.addMessage("assistant",`Thanks, ${e}! Someone will get back to you at ${s} soon.`)):(this.addMessage("assistant",g(a.status)),this.closeHandoff())}catch{this.addMessage("assistant","Sorry, we couldn't submit that. Please try again.")}finally{t.disabled=!1}}setBusy(t){this.busy=t,this.sendBtn.disabled=t,this.input.disabled=t}};function g(n){return n===429?"You're sending messages a bit fast \u2014 please wait a moment and try again.":n===402||n===503?"The assistant is unavailable right now. Please try again later.":n===404?"This chat is not available.":"Something went wrong. Please try again."}function k(n){try{let t=`ats_widget_session_${n}`,e=localStorage.getItem(t);return e||(e=v(),localStorage.setItem(t,e)),e}catch{return v()}}function y(n,t){try{localStorage.setItem(`ats_widget_session_${n}`,t)}catch{}}function v(){let n=globalThis.crypto;return n!=null&&n.randomUUID?n.randomUUID().replace(/-/g,""):`s${Date.now().toString(36)}${Math.floor(Math.random()*1e9).toString(36)}`}function i(n,t){let e=document.createElement(n);return e.className=t,e}function C(n){let t=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((n||"").trim());if(!t)return"#ffffff";let e=t[1];e.length===3&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]);let s=parseInt(e.slice(0,2),16),a=parseInt(e.slice(2,4),16),r=parseInt(e.slice(4,6),16);return(s*299+a*587+r*114)/1e3>=140?"#111111":"#ffffff"}function S(n){try{let t=new CSSStyleSheet;t.replaceSync(E),n.adoptedStyleSheets=[t]}catch{let t=document.createElement("style");t.textContent=E,n.appendChild(t)}}var x="--atsw-bg:#1f2023;--atsw-surface:#161719;--atsw-text:#f2f2f4;--atsw-muted:#a9adb6;--atsw-border:#34363a;--atsw-input-bg:#26272b;",E=`
:host {
  all: initial;
  --atsw-primary: #4f46e5;
  --atsw-on-primary: #ffffff;
  --atsw-bg: #ffffff;
  --atsw-surface: #f7f7f9;
  --atsw-text: #111418;
  --atsw-muted: #5b616e;
  --atsw-border: #e5e5ea;
  --atsw-input-bg: #ffffff;
}
:host([data-theme="dark"]) { ${x} }
@media (prefers-color-scheme: dark) { :host(:not([data-theme="light"])) { ${x} } }
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
button:focus-visible, textarea:focus-visible, input:focus-visible { outline: 2px solid var(--atsw-primary); outline-offset: 2px; }
.atsw-wrap { position: fixed; bottom: 20px; z-index: 2147483000; }
:host([data-position="left"]) .atsw-wrap { left: 20px; }
:host(:not([data-position="left"])) .atsw-wrap { right: 20px; }
.atsw-launcher {
  min-width: 56px; height: 56px; padding: 0 18px; border: 0; border-radius: 28px;
  background: var(--atsw-primary); color: var(--atsw-on-primary); font-size: 15px; font-weight: 600;
  cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.22);
}
.atsw-launcher:hover { filter: brightness(1.05); }
.atsw-panel {
  position: absolute; bottom: 68px; width: 360px; max-width: calc(100vw - 40px);
  height: 520px; max-height: calc(100vh - 120px); display: flex; flex-direction: column;
  background: var(--atsw-bg); color: var(--atsw-text); border-radius: 14px; overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,.28); border: 1px solid var(--atsw-border);
}
.atsw-panel[hidden] { display: none; }
:host(:not([data-position="left"])) .atsw-panel { right: 0; }
:host([data-position="left"]) .atsw-panel { left: 0; }
.atsw-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px; background: var(--atsw-primary); color: var(--atsw-on-primary);
}
.atsw-titles { display: flex; flex-direction: column; min-width: 0; }
.atsw-title { font-weight: 600; font-size: 15px; }
.atsw-subtitle { font-size: 11px; opacity: .85; }
.atsw-subtitle[hidden] { display: none; }
.atsw-close { background: transparent; border: 0; color: var(--atsw-on-primary); font-size: 22px; line-height: 1; cursor: pointer; opacity: .9; padding: 0 2px; }
.atsw-close:hover { opacity: 1; }
.atsw-human { margin-left: auto; background: transparent; border: 1px solid currentColor; color: var(--atsw-on-primary); font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 6px; cursor: pointer; opacity: .9; white-space: nowrap; }
.atsw-human:hover { opacity: 1; }
.atsw-log { flex: 1; overflow-y: auto; padding: 14px; background: var(--atsw-surface); }
.atsw-msg { display: flex; margin-bottom: 10px; }
.atsw-user { justify-content: flex-end; }
.atsw-bubble {
  max-width: 80%; padding: 9px 12px; border-radius: 12px; font-size: 14px; line-height: 1.4;
  white-space: pre-wrap; word-wrap: break-word;
}
.atsw-assistant .atsw-bubble { background: var(--atsw-bg); color: var(--atsw-text); border: 1px solid var(--atsw-border); border-bottom-left-radius: 4px; }
.atsw-user .atsw-bubble { background: var(--atsw-primary); color: var(--atsw-on-primary); border-bottom-right-radius: 4px; }
.atsw-pending .atsw-bubble { color: var(--atsw-muted); }
.atsw-form { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--atsw-border); background: var(--atsw-bg); }
.atsw-input {
  flex: 1; resize: none; max-height: 96px; padding: 9px 11px; border: 1px solid var(--atsw-border);
  border-radius: 10px; font-size: 14px; outline: none; background: var(--atsw-input-bg); color: var(--atsw-text);
}
.atsw-input::placeholder { color: var(--atsw-muted); }
.atsw-input:focus { border-color: var(--atsw-primary); }
.atsw-send {
  border: 0; border-radius: 10px; padding: 0 16px; background: var(--atsw-primary);
  color: var(--atsw-on-primary); font-weight: 600; font-size: 14px; cursor: pointer;
}
.atsw-send:disabled { opacity: .5; cursor: default; }
.atsw-form[hidden] { display: none; }
.atsw-offer { display: inline-block; background: var(--atsw-bg); border: 1px solid var(--atsw-primary); color: var(--atsw-primary); font-size: 13px; font-weight: 600; padding: 7px 12px; border-radius: 12px; cursor: pointer; }
.atsw-offer:hover { filter: brightness(1.05); }
.atsw-handoff { display: flex; flex-direction: column; gap: 8px; padding: 12px; border-top: 1px solid var(--atsw-border); background: var(--atsw-bg); }
.atsw-handoff[hidden] { display: none; }
.atsw-h-intro { font-size: 13px; color: var(--atsw-text); }
.atsw-h-input { width: 100%; padding: 8px 10px; border: 1px solid var(--atsw-border); border-radius: 8px; font-size: 13px; outline: none; resize: none; font-family: inherit; background: var(--atsw-input-bg); color: var(--atsw-text); }
.atsw-h-input::placeholder { color: var(--atsw-muted); }
.atsw-h-input:focus { border-color: var(--atsw-primary); }
.atsw-h-row { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
.atsw-h-cancel { background: transparent; border: 0; color: var(--atsw-muted); font-size: 13px; cursor: pointer; padding: 0 8px; }
@media (prefers-reduced-motion: no-preference) { .atsw-panel { animation: atsw-in .16s ease-out; } }
@keyframes atsw-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
`;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):b();})();
