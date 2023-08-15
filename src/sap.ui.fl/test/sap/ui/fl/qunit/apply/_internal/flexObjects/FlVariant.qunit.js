/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/FlVariant",
	"sap/ui/thirdparty/sinon-4"
], function(
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
			assert.strictEqual(oVariant.getFlexObjectMetadata().namespace, `apps/${sReference}/variants/`, "the namespace is correctly set");
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
			assert.ok(oVariant.hasContexts(), "then the variant has contexts");
		});

		QUnit.test("with no contexts property", function(assert) {
			var oVariant = FlexObjectFactory.createFlVariant({
				id: "myId",
				variantName: "myVariantName",
				variantManagementReference: "myVariantManagementReference",
				variantReference: "myVariantReference",
				user: "myUser",
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
			assert.notOk(oVariant.hasContexts(), "then the variant has no contexts");
		});
	});

	QUnit.module("Updates and export", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when cloning an existing FLVariant", function(assert) {
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
			var oClonedFLVariantContent = oVariant.cloneFileContentWithNewId();
			var oClonedFLVariant = FlexObjectFactory.createFromFileContent(oClonedFLVariantContent);
			assert.strictEqual(oVariant.getSupportInformation().user, oClonedFLVariant.getSupportInformation().user, "the user is properly set");
			assert.strictEqual(oVariant.getSupportInformation().generator, oClonedFLVariant.getSupportInformation().generator, "the generator is properly set");
			assert.strictEqual(oVariant.getFlexObjectMetadata().reference, oClonedFLVariant.getFlexObjectMetadata().reference, "the reference is properly set");
			assert.strictEqual(oVariant.getName(), oClonedFLVariant.getName(), "the variant name is properly set");
			assert.strictEqual(oVariant.getLayer(), oClonedFLVariant.getLayer(), "the layer is properly set");
			assert.notStrictEqual(oVariant.getId(), oClonedFLVariant.getId(), "the Id is properly set");
			assert.strictEqual(oVariant.getVariantReference(), oClonedFLVariant.getVariantReference(), "the parent VariantReference is properly set");
			assert.strictEqual(oVariant.getVariantManagementReference(), oClonedFLVariant.getVariantManagementReference(), "the VariantManagementReference is properly set");
			assert.deepEqual(oVariant.getContexts(), oClonedFLVariant.getContexts(), "the contexts are properly set");
		});
	});
});