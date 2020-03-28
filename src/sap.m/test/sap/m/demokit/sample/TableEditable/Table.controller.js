sap.ui.define([
	'jquery.sap.global',
	'./Formatter',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/ColumnListItem',
	'sap/m/Input',
	'sap/m/MessageToast'
], function(jQuery, Formatter, Controller, JSONModel, ColumnListItem, Input, MessageToast) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableEditable.Table", {

		onInit: function(evt) {
			this.oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.oTable = this.byId("idProductsTable");
			this.getView().setModel(this.oModel);
			this.oReadOnlyTemplate = this.byId("idProductsTable").removeItem(0);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
			this.oEditableTemplate = new ColumnListItem({
				cells: [
					new Input({
						value: "{Name}"
					}), new Input({
						value: "{Quantity}",
						description: "{UoM}"
					}), new Input({
						value: "{WeightMeasure}",
						description: "{WeightUnit}"
					}), new Input({
						value: "{Price}",
						description: "{CurrencyCode}"
					})
				]
			});
		},

		rebindTable: function(oTemplate, sKeyboardMode) {
			this.oTable.bindItems({
				path: "/ProductCollection",
				template: oTemplate,
				templateShareable: true,
				key: "ProductId"
			}).setKeyboardMode(sKeyboardMode);
		},

		onEdit: function() {
			this.aProductCollection = jQuery.extend(true, [], this.oModel.getProperty("/ProductCollection"));
			this.byId("editButton").setVisible(false);
			this.byId("saveButton").setVisible(true);
			this.byId("cancelButton").setVisible(true);
			this.rebindTable(this.oEditableTemplate, "Edit");
		},

		onSave: function() {
			this.byId("saveButton").setVisible(false);
			this.byId("cancelButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
		},

		onCancel: function() {
			this.byId("cancelButton").setVisible(false);
			this.byId("saveButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.oModel.setProperty("/ProductCollection", this.aProductCollection);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
		},

		onOrder: function() {
			MessageToast.show("Order button pressed");
		},

		onExit: function() {
			this.aProductCollection = [];
			this.oEditableTemplate.destroy();
			this.oModel.destroy();
		},

		onPaste: function(oEvent) {
			var aData = oEvent.getParameter("data");
			MessageToast.show("Pasted Data: " + aData);
		}
	});

	return TableController;

});