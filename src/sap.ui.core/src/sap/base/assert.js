/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	// TODO-evo:assert on node throws an error if the assertion is violated

	/**
	 * A simple assertion mechanism that logs a message when a given condition is not met.
	 *
	 * <b>Note:</b> Calls to this method might be removed when the JavaScript code
	 *              is optimized during build. Therefore, callers should not rely on any side effects
	 *              of this method.
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/assert
	 * @param {boolean} bResult Result of the checked assertion
	 * @param {string|function} vMessage Message that will be logged when the result is <code>false</code>.
	 * In case this is a function, the return value of the function will be displayed. This can be used to execute
	 * complex code only if the assertion fails.
	 * @public
	 * @SecSink {1|SECRET} Could expose secret data in logs
	 *
	 */
	var fnAssert = function(bResult, vMessage) {
		if (!bResult) {
			var sMessage = typeof vMessage === "function" ? vMessage() : vMessage;
			/*eslint-disable no-console */
			console.assert(bResult, sMessage);
			/*eslint-enable no-console */
		}
	};
	return fnAssert;
});
