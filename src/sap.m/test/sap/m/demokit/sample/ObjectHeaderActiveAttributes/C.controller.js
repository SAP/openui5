sap.ui.define([
		'jquery.sap.global',
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/MessageToast',
		'sap/m/RatingIndicator',
		'sap/m/TextArea',
		'sap/m/VBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Button, Dialog, MessageToast, RatingIndicator, TextArea, VBox, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.ObjectHeaderActiveAttributes.C", {

		onInit: function(evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		handleSAPLinkPressed: function(oEvent) {
			sap.m.URLHelper.redirect("http://www.sap.com", true);
		},

		handleFeedbacklinkPressed: function(oEvent) {
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
					type: sap.m.ButtonType.Accept,
					press: function(oEvent) {
						oDialog.setBusyIndicatorDelay(0);
						oDialog.setBusy(true);
						setTimeout(function() {
							MessageToast.show("Feedback sent.", {
								duration: 2000,
								my: sap.ui.core.Popup.Dock.CenterCenter,
								at: sap.ui.core.Popup.Dock.CenterCenter,
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
					type: sap.m.ButtonType.Reject,
					press: function(oEvent) {
						oDialog.close();
					}
				})
			});
			oDialog.open();
		}
	});


	return CController;

});