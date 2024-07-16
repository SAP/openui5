sap.ui.define([
	"sap/base/Log",
	"sap/ui/table/library",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date"
], function(Log, library, Controller, MessageToast, JSONModel, DateFormat, jQuery, UI5Date) {
	"use strict";

	const SelectionBehavior = library.SelectionBehavior;
	const SelectionMode = library.SelectionMode;

	return Controller.extend("sap.ui.table.sample.Selection.Controller", {

		onInit: function() {
			// set explored app's demo model on this sample
			const oJSONModel = this.initSampleDataModel();
			const oView = this.getView();
			oView.setModel(oJSONModel);

			const aSelectionModes = [];
			jQuery.each(SelectionMode, function(k, v) {
				aSelectionModes.push({key: k, text: v});
			});

			const aSelectionBehaviors = [];
			jQuery.each(SelectionBehavior, function(k, v) {
				aSelectionBehaviors.push({key: k, text: v});
			});

			// create JSON model instance
			const oModel = new JSONModel({
				"selectionitems": aSelectionModes,
				"behavioritems": aSelectionBehaviors
			});

			oView.setModel(oModel, "selectionmodel");
		},

		initSampleDataModel: function() {
			const oModel = new JSONModel();

			const oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"), {
				dataType: "json",
				success: function(oData) {
					const aTemp1 = [];
					const aTemp2 = [];
					const aSuppliersData = [];
					const aCategoryData = [];
					for (let i = 0; i < oData.ProductCollection.length; i++) {
						const oProduct = oData.ProductCollection[i];
						if (oProduct.SupplierName && aTemp1.indexOf(oProduct.SupplierName) < 0) {
							aTemp1.push(oProduct.SupplierName);
							aSuppliersData.push({Name: oProduct.SupplierName});
						}
						if (oProduct.Category && aTemp2.indexOf(oProduct.Category) < 0) {
							aTemp2.push(oProduct.Category);
							aCategoryData.push({Name: oProduct.Category});
						}
						oProduct.DeliveryDate = Date.now() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
						oProduct.DeliveryDateStr = oDateFormat.format(UI5Date.getInstance(oProduct.DeliveryDate));
						oProduct.Heavy = oProduct.WeightMeasure > 1000 ? "true" : "false";
						oProduct.Available = oProduct.Status === "Available" ? true : false;
					}

					oData.Suppliers = aSuppliersData;
					oData.Categories = aCategoryData;

					oModel.setData(oData);
				},
				error: function() {
					Log.error("failed to load json");
				}
			});

			return oModel;
		},

		onSelectionModeChange: function(oEvent) {
			if (oEvent.getParameter("selectedItem").getKey() === "All") {
				MessageToast.show("selectionMode:All is deprecated. Please select another one.");
				return;
			}
			const oTable = this.byId("table1");
			oTable.setSelectionMode(oEvent.getParameter("selectedItem").getKey());
		},

		onBehaviourModeChange: function(oEvent) {
			const oTable = this.byId("table1");
			oTable.setSelectionBehavior(oEvent.getParameter("selectedItem").getKey());
		},

		onSwitchChange: function(oEvent) {
			const oTable = this.byId("table1");
			oTable.setEnableSelectAll(oEvent.getParameter("state"));
		},

		getSelectedIndices: function(evt) {
			const aIndices = this.byId("table1").getSelectedIndices();
			let sMsg;
			if (aIndices.length < 1) {
				sMsg = "no item selected";
			} else {
				sMsg = aIndices;
			}
			MessageToast.show(sMsg);
		},

		getContextByIndex: function(evt) {
			const oTable = this.byId("table1");
			const iIndex = oTable.getSelectedIndex();
			let sMsg;
			if (iIndex < 0) {
				sMsg = "no item selected";
			} else {
				sMsg = oTable.getContextByIndex(iIndex);
			}
			MessageToast.show(sMsg);
		},

		clearSelection: function(evt) {
			this.byId("table1").clearSelection();
		},

		formatAvailableToObjectState: function(bAvailable) {
			return bAvailable ? "Success" : "Error";
		},

		formatAvailableToIcon: function(bAvailable) {
			return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
		},

		handleDetailsPress: function(oEvent) {
			MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		}

	});

});