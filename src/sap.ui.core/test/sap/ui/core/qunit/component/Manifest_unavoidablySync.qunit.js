sap.ui.define([
	'sap/ui/core/Manifest',
	'sap/ui/thirdparty/URI'
], function(Manifest, URI) {

	"use strict";
	/*global QUnit */


	QUnit.module("Manifest", {
		testGeneric: function(assert) {
			// getJson / getRawJson
			assert.deepEqual(this.oManifest.getJson(), this.oManifestJson, "'getJson' should return the correct object.");
			assert.deepEqual(this.oManifest.getRawJson(), this.oManifestJson, "'getRawJson' should return the correct object.");

			// getComponentName
			assert.strictEqual(this.oManifest.getComponentName(), this.sComponentName, "'getComponentName' should return the expected value.");
		},
		afterEach: function() {
			if (this.oManifest) {
				this.oManifest.destroy();
				this.oManifest = undefined;
			}
		}
	});

	QUnit.test("Manifest.load SYNC", function(assert) {
		this.oManifest = Manifest.load({
			componentName: "sap.ui.test.manifestload",
			manifestUrl: "test-resources/sap/ui/core/qunit/component/testdata/manifestload/manifest.json",
			async: false
		});
		assert.strictEqual(this.oManifest.getEntry("sap.ui5").someValue, "someValue456", "Manifest data was loaded SYNC");
		assert.strictEqual(this.oManifest.resolveUri(
			"test-resources/sap/ui/core/qunit/component/testdata/manifestload", "manifest").toString(),
			"test-resources/sap/ui/core/qunit/component/testdata/manifestload/test-resources/sap/ui/core/qunit/component/testdata/manifestload",
			"URL should resolve relative to the Manifest"
		);
	});
});