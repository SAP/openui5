/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/prepareVariantsMap",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/Component",
	"sap/ui/thirdparty/sinon-4"
], function (
	prepareVariantsMap,
	VariantUtil,
	LoaderExtensions,
	Component,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();
	QUnit.dump.maxDepth = 20;
	QUnit.module("Given prepareVariantsMap()", {
		beforeEach: function () {
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
			]).then(function (aValues) {
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
					}
				};
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when called with no parameters", function (assert) {
			var oExpectedMap = {};
			assert.deepEqual(prepareVariantsMap({}), oExpectedMap, "the function returns an object with a map inside");
		});

		QUnit.test("when calling with required parameters without variant technical parameters", function(assert) {
			var oVariantsMap = prepareVariantsMap(this.mPropertyBag);
			assert.deepEqual(oVariantsMap, this.mPropertyBag.unfilteredStorageResponse.changes.variantSection, "then the variants map was set correctly");
			assert.deepEqual(oVariantsMap, this.oVariantsMap, "then the variants map was returned correctly");
		});

		QUnit.test("when calling with required parameters with variant technical parameters set for a single variant management reference", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference1"];

			var oVariantsMap = prepareVariantsMap(this.mPropertyBag);

			// mocking properties in response for technical parameters
			this.oVariantsMap["vmReference1"].currentVariant = "vmReference1";
			assert.deepEqual(oVariantsMap, this.oVariantsMap, "then the variants map was returned correctly");
		});

		QUnit.test("when calling with required parameters with variant technical parameters set for multiple variant management references", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference1", "variant11"];

			var oVariantsMap = prepareVariantsMap(this.mPropertyBag);

			// mocking properties in response for technical parameters
			this.oVariantsMap["vmReference1"].currentVariant = "vmReference1";
			this.oVariantsMap["vmReference2"].currentVariant = "variant11";
			assert.deepEqual(oVariantsMap, this.oVariantsMap, "then the variants map was returned correctly");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
