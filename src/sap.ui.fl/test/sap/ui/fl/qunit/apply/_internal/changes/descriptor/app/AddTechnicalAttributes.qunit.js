/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/AddTechnicalAttributes",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	AddTechnicalAttributes,
	AppDescriptorChange,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifest = { "sap.app": { tags: { technicalAttributes: ["T1", "T2"] } } };
			this.oManifestEmpty = {};

			this.oChange1 = new AppDescriptorChange({ content: { technicalAttributes: ["T3", "T4"] } });
			this.oChange2 = new AppDescriptorChange({ content: { technicalAttributes: ["T5"] } });
			this.oChange3 = new AppDescriptorChange({ content: { technicalAttributes: ["T7", "T1", "T3", "T6", "T2"] } });
			this.oChangeEmpty = new AppDescriptorChange({ content: { technicalAttributes: [] } });
			this.oChangeError = new AppDescriptorChange({ content: { otherProperty: "test" } });
			this.oChangeObject = new AppDescriptorChange({ content: { technicalAttributes: {} } });
			this.oChangeInt = new AppDescriptorChange({ content: { technicalAttributes: 1 } });
			this.oChangeBoolean = new AppDescriptorChange({ content: { technicalAttributes: true } });
			this.oChangeUnsupportedArrayTypes = new AppDescriptorChange({ content: { technicalAttributes: ["T1", true, "T2", 10] } });
			this.oChangeUnsupportedRegEx = new AppDescriptorChange({ content: { technicalAttributes: ["Not-Matching-RegEx"] } });
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with supported technicalAttributes regex", function(assert) {
			let oNewManifest = AddTechnicalAttributes.applyChange(this.oManifestEmpty, this.oChangeEmpty);
			assert.deepEqual(oNewManifest["sap.app"].tags.technicalAttributes, [], "technicalAttributes is set correctly");

			oNewManifest = AddTechnicalAttributes.applyChange(this.oManifestEmpty, this.oChange1);
			assert.deepEqual(oNewManifest["sap.app"].tags.technicalAttributes, ["T3", "T4"], "technicalAttributes is set correctly");

			oNewManifest = AddTechnicalAttributes.applyChange(this.oManifest, this.oChange1);
			assert.deepEqual(oNewManifest["sap.app"].tags.technicalAttributes, ["T1", "T2", "T3", "T4"], "technicalAttributes is set correctly");

			oNewManifest = AddTechnicalAttributes.applyChange(oNewManifest, this.oChange2);
			assert.deepEqual(oNewManifest["sap.app"].tags.technicalAttributes, ["T1", "T2", "T3", "T4", "T5"], "technicalAttributes is set correctly");

			oNewManifest = AddTechnicalAttributes.applyChange(oNewManifest, this.oChange3);
			assert.deepEqual(oNewManifest["sap.app"].tags.technicalAttributes, ["T1", "T2", "T3", "T4", "T5", "T7", "T6"], "technicalAttributes is set correctly");
		});

		QUnit.test("when calling '_applyChange' with incorrect type or content and unsupported technicalAttributes regex", function(assert) {
			assert.throws(function() {
				AddTechnicalAttributes.applyChange(this.oManifest, this.oChangeError);
			}, Error("Property 'technicalAttributes' in change content is not provided"),
			"throws error");

			assert.throws(function() {
				AddTechnicalAttributes.applyChange(this.oManifest, this.oChangeObject);
			}, Error("The property 'technicalAttributes' has type 'object'. Only allowed types for property 'technicalAttributes' is 'array'"),
			"throws error");

			assert.throws(function() {
				AddTechnicalAttributes.applyChange(this.oManifest, this.oChangeInt);
			}, Error("The property 'technicalAttributes' has type 'number'. Only allowed types for property 'technicalAttributes' is 'array'"),
			"throws error");

			assert.throws(function() {
				AddTechnicalAttributes.applyChange(this.oManifest, this.oChangeBoolean);
			}, Error("The property 'technicalAttributes' has type 'boolean'. Only allowed types for property 'technicalAttributes' is 'array'"),
			"throws error");

			assert.throws(function() {
				AddTechnicalAttributes.applyChange(this.oManifest, this.oChangeUnsupportedArrayTypes);
			}, Error("The array for the property 'technicalAttributes' does not only consist of strings. Only allowed values for the array is string"),
			"throws error");

			assert.throws(function() {
				AddTechnicalAttributes.applyChange(this.oManifest, this.oChangeUnsupportedRegEx);
			}, Error("The array contains disallowed values. Supported values for 'technicalAttributes' should adhere to the regular expression /^[A-Z0-9_\\-\\/]+$/"),
			"throws error");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
