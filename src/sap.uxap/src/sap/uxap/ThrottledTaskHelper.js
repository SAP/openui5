/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
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
	var ThrottledTask = BaseObject.extend("sap.uxap.ThrottledTask", {

		/**
		 * @param {function} fnTask - the function to throttle
		 * @param {int} iDelay - the delay for throttling
		 * @param {object} oContext
		 */
		constructor: function (fnTask, iDelay, oContext) {

			this._fnTask = fnTask;
			this._iDelay = iDelay;
			this._oContext = oContext;
			this._oPromise = null;
			this._fnResolvePromise = null;
			this._fnRejectPromise = null;
			this._iTimer = null;
			this._oTaskOptions = null;
		},

		reSchedule: function (bImmediate, oTaskOptions) {

			var oReturnPromise = this._getPromise();

			if (this._iTimer) {
				clearTimeout(this._iTimer);
				this._iTimer = null;
			}

			this._oTaskOptions = this._mergeOptions(this._oTaskOptions || {}, oTaskOptions);

			if (bImmediate) {
				var bSuccess = this._fnTask.call(this._oContext, this._oTaskOptions);
				this._completePromise(bSuccess);
				return oReturnPromise;
			}

			// throttle
			this._iTimer = setTimeout(function () {
				if (this._oPromise) {
					var bSuccess = this._fnTask.call(this._oContext, this._oTaskOptions);
					this._completePromise(bSuccess);
				}
			}.bind(this), this._iDelay);

			return oReturnPromise;
		},

		isPending: function() {
			return this._iTimer != null;
		},

		_getPromise: function () {

			if (!this._oPromise) {
				this._oPromise = new Promise(function (resolve, reject) {
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
			this._oTaskOptions = null;
		},

		/**
		 * Updates the task arguments
		 * Default merge strategy is inclusive OR
		 * @private
		 */
		_mergeOptions: function(oOldOptions, oNewOptions) {

			var oMergedOptions = jQuery.extend({}, oOldOptions, oNewOptions);

			jQuery.each(oMergedOptions, function(key) {
				oMergedOptions[key] = oOldOptions[key] || oNewOptions[key]; // default merge strategy is inclusive OR
			});
			return oMergedOptions;
		}
	});

	return ThrottledTask;

});