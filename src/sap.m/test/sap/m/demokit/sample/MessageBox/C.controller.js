sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.MessageBox.C", {

		onConfirmationMessageBoxPress: function () {
			MessageBox.confirm("Approve purchase order 12345?");
		},

		onAlertMessageBoxPress: function () {
			MessageBox.alert("The quantity you have reported exceeds the quantity planed.");
		},

		onErrorMessageBoxPress: function () {
			MessageBox.error("Select a team in the \"Development\" area.\n\"Marketing\" isn't assigned to this area.");
		},

		onInfoMessageBoxPress: function () {
			MessageBox.information("Your booking will be reserved for 24 hours.");
		},

		onWarningMessageBoxPress: function () {
			MessageBox.warning("The project schedule was last updated over a year ago.");
		},

		onSuccessMessageBoxPress: function () {
			MessageBox.success("Project 1234567 was created and assigned to team \"ABC\".");
		},

		onResponsivePaddingMessageBox: function () {
			MessageBox.information("This Message Box has responsive paddings which will adjust based on its content width!", {
				styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer"
			});
		},

		onError2MessageBoxPress: function () {
			MessageBox.error("Product A does not exist.", {
				actions: ["Manage Products", MessageBox.Action.CLOSE],
				emphasizedAction: "Manage Products",
				onClose: function (sAction) {
					MessageToast.show("Action selected: " + sAction);
				}
			});
		},

		onWarning2MessageBoxPress: function () {
			MessageBox.warning("The quantity you have reported exceeds the quantity planned.", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					MessageToast.show("Action selected: " + sAction);
				}
			});
		}

	});
});