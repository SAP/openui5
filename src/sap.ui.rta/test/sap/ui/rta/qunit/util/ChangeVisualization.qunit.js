/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/util/changeVisualization/ChangeVisualization",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/core/Component",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/Utils",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/core/HTML",
	"sap/ui/events/KeyCodes"
],
function(
	sinon,
	QUnitUtils,
	ChangeVisualization,
	Button,
	ButtonType,
	PersistenceWriteAPI,
	Component,
	JsControlTreeModifier,
	ChangesUtils,
	FlUtils,
	OverlayRegistry,
	HTMLControl,
	KeyCodes
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oRtaResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

	function prepareTest (aMockChanges, oRootComponent, oChangeHandler) {
		sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aMockChanges || []);
		var oLoadComponentStub = sandbox.stub(Component, "get");
		oLoadComponentStub.withArgs("MockComponent").returns(Object.assign(
			{
				createId: function (sId) {
					return sId;
				}
			},
			oRootComponent
		));
		oLoadComponentStub.callThrough();
		var oMergedChangeHandler = Object.assign(
			{
				getChangeVisualizationInfo: function () {}
			},
			oChangeHandler
		);
		sandbox.stub(ChangesUtils, "getControlIfTemplateAffected")
			.callsFake(function (oChange, oControl) {
				return oControl;
			});
		sandbox.stub(FlUtils, "getViewForControl").returns();
		sandbox.stub(ChangesUtils, "getChangeHandler").resolves(oMergedChangeHandler);
	}

	function createMockOverlay (oBySelectorStub, oOverlayRegistryStub, sChangeId, iPosX, iPosY) {
		var oElement = document.createElement("div");
		oElement.style.position = "absolute";
		oElement.style.width = "100px";
		oElement.style.height = "100px";
		oElement.style.left = iPosX + "px";
		oElement.style.top = iPosY + "px";
		var oOverlay = new HTMLControl({
			id: "__mockOverlay_" + sChangeId,
			content: oElement.outerHTML
		});
		oOverlay.placeAt("qunit-fixture");

		oBySelectorStub.withArgs(oOverlay.getId()).returns(oOverlay);
		oOverlayRegistryStub.withArgs(oOverlay.getId()).returns(oOverlay);
		oOverlay.getDesignTimeMetadata = function () {
			return {
				getLabel: function () {}
			};
		};
		return oOverlay;
	}

	function createMockChange (sId, sCommandName, oMockOverlay) {
		return {
			getSelector: function () {
				return oMockOverlay && oMockOverlay.getId();
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
		};
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
		return oPopover.getContent()[0].getItems().find(function (oItem) {
			return oItem.getBindingContext("commandModel").getObject().key === sKey;
		});
	}

	function selectCommandCategory (oVisualizationButton, oChangeVisualization, sKeyToSelect) {
		// Simulate click event on the change visualization button,
		// select the given category and wait for the visualization to update

		// Stub before the event handler is bound
		var oSelectionPromise = waitForMethodCall(oChangeVisualization, "selectCommandCategory");

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
			prepareTest();
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
			prepareTest(aMockChanges);
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

	QUnit.module("Change indicator management", {
		beforeEach: function() {
			this.oChangeVisualization = new ChangeVisualization({
				rootControlId: "MockComponent"
			});
			this.oVisualizationButton = new Button({ text: "Test visualization" });
			var oBySelectorStub = sandbox.stub(JsControlTreeModifier, "bySelector");
			var oOverlayRegistryStub = sandbox.stub(OverlayRegistry, "getOverlay");
			this.aMockOverlays = [
				createMockOverlay(oBySelectorStub, oOverlayRegistryStub, "test1", 0, 100),
				createMockOverlay(oBySelectorStub, oOverlayRegistryStub, "test2", 0, 200),
				createMockOverlay(oBySelectorStub, oOverlayRegistryStub, "test3", 0, 300)
			];
			this.aMockChanges = [
				createMockChange("testAdd", "addDelegateProperty", this.aMockOverlays[0]),
				createMockChange("testReveal", "reveal", this.aMockOverlays[1]),
				createMockChange("testRename", "rename", this.aMockOverlays[2])
			];
		},
		afterEach: function() {
			this.oChangeVisualization.destroy();
			this.oVisualizationButton.destroy();
			this.aMockOverlays.forEach(function (oOverlay) {
				oOverlay.destroy();
			});
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a command category is selected", function (assert) {
			prepareTest(this.aMockChanges);
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
			prepareTest(this.aMockChanges);
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

					fnDone();
					// Temporarily deactivated due to problems with sinon restore

					// var fnReactivate = function () {
					// 	// Activate again
					// 	selectCommandCategory(this.oVisualizationButton, this.oChangeVisualization, "all")
					// 		.then(function () {
					// 			sap.ui.getCore().applyChanges();
					// 			assert.strictEqual(
					// 				collectIndicatorReferences().filter(function (oIndicator) {
					// 					return oIndicator.getVisible();
					// 				}).length,
					// 				3,
					// 				"then all indicators are visible again after reactivation"
					// 			);
					// 			fnDone();
					// 		});
					// }.bind(this);

					// if (!this.oChangeVisualization.getPopover().isOpen()) {
					// 	fnReactivate();
					// } else {
					// 	this.oChangeVisualization.getPopover().attachEventOnce("afterClose", fnReactivate);
					// }
				}.bind(this));
		});

		// QUnit.test("when details are selected for a change", function (assert) {
		// 	prepareTest(
		// 		[createMockChange("testMove", "move", this.aMockOverlays[0])],
		// 		undefined,
		// 		{
		// 			getChangeVisualizationInfo: function () {
		// 				return {
		// 					dependentControls: [this.aMockOverlays[1].getId()],
		// 					affectedControls: [this.aMockOverlays[0].getId()]
		// 				};
		// 			}.bind(this)
		// 		}
		// 	);
		// 	return selectCommandCategory(this.oVisualizationButton, this.oChangeVisualization, "all")
		// 		.then(function () {
		// 			sap.ui.getCore().applyChanges();
		// 			var oChangeIndicator = collectIndicatorReferences()[0];
		// 			oChangeIndicator.fireSelectChange({
		// 				changeId: oChangeIndicator.getChanges()[0].id
		// 			});
		// 			sap.ui.getCore().applyChanges();
		// 			debugger;
		// 			assert.async();
		// 		}.bind(this));
		// });
	});

	function getIndicatorForOverlay (aIndicators, sId) {
		return aIndicators.find(function (oIndicator) {
			return oIndicator.getOverlayId() === sId;
		}).getDomRef();
	}

	QUnit.module("Keyboard and focus handling", {
		beforeEach: function() {
			this.oChangeVisualization = new ChangeVisualization({
				rootControlId: "MockComponent"
			});
			this.oVisualizationButton = new Button({ text: "Test visualization" });
			var oBySelectorStub = sandbox.stub(JsControlTreeModifier, "bySelector");
			var oOverlayRegistryStub = sandbox.stub(OverlayRegistry, "getOverlay");
			this.aMockOverlays = [
				createMockOverlay(oBySelectorStub, oOverlayRegistryStub, "testAdd", 100, 200),
				createMockOverlay(oBySelectorStub, oOverlayRegistryStub, "testReveal", 0, 100),
				createMockOverlay(oBySelectorStub, oOverlayRegistryStub, "testRename", 0, 200)
			];
			var aMockChanges = [
				createMockChange("testAdd", "addDelegateProperty", this.aMockOverlays[0]),
				createMockChange("testReveal", "reveal", this.aMockOverlays[1]),
				createMockChange("testRename", "rename", this.aMockOverlays[2])
			];
			prepareTest(aMockChanges);
			return selectCommandCategory(this.oVisualizationButton, this.oChangeVisualization, "all")
				.then(function () {
					sap.ui.getCore().applyChanges();
				});
		},
		afterEach: function() {
			this.oChangeVisualization.destroy();
			this.oVisualizationButton.destroy();
			this.aMockOverlays.forEach(function (oOverlay) {
				oOverlay.destroy();
			});
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the visualization is started", function (assert) {
			var aIndicators = collectIndicatorReferences();
			// Overlay 1 has lowest y, thus should be focused first
			assert.strictEqual(
				getIndicatorForOverlay(aIndicators, this.aMockOverlays[1].getId()),
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
				getIndicatorForOverlay(aIndicators, this.aMockOverlays[0].getId()),
				document.activeElement,
				"then the previous indicator is focused 1/3"
			);
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ARROW_UP);
			assert.strictEqual(
				getIndicatorForOverlay(aIndicators, this.aMockOverlays[2].getId()),
				document.activeElement,
				"then the previous indicator is focused 2/3"
			);
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.TAB, true);
			assert.strictEqual(
				getIndicatorForOverlay(aIndicators, this.aMockOverlays[1].getId()),
				document.activeElement,
				"then the previous indicator is focused 3/3"
			);
		});

		QUnit.test("when RIGHT, DOWN or TAB are pressed", function (assert) {
			var aIndicators = collectIndicatorReferences();
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ARROW_RIGHT);
			assert.strictEqual(
				getIndicatorForOverlay(aIndicators, this.aMockOverlays[2].getId()),
				document.activeElement,
				"then the next indicator is focused 1/3"
			);
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN);
			assert.strictEqual(
				getIndicatorForOverlay(aIndicators, this.aMockOverlays[0].getId()),
				document.activeElement,
				"then the next indicator is focused 2/3"
			);
			QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.TAB);
			assert.strictEqual(
				getIndicatorForOverlay(aIndicators, this.aMockOverlays[1].getId()),
				document.activeElement,
				"then the next indicator is focused 3/3"
			);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});