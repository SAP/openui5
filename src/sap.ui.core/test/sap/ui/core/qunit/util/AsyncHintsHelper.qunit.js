/*global QUnit*/

sap.ui.define([
	'sap/ui/core/util/AsyncHintsHelper'
], function(AsyncHintsHelper) {
	"use strict";

	// Modifier to remove string: '/~000000' to ''
	var fnModifier = function(sUrl) {
		return sUrl.replace(/\/~[0-9]+/g, "");
	};

	QUnit.test("AsyncHintsHelper.modifyUrls should modify multiple URLs", function(assert) {
		var oAsyncHints = {
			components: [
				"test.resourceRoots.parentcomponent1",
				{
					"name": "test.resourceRoots.parentcomponent1",
					"url": "https://openui5.org/~1337/#/"
				}, {
					"name": "test.resourceRoots.parentcomponent1"
				}, {
					"url": "https://openui5.org/~2448/#/"
				}
			]
		};
		var oExpectedAsyncHints = {
			components: [
				"test.resourceRoots.parentcomponent1",
				{
					"name": "test.resourceRoots.parentcomponent1",
					"url": "https://openui5.org/#/"
				}, {
					"name": "test.resourceRoots.parentcomponent1"
				}, {
					"url": "https://openui5.org/#/"
				}
			]
		};

		var oNewAsyncHints = AsyncHintsHelper.modifyUrls(oAsyncHints, fnModifier);

		assert.deepEqual(oNewAsyncHints, oExpectedAsyncHints, "The asyncHints object was manipulated as expected");
	});

	QUnit.test("AsyncHintsHelper.modifyUrls should modify URLs in nested URL objects", function(assert) {
		var oAsyncHints = {
			components: [
				{
					"name": "test.resourceRoots.parentcomponent1",
					"url": {
						"url": "https://openui5.org/~1337/#/"
					}
				}, {
					"url": {
						"url": "https://openui5.org/~2448/#/"
					}
				}
			]
		};
		var oExpectedAsyncHints = {
			components: [
				{
					"name": "test.resourceRoots.parentcomponent1",
					"url": {
						"url": "https://openui5.org/#/"
					}
				}, {
					"url": {
						"url": "https://openui5.org/#/"
					}
				}
			]
		};

		var oNewAsyncHints = AsyncHintsHelper.modifyUrls(oAsyncHints, fnModifier);

		assert.deepEqual(oNewAsyncHints, oExpectedAsyncHints, "The asyncHints object was manipulated as expected");
	});

	QUnit.test("AsyncHintsHelper.modifyUrls should only affect components and libs", function(assert) {
		var oAsyncHints = {
			components: [
				{
					"name": "test.resourceRoots.parentcomponent1",
					"lazy": false,
					"url": {
						"url": "https://openui5.org/~1337/#/",
						"final": true
					}
				}, {
					"url": "https://openui5.org/~2448/#/"
				}
			],
			libs: [
				{
					"name": "test.resourceRoots.parentcomponent1",
					"lazy": false,
					"url": {
						"url": "https://openui5.org/~3559/#/"
					}
				}
			],
			preloadBundles: [
				{
					"name": "test.resourceRoots.parentcomponent1",
					"url": {
						"url": "https://openui5.org/~00000/#/"
					}
				}, {
					"url": "https://openui5.org/~11111/#/"
				}
			]
		};
		var oExpectedAsyncHints = {
			components: [
				{
					"name": "test.resourceRoots.parentcomponent1",
					"lazy": false,
					"url": {
						"url": "https://openui5.org/#/",
						"final": true
					}
				}, {
					"url": "https://openui5.org/#/"
				}
			],
			libs: [
				{
					"name": "test.resourceRoots.parentcomponent1",
					"lazy": false,
					"url": {
						"url": "https://openui5.org/#/"
					}
				}
			],
			preloadBundles: [
				{
					"name": "test.resourceRoots.parentcomponent1",
					"url": {
						"url": "https://openui5.org/~00000/#/"
					}
				}, {
					"url": "https://openui5.org/~11111/#/"
				}
			]
		};

		var oNewAsyncHints = AsyncHintsHelper.modifyUrls(oAsyncHints, fnModifier);

		assert.deepEqual(oNewAsyncHints, oExpectedAsyncHints, "The asyncHints object was manipulated as expected");
	});

	QUnit.test("AsyncHintsHelper.modifyUrls should remove undefined URLs", function(assert) {
		var oAsyncHints = {
			components: [
				{
					"name": "test.resourceRoots.parentcomponent1",
					"url": {
						"url": "https://openui5.org",
						"final": true
					}
				}, {
					"name": "test.resourceRoots.parentcomponent2",
					"url": "https://openui5.org"
				}
			]
		};
		var oExpectedAsyncHints = {
			components: [
				{
					"name": "test.resourceRoots.parentcomponent1"
				}, {
					"name": "test.resourceRoots.parentcomponent2"
				}
			]
		};

		var oNewAsyncHints = AsyncHintsHelper.modifyUrls(oAsyncHints, function() {
			return undefined;
		});

		assert.deepEqual(oNewAsyncHints, oExpectedAsyncHints, "The asyncHints object was manipulated as expected");
	});

});