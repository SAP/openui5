/*!
 * ${copyright}
 */
sap.ui.define(function () {
	"use strict";

	/**
	* @function
	* @since 1.72
	* @param {function} fn - Promise function. This function will receive two parameters: resolve and reject functions.
	*                        See native promise documentation - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
	* @return {object}
	* @return {object.promise} — native Promise object
	* @return {object.cancel} — cancellation function
	* @experimental
	* @private
	*/
	return function (fn) {
		var bCancelled = false;
		var oCancelPromise;
		var fnCancelResolve;
		var fnCancelReject;
		var oPromise = new Promise(function (fnResolve, fnReject) {
			fn(
				function () {
					if (!bCancelled) {
						fnResolve.apply(this, arguments);
					} else if (fnCancelResolve) {
						fnCancelResolve.apply(this, arguments);
					}
				},
				function () {
					if (!bCancelled) {
						fnReject.apply(this, arguments);
					} else if (fnCancelReject) {
						fnCancelReject.apply(this, arguments);
					}
				}
			);
		});

		return {
			promise: oPromise,
			/**
			 * Cancels the promise.
			 * @returns {promise} Promise which resolves or rejects to the result of the original promise
			 */
			cancel: function () {
				bCancelled = true;
				if (!oCancelPromise) {
					oCancelPromise = new Promise(function (fnResolve, fnReject) {
						fnCancelResolve = fnResolve;
						fnCancelReject = fnReject;
					});
				}
				return oCancelPromise;
			}
		};
	};
});
