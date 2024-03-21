/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/extend",
	"./WaiterBase"
], function(extend, WaiterBase) {
	"use strict";

	var oState = {
		PENDING: "PENDING",
		EXECUTED: "EXECUTED",
		CANCELLED: "CANCELLED"
	};

	var iInitiatorId = null;

	var JSAnimationWaiter = WaiterBase.extend("sap.ui.test.autowaiter._jsAnimationWaiter", {
		constructor: function() {
			WaiterBase.apply(this, arguments);
			this._oTrackedAnimations = new Map();

			if (window.requestAnimationFrame) {
				var fnOriginalRequestAnimationFrame = window.requestAnimationFrame;
				window.requestAnimationFrame = function(callback) {
					var sId,
						aCallbackArgs = Array.prototype.slice.call(arguments, 1),
						wrappedCallback = function(iTimestamp) {
							iInitiatorId = sId;
							try {
								callback(iTimestamp);
							} finally {
								iInitiatorId = null;
								this._deregister(sId, oState.EXECUTED);
							}
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
			var iStartTime = this._oTrackedAnimations.get(iInitiatorId)?.startTime || Date.now();
			this._oTrackedAnimations.set(sId, {startTime: iStartTime});
		},

		_deregister: function(sId, sReason) {
			this._oLogger.trace("deregister", "ID: " + sId + " Reason: " + sReason);
			this._oTrackedAnimations.delete(sId);
		},

		_getDefaultConfig: function () {
			return extend({
				// animations that exceed the maxDuration will be ignored (considered as background processes)
				maxDuration: 1000 	// milliseconds
			}, WaiterBase.prototype._getDefaultConfig.call(this));
		},

		_getValidationInfo: function () {
			return extend({
				maxDuration: "numeric"
			}, WaiterBase.prototype._getValidationInfo.call(this));
		},

		hasPending: function () {
			var bHasPending = false,
				iMaxDuration = this._getDefaultConfig().maxDuration,
				iElapsedTime;
			for (var oEntry of this._oTrackedAnimations.values()) {
				iElapsedTime = Date.now() - oEntry.startTime;
				// ignore animations that excede the <code>iMaxDuration</code>
				// as these are considered background processes that never end
				if (iElapsedTime < iMaxDuration) {
					bHasPending = true;
				}
			}

			this._oLogger.trace("hasPending", bHasPending);
			if (bHasPending) {
				this._oHasPendingLogger.debug("jsAnimation in progress");
			}
			return bHasPending;
		}
	});

	return new JSAnimationWaiter();
});
