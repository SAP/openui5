sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/sample/TableExampleUtils",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, TableExampleUtils, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Resizing.Controller", {
		
		onInit : function () {
			// set explored app's demo model on this sample
			var oJSONModel = TableExampleUtils.initSampleDataModel();
			var oView = this.getView();
			oView.setModel(oJSONModel);
			
			oView.setModel(new JSONModel(), "ui");
			this.onColumnWidthsChange();
			
			this._messageBuffer = [];
		},
		
		onRowCountModeSelect : function(oEvent) {
			var oView = this.getView();
			var sButtonId = oEvent.getParameter("id");
			
			var sMode = "Fixed";
			if (sButtonId == oView.createId("rowCountModeAuto")) {
				sMode = "Auto";
			} else if (sButtonId == oView.createId("rowCountModeInteractive")) {
				sMode = "Interactive";
			}
			
			oView.byId("table").setVisibleRowCountMode(sMode);
		},
		
		onColumnWidthsChange : function(oEvent) {
			var oView = this.getView();
			var sButtonId = oEvent ? oEvent.getParameter("id") : null;
			
			var oWidthData;
			if (sButtonId == oView.createId("columnWidthsFlexible")) {
				oWidthData = {
					widthName: "25%",
					widthCategory: "25%",
					widthImage: "15%",
					widthQuantity: "10%",
					widthDate: "25%"
				};
			} else if (sButtonId == oView.createId("columnWidthsMixed")) {
				oWidthData = {
					widthName: "20%",
					widthCategory: "11rem",
					widthImage: "7rem",
					widthQuantity: "6rem",
					widthDate: "9rem"
				};
			} else {
				oWidthData = {
					widthName: "13rem",
					widthCategory: "11rem",
					widthImage: "7rem",
					widthQuantity: "6rem",
					widthDate: "9rem"
				};
			}
			
			oView.getModel("ui").setData(oWidthData);
		},
		
		onColumnResize : function(oEvent) {
			var oColumn = oEvent.getParameter("column");
			
			if (this.getView().byId("deliverydate") == oColumn) {
				oEvent.preventDefault();
			} else {
				this._messageBuffer.push("Column '" + oColumn.getLabel().getText() + "' was resized to " + oEvent.getParameter("width") + ".");
				if (this._messageTimer) {
					jQuery.sap.clearDelayedCall(this._messageTimer);
				}
				this._messageTimer = jQuery.sap.delayedCall(50, this, function(){
					MessageToast.show(this._messageBuffer.join("\n"));
					this._messageBuffer = [];
				});
			}
		},
		
		showInfo : function(oEvent) {
			TableExampleUtils.showInfo(jQuery.sap.getModulePath("sap.ui.table.sample.Resizing", "/info.json"), oEvent.getSource());
		}
		
	});

});
