/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/controlVariants/prepareVariantsMap",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/values",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/sinon-4"
], function(
	prepareVariantsMap,
	VariantUtil,
	LoaderExtensions,
	values,
	Settings,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.dump.maxDepth = 20;

	function checkVariantsMap(oVariantsMap, assert) {
		assert.strictEqual(oVariantsMap["vmReference1"].variants[0].instance.getId(), "vmReference1", "the correct variant was created");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[1].instance.getId(), "variant0", "the correct variant was created");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[2].instance.getId(), "variant2", "the correct variant was created");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[1].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[2].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[0].controlChanges[0].getId(), "id_1445501120486_41", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[0].controlChanges[1].getId(), "id_1445501120486_44", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[1].controlChanges[0].getId(), "id_1445501120486_41", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[1].controlChanges[1].getId(), "id_1445501120486_42", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[1].controlChanges[2].getId(), "id_1445501120486_43", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[1].variantChanges.setTitle[0].fileName, "id_1507716136285_38_setTitle", "the variant change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[1].variantChanges.setFavorite[0].fileName, "id_1507716136286_39_setFavorite", "the variant change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[1].variantChanges.setExecuteOnSelect[0].fileName, "id_1507716136285_38_setExecuteOnSelect", "the variant change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[2].controlChanges[0].getId(), "id_1445501120486_41", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[2].controlChanges[1].getId(), "id_1445501120486_43", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[2].controlChanges[2].getId(), "id_1445501120486_41", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[2].controlChanges[3].getId(), "id_1445501120486_42", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[2].variantChanges.setVisible[0].fileName, "id_1575231865073_60_setVisible", "the variant change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[2].variantChanges.setExecuteOnSelect[0].fileName, "id_1507716136285_41_setExecuteOnSelect", "the variant change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variants[2].variantChanges.setContexts[0].fileName, "id_1507716136285_55_setContexts", "the variant change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].variantManagementChanges.setDefault[0].fileName, "id_1510920910626_29_setDefault", "the variant management change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference1"].defaultVariant, "variant0", "default variant is set");

		assert.strictEqual(oVariantsMap["vmReference2"].variants[0].instance.getId(), "vmReference2", "the correct variant was created");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[1].instance.getId(), "variant00", "the correct variant was created");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[1].controlChanges[0].getId(), "id_1445501120486_51", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[1].controlChanges[1].getId(), "id_1445501120486_52", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[2].instance.getId(), "variant11", "the correct variant was created");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[2].controlChanges[0].getId(), "id_1445501120486_51", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[2].controlChanges[1].getId(), "id_1445501120486_52", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[2].controlChanges[2].getId(), "id_1445501120486_51", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[2].controlChanges[3].getId(), "id_1445501120486_53", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[1].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["vmReference2"].variants[2].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["vmReference2"].variantManagementChanges.setDefault[0].fileName, "id_1510920910626_30_setDefault", "the variant management change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference2"].defaultVariant, "variant00", "default variant is set");

		assert.strictEqual(oVariantsMap["vmReference3"].variants[0].instance.getId(), "vmReference3", "the correct variant was created");
		assert.strictEqual(oVariantsMap["vmReference3"].variants[1].instance.getId(), "variant31", "the correct variant was created");
		assert.strictEqual(oVariantsMap["vmReference3"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["vmReference3"].variants[1].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["vmReference3"].defaultVariant, "vmReference3", "default variant is set");

		assert.strictEqual(oVariantsMap["vmReference4"].variants[0].instance.getId(), "vmReference4", "the correct variant was created");
		assert.strictEqual(oVariantsMap["vmReference4"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["vmReference4"].variantManagementChanges.setDefault[0].fileName, "id_1510920910626_30_setDefault", "the variant management change was correctly added");
		assert.strictEqual(oVariantsMap["vmReference4"].defaultVariant, "foo", "default variant is set");

		assert.strictEqual(oVariantsMap["nonExistingVariant1"].variants[0].instance.getId(), "nonExistingVariant1", "the correct variant was created");
		assert.strictEqual(oVariantsMap["nonExistingVariant1"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["nonExistingVariant1"].variants[0].variantChanges.setVisible[0].fileName, "id_1575231865999_60_setVisible", "the variant change was correctly added");
		assert.strictEqual(oVariantsMap["nonExistingVariant1"].variants[0].variantChanges.setFavorite[0].fileName, "id_1507716136999_39_setFavorite", "the variant change was correctly added");
		assert.strictEqual(oVariantsMap["nonExistingVariant1"].defaultVariant, "nonExistingVariant1", "default variant is set");

		assert.strictEqual(oVariantsMap["nonExistingVariant2"].variants[0].instance.getId(), "nonExistingVariant2", "the correct variant was created");
		assert.strictEqual(oVariantsMap["nonExistingVariant2"].variants[0].instance.getFlexObjectMetadata().reference, "sap.ui.rta.test.Demo.md.Component", "the correct reference is set");
		assert.strictEqual(oVariantsMap["nonExistingVariant2"].variants[0].controlChanges[0].getId(), "id_1445501120999_53", "the control change was correctly added");
		assert.strictEqual(oVariantsMap["nonExistingVariant2"].defaultVariant, "nonExistingVariant2", "default variant is set");
	}

	QUnit.module("Given prepareVariantsMap()", {
		beforeEach: function() {
			return LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/TestVariantsConnectorResponse.json"),
				async: true
			})
			.then(function(oBackendResponse) {
				this.oBackendResponse = {};
				this.oBackendResponse.changes = oBackendResponse;

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
			checkVariantsMap(oVariantsMap, assert);
		});

		QUnit.test("when calling with required parameters with variant technical parameters set for a single variant management reference", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference1"];
			var oVariantsMap = prepareVariantsMap(this.mPropertyBag);

			checkVariantsMap(oVariantsMap, assert);
			assert.strictEqual(oVariantsMap["vmReference1"].currentVariant, "vmReference1", "the current variant is set");
		});

		QUnit.test("when calling with required parameters with variant technical parameters set for multiple variant management references", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference1", "variant11"];
			var oVariantsMap = prepareVariantsMap(this.mPropertyBag);

			checkVariantsMap(oVariantsMap, assert);
			assert.strictEqual(oVariantsMap["vmReference1"].currentVariant, "vmReference1", "the current variant is set");
			assert.strictEqual(oVariantsMap["vmReference2"].currentVariant, "variant11", "the current variant is set");
		});

		QUnit.test("when calling for variants without user id in when Settings returns a user", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getUserId: function() {
					return "TestUser";
				}
			});

			var oVariantsMap = prepareVariantsMap(this.mPropertyBag);

			// mocking properties in response for technical parameters
			assert.strictEqual(
				oVariantsMap["vmReference1"].variants[1].instance.getSupportInformation().user,
				"TestUser",
				"then the user is set to what is retrieved from Settings"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
