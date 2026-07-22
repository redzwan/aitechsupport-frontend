"use strict";(()=>{var m={title:"Chat with us",subtitle:"We typically reply in a few minutes",greeting:"Hi! How can I help you today?",primary_color:"#4f46e5",position:"right",launcher_label:"Chat",theme:"auto",handoff_mode:"form"},T=["image/png","image/jpeg","image/webp","image/gif"],S=5*1024*1024;function E(o){let t=document.createElement("a");t.className="atsw-imglink",t.href=o,t.target="_blank",t.rel="noopener noreferrer";let e=document.createElement("img");return e.className="atsw-img",e.alt="Attached image",e.loading="lazy",e.addEventListener("error",()=>{let a=n("div","atsw-imggone");a.textContent="Image unavailable",t.replaceWith(a)}),e.src=o,t.appendChild(e),t}var f=document.currentScript;function k(){var s,i;let o=window;if(o.__aiTechSupportWidgetLoaded)return;let t=(s=f==null?void 0:f.getAttribute("data-public-key"))==null?void 0:s.trim();if(!t){console.warn("[AiTechSupport] widget: missing data-public-key");return}o.__aiTechSupportWidgetLoaded=!0;let a=`${(((i=f==null?void 0:f.getAttribute("data-api-base"))==null?void 0:i.trim())||"https://api.aitechsupport.my").replace(/\/+$/,"")}/api/v1/public/widget/${encodeURIComponent(t)}`;new y(t,a).init()}var y=class{constructor(t,e){this.publicKey=t;this.base=e;this.cfg=m;this.open=!1;this.busy=!1;this.greeted=!1;this.lastQuestion="";this.handoffDone=!1;this.humanMode=!1;this.lastAgentId=0;this.pendingFile=null;this.pendingObjectUrl=null;this.sessionId=_(t)}init(){let t=document.createElement("div");t.setAttribute("data-aitechsupport-widget",""),document.body.appendChild(t),this.root=t.attachShadow({mode:"open"}),B(this.root),this.build(),this.loadConfig()}build(){let t=n("div","atsw-wrap");this.launcher=n("button","atsw-launcher"),this.launcher.type="button",this.launcher.setAttribute("aria-label","Open chat"),this.launcher.setAttribute("aria-haspopup","dialog"),this.launcher.setAttribute("aria-expanded","false"),this.launcher.textContent=this.cfg.launcher_label,this.launcher.addEventListener("click",()=>this.toggle()),this.panel=n("section","atsw-panel"),this.panel.setAttribute("role","dialog"),this.panel.setAttribute("aria-modal","false"),this.panel.setAttribute("aria-label",this.cfg.title),this.panel.hidden=!0;let e=n("header","atsw-header"),a=n("div","atsw-titles"),s=n("span","atsw-title");s.textContent=this.cfg.title;let i=n("span","atsw-subtitle");i.hidden=!0,a.append(s,i);let r=n("button","atsw-human");r.type="button",r.textContent="Talk to a human",r.addEventListener("click",()=>this.requestHuman());let l=n("button","atsw-close");l.type="button",l.setAttribute("aria-label","Close chat"),l.textContent="\xD7",l.addEventListener("click",()=>this.toggle(!1)),e.append(a,r,l),this.log=n("div","atsw-log"),this.log.setAttribute("role","log"),this.log.setAttribute("aria-live","polite");let d=n("form","atsw-form");this.form=d,this.input=n("textarea","atsw-input"),this.input.rows=1,this.input.placeholder="Type your message\u2026",this.input.setAttribute("aria-label","Message"),this.input.addEventListener("keydown",h=>{h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),this.send())}),this.sendBtn=n("button","atsw-send"),this.sendBtn.type="submit",this.sendBtn.textContent="Send",this.attachBtn=n("button","atsw-attach"),this.attachBtn.type="button",this.attachBtn.title="Attach an image",this.attachBtn.setAttribute("aria-label","Attach an image"),this.attachBtn.textContent="\u{1F5BC}",this.fileInput=n("input","atsw-file"),this.fileInput.type="file",this.fileInput.accept=T.join(","),this.fileInput.hidden=!0,this.attachBtn.addEventListener("click",()=>this.fileInput.click()),this.fileInput.addEventListener("change",()=>this.onPickFile()),this.preview=n("div","atsw-preview"),this.preview.hidden=!0,d.append(this.attachBtn,this.input,this.sendBtn,this.fileInput),d.addEventListener("submit",h=>{h.preventDefault(),this.send()}),this.buildHandoff(),this.panel.append(e,this.log,this.preview,d,this.handoffView),t.append(this.panel,this.launcher),this.root.appendChild(t),this.root.addEventListener("keydown",h=>{h.key==="Escape"&&this.open&&this.toggle(!1)})}async loadConfig(){try{let t=await fetch(`${this.base}/config`,{method:"GET"});t.ok&&(this.cfg={...m,...await t.json()})}catch{}this.applyConfig()}applyConfig(){let t=this.root.host,e=this.cfg.primary_color||m.primary_color;t.style.setProperty("--atsw-primary",e),t.style.setProperty("--atsw-on-primary",P(e)),t.setAttribute("data-position",this.cfg.position==="left"?"left":"right");let a=this.cfg.theme==="dark"||this.cfg.theme==="light"?this.cfg.theme:"auto";a==="auto"?t.removeAttribute("data-theme"):t.setAttribute("data-theme",a),this.launcher.textContent=this.cfg.launcher_label||m.launcher_label,this.panel.querySelector(".atsw-title").textContent=this.cfg.title;let s=this.panel.querySelector(".atsw-subtitle");s.textContent=this.cfg.subtitle||"",s.hidden=!this.cfg.subtitle,this.panel.setAttribute("aria-label",this.cfg.title)}toggle(t){this.open=t!=null?t:!this.open,this.panel.hidden=!this.open,this.launcher.setAttribute("aria-expanded",this.open?"true":"false"),this.launcher.setAttribute("aria-label",this.open?"Close chat":"Open chat"),this.open?(this.greeted||(this.greeted=!0,this.addMessage("assistant",this.cfg.greeting)),this.input.focus()):this.launcher.focus()}addMessage(t,e,a){let s=n("div",`atsw-msg atsw-${t}`),i=n("div","atsw-bubble");if(a&&i.appendChild(E(a)),e||!a)if(a){let r=document.createElement("span");r.textContent=e,i.appendChild(r)}else i.textContent=e;return s.appendChild(i),this.log.appendChild(s),this.log.scrollTop=this.log.scrollHeight,i}notice(t){let e=n("div","atsw-msg atsw-assistant"),a=n("div","atsw-bubble atsw-notice");a.textContent=t,e.appendChild(a),this.log.appendChild(e),this.log.scrollTop=this.log.scrollHeight}onPickFile(){let t=this.fileInput.files&&this.fileInput.files[0];if(this.fileInput.value="",!!t){if(T.indexOf(t.type)<0){this.notice("Please choose a PNG, JPEG, WebP or GIF image.");return}if(t.size>S){this.notice("That image is too large \u2014 the limit is 5MB.");return}this.setPendingFile(t)}}setPendingFile(t){this.clearPendingFile(),this.pendingFile=t,this.pendingObjectUrl=URL.createObjectURL(t);let e=document.createElement("img");e.className="atsw-thumb",e.alt="",e.src=this.pendingObjectUrl;let a=n("span","atsw-thumbname");a.textContent=t.name;let s=n("button","atsw-thumbx");s.type="button",s.setAttribute("aria-label","Remove image"),s.textContent="\xD7",s.addEventListener("click",()=>this.clearPendingFile()),this.preview.textContent="",this.preview.append(e,a,s),this.preview.hidden=!1,this.input.focus()}clearPendingFile(){this.pendingObjectUrl&&URL.revokeObjectURL(this.pendingObjectUrl),this.pendingObjectUrl=null,this.pendingFile=null,this.preview.textContent="",this.preview.hidden=!0}async uploadImage(t){let e=new FormData;e.append("file",t),e.append("session_id",this.sessionId);try{let a=await fetch(`${this.base}/upload`,{method:"POST",body:e});if(a.ok)return await a.json();this.notice(a.status===413?"That image is too large \u2014 the limit is 5MB.":a.status===415?"That file type isn't supported. Try a PNG or JPEG.":a.status===503?"Image uploads are unavailable right now.":"Sorry, the image couldn't be uploaded. Please try again.")}catch{this.notice("Sorry, the image couldn't be uploaded. Please try again.")}return null}renderAnswer(t,e){t.textContent=e,this.log.scrollTop=this.log.scrollHeight}renderThinking(t){t.textContent="",t.setAttribute("aria-label","Assistant is thinking");let s=n("div","atsw-thinking");s.style.gridTemplateColumns="repeat(12, 6px)";for(let i=0;i<3;i++)for(let r=0;r<12;r++){let l=n("span","atsw-cell");l.style.animationDelay=`-${(r*.08+i*.04).toFixed(2)}s`,s.appendChild(l)}t.appendChild(s)}async send(){var r;let t=this.input.value.trim(),e=this.pendingFile;if(!t&&!e||this.busy)return;this.lastQuestion=t,this.setBusy(!0);let a,s;if(e){let l=await this.uploadImage(e);if(!l){this.setBusy(!1);return}a=l.image_key,s=l.url,this.clearPendingFile()}this.input.value="",this.addMessage("user",t,s);let i=this.addMessage("assistant","\u2026");(r=i.parentElement)==null||r.classList.add("atsw-pending"),this.renderThinking(i);try{await this.streamChat(t,i,a)||await this.bufferedChat(t,i,a)}finally{this.setBusy(!1),this.input.focus()}}async streamChat(t,e,a){var d,h;let s;try{s=await fetch(`${this.base}/chat/stream`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:t,session_id:this.sessionId,image_key:a})})}catch{return!1}if((d=e.parentElement)==null||d.classList.remove("atsw-pending"),!s.ok||!s.body)return this.renderAnswer(e,v(s.status)),!0;let i="",r="",l=!1;try{let w=s.body.getReader(),g=new TextDecoder;for(;;){let{done:p,value:u}=await w.read();if(p)break;r+=g.decode(u,{stream:!0});let b;for(;(b=r.indexOf(`

`))>=0;){let H=r.slice(0,b);r=r.slice(b+2);let x=H.split(`
`).find(I=>I.startsWith("data:"));if(!x)continue;let c;try{c=JSON.parse(x.slice(5).trim())}catch{continue}if(c.type==="delta")i+=c.text||"",l=!0,this.renderAnswer(e,i);else if(c.type==="done"){if(c.session_id&&(this.sessionId=c.session_id,C(this.publicKey,this.sessionId)),c.status==="human"||c.status==="needs_human")return l||(h=e.parentElement)==null||h.remove(),this.enterHumanMode(),!0;c.handoff&&this.offerHandoff()}else if(c.type==="error")return c.detail==="busy"?(this.renderAnswer(e,"We're a bit busy right now \u2014 please try again in a moment."),!0):l?(this.renderAnswer(e,i+`

(Sorry \u2014 the reply was cut off.)`),!0):!1}}}catch{}return!!l}async bufferedChat(t,e,a){var s,i,r;try{let l=await fetch(`${this.base}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:t,session_id:this.sessionId,image_key:a})});if((s=e.parentElement)==null||s.classList.remove("atsw-pending"),l.ok){let d=await l.json();d.session_id&&(this.sessionId=d.session_id,C(this.publicKey,this.sessionId)),d.status==="human"||d.status==="needs_human"?((i=e.parentElement)==null||i.remove(),this.enterHumanMode()):(this.renderAnswer(e,String(d.answer||"")),d.handoff&&this.offerHandoff())}else this.renderAnswer(e,v(l.status))}catch{(r=e.parentElement)==null||r.classList.remove("atsw-pending"),this.renderAnswer(e,"Sorry, I couldn't reach the assistant. Please try again.")}}buildHandoff(){let t=n("form","atsw-handoff");t.hidden=!0;let e=n("div","atsw-h-intro");e.textContent="Leave your details and we'll get back to you.",this.hName=n("input","atsw-h-input"),this.hName.placeholder="Your name",this.hName.setAttribute("aria-label","Your name"),this.hEmail=n("input","atsw-h-input"),this.hEmail.type="email",this.hEmail.placeholder="Your email",this.hEmail.setAttribute("aria-label","Your email"),this.hMsg=n("textarea","atsw-h-input"),this.hMsg.rows=2,this.hMsg.placeholder="How can we help?",this.hMsg.setAttribute("aria-label","Message");let a=n("div","atsw-h-row"),s=n("button","atsw-send");s.type="submit",s.textContent="Send request";let i=n("button","atsw-h-cancel");i.type="button",i.textContent="Cancel",i.addEventListener("click",()=>this.closeHandoff()),a.append(i,s),t.append(e,this.hName,this.hEmail,this.hMsg,a),t.addEventListener("submit",r=>{r.preventDefault(),this.submitHandoff(s)}),this.handoffView=t}openHandoff(){this.handoffDone||(this.toggle(!0),this.hMsg.value=this.lastQuestion||"",this.form.hidden=!0,this.handoffView.hidden=!1,this.hName.focus())}closeHandoff(){this.handoffView.hidden=!0,this.form.hidden=!1,this.input.focus()}async whatsappLink(){try{let t=this.sessionId?`?session_id=${encodeURIComponent(this.sessionId)}`:"",e=await fetch(`${this.base}/whatsapp${t}`,{method:"GET"});if(!e.ok)return null;let a=await e.json();return a&&a.enabled&&typeof a.url=="string"?a.url:null}catch{return null}}markWhatsappOpened(){let t=JSON.stringify({session_id:this.sessionId}),e=`${this.base}/whatsapp/opened`;try{if(navigator.sendBeacon){navigator.sendBeacon(e,new Blob([t],{type:"application/json"}));return}}catch{}fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:t,keepalive:!0}).catch(()=>{})}requestHuman(){if(this.handoffDone)return;this.toggle(!0);let t=this.cfg.handoff_mode;if(t==="whatsapp"||t==="both"){this.offerWhatsapp(t==="both");return}this.openHandoff()}offerHandoff(){if(this.handoffDone)return;let t=this.cfg.handoff_mode;if(t==="whatsapp"||t==="both"){this.offerWhatsapp(t==="both");return}this.offerForm()}async offerWhatsapp(t){let e=await this.whatsappLink();if(this.handoffDone)return;if(!e){this.offerForm();return}let a=n("div","atsw-msg atsw-assistant"),s=n("a","atsw-offer atsw-offer-wa");if(s.href=e,s.target="_blank",s.rel="noopener noreferrer",s.textContent="\u{1F4AC} Continue on WhatsApp",s.addEventListener("click",()=>this.markWhatsappOpened()),a.appendChild(s),t){let i=n("button","atsw-offer-alt");i.type="button",i.textContent="Or leave your details",i.addEventListener("click",()=>this.openHandoff()),a.appendChild(i)}this.log.appendChild(a),this.log.scrollTop=this.log.scrollHeight}offerForm(){if(this.handoffDone)return;let t=n("div","atsw-msg atsw-assistant"),e=n("button","atsw-offer");e.type="button",e.textContent="\u{1F4AC} Talk to a human",e.addEventListener("click",()=>this.openHandoff()),t.appendChild(e),this.log.appendChild(t),this.log.scrollTop=this.log.scrollHeight}async submitHandoff(t){let e=this.hName.value.trim(),a=this.hEmail.value.trim();if(!e||!a||a.indexOf("@")<1){(e?this.hEmail:this.hName).focus();return}t.disabled=!0;try{let s=await fetch(`${this.base}/handoff`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:this.sessionId,name:e,email:a,message:this.hMsg.value.trim()})});s.ok?(this.handoffDone=!0,this.closeHandoff(),this.addMessage("assistant",`Thanks, ${e}! Someone will reply to you here shortly.`),this.enterHumanMode()):(this.addMessage("assistant",v(s.status)),this.closeHandoff())}catch{this.addMessage("assistant","Sorry, we couldn't submit that. Please try again.")}finally{t.disabled=!1}}enterHumanMode(){this.humanMode||(this.humanMode=!0,this.addMessage("assistant","You're connected to our team \u2014 someone will reply here shortly."),this.startAgentStream())}startAgentStream(){if(this.agentAbort)return;let t=new AbortController;this.agentAbort=t,(async()=>{var r;let e;try{e=await fetch(`${this.base}/conversation/${encodeURIComponent(this.sessionId)}/stream?after=${this.lastAgentId}`,{signal:t.signal})}catch{this.fallbackToPoll(t);return}if(!e.ok||!e.body){this.fallbackToPoll(t);return}let a=e.body.getReader(),s=new TextDecoder,i="";try{for(;;){let{done:l,value:d}=await a.read();if(l)break;i+=s.decode(d,{stream:!0});let h;for(;(h=i.indexOf(`

`))>=0;){let w=i.slice(0,h);i=i.slice(h+2);let g=w.split(`
`).find(u=>u.startsWith("data:"));if(!g)continue;let p;try{p=JSON.parse(g.slice(5).trim())}catch{continue}if(p.type==="message"&&p.message){let u=(r=p.message.id)!=null?r:0;u>this.lastAgentId&&(this.lastAgentId=u,this.addAgentMessage(String(p.message.content||""),p.message.sender_name,p.message.image_url))}else if(p.type==="status"&&p.status==="resolved"){this.addMessage("assistant","This conversation has been closed. Thanks for chatting!"),this.stopAgentStream();return}}}}catch{}this.agentAbort===t&&this.fallbackToPoll(t)})()}stopAgentStream(){var t;(t=this.agentAbort)==null||t.abort(),this.agentAbort=void 0,this.stopAgentPoll()}fallbackToPoll(t){this.agentAbort===t&&(this.agentAbort=void 0),this.startAgentPoll()}startAgentPoll(){if(this.agentPollTimer)return;let t=async()=>{try{let e=await fetch(`${this.base}/conversation/${encodeURIComponent(this.sessionId)}/messages?after=${this.lastAgentId}`);if(!e.ok)return;let a=await e.json();for(let s of a.messages||[])typeof s.id=="number"&&s.id>this.lastAgentId&&(this.lastAgentId=s.id),this.addAgentMessage(String(s.content||""),s.sender_name,s.image_url);a.status==="resolved"&&(this.stopAgentPoll(),this.addMessage("assistant","This conversation has been closed. Thanks for chatting!"))}catch{}};t(),this.agentPollTimer=setInterval(t,4e3)}stopAgentPoll(){this.agentPollTimer&&(clearInterval(this.agentPollTimer),this.agentPollTimer=void 0)}addAgentMessage(t,e,a){let s=n("div","atsw-msg atsw-assistant"),i=n("div","atsw-bubble"),r=n("div","atsw-agentlabel");r.textContent=e&&e.trim()||"Support",i.append(r),a&&i.appendChild(E(a));let l=document.createElement("span");l.textContent=t,i.append(l),s.appendChild(i),this.log.appendChild(s),this.log.scrollTop=this.log.scrollHeight}setBusy(t){this.busy=t,this.sendBtn.disabled=t,this.input.disabled=t,this.attachBtn.disabled=t}};function v(o){return o===429?"You're sending messages a bit fast \u2014 please wait a moment and try again.":o===402||o===503?"The assistant is unavailable right now. Please try again later.":o===404?"This chat is not available.":"Something went wrong. Please try again."}function _(o){try{let t=`ats_widget_session_${o}`,e=localStorage.getItem(t);return e||(e=A(),localStorage.setItem(t,e)),e}catch{return A()}}function C(o,t){try{localStorage.setItem(`ats_widget_session_${o}`,t)}catch{}}function A(){let o=globalThis.crypto;return o!=null&&o.randomUUID?o.randomUUID().replace(/-/g,""):`s${Date.now().toString(36)}${Math.floor(Math.random()*1e9).toString(36)}`}function n(o,t){let e=document.createElement(o);return e.className=t,e}function P(o){let t=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((o||"").trim());if(!t)return"#ffffff";let e=t[1];e.length===3&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]);let a=parseInt(e.slice(0,2),16),s=parseInt(e.slice(2,4),16),i=parseInt(e.slice(4,6),16);return(a*299+s*587+i*114)/1e3>=140?"#111111":"#ffffff"}function B(o){try{let t=new CSSStyleSheet;t.replaceSync(L),o.adoptedStyleSheets=[t]}catch{let t=document.createElement("style");t.textContent=L,o.appendChild(t)}}var M="--atsw-bg:#1f2023;--atsw-surface:#161719;--atsw-text:#f2f2f4;--atsw-muted:#a9adb6;--atsw-border:#34363a;--atsw-input-bg:#26272b;",L=`
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
:host([data-theme="dark"]) { ${M} }
@media (prefers-color-scheme: dark) { :host(:not([data-theme="light"])) { ${M} } }
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
/* Image attachment: composer button, staged preview, and rendered bubbles. */
.atsw-attach {
  flex: 0 0 auto; width: 36px; border: 1px solid var(--atsw-border); border-radius: 10px;
  background: var(--atsw-input-bg); color: var(--atsw-text); font-size: 15px; line-height: 1;
  cursor: pointer; padding: 0;
}
.atsw-attach:hover:not(:disabled) { border-color: var(--atsw-primary); }
.atsw-attach:disabled { opacity: .5; cursor: default; }
.atsw-preview {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  border-top: 1px solid var(--atsw-border); background: var(--atsw-bg);
}
.atsw-preview[hidden] { display: none; }
.atsw-thumb { width: 34px; height: 34px; object-fit: cover; border-radius: 6px; border: 1px solid var(--atsw-border); }
.atsw-thumbname {
  flex: 1; min-width: 0; font-size: 12px; color: var(--atsw-muted);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.atsw-thumbx {
  flex: 0 0 auto; border: 0; background: transparent; color: var(--atsw-muted);
  font-size: 18px; line-height: 1; cursor: pointer; padding: 0 4px;
}
.atsw-thumbx:hover { color: var(--atsw-text); }
.atsw-imglink { display: block; margin-bottom: 6px; }
.atsw-img { display: block; max-width: 100%; max-height: 220px; border-radius: 8px; }
.atsw-imggone { font-size: 12px; font-style: italic; opacity: .7; margin-bottom: 6px; }
.atsw-notice { font-size: 13px; opacity: .85; }
.atsw-offer { display: inline-block; background: var(--atsw-bg); border: 1px solid var(--atsw-primary); color: var(--atsw-primary); font-size: 13px; font-weight: 600; padding: 7px 12px; border-radius: 12px; cursor: pointer; }
.atsw-offer:hover { filter: brightness(1.05); }
.atsw-offer-wa { text-decoration: none; border-color: #25d366; color: #128c4a; }
.atsw-offer-wa:hover { background: #25d366; color: #fff; border-color: #25d366; }
.atsw-offer-alt { display: block; margin-top: 6px; background: none; border: 0; padding: 0; color: var(--atsw-muted); font-size: 12px; text-decoration: underline; cursor: pointer; }
.atsw-offer-alt:hover { color: var(--atsw-fg); }
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
`;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k();})();
