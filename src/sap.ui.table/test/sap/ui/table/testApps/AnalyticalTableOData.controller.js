sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.table.testApps.AnalyticalTableOData", {
		
		onInit: function () {
			var oFormData = {
				serviceURL: "http://veui5infra.dhcp.wdf.sap.corp:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata",
				collection: "ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				selectProperties: "CostCenter,CostCenterText,ActualCosts,Currency,PlannedCosts",
				tableThreshold: 10,
				bindingThreshold: 10000,
				dimensions: "CostCenter",
				measures:"PlannedCosts"
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
			
			var iTableThreshold = parseInt(oView.byId("tableThreshold").getValue(), 10);
			var iBindingThreshold = parseInt(oView.byId("bindingThreshold").getValue(), 10);
			
			//dimensions and measures of Analytical Table
			var aDimensions = oView.byId("dimensions").getValue().split(",");
			var aMeasures = oView.byId("measures").getValue().split(",");
			
			/**
			 * Clear the Table and rebind it 
			 */
			var oTableContainer = oView.byId("tableContainerPanel");
			
			var oTable = oTableContainer.getContent()[0];
			
			//clean up
			if (oTable) {
				oTableContainer.removeContent(oTable);
				oTable.unbindRows();
				oTable.destroyColumns();
				oTable.destroy();
			}
			
			oTable = new sap.ui.table.AnalyticalTable({});
			oTableContainer.addContent(oTable);
			
			// recreate the columns
			var aProperties = sSelectProperties.split(",");
			jQuery.each(aProperties, function(iIndex, sProperty) {
				var oColumn = new sap.ui.table.AnalyticalColumn({
					label: sProperty,
					template: sProperty, 
					sortProperty: sProperty, 
					filterProperty: sProperty,
					leadingProperty: sProperty
				});
				oTable.addColumn(oColumn);
				
				// add flag to column
				if (jQuery.inArray(sProperty, aDimensions) !== -1 && jQuery.inArray(sProperty, aMeasures) === -1) {
					oColumn.setGrouped(true);
				} else if (jQuery.inArray(sProperty, aDimensions) === -1 && jQuery.inArray(sProperty, aMeasures) !== -1) {
					oColumn.setSummed(true);
				} else if (jQuery.inArray(sProperty, aDimensions) !== -1 && jQuery.inArray(sProperty, aMeasures) !== -1) {
					sap.m.MessageToast.show("Property can only be either dimesion or measure.");
				}
			});

			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oModel.setDefaultCountMode("Inline");
			
			oTable.setModel(oModel);
			
			oTable.setThreshold(iTableThreshold);
			
			oTable.bindRows({
				path: "/" + sCollection,
				parameters: {
					threshold: iBindingThreshold
				}
			});
			
			//for easier table dbg
			window.oTable = oTable;
		}
	});
});
