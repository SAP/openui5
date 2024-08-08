/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Control,
	UIComponent,
	FlexObjectFactory,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	Version,
	Settings,
	SessionStorageConnector,
	CompVariantState,
	FlexObjectManager,
	Versions,
	FlexControllerFactory,
	Layer,
	Utils,
	JSONModel,
	sinon,
	FlQUnitUtils,
	RtaQunitUtils
) {
	"use strict";
	const sandbox = sinon.createSandbox();
	const sReference = "test.selector.id";
	const sComponentId = "componentId";

	function createTwoChangeDefs() {
		const oChange1 = {
			fileName: "change1",
			fileType: "change",
			selector: {},
			changeType: "renameField",
			layer: Layer.USER
		};
		const oChange2 = {
			fileName: "change2",
			fileType: "change",
			selector: {},
			changeType: "addGroup",
			layer: Layer.USER
		};
		return [oChange1, oChange2];
	}

	function createChange(sId, sLayer, oSelector, sGenerator) {
		return FlexObjectFactory.createFromFileContent(
			{
				fileType: "change",
				fileName: sId || "fileNameChange0",
				layer: sLayer || Layer.USER,
				reference: "appComponentReference",
				namespace: "namespace",
				selector: oSelector,
				support: {
					generator: sGenerator
				}
			}
		);
	}

	function addDirtyChanges() {
		FlexObjectManager.addDirtyFlexObjects(sReference, [createChange(), createChange()]);
	}

	QUnit.module("getFlexObjects / saveFlexObjects", {
		before() {
			return Settings.getInstance();
		},
		beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForSelector").returns(sReference);
			const Component = UIComponent.extend(sComponentId, {
				metadata: {
					manifest: {
						"sap.app": {
							id: sReference
						}
					}
				}
			});
			this.oAppComponent = new Component(sComponentId);
		},
		afterEach() {
			SessionStorageConnector.reset({
				reference: sReference,
				layer: Layer.USER
			});
			this.oAppComponent.destroy();
			FlexState.clearState(sReference);
			FlexState.clearRuntimeSteadyObjects(sReference, this.oAppComponent.getId());
			FlexState.resetInitialNonFlCompVariantData(sReference);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Get - Given no flex objects are present", async function(assert) {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference);
			return FlexObjectManager.getFlexObjects({
				selector: this.oAppComponent,
				currentLayer: Layer.CUSTOMER
			})
			.then(function(aFlexObjects) {
				assert.strictEqual(aFlexObjects.length, 0, "an empty array is returned");
			});
		});

		QUnit.test("when flex objects are requested and no variant management model exists", async function(assert) {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
				changes: [{
					fileName: "change1",
					selector: {},
					changeType: "renameField",
					layer: Layer.USER,
					variantReference: "variant1"
				}],
				variants: [{
					fileName: "variant1",
					fileType: "ctrl_variant",
					selector: {},
					changeType: "FlVariant",
					layer: Layer.USER,
					variantManagementReference: "foobar",
					variantReference: "otherVariantReference"
				}]
			});

			const aFlexObjects = await FlexObjectManager.getFlexObjects({
				selector: this.oAppComponent,
				includeCtrlVariants: true
			});
			assert.strictEqual(aFlexObjects.length, 3, "then three flex objects are returned correctly");
			const aFilenames = aFlexObjects.map((oFlexObject) => oFlexObject.getId());
			assert.ok(aFilenames.indexOf("change1") > -1, "then the change is returned");
			assert.ok(aFilenames.indexOf("variant1") > -1, "then the variant is returned");
			assert.ok(aFilenames.indexOf("foobar") > -1, "then the standard variant is returned");
		});

		QUnit.test("Get - Given flex objects are present in the CompVariantState", async function(assert) {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference);
			const sPersistencyKey = "persistency.key";
			const oControl = new Control();
			oControl.getPersistencyKey = function() {
				return sPersistencyKey;
			};
			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {},
					id: "myId"
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				favorite: true,
				id: "myId",
				layer: Layer.USER,
				control: oControl,
				reference: sReference,
				persistencyKey: sPersistencyKey
			});

			return FlexObjectManager.getFlexObjects({
				selector: this.oAppComponent
			})
			.then(function(aFlexObjects) {
				assert.strictEqual(aFlexObjects.length, 2, "an array with two entries is returned");
				assert.strictEqual(aFlexObjects[0].getChangeType(), "pageVariant", "the variant from the compVariantState is present");
				assert.strictEqual(aFlexObjects[1].getChangeType(), "updateVariant", "the change from the compVariantState is present");
			});
		});

		QUnit.test("Get - Given no flex objects are present in the CompVariantState + ChangePersistence but only Standard variant and invalidateCache is true", async function(assert) {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference);
			const sPersistencyKey = "persistency.key";
			const oControl = new Control();
			oControl.getPersistencyKey = function() {
				return sPersistencyKey;
			};
			FlexState.setInitialNonFlCompVariantData(sReference, sPersistencyKey,
				{
					executeOnSelection: false,
					id: "*standard*",
					name: "Standard"
				}
			);
			return FlexObjectManager.getFlexObjects({
				selector: this.oAppComponent,
				invalidateCache: true
			})
			.then(function(aFlexObjects) {
				assert.strictEqual(aFlexObjects.length, 1, "an array with 1 entries is returned");
				assert.strictEqual(aFlexObjects[0].getVariantId(), "*standard*", "the standard variant is present");
			});
		});

		QUnit.test("Get - Given flex objects are present in the CompVariantState + ChangePersistence + invalidateCache is true", async function(assert) {
			const sPersistencyKey = "persistency.key";
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
				changes: createTwoChangeDefs(),
				comp: {
					variants: [{
						fileName: "variant1",
						fileType: "variant",
						content: {},
						changeType: "pageVariant",
						reference: sReference,
						persistencyKey: sPersistencyKey
					}],
					changes: [
						{
							fileName: "change12",
							content: {
								favorite: true
							},
							changeType: "updateVariant",
							selector: {
								variantId: "variant1",
								persistencyKey: sPersistencyKey
							},
							layer: Layer.USER,
							reference: sReference
						}
					]
				}
			});
			FlexState.setInitialNonFlCompVariantData(sReference, sPersistencyKey,
				{
					executeOnSelection: false,
					id: "*standard*",
					name: "Standard"
				},
				[{
					favorite: true,
					id: "#PS1",
					name: "EntityType"
				}]
			);
			const aFlexObjects = await FlexObjectManager.getFlexObjects({
				selector: this.oAppComponent,
				invalidateCache: true
			});
			const aNames = aFlexObjects.map((oFlexObject) => {
				return oFlexObject.getVariantId ? oFlexObject.getVariantId() : oFlexObject.getId();
			});
			assert.strictEqual(aFlexObjects.length, 6, "an array with 6 entries is returned");
			assert.ok(aNames.indexOf("variant1") > -1, "the variant from the compVariantState is present");
			assert.ok(aNames.indexOf("change12") > -1, "the change from the compVariantState is present");
			assert.ok(aNames.indexOf("change1") > -1, "the 1st change in changePersistence is present");
			assert.ok(aNames.indexOf("change2") > -1, "the 2nd change in changePersistence is present");
			assert.ok(aNames.indexOf("#PS1") > -1, "the oData variant is present");
			assert.ok(aNames.indexOf("*standard*") > -1, "the standard variant is present");
		});

		QUnit.test("Get - Given flex objects are present in the CompVariantState + ChangePersistence + invalidateCache is true and setVisible change", async function(assert) {
			const sPersistencyKey = "persistency.key";
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
				changes: createTwoChangeDefs(),
				comp: {
					variants: [{
						fileName: "variant1",
						fileType: "variant",
						content: {},
						changeType: "pageVariant",
						reference: sReference,
						persistencyKey: sPersistencyKey
					}],
					changes: [
						{
							fileName: "change12",
							content: {
								visible: false
							},
							changeType: "updateVariant",
							selector: {
								variantId: "variant1",
								persistencyKey: sPersistencyKey
							},
							layer: Layer.USER,
							reference: sReference
						}
					]
				}
			});
			FlexState.setInitialNonFlCompVariantData(sReference, sPersistencyKey,
				{
					executeOnSelection: false,
					id: "*standard*",
					name: "Standard"
				},
				[{
					favorite: true,
					id: "#PS1",
					name: "EntityType"
				}]);
			const aFlexObjects = await FlexObjectManager.getFlexObjects({
				selector: this.oAppComponent,
				invalidateCache: true
			});
			const aNames = aFlexObjects.map((oFlexObject) => {
				return oFlexObject.getVariantId ? oFlexObject.getVariantId() : oFlexObject.getId();
			});
			assert.strictEqual(aFlexObjects.length, 5, "an array with 5 entries is returned");
			assert.ok(aNames.indexOf("change12") > -1, "the change from the compVariantState is present");
			assert.ok(aNames.indexOf("#PS1") > -1, "the oData variant is present");
			assert.ok(aNames.indexOf("*standard*") > -1, "the standard variant is present");
			assert.ok(aNames.indexOf("change1") > -1, "the 1st change in changePersistence is present");
			assert.ok(aNames.indexOf("change2") > -1, "the 2nd change in changePersistence is present");
		});

		QUnit.test("Get - Given flex objects of different layers are present in the CompVariantState and currentLayer set", function(assert) {
			const sPersistencyKey = "persistency.key";
			const sVariantId = "variantId1";

			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: true,
					isVariant: true,
					layer: Layer.VENDOR,
					content: {},
					id: sVariantId
				},
				reference: sReference,
				persistencyKey: sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			});
			CompVariantState.updateVariant({
				favorite: true,
				id: sVariantId,
				layer: Layer.CUSTOMER,
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			sandbox.stub(URLSearchParams.prototype, "get").returns(Layer.VENDOR);
			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {}
				},
				reference: sReference,
				persistencyKey: sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			});

			return FlexObjectManager.getFlexObjects({
				selector: this.oAppComponent,
				currentLayer: Layer.CUSTOMER
			})
			.then(function(aFlexObjects) {
				assert.strictEqual(aFlexObjects.length, 1, "an array with one entry is returned");
				assert.strictEqual(aFlexObjects[0].getChangeType(), "updateVariant", "the change from the compVariantState is present");
			});
		});

		QUnit.test("Get - Given flex objects of different layers are present in the CompVariantState and currentLayer not set", function(assert) {
			const sPersistencyKey = "persistency.key";
			const sVariantId = "variantId1";

			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: true,
					isVariant: true,
					content: {},
					id: sVariantId
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				favorite: true,
				id: sVariantId,
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {}
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});

			return FlexObjectManager.getFlexObjects({
				selector: this.oAppComponent
			})
			.then(function(aFlexObjects) {
				assert.strictEqual(aFlexObjects.length, 3, "an array with three entries is returned");
			});
		});

		QUnit.test("Get - Given flex objects and dirty changes are present ", async function(assert) {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
				changes: createTwoChangeDefs()
			});
			addDirtyChanges();
			const aFlexObjects = await FlexObjectManager.getFlexObjects({
				selector: this.oAppComponent
			});
			assert.strictEqual(aFlexObjects.length, 4, "an array with four entries is returned");
		});

		QUnit.test("hasDirtyObjects - Given flex objects and dirty changes are present in the ChangePersistence", function(assert) {
			const oGetDirtyFlexObjectsStub = sandbox.stub(FlexObjectState, "getDirtyFlexObjects").returns(["mockDirty"]);
			const oStubCompStateHasDirtyChanges = sandbox.stub(CompVariantState, "hasDirtyChanges").returns(true);
			const bHasDirtyFlexObjects = FlexObjectManager.hasDirtyFlexObjects({selector: this.oAppComponent});
			assert.ok(bHasDirtyFlexObjects, "hasDirtyFlexObjects returns true");
			assert.strictEqual(oGetDirtyFlexObjectsStub.callCount, 1, "getDirtyFlexObjects is called once");
			assert.strictEqual(oStubCompStateHasDirtyChanges.callCount, 0, "CompVariantState.hasDirtyChanges is not called");
		});

		QUnit.test("hasDirtyObjects - Given flex objects and dirty changes are present in the CompVariantState", function(assert) {
			const oGetDirtyFlexObjectsStub = sandbox.stub(FlexObjectState, "getDirtyFlexObjects").returns([]);
			const oStubCompStateHasDirtyChanges = sandbox.stub(CompVariantState, "hasDirtyChanges").returns(true);
			const bHasDirtyFlexObjects = FlexObjectManager.hasDirtyFlexObjects({selector: this.oAppComponent});
			assert.ok(bHasDirtyFlexObjects, "hasDirtyFlexObjects returns true");
			assert.strictEqual(oGetDirtyFlexObjectsStub.callCount, 1, "getDirtyFlexObjects is called once");
			assert.strictEqual(oStubCompStateHasDirtyChanges.callCount, 1, "CompVariantState.hasDirtyChanges is called");
		});

		QUnit.test("Save", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			const oPersistAllStub = sandbox.stub(CompVariantState, "persistAll").resolves();
			const oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			const oSaveAllStub1 = sandbox.stub(oFlexController, "saveAll").resolves();
			const oGetFlexObjectsStub = sandbox.stub(FlexObjectManager, "getFlexObjects").resolves("foo");

			return FlexObjectManager.saveFlexObjects({
				selector: this.oAppComponent,
				skipUpdateCache: true,
				draft: true,
				layer: Layer.USER,
				condenseAnyLayer: true
			}).then((sReturn) => {
				assert.strictEqual(sReturn, "foo", "the function returns whatever getFlexObjects returns");
				assert.strictEqual(oPersistAllStub.callCount, 1, "the CompVariant changes were saved");

				assert.strictEqual(oSaveAllStub1.callCount, 1, "the UI Changes were saved");
				assert.deepEqual(oSaveAllStub1.firstCall.args[0], this.oAppComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[1], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[2], true, "the draft flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[5], true, "the condense flag was passed");

				assert.strictEqual(oGetFlexObjectsStub.callCount, 1, "the changes were retrieved at the end");
				const oExpectedParameters = {
					componentId: sComponentId,
					selector: this.oAppComponent,
					draft: true,
					layer: Layer.USER,
					currentLayer: Layer.USER,
					invalidateCache: true,
					condenseAnyLayer: true,
					reference: sReference
				};
				assert.deepEqual(oGetFlexObjectsStub.firstCall.args[0], oExpectedParameters, "the parameters for getFlexObjects are correct");
			});
		});

		QUnit.test("Save with update version parameter from version model", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			const oPersistAllStub = sandbox.stub(CompVariantState, "persistAll").resolves();
			const oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			const oSaveAllStub1 = sandbox.stub(oFlexController, "saveAll").resolves();
			const oGetFlexObjectsStub = sandbox.stub(FlexObjectManager, "getFlexObjects").resolves("foo");
			sandbox.stub(Versions, "hasVersionsModel").returns(true);
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				displayedVersion: Version.Number.Draft
			}));

			return FlexObjectManager.saveFlexObjects({
				selector: this.oAppComponent,
				skipUpdateCache: true,
				draft: true,
				layer: Layer.CUSTOMER,
				condenseAnyLayer: true,
				version: 1
			}).then((sReturn) => {
				assert.strictEqual(sReturn, "foo", "the function returns whatever getFlexObjects returns");
				assert.strictEqual(oPersistAllStub.callCount, 1, "the CompVariant changes were saved");

				assert.strictEqual(oSaveAllStub1.callCount, 1, "the UI Changes were saved");
				assert.deepEqual(oSaveAllStub1.firstCall.args[0], this.oAppComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[1], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[2], true, "the draft flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[5], true, "the condense flag was passed");

				assert.strictEqual(oGetFlexObjectsStub.callCount, 1, "the changes were retrieved at the end");
				const oExpectedParameters = {
					componentId: sComponentId,
					selector: this.oAppComponent,
					draft: true,
					layer: Layer.CUSTOMER,
					currentLayer: Layer.CUSTOMER,
					invalidateCache: true,
					condenseAnyLayer: true,
					reference: sReference,
					version: Version.Number.Draft
				};
				assert.deepEqual(oGetFlexObjectsStub.firstCall.args[0], oExpectedParameters, "the parameters for getFlexObjects are correct");
			});
		});

		QUnit.test("Save with app variant by startup param ", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(Utils, "isVariantByStartupParameter").returns("true");
			ManifestUtils.getFlexReferenceForSelector.returns(sReference);
			const oPersistAllStub = sandbox.stub(CompVariantState, "persistAll").resolves();
			const oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			const oSaveAllStub1 = sandbox.stub(oFlexController, "saveAll").resolves();
			const oGetFlexObjectsStub = sandbox.stub(FlexObjectManager, "getFlexObjects").resolves("foo");

			return FlexObjectManager.saveFlexObjects({
				selector: this.oAppComponent,
				skipUpdateCache: true,
				draft: true,
				layer: Layer.USER,
				condenseAnyLayer: true
			}).then((sReturn) => {
				assert.strictEqual(sReturn, "foo", "the function returns whatever getFlexObjects returns");
				assert.strictEqual(oPersistAllStub.callCount, 1, "the CompVariant changes were saved");

				assert.strictEqual(oSaveAllStub1.callCount, 1, "the UI Changes were saved");
				assert.deepEqual(oSaveAllStub1.firstCall.args[0], this.oAppComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[1], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[2], true, "the draft flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[5], true, "the condense flag was passed");

				assert.strictEqual(oGetFlexObjectsStub.callCount, 1, "the changes were retrieved at the end");
				const oExpectedParameters = {
					componentId: sComponentId,
					selector: this.oAppComponent,
					draft: true,
					layer: Layer.USER,
					currentLayer: Layer.USER,
					invalidateCache: true,
					condenseAnyLayer: true,
					reference: sReference
				};
				assert.deepEqual(oGetFlexObjectsStub.firstCall.args[0], oExpectedParameters, "the parameters for getFlexObjects are correct");
			});
		});
	});

	QUnit.module("dirty FlexObjects", {
		async beforeEach() {
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sReference);
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {});
		},
		afterEach() {
			this.oAppComponent.destroy();
			sandbox.restore();
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("addDirtyFlexObjects with FlexObjects and JSON change content", function(assert) {
			addDirtyChanges();
			assert.strictEqual(FlexObjectState.getDirtyFlexObjects(sReference).length, 2, "two dirty changes are present");

			FlexObjectManager.addDirtyFlexObjects(sReference, [
				{
					fileType: "change",
					fileName: "newChange1",
					changeType: "dirtyRenameField1",
					layer: Layer.USER
				},
				{
					fileType: "change",
					fileName: "newChange2",
					changeType: "dirtyRenameField2",
					layer: Layer.USER
				}
			]);

			const aDirtyFlexObjects = FlexObjectState.getDirtyFlexObjects(sReference);
			assert.strictEqual(aDirtyFlexObjects.length, 4, "four dirty changes are present");
			assert.ok(
				aDirtyFlexObjects.every((oFlexObject) => oFlexObject.isA("sap.ui.fl.apply._internal.flexObjects.FlexObject")),
				"all dirty changes are FlexObjects instances"
			);
		});

		QUnit.test("when two identical flex objects are added", function(assert) {
			const oChangeContent = {
				fileType: "change",
				fileName: "newChange1",
				changeType: "dirtyRenameField1",
				layer: Layer.USER
			};
			FlexObjectManager.addDirtyFlexObjects(sReference, [oChangeContent]);
			const aAddedChangesOnSecondCall = FlexObjectManager.addDirtyFlexObjects(sReference, [oChangeContent]);

			const aDirtyFlexObjects = FlexObjectState.getDirtyFlexObjects(sReference);
			assert.strictEqual(aDirtyFlexObjects.length, 1, "then only one flex object is added to the state");
			assert.strictEqual(aAddedChangesOnSecondCall.length, 0, "then flex objects that were not added are not returned");
		});

		QUnit.test("when calling removeDirtyFlexObjects without generator, selector IDs and change types specified", function(assert) {
			const oVendorChange = createChange("c1", Layer.VENDOR);
			const oCustomerChange = createChange("c2", Layer.CUSTOMER);
			FlexObjectManager.addDirtyFlexObjects(sReference, [oVendorChange, oCustomerChange]);

			const aChangesToBeRemoved = FlexObjectManager.removeDirtyFlexObjects({
				reference: sReference,
				layers: [Layer.VENDOR]
			});
			assert.strictEqual(aChangesToBeRemoved.length, 1, "one change is removed");
			assert.strictEqual(aChangesToBeRemoved[0], oVendorChange, "the removed change is on the specified layer");
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				1,
				"then only one dirty change remains in the state"
			);
		});

		QUnit.test("when calling removeDirtyFlexObjects with multiple layers", function(assert) {
			const oVendorChange = createChange("c1", Layer.VENDOR);
			const oCustomerChange = createChange("c2", Layer.CUSTOMER);
			const oUserChange = createChange("c3", Layer.USER);
			FlexObjectManager.addDirtyFlexObjects(sReference, [oVendorChange, oUserChange, oCustomerChange]);

			const aChangesToBeRemoved = FlexObjectManager.removeDirtyFlexObjects({
				reference: sReference,
				layers: [Layer.VENDOR, Layer.USER]
			});
			assert.strictEqual(aChangesToBeRemoved.length, 2, "two changes are removed");
			assert.ok(aChangesToBeRemoved.includes(oVendorChange), "the VENDOR change is removed");
			assert.ok(aChangesToBeRemoved.includes(oUserChange), "the USER change is removed");
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				1,
				"then only one dirty change remains in the state"
			);
		});

		QUnit.test("when calling removeDirtyFlexObjects without any layer specified", function(assert) {
			const oVendorChange = createChange("c1", Layer.VENDOR);
			const oCustomerChange = createChange("c2", Layer.CUSTOMER);
			const oUserChange = createChange("c3", Layer.USER);
			FlexObjectManager.addDirtyFlexObjects(sReference, [oVendorChange, oUserChange, oCustomerChange]);

			const aChangesToBeRemoved = FlexObjectManager.removeDirtyFlexObjects({
				reference: sReference
			});
			assert.strictEqual(aChangesToBeRemoved.length, 3, "all changes are removed");
		});

		QUnit.test("when calling removeDirtyFlexObjects with a generator and a change is in a different layer", function(assert) {
			const sGenerator = "some generator";
			const oVendorChange = createChange("c1", Layer.VENDOR, {}, sGenerator);
			const oCustomerChange = createChange("c2", Layer.CUSTOMER, {}, sGenerator);
			FlexObjectManager.addDirtyFlexObjects(sReference, [oVendorChange, oCustomerChange]);

			FlexObjectManager.removeDirtyFlexObjects({
				reference: sReference,
				layers: [Layer.VENDOR],
				component: this.oAppComponent,
				control: this.oControl,
				generator: sGenerator
			});
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				1,
				"then only one dirty change remains in the state"
			);
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference)[0],
				oCustomerChange,
				"which is the change with a different Layer"
			);
		});

		QUnit.test("when calling removeDirtyFlexObjects with a generator and a change is in a different layer and localIDs", function(assert) {
			const sGenerator = "some generator";
			const oVendorChange1 = createChange("c1", Layer.VENDOR, {id: "abc123", idIsLocal: true}, sGenerator);
			const oVendorChange2 = createChange("c2", Layer.VENDOR, {}, sGenerator);
			FlexObjectManager.addDirtyFlexObjects(sReference, [oVendorChange1, oVendorChange2]);
			FlexObjectManager.removeDirtyFlexObjects({
				reference: sReference,
				layers: [Layer.VENDOR],
				component: this.oAppComponent,
				control: new Control(this.oAppComponent.createId("abc123")),
				generator: sGenerator
			});
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				1,
				"then only one dirty change remains in the state"
			);
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference)[0],
				oVendorChange2,
				"which is the change with a different id (non-local)"
			);
		});

		QUnit.test("when calling removeDirtyFlexObjects with a generator", function(assert) {
			const sGenerator = "some generator";
			const oVENDORChange1 = createChange("c1", Layer.VENDOR);
			const oVENDORChange2 = createChange("c2", Layer.VENDOR, {}, sGenerator);
			FlexObjectManager.addDirtyFlexObjects(sReference, [oVENDORChange1, oVENDORChange2]);
			FlexObjectManager.removeDirtyFlexObjects({
				reference: sReference,
				layers: [Layer.VENDOR],
				component: this.oAppComponent,
				control: this.oControl,
				generator: sGenerator
			});
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				1,
				"then only one dirty change remains in the state"
			);
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference)[0],
				oVENDORChange1,
				"which is the change with a different generator"
			);
		});

		QUnit.test("when calling removeDirtyFlexObjects with a controlId", function(assert) {
			const sGenerator = "some generator";
			const oVENDORChange1 = createChange("c1", Layer.VENDOR);
			const oVENDORChange2 = createChange("c2", Layer.VENDOR, {}, sGenerator);
			const oVENDORChange3 = createChange("c3", Layer.VENDOR, { id: "abc123", idIsLocal: false }, sGenerator);
			FlexObjectManager.addDirtyFlexObjects(sReference, [oVENDORChange1, oVENDORChange2, oVENDORChange3]);

			FlexObjectManager.removeDirtyFlexObjects({
				reference: sReference,
				layers: [Layer.VENDOR],
				component: this.oAppComponent,
				control: new Control("abc123")
			});
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				2,
				"then two dirty change remain in the state"
			);
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference)[0],
				oVENDORChange1
			);
			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference)[1],
				oVENDORChange2
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});