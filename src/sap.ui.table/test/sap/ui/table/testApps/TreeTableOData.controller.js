sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.table.testApps.TreeTableOData", {

		onInit: function () {
			var oFormData = {
				serviceURL: "odataFake",
				collection: "orgHierarchy",
				selectProperties: "HIERARCHY_NODE,DESCRIPTION,LEVEL,DRILLDOWN_STATE,MAGNITUDE",
				initialLevel: 2,
				countMode: "Inline",
				operationMode: "Server",
				tableThreshold: 100,
				bindingThreshold: 10,
				rootLevel: 0,
				filterProperty: "DESCRIPTION",
				filterOperator: "Contains",
				filterValue: "",
				useLocalMetadata: false,
				hierarchyLevelFor: "LEVEL",
				hierarchyParentNodeFor: "PARENT_NODE",
				hierarchyNodeFor: "HIERARCHY_NODE",
				hierarchyDrillStateFor: "DRILLDOWN_STATE",
				hierarchyDescendantCountFor: "MAGNITUDE",
				visibleRowCount: 20,
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

			this.nIdForNewNode = 3000;
		},

		/**
		 * Rebinds/Creates the TreeTable
		 */
		onCreateTableClick: function () {
			var oView = this.getView(),
			oViewModel = oView.getModel();

			var sServiceUrl = oViewModel.getProperty("/serviceURL");
			sServiceUrl = "../../../../../proxy/" + sServiceUrl.replace("://", "/");

			if (sServiceUrl.indexOf("odataFake") >= 0) {
				jQuery.sap.require("sap.ui.core.util.MockServer");
				sServiceUrl = "/odataFake/";
				if (!this.oMockServer) {
					//Mock server for use with navigation properties
					this.oMockServer = new sap.ui.core.util.MockServer({
						rootUri: sServiceUrl
					});
					this.oMockServer.simulate("../../core/qunit/model/metadata_orgHierarchy.xml", "../../core/qunit/model/orgHierarchy/");
					this.oMockServer.start();
				}
			}

			var sCollection = oViewModel.getProperty("/collection");
			var sSelectProperties = oViewModel.getProperty("/selectProperties");
			var sCountMode = oViewModel.getProperty("/countMode");
			var sOperationMode = oViewModel.getProperty("/operationMode");

			// threshold for OperationMode.Auto
			var sBindingThreshold = oViewModel.getProperty("/bindingThreshold");
			var iBindingThreshold = parseInt(oView.byId("bindingThreshold").getValue(), 10);

			// table threshold
			var iTableThreshold = parseInt(oView.byId("tableThreshold").getValue(), 10);

			// the root level of the tree
			var iRootLevel = parseInt(oView.byId("rootLevel").getValue(), 10);

			// initial # of expanded levels
			var iInitialLevel = parseInt(oView.byId("initialLevel").getValue(), 10);

			// application filter values
			var sFilterProperty = oViewModel.getProperty("/filterProperty");
			var sFilterOperator = oViewModel.getProperty("/filterOperator");
			var sFilterValue = oViewModel.getProperty("/filterValue");
			var oApplicationFilter = sFilterProperty && sFilterOperator && sFilterValue ? new sap.ui.model.Filter(sFilterProperty, sFilterOperator, sFilterValue) : [];

			// hierarchy properties
			var bUseLocalMetadata = oView.byId("useLocalMetadata").getSelected();
			var sHierarchyLevelFor = oView.byId("hierarchyLevelFor").getValue();
			var sHierarchyParentNodeFor = oView.byId("hierarchyParentNodeFor").getValue();
			var sHierarchyNodeFor = oView.byId("hierarchyNodeFor").getValue();
			var sHierarchyDrillStateFor = oView.byId("hierarchyDrillStateFor").getValue();
			var sHierarchyDescendantCountFor = oView.byId("hierarchyDescendantCountFor").getValue();

			// table propertis
			var iVisibleRowCount = oViewModel.getProperty("/visibleRowCount");
			var sVisibleRowCountMode = oViewModel.getProperty("/visibleRowCountMode");

			var oVisibleRow = {
					VisibleRowCount: iVisibleRowCount,
					VisibleRowCountMode: sVisibleRowCountMode
				};

			this.aVisibleRow.push(oVisibleRow);

			/**
			 * Clear the Table and rebind it
			 */
			var oTableContainer = oView.byId("tableContainerPanel");

			window.oTable = oTableContainer.getContent()[0];

			//clean up
			if (oTable) {
				oTable.unbindRows();
				oTable.destroyColumns();
			}

			jQuery.sap.measure.start("createTable");

			oTable = oView.byId("tableOData") || new sap.ui.table.TreeTable({
				rootLevel: iRootLevel,
				threshold: iTableThreshold,
				visibleRowCount: iVisibleRowCount
			});

			this.attachPerformanceTools(oTable);

			// recreate the columns
			var aProperties = sSelectProperties.split(",");
			jQuery.each(aProperties, function(iIndex, sProperty) {
				oTable.addColumn(new sap.ui.table.Column({
					label: sProperty,
					template: "odata>" + sProperty,
					sortProperty: sProperty,
					filterProperty: sProperty
				}));
			});

			// clean up model & create new one
			if (this.oODataModel) {
				this.oODataModel.destroy();
			}
			this.oODataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			this.oODataModel.setUseBatch(false);
			this.oODataModel.setDefaultCountMode("Inline");

			oTable.setModel(this.oODataModel, "odata");
			oTable.bindRows({
				path: "odata>/" + sCollection,
				filters: oApplicationFilter,
				parameters: {
					threshold: iBindingThreshold,
					countMode: sCountMode,
					operationMode: sOperationMode,
					numberOfExpandedLevels: iInitialLevel == "" ?  0 : iInitialLevel,
					//navigation: {orgHierarchyRoot: "toChildren", orgHierarchy: "toChildren"}
					treeAnnotationProperties: bUseLocalMetadata ? {
						hierarchyLevelFor: sHierarchyLevelFor,
						hierarchyParentNodeFor: sHierarchyParentNodeFor,
						hierarchyNodeFor: sHierarchyNodeFor,
						hierarchyDrillStateFor: sHierarchyDrillStateFor,
						hierarchyNodeDescendantCountFor: sHierarchyDescendantCountFor
					} : undefined
				}
			});

			oTable._setLargeDataScrolling(true);

			this.setupCutAndPaste();

			//for easier table dbg
			window.oTable = oTable;
		},

		/**
		 * Performance Tools
		 */
		attachPerformanceTools: function (oTable) {
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

			var that =this;
			var fnRowsUpdated = function() {
				var oViewModel = that.getView().getModel();
				oTable.detachEvent("_rowsUpdated", fnRowsUpdated);

				var iOverall = Math.round(jQuery.sap.measure.end("createTable").duration * 1) / 1;
				var iRendering = Math.round(jQuery.sap.measure.getMeasurement("rendering").duration * 1) / 1;
				var iBeforeRendering = Math.round(jQuery.sap.measure.getMeasurement("onBeforeRendering").duration * 100) / 100;
				var iAfterRendering = Math.round(jQuery.sap.measure.getMeasurement("onAfterRendering").duration * 1) / 1;

				var iTableCreate = Math.round((iOverall - iRendering) * 1) / 1;
				var iFactor = Math.round(iAfterRendering / iRendering * 100);

				oViewModel.setProperty("/overall",iOverall);
				oViewModel.setProperty("/onBeforeRendering",iBeforeRendering);
				oViewModel.setProperty("/rendering",iRendering);
				oViewModel.setProperty("/onAfterRendering",iAfterRendering);
				oViewModel.setProperty("/tableCreate",iTableCreate);
				oViewModel.setProperty("/factor",iFactor);

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
		},

		/**
		 * jQuery Measure Tools
		 */
		attachMeasurementTools: function () {
			var oViewModel = that.getView().getModel();
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

			oViewModel.setProperty("/createRows",iCreateRows);
			oViewModel.setProperty("/updateTableContent", iUpdateTableContent);
			oViewModel.setProperty("/updateRowHeader", iUpdateRowHeader);
			oViewModel.setProperty("/syncColumnHeaders", iSyncColumnHeaders);

			var oFunctionResult = {
				createRows: iCreateRows,
				updateTableContent: iUpdateTableContent,
				updateRowHeader: iUpdateRowHeader,
				syncColumnHeaders: iSyncColumnHeaders
			};

			this.aFunctionResults.push(oFunctionResult);
		},

		/**
		 * Set up the Cut and Paste Model
		 */
		setupCutAndPaste: function () {
			if (this._oClipboardModel) {
				this._oClipboardModel.destroy();
			}
			this._oClipboardModel = new JSONModel();
			this._oClipboardModelData = {
				nodes: []
			};
			this._oClipboardModel.setData(this._oClipboardModelData);
		},

		/**
		 * Create new node
		 */
		onCreate: function() {
			var oTable = this.getView().byId("tableOData");
			var iSelectedIndex = oTable.getSelectedIndex();
			var oModel = this.getView().getModel();

			if (iSelectedIndex !== -1) {
				var oBinding = oTable.getBinding();
				var oTableModel = oTable.getModel("odata");
				var oContext = oTableModel.createEntry(oModel.getProperty("/collection"));
				oTableModel.setProperty("DESCRIPTION", "New Node - " + this.nIdForNewNode, oContext);
				oTableModel.setProperty("DRILLDOWN_STATE", "leaf", oContext);
				oTableModel.setProperty("HIERARCHY_NODE", "" + this.nIdForNewNode, oContext);
				oTableModel.setProperty("MAGNITUDE", 0, oContext);
				this.nIdForNewNode++;

				oBinding.addContexts(oTable.getContextByIndex(iSelectedIndex), [oContext]);
			} else {
				MessageToast.show("Select a parent node first.");
			}
		},

		/**
		 * Cut out logic
		 */
		onCut: function () {
			var iSelectedIndex = oTable.getSelectedIndex();
			var oBinding = oTable.getBinding();

			// keep track of the removed handle
			var oTreeHandle = oBinding.removeContext(oTable.getContextByIndex(iSelectedIndex));
			this._oLastTreeHandle = oTreeHandle;

			// only for demo: get the odata-key
			var sKey = oTreeHandle._oSubtreeRoot.key;
			this._mTreeHandles = this._mTreeHandles || {};
			this._mTreeHandles[sKey] = oTreeHandle;

			this._oClipboardModelData.nodes.push({
				key: sKey
			});

			this._oClipboardModel.setData(this._oClipboardModelData);
		},

		/**
		 * Paste logic
		 */
		onPaste: function () {
			var oTable = this.getView().byId("tableOData")
			var iSelectedIndex = oTable.getSelectedIndex();
			if (this._oClipboardModel && iSelectedIndex != -1) {
				this.openClipboard();
			} else {
				MessageToast.show("Select a new parent node first.\nOh and maybe cut out some nodes first ;)");
			}
		},

		/**
		 * Opens the Clipboard for cut out contexts
		 */
		openClipboard: function () {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.ui.table.testApps.TreeTableODataClipboard", this);
			}

			this._oDialog.setModel(this._oClipboardModel);

			this._oDialog.setMultiSelect(false);

			this._oDialog.setRememberSelections(false);

			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);

			this._oDialog.open();
		},

		/**
		 * Paste Action after closing the clipboard
		 */
		closeClipboard: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts.length >= 0) {
				var oCtx = aContexts[0];
				var oData = oCtx.getProperty();
				var sKey = oData.key;
				var oTreeHandle = this._mTreeHandles[sKey];

				// insert in currently selected index
				var iSelectedIndex = oTable.getSelectedIndex();
				if (iSelectedIndex != -1 && oTreeHandle) {
					var oBinding = oTable.getBinding();
					var oNewParentContext = oTable.getContextByIndex(iSelectedIndex);
					if (oNewParentContext) {
						oBinding.addContexts(oNewParentContext, oTreeHandle);
					}

					// remove the re-inserted node from the clipboard
					this._oClipboardModelData.nodes = this._oClipboardModelData.nodes.filter(function(o) {
						return o.key != sKey;
					});
					this._oClipboardModel.setData(this._oClipboardModelData);
				}

				MessageToast.show("Node '" + oData.key + "' was re-inserted.");
			}
		},

		/**
		 * Performance Measure download
		 */
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

			var sFileName = "TreeTableODataPerformanceTestResults.csv";
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
