sap.ui.define([
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/MessageToast',
		'sap/m/RatingIndicator',
		'sap/m/TextArea',
		'sap/m/VBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/library',
		'sap/ui/core/Popup'
], function(Button, Dialog, MessageToast, RatingIndicator, TextArea, VBox, Controller, JSONModel,mobileLibrary,Popup) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	return Controller.extend("sap.m.sample.ObjectHeaderActiveAttributes.C", {

		onInit: function() {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		handleSAPLinkPressed: function() {
			sap.m.URLHelper.redirect("http://www.sap.com", true);
		},

		handleFeedbacklinkPressed: function() {
			var oDialog = new Dialog({
				title: "Provide feedback",
				content: [
					new VBox({
						fitContainer: true,
						items: [
							new RatingIndicator({
								maxValue: 5
							}), new TextArea({
								placeholder: "What do you think about this item?",
								rows: 5,
								cols: 30
							})
						]
					})
				],
				beginButton: new Button({
					text: "Submit",
					type: ButtonType.Accept,
					press: function() {
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
					press: function() {
						oDialog.close();
					}
				})
			});
			oDialog.open();
		}
	});

});