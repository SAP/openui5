/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/LocalReset",
	"sap/ui/rta/command/CommandFactory",
	"sap/m/VBox",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/LocalResetAPI",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/m/MessageToast",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/core/Core"
], function (
	LocalResetPlugin,
	CommandFactory,
	VBox,
	DesignTime,
	OverlayRegistry,
	ChangesWriteAPI,
	LocalResetAPI,
	JsControlTreeModifier,
	MessageToast,
	jQuery,
	sinon,
	RtaQunitUtils,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given a designTime and localReset plugin are instantiated", {
		beforeEach: function(assert) {
			var done = assert.async();
			this.oVariantModel = {
				getCurrentVariantReference: function() {
					return undefined;
				}
			};
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(this.oMockedAppComponent, "getModel").returns(this.oVariantModel);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

			this.oLocalResetPlugin = new LocalResetPlugin({
				commandFactory: new CommandFactory()
			});
			this.oNestedForm = new VBox("fakedNestedForm");
			this.oSimpleForm = new VBox("fakedSimpleForm", {
				items: [this.oNestedForm]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oSimpleForm],
				plugins: [this.oLocalResetPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oSimpleFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm);
				this.oNestedFormOverlay = OverlayRegistry.getOverlay(this.oNestedForm);
				done();
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
			this.oMockedAppComponent.destroy();
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
							return oElementInstance.getMetadata().getName() !== "sap.m.VBox";
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

		QUnit.test("when the isEnabled check is called with an element where changeOnRelevantContainer is true", function (assert) {
			this.oNestedFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset",
						changeOnRelevantContainer: true
					}
				}
			});
			var oIsEnabledStub = sandbox.stub(LocalResetAPI, "isResetEnabled");
			this.oLocalResetPlugin.isEnabled([this.oNestedFormOverlay]);

			assert.strictEqual(
				oIsEnabledStub.args[0][0].getId(),
				this.oSimpleForm.getId(),
				"then isEnabled is called with the parent overlay"
			);
		});

		QUnit.test("when the plugin handler is called for a local reset on a variant", function (assert) {
			var oCommandFactoryStub = sandbox.stub(this.oLocalResetPlugin.getCommandFactory(), "getCommandFor");
			sandbox.stub(this.oLocalResetPlugin, "getVariantManagementReference").returns("variantManagement1");
			sandbox.stub(this.oVariantModel, "getCurrentVariantReference").returns("variantManagement1");
			sandbox.stub(JsControlTreeModifier, "bySelector");
			var oMessageToastSpy = sandbox.stub(MessageToast, "show");
			return this.oLocalResetPlugin.handler([this.oSimpleFormOverlay]).then(function () {
				assert.strictEqual(oCommandFactoryStub.firstCall.args[1], "localReset", "then a local reset command is added to the composite command");
				assert.strictEqual(oCommandFactoryStub.secondCall.args[1], "save", "then a save variant command is added to the composite command");
				assert.ok(oMessageToastSpy.called, "then a message toast is shown");
			});
		});

		QUnit.test("when the plugin handler is called for a local reset without a variant", function (assert) {
			var oCommandFactoryStub = sandbox.stub(this.oLocalResetPlugin.getCommandFactory(), "getCommandFor");
			var oMessageToastSpy = sandbox.stub(MessageToast, "show");
			return this.oLocalResetPlugin.handler([this.oSimpleFormOverlay]).then(function () {
				assert.strictEqual(oCommandFactoryStub.firstCall.args[1], "localReset", "then a local reset command is added to the composite command");
				assert.strictEqual(oCommandFactoryStub.callCount, 1, "then no save variant command is added to the composite command");
				assert.ok(oMessageToastSpy.notCalled, "then no message toast is shown");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});