/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/Device"
	], function (BaseController, Device) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.TopicDetailInitial", {

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

	}
);