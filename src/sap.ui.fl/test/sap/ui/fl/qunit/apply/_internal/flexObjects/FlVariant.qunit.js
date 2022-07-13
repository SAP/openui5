/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/FlVariant",
	"sap/ui/thirdparty/sinon-4"
], function(
	Core,
	ControlVariantUtils,
	FlexObjectFactory,
	FlVariant,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sReference = "my.reference";

	QUnit.module("FlVariant - constructor", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("without variant properties", function(assert) {
			var oVariant = new FlVariant({
				flexObjectMetadata: {
					reference: sReference
				},
				variantReference: "myVariantReference",
				variantManagementReference: "myVariantManagementReference"
			});

			assert.strictEqual(oVariant.getVisible(), true, "the default for visible is correctly set");
			assert.strictEqual(oVariant.getFavorite(), true, "the default for favorite is correctly set");
			assert.strictEqual(oVariant.getExecuteOnSelection(), false, "the default for executeOnSelection is correctly set");
			assert.strictEqual(oVariant.getFlexObjectMetadata().namespace, "apps/" + sReference + "/variants/", "the namespace is correctly set");
			assert.strictEqual(oVariant.getVariantReference(), "myVariantReference", "the variantReference is correctly set");
			assert.strictEqual(oVariant.getVariantManagementReference(), "myVariantManagementReference", "the variantManagementReference is correctly set");
			assert.strictEqual(oVariant.getFileType(), "ctrl_variant", "the fileType is correctly set");
		});

		QUnit.test("with id and variantManagementReference the same", function(assert) {
			var oVariant = new FlVariant({
				id: "myVariantManagementReference",
				flexObjectMetadata: {
					reference: sReference
				},
				variantReference: "myVariantReference",
				variantManagementReference: "myVariantManagementReference"
			});

			assert.strictEqual(oVariant.getStandardVariant(), true, "the standard variant property is correctly set");
			assert.strictEqual(oVariant.getSupportInformation().user, ControlVariantUtils.DEFAULT_AUTHOR, "the default user is set for the standard variant");
		});

		QUnit.test("with the title in the content", function(assert) {
			var oVariant = new FlVariant({
				flexObjectMetadata: {
					reference: sReference
				},
				content: {
					title: "myFancyTitle"
				}
			});

			assert.strictEqual(oVariant.getName(), "myFancyTitle", "the title is correctly set");
		});

		QUnit.test("with the title in the content and in the text section", function(assert) {
			var oVariant = new FlVariant({
				flexObjectMetadata: {
					reference: sReference
				},
				content: {
					title: "myFancyTitle"
				},
				texts: {
					variantName: {
						value: "myTranslatableTitle",
						type: "XFLD"
					}
				}
			});

			assert.strictEqual(oVariant.getName(), "myTranslatableTitle", "the title is correctly set");
		});

		QUnit.test("with the title in the texts section", function(assert) {
			var oVariant = new FlVariant({
				flexObjectMetadata: {
					reference: sReference
				},
				texts: {
					variantName: {
						value: "myTranslatableTitle",
						type: "XFLD"
					}
				}
			});

			assert.strictEqual(oVariant.getName(), "myTranslatableTitle", "the title is correctly set");
		});

		QUnit.test("with an i18n title key", function(assert) {
			sandbox.stub(Core, "getLibraryResourceBundle").returns({
				getText: function(sKey) {
					assert.strictEqual(sKey, "bar", "the correct kay was passed");
					return "foo";
				}
			});
			var oVariant = new FlVariant({
				flexObjectMetadata: {
					reference: sReference
				},
				content: {
					title: "{i18n>bar}"
				}
			});

			assert.strictEqual(oVariant.getName(), "foo", "the title is correctly set");
		});

		QUnit.test("mapping information", function(assert) {
			var oVariant = new FlVariant({
				flexObjectMetadata: {
					reference: sReference
				},
				variantReference: "myVariantReference",
				variantManagementReference: "myVariantManagementReference"
			});
			var oMappingInfo = oVariant.getMappingInfo();
			assert.strictEqual(oMappingInfo.variantReference, "variantReference", "the variantReference is part of the mapping info");
			assert.strictEqual(oMappingInfo.variantManagementReference, "variantManagementReference", "the variantManagementReference is part of the mapping info");
		});
	});

	QUnit.module("FlexObjectFactory - createFlVariant", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with all properties", function(assert) {
			var oVariant = FlexObjectFactory.createFlVariant({
				id: "myId",
				variantName: "myVariantName",
				variantManagementReference: "myVariantManagementReference",
				variantReference: "myVariantReference",
				user: "myUser",
				contexts: {
					foo: "bar"
				},
				layer: "myLayer",
				reference: "myReference",
				generator: "myGenerator"
			});
			assert.strictEqual(oVariant.getSupportInformation().user, "myUser", "the user is properly set");
			assert.strictEqual(oVariant.getSupportInformation().generator, "myGenerator", "the generator is properly set");
			assert.strictEqual(oVariant.getFlexObjectMetadata().reference, "myReference", "the reference is properly set");
			assert.strictEqual(oVariant.getName(), "myVariantName", "the variant name is properly set");
			assert.strictEqual(oVariant.getLayer(), "myLayer", "the layer is properly set");
			assert.strictEqual(oVariant.getId(), "myId", "the Id is properly set");
			assert.strictEqual(oVariant.getVariantReference(), "myVariantReference", "the VariantReference is properly set");
			assert.strictEqual(oVariant.getVariantManagementReference(), "myVariantManagementReference", "the VariantManagementReference is properly set");
			assert.deepEqual(oVariant.getContexts(), {foo: "bar"}, "the contexts are properly set");
		});
	});
});