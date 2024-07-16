sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/TextArea",
	"sap/m/Button",
	"sap/m/MessagePopover",
	"sap/m/MessageItem",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/Filter",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/HTML",
	"sap/ui/performance/Measurement",
	"sap/base/util/uid",
	"sap/base/security/encodeXML",
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/Fragment"
], function(Element, Messaging, Controller, MessageToast, JSONModel, Dialog, Text, Label, TextArea, Button, MessagePopover, MessageItem, MockServer, Filter, TreeTable, Column, ODataModel, HTML, Measurement, uid, encodeXML, syncStyleClass, Fragment) {
	"use strict";

	let oTable;

	const oMessageTemplate = new MessageItem({
		type: '{type}',
		title: '{message}',
		description: '{code}',
		subtitle: '{subtitle}',
		counter: '{counter}'
	});

	const oMessagePopover = new MessagePopover({
		items: {
			path: '/',
			template: oMessageTemplate
		}
	});

	return Controller.extend("sap.ui.table.mvc.TreeTableODataV2", {

		onInit: function() {
			this._oMessageManager = Messaging;
			const oMessageModel = this._oMessageManager.getMessageModel();

			oMessagePopover.setModel(oMessageModel);

			const oFormData = {
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
			const oModel = new JSONModel(oFormData);
			this.getView().setModel(oModel);

			this.aRenderResults = [];
			this.aFunctionResults = [];
		},

		/**
		 * Rebinds/Creates the TreeTable
		 */
		onCreateTableClick: function(oEvent, oTreeState) {
			const oView = this.getView();
			const oViewModel = oView.getModel();

			let sServiceUrl = oViewModel.getProperty("/serviceURL");
			sServiceUrl = "../../../../../proxy/" + sServiceUrl.replace("://", "/");

			// auto expand mock service
			if (sServiceUrl.indexOf("odataFake") >= 0) {
				sServiceUrl = "/odataFake/";
				if (!this.oMockServer) {
					//Mock server for use with navigation properties
					this.oMockServer = new MockServer({
						rootUri: sServiceUrl
					});
					this.oMockServer.simulate("../core/qunit/model/metadata_orgHierarchy.xml", "../core/qunit/model/orgHierarchy/");
					this.oMockServer.start();
				}
			}

			// sequential expand mock service
			if (sServiceUrl.indexOf("classicFake") >= 0) {
				sServiceUrl = "/classicFake/";
				if (!this.oMockServer) {
					//Mock server for use with navigation properties
					this.oMockServer = new MockServer({
						rootUri: sServiceUrl
					});
					this.oMockServer.simulate("../core/qunit/model/metadata_odtbmd.xml", "../core/qunit/model/odtbmd/");

					/**
					 * Clean-Up Hierarchy Annotation Mockdata/Metadata
					 * This is necessary because, the V1 ODataTreeBinding implements routines not conform to the Hierarchy Annotation Spec.
					 */
					const aAnnotationsMockdata = this.oMockServer._oMockdata.GLAccountHierarchyInChartOfAccountsLiSet;
					for (let i = 0; i < aAnnotationsMockdata.length; i++) {
						//convert string based level properties (NUMC fields) to real numbers
						aAnnotationsMockdata[i].FinStatementHierarchyLevelVal = parseInt(aAnnotationsMockdata[i].FinStatementHierarchyLevelVal);
					}

					this.oMockServer.start();
				}
			}

			const sCollection = oViewModel.getProperty("/collection");
			const sEntityType = oViewModel.getProperty("/entityType");
			const sSelectProperties = oViewModel.getProperty("/selectProperties");
			const sCountMode = oViewModel.getProperty("/countMode");
			const sOperationMode = oViewModel.getProperty("/operationMode");

			// threshold for OperationMode.Auto
			const iBindingThreshold = parseInt(oView.byId("bindingThreshold").getValue());

			// table threshold
			const iTableThreshold = parseInt(oView.byId("tableThreshold").getValue());

			// the root level of the tree
			const iRootLevel = parseInt(oViewModel.getProperty("/rootLevel"));

			// initial # of expanded levels
			const iInitialLevel = parseInt(oViewModel.getProperty("/initialLevel"));

			// application filter values
			const sFilterProperty = oViewModel.getProperty("/filterProperty");
			const sFilterOperator = oViewModel.getProperty("/filterOperator");
			const sFilterValue = oViewModel.getProperty("/filterValue");
			const oApplicationFilter = sFilterProperty && sFilterOperator && sFilterValue ? new Filter(sFilterProperty, sFilterOperator, sFilterValue) : [];

			// hierarchy properties
			const bUseLocalMetadata = oView.byId("useLocalMetadata").getSelected();
			const sHierarchyLevelFor = oView.byId("hierarchyLevelFor").getValue();
			const sHierarchyParentNodeFor = oView.byId("hierarchyParentNodeFor").getValue();
			const sHierarchyNodeFor = oView.byId("hierarchyNodeFor").getValue();
			const sHierarchyDrillStateFor = oView.byId("hierarchyDrillStateFor").getValue();
			const sHierarchyDescendantCountFor = oView.byId("hierarchyDescendantCountFor").getValue();

			const bRestoreTreeStateAfterChange = oView.byId("restoreTreeStateAfterChange").getSelected();

			/**
			 * Clear the Table and rebind it
			 */
			const oTableContainer = oView.byId("tableContainerPanel");

			window.oTable = oTableContainer.getContent()[0];

			//clean up
			if (oTable) {
				oTable.unbindRows();
				oTable.destroyColumns();
			}

			Measurement.start("createTable");

			oTable = oView.byId("tableOData") || new TreeTable({
				rootLevel: iRootLevel,
				threshold: iTableThreshold
			});

			this.attachPerformanceTools(oTable);

			// recreate the columns
			const aProperties = sSelectProperties.split(",");
			aProperties.forEach(function(sProperty) {
				oTable.addColumn(new Column({
					label: new Label({text: sProperty}),
					template: new Text({text: "{odata>" + sProperty + "}", wrapping: false}),
					sortProperty: sProperty,
					filterProperty: sProperty
				}));
			});

			// clean up model & create new one
			if (this.oODataModel) {
				this.oODataModel.destroy();
				this._oMessageManager.unregisterMessageProcessor(this.oODataModel);
			}
			this.oODataModel = new ODataModel(sServiceUrl, {
				json: true,
				defaultUpdateMethod: "PUT",
				disableHeadRequestForToken: true,
				tokenHandling: true
			});

			this.oODataModel.attachMessageChange(function(oEvent) {
				const counter = oEvent.getParameter("newMessages").length;
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
					numberOfExpandedLevels: iInitialLevel === "" ? 0 : iInitialLevel,
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

		ensureCorrectChangeGroup: function(sEntityType) {
			this._sTreeChangeGroup = this._sTreeChangeGroup || ("sapTreeHM-" + uid());

			// make sure we have a change group
			const mChangeGroups = this.oODataModel.getChangeGroups();
			const oEntityType = {name: sEntityType || "orgHierarchyType"};

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
		attachPerformanceTools: function(oTable) {
			oTable.addDelegate({
				onBeforeRendering: function() {
					Measurement.start("onBeforeRendering", "", ["Render"]);
					Measurement.start("rendering", "", ["Render"]);
				},
				onAfterRendering: function() {
					Measurement.start("onAfterRendering", "", ["Render"]);
				}
			}, true);

			oTable.addDelegate({
				onBeforeRendering: function() {
					Measurement.end("onBeforeRendering");
				},
				onAfterRendering: function() {
					Measurement.end("onAfterRendering");
					Measurement.end("rendering");
				}
			}, false);

			const that = this;
			const fnRowsUpdated = function() {
				const oViewModel = that.getView().getModel();
				oTable.detachRowsUpdated(fnRowsUpdated);

				const iOverall = Math.round(Measurement.end("createTable").duration * 1) / 1;
				const iRendering = Math.round(Measurement.getMeasurement("rendering").duration * 1) / 1;
				const iBeforeRendering = Math.round(Measurement.getMeasurement("onBeforeRendering").duration * 100) / 100;
				const iAfterRendering = Math.round(Measurement.getMeasurement("onAfterRendering").duration * 1) / 1;

				const iTableCreate = Math.round((iOverall - iRendering) * 1) / 1;
				const iFactor = Math.round(iAfterRendering / iRendering * 100);

				oViewModel.setProperty("/overall", iOverall);
				oViewModel.setProperty("/onBeforeRendering", iBeforeRendering);
				oViewModel.setProperty("/rendering", iRendering);
				oViewModel.setProperty("/onAfterRendering", iAfterRendering);
				oViewModel.setProperty("/tableCreate", iTableCreate);
				oViewModel.setProperty("/factor", iFactor);

				const oRenderResult = {
						overall: iOverall,
						onBeforeRendering: iBeforeRendering,
						rendering: iRendering,
						onAfterRendering: iAfterRendering,
						tableCreate: iTableCreate,
						factor: iFactor
				};

				that.aRenderResults.push(oRenderResult);
			};

			oTable.attachRowsUpdated(fnRowsUpdated);
		},

		/**
		 * Measure Tools
		 */
		attachMeasurementTools: function() {
			const oViewModel = this.getView().getModel();
			const aJSMeasure = Measurement.filterMeasurements(function(oMeasurement) {
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
			const iCreateRows = Math.round(getValue("duration", aJSMeasure[0]) * 1) / 1;
			const iUpdateTableContent = Math.round(getValue("duration", aJSMeasure[1]) * 1) / 1;
			const iUpdateRowHeader = Math.round(getValue("duration", aJSMeasure[2]) * 1) / 1;
			const iSyncColumnHeaders = Math.round(getValue("duration", aJSMeasure[3]) * 1) / 1;

			oViewModel.setProperty("/createRows", iCreateRows);
			oViewModel.setProperty("/updateTableContent", iUpdateTableContent);
			oViewModel.setProperty("/updateRowHeader", iUpdateRowHeader);
			oViewModel.setProperty("/syncColumnHeaders", iSyncColumnHeaders);

			const oFunctionResult = {
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
		setupCutAndPaste: function() {
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
			const oTable = this.byId("tableOData");
			const iSelectedIndex = oTable.getSelectedIndex();
			const oViewModel = this.getView().getModel();

			if (iSelectedIndex === -1) {
				MessageToast.show("Select a parent node first.");
				return;
			}

			const oDialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
					new Text({text: 'Please enter the key of a business entity (the value for the hierarchy-node-external-key-for annotated property value):'}),
					new TextArea('businessEntityValueTextArea', {
						liveChange: function(oEvent) {
							const sText = oEvent.getParameter('value');
							const oParent = oEvent.getSource().getParent();
							oParent.getBeginButton().setEnabled(sText.length > 0);
						},
						width: '100%',
						placeholder: 'mandatory value'
					})
				],

				beginButton: new Button({
					text: 'OK',
					enabled: false,
					press: function() {
						const sBusinessEntityKey = Element.getElementById('businessEntityValueTextArea').getValue();

						// create entry
						const oBinding = oTable.getBinding();
						const oTableModel = oTable.getModel("odata");
						const oContext = oBinding.createEntry();
						const sHierarchyExternalKeyFor = oViewModel.getProperty("/hierarchyExternalKeyFor");

						if (sHierarchyExternalKeyFor) {
							// IMPORTANT: This is hard-coded for demo-purposes.
							// In a real scenario, the application has to provide the Business Entity Key (e.g. via Value Help) and set it to the correct property.
							// There is no metadata check implemented in the TreeBinding for this purpose.
							oTableModel.setProperty(sHierarchyExternalKeyFor, sBusinessEntityKey, oContext);
						}

						// add new entry to the binding
						oBinding.addContexts(oTable.getContextByIndex(iSelectedIndex), [oContext]);
						oViewModel.setProperty("/pendingChanges", true);

						MessageToast.show("Node created. Beware: The node is currently only in a transient in the UI.");

						oDialog.close();
					}
				}),

				endButton: new Button({
					text: 'Cancel',
					press: function() {
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
		onCut: function() {
			const iSelectedIndex = -1;
			const oBinding = oTable.getBinding();
			const oModel = oBinding.getModel();

			// keep track of the removed handle
			const oTreeHandle = oBinding.removeContext(oTable.getContextByIndex(iSelectedIndex));
			this.getView().getModel().setProperty("/pendingChanges", true);
			this._oLastTreeHandle = oTreeHandle;

			// only for demo: get the odata-key
			const sKey = oModel.getKey(oTreeHandle);
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
		onPaste: function() {
			const oTable = this.byId("tableOData");
			const iSelectedIndex = oTable.getSelectedIndex();
			if (this._oClipboardModel && iSelectedIndex !== -1) {
				this.openClipboard();
			} else {
				MessageToast.show("Select a new parent node first.");
			}
		},

		/**
		 * Shows an error dialog with the given error message.
		 */
		showErrorDialogue: function(sErrorCode, sErrorText) {
			const oDialog = new Dialog({
				title: 'Request Failed with Error: ' + sErrorCode,
				contentWidth: "600px",
				contentHeight: "300px",
				content: [
					new HTML({
						content: "<span style='padding: 5px'>" + encodeXML(sErrorText) + "</span><br/><span><i>Please see the debug-console ('Network' tab), for the actual back-end response.</i></span>"
					})
				],
				beginButton: new Button({
					text: 'OK',
					press: function() {
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
		onSave: function() {
			MessageToast.show("Submitting changes...");
			oTable.getBinding();

			oTable.setBusyIndicatorDelay(1);
			oTable.setEnableBusyIndicator(true);
			oTable.setBusy(true);

			// scroll to top after submitting
			oTable.setFirstVisibleRow(0);
		},

		/**
		 * Refresh and restore tree state even if no changes have been made
		 */
		onRefreshAndRestore: function() {
			MessageToast.show("Refreshing and restoring...");
			const oBinding = oTable.getBinding();

			oTable.setBusyIndicatorDelay(1);
			oTable.setEnableBusyIndicator(true);
			oTable.setBusy(true);

			// send collected change data to the back-end
			oBinding._restoreTreeState().then(
				function() {
					// remove busy state of table
					oTable.setBusy(false);
					// re-setup and clear the clipboard
					this.setupCutAndPaste();

					oBinding._fireChange();
					this.getView().getModel().setProperty("/pendingChanges", false);
				}.bind(this),
				function(oEvent) {
					oTable.setBusy(false);
					oBinding._fireChange();
				});
		},

		/**
		 * Expand selected node to level four
		 */
		onExpandNodeToLevel4: function() {
			const oBinding = oTable.getBinding();

			const iSelectedIndex = -1;
			MessageToast.show("Expanding node with index " + iSelectedIndex + " to level 4...");
			oBinding.expandNodeToLevel(iSelectedIndex, 4).then(function() {
				MessageToast.show("Expanded node with index " + iSelectedIndex + " to level 4.");
			}, function(err) {
				MessageToast.show("Failed to expand node with index " + iSelectedIndex + " to level 4: " + err.message);
			});
		},

		/**
		 * Opens the Clipboard for cut out contexts
		 */
		openClipboard: function() {
			if (!this._oPasteDialog) {
				this._oPasteDialog = Fragment.load({
					id: this.getView().getId(),
					name: "sap.ui.table.mvc.TreeTableODataV2Clipboard",
					controller: this
				}).then(function(oPasteDialog) {
					return oPasteDialog;
				});
			}

			this._oPasteDialog.then(function(oPasteDialog) {
				oPasteDialog.setModel(this._oClipboardModel);
				oPasteDialog.setMultiSelect(false);
				oPasteDialog.setRememberSelections(false);

				syncStyleClass("sapUiSizeCompact", this.getView(), oPasteDialog);

				oPasteDialog.open();
			}.bind(this));
		},

		/**
		 * Paste Action after closing the clipboard
		 */
		closeClipboard: function(oEvent) {
			const aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts.length >= 0) {
				const oCtx = aContexts[0];
				const sKey = oCtx.getProperty("key");
				const oTreeHandle = this._mTreeHandles[sKey];

				// insert in currently selected index
				const iSelectedIndex = -1;
				if (iSelectedIndex !== -1 && oTreeHandle) {
					const oBinding = oTable.getBinding();
					const oNewParentContext = oTable.getContextByIndex(iSelectedIndex);
					if (oNewParentContext) {
						oBinding.addContexts(oNewParentContext, oTreeHandle);
						this.getView().getModel().setProperty("/pendingChanges", true);
					}

					// remove the re-inserted node from the clipboard
					this._oClipboardModelData.nodes = this._oClipboardModelData.nodes.filter(function(o) {
						return o.key !== sKey;
					});
					this._oClipboardModel.setData(this._oClipboardModelData);
				}

				MessageToast.show("Node '" + sKey + "' was re-inserted.");
			}
		},

		/**
		 * Handler for saving the tree state.
		 */
		onSaveTreeState: function() {
			const b = oTable.getBinding();
			this._oTreeState = b.getCurrentTreeState();
		},

		/**
		 * Rebinds the table with the previously saved state.
		 */
		onRestoreTreeState: function() {
			this.onCreateTableClick(undefined, this._oTreeState);
		},

		onDragStart: function(oEvent) {
			const oDragSession = oEvent.getParameter("dragSession");
			const oDraggedRow = oEvent.getParameter("target");
			const iDraggedRowIndex = oDraggedRow.getIndex();
			const aSelectedIndices = oTable.getSelectedIndices();
			const aDraggedRowContexts = [];

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
			const oDragSession = oEvent.getParameter("dragSession");
			const oDroppedRow = oEvent.getParameter("droppedControl");
			const aDraggedRowContexts = oDragSession.getComplexData("hierarchymaintenance").draggedRowContexts;

			if (aDraggedRowContexts.length > 0) {
				const oBinding = oTable.getBinding();
				const oNewParentContext = oTable.getContextByIndex(oDroppedRow.getIndex());

				if (oNewParentContext != null) {
					for (let i = 0; i < aDraggedRowContexts.length; i++) {
						oBinding.removeContext(aDraggedRowContexts[i]);
					}
					oBinding.addContexts(oNewParentContext, aDraggedRowContexts);
					this.getView().getModel().setProperty("/pendingChanges", true);
				}
			}
		},

		/**
		 * Performance Measure download
		 */
		onDownload: function() {
			let overallAve = 0;
			let onBeforeRenderingAve = 0;
			let renderingAve = 0;
			let onAfterRenderingAve = 0;
			let tableCreateAve = 0;
			let factorAve = 0;
			let createRowsAve = 0;
			let updateTableContentAve = 0;
			let updateRowHeaderAve = 0;
			let syncColumnHeadersAve = 0;
			let overallSum = 0;
			let onBeforeRenderingSum = 0;
			let renderingSum = 0;
			let onAfterRenderingSum = 0;
			let tableCreateSum = 0;
			let factorSum = 0;
			let createRowsSum = 0;
			let updateTableContentSum = 0;
			let updateRowHeaderSum = 0;
			let syncColumnHeadersSum = 0;
			const iRun = this.aRenderResults.length;
			let sCSV = "Run;Overall;Before Rendering;Rendering;After Rendering;Table Create;Factor of After Rendering in Rendering;Table._createRows;Table._updateTableContent;Table._syncColumnHeaders;Table._updateRowHeader\n";

			for (let i = 0; i < iRun; i++) {
				sCSV += (i + 1) + ";"
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

			const sFileName = "TreeTableODataV2PerformanceTestResults.csv";
			const oBlob = new Blob([sCSV], {type: 'application/csv;charset=utf-8'});

			if (navigator.appVersion.toString().indexOf('.NET') > 0) {
				window.navigator.msSaveBlob(oBlob, sFileName);
			} else {
				const oLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
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