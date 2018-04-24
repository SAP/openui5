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

	QUnit.test("Empty object", function(assert) {
		this.sComponentName = undefined;
		this.oManifestJson = {};
		this.oManifest = new Manifest(this.oManifestJson);

		this.testGeneric(assert);
	});

	QUnit.test("Component Name in manifest", function(assert) {
		this.sComponentName = "sap.ui.test.foo.bar";
		this.oManifestJson = {
			"sap.app": {
				"id": this.sComponentName
			}
		};
		this.oManifest = new Manifest(this.oManifestJson);

		this.testGeneric(assert);
	});

	QUnit.test("Component Name as config option", function(assert) {
		this.sComponentName = "sap.ui.test.foo.bar";
		this.oManifestJson = {
			"sap.app": {}
		};
		this.oManifest = new Manifest(this.oManifestJson, {
			componentName: this.sComponentName
		});

		this.testGeneric(assert);
	});

	QUnit.test("getEntry", function(assert) {
		this.sComponentName = "sap.ui.test.foo.bar";
		this.oManifestJson = {
			"sap.app": {
				"id": this.sComponentName,
				"title": "Foo"
			},
			"unit.test1": {
				boolean: false,
				string: "buz",
				null: null,
				object: {
					value: true
				}
			},
			"unit.test2": "invalid"
		};
		this.oManifest = new Manifest(this.oManifestJson);

		this.testGeneric(assert);

		// General
		assert.strictEqual(this.oManifest.getEntry(), null, "'getEntry' without a parameter should return undefined.");
		assert.strictEqual(this.oManifest.getEntry(""), null, "'getEntry' with an empty string should return undefined.");

		// Legacy syntax
		assert.deepEqual(this.oManifest.getEntry("sap.app"), this.oManifestJson["sap.app"], "'getEntry' with legacy syntax should return top-level entry.");
		assert.strictEqual(this.oManifest.getEntry("baz.buz"), null, "'getEntry' with legacy syntax should return 'null' for not existing entries.");
		assert.strictEqual(this.oManifest.getEntry("foo"), null, "'getEntry' with legacy syntax should return 'null' for entries without a dot.");
		assert.strictEqual(this.oManifest.getEntry("unit.test2"), null, "'getEntry' with legacy syntax should return 'null' for top-level entries that are not an object.");

		// New syntax
		assert.deepEqual(this.oManifest.getEntry("/sap.app"), this.oManifestJson["sap.app"], "'getEntry' with new syntax should return top-level entry.");
		assert.strictEqual(this.oManifest.getEntry("/sap.app/title"), this.oManifestJson["sap.app"]["title"], "'getEntry' with new syntax should return deep entry.");
		assert.strictEqual(this.oManifest.getEntry("/unit.test1/notExisting"), undefined, "'getEntry' with new syntax should return 'undefined' for not existing entries.");
		assert.strictEqual(this.oManifest.getEntry("/unit.test1/boolean"), false, "'getEntry' with new syntax should return booleans.");
		assert.strictEqual(this.oManifest.getEntry("/unit.test1/boolean/toString"), undefined, "'getEntry' with new syntax should not return properties of a boolean.");
		assert.strictEqual(this.oManifest.getEntry("/unit.test1/string"), "buz", "'getEntry' with new syntax should return strings.");
		assert.strictEqual(this.oManifest.getEntry("/unit.test1/string/length"), undefined, "'getEntry' with new syntax should not return properties of a string.");
		assert.strictEqual(this.oManifest.getEntry("/unit.test1/null"), null, "'getEntry' with new syntax should return null values.");
		assert.strictEqual(this.oManifest.getEntry("/unit.test1/null/foo"), undefined, "'getEntry' with new syntax should not return native properties of null values.");
		assert.deepEqual(this.oManifest.getEntry("/unit.test1/object"), { value: true }, "'getEntry' with new syntax should return objects.");
		assert.strictEqual(this.oManifest.getEntry("/unit.test1/object/toString"), undefined, "'getEntry' with new syntax should not return native methods of object values.");

	});

	QUnit.test("URL resolving", function(assert) {

		this.oManifest = new Manifest({
			"sap.app": {}
		}, {
			componentName: "sap.ui.test.foo.bar",
			url: "manifest/uri/manifest.json"
		});

		var sBaseURI = new URI("./").absoluteTo(new URI(document.baseURI).search(""));
		assert.strictEqual(this.oManifest.resolveUri(new URI("my/uri")).toString(), "testdata/foo/bar/my/uri", "URL should resolve relative to the Component");
		assert.strictEqual(this.oManifest.resolveUri(new URI("my/uri"), "component").toString(), "testdata/foo/bar/my/uri", "URL should resolve relative to the Component");
		assert.strictEqual(this.oManifest.resolveUri(new URI("my/uri"), "manifest").toString(), "manifest/uri/my/uri", "URL should resolve relative to the Manifest");

	});

});