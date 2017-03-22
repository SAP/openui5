/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	'sap/ui/base/Object'
], function (jQuery, BaseObject) {
	"use strict";

	/* *
	 * Helper class that
	 * throttles a function execution
	 * with a given delay
	 * and returns a promise object whenever execution requested
	 * @private
	 * */
	var ThrottledTask = BaseObject.extend("ThrottledTask", {

		/**
		 * @param fnTask - the function to throttle
		 * @param iDelay - the delay for throttling
		 */
		constructor: function (fnTask, iDelay, oContext) {

			this._fnTask = fnTask;
			this._iDelay = iDelay;
			this._oContext = oContext;
			this._oPromise = null;
			this._fnResolvePromise = null;
			this._fnRejectPromise = null;
			this._iTimer = null;
			this._aTaskArgs = null;
		},

		reSchedule: function (bImmediate, aTaskArgs) {

			var oReturnPromise = this._getPromise();

			if (this._iTimer) {
				jQuery.sap.clearDelayedCall(this._iTimer);
				this._iTimer = null;
			}

			this._aTaskArgs = aTaskArgs; // the task arguments are redefined upon each reSchedule

			if (bImmediate) {
				var bSuccess = this._fnTask.apply(this._oContext, this._aTaskArgs);
				this._completePromise(bSuccess);
				return oReturnPromise;
			}

			// throttle
			this._iTimer = jQuery.sap.delayedCall(this._iDelay, this, function () {
                if (this._oPromise) {
					var bSuccess = this._fnTask.apply(this._oContext, this._aTaskArgs);
					this._completePromise(bSuccess);
				}
			}.bind(this));

			return oReturnPromise;
		},

		_getPromise: function () {

			if (!this._oPromise) {
				this._oPromise = new window.Promise(function (resolve, reject) {
					this._fnResolvePromise = resolve;
					this._fnRejectPromise = reject;
				}.bind(this));
			}
			return this._oPromise;
		},

		_completePromise: function (bSuccess) {

			var fnComplete = (bSuccess) ?
				this._fnResolvePromise :
				this._fnRejectPromise;
			fnComplete();

			// remove reference to promise (because once executed, the same promise cannot be reused again)
			this._oPromise = null;
			this._fnResolvePromise = null;
			this._fnRejectPromise = null;
			this._aTaskArgs = null;
		}
	});

	return ThrottledTask;

}, /* bExport= */ false);
