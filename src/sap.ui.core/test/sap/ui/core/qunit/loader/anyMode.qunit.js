/*global QUnit */
(function() {
	"use strict";

	// ========================================================================================
	// Bundle Information
	// ========================================================================================

	QUnit.module("Bundle Information");

	QUnit.test("Basic Scenario", function(assert) {
		sap.ui.loader.config({
			"bundlesUI5": {
				"fixture/bundle-info/bundle1.js": [
					"fixture/bundle-info/bundle1-mod1.js",
					"fixture/bundle-info/bundle1-mod2.js"
				]
			}
		});

		var requests = [];
		sap.ui.require.load = function(context, url, id) {
			requests.push({url:url, id: id});
		};
		function requested(resource) {
			var url = sap.ui.require.toUrl(resource);
			return requests.some(function(request) {
				return request.url === url;
			});
		}

		var done = assert.async();

		requests = [];
		// loading a module that is part of a bundle
		sap.ui.require(["fixture/bundle-info/bundle1-mod1"], function(mod1) {
			// should request the bundle but no file contained in the bundle
			assert.ok(requested("fixture/bundle-info/bundle1.js"), "fixture/bundle-info/bundle1.js should have been requested");
			assert.ok(!requested("fixture/bundle-info/bundle1-mod1.js"), "fixture/bundle-info/bundle1-mod1.js should not have been requested");
			// loading API should have the expected outcome
			assert.equal(mod1, "bundle1-mod1", "fixture/bundle-info/bundle1-mod1.js should have been loaded");

			// loading another module from the same bundle
			requests = [];
			sap.ui.require(["fixture/bundle-info/bundle1-mod2"], function(mod2) {
				// should not request the bundle again
				assert.ok(!requested("fixture/bundle-info/bundle1.js"), "fixture/bundle-info/bundle1.js should not have been requested again");
				// should not request the required module
				assert.ok(!requested("fixture/bundle-info/bundle1-mod2.js"), "fixture/bundle-info/bundle1-mod2.js should not have been requested");
				// loading API should have the expected result
				assert.equal(mod2, "bundle1-mod2", "fixture/bundle-info/bundle1-mod2.js should have been loaded");

				done();
			}, function() {
				assert.ok(false);
				done();
			});
		}, function() {
			assert.ok(false);
			done();
		});

	});

	/*
	 * Tests a scenario where the bundle info claims that a bundle contains a module,
	 * but the bundle doesn't. The loader has to detect this and should not endlessly
	 * require the bundle.
	 */
	QUnit.test("Broken Bundle Information", function(assert) {
		sap.ui.loader.config({
			"bundlesUI5": {
				"fixture/bundle-info/bundle2.js": [
					"fixture/bundle-info/bundle2-mod1.js", // Note: this module is __NOT__ contained in bundle2
					"fixture/bundle-info/bundle2-mod2.js"
				]
			}
		});

		var requests = [];
		sap.ui.require.load = function(context, url, id) {
			requests.push({url:url, id: id});
		};
		function requested(resource) {
			var url = sap.ui.require.toUrl(resource);
			return requests.some(function(request) {
				return request.url === url;
			});
		}

		var done = assert.async();

		requests = [];
		// loading a module that is part of a bundle
		sap.ui.require(["fixture/bundle-info/bundle2-mod1"], function(mod1) {
			// should request the bundle and the requested module
			assert.ok(requested("fixture/bundle-info/bundle2.js"), "fixture/bundle-info/bundle2.js should have been requested");
			assert.ok(requested("fixture/bundle-info/bundle2-mod1.js"), "fixture/bundle-info/bundle2-mod1.js should have been requested");
			// loading API should have the expected outcome
			assert.equal(mod1, "bundle2-mod1", "fixture/bundle-info/bundle2-mod1.js should have been loaded");
			done();
		}, function() {
			assert.ok(false);
			done();
		});

	});

	/*
	 * Tests a scenario where the same module is requested more than once or where different modules
	 * are requested while the loader is still loading the containing bundle.
	 */
	QUnit.test("Parallel Module Requests", function(assert) {
		sap.ui.loader.config({
			"bundlesUI5": {
				"fixture/bundle-info/bundle3.js": [
					"fixture/bundle-info/bundle3-mod1.js",
					"fixture/bundle-info/bundle3-mod2.js"
				]
			}
		});

		var requests = [];
		sap.ui.require.load = function(context, url, id) {
			requests.push({url:url, id: id});
		};
		function requested(resource) {
			var url = sap.ui.require.toUrl(resource);
			return requests.filter(function(request) {
				return request.url === url;
			}).length;
		}

		var done1 = assert.async();
		var done2 = assert.async();
		var done3 = assert.async();

		requests = [];
		// loading a module that is part of a bundle
		sap.ui.require(["fixture/bundle-info/bundle3-mod1"], function(mod1) {
			// should request the bundle and the requested module
			assert.equal(requested("fixture/bundle-info/bundle3.js"), 1, "fixture/bundle-info/bundle3.js should have been requested exactly once");
			assert.ok(!requested("fixture/bundle-info/bundle3-mod1.js"), "fixture/bundle-info/bundle3-mod1.js should not have been requested");
			// loading API should have the expected outcome
			assert.equal(mod1, "bundle3-mod1", "fixture/bundle-info/bundle3-mod1.js should have been loaded");
			done1();
		}, function() {
			assert.ok(false);
			done1();
		});
		sap.ui.require(["fixture/bundle-info/bundle3-mod1"], function(mod1) {
			// should request the bundle and the requested module
			assert.equal(requested("fixture/bundle-info/bundle3.js"), 1, "fixture/bundle-info/bundle3.js should have been requested exactly once");
			assert.ok(!requested("fixture/bundle-info/bundle3-mod1.js"), "fixture/bundle-info/bundle3-mod1.js should not have been requested");
			// loading API should have the expected outcome
			assert.equal(mod1, "bundle3-mod1", "fixture/bundle-info/bundle2-mod1.js should have been loaded");
			done2();
		}, function() {
			assert.ok(false);
			done2();
		});
		sap.ui.require(["fixture/bundle-info/bundle3-mod2"], function(mod2) {
			// should request the bundle and the requested module
			assert.equal(requested("fixture/bundle-info/bundle3.js"), 1, "fixture/bundle-info/bundle3.js should have been requested exactly once");
			assert.ok(!requested("fixture/bundle-info/bundle3-mod2.js"), "fixture/bundle-info/bundle3-mod2.js should have been requested");
			// loading API should have the expected outcome
			assert.equal(mod2, "bundle3-mod2", "fixture/bundle-info/bundle3-mod2.js should have been loaded");
			done3();
		}, function() {
			assert.ok(false);
			done3();
		});

	});

	/*
	 * Tests a scenario where the bundle info claims that a bundle contains a module,
	 * but the bundle doesn't exist. The loader should ignore the error and load the module with
	 * a normal request.
	 */
	QUnit.test("Missing Bundle", function(assert) {
		sap.ui.loader.config({
			"bundlesUI5": {
				"fixture/bundle-info/bundle4.js": [ // this bundle does not exist
					"fixture/bundle-info/bundle4-mod1.js",
					"fixture/bundle-info/bundle4-mod2.js"
				]
			}
		});

		var requests = [];
		sap.ui.require.load = function(context, url, id) {
			requests.push({url:url, id: id});
		};
		function requested(resource) {
			var url = sap.ui.require.toUrl(resource);
			return requests.some(function(request) {
				return request.url === url;
			});
		}

		var done = assert.async();

		requests = [];
		// loading a module that is part of a bundle
		sap.ui.require(["fixture/bundle-info/bundle4-mod1"], function(mod1) {
			// should request the bundle and the requested module
			assert.ok(requested("fixture/bundle-info/bundle4.js"), "fixture/bundle-info/bundle4.js should have been requested");
			assert.ok(requested("fixture/bundle-info/bundle4-mod1.js"), "fixture/bundle-info/bundle4-mod1.js should have been requested");
			// loading API should have the expected outcome
			assert.equal(mod1, "bundle4-mod1", "fixture/bundle-info/bundle4-mod1.js should have been loaded");

			requests = [];
			sap.ui.require(["fixture/bundle-info/bundle4-mod2"], function(mod2) {
				// should request the bundle and the requested module
				assert.ok(!requested("fixture/bundle-info/bundle4.js"), "fixture/bundle-info/bundle4.js should have been requested again");
				assert.ok(requested("fixture/bundle-info/bundle4-mod2.js"), "fixture/bundle-info/bundle4-mod2.js should have been requested");
				// loading API should have the expected outcome
				assert.equal(mod2, "bundle4-mod2", "fixture/bundle-info/bundle4-mod1.js should have been loaded");
				done();
			}, function() {
				assert.ok(false);
			});
		}, function() {
			assert.ok(false);
		});

	});

	QUnit.start();

}());