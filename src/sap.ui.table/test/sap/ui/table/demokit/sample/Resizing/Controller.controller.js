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
			
			oView.setModel(new JSONModel({
				visibleRowCountMode: "Fixed"
			}), "ui");
			this.onColumnWidthsChange();
			
			this._messageBuffer = [];
		},
		
		onColumnWidthsChange : function(oEvent) {
			var sColumnWidthMode = oEvent ? oEvent.getParameter("key") : "Static";
			var oWidthData;
			
			if (sColumnWidthMode == "Flexible") {
				oWidthData = {
					name: "25%",
					category: "25%",
					image: "15%",
					quantity: "10%",
					date: "25%"
				};
			} else {
				oWidthData = {
					name: sColumnWidthMode == "Mixed" ? "20%" : "13rem",
					category: "11rem",
					image: "7rem",
					quantity: "6rem",
					date: "9rem"
				};
			}
			
			this.getView().getModel("ui").setProperty("/widths", oWidthData);
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
					this._messageTimer = null;
				});
			}
		},
		
		showInfo : function(oEvent) {
			TableExampleUtils.showInfo(jQuery.sap.getModulePath("sap.ui.table.sample.Resizing", "/info.json"), oEvent.getSource());
		}
		
	});

});
