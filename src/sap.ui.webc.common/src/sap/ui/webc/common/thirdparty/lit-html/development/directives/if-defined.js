sap.ui.define(['exports', '../lit-html'], function (exports, litHtml) { 'use strict';

	/**
	 * @license
	 * Copyright 2018 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */
	const ifDefined = (value) => value !== null && value !== void 0 ? value : litHtml.nothing;

	exports.ifDefined = ifDefined;

	Object.defineProperty(exports, '__esModule', { value: true });

});
