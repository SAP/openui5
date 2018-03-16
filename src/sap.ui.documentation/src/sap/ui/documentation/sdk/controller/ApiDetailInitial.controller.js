/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/documentation/sdk/controller/BaseController"
], function (Device, BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetailInitial", {

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
		}

	});
});