sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/sample/TableExampleUtils",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(Controller, TableExampleUtils, MessageToast,JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Selection.Controller", {
		
		onInit : function () {
			// set explored app's demo model on this sample
			var oJSONModel = TableExampleUtils.initSampleDataModel();
			var oView = this.getView();
			oView.setModel(oJSONModel);
			var oTable = oView.byId("table1");
			
			var aSelectionModes = [];
			jQuery.each(sap.ui.table.SelectionMode, function(k, v){
				if (k !== sap.ui.table.SelectionMode.All) {
					// selectionMode:All is deprecated but must remain in the enum for deprecated sap.ui.table.DataTable
					aSelectionModes.push({key: k, text: v});
				}
			});
			
			var aSelectionBehaviors = []; 
			jQuery.each(sap.ui.table.SelectionBehavior, function(k, v){
				aSelectionBehaviors.push({key: k, text: v})
			});
			
			// create JSON model instance
			var oModel = new JSONModel({
				"selectionitems": aSelectionModes,
				"behavioritems": aSelectionBehaviors	
			});
			
			oView.setModel(oModel, "selectionmodel");
		},
		
		onSelectionModeChange: function(oEvent) {
			if (oEvent.getParameter("selectedItem").getKey() === "All") {
				MessageToast.show("selectionMode:All is deprecated. Please select another one.");
				return;
			}
			var oTable = this.getView().byId("table1");
			oTable.setSelectionMode(oEvent.getParameter("selectedItem").getKey());
		},
		
		onBehaviourModeChange: function(oEvent) {
			var oTable = this.getView().byId("table1");
			oTable.setSelectionBehavior(oEvent.getParameter("selectedItem").getKey());
		},
		
		onSwitchChange: function(oEvent) {
			var oTable = this.getView().byId("table1");
			oTable.setEnableSelectAll(oEvent.getParameter("state"));
		},
		
		getSelectedIndices: function (evt) {
			var aIndices = this.getView().byId("table1").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "no item selected";
			} else {
				sMsg = aIndices;
			}
			MessageToast.show(sMsg);
		},
		
		getContextByIndex: function (evt) {
			var oTable = this.getView().byId("table1");
			var iIndex = oTable.getSelectedIndex();
			var sMsg;
			if (iIndex < 0) {
				sMsg = "no item selected";
			} else {
				sMsg = oTable.getContextByIndex(iIndex);
			}
			MessageToast.show(sMsg);
		},
		
		clearSelection: function (evt) {
			this.getView().byId("table1").clearSelection();
		},

		handleDetailsPress : function(oEvent) {
			MessageToast.show("Details for product with id " + oView.getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		}
		
	});

});
