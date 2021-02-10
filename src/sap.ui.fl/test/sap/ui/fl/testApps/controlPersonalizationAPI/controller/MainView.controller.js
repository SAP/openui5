sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/Utils",
	"test/sap/ui/fl/testApps/controlPersonalizationAPIChanges/Helper"
], function (XMLView, Controller, Utils, Helper) {
	"use strict";

	return Controller.extend("test.sap.ui.fl.testApps.controlPersonalizationAPIChanges.controller.MainView", {
		onInit: function () {
			XMLView.create({
				id: "secondView",
				viewName: "test.sap.ui.fl.testApps.controlPersonalizationAPIChanges.view.SecondSubView"
			}).then(function (oSecondView) {
				this.oSecondView = oSecondView;
				this.getView().byId("vbox").addItem(this.oSecondView);
				this.oAppComponent = Utils.getAppComponentForControl(this.getView());
			}.bind(this));
		},

		resetAllPersonalization: function () {
			var oLabelFromFirstView = this.getView().byId("firstView").byId("label");
			var oVariantLabelFromFirstView = this.getView().byId("firstView").byId("variantLabel");
			var oLabelFromSecondView = this.oSecondView.byId("label");
			var oVariantLabelFromSecondView = this.oSecondView.byId("variantLabel");
			this.oAppComponent.resetPersonalization([
				oLabelFromFirstView,
				oVariantLabelFromFirstView,
				oLabelFromSecondView,
				oVariantLabelFromSecondView
			]);
		},

		formatStatusState: function (aChanges, oView1LabelId, oView1VariantLabelId, oView2LabelId, oView2VariantLabelId) {
			return Helper.formatStatusState(aChanges, [oView1LabelId, oView1VariantLabelId, oView2LabelId, oView2VariantLabelId]);
		},

		formatStatusText: function (aChanges, oView1LabelId, oView1VariantLabelId, oView2LabelId, oView2VariantLabelId) {
			var sPersonalizationMessage = "At lease one label in the application IS personalized.";
			var sNoPersonalizationMessage = "NOT A SINGLE label in the application is personalized";
			return Helper.formatStatusText(aChanges, [oView1LabelId, oView1VariantLabelId, oView2LabelId, oView2VariantLabelId],
				sPersonalizationMessage, sNoPersonalizationMessage);
		}
	});
});