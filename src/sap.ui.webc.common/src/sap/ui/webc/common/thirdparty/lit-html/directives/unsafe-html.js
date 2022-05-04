sap.ui.define(['exports', '../lit-html', '../directive'], function (exports, litHtml, directive) { 'use strict';

	/**
	 * @license
	 * Copyright 2017 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */class e extends directive.Directive{constructor(i){if(super(i),this.it=litHtml.nothing,i.type!==directive.PartType.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===litHtml.nothing||null==r)return this.ft=void 0,this.it=r;if(r===litHtml.noChange)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.it)return this.ft;this.it=r;const s=[r];return s.raw=s,this.ft={_$litType$:this.constructor.resultType,strings:s,values:[]}}}e.directiveName="unsafeHTML",e.resultType=1;const o=directive.directive(e);

	exports.UnsafeHTMLDirective = e;
	exports.unsafeHTML = o;

	Object.defineProperty(exports, '__esModule', { value: true });

});
