sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (MessageBox, Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.MessageBox.controller.MessageBox", {

		handleConfirmationMessageBoxPress: function () {
			MessageBox.confirm("Approve purchase order 12345?");
		},

		handleAlertMessageBoxPress: function () {
			MessageBox.alert("The quantity you have reported exceeds the quantity planed.");
		},

		handleErrorMessageBoxPress: function () {
			MessageBox.error("Select a team in the \"Development\" area.\n\"Marketing\" isn't assigned to this area.");
		},

		handleInfoMessageBoxPress: function () {
			MessageBox.information("You booking will be reserved for 24 hours.");
		},

		handleWarningMessageBoxPress: function () {
			MessageBox.warning("The project schedule was last updated over a year ago.");
		},

		handleSuccessMessageBoxPress: function () {
			MessageBox.success("Project 1234567 was created and assigned to team \"ABC\".");
		},

		handleResponsivePaddingMessageBox: function () {
			MessageBox.information("This Message Box has responsive paddings which will adjust based on its content width!", {
				styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer"
			});
		},

		handleError2MessageBoxPress: function () {
			MessageBox.error(
				"Product A does not exist.", {
					actions: ["Manage Products", MessageBox.Action.CLOSE],
					onClose: function (sAction) {
						MessageToast.show("Action selected: " + sAction);
					}
				}
			);
		},

		handleWarning2MessageBoxPress: function () {
			MessageBox.warning(
				"The quantity you have reported exceeds the quantity planned.", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: function (sAction) {
						MessageToast.show("Action selected: " + sAction);
					}
				}
			);
		}

	});
});