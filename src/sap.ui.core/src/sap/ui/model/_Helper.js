/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/deepEqual",
	"sap/base/util/extend",
	"sap/base/util/merge"
], function (deepEqual, extend, merge) {
	"use strict";

	/**
	 * @alias sap.ui.model._Helper
	 * @private
	 */
	var _Helper = {
		// Trampoline properties to allow for mocking in unit tests.
		// @see sap.base.util.*
		deepEqual : deepEqual,
		extend : extend,
		merge : merge
	};

	return _Helper;
}, /* bExport= */false);
