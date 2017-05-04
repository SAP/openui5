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

			onInit: function () {
				this._fnOrientationChange({
					landscape: Device.orientation.landscape
				});
			},

			onBeforeRendering: function() {
				Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onAfterRendering: function() {
				Device.orientation.attachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onExit: function() {
				Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			_fnOrientationChange: function(oEvent) {
				if (Device.system.phone) {
					this.byId("phoneImage").toggleStyleClass("phoneHeaderImageLandscape", oEvent.landscape);
				}
			}

		});

	}
);