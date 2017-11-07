/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/m/library",
		"sap/ui/Device"
	], function (jQuery, BaseController, mobileLibrary, Device) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.Welcome", {

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit: function () {
				this.getRouter().getRoute("welcome").attachPatternMatched(this._onMatched, this);

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