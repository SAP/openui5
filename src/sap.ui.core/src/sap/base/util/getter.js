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
	 * Returns a new function that returns the given <code>oValue</code> (using its closure).
	 *
	 * Avoids the need for a dedicated member for the value.
	 *
	 * As closures don't come for free, this function should only be used when polluting
	 * the enclosing object is an absolute "must-not" (as it is the case in public base classes).
	 *
	 * @function
	 * @private
	 * @exports sap/base/util/getter
	 * @param {Object} oValue The value that the getter should return
	 * @returns {function} The new getter function
	 * @private
	 */
	var fnGetter = function(oValue) {
		return function() {
			return oValue;
		};
	};
	return fnGetter;
});