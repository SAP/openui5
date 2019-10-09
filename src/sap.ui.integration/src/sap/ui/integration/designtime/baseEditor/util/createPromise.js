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
		var oPromise = new Promise(function (fnResolve, fnReject) {
			fn(
				function () {
					if (!bCancelled) {
						fnResolve.apply(this, arguments);
					}
				},
				function () {
					if (!bCancelled) {
						fnReject.apply(this, arguments);
					}
				}
			);
		});

		return {
			promise: oPromise,
			cancel: function () {
				bCancelled = true;
			}
		};
	};
});
