sap.ui.define(['require', 'exports', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/Icons'], (function (require, exports, ManagedStyles, Icons) { 'use strict';

    const e$9=t=>{const p=t.openEnd;t.openEnd=function(){return this._mAttributes?.popover&&delete this._mAttributes.popover,p.apply(this)};},n$b=t=>{"prototype"in t&&"openEnd"in t.prototype?e$9(t.prototype):"openEnd"in t&&e$9(t);};

    var t$8 = "[data-sap-ui-popup][popover]{border:none;overflow:visible;margin:0}.sapUiBLy[popover]{width:100%;height:100%}";

    const e$8=()=>{ManagedStyles.R(t$8,"data-ui5-popup-styles");};

    const t$7=ManagedStyles.m("PatchedFunctions",{}),a$9=o=>{const e=t$7[o];return !e||!e.version?true:ManagedStyles.g$1(ManagedStyles.e,e.version)>0},p$4=ManagedStyles.m("AllOpenedPopupsRegistry",{openedRegistry:[]}),y$5=o=>{p$4.openedRegistry.push(o);},d$5=o=>{const e=p$4.openedRegistry.findIndex(n=>n.instance===o);e===p$4.openedRegistry.length-1&&O$2(),e>-1&&p$4.openedRegistry.splice(e,1);},g$5=()=>p$4.openedRegistry.length===0?null:p$4.openedRegistry[p$4.openedRegistry.length-1].instance,P$2=o=>{for(let e=p$4.openedRegistry.length-1;e>=0;e--){const n=p$4.openedRegistry[e];if(n.type==="WebComponent")return  true;if(n.instance===o)break}return  false},c$6=o=>{const e=o.getContent();return e instanceof HTMLElement?e:e?.getDomRef()||null},v$3=o=>{if(!["OPENING","OPEN"].includes(o.getOpenState())||!l$9())return;const n=c$6(o);if(!n)return;const s=document.getElementById("sap-ui-blocklayer-popup");o.getModal()&&s&&(s.setAttribute("popover","manual"),s.hidePopover(),s.showPopover()),n.setAttribute("popover","manual"),n.hidePopover(),n.showPopover();},I$2=o=>{const e=c$6(o);if(e&&(e.hasAttribute("popover")&&(e.hidePopover(),e.removeAttribute("popover")),g$5()===o&&o.getModal())){const n=document.getElementById("sap-ui-blocklayer-popup");n&&n.hasAttribute("popover")&&n.hidePopover();}},O$2=()=>{if(!l$9())return;const o=p$4.openedRegistry[p$4.openedRegistry.length-2];if(!o||o.type!=="OpenUI5"||!o.instance.getModal())return;const e=c$6(o.instance),n=document.getElementById("sap-ui-blocklayer-popup");e?.hidePopover(),n?.showPopover(),e?.showPopover();},l$9=(o=document)=>o.querySelector(":popover-open")?true:Array.from(o.querySelectorAll("*")).some(e=>{const n=e.shadowRoot;return n&&l$9(n)}),m$7=o=>{const e="Dialog.prototype.onsapescape";a$9(e)&&(t$7[e]={version:ManagedStyles.e,originalFn:t$7[e]?.originalFn??o.prototype.onsapescape});const n=t$7[e].originalFn;o.prototype.onsapescape=function(...r){P$2(this.oPopup)||n.apply(this,r);};},R$2=o=>{const e="Popup.prototype.open";a$9(e)&&(t$7[e]={version:ManagedStyles.e,originalFn:t$7[e]?.originalFn??o.prototype.open});const n=t$7[e].originalFn;o.prototype.open=function(...r){n.apply(this,r),v$3(this),y$5({type:"OpenUI5",instance:this});};},F=o=>{const e="Popup.prototype._closed";a$9(e)&&(t$7[e]={version:ManagedStyles.e,originalFn:t$7[e]?.originalFn??o.prototype._closed});const n=t$7[e].originalFn;o.prototype._closed=function(...r){I$2(this),n.apply(this,r),d$5(this);};},U$1=o=>{const e="Popup.prototype.onFocusEvent";a$9(e)&&(t$7[e]={version:ManagedStyles.e,originalFn:t$7[e]?.originalFn??o.prototype.onFocusEvent});const n=t$7[e].originalFn;o.prototype.onFocusEvent=function(...r){P$2(this)||n.apply(this,r);};},C$3=()=>{const o=new CSSStyleSheet;o.replaceSync(".sapMPopup-CTX:popover-open { inset: unset; }"),document.adoptedStyleSheets=[...document.adoptedStyleSheets,o];},b$8=(o,e)=>{e$8(),R$2(o),F(o),C$3(),U$1(o),m$7(e);};

    const h$2=100;let e$7 = class e{static{this.enablePolling=false;}static isAtLeastVersion(t){if(!window.sap.ui.version)return  true;const i=window.sap.ui.version.split(".");return !i||i.length<2?false:parseInt(i[0])>1||parseInt(i[1])>=t}static isOpenUI5Detected(){return typeof window.sap?.ui?.require=="function"}static isOpenUI5LoadedFirst(){return e._loadedFirst}static{this.OpenUI5DelayedInit=async()=>{e._loadedFirst=false,e.init(),await ManagedStyles.P$1();};}static awaitForOpenUI5(){if(e.enablePolling){const t=setInterval(()=>{e.isOpenUI5Detected()&&(clearInterval(t),e.OpenUI5DelayedInit());},h$2);}else document.addEventListener("sap-ui-core-ready",()=>{e.OpenUI5DelayedInit();});}static init(){return e.isOpenUI5Detected()?(e._loadedFirst??=true,e.initPromise||(e.initPromise=new Promise(t=>{window.sap.ui.require(["sap/ui/core/Core"],async a=>{const i=()=>{let n=["sap/ui/core/Popup","sap/m/Dialog","sap/ui/core/Patcher","sap/ui/core/LocaleData"];e.isAtLeastVersion(116)&&(n=[...n,"sap/base/i18n/Formatting","sap/base/i18n/Localization","sap/ui/core/ControlBehavior","sap/ui/core/Theming","sap/ui/core/date/CalendarUtils"]),window.sap.ui.require(n,(o,r,s)=>{n$b(s),b$8(o,r),t();});};e.isAtLeastVersion(116)?(await a.ready(),i()):a.attachInit(i);});})),e.initPromise):e.awaitForOpenUI5()}static getConfigurationSettingsObject(){if(!e.isOpenUI5Detected())return {};if(e.isAtLeastVersion(116)){const n=window.sap.ui.require("sap/ui/core/ControlBehavior"),o=window.sap.ui.require("sap/base/i18n/Localization"),r=window.sap.ui.require("sap/ui/core/Theming"),s=window.sap.ui.require("sap/base/i18n/Formatting"),c=window.sap.ui.require("sap/ui/core/date/CalendarUtils");return {animationMode:n.getAnimationMode(),language:o.getLanguage(),theme:r.getTheme(),themeRoot:r.getThemeRoot(),rtl:o.getRTL(),timezone:o.getTimezone(),calendarType:s.getCalendarType(),formatSettings:{firstDayOfWeek:c.getWeekConfigurationValues().firstDayOfWeek,legacyDateCalendarCustomizing:s.getCustomIslamicCalendarData?.()??s.getLegacyDateCalendarCustomizing?.()}}}const a=window.sap.ui.require("sap/ui/core/Core").getConfiguration(),i=window.sap.ui.require("sap/ui/core/LocaleData");return {animationMode:a.getAnimationMode(),language:a.getLanguage(),theme:a.getTheme(),themeRoot:typeof a.getThemeRoot=="function"?a.getThemeRoot():void 0,rtl:a.getRTL(),timezone:typeof a.getTimezone=="function"?a.getTimezone():void 0,calendarType:a.getCalendarType(),formatSettings:{firstDayOfWeek:i?i.getInstance(a.getLocale()).getFirstDayOfWeek():void 0,legacyDateCalendarCustomizing:a.getFormatSettings().getLegacyDateCalendarCustomizing()}}}static getLocaleDataObject(){if(!e.isOpenUI5Detected())return;const t=window.sap.ui.require("sap/ui/core/LocaleData");if(e.isAtLeastVersion(116)){const n=window.sap.ui.require("sap/base/i18n/Localization");return t.getInstance(n.getLanguageTag())._get()}const i=window.sap.ui.require("sap/ui/core/Core").getConfiguration();return t.getInstance(i.getLocale())._get()}static _listenForThemeChange(){if(e.isAtLeastVersion(116)){const t=window.sap.ui.require("sap/ui/core/Theming");t.attachApplied(()=>{ManagedStyles.l$2(t.getTheme());});}else {const t=window.sap.ui.require("sap/ui/core/Core"),a=t.getConfiguration();t.attachThemeChanged(()=>{ManagedStyles.l$2(a.getTheme());});}}static attachListeners(){return e.isOpenUI5Detected()?(e._listenForThemeChange(),true):false}static cssVariablesLoaded(){if(!e.isOpenUI5Detected())return;const t=[...document.head.children].find(a=>a.id==="sap-ui-theme-sap.ui.core");return t?e.isAtLeastVersion(127)?!!t.href.match(/\/css(-|_)variables\.css/)||!!t.href.match(/\/library\.css/):!!t.href.match(/\/css(-|_)variables\.css/):false}static addOpenedPopup(t){y$5(t);}static removeOpenedPopup(t){d$5(t);}static getTopmostPopup(){return g$5()}};ManagedStyles.s("OpenUI5Support",e$7);

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    var t$6;const i$6=window,s$c=i$6.trustedTypes,e$6=s$c?s$c.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$7="$lit$",n$a=`lit$${(Math.random()+"").slice(9)}$`,l$8="?"+n$a,h$1=`<${l$8}>`,r$6=document,u$7=()=>r$6.createComment(""),d$4=t=>null===t||"object"!=typeof t&&"function"!=typeof t,c$5=Array.isArray,v$2=t=>c$5(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),a$8="[ \t\n\f\r]",f$4=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_$1=/-->/g,m$6=/>/g,p$3=RegExp(`>|${a$8}(?:([^\\s"'>=/]+)(${a$8}*=${a$8}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g$4=/'/g,$=/"/g,y$4=/^(?:script|style|textarea|title)$/i,w$1=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x$1=w$1(1),b$7=w$1(2),T$1=Symbol.for("lit-noChange"),A$2=Symbol.for("lit-nothing"),E=new WeakMap,C$2=r$6.createTreeWalker(r$6,129,null,false);function P$1(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$6?e$6.createHTML(i):i}const V$1=(t,i)=>{const s=t.length-1,e=[];let l,r=2===i?"<svg>":"",u=f$4;for(let i=0;i<s;i++){const s=t[i];let d,c,v=-1,a=0;for(;a<s.length&&(u.lastIndex=a,c=u.exec(s),null!==c);)a=u.lastIndex,u===f$4?"!--"===c[1]?u=_$1:void 0!==c[1]?u=m$6:void 0!==c[2]?(y$4.test(c[2])&&(l=RegExp("</"+c[2],"g")),u=p$3):void 0!==c[3]&&(u=p$3):u===p$3?">"===c[0]?(u=null!=l?l:f$4,v=-1):void 0===c[1]?v=-2:(v=u.lastIndex-c[2].length,d=c[1],u=void 0===c[3]?p$3:'"'===c[3]?$:g$4):u===$||u===g$4?u=p$3:u===_$1||u===m$6?u=f$4:(u=p$3,l=void 0);const w=u===p$3&&t[i+1].startsWith("/>")?" ":"";r+=u===f$4?s+h$1:v>=0?(e.push(d),s.slice(0,v)+o$7+s.slice(v)+n$a+w):s+n$a+(-2===v?(e.push(void 0),i):w);}return [P$1(t,r+(t[s]||"<?>")+(2===i?"</svg>":"")),e]};let N$1 = class N{constructor({strings:t,_$litType$:i},e){let h;this.parts=[];let r=0,d=0;const c=t.length-1,v=this.parts,[a,f]=V$1(t,i);if(this.el=N.createElement(a,e),C$2.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(h=C$2.nextNode())&&v.length<c;){if(1===h.nodeType){if(h.hasAttributes()){const t=[];for(const i of h.getAttributeNames())if(i.endsWith(o$7)||i.startsWith(n$a)){const s=f[d++];if(t.push(i),void 0!==s){const t=h.getAttribute(s.toLowerCase()+o$7).split(n$a),i=/([.?@])?(.*)/.exec(s);v.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?H:"?"===i[1]?L$2:"@"===i[1]?z:k$1});}else v.push({type:6,index:r});}for(const i of t)h.removeAttribute(i);}if(y$4.test(h.tagName)){const t=h.textContent.split(n$a),i=t.length-1;if(i>0){h.textContent=s$c?s$c.emptyScript:"";for(let s=0;s<i;s++)h.append(t[s],u$7()),C$2.nextNode(),v.push({type:2,index:++r});h.append(t[i],u$7());}}}else if(8===h.nodeType)if(h.data===l$8)v.push({type:2,index:r});else {let t=-1;for(;-1!==(t=h.data.indexOf(n$a,t+1));)v.push({type:7,index:r}),t+=n$a.length-1;}r++;}}static createElement(t,i){const s=r$6.createElement("template");return s.innerHTML=t,s}};function S$3(t,i,s=t,e){var o,n,l,h;if(i===T$1)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d$4(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,false),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=S$3(t,r._$AS(t,i.values),r,e)),i}let M$1 = class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:r$6).importNode(s,true);C$2.currentNode=o;let n=C$2.nextNode(),l=0,h=0,u=e[0];for(;void 0!==u;){if(l===u.index){let i;2===u.type?i=new R$1(n,n.nextSibling,this,t):1===u.type?i=new u.ctor(n,u.name,u.strings,this,t):6===u.type&&(i=new Z(n,this,t)),this._$AV.push(i),u=e[++h];}l!==(null==u?void 0:u.index)&&(n=C$2.nextNode(),l++);}return C$2.currentNode=r$6,o}v(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}};let R$1 = class R{constructor(t,i,s,e){var o;this.type=2,this._$AH=A$2,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cp=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===(null==t?void 0:t.nodeType)&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S$3(this,t,i),d$4(t)?t===A$2||null==t||""===t?(this._$AH!==A$2&&this._$AR(),this._$AH=A$2):t!==this._$AH&&t!==T$1&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):v$2(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==A$2&&d$4(this._$AH)?this._$AA.nextSibling.data=t:this.$(r$6.createTextNode(t)),this._$AH=t;}g(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=N$1.createElement(P$1(e.h,e.h[0]),this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.v(s);else {const t=new M$1(o,this),i=t.u(this.options);t.v(s),this.$(i),this._$AH=t;}}_$AC(t){let i=E.get(t.strings);return void 0===i&&E.set(t.strings,i=new N$1(t)),i}T(t){c$5(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new R(this.k(u$7()),this.k(u$7()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,false,true,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cp=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}};let k$1 = class k{constructor(t,i,s,e,o){this.type=1,this._$AH=A$2,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A$2;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=false;if(void 0===o)t=S$3(this,t,i,0),n=!d$4(t)||t!==this._$AH&&t!==T$1,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=S$3(this,e[s+l],i,l),h===T$1&&(h=this._$AH[l]),n||(n=!d$4(h)||h!==this._$AH[l]),h===A$2?t=A$2:t!==A$2&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===A$2?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}};class H extends k$1{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A$2?void 0:t;}}const I$1=s$c?s$c.emptyScript:"";let L$2 = class L extends k$1{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==A$2?this.element.setAttribute(this.name,I$1):this.element.removeAttribute(this.name);}};class z extends k$1{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=S$3(this,t,i,0))&&void 0!==s?s:A$2)===T$1)return;const e=this._$AH,o=t===A$2&&e!==A$2||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==A$2&&(e===A$2||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S$3(this,t);}}const B=i$6.litHtmlPolyfillSupport;null==B||B(N$1,R$1),(null!==(t$6=i$6.litHtmlVersions)&&void 0!==t$6?t$6:i$6.litHtmlVersions=[]).push("2.8.0");

    /**
     * @license
     * Copyright 2020 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const e$5=Symbol.for(""),l$7=t=>{if((null==t?void 0:t.r)===e$5)return null==t?void 0:t._$litStatic$},o$6=t=>({_$litStatic$:t,r:e$5}),s$b=new Map,a$7=t=>(r,...e)=>{const o=e.length;let i,a;const n=[],u=[];let c,$=0,f=false;for(;$<o;){for(c=r[$];$<o&&void 0!==(a=e[$],i=l$7(a));)c+=i+r[++$],f=true;$!==o&&u.push(a),n.push(c),$++;}if($===o&&n.push(r[o]),f){const t=n.join("$$lit$$");void 0===(r=s$b.get(t))&&(n.raw=n,s$b.set(t,r=n)),e=u;}return t(r,...e)},n$9=a$7(x$1),u$6=a$7(b$7);

    let t$5 = class t{static{this.html=n$9;}static{this.svg=u$6;}static{this.unsafeStatic=o$6;}};ManagedStyles.s("LitStatic",t$5);

    // @ts-nocheck
    const loadThemeProperties$2 = async (themeName) => {
        switch (themeName) {
            case "sap_fiori_3": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-fiori_3-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle4.css'], resolve, reject); })).default;
            case "sap_fiori_3_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-fiori_3_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle5.css'], resolve, reject); })).default;
            case "sap_fiori_3_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-fiori_3_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle6.css'], resolve, reject); })).default;
            case "sap_fiori_3_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-fiori_3_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle7.css'], resolve, reject); })).default;
            case "sap_horizon": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-horizon-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle8.css'], resolve, reject); })).default;
            case "sap_horizon_auto": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-horizon_auto-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle9.css'], resolve, reject); })).default;
            case "sap_horizon_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-horizon_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle10.css'], resolve, reject); })).default;
            case "sap_horizon_hc_auto": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-horizon_hc_auto-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle11.css'], resolve, reject); })).default;
            case "sap_horizon_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-horizon_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle12.css'], resolve, reject); })).default;
            case "sap_horizon_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-horizon_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle13.css'], resolve, reject); })).default;
            default: throw "unknown theme";
        }
    };
    const loadAndCheck$2 = async (themeName) => {
        const data = await loadThemeProperties$2(themeName);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[themes] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    ["sap_fiori_3", "sap_fiori_3_dark", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_horizon", "sap_horizon_auto", "sap_horizon_dark", "sap_horizon_hc_auto", "sap_horizon_hcb", "sap_horizon_hcw"]
        .forEach(themeName => ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "t" + "h" + "e" + "m" + "i" + "n" + "g", themeName, loadAndCheck$2));

    // @ts-nocheck
    const importMessageBundle$2 = async (localeId) => {
        switch (localeId) {
            case "ar": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-ar" */ 'sap/f/thirdparty/_dynamics/messagebundle_ar'], resolve, reject); })).default;
            case "bg": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-bg" */ 'sap/f/thirdparty/_dynamics/messagebundle_bg'], resolve, reject); })).default;
            case "ca": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-ca" */ 'sap/f/thirdparty/_dynamics/messagebundle_ca'], resolve, reject); })).default;
            case "cnr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-cnr" */ 'sap/f/thirdparty/_dynamics/messagebundle_cnr'], resolve, reject); })).default;
            case "cs": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-cs" */ 'sap/f/thirdparty/_dynamics/messagebundle_cs'], resolve, reject); })).default;
            case "cy": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-cy" */ 'sap/f/thirdparty/_dynamics/messagebundle_cy'], resolve, reject); })).default;
            case "da": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-da" */ 'sap/f/thirdparty/_dynamics/messagebundle_da'], resolve, reject); })).default;
            case "de": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-de" */ 'sap/f/thirdparty/_dynamics/messagebundle_de'], resolve, reject); })).default;
            case "el": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-el" */ 'sap/f/thirdparty/_dynamics/messagebundle_el'], resolve, reject); })).default;
            case "en": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-en" */ 'sap/f/thirdparty/_dynamics/messagebundle_en'], resolve, reject); })).default;
            case "en_GB": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-en_GB" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_GB'], resolve, reject); })).default;
            case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-en_US_sappsd" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_sappsd'], resolve, reject); })).default;
            case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-en_US_saprigi" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_saprigi'], resolve, reject); })).default;
            case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-en_US_saptrc" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_saptrc'], resolve, reject); })).default;
            case "es": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-es" */ 'sap/f/thirdparty/_dynamics/messagebundle_es'], resolve, reject); })).default;
            case "es_MX": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-es_MX" */ 'sap/f/thirdparty/_dynamics/messagebundle_es_MX'], resolve, reject); })).default;
            case "et": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-et" */ 'sap/f/thirdparty/_dynamics/messagebundle_et'], resolve, reject); })).default;
            case "fi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-fi" */ 'sap/f/thirdparty/_dynamics/messagebundle_fi'], resolve, reject); })).default;
            case "fr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-fr" */ 'sap/f/thirdparty/_dynamics/messagebundle_fr'], resolve, reject); })).default;
            case "fr_CA": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-fr_CA" */ 'sap/f/thirdparty/_dynamics/messagebundle_fr_CA'], resolve, reject); })).default;
            case "hi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-hi" */ 'sap/f/thirdparty/_dynamics/messagebundle_hi'], resolve, reject); })).default;
            case "hr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-hr" */ 'sap/f/thirdparty/_dynamics/messagebundle_hr'], resolve, reject); })).default;
            case "hu": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-hu" */ 'sap/f/thirdparty/_dynamics/messagebundle_hu'], resolve, reject); })).default;
            case "id": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-id" */ 'sap/f/thirdparty/_dynamics/messagebundle_id'], resolve, reject); })).default;
            case "it": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-it" */ 'sap/f/thirdparty/_dynamics/messagebundle_it'], resolve, reject); })).default;
            case "iw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-iw" */ 'sap/f/thirdparty/_dynamics/messagebundle_iw'], resolve, reject); })).default;
            case "ja": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-ja" */ 'sap/f/thirdparty/_dynamics/messagebundle_ja'], resolve, reject); })).default;
            case "kk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-kk" */ 'sap/f/thirdparty/_dynamics/messagebundle_kk'], resolve, reject); })).default;
            case "ko": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-ko" */ 'sap/f/thirdparty/_dynamics/messagebundle_ko'], resolve, reject); })).default;
            case "lt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-lt" */ 'sap/f/thirdparty/_dynamics/messagebundle_lt'], resolve, reject); })).default;
            case "lv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-lv" */ 'sap/f/thirdparty/_dynamics/messagebundle_lv'], resolve, reject); })).default;
            case "mk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-mk" */ 'sap/f/thirdparty/_dynamics/messagebundle_mk'], resolve, reject); })).default;
            case "ms": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-ms" */ 'sap/f/thirdparty/_dynamics/messagebundle_ms'], resolve, reject); })).default;
            case "nl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-nl" */ 'sap/f/thirdparty/_dynamics/messagebundle_nl'], resolve, reject); })).default;
            case "no": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-no" */ 'sap/f/thirdparty/_dynamics/messagebundle_no'], resolve, reject); })).default;
            case "pl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-pl" */ 'sap/f/thirdparty/_dynamics/messagebundle_pl'], resolve, reject); })).default;
            case "pt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-pt" */ 'sap/f/thirdparty/_dynamics/messagebundle_pt'], resolve, reject); })).default;
            case "pt_PT": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-pt_PT" */ 'sap/f/thirdparty/_dynamics/messagebundle_pt_PT'], resolve, reject); })).default;
            case "ro": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-ro" */ 'sap/f/thirdparty/_dynamics/messagebundle_ro'], resolve, reject); })).default;
            case "ru": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-ru" */ 'sap/f/thirdparty/_dynamics/messagebundle_ru'], resolve, reject); })).default;
            case "sh": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-sh" */ 'sap/f/thirdparty/_dynamics/messagebundle_sh'], resolve, reject); })).default;
            case "sk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-sk" */ 'sap/f/thirdparty/_dynamics/messagebundle_sk'], resolve, reject); })).default;
            case "sl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-sl" */ 'sap/f/thirdparty/_dynamics/messagebundle_sl'], resolve, reject); })).default;
            case "sr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-sr" */ 'sap/f/thirdparty/_dynamics/messagebundle_sr'], resolve, reject); })).default;
            case "sv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-sv" */ 'sap/f/thirdparty/_dynamics/messagebundle_sv'], resolve, reject); })).default;
            case "th": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-th" */ 'sap/f/thirdparty/_dynamics/messagebundle_th'], resolve, reject); })).default;
            case "tr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-tr" */ 'sap/f/thirdparty/_dynamics/messagebundle_tr'], resolve, reject); })).default;
            case "uk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-uk" */ 'sap/f/thirdparty/_dynamics/messagebundle_uk'], resolve, reject); })).default;
            case "vi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-vi" */ 'sap/f/thirdparty/_dynamics/messagebundle_vi'], resolve, reject); })).default;
            case "zh_CN": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-zh_CN" */ 'sap/f/thirdparty/_dynamics/messagebundle_zh_CN'], resolve, reject); })).default;
            case "zh_TW": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-icons-messagebundle-zh_TW" */ 'sap/f/thirdparty/_dynamics/messagebundle_zh_TW'], resolve, reject); })).default;
            default: throw "unknown locale";
        }
    };
    const importAndCheck$2 = async (localeId) => {
        const data = await importMessageBundle$2(localeId);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[i18n] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    const localeIds$2 = ["ar",
        "bg",
        "ca",
        "cnr",
        "cs",
        "cy",
        "da",
        "de",
        "el",
        "en",
        "en_GB",
        "en_US_sappsd",
        "en_US_saprigi",
        "en_US_saptrc",
        "es",
        "es_MX",
        "et",
        "fi",
        "fr",
        "fr_CA",
        "hi",
        "hr",
        "hu",
        "id",
        "it",
        "iw",
        "ja",
        "kk",
        "ko",
        "lt",
        "lv",
        "mk",
        "ms",
        "nl",
        "no",
        "pl",
        "pt",
        "pt_PT",
        "ro",
        "ru",
        "sh",
        "sk",
        "sl",
        "sr",
        "sv",
        "th",
        "tr",
        "uk",
        "vi",
        "zh_CN",
        "zh_TW",];
    localeIds$2.forEach(localeId => {
        Icons.$("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "i" + "c" + "o" + "n" + "s", localeId, importAndCheck$2);
    });

    // @ts-nocheck
    const loadThemeProperties$1 = async (themeName) => {
        switch (themeName) {
            case "sap_fiori_3": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-fiori_3-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle14.css'], resolve, reject); })).default;
            case "sap_fiori_3_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-fiori_3_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle15.css'], resolve, reject); })).default;
            case "sap_fiori_3_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-fiori_3_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle16.css'], resolve, reject); })).default;
            case "sap_fiori_3_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-fiori_3_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle17.css'], resolve, reject); })).default;
            case "sap_horizon": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-horizon-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle18.css'], resolve, reject); })).default;
            case "sap_horizon_auto": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-horizon_auto-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle19.css'], resolve, reject); })).default;
            case "sap_horizon_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-horizon_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle20.css'], resolve, reject); })).default;
            case "sap_horizon_hc_auto": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-horizon_hc_auto-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle21.css'], resolve, reject); })).default;
            case "sap_horizon_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-horizon_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle22.css'], resolve, reject); })).default;
            case "sap_horizon_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-horizon_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle23.css'], resolve, reject); })).default;
            default: throw "unknown theme";
        }
    };
    const loadAndCheck$1 = async (themeName) => {
        const data = await loadThemeProperties$1(themeName);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[themes] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    ["sap_fiori_3", "sap_fiori_3_dark", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_horizon", "sap_horizon_auto", "sap_horizon_dark", "sap_horizon_hc_auto", "sap_horizon_hcb", "sap_horizon_hcw"]
        .forEach(themeName => ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", themeName, loadAndCheck$1, "host"));

    // @ts-nocheck
    const importMessageBundle$1 = async (localeId) => {
        switch (localeId) {
            case "ar": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ar" */ 'sap/f/thirdparty/_dynamics/messagebundle_ar2'], resolve, reject); })).default;
            case "bg": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-bg" */ 'sap/f/thirdparty/_dynamics/messagebundle_bg2'], resolve, reject); })).default;
            case "ca": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ca" */ 'sap/f/thirdparty/_dynamics/messagebundle_ca2'], resolve, reject); })).default;
            case "cnr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-cnr" */ 'sap/f/thirdparty/_dynamics/messagebundle_cnr2'], resolve, reject); })).default;
            case "cs": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-cs" */ 'sap/f/thirdparty/_dynamics/messagebundle_cs2'], resolve, reject); })).default;
            case "cy": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-cy" */ 'sap/f/thirdparty/_dynamics/messagebundle_cy2'], resolve, reject); })).default;
            case "da": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-da" */ 'sap/f/thirdparty/_dynamics/messagebundle_da2'], resolve, reject); })).default;
            case "de": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-de" */ 'sap/f/thirdparty/_dynamics/messagebundle_de2'], resolve, reject); })).default;
            case "el": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-el" */ 'sap/f/thirdparty/_dynamics/messagebundle_el2'], resolve, reject); })).default;
            case "en": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-en" */ 'sap/f/thirdparty/_dynamics/messagebundle_en2'], resolve, reject); })).default;
            case "en_GB": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-en_GB" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_GB2'], resolve, reject); })).default;
            case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-en_US_sappsd" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_sappsd2'], resolve, reject); })).default;
            case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-en_US_saprigi" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_saprigi2'], resolve, reject); })).default;
            case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-en_US_saptrc" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_saptrc2'], resolve, reject); })).default;
            case "es": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-es" */ 'sap/f/thirdparty/_dynamics/messagebundle_es2'], resolve, reject); })).default;
            case "es_MX": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-es_MX" */ 'sap/f/thirdparty/_dynamics/messagebundle_es_MX2'], resolve, reject); })).default;
            case "et": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-et" */ 'sap/f/thirdparty/_dynamics/messagebundle_et2'], resolve, reject); })).default;
            case "fi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-fi" */ 'sap/f/thirdparty/_dynamics/messagebundle_fi2'], resolve, reject); })).default;
            case "fr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-fr" */ 'sap/f/thirdparty/_dynamics/messagebundle_fr2'], resolve, reject); })).default;
            case "fr_CA": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-fr_CA" */ 'sap/f/thirdparty/_dynamics/messagebundle_fr_CA2'], resolve, reject); })).default;
            case "hi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-hi" */ 'sap/f/thirdparty/_dynamics/messagebundle_hi2'], resolve, reject); })).default;
            case "hr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-hr" */ 'sap/f/thirdparty/_dynamics/messagebundle_hr2'], resolve, reject); })).default;
            case "hu": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-hu" */ 'sap/f/thirdparty/_dynamics/messagebundle_hu2'], resolve, reject); })).default;
            case "id": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-id" */ 'sap/f/thirdparty/_dynamics/messagebundle_id2'], resolve, reject); })).default;
            case "it": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-it" */ 'sap/f/thirdparty/_dynamics/messagebundle_it2'], resolve, reject); })).default;
            case "iw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-iw" */ 'sap/f/thirdparty/_dynamics/messagebundle_iw2'], resolve, reject); })).default;
            case "ja": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ja" */ 'sap/f/thirdparty/_dynamics/messagebundle_ja2'], resolve, reject); })).default;
            case "kk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-kk" */ 'sap/f/thirdparty/_dynamics/messagebundle_kk2'], resolve, reject); })).default;
            case "ko": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ko" */ 'sap/f/thirdparty/_dynamics/messagebundle_ko2'], resolve, reject); })).default;
            case "lt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-lt" */ 'sap/f/thirdparty/_dynamics/messagebundle_lt2'], resolve, reject); })).default;
            case "lv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-lv" */ 'sap/f/thirdparty/_dynamics/messagebundle_lv2'], resolve, reject); })).default;
            case "mk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-mk" */ 'sap/f/thirdparty/_dynamics/messagebundle_mk2'], resolve, reject); })).default;
            case "ms": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ms" */ 'sap/f/thirdparty/_dynamics/messagebundle_ms2'], resolve, reject); })).default;
            case "nl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-nl" */ 'sap/f/thirdparty/_dynamics/messagebundle_nl2'], resolve, reject); })).default;
            case "no": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-no" */ 'sap/f/thirdparty/_dynamics/messagebundle_no2'], resolve, reject); })).default;
            case "pl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-pl" */ 'sap/f/thirdparty/_dynamics/messagebundle_pl2'], resolve, reject); })).default;
            case "pt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-pt" */ 'sap/f/thirdparty/_dynamics/messagebundle_pt2'], resolve, reject); })).default;
            case "pt_PT": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-pt_PT" */ 'sap/f/thirdparty/_dynamics/messagebundle_pt_PT2'], resolve, reject); })).default;
            case "ro": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ro" */ 'sap/f/thirdparty/_dynamics/messagebundle_ro2'], resolve, reject); })).default;
            case "ru": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ru" */ 'sap/f/thirdparty/_dynamics/messagebundle_ru2'], resolve, reject); })).default;
            case "sh": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-sh" */ 'sap/f/thirdparty/_dynamics/messagebundle_sh2'], resolve, reject); })).default;
            case "sk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-sk" */ 'sap/f/thirdparty/_dynamics/messagebundle_sk2'], resolve, reject); })).default;
            case "sl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-sl" */ 'sap/f/thirdparty/_dynamics/messagebundle_sl2'], resolve, reject); })).default;
            case "sr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-sr" */ 'sap/f/thirdparty/_dynamics/messagebundle_sr2'], resolve, reject); })).default;
            case "sv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-sv" */ 'sap/f/thirdparty/_dynamics/messagebundle_sv2'], resolve, reject); })).default;
            case "th": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-th" */ 'sap/f/thirdparty/_dynamics/messagebundle_th2'], resolve, reject); })).default;
            case "tr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-tr" */ 'sap/f/thirdparty/_dynamics/messagebundle_tr2'], resolve, reject); })).default;
            case "uk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-uk" */ 'sap/f/thirdparty/_dynamics/messagebundle_uk2'], resolve, reject); })).default;
            case "vi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-vi" */ 'sap/f/thirdparty/_dynamics/messagebundle_vi2'], resolve, reject); })).default;
            case "zh_CN": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-zh_CN" */ 'sap/f/thirdparty/_dynamics/messagebundle_zh_CN2'], resolve, reject); })).default;
            case "zh_TW": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-zh_TW" */ 'sap/f/thirdparty/_dynamics/messagebundle_zh_TW2'], resolve, reject); })).default;
            default: throw "unknown locale";
        }
    };
    const importAndCheck$1 = async (localeId) => {
        const data = await importMessageBundle$1(localeId);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[i18n] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    const localeIds$1 = ["ar",
        "bg",
        "ca",
        "cnr",
        "cs",
        "cy",
        "da",
        "de",
        "el",
        "en",
        "en_GB",
        "en_US_sappsd",
        "en_US_saprigi",
        "en_US_saptrc",
        "es",
        "es_MX",
        "et",
        "fi",
        "fr",
        "fr_CA",
        "hi",
        "hr",
        "hu",
        "id",
        "it",
        "iw",
        "ja",
        "kk",
        "ko",
        "lt",
        "lv",
        "mk",
        "ms",
        "nl",
        "no",
        "pl",
        "pt",
        "pt_PT",
        "ro",
        "ru",
        "sh",
        "sk",
        "sl",
        "sr",
        "sv",
        "th",
        "tr",
        "uk",
        "vi",
        "zh_CN",
        "zh_TW",];
    localeIds$1.forEach(localeId => {
        Icons.$("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", localeId, importAndCheck$1);
    });

    // @ts-nocheck
    const loadThemeProperties = async (themeName) => {
        switch (themeName) {
            case "sap_fiori_3": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle24.css'], resolve, reject); })).default;
            case "sap_fiori_3_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle25.css'], resolve, reject); })).default;
            case "sap_fiori_3_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle26.css'], resolve, reject); })).default;
            case "sap_fiori_3_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle27.css'], resolve, reject); })).default;
            case "sap_horizon": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle28.css'], resolve, reject); })).default;
            case "sap_horizon_auto": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_auto-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle29.css'], resolve, reject); })).default;
            case "sap_horizon_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle30.css'], resolve, reject); })).default;
            case "sap_horizon_hc_auto": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_hc_auto-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle31.css'], resolve, reject); })).default;
            case "sap_horizon_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle32.css'], resolve, reject); })).default;
            case "sap_horizon_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle33.css'], resolve, reject); })).default;
            default: throw "unknown theme";
        }
    };
    const loadAndCheck = async (themeName) => {
        const data = await loadThemeProperties(themeName);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[themes] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    ["sap_fiori_3", "sap_fiori_3_dark", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_horizon", "sap_horizon_auto", "sap_horizon_dark", "sap_horizon_hc_auto", "sap_horizon_hcb", "sap_horizon_hcw"]
        .forEach(themeName => ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", themeName, loadAndCheck, "host"));

    // @ts-nocheck
    const importMessageBundle = async (localeId) => {
        switch (localeId) {
            case "ar": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ar" */ 'sap/f/thirdparty/_dynamics/messagebundle_ar3'], resolve, reject); })).default;
            case "bg": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-bg" */ 'sap/f/thirdparty/_dynamics/messagebundle_bg3'], resolve, reject); })).default;
            case "ca": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ca" */ 'sap/f/thirdparty/_dynamics/messagebundle_ca3'], resolve, reject); })).default;
            case "cnr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-cnr" */ 'sap/f/thirdparty/_dynamics/messagebundle_cnr3'], resolve, reject); })).default;
            case "cs": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-cs" */ 'sap/f/thirdparty/_dynamics/messagebundle_cs3'], resolve, reject); })).default;
            case "cy": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-cy" */ 'sap/f/thirdparty/_dynamics/messagebundle_cy3'], resolve, reject); })).default;
            case "da": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-da" */ 'sap/f/thirdparty/_dynamics/messagebundle_da3'], resolve, reject); })).default;
            case "de": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-de" */ 'sap/f/thirdparty/_dynamics/messagebundle_de3'], resolve, reject); })).default;
            case "el": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-el" */ 'sap/f/thirdparty/_dynamics/messagebundle_el3'], resolve, reject); })).default;
            case "en": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en" */ 'sap/f/thirdparty/_dynamics/messagebundle_en3'], resolve, reject); })).default;
            case "en_GB": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_GB" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_GB3'], resolve, reject); })).default;
            case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_US_sappsd" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_sappsd3'], resolve, reject); })).default;
            case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_US_saprigi" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_saprigi3'], resolve, reject); })).default;
            case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_US_saptrc" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_saptrc3'], resolve, reject); })).default;
            case "es": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-es" */ 'sap/f/thirdparty/_dynamics/messagebundle_es3'], resolve, reject); })).default;
            case "es_MX": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-es_MX" */ 'sap/f/thirdparty/_dynamics/messagebundle_es_MX3'], resolve, reject); })).default;
            case "et": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-et" */ 'sap/f/thirdparty/_dynamics/messagebundle_et3'], resolve, reject); })).default;
            case "fi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-fi" */ 'sap/f/thirdparty/_dynamics/messagebundle_fi3'], resolve, reject); })).default;
            case "fr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-fr" */ 'sap/f/thirdparty/_dynamics/messagebundle_fr3'], resolve, reject); })).default;
            case "fr_CA": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-fr_CA" */ 'sap/f/thirdparty/_dynamics/messagebundle_fr_CA3'], resolve, reject); })).default;
            case "hi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-hi" */ 'sap/f/thirdparty/_dynamics/messagebundle_hi3'], resolve, reject); })).default;
            case "hr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-hr" */ 'sap/f/thirdparty/_dynamics/messagebundle_hr3'], resolve, reject); })).default;
            case "hu": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-hu" */ 'sap/f/thirdparty/_dynamics/messagebundle_hu3'], resolve, reject); })).default;
            case "id": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-id" */ 'sap/f/thirdparty/_dynamics/messagebundle_id3'], resolve, reject); })).default;
            case "it": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-it" */ 'sap/f/thirdparty/_dynamics/messagebundle_it3'], resolve, reject); })).default;
            case "iw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-iw" */ 'sap/f/thirdparty/_dynamics/messagebundle_iw3'], resolve, reject); })).default;
            case "ja": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ja" */ 'sap/f/thirdparty/_dynamics/messagebundle_ja3'], resolve, reject); })).default;
            case "kk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-kk" */ 'sap/f/thirdparty/_dynamics/messagebundle_kk3'], resolve, reject); })).default;
            case "ko": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ko" */ 'sap/f/thirdparty/_dynamics/messagebundle_ko3'], resolve, reject); })).default;
            case "lt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-lt" */ 'sap/f/thirdparty/_dynamics/messagebundle_lt3'], resolve, reject); })).default;
            case "lv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-lv" */ 'sap/f/thirdparty/_dynamics/messagebundle_lv3'], resolve, reject); })).default;
            case "mk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-mk" */ 'sap/f/thirdparty/_dynamics/messagebundle_mk3'], resolve, reject); })).default;
            case "ms": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ms" */ 'sap/f/thirdparty/_dynamics/messagebundle_ms3'], resolve, reject); })).default;
            case "nl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-nl" */ 'sap/f/thirdparty/_dynamics/messagebundle_nl3'], resolve, reject); })).default;
            case "no": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-no" */ 'sap/f/thirdparty/_dynamics/messagebundle_no3'], resolve, reject); })).default;
            case "pl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-pl" */ 'sap/f/thirdparty/_dynamics/messagebundle_pl3'], resolve, reject); })).default;
            case "pt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-pt" */ 'sap/f/thirdparty/_dynamics/messagebundle_pt3'], resolve, reject); })).default;
            case "pt_PT": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-pt_PT" */ 'sap/f/thirdparty/_dynamics/messagebundle_pt_PT3'], resolve, reject); })).default;
            case "ro": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ro" */ 'sap/f/thirdparty/_dynamics/messagebundle_ro3'], resolve, reject); })).default;
            case "ru": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ru" */ 'sap/f/thirdparty/_dynamics/messagebundle_ru3'], resolve, reject); })).default;
            case "sh": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sh" */ 'sap/f/thirdparty/_dynamics/messagebundle_sh3'], resolve, reject); })).default;
            case "sk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sk" */ 'sap/f/thirdparty/_dynamics/messagebundle_sk3'], resolve, reject); })).default;
            case "sl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sl" */ 'sap/f/thirdparty/_dynamics/messagebundle_sl3'], resolve, reject); })).default;
            case "sr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sr" */ 'sap/f/thirdparty/_dynamics/messagebundle_sr3'], resolve, reject); })).default;
            case "sv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sv" */ 'sap/f/thirdparty/_dynamics/messagebundle_sv3'], resolve, reject); })).default;
            case "th": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-th" */ 'sap/f/thirdparty/_dynamics/messagebundle_th3'], resolve, reject); })).default;
            case "tr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-tr" */ 'sap/f/thirdparty/_dynamics/messagebundle_tr3'], resolve, reject); })).default;
            case "uk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-uk" */ 'sap/f/thirdparty/_dynamics/messagebundle_uk3'], resolve, reject); })).default;
            case "vi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-vi" */ 'sap/f/thirdparty/_dynamics/messagebundle_vi3'], resolve, reject); })).default;
            case "zh_CN": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-zh_CN" */ 'sap/f/thirdparty/_dynamics/messagebundle_zh_CN3'], resolve, reject); })).default;
            case "zh_TW": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-zh_TW" */ 'sap/f/thirdparty/_dynamics/messagebundle_zh_TW3'], resolve, reject); })).default;
            default: throw "unknown locale";
        }
    };
    const importAndCheck = async (localeId) => {
        const data = await importMessageBundle(localeId);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[i18n] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    const localeIds = ["ar",
        "bg",
        "ca",
        "cnr",
        "cs",
        "cy",
        "da",
        "de",
        "el",
        "en",
        "en_GB",
        "en_US_sappsd",
        "en_US_saprigi",
        "en_US_saptrc",
        "es",
        "es_MX",
        "et",
        "fi",
        "fr",
        "fr_CA",
        "hi",
        "hr",
        "hu",
        "id",
        "it",
        "iw",
        "ja",
        "kk",
        "ko",
        "lt",
        "lv",
        "mk",
        "ms",
        "nl",
        "no",
        "pl",
        "pt",
        "pt_PT",
        "ro",
        "ru",
        "sh",
        "sk",
        "sl",
        "sr",
        "sv",
        "th",
        "tr",
        "uk",
        "vi",
        "zh_CN",
        "zh_TW",];
    localeIds.forEach(localeId => {
        Icons.$("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", localeId, importAndCheck);
    });

    const t$4=new WeakMap;let a$6 = class a{static get tasks(){return t$4}static enqueue(s,e){t$4.has(s)||t$4.set(s,[]),t$4.get(s).push(e);}static run(s,e){return t$4.has(s)||t$4.set(s,[]),e().then(()=>{const T=t$4.get(s);if(T.length>0)return a.run(s,T.shift());t$4.delete(s);})}static push(s,e){t$4.get(s)?a.enqueue(s,e):a.run(s,e);}};

    const v$1=e=>{let n=null,a=false,i,o,r;const m=new Promise((t,c)=>{r=u=>{n=n||u;const d=u-n,l=e.duration-d;if(d<=e.duration){const s=1-l/e.duration;e.advance(s),a||(i=requestAnimationFrame(r));}else e.advance(1),t();},o=()=>{a=true,cancelAnimationFrame(i),c(new Error("animation stopped"));};}).catch(t=>t);return a$6.push(e.element,()=>(typeof e.beforeStart=="function"&&e.beforeStart(),requestAnimationFrame(r),new Promise(t=>{m.then(()=>t());}))),{promise:()=>m,stop:()=>o}},A$1=()=>ManagedStyles.m$3()==="none"?0:400;

    const f$3=(r,c,a)=>{let o,l;return v$1({beforeStart:()=>{o=r.scrollLeft,l=r.scrollTop;},duration:A$1(),element:r,advance:t=>{r.scrollLeft=o+t*c,r.scrollTop=l+t*a;}})};

    const b$6=t=>{let o,a,d,r,s,p,g,y,n,l,h,T;const B=v$1({beforeStart:()=>{t.style.display="block",o=getComputedStyle(t),a=parseFloat(o.paddingTop),d=parseFloat(o.paddingBottom),r=parseFloat(o.marginTop),s=parseFloat(o.marginBottom),p=parseFloat(o.height),g=t.style.overflow,y=t.style.paddingTop,n=t.style.paddingBottom,l=t.style.marginTop,h=t.style.marginBottom,T=t.style.height,t.style.overflow="hidden",t.style.paddingTop="0",t.style.paddingBottom="0",t.style.marginTop="0",t.style.marginBottom="0",t.style.height="0";},duration:A$1(),element:t,advance:i=>{t.style.display="block",t.style.paddingTop=`${a*i}px`,t.style.paddingBottom=`${d*i}px`,t.style.marginTop=`${r*i}px`,t.style.marginBottom=`${s*i}px`,t.style.height=`${p*i}px`;}});return B.promise().then(()=>{t.style.overflow=g,t.style.paddingTop=y,t.style.paddingBottom=n,t.style.marginTop=l,t.style.marginBottom=h,t.style.height=T;}),B};

    const u$5=o=>{let i,a,r,d,n,s,p,g,e,l,y,m;const h=v$1({beforeStart:()=>{const t=o;i=getComputedStyle(t),a=parseFloat(i.paddingTop),r=parseFloat(i.paddingBottom),d=parseFloat(i.marginTop),n=parseFloat(i.marginBottom),s=parseFloat(i.height),p=t.style.overflow,g=t.style.paddingTop,e=t.style.paddingBottom,l=t.style.marginTop,y=t.style.marginBottom,m=t.style.height,t.style.overflow="hidden";},duration:A$1(),element:o,advance:t=>{o.style.paddingTop=`${a-a*t}px`,o.style.paddingBottom=`${r-r*t}px`,o.style.marginTop=`${d-d*t}px`,o.style.marginBottom=`${n-n*t}px`,o.style.height=`${s-s*t}px`;}});return h.promise().then(t=>{t instanceof Error||(o.style.overflow=p,o.style.paddingTop=g,o.style.paddingBottom=e,o.style.marginTop=l,o.style.marginBottom=y,o.style.height=m,o.style.display="none");}),h};

    var m$5 = ":host{justify-content:center;align-items:center;display:flex;color:var(--sapList_TextColor);background-color:var(--sapList_Background);font-family:var(--sapFontFamily);height:var(--sapElement_LineHeight);border-bottom:var(--sapList_BorderWidth) solid var(--sapList_BorderColor);opacity:.8;position:absolute;padding:0 1rem;top:-1000px;left:-1000px}";

    const e$4={key:"DRAG_DROP_MULTIPLE_TEXT",defaultText:"{0} items"};

    const l$6=2;let a$5=null;const g$3=(e,t)=>{a$5=e,t?.dataTransfer?.setData("text/plain",e?e.id:"");},d$3=()=>{a$5=null;},p$2=()=>a$5,u$4=async e=>{const t=document.createElement("div"),n=await Icons.f("@ui5/webcomponents-base"),r=t.attachShadow({mode:"open"}),o=new CSSStyleSheet;return o.replaceSync(m$5),r.adoptedStyleSheets=[o],r.textContent=n.getText(e$4,e),t},s$a=async(e,t)=>{if(e<l$6){console.warn(`Cannot start multiple drag with count ${e}. Minimum is ${l$6}.`);return}if(!t.dataTransfer)return;const n=await u$4(e);document.body.appendChild(n),t.dataTransfer.setDragImage(n,0,0),requestAnimationFrame(()=>{n.remove();});},D$2={setDraggedElement:g$3,clearDraggedElement:d$3,getDraggedElement:p$2,startMultipleDrag:s$a};

    const m$4=(a={})=>e=>{if(Object.prototype.hasOwnProperty.call(e,"metadata")||(e.metadata={}),typeof a=="string"){e.metadata.tag=a;return}const{tag:i,languageAware:o,themeAware:r,cldr:s,fastNavigation:l,formAssociated:n,shadowRootOptions:d}=a;e.metadata.tag=i,o&&(e.metadata.languageAware=o),s&&(e.metadata.cldr=s),r&&(e.metadata.themeAware=r),l&&(e.metadata.fastNavigation=l),n&&(e.metadata.formAssociated=n),d&&(e.metadata.shadowRootOptions=d),["renderer","template","styles","dependencies"].forEach(t=>{a[t]&&Object.defineProperty(e,t,{get:()=>a[t]});});};

    const b$5=(n,e={})=>t=>{Object.prototype.hasOwnProperty.call(t,"metadata")||(t.metadata={});const a=t.metadata;a.events||(a.events={});const l=a.events;l[n]||(e.bubbles=!!e.bubbles,e.cancelable=!!e.cancelable,l[n]=e);};

    const s$9=o=>(p,r)=>{const t=p.constructor;Object.prototype.hasOwnProperty.call(t,"metadata")||(t.metadata={});const e=t.metadata;e.properties||(e.properties={});const a=e.properties;a[r]||(a[r]=o??{});};

    const d$2=e=>(l,a)=>{const r=l.constructor;Object.prototype.hasOwnProperty.call(r,"metadata")||(r.metadata={});const o=r.metadata;o.slots||(o.slots={});const t=o.slots;if(e&&e.default&&t.default)throw new Error("Only one slot can be the default slot.");const n=e&&e.default?"default":a;e=e||{type:HTMLElement},e.type||(e.type=HTMLElement),t[n]||(t[n]=e),e.default&&(delete t.default.default,t.default.propertyName=a),r.metadata.managedSlots=true;};

    function d$1(t){return (r,a)=>{const n=r.constructor;Object.prototype.hasOwnProperty.call(n,"metadata")||(n.metadata={});const o=n.metadata;o.slots||(o.slots={});const e=o.slots;if(t&&t.default&&e.default)throw new Error("Only one slot can be the default slot.");const l=t&&t.default?"default":a;t=t||{type:HTMLElement},t.type||(t.type=HTMLElement),e[l]||(e[l]=t),t.default&&(delete e.default.default,e.default.propertyName=a),n.metadata.managedSlots=true;}}

    const y$3={BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,ESCAPE:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,ARROW_LEFT:37,ARROW_UP:38,ARROW_RIGHT:39,ARROW_DOWN:40,DELETE:46,NUMPAD_PLUS:107,NUMPAD_MINUS:109,F4:115,F7:118,F8:119,F10:121,PLUS:187,MINUS:219},b$4=o=>(o.key?o.key==="Enter":o.keyCode===y$3.ENTER)&&!a$4(o),i$5=o=>(o.key?o.key==="Enter":o.keyCode===y$3.ENTER)&&e$3(o,false,false,true),C$1=o=>e$3(o,true,false,false),A=o=>(o.key?o.key==="Spacebar"||o.key===" ":o.keyCode===y$3.SPACE)&&!a$4(o),K=o=>(o.key?o.key==="Spacebar"||o.key===" ":o.keyCode===y$3.SPACE)&&e$3(o,false,false,true),D$1=o=>(o.key?o.key==="ArrowLeft"||o.key==="Left":o.keyCode===y$3.ARROW_LEFT)&&!a$4(o),R=o=>(o.key?o.key==="ArrowRight"||o.key==="Right":o.keyCode===y$3.ARROW_RIGHT)&&!a$4(o),P=o=>(o.key?o.key==="ArrowUp"||o.key==="Up":o.keyCode===y$3.ARROW_UP)&&!a$4(o),_=o=>(o.key?o.key==="ArrowDown"||o.key==="Down":o.keyCode===y$3.ARROW_DOWN)&&!a$4(o),O$1=o=>(o.key?o.key==="ArrowUp"||o.key==="Up":o.keyCode===y$3.ARROW_UP)&&e$3(o,false,false,true),N=o=>(o.key?o.key==="ArrowDown"||o.key==="Down":o.keyCode===y$3.ARROW_DOWN)&&e$3(o,false,false,true),w=o=>(o.key?o.key==="ArrowUp"||o.key==="Up":o.keyCode===y$3.ARROW_UP)&&e$3(o,false,true,false),T=o=>(o.key?o.key==="ArrowDown"||o.key==="Down":o.keyCode===y$3.ARROW_DOWN)&&e$3(o,false,true,false),h=o=>(o.key?o.key==="ArrowLeft"||o.key==="Left":o.keyCode===y$3.ARROW_LEFT)&&e$3(o,false,false,true),I=o=>(o.key?o.key==="ArrowRight"||o.key==="Right":o.keyCode===y$3.ARROW_RIGHT)&&e$3(o,false,false,true),M=o=>(o.key?o.key==="Home":o.keyCode===y$3.HOME)&&!a$4(o),n$8=o=>(o.key?o.key==="End":o.keyCode===y$3.END)&&!a$4(o),m$3=o=>(o.key?o.key==="Escape"||o.key==="Esc":o.keyCode===y$3.ESCAPE)&&!a$4(o),x=o=>(o.key?o.key==="Tab":o.keyCode===y$3.TAB)&&!a$4(o),V=o=>(o.key?o.key==="Tab":o.keyCode===y$3.TAB)&&e$3(o,false,false,true),Q=o=>(o.key?o.key==="Backspace":o.keyCode===y$3.BACKSPACE)&&!a$4(o),X=o=>(o.key?o.key==="Delete":o.keyCode===y$3.DELETE)&&!a$4(o),j=o=>(o.key?o.key==="PageUp":o.keyCode===y$3.PAGE_UP)&&!a$4(o),q=o=>(o.key?o.key==="PageDown":o.keyCode===y$3.PAGE_DOWN)&&!a$4(o),ao=o=>(o.key?o.key==="+":o.keyCode===y$3.PLUS)||o.keyCode===y$3.NUMPAD_PLUS&&!a$4(o),so=o=>(o.key?o.key==="-":o.keyCode===y$3.MINUS)||o.keyCode===y$3.NUMPAD_MINUS&&!a$4(o),ko=o=>o.key?s$8(o)||Ao(o):o.keyCode===y$3.F4&&!a$4(o)||o.keyCode===y$3.ARROW_DOWN&&e$3(o,false,true,false),ro=o=>o.key==="F2"&&!a$4(o),s$8=o=>o.key==="F4"&&!a$4(o),Eo=o=>(o.key?o.key==="F10":o.keyCode===y$3.F10)&&e$3(o,false,false,true),io=o=>(o.key?o.key==="F7":o.keyCode===y$3.F7)&&!a$4(o),Co=o=>(o.key?o.key==="F8":o.keyCode===y$3.F8)&&e$3(o,true,true,false),Ao=o=>(o.key==="ArrowDown"||o.key==="Down"||o.key==="ArrowUp"||o.key==="Up")&&e$3(o,false,true,false),Ko=o=>o.key==="Shift"||o.keyCode===y$3.SHIFT,a$4=o=>o.shiftKey||o.altKey||k(o),k=o=>!!(o.metaKey||o.ctrlKey),e$3=(o,r,l,E)=>o.shiftKey===E&&o.altKey===l&&k(o)===r;

    const t$3=()=>{let e=document.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;return e};

    var r$5=(l=>(l.Auto="Auto",l.Vertical="Vertical",l.Horizontal="Horizontal",l.Paging="Paging",l))(r$5||{});

    var l$5=(c=>(c.Static="Static",c.Cyclic="Cyclic",c))(l$5||{});

    const s$7=new Map,o$5=new Map,n$7=new Map,c$4=e=>{if(!s$7.has(e)){const a=b$3(e.split("-"));s$7.set(e,a);}return s$7.get(e)},l$4=e=>{if(!o$5.has(e)){const a=e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();o$5.set(e,a);}return o$5.get(e)},p$1=e=>l$4(e),b$3=e=>e.map((a,t)=>t===0?a.toLowerCase():a.charAt(0).toUpperCase()+a.slice(1).toLowerCase()).join(""),C=e=>{const a=n$7.get(e);if(a)return a;const t=c$4(e),r=t.charAt(0).toUpperCase()+t.slice(1);return n$7.set(e,r),r};

    const o$4=t=>{if(!(t instanceof HTMLElement))return "default";const e=t.getAttribute("slot");if(e){const r=e.match(/^(.+?)-\d+$/);return r?r[1]:e}return "default"},n$6=t=>t instanceof HTMLSlotElement?t.assignedNodes({flatten:true}).filter(e=>e instanceof HTMLElement):[t],s$6=t=>t.reduce((e,r)=>e.concat(n$6(r)),[]);

    let u$3 = class u{constructor(t){this.metadata=t;}getInitialState(){if(Object.prototype.hasOwnProperty.call(this,"_initialState"))return this._initialState;const t={};if(this.slotsAreManaged()){const o=this.getSlots();for(const[e,s]of Object.entries(o)){const n=s.propertyName||e;t[n]=[],t[c$4(n)]=t[n];}}return this._initialState=t,t}static validateSlotValue(t,a){return g$2(t,a)}getPureTag(){return this.metadata.tag||""}getTag(){const t=this.metadata.tag;if(!t)return "";const a=ManagedStyles.d$1(t);return a?`${t}-${a}`:t}hasAttribute(t){return !this.getProperties()[t].noAttribute}getPropertiesList(){return Object.keys(this.getProperties())}getAttributesList(){return this.getPropertiesList().filter(this.hasAttribute.bind(this)).map(l$4)}canSlotText(){return this.getSlots().default?.type===Node}hasSlots(){return !!Object.entries(this.getSlots()).length}hasIndividualSlots(){return this.slotsAreManaged()&&Object.values(this.getSlots()).some(t=>t.individualSlots)}slotsAreManaged(){return !!this.metadata.managedSlots}supportsF6FastNavigation(){return !!this.metadata.fastNavigation}getProperties(){return this.metadata.properties||(this.metadata.properties={}),this.metadata.properties}getEvents(){return this.metadata.events||(this.metadata.events={}),this.metadata.events}getSlots(){return this.metadata.slots||(this.metadata.slots={}),this.metadata.slots}isLanguageAware(){return !!this.metadata.languageAware}isThemeAware(){return !!this.metadata.themeAware}needsCLDR(){return !!this.metadata.cldr}getShadowRootOptions(){return this.metadata.shadowRootOptions||{}}isFormAssociated(){return !!this.metadata.formAssociated}shouldInvalidateOnChildChange(t,a,o){const e=this.getSlots()[t].invalidateOnChildChange;if(e===void 0)return  false;if(typeof e=="boolean")return e;if(typeof e=="object"){if(a==="property"){if(e.properties===void 0)return  false;if(typeof e.properties=="boolean")return e.properties;if(Array.isArray(e.properties))return e.properties.includes(o);throw new Error("Wrong format for invalidateOnChildChange.properties: boolean or array is expected")}if(a==="slot"){if(e.slots===void 0)return  false;if(typeof e.slots=="boolean")return e.slots;if(Array.isArray(e.slots))return e.slots.includes(o);throw new Error("Wrong format for invalidateOnChildChange.slots: boolean or array is expected")}}throw new Error("Wrong format for invalidateOnChildChange: boolean or object is expected")}getI18n(){return this.metadata.i18n||(this.metadata.i18n={}),this.metadata.i18n}};const g$2=(r,t)=>(r&&n$6(r).forEach(a=>{if(!(a instanceof t.type))throw new Error(`The element is not of type ${t.type.toString()}`)}),r);

    const r$4=()=>ManagedStyles.m("CustomStyle.eventProvider",new ManagedStyles.i$1),n$5="CustomCSSChange",i$4=t=>{r$4().attachEvent(n$5,t);},u$2=t=>r$4().fireEvent(n$5,t),c$3=()=>ManagedStyles.m("CustomStyle.customCSSFor",{});let s$5;i$4(t=>{s$5||ManagedStyles.b({tag:t});});const g$1=(t,e)=>{const o=c$3();o[t]||(o[t]=[]),o[t].push(e),s$5=true;try{u$2(t);}finally{s$5=false;}return ManagedStyles.b({tag:t})},l$3=t=>{const e=c$3();return e[t]?e[t].join(""):""};

    const e$2=t=>Array.isArray(t)?t.filter(r=>!!r).flat(10).join(" "):t;

    const e$1=new Map;i$4(t=>{e$1.delete(`${t}_normal`);});const y$2=t=>{const o=t.getMetadata().getTag(),n=`${o}_normal`,s=ManagedStyles.n$1("OpenUI5Enablement");if(!e$1.has(n)){let l="";s&&(l=e$2(s.getBusyIndicatorStyles()));const a=l$3(o)||"",m=`${e$2(t.styles)} ${a} ${l}`;e$1.set(n,m);}return e$1.get(n)};

    const e=new Map;i$4(t=>{e.delete(`${t}_normal`);});const s$4=t=>{const n=`${t.getMetadata().getTag()}_normal`;if(!e.has(n)){const a=y$2(t),o=new CSSStyleSheet;o.replaceSync(a),e.set(n,[o]);}return e.get(n)};

    const s$3=o=>{const e=o.constructor,t=o.shadowRoot;if(!t){console.warn("There is no shadow root to update");return}t.adoptedStyleSheets=[ManagedStyles.n$2(),...s$4(e)],e.renderer(o,t);};

    const r$3=[],o$3=t=>r$3.some(s=>t.startsWith(s));

    const t$2=new WeakMap,n$4=(e,o,r)=>{const s=new MutationObserver(o);t$2.set(e,s),s.observe(e,r);},b$2=e=>{const o=t$2.get(e);o&&(o.disconnect(),t$2.delete(e));};

    const r$2=t=>t.matches(":dir(rtl)")?"rtl":"ltr";

    const s$2=["disabled","title","hidden","role","draggable"],r$1=e=>s$2.includes(e)||e.startsWith("aria")?true:![HTMLElement,Element,Node].some(t=>t.prototype.hasOwnProperty(e));

    const n$3=(t,r)=>{if(t.length!==r.length)return  false;for(let e=0;e<t.length;e++)if(t[e]!==r[e])return  false;return  true};

    const n$2=(e,t)=>e.call(t);

    const m$2=t=>{const e=t.getAttribute("form");if(e){const r=t.getRootNode().getElementById?.(e)||document.getElementById(e);return r instanceof HTMLFormElement?r:null}return t._internals?.form??null},a$3=t=>{i$3(t)&&s$1(t);},s$1=t=>{if(t._internals?.form){if(o$2(t),!t.name){t._internals?.setFormValue(null);return}t._internals.setFormValue(t.formFormattedValue);}},o$2=async t=>{if(!(!t.isUI5Element||!t._internals?.form))if(t._internals.setValidity({customError:true}," "),await t.definePromise,t.formValidity&&Object.keys(t.formValidity).some(e=>e)){const e=await t.formElementAnchor?.();t._internals.setValidity(t.formValidity,t.formValidityMessage,e);}else t._internals.setValidity({});},l$2=async t=>{const e=m$2(t);if(!e)return;const n=[...e.elements];await Promise.all(n.map(r=>i$3(r)?o$2(r):Promise.resolve())),e.requestSubmit();},u$1=t=>{m$2(t)?.reset();},i$3=t=>"formFormattedValue"in t&&"name"in t;

    const f$2=new Map,s=new Map,i$2=new Map,L$1=new Set;let d=false;const O={iw:"he",ji:"yi",in:"id"},D=t=>{d||(console.warn(`[LocaleData] Supported locale "${t}" not configured, import the "Assets.js" module from the webcomponents package you are using.`),d=true);},y$1=(t,e,n)=>{t=t&&O[t]||t,t==="no"&&(t="nb"),t==="zh"&&!e&&(n==="Hans"?e="CN":n==="Hant"&&(e="TW")),(t==="sh"||t==="sr"&&n==="Latn")&&(t="sr",e="Latn");let o=`${t}_${e}`;return ManagedStyles.n$3.includes(o)?s.has(o)?o:(D(o),ManagedStyles.r$1):(o=t,ManagedStyles.n$3.includes(o)?s.has(o)?o:(D(o),ManagedStyles.r$1):ManagedStyles.r$1)},u=(t,e)=>{f$2.set(t,e);},S$2=t=>{if(!i$2.get(t)){const e=s.get(t);if(!e)throw new Error(`CLDR data for locale ${t} is not loaded!`);i$2.set(t,e(t));}return i$2.get(t)},g=async(t,e,n)=>{const o=y$1(t,e,n),p=ManagedStyles.n$1("OpenUI5Support");if(p){const r=p.getLocaleDataObject();if(r){u(o,r);return}}try{const r=await S$2(o);u(o,r);}catch(r){const c=r;L$1.has(c.message)||(L$1.add(c.message),console.error(c.message));}},m$1=(t,e)=>{s.set(t,e);};m$1("en",async()=>(console.warn('[LocaleData] Falling back to loading "en" locale data from CDN.','For production usage, please configure locale data loading via the "Assets.js" module of the webcomponents package you are using.'),(await fetch("https://cdn.jsdelivr.net/npm/@openui5/sap.ui.core@1.120.17/src/sap/ui/core/cldr/en.json")).json())),ManagedStyles.t(()=>{const t=Icons.s();return g(t.getLanguage(),t.getRegion(),t.getScript())});

    function r(n){return e=>e!=null&&n in e&&e[n]===true}

    let lt=0;const L=new Map,S$1=new Map,U={fromAttribute(c,f){if(f===Boolean)return c!==null;if(f===Number)return c===null?void 0:parseFloat(c);if(f===Object||f===Array)try{return JSON.parse(c)}catch{return c}return c},toAttribute(c,f){return f===Boolean?c?"":null:f===Object||f===Array||c==null?null:String(c)}};function m(c){this._suppressInvalidation||this.constructor.getMetadata().isLanguageAware()&&ManagedStyles.L()||(this.onInvalidation(c),this._changedState.push(c),ManagedStyles.l$3(this),this._invalidationEventProvider.fireEvent("invalidate",{...c,target:this}));}function dt(c,f){do{const t=Object.getOwnPropertyDescriptor(c,f);if(t)return t;c=Object.getPrototypeOf(c);}while(c&&c!==HTMLElement.prototype)}let b$1 = class b extends HTMLElement{constructor(){super();this.__shouldHydrate=false;this._rendered=false;const t=this.constructor;this._changedState=[],this._suppressInvalidation=true,this._inDOM=false,this._fullyConnected=false,this._childChangeListeners=new Map,this._slotChangeListeners=new Map,this._invalidationEventProvider=new ManagedStyles.i$1,this._componentStateFinalizedEventProvider=new ManagedStyles.i$1;let e;this._domRefReadyPromise=new Promise(n=>{e=n;}),this._domRefReadyPromise._deferredResolve=e,this._doNotSyncAttributes=new Set,this._slotsAssignedNodes=new WeakMap,this._state={...t.getMetadata().getInitialState()},this.initializedProperties=new Map,this.constructor.getMetadata().getPropertiesList().forEach(n=>{if(this.hasOwnProperty(n)){const o=this[n];this.initializedProperties.set(n,o);}}),this._internals=this.attachInternals(),this._initShadowRoot();}_initShadowRoot(){const t=this.constructor;if(t._needsShadowDOM()){const e={mode:"open"};this.shadowRoot?this.__shouldHydrate=true:this.attachShadow({...e,...t.getMetadata().getShadowRootOptions()}),t.getMetadata().slotsAreManaged()&&this.shadowRoot.addEventListener("slotchange",this._onShadowRootSlotChange.bind(this));}}_onShadowRootSlotChange(t){t.target?.getRootNode()===this.shadowRoot&&this._processChildren();}get _id(){return this.__id||(this.__id=`ui5wc_${++lt}`),this.__id}render(){const t=this.constructor.template;return n$2(t,this)}async connectedCallback(){const t=this.constructor;ManagedStyles.c$1(this),this.setAttribute(t.getMetadata().getPureTag(),""),t.getMetadata().supportsF6FastNavigation()&&!this.hasAttribute("data-sap-ui-fastnavgroup")&&this.setAttribute("data-sap-ui-fastnavgroup","true");const e=t.getMetadata().slotsAreManaged();this._inDOM=true,e&&(this._startObservingDOMChildren(),await this._processChildren()),Object.prototype.hasOwnProperty.call(t,"asyncFinished")||await t._definePromise;const s=ManagedStyles.L();t.getMetadata().isLanguageAware()&&s&&await s,this._inDOM&&(this._rendered||ManagedStyles.u$1(this),this._domRefReadyPromise._deferredResolve(),this._fullyConnected=true,this.onEnterDOM(),this.hasAttribute("autofocus")&&requestAnimationFrame(()=>{this.focus();}));}get definePromise(){const t=this.constructor;return !Object.prototype.hasOwnProperty.call(t,"asyncFinished")&&t._definePromise?t._definePromise:Promise.resolve()}disconnectedCallback(){const e=this.constructor.getMetadata().slotsAreManaged();this._inDOM=false,e&&this._stopObservingDOMChildren(),this._fullyConnected&&(this.onExitDOM(),this._fullyConnected=false),this._domRefReadyPromise._deferredResolve(),ManagedStyles.P$2(this),ManagedStyles.f$3(this);}onBeforeRendering(){}onAfterRendering(){}onEnterDOM(){}onExitDOM(){}_startObservingDOMChildren(){const e=this.constructor.getMetadata();if(!e.hasSlots())return;const n=e.canSlotText(),o={childList:true,subtree:n,characterData:n};n$4(this,this._processChildren.bind(this),o);}_stopObservingDOMChildren(){b$2(this);}async _processChildren(){this.constructor.getMetadata().hasSlots()&&await this._updateSlots();}async _updateSlots(){const t=this.constructor,e=t.getMetadata().getSlots(),s=t.getMetadata().canSlotText(),n=Array.from(s?this.childNodes:this.children),o=new Map,a=new Map;for(const[l,h]of Object.entries(e)){const d=h.propertyName||l;a.set(d,l),o.set(d,[...this._state[d]]),this._clearSlot(l,h);}const r=new Map,i=new Map;n.forEach((l,h)=>{const d=o$4(l),p=e[d];if(p===void 0){if(d!=="default"){const I=Object.keys(e).join(", ");console.warn(`Unknown slotName: ${d}, ignoring`,l,`Valid values are: ${I}`);}return}const _=p.propertyName||d;i.has(_)?i.get(_).push({child:l,idx:h}):i.set(_,[{child:l,idx:h}]);}),i.forEach((l,h)=>{this._state[h]=l.sort((d,p)=>d.idx-p.idx).map(d=>d.child),this._state[c$4(h)]=this._state[h];});const u=n.map(async l=>{const h=o$4(l),d=e[h];if(d!==void 0){if(d.individualSlots){const p=(r.get(h)||0)+1;r.set(h,p),l._individualSlot=`${h}-${p}`;}if(l instanceof HTMLElement){const p=l.localName;if(p.includes("-")&&!o$3(p)){if(!customElements.get(p)){const k=customElements.whenDefined(p);let E=L.get(p);E||(E=new Promise(F=>setTimeout(F,1e3)),L.set(p,E)),await Promise.race([k,E]);}customElements.upgrade(l);}}if(l=t.getMetadata().constructor.validateSlotValue(l,d),y(l)&&d.invalidateOnChildChange){const p=this._getChildChangeListener(h);l.attachInvalidate.call(l,p);}l instanceof HTMLSlotElement&&this._attachSlotChange(l,h,!!d.invalidateOnChildChange);}});await Promise.all(u);let v=false;for(const[l,h]of Object.entries(e)){const d=h.propertyName||l;n$3(o.get(d),this._state[d])||(m.call(this,{type:"slot",name:a.get(d),reason:"children"}),v=true,t.getMetadata().isFormAssociated()&&s$1(this));}v||m.call(this,{type:"slot",name:"default",reason:"textcontent"});}_clearSlot(t,e){const s=e.propertyName||t;this._state[s].forEach(o=>{if(y(o)){const a=this._getChildChangeListener(t);o.detachInvalidate.call(o,a);}o instanceof HTMLSlotElement&&this._detachSlotChange(o,t);}),this._state[s]=[],this._state[c$4(s)]=this._state[s];}attachInvalidate(t){this._invalidationEventProvider.attachEvent("invalidate",t);}detachInvalidate(t){this._invalidationEventProvider.detachEvent("invalidate",t);}_onChildChange(t,e){this.constructor.getMetadata().shouldInvalidateOnChildChange(t,e.type,e.name)&&m.call(this,{type:"slot",name:t,reason:"childchange",child:e.target});}attributeChangedCallback(t,e,s){let n;if(this._doNotSyncAttributes.has(t))return;const o=this.constructor.getMetadata().getProperties(),a=t.replace(/^ui5-/,""),r=c$4(a);if(o.hasOwnProperty(r)){const i=o[r];n=(i.converter??U).fromAttribute(s,i.type),this[r]=n;}}formAssociatedCallback(){this.constructor.getMetadata().isFormAssociated()&&a$3(this);}static get formAssociated(){return this.getMetadata().isFormAssociated()}_updateAttribute(t,e){const s=this.constructor;if(!s.getMetadata().hasAttribute(t))return;const o=s.getMetadata().getProperties()[t];if(o.type===Object||o.type===Array)return;const a=l$4(t),i=(o.converter||U).toAttribute(e,o.type);this._doNotSyncAttributes.add(a),i==null?this.removeAttribute(a):this.setAttribute(a,i),this._doNotSyncAttributes.delete(a);}_getChildChangeListener(t){return this._childChangeListeners.has(t)||this._childChangeListeners.set(t,this._onChildChange.bind(this,t)),this._childChangeListeners.get(t)}_getSlotChangeListener(t){return this._slotChangeListeners.has(t)||this._slotChangeListeners.set(t,this._onSlotChange.bind(this,t)),this._slotChangeListeners.get(t)}_attachSlotChange(t,e,s){const n=this._getSlotChangeListener(e);t.addEventListener("slotchange",o=>{if(n.call(t,o),s){const a=this._slotsAssignedNodes.get(t);a&&a.forEach(i=>{if(y(i)){const u=this._getChildChangeListener(e);i.detachInvalidate.call(i,u);}});const r=s$6([t]);this._slotsAssignedNodes.set(t,r),r.forEach(i=>{if(y(i)){const u=this._getChildChangeListener(e);i.attachInvalidate.call(i,u);}});}});}_detachSlotChange(t,e){t.removeEventListener("slotchange",this._getSlotChangeListener(e));}_onSlotChange(t){m.call(this,{type:"slot",name:t,reason:"slotchange"});}onInvalidation(t){}updateAttributes(){const e=this.constructor.getMetadata().getProperties();for(const[s,n]of Object.entries(e))this._updateAttribute(s,this[s]);}_render(){const t=this.constructor;if(t.getMetadata().isLanguageAware()&&ManagedStyles.L())return;const e=t.getMetadata().hasIndividualSlots();this.initializedProperties.size>0&&(Array.from(this.initializedProperties.entries()).forEach(([s,n])=>{delete this[s],this[s]=n;}),this.initializedProperties.clear()),this._suppressInvalidation=true;try{this.onBeforeRendering(),this._rendered||this.updateAttributes(),this._componentStateFinalizedEventProvider.fireEvent("componentStateFinalized");}finally{this._suppressInvalidation=false;}this._changedState=[],t._needsShadowDOM()&&s$3(this),this._rendered=true,e&&this._assignIndividualSlotsToChildren(),this.onAfterRendering();}_assignIndividualSlotsToChildren(){Array.from(this.children).forEach(e=>{e._individualSlot&&e.setAttribute("slot",e._individualSlot);});}_waitForDomRef(){return this._domRefReadyPromise}getDomRef(){if(typeof this._getRealDomRef=="function")return this._getRealDomRef();if(!(!this.shadowRoot||this.shadowRoot.children.length===0))return this.shadowRoot.children[0]}getFocusDomRef(){const t=this.getDomRef();if(t)return t.querySelector("[data-sap-focus-ref]")||t}async getFocusDomRefAsync(){return await this._waitForDomRef(),this.getFocusDomRef()}async focus(t){await this._waitForDomRef();const e=this.getFocusDomRef();e===this||!this.isConnected?HTMLElement.prototype.focus.call(this,t):e&&typeof e.focus=="function"&&e.focus(t);}fireEvent(t,e,s=false,n=true){const o=this._fireEvent(t,e,s,n),a=C(t);return a!==t?o&&this._fireEvent(a,e,s,n):o}fireDecoratorEvent(t,e){const s=this.getEventData(t),n=s?s.cancelable:false,o=s?s.bubbles:false,a=this._fireEvent(t,e,n,o),r=C(t);return r!==t?a&&this._fireEvent(r,e,n,o):a}_fireEvent(t,e,s=false,n=true){const o=new CustomEvent(`ui5-${t}`,{detail:e,composed:false,bubbles:n,cancelable:s}),a=this.dispatchEvent(o);if(ManagedStyles.a$3(t))return a;const r=new CustomEvent(t,{detail:e,composed:false,bubbles:n,cancelable:s});return this.dispatchEvent(r)&&a}getEventData(t){return this.constructor.getMetadata().getEvents()[t]}getSlottedNodes(t){return s$6(this[t])}attachComponentStateFinalized(t){this._componentStateFinalizedEventProvider.attachEvent("componentStateFinalized",t);}detachComponentStateFinalized(t){this._componentStateFinalizedEventProvider.detachEvent("componentStateFinalized",t);}get effectiveDir(){return ManagedStyles.n$4(this.constructor),r$2(this)}get isUI5Element(){return  true}get isUI5AbstractElement(){return !this.constructor._needsShadowDOM()}get classes(){return {}}get accessibilityInfo(){}static get observedAttributes(){return this.getMetadata().getAttributesList()}static get tagsToScope(){const t=this.getMetadata().getPureTag(),e=this.getUniqueDependencies().map(s=>s.getMetadata().getPureTag()).filter(ManagedStyles.i$2);return ManagedStyles.i$2(t)&&e.push(t),e}static _needsShadowDOM(){return !!this.template||Object.prototype.hasOwnProperty.call(this.prototype,"render")}static _generateAccessors(){const t=this.prototype,e=this.getMetadata().slotsAreManaged(),s=this.getMetadata().getProperties();for(const[n,o]of Object.entries(s)){r$1(n)||console.warn(`"${n}" is not a valid property name. Use a name that does not collide with DOM APIs`);const a=dt(t,n);let r;a?.set&&(r=a.set);let i;a?.get&&(i=a.get),Object.defineProperty(t,n,{get(){return i?i.call(this):this._state[n]},set(u){const v=this.constructor,l=i?i.call(this):this._state[n];if(l!==u){if(r?r.call(this,u):this._state[n]=u,m.call(this,{type:"property",name:n,newValue:u,oldValue:l}),this._rendered){const d=i?i.call(this):this._state[n];this._updateAttribute(n,d);}v.getMetadata().isFormAssociated()&&s$1(this);}}});}if(e){const n=this.getMetadata().getSlots();for(const[o,a]of Object.entries(n)){r$1(o)||console.warn(`"${o}" is not a valid property name. Use a name that does not collide with DOM APIs`);const r=a.propertyName||o,i={get(){return this._state[r]!==void 0?this._state[r]:[]},set(){throw new Error("Cannot set slot content directly, use the DOM APIs (appendChild, removeChild, etc...)")}};Object.defineProperty(t,r,i),r!==c$4(r)&&Object.defineProperty(t,c$4(r),i);}}}static{this.metadata={};}static{this.styles="";}static get dependencies(){return []}static cacheUniqueDependencies(){const t=this.dependencies.filter((e,s,n)=>n.indexOf(e)===s);S$1.set(this,t);}static getUniqueDependencies(){return S$1.has(this)||this.cacheUniqueDependencies(),S$1.get(this)||[]}static async onDefine(){return Promise.resolve()}static fetchI18nBundles(){return Promise.all(Object.entries(this.getMetadata().getI18n()).map(t=>{const{bundleName:e}=t[1];return Icons.f(e)}))}static fetchCLDR(){return this.getMetadata().needsCLDR()?g(Icons.s().getLanguage(),Icons.s().getRegion(),Icons.s().getScript()):Promise.resolve()}static{this.i18nBundleStorage={};}static get i18nBundles(){return this.i18nBundleStorage}static define(){const t=async()=>{await ManagedStyles.u$2();const o=await Promise.all([this.fetchI18nBundles(),this.fetchCLDR(),this.onDefine()]),[a]=o;Object.entries(this.getMetadata().getI18n()).forEach((r,i)=>{const u=r[1].bundleName;this.i18nBundleStorage[u]=a[i];}),this.asyncFinished=true;};this._definePromise=t();const e=this.getMetadata().getTag(),s=ManagedStyles.w$2(e),n=customElements.get(e);return n&&!s?ManagedStyles.$(e):n||(this._generateAccessors(),ManagedStyles.h$1(e),customElements.define(e,this)),this}static getMetadata(){if(this.hasOwnProperty("_metadata"))return this._metadata;const t=[this.metadata];let e=this;for(;e!==b;)e=Object.getPrototypeOf(e),t.unshift(e.metadata);const s=ManagedStyles.e$1({},...t);return this._metadata=new u$3(s),this._metadata}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}};const y=r("isUI5Element");

    let f$1 = class f{constructor(e,t){if(!e.isUI5Element)throw new Error("The root web component must be a UI5 Element instance");if(this.rootWebComponent=e,this.rootWebComponent.addEventListener("keydown",this._onkeydown.bind(this)),this._initBound=this._init.bind(this),this.rootWebComponent.attachComponentStateFinalized(this._initBound),typeof t.getItemsCallback!="function")throw new Error("getItemsCallback is required");this._getItems=t.getItemsCallback,this._currentIndex=t.currentIndex||0,this._rowSize=t.rowSize||1,this._behavior=t.behavior||l$5.Static,this._navigationMode=t.navigationMode||r$5.Auto,this._affectedPropertiesNames=t.affectedPropertiesNames||[],this._skipItemsSize=t.skipItemsSize||null;}setCurrentItem(e){const t=this._getItems().indexOf(e);if(t===-1){console.warn("The provided item is not managed by ItemNavigation",e);return}this._currentIndex=t,this._applyTabIndex();}setRowSize(e){this._rowSize=e;}_init(){this._getItems().forEach((e,t)=>{e.forcedTabIndex=t===this._currentIndex?"0":"-1";});}_onkeydown(e){if(!this._canNavigate())return;const t=this._navigationMode===r$5.Horizontal||this._navigationMode===r$5.Auto,i=this._navigationMode===r$5.Vertical||this._navigationMode===r$5.Auto,s=this.rootWebComponent.effectiveDir==="rtl";if(s&&D$1(e)&&t)this._handleRight();else if(s&&R(e)&&t)this._handleLeft();else if(D$1(e)&&t)this._handleLeft();else if(R(e)&&t)this._handleRight();else if(P(e)&&i)this._handleUp();else if(_(e)&&i)this._handleDown();else if(M(e))this._handleHome();else if(n$8(e))this._handleEnd();else if(j(e))this._handlePageUp();else if(q(e))this._handlePageDown();else return;e.preventDefault(),this._applyTabIndex(),this._focusCurrentItem();}_handleUp(){const e=this._getItems().length;if(this._currentIndex-this._rowSize>=0){this._currentIndex-=this._rowSize;return}if(this._behavior===l$5.Cyclic){const t=this._currentIndex%this._rowSize,i=t===0?this._rowSize-1:t-1,s=Math.ceil(e/this._rowSize);let o=i+(s-1)*this._rowSize;o>e-1&&(o-=this._rowSize),this._currentIndex=o;}else this._currentIndex=0;}_handleDown(){const e=this._getItems().length;if(this._currentIndex+this._rowSize<e){this._currentIndex+=this._rowSize;return}if(this._behavior===l$5.Cyclic){const i=(this._currentIndex%this._rowSize+1)%this._rowSize;this._currentIndex=i;}else this._currentIndex=e-1;}_handleLeft(){const e=this._getItems().length;if(this._currentIndex>0){this._currentIndex-=1;return}this._behavior===l$5.Cyclic&&(this._currentIndex=e-1);}_handleRight(){const e=this._getItems().length;if(this._currentIndex<e-1){this._currentIndex+=1;return}this._behavior===l$5.Cyclic&&(this._currentIndex=0);}_handleHome(){const e=this._rowSize>1?this._rowSize:this._getItems().length;this._currentIndex-=this._currentIndex%e;}_handleEnd(){const e=this._rowSize>1?this._rowSize:this._getItems().length;this._currentIndex+=e-1-this._currentIndex%e;}_handlePageUp(){this._rowSize>1||this._handlePageUpFlat();}_handlePageDown(){this._rowSize>1||this._handlePageDownFlat();}_handlePageUpFlat(){if(this._skipItemsSize===null){this._currentIndex-=this._currentIndex;return}this._currentIndex+1>this._skipItemsSize?this._currentIndex-=this._skipItemsSize:this._currentIndex-=this._currentIndex;}_handlePageDownFlat(){if(this._skipItemsSize===null){this._currentIndex=this._getItems().length-1;return}this._getItems().length-this._currentIndex-1>this._skipItemsSize?this._currentIndex+=this._skipItemsSize:this._currentIndex=this._getItems().length-1;}_applyTabIndex(){const e=this._getItems();for(let t=0;t<e.length;t++)e[t].forcedTabIndex=t===this._currentIndex?"0":"-1";this._affectedPropertiesNames.forEach(t=>{const i=this.rootWebComponent[t];this.rootWebComponent[t]=Array.isArray(i)?[...i]:{...i};});}_focusCurrentItem(){const e=this._getCurrentItem();e&&e.focus();}_canNavigate(){const e=this._getCurrentItem(),t=t$3();return e&&e===t}_getCurrentItem(){const e=this._getItems();if(!e.length)return;for(;this._currentIndex>=e.length;)this._currentIndex-=this._rowSize;this._currentIndex<0&&(this._currentIndex=0);const t=e[this._currentIndex];if(!t)return;if(y(t))return t.getFocusDomRef();const i=this.rootWebComponent.getDomRef();if(i&&t.id)return i.querySelector(`[id="${t.id}"]`)}};

    let n$1;const l$1=new Map,a$2=()=>(n$1||(n$1=new window.ResizeObserver(r=>{window.requestAnimationFrame(()=>{r.forEach(t=>{const s=l$1.get(t.target);s&&Promise.all(s.map(e=>e()));});});})),n$1),c$2=(r,t)=>{const s=l$1.get(r)||[];s.length||a$2().observe(r),l$1.set(r,[...s,t]);},b=(r,t)=>{const s=l$1.get(r)||[];if(s.length===0)return;const e=s.filter(o=>o!==t);e.length===0?(a$2().unobserve(r),l$1.delete(r)):l$1.set(r,e);};class f{static register(t,s){let e=t;y(e)&&(e=e.getDomRef()),e instanceof HTMLElement?c$2(e,s):console.warn("Cannot register ResizeHandler for element",t);}static deregister(t,s){let e=t;y(e)&&(e=e.getDomRef()),e instanceof HTMLElement?b(e,s):console.warn("Cannot deregister ResizeHandler for element",t);}}

    const l="scroll",p=ManagedStyles.l$1()?"touchend":"mouseup";class v extends ManagedStyles.i$1{constructor(t){super();this.supportsTouch=ManagedStyles.l$1();this.containerComponent=t,this.mouseMove=this.ontouchmove.bind(this),this.mouseUp=this.ontouchend.bind(this),this.touchStart=this.ontouchstart.bind(this),this.supportsTouch=ManagedStyles.l$1(),this.cachedValue={dragX:0,dragY:0},this.startX=0,this.startY=0,this.supportsTouch?(t.addEventListener("touchstart",this.touchStart,{passive:true}),t.addEventListener("touchmove",this.mouseMove,{passive:true}),t.addEventListener("touchend",this.mouseUp,{passive:true})):t.addEventListener("mousedown",this.touchStart,{passive:true});}set scrollContainer(t){this._container=t;}get scrollContainer(){return this._container}async scrollTo(t,e,s=0,o=0){let r=this.scrollContainer.clientHeight>0&&this.scrollContainer.clientWidth>0;for(;!r&&s>0;)await new Promise(n=>{setTimeout(()=>{r=this.scrollContainer.clientHeight>0&&this.scrollContainer.clientWidth>0,s--,n();},o);});this._container.scrollLeft=t,this._container.scrollTop=e;}move(t,e,s){if(s){this._container.scrollLeft+=t,this._container.scrollTop+=e;return}if(this._container)return f$3(this._container,t,e)}getScrollLeft(){return this._container.scrollLeft}getScrollTop(){return this._container.scrollTop}_isTouchInside(t){let e=null;this.supportsTouch&&t instanceof TouchEvent&&(e=t.touches[0]);const s=this._container.getBoundingClientRect(),o=this.supportsTouch?e.clientX:t.x,r=this.supportsTouch?e.clientY:t.y;return o>=s.left&&o<=s.right&&r>=s.top&&r<=s.bottom}ontouchstart(t){let e=null;this.supportsTouch&&t instanceof TouchEvent&&(e=t.touches[0]),e?(this.startX=e.pageX,this.startY=e.pageY):(document.addEventListener("mouseup",this.mouseUp,{passive:true}),document.addEventListener("mousemove",this.mouseMove,{passive:true})),e&&(this._prevDragX=e.pageX,this._prevDragY=e.pageY),t instanceof MouseEvent&&(this._prevDragX=t.x,this._prevDragY=t.y),this._canScroll=this._isTouchInside(t);}ontouchmove(t){if(!this._canScroll)return;const e=this._container,s=this.supportsTouch?t.touches[0]:null,o=this.supportsTouch?s.pageX:t.x,r=this.supportsTouch?s.pageY:t.y;e.scrollLeft+=this._prevDragX-o,e.scrollTop+=this._prevDragY-r,this.fireEvent(l,{isLeft:o>this._prevDragX,isRight:o<this._prevDragX}),this.cachedValue.dragX=this._prevDragX,this.cachedValue.dragY=this._prevDragY,this._prevDragX=o,this._prevDragY=r;}ontouchend(t){if(this.supportsTouch){const h=Math.abs(t.changedTouches[0].pageX-this.startX),c=Math.abs(t.changedTouches[0].pageY-this.startY);if(h<10&&c<10)return}if(!this._canScroll)return;const e=this._container,s=this.supportsTouch?t.changedTouches[0].pageX:t.x,o=this.supportsTouch?t.changedTouches[0].pageY:t.y;e.scrollLeft+=this._prevDragX-s,e.scrollTop+=this._prevDragY-o;const n=s===this._prevDragX?this.cachedValue.dragX:s;this.fireEvent(p,{isLeft:n<this._prevDragX,isRight:n>this._prevDragX}),this._prevDragX=s,this._prevDragY=o,this.supportsTouch||(document.removeEventListener("mousemove",this.mouseMove),document.removeEventListener("mouseup",this.mouseUp));}}

    const n=new ManagedStyles.i$1,t$1="directionChange",a$1=e=>{n.attachEvent(t$1,e);},c$1=e=>{n.detachEvent(t$1,e);},o$1=()=>n.fireEvent(t$1,void 0);

    const i$1=async()=>{const e=o$1();await Promise.all(e),await ManagedStyles.b({rtlAware:true});};

    // TODO-evo:assert on node throws an error if the assertion is violated

    /**
     * A simple assertion mechanism that logs a message when a given condition is not met.
     *
     * <b>Note:</b> Calls to this method might be removed when the JavaScript code
     *              is optimized during build. Therefore, callers should not rely on any side effects
     *              of this method.
     *
     * @function
     * @since 1.58
     * @alias module:sap/base/assert
     * @param {boolean} bResult Result of the checked assertion
     * @param {string|function():any} vMessage Message that will be logged when the result is <code>false</code>.
     * In case this is a function, the return value of the function will be displayed. This can be used to execute
     * complex code only if the assertion fails.
     * @public
     * @SecSink {1|SECRET} Could expose secret data in logs
     *
     */ /*!
         * OpenUI5
         * (c) Copyright 2026 SAP SE or an SAP affiliate company.
         * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
         */

    var fnAssert = function (bResult, vMessage) {
      if (!bResult) {
        var sMessage = vMessage;
        /*eslint-disable no-console */
        console.assert(bResult, sMessage);
        /*eslint-enable no-console */
      }
    };

    // validation regexes
    /*!
     * OpenUI5
     * (c) Copyright 2026 SAP SE or an SAP affiliate company.
     * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
     */

    var rBasicUrl = /^(?:([^:\/?#]+):)?((?:[\/\\]{2,}(?:(?:[^@\/?#]*@)?(\[[^\]]+\]|[^\/?#:]+)(?::([0-9]+))?)?)?([^?#]*))(?:\?([^#]*))?(?:#(.*))?$/;
    var rCheckPath = /^([a-z0-9-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*$/i;
    var rCheckQuery = /^([a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9a-f]{2})*$/i;
    var rCheckFragment = rCheckQuery;
    var rCheckMail = /^([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+(?:\.([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    var rCheckIPv4 = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    var rCheckValidIPv4 = /^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
    var rCheckIPv6 = /^\[[^\]]+\]$/;
    var rCheckValidIPv6 = /^\[(((([0-9a-f]{1,4}:){6}|(::([0-9a-f]{1,4}:){5})|(([0-9a-f]{1,4})?::([0-9a-f]{1,4}:){4})|((([0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){3})|((([0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){2})|((([0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:)|((([0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::))(([0-9a-f]{1,4}:[0-9a-f]{1,4})|(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])))|((([0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4})|((([0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::))\]$/i;
    var rCheckHostName = /^([a-z0-9]([a-z0-9\-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/i;
    var rSpecialSchemeURLs = /^((?:ftp|https?|wss?):)([\s\S]+)$/;

    /* eslint-disable no-control-regex */
    var rCheckWhitespaces = /[\u0009\u000A\u000D]/;

    /**
     * Registry to manage allowed URLs and validate against them.
     *
     * @namespace
     * @since 1.85
     * @alias module:sap/base/security/URLListValidator
     * @public
     */
    var oURLListValidator = {};

    /**
     * Creates a new URLListValidator.Entry object
     *
     * @param {string} [protocol] The protocol of the URL, can be falsy to allow all protocols for an entry e.g. "", "http", "mailto"
     * @param {string} [host] The host of the URL, can be falsy to allow all hosts. A wildcard asterisk can be set at the beginning, e.g. "examples.com", "*.example.com"
     * @param {string} [port] The port of the URL, can be falsy to allow all ports, e.g. "", "8080"
     * @param {string} [path] the path of the URL, path of the url, can be falsy to allow all paths. A wildcard asterisk can be set at the end, e.g. "/my-example*", "/my-news"
     * @returns {module:sap/base/security/URLListValidator.Entry|object}
     * @private
     */
    oURLListValidator._createEntry = function (protocol, host, port, path) {
      return new URLListValidatorEntry(protocol, host, port, path);
    };

    /**
     * Entry object of the URLListValidator.
     *
     * @public
     * @typedef {object} module:sap/base/security/URLListValidator.Entry
     * @property {string} [protocol] The protocol of the URL, can be falsy to allow all protocols for an entry e.g. "", "http", "mailto"
     * @property {string} [host] The host of the URL, can be falsy to allow all hosts. A wildcard asterisk can be set at the beginning, e.g. "examples.com", "*.example.com"
     * @property {string} [port] The port of the URL, can be falsy to allow all ports, e.g. "", "8080"
     * @property {string} [path] the path of the URL, path of the url, can be falsy to allow all paths. A wildcard asterisk can be set at the end, e.g. "/my-example*", "/my-news"
     */
    function URLListValidatorEntry(protocol, host, port, path) {
      Object.defineProperties(this, {
        protocol: {
          value: protocol && protocol.toUpperCase(),
          enumerable: true
        },
        host: {
          value: host && host.toUpperCase(),
          enumerable: true
        },
        port: {
          value: port,
          enumerable: true
        },
        path: {
          value: path,
          enumerable: true
        }
      });
    }

    /**
     * The internally managed allowed entries.
     * @private
     */
    var aAllowedEntries = [];

    /**
     * Clears the allowed entries for URL validation.
     * This makes all URLs allowed.
     *
     * @public
     */
    oURLListValidator.clear = function () {
      aAllowedEntries = [];
    };

    /**
     * Adds an allowed entry.
     *
     * Note:
     * Adding the first entry to the list of allowed entries will disallow all URLs but the ones matching the newly added entry.
     *
     * <b>Note</b>:
     * It is strongly recommended to set a path only in combination with an origin (never set a path alone).
     * There's almost no case where checking only the path of a URL would allow to ensure its validity.
     *
     * @param {string} [protocol] The protocol of the URL, can be falsy to allow all protocols for an entry e.g. "", "http", "mailto"
     * @param {string} [host] The host of the URL, can be falsy to allow all hosts. A wildcard asterisk can be set at the beginning, e.g. "examples.com", "*.example.com"
     * @param {string} [port] The port of the URL, can be falsy to allow all ports, e.g. "", "8080"
     * @param {string} [path] the path of the URL, e.g. "/my-news". Can be falsy to allow all paths. A wildcard asterisk can be set at the end to ensure a path starts with the given string, e.g. "/my-example*".
     * 	When using wildcards, make sure to only provide normalized URLs to the validate function in order to mitigate the risk of path traversal attacks.
     * @public
     */
    oURLListValidator.add = function (protocol, host, port, path) {
      var oEntry = this._createEntry(protocol, host, port, path);
      aAllowedEntries.push(oEntry);
    };

    /**
     * Deletes an entry from the allowed entries.
     *
     * Note:
     * Deleting the last entry from the list of allowed entries will allow all URLs.
     *
     * @param {module:sap/base/security/URLListValidator.Entry} oEntry The entry to be deleted
     * @private
     */
    oURLListValidator._delete = function (oEntry) {
      aAllowedEntries.splice(aAllowedEntries.indexOf(oEntry), 1);
    };

    /**
     * Gets the list of allowed entries.
     *
     * @returns {module:sap/base/security/URLListValidator.Entry[]} The allowed entries
     * @public
     */
    oURLListValidator.entries = function () {
      return aAllowedEntries.slice();
    };

    /**
     * Validates a URL. Check if it's not a script or other security issue.
     *
     * <b>Note</b>:
     * It is strongly recommended to validate only absolute, normalized URLs. There's almost no case
     * where checking only the path of a URL would allow to ensure its validity.
     * For compatibility reasons, this API does not normalize URLs and cannot automatically resolve URLs relative to
     * <code>document.baseURI</code>, but callers should do so. In that case, and when the
     * allow list is not empty, an entry for the origin of <code>document.baseURI</code>
     * must be added to the allow list.
     *
     * Any measures to mitigate path traversal or similar attack vectors must be taken by the caller, e.g. by using the
     * {@link https://developer.mozilla.org/docs/Web/API/URL URL} API to normalize the URL beforehand.
     *
     * <h3>Details</h3>
     * Splits the given URL into components and checks for allowed characters according to RFC 3986:
     *
     * <pre>
     * authority     = [ userinfo "@" ] host [ ":" port ]
     * userinfo      = *( unreserved / pct-encoded / sub-delims / ":" )
     * host          = IP-literal / IPv4address / reg-name
     *
     * IP-literal    = "[" ( IPv6address / IPvFuture  ) "]"
     * IPvFuture     = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )
     * IPv6address   =                            6( h16 ":" ) ls32
     *               /                       "::" 5( h16 ":" ) ls32
     *               / [               h16 ] "::" 4( h16 ":" ) ls32
     *               / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
     *               / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
     *               / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
     *               / [ *4( h16 ":" ) h16 ] "::"              ls32
     *               / [ *5( h16 ":" ) h16 ] "::"              h16
     *               / [ *6( h16 ":" ) h16 ] "::"
     * ls32          = ( h16 ":" h16 ) / IPv4address
     *               ; least-significant 32 bits of address
     * h16           = 1*4HEXDIG
    	 *               ; 16 bits of address represented in hexadecimal
    	 *
     * IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet
     * dec-octet     = DIGIT                 ; 0-9
     *               / %x31-39 DIGIT         ; 10-99
     *               / "1" 2DIGIT            ; 100-199
     *               / "2" %x30-34 DIGIT     ; 200-249
     *               / "25" %x30-35          ; 250-255
     *
     * reg-name      = *( unreserved / pct-encoded / sub-delims )
     *
     * pct-encoded   = "%" HEXDIG HEXDIG
     * reserved      = gen-delims / sub-delims
     * gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"
     * sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *               / "*" / "+" / "," / ";" / "="
     * unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     * pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *
     * path          = path-abempty    ; begins with "/" or is empty
     *               / path-absolute   ; begins with "/" but not "//"
     *               / path-noscheme   ; begins with a non-colon segment
     *               / path-rootless   ; begins with a segment
     *               / path-empty      ; zero characters
     *
     * path-abempty  = *( "/" segment )
     * path-absolute = "/" [ segment-nz *( "/" segment ) ]
     * path-noscheme = segment-nz-nc *( "/" segment )
     * path-rootless = segment-nz *( "/" segment )
     * path-empty    = 0<pchar>
     * segment       = *pchar
     * segment-nz    = 1*pchar
     * segment-nz-nc = 1*( unreserved / pct-encoded / sub-delims / "@" )
     *               ; non-zero-length segment without any colon ":"
     *
     * query         = *( pchar / "/" / "?" )
     *
     * fragment      = *( pchar / "/" / "?" )
     * </pre>
     *
     * For the hostname component, we are checking for valid DNS hostnames according to RFC 952 / RFC 1123:
     *
     * <pre>
     * hname         = name *("." name)
     * name          = let-or-digit ( *( let-or-digit-or-hyphen ) let-or-digit )
     * </pre>
     *
     *
     * When the URI uses the protocol 'mailto:', the address part is additionally checked
     * against the most commonly used parts of RFC 6068:
     *
     * <pre>
     * mailtoURI     = "mailto:" [ to ] [ hfields ]
     * to            = addr-spec *("," addr-spec )
     * hfields       = "?" hfield *( "&" hfield )
     * hfield        = hfname "=" hfvalue
     * hfname        = *qchar
     * hfvalue       = *qchar
     * addr-spec     = local-part "@" domain
     * local-part    = dot-atom-text              // not accepted: quoted-string
     * domain        = dot-atom-text              // not accepted: "[" *dtext-no-obs "]"
     * dtext-no-obs  = %d33-90 / ; Printable US-ASCII
     *                 %d94-126  ; characters not including
     *                           ; "[", "]", or "\"
     * qchar         = unreserved / pct-encoded / some-delims
     * some-delims   = "!" / "$" / "'" / "(" / ")" / "*"
     *               / "+" / "," / ";" / ":" / "@"
     *
     * Note:
     * A number of characters that can appear in &lt;addr-spec> MUST be
     * percent-encoded.  These are the characters that cannot appear in
     * a URI according to [STD66] as well as "%" (because it is used for
     * percent-encoding) and all the characters in gen-delims except "@"
     * and ":" (i.e., "/", "?", "#", "[", and "]").  Of the characters
     * in sub-delims, at least the following also have to be percent-
     * encoded: "&", ";", and "=".  Care has to be taken both when
     * encoding as well as when decoding to make sure these operations
     * are applied only once.
     *
     * </pre>
     *
     * When a list of allowed entries has been configured using {@link #add},
     * any URL that passes the syntactic checks above, additionally will be tested against
     * the content of this list.
     *
     * @param {string} sUrl URL to be validated
     * @return {boolean} true if valid, false if not valid
     * @public
     */
    oURLListValidator.validate = function (sUrl) {
      // Test for not allowed whitespaces
      if (typeof sUrl === "string") {
        if (rCheckWhitespaces.test(sUrl)) {
          return false;
        }
      }

      // for 'special' URLs without a given base URL, the whatwg spec allows any number of slashes.
      // As the rBasicUrl regular expression cannot handle 'special' URLs, the URL is modified upfront,
      // if it wouldn't be recognized by the regex.
      // See https://url.spec.whatwg.org/#scheme-state (case 2.6.)
      var result = rSpecialSchemeURLs.exec(sUrl);
      if (result && !/^[\/\\]{2}/.test(result[2])) {
        sUrl = result[1] + "//" + result[2];
      }
      result = rBasicUrl.exec(sUrl);
      if (!result) {
        return false;
      }
      var sProtocol = result[1],
        sBody = result[2],
        sHost = result[3],
        sPort = result[4],
        sPath = result[5],
        sQuery = result[6],
        sHash = result[7];

      // protocol
      if (sProtocol) {
        sProtocol = sProtocol.toUpperCase();
        if (aAllowedEntries.length <= 0) {
          // no allowed entries -> check for default protocols
          if (!/^(https?|ftp)/i.test(sProtocol)) {
            return false;
          }
        }
      }

      // Host -> validity check for IP address or hostname
      if (sHost) {
        if (rCheckIPv4.test(sHost)) {
          if (!rCheckValidIPv4.test(sHost)) {
            //invalid ipv4 address
            return false;
          }
        } else if (rCheckIPv6.test(sHost)) {
          if (!rCheckValidIPv6.test(sHost)) {
            //invalid ipv6 address
            return false;
          }
        } else if (!rCheckHostName.test(sHost)) {
          // invalid host name
          return false;
        }
        sHost = sHost.toUpperCase();
      }

      // Path -> split for "/" and check if forbidden characters exist
      if (sPath) {
        if (sProtocol === "MAILTO") {
          var aAddresses = sBody.split(",");
          for (var i = 0; i < aAddresses.length; i++) {
            if (!rCheckMail.test(aAddresses[i])) {
              // forbidden character found
              return false;
            }
          }
        } else {
          var aComponents = sPath.split("/");
          for (var i = 0; i < aComponents.length; i++) {
            if (!rCheckPath.test(aComponents[i])) {
              // forbidden character found
              return false;
            }
          }
        }
      }

      // query
      if (sQuery) {
        if (!rCheckQuery.test(sQuery)) {
          // forbidden character found
          return false;
        }
      }

      // hash
      if (sHash) {
        if (!rCheckFragment.test(sHash)) {
          // forbidden character found
          return false;
        }
      }

      //filter allowed entries
      if (aAllowedEntries.length > 0) {
        var bFound = false;
        for (var i = 0; i < aAllowedEntries.length; i++) {
          if (!sProtocol || !aAllowedEntries[i].protocol || sProtocol == aAllowedEntries[i].protocol) {
            // protocol OK
            var bOk = false;
            if (sHost && aAllowedEntries[i].host && /^\*/.test(aAllowedEntries[i].host)) {
              // check for wildcard search at begin
              if (!aAllowedEntries[i]._hostRegexp) {
                var sHostEscaped = aAllowedEntries[i].host.slice(1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                aAllowedEntries[i]._hostRegexp = RegExp(sHostEscaped + "$");
              }
              var rFilter = aAllowedEntries[i]._hostRegexp;
              if (rFilter.test(sHost)) {
                bOk = true;
              }
            } else if (!sHost || !aAllowedEntries[i].host || sHost == aAllowedEntries[i].host) {
              bOk = true;
            }
            if (bOk) {
              // host OK
              if (!sHost && !sPort || !aAllowedEntries[i].port || sPort == aAllowedEntries[i].port) {
                // port OK
                if (aAllowedEntries[i].path && /\*$/.test(aAllowedEntries[i].path)) {
                  // check for wildcard search at end
                  if (!aAllowedEntries[i]._pathRegexp) {
                    var sPathEscaped = aAllowedEntries[i].path.slice(0, -1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                    aAllowedEntries[i]._pathRegexp = RegExp("^" + sPathEscaped);
                  }
                  var rFilter = aAllowedEntries[i]._pathRegexp;
                  if (rFilter.test(sPath)) {
                    bFound = true;
                  }
                } else if (!aAllowedEntries[i].path || sPath == aAllowedEntries[i].path) {
                  // path OK
                  bFound = true;
                }
              }
            }
          }
          if (bFound) {
            break;
          }
        }
        if (!bFound) {
          return false;
        }
      }
      return true;
    };

    var cajaHtmlSanitizer = {};

    var hasRequiredCajaHtmlSanitizer;

    function requireCajaHtmlSanitizer () {
    	if (hasRequiredCajaHtmlSanitizer) return cajaHtmlSanitizer;
    	hasRequiredCajaHtmlSanitizer = 1;
    	(function() {
    	/* Copyright Google Inc.
    	 * Licensed under the Apache Licence Version 2.0
    	 * Autogenerated at Tue May 22 10:18:21 PDT 2012
    	 * \@overrides window
    	 * \@provides cssSchema, CSS_PROP_BIT_QUANTITY, CSS_PROP_BIT_HASH_VALUE, CSS_PROP_BIT_NEGATIVE_QUANTITY, CSS_PROP_BIT_QSTRING_CONTENT, CSS_PROP_BIT_QSTRING_URL, CSS_PROP_BIT_HISTORY_INSENSITIVE, CSS_PROP_BIT_Z_INDEX, CSS_PROP_BIT_ALLOWED_IN_LINK */
    	/**
    	 * @const
    	 * @type {number}
    	 */
    	var CSS_PROP_BIT_QUANTITY = 1;
    	/**
    	 * @const
    	 * @type {number}
    	 */
    	var CSS_PROP_BIT_HASH_VALUE = 2;
    	/**
    	 * @const
    	 * @type {number}
    	 */
    	var CSS_PROP_BIT_NEGATIVE_QUANTITY = 4;
    	/**
    	 * @const
    	 * @type {number}
    	 */
    	var CSS_PROP_BIT_QSTRING_CONTENT = 8;
    	/**
    	 * @const
    	 * @type {number}
    	 */
    	var CSS_PROP_BIT_QSTRING_URL = 16;
    	/**
    	 * @const
    	 * @type {number}
    	 */
    	var CSS_PROP_BIT_Z_INDEX = 64;
    	/**
    	 * @const
    	 * @type {number}
    	 */
    	var CSS_PROP_BIT_ALLOWED_IN_LINK = 128;
    	var cssSchema = (function () {
    	    var s = [
    	      'rgb(?:\\(\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)|a\\(\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0(?:\\.\\d+)?|\\.\\d+|1(?:\\.0+)?|0|\\d+(?:\\.\\d+)?%)) *\\)'
    	    ], c = [ /^ *$/i, RegExp('^ *(?:\\s*' + s[ 0 ] + '|(?:\\s*' + s[ 0 ] +
    	        ')?)+ *$', 'i'), RegExp('^ *\\s*' + s[ 0 ] + ' *$', 'i'),
    	      RegExp('^ *\\s*' + s[ 0 ] + '\\s*' + s[ 0 ] + ' *$', 'i') ], L = [ [
    	        'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige',
    	        'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown',
    	        'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral',
    	        'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue',
    	        'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkkhaki',
    	        'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred',
    	        'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray',
    	        'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray',
    	        'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia',
    	        'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green',
    	        'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory',
    	        'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon',
    	        'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow',
    	        'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
    	        'lightskyblue', 'lightslategray', 'lightsteelblue', 'lightyellow',
    	        'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine',
    	        'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
    	        'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
    	        'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose',
    	        'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab',
    	        'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen',
    	        'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru',
    	        'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown',
    	        'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
    	        'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray',
    	        'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato',
    	        'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow',
    	        'yellowgreen' ], [ 'all-scroll', 'col-resize', 'crosshair', 'default',
    	        'e-resize', 'hand', 'help', 'move', 'n-resize', 'ne-resize', 'no-drop',
    	        'not-allowed', 'nw-resize', 'pointer', 'progress', 'row-resize',
    	        's-resize', 'se-resize', 'sw-resize', 'text', 'vertical-text',
    	        'w-resize', 'wait' ], [ '-moz-inline-box', '-moz-inline-stack',
    	        'block', 'inline', 'inline-block', 'inline-table', 'list-item',
    	        'run-in', 'table', 'table-caption', 'table-cell', 'table-column',
    	        'table-column-group', 'table-footer-group', 'table-header-group',
    	        'table-row', 'table-row-group' ], [ 'armenian', 'circle', 'decimal',
    	        'decimal-leading-zero', 'disc', 'georgian', 'lower-alpha',
    	        'lower-greek', 'lower-latin', 'lower-roman', 'square', 'upper-alpha',
    	        'upper-latin', 'upper-roman' ], [ '100', '200', '300', '400', '500',
    	        '600', '700', '800', '900', 'bold', 'bolder', 'lighter' ], [
    	        'condensed', 'expanded', 'extra-condensed', 'extra-expanded',
    	        'narrower', 'semi-condensed', 'semi-expanded', 'ultra-condensed',
    	        'ultra-expanded', 'wider' ], [ 'behind', 'center-left', 'center-right',
    	        'far-left', 'far-right', 'left-side', 'leftwards', 'right-side',
    	        'rightwards' ], [ 'large', 'larger', 'small', 'smaller', 'x-large',
    	        'x-small', 'xx-large', 'xx-small' ], [ '-moz-pre-wrap', '-o-pre-wrap',
    	        '-pre-wrap', 'nowrap', 'pre', 'pre-line', 'pre-wrap' ], [ 'dashed',
    	        'dotted', 'double', 'groove', 'outset', 'ridge', 'solid' ], [
    	        'baseline', 'middle', 'sub', 'super', 'text-bottom', 'text-top' ], [
    	        'caption', 'icon', 'menu', 'message-box', 'small-caption', 'status-bar'
    	      ], [ 'fast', 'faster', 'slow', 'slower', 'x-fast', 'x-slow' ], [ 'above',
    	        'below', 'higher', 'level', 'lower' ], [ 'border-box', 'contain',
    	        'content-box', 'cover', 'padding-box' ], [ 'cursive', 'fantasy',
    	        'monospace', 'sans-serif', 'serif' ], [ 'loud', 'silent', 'soft',
    	        'x-loud', 'x-soft' ], [ 'no-repeat', 'repeat-x', 'repeat-y', 'round',
    	        'space' ], [ 'blink', 'line-through', 'overline', 'underline' ], [
    	        'high', 'low', 'x-high', 'x-low' ], [ 'absolute', 'relative', 'static'
    	      ], [ 'capitalize', 'lowercase', 'uppercase' ], [ 'child', 'female',
    	        'male' ], [ 'bidi-override', 'embed' ], [ 'bottom', 'top' ], [ 'clip',
    	        'ellipsis' ], [ 'continuous', 'digits' ], [ 'hide', 'show' ], [
    	        'inside', 'outside' ], [ 'italic', 'oblique' ], [ 'left', 'right' ], [
    	        'ltr', 'rtl' ], [ 'no-content', 'no-display' ], [ 'suppress',
    	        'unrestricted' ], [ 'thick', 'thin' ], [ ',' ], [ '/' ], [ 'always' ],
    	      [ 'auto' ], [ 'avoid' ], [ 'both' ], [ 'break-word' ], [ 'center' ], [
    	        'code' ], [ 'collapse' ], [ 'fixed' ], [ 'hidden' ], [ 'inherit' ], [
    	        'inset' ], [ 'invert' ], [ 'justify' ], [ 'local' ], [ 'medium' ], [
    	        'mix' ], [ 'none' ], [ 'normal' ], [ 'once' ], [ 'repeat' ], [ 'scroll'
    	      ], [ 'separate' ], [ 'small-caps' ], [ 'spell-out' ], [ 'transparent' ],
    	      [ 'visible' ],
    	      // ##### BEGIN: MODIFIED BY SAP
    	      [ 'flex', 'inline-flex', 'grid', 'inline-grid', 'flow-root', 'contents' ], [ 'initial', 'revert', 'revert-layer', 'unset' ]
    	      // ##### END: MODIFIED BY SAP
    	    ];
    	    return {
    	      '-moz-border-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 36 ] ]
    	      },
    	      '-moz-border-radius-bottomleft': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-moz-border-radius-bottomright': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-moz-border-radius-topleft': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-moz-border-radius-topright': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-moz-box-shadow': {
    	        'cssExtra': c[ 1 ],
    	        'cssAlternates': [ 'boxShadow' ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      '-moz-opacity': {
    	        'cssPropBits': 1,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      '-moz-outline': {
    	        'cssExtra': c[ 3 ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
    	            49 ], L[ 52 ], L[ 54 ] ]
    	      },
    	      '-moz-outline-color': {
    	        'cssExtra': c[ 2 ],
    	        'cssPropBits': 2,
    	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 49 ] ]
    	      },
    	      '-moz-outline-style': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      '-moz-outline-width': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      '-o-text-overflow': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 25 ] ]
    	      },
    	      '-webkit-border-bottom-left-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-webkit-border-bottom-right-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-webkit-border-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 36 ] ]
    	      },
    	      '-webkit-border-radius-bottom-left': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-webkit-border-radius-bottom-right': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-webkit-border-radius-top-left': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-webkit-border-radius-top-right': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-webkit-border-top-left-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-webkit-border-top-right-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      '-webkit-box-shadow': {
    	        'cssExtra': c[ 1 ],
    	        'cssAlternates': [ 'boxShadow' ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      'azimuth': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 6 ], L[ 30 ], L[ 42 ], L[ 47 ] ]
    	      },
    	      'background': {
    	        'cssExtra': RegExp('^ *(?:\\s*' + s[ 0 ] + '){0,2} *$', 'i'),
    	        'cssPropBits': 23,
    	        'cssLitGroup': [ L[ 0 ], L[ 14 ], L[ 17 ], L[ 24 ], L[ 30 ], L[ 35 ],
    	          L[ 36 ], L[ 38 ], L[ 42 ], L[ 45 ], L[ 47 ], L[ 51 ], L[ 54 ], L[ 57
    	          ], L[ 58 ], L[ 62 ] ]
    	      },
    	      'background-attachment': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 35 ], L[ 45 ], L[ 51 ], L[ 58 ] ]
    	      },
    	      'background-color': {
    	        'cssExtra': c[ 2 ],
    	        'cssPropBits': 130,
    	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
    	      },
    	      'background-image': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 16,
    	        'cssLitGroup': [ L[ 35 ], L[ 54 ] ]
    	      },
    	      'background-position': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 24 ], L[ 30 ], L[ 35 ], L[ 42 ] ]
    	      },
    	      'background-repeat': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 17 ], L[ 35 ], L[ 57 ] ]
    	      },
    	      'border': {
    	        'cssExtra': c[ 3 ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
    	            52 ], L[ 54 ], L[ 62 ] ]
    	      },
    	      'border-bottom': {
    	        'cssExtra': c[ 3 ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
    	            52 ], L[ 54 ], L[ 62 ] ]
    	      },
    	      'border-bottom-color': {
    	        'cssExtra': c[ 2 ],
    	        'cssPropBits': 2,
    	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
    	      },
    	      'border-bottom-left-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      'border-bottom-right-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      'border-bottom-style': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      'border-bottom-width': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      'border-collapse': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 44 ], L[ 47 ], L[ 59 ] ]
    	      },
    	      'border-color': {
    	        'cssExtra': RegExp('^ *(?:\\s*' + s[ 0 ] + '){1,4} *$', 'i'),
    	        'cssPropBits': 2,
    	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
    	      },
    	      'border-left': {
    	        'cssExtra': c[ 3 ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
    	            52 ], L[ 54 ], L[ 62 ] ]
    	      },
    	      'border-left-color': {
    	        'cssExtra': c[ 2 ],
    	        'cssPropBits': 2,
    	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
    	      },
    	      'border-left-style': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      'border-left-width': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      'border-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 36 ] ]
    	      },
    	      'border-right': {
    	        'cssExtra': c[ 3 ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
    	            52 ], L[ 54 ], L[ 62 ] ]
    	      },
    	      'border-right-color': {
    	        'cssExtra': c[ 2 ],
    	        'cssPropBits': 2,
    	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
    	      },
    	      'border-right-style': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      'border-right-width': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      'border-spacing': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'border-style': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      'border-top': {
    	        'cssExtra': c[ 3 ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
    	            52 ], L[ 54 ], L[ 62 ] ]
    	      },
    	      'border-top-color': {
    	        'cssExtra': c[ 2 ],
    	        'cssPropBits': 2,
    	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
    	      },
    	      'border-top-left-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      'border-top-right-radius': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5
    	      },
    	      'border-top-style': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      'border-top-width': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      'border-width': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      'bottom': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'box-shadow': {
    	        'cssExtra': c[ 1 ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      'caption-side': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 24 ], L[ 47 ] ]
    	      },
    	      'clear': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 30 ], L[ 40 ], L[ 47 ], L[ 54 ] ]
    	      },
    	      'clip': {
    	        'cssExtra':
    	        /^ *\s*rect\(\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto)\s*,\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto)\s*,\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto)\s*,\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto) *\) *$/i,
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'color': {
    	        'cssExtra': c[ 2 ],
    	        'cssPropBits': 130,
    	        'cssLitGroup': [ L[ 0 ], L[ 47 ] ]
    	      },
    	      'content': { 'cssPropBits': 0 },
    	      'counter-increment': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
    	      },
    	      'counter-reset': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
    	      },
    	      'cue': {
    	        'cssPropBits': 16,
    	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
    	      },
    	      'cue-after': {
    	        'cssPropBits': 16,
    	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
    	      },
    	      'cue-before': {
    	        'cssPropBits': 16,
    	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
    	      },
    	      'cursor': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 144,
    	        'cssLitGroup': [ L[ 1 ], L[ 35 ], L[ 38 ], L[ 47 ] ]
    	      },
    	      'direction': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 31 ], L[ 47 ] ]
    	      },
    	      'display': {
    	        'cssPropBits': 32,
    	        // ##### BEGIN: MODIFIED BY SAP
    	        'cssLitGroup': [ L[ 2 ], L[ 47 ], L[ 54 ], L[ 64 ], L[ 65 ] ]
    	        // ##### END: MODIFIED BY SAP
    	      },
    	      'elevation': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 13 ], L[ 47 ] ]
    	      },
    	      'empty-cells': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 27 ], L[ 47 ] ]
    	      },
    	      'filter': {
    	        'cssExtra':
    	        /^ *(?:\s*alpha\(\s*opacity\s*=\s*(?:0|\d+(?:\.\d+)?%|[+\-]?\d+(?:\.\d+)?) *\))+ *$/i,
    	        'cssPropBits': 32
    	      },
    	      'float': {
    	        'cssAlternates': [ 'cssFloat', 'styleFloat' ],
    	        'cssPropBits': 32,
    	        'cssLitGroup': [ L[ 30 ], L[ 47 ], L[ 54 ] ]
    	      },
    	      'font': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 9,
    	        'cssLitGroup': [ L[ 4 ], L[ 7 ], L[ 11 ], L[ 15 ], L[ 29 ], L[ 35 ], L[
    	            36 ], L[ 47 ], L[ 52 ], L[ 55 ], L[ 60 ] ]
    	      },
    	      'font-family': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 8,
    	        'cssLitGroup': [ L[ 15 ], L[ 35 ], L[ 47 ] ]
    	      },
    	      'font-size': {
    	        'cssPropBits': 1,
    	        'cssLitGroup': [ L[ 7 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      'font-stretch': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 5 ], L[ 55 ] ]
    	      },
    	      'font-style': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 29 ], L[ 47 ], L[ 55 ] ]
    	      },
    	      'font-variant': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 47 ], L[ 55 ], L[ 60 ] ]
    	      },
    	      'font-weight': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 4 ], L[ 47 ], L[ 55 ] ],
    	        // ##### BEGIN: MODIFIED BY SAP
    	        'cssLitNumeric': true
    	        // ##### END: MODIFIED BY SAP
    	      },
    	      'height': {
    	        'cssPropBits': 37,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'left': {
    	        'cssPropBits': 37,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'letter-spacing': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ], L[ 55 ] ]
    	      },
    	      'line-height': {
    	        'cssPropBits': 1,
    	        'cssLitGroup': [ L[ 47 ], L[ 55 ] ]
    	      },
    	      'list-style': {
    	        'cssPropBits': 16,
    	        'cssLitGroup': [ L[ 3 ], L[ 28 ], L[ 47 ], L[ 54 ] ]
    	      },
    	      'list-style-image': {
    	        'cssPropBits': 16,
    	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
    	      },
    	      'list-style-position': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 28 ], L[ 47 ] ]
    	      },
    	      'list-style-type': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 3 ], L[ 47 ], L[ 54 ] ]
    	      },
    	      'margin': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'margin-bottom': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'margin-left': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'margin-right': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'margin-top': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'max-height': {
    	        'cssPropBits': 1,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ], L[ 54 ] ]
    	      },
    	      'max-width': {
    	        'cssPropBits': 1,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ], L[ 54 ] ]
    	      },
    	      'min-height': {
    	        'cssPropBits': 1,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'min-width': {
    	        'cssPropBits': 1,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'opacity': {
    	        'cssPropBits': 33,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'outline': {
    	        'cssExtra': c[ 3 ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
    	            49 ], L[ 52 ], L[ 54 ] ]
    	      },
    	      'outline-color': {
    	        'cssExtra': c[ 2 ],
    	        'cssPropBits': 2,
    	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 49 ] ]
    	      },
    	      'outline-style': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      'outline-width': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      'overflow': {
    	        'cssPropBits': 32,
    	        'cssLitGroup': [ L[ 38 ], L[ 46 ], L[ 47 ], L[ 58 ], L[ 63 ] ]
    	      },
    	      'overflow-x': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 32 ], L[ 38 ], L[ 46 ], L[ 58 ], L[ 63 ] ]
    	      },
    	      'overflow-y': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 32 ], L[ 38 ], L[ 46 ], L[ 58 ], L[ 63 ] ]
    	      },
    	      'padding': {
    	        'cssPropBits': 1,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'padding-bottom': {
    	        'cssPropBits': 33,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'padding-left': {
    	        'cssPropBits': 33,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'padding-right': {
    	        'cssPropBits': 33,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'padding-top': {
    	        'cssPropBits': 33,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'page-break-after': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 30 ], L[ 37 ], L[ 38 ], L[ 39 ], L[ 47 ] ]
    	      },
    	      'page-break-before': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 30 ], L[ 37 ], L[ 38 ], L[ 39 ], L[ 47 ] ]
    	      },
    	      'page-break-inside': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 38 ], L[ 39 ], L[ 47 ] ]
    	      },
    	      'pause': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'pause-after': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'pause-before': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'pitch': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 19 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      'pitch-range': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'play-during': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 16,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ], L[ 53 ], L[ 54 ], L[ 57 ] ]
    	      },
    	      'position': {
    	        'cssPropBits': 32,
    	        'cssLitGroup': [ L[ 20 ], L[ 47 ] ]
    	      },
    	      'quotes': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
    	      },
    	      'richness': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'right': {
    	        'cssPropBits': 37,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'speak': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 47 ], L[ 54 ], L[ 55 ], L[ 61 ] ]
    	      },
    	      'speak-header': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 37 ], L[ 47 ], L[ 56 ] ]
    	      },
    	      'speak-numeral': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 26 ], L[ 47 ] ]
    	      },
    	      'speak-punctuation': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 43 ], L[ 47 ], L[ 54 ] ]
    	      },
    	      'speech-rate': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 12 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      'stress': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'table-layout': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 38 ], L[ 45 ], L[ 47 ] ]
    	      },
    	      'text-align': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 30 ], L[ 42 ], L[ 47 ], L[ 50 ] ]
    	      },
    	      'text-decoration': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 18 ], L[ 47 ], L[ 54 ] ]
    	      },
    	      // ##### BEGIN: MODIFIED BY SAP
    	      'text-decoration-line': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 18 ], L[ 47 ], L[ 54 ] ]
    	      },
    	      // ##### END: MODIFIED BY SAP
    	      'text-indent': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ] ]
    	      },
    	      'text-overflow': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 25 ] ]
    	      },
    	      'text-shadow': {
    	        'cssExtra': c[ 1 ],
    	        'cssPropBits': 7,
    	        'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
    	      },
    	      'text-transform': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 21 ], L[ 47 ], L[ 54 ] ]
    	      },
    	      'text-wrap': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 33 ], L[ 54 ], L[ 55 ] ]
    	      },
    	      'top': {
    	        'cssPropBits': 37,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'unicode-bidi': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 23 ], L[ 47 ], L[ 55 ] ]
    	      },
    	      'vertical-align': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 10 ], L[ 24 ], L[ 47 ] ]
    	      },
    	      'visibility': {
    	        'cssPropBits': 32,
    	        'cssLitGroup': [ L[ 44 ], L[ 46 ], L[ 47 ], L[ 63 ] ]
    	      },
    	      'voice-family': {
    	        'cssExtra': c[ 0 ],
    	        'cssPropBits': 8,
    	        'cssLitGroup': [ L[ 22 ], L[ 35 ], L[ 47 ] ]
    	      },
    	      'volume': {
    	        'cssPropBits': 1,
    	        'cssLitGroup': [ L[ 16 ], L[ 47 ], L[ 52 ] ]
    	      },
    	      'white-space': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 8 ], L[ 47 ], L[ 55 ] ]
    	      },
    	      'width': {
    	        'cssPropBits': 33,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'word-spacing': {
    	        'cssPropBits': 5,
    	        'cssLitGroup': [ L[ 47 ], L[ 55 ] ]
    	      },
    	      'word-wrap': {
    	        'cssPropBits': 0,
    	        'cssLitGroup': [ L[ 41 ], L[ 55 ] ]
    	      },
    	      'z-index': {
    	        'cssPropBits': 69,
    	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
    	      },
    	      'zoom': {
    	        'cssPropBits': 1,
    	        'cssLitGroup': [ L[ 55 ] ]
    	      }
    	    };
    	  })();
    	if (typeof window !== 'undefined') {
    	  window['cssSchema'] = cssSchema;
    	}
    	// Copyright (C) 2011 Google Inc.
    	//
    	// Licensed under the Apache License, Version 2.0 (the "License");
    	// you may not use this file except in compliance with the License.
    	// You may obtain a copy of the License at
    	//
    	//      http://www.apache.org/licenses/LICENSE-2.0
    	//
    	// Unless required by applicable law or agreed to in writing, software
    	// distributed under the License is distributed on an "AS IS" BASIS,
    	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    	// See the License for the specific language governing permissions and
    	// limitations under the License.

    	/**
    	 * A lexical scannar for CSS3 as defined at http://www.w3.org/TR/css3-syntax .
    	 *
    	 * @author Mike Samuel <mikesamuel@gmail.com>
    	 * \@provides lexCss, decodeCss
    	 * \@overrides window
    	 */

    	var lexCss;
    	var decodeCss;

    	(function () {

    	  /**
    	   * Decodes an escape sequence as specified in CSS3 section 4.1.
    	   * http://www.w3.org/TR/css3-syntax/#characters
    	   * @private
    	   */
    	  function decodeCssEscape(s) {
    	    var i = parseInt(s.substring(1), 16);
    	    // If parseInt didn't find a hex diigt, it returns NaN so return the
    	    // escaped character.
    	    // Otherwise, parseInt will stop at the first non-hex digit so there's no
    	    // need to worry about trailing whitespace.
    	    if (i > 0xffff) {
    	      // A supplemental codepoint.
    	      return i -= 0x10000,
    	        String.fromCharCode(
    	            0xd800 + (i >> 10),
    	            0xdc00 + (i & 0x3FF));
    	    } else if (i == i) {
    	      return String.fromCharCode(i);
    	    } else if (s[1] < ' ') {
    	      // "a backslash followed by a newline is ignored".
    	      return '';
    	    } else {
    	      return s[1];
    	    }
    	  }

    	  /**
    	   * Returns an equivalent CSS string literal given plain text: foo -> "foo".
    	   * @private
    	   */
    	  function escapeCssString(s, replacer) {
    	    return '"' + s.replace(/[\u0000-\u001f\\\"<>]/g, replacer) + '"';
    	  }

    	  /**
    	   * Maps chars to CSS escaped equivalents: "\n" -> "\\a ".
    	   * @private
    	   */
    	  function escapeCssStrChar(ch) {
    	    return cssStrChars[ch]
    	        || (cssStrChars[ch] = '\\' + ch.charCodeAt(0).toString(16) + ' ');
    	  }

    	  /**
    	   * Maps chars to URI escaped equivalents: "\n" -> "%0a".
    	   * @private
    	   */
    	  function escapeCssUrlChar(ch) {
    	    return cssUrlChars[ch]
    	        || (cssUrlChars[ch] = (ch < '\x10' ? '%0' : '%')
    	            + ch.charCodeAt(0).toString(16));
    	  }

    	  /**
    	   * Mapping of CSS special characters to escaped equivalents.
    	   * @private
    	   */
    	  var cssStrChars = {
    	    '\\': '\\\\'
    	  };

    	  /**
    	   * Mapping of CSS special characters to URL-escaped equivalents.
    	   * @private
    	   */
    	  var cssUrlChars = {
    	    '\\': '%5c'
    	  };

    	  // The comments below are copied from the CSS3 module syntax at
    	  // http://www.w3.org/TR/css3-syntax .
    	  // These string constants minify out when this is run-through closure
    	  // compiler.
    	  // Rules that have been adapted have comments prefixed with "Diff:", and
    	  // where rules have been combined to avoid back-tracking in the regex engine
    	  // or to work around limitations, there is a comment prefixed with
    	  // "NewRule:".

    	  // In the below, we assume CRLF and CR have been normalize to CR.

    	  // wc  ::=  #x9 | #xA | #xC | #xD | #x20
    	  var WC = '[\\t\\n\\f ]';
    	  // w  ::=  wc*
    	  var W = WC + '*';
    	  // nl  ::=  #xA | #xD #xA | #xD | #xC
    	  var NL = '[\\n\\f]';
    	  // nonascii  ::=  [#x80-#xD7FF#xE000-#xFFFD#x10000-#x10FFFF]
    	  // NewRule: Supplemental codepoints are represented as surrogate pairs in JS.
    	  var SURROGATE_PAIR = '[\\ud800-\\udbff][\\udc00-\\udfff]';
    	  var NONASCII = '[\\u0080-\\ud7ff\\ue000-\\ufffd]|' + SURROGATE_PAIR;
    	  // unicode  ::=  '\' [0-9a-fA-F]{1,6} wc?
    	  // NewRule: No point in having ESCAPE do (\\x|\\y)
    	  var UNICODE_TAIL = '[0-9a-fA-F]{1,6}' + WC + '?';
    	  // escape  ::=  unicode
    	  //           | '\' [#x20-#x7E#x80-#xD7FF#xE000-#xFFFD#x10000-#x10FFFF]
    	  // NewRule: Below we use escape tail to efficiently match an escape or a
    	  // line continuation so we can decode string content.
    	  var ESCAPE_TAIL = '(?:' + UNICODE_TAIL
    	      + '|[\\u0020-\\u007e\\u0080-\\ud7ff\\ue000\\ufffd]|'
    	      + SURROGATE_PAIR + ')';
    	  var ESCAPE = '\\\\' + ESCAPE_TAIL;
    	  // urlchar  ::=  [#x9#x21#x23-#x26#x28-#x7E] | nonascii | escape
    	  var URLCHAR = '(?:[\\t\\x21\\x23-\\x26\\x28-\\x5b\\x5d-\\x7e]|'
    	      + NONASCII + '|' + ESCAPE + ')';
    	  // stringchar  ::= urlchar | #x20 | '\' nl
    	  // We ignore mismatched surrogate pairs inside strings, so stringchar
    	  // simplifies to a non-(quote|newline|backslash) or backslash any.
    	  // Since we normalize CRLF to a single code-unit, there is no special
    	  // handling needed for '\\' + CRLF.
    	  var STRINGCHAR = '[^\'"\\n\\f\\\\]|\\\\[\\s\\S]';
    	  // string  ::=  '"' (stringchar | "'")* '"' | "'" (stringchar | '"')* "'"
    	  var STRING = '"(?:\'|' + STRINGCHAR + ')*"'
    	      + '|\'(?:\"|' + STRINGCHAR + ')*\'';
    	  // num  ::=  [0-9]+ | [0-9]* '.' [0-9]+
    	  // Diff: We attach signs to num tokens.
    	  var NUM = '[-+]?(?:[0-9]+(?:[.][0-9]+)?|[.][0-9]+)';
    	  // nmstart  ::=  [a-zA-Z] | '_' | nonascii | escape
    	  var NMSTART = '(?:[a-zA-Z_]|' + NONASCII + '|' + ESCAPE + ')';
    	  // nmchar  ::=  [a-zA-Z0-9] | '-' | '_' | nonascii | escape
    	  var NMCHAR = '(?:[a-zA-Z0-9_-]|' + NONASCII + '|' + ESCAPE + ')';
    	  // ident  ::=  '-'? nmstart nmchar*
    	  var IDENT = '-?' + NMSTART + NMCHAR + '*';

    	  // NewRule: union of IDENT, ATKEYWORD, HASH, but excluding #[0-9].
    	  var WORD_TERM = '(?:@?-?' + NMSTART + '|#)' + NMCHAR + '*';
    	  var NUMERIC_VALUE = NUM + '(?:%|' + IDENT + ')?';
    	  // URI  ::=  "url(" w (string | urlchar* ) w ")"
    	  var URI = 'url[(]' + W + '(?:' + STRING + '|' + URLCHAR + '*)' + W + '[)]';
    	  // UNICODE-RANGE  ::=  "U+" [0-9A-F?]{1,6} ('-' [0-9A-F]{1,6})?
    	  var UNICODE_RANGE = 'U[+][0-9A-F?]{1,6}(?:-[0-9A-F]{1,6})?';
    	  // CDO  ::=  "<\!--"
    	  var CDO = '<\!--';
    	  // CDC  ::=  "-->"
    	  var CDC = '-->';
    	  // S  ::=  wc+
    	  var S = WC + '+';
    	  // COMMENT  ::=  "/*" [^*]* '*'+ ([^/] [^*]* '*'+)* "/"
    	  // Diff: recognizes // comments.
    	  var COMMENT = '/(?:[*][^*]*[*]+(?:[^/][^*]*[*]+)*/|/[^\\n\\f]*)';
    	  // FUNCTION  ::=  ident '('
    	  // Diff: We exclude url explicitly.
    	  // TODO: should we be tolerant of "fn ("?
    	  // ##### BEGIN: MODIFIED BY SAP
    	  // Avoid risk of 'catastrophic backtracking' when unicode escapes are used
    	  // var FUNCTION = '(?!url[(])' + IDENT + '[(]';
    	  var FUNCTION = '(?!url[(])(?=(' + IDENT + '))\\1[(]';
    	  // NewRule: one rule for all the comparison operators.
    	  var CMP_OPS = '[~|^$*]=';
    	  // CHAR  ::=  any character not matched by the above rules, except for " or '
    	  // Diff: We exclude / and \ since they are handled above to prevent
    	  // /* without a following */ from combining when comments are concatenated.
    	  var CHAR = '[^"\'\\\\/]|/(?![/*])';
    	  // BOM  ::=  #xFEFF
    	  var BOM = '\\uFEFF';

    	  var CSS_TOKEN = new RegExp([
    	      BOM, UNICODE_RANGE, URI, FUNCTION, WORD_TERM, STRING, NUMERIC_VALUE,
    	      CDO, CDC, S, COMMENT, CMP_OPS, CHAR].join("|"), 'gi');

    	  /**
    	   * Decodes CSS escape sequences in a CSS string body.
    	   */
    	   decodeCss = function (css) {
    	     return css.replace(
    	         new RegExp('\\\\(?:' + ESCAPE_TAIL + '|' + NL + ')', 'g'),
    	         decodeCssEscape);
    	   };

    	  /**
    	   * Given CSS Text, returns an array of normalized tokens.
    	   * @param {string} cssText
    	   * @return {Array.<string>} tokens where all ignorable token sequences have
    	   *    been reduced to a single {@code " "} and all strings and
    	   *    {@code url(...)} tokens have been normalized to use double quotes as
    	   *    delimiters and to not otherwise contain double quotes.
    	   */
    	  lexCss = function (cssText) {
    	    cssText = '' + cssText;
    	    var tokens = cssText.replace(/\r\n?/g, '\n')  // Normalize CRLF & CR to LF.
    	        .match(CSS_TOKEN) || [];
    	    var j = 0;
    	    var last = ' ';
    	    for (var i = 0, n = tokens.length; i < n; ++i) {
    	      // Normalize all escape sequences.  We will have to re-escape some
    	      // codepoints in string and url(...) bodies but we already know the
    	      // boundaries.
    	      // We might mistakenly treat a malformed identifier like \22\20\22 as a
    	      // string, but that will not break any valid stylesheets since we requote
    	      // and re-escape in string below.
    	      var tok = decodeCss(tokens[i]);
    	      var len = tok.length;
    	      var cc = tok.charCodeAt(0);
    	      tok =
    	          // All strings should be double quoted, and the body should never
    	          // contain a double quote.
    	          (cc == '"'.charCodeAt(0) || cc == '\''.charCodeAt(0))
    	          ? escapeCssString(tok.substring(1, len - 1), escapeCssStrChar)
    	          // A breaking ignorable token should is replaced with a single space.
    	          : (cc == '/'.charCodeAt(0) && len > 1  // Comment.
    	             || tok == '\\' || tok == CDC || tok == CDO || tok == '\ufeff'
    	             // Characters in W.
    	             || cc <= ' '.charCodeAt(0))
    	          ? ' '
    	          // Make sure that all url(...)s are double quoted.
    	          : /url\(/i.test(tok)
    	          ? 'url(' + escapeCssString(
    	            tok.replace(
    	                new RegExp('^url\\(' + W + '["\']?|["\']?' + W + '\\)$', 'gi'),
    	                ''),
    	            escapeCssUrlChar)
    	            + ')'
    	          // Escapes in identifier like tokens will have been normalized above.
    	          : tok;
    	      // Merge adjacent space tokens.
    	      if (last != tok || tok != ' ') {
    	        tokens[j++] = last = tok;
    	      }
    	    }
    	    tokens.length = j;
    	    return tokens;
    	  };
    	})();

    	// Exports for closure compiler.
    	if (typeof window !== 'undefined') {
    	  window['lexCss'] = lexCss;
    	  window['decodeCss'] = decodeCss;
    	}
    	// Copyright (C) 2011 Google Inc.
    	//
    	// Licensed under the Apache License, Version 2.0 (the "License");
    	// you may not use this file except in compliance with the License.
    	// You may obtain a copy of the License at
    	//
    	//      http://www.apache.org/licenses/LICENSE-2.0
    	//
    	// Unless required by applicable law or agreed to in writing, software
    	// distributed under the License is distributed on an "AS IS" BASIS,
    	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    	// See the License for the specific language governing permissions and
    	// limitations under the License.

    	/**
    	 * @fileoverview
    	 * JavaScript support for client-side CSS sanitization.
    	 * The CSS property schema API is defined in CssPropertyPatterns.java which
    	 * is used to generate css-defs.js.
    	 *
    	 * @author mikesamuel@gmail.com
    	 * \@requires CSS_PROP_BIT_ALLOWED_IN_LINK
    	 * \@requires CSS_PROP_BIT_HASH_VALUE
    	 * \@requires CSS_PROP_BIT_NEGATIVE_QUANTITY
    	 * \@requires CSS_PROP_BIT_QSTRING_CONTENT
    	 * \@requires CSS_PROP_BIT_QSTRING_URL
    	 * \@requires CSS_PROP_BIT_QUANTITY
    	 * \@requires CSS_PROP_BIT_Z_INDEX
    	 * \@requires cssSchema
    	 * \@requires decodeCss
    	 * \@requires html4
    	 * \@overrides window
    	 * \@requires parseCssStylesheet
    	 * \@provides sanitizeCssProperty
    	 * \@provides sanitizeCssSelectors
    	 * \@provides sanitizeStylesheet
    	 */

    	/**
    	 * Given a series of normalized CSS tokens, applies a property schema, as
    	 * defined in CssPropertyPatterns.java, and sanitizes the tokens in place.
    	 * @param property a property name.
    	 * @param propertySchema a property of cssSchema as defined by
    	 *    CssPropertyPatterns.java
    	 * @param tokens as parsed by lexCss.  Modified in place.
    	 * @param opt_naiveUriRewriter a URI rewriter; an object with a "rewrite"
    	 *     function that takes a URL and returns a safe URL.
    	 */
    	var sanitizeCssProperty = (function () {
    	  var NOEFFECT_URL = 'url("about:blank")';
    	  /**
    	   * The set of characters that need to be normalized inside url("...").
    	   * We normalize newlines because they are not allowed inside quoted strings,
    	   * normalize quote characters, angle-brackets, and asterisks because they
    	   * could be used to break out of the URL or introduce targets for CSS
    	   * error recovery.  We normalize parentheses since they delimit unquoted
    	   * URLs and calls and could be a target for error recovery.
    	   */
    	  var NORM_URL_REGEXP = /[\n\f\r\"\'()*<>]/g;
    	  /** The replacements for NORM_URL_REGEXP. */
    	  var NORM_URL_REPLACEMENTS = {
    	    '\n': '%0a',
    	    '\f': '%0c',
    	    '\r': '%0d',
    	    '"':  '%22',
    	    '\'': '%27',
    	    '(':  '%28',
    	    ')':  '%29',
    	    '*':  '%2a',
    	    '<':  '%3c',
    	    '>':  '%3e'
    	  };


    	  function normalizeUrl(s) {
    	    if ('string' === typeof s) {
    	      return 'url("' + s.replace(NORM_URL_REGEXP, normalizeUrlChar) + '")';
    	    } else {
    	      return NOEFFECT_URL;
    	    }
    	  }
    	  function normalizeUrlChar(ch) {
    	    return NORM_URL_REPLACEMENTS[ch];
    	  }

    	  // From RFC3986
    	  var URI_SCHEME_RE = new RegExp(
    	      '^' +
    	      '(?:' +
    	        '([^:\/?# ]+)' +         // scheme
    	      ':)?'
    	  );

    	  var ALLOWED_URI_SCHEMES = /^(?:https?|mailto)$/i;

    	  function safeUri(uri, prop, naiveUriRewriter) {
    	    if (!naiveUriRewriter) { return null; }
    	    var parsed = ('' + uri).match(URI_SCHEME_RE);
    	    if (parsed && (!parsed[1] || ALLOWED_URI_SCHEMES.test(parsed[1]))) {
    	      return naiveUriRewriter(uri, prop);
    	    } else {
    	      return null;
    	    }
    	  }

    	  function unionArrays(arrs) {
    	    var map = {};
    	    for (var i = arrs.length; --i >= 0;) {
    	      var arr = arrs[i];
    	      for (var j = arr.length; --j >= 0;) {
    	        map[arr[j]] = ALLOWED_LITERAL;
    	      }
    	    }
    	    return map;
    	  }

    	  /**
    	   * Normalize tokens within a function call they can match against
    	   * cssSchema[propName].cssExtra.
    	   * @return the exclusive end in tokens of the function call.
    	   */
    	  function normalizeFunctionCall(tokens, start) {
    	    var parenDepth = 1, end = start + 1, n = tokens.length;
    	    while (end < n && parenDepth) {
    	      // TODO: Can URLs appear in functions?
    	      var token = tokens[end++];
    	      parenDepth += (token === '(' ? 1 : token === ')' ? -1 : 0);
    	    }
    	    return end;
    	  }

    	  // Used as map value to avoid hasOwnProperty checks.
    	  var ALLOWED_LITERAL = {};

    	  return function (property, propertySchema, tokens, opt_naiveUriRewriter) {
    	    var propBits = propertySchema.cssPropBits;
    	    // Used to determine whether to treat quoted strings as URLs or
    	    // plain text content, and whether unrecognized keywords can be quoted
    	    // to treate ['Arial', 'Black'] equivalently to ['"Arial Black"'].
    	    var qstringBits = propBits & (
    	        CSS_PROP_BIT_QSTRING_CONTENT | CSS_PROP_BIT_QSTRING_URL);
    	    // TODO(mikesamuel): Figure out what to do with props like
    	    // content that admit both URLs and strings.

    	    // Used to join unquoted keywords into a single quoted string.
    	    var lastQuoted = NaN;
    	    var i = 0, k = 0;
    	    for (;i < tokens.length; ++i) {
    	      // Has the effect of normalizing hex digits, keywords,
    	      // and function names.
    	      var token = tokens[i].toLowerCase();
    	      var cc = token.charCodeAt(0), cc1, cc2, isnum1, isnum2, end;
    	      var litGroup, litMap;
    	      token = (
    	        // Strip out spaces.  Normally cssparser.js dumps these, but we
    	        // strip them out in case the content doesn't come via cssparser.js.
    	        (cc === ' '.charCodeAt(0))
    	          ? ''
    	          : (cc === '"'.charCodeAt(0))
    	              ? (  // Quoted string.
    	                  (qstringBits === CSS_PROP_BIT_QSTRING_URL && opt_naiveUriRewriter)
    	                  // Sanitize and convert to url("...") syntax.
    	                  // Treat url content as case-sensitive.
    	                  ? (normalizeUrl(
    	                       safeUri(
    	                         decodeCss(tokens[i].substring(1, token.length - 1)),
    	                         property,
    	                         opt_naiveUriRewriter
    	                       )
    	                     ))
    	                  // Drop if plain text content strings not allowed.
    	                  : (qstringBits === CSS_PROP_BIT_QSTRING_CONTENT) ? token : '')
    	              // Preserve hash color literals if allowed.
    	              : (cc === '#'.charCodeAt(0) && /^#(?:[0-9a-f]{3}){1,2}$/.test(token))
    	                  ? (propBits & CSS_PROP_BIT_HASH_VALUE ? token : '')
    	                  // ##### BEGIN: MODIFIED BY SAP
    	                  // : ('0'.charCodeAt(0) <= cc && cc <= '9'.charCodeAt(0))
    	                  : ('0'.charCodeAt(0) <= cc && cc <= '9'.charCodeAt(0) && !propertySchema.cssLitNumeric)
    	                  // ##### END: MODIFIED BY SAP
    	                      // A number starting with a digit.
    	                      ? ((propBits & CSS_PROP_BIT_QUANTITY)
    	                           ? ((propBits & CSS_PROP_BIT_Z_INDEX)
    	                                ? (token.match(/^\d{1,7}$/) ? token : '')
    	                                : token)
    	                           : '')
    	                      // Normalize quantities so they don't start with a '.' or '+' sign and
    	                      // make sure they all have an integer component so can't be confused
    	                      // with a dotted identifier.
    	                      // This can't be done in the lexer since ".4" is a valid rule part.
    	                      : (cc1 = token.charCodeAt(1),
    	                         cc2 = token.charCodeAt(2),
    	                         isnum1 = '0'.charCodeAt(0) <= cc1 && cc1 <= '9'.charCodeAt(0),
    	                         isnum2 = '0'.charCodeAt(0) <= cc2 && cc2 <= '9'.charCodeAt(0),
    	                         // +.5 -> 0.5 if allowed.
    	                         (cc === '+'.charCodeAt(0)
    	                          && (isnum1 || (cc1 === '.'.charCodeAt(0) && isnum2))))
    	                           ? ((propBits & CSS_PROP_BIT_QUANTITY)
    	                                ? ((propBits & CSS_PROP_BIT_Z_INDEX)
    	                                     ? (token.match(/^\+\d{1,7}$/) ? token : '')
    	                                     : ((isnum1 ? '' : '0') + token.substring(1)))
    	                                : '')
    	                           // -.5 -> -0.5 if allowed otherwise -> 0 if quantities allowed.
    	                           : (cc === '-'.charCodeAt(0)
    	                              && (isnum1 || (cc1 === '.'.charCodeAt(0) && isnum2)))
    	                                ? ((propBits & CSS_PROP_BIT_NEGATIVE_QUANTITY)
    	                                     ? ((propBits & CSS_PROP_BIT_Z_INDEX)
    	                                          ? (token.match(/^\-\d{1,7}$/) ? token : '')
    	                                          : ((isnum1 ? '-' : '-0') + token.substring(1)))
    	                                     : ((propBits & CSS_PROP_BIT_QUANTITY) ? '0' : ''))
    	                                // .5 -> 0.5 if allowed.
    	                                : (cc === '.'.charCodeAt(0) && isnum1)
    	                                     ? ((propBits & CSS_PROP_BIT_QUANTITY) ? '0' + token : '')
    	                                     // Handle url("...") by rewriting the body.
    	                                     : ('url(' === token.substring(0, 4))
    	                                          ? ((opt_naiveUriRewriter && (qstringBits & CSS_PROP_BIT_QSTRING_URL))
    	                                               ? normalizeUrl(
    	                                                   safeUri(
    	                                                     tokens[i].substring(5, token.length - 2),
    	                                                     property,
    	                                                     opt_naiveUriRewriter
    	                                                   )
    	                                                 )
    	                                               : '')
    	                                          // Handle func(...) and literal tokens
    	                                          // such as keywords and punctuation.
    	                                          : (
    	                                             // Step 1. Combine func(...) into something that can be compared
    	                                             // against propertySchema.cssExtra.
    	                                             (token.charAt(token.length-1) === '(')
    	                                             && (end = normalizeFunctionCall(tokens, i),
    	                                               // When tokens is
    	                                               //   ['x', ' ', 'rgb(', '255', ',', '0', ',', '0', ')', ' ', 'y']
    	                                               // and i is the index of 'rgb(' and end is the index of ')'
    	                                               // splices tokens to where i now is the index of the whole call:
    	                                               //   ['x', ' ', 'rgb( 255 , 0 , 0 )', ' ', 'y']
    	                                               tokens.splice(i, end - i,
    	                                                 token = tokens.slice(i, end).join(' '))),
    	                                             litGroup = propertySchema.cssLitGroup,
    	                                             litMap = (
    	                                                litGroup
    	                                                ? (propertySchema.cssLitMap
    	                                                   // Lazily compute the union from litGroup.
    	                                                   || (propertySchema.cssLitMap = unionArrays(litGroup)))
    	                                                : ALLOWED_LITERAL),  // A convenient empty object.
    	                                             (litMap[token] === ALLOWED_LITERAL
    	                                              || propertySchema.cssExtra && propertySchema.cssExtra.test(token)))
    	                                                // Token is in the literal map or matches extra.
    	                                                ? token
    	                                                : (/^\w+$/.test(token)
    	                                                   && (qstringBits === CSS_PROP_BIT_QSTRING_CONTENT))
    	                                                     // Quote unrecognized keywords so font names like
    	                                                      //    Arial Bold
    	                                                      // ->
    	                                                      //    "Arial Bold"
    	                                                      ? (lastQuoted+1 === k
    	                                                         // If the last token was also a keyword that was quoted, then
    	                                                         // combine this token into that.
    	                                                         ? (tokens[lastQuoted] = tokens[lastQuoted]
    	                                                            .substring(0, tokens[lastQuoted].length-1) + ' ' + token + '"',
    	                                                            token = '')
    	                                                         : (lastQuoted = k, '"' + token + '"'))
    	                                                      // Disallowed.
    	                                                      : '');
    	      if (token) {
    	        tokens[k++] = token;
    	      }
    	    }
    	    // For single URL properties, if the URL failed to pass the sanitizer,
    	    // then just drop it.
    	    if (k === 1 && tokens[0] === NOEFFECT_URL) { k = 0; }
    	    tokens.length = k;
    	  };
    	})();

    	/**
    	 * Given a series of tokens, returns two lists of sanitized selectors.
    	 * @param {Array.<string>} selectors In the form produces by csslexer.js.
    	 * @param {string} suffix a suffix that is added to all IDs and which is
    	 *    used as a CLASS names so that the returned selectors will only match
    	 *    nodes under one with suffix as a class name.
    	 *    If suffix is {@code "sfx"}, the selector
    	 *    {@code ["a", "#foo", " ", "b", ".bar"]} will be namespaced to
    	 *    {@code [".sfx", " ", "a", "#foo-sfx", " ", "b", ".bar"]}.
    	 * @return {Array.<Array.<string>>} an array of length 2 where the zeroeth
    	 *    element contains history-insensitive selectors and the first element
    	 *    contains history-sensitive selectors.
    	 */
    	function sanitizeCssSelectors(selectors, suffix) {
    	  // Produce two distinct lists of selectors to sequester selectors that are
    	  // history sensitive (:visited), so that we can disallow properties in the
    	  // property groups for the history sensitive ones.
    	  var historySensitiveSelectors = [];
    	  var historyInsensitiveSelectors = [];

    	  // Remove any spaces that are not operators.
    	  var k = 0, i;
    	  for (i = 0; i < selectors.length; ++i) {
    	    if (!(selectors[i] == ' '
    	          && (selectors[i-1] == '>' || selectors[i+1] == '>'))) {
    	      selectors[k++] = selectors[i];
    	    }
    	  }
    	  selectors.length = k;

    	  // Split around commas.  If there is an error in one of the comma separated
    	  // bits, we throw the whole away, but the failure of one selector does not
    	  // affect others.
    	  var n = selectors.length, start = 0;
    	  for (i = 0; i < n; ++i) {
    	    if (selectors[i] == ',') {
    	      processSelector(start, i);
    	      start = i+1;
    	    }
    	  }
    	  processSelector(start, n);


    	  function processSelector(start, end) {
    	    var historySensitive = false;

    	    // Space around commas is not an operator.
    	    if (selectors[start] === ' ') { ++start; }
    	    if (end-1 !== start && selectors[end] === ' ') { --end; }

    	    // Split the selector into element selectors, content around
    	    // space (ancestor operator) and '>' (descendant operator).
    	    var out = [];
    	    var lastOperator = start;
    	    var elSelector = '';
    	    for (var i = start; i < end; ++i) {
    	      var tok = selectors[i];
    	      var isChild = (tok === '>');
    	      if (isChild || tok === ' ') {
    	        // We've found the end of a single link in the selector chain.
    	        // We disallow absolute positions relative to html.
    	        elSelector = processElementSelector(lastOperator, i, false);
    	        if (!elSelector || (isChild && /^html/i.test(elSelector))) {
    	          return;
    	        }
    	        lastOperator = i+1;
    	        out.push(elSelector, isChild ? ' > ' : ' ');
    	      }
    	    }
    	    elSelector = processElementSelector(lastOperator, end, true);
    	    if (!elSelector) { return; }
    	    out.push(elSelector);

    	    function processElementSelector(start, end, last) {

    	      // Split the element selector into three parts.
    	      // DIV.foo#bar:hover
    	      //    ^       ^
    	      // el classes pseudo
    	      var element, classId, pseudoSelector, tok, elType;
    	      element = '';
    	      if (start < end) {
    	        tok = selectors[start].toLowerCase();
    	        if (tok === '*'
    	            || (tok === 'body' && start+1 !== end && !last)
    	            || ('number' === typeof (elType = html4.ELEMENTS[tok])
    	                && !(elType & html4.eflags.UNSAFE))) {
    	          ++start;
    	          element = tok;
    	        }
    	      }
    	      classId = '';
    	      while (start < end) {
    	        tok = selectors[start];
    	        if (tok.charAt(0) === '#') {
    	          if (/^#_|__$|[^#0-9A-Za-z:_\-]/.test(tok)) { return null; }
    	          // Rewrite ID elements to include the suffix.
    	          classId += tok + '-' + suffix;
    	        } else if (tok === '.') {
    	          if (++start < end
    	              && /^[0-9A-Za-z:_\-]+$/.test(tok = selectors[start])
    	              && !/^_|__$/.test(tok)) {
    	            classId += '.' + tok;
    	          } else {
    	            return null;
    	          }
    	        } else {
    	          break;
    	        }
    	        ++start;
    	      }
    	      pseudoSelector = '';
    	      if (start < end && selectors[start] === ':') {
    	        tok = selectors[++start];
    	        if (tok === 'visited' || tok === 'link') {
    	          if (!/^[a*]?$/.test(element)) {
    	            return null;
    	          }
    	          historySensitive = true;
    	          pseudoSelector = ':' + tok;
    	          element = 'a';
    	          ++start;
    	        }
    	      }
    	      if (start === end) {
    	        return element + classId + pseudoSelector;
    	      }
    	      return null;
    	    }


    	    var safeSelector = out.join('');
    	    if (/^body\b/.test(safeSelector)) {
    	      // Substitute the class that is attached to pseudo body elements for
    	      // the body element.
    	      safeSelector = '.vdoc-body___.' + suffix + safeSelector.substring(4);
    	    } else {
    	      // Namespace the selector so that it only matches under
    	      // a node with suffix in its CLASS attribute.
    	      safeSelector = '.' + suffix + ' ' + safeSelector;
    	    }

    	    (historySensitive
    	     ? historySensitiveSelectors
    	     : historyInsensitiveSelectors).push(safeSelector);
    	  }

    	  return [historyInsensitiveSelectors, historySensitiveSelectors];
    	}

    	var sanitizeStylesheet = (function () {
    	  var allowed = {};
    	  var cssMediaTypeWhitelist = {
    	    'braille': allowed,
    	    'embossed': allowed,
    	    'handheld': allowed,
    	    'print': allowed,
    	    'projection': allowed,
    	    'screen': allowed,
    	    'speech': allowed,
    	    'tty': allowed,
    	    'tv': allowed
    	  };

    	  /**
    	   * Given a series of sanitized tokens, removes any properties that would
    	   * leak user history if allowed to style links differently depending on
    	   * whether the linked URL is in the user's browser history.
    	   * @param {Array.<string>} blockOfProperties
    	   */
    	  function sanitizeHistorySensitive(blockOfProperties) {
    	    var elide = false;
    	    for (var i = 0, n = blockOfProperties.length; i < n-1; ++i) {
    	      var token = blockOfProperties[i];
    	      if (':' === blockOfProperties[i+1]) {
    	        elide = !(cssSchema[token].cssPropBits & CSS_PROP_BIT_ALLOWED_IN_LINK);
    	      }
    	      if (elide) { blockOfProperties[i] = ''; }
    	      if (';' === token) { elide = false; }
    	    }
    	    return blockOfProperties.join('');
    	  }

    	  /**
    	   * @param {string} cssText a string containing a CSS stylesheet.
    	   * @param {string} suffix a suffix that is added to all IDs and which is
    	   *    used as a CLASS names so that the returned selectors will only match
    	   *    nodes under one with suffix as a class name.
    	   *    If suffix is {@code "sfx"}, the selector
    	   *    {@code ["a", "#foo", " ", "b", ".bar"]} will be namespaced to
    	   *    {@code [".sfx", " ", "a", "#foo-sfx", " ", "b", ".bar"]}.
    	   * @param {function(string, string)} opt_naiveUriRewriter maps URLs of media
    	   *    (images, sounds) that appear as CSS property values to sanitized
    	   *    URLs or null if the URL should not be allowed as an external media
    	   *    file in sanitized CSS.
    	   */
    	  return function /*sanitizeStylesheet*/(
    	       cssText, suffix, opt_naiveUriRewriter) {
    	    var safeCss = void 0;
    	    // A stack describing the { ... } regions.
    	    // Null elements indicate blocks that should not be emitted.
    	    var blockStack = [];
    	    // True when the content of the current block should be left off safeCss.
    	    var elide = false;
    	    parseCssStylesheet(
    	        cssText,
    	        {
    	          startStylesheet: function () {
    	            safeCss = [];
    	          },
    	          endStylesheet: function () {
    	          },
    	          startAtrule: function (atIdent, headerArray) {
    	            if (elide) {
    	              atIdent = null;
    	            } else if (atIdent === '@media') {
    	              headerArray = headerArray.filter(
    	                function (mediaType) {
    	                  return cssMediaTypeWhitelist[mediaType] == allowed;
    	                });
    	              if (headerArray.length) {
    	                safeCss.push(atIdent, headerArray.join(','), '{');
    	              } else {
    	                atIdent = null;
    	              }
    	            } else {
    	              if (atIdent === '@import') {
    	                // TODO: Use a logger instead.
    	                if (window.console) {
    	                  window.console.log(
    	                      '@import ' + headerArray.join(' ') + ' elided');
    	                }
    	              }
    	              atIdent = null;  // Elide the block.
    	            }
    	            elide = !atIdent;
    	            blockStack.push(atIdent);
    	          },
    	          endAtrule: function () {
    	            blockStack.pop();
    	            if (!elide) {
    	              safeCss.push(';');
    	            }
    	            checkElide();
    	          },
    	          startBlock: function () {
    	            // There are no bare blocks in CSS, so we do not change the
    	            // block stack here, but instead in the events that bracket
    	            // blocks.
    	            if (!elide) {
    	              safeCss.push('{');
    	            }
    	          },
    	          endBlock: function () {
    	            if (!elide) {
    	              safeCss.push('}');
    	              elide = true;  // skip any semicolon from endAtRule.
    	            }
    	          },
    	          startRuleset: function (selectorArray) {
    	            var historySensitiveSelectors = void 0;
    	            var removeHistoryInsensitiveSelectors = false;
    	            if (!elide) {
    	              var selectors = sanitizeCssSelectors(selectorArray, suffix);
    	              var historyInsensitiveSelectors = selectors[0];
    	              historySensitiveSelectors = selectors[1];
    	              if (!historyInsensitiveSelectors.length
    	                  && !historySensitiveSelectors.length) {
    	                elide = true;
    	              } else {
    	                var selector = historyInsensitiveSelectors.join(', ');
    	                if (!selector) {
    	                  // If we have only history sensitive selectors,
    	                  // use an impossible rule so that we can capture the content
    	                  // for later processing by
    	                  // history insenstive content for use below.
    	                  selector = 'head > html';
    	                  removeHistoryInsensitiveSelectors = true;
    	                }
    	                safeCss.push(selector, '{');
    	              }
    	            }
    	            blockStack.push(
    	                elide
    	                ? null
    	                // Sometimes a single list of selectors is split in two,
    	                //   div, a:visited
    	                // because we want to allow some properties for DIV that
    	                // we don't want to allow for A:VISITED to avoid leaking
    	                // user history.
    	                // Store the history sensitive selectors and the position
    	                // where the block starts so we can later create a copy
    	                // of the permissive tokens, and filter it to handle the
    	                // history sensitive case.
    	                : {
    	                    historySensitiveSelectors: historySensitiveSelectors,
    	                    endOfSelectors: safeCss.length - 1,  // 1 is open curly
    	                    removeHistoryInsensitiveSelectors:
    	                       removeHistoryInsensitiveSelectors
    	                  });
    	          },
    	          endRuleset: function () {
    	            var rules = blockStack.pop();
    	            var propertiesEnd = safeCss.length;
    	            if (!elide) {
    	              safeCss.push('}');
    	              if (rules) {
    	                var extraSelectors = rules.historySensitiveSelectors;
    	                if (extraSelectors.length) {
    	                  var propertyGroupTokens = safeCss.slice(rules.endOfSelectors);
    	                  safeCss.push(extraSelectors.join(', '),
    	                               sanitizeHistorySensitive(propertyGroupTokens));
    	                }
    	              }
    	            }
    	            if (rules && rules.removeHistoryInsensitiveSelectors) {
    	              safeCss.splice(
    	                // -1 and +1 account for curly braces.
    	                rules.endOfSelectors - 1, propertiesEnd + 1);
    	            }
    	            checkElide();
    	          },
    	          declaration: function (property, valueArray) {
    	            if (!elide) {
    	              var schema = cssSchema[property];
    	              if (schema) {
    	                sanitizeCssProperty(property, schema, valueArray, opt_naiveUriRewriter);
    	                if (valueArray.length) {
    	                  safeCss.push(property, ':', valueArray.join(' '), ';');
    	                }
    	              }
    	            }
    	          }
    	        });
    	    function checkElide() {
    	      elide = blockStack.length !== 0
    	          && blockStack[blockStack.length-1] !== null;
    	    }
    	    return safeCss.join('');
    	  };
    	})();

    	// Exports for closure compiler.
    	if (typeof window !== 'undefined') {
    	  window['sanitizeCssProperty'] = sanitizeCssProperty;
    	  window['sanitizeCssSelectors'] = sanitizeCssSelectors;
    	  window['sanitizeStylesheet'] = sanitizeStylesheet;
    	}
    	// Copyright (C) 2010 Google Inc.
    	//
    	// Licensed under the Apache License, Version 2.0 (the "License");
    	// you may not use this file except in compliance with the License.
    	// You may obtain a copy of the License at
    	//
    	//      http://www.apache.org/licenses/LICENSE-2.0
    	//
    	// Unless required by applicable law or agreed to in writing, software
    	// distributed under the License is distributed on an "AS IS" BASIS,
    	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    	// See the License for the specific language governing permissions and
    	// limitations under the License.

    	/**
    	 * @fileoverview
    	 * Utilities for dealing with CSS source code.
    	 *
    	 * @author mikesamuel@gmail.com
    	 * \@requires lexCss
    	 * \@overrides window
    	 * \@provides parseCssStylesheet, parseCssDeclarations
    	 */

    	/**
    	 * parseCssStylesheet takes a chunk of CSS text and a handler object with
    	 * methods that it calls as below:
    	 * <pre>
    	 * // At the beginning of a stylesheet.
    	 * handler.startStylesheet();
    	 *
    	 * // For an @foo rule ended by a semicolon: @import "foo.css";
    	 * handler.startAtrule('@import', ['"foo.css"']);
    	 * handler.endAtrule();
    	 *
    	 * // For an @foo rule ended with a block. @media print { ... }
    	 * handler.startAtrule('@media', ['print']);
    	 * handler.startBlock();
    	 * // Calls to contents elided.  Probably selectors and declarations as below.
    	 * handler.endBlock();
    	 * handler.endAtrule();
    	 *
    	 * // For a ruleset: p.clazz q, s { color: blue; }
    	 * handler.startRuleset(['p', '.', 'clazz', ' ', 'q', ',', ' ', 's']);
    	 * handler.declaration('color', ['blue']);
    	 * handler.endRuleset();
    	 *
    	 * // At the end of a stylesheet.
    	 * handler.endStylesheet();
    	 * </pre>
    	 * When errors are encountered, the parser drops the useless tokens and
    	 * attempts to resume parsing.
    	 *
    	 * @param {string} cssText CSS3 content to parse as a stylesheet.
    	 * @param {Object} handler An object like <pre>{
    	 *   startStylesheet: function () { ... },
    	 *   endStylesheet: function () { ... },
    	 *   startAtrule: function (atIdent, headerArray) { ... },
    	 *   endAtrule: function () { ... },
    	 *   startBlock: function () { ... },
    	 *   endBlock: function () { ... },
    	 *   startRuleset: function (selectorArray) { ... },
    	 *   endRuleset: function () { ... },
    	 *   declaration: function (property, valueArray) { ... },
    	 * }</pre>
    	 */
    	var parseCssStylesheet;

    	/**
    	 * parseCssDeclarations parses a run of declaration productions as seen in the
    	 * body of the HTML5 {@code style} attribute.
    	 *
    	 * @param {string} cssText CSS3 content to parse as a run of declarations.
    	 * @param {Object} handler An object like <pre>{
    	 *   declaration: function (property, valueArray) { ... },
    	 * }</pre>
    	 */
    	var parseCssDeclarations;

    	(function () {
    	  // stylesheet  : [ CDO | CDC | S | statement ]*;
    	  parseCssStylesheet = function(cssText, handler) {
    	    var toks = lexCss(cssText);
    	    if (handler.startStylesheet) { handler.startStylesheet(); }
    	    for (var i = 0, n = toks.length; i < n;) {
    	      // CDO and CDC ("<!--" and "-->") are converted to space by the lexer.
    	      i = toks[i] === ' ' ? i+1 : statement(toks, i, n, handler);
    	    }
    	    if (handler.endStylesheet) { handler.endStylesheet(); }
    	  };

    	  // statement   : ruleset | at-rule;
    	  function statement(toks, i, n, handler) {
    	    if (i < n) {
    	      var tok = toks[i];
    	      if (tok.charAt(0) === '@') {
    	        return atrule(toks, i, n, handler, true);
    	      } else {
    	        return ruleset(toks, i, n, handler);
    	      }
    	    } else {
    	      return i;
    	    }
    	  }

    	  // at-rule     : ATKEYWORD S* any* [ block | ';' S* ];
    	  function atrule(toks, i, n, handler, blockok) {
    	    var start = i++;
    	    while (i < n && toks[i] !== '{' && toks[i] !== ';') {
    	      ++i;
    	    }
    	    if (i < n && (blockok || toks[i] === ';')) {
    	      var s = start+1, e = i;
    	      if (s < n && toks[s] === ' ') { ++s; }
    	      if (e > s && toks[e-1] === ' ') { --e; }
    	      if (handler.startAtrule) {
    	        handler.startAtrule(toks[start].toLowerCase(), toks.slice(s, e));
    	      }
    	      i = (toks[i] === '{')
    	          ? block(toks, i, n, handler)
    	          : i+1;  // Skip over ';'
    	      if (handler.endAtrule) {
    	        handler.endAtrule();
    	      }
    	    }
    	    // Else we reached end of input or are missing a semicolon.
    	    // Drop the rule on the floor.
    	    return i;
    	  }

    	  // block       : '{' S* [ any | block | ATKEYWORD S* | ';' S* ]* '}' S*;
    	   // Assumes the leading '{' has been verified by callers.
    	  function block(toks, i, n, handler) {
    	    ++i; //  skip over '{'
    	    if (handler.startBlock) { handler.startBlock(); }
    	    while (i < n) {
    	      var ch = toks[i].charAt(0);
    	      if (ch == '}') {
    	        ++i;
    	        break;
    	      }
    	      if (ch === ' ' || ch === ';') {
    	        i = i+1;
    	      } else if (ch === '@') {
    	        i = atrule(toks, i, n, handler, false);
    	      } else if (ch === '{') {
    	        i = block(toks, i, n, handler);
    	      } else {
    	        // Instead of using (any* block) to subsume ruleset we allow either
    	        // blocks or rulesets with a non-blank selector.
    	        // This is more restrictive but does not require atrule specific
    	        // parse tree fixup to realize that the contents of the block in
    	        //    @media print { ... }
    	        // is a ruleset.  We just don't care about any block carrying at-rules
    	        // whose body content is not ruleset content.
    	        i = ruleset(toks, i, n, handler);
    	      }
    	    }
    	    if (handler.endBlock) { handler.endBlock(); }
    	    return i;
    	  }

    	  // ruleset    : selector? '{' S* declaration? [ ';' S* declaration? ]* '}' S*;
    	  function ruleset(toks, i, n, handler) {
    	    // toks[s:e] are the selector tokens including internal whitespace.
    	    var s = i, e = selector(toks, i, n, true);
    	    if (e < 0) {
    	      // Skip malformed content per selector calling convention.
    	      e = ~e;
    	      // Make sure we skip at least one token.
    	      return i === e ? e+1 : e;
    	    }
    	    i = e;
    	    // Don't include any trailing space in the selector slice.
    	    if (e > s && toks[e-1] === ' ') { --e; }
    	    var tok = toks[i];
    	    ++i;  // Skip over '{'
    	    if (tok !== '{') {
    	      // Skips past the '{' when there is a malformed input.
    	      return i;
    	    }
    	    if (handler.startRuleset) {
    	      handler.startRuleset(toks.slice(s, e));
    	    }
    	    while (i < n) {
    	      tok = toks[i];
    	      if (tok === '}') {
    	        ++i;
    	        break;
    	      }
    	      if (tok === ' ') {
    	        i = i+1;
    	      } else {
    	        i = declaration(toks, i, n, handler);
    	      }
    	    }
    	    if (handler.endRuleset) {
    	      handler.endRuleset();
    	    }
    	    return i < n ? i+1 : i;
    	  }

    	  // selector    : any+;
    	  // any         : [ IDENT | NUMBER | PERCENTAGE | DIMENSION | STRING
    	  //               | DELIM | URI | HASH | UNICODE-RANGE | INCLUDES
    	  //               | FUNCTION S* any* ')' | DASHMATCH | '(' S* any* ')'
    	  //               | '[' S* any* ']' ] S*;
    	  // A negative return value, rv, indicates the selector was malformed and
    	  // the index at which we stopped is ~rv.
    	  function selector(toks, i, n, allowSemi) {
    	    // The definition of any above can be summed up as
    	    //   "any run of token except ('[', ']', '(', ')', ':', ';', '{', '}')
    	    //    or nested runs of parenthesized tokens or square bracketed tokens".
    	    // Spaces are significant in the selector.
    	    // Selector is used as (selector?) so the below looks for (any*) for
    	    // simplicity.
    	    var tok;
    	    // Keeping a stack pointer actually causes this to minify better since
    	    // ".length" and ".push" are a lo of chars.
    	    var brackets = [], stackLast = -1;
    	    for (;i < n; ++i) {
    	      tok = toks[i].charAt(0);
    	      if (tok === '[' || tok === '(') {
    	        brackets[++stackLast] = tok;
    	      } else if ((tok === ']' && brackets[stackLast] === '[') ||
    	                 (tok === ')' && brackets[stackLast] === '(')) {
    	        --stackLast;
    	      } else if (tok === '{' || tok === '}' || tok === ';' || tok === '@'
    	                 || (tok === ':' && !allowSemi)) {
    	        break;
    	      }
    	    }
    	    if (stackLast >= 0) {
    	      // Returns the bitwise inverse of i+1 to indicate an error in the
    	      // token stream so that clients can ignore it.
    	      i = ~(i+1);
    	    }
    	    return i;
    	  }

    	  var ident = /^-?[a-z]/i;

    	  // declaration : property ':' S* value;
    	  // property    : IDENT S*;
    	  // value       : [ any | block | ATKEYWORD S* ]+;
    	  function declaration(toks, i, n, handler) {
    	    var property = toks[i++];
    	    if (!ident.test(property)) {
    	      return i+1;  // skip one token.
    	    }
    	    var tok;
    	    if (i < n && toks[i] === ' ') { ++i; }
    	    if (i == n || toks[i] !== ':') {
    	      // skip tokens to next semi or close bracket.
    	      while (i < n && (tok = toks[i]) !== ';' && tok !== '}') { ++i; }
    	      return i;
    	    }
    	    ++i;
    	    if (i < n && toks[i] === ' ') { ++i; }

    	    // None of the rules we care about want atrules or blocks in value, so
    	    // we look for any+ but that is the same as selector but not zero-length.
    	    // This gets us the benefit of not emitting any value with mismatched
    	    // brackets.
    	    var s = i, e = selector(toks, i, n, false);
    	    if (e < 0) {
    	      // Skip malformed content per selector calling convention.
    	      e = ~e;
    	    } else {
    	      var value = [], valuelen = 0;
    	      for (var j = s; j < e; ++j) {
    	        tok = toks[j];
    	        if (tok !== ' ') {
    	          value[valuelen++] = tok;
    	        }
    	      }
    	      // One of the following is now true:
    	      // (1) e is flush with the end of the tokens as in <... style="x:y">.
    	      // (2) tok[e] points to a ';' in which case we need to consume the semi.
    	      // (3) tok[e] points to a '}' in which case we don't consume it.
    	      // (4) else there is bogus unparsed value content at toks[e:].
    	      // Allow declaration flush with end for style attr body.
    	      if (e < n) {  // 2, 3, or 4
    	        do {
    	          tok = toks[e];
    	          if (tok === ';' || tok === '}') { break; }
    	          // Don't emit the property if there is questionable trailing content.
    	          valuelen = 0;
    	        } while (++e < n);
    	        if (tok === ';') {
    	          ++e;
    	        }
    	      }
    	      if (valuelen && handler.declaration) {
    	        // TODO: coerce non-keyword ident tokens to quoted strings.
    	        handler.declaration(property.toLowerCase(), value);
    	      }
    	    }
    	    return e;
    	  }

    	  parseCssDeclarations = function(cssText, handler) {
    	    var toks = lexCss(cssText);
    	    for (var i = 0, n = toks.length; i < n;) {
    	      i = toks[i] !== ' ' ? declaration(toks, i, n, handler) : i+1;
    	    }
    	  };
    	})();

    	// Exports for closure compiler.
    	if (typeof window !== 'undefined') {
    	  window['parseCssStylesheet'] = parseCssStylesheet;
    	  window['parseCssDeclarations'] = parseCssDeclarations;
    	}
    	/*!
    	 * OpenUI5
    	 * (c) Copyright 2026 SAP SE or an SAP affiliate company.
    	 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
    	 */
    	// Based on coding from the HTML4 Sanitizer by Google Inc.
    	// The HTML Attributes and ELements were reorganized according to the actual HTML5 specification
    	// from the W3C. All types and flags were reviewed again as accurately as possible with HTML4 only
    	// elements removed, you can still see them as comments. All rules which are new or changed from the
    	// old HTML4 file are also marked "new" within the comment. The comments also state which attributes
    	// and elements are assigned to respective types and flags. All rules which were not 100% clear were
    	// analyzed in a way of similarity, so for example "audio" and "video" content behaves like images etc.
    	// URIEFFECTS state if a URL is loaded inplace within a tag where the actual document is in control
    	// of what type of content is loaded like "image" or if a new document is loaded like with "a href".
    	// LOADERTYPES state if content is loaded as sandboxed which means it is loaded within a specific
    	// surroundig player like with video content for example or if it is loaded freely without restrictions.
    	// @overrides window
    	// @provides html4

    	var html4 = {};
    	html4.atype = {
    	  NONE: 0,
    	  URI: 1, //action, cite, data, href, icon, manifest, poster, src
    	  URI_FRAGMENT: 11, //usemap
    	  SCRIPT: 2, //all event handlers
    	  STYLE: 3, //style
    	  ID: 4, //id
    	  IDREF: 5, //for
    	  IDREFS: 6, //headers
    	  GLOBAL_NAME: 7, //name of form, iframe, img, map, meta
    	  LOCAL_NAME: 8, //name of button, fieldset, input, keygen, object, output, param, select, textarea
    	  CLASSES: 9, //class
    	  FRAME_TARGET: 10 //formtarget, srcdoc, target
    	};

    	html4.ATTRIBS = {
    		'*::accesskey': 0, //NONE
    		'*::class': 9, //CLASSES
    		'*::contenteditable': 0, //NONE new
    		'*::contextmenu': 0, //NONE new
    		'*::dir': 0, //NONE
    		'*::draggable': 0, //NONE new
    		'*::dropzone': 0, //NONE new
    		'*::hidden': 0, //NONE new
    		'*::id': 4, //ID
    		'*::lang': 0, //NONE
    		'*::onabort': 2, //SCRIPT new
    		'*::onblur': 2, //SCRIPT new
    		'*::oncanplay': 2, //SCRIPT new
    		'*::oncanplaythrough': 2, //SCRIPT new
    		'*::onchange': 2, //SCRIPT new
    		'*::onclick': 2, //SCRIPT
    		'*::oncontextmenu': 2, //SCRIPT new
    		'*::oncuechange': 2, //SCRIPT new
    		'*::ondblclick': 2, //SCRIPT
    		'*::ondrag': 2, //SCRIPT new
    		'*::ondragend': 2, //SCRIPT new
    		'*::ondragenter': 2, //SCRIPT new
    		'*::ondragleave': 2, //SCRIPT new
    		'*::ondragover': 2, //SCRIPT new
    		'*::ondragstart': 2, //SCRIPT new
    		'*::ondrop': 2, //SCRIPT new
    		'*::ondurationchange': 2, //SCRIPT new
    		'*::onemptied': 2, //SCRIPT new
    		'*::onended': 2, //SCRIPT new
    		'*::onerror': 2, //SCRIPT new
    		'*::onfocus': 2, //SCRIPT new
    		'*::oninput': 2, //SCRIPT new
    		'*::oninvalid':	 2, //SCRIPT new
    		'*::onkeydown': 2, //SCRIPT
    		'*::onkeypress': 2, //SCRIPT
    		'*::onkeyup': 2, //SCRIPT
    		'*::onload': 2, //SCRIPT
    		'*::onloadeddata': 2, //SCRIPT new
    		'*::onloadedmetadata': 2, //SCRIPT new
    		'*::onloadstart': 2, //SCRIPT new
    		'*::onmousedown': 2, //SCRIPT
    		'*::onmousemove': 2, //SCRIPT
    		'*::onmouseout': 2, //SCRIPT
    		'*::onmouseover': 2, //SCRIPT
    		'*::onmouseup': 2, //SCRIPT
    		'*::onmousewheel': 2, //SCRIPT new
    		'*::onpause': 2, //SCRIPT new
    		'*::onplay': 2, //SCRIPT new
    		'*::onplaying': 2, //SCRIPT new
    		'*::onprogress': 2, //SCRIPT new
    		'*::onratechange': 2, //SCRIPT new
    		'*::onreadystatechange': 2, //SCRIPT new
    		'*::onreset': 2, //SCRIPT new
    		'*::onscroll': 2, //SCRIPT new
    		'*::onseeked': 2, //SCRIPT new
    		'*::onseeking': 2, //SCRIPT new
    		'*::onselect': 2, //SCRIPT new
    		'*::onshow': 2, //SCRIPT new
    		'*::onstalled': 2, //SCRIPT new
    		'*::onsubmit': 2, //SCRIPT new
    		'*::onsuspend': 2, //SCRIPT new
    		'*::ontimeupdate': 2, //SCRIPT new
    		'*::onvolumechange': 2, //SCRIPT new
    		'*::onwaiting': 2, //SCRIPT new
    		'*::spellcheck': 0, //NONE new
    		'*::style': 3, //STYLE
    		'*::tabindex': 0, //NONE
    		'*::title': 0, //NONE
    	//---------------------  'a::accesskey': 0, moved to global
    	//---------------------  'a::coords': 0,
    		'a::href': 1, //URI
    		'a::hreflang': 0, //NONE
    		'a::media': 0, //NONE new
    	//---------------------  'a::name': 7,
    	//---------------------	 'a::onblur': 2, moved to global
    	//---------------------	 'a::onfocus': 2, moved to global
    		'a::rel': 0, //NONE
    	//---------------------  'a::rev': 0,
    	//---------------------  'a::shape': 0,
    	//---------------------  'a::tabindex': 0, moved to global
    		'a::target': 0, //changed to "0" because of CSN 1918585 2013, original value was 10 FRAME_TARGET but it seems uncritical
    		'a::type': 0, //NONE
    	//---------------------  'area::accesskey': 0, moved to global
    		'area::alt': 0, //NONE
    		'area::coords': 0, //NONE
    		'area::href': 1, //URI
    		'area::hreflang': 0, //NONE new
    		'area::media': 0, //NONE new
    	//---------------------  'area::nohref': 0,
    	//---------------------	 'area::onblur': 2, moved to global
    	//---------------------	 'area::onfocus': 2, moved to global
    		'area::rel': 0, //NONE new
    		'area::shape': 0, //NONE
    	//---------------------  'area::tabindex': 0, moved to global
    		'area::target': 10, //FRAME_TARGET
    		'area::type': 0, //NONE
    		'audio::autoplay': 0, //NONE new
    		'audio::controls': 0, //NONE new
    		'audio::loop': 0, //NONE new
    		'audio::mediagroup': 0, //NONE new
    		'audio::preload': 0, //NONE new
    		'audio::src': 1, //URI
    		'base::href': 1, //URI
    		'base::target': 10, //FRAME_TARGET
    	//---------------------  'bdo::dir': 0,
    		'blockquote::cite': 1, //URI
    		'body::onafterprint': 2, //SCRIPT new
    		'body::onbeforeprint': 2, //SCRIPT new
    		'body::onbeforeunload': 2, //SCRIPT new
    		'body::onblur': 2, //SCRIPT new
    		'body::onerror': 2, //SCRIPT new
    		'body::onfocus': 2, //SCRIPT new
    		'body::onhashchange': 2, //SCRIPT new
    		'body::onload': 2, //SCRIPT new
    		'body::onmessage': 2, //SCRIPT new
    		'body::onoffline': 2, //SCRIPT new
    		'body::ononline': 2, //SCRIPT new
    		'body::onpagehide': 2, //SCRIPT new
    		'body::onpageshow': 2, //SCRIPT new
    		'body::onpopstate': 2, //SCRIPT new
    		'body::onredo': 2, //SCRIPT new
    		'body::onresize': 2, //SCRIPT new
    		'body::onscroll': 2, //SCRIPT new
    		'body::onstorage': 2, //SCRIPT new
    		'body::onundo': 2, //SCRIPT new
    		'body::onunload': 2, //SCRIPT new
    	//---------------------  'br::clear': 0,
    	//---------------------  'button::accesskey': 0, moved to global
    		'button::autofocus': 0, //NONE new
    		'button::disabled': 0, //NONE
    		'button::form': 0, //NONE new
    		'button::formaction': 1, //URI new
    		'button::formenctype': 0, //NONE new
    		'button::formmethod': 0, //NONE new
    		'button::formnovalidate': 0, //NONE new
    		'button::formtarget': 10, //FRAME_TARGET new
    		'button::name': 8, //LOCAL_NAME
    	//---------------------	 'button::onblur': 2,
    	//---------------------	 'button::onfocus': 2,
    	//---------------------  'button::tabindex': 0, moved to global
    		'button::type': 0, //NONE
    		'button::value': 0, //NONE
    		'canvas::height': 0, //NONE
    		'canvas::width': 0, //NONE
    	//---------------------	 'caption::align': 0,
    	//---------------------  'col::align': 0,
    	//---------------------	 'col::char': 0,
    	//---------------------	 'col::charoff': 0,
    		'col::span': 0, //NONE
    	//---------------------	 'col::valign': 0,
    	//---------------------	 'col::width': 0,
    	//---------------------	 'colgroup::align': 0,
    	//---------------------	 'colgroup::char': 0,
    	//---------------------	 'colgroup::charoff': 0,
    		'colgroup::span': 0, //NONE
    	//---------------------	 'colgroup::valign': 0,
    	//---------------------	 'colgroup::width': 0,
    		'command::checked': 0, //NONE new
    		'command::disabled': 0, //NONE new
    		'command::icon': 1, //URI new
    		'command::label': 0, //NONE new
    		'command::radiogroup': 0, //NONE new
    		'command::type': 0, //NONE new
    		'del::cite': 1, //URI
    		'del::datetime': 0, //NONE
    		'details::open': 0, //NONE new
    	//---------------------	 'dir::compact': 0,
    	//---------------------	 'div::align': 0,
    	//---------------------	 'dl::compact': 0,
    		'embed::height': 0, //NONE new
    		'embed::src': 1, //URI new
    		'embed::type': 0, //NONE new
    		'embed::width': 0, //NONE new
    		'fieldset::disabled': 0, //NONE new
    		'fieldset::form': 0, //NONE new
    		'fieldset::name': 8, //LOCAL_NAME new
    	//---------------------	 'font::color': 0,
    	//---------------------	 'font::face': 0,
    	//---------------------	 'font::size': 0,
    	//---------------------	 'form::accept': 0,
    		'form::accept-charset': 0, //NONE
    		'form::action': 1, //URI
    		'form::autocomplete': 0, //NONE
    		'form::enctype': 0, //NONE
    		'form::method': 0, //NONE
    		'form::name': 7, //GLOBAL_NAME
    		'form::novalidate': 0, //NONE new
    	//---------------------	 'form::onreset': 2,
    	//---------------------	 'form::onsubmit': 2,
    		'form::target': 10, //FRAME_TARGET
    	//---------------------	 'h1::align': 0,
    	//---------------------	 'h2::align': 0,
    	//---------------------	 'h3::align': 0,
    	//---------------------	 'h4::align': 0,
    	//---------------------	 'h5::align': 0,
    	//---------------------	 'h6::align': 0,
    	//---------------------	 'hr::align': 0,
    	//---------------------	 'hr::noshade': 0,
    	//---------------------	 'hr::size': 0,
    	//---------------------	 'hr::width': 0,
    		'html:: manifest': 1, //URI new
    	//---------------------	 'iframe::align': 0,
    	//---------------------	'iframe::frameborder': 0,
    		'iframe::height': 0, //NONE
    	//---------------------	 'iframe::marginheight': 0,
    	//---------------------	 'iframe::marginwidth': 0,
    		'iframe::name': 7, //GLOBAL_NAME new
    		'iframe::sandbox': 0, //NONE new
    		'iframe::seamless': 0, //NONE new
    		'iframe::src': 1, //URI new
    		'iframe::srcdoc': 10, //FRAME_TARGET new
    		'iframe::width': 0, //NONE
    	//---------------------	 'img::align': 0,
    		'img::alt': 0, //NONE
    	//---------------------	 'img::border': 0,
    		'img::height': 0, //NONE
    	//---------------------	 'img::hspace': 0,
    		'img::ismap': 0, //NONE
    		'img::name': 7, //GLOBAL_NAME
    		'img::src': 1, //URI
    		'img::usemap': 11, //URI_FRAGMENT
    	//---------------------	'img::vspace': 0,
    		'img::width': 0, //NONE
    		'input::accept': 0, //NONE
    	//---------------------	 'input::accesskey': 0, moved to global
    	//---------------------	 'input::align': 0,
    		'input::alt': 0, //NONE
    		'input::autocomplete': 0, //NONE
    		'input::autofocus': 0, //NONE new
    		'input::checked': 0, //NONE
    		'input::dirname': 0, //NONE new
    		'input::disabled': 0, //NONE
    		'input::form': 0, //NONE new
    		'input::formaction': 1, //URI new
    		'input::formenctype': 0, //NONE new
    		'input::formmethod': 0, //NONE new
    		'input::formnovalidate': 0, //NONE new
    		'input::formtarget': 10, //FRAME_TARGET new
    		'input::height': 0, //NONE new
    	//---------------------	 'input::ismap': 0,
    		'input::list': 0, //NONE new
    		'input::max': 0, //NONE new
    		'input::maxlength': 0, //NONE
    		'input::min': 0, //NONE new
    		'input::multiple': 0, //NONE new
    		'input::name': 8, //LOCAL_NAME
    	//---------------------	 'input::onblur': 2,
    	//---------------------	 'input::onchange': 2,
    	//---------------------	 'input::onfocus': 2,
    	//---------------------	 'input::onselect': 2,
    		'input::pattern': 0, //NONE new
    		'input::placeholder': 0, //NONE new
    		'input::readonly': 0, //NONE
    		'input::required': 0, //NONE new
    		'input::step': 0, //NONE new
    		'input::size': 0, //NONE
    		'input::src': 1, //URI
    	//---------------------  'input::tabindex': 0, moved to global
    		'input::type': 0, //NONE
    	//---------------------	 'input::usemap': 11,
    		'input::value': 0, //NONE
    		'input::width': 0, //NONE new
    		'ins::cite': 1, //URI
    		'ins::datetime': 0, //NONE
    	//---------------------  'label::accesskey': 0, moved to global
    		'keygen::autofocus': 0, //NONE new
    		'keygen::challenge': 0, //NONE new
    		'keygen::disabled': 0, //NONE new
    		'keygen::form': 0, //NONE new
    		'keygen::keytype': 0, //NONE new
    		'keygen::name': 8, //LOCAL_NAME new
    		'label::for': 5, //IDREF
    		'label::form': 0, //NONE new
    	//---------------------	 'label::onblur': 2,
    	//---------------------	 'label::onfocus': 2,
    	//---------------------  'legend::accesskey': 0, moved to global
    	//---------------------  'legend::align': 0,
    	//---------------------  'li::type': 0,
    		'link::href': 1, //URI new
    		'link::hreflang': 0, //NONE new
    		'link::media': 0, //NONE new
    		'link::rel': 0, //NONE new
    		'link::sizes': 0, //NONE new
    		'link::type': 0, //NONE new
    		'li::value': 0, //NONE new
    		'map::name': 7, //GLOBAL_NAME
    	//---------------------  'menu::compact': 0,
    		'menu::label': 0, //NONE new
    		'menu::type': 0, //NONE new
    		'meta::charset': 0, //NONE new
    		'meta::content': 0, //NONE new
    		'meta::http-equiv': 0, //NONE new
    		'meta::name': 7, //GLOBAL_NAME new
    		'meter::form': 0, //NONE new
    		'meter::high': 0, //NONE new
    		'meter::low': 0, //NONE new
    		'meter::max': 0, //NONE new
    		'meter::min': 0, //NONE new
    		'meter::optimum': 0, //NONE new
    		'meter::value': 0, //NONE new
    		'object::data': 1, //URI new
    		'object::form': 0, //NONE new
    		'object::height': 0, //NONE new
    		'object::name': 8, //LOCAL_NAME new
    		'object::type': 0, //NONE new
    		'object::usemap': 11, //URI_FRAGMENT new
    		'object::width': 0, //NONE new
    	//---------------------  'ol::compact': 0,
    		'ol::reversed': 0, //NONE new
    		'ol::start': 0, //NONE
    	//---------------------  'ol::type': 0,
    		'optgroup::disabled': 0, //NONE
    		'optgroup::label': 0, //NONE
    		'option::disabled': 0, //NONE
    		'option::label': 0, //NONE
    		'option::selected': 0, //NONE
    		'option::value': 0, //NONE
    		'output::for': 5, //IDREF new
    		'output::form': 0, //NONE new
    		'output::name': 8, //LOCAL_NAME new
    	//---------------------  'p::align': 0,
    		'param::name': 8, //LOCAL_NAME new
    		'param::value': 0, //NONE new
    		'progress::form': 0, //NONE new
    		'progress::max': 0, //NONE new
    		'progress::value': 0, //NONE new
    	//---------------------  'pre::width': 0,
    		'q::cite': 1, //URI
    		'script::async': 0, //NONE new
    		'script::charset': 0, //NONE new
    		'script::defer': 0, //NONE new
    		'script::src': 1, //URI new
    		'script::type': 0, //NONE new
    		'select::autofocus': 0, //NONE new
    		'select::disabled': 0, //NONE
    		'select::form': 0, //NONE new
    		'select::multiple': 0, //NONE
    		'select::name': 8, //LOCAL_NAME
    	//---------------------	 'select::onblur': 2,
    	//---------------------	 'select::onchange': 2,
    	//---------------------	 'select::onfocus': 2,
    		'select::required': 0, //NONE new
    		'select::size': 0, //NONE
    	//---------------------  'select::tabindex': 0, moved to global
    		'source::media': 0, //NONE new
    		'source::src': 1, //URI new
    		'source::type': 0, //NONE new
    		'style::media': 0, //NONE new
    		'style::scoped': 0, //NONE new
    		'style::type': 0, //NONE new
    	//---------------------	 'table::align': 0,
    	//---------------------	 'table::bgcolor': 0,
    		'table::border': 0, //NONE
    	//---------------------	 'table::cellpadding': 0,
    	//---------------------	 'table::cellspacing': 0,
    	//---------------------	 'table::frame': 0,
    	//---------------------	 'table::rules': 0,
    	//---------------------	 'table::summary': 0,
    	//---------------------	 'table::width': 0,
    	//---------------------	 'tbody::align': 0,
    	//---------------------	 'tbody::char': 0,
    	//---------------------	 'tbody::charoff': 0,
    	//---------------------	 'tbody::valign': 0,
    	//---------------------	 'td::abbr': 0,
    	//---------------------	 'td::align': 0,
    	//---------------------	 'td::axis': 0,
    	//---------------------	 'td::bgcolor': 0,
    	//---------------------	 'td::char': 0,
    	//---------------------	 'td::charoff': 0,
    		'td::colspan': 0, //NONE
    		'td::headers': 6, //IDREFS
    	//---------------------	 'td::height': 0,
    	//---------------------	 'td::nowrap': 0,
    		'td::rowspan': 0, //NONE
    	//---------------------	 'td::scope': 0,
    	//---------------------  'td::valign': 0,
    	//---------------------	 'td::width': 0,
    	//---------------------  'textarea::accesskey': 0, moved to global
    		'textarea::autofocus': 0, //NONE new
    		'textarea::cols': 0, //NONE
    		'textarea::disabled': 0, //NONE
    		'textarea::form': 0, //NONE new
    		'textarea::maxlength': 0, //NONE new
    		'textarea::name': 8, //LOCAL_NAME
    	//---------------------	 'textarea::onblur': 2,
    	//---------------------	 'textarea::onchange': 2,
    	//---------------------	 'textarea::onfocus': 2,
    	//---------------------	 'textarea::onselect': 2,
    		'textarea::placeholder': 0, //NONE new
    		'textarea::readonly': 0, //NONE
    		'textarea::required': 0, //NONE new
    		'textarea::rows': 0, //NONE
    		'textarea::wrap': 0, //NONE new
    	//---------------------  'textarea::tabindex': 0, moved to global
    	//---------------------	 'tfoot::align': 0,
    	//---------------------	 'tfoot::char': 0,
    	//---------------------	 'tfoot::charoff': 0,
    	//---------------------	 'tfoot::valign': 0,
    	//---------------------	 'th::abbr': 0,
    	//---------------------	 'th::align': 0,
    	//---------------------	 'th::axis': 0,
    	//---------------------	 'th::bgcolor': 0,
    	//---------------------	 'th::char': 0,
    	//---------------------	 'th::charoff': 0,
    		'th::colspan': 0, //NONE
    		'th::headers': 6, //IDREFS
    	//---------------------	 'th::height': 0,
    	//---------------------	 'th::nowrap': 0,
    		'th::rowspan': 0, //NONE
    		'th::scope': 0, //NONE
    	//---------------------	 'th::valign': 0,
    	//---------------------	 'th::width': 0,
    	//---------------------	 'thead::align': 0,
    	//---------------------	 'thead::char': 0,
    	//---------------------	 'thead::charoff': 0,
    	//---------------------	 'thead::valign': 0,
    		'time::datetime': 0, //NONE new
    		'time::pubdate': 0, //NONE new
    	//---------------------	 'tr::align': 0,
    	//---------------------	 'tr::bgcolor': 0,
    	//---------------------	 'tr::char': 0,
    	//---------------------	 'tr::charoff': 0,
    	//---------------------	 'tr::valign': 0,
    		'track::default': 0, //NONE new
    		'track::kind': 0, //NONE new
    		'track::label': 0, //NONE new
    		'track::src': 1, //URI new
    		'track::srclang': 0, //NONE new
    	//---------------------	 'ul::compact': 0,
    	//---------------------	 'ul::type': 0
    		'video::autoplay': 0, //NONE new
    		'video::controls': 0, //NONE new
    		'video::height': 0, //NONE new
    		'video::loop': 0, //NONE new
    		'video::mediagroup': 0, //NONE new
    		'video::poster': 1, //URI new
    		'video::preload': 0, //NONE new
    		'video::src': 1, //URI new
    		'video::width': 0 //NONE new
    	};
    	html4.eflags = {
    		OPTIONAL_ENDTAG: 1,
    		EMPTY: 2,
    		CDATA: 4,
    		RCDATA: 8,
    		UNSAFE: 16,
    		FOLDABLE: 32,
    		SCRIPT: 64,
    		STYLE: 128
    	};
    	html4.ELEMENTS = {
    		'a': 0,
    		'abbr': 0,
    	//---------------------	 'acronym': 0,
    		'address': 0,
    	//---------------------	 'applet': 16,
    		'area': 2, //EMPTY
    		'article': 0, //new
    		'aside': 0, //new
    		'audio': 0, //new
    		'b': 0,
    		'base': 18, //EMPTY, UNSAFE
    	//---------------------	 'basefont': 18,
    		'bdi': 0, //new
    		'bdo': 0,
    	//---------------------	 'big': 0,
    		'blockquote': 0,
    		'body': 49, //OPTIONAL_ENDTAG, UNSAFE, FOLDABLE
    		'br': 2, //EMPTY
    		'button': 0,
    		'canvas': 0,
    		'caption': 0,
    	//---------------------	 'center': 0,
    		'cite': 0,
    		'code': 0,
    		'col': 2, //EMPTY
    		'colgroup': 1, //OPTIONAL_ENDTAG
    		'command': 2, //EMPTY new
    		'datalist': 0, //new
    		'dd': 1, //OPTIONAL_ENDTAG
    		'del': 0,
    		'details': 0, //new
    		'dfn': 0,
    	//---------------------	 'dir': 0,
    		'div': 0,
    		'dl': 0,
    		'dt': 1, //OPTIONAL_ENDTAG
    		'em': 0,
    		'embed': 18, //EMPTY, UNSAFE new
    		'fieldset': 0,
    		'figcaption': 0, //new
    		'figure': 0, //new
    	//---------------------	 'font': 0,
    		'footer': 0, //new
    		'form': 0,
    	//---------------------	 'frame': 18,
    	//---------------------	 'frameset': 16,
    		'h1': 0,
    		'h2': 0,
    		'h3': 0,
    		'h4': 0,
    		'h5': 0,
    		'h6': 0,
    		'head': 49, //OPTIONAL_ENDTAG, UNSAFE, FOLDABLE
    		'header': 0, //new
    		'hgroup': 0, //new
    		'hr': 2, //EMPTY
    		'html': 49, //OPTIONAL_ENDTAG, UNSAFE, FOLDABLE
    		'i': 0,
    		'iframe': 0, //new
    		'img': 2,//EMPTY
    		'input': 2, //EMPTY
    		'ins': 0,
    	//---------------------	 'isindex': 18,
    		'kbd': 0,
    		'keygen': 2, //EMPTY new
    		'label': 0,
    		'legend': 0,
    		'li': 1, //OPTIONAL_ENDTAG
    		'link': 18, //EMPTY, UNSAFE
    		'map': 0,
    		'mark': 0, //new
    		'menu': 0,
    		'meta': 18, //EMPTY, UNSAFE
    		'meter': 0, //new
    		'nav': 0,
    	//---------------------	 'nobr': 0,
    	//---------------------	 'noembed': 4,
    	//---------------------	 'noframes': 20,
    		'noscript': 20, //CDATA, UNSAFE
    		'object': 16, //UNSAFE
    		'ol': 0,
    		'optgroup': 1, //OPTIONAL_ENDTAG new !!!!vorher 0
    		'option': 1, //OPTIONAL_ENDTAG
    		'output': 0, //new
    		'p': 1, //OPTIONAL_ENDTAG
    		'param': 18, //EMPTY, UNSAFE
    		'pre': 0,
    		'progress': 0, //new
    		'q': 0,
    		'rp': 1, //OPTIONAL_ENDTAG new
    		'rt': 1, //OPTIONAL_ENDTAG new
    		'ruby': 0, //new
    		's': 0,
    		'samp': 0,
    		'script': 84, //CDATA, UNSAFE, SCRIPT
    		'section': 0, //new
    		'select': 0,
    		'small': 0,
    		'source': 2, //EMPTY new
    		'span': 0,
    	//---------------------	 'strike': 0,
    		'strong': 0,
    		'style': 148, //CDATA, UNSAFE, STYLE
    		'sub': 0,
    		'summary': 0, //new
    		'sup': 0,
    		'table': 0,
    		'tbody': 1, //OPTIONAL_ENDTAG
    		'td': 1, //OPTIONAL_ENDTAG
    		'textarea': 8, //RCDATA
    		'tfoot': 1, //OPTIONAL_ENDTAG
    		'th': 1, //OPTIONAL_ENDTAG
    		'thead': 1, //OPTIONAL_ENDTAG
    		'time': 0, //new
    		'title': 24, //RCDATA, UNSAFE
    		'tr': 1, //OPTIONAL_ENDTAG
    		'track': 2, //EMPTY new
    	//---------------------	 'tt': 0,
    		'u': 0,
    		'ul': 0,
    		'var': 0,
    		'video': 0, //new
    		'wbr': 2 //EMPTY new
    	};
    	html4.ueffects = {
    		NOT_LOADED: 0,
    		SAME_DOCUMENT: 1,
    		NEW_DOCUMENT: 2
    	};
    	html4.URIEFFECTS = {
    		'a::href': 2, //NEW_DOCUMENT
    		'area::href': 2, //NEW_DOCUMENT
    		'audio::src': 1, //SAME_DOCUMENT new
    		'base::href':2, //NEW_DOCUMENT new
    		'blockquote::cite': 0, //NOT_LOADED
    	//---------------------	 'body::background': 1,
    		'button::formaction': 2, //NEW_DOCUMENT new
    		'command::icon': 1, //SAME_DOCUMENT new
    		'del::cite': 0, //NOT_LOADED
    		'embed::src': 1, //SAME_DOCUMENT new
    		'form::action': 2, //NEW_DOCUMENT
    		'html:: manifest': 1, //SAME_DOCUMENT new
    		'iframe::src': 1, //SAME_DOCUMENT new
    		'img::src': 1, //SAME_DOCUMENT
    		'input::formaction': 2, //NEW_DOCUMENT new
    		'input::src': 1, //SAME_DOCUMENT
    		'ins::cite': 0, //NOT_LOADED
    		'link::href': 2, //NEW_DOCUMENT new
    		'object::data': 1, //SAME_DOCUMENT new
    		'q::cite': 0, //NOT_LOADED
    		'script::src': 1, //SAME_DOCUMENT new
    		'source::src': 1, //SAME_DOCUMENT new
    		'track::src': 1, //SAME_DOCUMENT new
    		'video::poster': 1, //SAME_DOCUMENT new
    		'video::src': 1 //SAME_DOCUMENT new
    	};
    	html4.ltypes = {
    		UNSANDBOXED: 2,
    		SANDBOXED: 1,
    		DATA: 0
    	};
    	html4.LOADERTYPES = {
    		'a::href': 2, //UNSANDBOXED
    		'area::href': 2, //UNSANDBOXED
    		'audio::src': 1, //SANDBOXED new
    		'base::href': 2, //UNSANDBOXED new
    		'blockquote::cite': 2, //UNSANDBOXED
    	//---------------------	 'body::background': 1,
    		'button::formaction': 2, //UNSANDBOXED new
    		'command::icon': 1, //SANDBOXED new
    		'del::cite': 2, //UNSANDBOXED
    		'embed::src': 1, //SANDBOXED new
    		'form::action': 2, //UNSANDBOXED
    		'html:: manifest': 1, //SANDBOXED new
    		'iframe::src': 1, //SANDBOXED new
    		'img::src': 1, //SANDBOXED
    		'input::formaction': 2, //UNSANDBOXED new
    		'input::src': 1, //SANDBOXED
    		'ins::cite': 2, //UNSANDBOXED
    		'link::href': 2, //UNSANDBOXED new
    		'object::data': 0, //DATA new
    		'q::cite': 2, //UNSANDBOXED
    		'script::src': 1, //SANDBOXED new
    		'source::src': 1, //SANDBOXED new
    		'track::src': 1, //SANDBOXED new
    		'video::poster': 1, //SANDBOXED new
    		'video::src': 1 //SANDBOXED new
    	};if (typeof window !== 'undefined') {
    		window['html4'] = html4;
    	}// Copyright (C) 2006 Google Inc.
    	//
    	// Licensed under the Apache License, Version 2.0 (the "License");
    	// you may not use this file except in compliance with the License.
    	// You may obtain a copy of the License at
    	//
    	//      http://www.apache.org/licenses/LICENSE-2.0
    	//
    	// Unless required by applicable law or agreed to in writing, software
    	// distributed under the License is distributed on an "AS IS" BASIS,
    	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    	// See the License for the specific language governing permissions and
    	// limitations under the License.

    	/**
    	 * @fileoverview
    	 * An HTML sanitizer that can satisfy a variety of security policies.
    	 *
    	 * <p>
    	 * The HTML sanitizer is built around a SAX parser and HTML element and
    	 * attributes schemas.
    	 *
    	 * If the cssparser is loaded, inline styles are sanitized using the
    	 * css property and value schemas.  Else they are remove during
    	 * sanitization.
    	 *
    	 * If it exists, uses parseCssDeclarations, sanitizeCssProperty,  cssSchema
    	 *
    	 * @author mikesamuel@gmail.com
    	 * @author jasvir@gmail.com
    	 * \@requires html4
    	 * \@overrides window
    	 * \@provides html, html_sanitize
    	 */

    	/**
    	 * \@namespace
    	 */
    	var html = (function(html4) {

    	  // For closure compiler
    	  var parseCssDeclarations, sanitizeCssProperty, cssSchema;
    	  if ('undefined' !== typeof window) {
    	    parseCssDeclarations = window['parseCssDeclarations'];
    	    sanitizeCssProperty = window['sanitizeCssProperty'];
    	    cssSchema = window['cssSchema'];
    	  }

    	  var lcase;
    	  // The below may not be true on browsers in the Turkish locale.
    	  if ('script' === 'SCRIPT'.toLowerCase()) {
    	    lcase = function(s) { return s.toLowerCase(); };
    	  } else {
    	    /**
    	     * {\@updoc
    	     * $ lcase('SCRIPT')
    	     * # 'script'
    	     * $ lcase('script')
    	     * # 'script'
    	     * }
    	     */
    	    lcase = function(s) {
    	      return s.replace(
    	          /[A-Z]/g,
    	          function(ch) {
    	            return String.fromCharCode(ch.charCodeAt(0) | 32);
    	          });
    	    };
    	  }

    	  // The keys of this object must be 'quoted' or JSCompiler will mangle them!
    	  var ENTITIES = {
    	    'lt': '<',
    	    'gt': '>',
    	    'amp': '&',
    	    'nbsp': '\xA0',
    	    'quot': '"',
    	    'apos': '\''
    	  };

    	  var decimalEscapeRe = /^#(\d+)$/;
    	  var hexEscapeRe = /^#x([0-9A-Fa-f]+)$/;
    	  /**
    	   * Decodes an HTML entity.
    	   *
    	   * {\@updoc
    	   * $ lookupEntity('lt')
    	   * # '<'
    	   * $ lookupEntity('GT')
    	   * # '>'
    	   * $ lookupEntity('amp')
    	   * # '&'
    	   * $ lookupEntity('nbsp')
    	   * # '\xA0'
    	   * $ lookupEntity('apos')
    	   * # "'"
    	   * $ lookupEntity('quot')
    	   * # '"'
    	   * $ lookupEntity('#xa')
    	   * # '\n'
    	   * $ lookupEntity('#10')
    	   * # '\n'
    	   * $ lookupEntity('#x0a')
    	   * # '\n'
    	   * $ lookupEntity('#010')
    	   * # '\n'
    	   * $ lookupEntity('#x00A')
    	   * # '\n'
    	   * $ lookupEntity('Pi')      // Known failure
    	   * # '\u03A0'
    	   * $ lookupEntity('pi')      // Known failure
    	   * # '\u03C0'
    	   * }
    	   *
    	   * @param {string} name the content between the '&' and the ';'.
    	   * @return {string} a single unicode code-point as a string.
    	   */
    	  function lookupEntity(name) {
    	    name = lcase(name);  // TODO: &pi; is different from &Pi;
    	    if (ENTITIES.hasOwnProperty(name)) { return ENTITIES[name]; }
    	    var m = name.match(decimalEscapeRe);
    	    if (m) {
    	      return String.fromCharCode(parseInt(m[1], 10));
    	    } else if (!!(m = name.match(hexEscapeRe))) {
    	      return String.fromCharCode(parseInt(m[1], 16));
    	    }
    	    return '';
    	  }

    	  function decodeOneEntity(_, name) {
    	    return lookupEntity(name);
    	  }

    	  var nulRe = /\0/g;
    	  function stripNULs(s) {
    	    return s.replace(nulRe, '');
    	  }

    	  var entityRe = /&(#\d+|#x[0-9A-Fa-f]+|\w+);/g;
    	  /**
    	   * The plain text of a chunk of HTML CDATA which possibly containing.
    	   *
    	   * {\@updoc
    	   * $ unescapeEntities('')
    	   * # ''
    	   * $ unescapeEntities('hello World!')
    	   * # 'hello World!'
    	   * $ unescapeEntities('1 &lt; 2 &amp;&AMP; 4 &gt; 3&#10;')
    	   * # '1 < 2 && 4 > 3\n'
    	   * $ unescapeEntities('&lt;&lt <- unfinished entity&gt;')
    	   * # '<&lt <- unfinished entity>'
    	   * $ unescapeEntities('/foo?bar=baz&copy=true')  // & often unescaped in URLS
    	   * # '/foo?bar=baz&copy=true'
    	   * $ unescapeEntities('pi=&pi;&#x3c0;, Pi=&Pi;\u03A0') // FIXME: known failure
    	   * # 'pi=\u03C0\u03c0, Pi=\u03A0\u03A0'
    	   * }
    	   *
    	   * @param {string} s a chunk of HTML CDATA.  It must not start or end inside
    	   *     an HTML entity.
    	   */
    	  function unescapeEntities(s) {
    	    return s.replace(entityRe, decodeOneEntity);
    	  }

    	  var ampRe = /&/g;
    	  var looseAmpRe = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi;
    	  var ltRe = /[<]/g;
    	  var gtRe = />/g;
    	  var quotRe = /\"/g;

    	  /**
    	   * Escapes HTML special characters in attribute values.
    	   *
    	   * {\@updoc
    	   * $ escapeAttrib('')
    	   * # ''
    	   * $ escapeAttrib('"<<&==&>>"')  // Do not just escape the first occurrence.
    	   * # '&#34;&lt;&lt;&amp;&#61;&#61;&amp;&gt;&gt;&#34;'
    	   * $ escapeAttrib('Hello <World>!')
    	   * # 'Hello &lt;World&gt;!'
    	   * }
    	   */
    	  function escapeAttrib(s) {
    	    return ('' + s).replace(ampRe, '&amp;').replace(ltRe, '&lt;')
    	        .replace(gtRe, '&gt;').replace(quotRe, '&#34;');
    	  }

    	  /**
    	   * Escape entities in RCDATA that can be escaped without changing the meaning.
    	   * {\@updoc
    	   * $ normalizeRCData('1 < 2 &&amp; 3 > 4 &amp;& 5 &lt; 7&8')
    	   * # '1 &lt; 2 &amp;&amp; 3 &gt; 4 &amp;&amp; 5 &lt; 7&amp;8'
    	   * }
    	   */
    	  function normalizeRCData(rcdata) {
    	    return rcdata
    	        .replace(looseAmpRe, '&amp;$1')
    	        .replace(ltRe, '&lt;')
    	        .replace(gtRe, '&gt;');
    	  }

    	  // TODO(mikesamuel): validate sanitizer regexs against the HTML5 grammar at
    	  // http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html
    	  // http://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html
    	  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html
    	  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html

    	  // We initially split input so that potentially meaningful characters
    	  // like '<' and '>' are separate tokens, using a fast dumb process that
    	  // ignores quoting.  Then we walk that token stream, and when we see a
    	  // '<' that's the start of a tag, we use ATTR_RE to extract tag
    	  // attributes from the next token.  That token will never have a '>'
    	  // character.  However, it might have an unbalanced quote character, and
    	  // when we see that, we combine additional tokens to balance the quote.

    	  var ATTR_RE = new RegExp(
    	    '^\\s*' +
    	    '([a-z][a-z-]*)' +          // 1 = Attribute name
    	    '(?:' + (
    	      '\\s*(=)\\s*' +           // 2 = Is there a value?
    	      '(' + (                   // 3 = Attribute value
    	        // TODO(felix8a): maybe use backref to match quotes
    	        '(\")[^\"]*(\"|$)' +    // 4, 5 = Double-quoted string
    	        '|' +
    	        '(\')[^\']*(\'|$)' +    // 6, 7 = Single-quoted string
    	        '|' +
    	        // Positive lookahead to prevent interpretation of
    	        // <foo a= b=c> as <foo a='b=c'>
    	        // TODO(felix8a): might be able to drop this case
    	        '(?=[a-z][a-z-]*\\s*=)' +
    	        '|' +
    	        // Unquoted value that isn't an attribute name
    	        // (since we didn't match the positive lookahead above)
    	        '[^\"\'\\s]*' ) +
    	      ')' ) +
    	    ')?',
    	    'i');

    	  var ENTITY_RE = /^(#[0-9]+|#x[0-9a-f]+|\w+);/i;

    	  // false on IE<=8, true on most other browsers
    	  var splitWillCapture = ('a,b'.split(/(,)/).length === 3);

    	  // bitmask for tags with special parsing, like <script> and <textarea>
    	  var EFLAGS_TEXT = html4.eflags.CDATA | html4.eflags.RCDATA;

    	  /**
    	   * Given a SAX-like event handler, produce a function that feeds those
    	   * events and a parameter to the event handler.
    	   *
    	   * The event handler has the form:{@code
    	   * {
    	   *   // Name is an upper-case HTML tag name.  Attribs is an array of
    	   *   // alternating upper-case attribute names, and attribute values.  The
    	   *   // attribs array is reused by the parser.  Param is the value passed to
    	   *   // the saxParser.
    	   *   startTag: function (name, attribs, param) { ... },
    	   *   endTag:   function (name, param) { ... },
    	   *   pcdata:   function (text, param) { ... },
    	   *   rcdata:   function (text, param) { ... },
    	   *   cdata:    function (text, param) { ... },
    	   *   startDoc: function (param) { ... },
    	   *   endDoc:   function (param) { ... }
    	   * }}
    	   *
    	   * @param {Object} handler a record containing event handlers.
    	   * @return {function(string, Object)} A function that takes a chunk of HTML
    	   *     and a parameter.  The parameter is passed on to the handler methods.
    	   */
    	  function makeSaxParser(handler) {
    	    return function(htmlText, param) {
    	      return parse(htmlText, handler, param);
    	    };
    	  }

    	  // Parsing strategy is to split input into parts that might be lexically
    	  // meaningful (every ">" becomes a separate part), and then recombine
    	  // parts if we discover they're in a different context.

    	  // Note, html-sanitizer filters unknown tags here, even though they also
    	  // get filtered out by the sanitizer's handler.  This is back-compat
    	  // behavior; makeSaxParser is public.

    	  // TODO(felix8a): Significant performance regressions from -legacy,
    	  // tested on
    	  //    Chrome 18.0
    	  //    Firefox 11.0
    	  //    IE 6, 7, 8, 9
    	  //    Opera 11.61
    	  //    Safari 5.1.3
    	  // Many of these are unusual patterns that are linearly slower and still
    	  // pretty fast (eg 1ms to 5ms), so not necessarily worth fixing.

    	  // TODO(felix8a): "<script> && && && ... <\/script>" is slower on all
    	  // browsers.  The hotspot is htmlSplit.

    	  // TODO(felix8a): "<p title='>>>>...'><\/p>" is slower on all browsers.
    	  // This is partly htmlSplit, but the hotspot is parseTagAndAttrs.

    	  // TODO(felix8a): "<a><\/a><a><\/a>..." is slower on IE9.
    	  // "<a>1<\/a><a>1<\/a>..." is faster, "<a><\/a>2<a><\/a>2..." is faster.

    	  // TODO(felix8a): "<p<p<p..." is slower on IE[6-8]

    	  var continuationMarker = {};
    	  function parse(htmlText, handler, param) {
    	    var parts = htmlSplit(htmlText);
    	    var state = {
    	      noMoreGT: false,
    	      noMoreEndComments: false
    	    };
    	    parseCPS(handler, parts, 0, state, param);
    	  }

    	  function continuationMaker(h, parts, initial, state, param) {
    	    return function () {
    	      parseCPS(h, parts, initial, state, param);
    	    };
    	  }

    	  function parseCPS(h, parts, initial, state, param) {
    	    try {
    	      if (h.startDoc && initial == 0) { h.startDoc(param); }
    	      var m, p, tagName;
    	      for (var pos = initial, end = parts.length; pos < end;) {
    	        var current = parts[pos++];
    	        var next = parts[pos];
    	        switch (current) {
    	        case '&':
    	          if (ENTITY_RE.test(next)) {
    	            if (h.pcdata) {
    	              h.pcdata('&' + next, param, continuationMarker,
    	                continuationMaker(h, parts, pos, state, param));
    	            }
    	            pos++;
    	          } else {
    	            if (h.pcdata) { h.pcdata("&amp;", param, continuationMarker,
    	                continuationMaker(h, parts, pos, state, param));
    	            }
    	          }
    	          break;
    	        case '<\/':
    	          if (m = /^(\w+)[^\'\"]*/.exec(next)) {
    	            if (m[0].length === next.length && parts[pos + 1] === '>') {
    	              // fast case, no attribute parsing needed
    	              pos += 2;
    	              tagName = lcase(m[1]);
    	              if (html4.ELEMENTS.hasOwnProperty(tagName)) {
    	                if (h.endTag) {
    	                  h.endTag(tagName, param, continuationMarker,
    	                    continuationMaker(h, parts, pos, state, param));
    	                }
    	              }
    	            } else {
    	              // slow case, need to parse attributes
    	              // TODO(felix8a): do we really care about misparsing this?
    	              pos = parseEndTag(
    	                parts, pos, h, param, continuationMarker, state);
    	            }
    	          } else {
    	            if (h.pcdata) {
    	              h.pcdata('&lt;/', param, continuationMarker,
    	                continuationMaker(h, parts, pos, state, param));
    	            }
    	          }
    	          break;
    	        case '<':
    	          if (m = /^(\w+)\s*\/?/.exec(next)) {
    	            if (m[0].length === next.length && parts[pos + 1] === '>') {
    	              // fast case, no attribute parsing needed
    	              pos += 2;
    	              tagName = lcase(m[1]);
    	              if (html4.ELEMENTS.hasOwnProperty(tagName)) {
    	                if (h.startTag) {
    	                  h.startTag(tagName, [], param, continuationMarker,
    	                    continuationMaker(h, parts, pos, state, param));
    	                }
    	                // tags like <script> and <textarea> have special parsing
    	                var eflags = html4.ELEMENTS[tagName];
    	                if (eflags & EFLAGS_TEXT) {
    	                  var tag = { name: tagName, next: pos, eflags: eflags };
    	                  pos = parseText(
    	                    parts, tag, h, param, continuationMarker, state);
    	                }
    	              }
    	            } else {
    	              // slow case, need to parse attributes
    	              pos = parseStartTag(
    	                parts, pos, h, param, continuationMarker, state);
    	            }
    	          } else {
    	            if (h.pcdata) {
    	              h.pcdata('&lt;', param, continuationMarker,
    	                continuationMaker(h, parts, pos, state, param));
    	            }
    	          }
    	          break;
    	        case '<\!--':
    	          // The pathological case is n copies of '<\!--' without '-->', and
    	          // repeated failure to find '-->' is quadratic.  We avoid that by
    	          // remembering when search for '-->' fails.
    	          if (!state.noMoreEndComments) {
    	            // A comment <\!--x--> is split into three tokens:
    	            //   '<\!--', 'x--', '>'
    	            // We want to find the next '>' token that has a preceding '--'.
    	            // pos is at the 'x--'.
    	            for (p = pos + 1; p < end; p++) {
    	              if (parts[p] === '>' && /--$/.test(parts[p - 1])) { break; }
    	            }
    	            if (p < end) {
    	              pos = p + 1;
    	            } else {
    	              state.noMoreEndComments = true;
    	            }
    	          }
    	          if (state.noMoreEndComments) {
    	            if (h.pcdata) {
    	              h.pcdata('&lt;!--', param, continuationMarker,
    	                continuationMaker(h, parts, pos, state, param));
    	            }
    	          }
    	          break;
    	        case '<\!':
    	          if (!/^\w/.test(next)) {
    	            if (h.pcdata) {
    	              h.pcdata('&lt;!', param, continuationMarker,
    	                continuationMaker(h, parts, pos, state, param));
    	            }
    	          } else {
    	            // similar to noMoreEndComment logic
    	            if (!state.noMoreGT) {
    	              for (p = pos + 1; p < end; p++) {
    	                if (parts[p] === '>') { break; }
    	              }
    	              if (p < end) {
    	                pos = p + 1;
    	              } else {
    	                state.noMoreGT = true;
    	              }
    	            }
    	            if (state.noMoreGT) {
    	              if (h.pcdata) {
    	                h.pcdata('&lt;!', param, continuationMarker,
    	                  continuationMaker(h, parts, pos, state, param));
    	              }
    	            }
    	          }
    	          break;
    	        case '<?':
    	          // similar to noMoreEndComment logic
    	          if (!state.noMoreGT) {
    	            for (p = pos + 1; p < end; p++) {
    	              if (parts[p] === '>') { break; }
    	            }
    	            if (p < end) {
    	              pos = p + 1;
    	            } else {
    	              state.noMoreGT = true;
    	            }
    	          }
    	          if (state.noMoreGT) {
    	            if (h.pcdata) {
    	              h.pcdata('&lt;?', param, continuationMarker,
    	                continuationMaker(h, parts, pos, state, param));
    	            }
    	          }
    	          break;
    	        case '>':
    	          if (h.pcdata) {
    	            h.pcdata("&gt;", param, continuationMarker,
    	              continuationMaker(h, parts, pos, state, param));
    	          }
    	          break;
    	        case '':
    	          break;
    	        default:
    	          if (h.pcdata) {
    	            h.pcdata(current, param, continuationMarker,
    	              continuationMaker(h, parts, pos, state, param));
    	          }
    	          break;
    	        }
    	      }
    	      if (h.endDoc) { h.endDoc(param); }
    	    } catch (e) {
    	      if (e !== continuationMarker) { throw e; }
    	    }
    	  }

    	  // Split str into parts for the html parser.
    	  function htmlSplit(str) {
    	    // can't hoist this out of the function because of the re.exec loop.
    	    var re = /(<\/|<\!--|<[!?]|[&<>])/g;
    	    str += '';
    	    if (splitWillCapture) {
    	      return str.split(re);
    	    } else {
    	      var parts = [];
    	      var lastPos = 0;
    	      var m;
    	      while ((m = re.exec(str)) !== null) {
    	        parts.push(str.substring(lastPos, m.index));
    	        parts.push(m[0]);
    	        lastPos = m.index + m[0].length;
    	      }
    	      parts.push(str.substring(lastPos));
    	      return parts;
    	    }
    	  }

    	  function parseEndTag(parts, pos, h, param, continuationMarker, state) {
    	    var tag = parseTagAndAttrs(parts, pos);
    	    // drop unclosed tags
    	    if (!tag) { return parts.length; }
    	    if (tag.eflags !== void 0) {
    	      if (h.endTag) {
    	        h.endTag(tag.name, param, continuationMarker,
    	          continuationMaker(h, parts, pos, state, param));
    	      }
    	    }
    	    return tag.next;
    	  }

    	  function parseStartTag(parts, pos, h, param, continuationMarker, state) {
    	    var tag = parseTagAndAttrs(parts, pos);
    	    // drop unclosed tags
    	    if (!tag) { return parts.length; }
    	    if (tag.eflags !== void 0) {
    	      if (h.startTag) {
    	        h.startTag(tag.name, tag.attrs, param, continuationMarker,
    	          continuationMaker(h, parts, tag.next, state, param));
    	      }
    	      // tags like <script> and <textarea> have special parsing
    	      if (tag.eflags & EFLAGS_TEXT) {
    	        return parseText(parts, tag, h, param, continuationMarker, state);
    	      }
    	    }
    	    return tag.next;
    	  }

    	  var endTagRe = {};

    	  // Tags like <script> and <textarea> are flagged as CDATA or RCDATA,
    	  // which means everything is text until we see the correct closing tag.
    	  function parseText(parts, tag, h, param, continuationMarker, state) {
    	    var end = parts.length;
    	    if (!endTagRe.hasOwnProperty(tag.name)) {
    	      endTagRe[tag.name] = new RegExp('^' + tag.name + '(?:[\\s\\/]|$)', 'i');
    	    }
    	    var re = endTagRe[tag.name];
    	    var first = tag.next;
    	    var p = tag.next + 1;
    	    for (; p < end; p++) {
    	      if (parts[p - 1] === '<\/' && re.test(parts[p])) { break; }
    	    }
    	    if (p < end) { p -= 1; }
    	    var buf = parts.slice(first, p).join('');
    	    if (tag.eflags & html4.eflags.CDATA) {
    	      if (h.cdata) {
    	        h.cdata(buf, param, continuationMarker,
    	          continuationMaker(h, parts, p, state, param));
    	      }
    	    } else if (tag.eflags & html4.eflags.RCDATA) {
    	      if (h.rcdata) {
    	        h.rcdata(normalizeRCData(buf), param, continuationMarker,
    	          continuationMaker(h, parts, p, state, param));
    	      }
    	    } else {
    	      throw new Error('bug');
    	    }
    	    return p;
    	  }

    	  // at this point, parts[pos-1] is either "<" or "<\/".
    	  function parseTagAndAttrs(parts, pos) {
    	    var m = /^(\w+)/.exec(parts[pos]);
    	    var tag = { name: lcase(m[1]) };
    	    if (html4.ELEMENTS.hasOwnProperty(tag.name)) {
    	      tag.eflags = html4.ELEMENTS[tag.name];
    	    } else {
    	      tag.eflags = void 0;
    	    }
    	    var buf = parts[pos].substr(m[0].length);
    	    // Find the next '>'.  We optimistically assume this '>' is not in a
    	    // quoted context, and further down we fix things up if it turns out to
    	    // be quoted.
    	    var p = pos + 1;
    	    var end = parts.length;
    	    for (; p < end; p++) {
    	      if (parts[p] === '>') { break; }
    	      buf += parts[p];
    	    }
    	    if (end <= p) { return void 0; }
    	    var attrs = [];
    	    while (buf !== '') {
    	      m = ATTR_RE.exec(buf);
    	      if (!m) {
    	        // No attribute found: skip garbage
    	        buf = buf.replace(/^[\s\S][^a-z\s]*/, '');

    	      } else if ((m[4] && !m[5]) || (m[6] && !m[7])) {
    	        // Unterminated quote: slurp to the next unquoted '>'
    	        var quote = m[4] || m[6];
    	        var sawQuote = false;
    	        var abuf = [buf, parts[p++]];
    	        for (; p < end; p++) {
    	          if (sawQuote) {
    	            if (parts[p] === '>') { break; }
    	          } else if (0 <= parts[p].indexOf(quote)) {
    	            sawQuote = true;
    	          }
    	          abuf.push(parts[p]);
    	        }
    	        // Slurp failed: lose the garbage
    	        if (end <= p) { break; }
    	        // Otherwise retry attribute parsing
    	        buf = abuf.join('');
    	        continue;

    	      } else {
    	        // We have an attribute
    	        var aName = lcase(m[1]);
    	        var aValue = m[2] ? decodeValue(m[3]) : aName;
    	        attrs.push(aName, aValue);
    	        buf = buf.substr(m[0].length);
    	      }
    	    }
    	    tag.attrs = attrs;
    	    tag.next = p + 1;
    	    return tag;
    	  }

    	  function decodeValue(v) {
    	    var q = v.charCodeAt(0);
    	    if (q === 0x22 || q === 0x27) { // " or '
    	      v = v.substr(1, v.length - 2);
    	    }
    	    return unescapeEntities(stripNULs(v));
    	  }

    	  /**
    	   * Returns a function that strips unsafe tags and attributes from html.
    	   * @param {function(string, Array.<string>): ?Array.<string>} tagPolicy
    	   *     A function that takes (tagName, attribs[]), where tagName is a key in
    	   *     html4.ELEMENTS and attribs is an array of alternating attribute names
    	   *     and values.  It should return a sanitized attribute array, or null to
    	   *     delete the tag.  It's okay for tagPolicy to modify the attribs array,
    	   *     but the same array is reused, so it should not be held between calls.
    	   * @return {function(string, Array)} A function that sanitizes a string of
    	   *     HTML and appends result strings to the second argument, an array.
    	   */
    	  function makeHtmlSanitizer(tagPolicy) {
    	    var stack;
    	    var ignoring;
    	    var emit = function (text, out) {
    	      if (!ignoring) { out.push(text); }
    	    };
    	    return makeSaxParser({
    	      startDoc: function(_) {
    	        stack = [];
    	        ignoring = false;
    	      },
    	      startTag: function(tagName, attribs, out) {
    	        if (ignoring) { return; }
    	        if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
    	        var eflags = html4.ELEMENTS[tagName];
    	        if (eflags & html4.eflags.FOLDABLE) {
    	          return;
    	        }
    	        attribs = tagPolicy(tagName, attribs);
    	        if (!attribs) {
    	          ignoring = !(eflags & html4.eflags.EMPTY);
    	          return;
    	        }
    	        // TODO(mikesamuel): relying on tagPolicy not to insert unsafe
    	        // attribute names.
    	        if (!(eflags & html4.eflags.EMPTY)) {
    	          stack.push(tagName);
    	        }

    	        out.push('<', tagName);
    	        for (var i = 0, n = attribs.length; i < n; i += 2) {
    	          var attribName = attribs[i],
    	              value = attribs[i + 1];
    	          if (value !== null && value !== void 0) {
    	            out.push(' ', attribName, '="', escapeAttrib(value), '"');
    	          }
    	        }
    	        out.push('>');
    	      },
    	      endTag: function(tagName, out) {
    	        if (ignoring) {
    	          ignoring = false;
    	          return;
    	        }
    	        if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
    	        var eflags = html4.ELEMENTS[tagName];
    	        if (!(eflags & (html4.eflags.EMPTY | html4.eflags.FOLDABLE))) {
    	          var index;
    	          if (eflags & html4.eflags.OPTIONAL_ENDTAG) {
    	            for (index = stack.length; --index >= 0;) {
    	              var stackEl = stack[index];
    	              if (stackEl === tagName) { break; }
    	              if (!(html4.ELEMENTS[stackEl] &
    	                    html4.eflags.OPTIONAL_ENDTAG)) {
    	                // Don't pop non optional end tags looking for a match.
    	                return;
    	              }
    	            }
    	          } else {
    	            for (index = stack.length; --index >= 0;) {
    	              if (stack[index] === tagName) { break; }
    	            }
    	          }
    	          if (index < 0) { return; }  // Not opened.
    	          for (var i = stack.length; --i > index;) {
    	            var stackEl = stack[i];
    	            if (!(html4.ELEMENTS[stackEl] &
    	                  html4.eflags.OPTIONAL_ENDTAG)) {
    	              out.push('<\/', stackEl, '>');
    	            }
    	          }
    	          stack.length = index;
    	          out.push('<\/', tagName, '>');
    	        }
    	      },
    	      pcdata: emit,
    	      rcdata: emit,
    	      cdata: emit,
    	      endDoc: function(out) {
    	        for (; stack.length; stack.length--) {
    	          out.push('<\/', stack[stack.length - 1], '>');
    	        }
    	      }
    	    });
    	  }

    	  // From RFC3986
    	  var URI_SCHEME_RE = new RegExp(
    	      '^' +
    	      '(?:' +
    	        '([^:\/?# ]+)' +         // scheme
    	      ':)?'
    	  );

    	  var ALLOWED_URI_SCHEMES = /^(?:https?|mailto)$/i;

    	  function safeUri(uri, naiveUriRewriter) {
    	    if (!naiveUriRewriter) { return null; }
    	    var parsed = ('' + uri).match(URI_SCHEME_RE);
    	    if (parsed && (!parsed[1] || ALLOWED_URI_SCHEMES.test(parsed[1]))) {
    	      return naiveUriRewriter(uri);
    	    } else {
    	      return null;
    	    }
    	  }

    	  /**
    	   * Sanitizes attributes on an HTML tag.
    	   * @param {string} tagName An HTML tag name in lowercase.
    	   * @param {Array.<?string>} attribs An array of alternating names and values.
    	   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
    	   *     apply to URI attributes; it can return a new string value, or null to
    	   *     delete the attribute.  If unspecified, URI attributes are deleted.
    	   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
    	   *     to attributes containing HTML names, element IDs, and space-separated
    	   *     lists of classes; it can return a new string value, or null to delete
    	   *     the attribute.  If unspecified, these attributes are kept unchanged.
    	   * @return {Array.<?string>} The sanitized attributes as a list of alternating
    	   *     names and values, where a null value means to omit the attribute.
    	   */
    	  function sanitizeAttribs(
    	      tagName, attribs, opt_naiveUriRewriter, opt_nmTokenPolicy) {
    	    for (var i = 0; i < attribs.length; i += 2) {
    	      var attribName = attribs[i];
    	      var value = attribs[i + 1];
    	      var atype = null, attribKey;
    	      if ((attribKey = tagName + '::' + attribName,
    	           html4.ATTRIBS.hasOwnProperty(attribKey)) ||
    	          (attribKey = '*::' + attribName,
    	           html4.ATTRIBS.hasOwnProperty(attribKey))) {
    	        atype = html4.ATTRIBS[attribKey];
    	      }
    	      if (atype !== null) {
    	        switch (atype) {
    	          case html4.atype.NONE: break;
    	          case html4.atype.SCRIPT:
    	            value = null;
    	            break;
    	          case html4.atype.STYLE:
    	            if ('undefined' === typeof parseCssDeclarations) {
    	              value = null;
    	              break;
    	            }
    	            var sanitizedDeclarations = [];
    	            parseCssDeclarations(
    	                value,
    	                {
    	                  declaration: function (property, tokens) {
    	                    var normProp = property.toLowerCase();
    	                    var schema = cssSchema[normProp];
    	                    if (!schema) {
    	                      return;
    	                    }
    	                    sanitizeCssProperty(
    	                        normProp, schema, tokens,
    	                        opt_naiveUriRewriter);
    	                    sanitizedDeclarations.push(property + ': ' + tokens.join(' '));
    	                  }
    	                });
    	            value = sanitizedDeclarations.length > 0 ? sanitizedDeclarations.join(' ; ') : null;
    	            break;
    	          case html4.atype.ID:
    	          case html4.atype.IDREF:
    	          case html4.atype.IDREFS:
    	          case html4.atype.GLOBAL_NAME:
    	          case html4.atype.LOCAL_NAME:
    	          case html4.atype.CLASSES:
    	            value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
    	            break;
    	          case html4.atype.URI:
    	            value = safeUri(value, opt_naiveUriRewriter);
    	            break;
    	          case html4.atype.URI_FRAGMENT:
    	            if (value && '#' === value.charAt(0)) {
    	              value = value.substring(1);  // remove the leading '#'
    	              value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
    	              if (value !== null && value !== void 0) {
    	                value = '#' + value;  // restore the leading '#'
    	              }
    	            } else {
    	              value = null;
    	            }
    	            break;
    	          default:
    	            value = null;
    	            break;
    	        }
    	      } else {
    	        value = null;
    	      }
    	      attribs[i + 1] = value;
    	    }
    	    return attribs;
    	  }

    	  /**
    	   * Creates a tag policy that omits all tags marked UNSAFE in html4-defs.js
    	   * and applies the default attribute sanitizer with the supplied policy for
    	   * URI attributes and NMTOKEN attributes.
    	   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
    	   *     apply to URI attributes.  If not given, URI attributes are deleted.
    	   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
    	   *     to attributes containing HTML names, element IDs, and space-separated
    	   *     lists of classes.  If not given, such attributes are left unchanged.
    	   * @return {function(string, Array.<?string>)} A tagPolicy suitable for
    	   *     passing to html.sanitize.
    	   */
    	  function makeTagPolicy(opt_naiveUriRewriter, opt_nmTokenPolicy) {
    	    return function(tagName, attribs) {
    	      if (!(html4.ELEMENTS[tagName] & html4.eflags.UNSAFE)) {
    	        return sanitizeAttribs(
    	            tagName, attribs, opt_naiveUriRewriter, opt_nmTokenPolicy);
    	      }
    	    };
    	  }

    	  /**
    	   * Sanitizes HTML tags and attributes according to a given policy.
    	   * @param {string} inputHtml The HTML to sanitize.
    	   * @param {function(string, Array.<?string>)} tagPolicy A function that
    	   *     decides which tags to accept and sanitizes their attributes (see
    	   *     makeHtmlSanitizer above for details).
    	   * @return {string} The sanitized HTML.
    	   */
    	  function sanitizeWithPolicy(inputHtml, tagPolicy) {
    	    var outputArray = [];
    	    makeHtmlSanitizer(tagPolicy)(inputHtml, outputArray);
    	    return outputArray.join('');
    	  }

    	  /**
    	   * Strips unsafe tags and attributes from HTML.
    	   * @param {string} inputHtml The HTML to sanitize.
    	   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
    	   *     apply to URI attributes.  If not given, URI attributes are deleted.
    	   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
    	   *     to attributes containing HTML names, element IDs, and space-separated
    	   *     lists of classes.  If not given, such attributes are left unchanged.
    	   */
    	  function sanitize(inputHtml, opt_naiveUriRewriter, opt_nmTokenPolicy) {
    	    var tagPolicy = makeTagPolicy(opt_naiveUriRewriter, opt_nmTokenPolicy);
    	    return sanitizeWithPolicy(inputHtml, tagPolicy);
    	  }

    	  return {
    	    escapeAttrib: escapeAttrib,
    	    makeHtmlSanitizer: makeHtmlSanitizer,
    	    makeSaxParser: makeSaxParser,
    	    makeTagPolicy: makeTagPolicy,
    	    normalizeRCData: normalizeRCData,
    	    sanitize: sanitize,
    	    sanitizeAttribs: sanitizeAttribs,
    	    sanitizeWithPolicy: sanitizeWithPolicy,
    	    unescapeEntities: unescapeEntities
    	  };
    	})(html4);

    	var html_sanitize = html.sanitize;

    	// Exports for closure compiler.  Note this file is also cajoled
    	// for domado and run in an environment without 'window'
    	if (typeof window !== 'undefined') {
    	  window['html'] = html;
    	  window['html_sanitize'] = html_sanitize;
    	}

    	}());
    	return cajaHtmlSanitizer;
    }

    requireCajaHtmlSanitizer();

    /*!
     * OpenUI5
     * (c) Copyright 2026 SAP SE or an SAP affiliate company.
     * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
     */
    /*
     * IMPORTANT: This is a private module, its API must not be used and is subject to change.
     * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
     */
    /**
     * Strips unsafe tags and attributes from HTML.
     *
     * @function
     * @since 1.58
     * @alias module:sap/base/security/sanitizeHTML
     * @param {string} sHTML the HTML to be sanitized.
     * @param {object} [mOptions={}] options for the sanitizer
     * @return {string} sanitized HTML
     * @private
     */
    var fnSanitizeHTML = function (sHTML, mOptions) {
      fnAssert(globalThis.html && globalThis.html.sanitize, "Sanitizer should have been loaded");
      mOptions = mOptions || {
        uriRewriter: function (sUrl) {
          // by default, we use the URLListValidator to check the URLs

          if (oURLListValidator.validate(sUrl)) {
            return sUrl;
          }
        }
      };
      var oTagPolicy = mOptions.tagPolicy || globalThis.html.makeTagPolicy(mOptions.uriRewriter, mOptions.tokenPolicy);
      return globalThis.html.sanitizeWithPolicy(sHTML, oTagPolicy);
    };

    const a=new Map,t=new Map;t.set("S",[0,599]),t.set("M",[600,1023]),t.set("L",[1024,1439]),t.set("XL",[1440,1/0]);var S=(e=>(e.RANGE_4STEPS="4Step",e))(S||{});const o=(r,e)=>{a.set(r,e);},c=(r,e=window.innerWidth)=>{let n=a.get(r);n||(n=a.get("4Step"));let g;const s=Math.floor(e);return n.forEach((R,E)=>{s>=R[0]&&s<=R[1]&&(g=E);}),g||[...n.keys()][0]},i={RANGESETS:S,initRangeSet:o,getCurrentRange:c};i.initRangeSet(i.RANGESETS.RANGE_4STEPS,t);

    // animations/

    var PackageModule = /*#__PURE__*/Object.freeze({
        __proto__: null,
        EventProvider: ManagedStyles.i$1,
        I18nBundle: Icons.u,
        ItemNavigation: f$1,
        MediaRange: i,
        RegisteredIconCollection: Icons.t,
        ResizeHandler: f,
        ScrollEnablement: v,
        UI5Element: b$1,
        URLListValidator: oURLListValidator,
        addCustomCSS: g$1,
        applyDirection: i$1,
        attachBoot: ManagedStyles.O,
        attachDirectionChange: a$1,
        attachLanguageChange: ManagedStyles.t,
        attachThemeLoaded: ManagedStyles.o$1,
        cancelRender: ManagedStyles.P$2,
        customElement: m$4,
        default: b$1,
        detachDirectionChange: c$1,
        detachLanguageChange: ManagedStyles.r$2,
        detachThemeLoaded: ManagedStyles.n,
        event: b$5,
        getAnimationMode: ManagedStyles.m$3,
        getCalendarType: ManagedStyles.i$3,
        getCustomElementsScopingRules: ManagedStyles.m$4,
        getCustomElementsScopingSuffix: ManagedStyles.c$2,
        getDefaultIconCollection: Icons.c,
        getDefaultLanguage: ManagedStyles.D,
        getDefaultTheme: ManagedStyles.y,
        getEffectiveDir: r$2,
        getEffectiveIconCollection: Icons.i,
        getEffectiveScopingSuffixForTag: ManagedStyles.d$1,
        getFetchDefaultLanguage: ManagedStyles.A$1,
        getFirstDayOfWeek: ManagedStyles.n$5,
        getI18nBundle: Icons.f,
        getIgnoreUrlParams: ManagedStyles.a$4,
        getLanguage: ManagedStyles.C,
        getLegacyDateCalendarCustomizing: ManagedStyles.m$5,
        getNoConflict: ManagedStyles.o$2,
        getTheme: ManagedStyles.r,
        isAndroid: ManagedStyles.P,
        isChrome: ManagedStyles.g,
        isCombi: ManagedStyles.m$1,
        isDesktop: ManagedStyles.f$1,
        isFirefox: ManagedStyles.b$1,
        isIOS: ManagedStyles.w$1,
        isPhone: ManagedStyles.d,
        isSafari: ManagedStyles.h,
        isTablet: ManagedStyles.a$1,
        property: s$9,
        registerCustomI18nBundleGetter: Icons.y$1,
        registerI18nLoader: Icons.$,
        registerIconLoader: Icons.C,
        registerLocaleDataLoader: m$1,
        registerThemePropertiesLoader: ManagedStyles.f,
        renderDeferred: ManagedStyles.l$3,
        renderFinished: ManagedStyles.w,
        renderImmediately: ManagedStyles.u$1,
        sanitizeHTML: fnSanitizeHTML,
        scroll: f$3,
        setAnimationMode: ManagedStyles.r$3,
        setCustomElementsScopingRules: ManagedStyles.g$2,
        setCustomElementsScopingSuffix: ManagedStyles.p,
        setDefaultIconCollection: Icons.e,
        setFetchDefaultLanguage: ManagedStyles.P$3,
        setIgnoreUrlParams: ManagedStyles.n$6,
        setLanguage: ManagedStyles.p$1,
        setNoConflict: ManagedStyles.f$4,
        setTheme: ManagedStyles.l$2,
        slideDown: b$6,
        slideUp: u$5,
        slot: d$2,
        slotStrict: d$1,
        startMultipleDrag: s$a,
        supportsTouch: ManagedStyles.l$1
    });

    ManagedStyles.p("29d33248");

    exports.A = A;
    exports.C = C$1;
    exports.Co = Co;
    exports.D = D$1;
    exports.D$1 = D$2;
    exports.Eo = Eo;
    exports.I = I;
    exports.K = K;
    exports.Ko = Ko;
    exports.M = M;
    exports.N = N;
    exports.O = O$1;
    exports.P = P;
    exports.PackageModule = PackageModule;
    exports.Q = Q;
    exports.R = R;
    exports.T = T;
    exports.V = V;
    exports.X = X;
    exports._ = _;
    exports.ao = ao;
    exports.b = b$1;
    exports.b$1 = b$4;
    exports.b$2 = b$6;
    exports.d = d$1;
    exports.f = f;
    exports.f$1 = f$1;
    exports.h = h;
    exports.i = i$5;
    exports.i$1 = i;
    exports.io = io;
    exports.j = j;
    exports.ko = ko;
    exports.l = l$5;
    exports.l$1 = l$2;
    exports.m = m$4;
    exports.m$1 = m$3;
    exports.n = n$8;
    exports.n$1 = n$2;
    exports.n$2 = n$3;
    exports.p = p$1;
    exports.q = q;
    exports.r = r;
    exports.r$1 = r$5;
    exports.ro = ro;
    exports.s = s$9;
    exports.s$1 = s$8;
    exports.so = so;
    exports.t = t$3;
    exports.u = u$1;
    exports.u$1 = u$5;
    exports.w = w;
    exports.x = x;
    exports.y = y;

}));
