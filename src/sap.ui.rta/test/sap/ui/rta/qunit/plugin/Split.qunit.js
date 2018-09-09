/*global QUnit */

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/dt/DesignTime',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/Utils',
	'sap/ui/rta/plugin/Split',
	'sap/m/Button',
	'sap/m/Panel',
	'sap/ui/thirdparty/sinon-4'
],
function (
	jQuery,
	DesignTime,
	CommandFactory,
	OverlayRegistry,
	ChangeRegistry,
	Utils,
	SplitPlugin,
	Button,
	Panel,
	sinon
) {
	'use strict';

	var DEFAULT_DTM = {
		actions: {
			split: {
				changeType: "splitStuff",
				changeOnRelevantContainer: true,
				getControlsCount: function () {
					return 0;
				}
			}
		}
	};

	var oMockedAppComponent = {
		getLocalId: function () {
			return undefined;
		},
		getManifestEntry: function () {
			return {};
		},
		getMetadata: function () {
			return {
				getName: function () {
					return "someName";
				}
			};
		},
		getManifest: function () {
			return {
				"sap.app" : {
					applicationVersion : {
						version : "1.2.3"
					}
				}
			};
		},
		getModel: function () {}
	};

	sinon.stub(Utils, "_getAppComponentForComponent").returns(oMockedAppComponent);

	var sandbox = sinon.sandbox.create();
	var fnSetOverlayDesigntimeMetadata = function(oOverlay, oDesignTimeMetadata) {
		oOverlay.setDesignTimeMetadata(oDesignTimeMetadata);
	};

	QUnit.module("Given a designTime and split plugin are instantiated", {

			beforeEach : function(assert) {

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Panel": {
					"splitStuff" : { completeChangeContent: function() {} }
				}
			});

			this.oSplitPlugin = new SplitPlugin({
				commandFactory : new CommandFactory()
			});

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oPanel = new Panel("panel", {
				content : [
					this.oButton1,
					this.oButton2,
					this.oButton3
				]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oPanel],
				plugins : [this.oSplitPlugin]
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
				this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
				done();
			}.bind(this));
		},

		afterEach : function() {
			sandbox.restore();
			this.oPanel.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when an overlay has no split action in designTime metadata", function(assert) {
		fnSetOverlayDesigntimeMetadata(this.oPanelOverlay, {});
		assert.strictEqual(
			this.oSplitPlugin.isAvailable([this.oPanelOverlay]),
			false,
			"isAvailable is called and returns false"
		);
		assert.strictEqual(
			this.oSplitPlugin.isEnabled([this.oPanelOverlay]),
			false,
			"isEnabled is called and returns false"
		);
		assert.strictEqual(
			this.oSplitPlugin._isEditable(this.oButton1Overlay),
			false,
			"then the overlay is not editable"
		);
	});

	QUnit.test("when an overlay has a split action in designTime metadata and the specified element has more than one control", function (assert) {
		var oDesignTimeMetadata1 = {
			actions : {
				split : {
					changeType: "splitStuff",
					changeOnRelevantContainer : true,
					isEnabled : true,
					getControlsCount: function() {
						return 2;
					}
				}
			}
		};
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesignTimeMetadata1);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton1Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton1Overlay);

		assert.strictEqual(
			this.oSplitPlugin.isAvailable([this.oButton1Overlay]),
			true,
			"isAvailable is called and returns true"
		);
		assert.strictEqual(
			this.oSplitPlugin.isEnabled([this.oButton1Overlay]),
			true,
			"isEnabled is called and returns true"
		);
	});

	QUnit.test("when an overlay has a split action in designTime metadata relevant container has no stable id", function (assert) {
		var oDesignTimeMetadata1 = {
			actions : {
				split : {
					changeType: "splitStuff",
					changeOnRelevantContainer : true,
					isEnabled : true,
					getControlsCount: function() {
						return 2;
					}
				}
			}
		};
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesignTimeMetadata1);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton1Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton1Overlay);

		sandbox.stub(this.oSplitPlugin, "hasStableId").callsFake(function(oOverlay){
			if (oOverlay === this.oPanelOverlay){
				return false;
			} else {
				return true;
			}
		}.bind(this));

		assert.strictEqual(
			this.oSplitPlugin._isEditable(this.oButton1Overlay),
			false,
			"_isEditable returns false"
		);
	});

	QUnit.test("when isEnabled() is a function in designTime metadata and the specified element contains only one control", function (assert) {
		var oDesignTimeMetadata2 = {
				actions : {
					split : {
						changeType: "splitField",
						changeOnRelevantContainer : true,
						isEnabled : function() {
							return true;
						},
						getControlsCount : function() {
							return 1;
						}
					}
				}
		};

		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata2);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton2Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton2Overlay);

		assert.strictEqual(
			this.oSplitPlugin.isAvailable([this.oButton2Overlay]),
			false,
			"isAvailable is called and returns false"
		);
		assert.strictEqual(
			this.oSplitPlugin.isEnabled([this.oButton2Overlay]),
			false,
			"isEnabled is called and returns false"
		);
	});

	QUnit.test("when there is no getControlsCount() function in designTime metadata", function (assert) {
		var oDesignTimeMetadata3 = {
			actions: {
				split: {
					changeType: "splitField",
					changeOnRelevantContainer : true,
					isEnabled: function () {
						return true;
					}
				}
			}
		};

		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata3);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton2Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton2Overlay);

		assert.strictEqual(
			this.oSplitPlugin.isAvailable([this.oButton2Overlay]),
			false,
			"isAvailable is called and returns false"
		);
		assert.strictEqual(
			this.oSplitPlugin.isEnabled([this.oButton2Overlay]),
			false,
			"isEnabled is called and returns false"
		);
	});

	QUnit.test("when two controls are specified", function (assert) {
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		fnSetOverlayDesigntimeMetadata(this.oButton3Overlay, DEFAULT_DTM);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton1Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton1Overlay);

		assert.strictEqual(
			this.oSplitPlugin.isAvailable([this.oButton1Overlay, this.oButton3Overlay]),
			false,
			"isAvailable is called and returns false"
		);
		assert.strictEqual(
			this.oSplitPlugin.isEnabled([this.oButton1Overlay, this.oButton3Overlay]),
			false,
			"isEnabled is called and returns false"
		);
	});

	QUnit.test("when handleSplit is called", function(assert) {
		var spy = sandbox.spy(this.oSplitPlugin, "fireElementModified");
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton1Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton1Overlay);

		return this.oSplitPlugin.handleSplit(this.oButton1Overlay)

		.then(function() {
			assert.strictEqual(spy.callCount, 1, "fireElementModified is called once");
		})

		.catch(function (oError) {
			assert.ok(false, 'catch must never be called - Error: ' + oError);
		});
	});

	QUnit.test("when an overlay has a split action designTime metadata", function (assert) {
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		assert.strictEqual(this.oSplitPlugin._isEditable(this.oButton1Overlay), true, "then the overlay is editable");
	});

	QUnit.test("when an overlay has a split action designTime metadata which has no changeOnRelevantContainer", function(assert) {
		this.oButton1Overlay.setDesignTimeMetadata({
			actions : {
				split : {
					changeType: "splitStuff",
					getControlsCount : function () {
						return 2;
					}
				}
			}
		});

		assert.strictEqual(this.oSplitPlugin._isEditable(this.oButton1Overlay), false, "then the overlay is not editable");
	});

	QUnit.test("when retrieving the context menu item", function(assert) {
		assert.expect(6);
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);

		var bIsAvailable = true;
		sandbox.stub(this.oSplitPlugin, "isAvailable").callsFake(function (aElementOverlays) {
			assert.equal(aElementOverlays[0].getId(), this.oButton1Overlay.getId(), "the 'available' function calls isAvailable with the correct overlay");
			return bIsAvailable;
		}.bind(this));
		sandbox.stub(this.oSplitPlugin, "handleSplit").callsFake(function (oElementOverlay) {
			assert.deepEqual(oElementOverlay.getId(), this.oButton1Overlay.getId(), "the 'handleSplit' method is called with the right overlay");
		}.bind(this));
		sandbox.stub(this.oSplitPlugin, "isEnabled").callsFake(function (aElementOverlays) {
			assert.equal(aElementOverlays[0].getId(), this.oButton1Overlay.getId(), "the 'enabled' function calls isEnabled with the correct element overlay");
		}.bind(this));

		var aMenuItems = this.oSplitPlugin.getMenuItems([this.oButton1Overlay]);
		assert.equal(aMenuItems[0].id, "CTX_UNGROUP_FIELDS", "'getMenuItems' returns the context menu item for the plugin");

		aMenuItems[0].handler([this.oButton1Overlay], { contextElement: this.oButton1 });
		aMenuItems[0].enabled([this.oButton1Overlay]);

		bIsAvailable = false;
		assert.equal(
			this.oSplitPlugin.getMenuItems([this.oButton1Overlay]).length,
			0,
			"and if plugin is not available for the overlay, no menu items are returned"
		);
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
