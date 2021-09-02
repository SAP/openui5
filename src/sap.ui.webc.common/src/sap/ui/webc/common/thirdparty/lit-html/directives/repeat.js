sap.ui.define(['exports', '../lit-html', '../directive'], function (exports, litHtml, directive) { 'use strict';

	/**
	 * @license
	 * Copyright 2020 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */const {et:t}=litHtml._Σ,e=()=>document.createComment(""),u$1=(o,i,n)=>{var v;const l=o.A.parentNode,r=void 0===i?o.B:i.A;if(void 0===n){const i=l.insertBefore(e(),r),v=l.insertBefore(e(),r);n=new t(i,v,o,o.options);}else {const t=n.B.nextSibling,i=n.M!==o;if(i&&(null===(v=n.Q)||void 0===v||v.call(n,o),n.M=o),t!==r||i){let o=n.A;for(;o!==t;){const t=o.nextSibling;l.insertBefore(o,r),o=t;}}}return n},c$1=(o,t,i=o)=>(o.I(t,i),o),s={},f=(o,t=s)=>o.H=t,a=o=>o.H,m=o=>{var t;null===(t=o.P)||void 0===t||t.call(o,!1,!0);let i=o.A;const n=o.B.nextSibling;for(;i!==n;){const o=i.nextSibling;i.remove(),i=o;}};

	/**
	 * @license
	 * Copyright 2017 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */
	const u=(e,s,t)=>{const r=new Map;for(let l=s;l<=t;l++)r.set(e[l],l);return r},c=directive.directive(class extends directive.Directive{constructor(e){if(super(e),e.type!==directive.PartType.CHILD)throw Error("repeat() can only be used in text expressions")}Mt(e,s,t){let r;void 0===t?t=s:void 0!==s&&(r=s);const l=[],o=[];let i=0;for(const s of e)l[i]=r?r(s,i):i,o[i]=t(s,i),i++;return {values:o,keys:l}}render(e,s,t){return this.Mt(e,s,t).values}update(s,[t,r,c]){var d;const p=a(s),{values:v,keys:a$1}=this.Mt(t,r,c);if(!p)return this.Pt=a$1,v;const h=null!==(d=this.Pt)&&void 0!==d?d:this.Pt=[],m$1=[];let x,y,j=0,k=p.length-1,w=0,b=v.length-1;for(;j<=k&&w<=b;)if(null===p[j])j++;else if(null===p[k])k--;else if(h[j]===a$1[w])m$1[w]=c$1(p[j],v[w]),j++,w++;else if(h[k]===a$1[b])m$1[b]=c$1(p[k],v[b]),k--,b--;else if(h[j]===a$1[b])m$1[b]=c$1(p[j],v[b]),u$1(s,m$1[b+1],p[j]),j++,b--;else if(h[k]===a$1[w])m$1[w]=c$1(p[k],v[w]),u$1(s,p[j],p[k]),k--,w++;else if(void 0===x&&(x=u(a$1,w,b),y=u(h,j,k)),x.has(h[j]))if(x.has(h[k])){const e=y.get(a$1[w]),t=void 0!==e?p[e]:null;if(null===t){const e=u$1(s,p[j]);c$1(e,v[w]),m$1[w]=e;}else m$1[w]=c$1(t,v[w]),u$1(s,p[j],t),p[e]=null;w++;}else m(p[k]),k--;else m(p[j]),j++;for(;w<=b;){const e=u$1(s,m$1[b+1]);c$1(e,v[w]),m$1[w++]=e;}for(;j<=k;){const e=p[j++];null!==e&&m(e);}return this.Pt=a$1,f(s,m$1),litHtml.noChange}});

	exports.repeat = c;

	Object.defineProperty(exports, '__esModule', { value: true });

});
