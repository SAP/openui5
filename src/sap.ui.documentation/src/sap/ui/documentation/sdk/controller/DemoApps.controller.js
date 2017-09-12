/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/documentation/sdk/controller/BaseController"
	], function(jQuery, BaseController) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.DemoApps", {

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit: function () {
				this.getRouter().getRoute("demoapps").attachPatternMatched(this._onMatched, this);
			},

			/**
			 * Handles "demoapps" routing
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