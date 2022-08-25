/*!
 * ${copyright}
 */

sap.ui.define([
	"./WaiterBase",
	"./_utils",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isEmptyObject"
], function(WaiterBase, _utils, jQueryDOM, isEmptyObject) {
	"use strict";

	var TIMEOUT = 1000;

	var TransitionWaiter = WaiterBase.extend("sap.ui.test.autowaiter._cssTransitionWaiter", {
		constructor: function() {
			WaiterBase.apply(this, arguments);
			this._oTrackedTransitions = new Map();

			_utils.onElementAvailable("body", function(oRootDomNode) {
				jQueryDOM(oRootDomNode).on("webkitTransitionRun webkitTransitionStart transitionrun transitionstart",
					function(oEvent) {
						this._register({
							element: oEvent.target,
							propertyName: oEvent.originalEvent.propertyName,
							reason:  oEvent.originalEvent.type
						});
					}.bind(this));

				jQueryDOM(oRootDomNode).on("webkitTransitionEnd webkitTransitionCancel transitionend transitioncancel",
					function(oEvent) {
						this._deregister({
							element: oEvent.target,
							propertyName: oEvent.originalEvent.propertyName,
							reason:  oEvent.originalEvent.type
						});
					}.bind(this));
			}.bind(this));
		},

		hasPending: function () {
			var bHasPending = this._oTrackedTransitions.size > 0;
			this._oLogger.trace("hasPending", bHasPending);
			if (bHasPending) {
				this._oHasPendingLogger.debug("transition in progress");
			}
			return bHasPending;
		},

		_register: function (oOptions) {
			var oElement = oOptions.element,
				sPropertyName = oOptions.propertyName;

			this._log("register", oOptions);

			if (!this._oTrackedTransitions.has(oElement)) {
				this._oTrackedTransitions.set(oElement, {});
			}

			this._oTrackedTransitions.get(oElement)[oOptions.propertyName] = oOptions.propertyName;

			setTimeout(function() {
				if (this._oTrackedTransitions.has(oElement)) {
					this._deregister({
						element: oElement,
						propertyName: sPropertyName,
						reason:  "timed out"
					});
				}
			}.bind(this), TIMEOUT, 'TIMEOUT_WAITER_IGNORE');
		},

		_deregister: function (oOptions) {
			var oElement = oOptions.element,
				sPropertyName = oOptions.propertyName;

			this._log("deregister", oOptions);

			if (this._oTrackedTransitions.has(oElement)) {
				var oEntry = this._oTrackedTransitions.get(oElement);
				delete oEntry[sPropertyName];
				if (isEmptyObject(oEntry)) {
					this._oTrackedTransitions.delete(oElement);
				}
			}
		},

		_log: function(sMsg, oOptions) {
			this._oLogger.trace(sMsg,
			"ElementId: " + oOptions.element.id
			+ " Reason: " + oOptions.reason
			+ " PropertyName: " + oOptions.propertyName);
		}
	});

	return new TransitionWaiter();
});
