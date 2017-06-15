/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

sap.ui.define([
	//internal:
	'sap/ui/dt/DesignTime',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/Utils',
	'sap/ui/rta/plugin/Split',
	'sap/m/Button',
	'sap/m/Panel',
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
	SplitPlugin,
	Button,
	Panel
) {
	'use strict';

	var DEFAULT_DTM = {
		actions: {
			split: {
				changeType: "splitStuff",
				changeOnRelevantContainer: true,
				getControlsCount: function(oElement) {
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
		}
	};

	sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

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
			}).placeAt("test-view");

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

		afterEach : function(assert) {
			sandbox.restore();
			this.oPanel.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when an overlay has no split action in designTime metadata", function(assert) {
		fnSetOverlayDesigntimeMetadata(this.oPanelOverlay, {});
		assert.strictEqual(
			this.oSplitPlugin.isSplitAvailable(this.oPanelOverlay), false,
			"isSplitAvailable is called and returns false");
		assert.strictEqual(
			this.oSplitPlugin.isSplitEnabled(this.oPanelOverlay), false,
			"isSplitEnabled is called and returns false");
		assert.strictEqual(this.oSplitPlugin._isEditable(this.oButton1Overlay), false,
			"then the overlay is not editable");
	});

	QUnit.test("when an overlay has a split action in designTime metadata and the selected element has more than one control", function(assert) {

		var oDesignTimeMetadata1 = {
			actions : {
				split : {
					changeType: "splitStuff",
					changeOnRelevantContainer : true,
					isEnabled : true,
					getControlsCount : function(oGroupElement) {
						return 2;
					}
				}
			}
		};
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesignTimeMetadata1);

		sandbox.stub(this.oDesignTime, "getSelection").returns([
			this.oButton1Overlay
		]);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton1Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton1Overlay);

		assert.strictEqual(
			this.oSplitPlugin.isSplitAvailable(this.oButton1Overlay), true,
			"isSplitAvailable is called and returns true");
		assert.strictEqual(
			this.oSplitPlugin.isSplitEnabled(this.oButton1Overlay), true,
			"isSplitEnabled is called and returns true");
	});

	QUnit.test("when isEnabled() is a function in designTime metadata and the selected element contains only one control", function (assert) {

		var oDesignTimeMetadata2 = {
				actions : {
					split : {
						changeType: "splitField",
						changeOnRelevantContainer : true,
						isEnabled : function() {
							return true;
						},
						getControlsCount : function(oElement) {
							return 1;
						}
					}
				}
		};

		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata2);

		sandbox.stub(this.oDesignTime, "getSelection").returns([
			this.oButton2Overlay
		]);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton2Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton2Overlay);

		assert.strictEqual(
			this.oSplitPlugin.isSplitAvailable(this.oButton2Overlay), false,
			"isSplitAvailable is called and returns false");
		assert.strictEqual(
			this.oSplitPlugin.isSplitEnabled(this.oButton2Overlay), false,
			"isSplitEnabled is called and returns false");
	});

	QUnit.test("when there is no getControlsCount() function in designTime metadata", function (assert) {

		var oDesignTimeMetadata3 = {
				actions : {
					split : {
						changeType: "splitField",
						changeOnRelevantContainer : true,
						isEnabled : function() {
							return true;
						}
					}
				}
		};

		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata3);

		sandbox.stub(this.oDesignTime, "getSelection").returns([
			this.oButton2Overlay
		]);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton2Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton2Overlay);

		assert.strictEqual(
			this.oSplitPlugin.isSplitAvailable(this.oButton2Overlay), false,
			"isSplitAvailable is called and returns false");
		assert.strictEqual(
			this.oSplitPlugin.isSplitEnabled(this.oButton2Overlay), false,
			"isSplitEnabled is called and returns false");
	});

	QUnit.test("when two controls are selected", function (assert) {
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		fnSetOverlayDesigntimeMetadata(this.oButton3Overlay, DEFAULT_DTM);

		sandbox.stub(this.oDesignTime, "getSelection").returns([
			this.oButton1Overlay,
			this.oButton3Overlay
		]);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton1Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton1Overlay);

		assert.strictEqual(
			this.oSplitPlugin.isSplitAvailable(this.oButton1Overlay), false,
			"isSplitAvailable is called and returns false");
		assert.strictEqual(
			this.oSplitPlugin.isSplitEnabled(this.oButton1Overlay), false,
			"isSplitEnabled is called and returns false");
	});

	QUnit.test("when handleSplit is called", function(assert) {

		var spy = sandbox.spy(this.oSplitPlugin, "fireElementModified");
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);

		sandbox.stub(this.oDesignTime, "getSelection").returns([
			this.oButton1Overlay
		]);

		this.oSplitPlugin.deregisterElementOverlay(this.oButton1Overlay);
		this.oSplitPlugin.registerElementOverlay(this.oButton1Overlay);

		this.oSplitPlugin.handleSplit(this.oButton1);

		assert.strictEqual(spy.callCount, 1, "fireElementModified is called once");
	});

	QUnit.test("when an overlay has a split action designTime metadata", function(assert) {
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);

		assert.strictEqual(this.oSplitPlugin._isEditable(this.oButton1Overlay), true, "then the overlay is editable");
	});

	QUnit.test("when an overlay has a split action designTime metadata which has no changeOnRelevantContainer", function(assert) {
		this.oButton1Overlay.setDesignTimeMetadata({
			actions : {
				split : {
					changeType: "splitStuff",
					getControlsCount : function(oElement) {
						return 2;
					}
				}
			}
		});

		assert.strictEqual(this.oSplitPlugin._isEditable(this.oButton1Overlay), false, "then the overlay is not editable");
	});

});
