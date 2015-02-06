sap.ui.controller("sap.m.sample.ObjectHeaderActiveAttributes.C", {

	onInit: function(evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	handleSAPLinkPressed: function(oEvent) {
		sap.m.URLHelper.redirect("http://www.sap.com", true);
	},

	handleFeedbacklinkPressed: function(oEvent) {
		var oDialog = new sap.m.Dialog({
			title: "Provide feedback",
			content: [
				new sap.m.VBox({
					fitContainer: true,
					items: [
						new sap.m.RatingIndicator({
							maxValue: 5
						}), new sap.m.TextArea({
							placeholder: "What do you think about this item?",
							rows: 5,
							cols: 30,
						})
					]
				})
			],
			beginButton: new sap.m.Button({
				text: "Submit",
				type: sap.m.ButtonType.Accept,
				press: function(oEvent) {
					oDialog.setBusyIndicatorDelay(0);
					oDialog.setBusy(true);
					setTimeout(function() {
						sap.m.MessageToast.show("Feedback sent.", {
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
			endButton: new sap.m.Button({
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
