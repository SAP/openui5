/* global sinon, QUnit */

sap.ui.define([
	"sap/ui/core/util/LibraryInfo",
	"sap/base/Log",
	"sap/ui/thirdparty/URI"
], function(LibraryInfo, Log, URI) {
	"use strict";

	var ResourcesUtil = {
		getResourceOriginPath: function (sPath) {
			var oConfig, sOrigin,
				oUri = URI(sPath);
			if (oUri && oUri.is("absolute")) {
				return sPath;
			}
			oConfig = window['sap-ui-documentation-config'];
			sOrigin = (oConfig && oConfig.demoKitResourceOrigin) || '.';
			return sOrigin + this._formatPath(sPath);
		},
		_formatPath: function(sPath) {
			sPath = sPath.replace(/^\.\//, '/');

			if (!sPath.match(/^\//)) {
				sPath = "/" + sPath;
			}
			return sPath;
		}
	};

	QUnit.assert.sameURL = function(actual, expected, message) {
		this.equal(
			new URI(actual).normalize().toString(),
			new URI(expected).normalize().toString(),
			message);
	};

	QUnit.test("Constructor / Destroy", function(assert) {
		var oLibraryInfo = new LibraryInfo();
		assert.ok(oLibraryInfo instanceof LibraryInfo, "Instance created");
		oLibraryInfo.destroy();
	});

	QUnit.module("_loadLibraryMetadata", {
		beforeEach: function() {
			this.oLibraryInfo = new LibraryInfo();
		},
		afterEach: function() {
			this.oLibraryInfo.destroy();
		}
	});

	QUnit.test("sap/ui/testlib (by path)", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._loadLibraryMetadata("sap/ui/testlib", function(oTestLib) {
			assert.equal(oTestLib.name, "sap.ui.testlib", "Library name");
			assert.equal(oTestLib.url, "test-resources/sap/ui/core/qunit/testdata/uilib/", "Library URL");
			assert.ok(oTestLib.data instanceof XMLDocument, "Library data");
			done();
		});
	});

	QUnit.test("sap.ui.testlib (by name)", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._loadLibraryMetadata("sap.ui.testlib", function(oTestLib) {
			assert.equal(oTestLib.name, "sap.ui.testlib", "Library name");
			assert.equal(oTestLib.url, "test-resources/sap/ui/core/qunit/testdata/uilib/", "Library URL");
			assert.ok(oTestLib.data instanceof XMLDocument, "Library data");
			done();
		});
	});

	QUnit.test("sap.ui.testlib (cached result)", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._loadLibraryMetadata("sap.ui.testlib", function(oTestLib) {
			assert.equal(oTestLib.name, "sap.ui.testlib", "Library name");
			assert.equal(oTestLib.url, "test-resources/sap/ui/core/qunit/testdata/uilib/", "Library URL");
			assert.ok(oTestLib.data instanceof XMLDocument, "Library data");

			// Load again
			this.oLibraryInfo._loadLibraryMetadata("sap.ui.testlib", function(oTestLibFromCache) {
				assert.equal(oTestLib, oTestLibFromCache, "Cached object is returned");
				done();

			});
		}.bind(this));
	});

	QUnit.test("themelib_customcss", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._loadLibraryMetadata("themelib_customcss", function(oThemeLib) {
			assert.equal(oThemeLib.name, "themelib_customcss", "Theme Library name");
			assert.equal(oThemeLib.url, "test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/customcss/", "Theme Library URL");
			assert.ok(oThemeLib.data instanceof XMLDocument, "Theme Library data");
			done();
		});
	});

	QUnit.test("error", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._loadLibraryMetadata("foo/bar/baz", function(oTestLib) {
			assert.equal(oTestLib.name, "foo.bar.baz", "Library name");
			assert.sameURL(oTestLib.url, "resources/foo/bar/baz/", "Library URL");
			assert.equal(oTestLib.data, null, "No Library data");
			done();
		});
	});


	QUnit.module("_getLibraryInfo", {
		beforeEach: function() {
			this.oLibraryInfo = new LibraryInfo();
		},
		afterEach: function() {
			this.oLibraryInfo.destroy();
		}
	});

	QUnit.test("sap/ui/testlib", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._getLibraryInfo("sap/ui/testlib", function(oResult) {
			assert.equal(oResult.library, "sap.ui.testlib", "Library name");
			assert.equal(oResult.libraryUrl, "test-resources/sap/ui/core/qunit/testdata/uilib/", "Library URL");
			assert.deepEqual(oResult.libs, [], "No Thirdparty Libs");
			assert.equal(oResult.vendor, "SAP SE", "Library vendor");
			assert.equal(oResult.copyright, "Insert Copyright here", "Library copyright");
			assert.equal(oResult.version, "1.2.3", "Library version");
			assert.equal(oResult.documentation, "SAPUI5 Test library", "Library documentation");
			assert.equal(oResult.releasenotes, "changes.json", "Library releasenotes");
			assert.deepEqual(oResult.componentInfo, {
				"defaultComponent": "DE-FAU-LT",
				"specialCases": [
					{
						"component": "SP-EC-IF-IC",
						"modules": [
							"sap.ui.testlib.foo.*",
							"sap.ui.testlib.bar.baz.*"
						]
					}
				]
			}, "Library componentInfo");
			done();
		});
	});

	QUnit.test("themelib_customcss", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._getLibraryInfo("themelib_customcss", function(oResult) {
			assert.equal(oResult.library, "themelib_customcss", "Theme Library name");
			assert.equal(oResult.libraryUrl, "test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/customcss/", "Library URL");
			assert.deepEqual(oResult.libs, [], "No Thirdparty Libs");
			assert.equal(oResult.vendor, "SAP SE", "Theme Library vendor");
			assert.equal(oResult.copyright, "Insert Copyright here", "Theme Library copyright");
			assert.equal(oResult.version, "3.2.1", "Theme Library version");
			assert.equal(oResult.documentation, "SAPUI5 customcss test theme library", "Theme Library documentation");
			assert.equal(oResult.releasenotes, undefined, "No Theme Library releasenotes");
			assert.deepEqual(oResult.componentInfo, {
				"defaultComponent": ""
			}, "No Theme Library componentInfo");
			done();
		});
	});


	QUnit.module("_getThirdPartyInfo", {
		beforeEach: function() {
			this.oLibraryInfo = new LibraryInfo();
		},
		afterEach: function() {
			this.oLibraryInfo.destroy();
		}
	});

	QUnit.test("sap/ui/testlib", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._getThirdPartyInfo("sap/ui/testlib", function(oResult) {
			assert.equal(oResult.library, "sap.ui.testlib", "Library name");
			assert.equal(oResult.libraryUrl, "test-resources/sap/ui/core/qunit/testdata/uilib/", "Library URL");
			assert.deepEqual(oResult.libs, [
				{
					"displayName": "foo, BAR",
					"homepage": "http://exmaple.com",
					"license": {
						"file": "test-resources/sap/ui/core/qunit/testdata/uilib/path/to/LICENSE.txt",
						"type": "FOO License",
						"url": "http://example.com/license"
					}
				}
			], "Thirdparty Libs");
			done();
		});
	});


	QUnit.module("_getDocuIndex", {
		beforeEach: function() {
			this.oLibraryInfo = new LibraryInfo();
		},
		afterEach: function() {
			this.oLibraryInfo.destroy();
		}
	});

	QUnit.test("sap/ui/testlib", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._getDocuIndex("sap/ui/testlib", function(oData) {
			assert.equal(oData.library, "sap.ui.testlib", "Library name");
			assert.equal(oData.libraryUrl, "test-resources/sap/ui/core/qunit/testdata/uilib/", "Library URL");
			assert.deepEqual(oData.explored, {
				"entities": [
					{
						"category": "Button",
						"id": "sap.ui.testlib.TestButton",
						"name": "Test Button",
						"samples": [
							"sap.ui.testlib.sample.TestButton"
						],
						"since": "1.0"
					}
				],
				"entitiesDefaults": {
					"appComponent": "DEF-AU-LT",
					"formFactors": "ML"
				},
				"samples": [
					{
						"description": "Sample with Test Button.",
						"id": "sap.ui.testlib.sample.TestButton",
						"name": "Test Button Sample"
					}
				],
				"samplesRef": {
					"namespace": "sap.ui.testlib.sample",
					"ref": "test-resources/sap/ui/core/qunit/testdata/uilib/demokit/sample"
				}
			}, "Explored Data");
			done();
		});
	});

	QUnit.test("error", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._getDocuIndex("foo/bar/baz", function(oData) {
			assert.equal(oData.library, "foo.bar.baz", "Library name");
			assert.sameURL(oData.libraryUrl, "resources/foo/bar/baz/", "Library URL");
			assert.equal(oData.explored, undefined, "No data");
			done();
		});
	});


	QUnit.module("_getReleaseNotes", {
		beforeEach: function() {
			this.oLibraryInfo = new LibraryInfo();
		},
		afterEach: function() {
			this.oLibraryInfo.destroy();
		}
	});

	QUnit.test("sap/ui/testlib", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._getReleaseNotes("sap/ui/testlib", "1.2.3-SNAPSHOT", function(oData) {
			assert.deepEqual(oData["1.2.3"], {
				"date": "December 9999",
				"notes": [
					{
						"id": "abc123",
						"type": "FEATURE",
						"text": "Super new feature",
						"references": []
					},
					{
						"id": "def456",
						"type": "FIX",
						"text": "Important fix",
						"references": []
					}
				]
			}, "Release notes");
			done();
		});
	});

	QUnit.test("error", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._getReleaseNotes("foo/bar/baz", "4.5.6", function(oData) {
			assert.deepEqual(oData, {}, "No release notes");
			done();
		});
	});


	QUnit.module("_getActualComponent", {
		beforeEach: function() {
			this.oLibraryInfo = new LibraryInfo();
			this.oErrorLogSpy = this.spy(Log, "error");
		},
		afterEach: function() {
			this.oLibraryInfo.destroy();
		}
	});

	QUnit.test("sap/ui/testlib", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._getLibraryInfo("sap/ui/testlib", function(oLibraryInfo) {

			var mLibraryInfos = {
				"sap.ui.testlib": oLibraryInfo.componentInfo
			};

			var sDefaultComponent = this.oLibraryInfo._getActualComponent(mLibraryInfos, "sap.ui.testlib.bar.TestButton");
			assert.equal(sDefaultComponent, "DE-FAU-LT", "Default component");

			var sSpecificComponent = this.oLibraryInfo._getActualComponent(mLibraryInfos, "sap.ui.testlib.foo.TestButton");
			assert.equal(sSpecificComponent, "SP-EC-IF-IC", "Specific component");

			done();

		}.bind(this));
	});

	QUnit.test("error", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._getLibraryInfo("foo/bar/baz", function(oLibraryInfo) {

			var mLibraryInfos = {
				"foo.bar.baz": oLibraryInfo.componentInfo
			};

			var sDefaultComponent = this.oLibraryInfo._getActualComponent(mLibraryInfos, "sap.ui.testlib.bar.TestButton");
			assert.equal(sDefaultComponent, undefined, "Default component");

			sinon.assert.calledWithMatch(this.oErrorLogSpy, "No library information deployed for foo.bar.baz");

			done();

		}.bind(this));
	});


	QUnit.module("_getDefaultComponent", {
		beforeEach: function() {
			this.oLibraryInfo = new LibraryInfo();
		},
		afterEach: function() {
			this.oLibraryInfo.destroy();
		}
	});

	QUnit.test("sap/ui/testlib", function(assert) {
		var done = assert.async();

		this.oLibraryInfo._getLibraryInfo("sap/ui/testlib", function(oLibraryInfo) {

			var sDefaultComponent = this.oLibraryInfo._getDefaultComponent(oLibraryInfo);
			assert.equal(sDefaultComponent, "DE-FAU-LT", "Default component");

			done();

		}.bind(this));
	});

	QUnit.module("Misc", {
		beforeEach: function() {
			this.oLibraryInfo = new LibraryInfo();
		},
		afterEach: function() {
			this.oLibraryInfo.destroy();
		}
	});

	QUnit.test("getInterface", function(assert) {
		assert.equal(this.oLibraryInfo.getInterface(), this.oLibraryInfo, "Should return the instance");
	});

	QUnit.module("Resource URL", {
		beforeEach: function() {
			this.oExternalLibInfo = new LibraryInfo();
		},
		afterEach: function() {
			this.oExternalLibInfo.destroy();
		}
	});

	QUnit.test("Data loaded from external resource URL", function(assert) {
		var fFallback = function() {
			assert.equal(arguments[0].data != null, true, "The resource URL can be hooked from LibraryInfo extension");
			done();
		},
		done = assert.async();
		this.oExternalLibInfo.getResourceUrl = function(sUrl) {
			return ResourcesUtil.getResourceOriginPath(sUrl);
		};

		this.oExternalLibInfo._loadLibraryMetadata("sap.ui.core", fFallback);

	});

});
