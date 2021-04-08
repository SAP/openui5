/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/LocalReset",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/core/Control",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/LocalResetAPI",
	"sap/ui/thirdparty/sinon-4"
],
function (
	LocalResetPlugin,
	CommandFactory,
	Control,
	DesignTime,
	OverlayRegistry,
	ChangeRegistry,
	FlUtils,
	LocalResetAPI,
	sinon
) {
	"use strict";

	var oMockedAppComponent = {
		getModel: function () {
			return {
				getCurrentVariantReference: function() {
					return undefined;
				}
			};
		}
	};
	var oGetAppComponentForControlStub = sinon.stub(FlUtils, "getAppComponentForControl").returns(oMockedAppComponent);

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a designTime and localReset plugin are instantiated", {
		beforeEach: function(assert) {
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.ui.layout.form.SimpleForm": {
					localReset: "default"
				}
			})
			.then(function() {
				this.oLocalResetPlugin = new LocalResetPlugin({
					commandFactory: new CommandFactory()
				});
				this.oSimpleForm = new Control("fakedSimpleForm", {});
				this.oDesignTime = new DesignTime({
					rootElements: [this.oSimpleForm],
					plugins: [this.oLocalResetPlugin]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oSimpleFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm);
					done();
				}.bind(this));
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oSimpleForm.destroy();
		}
	}, function () {
		QUnit.test("when an overlay has no localReset action designTime metadata", function(assert) {
			this.oSimpleFormOverlay.setDesignTimeMetadata({});

			assert.strictEqual(this.oLocalResetPlugin.isEnabled([this.oSimpleFormOverlay]), false, "... then isEnabled is called, then it returns false");
			assert.strictEqual(this.oLocalResetPlugin._isEditable(this.oSimpleFormOverlay), false, "... then _isEditable is called, then it returns false");
		});

		QUnit.test("when an overlay has localReset action designTime metadata, but has no isEnabled property defined", function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(true);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset"
					}
				}
			});

			assert.strictEqual(this.oLocalResetPlugin.isEnabled([this.oSimpleFormOverlay]), true, "... then isEnabled is called, then it returns true");
			assert.strictEqual(this.oLocalResetPlugin._isEditable(this.oSimpleFormOverlay), true, "... then _isEditable is called, then it returns true");
		});

		QUnit.test("when an overlay has localReset action designTime metadata, and isEnabled property is boolean", function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(true);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset",
						isEnabled: false
					}
				}
			});

			assert.strictEqual(this.oLocalResetPlugin.isEnabled([this.oSimpleFormOverlay]), false, "... then isEnabled is called, then it returns correct value");
			assert.strictEqual(this.oLocalResetPlugin._isEditable(this.oSimpleFormOverlay), true, "... then _isEditable is called, then it returns true");
		});

		QUnit.test("when an overlay has localReset action designTime metadata, and isEnabled is function", function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(true);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset",
						isEnabled: function(oElementInstance) {
							return oElementInstance.getMetadata().getName() !== "sap.ui.core.Control";
						}
					}
				}
			});

			assert.strictEqual(this.oLocalResetPlugin.isEnabled([this.oSimpleFormOverlay]), false, "... then isEnabled is called, then it returns correct value from function call");
			assert.strictEqual(this.oLocalResetPlugin._isEditable(this.oSimpleFormOverlay), true, "... then _isEditable is called, then it returns true");
		});

		QUnit.test("when an overlay has localReset action designTime metadata, and isEnabled is function set to true, but there are no changes for localReset", function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(false);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset",
						isEnabled: function(oElementInstance) {
							return oElementInstance.getMetadata().getName() === "sap.ui.core.Control";
						}
					}
				}
			});

			assert.strictEqual(this.oLocalResetPlugin.isEnabled([this.oSimpleFormOverlay]), false, "... then isEnabled is called, then it returns correct value from function call");
			assert.strictEqual(this.oLocalResetPlugin._isEditable(this.oSimpleFormOverlay), true, "... then _isEditable is called, then it returns true");
		});

		QUnit.test("when handler and getMenuItems is called for an overlay with localReset action designTime metadata, and isEnabled property is boolean", function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(true);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						isEnabled: false
					}
				}
			});

			sandbox.stub(this.oLocalResetPlugin, "isAvailable")
			.onFirstCall().returns(true)
			.onSecondCall().returns(false);
			var oHandlerStub = sandbox.stub(this.oLocalResetPlugin, "handler");
			var oIsEnabledSpy = sandbox.spy(this.oLocalResetPlugin, "isEnabled");

			assert.strictEqual(this.oLocalResetPlugin.isEnabled([this.oSimpleFormOverlay]), false, "... then isEnabled is called, then it returns correct value");
			assert.strictEqual(oIsEnabledSpy.args[0][0][0].getId(), this.oSimpleFormOverlay.getId(), "... and isEnabled is called with the correct overlay");
			assert.strictEqual(this.oLocalResetPlugin._isEditable(this.oSimpleFormOverlay), true, "... then _isEditable is called, then it returns true");
			assert.strictEqual(this.oLocalResetPlugin.getActionName(), "localReset", "... then getActionName returns the correct name");

			var aMenuItems = this.oLocalResetPlugin.getMenuItems([this.oSimpleFormOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_LOCAL_RESET", "'getMenuItems' returns the context menu item for the plugin");

			aMenuItems[0].handler([this.oSimpleFormOverlay]);
			assert.deepEqual(oHandlerStub.args[0][0], [this.oSimpleFormOverlay], "the 'handler' method is called with the right overlays");

			aMenuItems[0].enabled([this.oSimpleFormOverlay]);
			assert.strictEqual(oIsEnabledSpy.args[1][0][0].getId(), this.oSimpleFormOverlay.getId(), "the 'isEnabled' function is called with the correct overlay");

			assert.strictEqual(this.oLocalResetPlugin.getMenuItems([this.oSimpleFormOverlay]).length, 0, "and if the plugin is not enabled, no menu entries are returned");
		});
	});

	QUnit.done(function () {
		oGetAppComponentForControlStub.restore();
		jQuery("#qunit-fixture").hide();
	});
});