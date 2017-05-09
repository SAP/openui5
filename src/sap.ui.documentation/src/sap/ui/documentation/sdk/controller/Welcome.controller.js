/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/m/library",
		"sap/ui/Device"
	], function (BaseController, mobileLibrary, Device) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.Welcome", {

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit: function () {
				this.getRouter().getRoute("welcome").attachPatternMatched(this._onMatched, this);

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
			},

			/**
			 * Opens the control's details page
			 * @param event
			 */
			navigateToDetails: function (event) {
				var href = event.oSource.getHref() || event.oSource.getTarget();
				href = href.replace("#/", "").split('/');
				/** @type string */
				var page = href[0];
				/** @type string */
				var parameter = href[1];

				event.preventDefault();
				this.getRouter().navTo(page, {id: parameter}, true);
			},

			/**
			 * Navigates to the tutorial overview
			 */
			onGetStarted: function () {
				mobileLibrary.URLHelper.redirect("#/topic/8b49fc198bf04b2d9800fc37fecbb218");
			},

			/**
			 * Handles "welcome" routing
			 * @function
			 * @private
			 */
			_onMatched: function () {
				try {
					this.hideMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					jQuery.sap.log.error(e);
				}
			}
		});
	}
);