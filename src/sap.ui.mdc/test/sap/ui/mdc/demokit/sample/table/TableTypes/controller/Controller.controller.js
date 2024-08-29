sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/enums/TableRowCountMode",
	"sap/ui/mdc/enums/TableGrowingMode",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function(Controller, GridTableType, ResponsiveTableType, TableRowCountMode, TableGrowingMode, mLibrary, coreLibrary, Fragment, JSONModel) {
	"use strict";

	const PopinLayout = mLibrary.PopinLayout;
	const Priority = coreLibrary.Priority;

	return Controller.extend("mdc.sample.controller.Controller", {
		onInit: function() {
			const oTable = this.getView().byId("table");
			oTable.setType(this.getGridTableType());

			const oViewModel = new JSONModel({
				respType: {
					detailsButtonSetting: [Priority.High],
					growingMode: TableGrowingMode.Basic,
					popinLayout: PopinLayout.Block,
					showDetailsButton: true
				},
				gridType: {
					fixedColumnCount: 0,
					rowCount: 10,
					rowCountMode: TableRowCountMode.Auto,
					scrollThreshold: -1,
					selectionLimit: 200,
					showHeaderSelector: true
				},
				enums: {
					rowCountMode: this.enumToObject(TableRowCountMode),
					growingMode: this.enumToObject(TableGrowingMode),
					popinLayout: this.enumToObject(PopinLayout),
					priority: this.enumToObject(Priority)
				}
			});

			this.getView().setModel(oViewModel, "view");
		},
		onTableTypeChange: function(oEvent) {
			const oSelectedType = oEvent.getParameter("selectedItem");
			const oTable = this.getView().byId("table");
			if (oSelectedType.getKey() === "ResponsiveTableType") {
				oTable.setType(this.getResponsiveTableType());
			} else {
				oTable.setType(this.getGridTableType());
			}
		},
		getGridTableType: function() {
			if (!this.oGridTableType) {
				this.oGridTableType = new GridTableType({
					fixedColumnCount: "{view>/gridType/fixedColumnCount}",
					rowCount: "{view>/gridType/rowCount}",
					rowCountMode: "{view>/gridType/rowCountMode}",
					scrollThreshold: "{view>/gridType/scrollThreshold}",
					selectionLimit: "{view>/gridType/selectionLimit}",
					showHeaderSelector: "{view>/gridType/showHeaderSelector}"
				});
			}
			return this.oGridTableType;
		},
		getResponsiveTableType: function() {
			if (!this.oResponsiveTableType) {
				this.oResponsiveTableType = new ResponsiveTableType({
					detailsButtonSetting: "{view>/respType/detailsButtonSetting}",
					growingMode: "{view>/respType/growingMode}",
					popinLayout: "{view>/respType/popinLayout}",
					showDetailsButton: "{view>/respType/showDetailsButton}"
				});
			}
			return this.oResponsiveTableType;
		},
		openConfigurationDialog: function() {
			const oTable = this.getView().byId("table");
			const sFragmentName = oTable.getType().isA("sap.ui.mdc.table.ResponsiveTableType") ? "ResponsiveTableType" : "GridTableType";
			if (!this.oDialog) {
				this.oDialog = Fragment.load({
					name: `mdc.sample.view.fragment.${sFragmentName}`,
					id: "configurationDialog",
					controller: this
				}).then((oDialog) => {
					this.getView().addDependent(oDialog);
					return oDialog;
				});
			}
			this.oDialog.then((oDialog) => {
				oDialog.open();
			});
		},
		closeDialog: function() {
			this.oDialog.then().then((oDialog) => {
				oDialog.close();
				oDialog.destroy();
			});
			this.oDialog = null;
		},
		onDetailsButtonChange: function(oEvent) {
			const aItems = oEvent.getParameter("selectedItems").map((oItem) => oItem.getKey());
			this.getView().getModel("view").setProperty("/respType/detailsButtonSetting", aItems);
		},
		enumToObject: function(oEnum) {
			return Object.values(oEnum).map((sValue) => {
				return {value: sValue};
			});
		}
	});
});