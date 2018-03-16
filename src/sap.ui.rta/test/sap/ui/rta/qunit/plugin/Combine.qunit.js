/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

sap.ui.define([
	//internal:
	'sap/ui/dt/DesignTime',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/Utils',
	'sap/ui/rta/plugin/Combine',
	'sap/m/Button',
	'sap/m/Panel',
	'sap/m/OverflowToolbar',
	'sap/m/OverflowToolbarButton',
	'sap/m/CheckBox',
	'sap/ui/dt/SelectionManager',
	// should be last:
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],

function(
	DesignTime,
	CommandFactory,
	OverlayRegistry,
	ChangeRegistry,
	Utils,
	CombinePlugin,
	Button,
	Panel,
	OverflowToolbar,
	OverflowToolbarButton,
	CheckBox,
	SelectionManager
) {
	'use strict';

	var DEFAULT_DTM = "default";

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

	sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

	var sandbox = sinon.sandbox.create();

	var fnSetOverlayDesigntimeMetadata = function (oOverlay, oDesignTimeMetadata, bEnabled) {
		bEnabled = bEnabled === undefined || bEnabled === null ? true : bEnabled;
		if (oDesignTimeMetadata === DEFAULT_DTM) {
			oDesignTimeMetadata = {
				actions : {
					combine : {
						changeType: "combineStuff",
						changeOnRelevantContainer : true,
						isEnabled : bEnabled
					}
				}
			};
		}
		oOverlay.setDesignTimeMetadata(oDesignTimeMetadata);
	};

	//Designtime Metadata with fake isEnabled function (returns false)
	var oDesignTimeMetadata1 = {
			actions : {
				combine : {
					changeType: "combineStuff",
					changeOnRelevantContainer : true,
					isEnabled : function() {
						return false;
					}
				}
			}
		};

	//Designtime Metadata with fake isEnabled function (returns true)
	var oDesignTimeMetadata2 = {
			actions : {
				combine : {
					changeType: "combineStuff",
					changeOnRelevantContainer : true,
					isEnabled : function() {
						return true;
					}
				}
			}
		};

	// DesignTime Metadata without changeType
	var oDesignTimeMetadata3 = {
			actions : {
				combine : {
					changeOnRelevantContainer : true,
					isEnabled : true
				}
			}
		};

	// DesignTime Metadata without changeOnRelevantContainer
	var oDesigntimeMetadata4 = {
			actions : {
				combine : {
					changeType: "combineStuff",
					isEnabled : function() {
						return true;
					}
				}
			}
		};

	//DesignTime Metadata with different changeType
	var oDesignTimeMetadata5 = {
			actions : {
				combine : {
					changeType: "combineOtherStuff",
					changeOnRelevantContainer : true,
					isEnabled : true
				}
			}
		};


	QUnit.module("Given a designTime and combine plugin are instantiated", {

		beforeEach : function(assert) {

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Panel": {
					"combineStuff" : { completeChangeContent: function() {} }
				},
				"sap.m.OverflowToolbar": {
					"combineStuff" : { completeChangeContent: function() {} },
					"combineOtherStuff" : { completeChangeContent: function() {} }
				}
			});

			this.oCombinePlugin = new CombinePlugin({
				commandFactory : new CommandFactory()
			});

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oButton4 = new Button("button4");
			this.oButton5 = new Button("button5");
			this.oPanel = new Panel("panel", {
				content : [
					this.oButton1,
					this.oButton2,
					this.oButton3,
					this.oButton4
				]
			}).placeAt("test-view");
			this.oPanel2 = new Panel("panel2", {
				content : [
					this.oButton5
				]
			}).placeAt("test-view");

			this.oOverflowToolbarButton1 = new OverflowToolbarButton("owerflowbutton1");
			this.oButton6 = new Button("button6");
			this.oCheckBox1 = new CheckBox("checkbox1");
			this.OverflowToolbar = new OverflowToolbar("OWFlToolbar",{
				content : [
					this.oOverflowToolbarButton1,
					this.oButton6,
					this.oCheckBox1
				]
			}).placeAt("test-view");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oPanel, this.oPanel2, this.OverflowToolbar],
				plugins : [this.oCombinePlugin],
				designTimeMetadata : {
					"sap.m.Button" : {
						actions : {
							combine : {
								changeType: "combineStuff",
								changeOnRelevantContainer : true,
								isEnabled : true
							}
						}
					},
					"sap.m.OverflowToolbarButton" : {
						actions : {
							combine : {
								changeType: "combineStuff",
								changeOnRelevantContainer : true,
								isEnabled : true
							}
						}
					},
					"sap.m.CheckBox" : {
						actions : {
							combine : {
								changeType: "combineOtherStuff",
								changeOnRelevantContainer : true,
								isEnabled : true
							}
						}
					}
				}
			});

			var done = assert.async();
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

		afterEach : function(assert) {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oPanel.destroy();
			this.oPanel2.destroy();
			this.OverflowToolbar.destroy();
		}
	});

	QUnit.test("when an overlay has no combine action in designTime metadata", function(assert) {
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, {});
		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, {});

		sandbox.stub(SelectionManager.prototype, "get").returns(
				[this.oButton1Overlay, this.oButton2Overlay]);

		assert.strictEqual(
			this.oCombinePlugin.isAvailable(this.oButton1Overlay), false,
			"isAvailable is called and returns false");
		assert.strictEqual(
			this.oCombinePlugin.isEnabled(this.oButton1Overlay), false,
			"isEnabled is called and returns false");
		assert.strictEqual(this.oCombinePlugin._isEditable(this.oButton1Overlay), false, "then the overlay is not editable");
	});

	QUnit.test("when an overlay has a combine action in designTime metadata", function(assert) {
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata2);

		sandbox.stub(SelectionManager.prototype, "get").returns(
				[this.oButton1Overlay, this.oButton2Overlay]);

		assert.strictEqual(
			this.oCombinePlugin.isAvailable(this.oButton1Overlay), true,
			"isAvailable is called and returns true");
		assert.strictEqual(
			this.oCombinePlugin.isEnabled(this.oButton2Overlay), true,
			"isEnabled is called and returns true");
		assert.strictEqual(this.oCombinePlugin._isEditable(this.oButton1Overlay), true, "then the overlay is editable");
	});

	QUnit.test("when only one control is selected", function(assert) {
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		sandbox.stub(SelectionManager.prototype, "get").returns([this.oButton1Overlay]);

		assert.strictEqual(
			this.oCombinePlugin.isAvailable(this.oButton1Overlay), false,
			"isAvailable is called and returns false");
		assert.strictEqual(
			this.oCombinePlugin.isEnabled(this.oButton1Overlay), false,
			"isEnabled is called and returns false");
	});

	QUnit.test("when controls which enabled-function delivers false are selected", function(assert) {
		sandbox.stub(SelectionManager.prototype, "get").returns([
			this.oButton1Overlay,
			this.oButton2Overlay
		]);

		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesignTimeMetadata1);
		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata1);
		assert.strictEqual(
			this.oCombinePlugin.isAvailable(this.oButton1Overlay), true,
			"isAvailable is called and returns true");
		assert.strictEqual(
			this.oCombinePlugin.isEnabled(this.oButton1Overlay), false,
			"isEnabled is called and returns false");
	});

	QUnit.test("when a control without changetype is selected", function(assert) {
		sandbox.stub(SelectionManager.prototype, "get").returns([
			this.oButton1Overlay,
			this.oButton4Overlay
		]);

		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		fnSetOverlayDesigntimeMetadata(this.oButton4Overlay, oDesignTimeMetadata3);
		assert.strictEqual(
			this.oCombinePlugin.isAvailable(this.oButton1Overlay), false,
			"isAvailable is called and returns false");
		assert.strictEqual(
			this.oCombinePlugin.isEnabled(this.oButton1Overlay), false,
			"isEnabled is called and returns false");
	});

	QUnit.test("when controls from different relevant containers are selected", function(assert) {
		sandbox.stub(SelectionManager.prototype, "get").returns([
			this.oButton1Overlay,
			this.oButton5Overlay
		]);

		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		fnSetOverlayDesigntimeMetadata(this.oButton5Overlay, DEFAULT_DTM);
		assert.strictEqual(
			this.oCombinePlugin.isAvailable(this.oButton1Overlay), false,
			"isAvailable is called and returns false");
		assert.strictEqual(
			this.oCombinePlugin.isEnabled(this.oButton1Overlay), false,
			"isEnabled is called and returns false");
	});

	QUnit.test("when handleCombine is called with two selected elements", function(assert) {
		var spy = sandbox.spy(this.oCombinePlugin, "fireElementModified");

		sandbox.stub(SelectionManager.prototype, "get").returns([
			this.oButton1Overlay,
			this.oButton2Overlay
		]);

		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, DEFAULT_DTM);
		this.oCombinePlugin.handleCombine(this.oButton1);

		assert.ok(spy.calledOnce,
			"fireElementModified is called once");
	});

	QUnit.test("when an overlay has a combine action designTime metadata which has no changeOnRelevantContainer", function(assert) {
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesigntimeMetadata4);
		assert.strictEqual(this.oCombinePlugin._isEditable(this.oButton1Overlay), false, "then the overlay is not editable");
	});

	QUnit.test("when Controls of different type with same change type are selected", function(assert) {
		sandbox.stub(SelectionManager.prototype, "get").returns([
			this.oOverflowToolbarButton1Overlay,
			this.oButton6Overlay
		]);

		fnSetOverlayDesigntimeMetadata(this.oOverflowToolbarButton1Overlay, DEFAULT_DTM);
		fnSetOverlayDesigntimeMetadata(this.oButton6Overlay,DEFAULT_DTM);
		assert.strictEqual(
			this.oCombinePlugin.isAvailable(this.oOverflowToolbarButton1Overlay), true,
			"isAvailable is called and returns true");
		assert.strictEqual(
			this.oCombinePlugin.isEnabled(this.oOverflowToolbarButton1Overlay), true,
			"isEnabled is called and returns true");

		var bIsAvailable = true;

		sinon.stub(this.oCombinePlugin, "isAvailable", function(oOverlay){
			assert.equal(oOverlay, this.oButton6Overlay, "the 'available' function calls isAvailable with the correct overlay");
			return bIsAvailable;
		}.bind(this));
		sinon.stub(this.oCombinePlugin, "handleCombine", function(oSelectedElement){
			assert.equal(oSelectedElement, this.oButton6Overlay.getElement(), "the 'handler' method is called with the right element");
		}.bind(this));
		sinon.stub(this.oCombinePlugin, "isEnabled", function(oOverlay){
			assert.equal(oOverlay, this.oButton6Overlay, "the 'enabled' function calls isEnabled with the correct overlay");
		}.bind(this));

		var aMenuItems = this.oCombinePlugin.getMenuItems(this.oButton6Overlay);
		assert.equal(aMenuItems[0].id, "CTX_GROUP_FIELDS", "'getMenuItems' returns the context menu item for the plugin");

		aMenuItems[0].handler([this.oButton6Overlay], { contextElement: this.oButton6 });
		aMenuItems[0].enabled(this.oButton6Overlay);

		bIsAvailable = false;
		assert.equal(this.oCombinePlugin.getMenuItems(this.oButton6Overlay).length, 0, "and if plugin is not available for the overlay, no menu items are returned");
	});

	QUnit.test("when Controls of different type with different change type are selected", function(assert) {
		sandbox.stub(SelectionManager.prototype, "get").returns([
			this.oOverflowToolbarButton1Overlay,
			this.oCheckBox1Overlay
		]);

		fnSetOverlayDesigntimeMetadata(this.oOverflowToolbarButton1Overlay, DEFAULT_DTM);
		fnSetOverlayDesigntimeMetadata(this.oCheckBox1Overlay,oDesignTimeMetadata5);
		assert.strictEqual(
			this.oCombinePlugin.isAvailable(this.oOverflowToolbarButton1Overlay), false,
			"isAvailable is called and returns false");
		assert.strictEqual(
			this.oCombinePlugin.isEnabled(this.oOverflowToolbarButton1Overlay), false,
			"isEnabled is called and returns false");
	});

});
