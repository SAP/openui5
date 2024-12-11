sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/Fragment',
	'sap/m/MessageToast'
], function(Controller, Fragment, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.ViewSettingsDialogCustomTabs.C", {

		validateDate: function (oEvent) {
			var bValid = oEvent.getParameter("valid");
			var oDatePicker = oEvent.getSource();
			if (!bValid) {
				oDatePicker.setValueState("Error");
				oDatePicker.setValueStateText("Invalid date. Please enter a date in the correct format.");
			} else {
				oDatePicker.setValueState("None");
			}
		},

		handleOpenDialog: function () {
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					name: "sap.m.sample.ViewSettingsDialogCustomTabs.Dialog",
					controller: this
				});
			}
			this._pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		handleOpenDialogSingleCustomTab: function () {
			if (!this._pDialogSingleCustomTab) {
				this._pDialogSingleCustomTab = Fragment.load({
					id: "dialogSingleCustomTab",
					name: "sap.m.sample.ViewSettingsDialogCustomTabs.DialogSingleCustomTab",
					controller: this
				});
			}
			this._pDialogSingleCustomTab.then(function(oDialogSingleCustomTab) {
				oDialogSingleCustomTab.open();
			});
		},

		handleOpenDialogSingleCustomTabWithDatePicker: function () {
			if (!this._pDialogSingleCustomTabWithDatePicker) {
				this._pDialogSingleCustomTabWithDatePicker = Fragment.load({
					id: "dialogSingleCustomTabWithDatePicker",
					name: "sap.m.sample.ViewSettingsDialogCustomTabs.DialogSingleCustomTabWithDatePicker",
					controller: this
				});
			}
			var that = this;
			this._pDialogSingleCustomTabWithDatePicker.then(function(oDialogSingleCustomTabWithDatePicker) {
				oDialogSingleCustomTabWithDatePicker.attachBeforeClose(that.handleBeforeClose, that);
				var oDatePicker = Fragment.byId("dialogSingleCustomTabWithDatePicker", "datePicker");
				oDatePicker.attachChange(that.validateDate, that);
				oDialogSingleCustomTabWithDatePicker.open();
			});
		},

		handleConfirm: function (oEvent) {
			if (oEvent.getParameters().filterString) {
				MessageToast.show(oEvent.getParameters().filterString);
			}
		},

		handleBeforeClose: function (oEvent) {
			var oDatePicker = Fragment.byId("dialogSingleCustomTabWithDatePicker", "datePicker");
			if (oDatePicker.getValueState() === "Error") {
				oEvent.preventDefault();
				MessageToast.show("The entered date is invalid. Please correct it before closing the dialog.");
			}
		}
	});
});
