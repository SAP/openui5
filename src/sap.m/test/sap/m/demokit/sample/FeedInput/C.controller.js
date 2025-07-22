sap.ui.define(['sap/m/MessageToast','sap/ui/core/mvc/Controller', 'sap/m/Dialog', 'sap/m/Button', 'sap/m/Text'],
	function(MessageToast, Controller, Dialog, Button, Text) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.FeedInput.C", {

		onPost: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			MessageToast.show("Posted new feed entry: " + sValue);
		},

		onActionButtonPress: function (oEvent) {
			var oFeedInput = oEvent.getSource().getParent();
			var oDialog = new Dialog({
				title: "Action Button Dialog",
				content: [
					new Text({ text: "Choose an action." })
				],
				beginButton: new Button({
					text: "Enable Post Button",
					press: function () {
						oFeedInput.enablePostButton(true);
						oDialog.close();
					}
				}),
				endButton: new Button({
					text: "Disable Post Button",
					press: function () {
						oFeedInput.enablePostButton(false);
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});
			oDialog.open();
		}
	});

	return CController;

});
