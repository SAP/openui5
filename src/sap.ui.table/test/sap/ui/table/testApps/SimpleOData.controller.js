sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.table.testApps.SimpleOData", {
		
		onInit: function () {
			var oFormData = {
				serviceURL: "",
				collection: "orgHierarchy",
				selectProperties: "HIERARCHY_NODE,DESCRIPTION,LEVEL,DRILLDOWN_STATE",
				countMode: "Inline",
				operationMode: "Server",
				tableThreshold: 30,
				bindingThreshold: 200,
				filterProperty: "LEVEL",
				filterOperator: "GT",
				filterValue: 4
			};
			var oModel = new JSONModel(oFormData);
			this.getView().setModel(oModel);
		},
		
		onCreateTableClick: function () {
			var oView = this.getView();
			
			var sServiceUrl = oView.byId("serviceURL").getValue();
			sServiceUrl = "../../../../../proxy/" + sServiceUrl.replace("://", "/");
			
			var sCollection = oView.byId("collection").getValue();
			var sSelectProperties = oView.byId("selectProperties").getValue();
			var sCountMode = oView.byId("countMode").getSelectedKey();
			var sOperationMode = oView.byId("operationMode").getSelectedKey();
			
			var sTableThreshold = oView.byId("tableThreshold").getValue();
			var sBindingThreshold = oView.byId("bindingThreshold").getValue();
			
			//application filter values
			var sFilterProperty = oView.byId("filterProperty").getValue();
			var sFilterOperator = oView.byId("filterOperator").getValue();
			var sFilterValue = oView.byId("filterValue").getValue();
			var oApplicationFilter = sFilterProperty && sFilterOperator && sFilterValue ? new sap.ui.model.Filter(sFilterProperty, sFilterOperator, sFilterValue) : [];
			
			/**
			 * Clear the Table and rebind it 
			 */
			var oTableContainer = oView.byId("tableContainerPanel");
			
			var oTable = oTableContainer.getContent()[0]
			
			//clean up
			if (oTable) {
				oTableContainer.removeContent(oTable);
				oTable.unbindRows();
				oTable.destroyColumns();
				oTable.destroy();
			}
			
			oTable = new sap.ui.table.Table();
			oTableContainer.addContent(oTable);
			
			// recreate the columns
			var aProperties = sSelectProperties.split(",");
			jQuery.each(aProperties, function(iIndex, sProperty) {
				oTable.addColumn(new sap.ui.table.Column({
					label: sProperty, 
					template: sProperty, 
					sortProperty: sProperty, 
					filterProperty: sProperty
				}));
			});

			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oModel.setDefaultCountMode("Inline");
			
			oTable.setModel(oModel);
			
			oTable.setThreshold(parseInt(sTableThreshold, 10));
			
			oTable.bindRows({
				path: "/" + sCollection,
				filters: oApplicationFilter,
				parameters: {
					threshold: sBindingThreshold,
					countMode: sCountMode,
					operationMode: sOperationMode
				}
			});
			
			//for easier table dbg
			window.oTable = oTable;
		}
	});
});