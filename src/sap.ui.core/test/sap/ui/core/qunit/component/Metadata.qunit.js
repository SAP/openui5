sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Manifest',
	'sap/ui/thirdparty/URI'
], function(jQuery, Manifest, URI) {

	"use strict";
	/*global sinon, QUnit*/

	/*
	 * TEST INITIALIZATION
	 */

	/*
	 * SHARED TEST CODE
	 */

	function moduleSetup(sComponentName, iMetadataVersion, bManifestFirst, bDefineComponentName) {

		if (bManifestFirst) {
			this.oComponent = sap.ui.getCore().createComponent({
				name: bDefineComponentName ? "sap.ui.test." + sComponentName : undefined,
				manifestUrl: jQuery.sap.getModulePath("sap.ui.test." + sComponentName) + "/manifest.json"
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
				"libs": ["sap.ui.commons"],
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
					"type": "sap.ui.model.odata.ODataModel",
					"uri": "./some/odata/service"
				}
			},
			"rootView": {
				"type": "XML",
				"viewName": "sap.ui.test.view.Main"
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
					"viewPath": "NavigationWithoutMasterDetailPattern.view",
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
						"sap.ui.commons": {
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
						"type": "sap.ui.model.odata.ODataModel",
						"uri": "./some/odata/service"
					}
				},
				"rootView": {
					"type": "XML",
					"viewName": "sap.ui.test.view.Main"
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
						"viewPath": "NavigationWithoutMasterDetailPattern.view",
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
		this.oExpectedRawManifest = jQuery.extend(true, {}, this.oExpectedManifest);
		this.oExpectedRawManifest["sap.app"]["title"] = "{{title}}";
		this.oExpectedRawManifest["sap.app"]["description"] = "{{description}}";
		this.oExpectedRawManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]
			["sap.ui.test.view.Main"]["myControlId"]["text"] = "{{mytext}}";

	}

	function moduleTeardown() {

		this.oExpectedManifest = undefined;
		this.oExpectedRawManifest = undefined;
		this.oExpectedMetadata = undefined;
		this.iExpectedMetadataVersion = undefined;
		this.oMetadata = undefined;
		this.oComponent.destroy();
		this.oComponent = undefined;

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
				assert.ok(new URI(jQuery.sap.getModulePath(this.oMetadata.getComponentName(), "/anypath"))
					.equals(new URI(jQuery.sap.getModulePath("x.y.z"))),
					"ResourceRoot 'x.y.z' registered (" + jQuery.sap.getModulePath("x.y.z") + ")");
				assert.ok(new URI(jQuery.sap.getModulePath(this.oMetadata.getComponentName(), "/../../foo/bar"))
					.equals(new URI(jQuery.sap.getModulePath("foo.bar"))),
					"ResourceRoot 'foo.bar' registered (" + jQuery.sap.getModulePath("foo.bar") + ")");

				// (server-)absolute resource roots are not allowed and therefore won't be registered!
				assert.ok(!new URI("http://absolute/uri")
					.equals(new URI(jQuery.sap.getModulePath("absolute"))),
					"ResourceRoot 'absolute' not registered (" + jQuery.sap.getModulePath("absolute") + ")");
				assert.ok(!new URI("/server/absolute/uri")
					.equals(new URI(jQuery.sap.getModulePath("server.absolute"))),
					"ResourceRoot 'server.absolute' not registered (" + jQuery.sap.getModulePath("server.absolute") + ")");
			}
		});

		QUnit.test("Manifest Validation", function(assert) {

			assert.deepEqual(this.oMetadata.getManifest(), this.oExpectedManifest, "Manifest is correct!");
			assert.deepEqual(this.oMetadata.getRawManifest(), this.oExpectedRawManifest, "Raw Manifest is correct!");
			assert.strictEqual(this.oMetadata.getManifestEntry("foo.bar"), null, "Manifest entry with string value is not allowed and should return null");
			assert.strictEqual(this.oMetadata.getManifestEntry("foo"), null, "Manifest entry without a dot is not allowed and should return null");
			assert.strictEqual(this.oMetadata.getManifestEntry("baz.buz"), null, "Not existing manifest entry should return null");

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
					oManifest["sap.ui5"]["dependencies"]["libs"]["sap.ui.commons"] = {};
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
			this.oExpectedManifest["sap.ui5"]["rootView"] = this.oExpectedRawManifest["sap.ui5"]["rootView"]["viewName"];
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
			this.oExpectedManifest["sap.ui5"]["rootView"] = this.oExpectedRawManifest["sap.ui5"]["rootView"]["viewName"];
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
				oManifest["sap.ui5"]["dependencies"]["libs"]["sap.ui.commons"] = {};
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
	 * TEST CODE: Component Metadata v2 (inline)
	 */

	QUnit.module("Component Metadata v2 (inline)", {
		beforeEach: function() {
			moduleSetup.call(this, "v2inline", 2);
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
	 * TEST CODE: Component Metadata v2 (valdidate empty manifest)
	 */

	QUnit.module("Component Metadata v2 (empty)", {
		beforeEach: function() {
			moduleSetup.call(this, "v2empty", 2);
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	QUnit.test("Manifest Validation", function(assert) {

		assert.equal(this.oMetadata.getName(), "sap.ui.test.v2empty.Component", "Name is correct!");
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
	 * TEST CODE: Component Metadata v2 (validate missing manifest)
	 */

	QUnit.module("Component Metadata v2 (missing)", {
		beforeEach: function() {
			moduleSetup.call(this, "v2missing", 2);
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	QUnit.test("Manifest Validation", function(assert) {

		assert.equal(this.oMetadata.getName(), "sap.ui.test.v2missing.Component", "Name is correct!");
		assert.equal(this.oMetadata.getMetadataVersion(), this.iExpectedMetadataVersion, "MetadataVersion is correct!");

	});


	/*
	 * TEST CODE: Component Metadata v1 & v2 (mixed)
	 */

	QUnit.module("Component Metadata v1 & v2 (mixed)", {
		beforeEach: function() {
			moduleSetup.call(this, "mixed", 2);
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
		assert.ok(new URI(jQuery.sap.getModulePath(this.oMetadata.getComponentName(), "/anypath"))
			.equals(new URI(jQuery.sap.getModulePath("x.y.z"))), "ResourceRoot 'x.y.z' registered (" + jQuery.sap.getModulePath("x.y.z") + ")");
		assert.ok(new URI(jQuery.sap.getModulePath(this.oMetadata.getComponentName(), "/../../foo/bar"))
			.equals(new URI(jQuery.sap.getModulePath("foo.bar"))), "ResourceRoot 'foo.bar' registered (" + jQuery.sap.getModulePath("foo.bar") + ")");

		// (server-)absolute resource roots are not allowed and therefore won't be registered!
		assert.ok(!new URI("http://absolute/uri")
			.equals(new URI(jQuery.sap.getModulePath("absolute"))),
			"ResourceRoot 'absolute' not registered (" + jQuery.sap.getModulePath("absolute") + ")");
		assert.ok(!new URI("/server/absolute/uri")
			.equals(new URI(jQuery.sap.getModulePath("server.absolute"))),
			"ResourceRoot 'server.absolute' not registered (" + jQuery.sap.getModulePath("server.absolute") + ")");
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

			[
				this.oExpectedManifest,
				this.oExpectedRawManifest
			].forEach(function(oManifest) {
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
		assert.ok(new URI(jQuery.sap.getModulePath(this.oMetadata.getParent().getComponentName(), "/anypath"))
			.equals(new URI(jQuery.sap.getModulePath("x.y.z"))), "ResourceRoot 'x.y.z' registered (" + jQuery.sap.getModulePath("x.y.z") + ")");
		assert.ok(new URI(jQuery.sap.getModulePath(this.oMetadata.getComponentName(), "/../../foo/bar"))
			.equals(new URI(jQuery.sap.getModulePath("foo.bar"))), "ResourceRoot 'foo.bar' registered (" + jQuery.sap.getModulePath("foo.bar") + ")");

		// (server-)absolute resource roots are not allowed and therefore won't be registered!
		assert.ok(!new URI("http://absolute/uri")
			.equals(new URI(jQuery.sap.getModulePath("absolute"))),
			"ResourceRoot 'absolute' not registered (" + jQuery.sap.getModulePath("absolute") + ")");
		assert.ok(!new URI("/server/absolute/uri")
			.equals(new URI(jQuery.sap.getModulePath("server.absolute"))),
			"ResourceRoot 'server.absolute' not registered (" + jQuery.sap.getModulePath("server.absolute") + ")");
	});

	QUnit.test("Manifest Validation", function(assert) {

		assert.deepEqual(this.oMetadata.getManifest(), this.oExpectedManifest, "Manifest is correct!");
		assert.deepEqual(this.oMetadata.getRawManifest(), this.oExpectedRawManifest, "Raw Manifest is correct!");
		assert.strictEqual(this.oMetadata.getManifestEntry("foo.bar"), null, "Manifest entry with string value is not allowed and should return null");
		assert.strictEqual(this.oMetadata.getManifestEntry("foo"), null, "Manifest entry without a dot is not allowed and should return null");

	});

	/*
	 * TEST CODE: Component Metadata URI resolution
	 */

	QUnit.module("Component Metadata: Resolve URI", {
		beforeEach: function(assert) {
			this.assert = assert;
		},
		assertResolvedUri: function(sInput, sBase, sExpected) {
			var sActual = Manifest._resolveUriRelativeTo(new URI(sInput), new URI(sBase)).toString();
			this.assert.equal(sActual, sExpected, "Resolved URI is correct!");
		}
	});

	QUnit.test("relative", function(assert){
		this.assertResolvedUri("local/uri",                           "path/to/base/",          "path/to/base/local/uri");
		this.assertResolvedUri("./local/uri",                         "path/to/base/",          "path/to/base/local/uri");
		this.assertResolvedUri("../relative/1/uri",                   "path/to/base/",          "path/to/relative/1/uri");
		this.assertResolvedUri("../../relative/2/uri",                "path/to/base/",          "path/relative/2/uri");
		this.assertResolvedUri("../../../relative/3/uri",             "path/to/base/",          "relative/3/uri");
		this.assertResolvedUri("../../../../relative/4/uri",          "path/to/base/",          "../relative/4/uri");
		this.assertResolvedUri("../../../../../relative/5/uri",       "path/to/base/",          "../../relative/5/uri");
		this.assertResolvedUri("../../../../../../relative/6/uri",    "path/to/base/",          "../../../relative/6/uri");

		this.assertResolvedUri("local/uri",                           "../../../path/to/base/", "../../../path/to/base/local/uri");
		this.assertResolvedUri("./local/uri",                         "../../../path/to/base/", "../../../path/to/base/local/uri");
		this.assertResolvedUri("../relative/1/uri",                   "../../../path/to/base/", "../../../path/to/relative/1/uri");
		this.assertResolvedUri("../../relative/2/uri",                "../../../path/to/base/", "../../../path/relative/2/uri");
		this.assertResolvedUri("../../../relative/3/uri",             "../../../path/to/base/", "../../../relative/3/uri");
		this.assertResolvedUri("../../../../relative/4/uri",          "../../../path/to/base/", "../../../../relative/4/uri");
		this.assertResolvedUri("../../../../../relative/5/uri",       "../../../path/to/base/", "../../../../../relative/5/uri");
		this.assertResolvedUri("../../../../../../relative/6/uri",    "../../../path/to/base/", "../../../../../../relative/6/uri");
	});

	QUnit.test("absolute", function(assert){
		this.assertResolvedUri("http://absolute:1234/uri", "path/to/base/",          "http://absolute:1234/uri");
		this.assertResolvedUri("//absolute:1234/uri",      "path/to/base/",          "//absolute:1234/uri");
		this.assertResolvedUri("/server-absolute/uri",     "path/to/base/",          "/server-absolute/uri");
		this.assertResolvedUri("http://absolute:1234/uri", "../../../path/to/base/", "http://absolute:1234/uri");
		this.assertResolvedUri("//absolute:1234/uri",      "../../../path/to/base/", "//absolute:1234/uri");
		this.assertResolvedUri("/server-absolute/uri",     "../../../path/to/base/", "/server-absolute/uri");
	});

	/*
	 * TEST CODE: Version Check
	 */

	QUnit.module("Component Metadata: Version Check", {
		beforeEach: function() {
			this.fnGetVersionInfo = sap.ui.getVersionInfo;
			try {
				this.oVersionInfo = this.fnGetVersionInfo();
			} catch (e) {
				// if no version info is there we fake it
				this.oVersionInfo = {
					version: sap.ui.version
				};
			}
			sap.ui.getVersionInfo = function(mConfig) {
				if (mConfig && mConfig.async) {
					return new Promise(function(fnResolve, fnReject) {
						fnResolve(this.oVersionInfo);
					}.bind(this));
				}
				return this.oVersionInfo;
			}.bind(this);
			sinon.spy(jQuery.sap.log, "warning");
		},
		afterEach: function() {
			jQuery.sap.log.warning.restore();
			sap.ui.getVersionInfo = this.fnGetVersionInfo;
		}
	});

	QUnit.test("MinVersion gt Version", function(assert){
		this.oVersionInfo.version = "1.20.0";
		moduleSetup.call(this, "v2version", 2);
		var oDone = assert.async(), that = this;
		setTimeout(function() {
			var aCalls = jQuery.sap.log.warning.getCalls();
			var bFound = false;
			for (var i = 0, l = aCalls.length; i < l; i++) {
				if (aCalls[i].args[0] == "Component \"sap.ui.test.v2version\" requires at least version \"1.22.5\" but running on \"1.20.0\"!") {
					bFound = true;
				}
			}
			// in case of debug mode is on the warning should be reported
			// when it is turned off => no warning!
			if (sap.ui.getCore().getConfiguration().getDebug()) {
				assert.ok(bFound, "Warning has been reported!");
			} else {
				assert.ok(!bFound, "Warning has not been reported!");
			}
			moduleTeardown.call(that);
			sap.ui.test.v2version.Component.getMetadata()._bInitialized = false;
			oDone();
		}, 200);
	});

	QUnit.test("MinVersion eq Version", function(assert){
		this.oVersionInfo.version = "1.22.5";
		moduleSetup.call(this, "v2version", 2);
		var oDone = assert.async(), that = this;
		setTimeout(function() {
			var aCalls = jQuery.sap.log.warning.getCalls();
			var bFound = false;
			for (var i = 0, l = aCalls.length; i < l; i++) {
				if (aCalls[i].args[0] == "Component \"sap.ui.test.v2version\" requires at least version \"1.22.5\" but running on \"1.22.5\"!") {
					bFound = true;
				}
			}
			assert.ok(!bFound, "Warning has not been reported!");
			moduleTeardown.call(that);
			sap.ui.test.v2version.Component.getMetadata()._bInitialized = false;
			oDone();
		}, 200);
	});

	QUnit.test("MinVersion lt Version", function(assert){
		this.oVersionInfo.version = "1.31.0";
		moduleSetup.call(this, "v2version", 2);
		var oDone = assert.async(), that = this;
		setTimeout(function() {
			var aCalls = jQuery.sap.log.warning.getCalls();
			var bFound = false;
			for (var i = 0, l = aCalls.length; i < l; i++) {
				if (aCalls[i].args[0] == "Component \"sap.ui.test.v2version\" requires at least version \"1.22.5\" but running on \"1.31.0\"!") {
					bFound = true;
				}
			}
			assert.ok(!bFound, "Warning has not been reported!");
			moduleTeardown.call(that);
			sap.ui.test.v2version.Component.getMetadata()._bInitialized = false;
			oDone();
		}, 200);
	});

});