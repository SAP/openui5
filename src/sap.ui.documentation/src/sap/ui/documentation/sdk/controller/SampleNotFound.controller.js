/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.documentation.sdk.controller.SampleNotFound", {
		onInit: function () {
			this._oRouter = this.getRouter();
		},

		onNavToSamples: function () {
			this._oRouter.navTo("controls");
		}
	});
});