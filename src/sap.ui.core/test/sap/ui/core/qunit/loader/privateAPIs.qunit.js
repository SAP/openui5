/*global QUnit */
sap.ui.define(function() {
	"use strict";

	var privateLoaderAPI = sap.ui.loader._;

	// ========================================================================================
	// Non-JS Resources (_getModuleContent)
	// ========================================================================================

	QUnit.module("getModuleContent", {
		beforeEach: function() {
			this.EXPECTED_VIEW_CONTENT = '<mvc:View xmlns:mvc="sap.ui.core.mvc"></mvc:View>';
			sap.ui.require.preload({
				'fixture/resource-preload/Main.view.xml': this.EXPECTED_VIEW_CONTENT,
				'fixture/resource-preload/i18n.properties': ""
			});
		}
	});

	QUnit.test("Simple access to a resource", function(assert) {
		assert.strictEqual(
			privateLoaderAPI.getModuleContent('fixture/resource-preload/Main.view.xml'),
			this.EXPECTED_VIEW_CONTENT,
			"reading a preloaded non-JS resource should return the expected text result");
	});

	QUnit.test("Access via a denormalized name", function(assert) {
		assert.strictEqual(
			privateLoaderAPI.getModuleContent('fixture/resource-preload/dummy/../Main.view.xml'),
			this.EXPECTED_VIEW_CONTENT,
			"reading a preloaded non-JS resource by a denormalized name should return the expected text result");
	});

	QUnit.test("Access via a mapped name", function(assert) {
		sap.ui.loader.config({
			map: {
				'resource-preload-alias': 'fixture/resource-preload',
				'resource-preload-alias-Main.view': 'fixture/resource-preload/Main.view'
				// Note: mapping doesn't handle subtypes like '.view', to be compliant with the AMD spec!
			}
		});
		assert.strictEqual(
			privateLoaderAPI.getModuleContent('resource-preload-alias/Main.view.xml'),
			this.EXPECTED_VIEW_CONTENT,
			"reading a preloaded non-JS resource by a prefixed-mapped module ID should return the expected text result");
		assert.strictEqual(
			privateLoaderAPI.getModuleContent('resource-preload-alias-Main.view.xml'),
			this.EXPECTED_VIEW_CONTENT,
			"reading a preloaded non-JS resource by a name-mapped module ID should return the expected text result");
	});

	QUnit.test("Access empty resource via url", function(assert) {
		assert.strictEqual(
			privateLoaderAPI.getModuleContent(undefined, sap.ui.require.toUrl('fixture/resource-preload/i18n.properties')),
			"",
			"reading a preloaded empty resource via url should return the expected text result");
	});



	// ========================================================================================
	// Non-JS Resources (_getModuleContent)
	// ========================================================================================

	QUnit.module("guessResourceName", {
		before: function() {
			this.sExistingResourceName = 'fixture/guessResourceName/Existing.view.xml';
			this.sNonExistingResourceName = 'fixture/guessResourceName/NonExisting.view.xml';
			sap.ui.require.preload({
				'fixture/guessResourceName/Existing.view.xml': '<mvc:View xmlns:mvc="sap.ui.core.mvc"></mvc:View>'
			});
		}
	});

	QUnit.test("preloaded resource with bLoadedResourcesOnly:true", function(assert) {
		var sResource = this.sExistingResourceName;
		var sUrl = sap.ui.require.toUrl(sResource);

		// act
		var sGuess = privateLoaderAPI.guessResourceName(sUrl, true);

		// assert
		assert.strictEqual(sGuess, sResource, "guess should return the expected name");
	});

	QUnit.test("preloaded resource with bLoadedResourcesOnly:false", function(assert) {
		var sResource = this.sExistingResourceName;
		var sUrl = sap.ui.require.toUrl(sResource);

		// act
		var sGuess = privateLoaderAPI.guessResourceName(sUrl, false);

		// assert
		assert.strictEqual(sGuess, sResource, "guess should return the expected name");
	});

	QUnit.test("preloaded resource with bLoadedResourcesOnly:true", function(assert) {
		var sResource = this.sNonExistingResourceName;
		var sUrl = sap.ui.require.toUrl(sResource);

		// act
		var sGuess = privateLoaderAPI.guessResourceName(sUrl, true);

		// assert
		assert.strictEqual(sGuess, undefined, "guess should return undefined");
	});

	QUnit.test("preloaded resource with bLoadedResourcesOnly:false", function(assert) {
		var sResource = this.sNonExistingResourceName;
		var sUrl = sap.ui.require.toUrl(sResource);

		// act
		var sGuess = privateLoaderAPI.guessResourceName(sUrl, false);

		// assert
		assert.strictEqual(sGuess, sResource, "guess should return the expected name");
	});

	QUnit.test("multiple matching mappings", function(assert) {
		sap.ui.loader.config({
			paths: {
				"fixture/alternative1": "./",
				"fixture/alternative2": "./foo/"
			}
		});
		var sUrl = "./foo/Main.view.xml";

		// act
		var sGuess = privateLoaderAPI.guessResourceName(sUrl, false);

		// assert
		assert.ok(sGuess === "fixture/alternative1/foo/Main.view.xml" || sGuess === "fixture/alternative2/Main.view.xml",
			"guess should return one of the expected names (returned: " + sGuess + ")");
	});

});