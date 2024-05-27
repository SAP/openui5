/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Control,
	UIComponent,
	FlexObjectFactory,
	FlexState,
	ManifestUtils,
	Version,
	Settings,
	SessionStorageConnector,
	CompVariantState,
	FlexObjectState,
	Versions,
	ChangePersistenceFactory,
	FlexControllerFactory,
	Layer,
	Utils,
	JSONModel,
	sinon,
	FlQUnitUtils
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

	function addDirtyChanges() {
		const oChange1 = FlexObjectFactory.createFromFileContent({
			fileType: "change",
			selector: {},
			changeType: "dirtyRenameField",
			layer: Layer.USER
		});
		const oChange2 = FlexObjectFactory.createFromFileContent({
			fileType: "change",
			selector: {},
			changeType: "dirtyAddGroup",
			layer: Layer.USER
		});
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
		oChangePersistence.addDirtyChanges([oChange1, oChange2]);
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
			ChangePersistenceFactory._instanceCache = {};
			FlexState.clearState(sReference);
			FlexState.clearRuntimeSteadyObjects(sReference, this.oAppComponent.getId());
			FlexState.resetInitialNonFlCompVariantData(sReference);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Get - Given no flex objects are present", async function(assert) {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference);
			return FlexObjectState.getFlexObjects({
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

			const aFlexObjects = await FlexObjectState.getFlexObjects({
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
			var sPersistencyKey = "persistency.key";
			var oControl = new Control();
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

			return FlexObjectState.getFlexObjects({
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
			var sPersistencyKey = "persistency.key";
			var oControl = new Control();
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
			return FlexObjectState.getFlexObjects({
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
			const aFlexObjects = await FlexObjectState.getFlexObjects({
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
			var sPersistencyKey = "persistency.key";
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
			const aFlexObjects = await FlexObjectState.getFlexObjects({
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
			var sPersistencyKey = "persistency.key";
			var sVariantId = "variantId1";

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
				persistencyKey: sPersistencyKey
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
				persistencyKey: sPersistencyKey
			});

			return FlexObjectState.getFlexObjects({
				selector: this.oAppComponent,
				currentLayer: Layer.CUSTOMER
			})
			.then(function(aFlexObjects) {
				assert.strictEqual(aFlexObjects.length, 1, "an array with one entry is returned");
				assert.strictEqual(aFlexObjects[0].getChangeType(), "updateVariant", "the change from the compVariantState is present");
			});
		});

		QUnit.test("Get - Given flex objects of different layers are present in the CompVariantState and currentLayer not set", function(assert) {
			var sPersistencyKey = "persistency.key";
			var sVariantId = "variantId1";

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

			return FlexObjectState.getFlexObjects({
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
			const aFlexObjects = await FlexObjectState.getFlexObjects({
				selector: this.oAppComponent
			});
			assert.strictEqual(aFlexObjects.length, 4, "an array with four entries is returned");
			assert.strictEqual(aFlexObjects[0].getChangeType(), "renameField", "the first change from the persistence is present");
			assert.strictEqual(aFlexObjects[1].getChangeType(), "addGroup", "the second change from the persistence is present");
			assert.strictEqual(aFlexObjects[2].getChangeType(), "dirtyRenameField", "the third change from the persistence is present");
			assert.strictEqual(aFlexObjects[3].getChangeType(), "dirtyAddGroup", "the fourth change from the persistence is present");
		});

		QUnit.test("GetDirty - Given flex objects and dirty changes are present in the ChangePersistence", async function(assert) {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
				changes: createTwoChangeDefs()
			});
			addDirtyChanges();
			const aFlexObjects = await FlexObjectState.getDirtyFlexObjects({
				selector: this.oAppComponent
			});
			assert.strictEqual(aFlexObjects.length, 2, "an array with two entries is returned");
			assert.strictEqual(aFlexObjects[0].getChangeType(), "dirtyRenameField", "the first change from the persistence is present");
			assert.strictEqual(aFlexObjects[1].getChangeType(), "dirtyAddGroup", "the second change from the persistence is present");
		});

		QUnit.test("hasDirtyObjects - Given flex objects and dirty changes are present in the ChangePersistence", function(assert) {
			var oStubGetChangePersistenceForComponent = sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns({
				getDirtyChanges() {
					return ["mockDirty"];
				}
			});
			var oStubCompStateHasDirtyChanges = sandbox.stub(CompVariantState, "hasDirtyChanges").returns(true);
			assert.strictEqual(FlexObjectState.hasDirtyFlexObjects({selector: this.oAppComponent}), true, "hasDirtyFlexObjects return true");
			assert.strictEqual(oStubGetChangePersistenceForComponent.calledOnce, true, "getChangePersistenceForComponent called one");
			assert.strictEqual(oStubCompStateHasDirtyChanges.calledOnce, false, "CompVariantState.hasDirtyChanges is not called");
		});

		QUnit.test("hasDirtyObjects - Given flex objects and dirty changes are present in the CompVariantState", function(assert) {
			var oStubGetChangePersistenceForComponent = sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns({
				getDirtyChanges() {
					return [];
				}
			});
			var oStubCompStateHasDirtyChanges = sandbox.stub(CompVariantState, "hasDirtyChanges").returns(true);
			assert.strictEqual(FlexObjectState.hasDirtyFlexObjects({selector: this.oAppComponent}), true, "hasDirtyFlexObjects return true");
			assert.strictEqual(oStubGetChangePersistenceForComponent.calledOnce, true, "getChangePersistenceForComponent called once");
			assert.strictEqual(oStubCompStateHasDirtyChanges.calledOnce, true, "CompVariantState.hasDirtyChanges is not called");
		});

		QUnit.test("Save", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var oPersistAllStub = sandbox.stub(CompVariantState, "persistAll").resolves();
			var oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			var oSaveAllStub1 = sandbox.stub(oFlexController, "saveAll").resolves();
			var oGetFlexObjectsStub = sandbox.stub(FlexObjectState, "getFlexObjects").resolves("foo");

			return FlexObjectState.saveFlexObjects({
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
				var oExpectedParameters = {
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
			var oPersistAllStub = sandbox.stub(CompVariantState, "persistAll").resolves();
			var oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			var oSaveAllStub1 = sandbox.stub(oFlexController, "saveAll").resolves();
			var oGetFlexObjectsStub = sandbox.stub(FlexObjectState, "getFlexObjects").resolves("foo");
			sandbox.stub(Versions, "hasVersionsModel").returns(true);
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				displayedVersion: Version.Number.Draft
			}));

			return FlexObjectState.saveFlexObjects({
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
				var oExpectedParameters = {
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
			var oPersistAllStub = sandbox.stub(CompVariantState, "persistAll").resolves();
			var oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			var oSaveAllStub1 = sandbox.stub(oFlexController, "saveAll").resolves();
			var oGetFlexObjectsStub = sandbox.stub(FlexObjectState, "getFlexObjects").resolves("foo");

			return FlexObjectState.saveFlexObjects({
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
				var oExpectedParameters = {
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

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});