sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.table.testApps.AnalyticalTableOData", {

		onInit: function () {
			var oFormData = {
				serviceURL: "",
				collection: "",
				selectProperties: "CostCenter,CostCenterText,ActualCosts,Currency,PlannedCosts",
				tableThreshold: 10,
				bindingThreshold: 10000,
				dimensions: "CostCenter",
				measures:"PlannedCosts"
			};
			var oModel = new JSONModel(oFormData);
			this.getView().setModel(oModel);
		},

		onCreateTableClick: function (){

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

			jQuery.sap.measure.start("createTable");
			oTable = new sap.ui.table.AnalyticalTable({});
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
				console.timeStamp("RowsUpdated");

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


			window.oTable = oTable;

			var aJSMeasure = jQuery.sap.measure.filterMeasurements(function(oMeasurement) {
				return oMeasurement.categories.indexOf("JS") > -1? oMeasurement : null;
			});
			console.table(aJSMeasure);


			var aRenderMeasure = jQuery.sap.measure.filterMeasurements(function(oMeasurement) {
				return oMeasurement.categories.indexOf("Render") > -1? oMeasurement : null;
			});

			console.table(aRenderMeasure);

			//set test result
			this.getView().byId("_createRows").setText(aJSMeasure[0].duration);
			this.getView().byId("_updateTableContent").setText(aJSMeasure[1].duration);
			this.getView().byId("_updateRowHeader").setText(aJSMeasure[2].duration);
			this.getView().byId("_syncColumnHeaders").setText(aJSMeasure[3].duration);
		}
	});
});
