/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/Layer",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/library",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	_omit,
	VariantManagement,
	Layer,
	CommandFactory,
	rtaLibrary,
	sinon,
	FlexTestAPI,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Dummy");

	QUnit.module("ControlVariantConfigure, when calling command factory for configure and undo", {
		async beforeEach() {
			this.oModel = await FlexTestAPI.createVariantModel({
				data: {
					variantMgmtId1: {
						currentVariant: "variant1",
						defaultVariant: "variantMgmtId1",
						variants: [
							{
								key: "variant0",
								layer: Layer.CUSTOMER,
								title: "1"
							},
							{
								key: "variantMgmtId1",
								layer: Layer.CUSTOMER,
								title: "2"
							},
							{
								key: "variant1",
								layer: Layer.CUSTOMER,
								title: "3"
							}
						]
					}
				},
				appComponent: oMockedAppComponent
			});
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
			sandbox.stub(oMockedAppComponent, "getModel").returns(this.oModel);
			this.oAddVariantChangeStub = sandbox.stub(this.oModel, "addVariantChange").returnsArg(1);
			this.oDeleteVariantChangeStub = sandbox.stub(this.oModel, "deleteVariantChange");
			this.oSwitchStub = sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
		},
		afterEach() {
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with setTitle, setFavorite, setVisible and setDefault changes", async function(assert) {
			const oTitleChange = {
				changeType: "setTitle",
				layer: Layer.CUSTOMER,
				originalTitle: "variant A",
				title: "test",
				variantReference: "variant0"
			};
			const oTitleUndoChange = {
				...oTitleChange,
				generator: rtaLibrary.GENERATOR_NAME,
				originalTitle: "test",
				title: "variant A"
			};
			const oFavoriteChange = {
				changeType: "setFavorite",
				favorite: false,
				layer: Layer.CUSTOMER,
				originalFavorite: true,
				variantReference: "variant0"
			};
			const oFavoriteUndoChange = {
				...oFavoriteChange,
				generator: rtaLibrary.GENERATOR_NAME,
				originalFavorite: false,
				favorite: true
			};
			const oVisibleChange = {
				changeType: "setVisible",
				layer: Layer.CUSTOMER,
				variantReference: "variant0",
				visible: false
			};
			const oVisibleUndoChange = { ...oVisibleChange, generator: rtaLibrary.GENERATOR_NAME, visible: true };
			const oContextsChange = {
				changeType: "setContexts",
				layer: Layer.CUSTOMER,
				variantReference: "variant0",
				contexts: { role: ["ROLE1", "ROLE2"], country: ["DE", "IT"] },
				originalContexts: { role: ["OGROLE1", "OGROLE2"], country: ["OR"] }
			};
			const oContextsUndoChange = {
				...oContextsChange,
				generator: rtaLibrary.GENERATOR_NAME,
				originalContexts: { role: ["ROLE1", "ROLE2"], country: ["DE", "IT"] },
				contexts: { role: ["OGROLE1", "OGROLE2"], country: ["OR"] }
			};
			const oDefaultChange = {
				changeType: "setDefault",
				defaultVariant: "variantMgmtId1",
				layer: Layer.CUSTOMER,
				originalDefaultVariant: "variant0",
				variantManagementReference: "variantMgmtId1"
			};
			const oDefaultUndoChange = {
				...oDefaultChange,
				generator: rtaLibrary.GENERATOR_NAME,
				originalDefaultVariant: "variantMgmtId1",
				defaultVariant: "variant0"
			};
			const aChanges = [oTitleChange, oFavoriteChange, oVisibleChange, oContextsChange, oDefaultChange];

			const oConfigureCommand = await CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
				control: this.oVariantManagement,
				changes: aChanges
			}, {}, {layer: Layer.CUSTOMER});

			await oConfigureCommand.execute();

			assert.strictEqual(this.oAddVariantChangeStub.callCount, 5, "5 changes got added");
			const aPreparedChanges = oConfigureCommand.getPreparedChange();
			assert.deepEqual(aPreparedChanges, aChanges, "all changes are saved in the command");
			aPreparedChanges.forEach(function(oChange) {
				assert.equal(oChange.generator, rtaLibrary.GENERATOR_NAME, "the generator was correctly set");
			});
			assert.strictEqual(this.oSwitchStub.callCount, 0, "the variant was not switched");

			await oConfigureCommand.undo();

			assert.strictEqual(this.oDeleteVariantChangeStub.callCount, 5, "all changes got removed");
			assert.deepEqual(
				_omit(this.oDeleteVariantChangeStub.getCall(0).args[1], "appComponent"), oTitleUndoChange,
				"the change was correctly removed"
			);
			assert.deepEqual(
				_omit(this.oDeleteVariantChangeStub.getCall(1).args[1], "appComponent"), oFavoriteUndoChange,
				"the change was correctly removed"
			);
			assert.deepEqual(
				_omit(this.oDeleteVariantChangeStub.getCall(2).args[1], "appComponent"), oVisibleUndoChange,
				"the change was correctly removed"
			);
			assert.deepEqual(
				_omit(this.oDeleteVariantChangeStub.getCall(3).args[1], "appComponent"), oContextsUndoChange,
				"the change was correctly removed"
			);
			assert.deepEqual(
				_omit(this.oDeleteVariantChangeStub.getCall(4).args[1], "appComponent"), oDefaultUndoChange,
				"the change was correctly removed"
			);
			assert.notOk(oConfigureCommand.getPreparedChange(), "the prepared changes got removed");
			assert.strictEqual(this.oSwitchStub.callCount, 0, "the variant was not switched");
		});

		QUnit.test("with deleting the current variant", async function(assert) {
			const oVisibleChange = {
				changeType: "setVisible",
				layer: Layer.CUSTOMER,
				variantReference: "variant1",
				visible: false
			};

			const oConfigureCommand = await CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
				control: this.oVariantManagement,
				changes: [oVisibleChange]
			}, {}, {layer: Layer.CUSTOMER});

			await oConfigureCommand.execute();

			assert.strictEqual(this.oAddVariantChangeStub.callCount, 1, "1 change got added");
			assert.strictEqual(this.oSwitchStub.callCount, 1, "the variant was switched");
			assert.deepEqual(this.oSwitchStub.lastCall.args[0], {
				variantManagementReference: "variantMgmtId1",
				newVariantReference: "variantMgmtId1"
			}, "the correct variant was switched to");

			await oConfigureCommand.undo();

			assert.strictEqual(this.oDeleteVariantChangeStub.callCount, 1, "all changes got removed");
			assert.strictEqual(this.oSwitchStub.callCount, 2, "the variant was switched again");
			assert.deepEqual(this.oSwitchStub.lastCall.args[0], {
				variantManagementReference: "variantMgmtId1",
				newVariantReference: "variant1"
			}, "the correct variant was switched to");
		});
	});

	QUnit.done(function() {
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
