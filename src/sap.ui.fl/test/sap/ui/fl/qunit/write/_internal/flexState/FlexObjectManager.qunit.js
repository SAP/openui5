/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	merge,
	Control,
	UIComponent,
	Reverter,
	FlexObjectFactory,
	States,
	DependencyHandler,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	Settings,
	Version,
	Condenser,
	SessionStorageConnector,
	UIChangeManager,
	CompVariantState,
	FlexObjectManager,
	Storage,
	Versions,
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
	const Component = UIComponent.extend(sComponentId, {
		metadata: {
			manifest: {
				"_version": "2.0.0",

				"sap.app": {
					id: sReference
				}
			}
		}
	});

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
			const oSaveAllStub = sandbox.stub(FlexObjectManager, "flexControllerSaveAll").resolves();
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

				assert.strictEqual(oSaveAllStub.callCount, 1, "the UI Changes were saved");
				assert.deepEqual(oSaveAllStub.firstCall.args[1], this.oAppComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub.firstCall.args[2], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub.firstCall.args[3], true, "the draft flag was passed");
				assert.deepEqual(oSaveAllStub.firstCall.args[6], true, "the condense flag was passed");

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
			const oSaveAllStub = sandbox.stub(FlexObjectManager, "flexControllerSaveAll").resolves();
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

				assert.strictEqual(oSaveAllStub.callCount, 1, "the UI Changes were saved");
				assert.deepEqual(oSaveAllStub.firstCall.args[1], this.oAppComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub.firstCall.args[2], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub.firstCall.args[3], true, "the draft flag was passed");
				assert.deepEqual(oSaveAllStub.firstCall.args[6], true, "the condense flag was passed");

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
			const oSaveAllStub = sandbox.stub(FlexObjectManager, "flexControllerSaveAll").resolves();
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

				assert.strictEqual(oSaveAllStub.callCount, 1, "the UI Changes were saved");
				assert.deepEqual(oSaveAllStub.firstCall.args[1], this.oAppComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub.firstCall.args[2], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub.firstCall.args[3], true, "the draft flag was passed");
				assert.deepEqual(oSaveAllStub.firstCall.args[6], true, "the condense flag was passed");

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

	QUnit.module("saveFlexObjectsWithoutVersioning", {
		beforeEach() {
			sandbox.stub(Utils, "getAppComponentForSelector").returns("component");
			sandbox.stub(ManifestUtils, "getFlexReferenceForSelector").returns(sReference);
			this.oChange1 = createChange("a1");
			this.oChange2 = createChange("a2");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when saveFlexObjectsWithoutVersioning is called with an array of changes", async function(assert) {
			const oRes = { dummy: "response" };
			const fnChangePersistenceSaveStub = sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves(oRes);
			const aChanges = [this.oChange1, this.oChange2];
			const oResponse = await FlexObjectManager.saveFlexObjectsWithoutVersioning({
				dirtyChanges: aChanges,
				selector: {}
			});
			assert.ok(
				fnChangePersistenceSaveStub.calledWith(sReference, "component", false, aChanges),
				"then sap.ui.fl.ChangePersistence.saveSequenceOfDirtyChanges() was called with correct parameters"
			);
			assert.strictEqual(oRes, oResponse, "then the method returns the proper result");
		});

		QUnit.test("when saveFlexObjectsWithoutVersioning is called with an array of changes that are only partially saved", async function(assert) {
			const oExpectedResponse = {response: [{fileName: "a2"}]};
			sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves(oExpectedResponse);
			const oCheckUpdateStub = sandbox.stub();
			sandbox.stub(FlexState, "getFlexObjectsDataSelector").returns({
				checkUpdate: oCheckUpdateStub
			});
			const sInitialState = this.oChange1.getState();
			const oResponse = await FlexObjectManager.saveFlexObjectsWithoutVersioning({
				dirtyChanges: [this.oChange1, this.oChange2]
			});
			assert.deepEqual(oResponse, oExpectedResponse, "the response is correctly returned");
			assert.strictEqual(oCheckUpdateStub.callCount, 1, "the checkUpdate was called once");
			assert.strictEqual(this.oChange1.getState(), sInitialState, "the first change's state was not changed");
			assert.strictEqual(this.oChange2.getState(), States.LifecycleState.PERSISTED, "the second change was set to persisted");
		});

		QUnit.test("when saveFlexObjectsWithoutVersioning is called without changes and the persistence returning an empty array", async function(assert) {
			const oExpectedResponse = {response: []};
			sandbox.stub(FlexObjectState, "getDirtyFlexObjects").returns([{fileName: "foo"}]);
			const oSaveStub = sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves(oExpectedResponse);
			const oCheckUpdateStub = sandbox.stub();
			sandbox.stub(FlexState, "getFlexObjectsDataSelector").returns({
				checkUpdate: oCheckUpdateStub
			});
			const oResponse = await FlexObjectManager.saveFlexObjectsWithoutVersioning({});
			assert.ok(oSaveStub.calledWith(sReference, "component", false, [{fileName: "foo"}]), "the correct changes were passed");
			assert.deepEqual(oResponse, oExpectedResponse, "the response is correctly returned");
			assert.strictEqual(oCheckUpdateStub.callCount, 0, "the checkUpdate was not called");
		});

		QUnit.test("when saveFlexObjectsWithoutVersioning is called and the persistence returning nothing", async function(assert) {
			const oExpectedResponse = {};
			sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves(oExpectedResponse);
			const oCheckUpdateStub = sandbox.stub();
			sandbox.stub(FlexState, "getFlexObjectsDataSelector").returns({
				checkUpdate: oCheckUpdateStub
			});
			const oResponse = await FlexObjectManager.saveFlexObjectsWithoutVersioning({});
			assert.deepEqual(oResponse, oExpectedResponse, "the response is correctly returned");
			assert.strictEqual(oCheckUpdateStub.callCount, 0, "the checkUpdate was not called");
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

	QUnit.module("resetFlexObjects", {
		before() {
			this.oAppComponent = new Component(sComponentId);
		},
		async beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			this.oStorageStub = sandbox.stub(Storage, "reset");
			this.oReverterStub = sandbox.stub(Reverter, "revertMultipleChanges");
			this.oUpdateStorageResponse = sandbox.stub(FlexState, "updateStorageResponse");
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
				changes: [
					{
						fileName: "change1",
						selector: { id: "control1" },
						support: { generator: "myGenerator" },
						changeType: "renameField",
						layer: Layer.USER
					},
					{
						fileName: "change2",
						selector: { id: "control1" },
						support: { generator: "myOtherGenerator" },
						changeType: "renameField",
						layer: Layer.USER
					},
					{
						fileName: "change3",
						selector: { id: "control2" },
						support: { generator: "myGenerator" },
						changeType: "renameField",
						layer: Layer.CUSTOMER
					},
					{
						fileName: "change4",
						selector: {},
						support: { generator: "" },
						changeType: "moveFields",
						layer: Layer.VENDOR
					}
				],
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
		},
		afterEach() {
			sandbox.restore();
			FlexState.clearState();
		},
		after() {
			this.oAppComponent.destroy();
		}
	}, function() {
		function assertPropertyBag(assert, oArgs, sReference, sLayer, sGenerator, aSelectorIds, aChangeTypes) {
			assert.strictEqual(oArgs.reference, sReference, "then the reference is passed");
			assert.strictEqual(oArgs.layer, sLayer, "then the layer is passed");
			if (sGenerator) {
				assert.strictEqual(oArgs.generator, sGenerator, "then the generator is passed");
			} else {
				assert.notOk(oArgs.generator, "then the generator is not passed");
			}
			if (aSelectorIds) {
				assert.deepEqual(oArgs.selectorIds, aSelectorIds, "then the selectorIds are passed");
			} else {
				assert.notOk(oArgs.selectorIds, "then the selectorIds are not passed");
			}
			if (aChangeTypes) {
				assert.deepEqual(oArgs.changeTypes, aChangeTypes, "then the changeTypes are passed");
			} else {
				assert.notOk(oArgs.changeTypes, "then the changeTypes are not passed");
			}
		}

		QUnit.test("when called without filter options", async function(assert) {
			this.oStorageStub.resolves([]);
			await FlexObjectManager.resetFlexObjects({
				reference: sReference,
				selector: this.oAppComponent,
				layer: Layer.USER
			});
			assert.strictEqual(this.oStorageStub.callCount, 1, "then the Storage.reset function is called once");
			assert.strictEqual(this.oReverterStub.callCount, 0, "then the Reverter.revertMultipleChanges function is not called");
			const oArgs = this.oStorageStub.firstCall.args[0];
			assertPropertyBag(assert, oArgs, sReference, Layer.USER);
		});

		QUnit.test("when called with a generator", async function(assert) {
			this.oStorageStub.resolves({
				response: [{ fileName: "change1" }]
			});
			await FlexObjectManager.resetFlexObjects({
				reference: sReference,
				selector: this.oAppComponent,
				layer: Layer.USER,
				generator: "myGenerator"
			});
			assert.strictEqual(this.oStorageStub.callCount, 1, "then the Storage.reset function is called once");
			const oArgs = this.oStorageStub.firstCall.args[0];
			assertPropertyBag(assert, oArgs, sReference, Layer.USER, "myGenerator");
			assert.strictEqual(this.oUpdateStorageResponse.callCount, 1, "then the updateStorageResponse function is called once");
			assert.strictEqual(
				this.oUpdateStorageResponse.lastCall.args[1][0].flexObject.fileName, "change1",
				"then the response is updated"
			);
			assert.strictEqual(this.oReverterStub.callCount, 1, "then the revertMultipleChanges function is called once");
			assert.strictEqual(this.oReverterStub.firstCall.args[0][0].getId(), "change1", "then the order is correct");
		});

		QUnit.test("when called with a selector", async function(assert) {
			this.oStorageStub.resolves({
				response: [{ fileName: "change1" }, { fileName: "change2" }]
			});
			await FlexObjectManager.resetFlexObjects({
				reference: sReference,
				selector: this.oAppComponent,
				layer: Layer.USER,
				selectorIds: ["control1"]
			});
			assert.strictEqual(this.oStorageStub.callCount, 1, "then the Storage.reset function is called once");
			const oArgs = this.oStorageStub.firstCall.args[0];
			assertPropertyBag(assert, oArgs, sReference, Layer.USER, undefined, ["control1"]);
			assert.strictEqual(this.oUpdateStorageResponse.callCount, 1, "then the updateStorageResponse function is called once");
			assert.strictEqual(
				this.oUpdateStorageResponse.lastCall.args[1][0].flexObject.fileName, "change1",
				"then the response is updated"
			);
			assert.strictEqual(
				this.oUpdateStorageResponse.lastCall.args[1][1].flexObject.fileName, "change2",
				"then the response is updated"
			);
			assert.strictEqual(this.oReverterStub.callCount, 1, "then the revertMultipleChanges function is called once");
			assert.strictEqual(this.oReverterStub.firstCall.args[0][0].getId(), "change2", "then the order is correct");
			assert.strictEqual(this.oReverterStub.firstCall.args[0][1].getId(), "change1", "then the order is correct");
		});

		QUnit.test("when called with a changeType", async function(assert) {
			this.oStorageStub.resolves({
				response: [{ fileName: "change3" }]
			});
			await FlexObjectManager.resetFlexObjects({
				reference: sReference,
				selector: this.oAppComponent,
				layer: Layer.CUSTOMER,
				changeTypes: ["renameField"]
			});
			assert.strictEqual(this.oStorageStub.callCount, 1, "then the Storage.reset function is called once");
			const oArgs = this.oStorageStub.firstCall.args[0];
			assertPropertyBag(assert, oArgs, sReference, Layer.CUSTOMER, undefined, undefined, ["renameField"]);
			assert.strictEqual(this.oUpdateStorageResponse.callCount, 1, "then the updateStorageResponse function is called once");
			assert.strictEqual(
				this.oUpdateStorageResponse.lastCall.args[1][0].flexObject.fileName, "change3",
				"then the response is updated"
			);
			assert.strictEqual(this.oReverterStub.callCount, 1, "then the revertMultipleChanges function is called once");
			assert.strictEqual(this.oReverterStub.firstCall.args[0][0].getId(), "change3", "then the order is correct");
		});
	});

	QUnit.module("deleteFlexObjects", {
		async beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForSelector").returns(sReference);
			this.oRemoveChangeFromMapStub = sandbox.stub(DependencyHandler, "removeChangeFromMap");
			this.oRemoveChangeFromDepStub = sandbox.stub(DependencyHandler, "removeChangeFromDependencies");
			this.oFlexObject1 = createChange("flexObject1", Layer.USER);
			this.oFlexObject2 = createChange("flexObject2", Layer.USER);

			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
				changes: [{
					fileName: "flexObject3",
					changeType: "renameField",
					layer: Layer.USER
				}, {
					fileName: "flexObject4",
					changeType: "renameField",
					layer: Layer.USER
				}]
			});
			FlexObjectManager.addDirtyFlexObjects(sReference, [this.oFlexObject1, this.oFlexObject2]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with flex objects in various states", function(assert) {
			let aFlexObjects = FlexObjectState.getAllApplicableUIChanges(sReference);
			assert.strictEqual(aFlexObjects.length, 4, "initially 4 flex objects are present");

			aFlexObjects[0].setState(States.LifecycleState.UPDATED);
			sandbox.stub(aFlexObjects[0], "isValidForDependencyMap").returns(true);
			sandbox.stub(aFlexObjects[2], "isValidForDependencyMap").returns(true);

			FlexObjectManager.deleteFlexObjects({
				reference: sReference,
				flexObjects: aFlexObjects
			});
			aFlexObjects = FlexObjectState.getAllApplicableUIChanges(sReference);
			const aFlexObjectIds = aFlexObjects.map((oFlexObject) => oFlexObject.getId());

			assert.strictEqual(aFlexObjects.length, 2, "then only 2 flex objects remain");
			assert.ok(aFlexObjectIds.includes("flexObject3"), "then the remaining flex objects are correct");
			assert.ok(aFlexObjectIds.includes("flexObject4"), "then the remaining flex objects are correct");
			assert.strictEqual(aFlexObjects[0].getState(), States.LifecycleState.DELETED, "then the state is correct");
			assert.strictEqual(aFlexObjects[1].getState(), States.LifecycleState.DELETED, "then the state is correct");
			assert.strictEqual(this.oRemoveChangeFromMapStub.callCount, 2, "then two flex objects are removed from the map");
			assert.strictEqual(this.oRemoveChangeFromDepStub.callCount, 2, "then two flex objects are removed from the map");
		});
	});

	QUnit.module("restoreDeletedFlexObjects", {
		async beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForSelector").returns(sReference);
			this.oRemoveChangeFromMapStub = sandbox.stub(DependencyHandler, "removeChangeFromMap");
			this.oRemoveChangeFromDepStub = sandbox.stub(DependencyHandler, "removeChangeFromDependencies");
			this.oFlexObject1 = createChange("flexObject1", Layer.USER);
			this.oFlexObject2 = createChange("flexObject2", Layer.USER);

			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
				changes: [{
					fileName: "flexObject3",
					changeType: "renameField",
					layer: Layer.USER
				}, {
					fileName: "flexObject4",
					changeType: "renameField",
					layer: Layer.USER
				}]
			});
			FlexObjectManager.addDirtyFlexObjects(sReference, [this.oFlexObject1, this.oFlexObject2]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with flex objects in various states", function(assert) {
			const aAllFlexObjects = FlexObjectState.getAllApplicableUIChanges(sReference);
			assert.strictEqual(aAllFlexObjects.length, 4, "initially 4 flex objects are present");

			aAllFlexObjects[0].setState(States.LifecycleState.UPDATED);
			sandbox.stub(aAllFlexObjects[0], "isValidForDependencyMap").returns(true);
			sandbox.stub(aAllFlexObjects[2], "isValidForDependencyMap").returns(true);

			FlexObjectManager.deleteFlexObjects({
				reference: sReference,
				flexObjects: aAllFlexObjects
			});
			FlexObjectManager.restoreDeletedFlexObjects({
				reference: sReference,
				flexObjects: [aAllFlexObjects[0], aAllFlexObjects[1]]
			});

			const aFlexObjects = FlexObjectState.getAllApplicableUIChanges(sReference);
			assert.strictEqual(aFlexObjects.length, 2, "then the deleted changes are restored");
			assert.strictEqual(aFlexObjects[0].getState(), States.LifecycleState.UPDATED, "then the state is correct");
			assert.strictEqual(aFlexObjects[1].getState(), States.LifecycleState.PERSISTED, "then the state is correct");
		});
	});

	// TODO: consolidate / refactor
	QUnit.module("old FlexController tests", {
		before() {
			this.oComponent = new Component("sComponentId");
		},
		beforeEach() {
			this.oControl = new Control("existingId");
			this.oChange = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.USER,
				fileName: "a",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});
		},
		afterEach() {
			sandbox.restore();
			this.oControl.destroy();
		},
		after() {
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("when saveAll is called with skipping the cache", async function(assert) {
			var fnChangePersistenceSaveStub = sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves();
			await FlexObjectManager.flexControllerSaveAll(sReference, this.oComponent, true);
			assert.ok(fnChangePersistenceSaveStub.calledWith(sReference, this.oComponent, true), "the app component, the layer and the flag were passed");
		});

		QUnit.test("when saveAll is called with bCondenseAnyLayer", async function(assert) {
			var fnChangePersistenceSaveStub = sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves();
			await FlexObjectManager.flexControllerSaveAll(sReference, this.oComponent, false, false, Layer.VENDOR, false, true);
			assert.ok(fnChangePersistenceSaveStub.calledWith(sReference, this.oComponent, false, undefined, undefined, undefined, true, Layer.VENDOR), "the app component and the flag were passed");
		});

		QUnit.test("when saveAll is called with a layer and bRemoveOtherLayerChanges", function(assert) {
			var oComp = {
				name: "testComp",
				getModel() {
					return {
						id: "variantModel"
					};
				}
			};
			sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves();
			const aCurrentChanges = [
				{ id: "someChange" },
				{ id: "someOtherChange" }
			];
			const oRemoveStub = sandbox.stub(FlexObjectManager, "removeDirtyFlexObjects").returns(aCurrentChanges);
			const oRevertStub = sandbox.stub(Reverter, "revertMultipleChanges").resolves();
			return FlexObjectManager.flexControllerSaveAll(sReference, oComp, true, false, Layer.CUSTOMER, true)
			.then(function() {
				const aLayersToReset = oRemoveStub.firstCall.args[0].layers;
				assert.ok(aLayersToReset.includes(Layer.USER), "then dirty changes on higher layers are removed");
				assert.ok(aLayersToReset.includes(Layer.VENDOR), "then dirty changes on lower layers are removed");
				assert.deepEqual(
					oRevertStub.firstCall.args[0],
					[...aCurrentChanges].reverse(),
					"then the changes are reverted in reverse order"
				);
			});
		});

		QUnit.test("when saveAll is called without versioning", async function(assert) {
			var fnChangePersistenceSaveStub = sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves();
			await FlexObjectManager.flexControllerSaveAll(sReference, this.oComponent, undefined, false);
			assert.equal(fnChangePersistenceSaveStub.calledWith(sReference, this.oComponent, undefined, undefined, undefined, undefined), true, "then ChangePersistence.saveDirtyChanges() was called with correct parameters");
		});

		QUnit.test("when saveAll is called for a draft without filenames", async function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				persistedVersion: Version.Number.Draft,
				versions: [{version: Version.Number.Draft, filenames: []}],
				draftFilenames: []
			}));
			var fnChangePersistenceSaveStub = sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves();
			await FlexObjectManager.flexControllerSaveAll(sReference, this.oComponent, undefined, true);
			assert.equal(fnChangePersistenceSaveStub.calledWith(sReference, this.oComponent, undefined, undefined, Version.Number.Draft, []), true, "then ChangePersistence.saveDirtyChanges() was called with correct parameters");
		});

		QUnit.test("when saveAll is called for a draft with filenames", async function(assert) {
			var aFilenames = ["fileName1", "fileName2"];
			var oDraftVersion = {
				version: Version.Number.Draft,
				filenames: aFilenames
			};
			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a long while ago",
				version: "versionGUID 1"
			};
			var aVersions = [
				oDraftVersion,
				oFirstVersion
			];
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				persistedVersion: Version.Number.Draft,
				versions: aVersions,
				draftFilenames: aFilenames
			}));
			var fnChangePersistenceSaveStub = sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves();
			await FlexObjectManager.flexControllerSaveAll(sReference, this.oComponent, undefined, true);
			assert.equal(fnChangePersistenceSaveStub.calledWith(sReference, this.oComponent, undefined, undefined, Version.Number.Draft, aFilenames), true, "then ChangePersistence.saveDirtyChanges() was called with correct parameters");
		});

		QUnit.test("when saveAll is called with skipping the cache and for draft", async function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				persistedVersion: Version.Number.Original,
				versions: [{version: Version.Number.Original}]
			}));
			var fnChangePersistenceSaveStub = sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves();
			await FlexObjectManager.flexControllerSaveAll(sReference, this.oComponent, true, true);
			assert.equal(fnChangePersistenceSaveStub.calledWith(sReference, this.oComponent, true, undefined, Version.Number.Original, undefined), true, "then ChangePersistence.saveDirtyChanges() was called with correct parameters");
		});

		async function runSaveAllAndAssumeVersionsCall(assert, vResponse, nParentVersion, nCallCount, nCallCountUpdate) {
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				persistedVersion: nParentVersion
			}));
			var oVersionsStub = sandbox.stub(Versions, "onAllChangesSaved");
			var oVersionsUpdateStub = sandbox.stub(Versions, "updateModelFromBackend");
			var oResult = vResponse ? {response: vResponse} : undefined;
			sandbox.stub(FlexObjectManager, "changePersistenceSaveDirtyChanges").resolves(oResult);
			await FlexObjectManager.flexControllerSaveAll(sReference, this.oComponent, undefined, nParentVersion !== false);
			assert.equal(oVersionsStub.callCount, nCallCount);
			if (nCallCountUpdate) {
				assert.equal(oVersionsUpdateStub.callCount, nCallCountUpdate);
			}
			if (nParentVersion === Version.Number.Draft && vResponse && nCallCount) {
				assert.equal(oVersionsStub.args[0][0].draftFilenames.length, vResponse.length);
			}
		}

		QUnit.test("when saveAll is called without draft and no change was saved", function(assert) {
			return runSaveAllAndAssumeVersionsCall.call(this, assert, undefined, false, 0);
		});

		QUnit.test("when saveAll is called without draft and a change was saved", function(assert) {
			return runSaveAllAndAssumeVersionsCall.call(this, assert, [{}], false, 0);
		});

		QUnit.test("when saveAll is called without draft and multiple changes were saved", function(assert) {
			return runSaveAllAndAssumeVersionsCall.call(this, assert, [{}, {}], false, 0);
		});

		QUnit.test("when saveAll is called with draft and no change was saved", function(assert) {
			return runSaveAllAndAssumeVersionsCall.call(this, assert, undefined, Version.Number.Draft, 0, 1);
		});

		QUnit.test("when saveAll is called with draft and a change was saved", function(assert) {
			return runSaveAllAndAssumeVersionsCall.call(this, assert, [{reference: "my.app.Component", fileName: "draftname"}], Version.Number.Draft, 1, 0);
		});

		QUnit.test("when saveAll is called with draft and the last change is delete", function(assert) {
			return runSaveAllAndAssumeVersionsCall.call(this, assert, [], Version.Number.Draft, 0, 1);
		});

		QUnit.test("when saveAll is called with draft and multiple changes were saved", function(assert) {
			return runSaveAllAndAssumeVersionsCall.call(this, assert, [{reference: "my.app.Component", fileName: "draftname"}, {fileName: "secDraftname"}], Version.Number.Draft, 1, 0);
		});
	});

	function setURLParameterForCondensing(sValue) {
		sandbox.stub(window, "URLSearchParams").returns({
			has() {return true;},
			get() {return sValue;}
		});
	}

	function addTwoChanges(sReference, oComponentInstance, sLayer1, sLayer2, oCustomContent1, oCustomContent2) {
		var oChangeContent = merge(
			{
				fileName: "ChangeFileName",
				layer: sLayer1,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE",
				reference: sReference
			},
			oCustomContent1
		);

		var oChangeContent1 = merge(
			{
				fileName: "ChangeFileName1",
				layer: sLayer2 || sLayer1,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE",
				reference: sReference
			},
			oCustomContent2
		);

		return UIChangeManager.addDirtyChanges(sReference, [oChangeContent, oChangeContent1], oComponentInstance);
	}

	// TODO: consolidate / refactor
	QUnit.module("old ChangePersistence tests", {
		before() {
			Settings.clearInstance();
		},
		async beforeEach() {
			this.oCondenserStub = sandbox.stub(Condenser, "condense").callsFake(function(oAppComponent, aChanges) {
				return Promise.resolve(aChanges);
			});
			this.oWriteStub = sandbox.stub(Storage, "write").resolves();
			this.oStorageCondenseStub = sandbox.stub(Storage, "condense").resolves();
			this.oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			this.oServer = sinon.fakeServer.create();
			this.oComponentInstance = this.oComponent = new Component("sComponentId1");
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference);
		},
		afterEach() {
			FlexState.clearState();
			this.oServer.restore();
			sandbox.restore();
			this.oComponentInstance.destroy();
		}
	}, function() {
		QUnit.test("Shall save the dirty changes when adding a new change and return a promise", function(assert) {
			var oChangeContent = {
				fileName: "ChangeFileName",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			UIChangeManager.addDirtyChanges(sReference, [oChangeContent], this.oComponentInstance);

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called with only one change");
			}.bind(this));
		});

		QUnit.test("Shall call the condense route of the storage in case of enabled condensing on the backend", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});
			setURLParameterForCondensing("true");
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oStorageCondenseStub.callCount, 1, "the condense route of the storage is called");
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			}.bind(this));
		});

		QUnit.test("Shall call the condense route for PUBLIC layer changes", async function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});

			addTwoChanges(sReference, this.oComponentInstance, Layer.PUBLIC);
			await FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance);
			assert.strictEqual(this.oWriteStub.callCount, 0);
			assert.strictEqual(this.oStorageCondenseStub.callCount, 1, "the condense route of the storage is called");
			assert.strictEqual(this.oCondenserStub.callCount, 1, "the condenser was called");
		});

		QUnit.test("Shall call the condense route of the storage in case of dirty change and persisted draft filename", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});
			const aChanges = addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.strictEqual(aChanges[0].getState(), States.LifecycleState.PERSISTED, "the state is set to persisted");
				assert.strictEqual(aChanges[1].getState(), States.LifecycleState.PERSISTED, "the state is set to persisted");
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");

				var aFilenames = [
					aChanges[0].getId(),
					aChanges[1].getId()
				];
				var oChangeContent = {
					fileName: "NewFileName",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				var oChangeContent2 = {
					fileName: "NewFileName2",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				const aDirtyChanges = UIChangeManager.addDirtyChanges(
					sReference,
					[oChangeContent, oChangeContent2],
					this.oComponentInstance
				);
				return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference,
					this.oComponentInstance,
					undefined,
					aDirtyChanges,
					Version.Number.Draft,
					aFilenames
				);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 4, "four changes were passed to the condenser");
			}.bind(this));
		});

		QUnit.test("Shall call the condense route of the storage in case of dirty change and one persisted draft filename", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});
			const aChanges = addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				aChanges[0].setState(States.LifecycleState.PERSISTED);
				aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");

				var aFilenames = [aChanges[0].getId(), "newDraftFileName"];
				var oChangeContent = {
					fileName: "NewFileName",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				var oChangeContent2 = {
					fileName: "NewFileName2",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				const aDirtyChanges = UIChangeManager.addDirtyChanges(
					sReference,
					[oChangeContent, oChangeContent2],
					this.oComponentInstance
				);
				return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference,
					this.oComponentInstance,
					undefined,
					aDirtyChanges,
					Version.Number.Draft,
					aFilenames
				);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 3, "three changes were passed to the condenser");
			}.bind(this));
		});

		QUnit.test("Shall call the condense route of the storage in case of dirty change and no persisted draft filename", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");

				var aFilenames = ["draftFileName", "draftFileName2"];
				var oChangeContent = {
					fileName: "NewFileName",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				var oChangeContent2 = {
					fileName: "NewFileName2",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				const aDirtyChanges = UIChangeManager.addDirtyChanges(
					sReference,
					[oChangeContent, oChangeContent2],
					this.oComponentInstance
				);
				return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference,
					this.oComponentInstance,
					undefined,
					aDirtyChanges,
					Version.Number.Draft,
					aFilenames
				);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 2, "two changes were passed to the condenser");
			}.bind(this));
		});

		QUnit.test("Shall not call condenser when no appComponent gets passed to saveDirtyChanges", function(assert) {
			var oChangeContent = {
				fileName: "ChangeFileName",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			UIChangeManager.addDirtyChanges(sReference, [oChangeContent], this.oComponentInstance);

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called with only one change");
			}.bind(this));
		});

		[true, false].forEach(function(bBackendEnablement) {
			var sName = "Shall not call condenser when there are multiple namespaces present";
			if (bBackendEnablement) {
				sName += " with backend condensing enabled";
			}
			QUnit.test(sName, function(assert) {
				if (bBackendEnablement) {
					sandbox.stub(Settings, "getInstanceOrUndef").returns({
						getIsCondensingEnabled() {
							return true;
						},
						getHasPersoConnector() {
							return false;
						}
					});
				}
				addTwoChanges(
					sReference,
					this.oComponentInstance,
					Layer.CUSTOMER,
					Layer.CUSTOMER,
					{
						namespace: "namespace1"
					},
					{
						namespace: "namespace2"
					}
				);

				return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
					if (bBackendEnablement) {
						assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
						assert.equal(this.oWriteStub.callCount, 0, "the write function was not called");
						assert.equal(this.oStorageCondenseStub.callCount, 1, "the condenser route was called");
					} else {
						assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
						assert.equal(this.oWriteStub.callCount, 1, "the write function was called");
						assert.equal(this.oStorageCondenseStub.callCount, 0, "the condenser route was not called");
					}
				}.bind(this));
			});

			var sName2 = "Shall call condenser with the condense flag set in VENDOR layer";
			if (bBackendEnablement) {
				sName2 += " with backend condensing enabled";
			}
			QUnit.test(sName2, function(assert) {
				if (bBackendEnablement) {
					sandbox.stub(Settings, "getInstanceOrUndef").returns({
						getIsCondensingEnabled() {
							return true;
						},
						getHasPersoConnector() {
							return false;
						}
					});
				}
				addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR);
				return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance, false, false, false, false, true)
				.then(function() {
					assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				}.bind(this));
			});
		});

		QUnit.test("Shall call condenser without dirty changes but backend condensing enabled and condenseAnyLayer set and persisted changes available", function(assert) {
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);
				this.oCondenserStub.resetHistory();

				return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance, false, false, false, false, true, Layer.VENDOR);
			}.bind(this))
			.then(function() {
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			}.bind(this));
		});

		QUnit.test("Shall call condenser when persisted changes contain different namespaces", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});

			addTwoChanges(
				sReference,
				this.oComponentInstance,
				Layer.CUSTOMER,
				Layer.CUSTOMER,
				{
					namespace: "namespace1"
				},
				{
					namespace: "namespace2"
				}
			);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);

				addTwoChanges(
					sReference,
					this.oComponentInstance,
					Layer.CUSTOMER,
					Layer.CUSTOMER,
					{
						fileName: "ChangeFileName2",
						namespace: "namespace1"
					},
					{
						fileName: "ChangeFileName3",
						namespace: "namespace1"
					}
				);

				return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
					assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called");
					assert.equal(this.oWriteStub.callCount, 0, "the write function was not called");
					assert.equal(this.oStorageCondenseStub.callCount, 2, "the condenser route was called");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Shall do backend condensing with 'bSkipUpdateCache' flag present", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance, true).then(function() {
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				assert.equal(this.oWriteStub.callCount, 0, "the write function was not called");
				assert.equal(this.oStorageCondenseStub.callCount, 1, "the condenser route was called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new CUSTOMER changes, call the condenser and return a promise", function(assert) {
			addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new VENDOR changes, not call the condenser and return a promise", function(assert) {
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new VENDOR changes, condenser enabled via url, call the condenser and return a promise", function(assert) {
			setURLParameterForCondensing("true");
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new changes with different layers with 2 requests when PersoConnector exists and return a promise", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return true;
				}
			});
			addTwoChanges(sReference, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 2);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new changes with different layers, not call the condenser and return a promise", function(assert) {
			addTwoChanges(sReference, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall not call the condenser with two new changes with different layers and the url parameter", function(assert) {
			setURLParameterForCondensing("true");
			addTwoChanges(sReference, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall not call the condenser with two new changes with the same layer when disabled via url parameter", function(assert) {
			setURLParameterForCondensing("false");
			addTwoChanges(sReference, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall call the condenser with only one layer of changes if lower level change is already saved - backend condensing enabled", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR, Layer.CUSTOMER);

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");

				addTwoChanges(
					sReference,
					this.oComponentInstance,
					Layer.CUSTOMER,
					Layer.CUSTOMER,
					{
						fileName: "ChangeFileName2"
					},
					{
						fileName: "ChangeFileName3"
					}
				);
				return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 3, "three changes were passed to the condenser");
				assert.equal(this.oCondenserStub.lastCall.args[1][0].getLayer(), Layer.CUSTOMER, "and all are in the CUSTOMER layer");
				assert.equal(this.oCondenserStub.lastCall.args[1][1].getLayer(), Layer.CUSTOMER, "and all are in the CUSTOMER layer");
				assert.equal(this.oCondenserStub.lastCall.args[1][2].getLayer(), Layer.CUSTOMER, "and all are in the CUSTOMER layer");
			}.bind(this));
		});

		QUnit.test("Shall not call the condenser without any changes - backend condensing enabled", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR, Layer.CUSTOMER);

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");

				return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance);
			}.bind(this))
			.then(function() {
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall call the condenser with only one layer of changes if lower level change is already saved - backend condensing enabled - only one dirty change passed", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR, Layer.CUSTOMER);

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");

				addTwoChanges(
					sReference,
					this.oComponentInstance,
					Layer.CUSTOMER,
					Layer.CUSTOMER,
					{
						fileName: "ChangeFileName2"
					},
					{
						fileName: "ChangeFileName3"
					}
				);
				return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference,
					this.oComponentInstance,
					false,
					[FlexObjectState.getLiveDependencyMap(sReference).aChanges[2]]
				);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 2, "three changes were passed to the condenser");
				assert.equal(this.oCondenserStub.lastCall.args[1][0].getLayer(), Layer.CUSTOMER, "and all are in the CUSTOMER layer");
				assert.equal(this.oCondenserStub.lastCall.args[1][1].getLayer(), Layer.CUSTOMER, "and all are in the CUSTOMER layer");
			}.bind(this));
		});

		QUnit.test("With two dirty changes, shall not call the storage when the condenser returns no change", function(assert) {
			addTwoChanges(sReference, this.oComponentInstance, Layer.USER);
			this.oCondenserStub.resolves([]);

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			}.bind(this));
		});

		QUnit.test("With two persisted changes, shall not call the storage when the condenser returns no change", async function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled() {
					return true;
				},
				getHasPersoConnector() {
					return false;
				}
			});
			var oUpdateStorageResponseStub = sandbox.spy(FlexState, "updateStorageResponse");
			addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);
			await FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance);

			FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
			FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);
			assert.equal(this.oWriteStub.callCount, 0);
			assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			assert.equal(oUpdateStorageResponseStub.callCount, 2, "both changes got added");

			addTwoChanges(
				sReference,
				this.oComponentInstance,
				Layer.CUSTOMER,
				Layer.CUSTOMER,
				{
					fileName: "ChangeFileName2"
				},
				{
					fileName: "ChangeFileName3"
				}
			);
			this.oCondenserStub.resolves([]);

			await FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance);
			assert.equal(this.oWriteStub.callCount, 0);
			assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called again");
			assert.equal(oUpdateStorageResponseStub.callCount, 6, "four changes got potentially deleted from the cache");
		});

		// TODO: Remove after CompVariant rework todos#5
		QUnit.test("Persisted CompVariant flex objects should not be part of the condense process", async function(assert) {
			const sPersistenceKey = "persistenceKey";
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled: () => true,
				getHasPersoConnector: () => false,
				getIsPublicLayerAvailable: () => false,
				getUserId: () => "USER_123"
			});

			const oCompVariant = CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					content: {}
				},
				layer: Layer.CUSTOMER,
				reference: sReference,
				persistencyKey: sPersistenceKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			});

			oCompVariant.setState(States.PERSISTED);
			await FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance);
			this.oCondenserStub.resetHistory();
			addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER, Layer.CUSTOMER);
			await FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance);
			assert.notOk(
				this.oCondenserStub.getCalls()[0].args[1].includes(oCompVariant),
				"the condenser was called without the CompVariant"
			);
		});

		QUnit.test("Persisted flex objects with a different reference should not be part of the condense process", async function(assert) {
			// Example scenario: Changes from base app inside adaptation project
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsCondensingEnabled: () => true,
				getHasPersoConnector: () => false,
				getIsPublicLayerAvailable: () => false,
				getUserId: () => "USER_123"
			});

			addTwoChanges(
				sReference,
				this.oComponentInstance,
				Layer.CUSTOMER,
				Layer.CUSTOMER
			);
			const aPersistedChanges = addTwoChanges(
				sReference,
				this.oComponentInstance,
				Layer.CUSTOMER,
				Layer.CUSTOMER,
				{ fileName: "ChangeFileName2", reference: "anotherReference" },
				{ fileName: "ChangeFileName3", reference: "anotherReference" }
			);
			aPersistedChanges.forEach((oChange) => oChange.setState(States.LifecycleState.PERSISTED));

			await FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance);
			assert.strictEqual(
				this.oCondenserStub.getCalls()[0].args[1].length,
				2,
				"the condenser was called with the correct amount of changes"
			);
			assert.notOk(
				this.oCondenserStub.getCalls()[0].args[1].some((oChange) => (
					oChange.getFlexObjectMetadata().reference === "anotherReference"
				)),
				"the condenser was called without the changes from the other reference"
			);
		});

		QUnit.test("Shall save the dirty changes for a draft when adding a new change and return a promise", function(assert) {
			var oChangeContent = {
				fileName: "ChangeFileName",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			UIChangeManager.addDirtyChanges(sReference, [oChangeContent], this.oComponentInstance);

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance, undefined, undefined, Version.Number.Draft)
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the Connector was called once");
				assert.equal(this.oWriteStub.getCall(0).args[0].parentVersion, Version.Number.Draft, "the draft version number was passed");
			}.bind(this));
		});

		QUnit.test("(Save As scenario) Shall save the dirty changes for the created app variant when pressing a 'Save As' button and return a promise", function(assert) {
			var oChangeContent = {
				fileName: "ChangeFileName",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			UIChangeManager.addDirtyChanges(sReference, [oChangeContent], this.oComponentInstance);

			this.oServer.respondWith([
				200,
				{
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				},
				"{ \"changes\":[], \"contexts\":[], \"settings\":{\"isAtoEnabled\":true} }"
			]);

			this.oServer.autoRespond = true;

			var oUpdateStub = sandbox.spy(FlexState, "updateStorageResponse");

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance, true).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(oUpdateStub.callCount, 0, "then addChange was never called for the change related to app variants");
			}.bind(this));
		});

		QUnit.test("Shall save all dirty changes with changes in DELETE state", function(assert) {
			var oChangeContent = {
				fileName: "ChangeFileName",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};
			UIChangeManager.addDirtyChanges(sReference, [oChangeContent], this.oComponentInstance);
			var aDirtyFlexObjects = FlexObjectState.getDirtyFlexObjects(sReference);
			assert.strictEqual(
				aDirtyFlexObjects.length, 1, "then one dirty change exists initially"
			);
			aDirtyFlexObjects[0].setState(States.LifecycleState.DELETED);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance, true, aDirtyFlexObjects).then(function() {
				assert.equal(this.oRemoveStub.callCount, 1, "Storage remove is called");
				assert.equal(this.oWriteStub.callCount, 0, "Storage write not called");
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"then no dirty changes exist anymore"
				);
			}.bind(this));
		});

		QUnit.test("Shall save passed dirty changes with changes in DELETE state", function(assert) {
			var oChangeNotToBeSaved = FlexObjectFactory.createFromFileContent({
				fileName: "ChangeFileName1",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			});

			var oChangeToBeSaved = FlexObjectFactory.createFromFileContent({
				fileName: "ChangeFileName2",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control2"}
			});
			UIChangeManager.addDirtyChanges(sReference, [oChangeNotToBeSaved, oChangeToBeSaved], this.oComponentInstance);
			var aDirtyFlexObjects = FlexObjectState.getDirtyFlexObjects(sReference);
			assert.strictEqual(
				aDirtyFlexObjects.length, 2, "then two dirty changes exist initially"
			);
			aDirtyFlexObjects[1].setState(States.LifecycleState.DELETED);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance, false, [oChangeToBeSaved], Version.Number.Original)
			.then(function() {
				assert.equal(this.oRemoveStub.callCount, 1);
				assert.equal(this.oRemoveStub.getCall(0).args[0].parentVersion,
					Version.Number.Original, "the (original) version parameter was passed");
				assert.equal(this.oWriteStub.callCount, 0);
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					1,
					"then one dirty change still exists"
				);
				assert.deepEqual(
					FlexObjectState.getDirtyFlexObjects(sReference)[0],
					oChangeNotToBeSaved,
					"the the correct dirty change was not saved"
				);
			}.bind(this));
		});

		QUnit.test("Shall save all dirty changes in a bulk", function(assert) {
			var oChangeContent1 = {
				fileName: "ChangeFileName1",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};

			var oChangeContent2 = {
				fileName: "ChangeFileName2",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};
			UIChangeManager.addDirtyChanges(sReference, [oChangeContent1, oChangeContent2], this.oComponentInstance);

			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				2,
				"then two dirty changes exist initially"
			);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference).then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the create method of the connector is called once");
				assert.strictEqual(this.oWriteStub.getCall(0).args[0].flexObjects[0].fileName,
					oChangeContent1.fileName, "the first change was processed first");
				assert.strictEqual(this.oWriteStub.getCall(0).args[0].flexObjects[1].fileName,
					oChangeContent2.fileName, "the second change was processed afterwards");
			}.bind(this));
		});

		QUnit.test("Shall save passed dirty changes in a bulk", function(assert) {
			var oChangeContent1 = {
				fileName: "ChangeFileName1",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};

			var oChangeContent2 = {
				fileName: "ChangeFileName2",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control2"}
			};

			const aChangesToBeSaved = UIChangeManager.addDirtyChanges(sReference, [oChangeContent1], this.oComponentInstance);
			UIChangeManager.addDirtyChanges(sReference, [oChangeContent2], this.oComponentInstance);

			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				2,
				"then two dirty changes exist initially"
			);
			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, this.oComponentInstance, false, aChangesToBeSaved).then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the create method of the connector is called once");
			}.bind(this));
		});

		QUnit.test("(Save As scenario) Shall save the dirty changes for the new created app variant in a bulk when pressing a 'Save As' button", function(assert) {
			const oChangeContent1 = {
				fileName: "ChangeFileName1",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			const oChangeContent2 = {
				fileName: "ChangeFileName2",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};
			UIChangeManager.addDirtyChanges(sReference, [oChangeContent1, oChangeContent2], this.oComponentInstance);
			const oCheckUpdatableSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");

			this.oServer.respondWith([
				200,
				{
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				},
				"{ \"changes\":[], \"contexts\":[], \"settings\":{\"isAtoEnabled\":true} }"
			]);

			this.oServer.autoRespond = true;

			return FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, true).then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the create method of the connector is called once");
				assert.deepEqual(this.oWriteStub.getCall(0).args[0].flexObjects[0].fileName,
					oChangeContent1.fileName, "the first change was processed first");
				assert.deepEqual(this.oWriteStub.getCall(0).args[0].flexObjects[1].fileName,
					oChangeContent2.fileName, "the second change was processed afterwards");
				assert.strictEqual(oCheckUpdatableSpy.callCount, 1, "the checkUpdate method was called just once");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});