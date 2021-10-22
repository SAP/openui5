/*!
 * ${copyright}
 */
sap.ui.define(function () {
	"use strict";

	/**
	 * @function
	 * @experimental
	 * @param {function} fn - Function that should be wrapped in a promise
	 * @returns {object} Cancelable Promise
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
