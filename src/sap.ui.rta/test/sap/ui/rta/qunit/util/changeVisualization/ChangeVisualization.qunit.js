/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/base/util/restricted/_merge",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/util/changeVisualization/ChangeCategories",
	"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry",
	"sap/ui/rta/util/changeVisualization/ChangeStates",
	"sap/ui/rta/util/changeVisualization/ChangeVisualization",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/dt/qunit/TestUtil"
], function(
	RtaQunitUtils,
	merge,
	Button,
	HBox,
	VBox,
	Element,
	Lib,
	DesignTime,
	DesignTimeMetadata,
	OverlayRegistry,
	ChangesUtils,
	FlStates,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	nextUIUpdate,
	QUnitUtils,
	ChangeCategories,
	ChangeIndicatorRegistry,
	ChangeStates,
	ChangeVisualization,
	RuntimeAuthoring,
	sinon,
	TestUtil
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
	var oComp;
	var oCompCont;
	QUnit.config.fixture = null;

	var oComponentPromise = RtaQunitUtils.renderTestAppAtAsync("qunit-fixture")
	.then(function(oCompContainer) {
		oCompCont = oCompContainer;
		oComp = oCompCont.getComponentInstance();
	});

	async function setupTest(fnCallback, oRootElement) {
		this.oChangeVisualization = new ChangeVisualization({
			rootControlId: "MockComponent"
		});
		this.oVisualizationButton = new Button({ text: "Test visualization" });
		this.oContainer = oRootElement || new VBox("container", {
			items: [
				new Button("button1", {
					text: "First button"
				}),
				new Button("button2", {
					text: "Second button"
				}),
				new Button("button3", {
					text: "Third button"
				})
			]
		});
		this.oContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		this.oDesignTime = new DesignTime({
			rootElements: [this.oContainer]
		});

		this.oDesignTime.attachEventOnce("synced", function() {
			fnCallback();
		});
	}

	function cleanupTest() {
		this.oChangeVisualization.destroy();
		this.oVisualizationButton.destroy();
		this.oContainer.destroy();
		sandbox.restore();
	}

	function prepareMockEvent(sKey) {
		var oMockEvent = {
			getSource() {
				return {
					getBindingContext(sParameterName) {
						if (sParameterName === "visualizationModel") {
							return {
								getObject() {
									return {
										key: sKey
									};
								}
							};
						}
					}
				};
			}
		};
		return oMockEvent;
	}

	function checkModel(assert, oModelPart, oCheckValues) {
		assert.strictEqual(oModelPart.key, oCheckValues.key, "'key' is set correctly to the model");
		assert.strictEqual(oModelPart.title, oCheckValues.title, "'text' is set correctly to the model");
		assert.strictEqual(oModelPart.icon, oCheckValues.icon, "'icon' is set correctly to the model");
		assert.strictEqual(oModelPart.count, oCheckValues.count, "the number of changes is correct");
	}

	function checkBinding(assert, oModelPart, oMenuData) {
		assert.strictEqual(oMenuData.getCounter(), oModelPart.count, "counter is bound correctly to the control");
		assert.strictEqual(oMenuData.getIcon(), oModelPart.icon, "'icon' is bound correctly to the control");
		assert.strictEqual(oMenuData.getType(), oModelPart.count === 0 ? "Inactive" : "Active", "Type is set correctly depending on change count");
	}

	function prepareChanges(aMockChanges, oRootComponent, oChangeHandler) {
		// Stub changes, root component and change handler
		sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aMockChanges || []);
		var oLoadComponentStub = sandbox.stub(ChangeVisualization.prototype, "_getComponent");
		oLoadComponentStub.returns({
			createId(sId) {
				return sId;
			},
			...oRootComponent
		});
		sandbox.stub(ChangesUtils, "getControlIfTemplateAffected")
		.callsFake(function(oChange, oControl) {
			return {
				control: oControl
			};
		});
		var oMergedChangeHandler = {
			getChangeVisualizationInfo() { },
			...oChangeHandler
		};
		sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves(oMergedChangeHandler);
	}

	function createMockChange(sId, sCommandName, sSelectorId, oAdditionalProperties, sState) {
		var oChange = RtaQunitUtils.createUIChange(merge({
			selector: {
				id: sSelectorId
			},
			fileName: sId,
			support: {
				command: sCommandName
			}
		}, oAdditionalProperties));
		oChange.setState(sState);
		oChange.markFinished && oChange.markFinished();
		return oChange;
	}

	function waitForMethodCall(oObject, sMethodName) {
		// Returns a promise which is resolved with the return value
		// of the given method after it was first called
		// Doesn't work with event handlers
		return new Promise(function(resolve) {
			sandbox.stub(oObject, sMethodName)
			.callsFake(function(...aArgs) {
				if (oObject[sMethodName].wrappedMethod) {
					var oResult = oObject[sMethodName].wrappedMethod.apply(this, aArgs);
					resolve(oResult);
				}
			});
		})
		.then(function() {
			oObject[sMethodName].restore();
		});
	}

	function collectIndicatorReferences() {
		// Get all visible change indicator elements on the screen
		return Array.from(document.getElementsByClassName("sapUiRtaChangeIndicator")).map(function(oDomRef) {
			return Element.getElementById(oDomRef.id);
		});
	}

	async function startVisualization(oRta) {
		oRta.setMode("visualization");
		await waitForMethodCall(oRta.getToolbar(), "setModel");
		await nextUIUpdate();
	}

	async function stopVisualization(oRta) {
		oRta.setMode("adaptation");
		await nextUIUpdate();
	}

	function getIndicatorForElement(aIndicators, sId) {
		return aIndicators.find(function(oIndicator) {
			return oIndicator.getSelectorId() === sId;
		}).getDomRef();
	}

	function startRta() {
		this.oRta = new RuntimeAuthoring({
			rootControl: oComp,
			flexSettings: this.oFlexSettings
		});
		return RtaQunitUtils.clear()
		.then(this.oRta.start.bind(this.oRta))
		.then(function() {
			this.oRootControlOverlay = OverlayRegistry.getOverlay(oComp);
			this.oChangeVisualization = this.oRta.getChangeVisualization();
			this.oToolbar = this.oRta.getToolbar();
		}.bind(this));
	}

	QUnit.module("Change Viz - Menu Button & Model Test", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			this.oCheckModelAll = {
				key: "all",
				title: oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [0]),
				icon: "sap-icon://show",
				count: 0
			};
			this.oCheckModelMove = {
				key: "move",
				title: oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_MOVE", [0]),
				icon: "sap-icon://move",
				count: 0
			};
			this.aMockChanges = [
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1", undefined, FlStates.LifecycleState.NEW),
				createMockChange("testReveal", "reveal", "Comp1---idMain1--rb2", undefined, FlStates.LifecycleState.PERSISTED),
				createMockChange("testRename", "rename", "Comp1---idMain1--lb1", undefined, FlStates.LifecycleState.PERSISTED)
			];
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				flexSettings: this.oFlexSettings
			});
			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta))
			.then(function() {
				this.oRootControlOverlay = OverlayRegistry.getOverlay(oComp);
				this.oChangeVisualization = this.oRta.getChangeVisualization();
			}.bind(this));
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("Without changes - Check if Menu is bound correctly to the model", function(assert) {
			return startVisualization(this.oRta)
			.then(function() {
				var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
				this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
				return oOpenPopoverPromise;
			}.bind(this))
			.then(function() {
				var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories;
				const aPopoverContent = this.oChangeVisualization.getAggregation("popover").getContent();
				assert.notOk(aPopoverContent[(aPopoverContent.length - 1)].getVisible(), "Hidden Info Message is invisible");
				assert.notOk(
					aPopoverContent[0].getAggregation("buttons")[1].getVisible(),
					"Draft Button is invisible, no versioning is available"
				);
				assert.notOk(
					aPopoverContent[0].getAggregation("buttons")[2].getEnabled(),
					"Unsaved Button is disabled, no changes available for this category"
				);
				var aMenuItems = aPopoverContent[1].getItems();
				checkModel(assert, aVizModel[0], this.oCheckModelAll);
				checkModel(assert, aVizModel[2], this.oCheckModelMove);
				checkBinding(assert, aVizModel[0], aMenuItems[0]);
				checkBinding(assert, aVizModel[2], aMenuItems[2]);
			}.bind(this));
		});

		QUnit.test("Without changes - Check if Filter Menu for Draft when Versioning is available", function(assert) {
			return startVisualization(this.oRta)
			.then(function() {
				this.oChangeVisualization._updateVisualizationModel({
					versioningAvailable: true
				});
				var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
				this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
				return oOpenPopoverPromise;
			}.bind(this))
			.then(function() {
				const aPopoverContent = this.oChangeVisualization.getAggregation("popover").getContent();
				assert.notOk(aPopoverContent[(aPopoverContent.length - 1)].getVisible(), "Hidden Info Message is invisible");
				assert.ok(
					aPopoverContent[0].getAggregation("buttons")[1].getVisible(),
					"Draft Button is visible, versioning is available"
				);
				assert.notOk(
					aPopoverContent[0].getAggregation("buttons")[1].getEnabled(),
					"Draft Button is not enabled, no changes are available for this state"
				);
			}.bind(this));
		});

		QUnit.test("With changes - Check if Menu is bound correctly to the model", function(assert) {
			// create additional split and combine changes
			this.aMockChanges.push(createMockChange("testSplit", "split", "Comp1---idMain1--lb2"));
			this.aMockChanges.push(createMockChange("testCombine", "combine", "Comp1---idMain1--lb2"));
			// create additional add changes
			this.aMockChanges.push(createMockChange("testCreateContainer", "createContainer", "Comp1---idMain1--lb2"));
			this.aMockChanges.push(createMockChange("testAddDelegateProperty", "addDelegateProperty", "Comp1---idMain1--lb2"));
			this.aMockChanges.push(createMockChange("testReveal", "reveal", "Comp1---idMain1--lb2"));
			this.aMockChanges.push(createMockChange("testAddIFrame", "addIFrame", "Comp1---idMain1--lb2"));
			prepareChanges(this.aMockChanges);
			this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [9]);
			this.oCheckModelAll.count = 8;
			this.oCheckModelCombineAndSplit = {
				key: "combinesplit",
				title: oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_COMBINESPLIT", [0]),
				icon: "sap-icon://combine",
				count: 2
			};
			this.oCheckModelAdd = {
				key: "add",
				title: oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ADD", [0]),
				icon: "sap-icon://add",
				count: 5
			};
			return startVisualization(this.oRta)
			.then(function() {
				var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
				this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
				return oOpenPopoverPromise;
			}.bind(this))
			.then(function() {
				var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories;
				const aPopoverContent = this.oChangeVisualization.getAggregation("popover").getContent();
				assert.notOk(aPopoverContent[(aPopoverContent.length - 1)].getVisible(), "Hidden Info Message is invisible");
				assert.notOk(
					aPopoverContent[0].getAggregation("buttons")[1].getVisible(),
					"Draft Button is invisible, no versioning is available"
				);
				assert.ok(
					aPopoverContent[0].getAggregation("buttons")[2].getEnabled(),
					"Unsaved Button is enabled, changes available for this state"
				);
				var aMenuItems = aPopoverContent[1].getItems();
				checkModel(assert, aVizModel[0], this.oCheckModelAll);
				checkModel(assert, aVizModel[2], this.oCheckModelMove);
				checkModel(assert, aVizModel[1], this.oCheckModelAdd);
				checkModel(assert, aVizModel[4], this.oCheckModelCombineAndSplit);
				checkBinding(assert, aVizModel[0], aMenuItems[0]);
				checkBinding(assert, aVizModel[2], aMenuItems[2]);
				checkBinding(assert, aVizModel[1], aMenuItems[1]);
				checkBinding(assert, aVizModel[4], aMenuItems[4]);
			}.bind(this));
		});

		QUnit.test("With changes - Check Filter Menu for Draft when Versioning is available", function(assert) {
			prepareChanges(this.aMockChanges);
			this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [3]);
			this.oCheckModelAll.count = 3;
			return startVisualization(this.oRta)
			.then(function() {
				this.oChangeVisualization._updateVisualizationModel({
					versioningAvailable: true
				});
				var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
				this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
				return oOpenPopoverPromise;
			}.bind(this))
			.then(function() {
				const aPopoverContent = this.oChangeVisualization.getAggregation("popover").getContent();
				assert.notOk(aPopoverContent[(aPopoverContent.length - 1)].getVisible(), "Hidden Info Message is invisible");
				assert.ok(
					aPopoverContent[0].getAggregation("buttons")[1].getVisible(),
					"Draft Button is visible, versioning is available"
				);
				assert.ok(
					aPopoverContent[0].getAggregation("buttons")[1].getEnabled(),
					"Draft Button is enabled, changes are available for this state"
				);
				assert.ok(
					aPopoverContent[0].getAggregation("buttons")[2].getEnabled(),
					"Unsaved Button is enabled, changes are available for this state"
				);
				aPopoverContent[0].getAggregation("buttons")[1].firePress();
				let sUpdatedButtonText = this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").getText();
				assert.strictEqual(
					sUpdatedButtonText,
					`${oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_OVERVIEW_ALL")} (${oRtaResourceBundle.getText("BUT_CHANGEVISUALIZATION_VERSIONING_DRAFT")})`,
					"then if Draft is selected the button text is updated to 'All Changes (Draft)'"
				);
				aPopoverContent[0].getAggregation("buttons")[2].firePress();
				sUpdatedButtonText = this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").getText();
				assert.strictEqual(
					sUpdatedButtonText,
					`${oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_OVERVIEW_ALL")} (${oRtaResourceBundle.getText("BUT_CHANGEVISUALIZATION_VERSIONING_DIRTY")})`,
					"then if Unsaved is selected the button text is updated to 'All Changes (Unsaved)'"
				);
			}.bind(this));
		});

		QUnit.test("With changes (Not all visible) - Check if Menu is bound correctly to the model", function(assert) {
			this.aMockChanges.push(createMockChange("testRename2", "rename", "Comp1---idMain1--lb2"));
			prepareChanges(this.aMockChanges);
			this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [3]);
			this.oCheckModelAll.count = 3;
			this.oCheckModelAll.tooltip = oRtaResourceBundle.getText("TOOLTIP_CHANGEVISUALIZATION_OVERVIEW_ADDITIONAL_CHANGES");
			OverlayRegistry.getOverlay("Comp1---idMain1--lb2").destroy();
			return startVisualization(this.oRta)
			.then(function() {
				var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
				this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
				return oOpenPopoverPromise;
			}.bind(this))
			.then(function() {
				var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories;
				assert.ok(this.oChangeVisualization.getAggregation("popover").getContent()[1].getVisible(), "Hidden Info Message is visible");
				var aMenuItems = this.oChangeVisualization.getAggregation("popover").getContent()[1].getItems();
				checkModel(assert, aVizModel[0], this.oCheckModelAll);
				checkModel(assert, aVizModel[2], this.oCheckModelMove);
				checkBinding(assert, aVizModel[0], aMenuItems[0]);
				checkBinding(assert, aVizModel[2], aMenuItems[2]);
			}.bind(this));
		});

		QUnit.test("With changes that have no selector", async function(assert) {
			const oMockChange1 = createMockChange("changeWithNoSelectorFunction");
			oMockChange1.getSelector = undefined;
			const oMockChange2 = createMockChange("changeWithUndefinedSelector");
			sandbox.stub(oMockChange2, "getSelector").returns(undefined);
			const oMockChange3 = createMockChange("changeWithEmptySelector");
			sandbox.stub(oMockChange3, "getSelector").returns({});
			this.aMockChanges = [oMockChange1, oMockChange2, oMockChange3];

			prepareChanges(this.aMockChanges);
			await startVisualization(this.oRta);

			const oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
			this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
			await oOpenPopoverPromise;

			const aVisualizationData = this.oRta.getToolbar().getModel("visualizationModel").getData();
			const sHiddenChangesInfo = oRtaResourceBundle.getText(
				"MSG_CHANGEVISUALIZATION_HIDDEN_CHANGES_INFO",
				[this.aMockChanges.length]
			);
			assert.strictEqual(
				aVisualizationData.sortedChanges.relevantHiddenChanges.length,
				3,
				"then the changes are in the relevantHiddenChanges category"
			);
			assert.strictEqual(
				sHiddenChangesInfo,
				aVisualizationData.popupInfoMessage,
				"then the changes are displayed as not visualized correctly "
			);
		});

		QUnit.test("With one change belonging to other category - Check if Menu is bound correctly to the model", function(assert) {
			this.aMockChanges.push(createMockChange("testAddColumn", "addColumn", "Comp1---idMain1--lb1"));
			prepareChanges(this.aMockChanges);

			this.oCheckModelOther = {
				key: "other",
				title: oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_OTHER", [0]),
				icon: "sap-icon://key-user-settings",
				count: 1
			};

			this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [3]);
			this.oCheckModelAll.count = 4;
			this.oCheckModelAll.tooltip = oRtaResourceBundle.getText("TOOLTIP_CHANGEVISUALIZATION_OVERVIEW_ADDITIONAL_CHANGES");
			return startVisualization(this.oRta)
			.then(function() {
				var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
				this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
				return oOpenPopoverPromise;
			}.bind(this))
			.then(function() {
				var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories;
				var aMenuItems = this.oChangeVisualization.getAggregation("popover").getContent()[1].getItems();
				checkModel(assert, aVizModel[0], this.oCheckModelAll);
				checkModel(assert, aVizModel[2], this.oCheckModelMove);
				checkModel(assert, aVizModel[6], this.oCheckModelOther);
				checkBinding(assert, aVizModel[0], aMenuItems[0]);
				checkBinding(assert, aVizModel[2], aMenuItems[2]);
			}.bind(this));
		});

		QUnit.test("With changes (Change gets invisible) - Check if Menu is bound correctly to the model", function(assert) {
			prepareChanges(this.aMockChanges);
			this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [3]);
			this.oCheckModelAll.count = 3;
			return startVisualization(this.oRta)
			.then(function() {
				var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
				this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
				return oOpenPopoverPromise;
			}.bind(this))
			.then(async function() {
				var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories;
				const aPopoverContent = this.oChangeVisualization.getAggregation("popover").getContent();
				assert.notOk(aPopoverContent[(aPopoverContent.length - 1)].getVisible(), "Hidden Info Message is invisible");
				var aMenuItems = aPopoverContent[1].getItems();
				checkModel(assert, aVizModel[0], this.oCheckModelAll);
				checkModel(assert, aVizModel[2], this.oCheckModelMove);
				checkBinding(assert, aVizModel[0], aMenuItems[0]);
				checkBinding(assert, aVizModel[2], aMenuItems[2]);
				OverlayRegistry.getOverlay("Comp1---idMain1--rb2").destroy();
				this.oChangeVisualization.getAggregation("popover").close();
				this.oRta.setMode("navigation");
				await nextUIUpdate();
				return startVisualization(this.oRta);
			}.bind(this))
			.then(async function() {
				this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [2]);
				this.oCheckModelAll.count = 2;
				this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
				await nextUIUpdate();
				var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories;
				assert.ok(this.oChangeVisualization.getAggregation("popover").getContent()[1].getVisible(), "Hidden Info Message is visible");
				var aMenuItems = this.oChangeVisualization.getAggregation("popover").getContent()[1].getItems();
				checkModel(assert, aVizModel[0], this.oCheckModelAll);
				checkModel(assert, aVizModel[2], this.oCheckModelMove);
				checkBinding(assert, aVizModel[0], aMenuItems[0]);
				checkBinding(assert, aVizModel[2], aMenuItems[2]);
			}.bind(this));
		});

		QUnit.test("Menu & Model are in correct order", function(assert) {
			return startVisualization(this.oRta).then(function() {
				var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
				this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
				return oOpenPopoverPromise;
			}.bind(this))
			.then(function() {
				var aMenuItems = this.oChangeVisualization.getAggregation("popover").getModel("visualizationModel").getData().changeCategories;
				assert.strictEqual(aMenuItems[0].key, "all", "'all' is on first position");
				assert.strictEqual(aMenuItems[1].key, "add", "'add' is on second position");
				assert.strictEqual(aMenuItems[2].key, "move", "'move' is on third position");
				assert.strictEqual(aMenuItems[3].key, "rename", "'rename' is on fourth position");
				assert.strictEqual(aMenuItems[4].key, "combinesplit", "'combinesplit' is on fifth position");
				assert.strictEqual(aMenuItems[5].key, "remove", "'remove' is on sixth position");
			}.bind(this));
		});

		QUnit.test("Menu Button Text will change and popover closes on category selection", function(assert) {
			const oClosePopoverStub = sandbox.stub();
			sandbox.stub(this.oChangeVisualization, "getPopover").returns({
				close: oClosePopoverStub
			});
			return startVisualization(this.oRta).then(function() {
				var sMenuButtonText = this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").getText();
				assert.strictEqual(sMenuButtonText, oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_OVERVIEW_ALL"));
				return this.oChangeVisualization.onChangeCategorySelection(prepareMockEvent("move"));
			}.bind(this))
			.then(async function() {
				await nextUIUpdate();
				var sMenuButtonText = this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").getText();
				assert.strictEqual(sMenuButtonText, oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_OVERVIEW_MOVE"));
				assert.strictEqual(oClosePopoverStub.called, true, "then the popover is closed");
			}.bind(this));
		});
	});

	QUnit.module("Command type detection", {
		beforeEach(assert) {
			// Create a custom structure to test with deeply nested containers
			var oContainer = new VBox("container", {
				items: [
					new Button("ctdbutton1", {
						text: "First button"
					}),
					new HBox("nestedContainer1", {
						items: [
							new Button("ctdbutton2", {
								text: "Second button"
							}),
							new HBox("nestedContainer2", {
								items: [
									new Button("ctdbutton3", {
										text: "Third button"
									})
								]
							})
						]
					})
				]
			});

			var fnDone = assert.async();

			setupTest.call(this, function() {
				fnDone();
			}, oContainer);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when the command type is not defined in the change", function(assert) {
			var fnDone = assert.async();
			// Stub getCommandName to simulate special use cases
			var oGetCommandNameStub = sandbox.stub(DesignTimeMetadata.prototype, "getCommandName");
			oGetCommandNameStub.callsFake(function(...aArgs) {
				const [sChangeType, oElement, sAggregationName] = aArgs;
				// For simplicity, lookup known change types by element id
				// and combination of aggregation name and change type name
				var sIdentifier = (sAggregationName ? `${sAggregationName} ` : "") + sChangeType;
				var oMockResponse = ({
					// Case 1: Command is defined on the element itself
					ctdbutton1: {
						someRenameChangeType: "rename"
					},
					// Case 2: Command is defined on the parent overlay
					nestedContainer1: {
						"items someAddChangeType": "reveal"
					},
					// Case 3: Command is defined on an overlay which was created during runtime
					// and is not known to the change
					nestedContainer2: {
						"items someMoveChangeType": "move"
					}
				}[oElement.getId()] || {})[sIdentifier];
				return oMockResponse || DesignTimeMetadata.prototype.getCommandName.wrappedMethod.apply(this, aArgs);
			});

			// Changes have no command name defined as it is the case for pre 1.84 changes
			prepareChanges([
				// For case 1:
				createMockChange("testChange1", undefined, "ctdbutton1", {
					changeType: "someRenameChangeType",
					dependentSelector: {
						ctdbutton1: {id: "ctdbutton1"}
					}
				}),
				// For case 2:
				createMockChange("testChange2", undefined, "nestedContainer1", {
					changeType: "someAddChangeType",
					dependentSelector: {
						ctdbutton2: {id: "ctdbutton2"},
						nestedContainer1: {id: "nestedContainer1"}
					}
				}),
				// For case 3:
				createMockChange("testChange3", undefined, "nestedContainer1", {
					changeType: "someMoveChangeType",
					// nestedContainer2 is not part of the dependent selectors
					dependentSelector: {
						ctdbutton3: {id: "ctdbutton3"},
						nestedContainer1: {id: "nestedContainer1"}
					}
				})
			]);
			this.oChangeVisualization.triggerModeChange("MockComponent", {
				getControl() {},
				getModel() {},
				setModel(oData) {
					assert.strictEqual(
						oData.getData().changeCategories[3].count,
						1,
						"then changes where the command is defined on the element are properly categorized"
					);
					assert.strictEqual(
						oData.getData().changeCategories[1].count,
						1,
						"then changes where the command is defined on the element are properly categorized"
					);
					assert.strictEqual(
						oData.getData().changeCategories[2].count,
						1,
						"then changes where the command is defined on the element are properly categorized"
					);
					fnDone();
				},
				adjustToolbarSectionWidths() {}
			});
		});
	});

	QUnit.module("Change indicator management", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			this.aMockChanges = [
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1", undefined, FlStates.LifecycleState.NEW),
				createMockChange("testReveal", "reveal", "Comp1---idMain1--rb2", undefined, FlStates.LifecycleState.PERSISTED),
				createMockChange("testRename", "rename", "Comp1---idMain1--lb1", undefined, FlStates.LifecycleState.PERSISTED)
			];
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				flexSettings: this.oFlexSettings
			});
			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta))
			.then(function() {
				this.oRootControlOverlay = OverlayRegistry.getOverlay(oComp);
				this.oChangeVisualization = this.oRta.getChangeVisualization();
				this.oToolbar = this.oRta.getToolbar();
			}.bind(this));
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when a command category is selected", function(assert) {
			prepareChanges(this.aMockChanges);
			return startVisualization(this.oRta)
			.then(function() {
				var aIndicators = collectIndicatorReferences();
				assert.strictEqual(
					aIndicators.length,
					3,
					"then all indicators are visible 1/2"
				);
				assert.ok(
					aIndicators.every(function(oIndicator) {
						return oIndicator.getVisible();
					}),
					"then all indicators are visible 2/2"
				);
			});
		});

		QUnit.test("when change visualization is deactivated and activated again", function(assert) {
			prepareChanges(this.aMockChanges);
			return startVisualization(this.oRta)
			.then(async function() {
				assert.strictEqual(
					collectIndicatorReferences().filter(function(oIndicator) {
						return oIndicator.getVisible();
					}).length,
					3,
					"then all indicators are visible before deactivation"
				);

				// Deactivate
				this.oChangeVisualization.setIsActive(false);
				await nextUIUpdate();
				assert.strictEqual(
					collectIndicatorReferences().filter(function(oIndicator) {
						return oIndicator.getVisible();
					}).length,
					0,
					"then all indicators are hidden after deactivation"
				);

				// Activate again and select a different category
				this.oChangeVisualization.onChangeCategorySelection(prepareMockEvent("add"));
				this.oChangeVisualization.setIsActive(true);
				await nextUIUpdate();
				assert.strictEqual(
					collectIndicatorReferences().filter(function(oIndicator) {
						return oIndicator.getVisible();
					}).length,
					2,
					"then all indicators are visible again after reactivation"
				);
			}.bind(this));
		});

		QUnit.test("when a change-related overlay id changes", function(assert) {
			var sElementId = "Comp1---idMain1--rb1";
			var sOriginalOverlayId = OverlayRegistry.getOverlay(sElementId).getId();
			prepareChanges([
				createMockChange("testAdd", "addDelegateProperty", sElementId)
			]);

			return startVisualization(this.oRta)
			.then(function() {
				assert.strictEqual(
					this.oChangeVisualization._oChangeIndicatorRegistry.getChangeIndicator(sElementId).getOverlayId(),
					sOriginalOverlayId,
					"then the correct initial overlay id is stored in the registry"
				);

				// Simulate a change of the overlay id, e.g. because a change handler recreated the element
				// during undo/redo
				this.oRta.setMode("adaptation");
				var oElement = Element.getElementById(sElementId);
				var oParent = oElement.getParent();
				var {sParentAggregationName} = oElement;
				oElement.destroy();
				oParent.addAggregation(sParentAggregationName, new Button(sElementId));
				var oDesignTimePromise = new Promise(function(fnResolve) {
					this.oRta._oDesignTime.attachEventOnce("synced", function() {
						fnResolve();
					});
				}.bind(this));

				// Restart visualization
				return oDesignTimePromise
				.then(function() {
					return startVisualization(this.oRta);
				}.bind(this))
				.then(function() {
					var sNewOverlayId = OverlayRegistry.getOverlay(sElementId).getId();
					assert.notEqual(sOriginalOverlayId, sNewOverlayId); // False negative avoidance
					assert.strictEqual(
						this.oChangeVisualization._oChangeIndicatorRegistry.getChangeIndicator(sElementId).getOverlayId(),
						sNewOverlayId,
						"then the overlay id of the indicator is updated"
					);

					// Recreate comp to avoid side effects with other tests
					oCompCont.destroy();
					return RtaQunitUtils.renderTestAppAtAsync("qunit-fixture")
					.then(function(oCompContainer) {
						oCompCont = oCompContainer;
						oComp = oCompCont.getComponentInstance();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when a change is done on a control whose parent is different from its relevant container", function(assert) {
			var sElementId = "Comp1---idMain1--Dates";
			var oRelevantContainer = OverlayRegistry.getOverlay(sElementId).getRelevantContainer();
			var oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
			var oParent = Element.getElementById(sElementId).getParent();

			// The selector for the change is the parent element
			prepareChanges(
				[
					createMockChange("testRemove", "remove", oParent.getId())
				],
				undefined,
				{
					getChangeVisualizationInfo() {
						return {
							affectedControls: [sElementId],
							displayControls: [oParent.getId()]
						};
					}
				}
			);

			return startVisualization(this.oRta)
			.then(function() {
				assert.strictEqual(
					this.oChangeVisualization._oChangeIndicatorRegistry.getChangeIndicator(oParent.getId()).getOverlayId(),
					oRelevantContainerOverlay.getId(),
					"then the indicator is created on the relevant container's overlay"
				);
				assert.strictEqual(
					this.oChangeVisualization._oChangeVisualizationModel.getData().sortedChanges.relevantHiddenChanges.length,
					0,
					"then the change is not displayed as hidden");
			}.bind(this));
		});

		QUnit.test("when the popover menu with dirty changes is opened and closed multiple times", function(assert) {
			function waitForEvent(oElement, sEvent) {
				return new Promise(function(resolve) {
					oElement.attachEventOnce(sEvent, resolve);
				});
			}
			var oChangeIndicator;
			var oOverlay;
			prepareChanges(this.aMockChanges);
			return startVisualization(this.oRta).then(async function() {
				assert.strictEqual(
					collectIndicatorReferences().filter(function(oIndicator) {
						return oIndicator.getVisible();
					}).length,
					3,
					"then the indicators are visible"
				);

				this.oRta.setMode("adaptation");
				await nextUIUpdate();
				this.aMockChanges.push(createMockChange("testMove", "move", "Comp1---idMain1--lb2"));
				return startVisualization(this.oRta);
			}.bind(this)).then(function() {
				assert.strictEqual(
					collectIndicatorReferences().filter(function(oIndicator) {
						return oIndicator.getVisible();
					}).length,
					4,
					"then the indicator for the dirty change is added"
				);

				[oChangeIndicator] = collectIndicatorReferences().filter(function(oIndicator) {
					return oIndicator.mProperties.selectorId === "Comp1---idMain1--lb2";
				});
				oOverlay = Element.getElementById(oChangeIndicator.getOverlayId()).getDomRef();
				var oCreatePopoverPromise = waitForMethodCall(oChangeIndicator, "setAggregation");
				QUnitUtils.triggerEvent("click", oOverlay);
				return oCreatePopoverPromise;
			})
			.then(async function() {
				await nextUIUpdate();
				var oPopover = oChangeIndicator.getAggregation("_popover");
				assert.ok(oPopover.isOpen(), "after the first click the popover is opened");
				var oClosePopoverPromise = waitForEvent(oPopover, "afterClose");
				QUnitUtils.triggerEvent("click", oOverlay);
				return oClosePopoverPromise;
			})
			.then(async function() {
				await nextUIUpdate();
				var oPopover = oChangeIndicator.getAggregation("_popover");
				assert.notOk(oPopover.isOpen(), "after the second click the popover is closed");
				var oOpenPopoverPromise = waitForEvent(oPopover, "afterOpen");
				QUnitUtils.triggerEvent("click", oOverlay);
				return oOpenPopoverPromise;
			})
			.then(async function() {
				await nextUIUpdate();
				var oPopover = oChangeIndicator.getAggregation("_popover");
				assert.ok(oPopover.isOpen(), "after the third click the popover is opened again");
			});
		});

		QUnit.test("when ChangeVisualization is inactive and mode change is triggered", function(assert) {
			var fnDone = assert.async();
			prepareChanges(this.aMockChanges);
			this.oChangeVisualization.setRootControlId(undefined);
			this.oChangeVisualization.setIsActive(false);
			var fnClickSpy = sandbox.spy(this.oChangeVisualization, "_fnOnClickHandler");
			assert.strictEqual(this.oChangeVisualization.getRootControlId(), undefined, "then the RootControlId was not set before");
			assert.strictEqual(this.oChangeVisualization.getIsActive(), false, "then the ChangeVisualization was inactive before");
			waitForMethodCall(this.oChangeVisualization, "triggerModeChange")
			.then(function() {
				assert.strictEqual(this.oChangeVisualization.getRootControlId(), "Comp1", "then the RootControlId is set afterwards");
				assert.strictEqual(this.oChangeVisualization.getIsActive(), true, "then the ChangeVisualization is active afterwards");
				var oRootOverlay = OverlayRegistry.getOverlay("Comp1");
				oRootOverlay.getDomRef().dispatchEvent(new Event("click"));
				assert.ok(fnClickSpy.called, "then the click event handler is added to the Root Overlay DomRef");
				fnDone();
			}.bind(this));
			this.oChangeVisualization.triggerModeChange("Comp1", this.oRta.getToolbar());
		});

		QUnit.test("when ChangeVisualization is active and mode change is triggered", function(assert) {
			prepareChanges(this.aMockChanges);
			var fnClickSpy = sandbox.spy(this.oChangeVisualization, "_fnOnClickHandler");
			return startVisualization(this.oRta).then(function() {
				assert.strictEqual(this.oChangeVisualization.getIsActive(), true, "then the ChangeVisualization was active before");
				this.oChangeVisualization.triggerModeChange("Comp1", this.oRta.getToolbar());
				assert.strictEqual(this.oChangeVisualization.getIsActive(), false, "then the ChangeVisualization is inactive afterwards");
				var oRootOverlay = OverlayRegistry.getOverlay("Comp1");
				oRootOverlay.getDomRef().dispatchEvent(new Event("click"));
				assert.notOk(fnClickSpy.called, "then the click event handler was removed from the Root Overlay DomRef");
			}.bind(this));
		});

		QUnit.test("when changes have different fileTypes", function(assert) {
			var aMockChanges = [
				createMockChange("newCtrlVariant", undefined, {}, {
					fileType: "ctrl_variant"
				}),
				createMockChange("newVariant", undefined, {}, {
					fileType: "variant"
				}),
				createMockChange("setFavorite", undefined, "variant", {
					fileType: "ctrl_variant_change"
				}),
				createMockChange("setDefault", undefined, "variant", {
					fileType: "ctrl_variant_management_change"
				}),
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1"),
				createMockChange("testReveal", "reveal", "Comp1---idMain1--rb2")
			];
			prepareChanges(aMockChanges);
			return startVisualization(this.oRta)
			.then(function() {
				assert.strictEqual(
					this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories[0].count,
					2,
					"then only changes with the fileType \"change\" are applied and visible"
				);
				assert.strictEqual(
					this.oRta.getToolbar().getModel("visualizationModel").getData().sortedChanges.relevantHiddenChanges.length,
					4,
					"the variants and related changes are part of the hidden changes"
				);
			}.bind(this));
		});

		QUnit.test("when appDescriptor changes are present (fileType 'change' but no selector)", function(assert) {
			var aMockChanges = [
				createMockChange("appDescriptor", undefined, null),
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1"),
				createMockChange("testReveal", "reveal", "Comp1---idMain1--rb2")
			];
			prepareChanges(aMockChanges);
			return startVisualization(this.oRta)
			.then(function() {
				assert.strictEqual(
					this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories[0].count,
					2,
					"then only the other changes are applied and visible"
				);
				assert.strictEqual(
					this.oRta.getToolbar().getModel("visualizationModel").getData().sortedChanges.relevantHiddenChanges.length,
					1,
					"the app descriptor change is part of the hidden changes"
				);
			}.bind(this));
		});

		QUnit.test("when details are selected for a change", function(assert) {
			prepareChanges(
				[
					createMockChange("testMove", "move", "Comp1---idMain1--lb1"),
					createMockChange("testAdd1", "remove", "Comp1---idMain1--rb2"),
					createMockChange("testAdd2", "remove", "Comp1---idMain1--lb2")
				],
				undefined,
				{
					getChangeVisualizationInfo(oChange) {
						return {
							dependentControls: [Element.getElementById("Comp1---idMain1--rb2")], // Test if vis can handle elements
							affectedControls: [oChange.getSelector()] // Test if vis can handle IDs
						};
					}
				}
			);
			this.oChangeVisualization.onChangeCategorySelection(prepareMockEvent(ChangeCategories.ALL));
			var oDependentOverlayDomRef;
			return startVisualization(this.oRta).then(function() {
				var oSelectChangePromise = waitForMethodCall(this.oChangeVisualization, "_selectChange");
				var oChangeIndicator = collectIndicatorReferences()[0];
				oChangeIndicator.fireSelectChange({
					changeId: oChangeIndicator.getChanges()[0].id
				});
				return oSelectChangePromise;
			}.bind(this)).then(async function() {
				await nextUIUpdate();

				oDependentOverlayDomRef = OverlayRegistry.getOverlay("Comp1---idMain1--rb2").getDomRef();
				assert.ok(
					oDependentOverlayDomRef.className.split(" ").includes("sapUiRtaChangeIndicatorDependent"),
					"then the appropriate style class is added"
				);
				assert.strictEqual(
					collectIndicatorReferences().filter(function(oIndicator) {
						return oIndicator.getVisible();
					}).length,
					3,
					"then all the ChangeIndicators are shown"
				);
				return waitForMethodCall(oDependentOverlayDomRef.classList, "remove");
			}).then(async function() {
				await nextUIUpdate();
				assert.notOk(
					oDependentOverlayDomRef.className.split(" ").includes("sapUiRtaChangeIndicatorDependent"),
					"then the appropriate style class is removed"
				);
			});
		});

		QUnit.test("when ChangeVisualization is active and exits", function(assert) {
			return startVisualization(this.oRta).then(function() {
				var fnClickSpy = sandbox.spy(this.oChangeVisualization, "_fnOnClickHandler");
				this.oChangeVisualization.exit();
				assert.ok(
					this.oChangeVisualization._oChangeIndicatorRegistry._bIsBeingDestroyed,
					"then the ChangeIndicatorRegistry is destroyed"
				);
				var oRootOverlay = OverlayRegistry.getOverlay("Comp1");
				var oMouseEvent = new Event("click");
				oRootOverlay.getDomRef().dispatchEvent(oMouseEvent);
				assert.notOk(fnClickSpy.called, "then the click event handler was removed from the Root Overlay DomRef");
			}.bind(this));
		});

		QUnit.test("when exiting after overlays were destroyed", function(assert) {
			// Overlay might be already destroyed, e.g. during version switch
			return startVisualization(this.oRta).then(function() {
				var oRootOverlay = OverlayRegistry.getOverlay("Comp1");
				oRootOverlay.destroy();
				this.oChangeVisualization.exit();
				assert.ok(true, "then no error is thrown");
			}.bind(this));
		});

		QUnit.test("when the visualization is started and there is a change on a control inside a template", async function(assert) {
			var fnDone = assert.async();
			var oHorizontalLayout = await TestUtil.createListWithBoundItems();
			var sBoundListId = "boundlist";

			var oMockChange = createMockChange("testRename", "rename", "boundlist");
			oMockChange.setDependentSelectors({
				originalSelector: {
					id: "boundListItem-btn"
				}
			});

			prepareChanges([oMockChange]);

			this.oRta._oDesignTime.attachEventOnce("synced", function() {
				startVisualization(this.oRta).then(async function() {
					var oChangeIndicator = collectIndicatorReferences()[0];
					var oBoundListOverlay = OverlayRegistry.getOverlay(oHorizontalLayout.getContent()[0]);
					assert.strictEqual(
						oChangeIndicator.getOverlayId(),
						oBoundListOverlay.getId(),
						"then the indicator is added to the overlay of the control hosting the template (the bound list)"
					);
					assert.strictEqual(
						oChangeIndicator.getSelectorId(),
						sBoundListId,
						"then the indicator is registered with the bound list selector"
					);
					oHorizontalLayout.destroy();
					await nextUIUpdate();
					fnDone();
				});
			}.bind(this));

			var oPage = Element.getElementById("Comp1---idMain1--mainPage");
			oPage.insertAggregation("content", oHorizontalLayout, 0);
			await nextUIUpdate();
		});
	});

	QUnit.module("Keyboard and focus handling", {
		before() {
			return oComponentPromise;
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		function _round(iValue) {
			// round up to 3 numbers after the comma for test consistency reasons
			return Math.round(iValue * 1000) / 1000;
		}
		QUnit.test("when the visualization is started", function(assert) {
			prepareChanges([
				createMockChange("testRename", "rename", "Comp1---idMain1--Label1"),
				createMockChange("testReveal", "reveal", "Comp1---idMain1--rb2"),
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1")
			]);
			return startRta.call(this)
			.then(startVisualization.bind(this, this.oRta))
			.then(async function() {
				this.oChangeVisualization.onChangeCategorySelection(prepareMockEvent(ChangeCategories.ALL));
				await nextUIUpdate();
				var aIndicators = collectIndicatorReferences();
				var iYPosIndicator1 = _round(
					getIndicatorForElement(aIndicators, "Comp1---idMain1--rb1").getClientRects()[0].y +
					getIndicatorForElement(aIndicators, "Comp1---idMain1--rb1").getClientRects()[0].height / 2
				);
				var iXPosIndicator1 = _round(getIndicatorForElement(aIndicators, "Comp1---idMain1--rb1").getClientRects()[0].x);
				var iYPosIndicator2 = _round(
					getIndicatorForElement(aIndicators, "Comp1---idMain1--rb2").getClientRects()[0].y +
					getIndicatorForElement(aIndicators, "Comp1---idMain1--rb2").getClientRects()[0].height / 2
				);
				var iXPosIndicator2 = _round(getIndicatorForElement(aIndicators, "Comp1---idMain1--rb2").getClientRects()[0].x);
				assert.ok(
					(iYPosIndicator1 === iYPosIndicator2) && (iXPosIndicator1 < iXPosIndicator2),
					`When two indicators have the same Y-Position, the X-Position is used for sort${
						iYPosIndicator1}${iXPosIndicator1}${iYPosIndicator2}${iXPosIndicator2}`
				);

				assert.ok(
					getIndicatorForElement(aIndicators, "Comp1---idMain1--rb1").tabIndex <
					getIndicatorForElement(aIndicators, "Comp1---idMain1--rb2").tabIndex,
					"the first indicator has lower tabIndex than the second one"
				);
				assert.ok(
					getIndicatorForElement(aIndicators, "Comp1---idMain1--rb2").tabIndex <
					getIndicatorForElement(aIndicators, "Comp1---idMain1--Label1").tabIndex,
					"the second indicator has lower tabIndex than the third one"
				);
				// Overlay 1 has lowest x/y-position, thus should be focused first
				assert.strictEqual(
					getIndicatorForElement(aIndicators, "Comp1---idMain1--rb1"),
					document.activeElement,
					"the indicators are sorted and the first is focused"
				);
			}.bind(this));
		});

		QUnit.test("when the visualization is started and an indicator is clicked", function(assert) {
			var fnDone = assert.async();
			var iInitialTabindex;
			var oChangeIndicator;
			prepareChanges([
				createMockChange("testRename", "rename", "Comp1---idMain1--Label1"),
				createMockChange("testReveal", "reveal", "Comp1---idMain1--rb2"),
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1")
			]);
			return startRta.call(this)
			.then(startVisualization.bind(this, this.oRta))
			.then(function() {
				this.oChangeVisualization.onChangeCategorySelection(prepareMockEvent(ChangeCategories.ALL));
				[oChangeIndicator] = collectIndicatorReferences();
				iInitialTabindex = oChangeIndicator.getDomRef().getAttribute("tabindex");
				var oOpenPopoverPromise = waitForMethodCall(oChangeIndicator, "setAggregation");
				QUnitUtils.triggerEvent("click", oChangeIndicator.getDomRef());

				return oOpenPopoverPromise;
			}.bind(this)).then(function() {
				var oPopover = oChangeIndicator.getAggregation("_popover");
				function onPopoverClosed() {
					assert.strictEqual(
						oChangeIndicator.getDomRef().getAttribute("tabindex"),
						iInitialTabindex,
						"then the original tab index is restored after the popover was closed"
					);
					fnDone();
				}
				oPopover.attachEventOnce("afterClose", onPopoverClosed);

				async function onPopoverOpened() {
					// Trigger rerendering which will remove tab indices
					await nextUIUpdate();
					oPopover.close();
				}

				if (oPopover.isOpen()) {
					onPopoverOpened();
				} else {
					oPopover.attachEventOnce("afterOpen", onPopoverOpened);
				}
			});
		});

		QUnit.test("when the visualization is started and application is scrolled down", function(assert) {
			var fnDone = assert.async();
			// Decrease fixture height to test scrolling
			document.getElementById("qunit-fixture").style = "height: 600px; top: 0";
			prepareChanges([
				createMockChange("testRename", "rename", "Comp1---idMain1--rb2"),
				createMockChange("testRenameBelow", "rename", "Comp1---idMain1--Label1")
			]);
			return startRta.call(this)
			.then(function() {
				var oScrollContainerOverlay = OverlayRegistry.getOverlay("Comp1---idMain1--mainPage");
				oScrollContainerOverlay.getChildren()[0].attachEventOnce("scrollSynced", function() {
					startVisualization(this.oRta)
					.then(function() {
						var aIndicators = collectIndicatorReferences();
						assert.strictEqual(
							getIndicatorForElement(aIndicators, "Comp1---idMain1--Label1"),
							document.activeElement,
							"the indicator inside the currently visible area is focused"
						);
						document.getElementById("qunit-fixture").style = "height: 100%; top: auto";
						fnDone();
					});
				}.bind(this));
				document.getElementById("Comp1---idMain1--mainPage-cont").scroll({top: 800});
			}.bind(this));
		});

		QUnit.test("when a change indicator is hovered/focused", function(assert) {
			var oChangeIndicator;
			prepareChanges([
				createMockChange("testRename", "rename", "Comp1---idMain1--Label1")
			]);
			return startRta.call(this)
			.then(startVisualization.bind(this, this.oRta))
			.then(function() {
				[oChangeIndicator] = collectIndicatorReferences();
				var oChangeIndicatorElement = oChangeIndicator.getDomRef();
				var oOverlay = Element.getElementById(oChangeIndicator.getOverlayId());

				function checkOnClass() {
					assert.ok(
						oOverlay.getDomRef().classList.contains("sapUiRtaChangeIndicatorHovered"),
						"then the overlay has the correct style class"
					);
				}

				function checkOffClass() {
					assert.notOk(
						oOverlay.getDomRef().classList.contains("sapUiRtaChangeIndicatorHovered"),
						"then the style class was removed"
					);
				}

				oChangeIndicatorElement.addEventListener("mouseover", checkOnClass.bind(this));
				oChangeIndicatorElement.dispatchEvent(new MouseEvent("mouseover"));
				oChangeIndicatorElement.addEventListener("mouseout", checkOffClass.bind(this));
				oChangeIndicatorElement.dispatchEvent(new MouseEvent("mouseout"));

				oChangeIndicatorElement.addEventListener("focusin", checkOnClass.bind(this));
				oChangeIndicatorElement.dispatchEvent(new Event("focusin"));
				oChangeIndicatorElement.addEventListener("focusout", checkOffClass.bind(this));
				oChangeIndicatorElement.dispatchEvent(new Event("focusout"));
			}.bind(this));
		});

		QUnit.test("when a change indicator with a related indicator (two display controls for the same change) is hovered/focused", async function(assert) {
			function checkOnClasses(oHoveredOverlay, oRelatedIndicatorOverlay) {
				assert.ok(
					oHoveredOverlay.getDomRef().classList.contains("sapUiRtaChangeIndicatorHovered"),
					"then the overlay has the correct style class"
				);
				assert.ok(
					oRelatedIndicatorOverlay.getDomRef().classList.contains("sapUiRtaChangeIndicatorHovered"),
					"then the related overlay has the correct style class"
				);
			}

			function checkOffClasses(oHoveredOverlay, oRelatedIndicatorOverlay) {
				assert.notOk(
					oHoveredOverlay.getDomRef().classList.contains("sapUiRtaChangeIndicatorHovered"),
					"then the style class was removed"
				);
				assert.notOk(
					oRelatedIndicatorOverlay.getDomRef().classList.contains("sapUiRtaChangeIndicatorHovered"),
					"then the style class was removed from the related overlay"
				);
			}

			const aDisplayControls = ["Comp1---idMain1--rb1", "Comp1---idMain1--bar"];
			const oChangeHandler = {
				getChangeVisualizationInfo() {
					return {
						displayControls: aDisplayControls,
						affectedControls: ["Comp1---idMain1--rb1"]
					};
				}
			};
			prepareChanges([
				createMockChange("testRename", "rename", "Comp1---idMain1--rb1")
			], undefined, oChangeHandler);

			await startRta.call(this);

			this.oRta._oDesignTime.getSelectionManager().setConnectedElements({
				"Comp1---idMain1--rb1": "Comp1---idMain1--bar",
				"Comp1---idMain1--bar": "Comp1---idMain1--rb1"
			});
			await startVisualization(this.oRta);

			const aChangeIndicators = collectIndicatorReferences();
			const oHoveredIndicator = aChangeIndicators[0];
			const oRelatedIndicator = aChangeIndicators[1];
			const oHoveredIndicatorElement = oHoveredIndicator.getDomRef();
			const oHoveredOverlay = Element.getElementById(oHoveredIndicator.getOverlayId());
			const oRelatedIndicatorOverlay = Element.getElementById(oRelatedIndicator.getOverlayId());

			oHoveredIndicatorElement.addEventListener("mouseover", () => checkOnClasses(oHoveredOverlay, oRelatedIndicatorOverlay));
			oHoveredIndicatorElement.dispatchEvent(new MouseEvent("mouseover"));

			oHoveredIndicatorElement.addEventListener("mouseout", () => checkOffClasses(oHoveredOverlay, oRelatedIndicatorOverlay));
			oHoveredIndicatorElement.dispatchEvent(new MouseEvent("mouseout"));

			oHoveredIndicatorElement.addEventListener("focusin", () => checkOnClasses(oHoveredOverlay, oRelatedIndicatorOverlay));
			oHoveredIndicatorElement.dispatchEvent(new Event("focusin"));

			oHoveredIndicatorElement.addEventListener("focusout", () => checkOffClasses(oHoveredOverlay, oRelatedIndicatorOverlay));
			oHoveredIndicatorElement.dispatchEvent(new Event("focusout"));

			// When the detail popover opens, the connected overlays must be highlighted
			const oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
			this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
			await oOpenPopoverPromise;

			await nextUIUpdate();
			checkOnClasses(oHoveredOverlay, oRelatedIndicatorOverlay);
		});

		QUnit.test("overlay focusability", async function(assert) {
			prepareChanges([
				createMockChange("testRename", "rename", "Comp1---idMain1--Label1")
			]);
			await startRta.call(this);
			await startVisualization.call(this, this.oRta);
			this.oChangeVisualization.onChangeCategorySelection(prepareMockEvent(ChangeCategories.ALL));
			await nextUIUpdate();
			const oOverlayWithChange = OverlayRegistry.getOverlay("Comp1---idMain1--Label1");
			assert.strictEqual(oOverlayWithChange.getFocusable(), true, "then in CViz the overlay with a change is focusable");
			const oOverlayWithoutChange = OverlayRegistry.getOverlay("Comp1---idMain1--rb2");
			assert.strictEqual(
				oOverlayWithoutChange.getFocusable(),
				false,
				"then in CViz the overlay without a change is not focusable"
			);
			await stopVisualization.call(this, this.oRta);
			assert.strictEqual(
				oOverlayWithChange.getFocusable(),
				true,
				"then back in adaptation mode the overlay with change is still focusable"
			);
			assert.strictEqual(
				oOverlayWithoutChange.getFocusable(),
				true,
				"then back in adaptation mode the overlay without change is focusable again"
			);
		});
	});

	QUnit.module("On Save", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				flexSettings: this.oFlexSettings
			});
			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta))
			.then(function() {
				this.oRootControlOverlay = OverlayRegistry.getOverlay(oComp);
				this.oChangeVisualization = this.oRta.getChangeVisualization();
				this.oToolbar = this.oRta.getToolbar();
				return startVisualization(this.oRta);
			}.bind(this))
			.then(function() {
				this.oRta.setMode("navigation");
			}.bind(this));
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when save is triggered during cViz", function(assert) {
			var oResetSpy = sandbox.spy(ChangeIndicatorRegistry.prototype, "reset");
			var oSelectStateChangeSpy = sandbox.spy(ChangeVisualization.prototype, "_selectChangeState");
			var oMenuModelUpdateSpy = sandbox.spy(ChangeVisualization.prototype, "_updateVisualizationModelMenuData");
			this.oChangeVisualization.updateAfterSave(this.oToolbar);
			return startVisualization(this.oRta).then(function() {
				this.oChangeVisualization.onChangeCategorySelection(prepareMockEvent(ChangeCategories.ALL));
				assert.ok(oResetSpy.called, "then changeIndicatorRegistry gets reset");
				assert.ok(oSelectStateChangeSpy.called, "then selected changeState gets reset");
				assert.ok(oMenuModelUpdateSpy.called, "then the menu model gets updated");
				var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
				this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
				return oOpenPopoverPromise;
			}.bind(this))
			.then(function() {
				assert.strictEqual(
					this.oChangeVisualization.getAggregation("popover").getContent()[0].getSelectedKey(),
					ChangeStates.ALL,
					"then the 'ALL' option is selected for the change state");
			}.bind(this));
		});
	});

	QUnit.module("On Version Change", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			prepareChanges([
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1")
			]);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				flexSettings: this.oFlexSettings
			});
			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta))
			.then(function() {
				this.oRootControlOverlay = OverlayRegistry.getOverlay(oComp);
				this.oChangeVisualization = this.oRta.getChangeVisualization();
				this.oToolbar = this.oRta.getToolbar();
			}.bind(this));
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when a new version has been activated", function(assert) {
			var oResetSpy = sandbox.spy(ChangeIndicatorRegistry.prototype, "reset");
			var oVersionsModelStub = sandbox.stub(ChangeVisualization.prototype, "setVersionsModel");
			oVersionsModelStub.callsFake(function() {
				this.oChangeVisualization.oVersionsModel = {
					getData() {
						return {
							versioningEnabled: true,
							displayedVersion: 2
						};
					}
				};
			}.bind(this));
			return startVisualization(this.oRta).then(async function() {
				this.oChangeVisualization.onChangeCategorySelection(prepareMockEvent(ChangeCategories.ALL));
				await nextUIUpdate();
				assert.ok(oResetSpy.called, "then changeIndicatorRegistry gets reset");
			}.bind(this));
		});
	});

	QUnit.module("Cleanup", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			prepareChanges([
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1")
			]);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				flexSettings: this.oFlexSettings
			});
			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta))
			.then(function() {
				this.oRootControlOverlay = OverlayRegistry.getOverlay(oComp);
				this.oChangeVisualization = this.oRta.getChangeVisualization();
				this.oToolbar = this.oRta.getToolbar();
				return startVisualization(this.oRta);
			}.bind(this))
			.then(async function() {
				this.oChangeVisualization.onChangeCategorySelection(prepareMockEvent(ChangeCategories.ALL));
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when the change visualization is destroyed", function(assert) {
			var oDeletionSpy = sandbox.spy(collectIndicatorReferences()[0], "destroy");
			this.oChangeVisualization.destroy();
			assert.ok(oDeletionSpy.called, "then change indicators are destroyed as well");
			assert.strictEqual(collectIndicatorReferences().length, 0, "then all indicators are removed from the UI");
		});

		QUnit.test("when the change visualization is created a second time", async function(assert) {
			this.oRta.setMode("adaptation");
			await nextUIUpdate();
			return startVisualization(this.oRta).then(async function() {
				this.oChangeVisualization.onChangeCategorySelection(prepareMockEvent(ChangeCategories.ALL));
				await nextUIUpdate();
				assert.strictEqual(collectIndicatorReferences().length, 1, "then indicators are created again");
				this.oChangeVisualization.destroy();
			}.bind(this));
		});

		QUnit.test("when the root control id changes", function(assert) {
			var oDeletionSpy = sandbox.spy(collectIndicatorReferences()[0], "destroy");
			this.oChangeVisualization.setRootControlId("someOtherId");
			assert.ok(oDeletionSpy.called, "then old change indicators are destroyed");
			this.oChangeVisualization.destroy();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});