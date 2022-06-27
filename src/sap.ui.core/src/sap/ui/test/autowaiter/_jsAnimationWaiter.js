/*!
 * ${copyright}
 */

sap.ui.define([
	"./WaiterBase"
], function(WaiterBase) {
	"use strict";

	var oState = {
		PENDING: "PENDING",
		EXECUTED: "EXECUTED",
		CANCELLED: "CANCELLED"
	};

	var JSAnimationWaiter = WaiterBase.extend("sap.ui.test.autowaiter._jsAnimationWaiter", {
		constructor: function() {
			WaiterBase.apply(this, arguments);
			this._oTrackedAnimations = new Set();

			if (window.requestAnimationFrame) {
				var fnOriginalRequestAnimationFrame = window.requestAnimationFrame;
				window.requestAnimationFrame = function(callback) {
					var sId,
						aCallbackArgs = Array.prototype.slice.call(arguments, 1),
						wrappedCallback = function(iTimestamp) {
							callback(iTimestamp);
							this._deregister(sId, oState.EXECUTED);
						}.bind(this);

					sId = fnOriginalRequestAnimationFrame.apply(null, [wrappedCallback].concat(aCallbackArgs));

					this._register(sId, oState.PENDING);
					return sId;
				}.bind(this);
			}

			if (window.cancelAnimationFrame) {
				var fnOriginalCancelAnimationFrame = window.cancelAnimationFrame;
				window.cancelAnimationFrame = function(sId) {
					this._deregister(sId, oState.CANCELLED);
					return fnOriginalCancelAnimationFrame(sId);
				}.bind(this);
			}
		},

		_register: function(sId, sReason) {
			this._oLogger.trace("register", "ID: " + sId + " Reason: " + sReason);
			this._oTrackedAnimations.add(sId);
		},

		_deregister: function(sId, sReason) {
			this._oLogger.trace("deregister", "ID: " + sId + " Reason: " + sReason);
			this._oTrackedAnimations.delete(sId);
		},

		hasPending: function () {
			var bHasPending = this._oTrackedAnimations.size > 0;
			this._oLogger.trace("hasPending", bHasPending);
			if (bHasPending) {
				this._oHasPendingLogger.debug("jsAnimation in progress");
			}
			return bHasPending;
		}
	});

	return new JSAnimationWaiter();
});
