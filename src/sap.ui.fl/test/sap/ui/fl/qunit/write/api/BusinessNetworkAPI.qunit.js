/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/BusinessNetworkAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], (
	Control,
	ControlVariantsUtils,
	FlexObjectFactory,
	ManifestUtils,
	FlexInfoSession,
	FlexObjectManager,
	Storage,
	BusinessNetworkAPI,
	ChangesWriteAPI,
	FeaturesAPI,
	Layer,
	Utils,
	sinon
) => {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sVMR = "vmReference";

	QUnit.module("BusinessNetworkAPI", {
		beforeEach() {
			sandbox.stub(Storage, "write").callsFake((mProperties) => {
				return Promise.resolve({response: mProperties.flexObjects.map((oChange) => oChange)});
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when createAndSaveVariant is called", async function(assert) {
			const oResponse = await BusinessNetworkAPI.createAndSaveVariant({
				variantManagementReference: "vmReference",
				variantName: "foo",
				layer: Layer.USER,
				author: "myAuthor",
				variantReference: "myFancyVariantReference",
				reference: "flexReference",
				id: "myId"
			});
			assert.strictEqual(oResponse.length, 1, "then one objects is returned");
			const oUserVariantJson = oResponse[0];
			const oUserVariant = FlexObjectFactory.createFromFileContent(oUserVariantJson);
			assert.ok(oUserVariant.isA("sap.ui.fl.apply._internal.flexObjects.FlVariant"), "then a variant object is created");
			assert.strictEqual(oUserVariant.getId(), "myId", "then the id is correct");
			assert.strictEqual(oUserVariant.getLayer(), Layer.USER, "then the layer is USER");
			assert.strictEqual(oUserVariant.getVariantReference(), "myFancyVariantReference", "then the variant reference is correct");
			assert.strictEqual(oUserVariant.getName(), "foo", "then the variant name is set");
			assert.strictEqual(oUserVariant.getFlexObjectMetadata().reference, "flexReference", "then the flex reference is correct");
			assert.strictEqual(
				oUserVariant.getSupportInformation().generator, "BusinessNetworkAPI.createVariant",
				"then the default generator is set"
			);
			assert.strictEqual(oUserVariant.getSupportInformation().user, "myAuthor", "then the user is set");

			const oCustomerResponse = await BusinessNetworkAPI.createAndSaveVariant({
				variantManagementReference: "vmReference",
				variantName: "foobar",
				generator: "myGenerator",
				reference: "flexReference",
				id: "myFancyId"
			});
			assert.strictEqual(oCustomerResponse.length, 1, "then one object is returned");
			const oKeyUserVariantJson = oCustomerResponse[0];
			const oKeyUserVariant = FlexObjectFactory.createFromFileContent(oKeyUserVariantJson);
			assert.ok(oKeyUserVariant.isA("sap.ui.fl.apply._internal.flexObjects.FlVariant"), "then a variant object is created");
			assert.strictEqual(oKeyUserVariant.getId(), "myFancyId", "then the id is correct");
			assert.strictEqual(oKeyUserVariant.getVariantReference(), "vmReference", "then the variant reference is correct");
			assert.strictEqual(oKeyUserVariant.getLayer(), Layer.CUSTOMER, "then the layer is USER");
			assert.strictEqual(oKeyUserVariant.getName(), "foobar", "then the variant name is set");
			assert.strictEqual(oKeyUserVariant.getFlexObjectMetadata().reference, "flexReference", "then the flex reference is set");
			assert.strictEqual(oKeyUserVariant.getSupportInformation().generator, "myGenerator", "then the generator is set");
			assert.strictEqual(oKeyUserVariant.getSupportInformation().user, ControlVariantsUtils.DEFAULT_AUTHOR, "then the user is set");
		});

		QUnit.test("when createDefaultVariant and save is called", async function(assert) {
			sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves("saveReturn");
			sandbox.stub(FlexObjectManager, "addDirtyFlexObjects");
			sandbox.stub(Utils, "getAppComponentForControl").returns({
				getLocalId: () => sVMR
			});
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("flexReference");

			const oControl = new Control();
			const aChanges = BusinessNetworkAPI.createDefaultVariant({
				control: oControl,
				variantName: "foo"
			});

			assert.strictEqual(FlexObjectManager.addDirtyFlexObjects.callCount, 1, "then the dirty objects are added");
			assert.strictEqual(aChanges.length, 2, "then two objects are returned");
			const oUserVariant = aChanges[0];
			assert.ok(oUserVariant.isA("sap.ui.fl.apply._internal.flexObjects.FlVariant"), "then a variant object is created");
			assert.strictEqual(oUserVariant.getLayer(), Layer.USER, "then the layer is USER");
			assert.strictEqual(oUserVariant.getVariantReference(), sVMR, "then the variant reference is correct");
			assert.strictEqual(oUserVariant.getName(), "foo", "then the variant name is correct");
			assert.strictEqual(oUserVariant.getFlexObjectMetadata().reference, "flexReference", "then the flex reference is correct");
			assert.strictEqual(
				oUserVariant.getSupportInformation().generator, "BusinessNetworkAPI.createDefaultVariant",
				"then the default generator is set"
			);

			const oUserVariantChange = aChanges[1];
			assert.strictEqual(oUserVariantChange.getChangeType(), "setDefault", "then the change type is set to setDefault");
			assert.strictEqual(oUserVariantChange.getLayer(), Layer.USER, "then the layer is USER");
			assert.deepEqual(oUserVariantChange.getSelector(), {id: sVMR, idIsLocal: true}, "then the selector is set");
			assert.deepEqual(oUserVariantChange.getContent(), { defaultVariant: sVMR }, "then the content is set");

			const sResponse = await BusinessNetworkAPI.save(oControl);
			assert.strictEqual(sResponse, "saveReturn", "then the save response is returned");
			assert.ok(FlexObjectManager.addDirtyFlexObjects.calledOnce, "then the dirty objects are added");
		});

		QUnit.test("when disablePersonalization is called with a valid reference", function(assert) {
			const sReference = "sap.ui.rta.test";
			window.sessionStorage.setItem(`sap.ui.fl.info.${sReference}`, JSON.stringify({maxLayer: "CUSTOMER"}));
			BusinessNetworkAPI.disablePersonalization(sReference);

			const oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.strictEqual(oFlexInfoSession.maxLayer, Layer.CUSTOMER, "then the max layer is set to CUSTOMER");
			assert.ok(oFlexInfoSession.saveChangeKeepSession, "then saveChangeKeepSession is set to true");
			assert.ok(window.sessionStorage.getItem("sap.ui.rta.skipReload"), "then skipReload is set in sessionStorage");
		});

		QUnit.test("when disablePersonalization is called with an invalid reference", function(assert) {
			assert.throws(
				() => BusinessNetworkAPI.disablePersonalization("invalidRef"),
				/Error: Invalid reference provided: invalidRef/,
				"then an error is thrown with a meaningful message"
			);
		});

		QUnit.test("when deleteVariants is called", async function(assert) {
			const aExpectedDeletedObjects = ["variant1", "variant2", "DeletedObject1", "DeletedObject2"];
			sandbox.stub(ChangesWriteAPI, "deleteVariantsAndRelatedObjects")
			.withArgs({
				variantManagementControl: "DummyVMControl",
				variants: ["variant1", "variant2"],
				layer: Layer.CUSTOMER,
				forceDelete: true
			})
			.returns(aExpectedDeletedObjects);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(false);
			const oSaveFlexObjectsStub = sandbox.stub(FlexObjectManager, "saveFlexObjects")
			.withArgs({
				selector: "DummyVMControl",
				flexObjects: aExpectedDeletedObjects,
				includeCtrlVariants: true
			});
			const aDeletedObjects = await BusinessNetworkAPI.deleteVariants({
				vmControl: "DummyVMControl",
				variants: ["variant1", "variant2"]
			});
			assert.deepEqual(aDeletedObjects, aExpectedDeletedObjects, "then the deleted objects are returned");
			assert.ok(oSaveFlexObjectsStub, "then the saveFlexObjects function is called once with the correct parameters");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
