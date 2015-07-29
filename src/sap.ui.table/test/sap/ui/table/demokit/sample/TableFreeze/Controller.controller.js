sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/sample/TableExampleUtils",
	"sap/m/MessageToast"
], function(Controller, TableExampleUtils, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.TableFreeze.Controller", {
		
		onInit : function () {
			// set explored app's demo model on this sample
			var oJSONModel = TableExampleUtils.initSampleDataModel();
			this.getView().setModel(oJSONModel);
		},
		
		handleDetailsPress : function(oEvent) {
			MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		},
		
		buttonPress : function (oEvent) {
			var oView = this.getView(),
				oTable = oView.byId("table1"),
				sColumnCount = oView.byId("inputColumn").getValue() || 0,
				sRowCount = oView.byId("inputRow").getValue() || 0,
				sBottomRowCount = oView.byId("inputButtomRow").getValue() || 0,
				iColumnCount = parseInt(sColumnCount,10),
				iRowCount = parseInt(sRowCount,10),
				iBottomRowCount = parseInt(sBottomRowCount,10),
				iTotalColumnCount = oTable.getColumns().length,
				iTotalRowCount = oTable.getRows().length;
			
			// Fixed column count exceeds the total column count
			if (iColumnCount > iTotalColumnCount) {
				iColumnCount = iTotalColumnCount;
				oView.byId("inputColumn").setValue(iTotalColumnCount);
				MessageToast.show("Fixed column count exceeds the total column count. Value in column count input got updated.");
			}
			
			// Sum of fixed row count and bottom row count exceeds the total row count
			if (iRowCount + iBottomRowCount > iTotalRowCount) {
				
				if ((iRowCount < iTotalRowCount) && (iBottomRowCount < iTotalRowCount)) {
					// both row count and bottom count smaller than total row count
					iBottomRowCount = 1;
				} else if ((iRowCount > iTotalRowCount) && (iBottomRowCount < iTotalRowCount)) {
					// row count exceeds total row count
					iRowCount = iTotalRowCount - iBottomRowCount - 1;
				} else if ((iRowCount < iTotalRowCount) && (iBottomRowCount > iTotalRowCount)) {
					// bottom row count exceeds total row count
					iBottomRowCount = iTotalRowCount - iRowCount - 1;
				} else {
					// both row count and bottom count exceed total row count
					iRowCount = 1;
					iBottomRowCount = 1;
				}
				
				// update inputs
				oView.byId("inputRow").setValue(iRowCount);
				oView.byId("inputButtomRow").setValue(iBottomRowCount);
				MessageToast.show("Sum of fixed row count and buttom row count exceeds the total row count. Input values got updated.");
			}
			
			oTable.setFixedColumnCount(iColumnCount);
			oTable.setFixedRowCount(iRowCount);
			oTable.setFixedBottomRowCount(iBottomRowCount);
		}
		
	});

});
