/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/BusinessNetworkAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], (
	Control,
	ControlVariantsUtils,
	FlexObjectFactory,
	ManifestUtils,
	FlexObjectManager,
	Storage,
	BusinessNetworkAPI,
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
				return Promise.resolve({response: mProperties.flexObjects.map((oChange) => oChange.convertToFileContent())});
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
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
