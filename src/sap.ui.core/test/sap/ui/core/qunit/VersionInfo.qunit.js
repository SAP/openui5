/* global QUnit, sinon*/
sap.ui.define([
	"sap/ui/VersionInfo"
], function(VersionInfo) {
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

	function sortByName(array) {
		return array.sort((a,b) => {
			if ( a.name !== b.name ) {
				return a.name < b.name ? -1 : 1;
			}
			return 0;
		});
	}

	QUnit.module("VersionInfo", {
		before: function() {
			QUnit.assert.deepSortedEqual = function(a, b, msg) {
				return this.deepEqual(deepSort(a), deepSort(b), msg);
			};
			QUnit.assert.deepSortedByNameEqual = function(a, b, msg) {
				return this.deepEqual(sortByName(a), sortByName(b), msg);
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

			// Clear cached version info data before each test starts
			VersionInfo._reset();
		},
		// Keep fn initFakeServer and call it at the begining of each test
		// in order to enable single test execution
		initFakeServer: function(sResponseCode, oResponse) {
			this.oServer = this._oSandbox.useFakeServer();
			this.oServer.autoRespond = true;
			this.oServer.respondWith("GET", sap.ui.require.toUrl("sap-ui-version.json"), [
				sResponseCode || 200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oResponse || this.oVersionInfo)
			]);
		},
		checkVersionInfoRequest: function (assert) {
			assert.strictEqual(this.oServer.requests.length, 1,
				"Server should have received one request (async).");

			assert.ok(this.oServer.requests[0].async, "First request should be async.");
		}
	});

	QUnit.test("VersionInfo.load - file not found", function(assert) {
		this.initFakeServer(404); // Make sure the request fails as 404 - Not found

		return VersionInfo.load().then(function() {
			assert.ok(false, "Promise should not get resolved.");
		}, function(err) {
			// Check if exception is correct
			sinon.assert.match(err.message, sinon.match("resource sap-ui-version.json could not be loaded"),
				"Should give an error saying the file can not be found.");

			this.checkVersionInfoRequest(assert);
		}.bind(this));
	});

	QUnit.test("VersionInfo.load - Object Argument", function(assert) {
		this.initFakeServer();

		return VersionInfo.load({
			library: "sap.ui.core"
		}).then(function(oVersionInfo) {
			assert.deepEqual(oVersionInfo, this.oVersionInfo.libraries[0],
				"'sap.ui.getVersionInfo{ library: \"sap.ui.core\", async: true }' should asynchronously load and return the 'sap.ui.core' library info.");

			this.checkVersionInfoRequest(assert);
		}.bind(this));
	});

	QUnit.test("VersionInfo.load - No Argument", function(assert) {
		this.initFakeServer();

		return VersionInfo.load().then(function(oVersionInfo) {
			assert.deepEqual(oVersionInfo, this.oVersionInfo,
				"'sap.ui.getVersionInfo{ library: \"sap.ui.core\", async: true }' should asynchronously load and return the 'sap.ui.core' library info.");

			this.checkVersionInfoRequest(assert);
		}.bind(this));
	});

	QUnit.test("VersionInfo.load - Unknown library", function(assert) {
		this.initFakeServer();

		return VersionInfo.load({
			library: "sap.invalid.library"
		}).then(function(oVersionInfo) {
			assert.equal(oVersionInfo, undefined, "Unknown library leads to undefined return value");

			this.checkVersionInfoRequest(assert);
		}.bind(this));
	});

	QUnit.test("_getTransitiveDependencyForLibraries", function(assert) {
		this.initFakeServer();

		return VersionInfo.load().then(function() {
			assert.deepSortedByNameEqual(
				VersionInfo._getTransitiveDependencyForLibraries([{name: "sap.ui.core"}]),
				[{name: "sap.ui.core"}],
				"transitive dependencies for sap.ui.core");

			assert.deepSortedByNameEqual(
				VersionInfo._getTransitiveDependencyForLibraries([{name: "sap.m"}]),
				[{name: "sap.m"}, {name: "sap.ui.core"}, {name: "sap.ui.layout"}],
				"transitive dependencies for sap.m");

			assert.deepSortedByNameEqual(
				VersionInfo._getTransitiveDependencyForLibraries([{name: "sap.ui.documentation"}]),
				[{name: "sap.m"}, {name: "sap.ui.core"}, {name: "sap.ui.documentation"}, {name: "sap.ui.layout"}],
				"transitive dependencies for sap.ui.documentation");

			assert.deepSortedByNameEqual(
				VersionInfo._getTransitiveDependencyForLibraries([{name: "sap.ui.unified"}, {name: "sap.ui.documentation"}]),
				[{name: "sap.m"}, {name: "sap.ui.core"}, {name: "sap.ui.documentation"}, {name: "sap.ui.layout"}, {name: "sap.ui.unified"}],
				"merged transitive dependencies for sap.ui.unified and sap.ui.documentation");

			this.checkVersionInfoRequest(assert);
		}.bind(this));
	});

	QUnit.test("_getTransitiveDependencyForComponent", function(assert) {
		this.initFakeServer();

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

			this.checkVersionInfoRequest(assert);
		}.bind(this));
	});

});