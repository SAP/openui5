sap.ui.define([
	"require",
	"sap/base/future",
	"sap/base/Log",
	"sap/base/util/deepClone",
	"sap/ui/VersionInfo",
	"sap/ui/core/Component",
	"sap/ui/core/_UrlResolver",
	"sap/ui/core/Supportability",
	"sap/ui/thirdparty/URI"
], function(require, future, Log, deepClone, VersionInfo, Component, _UrlResolver, Supportability, URI) {
	"use strict";
	/*global QUnit*/

	/*
	 * TEST INITIALIZATION
	 */

	QUnit.dump.maxDepth = 10;

	/*
	 * SHARED TEST CODE
	 */

	function getModulePath(sModuleName, sSuffix) {
		return sap.ui.require.toUrl(sModuleName.replace(/\./g, "/")) + (sSuffix || "");
	}

	function moduleSetup(sComponentName, bManifestFirst, bDefineComponentName) {

		var oConfig;
		if (bManifestFirst) {
			oConfig = {
				name: bDefineComponentName ? "testdata." + sComponentName : undefined,
				manifest: getModulePath("testdata." + sComponentName) + "/manifest.json"
			};
		} else {
			oConfig = {
				name: "testdata." + sComponentName,
				manifest: false
			};
		}

		return Component.create(oConfig).then(function(oComponent) {
			this.oComponent = oComponent;

			this.oMetadata = this.oComponent.getMetadata();

			this.oExpectedMetadata = {

				"name": "testdata." + sComponentName + ".Component",
				"version": "1.0.0",
				"includes" : ["style.css", "script.js"],
				"dependencies": {
					"libs": ["sap.ui.layout"],
					"components" : ["testdata.other"],
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
					"type": "XML",
					"viewName": "testdata.view.Main"
				},
				"customizing": {
					"sap.ui.viewReplacements": {
						"testdata.view.Main": {
							"viewName": "testdata.view.Main",
							"type": "XML"
						}
					},
					"sap.ui.controllerReplacements": {
						"testdata.view.Main": "testdata.view.Main"
					},
					"sap.ui.viewExtensions": {
						"testdata.view.Main": {
							"extension": {
								"name": "sap.xx.new.Fragment",
								"type": "sap.ui.core.XMLFragment"
							}
						}
					},
					"sap.ui.viewModification": {
						"testdata.view.Main": {
							"myControlId": {
								"text": "This is my text"
							}
						}
					}
				},
				"routing": {
					"config": {
						"viewType" : "XML",
						"path": "NavigationWithoutMasterDetailPattern.view",
						"type": "View",
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
				"name": "testdata." + sComponentName + ".Component",
				"sap.app": {
					"id": "testdata." + sComponentName,
					"applicationVersion": {
						"version": "1.0.0"
					},
					"title": "App Title",
					"description": "App Description"
				},
				"sap.ui5": {
					"resourceRoots": {
						"x.y.z": "anypath",
						"foo.bar": "../../foo/bar"
					},
					"resources": {
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
							"testdata.other": {
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
						"type": "XML",
						"viewName": "testdata.view.Main"
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
								"testdata.view.Main": "testdata.view.Main"
							},
							"sap.ui.viewExtensions": {
								"testdata.view.Main": {
									"extension": {
										"name": "sap.xx.new.Fragment",
										"type": "sap.ui.core.XMLFragment"
									}
								}
							},
							"sap.ui.viewModification": {
								"testdata.view.Main": {
									"myControlId": {
										"text": "This is my text"
									}
								}
							},
							"sap.ui.viewReplacements": {
								"testdata.view.Main": {
									"type": "XML",
									"viewName": "testdata.view.Main"
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
			this.oExpectedRawManifest = deepClone(this.oExpectedManifest);
			this.oExpectedRawManifest["sap.app"]["title"] = "{{title}}";
			this.oExpectedRawManifest["sap.app"]["description"] = "{{description}}";
			this.oExpectedRawManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]
				["testdata.view.Main"]["myControlId"]["text"] = "{{mytext}}";

		}.bind(this));

	}

	function moduleTeardown() {

		this.oExpectedManifest = undefined;
		this.oExpectedRawManifest = undefined;
		this.oExpectedMetadata = undefined;
		this.oMetadata = undefined;
		this.oComponent.destroy();
		this.oComponent = undefined;

	}

	function defineGenericTests() {
		QUnit.test("Metadata API", function(assert) {
			assert.equal(this.oMetadata.getName(), this.oExpectedMetadata.name, "Name is correct!");
			assert.equal(this.oMetadata.getMetadataVersion(), 2, "MetadataVersion is correct!");
			assert.equal(typeof this.oMetadata.loadDesignTime, "function", "loadDesignTime is available!");
		});

		QUnit.test("ResourceRoots", function(assert) {
			assert.ok(new URI(getModulePath(this.oMetadata.getComponentName(), "/anypath"))
				.equals(new URI(getModulePath("x.y.z"))),
				"ResourceRoot 'x.y.z' registered (" + getModulePath("x.y.z") + ")");
			assert.ok(new URI(getModulePath(this.oMetadata.getComponentName(), "/../../foo/bar"))
				.equals(new URI(getModulePath("foo.bar"))),
				"ResourceRoot 'foo.bar' registered (" + getModulePath("foo.bar") + ")");

			// (server-)absolute resource roots are not allowed and therefore won't be registered!
		});

		QUnit.test("Manifest Validation (future=true)", function(assert) {
			future.active = true;
			assert.deepEqual(this.oMetadata._getManifest(), this.oExpectedManifest, "Manifest is correct!");
			assert.throws(() => this.oMetadata._getManifestEntry("foo.bar"), null, "Manifest entry with string value is not allowed and should return null");
			assert.throws(() => this.oMetadata._getManifestEntry("foo"), null, "Manifest entry without a dot is not allowed and should return null");
			assert.strictEqual(this.oMetadata._getManifestEntry("baz.buz"), undefined, "Not existing manifest entry should return undefined");
			future.active = undefined;
		});
	}


	/*
	 * TEST CODE: Component Metadata v2
	 */

	QUnit.module("Component Metadata v2 with async rootView (manifest first)", {
		beforeEach: function() {
			return moduleSetup.call(this, "v2asyncRootView", true).then(function() {
				// fix the specials in the metadata for the v2 with async rootView manifest first
				this.oExpectedManifest["sap.ui5"]["rootView"]["async"] = true;
				this.oExpectedRawManifest["sap.ui5"]["rootView"]["async"] = true;
				this.oExpectedMetadata["rootView"]["async"] = true;
			}.bind(this));
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	defineGenericTests();


	/*
	 * TEST CODE: Component Metadata v2
	 */

	QUnit.module("Component Metadata v2 with async rootView (manifest first with component name)", {
		beforeEach: function() {
			return moduleSetup.call(this, "v2asyncRootView", true, true).then(function() {
				// fix the specials in the metadata for the v2 with async rootView manifest first
				this.oExpectedManifest["sap.ui5"]["rootView"]["async"] = true;
				this.oExpectedRawManifest["sap.ui5"]["rootView"]["async"] = true;
				this.oExpectedMetadata["rootView"]["async"] = true;
			}.bind(this));
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
			return new Promise(function (resolve) {
				sap.ui.require([
					"sap/ui/model/resource/ResourceModel",
					"sap/ui/model/odata/v2/ODataModel",
					"sap/ui/core/routing/Router",
					"sap/ui/core/mvc/XMLView"
				], function (ResourceModel, OdataModel, Router, XMLView) {
					moduleSetup.call(this, "v2inline").then(function() {
						// fix the specials in the metadata for the v2 with async rootView manifest first
						this.oExpectedManifest["sap.ui5"]["rootView"]["async"] = true;
						this.oExpectedRawManifest["sap.ui5"]["rootView"]["async"] = true;
						this.oExpectedMetadata["rootView"]["async"] = true;
					}.bind(this)).then(function (oComponent) {
						resolve(oComponent);
					});
				}.bind(this));
			}.bind(this));
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	defineGenericTests();

	/*
	 * TEST CODE: Component Metadata v2 (valdidate empty manifest)
	 */

	QUnit.module("Component Metadata v2 (empty)", {
		beforeEach: function() {
			return moduleSetup.call(this, "v2empty");
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	QUnit.test("Manifest Validation", function(assert) {

		assert.equal(this.oMetadata.getName(), "testdata.v2empty.Component", "Name is correct!");
		assert.equal(this.oMetadata.getMetadataVersion(), 2, "MetadataVersion is correct!");

	});

	/*
	 * TEST CODE: Component Metadata v2 (validate missing manifest)
	 */

	QUnit.module("Component Metadata v2 (missing)", {
		beforeEach: function() {
			return moduleSetup.call(this, "v2missing");
		},
		afterEach: function() {
			moduleTeardown.call(this);
		}
	});

	QUnit.test("Manifest Validation", function(assert) {

		assert.equal(this.oMetadata.getName(), "testdata.v2missing.Component", "Name is correct!");
		assert.equal(this.oMetadata.getMetadataVersion(), 2, "MetadataVersion is correct!");

	});

	/*
	 * TEST CODE: Component Metadata URI resolution
	 */

	QUnit.module("Component Metadata: Resolve URI", {
		beforeEach: function(assert) {
			this.assertResolvedUri = function(sInput, sBase, sExpected) {
				// Note: temporarily change the <base href>
				var oBaseTag = document.querySelector("base"),
					sOldHRef = oBaseTag.href;
				oBaseTag.href = "./";
				var sActual = _UrlResolver._resolveUri(sInput, sBase).toString();
				oBaseTag.href = sOldHRef;
				assert.equal(sActual, sExpected, "Resolved URI is correct!");
			};
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

		this.assertResolvedUri("local/uri",                           "../../../path/to/base/", "../../../path/to/base/local/uri");
		this.assertResolvedUri("./local/uri",                         "../../../path/to/base/", "../../../path/to/base/local/uri");
		this.assertResolvedUri("../relative/1/uri",                   "../../../path/to/base/", "../../../path/to/relative/1/uri");
		this.assertResolvedUri("../../relative/2/uri",                "../../../path/to/base/", "../../../path/relative/2/uri");
		this.assertResolvedUri("../../../relative/3/uri",             "../../../path/to/base/", "../../../relative/3/uri");
		this.assertResolvedUri("../../../../relative/4/uri",          "../../../path/to/base/", "../../../../relative/4/uri");
		this.assertResolvedUri("../../../../../relative/5/uri",       "../../../path/to/base/", "../../../../../relative/5/uri");
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
			return VersionInfo.load().then(function(oVersionInfo) {
				this.oVersionInfo = oVersionInfo;
				this.spy(Log, "warning");
			}.bind(this));
		},
		afterEach: function() {
		}
	});

	QUnit.test("MinVersion gt Version", function(assert){
		this.oVersionInfo.version = "1.20.0";
		var oDone = assert.async(), that = this;
		moduleSetup.call(this, "v2version").then(function() {
			setTimeout(function() {
				var aCalls = Log.warning.getCalls();
				var bFound = false;
				for (var i = 0, l = aCalls.length; i < l; i++) {
					if (aCalls[i].args[0] == "Component \"testdata.v2version\" requires at least version \"1.22.5\" but running on \"1.20.0\"!") {
						bFound = true;
					}
				}
				// in case of debug mode is on the warning should be reported
				// when it is turned off => no warning!
				if (Supportability.isDebugModeEnabled()) {
					assert.ok(bFound, "Warning has been reported!");
				} else {
					assert.ok(!bFound, "Warning has not been reported!");
				}
				moduleTeardown.call(that);
				sap.ui.require("testdata/v2version/Component").getMetadata()._bInitialized = false;
				oDone();
			}, 200);
		});
	});

	QUnit.test("MinVersion eq Version", function(assert){
		this.oVersionInfo.version = "1.22.5";
		var oDone = assert.async(), that = this;
		moduleSetup.call(this, "v2version").then(function() {
			setTimeout(function() {
				var aCalls = Log.warning.getCalls();
				var bFound = false;
				for (var i = 0, l = aCalls.length; i < l; i++) {
					if (aCalls[i].args[0] == "Component \"testdata.v2version\" requires at least version \"1.22.5\" but running on \"1.22.5\"!") {
						bFound = true;
					}
				}
				assert.ok(!bFound, "Warning has not been reported!");
				moduleTeardown.call(that);
				sap.ui.require("testdata/v2version/Component").getMetadata()._bInitialized = false;
				oDone();
			}, 200);
		});
	});

	QUnit.test("MinVersion lt Version", function(assert){
		this.oVersionInfo.version = "1.31.0";
		var oDone = assert.async(), that = this;
		moduleSetup.call(this, "v2version").then(function() {
			setTimeout(function() {
				var aCalls = Log.warning.getCalls();
				var bFound = false;
				for (var i = 0, l = aCalls.length; i < l; i++) {
					if (aCalls[i].args[0] == "Component \"testdata.v2version\" requires at least version \"1.22.5\" but running on \"1.31.0\"!") {
						bFound = true;
					}
				}
				assert.ok(!bFound, "Warning has not been reported!");
				moduleTeardown.call(that);
				sap.ui.require("testdata/v2version/Component").getMetadata()._bInitialized = false;
				oDone();
			}, 200);
		});
	});

	// Test async loading of manifest files for component metadata
	function runManifestLoadingTests(sDescription, fnComponentFactory) {
		QUnit.module("Component Metadata async loading of manifests: " + sDescription, {
			before: function() {
				return new Promise(function(resolve, reject) {
					sap.ui.require([
						"sap/ui/core/mvc/XMLView"
					], function(XMLView) {
						resolve();
					}, reject);
				});
			}
		});

		QUnit.test("Async loading of manifests", function(assert) {
			return fnComponentFactory("./testdata/inheritAsync/manifest.json", "testdata.inheritAsync").then(function(oComponent) {
				assert.ok(oComponent instanceof Component, "Component has been created.");

				assert.equal(
					oComponent.getManifest().name,
					"testdata.inheritAsync.Component",
					"Check name of the the main component"
				);
				assert.equal(
					oComponent.getMetadata().getParent().getName(),
					"testdata.inheritAsync.parentB.Component",
					"Check name of the inherited parent component B"
				);
				assert.equal(
					oComponent.getMetadata().getParent().getParent().getName(),
					"testdata.inheritAsync.parentA.Component",
					"Check name of the inherited parent component A"
				);
				destroyComponent(oComponent);
			});
		});

		QUnit.test("Async loading of manifests with missing manifest of parent metadata", function(assert) {
			return fnComponentFactory("./testdata/inheritAsyncError/manifest.json", "testdata.inheritAsyncError").then(function(oComponent) {
				assert.ok(oComponent instanceof Component, "Component has been created.");

				var aLogEntries = Log.getLogEntries();
				var result = aLogEntries.filter(function(oEntry){
					return oEntry.message.indexOf(
						"Failed to load component manifest from \"test-resources/sap/ui/core/qunit/component/testdata/inheritAsyncError/parentFAIL/manifest.json\""
					) === 0;
				});
				assert.equal(result.length, 1, "Error: 'Failed to laod component manifest from...' was logged.");

				assert.equal(
					oComponent.getManifest().name,
					"testdata.inheritAsyncError.Component",
					"Check name of the the main component"
				);
				assert.equal(
					oComponent.getMetadata().getParent().getName(),
					"testdata.inheritAsyncError.parentB.Component",
					"Check name of the inherited parent component B"
				);
				assert.equal(
					oComponent.getMetadata().getParent().getParent().getName(),
					"testdata.inheritAsyncError.parentFAIL.Component",
					"Check name of the inherited parent component A"
				);
				destroyComponent(oComponent);
			});
		});
	}


	runManifestLoadingTests("manifest first", function(path, name) {
		return Component.create({
			name: name
		});
	});

	runManifestLoadingTests("manifest URL", function(path) {
		return Component.create({
			manifest: require.toUrl(path)
		});
	});



	QUnit.module("Component Metadata async loading of manifests: manifest object");

	QUnit.test("Async loading of manifests", function(assert) {
		var oManifest = {
			"name": "testdata.inheritAsync.Component",

			"sap.app": {
				"id": "testdata.inheritAsync",
				"applicationVersion": {
					"version": "1.0.0"
				}
			},

			"sap.ui5": {
				"config": {
					"any": {
						"entry1": "test32352"
					}
				},

				"extends": {
					"component": "testdata.inheritAsync.parentB"
				}
			}
		};

		return Component.create({
			manifest: oManifest
		}).then(function(oComponent) {
			assert.ok(oComponent instanceof Component, "Component has been created.");

			assert.equal(
				oComponent.getManifest().name,
				"testdata.inheritAsync.Component",
				"Check name of the the main component"
			);
			assert.equal(
				oComponent.getManifestEntry("/sap.ui5/config/any/entry1"),
				"test32352",
				"Instance specific manifest entry should be available through component instance"
			);
			// the component's original manifest should also be loaded even if a manifest object is given
			var InheritAsyncComponent = sap.ui.require("testdata/inheritAsync/Component");
			var oInheritAsyncComponent = new InheritAsyncComponent();
			assert.equal(
				oInheritAsyncComponent.getManifestEntry("/sap.ui5/config/any/entry1"),
				"test",
				"Instance specific manifest should not be reused for static manifest"
			);
			assert.equal(
				oComponent.getMetadata().getParent().getName(),
				"testdata.inheritAsync.parentB.Component",
				"Check name of the inherited parent component B"
			);
			assert.equal(
				oComponent.getMetadata().getParent().getParent().getName(),
				"testdata.inheritAsync.parentA.Component",
				"Check name of the inherited parent component A"
			);
			destroyComponent(oComponent);
		});
	});

	function destroyComponent(oComponent){
		oComponent.destroy();
	}

	sap.ui.define("my/failing/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.failing.Component", {
			metadata: {}
		});
	});

	QUnit.test("Absolute resource roots should fail (future=true)", async (assert) => {
		future.active = true;
		assert.expect(1);
		await Component.create({
			name: "my.failing",
			manifest: {
				"sap.ui5": {
					resourceRoots: {
						absolute: "http://absolute/uri"
					}
				}
			}
		}).catch((err) => {
			assert.ok(err.message.includes('Resource root for "absolute" is absolute and therefore won\'t be registered! "http://absolute/uri"'), "Component creation rejects with wrong resource roots");
			future.active = undefined;
		});
	});

	QUnit.test("Absolute resource roots should fail (future=true)", async (assert) => {
		future.active = true;
		assert.expect(1);
		await Component.create({
			name: "my.failing",
			manifest: {
				"sap.ui5": {
					resourceRoots: {
						"server.absolute": "/server/absolute/uri"
					}
				}
			}
		}).catch((err) => {
			assert.ok(err.message.includes('Resource root for "server.absolute" is absolute and therefore won\'t be registered! "/server/absolute/uri"'), "Component creation rejects with wrong resource roots");
			future.active = undefined;
		});
	});
});