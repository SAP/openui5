/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/base/Log"
], function (Device, BaseController, Log) {
	"use strict";

	return BaseController.extend("sap.ui.documentation.sdk.controller.Tools", {

		/* =========================================================== */
		/* lifecycle methods										   */
		/* =========================================================== */

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function () {
			BaseController.prototype.onInit.call(this);

			// manually call the handler once at startup as device API won't do this for us
			this._onOrientationChange({
				landscape: Device.orientation.landscape
			});

			this.getRouter().getRoute("tools").attachPatternMatched(this._onMatched, this);
		},

		/**
		 * Called before the view is rendered.
		 * @public
		 */
		onBeforeRendering: function() {
			this._deregisterOrientationChange();
		},

		/**
		 * Called after the view is rendered.
		 * @public
		 */
		onAfterRendering: function() {
			this._registerOrientationChange();
		},

		/**
		 * Called when the controller is destroyed.
		 * @public
		 */
		onExit: function() {
			this._deregisterOrientationChange();
		},

		/**
		 * Handles "Tools" routing
		 * @function
		 * @private
		 */
		_onMatched: function () {
			try {
				this.hideMasterSide();
			} catch (e) {
				// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
				Log.error(e);
			}
		}
	});
});