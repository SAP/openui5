/*global QUnit*/

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/util/changeVisualization/ChangeVisualization",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/Utils",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/Button",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/base/util/restricted/_merge",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/core/Core"
], function(
	RtaQunitUtils,
	sinon,
	QUnitUtils,
	ChangeVisualization,
	PersistenceWriteAPI,
	ChangesWriteAPI,
	ChangesUtils,
	FlUtils,
	VBox,
	HBox,
	Button,
	DesignTime,
	DesignTimeMetadata,
	merge,
	RuntimeAuthoring,
	OverlayRegistry,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oRtaResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");
	var oComp;
	var oCompCont;
	QUnit.config.fixture = null;

	var oComponentPromise = RtaQunitUtils.renderTestAppAtAsync("qunit-fixture")
		.then(function(oCompContainer) {
			oCompCont = oCompContainer;
			oComp = oCompCont.getComponentInstance();
		});

	function setupTest(fnCallback, oRootElement) {
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
		oCore.applyChanges();

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
			getSource: function() {
				return {
					getBindingContext: function(sParameterName) {
						if (sParameterName === "visualizationModel") {
							return {
								getObject: function() {
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
		assert.strictEqual(oModelPart.count, oCheckValues.count, "there are no changes for this category available");
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
		oLoadComponentStub.returns(Object.assign(
			{
				createId: function(sId) {
					return sId;
				}
			},
			oRootComponent
		));
		sandbox.stub(ChangesUtils, "getControlIfTemplateAffected")
			.callsFake(function(oChange, oControl) {
				return {
					control: oControl
				};
			});
		sandbox.stub(FlUtils, "getViewForControl").returns();
		var oMergedChangeHandler = Object.assign(
			{
				getChangeVisualizationInfo: function() { }
			},
			oChangeHandler
		);
		sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves(oMergedChangeHandler);
	}

	function createMockChange(sId, sCommandName, sSelectorId, oCustomChange) {
		return merge({
			getSelector: function() {
				return sSelectorId;
			},
			getId: function() {
				return sId;
			},
			getFileType: function() {
				return "change";
			},
			getDefinition: function() {
				return {
					support: {
						command: sCommandName
					}
				};
			},
			getCreation: function() {
				return new Date();
			},
			getChangeType: function() { return "changeType"; },
			getLayer: function() { return "layer"; }
		}, oCustomChange);
	}

	function waitForMethodCall(oObject, sMethodName) {
		// Returns a promise which is resolved with the return value
		// of the given method after it was first called
		// Doesn't work with event handlers
		return new Promise(function(resolve) {
			sandbox.stub(oObject, sMethodName)
				.callsFake(function() {
					var oResult = oObject[sMethodName].wrappedMethod.apply(this, arguments);
					resolve(oResult);
				});
		})
			.then(function() {
				oObject[sMethodName].restore();
			});
	}

	function collectIndicatorReferences() {
		// Get all visible change indicator elements on the screen
		return Array.from(document.getElementsByClassName("sapUiRtaChangeIndicator")).map(function(oDomRef) {
			return oCore.byId(oDomRef.id);
		});
	}

	QUnit.module("Change Viz - Menu Button & Model Test", {
		before: function() {
			return oComponentPromise;
		},
		beforeEach: function() {
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
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1"),
				createMockChange("testReveal", "reveal", "Comp1---idMain1--rb2"),
				createMockChange("testRename", "rename", "Comp1---idMain1--lb1")
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
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("Without changes - Check if Menu is bound correctly to the model", function(assert) {
			this.oRta.setMode("visualization");
			return waitForMethodCall(this.oRta.getToolbar(), "setModel")
				.then(function() {
					oCore.applyChanges();
					var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
					this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
					return oOpenPopoverPromise;
				}.bind(this))
				.then(function() {
					var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().commandCategories;
					assert.notOk(this.oChangeVisualization.getAggregation("popover").getContent()[0].getVisible(), "Hidden Info Message is invisible");
					var aMenuItems = this.oChangeVisualization.getAggregation("popover").getContent()[1].getItems();
					checkModel(assert, aVizModel[0], this.oCheckModelAll);
					checkModel(assert, aVizModel[2], this.oCheckModelMove);
					checkBinding(assert, aVizModel[0], aMenuItems[0]);
					checkBinding(assert, aVizModel[2], aMenuItems[2]);
				}.bind(this));
		});
		QUnit.test("With changes - Check if Menu is bound correctly to the model", function(assert) {
			prepareChanges(this.aMockChanges);
			this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [3]);
			this.oCheckModelAll.count = 3;
			this.oRta.setMode("visualization");
			return waitForMethodCall(this.oRta.getToolbar(), "setModel")
				.then(function() {
					oCore.applyChanges();
					var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
					this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
					return oOpenPopoverPromise;
				}.bind(this))
				.then(function() {
					var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().commandCategories;
					assert.notOk(this.oChangeVisualization.getAggregation("popover").getContent()[0].getVisible(), "Hidden Info Message is invisible");
					var aMenuItems = this.oChangeVisualization.getAggregation("popover").getContent()[1].getItems();
					checkModel(assert, aVizModel[0], this.oCheckModelAll);
					checkModel(assert, aVizModel[2], this.oCheckModelMove);
					checkBinding(assert, aVizModel[0], aMenuItems[0]);
					checkBinding(assert, aVizModel[2], aMenuItems[2]);
				}.bind(this));
		});
		QUnit.test("With changes (Not all visible) - Check if Menu is bound correctly to the model", function(assert) {
			this.aMockChanges.push(createMockChange("testRename2", "rename", "Comp1---idMain1--test"));
			prepareChanges(this.aMockChanges);
			this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [3]);
			this.oCheckModelAll.count = 3;
			this.oCheckModelAll.tooltip = oRtaResourceBundle.getText("TOOLTIP_CHANGEVISUALIZATION_OVERVIEW_ADDITIONAL_CHANGES");
			this.oRta.setMode("visualization");
			return waitForMethodCall(this.oRta.getToolbar(), "setModel")
				.then(function() {
					oCore.applyChanges();
					var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
					this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
					return oOpenPopoverPromise;
				}.bind(this))
				.then(function() {
					var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().commandCategories;
					assert.ok(this.oChangeVisualization.getAggregation("popover").getContent()[0].getVisible(), "Hidden Info Message is visible");
					var aMenuItems = this.oChangeVisualization.getAggregation("popover").getContent()[1].getItems();
					checkModel(assert, aVizModel[0], this.oCheckModelAll);
					checkModel(assert, aVizModel[2], this.oCheckModelMove);
					checkBinding(assert, aVizModel[0], aMenuItems[0]);
					checkBinding(assert, aVizModel[2], aMenuItems[2]);
				}.bind(this));
		});
		QUnit.test("With changes (Not all supported) - Check if Menu is bound correctly to the model", function(assert) {
			this.aMockChanges.push(createMockChange("testAddColumn", "addColumn", "Comp1---idMain1--lb1"));
			prepareChanges(this.aMockChanges);
			this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [3]);
			this.oCheckModelAll.count = 3;
			this.oCheckModelAll.tooltip = oRtaResourceBundle.getText("TOOLTIP_CHANGEVISUALIZATION_OVERVIEW_ADDITIONAL_CHANGES");
			this.oRta.setMode("visualization");
			return waitForMethodCall(this.oRta.getToolbar(), "setModel")
				.then(function() {
					oCore.applyChanges();
					var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
					this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
					return oOpenPopoverPromise;
				}.bind(this))
				.then(function() {
					var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().commandCategories;
					assert.ok(this.oChangeVisualization.getAggregation("popover").getContent()[0].getVisible(), "Hidden Info Message is visible");
					var aMenuItems = this.oChangeVisualization.getAggregation("popover").getContent()[1].getItems();
					checkModel(assert, aVizModel[0], this.oCheckModelAll);
					checkModel(assert, aVizModel[2], this.oCheckModelMove);
					checkBinding(assert, aVizModel[0], aMenuItems[0]);
					checkBinding(assert, aVizModel[2], aMenuItems[2]);
				}.bind(this));
		});
		QUnit.test("With changes (Change gets invisible) - Check if Menu is bound correctly to the model", function(assert) {
			prepareChanges(this.aMockChanges);
			this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [3]);
			this.oCheckModelAll.count = 3;
			this.oRta.setMode("visualization");
			return waitForMethodCall(this.oRta.getToolbar(), "setModel")
				.then(function() {
					oCore.applyChanges();
					var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
					this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
					return oOpenPopoverPromise;
				}.bind(this))
				.then(function() {
					var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().commandCategories;
					assert.notOk(this.oChangeVisualization.getAggregation("popover").getContent()[0].getVisible(), "Hidden Info Message is invisible");
					var aMenuItems = this.oChangeVisualization.getAggregation("popover").getContent()[1].getItems();
					checkModel(assert, aVizModel[0], this.oCheckModelAll);
					checkModel(assert, aVizModel[2], this.oCheckModelMove);
					checkBinding(assert, aVizModel[0], aMenuItems[0]);
					checkBinding(assert, aVizModel[2], aMenuItems[2]);
					sap.ui.dt.OverlayRegistry.getOverlay("Comp1---idMain1--rb2").destroy();
					this.oChangeVisualization.getAggregation("popover").close();
					this.oRta.setMode("navigation");
					oCore.applyChanges();
					this.oRta.setMode("visualization");
					return waitForMethodCall(this.oRta.getToolbar(), "setModel");
				}.bind(this))
				.then(function() {
					this.oCheckModelAll.title = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL", [2]);
					this.oCheckModelAll.count = 2;
					this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
					oCore.applyChanges();
					var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().commandCategories;
					assert.ok(this.oChangeVisualization.getAggregation("popover").getContent()[0].getVisible(), "Hidden Info Message is visible");
					var aMenuItems = this.oChangeVisualization.getAggregation("popover").getContent()[1].getItems();
					checkModel(assert, aVizModel[0], this.oCheckModelAll);
					checkModel(assert, aVizModel[2], this.oCheckModelMove);
					checkBinding(assert, aVizModel[0], aMenuItems[0]);
					checkBinding(assert, aVizModel[2], aMenuItems[2]);
				}.bind(this));
		});
		QUnit.test("Menu & Model are in correct order", function(assert) {
			var fnDone = assert.async();
			waitForMethodCall(this.oRta.getToolbar(), "setModel")
				.then(function() {
					oCore.applyChanges();
					var oOpenPopoverPromise = waitForMethodCall(this.oChangeVisualization, "setAggregation");
					this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").firePress();
					return oOpenPopoverPromise;
				}.bind(this))
				.then(function() {
					var aMenuItems = this.oChangeVisualization.getAggregation("popover").getModel("visualizationModel").getData().commandCategories;
					assert.strictEqual(aMenuItems[0].key, "all", "'all' is on first position");
					assert.strictEqual(aMenuItems[1].key, "add", "'add' is on second position");
					assert.strictEqual(aMenuItems[2].key, "move", "'move' is on third position");
					assert.strictEqual(aMenuItems[3].key, "rename", "'rename' is on fourth position");
					assert.strictEqual(aMenuItems[4].key, "combinesplit", "'combinesplit' is on fifth position");
					assert.strictEqual(aMenuItems[5].key, "remove", "'remove' is on sixth position");
					fnDone();
				}.bind(this));
			this.oRta.setMode("visualization");
		});
		QUnit.test("Menu Button Text will change on category selection", function(assert) {
			var fnDone = assert.async();
			var sMenuButtonText;
			waitForMethodCall(this.oRta.getToolbar(), "setModel")
				.then(function() {
					oCore.applyChanges();
					sMenuButtonText = this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").getText();
					assert.strictEqual(sMenuButtonText, oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_OVERVIEW_ALL"));
					return this.oChangeVisualization.onCommandCategorySelection(prepareMockEvent("move"));
				}.bind(this))
				.then(function() {
					oCore.applyChanges();
					sMenuButtonText = this.oRta.getToolbar().getControl("toggleChangeVisualizationMenuButton").getText();
					assert.equal(sMenuButtonText, oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_OVERVIEW_MOVE"));
					fnDone();
				}.bind(this));
			this.oRta.setMode("visualization");
		});
	});

	QUnit.module("Command type detection", {
		beforeEach: function(assert) {
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
		afterEach: function() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when the command type is not defined in the change", function(assert) {
			var fnDone = assert.async();
			// Stub getCommandName to simulate special usecases
			var oGetCommandNameStub = sandbox.stub(DesignTimeMetadata.prototype, "getCommandName");
			oGetCommandNameStub.callsFake(function(sChangeType, oElement, sAggregationName) {
				// For simplicity, lookup known change types by element id
				// and combination of aggregation name and change type name
				var sIdentifier = (sAggregationName ? sAggregationName + " " : "") + sChangeType;
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
				return oMockResponse || DesignTimeMetadata.prototype.getCommandName.wrappedMethod.apply(this, arguments);
			});

			// Changes have no command name defined as it is the case for pre 1.84 changes
			prepareChanges([
				// For case 1:
				createMockChange("testChange1", undefined, "ctdbutton1", {
					getChangeType: function() {
						return "someRenameChangeType";
					},
					getDependentSelectorList: function() {
						return ["ctdbutton1"];
					}
				}),
				// For case 2:
				createMockChange("testChange2", undefined, "nestedContainer1", {
					getChangeType: function() {
						return "someAddChangeType";
					},
					getDependentSelectorList: function() {
						return ["nestedContainer1", "ctdbutton2"];
					}
				}),
				// For case 3:
				createMockChange("testChange3", undefined, "nestedContainer1", {
					getChangeType: function() {
						return "someMoveChangeType";
					},
					getDependentSelectorList: function() {
						// nestedContainer2 is not part of the dependent selectors
						return ["nestedContainer1", "ctdbutton3"];
					}
				})
			]);
			this.oChangeVisualization.triggerModeChange("MockComponent", {
				getControl: function() { },
				setModel: function(oData) {
					assert.strictEqual(
						oData.getData().commandCategories[3].count,
						1,
						"then changes where the command is defined on the element are properly categorized"
					);
					assert.strictEqual(
						oData.getData().commandCategories[1].count,
						1,
						"then changes where the command is defined on the element are properly categorized"
					);
					assert.strictEqual(
						oData.getData().commandCategories[2].count,
						1,
						"then changes where the command is defined on the element are properly categorized"
					);
					fnDone();
				}
			});
		});
	});

	QUnit.module("Change indicator management", {
		before: function() {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.aMockChanges = [
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1"),
				createMockChange("testReveal", "reveal", "Comp1---idMain1--rb2"),
				createMockChange("testRename", "rename", "Comp1---idMain1--lb1")
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
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when a command category is selected", function(assert) {
			var fnDone = assert.async();
			prepareChanges(this.aMockChanges);
			this.oRta.setMode("visualization");
			waitForMethodCall(this.oRta.getToolbar(), "setModel")
				.then(function() {
					oCore.applyChanges();
					//startChangeVisualization(this.oVisualizationButton, this.oChangeVisualization);
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
					fnDone();
				});
		});

		QUnit.test("when change visualization is deactivated and activated again", function(assert) {
			var fnDone = assert.async();
			prepareChanges(this.aMockChanges);
			this.oRta.setMode("visualization");
			waitForMethodCall(this.oRta.getToolbar(), "setModel")
				.then(function() {
					oCore.applyChanges();
					assert.strictEqual(
						collectIndicatorReferences().filter(function(oIndicator) {
							return oIndicator.getVisible();
						}).length,
						3,
						"then all indicators are visible before deactivation"
					);

					// Deactivate
					this.oChangeVisualization.setIsActive(false);
					oCore.applyChanges();
					assert.strictEqual(
						collectIndicatorReferences().filter(function(oIndicator) {
							return oIndicator.getVisible();
						}).length,
						0,
						"then all indicators are hidden after deactivation"
					);

					// Activate again and select a different category
					return this.oChangeVisualization.onCommandCategorySelection(prepareMockEvent("add"))
						.then(function() {
							this.oChangeVisualization.setIsActive(true);
							oCore.applyChanges();
							assert.strictEqual(
								collectIndicatorReferences().filter(function(oIndicator) {
									return oIndicator.getVisible();
								}).length,
								2,
								"then all indicators are visible again after reactivation"
							);
							fnDone();
						}.bind(this));
				}.bind(this));
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
					var oMouseEvent = new Event("click");
					oRootOverlay.getDomRef().dispatchEvent(oMouseEvent);
					assert.ok(fnClickSpy.called, "then the click event handler is added to the Root Overlay DomRef");
					fnDone();
				}.bind(this));
			this.oChangeVisualization.triggerModeChange("Comp1", this.oRta.getToolbar());
		});

		QUnit.test("when ChangeVisualization is active and mode change is triggered", function(assert) {
			var fnDone = assert.async();
			prepareChanges(this.aMockChanges);
			this.oRta.setMode("visualization");
			oCore.applyChanges();
			var fnClickSpy = sandbox.spy(this.oChangeVisualization, "_fnOnClickHandler");
			assert.strictEqual(this.oChangeVisualization.getIsActive(), true, "then the ChangeVisualization was active before");
			waitForMethodCall(this.oChangeVisualization, "triggerModeChange")
				.then(function() {
					assert.strictEqual(this.oChangeVisualization.getIsActive(), false, "then the ChangeVisualization is inactive afterwards");
					var oRootOverlay = OverlayRegistry.getOverlay("Comp1");
					var oMouseEvent = new Event("click");
					oRootOverlay.getDomRef().dispatchEvent(oMouseEvent);
					assert.notOk(fnClickSpy.called, "then the click event handler was removed from the Root Overlay DomRef");
					fnDone();
				}.bind(this));
			this.oChangeVisualization.triggerModeChange("Comp1", this.oRta.getToolbar());
		});

		QUnit.test("when changes have different fileTypes", function(assert) {
			var aMockChanges = [
				createMockChange("newCtrlVariant", undefined, "ctrlVariant", {
					getFileType: function() {
						return "ctrl_variant";
					}
				}),
				createMockChange("newVariant", undefined, "variant", {
					getFileType: function() {
						return "variant";
					}
				}),
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1"),
				createMockChange("testReveal", "reveal", "Comp1---idMain1--rb2")
			];
			prepareChanges(aMockChanges);
			this.oRta.setMode("visualization");
			return waitForMethodCall(this.oRta.getToolbar(), "setModel")
				.then(function() {
					oCore.applyChanges();
					assert.strictEqual(
						this.oRta.getToolbar().getModel("visualizationModel").getData().commandCategories[0].count,
						2,
						"then only changes with the fileType \"change\" are applied and visible"
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
					getChangeVisualizationInfo: function(oChange) {
						return {
							dependentControls: [oCore.byId("Comp1---idMain1--rb2")], // Test if vis can handle elements
							affectedControls: [oChange.getSelector()] // Test if vis can handle IDs
						};
					}
				}
			);
			return this.oChangeVisualization.onCommandCategorySelection(prepareMockEvent("all"))
				.then(function() {
					this.oRta.setMode("visualization");
					return waitForMethodCall(this.oToolbar, "setModel");
				}.bind(this))
				.then(function() {
					oCore.applyChanges();
					var oSelectChangePromise = waitForMethodCall(this.oChangeVisualization, "_selectChange");
					var oChangeIndicator = collectIndicatorReferences()[0];
					oChangeIndicator.fireSelectChange({
						changeId: oChangeIndicator.getChanges()[0].id
					});
					return oSelectChangePromise.then(function() {
						oCore.applyChanges();

						var oDependentOverlayDomRef = OverlayRegistry.getOverlay("Comp1---idMain1--rb2").getDomRef();
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
						return waitForMethodCall(oDependentOverlayDomRef.classList, "remove")
							.then(function() {
								oCore.applyChanges();
								assert.notOk(
									oDependentOverlayDomRef.className.split(" ").includes("sapUiRtaChangeIndicatorDependent"),
									"then the appropriate style class is removed"
								);
							});
					});
				}.bind(this));
		});

		QUnit.test("when ChangeVisualization is active and exits", function(assert) {
			this.oRta.setMode("visualization");
			var fnClickSpy = sandbox.spy(this.oChangeVisualization, "_fnOnClickHandler");
			this.oChangeVisualization.exit();
			assert.ok(this.oChangeVisualization._oChangeIndicatorRegistry._bIsBeingDestroyed, "then the ChangeIndicatorRegistry is destroyed");
			var oRootOverlay = OverlayRegistry.getOverlay("Comp1");
			var oMouseEvent = new Event("click");
			oRootOverlay.getDomRef().dispatchEvent(oMouseEvent);
			assert.notOk(fnClickSpy.called, "then the click event handler was removed from the Root Overlay DomRef");
		});
	});

	function getIndicatorForElement(aIndicators, sId) {
		return aIndicators.find(function(oIndicator) {
			return oIndicator.getSelectorId() === sId;
		}).getDomRef();
	}

	QUnit.module("Keyboard and focus handling", {
		before: function() {
			return oComponentPromise;
		},
		beforeEach: function(assert) {
			var fnDone = assert.async();
			prepareChanges([
				createMockChange("testRename", "rename", "Comp1---idMain1--Label1"),
				createMockChange("testReveal", "reveal", "Comp1---idMain1--rb2"),
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1")
			]);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				flexSettings: this.oFlexSettings
			});
			RtaQunitUtils.clear()
				.then(this.oRta.start.bind(this.oRta))
				.then(function() {
					this.oRootControlOverlay = OverlayRegistry.getOverlay(oComp);
					this.oChangeVisualization = this.oRta.getChangeVisualization();
					this.oToolbar = this.oRta.getToolbar();
					this.oRta.setMode("visualization");
					waitForMethodCall(this.oToolbar, "setModel");
				}.bind(this))
				.then(function() {
					return this.oChangeVisualization.onCommandCategorySelection(prepareMockEvent("all"));
				}.bind(this))
				.then(function() {
					oCore.applyChanges();
					fnDone();
				});
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when the visualization is started", function(assert) {
			var aIndicators = collectIndicatorReferences();
			var iYPosIndicator1 = getIndicatorForElement(aIndicators, "Comp1---idMain1--rb1").getClientRects()[0].y + getIndicatorForElement(aIndicators, "Comp1---idMain1--rb1").getClientRects()[0].height / 2;
			var iXPosIndicator1 = getIndicatorForElement(aIndicators, "Comp1---idMain1--rb1").getClientRects()[0].x;
			var iYPosIndicator2 = getIndicatorForElement(aIndicators, "Comp1---idMain1--rb2").getClientRects()[0].y + getIndicatorForElement(aIndicators, "Comp1---idMain1--rb2").getClientRects()[0].height / 2;
			var iXPosIndicator2 = getIndicatorForElement(aIndicators, "Comp1---idMain1--rb2").getClientRects()[0].x;
			assert.ok(
				(iYPosIndicator1 === iYPosIndicator2) && (iXPosIndicator1 < iXPosIndicator2),
				"When two indicators have the same Y-Position, the X-Position is used for sort"
			);

			assert.ok(
				getIndicatorForElement(aIndicators, "Comp1---idMain1--rb1").tabIndex < getIndicatorForElement(aIndicators, "Comp1---idMain1--rb2").tabIndex,
				"the first indicator has lower tabIndex than the second one"
			);
			assert.ok(
				getIndicatorForElement(aIndicators, "Comp1---idMain1--rb2").tabIndex < getIndicatorForElement(aIndicators, "Comp1---idMain1--Label1").tabIndex,
				"the second indicator has lower tabIndex than the third one"
			);
			// Overlay 1 has lowest x/y-position, thus should be focused first
			assert.strictEqual(
				getIndicatorForElement(aIndicators, "Comp1---idMain1--rb1"),
				document.activeElement,
				"the indicators are sorted and the first is focused"
			);
		});

		QUnit.test("when the visualization is started and an indicator is clicked", function(assert) {
			var fnDone = assert.async();
			var oChangeIndicator = collectIndicatorReferences()[0];
			var iInitialTabindex = oChangeIndicator.getDomRef().getAttribute("tabindex");
			var oOpenPopoverPromise = waitForMethodCall(oChangeIndicator, "setAggregation");
			QUnitUtils.triggerEvent("click", oChangeIndicator.getDomRef());

			oOpenPopoverPromise
				.then(function() {
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

					function onPopoverOpened() {
						// Trigger rerendering which will remove tab indices
						oCore.applyChanges();
						oPopover.close();
					}

					if (oPopover.isOpen()) {
						onPopoverOpened();
					} else {
						oPopover.attachEventOnce("afterOpen", onPopoverOpened);
					}
				});
		});
	});

	QUnit.module("Cleanup", {
		before: function() {
			return oComponentPromise;
		},
		beforeEach: function(assert) {
			var fnDone = assert.async();
			prepareChanges([
				createMockChange("testAdd", "addDelegateProperty", "Comp1---idMain1--rb1")
			]);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				flexSettings: this.oFlexSettings
			});
			RtaQunitUtils.clear()
				.then(this.oRta.start.bind(this.oRta))
				.then(function() {
					this.oRootControlOverlay = OverlayRegistry.getOverlay(oComp);
					this.oChangeVisualization = this.oRta.getChangeVisualization();
					this.oToolbar = this.oRta.getToolbar();
					this.oRta.setMode("visualization");
					waitForMethodCall(this.oToolbar, "setModel");
				}.bind(this))
				.then(function() {
					return this.oChangeVisualization.onCommandCategorySelection(prepareMockEvent("all"));
				}.bind(this))
				.then(function() {
					oCore.applyChanges();
					fnDone();
				});
		},
		afterEach: function() {
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

		QUnit.test("when the change visualization is created a second time", function(assert) {
			var fnDone = assert.async();
			this.oRta.setMode("adaptation");
			oCore.applyChanges();
			this.oRta.setMode("visualization");
			waitForMethodCall(this.oToolbar, "setModel")
				.then(function() {
					return this.oChangeVisualization.onCommandCategorySelection(prepareMockEvent("all"));
				}.bind(this))
				.then(function() {
					oCore.applyChanges();
					assert.strictEqual(collectIndicatorReferences().length, 1, "then indicators are created again");
					this.oChangeVisualization.destroy();
					fnDone();
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
		jQuery("#qunit-fixture").hide();
	});
});
