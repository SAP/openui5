/* global QUnit */
sap.ui.define([
	"sap/ui/VersionInfo",
	"sap/base/util/LoaderExtensions"
], function(VersionInfo, LoaderExtensions) {
	"use strict";

	QUnit.config.reorder = false;

	function deepSort(obj) {
		if ( Array.isArray(obj) ) {
			obj.sort().forEach(deepSort);
		} else if ( typeof obj === "object" && obj != null ) {
			Object.values(obj).forEach(deepSort);
		}
		return obj;
	}

	QUnit.module("VersionInfo", {
		before: function() {
			QUnit.assert.deepSortedEqual = function(a, b, msg) {
				return this.deepEqual(deepSort(a), deepSort(b), msg);
			};
		},
		beforeEach: function() {
			// Define mocked version info
			this.oVersionInfo = {
				"name": "qunit",
				"version": "1.0.0",
				"buildTimestamp": "<TIMESTAMP>",
				"scmRevision": "<HASH>",
				"gav": "<GAV>",
				"libraries": [
					{
						"name": "sap.ui.core",
						"version": "1.0.0",
						"buildTimestamp": "<CORE.TIMESTAMP>",
						"scmRevision": "<CORE.HASH>",
						"gav": "<CORE.GAV>"
					},
					{
						"name": "sap.ui.layout",
						"version": "1.0.0",
						"buildTimestamp": "<LAYOUT.TIMESTAMP>",
						"scmRevision": "<LAYOUT.HASH>",
						"gav": "<LAYOUT.GAV>",
						"manifestHints": {
							"dependencies": {
								"libs": {
									"sap.ui.core": {}
								}
							}
						}
					},
					{
						"name": "sap.ui.unified",
						"version": "1.0.0",
						"buildTimestamp": "<UNIFIED.TIMESTAMP>",
						"scmRevision": "<UNIFIED.HASH>",
						"gav": "<UNIFIED.GAV>",
						"manifestHints": {
							"dependencies": {
								"libs": {
									"sap.ui.core": {},
									"sap.ui.layout": {}
								}
							}
						}
					},
					{
						"name": "sap.m",
						"version": "1.0.0",
						"buildTimestamp": "<M.TIMESTAMP>",
						"scmRevision": "<M.HASH>",
						"gav": "<M.GAV>",
						"manifestHints": {
							"dependencies": {
								"libs": {
									"sap.ui.core": {},
									"sap.ui.layout": {},
									"sap.ui.unified": {
										"lazy": true
									}
								}
							}
						}
					},
					{
						"name": "sap.ui.documentation",
						"version": "1.0.0",
						"buildTimestamp": "<DOCUMENTATION.TIMESTAMP>",
						"scmRevision": "<DOCUMENTATION.HASH>",
						"gav": "<DOCUMENTATION.GAV>",
						"manifestHints": {
							"dependencies": {
								"libs": {
									"sap.m": {},
									"sap.ui.core": {},
									"sap.ui.layout": {},
									"sap.ui.unified": {
										"lazy": true
									}
								}
							}
						}
					}
				],
				"components": {
					"sap.ui.documentation.sdk": {
						"library": "sap.ui.documentation",
						"manifestHints": {
							"dependencies": {
								"libs": {
									"sap.m": {},
									"sap.ui.core": {},
									"sap.ui.layout": {}
								}
							}
						}
					},
					"sap.ui.documentation.sdk.cookieSettingsDialog": {
						"hasOwnPreload": true,
						"library": "sap.ui.documentation",
						"manifestHints": {
							"dependencies": {
								"libs": {
									"sap.m": {},
									"sap.ui.core": {},
									"sap.ui.layout": {},
									"sap.ui.unified": {}
								}
							}
						}
					}
				}
			};
		}
	});

	QUnit.test("VersionInfo.load - file not found", function(assert) {
		this.stub(LoaderExtensions, "loadResource").withArgs("sap-ui-version.json", {
			async: true,
			failOnError: true
		}).rejects().callThrough();
		// this.initFakeServer(404); // Make sure the request fails as 404 - Not found

		return VersionInfo.load().then(function() {
			assert.ok(false, "Promise should not get resolved.");
		}, function(err) {
			assert.strictEqual(sap.ui.versioninfo, undefined,
				"'sap.ui.versioninfo' should still be undefined after calling the function.");
		});
	});

	QUnit.test("VersionInfo.load - Object Argument", function(assert) {
		this.stub(LoaderExtensions, "loadResource").withArgs("sap-ui-version.json", {
			async: true,
			failOnError: true
		}).resolves(this.oVersionInfo).callThrough();

		return VersionInfo.load({
			library: "sap.ui.core"
		}).then(function(oVersionInfo) {

			assert.deepEqual(oVersionInfo, this.oVersionInfo.libraries[0],
				"'sap.ui.getVersionInfo{ library: \"sap.ui.core\", async: true }' should asynchronously load and return the 'sap.ui.core' library info.");

			assert.deepEqual(sap.ui.versioninfo.libraries[0], this.oVersionInfo.libraries[0],
				"First library in 'sap.ui.versioninfo' should now be the same as the return value of 'sap.ui.getVersionInfo({ library: \"sap.ui.core\", async: true })'.");
		}.bind(this));
	});

	QUnit.test("VersionInfo.load - No Argument", function(assert) {
		this.stub(LoaderExtensions, "loadResource").withArgs("sap-ui-version.json", {
			async: true,
			failOnError: true
		}).resolves(this.oVersionInfo).callThrough();

		return VersionInfo.load().then(function(oVersionInfo) {

			assert.deepEqual(oVersionInfo, this.oVersionInfo,
				"'sap.ui.getVersionInfo{ library: \"sap.ui.core\", async: true }' should asynchronously load and return the 'sap.ui.core' library info.");

			assert.deepEqual(sap.ui.versioninfo, this.oVersionInfo,
				"First library in 'sap.ui.versioninfo' should now be the same as the return value of 'sap.ui.getVersionInfo({ library: \"sap.ui.core\", async: true })'.");
		}.bind(this));
	});

	QUnit.test("VersionInfo.load - Unknown library", function(assert) {
		this.stub(LoaderExtensions, "loadResource").withArgs("sap-ui-version.json", {
			async: true,
			failOnError: true
		}).resolves(this.oVersionInfo).callThrough();

		return VersionInfo.load({
			library: "sap.invalid.library"
		}).then(function(oVersionInfo) {
			assert.equal(oVersionInfo, undefined, "Unknown library leads to undefined return value");
		});
	});

	QUnit.test("_getTransitiveDependencyForLibraries", function(assert) {
		this.stub(LoaderExtensions, "loadResource").withArgs("sap-ui-version.json", {
			async: true,
			failOnError: true
		}).resolves(this.oVersionInfo).callThrough();

		return VersionInfo.load().then(function() {
			assert.deepSortedEqual(
				VersionInfo._getTransitiveDependencyForLibraries(["sap.ui.core"]),
				["sap.ui.core"],
				"transitive dependencies for sap.ui.core");

			assert.deepSortedEqual(
				VersionInfo._getTransitiveDependencyForLibraries(["sap.m"]),
				["sap.m", "sap.ui.core", "sap.ui.layout"],
				"transitive dependencies for sap.m");

			assert.deepSortedEqual(
				VersionInfo._getTransitiveDependencyForLibraries(["sap.ui.documentation"]),
				["sap.m", "sap.ui.core", "sap.ui.documentation", "sap.ui.layout"],
				"transitive dependencies for sap.ui.documentation");

			assert.deepSortedEqual(
				VersionInfo._getTransitiveDependencyForLibraries(["sap.ui.unified", "sap.ui.documentation"]),
				["sap.m", "sap.ui.core", "sap.ui.documentation", "sap.ui.layout", "sap.ui.unified"],
				"merged transitive dependencies for sap.ui.unified and sap.ui.documentation");
		});
	});

	QUnit.test("_getTransitiveDependencyForComponent", function(assert) {
		this.stub(LoaderExtensions, "loadResource").withArgs("sap-ui-version.json", {
			async: true,
			failOnError: true
		}).resolves(this.oVersionInfo).callThrough();

		return VersionInfo.load().then(function() {

			// a component packaged in a library
			assert.deepSortedEqual(
				VersionInfo._getTransitiveDependencyForComponent(["sap.ui.documentation.sdk"]),
				{
					library: "sap.ui.documentation",
					hasOwnPreload: false,
					dependencies: ["sap.m", "sap.ui.core", "sap.ui.layout"]
				},
				"Transitive dependencies for sdk component should match the expectation");

			// a component that is part of a library, but packaged separately
			assert.deepSortedEqual(
				VersionInfo._getTransitiveDependencyForComponent(["sap.ui.documentation.sdk.cookieSettingsDialog"]),
				{
					library: "sap.ui.documentation",
					hasOwnPreload: true,
					dependencies: ["sap.m", "sap.ui.core", "sap.ui.layout", "sap.ui.unified"]
				},
				"Transitive dependencies for cookieSettingsDialog component should match the expectation");
		});
	});

});