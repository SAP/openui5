sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.table.testApps.TreeTableFilterDemo", {

		onInit: function () {
			var oView = this.getView();
			var oTableContainer = oView.byId("tableContainerPanel");
			var oTable = oTableContainer.getContent()[0];

			// recreate the columns
			var sSelectProperties = "HIERARCHY_NODE,DESCRIPTION,LEVEL,DRILLDOWN_STATE";
			var aProperties = sSelectProperties.split(",");
			jQuery.each(aProperties, function(iIndex, sProperty) {
				oTable.addColumn(new sap.ui.table.Column({
					label: sProperty,
					template: sProperty, 
					sortProperty: sProperty, 
					filterProperty: sProperty
				}));
			});
			
			//for easier table dbg
			window.oTable = oTable;
		},
		
		onActivateServicePress: function () {
			var oView = this.getView();
			
			var sServiceUrl = oView.byId("serviceURL").getValue();
			sServiceUrl = "../../../../../proxy/" + sServiceUrl.replace("://", "/");
			
			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oModel.setDefaultCountMode("Inline");
			
			this.getView().setModel(oModel);
			
			this.bindTable();
		},
		
		bindTable: function (sOperationMode, aFilters, iNumberOfExpandedLevels) {
			var oView = this.getView();
			var oTableContainer = oView.byId("tableContainerPanel");
			var oTable = oTableContainer.getContent()[0];
			
			// binding the table, based on the given parameters
			oTable.bindRows({
				path: "/orgHierarchy",
				filters: aFilters || [],
				parameters: {
					operationMode: sOperationMode || "Server",
					numberOfExpandedLevels: iNumberOfExpandedLevels || 0,
					
					// new flag to indicate, that the application filters shall always be performed serverside 
					useServersideApplicationFilters: true,
					
					// only used for testservices, which do not provide correctly annotated metadata
					treeAnnotationProperties: {
						hierarchyLevelFor: "LEVEL",
						hierarchyParentNodeFor: "PARENT_NODE",
						hierarchyNodeFor: "HIERARCHY_NODE",
						hierarchyDrillStateFor: "DRILLDOWN_STATE"
					},
					
				}
			});
		},
		
		filterButtonPress: function () {
			var oView = this.getView();
			var sFilters = oView.byId("filterDescription").getValue() || "";
			var aFilters = sFilters ? [new sap.ui.model.Filter("DESCRIPTION", "Contains", sFilters)] : [];
			var that = this;
			
			// Peform a selfmade count request, to decide if the Table can be bound in Client Mode 
			oView.getModel().read("/orgHierarchy/$count", {
				filters: aFilters,
				success: function (oData) {
					var iThreshold = parseInt(oView.byId("bindingThreshold").getValue(), 10);
					
					if (oData <= iThreshold) {
						that.bindTable("Client", aFilters, 3);
					} else {
						// Show a pop-up with a user confirmation dialogue. Used to enforce the filtering/auto-expand if needed.
						var oDialog = new sap.m.Dialog({
							title: "Filtering",
							type: "Message",
							content: new sap.m.Text({text: "There are " + oData + " filter matches for your request. Do you still want to apply the filters?"}),
							beginButton: new sap.m.Button({
								text: "Yes",
								press: function () {
									that.bindTable("Client", aFilters, 3);
									oDialog.close();
								}
							}),
							endButton: new sap.m.Button({
								text: "No",
								press: function () {
									oDialog.close();
								}
							}),
							afterClose: function () {
								oDialog.destroy();
							}
						});
						oDialog.open();
					}
				}
			});
		}
	});
});
