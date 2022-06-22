/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/controlVariants/prepareVariantsMap",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/values",
	"sap/ui/thirdparty/sinon-4"
], function(
	prepareVariantsMap,
	VariantUtil,
	LoaderExtensions,
	values,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.dump.maxDepth = 20;

	function replaceInstancesOfCtrlChanges(mVariantsMap) {
		values(mVariantsMap).forEach(function(oVariantManagementReference) {
			oVariantManagementReference.variants.forEach(function(oVariant) {
				oVariant.controlChanges = oVariant.controlChanges.map(function(oChange) {
					return oChange.getDefinition();
				});
				delete oVariant.instance;
			});
		});
		return mVariantsMap;
	}

	function removeVariants(mVariantsMap) {
		values(mVariantsMap).forEach(function(oVariantManagementReference) {
			oVariantManagementReference.variants.forEach(function(oVariant) {
				delete oVariant.instance;
			});
		});
		return mVariantsMap;
	}

	QUnit.module("Given prepareVariantsMap()", {
		beforeEach: function() {
			return Promise.all([
				LoaderExtensions.loadResource({
					dataType: "json",
					url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/TestVariantsConnectorResponse.json"),
					async: true
				}),
				LoaderExtensions.loadResource({
					dataType: "json",
					url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/TestFakeVariantsMap.json"),
					async: true
				})
			]).then(function(aValues) {
				this.oBackendResponse = {};
				this.oBackendResponse.changes = aValues[0];

				this.oVariantsMap = aValues[1];
				this.sComponentId = "componentId";
				this.mPropertyBag = {
					unfilteredStorageResponse: {changes: {}},
					storageResponse: this.oBackendResponse,
					componentId: this.sComponentId,
					componentData: {
						technicalParameters: {}
					},
					reference: "sap.ui.rta.test.Demo.md.Component"
				};
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called with no parameters", function(assert) {
			var oExpectedMap = {};
			assert.deepEqual(prepareVariantsMap({}), oExpectedMap, "the function returns an object with a map inside");
		});

		QUnit.test("when calling with required parameters without variant technical parameters", function(assert) {
			var oVariantsMap = prepareVariantsMap(this.mPropertyBag);

			assert.strictEqual(oVariantsMap["vmReference1"].variants[0].instance.getId(), "vmReference1", "the correct variant was created");
			assert.strictEqual(oVariantsMap["vmReference1"].variants[1].instance.getId(), "variant0", "the correct variant was created");
			assert.strictEqual(oVariantsMap["vmReference1"].variants[2].instance.getId(), "variant2", "the correct variant was created");
			assert.strictEqual(oVariantsMap["vmReference2"].variants[0].instance.getId(), "vmReference2", "the correct variant was created");
			assert.strictEqual(oVariantsMap["vmReference2"].variants[1].instance.getId(), "variant00", "the correct variant was created");
			assert.strictEqual(oVariantsMap["vmReference2"].variants[2].instance.getId(), "variant11", "the correct variant was created");
			assert.strictEqual(oVariantsMap["vmReference3"].variants[0].instance.getId(), "vmReference3", "the correct variant was created");
			assert.strictEqual(oVariantsMap["vmReference3"].variants[1].instance.getId(), "variant31", "the correct variant was created");
			assert.strictEqual(oVariantsMap["vmReference4"].variants[0].instance.getId(), "vmReference4", "the correct variant was created");
			assert.strictEqual(oVariantsMap["nonExistingVariant1"].variants[0].instance.getId(), "nonExistingVariant1", "the correct variant was created");
			assert.strictEqual(oVariantsMap["nonExistingVariant2"].variants[0].instance.getId(), "nonExistingVariant2", "the correct variant was created");
			assert.strictEqual(oVariantsMap["vmReference1"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.strictEqual(oVariantsMap["vmReference1"].variants[1].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.strictEqual(oVariantsMap["vmReference1"].variants[2].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.strictEqual(oVariantsMap["vmReference2"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.strictEqual(oVariantsMap["vmReference2"].variants[1].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.strictEqual(oVariantsMap["vmReference2"].variants[2].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.strictEqual(oVariantsMap["vmReference3"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.strictEqual(oVariantsMap["vmReference3"].variants[1].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.strictEqual(oVariantsMap["vmReference4"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.strictEqual(oVariantsMap["nonExistingVariant1"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.strictEqual(oVariantsMap["nonExistingVariant2"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
			assert.deepEqual(replaceInstancesOfCtrlChanges(oVariantsMap), removeVariants(this.oVariantsMap), "then the variants map was returned correctly");
		});

		QUnit.test("when calling with required parameters with variant technical parameters set for a single variant management reference", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference1"];

			var oVariantsMap = prepareVariantsMap(this.mPropertyBag);

			// mocking properties in response for technical parameters
			this.oVariantsMap["vmReference1"].currentVariant = "vmReference1";
			assert.deepEqual(replaceInstancesOfCtrlChanges(oVariantsMap), removeVariants(this.oVariantsMap), "then the variants map was returned correctly");
		});

		QUnit.test("when calling with required parameters with variant technical parameters set for multiple variant management references", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference1", "variant11"];

			var oVariantsMap = prepareVariantsMap(this.mPropertyBag);

			// mocking properties in response for technical parameters
			this.oVariantsMap["vmReference1"].currentVariant = "vmReference1";
			this.oVariantsMap["vmReference2"].currentVariant = "variant11";
			assert.deepEqual(replaceInstancesOfCtrlChanges(oVariantsMap), removeVariants(this.oVariantsMap), "then the variants map was returned correctly");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
