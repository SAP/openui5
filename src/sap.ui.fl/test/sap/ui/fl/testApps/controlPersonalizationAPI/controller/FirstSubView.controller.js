sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"test/sap/ui/fl/testApps/controlPersonalizationAPIChanges/Helper"
], function(Controller, Layer, Utils, Helper) {
	"use strict";

	return Controller.extend("test.sap.ui.fl.testApps.controlPersonalizationAPIChanges.controller.FirstSubView", {

		oView: null,
		oFlexController: null,
		oLabel: null,
		oVariantLabel: null,
		oAppComponent: null,

		onInit() {
			this.oView = this.getView();
			this.oLabel = this.oView.byId("label");
			this.oVariantLabel = this.oView.byId("variantLabel");
			this.oAppComponent = Utils.getAppComponentForControl(this.getView());
		},

		onAfterRendering() {
			var oModel = this.oView.getModel();
			var oModelData = {
				firstView: {
					label: this.oLabel,
					variantLabel: this.oVariantLabel
				}
			};
			oModel.setData(oModelData, true);
		},

		createPersonalizationForLabel() {
			var mChangeData = {
				changeType: "changeLabel",
				layer: Layer.USER
			};
			this.oAppComponent.createChangesAndSave(mChangeData, this.oLabel);
		},

		resetPersonalizationForLabel() {
			this.oAppComponent.resetPersonalization([this.oLabel]);
		},

		createPersonalizationForVariantLabel() {
			var mChangeData = {
				changeType: "changeLabel",
				layer: Layer.USER
			};
			this.oAppComponent.createChangesAndSave(mChangeData, this.oVariantLabel);
		},

		resetPersonalizationForVariantLabel() {
			this.oAppComponent.resetPersonalization([this.oVariantLabel]);
		},

		formatStatusState(aChanges, oLabelId) {
			return Helper.formatStatusState(aChanges, [oLabelId]);
		},

		formatStatusText(aChanges, oLabelId) {
			var sPersonalizationMessage = "The label IS personalized.";
			var sNoPersonalizationMessage = "The label is NOT personalized";
			return Helper.formatStatusText(aChanges, [oLabelId], sPersonalizationMessage, sNoPersonalizationMessage);
		},

		formatStatusStateCombined(aChanges, oLabelId, oVariantLabelId) {
			return Helper.formatStatusState(aChanges, [oLabelId, oVariantLabelId]);
		},

		formatStatusTextCombined(aChanges, oLabelId, oVariantLabelId) {
			var sPersonalizationMessage = "At least one label in the view IS personalized.";
			var sNoPersonalizationMessage = "NOT A SINGLE label in the view is personalized";
			return Helper.formatStatusText(aChanges, [oLabelId, oVariantLabelId],
				sPersonalizationMessage, sNoPersonalizationMessage);
		},

		updateLabels() {
			this.oView.getModel().updateBindings();
		}
	});
});