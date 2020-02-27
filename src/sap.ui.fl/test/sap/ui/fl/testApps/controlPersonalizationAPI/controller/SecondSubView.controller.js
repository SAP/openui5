sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"test/sap/ui/fl/testApps/controlPersonalizationAPIChanges/Helper"
], function (Layer, Controller, Utils, Helper) {
	"use strict";

	return Controller.extend("test.sap.ui.fl.testApps.controlPersonalizationAPIChanges.controller.SecondSubView", {

		oView: null,
		oFlexController: null,
		oLabel : null,
		oVariantLabel: null,
		oAppComponent: null,

		onInit: function () {
			this.oView = this.getView();
			this.oLabel = this.oView.byId("label");
			this.oVariantLabel = this.oView.byId("variantLabel");
			this.oAppComponent = Utils.getAppComponentForControl(this.getView());
		},

		onAfterRendering: function () {
			var oModel = this.oView.getModel();
			var oModelData = {
				secondView: {
					label: this.oLabel,
					variantLabel: this.oVariantLabel
				}
			};
			oModel.setData(oModelData, true);
		},

		createPersonalizationForLabel: function () {
			var mChangeData = {
				changeType: "changeLabel",
				layer: Layer.USER
			};
			this.oAppComponent.createChangesAndSave(mChangeData, this.oLabel);
		},

		resetPersonalizationForLabel: function () {
			this.oAppComponent.resetPersonalization([this.oLabel]);
		},

		createPersonalizationForVariantLabel: function () {
			var mChangeData = {
				changeType: "changeLabel",
				layer: Layer.USER
			};
			this.oAppComponent.createChangesAndSave(mChangeData, this.oVariantLabel);
		},

		resetPersonalizationForVariantLabel: function () {
			this.oAppComponent.resetPersonalization([this.oVariantLabel]);
		},

		formatStatusState: function (aChanges, oLabelId) {
			return Helper.formatStatusState(aChanges, [oLabelId]);
		},

		formatStatusText: function (aChanges, oLabelId) {
			var sPersonalizationMessage = "The label IS personalized.";
			var sNoPersonalizationMessage = "The label is NOT personalized";
			return Helper.formatStatusText(aChanges, [oLabelId], sPersonalizationMessage, sNoPersonalizationMessage);
		},

		formatStatusStateCombined: function (aChanges, oLabelId, oVariantLabelId) {
			return Helper.formatStatusState(aChanges, [oLabelId, oVariantLabelId]);
		},

		formatStatusTextCombined: function (aChanges, oLabelId, oVariantLabelId) {
			var sPersonalizationMessage = "At lease one label in the view IS personalized.";
			var sNoPersonalizationMessage = "NOT A SINGLE label in the view is personalized";
			return Helper.formatStatusText(aChanges, [oLabelId, oVariantLabelId],
				sPersonalizationMessage, sNoPersonalizationMessage);
		},

		updateLabels: function () {
			this.oView.getModel().updateBindings();
		}
	});
});