/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton",
	"sap/m/Panel",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Combine",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/core/mvc/View",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Button,
	CheckBox,
	OverflowToolbar,
	OverflowToolbarButton,
	Panel,
	DesignTime,
	OverlayRegistry,
	ChangesWriteAPI,
	CommandFactory,
	CombinePlugin,
	Utils,
	sinon,
	RtaQunitUtils,
	View,
	nextUIUpdate
) {
	"use strict";

	var DEFAULT_DTM = "default";

	var oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Dummy");

	var sandbox = sinon.createSandbox();

	var fnSetOverlayDesigntimeMetadata = function(oOverlay, oDesignTimeMetadata, bEnabled) {
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

		QUnit.test("when an overlay has a combine action in designTime metadata", function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata2);
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);
			sandbox.stub(this.oCombinePlugin, "hasChangeHandler").resolves(true);

			assert.strictEqual(
				this.oCombinePlugin.isAvailable([this.oButton1Overlay, this.oButton2Overlay]),
				true,
				"isAvailable is called and returns true"
			);
			assert.strictEqual(
				this.oCombinePlugin.isEnabled([this.oButton1Overlay, this.oButton2Overlay]),
				true,
				"isEnabled is called and returns true"
			);
			return this.oCombinePlugin._isEditable(this.oButton1Overlay)
			.then(function(bEditable) {
				assert.strictEqual(
					bEditable,
					true,
					"then the overlay is editable"
				);
			});
		});

		QUnit.test("when two elements have different binding context", function(assert) {
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(false);

			assert.strictEqual(
				this.oCombinePlugin.isAvailable([this.oButton1Overlay, this.oButton2Overlay]),
				true,
				"isAvailable is called and returns true"
			);
			assert.strictEqual(
				this.oCombinePlugin.isEnabled([this.oButton1Overlay, this.oButton2Overlay]),
				false,
				"isEnabled is called and returns false"
			);
		});

		QUnit.test("when only one control is specified", function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);

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
		});

		QUnit.test("when controls which enabled function delivers false are specified", function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesignTimeMetadata1);
			fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata1);
			assert.strictEqual(
				this.oCombinePlugin.isAvailable([this.oButton1Overlay, this.oButton2Overlay]),
				true,
				"isAvailable is called and returns true"
			);
			assert.strictEqual(
				this.oCombinePlugin.isEnabled([this.oButton1Overlay, this.oButton2Overlay]),
				false,
				"isEnabled is called and returns false"
			);
		});

		QUnit.test("when a control without change type is specified", function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			fnSetOverlayDesigntimeMetadata(this.oButton4Overlay, oDesignTimeMetadata3);
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
		});

		QUnit.test("when controls from different relevant containers are specified", function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			fnSetOverlayDesigntimeMetadata(this.oButton5Overlay, DEFAULT_DTM);
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

		QUnit.test("when an overlay has a combine action designTime metadata which has no changeOnRelevantContainer", function(assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesigntimeMetadata4);
			return Promise.resolve()
			.then(this.oCombinePlugin._isEditable.bind(this.oCombinePlugin, this.oButton1Overlay))
			.then(function(bEditable) {
				assert.strictEqual(bEditable, false, "then the overlay is not editable");
			});
		});

		QUnit.test("when Controls of different type with same change type are specified", function(assert) {
			assert.expect(9);
			fnSetOverlayDesigntimeMetadata(this.oOverflowToolbarButton1Overlay, DEFAULT_DTM);
			fnSetOverlayDesigntimeMetadata(this.oButton6Overlay, DEFAULT_DTM);
			sandbox.stub(Utils, "checkSourceTargetBindingCompatibility").returns(true);

			assert.strictEqual(
				this.oCombinePlugin.isAvailable([this.oOverflowToolbarButton1Overlay, this.oButton6Overlay]),
				true,
				"isAvailable is called and returns true"
			);
			assert.strictEqual(
				this.oCombinePlugin.isEnabled([this.oOverflowToolbarButton1Overlay, this.oButton6Overlay]),
				true,
				"isEnabled is called and returns true"
			);

			var bIsAvailable = true;

			sinon.stub(this.oCombinePlugin, "isAvailable").callsFake(function(aElementOverlays) {
				assert.equal(aElementOverlays[0].getId(), this.oButton6Overlay.getId(), "the 'available' function calls isAvailable with the correct overlay");
				return bIsAvailable;
			}.bind(this));
			sinon.stub(this.oCombinePlugin, "handleCombine").callsFake(function(aElementOverlays, oCombineElement) {
				assert.equal(aElementOverlays[0].getId(), this.oButton6Overlay.getId(), "the 'handler' method is called with the right overlay");
				assert.equal(oCombineElement.getId(), this.oButton6.getId(), "the 'handler' method is called with the right combine element");
			}.bind(this));

			var aMenuItems = this.oCombinePlugin.getMenuItems([this.oButton6Overlay]);
			assert.equal(aMenuItems[0].id, "CTX_GROUP_FIELDS", "'getMenuItems' returns the context menu item for the plugin");

			aMenuItems[0].handler([this.oButton6Overlay], { contextElement: this.oButton6 });
			aMenuItems[0].enabled([this.oButton6Overlay]);

			bIsAvailable = false;
			assert.equal(this.oCombinePlugin.getMenuItems([this.oButton6Overlay]).length, 0, "and if plugin is not available for the overlay, no menu items are returned");
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
	});

	QUnit.done(function() {
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
