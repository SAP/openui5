
/* global QUnit */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/_internal/controlVariants/ControlVariantWriteUtils",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	JsControlTreeModifier,
	Control,
	Applier,
	Reverter,
	FlexObjectFactory,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ControlVariantApplyAPI,
	Settings,
	VariantManagement,
	VariantManager,
	VariantModel,
	ControlVariantWriteUtils,
	UIChangeManager,
	FlexObjectManager,
	FlexControllerFactory,
	Layer,
	Utils,
	sinon,
	RtaQunitUtils
) {
	"use strict";
	const sandbox = sinon.createSandbox();
	const sVMReference = "variantManagementId1";
	const sReference = "myFlexReference";
	const oComponent = RtaQunitUtils.createAndStubAppComponent(sinon, sReference);
	const oFlexController = FlexControllerFactory.create(sReference);

	function createChanges(sReference, sLayer, sVariantReference) {
		var oChange1 = FlexObjectFactory.createFromFileContent({
			fileName: "change1",
			layer: sLayer || Layer.USER, // Changes are on user layer until they are saved to a variant
			selector: {
				id: "abc123"
			},
			variantReference: sVariantReference || "variant1"
		});
		var oChange2 = FlexObjectFactory.createFromFileContent({
			fileName: "change2",
			layer: sLayer || Layer.USER,
			selector: {
				id: "abc123"
			},
			variantReference: sVariantReference || "variant1"
		});
		var oChange3 = FlexObjectFactory.createFromFileContent({
			fileName: "change3",
			layer: sLayer || Layer.USER,
			selector: {
				id: "abc123"
			},
			variantReference: sVariantReference || "variant1"
		});
		return FlexObjectManager.addDirtyFlexObjects(sReference, [oChange1, oChange2, oChange3]);
	}

	function createVariant(mVariantProperties) {
		return FlexObjectFactory.createFlVariant({
			id: mVariantProperties.fileName || mVariantProperties.key,
			reference: mVariantProperties.reference || sReference,
			layer: mVariantProperties.layer,
			user: mVariantProperties.author,
			variantReference: mVariantProperties.variantReference,
			variantManagementReference: mVariantProperties.variantManagementReference || sVMReference,
			variantName: mVariantProperties.title,
			contexts: mVariantProperties.contexts
		});
	}

	function stubFlexObjectsSelector(aFlexObjects) {
		var oFlexObjectsSelector = FlexState.getFlexObjectsDataSelector();
		var oGetFlexObjectsStub = sandbox.stub(oFlexObjectsSelector, "get");
		oGetFlexObjectsStub.callsFake(function(...aArgs) {
			return aFlexObjects.concat(oGetFlexObjectsStub.wrappedMethod.apply(this, aArgs));
		});
		oFlexObjectsSelector.checkUpdate();
	}

	QUnit.module("moduleName", {
		beforeEach() {
			stubFlexObjectsSelector([
				createVariant({
					author: ControlVariantWriteUtils.DEFAULT_AUTHOR,
					key: sVMReference,
					layer: Layer.VENDOR,
					title: "Standard",
					contexts: {}
				}),
				createVariant({
					author: "Me",
					key: "variant0",
					layer: Layer.CUSTOMER,
					title: "variant A",
					contexts: { role: ["ADMINISTRATOR", "HR"], country: ["DE"] }
				}),
				createVariant({
					author: "Me",
					key: "variant1",
					layer: Layer.PUBLIC,
					variantReference: sVMReference,
					title: "variant B",
					favorite: false,
					executeOnSelect: true,
					contexts: { role: ["ADMINISTRATOR"], country: ["DE"] }
				}),
				createVariant({
					author: "Not Me",
					key: "variant2",
					layer: Layer.PUBLIC,
					variantReference: sVMReference,
					title: "variant C",
					favorite: false,
					executeOnSelect: true,
					contexts: {}
				}),
				createVariant({
					author: "Me",
					key: "variant3",
					layer: Layer.USER,
					variantReference: sVMReference,
					title: "variant D",
					favorite: false,
					executeOnSelect: true,
					contexts: { role: [], country: [] }
				}),
				FlexObjectFactory.createUIChange({
					id: "setDefaultVariantChange",
					layer: Layer.CUSTOMER,
					changeType: "setDefault",
					fileType: "ctrl_variant_management_change",
					selector: {
						id: sVMReference
					},
					content: {
						defaultVariant: "variant1"
					}
				}),
				FlexObjectFactory.createUIChange({
					id: "setFavoriteChange",
					layer: Layer.CUSTOMER,
					changeType: "setFavorite",
					fileType: "ctrl_variant_change",
					selector: {
						id: "variant1"
					},
					content: {
						favorite: false
					}
				}),
				FlexObjectFactory.createUIChange({
					id: "setExecuteOnSelectChange",
					layer: Layer.CUSTOMER,
					changeType: "setExecuteOnSelect",
					fileType: "ctrl_variant_change",
					selector: {
						id: "variant1"
					},
					content: {
						executeOnSelect: true
					}
				})
			]);

			this.oVMControl = new VariantManagement(sVMReference);
			this.oModel = new VariantModel({}, {
				flexController: oFlexController,
				appComponent: oComponent
			});
			oComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			return this.oModel.initialize();
		},
		afterEach() {
			this.oVMControl.destroy();
			this.oModel.destroy();
			FlexState.clearState();
			FlexState.clearRuntimeSteadyObjects(sReference, sReference);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When eraseDirtyChangesOnVariant is called", async function(assert) {
			const aDummyChanges = ["c1", "c2"];

			const oRevertMultipleChangesStub = sandbox.stub(Reverter, "revertMultipleChanges");
			const oGetControlChangesForVariantStub = sandbox.stub(VariantManagementState, "getControlChangesForVariant");
			sandbox.stub(this.oModel, "_getDirtyChangesFromVariantChanges").returns(aDummyChanges);
			sandbox.stub(FlexObjectManager, "deleteFlexObjects");

			const aChanges = await VariantManager.eraseDirtyChangesOnVariant("vm1", "v1", oComponent);
			assert.deepEqual(aChanges, aDummyChanges, "then the correct changes are returned");
			assert.ok(oRevertMultipleChangesStub.calledOnce, "then the changes were reverted");
			assert.ok(oGetControlChangesForVariantStub.calledOnce, "then are changes are retrieved for the variant");
		});

		QUnit.test("When addAndApplyChangesOnVariant is called", async function(assert) {
			const oControl = new Control("control");
			var aDummyChanges = [
				{
					fileName: "c1",
					getSelector() { return {id: "control"}; }
				},
				{
					fileName: "c2",
					getSelector() { return {id: "control"}; }
				}
			];
			const oAddChangesStub = sandbox.stub(UIChangeManager, "addDirtyChanges").returnsArg(1);
			var oApplyChangeStub = sandbox.stub(Applier, "applyChangeOnControl").resolves({success: true});
			sandbox.stub(JsControlTreeModifier, "getControlIdBySelector");

			await VariantManager.addAndApplyChangesOnVariant(aDummyChanges, oComponent);
			assert.strictEqual(oAddChangesStub.lastCall.args[1].length, 2, "then every change in the array was added");
			assert.ok(oApplyChangeStub.calledTwice, "then every change in the array was applied");
			oControl.destroy();
		});

		[true, false].forEach(function(bVendorLayer) {
			QUnit.test(bVendorLayer ? "when calling 'copyVariant' in VENDOR layer" : "when calling 'copyVariant'", async function(assert) {
				sandbox.stub(Settings, "getInstanceOrUndef").returns({
					getUserId() {return "test user";}
				});
				sandbox.stub(JsControlTreeModifier, "getSelector").returns({id: sVMReference});
				var oAddDirtyChangesSpy = sandbox.spy(FlexObjectManager, "addDirtyFlexObjects");

				var mPropertyBag = {
					sourceVariantReference: sVMReference,
					variantManagementReference: sVMReference,
					appComponent: oComponent,
					generator: "myFancyGenerator",
					newVariantReference: "potato",
					layer: bVendorLayer ? Layer.VENDOR : Layer.CUSTOMER,
					additionalVariantChanges: []
				};
				sandbox.stub(this.oModel, "updateCurrentVariant").resolves();

				const aChanges = await VariantManager.copyVariant(mPropertyBag);
				var oNewVariant = this.oModel.oData[sVMReference].variants.find(function(oVariant) {
					return oVariant.key === "potato";
				});
				assert.ok(oAddDirtyChangesSpy.calledOnce, "then the changes were added");
				assert.ok(oNewVariant.rename, "then the property was added correctly");
				assert.ok(oNewVariant.change, "then the property was added correctly");
				assert.ok(oNewVariant.remove, "then the property was added correctly");
				assert.strictEqual(oNewVariant.sharing, this.oModel.sharing.PUBLIC, "then the property was added correctly");
				assert.strictEqual(
					aChanges[0].getId(), "potato",
					"then the returned variant is the duplicate variant"
				);
			});
		});

		QUnit.test("when calling 'copyVariant' with public layer", async function(assert) {
			var oVariantData = {
				instance: createVariant({
					fileName: "variant0",
					variantManagementReference: sVMReference,
					variantReference: "",
					layer: Layer.PUBLIC,
					title: "Text for TextDemo",
					author: ""
				}),
				controlChanges: [],
				variantChanges: {}
			};
			const oAddDirtyFlexObjectsStub = sandbox.stub(FlexObjectManager, "addDirtyFlexObjects").returnsArg(1);

			sandbox.stub(this.oModel, "_duplicateVariant").returns(oVariantData);
			sandbox.stub(JsControlTreeModifier, "getSelector").returns({id: sVMReference});
			sandbox.stub(this.oModel, "updateCurrentVariant").resolves();

			var mPropertyBag = {
				variantManagementReference: sVMReference,
				appComponent: oComponent,
				generator: "myFancyGenerator",
				layer: Layer.PUBLIC,
				additionalVariantChanges: []
			};
			const aChanges = await VariantManager.copyVariant(mPropertyBag);
			assert.ok(this.oModel.getVariant("variant0", sVMReference), "then variant added to VariantModel");
			assert.strictEqual(oVariantData.instance.getFavorite(), false, "then variant has favorite set to false");
			assert.strictEqual(aChanges.length, 2, "then there are 2 changes");
			assert.strictEqual(aChanges[0].getLayer(), Layer.USER, "the first change is a user layer change");
			assert.strictEqual(aChanges[0].getChangeType(), "setFavorite", "with changeType 'setFavorite'");
			assert.deepEqual(aChanges[0].getContent(), {favorite: true}, "and favorite set to true");
			assert.strictEqual(aChanges[1].getLayer(), Layer.PUBLIC, "then the second change is a public layer change");
			assert.strictEqual(
				aChanges[1].getId(),
				oVariantData.instance.getId(),
				"then the returned variant is the duplicate variant"
			);
			assert.equal(
				oAddDirtyFlexObjectsStub.firstCall.args[1].length,
				2,
				"then both changes are added as dirty changes"
			);
		});

		QUnit.test("when calling 'removeVariant' with a component", async function(assert) {
			const fnDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			const oChangeInVariant = {
				fileName: "change0",
				variantReference: "variant0",
				layer: Layer.VENDOR,
				getId() {
					return this.fileName;
				},
				getVariantReference() {
					return this.variantReference;
				}
			};
			const oVariant = {
				fileName: "variant0",
				getId() {
					return this.fileName;
				}
			};
			const aDummyDirtyChanges = [oVariant].concat(oChangeInVariant);

			const fnUpdateCurrentVariantSpy = sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
			sandbox.stub(FlexObjectState, "getDirtyFlexObjects").returns(aDummyDirtyChanges);

			assert.strictEqual(this.oModel.oData[sVMReference].variants.length, 5, "then initial length is 5");
			const mPropertyBag = {
				variant: oVariant,
				sourceVariantReference: "sourceVariant",
				variantManagementReference: sVMReference,
				appComponent: oComponent
			};
			await VariantManager.removeVariant(mPropertyBag);
			assert.deepEqual(fnUpdateCurrentVariantSpy.getCall(0).args[0], {
				variantManagementReference: mPropertyBag.variantManagementReference,
				newVariantReference: mPropertyBag.sourceVariantReference,
				appComponent: mPropertyBag.component
			}, "then updateCurrentVariant() called with the correct parameters");
			assert.ok(fnDeleteFlexObjectsStub.calledOnce, "then FlexObjectManager.deleteFlexObjects called once");
			assert.strictEqual(fnDeleteFlexObjectsStub.lastCall.args[0].flexObjects.length, 2, "with both changes");
			assert.strictEqual(
				fnDeleteFlexObjectsStub.lastCall.args[0].flexObjects[0],
				oVariant,
				"then FlexObjectManager.deleteFlexObjects called including variant"
			);
			assert.strictEqual(
				fnDeleteFlexObjectsStub.lastCall.args[0].flexObjects[1],
				oChangeInVariant,
				"then FlexObjectManager.deleteFlexObjects called including change in variant"
			);
		});

		QUnit.test("when calling 'handleSaveEvent' with parameter from SaveAs button and default/execute box checked", async function(assert) {
			const aChanges = createChanges(sReference);
			const sCopyVariantName = "variant1";
			const oParameters = {
				overwrite: false,
				name: "Test",
				def: true,
				execute: true,
				contexts: {
					role: ["testRole"]
				}
			};
			const sUserName = "testUser";
			const oResponse = {response: [{fileName: sCopyVariantName, fileType: "ctrl_variant", support: {user: sUserName}}]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			const oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);
			const oDeleteFlexObjectsSpy = sandbox.spy(FlexObjectManager, "deleteFlexObjects");
			const oCopyVariantSpy = sandbox.spy(VariantManager, "copyVariant");
			const oCreateChangeSpy = sandbox.spy(FlexObjectFactory, "createUIChange");
			const oCreateDefaultFileNameSpy = sandbox.spy(Utils, "createDefaultFileName");

			await VariantManager.handleSaveEvent(this.oVMControl, oParameters, this.oModel);
			const sNewVariantReference = oCreateDefaultFileNameSpy.getCall(0).returnValue;
			assert.strictEqual(
				oCreateDefaultFileNameSpy.getCall(0).args[0],
				"flVariant",
				"then the file type was passed to sap.ui.fl.Utils.createDefaultFileName"
			);
			assert.strictEqual(oCreateChangeSpy.callCount, 2, "two changes were created");
			assert.ok(oCopyVariantSpy.calledOnce, "then copyVariant() was called once");
			assert.deepEqual(oCopyVariantSpy.lastCall.args[0], {
				appComponent: oComponent,
				layer: Layer.USER,
				currentVariantComparison: -1,
				generator: undefined,
				contexts: {
					role: ["testRole"]
				},
				newVariantReference: sNewVariantReference,
				sourceVariantReference: sCopyVariantName,
				title: "Test",
				variantManagementReference: sVMReference,
				adaptationId: undefined,
				additionalVariantChanges: [oCreateChangeSpy.getCall(0).returnValue, oCreateChangeSpy.getCall(1).returnValue]
			}, "then copyVariant() was called with the right parameters");

			assert.strictEqual(oSaveDirtyChangesStub.callCount, 1, "then dirty changes were saved");
			assert.strictEqual(
				oSaveDirtyChangesStub.args[0][2].length, 6,
				"then six dirty changes were saved (new variant, 3 copied ctrl changes, setDefault change, setExecuteOnSelect change"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledBefore(oSaveDirtyChangesStub),
				"the changes were deleted from default variant before the copied variant was saved"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledWith({
					reference: sReference, flexObjects: aChanges.reverse()
				}), // the last change is reverted first
				"then dirty changes from source variant were deleted from the persistence (in the right order)"
			);

			const oAffectedVariant = this.oModel.getData()[sVMReference].variants.find((oVariant) => {
				return oVariant.key === sCopyVariantName;
			});
			// Only check the support user, the author is handled independently
			assert.strictEqual(
				oAffectedVariant.instance.getSupportInformation().user,
				sUserName,
				"then 'testUser' is set as support user"
			);
		});

		QUnit.test("when calling 'handleSaveEvent' with parameter from SaveAs button and default/execute and public box checked", async function(assert) {
			const aChanges = createChanges(sReference);
			const sCopyVariantName = "variant1";
			const oParameters = {
				overwrite: false,
				"public": true,
				name: "Test",
				def: true,
				execute: true,
				contexts: {
					role: ["testRole"]
				}
			};
			const sUserName = "testUser";
			const oResponse = {response: [{fileName: sCopyVariantName, fileType: "ctrl_variant", support: {user: sUserName}}]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			const oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);
			const oDeleteFlexObjectsSpy = sandbox.spy(FlexObjectManager, "deleteFlexObjects");
			const oCopyVariantSpy = sandbox.spy(VariantManager, "copyVariant");
			const oCreateDefaultFileNameSpy = sandbox.spy(Utils, "createDefaultFileName");
			const oCreateChangeSpy = sandbox.spy(FlexObjectFactory, "createUIChange");

			await VariantManager.handleSaveEvent(this.oVMControl, oParameters, this.oModel);
			const sNewVariantReference = oCreateDefaultFileNameSpy.getCall(0).returnValue;
			assert.strictEqual(
				oCreateDefaultFileNameSpy.getCall(0).args[0],
				"flVariant",
				"then the file type was passed to sap.ui.fl.Utils.createDefaultFileName"
			);
			assert.ok(oCopyVariantSpy.calledOnce, "then copyVariant() was called once");
			assert.strictEqual(oCreateChangeSpy.callCount, 3, "three changes were created");
			assert.deepEqual(oCopyVariantSpy.lastCall.args[0], {
				appComponent: oComponent,
				layer: Layer.PUBLIC,
				currentVariantComparison: 0,
				generator: undefined,
				contexts: {
					role: ["testRole"]
				},
				newVariantReference: sNewVariantReference,
				sourceVariantReference: sCopyVariantName,
				title: "Test",
				variantManagementReference: sVMReference,
				adaptationId: undefined,
				additionalVariantChanges: [oCreateChangeSpy.getCall(0).returnValue, oCreateChangeSpy.getCall(1).returnValue]
			}, "then copyVariant() was called with the right parameters");

			assert.strictEqual(
				oSaveDirtyChangesStub.callCount, 1,
				"then dirty changes were saved"
			);
			assert.strictEqual(
				oSaveDirtyChangesStub.args[0][2].length, 7,
				"then a new variant, 3 copied ctrl changes, setDefault change, setExecuteOnSelect change, setFavorite change were saved"
			);
			assert.strictEqual(
				oSaveDirtyChangesStub.args[0][2][0].getChangeType(), "setFavorite",
				"then a setFavorite change was added"
			);
			assert.strictEqual(
				oSaveDirtyChangesStub.args[0][2][5].getChangeType(), "setDefault",
				"the last change was 'setDefault'"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledBefore(oSaveDirtyChangesStub),
				"the changes were deleted from default variant before the copied variant was saved"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledWith({
					reference: sReference, flexObjects: aChanges.reverse()
				}), // the last change is reverted first
				"then dirty changes from source variant were deleted from the persistence (in the right order)"
			);
			this.oModel.getData()[sVMReference].variants.forEach(function(oVariant) {
				if (oVariant.key === sCopyVariantName) {
					assert.strictEqual(
						oVariant.instance.getSupportInformation().user,
						sUserName,
						"then 'testUser' is set as support user"
					);
				}
			});
		});

		QUnit.test("when calling 'handleSaveEvent' with parameter from Save button", async function(assert) {
			createChanges(sReference);
			const oParameters = {
				overwrite: true,
				name: "Test"
			};

			var oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves({
				response: [{fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]
			});
			var oCopyVariantSpy = sandbox.spy(VariantManager, "copyVariant");
			var oSetVariantPropertiesSpy = sandbox.spy(this.oModel, "setVariantProperties");

			await VariantManager.handleSaveEvent(this.oVMControl, oParameters, this.oModel);
			assert.ok(oCopyVariantSpy.notCalled, "copyVariant is not called");
			assert.ok(oSetVariantPropertiesSpy.notCalled, "SetVariantProperties is not called");
			assert.ok(oSaveDirtyChangesStub.calledOnce, "SaveAll is called");
			oSaveDirtyChangesStub.getCall(0).args[2].forEach((oChange) => {
				assert.equal(oChange.getLayer(), Layer.PUBLIC, "layer of dirty change is PUBLIC layer when source variant is PUBLIC");
			});
			assert.notOk(this.oModel.getData()[sVMReference].modified, "then the modified flag is reset");
		});

		QUnit.test("when calling 'handleSaveEvent' on a USER variant with setDefault, executeOnSelect and public boxes checked", async function(assert) {
			createChanges(sReference);
			var sCopyVariantName = "variant1";
			const oParameters = {
				name: "Test",
				def: true,
				"public": true,
				execute: true
			};
			var sUserName = "testUser";
			var oResponse = {response: [
				{fileName: "id_123_setFavorite", fileType: "setFavorite"},
				{fileName: sCopyVariantName, fileType: "ctrl_variant", support: {user: sUserName}}
			]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			var oCopyVariantSpy = sandbox.spy(VariantManager, "copyVariant");
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);

			await VariantManager.handleSaveEvent(this.oVMControl, oParameters, this.oModel);
			assert.ok(
				oCopyVariantSpy.calledOnceWith(sinon.match({
					layer: Layer.PUBLIC
				})),
				"then the variant is created on the PUBLIC layer"
			);
		});

		QUnit.test("when calling 'handleSaveEvent' with parameter from SaveAs button and default box unchecked", async function(assert) {
			const aChanges = createChanges(sReference);
			const sCopyVariantName = "variant1";
			const oParameters = {
				overwrite: false,
				name: "Test",
				def: false,
				execute: false,
				contexts: {
					role: ["testRole"]
				}
			};
			const sUserName = "testUser";
			const oResponse = {response: [{fileName: sCopyVariantName, fileType: "ctrl_variant", support: {user: sUserName}}]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			const oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);
			const oDeleteFlexObjectsSpy = sandbox.spy(FlexObjectManager, "deleteFlexObjects");
			const oCopyVariantSpy = sandbox.spy(VariantManager, "copyVariant");
			const oAddVariantChangeSpy = sandbox.spy(VariantManager, "addVariantChange");
			const oCreateDefaultFileNameSpy = sandbox.spy(Utils, "createDefaultFileName");

			await VariantManager.handleSaveEvent(this.oVMControl, oParameters, this.oModel);
			const sNewVariantReference = oCreateDefaultFileNameSpy.getCall(0).returnValue;
			assert.strictEqual(
				oCreateDefaultFileNameSpy.getCall(0).args[0],
				"flVariant",
				"then the file type was passed to sap.ui.fl.Utils.createDefaultFileName"
			);
			assert.ok(oCopyVariantSpy.calledOnce, "then copyVariant() was called once");
			assert.deepEqual(oCopyVariantSpy.lastCall.args[0], {
				appComponent: oComponent,
				layer: Layer.USER,
				currentVariantComparison: -1,
				generator: undefined,
				contexts: {
					role: ["testRole"]
				},
				newVariantReference: sNewVariantReference,
				sourceVariantReference: sCopyVariantName,
				title: "Test",
				variantManagementReference: sVMReference,
				adaptationId: undefined,
				additionalVariantChanges: []
			}, "then copyVariant() was called with the right parameters");

			assert.ok(oAddVariantChangeSpy.notCalled, "then no new changes were created");
			assert.strictEqual(oSaveDirtyChangesStub.callCount, 1, "then dirty changes were saved");
			assert.strictEqual(
				oSaveDirtyChangesStub.args[0][2].length,
				4,
				"then six dirty changes were saved (new variant, 3 copied ctrl changes"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledBefore(oSaveDirtyChangesStub),
				"the changes were deleted from default variant before the copied variant was saved"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledWith({
					reference: sReference, flexObjects: aChanges.reverse()
				}), // the last change is reverted first
				"then dirty changes from source variant were deleted from the persistence (in the right order)"
			);
			this.oModel.getData()[sVMReference].variants.forEach(function(oVariant) {
				if (oVariant.key === sCopyVariantName) {
					assert.strictEqual(
						oVariant.instance.getSupportInformation().user,
						sUserName,
						"then 'testUser' is set as support user"
					);
				}
			});
		});

		QUnit.test("when calling 'handleSaveEvent' with bDesignTimeMode set to true and parameters from SaveAs button and default/execute box checked", async function(assert) {
			const sNewVariantReference = "variant2";
			const aChanges = createChanges(sReference, Layer.CUSTOMER, "variant0");
			const sCopyVariantName = "variant0";
			const mParameters = {
				overwrite: false,
				name: "Key User Test Variant",
				def: true,
				execute: true,
				layer: Layer.CUSTOMER,
				newVariantReference: sNewVariantReference,
				generator: "myFancyGenerator",
				contexts: {
					role: ["testRole"]
				}
			};
			const sUserName = "testUser";
			const oResponse = {response: [
				{fileName: "id_123_setFavorite", fileType: "setFavorite"},
				{fileName: sCopyVariantName, fileType: "ctrl_variant", support: {user: sUserName}}
			]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			const oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").callsFake(function() {
				return Promise.resolve(oResponse);
			});
			const oDeleteFlexObjectsSpy = sandbox.spy(FlexObjectManager, "deleteFlexObjects");
			const oCopyVariantSpy = sandbox.spy(VariantManager, "copyVariant");
			const oCreateChangeSpy = sandbox.spy(FlexObjectFactory, "createUIChange");

			// Copy a variant from the CUSTOMER layer
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});
			this.oModel._bDesignTimeMode = true;
			const aDirtyChanges = await VariantManager.handleSaveEvent(this.oVMControl, mParameters, this.oModel);
			assert.ok(oCopyVariantSpy.calledOnce, "then copyVariant() was called once");
			assert.strictEqual(oCreateChangeSpy.callCount, 2, "two changes were created");
			assert.deepEqual(oCopyVariantSpy.lastCall.args[0], {
				appComponent: oComponent,
				layer: Layer.CUSTOMER,
				currentVariantComparison: 0,
				generator: "myFancyGenerator",
				newVariantReference: sNewVariantReference,
				sourceVariantReference: sCopyVariantName,
				title: "Key User Test Variant",
				variantManagementReference: sVMReference,
				contexts: {
					role: ["testRole"]
				},
				adaptationId: undefined,
				additionalVariantChanges: [oCreateChangeSpy.getCall(0).returnValue, oCreateChangeSpy.getCall(1).returnValue]
			}, "then copyVariant() was called with the right parameters");
			assert.strictEqual(oSaveDirtyChangesStub.callCount, 0, "then dirty changes were not saved");
			assert.strictEqual(
				aDirtyChanges.length,
				6,
				"then six dirty changes were created (new variant, 3 copied ctrl changes, setDefault change, setExecuteOnSelect change"
			);
			assert.strictEqual(aDirtyChanges[4].getChangeType(), "setDefault", "the last change was 'setDefault'");
			assert.strictEqual(aDirtyChanges[0].getLayer(), Layer.CUSTOMER, "the ctrl change has the correct layer");
			assert.ok(
				oDeleteFlexObjectsSpy.calledBefore(oSaveDirtyChangesStub),
				"the changes were deleted from default variant before the copied variant was saved"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledWith({
					reference: sReference, flexObjects: aChanges.reverse()
				}), // the last change is reverted first
				"then dirty changes from source variant were deleted from the persistence (in the right order)"
			);
		});
	});

	QUnit.done(function() {
		oComponent._restoreGetAppComponentStub();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
