sap.ui.define([
	"sap/ui/thirdparty/URI",
	"sap/base/util/deepExtend"
], function(URI, deepExtend) {

	"use strict";
	/*global QUnit*/

	/* ==================================================================================================================
	 * The fixture and tests below are a 1:1 copy of a sync predecessor version of the Metadata.qunit.js test module.
	 * They have been kept as 'unavoidably sync' test for two reasons
	 *
	 * 1. the sync component creation functionally differs from the async creation in one point: i18n placeholders in
	 *    the manifest are NOT filled in by the sync component creation.
	 *
	 *    The first two tests below test that difference.
	 *
	 * 2. the v1 test (and the v2 test with manifest last) components use sync APIs
	 *
	 * TODO: the tests for 1. could be simplified a lot by removing all other test aspects.
	 * ================================================================================================================== */

	/*
	 * TEST INITIALIZATION
	 */

	QUnit.dump.maxDepth = 10;

	// helper
	function getCompUrl(sComponentName) {
		return sap.ui.require.toUrl(sComponentName.replace(/\./g, "/"));
	}

	/*
	 * SHARED TEST CODE
	 */

	function getModulePath(sModuleName, sSuffix) {
		return sap.ui.require.toUrl(sModuleName.replace(/\./g, "/")) + (sSuffix || "");
	}

	function moduleSetup(sComponentName, iMetadataVersion, bManifestFirst, bDefineComponentName) {

		// add custom assertions
		QUnit.assert.sameUrl = function assertSameUrl(actual, expected, message) {
			this.pushResult({
				result: new URI(actual).equals(new URI(expected)),
				actual: actual,
				expected: expected,
				message: message
			});
		};
		QUnit.assert.notSameUrl = function assertNotSameUrl(actual, expected, message) {
			this.pushResult({
				result: !new URI(actual).equals(new URI(expected)),
				actual: actual,
				expected: expected,
				message: message
			});
		};

		if (bManifestFirst) {
			this.oComponent = sap.ui.getCore().createComponent({
				name: bDefineComponentName ? "sap.ui.test." + sComponentName : undefined,
				manifestUrl: sap.ui.require.toUrl("sap/ui/test/" + sComponentName + "/manifest.json")
			});
		} else {
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test." + sComponentName
			});
		}

		this.oMetadata = this.oComponent.getMetadata();

		this.iExpectedMetadataVersion = iMetadataVersion;
		this.oExpectedMetadata = {

			"name": "sap.ui.test." + sComponentName + ".Component",
			"version": "1.0.0",
			"includes" : ["style.css", "script.js"],
			"dependencies": {
				"libs": ["sap.ui.layout"],
				"components" : ["sap.ui.test.other"],
				"ui5version" : "1.22.5"
			},
			"config": {
				"any1": {
					"entry": "configuration"
				},
				"any2": {
					"anyobject": {
						"key1": "value1"
					}
				},
				"any3": {
					"anyarray": [1, 2, 3]
				},
				"zero": 0
			},
			"models": {
				"i18n": {
					"type": "sap.ui.model.resource.ResourceModel",
					"uri": "i18n/i18n.properties"
				},
				"sfapi": {
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "./some/odata/service/"
				}
			},
			"rootView": {
				"viewName": "sap.ui.test.view.Main",
				"type": "XML",
				"async": true
			},
			"customizing": {
				"sap.ui.viewReplacements": {
					"sap.ui.test.view.Main": {
						"viewName": "sap.ui.test.view.Main",
						"type": "XML"
					}
				},
				"sap.ui.controllerReplacements": {
					"sap.ui.test.view.Main": "sap.ui.test.view.Main"
				},
				"sap.ui.viewExtensions": {
					"sap.ui.test.view.Main": {
						"extension": {
							"name": "sap.xx.new.Fragment",
							"type": "sap.ui.core.XMLFragment"
						}
					}
				},
				"sap.ui.viewModification": {
					"sap.ui.test.view.Main": {
						"myControlId": {
							"text": iMetadataVersion === 1 ? "{{mytext}}" : "This is my text"
						}
					}
				}
			},
			"routing": {
				"config": {
					"viewType" : "XML",
					"type": "View",
					"path": "NavigationWithoutMasterDetailPattern.view",
					"targetParent": "myViewId",
					"targetControl": "app",
					"targetAggregation": "pages",
					"clearTarget": false
				},
				"routes": [
					{
						"name" : "myRouteName1",
						"pattern" : "FirstView/{from}",
						"view" : "myViewId"
					}
				]
			},
			"custom.entry": {
				"key1": "value1",
				"key2": "value2",
				"key3": {
					"subkey1": "subvalue1",
					"subkey2": "subvalue2"
				},
				"key4": ["value1", "value2"]
			}
		};

		this.oExpectedManifest = {
			"name": "sap.ui.test." + sComponentName + ".Component",
			"sap.app": {
				"id": "sap.ui.test." + sComponentName,
				"applicationVersion": {
					"version": "1.0.0"
				},
				"title": "App Title",
				"description": "App Description"
			},
			"sap.ui5": {
				"resourceRoots": {
					"x.y.z": "anypath",
					"foo.bar": "../../foo/bar",
					"absolute": "http://absolute/uri",
					"server.absolute": "/server/absolute/uri"
				},
				"resources": iMetadataVersion === 1 ? {
					"js": [
						{
							"uri": "script.js"
						}
					],
					"css": [
						{
							"uri": "style.css"
						}
					]
				} : {
					"js": [
						{
							"uri": "script.js"
						},
						{}
					],
					"css": [
						{
							"uri": "style.css",
							"id": "mystyle"
						},
						{}
					]
				},
				"dependencies": {
					"components": {
						"sap.ui.test.other": {
							"optional": true,
							"minVersion": "1.0.1"
						}
					},
					"libs": {
						"sap.ui.layout": {
							"minVersion": "1.22.0"
						}
					},
					"minUI5Version": "1.22.5"
				},
				"models": {
					"i18n": {
						"type": "sap.ui.model.resource.ResourceModel",
						"uri": "i18n/i18n.properties"
					},
					"sfapi": {
						"type": "sap.ui.model.odata.v2.ODataModel",
						"uri": "./some/odata/service/"
					}
				},
				"rootView": {
					"viewName": "sap.ui.test.view.Main",
					"type": "XML",
					"async": true
				},
				"config": {
					"any1": {
						"entry": "configuration"
					},
					"any2": {
						"anyobject": {
							"key1": "value1"
						}
					},
					"any3": {
						"anyarray": [1, 2, 3]
					},
					"zero": 0
				},
				"extends": {
					"extensions": {
						"sap.ui.controllerReplacements": {
							"sap.ui.test.view.Main": "sap.ui.test.view.Main"
						},
						"sap.ui.viewExtensions": {
							"sap.ui.test.view.Main": {
								"extension": {
									"name": "sap.xx.new.Fragment",
									"type": "sap.ui.core.XMLFragment"
								}
							}
						},
						"sap.ui.viewModification": {
							"sap.ui.test.view.Main": {
								"myControlId": {
									"text": iMetadataVersion === 1 ? "{{mytext}}" : "This is my text"
								}
							}
						},
						"sap.ui.viewReplacements": {
							"sap.ui.test.view.Main": {
								"type": "XML",
								"viewName": "sap.ui.test.view.Main"
							}
						}
					}
				},
				"routing": {
					"config": {
						"clearTarget": false,
						"targetAggregation": "pages",
						"targetControl": "app",
						"targetParent": "myViewId",
						"path": "NavigationWithoutMasterDetailPattern.view",
						"type": "View",
						"viewType": "XML"
					},
					"routes": [
						{
							"name": "myRouteName1",
							"pattern": "FirstView/{from}",
							"view": "myViewId"
						}
					]
				}
			},
			"foo": {}, // getEntry is not allowed for keys without a dot
			"foo.bar": "string as entry value is not valid!"
		};
		this.oExpectedRawManifest = deepExtend({}, this.oExpectedManifest);
		this.oExpectedRawManifest["sap.app"]["title"] = "{{title}}";
		this.oExpectedRawManifest["sap.app"]["description"] = "{{description}}";
		this.oExpectedRawManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]
			["sap.ui.test.view.Main"]["myControlId"]["text"] = "{{mytext}}";

		// some manifest.json files are shared with the modern tests
		// we need to adapt the expectations for these manifest.json files
		// We remove the invalid absolute URLs which are tested separately (see "mixed_legacyAPIs")
		if (["v2", "mixed"].includes(sComponentName)) {
			this.oExpectedManifest["sap.ui5"].resourceRoots = {
				"x.y.z": "anypath",
				"foo.bar": "../../foo/bar"
			};
			this.oExpectedRawManifest["sap.ui5"].resourceRoots = deepExtend({}, this.oExpectedManifest["sap.ui5"].resourceRoots);
		}

	}

	function moduleTeardown() {

		this.oExpectedManifest = undefined;
		this.oExpectedRawManifest = undefined;
		this.oExpectedMetadata = undefined;
		this.iExpectedMetadataVersion = undefined;
		this.oMetadata = undefined;
		this.oComponent.destroy();
		this.oComponent = undefined;

		delete QUnit.assert.sameUrl;
		delete QUnit.assert.notSameUrl;
	}

	function defineGenericTests() {

		QUnit.test("Metadata API", function(assert) {

			assert.equal(this.oMetadata.getName(), this.oExpectedMetadata.name, "Name is correct!");
			assert.equal(this.oMetadata.getVersion(), this.oExpectedMetadata.version, "Version is correct!");
			assert.equal(this.oMetadata.getMetadataVersion(), this.iExpectedMetadataVersion, "MetadataVersion is correct!");
			assert.deepEqual(this.oMetadata.getIncludes(), this.oExpectedMetadata.includes, "Includes are correct!");
			assert.deepEqual(this.oMetadata.getDependencies(), this.oExpectedMetadata.dependencies, "Dependencies are correct!");
			assert.deepEqual(this.oMetadata.getLibs(), this.oExpectedMetadata.dependencies.libs, "Libraries are correct!");
			assert.deepEqual(this.oMetadata.getComponents(), this.oExpectedMetadata.dependencies.components, "Components are correct!");
			assert.equal(this.oMetadata.getUI5Version(), this.oExpectedMetadata.dependencies.ui5version, "UI5 version is correct!");
			assert.deepEqual(this.oMetadata.getConfig(), this.oExpectedMetadata.config, "Config is correct!");
			this.oMetadata.getConfig()["any1"] = "modified!"; // config should be immutable!
			assert.deepEqual(this.oMetadata.getConfig("any1"), this.oExpectedMetadata.config.any1, "Config 'any1' is correct!");
			assert.deepEqual(this.oMetadata.getConfig("any2"), this.oExpectedMetadata.config.any2, "Config 'any2' is correct!");
			assert.deepEqual(this.oMetadata.getConfig("any3"), this.oExpectedMetadata.config.any3, "Config 'any3' is correct!");
			assert.strictEqual(this.oMetadata.getConfig("zero"), 0, "Returned a falsy value");
			assert.deepEqual(this.oMetadata.getConfig("something.that.does.not.exist"), {}, "Config to something that does not exist returns an empty object");
			assert.deepEqual(this.oMetadata.getModels(), this.oExpectedMetadata.models, "Models are correct!");
			assert.deepEqual(this.oMetadata.getCustomizing(), this.oExpectedMetadata.customizing, "Customizing is correct!");
			assert.deepEqual(this.oMetadata.getRootView(), this.oExpectedMetadata.rootView, "RootView is correct!");
			assert.deepEqual(this.oMetadata.getRoutingConfig(), this.oExpectedMetadata.routing.config, "RoutingConfig is correct!");
			assert.deepEqual(this.oMetadata.getRoutes(), this.oExpectedMetadata.routing.routes, "Routes are correct!");
			assert.deepEqual(this.oMetadata.getCustomEntry("custom.entry"), this.oExpectedMetadata["custom.entry"], "CustomEntry are correct!");
			assert.equal(typeof this.oMetadata.loadDesignTime, "function", "loadDesignTime is available!");

		});

		QUnit.test("ResourceRoots", function(assert) {
			if (this.iExpectedMetadataVersion === 1) {
				assert.ok(true, "Metadata version 1 does not support 'resourceRoots'. Skipping tests...");
			} else {
				assert.sameUrl(
					sap.ui.require.toUrl("x/y/z"),
					getCompUrl(this.oMetadata.getComponentName()) + "/anypath",
					"ResourceRoot 'x.y.z' registered (" + sap.ui.require.toUrl("x/y/z") + ")");
				assert.sameUrl(
					sap.ui.require.toUrl("foo/bar"),
					getCompUrl(this.oMetadata.getComponentName()) + "/../../foo/bar",
					"ResourceRoot 'foo.bar' registered (" + sap.ui.require.toUrl("foo/bar") + ")");
			}
		});

		QUnit.test("Manifest Validation", function(assert) {

			assert.deepEqual(this.oMetadata.getManifest(), this.oExpectedManifest, "Manifest is correct!");
			assert.deepEqual(this.oMetadata.getRawManifest(), this.oExpectedRawManifest, "Raw Manifest is correct!");
			assert.strictEqual(this.oMetadata.getManifestEntry("foo"), null, "Manifest entry without a dot is not allowed and should return null");
			assert.strictEqual(this.oMetadata.getManifestEntry("baz.buz"), undefined, "Not existing manifest entry should return undefined");

		});

	}


	/*
	 * TEST CODE: Component Metadata v1
	 */

	QUnit.module("Component Metadata v1", {
		beforeEach: function() {
			moduleSetup.call(this, "v1", 1);
			// fix the specials in the metadata for the v1
			[
				this.oExpectedManifest,
				this.oExpectedRawManifest
			].forEach(function(oManifest) {
				oManifest["sap.ui5"]["dependencies"]["components"]["sap.ui.test.other"] = {};
				oManifest["sap.ui5"]["dependencies"]["libs"]["sap.ui.layout"] = {};
				oManifest["sap.ui5"]["rootView"]["async"] = true;
				oManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewReplacements"]["sap.ui.test.view.Main"]["async"] = true;
				delete oManifest["sap.ui5"]["resourceRoots"];
				delete oManifest["sap.app"]["title"];
				delete oManifest["sap.app"]["description"];
				delete oManifest["foo"];
				delete oManifest["foo.bar"];
			});
			this.oExpectedMetadata["rootView"]["async"] = true;
			this.oExpectedMetadata["customizing"]["sap.ui.viewReplacements"]["sap.ui.test.view.Main"]["async"] = true;
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	defineGenericTests();


	/*
	 * TEST CODE: Component Metadata v2
	 */

	QUnit.module("Component Metadata v2", {
		beforeEach: function() {
			moduleSetup.call(this, "v2", 2);
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	defineGenericTests();


	/*
	 * TEST CODE: Component Metadata v2
	 */

	QUnit.module("Component Metadata v2 (manifest first)", {
		beforeEach: function() {
			moduleSetup.call(this, "v2", 2, true);
			// fix the specials in the metadata for the v2 manifest first
			this.oExpectedManifest["sap.app"]["description"] = this.oExpectedRawManifest["sap.app"]["description"];
			this.oExpectedManifest["sap.app"]["title"] = this.oExpectedRawManifest["sap.app"]["title"];
			this.oExpectedManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]["sap.ui.test.view.Main"]["myControlId"]["text"] = this.oExpectedRawManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]["sap.ui.test.view.Main"]["myControlId"]["text"];
			this.oExpectedManifest["sap.ui5"]["rootView"] = this.oExpectedRawManifest["sap.ui5"]["rootView"];
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	defineGenericTests();


	/*
	 * TEST CODE: Component Metadata v2
	 */

	QUnit.module("Component Metadata v2 (manifest first with component name)", {
		beforeEach: function() {
			moduleSetup.call(this, "v2", 2, true, true);
			// fix the specials in the metadata for the v2 manifest first
			this.oExpectedManifest["sap.app"]["description"] = this.oExpectedRawManifest["sap.app"]["description"];
			this.oExpectedManifest["sap.app"]["title"] = this.oExpectedRawManifest["sap.app"]["title"];
			this.oExpectedManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]["sap.ui.test.view.Main"]["myControlId"]["text"] = this.oExpectedRawManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]["sap.ui.test.view.Main"]["myControlId"]["text"];
			this.oExpectedManifest["sap.ui5"]["rootView"] = this.oExpectedRawManifest["sap.ui5"]["rootView"];
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	defineGenericTests();


	/*
	 * TEST CODE: Component Metadata v1 (inline)
	 */

	QUnit.module("Component Metadata v1 (inline)", {
		beforeEach: function() {
			moduleSetup.call(this, "v1inline", 1);
			// fix the specials in the metadata for the v1
			[
				this.oExpectedManifest,
				this.oExpectedRawManifest
			].forEach(function(oManifest) {
				oManifest["sap.ui5"]["dependencies"]["components"]["sap.ui.test.other"] = {};
				oManifest["sap.ui5"]["dependencies"]["libs"]["sap.ui.layout"] = {};
				delete oManifest["sap.ui5"]["resourceRoots"];
				delete oManifest["sap.app"]["title"];
				delete oManifest["sap.app"]["description"];
				delete oManifest["foo"];
				delete oManifest["foo.bar"];
			});
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	defineGenericTests();


	/*
	 * TEST CODE: Component Metadata v1 (valdidate empty metadata)
	 */

	QUnit.module("Component Metadata v1 (empty)", {
		beforeEach: function() {
			moduleSetup.call(this, "v1empty", 1);
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	QUnit.test("Metadata Validation", function(assert) {

		assert.equal(this.oMetadata.getName(), "sap.ui.test.v1empty.Component", "Name is correct!");
		assert.equal(this.oMetadata.getMetadataVersion(), this.iExpectedMetadataVersion, "MetadataVersion is correct!");

	});

	/*
	 * TEST CODE: Component Metadata v1 (valdidate missing metadata)
	 */

	QUnit.module("Component Metadata v1 (missing)", {
		beforeEach: function() {
			moduleSetup.call(this, "v1missing", 1);
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	QUnit.test("Metadata Validation", function(assert) {

		assert.equal(this.oMetadata.getName(), "sap.ui.test.v1missing.Component", "Name is correct!");
		assert.equal(this.oMetadata.getMetadataVersion(), this.iExpectedMetadataVersion, "MetadataVersion is correct!");

	});


	/*
	 * TEST CODE: Component Metadata v1 & v2 (mixed_legacyAPIs)
	 */

	QUnit.module("Component Metadata v1 & v2 (mixed_legacyAPIs)", {
		beforeEach: function() {
			moduleSetup.call(this, "mixed_legacyAPIs", 2);
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	QUnit.test("Metadata API", function(assert) {

		assert.equal(this.oMetadata.getName(), this.oExpectedMetadata.name, "Name is correct!");
		assert.equal(this.oMetadata.getVersion(), this.oExpectedMetadata.version, "Version is correct!");
		assert.equal(this.oMetadata.getMetadataVersion(), this.iExpectedMetadataVersion, "MetadataVersion is correct!");
		assert.deepEqual(this.oMetadata.getIncludes(), this.oExpectedMetadata.includes, "Includes are correct!");
		assert.deepEqual(this.oMetadata.getDependencies(), this.oExpectedMetadata.dependencies, "Dependencies are correct!");
		assert.deepEqual(this.oMetadata.getLibs(), this.oExpectedMetadata.dependencies.libs, "Libraries are correct!");
		assert.deepEqual(this.oMetadata.getComponents(), this.oExpectedMetadata.dependencies.components, "Components are correct!");
		assert.equal(this.oMetadata.getUI5Version(), this.oExpectedMetadata.dependencies.ui5version, "UI5 version is correct!");
		assert.deepEqual(this.oMetadata.getConfig(), this.oExpectedMetadata.config, "Config is correct!");
		assert.deepEqual(this.oMetadata.getConfig("any1"), this.oExpectedMetadata.config.any1, "Config 'any1' is correct!");
		assert.deepEqual(this.oMetadata.getConfig("any2"), this.oExpectedMetadata.config.any2, "Config 'any2' is correct!");
		assert.deepEqual(this.oMetadata.getConfig("any3"), this.oExpectedMetadata.config.any3, "Config 'any3' is correct!");
		assert.strictEqual(this.oMetadata.getConfig("zero"), 0, "Returned a falsy value");
		assert.deepEqual(this.oMetadata.getConfig("something.that.does.not.exist"), {}, "Config to something that does not exist returns an empty object");
		assert.deepEqual(this.oMetadata.getModels(), this.oExpectedMetadata.models, "Models are correct!");
		assert.deepEqual(this.oMetadata.getCustomizing(), this.oExpectedMetadata.customizing, "Customizing is correct!");
		assert.deepEqual(this.oMetadata.getRootView(), this.oExpectedMetadata.rootView, "RootView is correct!");
		assert.deepEqual(this.oMetadata.getRoutingConfig(), this.oExpectedMetadata.routing.config, "RoutingConfig is correct!");
		assert.deepEqual(this.oMetadata.getRoutes(), this.oExpectedMetadata.routing.routes, "Routes are correct!");
		assert.deepEqual(this.oMetadata.getCustomEntry("custom.entry"), this.oExpectedMetadata["custom.entry"], "CustomEntry are correct!");

	});

	QUnit.test("ResourceRoots", function(assert) {
		assert.ok(new URI(getModulePath(this.oMetadata.getComponentName(), "/anypath"))
			.equals(new URI(getModulePath("x.y.z"))), "ResourceRoot 'x.y.z' registered (" + getModulePath("x.y.z") + ")");
		assert.ok(new URI(getModulePath(this.oMetadata.getComponentName(), "/../../foo/bar"))
			.equals(new URI(getModulePath("foo.bar"))), "ResourceRoot 'foo.bar' registered (" + getModulePath("foo.bar") + ")");

		// (server-)absolute resource roots are not allowed and therefore won't be registered!
		assert.ok(!new URI("http://absolute/uri")
			.equals(new URI(getModulePath("absolute"))),
			"ResourceRoot 'absolute' not registered (" + getModulePath("absolute") + ")");
		assert.ok(!new URI("/server/absolute/uri")
			.equals(new URI(getModulePath("server.absolute"))),
			"ResourceRoot 'server.absolute' not registered (" + getModulePath("server.absolute") + ")");
	});

	QUnit.test("Manifest Validation", function(assert) {

		assert.deepEqual(this.oMetadata.getManifest(), this.oExpectedManifest, "Manifest is correct!");
		assert.deepEqual(this.oMetadata.getRawManifest(), this.oExpectedRawManifest, "Raw Manifest is correct!");
		assert.strictEqual(this.oMetadata.getManifestEntry("foo.bar"), null, "Manifest entry with string value is not allowed and should return null");
		assert.strictEqual(this.oMetadata.getManifestEntry("foo"), null, "Manifest entry without a dot is not allowed and should return null");

	});

	/*
	 * TEST CODE: Component Metadata v1 & v2 (mixed/inheritance)
	 */

	QUnit.module("Component Metadata v1 & v2 (mixed/inheritance)", {
		beforeEach: function() {
			moduleSetup.call(this, "inherit", 2);
			// fix the specials in the metadata for the v1 & v2 mixed/inheritance
			this.oExpectedMetadata.config.any9 = this.oExpectedMetadata.config.any3;
			this.oExpectedMetadata.models.i18n_1 = this.oExpectedMetadata.models.i18n;
			this.oExpectedMetadata.models.sfapi_1 = this.oExpectedMetadata.models.sfapi;
			this.oExpectedMetadata["rootView"]["async"] = true;

			[
				this.oExpectedManifest,
				this.oExpectedRawManifest
			].forEach(function(oManifest) {
				oManifest["sap.ui5"]["rootView"]["async"] = true;
				oManifest["sap.ui5"]["extends"].component = "sap.ui.test.inherit.parent";
				delete oManifest["sap.ui5"].resourceRoots["x.y.z"];
				delete oManifest["sap.ui5"].rootView;
				oManifest["sap.ui5"].routing = {
					"routes": [
						{
							"name" : "myRouteName1",
							"pattern" : "FirstView/{from}",
							"view" : "myViewId"
						}
					]
				};

			});

			// The most specific Component in the inheritance chain only should contain a server relative URL,
			// absolute URLs are tested in the following Component variants: "v2", "mixed_legacyAPIs"
			// Additionally the parent components bring absolute URLs with them.
			this.oExpectedManifest["sap.ui5"].resourceRoots = {
				"foo.bar": "../../foo/bar"
			};
			this.oExpectedRawManifest["sap.ui5"].resourceRoots = deepExtend({}, this.oExpectedManifest["sap.ui5"].resourceRoots);
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	QUnit.test("Metadata API", function(assert){

		assert.equal(this.oMetadata.getName(), this.oExpectedMetadata.name, "Name is correct!");
		assert.equal(this.oMetadata.getVersion(), this.oExpectedMetadata.version, "Version is correct!");
		assert.equal(this.oMetadata.getMetadataVersion(), this.iExpectedMetadataVersion, "MetadataVersion is correct!");
		assert.deepEqual(this.oMetadata.getIncludes(), this.oExpectedMetadata.includes, "Includes are correct!");
		assert.deepEqual(this.oMetadata.getDependencies(), this.oExpectedMetadata.dependencies, "Dependencies are correct!");
		assert.deepEqual(this.oMetadata.getLibs(), this.oExpectedMetadata.dependencies.libs, "Libraries are correct!");
		assert.deepEqual(this.oMetadata.getComponents(), this.oExpectedMetadata.dependencies.components, "Components are correct!");
		assert.equal(this.oMetadata.getUI5Version(), this.oExpectedMetadata.dependencies.ui5version, "UI5 version is correct!");
		assert.deepEqual(this.oMetadata.getConfig(), this.oExpectedMetadata.config, "Config is correct!");
		assert.deepEqual(this.oMetadata.getConfig("any1"), this.oExpectedMetadata.config.any1, "Config 'any1' is correct!");
		assert.deepEqual(this.oMetadata.getConfig("any2"), this.oExpectedMetadata.config.any2, "Config 'any2' is correct!");
		assert.deepEqual(this.oMetadata.getConfig("any3"), this.oExpectedMetadata.config.any3, "Config 'any3' is correct!");
		assert.deepEqual(this.oMetadata.getConfig("zero"), this.oExpectedMetadata.config.zero, "Config '0' is correct!");
		assert.deepEqual(this.oMetadata.getConfig("any9"), this.oExpectedMetadata.config.any9, "Config 'any9' is correct!");
		assert.strictEqual(this.oMetadata.getConfig("zero"), 0, "Returned a falsy value");
		assert.deepEqual(this.oMetadata.getConfig("something.that.does.not.exist"), {}, "Config to something that does not exist returns an empty object");
		assert.deepEqual(this.oMetadata.getModels(), this.oExpectedMetadata.models, "Models are correct!");
		assert.deepEqual(this.oMetadata.getCustomizing(), this.oExpectedMetadata.customizing, "Customizing is correct!");
		assert.deepEqual(this.oMetadata.getRootView(), this.oExpectedMetadata.rootView, "RootView is correct!");
		assert.deepEqual(this.oMetadata.getRoutingConfig(), this.oExpectedMetadata.routing.config, "RoutingConfig is correct!");
		assert.deepEqual(this.oMetadata.getRoutes(), this.oExpectedMetadata.routing.routes, "Routes are correct!");
		assert.deepEqual(this.oMetadata.getCustomEntry("custom.entry"), this.oExpectedMetadata["custom.entry"], "CustomEntry are correct!");

	});

	QUnit.test("ResourceRoots", function(assert) {
		assert.ok(new URI(getModulePath(this.oMetadata.getParent().getComponentName(), "/anypath"))
			.equals(new URI(getModulePath("x.y.z"))), "ResourceRoot 'x.y.z' registered (" + getModulePath("x.y.z") + ")");
		assert.ok(new URI(getModulePath(this.oMetadata.getComponentName(), "/../../foo/bar"))
			.equals(new URI(getModulePath("foo.bar"))), "ResourceRoot 'foo.bar' registered (" + getModulePath("foo.bar") + ")");

		// (server-)absolute resource roots are not allowed and therefore won't be registered!
		assert.ok(!new URI("http://absolute/uri")
			.equals(new URI(getModulePath("absolute"))),
			"ResourceRoot 'absolute' not registered (" + getModulePath("absolute") + ")");
		assert.ok(!new URI("/server/absolute/uri")
			.equals(new URI(getModulePath("server.absolute"))),
			"ResourceRoot 'server.absolute' not registered (" + getModulePath("server.absolute") + ")");
	});

	QUnit.test("Manifest Validation", function(assert) {

		assert.deepEqual(this.oMetadata.getManifest(), this.oExpectedManifest, "Manifest is correct!");
		assert.deepEqual(this.oMetadata.getRawManifest(), this.oExpectedRawManifest, "Raw Manifest is correct!");
		assert.strictEqual(this.oMetadata.getManifestEntry("foo.bar"), null, "Manifest entry with string value is not allowed and should return null");
		assert.strictEqual(this.oMetadata.getManifestEntry("foo"), null, "Manifest entry without a dot is not allowed and should return null");

	});

	QUnit.test("Absolute resource roots not allowed", function(assert) {
		const oManifest = {
			"name": "sap.ui.test.absoluteUrl.Component",
			"sap.app": {
				"id": "sap.ui.test.absoluteUrl",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"title": "App Title",
				"description": "App Description"
			},
			"sap.ui5": {
				"resourceRoots": {
					"absolute": "http://absolute/uri",
					"server.absolute": "/server/absolute/uri"
				}
			}
		};

		const myComp = sap.ui.getCore().createComponent({
			name: "sap.ui.test.absoluteUrl",
			manifest: oManifest
		});

		assert.ok(myComp, "Component should be created");

		// (server-)absolute resource roots are not allowed and therefore won't be registered!
		assert.notSameUrl(
			sap.ui.require.toUrl("absolute"),
			"http://absolute/uri",
			"ResourceRoot 'absolute' not registered (" + sap.ui.require.toUrl("absolute") + ")");
		assert.notSameUrl(
			sap.ui.require.toUrl("server/absolute"),
			"/server/absolute/uri",
			"ResourceRoot 'server.absolute' not registered (" + sap.ui.require.toUrl("server/absolute") + ")");
	});
});