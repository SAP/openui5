/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/assert"
], function(
	assert
) {

	"use strict";

	let _sOwnerId;

	/**
	 * Calls the function <code>fn</code> once and marks all ManagedObjects
	 * created during that call as "owned" by the given ID.
	 *
	 * @param {function} fn Function to execute
	 * @param {string} sOwnerId Id of the owner
	 * @param {Object} [oThisArg=undefined] Value to use as <code>this</code> when executing <code>fn</code>
	 * @return {any} result of function <code>fn</code>
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	 const runWithOwner = function(fn, sOwnerId, oThisArg) {

		assert(typeof fn === "function", "fn must be a function");

		var oldOwnerId = _sOwnerId;
		try {
			_sOwnerId = sOwnerId;
			return fn.call(oThisArg);
		} finally {
			_sOwnerId = oldOwnerId;
		}
	};

	runWithOwner.getCurrentOwnerId =  () => { return _sOwnerId; };

	return runWithOwner;
});
