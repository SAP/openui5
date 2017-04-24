/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.Controls", {

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit : function () {
				this.getRouter().getRoute("controls").attachPatternMatched(this._onMatched, this);
			},

			/**
			 * Handles "controls" routing
			 * @function
			 * @private
			 */
			_onMatched: function () {
				this.showMasterSide();
			}
		});
	}
);