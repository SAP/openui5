/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/util/changeVisualization/ChangeVisualization",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/Utils",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/events/KeyCodes",
	"sap/base/util/restricted/_merge",
	"sap/ui/dt/DesignTime"
],
function(
	sinon,
	QUnitUtils,
	ChangeVisualization,
	Button,
	ButtonType,
	VBox,
	HBox,
	PersistenceWriteAPI,
	ChangesUtils,
	FlUtils,
	DesignTimeMetadata,
	KeyCodes,
	merge,
	DesignTime
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oRtaResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

	// Make sure to bind caller context
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
		sap.ui.getCore().applyChanges();

		this.oDesignTime = new DesignTime({
			rootElements: [this.oContainer]
		});

		this.oDesignTime.attachEventOnce("synced", function () {
			fnCallback();
		});
	}

	// Make sure to bind caller context
	function cleanupTest() {
		this.oChangeVisualization.destroy();
		this.oVisualizationButton.destroy();
		this.oContainer.destroy();
		sandbox.restore();
	}


	function prepareChanges (aMockChanges, oRootComponent, oChangeHandler) {
		// Stub changes, root component and change handler
		sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aMockChanges || []);
		var oLoadComponentStub = sandbox.stub(ChangeVisualization.prototype, "_getComponent");
		oLoadComponentStub.returns(Object.assign(
			{
				createId: function (sId) {
					return sId;
				}
			},
			oRootComponent
		));
		sandbox.stub(ChangesUtils, "getControlIfTemplateAffected")
			.callsFake(function (oChange, oControl) {
				return oControl;
			});
		sandbox.stub(FlUtils, "getViewForControl").returns();
		var oMergedChangeHandler = Object.assign(
			{
				getChangeVisualizationInfo: function () {}
			},
			oChangeHandler
		);
		sandbox.stub(ChangesUtils, "getChangeHandler").resolves(oMergedChangeHandler);
	}

	function createMockChange(sId, sCommandName, sSelectorId, oCustomChange) {
		return merge({
			getSelector: function () {
				return sSelectorId;
			},
			getId: function () {
				return sId;
			},
			getDefinition: function () {
				return {
					support: {
						command: sCommandName
					}
				};
			},
			getCreation: function () {
				return new Date();
			}
		}, oCustomChange);
	}

	function startChangeVisualization (oStartVisualizationButton, oChangeVisualization) {
		oStartVisualizationButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oMockEvent = {
			getParameter: function (sParameterName) {
				if (sParameterName === "id") {
					return oStartVisualizationButton.getId();
				}
			}
		};
		oChangeVisualization.toggleActive(oMockEvent);
	}

	function waitForMethodCall (oObject, sMethodName) {
		// Returns a promise which is resolved with the return value
		// of the given method after it was first called
		// Doesn't work with event handlers
		return new Promise(function (resolve) {
			sandbox.stub(oObject, sMethodName)
				.callsFake(function () {
					var oResult = oObject[sMethodName].wrappedMethod.apply(this, arguments);
					resolve(oResult);
				});
		})
			.then(function () {
				oObject[sMethodName].restore();
			});
	}

	function getChangesListEntry (oPopover, sKey) {
		// Get the given entry from the change list popover
		return oPopover.getContent()[0].getItems().find(function (oItem) {
			return oItem.getBindingContext("commandModel").getObject().key === sKey;
		});
	}

	function selectCommandCategory (oVisualizationButton, oChangeVisualization, sKeyToSelect) {
		// Simulate click event on the change visualization button,
		// select the given category and wait for the visualization to update
		var oSelectionPromise = waitForMethodCall(oChangeVisualization, "_selectCommandCategory");

		var fnWaitForPopover = function () {
			return new Promise(function (resolve) {
				var oPopover = oChangeVisualization.getPopover();
				oPopover.attachEventOnce("afterOpen", function () {
					var oCategoryButton = getChangesListEntry(oPopover, sKeyToSelect);
					QUnitUtils.triggerEvent("tap", oCategoryButton.getDomRef());
					resolve(oSelectionPromise);
				});
			});
		};

		var oPopoverPromise = oChangeVisualization.getPopover()
			? fnWaitForPopover()
			: waitForMethodCall(oChangeVisualization, "setPopover")
				.then(function () {
					return fnWaitForPopover();
				});

		startChangeVisualization(oVisualizationButton, oChangeVisualization);
		return oPopoverPromise;
	}

	function collectIndicatorReferences () {
		// Get all visible change indicator elements on the screen
		return Array.from(document.getElementsByClassName("sapUiRtaChangeIndicator")).map(function (oDomRef) {
			return sap.ui.getCore().byId(oDomRef.id);
		});
	}

	QUnit.module("Changes list popover", {
		beforeEach: function() {
			this.oChangeVisualization = new ChangeVisualization({
				rootControlId: "MockComponent"
			});
			this.oVisualizationButton = new Button({ text: "Test visualization" });
		},
		afterEach: function() {
			this.oChangeVisualization.destroy();
			this.oVisualizationButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the change visualization is started without changes", function (assert) {
			prepareChanges();
			startChangeVisualization(this.oVisualizationButton, this.oChangeVisualization);

			return waitForMethodCall(this.oChangeVisualization, "setPopover")
				.then(function () {
					var oPopover = this.oChangeVisualization.getPopover();
					assert.ok(oPopover.getVisible(), "then the change list popover is opened");
					var oAllCommandsCategory = getChangesListEntry(oPopover, "all");
					assert.strictEqual(
						oAllCommandsCategory.getTitle(),
						oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_ALL"),
						"then the categories have proper titles"
					);
					assert.strictEqual(
						oAllCommandsCategory.getCounter(),
						0,
						"then no changes are available in the list"
					);
					assert.strictEqual(
						oAllCommandsCategory.getType(),
						"Inactive",
						"then categories without changes are disabled"
					);
				}.bind(this));
		});

		QUnit.test("when the change visualization is started with changes", function (assert) {
			var aMockChanges = [
				createMockChange("testAdd", "addDelegateProperty"),
				createMockChange("testReveal", "reveal"),
				createMockChange("testRename", "rename")
			];
			prepareChanges(aMockChanges);
			startChangeVisualization(this.oVisualizationButton, this.oChangeVisualization);

			return waitForMethodCall(this.oChangeVisualization, "setPopover")
				.then(function () {
					var oPopover = this.oChangeVisualization.getPopover();
					assert.strictEqual(
						getChangesListEntry(oPopover, "all").getType(),
						"Active",
						"then categories with changes get enabled"
					);
					assert.strictEqual(
						getChangesListEntry(oPopover, "all").getCounter(),
						aMockChanges.length,
						"then the all category contains all changes"
					);
					assert.strictEqual(
						getChangesListEntry(oPopover, "add").getCounter(),
						2,
						"then both add changes are categorized properly"
					);
					assert.strictEqual(
						getChangesListEntry(oPopover, "rename").getCounter(),
						1,
						"then the rename change is categorized properly"
					);
				}.bind(this));
		});
	});

	QUnit.module("Command type detection", {
		beforeEach: function (assert) {
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
			setupTest.call(this, function () {
				fnDone();
			}, oContainer);
		},
		afterEach: function () {
			cleanupTest.call(this);
		}
	}, function () {
		QUnit.test("when the command type is not defined in the change", function (assert) {
			// Stub getCommandName to simulate special usecases
			var oGetCommandNameStub = sandbox.stub(DesignTimeMetadata.prototype, "getCommandName");
			oGetCommandNameStub.callsFake(function (sChangeType, oElement, sAggregationName) {
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
					getChangeType: function () {
						return "someRenameChangeType";
					},
					getDependentSelectorList: function () {
						return ["ctdbutton1"];
					}
				}),
				// For case 2:
				createMockChange("testChange2", undefined, "nestedContainer1", {
					getChangeType: function () {
						return "someAddChangeType";
					},
					getDependentSelectorList: function () {
						return ["nestedContainer1", "ctdbutton2"];
					}
				}),
				// For case 3:
				createMockChange("testChange3", undefined, "nestedContainer1", {
					getChangeType: function () {
						return "someMoveChangeType";
					},
					getDependentSelectorList: function () {
						// nestedContainer2 is not part of the dependent selectors
						return ["nestedContainer1", "ctdbutton3"];
					}
				})
			]);
			startChangeVisualization(this.oVisualizationButton, this.oChangeVisualization);

			return waitForMethodCall(this.oChangeVisualization, "setPopover")
				.then(function () {
					var oPopover = this.oChangeVisualization.getPopover();
					assert.strictEqual(
						getChangesListEntry(oPopover, "rename").getCounter(),
						1,
						"then changes where the command is defined on the element are properly categorized"
					);
					assert.strictEqual(
						getChangesListEntry(oPopover, "add").getCounter(),
						1,
						"then changes where the command is defined on the parent overlay are properly categorized"
					);
					assert.strictEqual(
						getChangesListEntry(oPopover, "move").getCounter(),
						1,
						"then changes where the command is defined on an overlay which was created during runtime are properly categorized"
					);
				}.bind(this));
		});
	});

	QUnit.module("Change indicator management", {
		beforeEach: function(assert) {
			var fnDone = assert.async();
			setupTest.call(this, function () {
				this.aMockChanges = [
					createMockChange("testAdd", "addDelegateProperty", "button1"),
					createMockChange("testReveal", "reveal", "button2"),
					createMockChange("testRename", "rename", "button3")
				];
				fnDone();
			}.bind(this));
		},
		afterEach: function() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when a command category is selected", function (assert) {
			prepareChanges(this.aMockChanges);
			return selectCommandCategory(this.oVisualizationButton, this.oChangeVisualization, "all")
				.then(function () {
					sap.ui.getCore().applyChanges();
					var aIndicators = collectIndicatorReferences();
					assert.strictEqual(
						aIndicators.length,
						3,
						"then all indicators are visible 1/2"
					);
					assert.ok(
						aIndicators.every(function (oIndicator) {
							return oIndicator.getVisible();
						}),
						"then all indicators are visible 2/2"
					);
				});
		});

		QUnit.test("when change visualization is deactivated and activated again", function (assert) {
			var fnDone = assert.async();
			prepareChanges(this.aMockChanges);
			selectCommandCategory(this.oVisualizationButton, this.oChangeVisualization, "all")
				.then(function () {
					sap.ui.getCore().applyChanges();
					assert.strictEqual(
						collectIndicatorReferences().filter(function (oIndicator) {
							return oIndicator.getVisible();
						}).length,
						3,
						"then all indicators are visible before deactivation"
					);
					assert.strictEqual(
						this.oVisualizationButton.getTooltip(),
						oRtaResourceBundle.getText("BUT_CHANGEVISUALIZATION_HIDECHANGES"),
						"then the tooltip is changed"
					);
					assert.strictEqual(
						this.oVisualizationButton.getType(),
						ButtonType.Emphasized,
						"then the button type is changed"
					);

					// Deactivate
					this.oChangeVisualization.toggleActive();
					sap.ui.getCore().applyChanges();
					assert.strictEqual(
						collectIndicatorReferences().filter(function (oIndicator) {
							return oIndicator.getVisible();
						}).length,
						0,
						"then all indicators are hidden after deactivation"
					);
					assert.strictEqual(
						this.oVisualizationButton.getTooltip(),
						oRtaResourceBundle.getText("BUT_CHANGEVISUALIZATION_SHOWCHANGES"),
						"then the tooltip is changed back"
					);
					assert.strictEqual(
						this.oVisualizationButton.getType(),
						ButtonType.Transparent,
						"then the button type is changed back"
					);

					var fnReactivate = function () {
						// Activate again and select a different category
						selectCommandCategory(this.oVisualizationButton, this.oChangeVisualization, "add")
							.then(function () {
								sap.ui.getCore().applyChanges();
								assert.strictEqual(
									collectIndicatorReferences().filter(function (oIndicator) {
										return oIndicator.getVisible();
									}).length,
									2,
									"then all indicators are visible again after reactivation"
								);
								fnDone();
							});
					}.bind(this);

					if (!this.oChangeVisualization.getPopover().isOpen()) {
						fnReactivate();
					} else {
						this.oChangeVisualization.getPopover().attachEventOnce("afterClose", fnReactivate);
					}
				}.bind(this));
		});

		QUnit.test("when details are selected for a change", function (assert) {
			prepareChanges(
				[createMockChange("testMove", "move", "button1")],
				undefined,
				{
					getChangeVisualizationInfo: function () {
						return {
							dependentControls: [sap.ui.getCore().byId("button2")], // Test if vis can handle elements
							affectedControls: ["button1"] // Test if vis can handle IDs
						};
					}
				}
			);
			return selectCommandCategory(this.oVisualizationButton, this.oChangeVisualization, "all")
				.then(function () {
					sap.ui.getCore().applyChanges();
					var oSelectChangePromise = waitForMethodCall(this.oChangeVisualization, "_selectChange");
					var oChangeIndicator = collectIndicatorReferences()[0];
					oChangeIndicator.fireSelectChange({
						changeId: oChangeIndicator.getChanges()[0].id
					});
					return oSelectChangePromise.then(function () {
						sap.ui.getCore().applyChanges();
						assert.strictEqual(
							collectIndicatorReferences().filter(function (oIndicator) {
								return oIndicator.getVisible();
							}).length,
							2,
							"then only the selected change and its dependent indicator are shown"
						);

						// Pressing right arrow key twice should focus selected element again
						// as there are two indicators
						QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ARROW_RIGHT);
						QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ARROW_RIGHT);
						assert.strictEqual(
							oChangeIndicator.getDomRef(),
							document.activeElement,
							"then the focus chain is updated"
						);
					});
				}.bind(this));
		});
	});

	function getIndicatorForElement (aIndicators, sId) {
		return aIndicators.find(function (oIndicator) {
			return oIndicator.getSelectorId() === sId;
		}).getDomRef();
	}

	QUnit.module("Keyboard and focus handling", {
		beforeEach: function(assert) {
			var oContainer = new VBox("container", {
				items: [
					new Button("topButton", {
						text: "First button"
					}),
					new HBox("nestedContainer", {
						items: [
							new Button("bottomLeftButton", {
								text: "Second button"
							}),
							new Button("bottomRightButton", {
								text: "Third button"
							})
						]
					})
				]
			});

			var fnDone = assert.async();
			setupTest.call(this, function () {
				// Pass changes in a mixed up order to check if they are properly sorted for tab handling
				prepareChanges([
					createMockChange("testAdd", "addDelegateProperty", "bottomRightButton"),
					createMockChange("testReveal", "reveal", "topButton"),
					createMockChange("testRename", "rename", "bottomLeftButton")
				]);
				selectCommandCategory(this.oVisualizationButton, this.oChangeVisualization, "all")
					.then(function () {
						sap.ui.getCore().applyChanges();
						fnDone();
					});
			}.bind(this), oContainer);
		},
		afterEach: function() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when the visualization is started", function (assert) {
			var aIndicators = collectIndicatorReferences();
			// Overlay 1 has lowest y, thus should be focused first
			assert.strictEqual(
				getIndicatorForElement(aIndicators, "topButton"),
				document.activeElement,
				"then the indicators are sorted and the first is focused"
			);
		});

		QUnit.test("when the Escape button is pressed", function (assert) {
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ESCAPE);
			sap.ui.getCore().applyChanges();
			assert.notOk(
				this.oChangeVisualization.getIsActive(),
				"then the visualization is stopped"
			);
			assert.strictEqual(
				collectIndicatorReferences().length,
				0,
				"then all indicators are hidden"
			);
		});

		QUnit.test("when LEFT, UP or SHIFT TAB are pressed", function (assert) {
			var aIndicators = collectIndicatorReferences();
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ARROW_LEFT);
			assert.strictEqual(
				getIndicatorForElement(aIndicators, "bottomRightButton"),
				document.activeElement,
				"then the previous indicator is focused 1/3"
			);
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ARROW_UP);
			assert.strictEqual(
				getIndicatorForElement(aIndicators, "bottomLeftButton"),
				document.activeElement,
				"then the previous indicator is focused 2/3"
			);
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.TAB, true);
			assert.strictEqual(
				getIndicatorForElement(aIndicators, "topButton"),
				document.activeElement,
				"then the previous indicator is focused 3/3"
			);
		});

		QUnit.test("when RIGHT, DOWN or TAB are pressed", function (assert) {
			var aIndicators = collectIndicatorReferences();
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ARROW_RIGHT);
			assert.strictEqual(
				getIndicatorForElement(aIndicators, "bottomLeftButton"),
				document.activeElement,
				"then the next indicator is focused 1/3"
			);
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN);
			assert.strictEqual(
				getIndicatorForElement(aIndicators, "bottomRightButton"),
				document.activeElement,
				"then the next indicator is focused 2/3"
			);
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.TAB);
			assert.strictEqual(
				getIndicatorForElement(aIndicators, "topButton"),
				document.activeElement,
				"then the next indicator is focused 3/3"
			);
		});
	});

	QUnit.module("Cleanup", {
		beforeEach: function(assert) {
			var fnDone = assert.async();
			setupTest.call(this, function () {
				prepareChanges([
					createMockChange("testAdd", "addDelegateProperty", "button1")
				]);
				selectCommandCategory(this.oVisualizationButton, this.oChangeVisualization, "all")
					.then(function () {
						sap.ui.getCore().applyChanges();
						fnDone();
					});
			}.bind(this));
		},
		afterEach: function() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when the change visualization is destroyed", function (assert) {
			var oDeletionSpy = sandbox.spy(collectIndicatorReferences()[0], "destroy");
			this.oChangeVisualization.destroy();
			assert.ok(oDeletionSpy.called, "then change indicators are destroyed as well");
			assert.strictEqual(collectIndicatorReferences().length, 0, "then all indicators are removed from the UI");
		});

		QUnit.test("when the change visualization is created a second time", function (assert) {
			this.oChangeVisualization.destroy();
			this.oChangeVisualization = new ChangeVisualization({
				rootControlId: "MockComponent"
			});
			return selectCommandCategory(this.oVisualizationButton, this.oChangeVisualization, "all")
				.then(function () {
					sap.ui.getCore().applyChanges();
					assert.strictEqual(collectIndicatorReferences().length, 1, "then indicators are created again");
					this.oChangeVisualization.destroy();
				}.bind(this));
		});

		QUnit.test("when the root control id changes", function (assert) {
			var oDeletionSpy = sandbox.spy(collectIndicatorReferences()[0], "destroy");
			this.oChangeVisualization.setRootControlId("someOtherId");
			assert.ok(oDeletionSpy.called, "then old change indicators are destroyed");
			this.oChangeVisualization.destroy();
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});