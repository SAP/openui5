/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/Layer",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	_omit,
	VariantManagement,
	Layer,
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

	QUnit.module("ControlVariantConfigure", {
		beforeEach: function() {
			return FlexTestAPI.createVariantModel({
				data: {},
				appComponent: oMockedAppComponent
			}).then(function(oInitializedModel) {
				this.oModel = oInitializedModel;
				this.oVariantManagement = new VariantManagement("variantMgmtId1");
				sandbox.stub(oMockedAppComponent, "getModel").returns(this.oModel);
				this.oAddVariantChangeStub = sandbox.stub(this.oModel, "addVariantChange").returnsArg(1);
				this.oDeleteVariantChangeStub = sandbox.stub(this.oModel, "deleteVariantChange");
				this.oCheckUpdateStub = sandbox.stub(this.oModel, "checkUpdate");
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling command factory for configure and undo with setTitle, setFavorite setVisible and setDefault changes", function(assert) {
			var oTitleChange = {
				changeType: "setTitle",
				layer: Layer.CUSTOMER,
				originalTitle: "variant A",
				title: "test",
				variantReference: "variant0"
			};
			var oTitleUndoChange = Object.assign({}, oTitleChange, {generator: rtaLibrary.GENERATOR_NAME, originalTitle: "test", title: "variant A"});
			var oFavoriteChange = {
				changeType: "setFavorite",
				favorite: false,
				layer: Layer.CUSTOMER,
				originalFavorite: true,
				variantReference: "variant0"
			};
			var oFavoriteUndoChange = Object.assign({}, oFavoriteChange, {generator: rtaLibrary.GENERATOR_NAME, originalFavorite: false, favorite: true});
			var oVisibleChange = {
				changeType: "setVisible",
				layer: Layer.CUSTOMER,
				variantReference: "variant0",
				visible: false
			};
			var oVisibleUndoChange = Object.assign({}, oVisibleChange, {generator: rtaLibrary.GENERATOR_NAME, visible: true});
			var oContextsChange = {
				changeType: "setContexts",
				layer: Layer.CUSTOMER,
				variantReference: "variant0",
				contexts: {role: ["ROLE1", "ROLE2"], country: ["DE", "IT"]},
				originalContexts: {role: ["OGROLE1", "OGROLE2"], country: ["OR"]}
			};
			var oContextsUndoChange = Object.assign({}, oContextsChange, {generator: rtaLibrary.GENERATOR_NAME, originalContexts: {role: ["ROLE1", "ROLE2"], country: ["DE", "IT"]}, contexts: {role: ["OGROLE1", "OGROLE2"], country: ["OR"]}});
			var oDefaultChange = {
				changeType: "setDefault",
				defaultVariant: "variantMgmtId1",
				layer: Layer.CUSTOMER,
				originalDefaultVariant: "variant0",
				variantManagementReference: "variantMgmtId1"
			};
			var oDefaultUndoChange = Object.assign({}, oDefaultChange, {generator: rtaLibrary.GENERATOR_NAME, originalDefaultVariant: "variantMgmtId1", defaultVariant: "variant0"});
			var aChanges = [oTitleChange, oFavoriteChange, oVisibleChange, oContextsChange, oDefaultChange];
			var oConfigureCommand;
			return CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
				control: this.oVariantManagement,
				changes: aChanges
			}, {}, {layer: Layer.CUSTOMER})

			.then(function(oCommand) {
				oConfigureCommand = oCommand;

				return oConfigureCommand.execute();
			}).then(function() {
				assert.strictEqual(this.oAddVariantChangeStub.callCount, 5, "5 changes got added");
				var aPreparedChanges = oConfigureCommand.getPreparedChange();
				assert.deepEqual(aPreparedChanges, aChanges, "all changes are saved in the command");
				aPreparedChanges.forEach(function(oChange) {
					assert.equal(oChange.generator, rtaLibrary.GENERATOR_NAME, "the generator was correctly set");
				});
				assert.strictEqual(this.oCheckUpdateStub.callCount, 1, "the checkUpdate function was called");
				assert.strictEqual(this.oCheckUpdateStub.lastCall.args[0], true, "with true");

				return oConfigureCommand.undo();
			}.bind(this)).then(function() {
				assert.strictEqual(this.oDeleteVariantChangeStub.callCount, 5, "all changes got removed");
				assert.deepEqual(_omit(this.oDeleteVariantChangeStub.getCall(0).args[1], "appComponent"), oTitleUndoChange, "the change was correctly removed");
				assert.deepEqual(_omit(this.oDeleteVariantChangeStub.getCall(1).args[1], "appComponent"), oFavoriteUndoChange, "the change was correctly removed");
				assert.deepEqual(_omit(this.oDeleteVariantChangeStub.getCall(2).args[1], "appComponent"), oVisibleUndoChange, "the change was correctly removed");
				assert.deepEqual(_omit(this.oDeleteVariantChangeStub.getCall(3).args[1], "appComponent"), oContextsUndoChange, "the change was correctly removed");
				assert.deepEqual(_omit(this.oDeleteVariantChangeStub.getCall(4).args[1], "appComponent"), oDefaultUndoChange, "the change was correctly removed");
				assert.strictEqual(this.oCheckUpdateStub.callCount, 2, "the checkUpdate function was called again");
				assert.strictEqual(this.oCheckUpdateStub.lastCall.args[0], true, "with true");
				assert.notOk(oConfigureCommand.getPreparedChange(), "the prepared changes got removed");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		oMockedAppComponent.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
