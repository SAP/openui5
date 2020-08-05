/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
	"sap/ui/documentation/sdk/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.documentation.sdk.controller.TermsOfUse", {

		onInit: function () {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("termsOfUse").attachPatternMatched(this._onTopicMatched, this);
		},

		_onTopicMatched: function (oEvent) {
			// Get the TermsOfUse.txt file and display it. In case of error redirect to NotFound view.
			jQuery.ajax({
					url: "./TermsOfUse.txt",
					dataType: "text"
				}).done(function (sTerms) {
					this.getView().byId("termsOfUseText").setText(sTerms);
				}.bind(this))
				.fail(function () {
					this.oRouter.myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
				}.bind(this));
		}
	});

});