/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Creates or returns object properties based on a given name and a context.
	 *
	 * @function
	 * @private
	 * @exports sap/base/util/getObject
	 * @param {Object} oContext context which gets enriched, e.g. var base = {};
	 * @param {string} sNames string which contains the module names separated by '.', e.g. 'my.test.module'
	 * @param {boolean} [bCreates] whether or not to create the context if it doesn't exist
	 * @returns {Object} newly created context e.g. base.my.test.module
	 * @example
	 * var base = {};
	 * base.my.test.module === getObject(base, "my.test.module", true);
	 */
	var fnGetObject = function(oContext, sNames, bCreates) {

		return sNames.split(".").reduce(function(oContext, sName) {
			if (oContext && oContext[sName] !== undefined) {
				return oContext[sName];
			} else if (bCreates) {
				oContext[sName] = {};
				return oContext[sName];
			}
		}, oContext);
	};
	return fnGetObject;
});
