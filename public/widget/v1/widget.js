"use strict";(()=>{var m={title:"Chat with us",subtitle:"We typically reply in a few minutes",greeting:"Hi! How can I help you today?",primary_color:"#4f46e5",position:"right",launcher_label:"Chat",theme:"auto"},f=document.currentScript;function x(){var s,i;let r=window;if(r.__aiTechSupportWidgetLoaded)return;let t=(s=f==null?void 0:f.getAttribute("data-public-key"))==null?void 0:s.trim();if(!t){console.warn("[AiTechSupport] widget: missing data-public-key");return}r.__aiTechSupportWidgetLoaded=!0;let a=`${(((i=f==null?void 0:f.getAttribute("data-api-base"))==null?void 0:i.trim())||"https://api.aitechsupport.my").replace(/\/+$/,"")}/api/v1/public/widget/${encodeURIComponent(t)}`;new v(t,a).init()}var v=class{constructor(t,e){this.publicKey=t;this.base=e;this.cfg=m;this.open=!1;this.busy=!1;this.greeted=!1;this.lastQuestion="";this.handoffDone=!1;this.humanMode=!1;this.lastAgentId=0;this.sessionId=H(t)}init(){let t=document.createElement("div");t.setAttribute("data-aitechsupport-widget",""),document.body.appendChild(t),this.root=t.attachShadow({mode:"open"}),S(this.root),this.build(),this.loadConfig()}build(){let t=n("div","atsw-wrap");this.launcher=n("button","atsw-launcher"),this.launcher.type="button",this.launcher.setAttribute("aria-label","Open chat"),this.launcher.setAttribute("aria-haspopup","dialog"),this.launcher.setAttribute("aria-expanded","false"),this.launcher.textContent=this.cfg.launcher_label,this.launcher.addEventListener("click",()=>this.toggle()),this.panel=n("section","atsw-panel"),this.panel.setAttribute("role","dialog"),this.panel.setAttribute("aria-modal","false"),this.panel.setAttribute("aria-label",this.cfg.title),this.panel.hidden=!0;let e=n("header","atsw-header"),a=n("div","atsw-titles"),s=n("span","atsw-title");s.textContent=this.cfg.title;let i=n("span","atsw-subtitle");i.hidden=!0,a.append(s,i);let o=n("button","atsw-human");o.type="button",o.textContent="Talk to a human",o.addEventListener("click",()=>this.openHandoff());let l=n("button","atsw-close");l.type="button",l.setAttribute("aria-label","Close chat"),l.textContent="\xD7",l.addEventListener("click",()=>this.toggle(!1)),e.append(a,o,l),this.log=n("div","atsw-log"),this.log.setAttribute("role","log"),this.log.setAttribute("aria-live","polite");let p=n("form","atsw-form");this.form=p,this.input=n("textarea","atsw-input"),this.input.rows=1,this.input.placeholder="Type your message\u2026",this.input.setAttribute("aria-label","Message"),this.input.addEventListener("keydown",d=>{d.key==="Enter"&&!d.shiftKey&&(d.preventDefault(),this.send())}),this.sendBtn=n("button","atsw-send"),this.sendBtn.type="submit",this.sendBtn.textContent="Send",p.append(this.input,this.sendBtn),p.addEventListener("submit",d=>{d.preventDefault(),this.send()}),this.buildHandoff(),this.panel.append(e,this.log,p,this.handoffView),t.append(this.panel,this.launcher),this.root.appendChild(t),this.root.addEventListener("keydown",d=>{d.key==="Escape"&&this.open&&this.toggle(!1)})}async loadConfig(){try{let t=await fetch(`${this.base}/config`,{method:"GET"});t.ok&&(this.cfg={...m,...await t.json()})}catch{}this.applyConfig()}applyConfig(){let t=this.root.host,e=this.cfg.primary_color||m.primary_color;t.style.setProperty("--atsw-primary",e),t.style.setProperty("--atsw-on-primary",L(e)),t.setAttribute("data-position",this.cfg.position==="left"?"left":"right");let a=this.cfg.theme==="dark"||this.cfg.theme==="light"?this.cfg.theme:"auto";a==="auto"?t.removeAttribute("data-theme"):t.setAttribute("data-theme",a),this.launcher.textContent=this.cfg.launcher_label||m.launcher_label,this.panel.querySelector(".atsw-title").textContent=this.cfg.title;let s=this.panel.querySelector(".atsw-subtitle");s.textContent=this.cfg.subtitle||"",s.hidden=!this.cfg.subtitle,this.panel.setAttribute("aria-label",this.cfg.title)}toggle(t){this.open=t!=null?t:!this.open,this.panel.hidden=!this.open,this.launcher.setAttribute("aria-expanded",this.open?"true":"false"),this.launcher.setAttribute("aria-label",this.open?"Close chat":"Open chat"),this.open?(this.greeted||(this.greeted=!0,this.addMessage("assistant",this.cfg.greeting)),this.input.focus()):this.launcher.focus()}addMessage(t,e){let a=n("div",`atsw-msg atsw-${t}`),s=n("div","atsw-bubble");return s.textContent=e,a.appendChild(s),this.log.appendChild(a),this.log.scrollTop=this.log.scrollHeight,s}renderAnswer(t,e){t.textContent=e,this.log.scrollTop=this.log.scrollHeight}renderThinking(t){t.textContent="",t.setAttribute("aria-label","Assistant is thinking");let s=n("div","atsw-thinking");s.style.gridTemplateColumns="repeat(12, 6px)";for(let i=0;i<3;i++)for(let o=0;o<12;o++){let l=n("span","atsw-cell");l.style.animationDelay=`-${(o*.08+i*.04).toFixed(2)}s`,s.appendChild(l)}t.appendChild(s)}async send(){var a;let t=this.input.value.trim();if(!t||this.busy)return;this.lastQuestion=t,this.setBusy(!0),this.input.value="",this.addMessage("user",t);let e=this.addMessage("assistant","\u2026");(a=e.parentElement)==null||a.classList.add("atsw-pending"),this.renderThinking(e);try{await this.streamChat(t,e)||await this.bufferedChat(t,e)}finally{this.setBusy(!1),this.input.focus()}}async streamChat(t,e){var l,p;let a;try{a=await fetch(`${this.base}/chat/stream`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:t,session_id:this.sessionId})})}catch{return!1}if((l=e.parentElement)==null||l.classList.remove("atsw-pending"),!a.ok||!a.body)return this.renderAnswer(e,b(a.status)),!0;let s="",i="",o=!1;try{let d=a.body.getReader(),w=new TextDecoder;for(;;){let{done:g,value:c}=await d.read();if(g)break;i+=w.decode(c,{stream:!0});let u;for(;(u=i.indexOf(`

`))>=0;){let k=i.slice(0,u);i=i.slice(u+2);let y=k.split(`
`).find(C=>C.startsWith("data:"));if(!y)continue;let h;try{h=JSON.parse(y.slice(5).trim())}catch{continue}if(h.type==="delta")s+=h.text||"",o=!0,this.renderAnswer(e,s);else if(h.type==="done"){if(h.session_id&&(this.sessionId=h.session_id,T(this.publicKey,this.sessionId)),h.status==="human"||h.status==="needs_human")return o||(p=e.parentElement)==null||p.remove(),this.enterHumanMode(),!0;h.handoff&&this.offerHandoff()}else if(h.type==="error")return h.detail==="busy"?(this.renderAnswer(e,"We're a bit busy right now \u2014 please try again in a moment."),!0):o?(this.renderAnswer(e,s+`

(Sorry \u2014 the reply was cut off.)`),!0):!1}}}catch{}return!!o}async bufferedChat(t,e){var a,s,i;try{let o=await fetch(`${this.base}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:t,session_id:this.sessionId})});if((a=e.parentElement)==null||a.classList.remove("atsw-pending"),o.ok){let l=await o.json();l.session_id&&(this.sessionId=l.session_id,T(this.publicKey,this.sessionId)),l.status==="human"||l.status==="needs_human"?((s=e.parentElement)==null||s.remove(),this.enterHumanMode()):(this.renderAnswer(e,String(l.answer||"")),l.handoff&&this.offerHandoff())}else this.renderAnswer(e,b(o.status))}catch{(i=e.parentElement)==null||i.classList.remove("atsw-pending"),this.renderAnswer(e,"Sorry, I couldn't reach the assistant. Please try again.")}}buildHandoff(){let t=n("form","atsw-handoff");t.hidden=!0;let e=n("div","atsw-h-intro");e.textContent="Leave your details and we'll get back to you.",this.hName=n("input","atsw-h-input"),this.hName.placeholder="Your name",this.hName.setAttribute("aria-label","Your name"),this.hEmail=n("input","atsw-h-input"),this.hEmail.type="email",this.hEmail.placeholder="Your email",this.hEmail.setAttribute("aria-label","Your email"),this.hMsg=n("textarea","atsw-h-input"),this.hMsg.rows=2,this.hMsg.placeholder="How can we help?",this.hMsg.setAttribute("aria-label","Message");let a=n("div","atsw-h-row"),s=n("button","atsw-send");s.type="submit",s.textContent="Send request";let i=n("button","atsw-h-cancel");i.type="button",i.textContent="Cancel",i.addEventListener("click",()=>this.closeHandoff()),a.append(i,s),t.append(e,this.hName,this.hEmail,this.hMsg,a),t.addEventListener("submit",o=>{o.preventDefault(),this.submitHandoff(s)}),this.handoffView=t}openHandoff(){this.handoffDone||(this.toggle(!0),this.hMsg.value=this.lastQuestion||"",this.form.hidden=!0,this.handoffView.hidden=!1,this.hName.focus())}closeHandoff(){this.handoffView.hidden=!0,this.form.hidden=!1,this.input.focus()}offerHandoff(){if(this.handoffDone)return;let t=n("div","atsw-msg atsw-assistant"),e=n("button","atsw-offer");e.type="button",e.textContent="\u{1F4AC} Talk to a human",e.addEventListener("click",()=>this.openHandoff()),t.appendChild(e),this.log.appendChild(t),this.log.scrollTop=this.log.scrollHeight}async submitHandoff(t){let e=this.hName.value.trim(),a=this.hEmail.value.trim();if(!e||!a||a.indexOf("@")<1){(e?this.hEmail:this.hName).focus();return}t.disabled=!0;try{let s=await fetch(`${this.base}/handoff`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:this.sessionId,name:e,email:a,message:this.hMsg.value.trim()})});s.ok?(this.handoffDone=!0,this.closeHandoff(),this.addMessage("assistant",`Thanks, ${e}! Someone will reply to you here shortly.`),this.enterHumanMode()):(this.addMessage("assistant",b(s.status)),this.closeHandoff())}catch{this.addMessage("assistant","Sorry, we couldn't submit that. Please try again.")}finally{t.disabled=!1}}enterHumanMode(){this.humanMode||(this.humanMode=!0,this.addMessage("assistant","You're connected to our team \u2014 someone will reply here shortly."),this.startAgentStream())}startAgentStream(){if(this.agentAbort)return;let t=new AbortController;this.agentAbort=t,(async()=>{var o;let e;try{e=await fetch(`${this.base}/conversation/${encodeURIComponent(this.sessionId)}/stream?after=${this.lastAgentId}`,{signal:t.signal})}catch{this.fallbackToPoll(t);return}if(!e.ok||!e.body){this.fallbackToPoll(t);return}let a=e.body.getReader(),s=new TextDecoder,i="";try{for(;;){let{done:l,value:p}=await a.read();if(l)break;i+=s.decode(p,{stream:!0});let d;for(;(d=i.indexOf(`

`))>=0;){let w=i.slice(0,d);i=i.slice(d+2);let g=w.split(`
`).find(u=>u.startsWith("data:"));if(!g)continue;let c;try{c=JSON.parse(g.slice(5).trim())}catch{continue}if(c.type==="message"&&c.message){let u=(o=c.message.id)!=null?o:0;u>this.lastAgentId&&(this.lastAgentId=u,this.addAgentMessage(String(c.message.content||"")))}else if(c.type==="status"&&c.status==="resolved"){this.addMessage("assistant","This conversation has been closed. Thanks for chatting!"),this.stopAgentStream();return}}}}catch{}this.agentAbort===t&&this.fallbackToPoll(t)})()}stopAgentStream(){var t;(t=this.agentAbort)==null||t.abort(),this.agentAbort=void 0,this.stopAgentPoll()}fallbackToPoll(t){this.agentAbort===t&&(this.agentAbort=void 0),this.startAgentPoll()}startAgentPoll(){if(this.agentPollTimer)return;let t=async()=>{try{let e=await fetch(`${this.base}/conversation/${encodeURIComponent(this.sessionId)}/messages?after=${this.lastAgentId}`);if(!e.ok)return;let a=await e.json();for(let s of a.messages||[])typeof s.id=="number"&&s.id>this.lastAgentId&&(this.lastAgentId=s.id),this.addAgentMessage(String(s.content||""));a.status==="resolved"&&(this.stopAgentPoll(),this.addMessage("assistant","This conversation has been closed. Thanks for chatting!"))}catch{}};t(),this.agentPollTimer=setInterval(t,4e3)}stopAgentPoll(){this.agentPollTimer&&(clearInterval(this.agentPollTimer),this.agentPollTimer=void 0)}addAgentMessage(t){let e=n("div","atsw-msg atsw-assistant"),a=n("div","atsw-bubble"),s=n("div","atsw-agentlabel");s.textContent="Support";let i=document.createElement("span");i.textContent=t,a.append(s,i),e.appendChild(a),this.log.appendChild(e),this.log.scrollTop=this.log.scrollHeight}setBusy(t){this.busy=t,this.sendBtn.disabled=t,this.input.disabled=t}};function b(r){return r===429?"You're sending messages a bit fast \u2014 please wait a moment and try again.":r===402||r===503?"The assistant is unavailable right now. Please try again later.":r===404?"This chat is not available.":"Something went wrong. Please try again."}function H(r){try{let t=`ats_widget_session_${r}`,e=localStorage.getItem(t);return e||(e=A(),localStorage.setItem(t,e)),e}catch{return A()}}function T(r,t){try{localStorage.setItem(`ats_widget_session_${r}`,t)}catch{}}function A(){let r=globalThis.crypto;return r!=null&&r.randomUUID?r.randomUUID().replace(/-/g,""):`s${Date.now().toString(36)}${Math.floor(Math.random()*1e9).toString(36)}`}function n(r,t){let e=document.createElement(r);return e.className=t,e}function L(r){let t=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((r||"").trim());if(!t)return"#ffffff";let e=t[1];e.length===3&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]);let a=parseInt(e.slice(0,2),16),s=parseInt(e.slice(2,4),16),i=parseInt(e.slice(4,6),16);return(a*299+s*587+i*114)/1e3>=140?"#111111":"#ffffff"}function S(r){try{let t=new CSSStyleSheet;t.replaceSync(M),r.adoptedStyleSheets=[t]}catch{let t=document.createElement("style");t.textContent=M,r.appendChild(t)}}var E="--atsw-bg:#1f2023;--atsw-surface:#161719;--atsw-text:#f2f2f4;--atsw-muted:#a9adb6;--atsw-border:#34363a;--atsw-input-bg:#26272b;",M=`
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
:host([data-theme="dark"]) { ${E} }
@media (prefers-color-scheme: dark) { :host(:not([data-theme="light"])) { ${E} } }
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
.atsw-agentlabel { display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--atsw-primary); margin-bottom: 2px; }
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
/* "Thinking" dot-matrix \u2014 a brightness wave sweeps across in --atsw-primary. */
.atsw-thinking { display: inline-grid; gap: 4px; align-items: center; padding: 1px 0; }
.atsw-cell { width: 6px; height: 6px; border-radius: 2px; background: var(--atsw-primary); opacity: .16; }
@media (prefers-reduced-motion: no-preference) {
  .atsw-cell { animation: atsw-shimmer 1.15s ease-in-out infinite; }
}
@media (prefers-reduced-motion: reduce) { .atsw-cell { opacity: .45; } }
@keyframes atsw-shimmer {
  0%, 100% { opacity: .16; transform: scale(1); }
  45% { opacity: 1; transform: scale(1.35); }
}
`;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",x):x();})();
