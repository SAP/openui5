/*!
 * ${copyright}
 */

sap.ui.define([
	"./WaiterBase",
	"./_utils",
	"sap/ui/thirdparty/jquery"
], function(WaiterBase, _utils, jQueryDOM) {
	"use strict";

	var TIMEOUT = 600;

	var CSSAnimationWaiter = WaiterBase.extend("sap.ui.test.autowaiter._cssAnimationWaiter", {
		constructor: function() {
			WaiterBase.apply(this, arguments);
			this._oTrackedAnimations = new Set();

			var oObserver = new window.MutationObserver(function(mutationList) {
				var oNextSibling, oPreviousSibling;
				mutationList.forEach(function(mutation) {
					if (mutation.type === "attributes") {
						this._trackDelayedAnimation(mutation.target);
					} else if (mutation.type === "childList") {
						mutation.addedNodes.forEach(function (node) {
							this._trackDelayedAnimation(node);
						}, this);
						oNextSibling = mutation.nextSibling;
						oPreviousSibling = mutation.previousSibling;
						oNextSibling && this._trackDelayedAnimation(oNextSibling);
						oPreviousSibling && this._trackDelayedAnimation(oPreviousSibling);
					}
				}, this);
			}.bind(this));

			_utils.onElementAvailable("body", function(oRootDomNode) {
				jQueryDOM(oRootDomNode).on("webkitAnimationStart animationstart", function(oEvent) {
					this._register(oEvent.target, oEvent.originalEvent.type);
				}.bind(this));

				jQueryDOM(oRootDomNode).on("webkitAnimationEnd webkitAnimationCancel animationend animationcancel", function(oEvent) {
					this._deregister(oEvent.target, oEvent.originalEvent.type);
				}.bind(this));

				// use mutation observer to detect animations with *delay*
				// (because no native event for start of delay countdown)
				oObserver.observe(oRootDomNode, { attributes: true, childList: true, subtree: true }); // TODO: filter needed?
			}.bind(this));
		},

		hasPending: function () {
			var bHasPending = this._oTrackedAnimations.size > 0;
			this._oLogger.trace("hasPending", bHasPending);
			if (bHasPending) {
				this._oHasPendingLogger.debug("cssAnimation in progress");
			}
			return bHasPending;
		},

		_trackDelayedAnimation: function(oElement) {
			var oChildren = oElement.children;
			if (this._hasDelayedAnimation(oElement)) {
				this._register(oElement, "observed animation with delay");
			}
			if (oChildren) {
				for (var i = 0; i < oChildren.length; i++) {
					this._trackDelayedAnimation(oChildren[i]);
				}
			}
		},

		_hasDelayedAnimation: function(oElement) {
			var bIsElement = oElement.nodeType === Node.ELEMENT_NODE,
			oComputedStyle = bIsElement && getComputedStyle(oElement);

			return oComputedStyle
				&& oComputedStyle.animationName !== "none"
				&& parseInt(oComputedStyle.animationDelay);
		},

		_register: function (oElement, sReason) {
			this._log("register", oElement, sReason);

			if (!this._oTrackedAnimations.has(oElement)) {
				this._oTrackedAnimations.add(oElement);

				setTimeout(function() {
					if (this._oTrackedAnimations.has(oElement)) {
						this._deregister(oElement, "timed out");
					}
				}.bind(this), TIMEOUT, 'TIMEOUT_WAITER_IGNORE');
			}
		},

		_deregister: function (oElement, sReason) {
			this._log("deregister", oElement, sReason);

			if (this._oTrackedAnimations.has(oElement)) {
				this._oTrackedAnimations.delete(oElement);
			}
		},

		_log: function(sMsg, oElement, sReason) {
			this._oLogger.trace(sMsg,
			"ElementId: " + oElement.id
			+ " Reason: " + sReason
			+ " Animation: " + getComputedStyle(oElement).animation);
		}
	});

	return new CSSAnimationWaiter();
});
