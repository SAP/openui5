sap.ui.define([
	"sap/base/Log",
	"sap/ui/table/library",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/jquery"
], function(Log, library, Controller, MessageToast, JSONModel, DateFormat, jQuery) {
	"use strict";

	var SelectionBehavior = library.SelectionBehavior,
		SelectionMode = library.SelectionMode;

	return Controller.extend("sap.ui.table.sample.Selection.Controller", {

		onInit : function() {
			// set explored app's demo model on this sample
			var oJSONModel = this.initSampleDataModel();
			var oView = this.getView();
			oView.setModel(oJSONModel);

			var aSelectionModes = [];
			jQuery.each(SelectionMode, function(k, v){
				if (k != SelectionMode.Multi) {
					aSelectionModes.push({key: k, text: v});
				}
			});

			var aSelectionBehaviors = [];
			jQuery.each(SelectionBehavior, function(k, v){
				aSelectionBehaviors.push({key: k, text: v});
			});

			// create JSON model instance
			var oModel = new JSONModel({
				"selectionitems": aSelectionModes,
				"behavioritems": aSelectionBehaviors
			});

			oView.setModel(oModel, "selectionmodel");
		},

		initSampleDataModel : function() {
			var oModel = new JSONModel();

			var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"), {
				dataType: "json",
				success: function(oData) {
					var aTemp1 = [];
					var aTemp2 = [];
					var aSuppliersData = [];
					var aCategoryData = [];
					for (var i = 0; i < oData.ProductCollection.length; i++) {
						var oProduct = oData.ProductCollection[i];
						if (oProduct.SupplierName && aTemp1.indexOf(oProduct.SupplierName) < 0) {
							aTemp1.push(oProduct.SupplierName);
							aSuppliersData.push({Name: oProduct.SupplierName});
						}
						if (oProduct.Category && aTemp2.indexOf(oProduct.Category) < 0) {
							aTemp2.push(oProduct.Category);
							aCategoryData.push({Name: oProduct.Category});
						}
						oProduct.DeliveryDate = (new Date()).getTime() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
						oProduct.DeliveryDateStr = oDateFormat.format(new Date(oProduct.DeliveryDate));
						oProduct.Heavy = oProduct.WeightMeasure > 1000 ? "true" : "false";
						oProduct.Available = oProduct.Status == "Available" ? true : false;
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
			var oTable = this.byId("table1");
			oTable.setSelectionMode(oEvent.getParameter("selectedItem").getKey());
		},

		onBehaviourModeChange: function(oEvent) {
			var oTable = this.byId("table1");
			oTable.setSelectionBehavior(oEvent.getParameter("selectedItem").getKey());
		},

		onSwitchChange: function(oEvent) {
			var oTable = this.byId("table1");
			oTable.setEnableSelectAll(oEvent.getParameter("state"));
		},

		getSelectedIndices: function(evt) {
			var aIndices = this.byId("table1").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "no item selected";
			} else {
				sMsg = aIndices;
			}
			MessageToast.show(sMsg);
		},

		getContextByIndex: function(evt) {
			var oTable = this.byId("table1");
			var iIndex = oTable.getSelectedIndex();
			var sMsg;
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

		formatAvailableToObjectState : function(bAvailable) {
			return bAvailable ? "Success" : "Error";
		},

		formatAvailableToIcon : function(bAvailable) {
			return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
		},

		handleDetailsPress : function(oEvent) {
			MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		}

	});

});