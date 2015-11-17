sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.table.testApps.TreeTableOData", {
		
		onInit: function () {
			var oFormData = {
				serviceURL: "",
				collection: "orgHierarchy",
				selectProperties: "HIERARCHY_NODE,DESCRIPTION,LEVEL,DRILLDOWN_STATE",
				countMode: "Inline",
				operationMode: "Auto",
				tableThreshold: 10,
				bindingThreshold: 10000,
				rootLevel: 0,
				filterProperty: "DESCRIPTION",
				filterOperator: "Contains",
				filterValue: ""
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
			
			// threshold for OperationMode.Auto
			var iTableThreshold = parseInt(oView.byId("tableThreshold").getValue(), 10);
			var iBindingThreshold = parseInt(oView.byId("bindingThreshold").getValue(), 10);
			
			// the root level of the tree
			var iRootLevel = parseInt(oView.byId("rootLevel").getValue(), 10);
			
			// application filter values
			var sFilterProperty = oView.byId("filterProperty").getValue();
			var sFilterOperator = oView.byId("filterOperator").getValue();
			var sFilterValue = oView.byId("filterValue").getValue();
			var oApplicationFilter = sFilterProperty && sFilterOperator && sFilterValue ? new sap.ui.model.Filter(sFilterProperty, sFilterOperator, sFilterValue) : [];
			
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
			
			jQuery.sap.measure.start("createTable");
			
			oTable = new sap.ui.table.TreeTable({
				rootLevel: iRootLevel
			});
			oTableContainer.addContent(oTable);
			
			oTable.addDelegate({
				onBeforeRendering: function () {
					jQuery.sap.measure.start("onBeforeRendering","",["Render"]);
					jQuery.sap.measure.start("rendering","",["Render"]);
				},
				onAfterRendering: function () {
					jQuery.sap.measure.start("onAfterRendering","",["Render"]);
				}
			}, true);

			oTable.addDelegate({
				onBeforeRendering: function () {
					jQuery.sap.measure.end("onBeforeRendering");
				},
				onAfterRendering: function () {
					jQuery.sap.measure.end("onAfterRendering");
					jQuery.sap.measure.end("rendering");
				}
			}, false);
			
			var fnRowsUpdated = function() {
				oTable.detachEvent("_rowsUpdated", fnRowsUpdated);

				var iOverall = jQuery.sap.measure.end("createTable").duration;
				var iRendering = jQuery.sap.measure.getMeasurement("rendering").duration;
				var iBeforeRendering = jQuery.sap.measure.getMeasurement("onBeforeRendering").duration;
				var iAfterRendering = jQuery.sap.measure.getMeasurement("onAfterRendering").duration;

				var iTableCreate = (iOverall - iRendering);
				var iFactor = Math.round(iAfterRendering / iRendering * 100);

				oView.byId("overall").setText(iOverall);
				oView.byId("onBeforeRendering").setText(iBeforeRendering);
				oView.byId("rendering").setText(iRendering);
				oView.byId("onAfterRendering").setText(iAfterRendering);
				oView.byId("tableCreate").setText(iTableCreate);
				oView.byId("factor").setText(iFactor);
			};
			
			oTable.attachEvent("_rowsUpdated", fnRowsUpdated);
			
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
			
			oTable.setThreshold(iTableThreshold);
			
			oTable.bindRows({
				path: "/" + sCollection,
				filters: oApplicationFilter,
				parameters: {
					threshold: iBindingThreshold,
					countMode: sCountMode,
					operationMode: sOperationMode,
					//navigation: {orgHierarchyRoot: "toChildren", orgHierarchy: "toChildren"}
					treeAnnotationProperties: {
						hierarchyLevelFor: "LEVEL",
						hierarchyParentNodeFor: "PARENT_NODE",
						hierarchyNodeFor: "HIERARCHY_NODE",
						hierarchyDrillStateFor: "DRILLDOWN_STATE"
					}
				}
			});
			
			//for easier table dbg
			window.oTable = oTable;
			
			var aJSMeasure = jQuery.sap.measure.filterMeasurements(function(oMeasurement) {
				return oMeasurement.categories.indexOf("JS") > -1? oMeasurement : null;
			});
			
			var aRenderMeasure = jQuery.sap.measure.filterMeasurements(function(oMeasurement) {
				return oMeasurement.categories.indexOf("Render") > -1? oMeasurement : null;
			});
			
			//set test result
			this.getView().byId("_createRows").setText(aJSMeasure[0].duration);
			this.getView().byId("_updateRowHeader").setText(aJSMeasure[1].duration);
			this.getView().byId("_syncColumnHeaders").setText(aJSMeasure[2].duration);
			this.getView().byId("_updateTableContent").setText(aJSMeasure[3].duration);		
		}
	});
});
