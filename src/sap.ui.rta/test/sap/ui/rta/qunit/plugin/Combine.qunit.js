/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton",
	"sap/m/Panel",
	"sap/ui/core/mvc/View",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Combine",
	"sap/ui/rta/plugin/CombineDialog",
	"sap/ui/rta/Utils",
	"sap/ui/fl/util/CancelError",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Button,
	CheckBox,
	OverflowToolbar,
	OverflowToolbarButton,
	Panel,
	View,
	Lib,
	DesignTime,
	OverlayRegistry,
	DtUtil,
	ChangesWriteAPI,
	nextUIUpdate,
	CommandFactory,
	CombinePlugin,
	CombineDialog,
	Utils,
	CancelError,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const DEFAULT_DTM = "default";
	const oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Dummy");
	const sandbox = sinon.createSandbox();

	async function getMenuEntryAndCheck(assert, aOverlays, oAssertions) {
		// this.oCombinePlugin.deregisterElementOverlay(oOverlay);
		// this.oCombinePlugin.registerElementOverlay(oOverlay);

		await DtUtil.waitForSynced(this.oDesignTime)();
		const bIsEditable = await this.oCombinePlugin._isEditable(aOverlays[0]);
		assert.strictEqual(bIsEditable, oAssertions.editable, "then the editable property is correct");
		if (oAssertions.available !== undefined) {
			assert.strictEqual(this.oCombinePlugin.isAvailable(aOverlays, {}), oAssertions.available, "then available is correct");
		}

		const oMenuItem = (await this.oCombinePlugin.getMenuItems(aOverlays))[0];
		if (oMenuItem) {
			if (typeof oMenuItem.enabled === "function") {
				assert.strictEqual(oMenuItem.enabled(aOverlays, oMenuItem), oAssertions.enabled, "then the enabled property is correct");
			} else {
				assert.strictEqual(oMenuItem.enabled, oAssertions.enabled, "then the enabled property is correct");
			}
		}
		return oMenuItem;
	}

	const fnSetOverlayDesigntimeMetadata = function(oOverlay, oDesignTimeMetadata, bEnabled) {
		bEnabled = bEnabled === undefined || bEnabled === null ? true : bEnabled;
		if (oDesignTimeMetadata === DEFAULT_DTM) {
			oDesignTimeMetadata = {
				actions: {
					combine: {
						changeType: "combineStuff",
						changeOnRelevantContainer: true,
						isEnabled: bEnabled
					}
				}
			};
		}
		oOverlay.setDesignTimeMetadata(oDesignTimeMetadata);
	};

	// Designtime Metadata with fake isEnabled function (returns false)
	var oDesignTimeMetadata1 = {
		actions: {
			combine: {
				changeType: "combineStuff",
				changeOnRelevantContainer: true,
				isEnabled() {
					return false;
				}
			}
		}
	};

	// Designtime Metadata with fake isEnabled function (returns true)
	var oDesignTimeMetadata2 = {
		actions: {
			combine: {
				changeType: "combineStuff",
				changeOnRelevantContainer: true,
				isEnabled() {
					return true;
				}
			}
		}
	};

	// DesignTime Metadata without changeType
	var oDesignTimeMetadata3 = {
		actions: {
			combine: {
				changeOnRelevantContainer: true,
				isEnabled: true
			}
		}
	};

	// DesignTime Metadata without changeOnRelevantContainer
	var oDesigntimeMetadata4 = {
		actions: {
			combine: {
				changeType: "combineStuff",
				isEnabled() {
					return true;
				}
			}
		}
	};

	// DesignTime Metadata with different changeType
	var oDesignTimeMetadata5 = {
		actions: {
			combine: {
				changeType: "combineOtherStuff",
				changeOnRelevantContainer: true,
				isEnabled: true
			}
		}
	};

	QUnit.module("Given a designTime and combine plugin are instantiated", {
		async beforeEach(assert) {
			var done = assert.async();
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
			this.oCommandFactory = new CommandFactory();

			this.oCombinePlugin = new CombinePlugin({
				commandFactory: this.oCommandFactory
			});

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oButton4 = new Button("button4");
			this.oButton5 = new Button("button5");
			this.oPanel = new Panel("panel", {
				content: [
					this.oButton1,
					this.oButton2,
					this.oButton3,
					this.oButton4
				]
			});
			this.oPanel2 = new Panel("panel2", {
				content: [
					this.oButton5
				]
			});

			this.oOverflowToolbarButton1 = new OverflowToolbarButton("owerflowbutton1");
			this.oButton6 = new Button("button6");
			this.oCheckBox1 = new CheckBox("checkbox1");
			this.OverflowToolbar = new OverflowToolbar("OWFlToolbar", {
				content: [
					this.oOverflowToolbarButton1,
					this.oButton6,
					this.oCheckBox1
				]
			});

			this.oView = new View({
				content: [
					this.oPanel,
					this.oPanel2,
					this.OverflowToolbar
				]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPanel, this.oPanel2, this.OverflowToolbar],
				plugins: [this.oCombinePlugin],
				designTimeMetadata: {
					"sap.m.Button": {
						actions: {
							combine: {
								changeType: "combineStuff",
								changeOnRelevantContainer: true,
								isEnabled: true
							}
						}
					},
					"sap.m.OverflowToolbarButton": {
						actions: {
							combine: {
								changeType: "combineStuff",
								changeOnRelevantContainer: true,
								isEnabled: true
							}
						}
					},
					"sap.m.CheckBox": {
						actions: {
							combine: {
								changeType: "combineOtherStuff",
								changeOnRelevantContainer: true,
								isEnabled: true
							}
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
				this.oButton4Overlay = OverlayRegistry.getOverlay(this.oButton4);
				this.oButton5Overlay = OverlayRegistry.getOverlay(this.oButton5);
				this.oButton6Overlay = OverlayRegistry.getOverlay(this.oButton6);
				this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
				this.oPanel2Overlay = OverlayRegistry.getOverlay(this.oPanel2);
				this.oOverflowToolbarButton1Overlay = OverlayRegistry.getOverlay(this.oOverflowToolbarButton1);
				this.oCheckBox1Overlay = OverlayRegistry.getOverlay(this.oCheckBox1);
				this.OverflowToolbarOverlay = OverlayRegistry.getOverlay(this.OverflowToolbar);
				done();
			}.bind(this));
		},

		afterEach() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oPanel.destroy();
			this.oPanel2.destroy();
			this.OverflowToolbar.destroy();
		}
	}, function() {
		QUnit.test("when an overlay has no combine action in designTime metadata", function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, {});
			fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, {});

			assert.strictEqual(
				this.oCombinePlugin.isAvailable([this.oButton1Overlay]),
				false,
				"isAvailable is called and returns false"
			);
			assert.strictEqual(
				this.oCombinePlugin.isEnabled([this.oButton1Overlay]),
				false,
				"isEnabled is called and returns false"
			);
			return Promise.resolve()
			.then(this.oCombinePlugin._isEditable.bind(this.oCombinePlugin, this.oButton1Overlay))
			.then(function(bEditable) {
				assert.strictEqual(
					bEditable,
					false,
					"then the overlay is not editable"
				);
			});
		});

		QUnit.test("when an overlay has a combine action in designTime metadata", async function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata2);
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			sandbox.stub(this.oCombinePlugin, "hasChangeHandler").resolves(true);

			await getMenuEntryAndCheck.call(this, assert, [this.oButton1Overlay, this.oButton2Overlay], {
				editable: true,
				available: true,
				enabled: true
			});
		});

		QUnit.test("when two elements have different binding context", async function(assert) {
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(false);

			await getMenuEntryAndCheck.call(this, assert, [this.oButton1Overlay, this.oButton2Overlay], {
				editable: true,
				available: true,
				enabled: false
			});
		});

		QUnit.test("when a single combinable control with compatible siblings is specified", async function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);

			// button1 sits next to button2/3/4 in the same panel with the same combine change type,
			// so the single-element "Combine With" entry is available and enabled
			await getMenuEntryAndCheck.call(this, assert, [this.oButton1Overlay], {
				editable: true,
				available: true,
				enabled: true
			});
		});

		QUnit.test("when a single combinable control has no compatible sibling", async function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton5Overlay, DEFAULT_DTM);
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);

			// button5 is alone in panel2, so there is no sibling to combine with
			assert.strictEqual(
				this.oCombinePlugin.isAvailable([this.oButton5Overlay]),
				false,
				"then isAvailable returns false for the single element"
			);
			assert.strictEqual(
				this.oCombinePlugin.isEnabled([this.oButton5Overlay], {}),
				false,
				"then isEnabled returns false for the single element"
			);
			assert.strictEqual(
				(await this.oCombinePlugin.getMenuItems([this.oButton5Overlay])).length,
				0,
				"then no menu item is returned for the single element"
			);
		});

		QUnit.test("when controls which enabled function delivers false are specified", async function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesignTimeMetadata1);
			fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata1);

			await getMenuEntryAndCheck.call(this, assert, [this.oButton1Overlay, this.oButton2Overlay], {
				editable: true,
				available: true,
				enabled: false
			});
		});

		QUnit.test("when a control without change type is specified", async function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			fnSetOverlayDesigntimeMetadata(this.oButton4Overlay, oDesignTimeMetadata3);
			await getMenuEntryAndCheck.call(this, assert, [this.oButton1Overlay, this.oButton4Overlay], {
				editable: true,
				available: false,
				enabled: false
			});
		});

		QUnit.test("when controls from different relevant containers are specified", async function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			fnSetOverlayDesigntimeMetadata(this.oButton5Overlay, DEFAULT_DTM);
			await getMenuEntryAndCheck.call(this, assert, [this.oButton1Overlay, this.oButton5Overlay], {
				editable: true,
				available: false,
				enabled: false
			});
		});

		QUnit.test("when handleCombine is called with two elements, being triggered on the second element", function(assert) {
			var oFireElementModifiedSpy = sandbox.spy(this.oCombinePlugin, "fireElementModified");
			var oGetCommandForSpy = sandbox.spy(this.oCommandFactory, "getCommandFor");

			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, DEFAULT_DTM);

			return this.oCombinePlugin.handleCombine([this.oButton1Overlay, this.oButton2Overlay], this.oButton2)

			.then(function() {
				assert.ok(oFireElementModifiedSpy.calledOnce, "fireElementModified is called once");
				assert.ok(oGetCommandForSpy.calledWith(this.oButton2), "command creation is triggered with correct context element");
			}.bind(this))

			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			});
		});

		QUnit.test("when an overlay has a combine action designTime metadata which has no changeOnRelevantContainer", async function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesigntimeMetadata4);
			// re-evaluate editability so the plugin picks up the swapped designtime metadata
			await this.oCombinePlugin.evaluateEditable([this.oButton1Overlay], { onRegistration: false });

			await getMenuEntryAndCheck.call(this, assert, [this.oButton1Overlay], {
				editable: false,
				available: false,
				enabled: false
			});
		});

		QUnit.test("when Controls of different type with same change type are specified", async function(assert) {
			assert.expect(11);
			fnSetOverlayDesigntimeMetadata(this.oOverflowToolbarButton1Overlay, DEFAULT_DTM);
			fnSetOverlayDesigntimeMetadata(this.oButton6Overlay, DEFAULT_DTM);
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);

			await getMenuEntryAndCheck.call(this, assert, [this.oOverflowToolbarButton1Overlay, this.oButton6Overlay], {
				editable: true,
				available: true,
				enabled: true
			});

			let bIsAvailable = true;

			sinon.stub(this.oCombinePlugin, "isAvailable").callsFake(function(aElementOverlays) {
				assert.equal(
					aElementOverlays[0].getId(),
					this.oButton6Overlay.getId(),
					"the 'available' function calls isAvailable with the correct overlay"
				);
				return bIsAvailable;
			}.bind(this));
			const oHandleCombineWithStub = sinon.stub(this.oCombinePlugin, "handleCombineWith").callsFake(function(oElementOverlay) {
				assert.equal(
					oElementOverlay.getId(),
					this.oButton6Overlay.getId(),
					"the 'handler' method is called with the right overlay"
				);
			}.bind(this));

			const aMenuItems = await this.oCombinePlugin.getMenuItems([this.oButton6Overlay]);
			assert.equal(aMenuItems[0].id, "CTX_COMBINE_WITH", "'getMenuItems' returns the single-element menu item");
			assert.ok(aMenuItems[0].additionalInfo, "then the single-element menu item carries additional info about multi-selection");

			aMenuItems[0].handler([this.oButton6Overlay], { contextElement: this.oButton6 });
			assert.strictEqual(oHandleCombineWithStub.callCount, 1, "then the single-element handler routes to handleCombineWith");
			aMenuItems[0].enabled([this.oButton6Overlay], aMenuItems[0]);

			bIsAvailable = false;
			assert.equal(
				(await this.oCombinePlugin.getMenuItems([this.oButton6Overlay])).length,
				0,
				"and if plugin is not available for the overlay, no menu items are returned");
		});

		QUnit.test("when Controls of different type with different change type are specified", function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oOverflowToolbarButton1Overlay, DEFAULT_DTM);
			fnSetOverlayDesigntimeMetadata(this.oCheckBox1Overlay, oDesignTimeMetadata5);
			assert.strictEqual(
				this.oCombinePlugin.isAvailable([this.oOverflowToolbarButton1Overlay, this.oCheckBox1Overlay]),
				false,
				"isAvailable is called and returns false"
			);
			assert.strictEqual(
				this.oCombinePlugin.isEnabled([this.oOverflowToolbarButton1Overlay, this.oCheckBox1Overlay]),
				false,
				"isEnabled is called and returns false"
			);
		});

		QUnit.test("when the relevant container does not have a stable id", function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oOverflowToolbarButton1Overlay, DEFAULT_DTM);

			sandbox.stub(this.oCombinePlugin, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === this.OverflowToolbarOverlay) {
					return false;
				}
				return true;
			}.bind(this));

			return this.oCombinePlugin._isEditable(this.oOverflowToolbarButton1Overlay)
			.then(function(bEditable) {
				assert.strictEqual(
					bEditable,
					false,
					"_isEditable returns false"
				);
			});
		});

		RtaQunitUtils.testGetParameters(function() {
			return this.oCombinePlugin;
		}, ["elementIds"]);

		QUnit.test("when getContext is called on a source with compatible siblings", function(assert) {
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			// Use a limited combine action so maxControlsCount.value is a defined number
			const oLimitedMetadata = {
				actions: {
					combine: {
						changeType: "combineStuff",
						changeOnRelevantContainer: true,
						maxControlsCount: 3,
						getControlsCount() {
							return 1;
						}
					}
				}
			};
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oLimitedMetadata);
			this.oButton2.setText("Button 2");

			const oContext = this.oCombinePlugin.getContext(this.oButton1Overlay);

			assert.ok(oContext.availableElements, "then availableElements is returned");
			assert.ok(typeof oContext.availableElements.description === "string", "then availableElements carries a description");
			const aElements = oContext.availableElements.value;
			assert.ok(Array.isArray(aElements), "then availableElements.value is an array");
			assert.ok(aElements.length > 0, "then at least one sibling is listed");
			assert.ok(
				aElements.every((oEl) => oEl.id && typeof oEl.id === "string"),
				"then every element carries an id"
			);
			assert.ok(
				aElements.every((oEl) => typeof oEl.label === "string"),
				"then every element carries a label"
			);
			assert.ok(
				aElements.every((oEl) => typeof oEl.count === "number"),
				"then every element carries a count"
			);
			assert.notOk(
				aElements.some((oEl) => oEl.id === this.oButton1.getId()),
				"then the source element itself is not listed"
			);
			assert.ok(oContext.maxControlsCount, "then maxControlsCount is returned");
			assert.ok(typeof oContext.maxControlsCount.description === "string", "then maxControlsCount carries a description");
			assert.strictEqual(oContext.maxControlsCount.value, 3, "then maxControlsCount.value reflects the action's limit");
		});

		QUnit.test("when getContext is called on a source with no compatible siblings", function(assert) {
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			// button5 is alone in panel2 → no siblings

			const oContext = this.oCombinePlugin.getContext(this.oButton5Overlay);

			assert.ok(oContext.availableElements, "then availableElements is returned");
			assert.deepEqual(
				oContext.availableElements.value,
				[],
				"then availableElements.value is an empty array when no siblings are compatible"
			);
		});

		QUnit.test("when getContext is called on a source at its combine limit", function(assert) {
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			// source counts as 1, limit is 1 → no sibling can be added without exceeding the limit
			const oAtLimitMetadata = {
				actions: {
					combine: {
						changeType: "combineStuff",
						changeOnRelevantContainer: true,
						maxControlsCount: 1,
						getControlsCount() {
							return 1;
						}
					}
				}
			};
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oAtLimitMetadata);

			const oContext = this.oCombinePlugin.getContext(this.oButton1Overlay);

			assert.strictEqual(oContext.maxControlsCount.value, 1, "then maxControlsCount.value reflects the action's limit");
			assert.deepEqual(
				oContext.availableElements.value,
				[],
				"then siblings that would exceed the limit are excluded from availableElements"
			);
		});

		QUnit.test("when getContext filters out siblings that individually exceed the limit", function(assert) {
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			// source counts as 1, limit is 2 → only a sibling counting as 1 fits (1+1=2);
			// a sibling counting as 2 does not fit (1+2=3 > 2)
			const oBaseMetadata = {
				actions: {
					combine: {
						changeType: "combineStuff",
						changeOnRelevantContainer: true,
						maxControlsCount: 2,
						getControlsCount() { return 1; }
					}
				}
			};
			const oHeavyMetadata = {
				actions: {
					combine: {
						changeType: "combineStuff",
						changeOnRelevantContainer: true,
						getControlsCount() { return 2; }
					}
				}
			};
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oBaseMetadata);
			fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oBaseMetadata);
			fnSetOverlayDesigntimeMetadata(this.oButton3Overlay, oHeavyMetadata);

			const oContext = this.oCombinePlugin.getContext(this.oButton1Overlay);
			const aIds = oContext.availableElements.value.map((oEl) => oEl.id);

			assert.ok(aIds.includes(this.oButton2.getId()), "then button2 (count 1) is listed");
			assert.notOk(aIds.includes(this.oButton3.getId()), "then button3 (count 2) is excluded");
		});

		QUnit.test("when createCommands is called directly", async function(assert) {
			const oExpectedCommand = {};
			const oHandleCombineStub = sandbox.stub(this.oCombinePlugin, "handleCombine").resolves(oExpectedCommand);

			const oResult = await this.oCombinePlugin.createCommands(this.oButton1Overlay, {
				elementIds: [this.oButton2.getId(), this.oButton3.getId()]
			});

			assert.strictEqual(oHandleCombineStub.callCount, 1, "then handleCombine is called once");
			const aPassedOverlays = oHandleCombineStub.getCall(0).args[0];
			assert.deepEqual(
				aPassedOverlays.map((oOverlay) => oOverlay.getElement().getId()),
				[this.oButton1.getId(), this.oButton2.getId(), this.oButton3.getId()],
				"then handleCombine receives the source overlay plus the overlays resolved from elementIds"
			);
			assert.strictEqual(
				oHandleCombineStub.getCall(0).args[1],
				this.oButton1,
				"then handleCombine is called with the source element as combine element"
			);
			assert.strictEqual(oResult, oExpectedCommand, "then createCommands returns the command from handleCombine");
		});

		QUnit.test("when createCommands is called with more elements than the control-defined limit", async function(assert) {
			const oLimitedMetadata = {
				actions: {
					combine: {
						changeType: "combineStuff",
						changeOnRelevantContainer: true,
						maxControlsCount: 2,
						getControlsCount() {
							return 1;
						}
					}
				}
			};
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oLimitedMetadata);
			const oHandleCombineStub = sandbox.stub(this.oCombinePlugin, "handleCombine").resolves({});

			// source (1) + two siblings (1+1) = 3 controls, exceeds maxControlsCount: 2
			try {
				await this.oCombinePlugin.createCommands(this.oButton1Overlay, {
					elementIds: [this.oButton2.getId(), this.oButton3.getId()]
				});
				assert.ok(false, "then createCommands should have thrown");
			} catch (oError) {
				assert.ok(
					oError.message.includes("exceeds the maximum"),
					"then createCommands rejects when the combination exceeds the limit"
				);
			}
			assert.strictEqual(oHandleCombineStub.callCount, 0, "then handleCombine is not called");
		});

		QUnit.test("when handleCombineWith combines the source with the selected sibling", async function(assert) {
			const oExpectedCommand = {};
			const oCreateCommandsStub = sandbox.stub(this.oCombinePlugin, "createCommands").resolves(oExpectedCommand);
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			sandbox.stub(CombineDialog.prototype, "open").resolves();
			sandbox.stub(CombineDialog.prototype, "getSelectedElements").returns([{ id: this.oButton2.getId() }]);

			const oResult = await this.oCombinePlugin.handleCombineWith(this.oButton1Overlay);

			assert.strictEqual(oCreateCommandsStub.callCount, 1, "then createCommands is called once");
			assert.strictEqual(
				oCreateCommandsStub.getCall(0).args[0],
				this.oButton1Overlay,
				"then createCommands is called with the source overlay"
			);
			assert.deepEqual(
				oCreateCommandsStub.getCall(0).args[1],
				{ elementIds: [this.oButton2.getId()] },
				"then createCommands is called with the selected sibling id"
			);
			assert.strictEqual(oResult, oExpectedCommand, "then handleCombineWith returns the created command");
		});

		QUnit.test("when handleCombineWith is cancelled", async function(assert) {
			const oCreateCommandsStub = sandbox.stub(this.oCombinePlugin, "createCommands").resolves({});
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			sandbox.stub(CombineDialog.prototype, "open").rejects(new CancelError());

			const oResult = await this.oCombinePlugin.handleCombineWith(this.oButton1Overlay);

			assert.strictEqual(oResult, undefined, "then handleCombineWith resolves without a command");
			assert.strictEqual(oCreateCommandsStub.callCount, 0, "then no command is created");
		});

		QUnit.test("when handleCombineWith is confirmed without a selection", async function(assert) {
			const oCreateCommandsStub = sandbox.stub(this.oCombinePlugin, "createCommands").resolves({});
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			sandbox.stub(CombineDialog.prototype, "open").resolves();
			sandbox.stub(CombineDialog.prototype, "getSelectedElements").returns([]);

			const oResult = await this.oCombinePlugin.handleCombineWith(this.oButton1Overlay);

			assert.strictEqual(oResult, undefined, "then handleCombineWith resolves without a command");
			assert.strictEqual(oCreateCommandsStub.callCount, 0, "then no command is created");
		});

		QUnit.test("when handleCombineWith passes the control-defined limit to the dialog", async function(assert) {
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			// combine action that caps the number of combinable controls at 2, each element counting as 1
			const oLimitedMetadata = {
				actions: {
					combine: {
						changeType: "combineStuff",
						changeOnRelevantContainer: true,
						maxControlsCount: 2,
						getControlsCount() {
							return 1;
						}
					}
				}
			};
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oLimitedMetadata);

			let mDialogSettings;
			sandbox.stub(CombineDialog.prototype, "open").callsFake(function() {
				mDialogSettings = {
					title: this.getTitle(),
					maxControlsCount: this.getMaxControlsCount(),
					sourceControlsCount: this.getSourceControlsCount(),
					elements: this.getElements()
				};
				return Promise.resolve();
			});
			sandbox.stub(CombineDialog.prototype, "getSelectedElements").returns([]);
			sandbox.stub(this.oCombinePlugin, "createCommands").resolves({});

			await this.oCombinePlugin.handleCombineWith(this.oButton1Overlay);

			assert.strictEqual(mDialogSettings.maxControlsCount, 2, "then the maximum number of controls is passed to the dialog");
			assert.strictEqual(mDialogSettings.sourceControlsCount, 1, "then the source's control count is passed to the dialog");
			assert.ok(mDialogSettings.elements.length > 0, "then the candidate elements are passed to the dialog");
			assert.ok(
				mDialogSettings.elements.every((oElement) => oElement.count === 1),
				"then each candidate carries its control count"
			);
		});

		QUnit.test("when handleCombineWith names the source element in the dialog title", async function(assert) {
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			this.oButton1.setText("Company");

			let sTitle;
			sandbox.stub(CombineDialog.prototype, "open").callsFake(function() {
				sTitle = this.getTitle();
				return Promise.resolve();
			});
			sandbox.stub(CombineDialog.prototype, "getSelectedElements").returns([]);

			await this.oCombinePlugin.handleCombineWith(this.oButton1Overlay);

			const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
			assert.strictEqual(
				sTitle,
				oResourceBundle.getText("TIT_COMBINE_WITH", ["Company"]),
				"then the dialog title names the source element (e.g. 'Combine with: Company')"
			);
		});

		QUnit.test("when handleCombineWith uses the generic title if the source has no label", async function(assert) {
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			// button1 has no text -> getLabelForElement falls back to the id -> generic title

			let sTitle;
			sandbox.stub(CombineDialog.prototype, "open").callsFake(function() {
				sTitle = this.getTitle();
				return Promise.resolve();
			});
			sandbox.stub(CombineDialog.prototype, "getSelectedElements").returns([]);

			await this.oCombinePlugin.handleCombineWith(this.oButton1Overlay);

			const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
			assert.strictEqual(
				sTitle,
				oResourceBundle.getText("CTX_COMBINE_WITH"),
				"then the generic dialog title is used when the source has no meaningful label"
			);
		});

		QUnit.test("when _isCombinationWithinLimit applies the control-defined maximum", function(assert) {
			const oLimitedMetadata = {
				actions: {
					combine: {
						changeType: "combineStuff",
						changeOnRelevantContainer: true,
						maxControlsCount: 2,
						getControlsCount() {
							return 1;
						}
					}
				}
			};
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oLimitedMetadata);

			// source (1) + one sibling (1) = 2 controls -> within the limit
			assert.strictEqual(
				this.oCombinePlugin._isCombinationWithinLimit(this.oButton1Overlay, [this.oButton1Overlay, this.oButton2Overlay]),
				true,
				"then a combination within the maximum is allowed"
			);
			// source (1) + two siblings (1 + 1) = 3 controls -> over the limit
			assert.strictEqual(
				this.oCombinePlugin._isCombinationWithinLimit(
					this.oButton1Overlay,
					[this.oButton1Overlay, this.oButton2Overlay, this.oButton3Overlay]
				),
				false,
				"then a combination over the maximum is rejected"
			);
		});

		QUnit.test("when the source element is already at its own combine limit the action is available but disabled", function(assert) {
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			// a maximum of a single control -> combining with any sibling exceeds the limit
			const oAtLimitMetadata = {
				actions: {
					combine: {
						changeType: "combineStuff",
						changeOnRelevantContainer: true,
						maxControlsCount: 1,
						getControlsCount() {
							return 1;
						}
					}
				}
			};
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oAtLimitMetadata);

			// siblings are still returned as candidates (so they can be shown disabled in the dialog)
			const aSiblings = this.oCombinePlugin._getCompatibleSiblingOverlays(this.oButton1Overlay);
			assert.ok(aSiblings.length > 0, "then siblings are still returned as candidates");
			// like the multi-selection case, the action stays available (discoverable) even at the limit ...
			assert.strictEqual(
				this.oCombinePlugin.isAvailable([this.oButton1Overlay]),
				true,
				"then the single-element combine action is still available"
			);
			// ... but is disabled because nothing can actually be combined within the limit
			assert.strictEqual(
				this.oCombinePlugin.isEnabled([this.oButton1Overlay], {}),
				false,
				"then the single-element combine action is disabled when nothing fits within the limit"
			);
		});
	});

	QUnit.done(function() {
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
