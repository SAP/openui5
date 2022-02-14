/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/thirdparty/jquery"
], function (BaseController, jQuery) {
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
					this.onRouteNotFound();
				}.bind(this));
		}
	});

});