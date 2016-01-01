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
				filterValue: 4,
				visibleRowCount: 10,
				visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Fixed,
				overall: 0,
				onBeforeRendering: 0,
				rendering: 0,
				onAfterRendering: 0,
				tableCreate: 0,
				factor: 0,
				createRows: 0,
				updateTableContent: 0,
				updateRowHeader: 0,
				syncColumnHeaders: 0
			};
			var oModel = new JSONModel(oFormData);
			this.getView().setModel(oModel);

			this.aRenderResults = [];
			this.aFunctionResults = [];
			this.aVisibleRow = [];
		},

		onCreateTableClick: function () {
			var oView = this.getView(),
				oDataModel = oView.getModel();

			var sServiceUrl = oDataModel.getProperty("/serviceURL");
			sServiceUrl = "../../../../../proxy/" + sServiceUrl.replace("://", "/");

			var sCollection = oDataModel.getProperty("/collection");
			var sSelectProperties = oDataModel.getProperty("/selectProperties");
			var sCountMode = oDataModel.getProperty("/countMode");
			var sOperationMode = oDataModel.getProperty("/operationMode");

			var sBindingThreshold = oDataModel.getProperty("/bindingThreshold");

			//application filter values
			var sFilterProperty = oDataModel.getProperty("/filterProperty");
			var sFilterOperator = oDataModel.getProperty("/filterOperator");
			var sFilterValue = oDataModel.getProperty("/filterValue");
			var oApplicationFilter = sFilterProperty && sFilterOperator && sFilterValue ? new sap.ui.model.Filter(sFilterProperty, sFilterOperator, sFilterValue) : [];

			var iVisibleRowCount = oDataModel.getProperty("/visibleRowCount");
			var sVisibleRowCountMode = oDataModel.getProperty("/visibleRowCountMode");

			var oVisibleRow = {
					VisibleRowCount: iVisibleRowCount,
					VisibleRowCountMode: sVisibleRowCountMode
				};

			this.aVisibleRow.push(oVisibleRow);

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
			oTable = new sap.ui.table.Table();
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

			var that = this;
			var fnRowsUpdated = function() {
				var oDataModel = that.getView().getModel();
				oTable.detachEvent("_rowsUpdated", fnRowsUpdated);

				var iOverall =  Math.round(jQuery.sap.measure.end("createTable").duration * 1) / 1;
				var iRendering =  Math.round(jQuery.sap.measure.getMeasurement("rendering").duration * 1) / 1;
				var iBeforeRendering =  Math.round(jQuery.sap.measure.getMeasurement("onBeforeRendering").duration * 100) / 100;
				var iAfterRendering =  Math.round(jQuery.sap.measure.getMeasurement("onAfterRendering").duration * 1) / 1;

				var iTableCreate =  Math.round((iOverall - iRendering) * 1) / 1;
				var iFactor = Math.round(iAfterRendering / iRendering * 100);

				oDataModel.setProperty("/overall",iOverall);
				oDataModel.setProperty("/onBeforeRendering",iBeforeRendering);
				oDataModel.setProperty("/rendering",iRendering);
				oDataModel.setProperty("/onAfterRendering",iAfterRendering);
				oDataModel.setProperty("/tableCreate",iTableCreate);
				oDataModel.setProperty("/factor", iFactor);

				var oRenderResult = {
					overall: iOverall,
					onBeforeRendering: iBeforeRendering,
					rendering: iRendering,
					onAfterRendering: iAfterRendering,
					tableCreate: iTableCreate,
					factor: iFactor
				};

				that.aRenderResults.push(oRenderResult);
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

			oTable.bindRows({
				path: "/" + sCollection,
				filters: oApplicationFilter,
				parameters: {
					threshold: sBindingThreshold,
					countMode: sCountMode,
					operationMode: sOperationMode
				}
			});

			window.oTable = oTable;

			var aJSMeasure = jQuery.sap.measure.filterMeasurements(function(oMeasurement) {
				return oMeasurement.categories.indexOf("JS") > -1? oMeasurement : null;
			});

			var aRenderMeasure = jQuery.sap.measure.filterMeasurements(function(oMeasurement) {
				return oMeasurement.categories.indexOf("Render") > -1? oMeasurement : null;
			});

			function getValue(attributeName, oObject) {
				if (oObject) {
					return oObject[attributeName];
				} else {
					return "";
				}
			}

			//set test result
			var iCreateRows = Math.round(getValue("duration", aJSMeasure[0])* 1) / 1;
			var iUpdateTableContent = Math.round(getValue("duration", aJSMeasure[1]) * 1) / 1;
			var iUpdateRowHeader = Math.round(getValue("duration", aJSMeasure[2]) * 1) / 1;
			var iSyncColumnHeaders = Math.round(getValue("duration", aJSMeasure[3]) * 1) / 1;

			oDataModel.setProperty("/createRows",iCreateRows);
			oDataModel.setProperty("/updateTableContent", iUpdateTableContent);
			oDataModel.setProperty("/updateRowHeader", iUpdateRowHeader);
			oDataModel.setProperty("/syncColumnHeaders", iSyncColumnHeaders);

			var oFunctionResult = {
				createRows: iCreateRows,
				updateTableContent: iUpdateTableContent,
				updateRowHeader: iUpdateRowHeader,
				syncColumnHeaders: iSyncColumnHeaders
			};

			this.aFunctionResults.push(oFunctionResult);
		},

		onDownload: function() {

			var overallAve = 0,
			onBeforeRenderingAve = 0,
			renderingAve = 0,
			onAfterRenderingAve = 0,
			tableCreateAve = 0,
			factorAve = 0,
			createRowsAve = 0,
			updateTableContentAve = 0,
			updateRowHeaderAve = 0,
			syncColumnHeadersAve = 0,
			overallSum = 0,
			onBeforeRenderingSum = 0,
			renderingSum = 0,
			onAfterRenderingSum = 0,
			tableCreateSum = 0,
			factorSum = 0,
			createRowsSum = 0,
			updateTableContentSum = 0,
			updateRowHeaderSum = 0,
			syncColumnHeadersSum = 0,
			iRun = this.aRenderResults.length;

			var sCSV = "Run;VisibleRowCount;VisibleRowCountMode;Overall;Before Rendering;Rendering;After Rendering;Table Create;Factor of After Rendering in Rendering;Table._createRows;Table._updateTableContent;Table._syncColumnHeaders;Table._updateRowHeader\n";

			for (var i = 0; i < iRun; i++) {
				sCSV += (i+1) + ";"
						+ this.aVisibleRow[i].VisibleRowCount +";"
						+ this.aVisibleRow[i].VisibleRowCountMode +";"
						+ this.aRenderResults[i].overall + ";"
						+ this.aRenderResults[i].onBeforeRendering + ";"
						+ this.aRenderResults[i].rendering + ";"
						+ this.aRenderResults[i].onAfterRendering + ";"
						+ this.aRenderResults[i].tableCreate + ";"
						+ this.aRenderResults[i].factor + ";"
						+ this.aFunctionResults[i].createRows + ";"
						+ this.aFunctionResults[i].updateTableContent + ";"
						+ this.aFunctionResults[i].updateRowHeader + ";"
						+ this.aFunctionResults[i].syncColumnHeaders + "\n";

				overallSum += this.aRenderResults[i].overall;
				onBeforeRenderingSum += this.aRenderResults[i].onBeforeRendering;
				renderingSum += this.aRenderResults[i].rendering;
				onAfterRenderingSum += this.aRenderResults[i].onAfterRendering;
				tableCreateSum += this.aRenderResults[i].tableCreate;
				factorSum += this.aRenderResults[i].factor;
				createRowsSum += this.aFunctionResults[i].createRows;
				updateTableContentSum += this.aFunctionResults[i].updateTableContent;
				updateRowHeaderSum += this.aFunctionResults[i].updateRowHeader;
				syncColumnHeadersSum += this.aFunctionResults[i].syncColumnHeaders;
			}

			overallAve += Math.round(overallSum / iRun * 1) / 1;
			onBeforeRenderingAve += Math.round(onBeforeRenderingSum / iRun * 100) / 100;
			renderingAve += Math.round(renderingSum / iRun * 1) / 1;
			onAfterRenderingAve += Math.round(onAfterRenderingSum / iRun * 1) / 1;
			tableCreateAve += Math.round(tableCreateSum / iRun * 1) / 1;
			factorAve += Math.round(factorSum / iRun * 1) / 1;
			createRowsAve += Math.round(createRowsSum / iRun * 1) / 1;
			updateTableContentAve += Math.round(updateTableContentSum / iRun * 1) / 1;
			updateRowHeaderAve += Math.round(updateRowHeaderSum / iRun * 1) / 1;
			syncColumnHeadersAve += Math.round(syncColumnHeadersSum / iRun * 1) / 1;

			sCSV += "average (ms)" + ";" +
					"-" + ";" +
					"-" + ";" +
					overallAve + ";" +
					onBeforeRenderingAve + ";" +
					renderingAve + ";" +
					onAfterRenderingAve + ";" +
					tableCreateAve + ";" +
					factorAve + ";" +
					createRowsAve + ";" +
					updateTableContentAve + ";" +
					updateRowHeaderAve + ";" +
					syncColumnHeadersAve + "\n";

			var sFileName = "TableODataPerformanceTestResults.csv";
			var oBlob = new Blob([sCSV], { type: 'application/csv;charset=utf-8' });

			if (navigator.appVersion.toString().indexOf('.NET') > 0)
				window.navigator.msSaveBlob(oBlob, sFileName);
			else
			{
				var oLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
				oLink.href = URL.createObjectURL(oBlob);
				oLink.download = sFileName;
				oLink.click();
			}
		}
	});
});