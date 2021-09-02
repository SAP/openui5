sap.ui.define(['exports', '../lit-html', '../directive'], function (exports, litHtml, directive) { 'use strict';

	/**
	 * @license
	 * Copyright 2017 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */class n extends directive.Directive{constructor(i){if(super(i),this.vt=litHtml.nothing,i.type!==directive.PartType.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===litHtml.nothing)return this.Vt=void 0,this.vt=r;if(r===litHtml.noChange)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.vt)return this.Vt;this.vt=r;const s=[r];return s.raw=s,this.Vt={_$litType$:this.constructor.resultType,strings:s,values:[]}}}n.directiveName="unsafeHTML",n.resultType=1;const o=directive.directive(n);

	exports.UnsafeHTMLDirective = n;
	exports.unsafeHTML = o;

	Object.defineProperty(exports, '__esModule', { value: true });

});
