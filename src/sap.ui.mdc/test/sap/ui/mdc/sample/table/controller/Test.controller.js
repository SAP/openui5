sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/mdc/table/ResponsiveTableType',
	'sap/ui/mdc/table/RowSettings',
	'sap/ui/mdc/p13n/StateUtil',
	'sap/m/MessageBox',
	'sap/m/MessageToast'
], function(Controller, ResponsiveTableType, RowSettings, StateUtil, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.table.controller.Test", {

		onInit: function() {
			window.oTable = this.getView().byId("mdcTable");
		},

		formatHighlight: function(sPrice) {
			var price = sPrice.replace(",", "");

			if (price < 200) {
				return "None";
			} else if (price < 500) {
				return "Information";
			} else if (price < 1000) {
				return "Success";
			} else if (price < 1500) {
				return "Warning";
			} else {
				return "Error";
			}
		},

		formatNavigated: function(sID) {
			return (sID === "HT-1003");
		},

		toggleNavigated: function(oEvent) {
			var oTable = sap.ui.getCore().byId('onlyTableView').byId('mdcTable');
			var oSettings = oTable.getRowSettings();
			if (!oSettings) {
				oSettings = new RowSettings();
			}
			if (oEvent.getSource().getPressed()) {
				oSettings.bindProperty("navigated", {path: 'ProductID', type : 'sap.ui.model.type.Boolean', formatter: this.formatNavigated});
			} else {
				oSettings.unbindProperty("navigated");
				oSettings.setNavigated(false);
			}

			oTable.setRowSettings(oSettings);
		},

		toggleHighlight: function(oEvent) {
			var oTable = sap.ui.getCore().byId('onlyTableView').byId('mdcTable');
			var oSettings = oTable.getRowSettings();
			if (!oSettings) {
				oSettings = new RowSettings();
			}
			if (oEvent.getSource().getPressed()) {
				oSettings.bindProperty("highlight", {path: 'Price', formatter: this.formatHighlight});
			} else {
				oSettings.unbindProperty("highlight");
				oSettings.setHighlight("None");
			}

			oTable.setRowSettings(oSettings);
		},

		toggleShowDetails: function(oEvent) {
			var oTable = sap.ui.getCore().byId('onlyTableView').byId('mdcTable');
			var vType = oTable.getType();
			var bPressed = oEvent.getParameters().pressed;

			if (vType === "ResponsiveTable") {
				oTable.setType(new ResponsiveTableType({
					showDetailsButton: bPressed
				}));
			} else if (vType.constructor === ResponsiveTableType) {
				vType.setShowDetailsButton(bPressed);
			} else {
				MessageToast.show("Please switch to a ResponsiveTable first");
				oEvent.getSource().setPressed(false);
			}

		},

		switchToScrollableResponsiveTable: function() {
			sap.ui.getCore().byId('onlyTableView').byId('mdcTable').setType(new ResponsiveTableType({
				growingMode: 'Scroll'
			}));
		},

		switchToNonGrowingResponsiveTable: function() {
			sap.ui.getCore().byId('onlyTableView').byId('mdcTable').setType(new ResponsiveTableType({
				growingMode: 'None'
			}));
		},

		onRetrieveTableState: function(oEvent) {
			var oTable = this.getView().byId("mdcTable");
			if (oTable) {
				StateUtil.retrieveExternalState(oTable).then(function(oState) {
					var oOutput = this.getView().byId("CEretrieveTableState");
					if (oOutput) {
						oOutput.setValue(JSON.stringify(oState, null, "  "));
					}
				}.bind(this));
			}
		},

		onApplyTableState: function(oEvt) {
			var oTable = this.getView().byId("mdcTable");
			var oInputput = this.getView().byId("CEapplyTableState"), oInputJSON;
			if (oInputput) {
				oInputJSON = JSON.parse(oInputput.getValue());
			}
			if (oTable) {
				StateUtil.applyExternalState(oTable, oInputJSON).then(function(){

				});
			}
		},

		onCopyPressed: function() {
			var oSrc = this.getView().byId("CEretrieveTableState");
			if (oSrc) {
				oSrc.getValue();

				var oTrg = this.getView().byId("CEapplyTableState");
				if (oTrg) {
					oTrg.setValue(oSrc.getValue());
				}
			}
		},

		onPaste: function(oEvent) {
			var strData = oEvent.getParameter("data").map(function(row) {return row.join(", ");}).join("\n");
			MessageBox.information("Paste data:\n" + strData);
		}
	});
}, true);
