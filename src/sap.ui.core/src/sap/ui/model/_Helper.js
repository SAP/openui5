/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/extend"
], function (extend) {
	"use strict";

	/**
	 * @alias sap.ui.model._Helper
	 * @private
	 */
	var _Helper = {
		// Trampoline property to allow for mocking in unit tests.
		// @see sap.base.util.extend
		extend : extend
	};

	return _Helper;
}, /* bExport= */false);
