sap.ui.define(['exports', '../lit-html', '../directive'], function (exports, litHtml, directive) { 'use strict';

	/**
	 * @license
	 * Copyright 2018 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */const i=directive.directive(class extends directive.Directive{constructor(t){var e;if(super(t),t.type!==directive.PartType.ATTRIBUTE||"style"!==t.name||(null===(e=t.strings)||void 0===e?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce(((e,r)=>{const s=t[r];return null==s?e:e+`${r=r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`}),"")}update(e,[r]){const{style:s}=e.element;if(void 0===this.St){this.St=new Set;for(const t in r)this.St.add(t);return this.render(r)}this.St.forEach((t=>{null==r[t]&&(this.St.delete(t),t.includes("-")?s.removeProperty(t):s[t]="");}));for(const t in r){const e=r[t];null!=e&&(this.St.add(t),t.includes("-")?s.setProperty(t,e):s[t]=e);}return litHtml.noChange}});

	exports.styleMap = i;

	Object.defineProperty(exports, '__esModule', { value: true });

});
