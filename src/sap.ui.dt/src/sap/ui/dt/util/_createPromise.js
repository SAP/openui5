/*!
 * ${copyright}
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * @function
	 * @param {function} fn - Function that should be wrapped in a promise
	 * @returns {object} Cancelable Promise
	 * @private
	 */
	return function(fn) {
		var bCancelled = false;
		var oCancelPromise;
		var fnCancelResolve;
		var fnCancelReject;
		var oPromise = new Promise(function(fnResolve, fnReject) {
			fn(
				function(...aArgs) {
					if (!bCancelled) {
						fnResolve.apply(this, aArgs);
					} else if (fnCancelResolve) {
						fnCancelResolve.apply(this, aArgs);
					}
				},
				function(...aArgs) {
					if (!bCancelled) {
						fnReject.apply(this, aArgs);
					} else if (fnCancelReject) {
						fnCancelReject.apply(this, aArgs);
					}
				}
			);
		});

		return {
			promise: oPromise,
			cancel() {
				bCancelled = true;
				oCancelPromise ||= new Promise(function(fnResolve, fnReject) {
					fnCancelResolve = fnResolve;
					fnCancelReject = fnReject;
				});
				return oCancelPromise;
			}
		};
	};
});
