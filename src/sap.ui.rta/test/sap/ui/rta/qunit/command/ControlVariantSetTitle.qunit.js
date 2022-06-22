/* global QUnit */

sap.ui.define([
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	VariantManagement,
	Layer,
	flUtils,
	CommandFactory,
	rtaLibrary,
	jQuery,
	sinon,
	FlexTestAPI,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Dummy");

	QUnit.module("FLVariant Set Title", {
		beforeEach: function() {
			var oData = {
				variantMgmtId1: {
					defaultVariant: "variant0",
					variants: [
						{
							author: "Me",
							key: "variant0",
							layer: Layer.CUSTOMER,
							visible: true,
							title: "variant A"
						}
					]
				}
			};
			return FlexTestAPI.createVariantModel({
				data: oData,
				appComponent: this.oMockedAppComponent
			}).then(function(oInitializedModel) {
				this.oModel = oInitializedModel;
				this.oVariantManagement = new VariantManagement("variantMgmtId1");
				this.oVariantManagement.setModel(this.oModel, flUtils.VARIANT_MODEL_NAME);
				sandbox.stub(oMockedAppComponent, "getModel").returns(this.oModel);
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("execute and undo", function(assert) {
			var oSetTitleCommand;
			var sNewText = "Test";
			var oAddChangeStub = sandbox.stub(this.oModel, "addVariantChange").resolves("setTitleChange");
			var oUpdateSpy = sandbox.spy(this.oVariantManagement.getTitle().getBinding("text"), "checkUpdate");
			var oDeleteStub = sandbox.stub(this.oModel, "deleteVariantChange").resolves();

			return CommandFactory.getCommandFor(this.oVariantManagement, "setTitle", {
				newText: sNewText
			}, null, {layer: Layer.CUSTOMER})

			.then(function(oCommand) {
				oSetTitleCommand = oCommand;
				return oSetTitleCommand.execute();
			}).then(function() {
				assert.strictEqual(oSetTitleCommand.getOldText(), "variant A", "the old text was set in the command");
				var mExpectedParams = {
					appComponent: oMockedAppComponent,
					variantReference: "variant0",
					changeType: "setTitle",
					title: sNewText,
					layer: Layer.CUSTOMER,
					generator: rtaLibrary.GENERATOR_NAME
				};
				assert.strictEqual(oAddChangeStub.callCount, 1, "the add function was called once");
				assert.deepEqual(oAddChangeStub.firstCall.args[0], "variantMgmtId1", "the first parameter is the variantManagement reference");
				assert.deepEqual(oAddChangeStub.firstCall.args[1], mExpectedParams, "the second parameter is the correct property bag");
				assert.strictEqual(oUpdateSpy.callCount, 1, "the checkUpdate function was called once on the binding");

				return oSetTitleCommand.undo();
			}).then(function() {
				var mExpectedParams = {
					variantReference: "variant0",
					changeType: "setTitle",
					title: "variant A"
				};
				assert.strictEqual(oDeleteStub.callCount, 1, "the change got deleted");
				assert.strictEqual(oDeleteStub.firstCall.args[0], "variantMgmtId1", "the vm reference was passed");
				assert.deepEqual(oDeleteStub.firstCall.args[1], mExpectedParams, "the propertyBag was passed");
				assert.strictEqual(oDeleteStub.firstCall.args[2], "setTitleChange", "the change was passed");
				assert.strictEqual(oUpdateSpy.callCount, 2, "the checkUpdate function was called again on the binding");
			});
		});
	});

	QUnit.done(function() {
		oMockedAppComponent._restoreGetAppComponentStub();
		oMockedAppComponent.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
