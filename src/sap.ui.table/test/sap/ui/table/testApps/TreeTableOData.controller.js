sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/Button",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem"
], function (Controller, MessageToast, JSONModel, Dialog, Text, TextArea, Button, MessagePopover, MessagePopoverItem) {
	"use strict";

	var oTable;

	var oMessageTemplate = new MessagePopoverItem({
		type: '{type}',
		title: '{message}',
		description: '{code}',
		subtitle: '{subtitle}',
		counter: '{counter}'
	});

	var oMessagePopover = new MessagePopover({
		items: {
			path: '/',
			template: oMessageTemplate
		}
	});

	return Controller.extend("sap.ui.table.testApps.TreeTableOData", {

		onInit: function () {
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			var oMessageModel = this._oMessageManager.getMessageModel();

			oMessagePopover.setModel(oMessageModel);

			var oFormData = {
				serviceURL: "odataFake",
				collection: "/orgHierarchy",
				entityType: "orgHierarchyType",
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
				useLocalMetadata: true,
				restoreTreeStateAfterChange: true,
				hierarchyLevelFor: "LEVEL",
				hierarchyParentNodeFor: "PARENT_NODE",
				hierarchyNodeFor: "HIERARCHY_NODE",
				hierarchyDrillStateFor: "DRILLDOWN_STATE",
				hierarchyDescendantCountFor: "",
				hierarchyExternalKeyFor: "",
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
		},

		/**
		 * Rebinds/Creates the TreeTable
		 */
		onCreateTableClick: function (oEvent, oTreeState) {
			var oView = this.getView(),
			oViewModel = oView.getModel();

			var sServiceUrl = oViewModel.getProperty("/serviceURL");
			sServiceUrl = "../../../../../proxy/" + sServiceUrl.replace("://", "/");

			// auto expand mock service
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

			// sequential expand mock service
			if (sServiceUrl.indexOf("classicFake") >= 0) {
				jQuery.sap.require("sap.ui.core.util.MockServer");
				sServiceUrl = "/classicFake/";
				if (!this.oMockServer) {
					//Mock server for use with navigation properties
					this.oMockServer = new sap.ui.core.util.MockServer({
						rootUri: sServiceUrl
					});
					this.oMockServer.simulate("../../core/qunit/model/metadata_odtbmd.xml", "../../core/qunit/model/odtbmd/");

					/**
					 * Clean-Up Hierarchy Annotation Mockdata/Metadata
					 * This is necessary because, the V1 ODataTreeBinding implements routines not conform to the Hierarchy Annotation Spec.
					 */
					var aAnnotationsMockdata = this.oMockServer._oMockdata.GLAccountHierarchyInChartOfAccountsLiSet;
					for (var i = 0; i < aAnnotationsMockdata.length; i++) {
						//convert string based level properties (NUMC fields) to real numbers
						aAnnotationsMockdata[i].FinStatementHierarchyLevelVal = parseInt(aAnnotationsMockdata[i].FinStatementHierarchyLevelVal, 10);
					}

					this.oMockServer.start();
				}
			}

			var sCollection = oViewModel.getProperty("/collection");
			var sEntityType = oViewModel.getProperty("/entityType");
			var sSelectProperties = oViewModel.getProperty("/selectProperties");
			var sCountMode = oViewModel.getProperty("/countMode");
			var sOperationMode = oViewModel.getProperty("/operationMode");

			// threshold for OperationMode.Auto
			var iBindingThreshold = parseInt(oView.byId("bindingThreshold").getValue(), 10);

			// table threshold
			var iTableThreshold = parseInt(oView.byId("tableThreshold").getValue(), 10);

			// the root level of the tree
			var iRootLevel = parseInt(oViewModel.getProperty("/rootLevel"), 10);

			// initial # of expanded levels
			var iInitialLevel = parseInt(oViewModel.getProperty("/initialLevel"), 10);

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

			var bRestoreTreeStateAfterChange = oView.byId("restoreTreeStateAfterChange").getSelected();

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
				this._oMessageManager.unregisterMessageProcessor(this.oODataModel);
			}
			this.oODataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				json: true,
				defaultUpdateMethod: "PUT",
				disableHeadRequestForToken: true,
				tokenHandling: true
			});

			this.oODataModel.attachMessageChange(function(oEvent) {
				var counter = oEvent.getParameter("newMessages").length;
				if (counter > 0) {
					this.byId("btn_messagePopover").setText(counter);
				}
			}.bind(this));

			this._oMessageManager.registerMessageProcessor(this.oODataModel);

			this.oODataModel.setDefaultCountMode("Inline");

			this.ensureCorrectChangeGroup(sEntityType);

			oTable.setModel(this.oODataModel, "odata");
			oTable.bindRows({
				path: "odata>" + sCollection,
				filters: oApplicationFilter,
				parameters: {
					select: sSelectProperties || "",
					threshold: iBindingThreshold,
					countMode: sCountMode,
					operationMode: sOperationMode,
					numberOfExpandedLevels: iInitialLevel == "" ?  0 : iInitialLevel,
					treeState: oTreeState,
					//navigation: {orgHierarchyRoot: "toChildren", orgHierarchy: "toChildren"}
					treeAnnotationProperties: bUseLocalMetadata ? {
						hierarchyLevelFor: sHierarchyLevelFor,
						hierarchyParentNodeFor: sHierarchyParentNodeFor,
						hierarchyNodeFor: sHierarchyNodeFor,
						hierarchyDrillStateFor: sHierarchyDrillStateFor,
						hierarchyNodeDescendantCountFor: sHierarchyDescendantCountFor
					} : undefined,
					restoreTreeStateAfterChange: bRestoreTreeStateAfterChange
				}
			});

			oTable.setSelectionMode("MultiToggle");
			oTable._setLargeDataScrolling(true);

			this.setupCutAndPaste();

			//for easier table dbg
			window.oTable = oTable;
		},

		ensureCorrectChangeGroup: function (sEntityType) {
			this._sTreeChangeGroup = this._sTreeChangeGroup || ("sapTreeHM-" + jQuery.sap.uid());

			// make sure we have a change group
			var mChangeGroups = this.oODataModel.getChangeGroups();
			var oEntityType = {name: sEntityType || "orgHierarchyType"};

			// if there is no change group for the entity type yet, create one
			if (!mChangeGroups[oEntityType.name]) {
				mChangeGroups[oEntityType.name] = {
					groupId: this._sTreeChangeGroup,
					single: false
				};
				this.oODataModel.setChangeGroups(mChangeGroups);

				// important: the group has to be deferred so
				this.oODataModel.setDeferredGroups([this._sTreeChangeGroup]);
			}
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

			var that = this;
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
			var oViewModel = this.getView().getModel();
			var aJSMeasure = jQuery.sap.measure.filterMeasurements(function(oMeasurement) {
				return oMeasurement.categories.indexOf("JS") > -1 ? oMeasurement : null;
			});

			function getValue(attributeName, oObject) {
				if (oObject) {
					return oObject[attributeName];
				} else {
					return "";
				}
			}
			//set test result
			var iCreateRows = Math.round(getValue("duration", aJSMeasure[0]) * 1) / 1;
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
			var oTable = this.byId("tableOData");
			var iSelectedIndex = oTable.getSelectedIndex();
			var oViewModel = this.getView().getModel();

			if (iSelectedIndex == -1) {
				MessageToast.show("Select a parent node first.");
				return;
			}

			var oDialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
					new Text({ text: 'Please enter the key of a business entity (the value for the hierarchy-node-external-key-for annotated property value):' }),
					new TextArea('businessEntityValueTextArea', {
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter('value');
							var oParent = oEvent.getSource().getParent();
							oParent.getBeginButton().setEnabled(sText.length > 0);
						},
						width: '100%',
						placeholder: 'mandatory value'
					})
				],

				beginButton: new Button({
					text: 'OK',
					enabled: false,
					press: function () {
						var sBusinessEntityKey = sap.ui.getCore().byId('businessEntityValueTextArea').getValue();

						// create entry
						var oBinding = oTable.getBinding();
						var oTableModel = oTable.getModel("odata");
						var oContext = oBinding.createEntry();
						var sHierarchyExternalKeyFor = oViewModel.getProperty("/hierarchyExternalKeyFor");

						if (sHierarchyExternalKeyFor) {
							// IMPORTANT: This is hard-coded for demo-purposes.
							// In a real scenario, the application has to provide the Business Entity Key (e.g. via Value Help) and set it to the correct property.
							// There is no metadata check implemented in the TreeBinding for this purpose.
							oTableModel.setProperty(sHierarchyExternalKeyFor, sBusinessEntityKey, oContext);
						}

						// add new entry to the binding
						oBinding.addContexts(oTable.getContextByIndex(iSelectedIndex), [oContext]);

						MessageToast.show("Node created. Beware: The node is currently only in a transient in the UI.");

						oDialog.close();
					}
				}),

				endButton: new Button({
					text: 'Cancel',
					press: function () {
						oDialog.close();
					}
				}),

				afterClose: function() {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},

		/**
		 * Cut out logic
		 */
		onCut: function () {
			var iSelectedIndex = oTable.getSelectedIndex();
			var oBinding = oTable.getBinding();
			var oModel = oBinding.getModel();

			// keep track of the removed handle
			var oTreeHandle = oBinding.removeContext(oTable.getContextByIndex(iSelectedIndex));
			this._oLastTreeHandle = oTreeHandle;

			// only for demo: get the odata-key
			var sKey = oModel.getKey(oTreeHandle);
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
			var oTable = this.byId("tableOData");
			var iSelectedIndex = oTable.getSelectedIndex();
			if (this._oClipboardModel && iSelectedIndex != -1) {
				this.openClipboard();
			} else {
				MessageToast.show("Select a new parent node first.");
			}
		},

		/**
		 * Shows an error dialog with the given error message.
		 */
		showErrorDialogue: function (sErrorCode, sErrorText) {
			var oDialog = new Dialog({
				title: 'Request Failed with Error: ' + sErrorCode,
				contentWidth: "600px",
				contentHeight: "300px",
				content: [
					new sap.ui.core.HTML({
						content: "<span style='padding: 5px'>" + jQuery.sap.escapeHTML(sErrorText) + "</span><br/><span><i>Please see the debug-console ('Network' tab), for the actual back-end response.</i></span>"
					})
				],
				beginButton: new Button({
					text: 'OK',
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function() {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},

		/**
		 * Submit the changes on the model
		 */
		onSave: function () {
			MessageToast.show("Submitting changes...");
			var oBinding = oTable.getBinding();

			oTable.setBusyIndicatorDelay(1);
			oTable.setEnableBusyIndicator(true);
			oTable.setBusy(true);

			// send collected change data to the back-end
			oBinding.submitChanges({
				success: function (oData) {
					// remove busy state of table
					oTable.setBusy(false);
					// re-setup and clear the clipboard
					this.setupCutAndPaste();

				}.bind(this),
				error: function (oEvent) {
					oTable.setBusy(false);
				}
			});
			// scroll to top after submitting
			oTable.setFirstVisibleRow(0);
		},

		/**
		 * Submit the changes on the model
		 */
		onRefreshAndRestore: function () {
			MessageToast.show("Refreshing and restoring...");
			var oBinding = oTable.getBinding();

			oTable.setBusyIndicatorDelay(1);
			oTable.setEnableBusyIndicator(true);
			oTable.setBusy(true);

			// send collected change data to the back-end
			oBinding._restoreTreeState().then(
				function () {
					// remove busy state of table
					oTable.setBusy(false);
				},
				function (oEvent) {
					oTable.setBusy(false);
				});
		},

		/**
		 * Opens the Clipboard for cut out contexts
		 */
		openClipboard: function () {
			if (!this._oPasteDialog) {
				this._oPasteDialog = sap.ui.xmlfragment("sap.ui.table.testApps.TreeTableODataClipboard", this);
			}

			this._oPasteDialog.setModel(this._oClipboardModel);

			this._oPasteDialog.setMultiSelect(false);

			this._oPasteDialog.setRememberSelections(false);

			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oPasteDialog);

			this._oPasteDialog.open();
		},

		/**
		 * Paste Action after closing the clipboard
		 */
		closeClipboard: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts.length >= 0) {
				var oCtx = aContexts[0];
				var sKey = oCtx.getProperty("key");
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

				MessageToast.show("Node '" + sKey + "' was re-inserted.");
			}
		},

		/**
		 * Handler for saving the tree state.
		 */
		onSaveTreeState: function () {
			var b = oTable.getBinding();
			this._oTreeState = b.getCurrentTreeState();
		},

		/**
		 * Rebinds the table with the previously saved state.
		 */
		onRestoreTreeState: function () {
			this.onCreateTableClick(undefined, this._oTreeState);
		},

		onDragStart: function(oEvent) {
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedRow = oEvent.getParameter("target");
			var iDraggedRowIndex = oDraggedRow.getIndex();
			var aSelectedIndices = oTable.getSelectedIndices();
			var aDraggedRowContexts = [];

			if (aSelectedIndices.length > 0) {
				// If rows are selected, do not allow to start dragging from a row which is not selected.
				if (aSelectedIndices.indexOf(iDraggedRowIndex) === -1) {
					oEvent.preventDefault();
				} else {
					aSelectedIndices.forEach(function(iSelectedIndex) {
						aDraggedRowContexts.push(oTable.getContextByIndex(iSelectedIndex));
					});
				}
			} else {
				aDraggedRowContexts.push(oTable.getContextByIndex(iDraggedRowIndex));
			}

			oDragSession.setComplexData("hierarchymaintenance", {
				draggedRowContexts: aDraggedRowContexts
			});
		},

		onDrop: function(oEvent) {
			var oDragSession = oEvent.getParameter("dragSession");
			var oDroppedRow = oEvent.getParameter("droppedControl");
			var aDraggedRowContexts = oDragSession.getComplexData("hierarchymaintenance").draggedRowContexts;

			if (aDraggedRowContexts.length > 0) {
				var oBinding = oTable.getBinding("rows");
				var oNewParentContext = oTable.getContextByIndex(oDroppedRow.getIndex());

				if (oNewParentContext != null) {
					for (var i = 0; i < aDraggedRowContexts.length; i++) {
						oBinding.removeContext(aDraggedRowContexts[i]);
					}
					oBinding.addContexts(oNewParentContext, aDraggedRowContexts);
				}
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
				sCSV += (i + 1) + ";"
						+ this.aVisibleRow[i].VisibleRowCount + ";"
						+ this.aVisibleRow[i].VisibleRowCountMode + ";"
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

			if (navigator.appVersion.toString().indexOf('.NET') > 0) {
				window.navigator.msSaveBlob(oBlob, sFileName);
			} else {
				var oLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
				oLink.href = URL.createObjectURL(oBlob);
				oLink.download = sFileName;
				oLink.click();
			}
		},

		handleMessagePopoverPress: function(oEvent) {
			oEvent.getSource().setText("");
			oMessagePopover.toggle(oEvent.getSource());
		}
	});
});
