/*!
 * ${copyright}
 */
sap.ui.define([
	"./WaiterBase",
	"./_utils",
	"sap/ui/thirdparty/jquery"
], function (WaiterBase, _utils, jQueryDOM) {
	"use strict";

	var STATE = {
		PENDING: "PENDING",
		LOADED: "LOADED",
		ERROR: "ERROR"
	};

	var ResourceWaiter = WaiterBase.extend("sap.ui.test.autowaiter._ResourceWaiter", {
		constructor: function () {
			WaiterBase.apply(this, arguments);
			//this._oLogger.setLevel("TRACE");
			this._aResources = [];
			// observe for new img elements and for img elements with changed src attribute
			var observer = new window.MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					if (mutation.type === "attributes" && mutation.target.tagName === "IMG") {
						this._trackImage(mutation.target);
					} else if (mutation.type === "childList") {
						mutation.addedNodes.forEach(function (node) {
							if (node.tagName === "IMG") {
								this._trackImage(node);
							}
							var aChildImages = node.querySelectorAll && node.querySelectorAll("img") || [];
							aChildImages.forEach(function (child) {
								this._trackImage(child);
							}.bind(this));
						}.bind(this));
						if (mutation.nextSibling && mutation.nextSibling.tagName === "IMG") {
							this._trackImage(mutation.nextSibling);
						}
						if (mutation.previousSibling && mutation.previousSibling.tagName === "IMG") {
							this._trackImage(mutation.previousSibling);
						}
					}
				}.bind(this));
			}.bind(this));

			_utils.onElementAvailable("body", function (oElement) {
				observer.observe(oElement, {
					attributes: true,
					attributeFilter: ["src"],
					childList: true,
					subtree: true
				});
			});
		},
		hasPending: function () {
			this._aResources.forEach(function (mResource) {
				if (mResource.state === STATE.PENDING && mResource.element.complete) {
					mResource.state = STATE.LOADED;
					this._oLogger.trace("Image with src '" + mResource.element.src + "' completed");
				}
			}.bind(this));
			var aPendingResources = this._aResources.filter(function (mResource) {
				if (!jQueryDOM(mResource.element).length) {
					this._oLogger.trace("Image with src '" + mResource.src + "' was removed");
					return false;
				}
				return mResource.state === STATE.PENDING;
			}.bind(this));

			var bHasPendingResources = aPendingResources.length > 0;
			if (bHasPendingResources) {
				this._oHasPendingLogger.debug("There are " + aPendingResources.length + " images still loading");
				aPendingResources.forEach(function (mResource) {
					this._oHasPendingLogger.debug("Pending image: " + mResource.src);
				}.bind(this));
			}
			return bHasPendingResources;
		},
		_trackImage: function (oElement) {
			var mTrackedResource = this._aResources.filter(function (mResource) {
				return mResource.element === oElement;
			})[0];
			if (mTrackedResource) {
				mTrackedResource.src = oElement.src;
				mTrackedResource.state = STATE.PENDING;
				this._oLogger.trace("Image with src '" + oElement.src + "' is updated and pending again");
			} else {
				var mNewResource = {
					src: oElement.src,
					state: STATE.PENDING,
					element: oElement
				};
				this._aResources.push(mNewResource);
				this._oLogger.trace("Image with src '" + oElement.src + "' is pending");

				oElement.addEventListener("load", function() {
					mNewResource.state = STATE.LOADED;
					this._oLogger.trace("Image with src '" + oElement.src + "' loaded successfully");
				}.bind(this));
				oElement.addEventListener("error" , function() {
					mNewResource.state = STATE.ERROR;
					this._oLogger.trace("Image with src '" + oElement.src + "' failed to load");
				}.bind(this));
			}
		}
	});

	return new ResourceWaiter();
});
