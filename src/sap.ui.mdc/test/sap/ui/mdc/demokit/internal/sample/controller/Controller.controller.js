sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/mdc/table/RowSettings',
	'sap/ui/core/Fragment',
	'sap/ui/mdc/p13n/StateUtil',
	'sap/m/MessageBox'
], function(Controller, RowSettings, Fragment, StateUtil, MessageBox) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.controller.Controller", {

		onInit: function() {

		},

		onBeforeExport: function (oEvt) {
			var mExcelSettings = oEvt.getParameter("exportSettings");

			// Disable Worker as Mockserver is used in Demokit sample --> Do not use this for real applications!
			// Disable useBatch as the Mockserver doesn't support it
			mExcelSettings.worker = false;
			mExcelSettings.dataSource.useBatch = false;
		},

		onGridTableSettingsPress: function(oEvent) {
			if (!this.oGridTableSettingsDialog) {
				this.oGridTableSettingsDialog = Fragment.load({
					name: "sap.ui.mdc.sample.GridTable.TableSettings",
					controller: this
				}).then(function(oDialog) {
					this.oGridTableSettingsDialog = oDialog;
					this.getView().addDependent(this.oGridTableSettingsDialog);
					this.oGridTableSettingsDialog.open();
				}.bind(this));
			} else {
				this.oGridTableSettingsDialog.open();
			}
		},

		onGridTableDialogClose: function(oEvent) {
			this.oGridTableSettingsDialog.close();
		},

		onResponsiveTableSettingsPress: function(oEvent) {
			if (!this.oResponsiveTableSettingsDialog) {
				this.oResponsiveTableSettingsDialog = Fragment.load({
					name: "sap.ui.mdc.sample.ResponsiveTable.TableSettings",
					controller: this
				}).then(function(oDialog) {
					this.oResponsiveTableSettingsDialog = oDialog;
					this.getView().addDependent(this.oResponsiveTableSettingsDialog);
					this.oResponsiveTableSettingsDialog.open();
				}.bind(this));
			} else {
				this.oResponsiveTableSettingsDialog.open();
			}
		},

		onResponsiveTableDialogClose: function(oEvent) {
			this.oResponsiveTableSettingsDialog.close();
		},

		onSelectionModeChange: function(oEvent) {
			var oTable = this.byId("mdcTable");
			var sKey = oEvent.getParameter("selectedItem").getKey();

			oTable.setSelectionMode(sKey);
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

		onToggleHighlight: function(oEvent) {
			var oTable = this.byId('mdcTable');
			var oSettings = oTable.getRowSettings();
			if (!oSettings) {
				oSettings = new RowSettings();
			}
			if (oEvent.getSource().getSelected()) {
				oSettings.bindProperty("highlight", {path: 'Price', formatter: this.formatHighlight});
			} else {
				oSettings.unbindProperty("highlight");
				oSettings.setHighlight("None");
			}

			oTable.setRowSettings(oSettings);
		},

		formatNavigated: function(sID) {
			return (sID === "HT-1003");
		},

		// only Grid Table
		onToggleNavigation: function(oEvent) {
			var oTable = this.byId('mdcTable');
			if (oEvent.getSource().getSelected()) {
				oTable.setRowAction(['Navigation']);
			} else {
				oTable.setRowAction();
			}
		},

		onToggleNavIndicator: function(oEvent) {
			var oTable = this.byId('mdcTable');
			var oSettings = oTable.getRowSettings();
			if (!oSettings) {
				oSettings = new RowSettings();
			}
			if (oEvent.getSource().getSelected()) {
				oSettings.bindProperty("navigated", {
					path: 'ProductID',
					type : 'sap.ui.model.type.Boolean',
					formatter: this.formatNavigated});
			} else {
				oSettings.unbindProperty("navigated");
				oSettings.setNavigated(false);
			}

			oTable.setRowSettings(oSettings);
		},

		onToggleP13n: function(oEvent) {
			var oTable = this.byId('mdcTable');
			if (oEvent.getSource().getSelected()) {
				oTable.setP13nMode(['Column','Sort']);
			} else {
				oTable.setP13nMode();
			}
		},

		onToggleBusyState: function(oEvent) {
			var oTable = this.byId('mdcTable');
			oTable.setBusy(oEvent.getSource().getSelected());
		},

		onToggleQuickFilter: function(oEvent) {
			var oQuickFilter = this.byId('quickFilter');
			oQuickFilter.setVisible(oEvent.getSource().getSelected());
		},

		// only responsive table
		onToggleShowDetails: function(oEvent) {
			var oTable = this.byId('mdcTable');
			var vType = oTable.getType();
			var bSelected = oEvent.getParameters().selected;
			var oFEButtonSetting = sap.ui.getCore().byId("fe-detailsButtonSetting");
			var oMCBButtonSetting = sap.ui.getCore().byId("mcb-detailsButtonSetting");

			if (vType === "ResponsiveTable") {
				oTable.setType(new sap.ui.mdc.table.ResponsiveTableType({
					showDetailsButton: bSelected
				}));
				oFEButtonSetting.setVisible(bSelected);
				if (!bSelected) {
					oMCBButtonSetting.removeAllSelectedItems();
				}
			} else if (vType.constructor === sap.ui.mdc.table.ResponsiveTableType) {
				vType.setShowDetailsButton(bSelected);
				oFEButtonSetting.setVisible(bSelected);
				if (!bSelected) {
					oMCBButtonSetting.removeAllSelectedItems();
				}
			} else {
				oEvent.getSource().setSelected(false);
				oFEButtonSetting.setVisible(false);
				oMCBButtonSetting.removeAllSelectedItems();
			}
		},

		onButtonSettingSelectionFinish: function(oEvent){
			var aItems = [];
			var oTable = this.byId('mdcTable');
			var vType = oTable.getType();

			oEvent.getParameter("selectedItems").forEach(function(oItem) {
				aItems.push(oItem.getKey());
			});
			vType.setDetailsButtonSetting(aItems);
		},

		// only responsive table
		onGrowingModeChange: function(oEvent) {
			var oTable = this.byId("mdcTable");
			var sKey = oEvent.getParameter("selectedItem").getKey();

			oTable.setType(new sap.ui.mdc.table.ResponsiveTableType({
				growingMode: sKey
			}));
		},

		// only grid table
		onToggleCreationRow: function(oEvent) {
			var oTable = this.byId('mdcTable');
			oTable.getCreationRow().setVisible(oEvent.getSource().getSelected());
		},

		onRetrieveTableState: function(oEvent) {
			var oTable = this.byId("mdcTable");
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
			var oTable = this.byId("mdcTable");
			var oInput = this.byId("CEapplyTableState"), oInputJSON;
			if (oInput) {
				oInputJSON = JSON.parse(oInput.getValue());
			}
			if (oTable) {
				StateUtil.applyExternalState(oTable, oInputJSON).then(function(){

				});
			}
		},

		onCopyPressed: function() {
			var oSrc = this.byId("CEretrieveTableState");
			if (oSrc) {
				oSrc.getValue();

				var oTrg = this.byId("CEapplyTableState");
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
