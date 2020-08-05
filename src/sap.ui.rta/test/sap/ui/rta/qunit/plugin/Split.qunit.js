/*global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/Split",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/sinon-4"
],
function (
	jQuery,
	DesignTime,
	CommandFactory,
	OverlayRegistry,
	ChangeRegistry,
	Utils,
	SplitPlugin,
	XMLView,
	sinon
) {
	'use strict';

	var DEFAULT_DTM = {
		actions: {
			split: {
				changeType: "splitStuff",
				changeOnRelevantContainer: true,
				getControlsCount: function () {
					return 3;
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

	var oGetAppComponentForControlStub = sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.done(function () {
		oGetAppComponentForControlStub.restore();
	});

	var sandbox = sinon.sandbox.create();
	var fnSetOverlayDesigntimeMetadata = function(oOverlay, oDesignTimeMetadata) {
		oOverlay.setDesignTimeMetadata(oDesignTimeMetadata);
	};

	QUnit.module("Given a designTime and split plugin are instantiated", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			var oChangeRegistry = ChangeRegistry.getInstance();

			oChangeRegistry.registerControlsForChanges({
				"sap.m.Panel": {
					splitStuff: {
						completeChangeContent: function() {},
						applyChange: function() {},
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				this.oSplitPlugin = new SplitPlugin({
					commandFactory : new CommandFactory()
				});

				this.oView = new XMLView("mockview", {
					viewContent:
						'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
							'<Panel id="panel">' +
								'<Button id="button1" />' +
								'<Button id="button2" />' +
								'<Button id="button3" />' +
							'</Panel>' +
						'</mvc:View>'
				});

				this.oView.placeAt('qunit-fixture');
				sap.ui.getCore().applyChanges();

				this.oButton1 = this.oView.byId("button1");
				this.oButton2 = this.oView.byId("button2");
				this.oButton3 = this.oView.byId("button3");
				this.oPanel = this.oView.byId("panel");

				this.oDesignTime = new DesignTime({
					rootElements: [this.oPanel],
					plugins: [this.oSplitPlugin]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
					this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
					this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
					this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
					fnDone();
				}.bind(this));
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oView.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
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
			return Promise.resolve()
				.then(this.oSplitPlugin._isEditable.bind(this.oSplitPlugin, this.oButton1Overlay))
				.then(function(bEditable) {
					assert.strictEqual(
						bEditable,
						false,
						"then the overlay is not editable"
					);
				});
		});

		QUnit.test("when an overlay has a split action in designTime metadata and the specified element has more than one control", function (assert) {
			var done = assert.async();
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

			this.oDesignTime.attachEventOnce("synced", function() {
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
				done();
			}.bind(this));

			this.oSplitPlugin.deregisterElementOverlay(this.oButton1Overlay);
			this.oSplitPlugin.registerElementOverlay(this.oButton1Overlay);
		});

		QUnit.test("when an overlay has a split action in designTime metadata relevant container has no stable id", function (assert) {
			var done = assert.async();
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
			sandbox.stub(this.oSplitPlugin, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === this.oPanelOverlay) {
					return false;
				}
				return true;
			}.bind(this));

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oSplitPlugin._isEditable(this.oButton1Overlay)
					.then(function(bEditable) {
						assert.strictEqual(
							bEditable,
							false,
							"_isEditable returns false"
						);
						done();
					});
			}.bind(this));

			this.oSplitPlugin.deregisterElementOverlay(this.oButton1Overlay);
			this.oSplitPlugin.registerElementOverlay(this.oButton1Overlay);
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
			var oStub1 = sandbox.stub();
			var oStub2 = oStub1
				.withArgs(
					sinon.match(function (oEvent) {
						var oSplitCommand = oEvent.getParameter("command");
						return oSplitCommand.getNewElementIds().length === this.oPanel.getContent().length;
					}.bind(this))
				);

			this.oSplitPlugin.attachElementModified(oStub1, this);
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);

			this.oSplitPlugin.deregisterElementOverlay(this.oButton1Overlay);
			this.oSplitPlugin.registerElementOverlay(this.oButton1Overlay);

			return this.oSplitPlugin.handleSplit(this.oButton1Overlay)

			.then(function() {
				assert.strictEqual(oStub2.callCount, 1, "fireElementModified is called once with correct arguments");
			})
			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});

		QUnit.test("when an overlay has a split action designTime metadata", function (assert) {
			fnSetOverlayDesigntimeMetadata(this.oButton1Overlay, DEFAULT_DTM);
			return this.oSplitPlugin._isEditable(this.oButton1Overlay)
				.then(function(bEditable) {
					assert.strictEqual(bEditable, true, "then the overlay is editable");
				});
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
			return Promise.resolve()
				.then(this.oSplitPlugin._isEditable.bind(this.oSplitPlugin, this.oButton1Overlay))
				.then(function(bEditable) {
					assert.strictEqual(bEditable, false, "then the overlay is not editable");
				});
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
	});


	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
