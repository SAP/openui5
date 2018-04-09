/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["./Log"], function(Log) {
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
	 * @exports sap/base/assert
	 * @param {boolean} bResult Result of the checked assertion
	 * @param {string|function} vMessage Message that will be logged when the result is <code>false</code>.
	 * In case this is a function, the return value of the function will be displayed. This can be used to execute
	 * complex code only if the assertion fails.
	 * @private
	 * @SecSink {1|SECRET} Could expose secret data in logs
	 *
	 */
	var fnAssert = function(bResult, vMessage) {
		if (!bResult) {
			var sMessage = typeof vMessage === "function" ? vMessage() : vMessage;
			/*eslint-disable no-console */
			if (console && console.assert) {
				console.assert(bResult, sMessage);
			} else {
				// console is not always available (IE, FF) and IE doesn't support console.assert
				Log.debug("[Assertions] " + sMessage);
			}
			/*eslint-enable no-console */
		}
	};
	return fnAssert;
});
