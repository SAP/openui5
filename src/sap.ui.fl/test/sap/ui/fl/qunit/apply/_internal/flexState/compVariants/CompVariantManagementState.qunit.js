/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantManagementState",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	CompVariantManagementState,
	FlexObjectFactory,
	FlexState,
	Layer,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	const sReference = "myApp";
	const sComponentId = "comp_id1";
	const sPersistencyKey = "id1";

	async function initializeFlexState() {
		await FlexState.initialize({
			componentId: sComponentId,
			reference: sReference
		});
	}

	function stubFlexObjectsSelector(aFlexObjects) {
		const oFlexObjectsSelector = FlexState.getFlexObjectsDataSelector();
		const oGetFlexObjectsStub = sandbox.stub(oFlexObjectsSelector, "get");
		oGetFlexObjectsStub.callsFake(function(...aArgs) {
			return aFlexObjects.concat(oGetFlexObjectsStub.wrappedMethod.apply(this, aArgs));
		});
		oFlexObjectsSelector.checkUpdate();
	}

	QUnit.module("getVariant", {
		async beforeEach() {
			await initializeFlexState();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with a stored setDefaultVariant change for the persistency key", function(assert) {
			const oSetDefaultChange1 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER
			});
			const oSetDefaultChange2 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.USER
			});

			stubFlexObjectsSelector([oSetDefaultChange1, oSetDefaultChange2]);
			const aDefaultChanges = CompVariantManagementState.getDefaultChanges({
				reference: "myApp",
				persistencyKey: sPersistencyKey
			});
			assert.strictEqual(aDefaultChanges.length, 2);
			assert.deepEqual(aDefaultChanges[0], oSetDefaultChange1, "default Change 1 was found");
			assert.deepEqual(aDefaultChanges[1], oSetDefaultChange2, "default Change 2 was found");
		});

		QUnit.test("with two stored setDefaultVariant changes for the persistency key", function(assert) {
			const oSetDefaultChange1 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER
			});
			const oSetDefaultChange2 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: "someOtherId"
				},
				layer: Layer.USER
			});
			stubFlexObjectsSelector([oSetDefaultChange1, oSetDefaultChange2]);
			assert.deepEqual(CompVariantManagementState.getDefaultChanges(
				{reference: "myApp", persistencyKey: sPersistencyKey}), [oSetDefaultChange1], "the first set default change gets returned");
		});

		QUnit.test("with one stored setDefaultVariant change and another variant change for the same persistency key", function(assert) {
			const sPersitencyKey = "id1";
			const oSetDefaultChange1 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersitencyKey
				},
				layer: Layer.CUSTOMER
			});

			const oSetDefaultChange2 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "setContent",
				selector: {
					persistencyKey: sPersitencyKey,
					variantId: "hugo"
				},
				layer: Layer.USER
			});
			stubFlexObjectsSelector([oSetDefaultChange1, oSetDefaultChange2]);
			assert.deepEqual(CompVariantManagementState.getDefaultChanges(
				{reference: "myApp", persistencyKey: sPersitencyKey}), [oSetDefaultChange1], "the first set default change gets returned");
		});
	});

	QUnit.module("VariantsMapSelector.checkInvalidation", {
		async beforeEach() {
			await initializeFlexState();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when updateInfo is missing", function(assert) {
			FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER
			});
			const oDataSelector = CompVariantManagementState.getSetDefaultDataSelector();
			const oClearCacheSpy = sandbox.spy(oDataSelector, "_clearCache");
			oDataSelector.checkUpdate({reference: sReference});
			assert.strictEqual(oClearCacheSpy.callCount, 1, "then the update happened");
		});

		QUnit.test("when updateType 'addFlexObject' with variant related updated object is provided", function(assert) {
			const oUIChange = FlexObjectFactory.createFromFileContent({
				id: "someSetDefaultChange",
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: "myKey"
				},
				fileType: "change",
				changeType: "defaultVariant"
			});
			const oDataSelector = CompVariantManagementState.getSetDefaultDataSelector();
			const oClearCacheSpy = sandbox.spy(oDataSelector, "_clearCache");
			const mParameters = {
				reference: sReference,
				persistencyKey: sPersistencyKey
			};
			oDataSelector.checkUpdate(mParameters, [{type: "addFlexObject", updatedObject: oUIChange}]);
			assert.strictEqual(oClearCacheSpy.callCount, 1, "then the cache has been invalidated");
		});

		QUnit.test("when updateType 'addFlexObject' without an updated object is provided", function(assert) {
			const oDataSelector = CompVariantManagementState.getSetDefaultDataSelector();
			const oClearCacheSpy = sandbox.spy(oDataSelector, "_clearCache");
			oDataSelector.checkUpdate(
				{reference: sReference},
				[{type: "addFlexObject"}]
			);
			assert.strictEqual(oClearCacheSpy.callCount, 0, "then the cache has not been invalidated");
		});

		QUnit.test("when updateTypes 'addFlexObject' & 'removeFlexObject' with a default variant change object as updated object is provided", function(assert) {
			const oDefaultVariantChange = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER
			});
			const oDataSelector = CompVariantManagementState.getSetDefaultDataSelector();
			const oClearCacheSpy = sandbox.spy(oDataSelector, "_clearCache");
			oDataSelector.checkUpdate(
				{reference: sReference},
				[
					{type: "addFlexObject", updatedObject: oDefaultVariantChange},
					{type: "removeFlexObject", updatedObject: oDefaultVariantChange}
				]
			);
			assert.equal(oClearCacheSpy.callCount, 1, "then the cache has been invalidated");
		});

		QUnit.test("when just invalid updateInfos are provided", function(assert) {
			const oUIChangeWithoutVariantReference = FlexObjectFactory.createFromFileContent({
				id: "someUIChange",
				layer: Layer.CUSTOMER
			});
			const oDataSelector = CompVariantManagementState.getSetDefaultDataSelector();
			const oClearCacheSpy = sandbox.spy(oDataSelector, "_clearCache");
			oDataSelector.checkUpdate(
				{reference: sReference},
				[
					{type: "justAnotherType", updatedObject: oUIChangeWithoutVariantReference},
					{type: "anotherType"}
				]
			);
			assert.equal(oClearCacheSpy.callCount, 0, "then the cache has not been invalidated");
		});
	});

	QUnit.module("CompVariantManagementState.getDefaultVariantId", {
		async beforeEach() {
			await initializeFlexState();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called an no default changes are stored", function(assert) {
			const sDefaultVariantId = CompVariantManagementState.getDefaultVariantId({
				persistencyKey: sPersistencyKey,
				reference: "myApp",
				variants: []
			});
			assert.equal(sDefaultVariantId, "", "then '' is returned");
		});

		QUnit.test("when called an default changes is stored with an 'undefined' key and is requested", function(assert) {
			const sDefaultVariantName = "expectedDefaultVariantName";

			const oSetDefaultChange = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				layer: Layer.CUSTOMER,
				content: {
					defaultVariantName: sDefaultVariantName
				}
			});
			stubFlexObjectsSelector([oSetDefaultChange]);

			const sDefaultVariantId = CompVariantManagementState.getDefaultVariantId({
				persistencyKey: "undefined",
				reference: "myApp",
				variants: [{
					getVariantId: () => sDefaultVariantName
				}],
				includeUndefined: true
			});
			assert.equal(sDefaultVariantId, sDefaultVariantName, "then the key is returned");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});