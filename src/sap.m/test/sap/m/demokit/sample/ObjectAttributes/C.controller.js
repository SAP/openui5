sap.ui.define([
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/MessageToast',
		'sap/m/RatingIndicator',
		'sap/m/TextArea',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/m/library",
		"sap/ui/core/Popup"
], function(
	Button,
	Dialog,
	MessageToast,
	RatingIndicator,
	TextArea,
	Controller,
	JSONModel,
	MLibrary,
	Popup
) {
	"use strict";
	var URLHelper = MLibrary.URLHelper,
		ButtonType = MLibrary.ButtonType;

	return Controller.extend("sap.m.sample.ObjectAttributes.C", {

		onInit: function(evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		handleSAPLinkPressed: function(oEvent) {
			URLHelper.redirect("http://www.sap.com", true);
		},

		handleFeedbacklinkPressed: function(oEvent) {
			var oDialog = new Dialog({
				title: "Provide feedback",
				content: [
					new RatingIndicator({
						maxValue: 5
					}),
					new TextArea({
						placeholder: "What do you think about this item?",
						rows: 5,
						cols: 30,
						width: "100%"
					})
				],
				beginButton: new Button({
					text: "Submit",
					type: sap.m.ButtonType.Accept,
					press: function(oEvent) {
						oDialog.setBusyIndicatorDelay(0);
						oDialog.setBusy(true);
						setTimeout(function() {
							MessageToast.show("Feedback sent.", {
								duration: 2000,
								my: Popup.Dock.CenterCenter,
								at: Popup.Dock.CenterCenter,
								of: oDialog,
								onClose: function() {
									oDialog.close();
									oDialog.setBusy(false);
								}
							});
						}, 2000);
					}
				}),
				endButton: new Button({
					text: "Cancel",
					type: ButtonType.Reject,
					press: function(oEvent) {
						oDialog.close();
					}
				})
			}).addStyleClass("sapUiContentPadding");
			oDialog.open();
		}
	});

});