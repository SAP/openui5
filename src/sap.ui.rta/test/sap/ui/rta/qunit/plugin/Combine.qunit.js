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
	Panel
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
		}
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

	QUnit.module("Given a designTime and combine plugin are instantiated", {

		beforeEach : function(assert) {

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Panel": {
					"combineStuff" : { completeChangeContent: function() {} }
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

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oPanel, this.oPanel2],
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
				this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
				this.oPanel2Overlay = OverlayRegistry.getOverlay(this.oPanel2);
				done();
			}.bind(this));

		},

		afterEach : function(assert) {
			sandbox.restore();
			this.oPanel.destroy();
			this.oPanel2.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when an overlay has no combine action in designTime metadata", function(assert) {
		fnSetOverlayDesigntimeMetadata(this.oPanelOverlay, {});
		assert.strictEqual(
			this.oCombinePlugin.isCombineAvailable(this.oPanelOverlay), false,
			"isCombineAvailable is called and returns false");
		assert.strictEqual(
			this.oCombinePlugin.isCombineEnabled(this.oPanelOverlay), false,
			"isCombineEnabled is called and returns false");
		assert.strictEqual(this.oCombinePlugin._isEditable(this.oPanelOverlay), false, "then the overlay is not editable");
	});

	QUnit.test("when an overlay has a combine action in designTime metadata", function(assert) {

		var oDesignTimeMetadata1 = {
				actions : {
					combine : {
						changeType: "combineStuff",
						changeOnRelevantContainer : true,
						isEnabled : true
					}
				}
			};

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

		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesignTimeMetadata1);
		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, oDesignTimeMetadata2);

		sandbox.stub(this.oDesignTime, "getSelection").returns(
				[this.oButton1Overlay, this.oButton2Overlay]);

		assert.strictEqual(
			this.oCombinePlugin.isCombineAvailable(this.oButton1Overlay), true,
			"isCombineAvailable is called and returns true");
		assert.strictEqual(
			this.oCombinePlugin.isCombineEnabled(this.oButton2Overlay), true,
			"isCombineEnabled is called and returns true");
		assert.strictEqual(this.oCombinePlugin._isEditable(this.oButton1Overlay), true, "then the overlay is editable");
	});

	QUnit.test("when only one control is selected", function(assert) {
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		sandbox.stub(this.oDesignTime, "getSelection").returns([this.oButton1Overlay]);

		this.oCombinePlugin.registerElementOverlay(this.oButton1Overlay);
		assert.strictEqual(
			this.oCombinePlugin.isCombineAvailable(this.oButton1Overlay), false,
			"isCombineAvailable is called and returns false");
		assert.strictEqual(
			this.oCombinePlugin.isCombineEnabled(this.oButton1Overlay), false,
			"isCombineEnabled is called and returns false");
	});

	QUnit.test("when four controls are selected", function(assert) {

		sandbox.stub(this.oDesignTime, "getSelection").returns([
			this.oButton1Overlay,
			this.oButton2Overlay,
			this.oButton3Overlay,
			this.oButton4Overlay
		]);

		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, undefined);
		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, undefined);
		fnSetOverlayDesigntimeMetadata(this.oButton3Overlay, undefined);
		fnSetOverlayDesigntimeMetadata(this.oButton4Overlay, undefined);
		assert.strictEqual(
			this.oCombinePlugin.isCombineAvailable(this.oButton1Overlay), true,
			"isCombineAvailable is called and returns true");
		assert.strictEqual(
			this.oCombinePlugin.isCombineEnabled(this.oButton1Overlay), false,
			"isCombineEnabled is called and returns false");
	});

	QUnit.test("when controls from different relevant containers are selected", function(assert) {

		sandbox.stub(this.oDesignTime, "getSelection").returns([
			this.oButton1Overlay,
			this.oButton5Overlay
		]);

		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		fnSetOverlayDesigntimeMetadata(this.oButton5Overlay, DEFAULT_DTM);
		assert.strictEqual(
			this.oCombinePlugin.isCombineAvailable(this.oButton1Overlay), false,
			"isCombineAvailable is called and returns false");
		assert.strictEqual(
			this.oCombinePlugin.isCombineEnabled(this.oButton1Overlay), false,
			"isCombineEnabled is called and returns false");
	});

	QUnit.test("when handleCombine is called with two selected elements", function(assert) {

		var spy = sandbox.spy(this.oCombinePlugin, "fireElementModified");

		sandbox.stub(this.oDesignTime, "getSelection").returns([
			this.oButton1Overlay,
			this.oButton2Overlay
		]);

		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
		fnSetOverlayDesigntimeMetadata(this.oButton2Overlay, DEFAULT_DTM);
		this.oCombinePlugin.handleCombine(this.oButton1);

		assert.ok(spy.calledOnce,
			"fireElementModified is called once");
	});

	QUnit.test("when an overlay has a combine action designTime metadata", function(assert) {
		var oDesigntimeMetadata = {
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
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesigntimeMetadata);
		assert.strictEqual(this.oCombinePlugin._isEditable(this.oButton1Overlay), true, "then the overlay is editable");
	});

	QUnit.test("when an overlay has a combine action designTime metadata which has no changeOnRelevantContainer", function(assert) {
		var oDesigntimeMetadata = {
			actions : {
				combine : {
					changeType: "combineStuff",
					isEnabled : function() {
						return true;
					}
				}
			}
		};
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, oDesigntimeMetadata);
		assert.strictEqual(this.oCombinePlugin._isEditable(this.oButton1Overlay), false, "then the overlay is not editable");
	});

	QUnit.test("when an overlay has no combine action designTime metadata", function(assert) {
		fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, {});
		assert.strictEqual(this.oCombinePlugin._isEditable(this.oButton1Overlay), false, "then the overlay is not editable");
	});

});
