/*global QUnit, sinon, jQuery, my */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/base/Log",
	"sap/base/util/ObjectPath"
], function(Log, ObjectPath) {
	"use strict";

	const privateLoaderAPI = sap.ui.loader._;

	//****************************************************
	// module loading (require/declare/define)
	//****************************************************

	QUnit.module("load modules", {
		beforeEach: function() {
			this.server = sinon.fakeServer.create();
			this.server.autoRespond = true;
		},
		afterEach: function() {
			this.server.restore();
			jQuery.sap.unloadResources('my/first/module.js', false, true, true);
			jQuery.sap.unloadResources('my/second/module.js', false, true, true);
			delete window.my;
		}
	});

	QUnit.test("jQuery.sap.require, basic", function (assert) {

		this.server.respondWith(/first/, 'jQuery.sap.declare("my.first.module");' +
				'jQuery.sap.require("my.second.module");' +
				'my.first.module = "1st";');
		this.server.respondWith(/second/, 'jQuery.sap.declare("my.second.module");' +
				'my.second.module = "2nd";');

		assert.equal(ObjectPath.get("my.first.module"), undefined, "global name for module 'first' should be undefined");
		assert.ok(!sap.ui.require("my/first/module"), "module 'first' should not be declared");
		assert.equal(ObjectPath.get("my.second.module"), undefined, "global name for module 'second' should be undefined");
		assert.ok(!sap.ui.require("my/second/module"), "module 'second' should not be declared");

		jQuery.sap.require("my.first.module");
		assert.equal(ObjectPath.get("my.first.module"), "1st", "require of 'first' should have loaded 'first'");
		assert.ok(sap.ui.require("my/first/module"), "module 'first' should be declared");
		assert.equal(ObjectPath.get("my.second.module"), "2nd", "require of 'first' should have loaded 'second' (transitively)");
		assert.ok(sap.ui.require("my/second/module"), "module 'first' should be declared");

		jQuery.sap.require("my.second.module");
		assert.equal(ObjectPath.get("my.first.module"), "1st", "addtl. require of 'second' shouldn't touch globals");
		assert.equal(ObjectPath.get("my.second.module"), "2nd", "addtl. require of 'second' shouldn't touch globals");

		jQuery.sap.require("my.first.module");
		assert.equal(ObjectPath.get("my.first.module"), "1st", "addtl. require of 'first' shouldn't touch globals");
		assert.equal(ObjectPath.get("my.second.module"), "2nd", "addtl. require of 'first' shouldn't touch globals");

	});

	QUnit.test("jQuery.sap.require, mismatch in jQuery.sap.declare", function (assert) {

		const SCENARIO = "mismatchOfDeclare";
		const MODULE_A = `${SCENARIO}/moduleA`;
		const MODULE_B = `${SCENARIO}/moduleB`;
		const MODULE_C = `${SCENARIO}/moduleC`;
		const toDot = (mod) => mod.replace(/\//g, "."); // create dot notation

		// 'moduleA' has a dependency to 'moduleB', but 'moduleB' declares itself as 'moduleC'
		// After loading 'moduleA', 'moduleB' and 'moduleC' both should be READY. This is loader specific behavior.
		//
		// As 'moduleB/C' only writes to the global name 'moduleC', 'moduleB' has an export of `undefined`.
		// This is module specific behavior, not related to the loader.
		this.server.respondWith(/moduleA/, `
jQuery.sap.declare("${toDot(MODULE_A)}");
jQuery.sap.require("${toDot(MODULE_B)}");
${toDot(MODULE_A)} = "A";
`);
		this.server.respondWith(/moduleB/, `
jQuery.sap.declare("${toDot(MODULE_C)}");
${toDot(MODULE_C)} = "C";
`);

		assert.equal(ObjectPath.get(`${toDot(MODULE_A)}`), undefined, "global property for 'moduleA' should be undefined");
		assert.ok(!sap.ui.require(MODULE_A), "'moduleA' should not be declared");
		assert.equal(ObjectPath.get(`${toDot(MODULE_B)}`), undefined, "global property for 'moduleB' should be undefined");
		assert.ok(!sap.ui.require(MODULE_B), "'moduleB' should not be declared");
		assert.equal(ObjectPath.get(`${toDot(MODULE_B)}`), undefined, "global property for 'moduleC' should be undefined");
		assert.ok(!sap.ui.require(MODULE_C), "'moduleC' should not be declared");

		jQuery.sap.require(`${toDot(MODULE_A)}`);
		assert.equal(ObjectPath.get(`${toDot(MODULE_A)}`), "A", "require of 'moduleA' should have loaded 'moduleA'");
		assert.ok(sap.ui.require(MODULE_A), "'moduleA' should be declared");
		assert.equal(privateLoaderAPI.getModuleState(MODULE_B + ".js"), 4, "'moduleB' should be READY");
		assert.equal(ObjectPath.get(`${toDot(MODULE_B)}`), undefined, "require of 'moduleA' should have loaded 'moduleB' (transitively)");
		assert.equal(sap.ui.require(MODULE_B), undefined, "'moduleB' should have the expected export");
		assert.equal(privateLoaderAPI.getModuleState(MODULE_C + ".js"), 4, "'moduleC' should be READY");
		assert.equal(ObjectPath.get(`${toDot(MODULE_C)}`), "C", "require of 'moduleA' should have loaded 'moduleC' (transitively)");
		assert.equal(sap.ui.require(MODULE_C), "C", "'moduleC' should have the expected export ('C')");

		const done = assert.async();
		sap.ui.require([
			MODULE_B,
			MODULE_C
		], function(moduleB, moduleC) {
			assert.strictEqual(moduleB, undefined, "export of 'moduleB' should be the expected one (undefined)");
			assert.strictEqual(moduleC, "C", "export of 'moduleC' should be the expected one ('C')");
			done();
		}, function() {
			assert.ok(false, "requring 'moduleB' and 'moduleC' should not fail");
		});
	});

	QUnit.test("jQuery.sap.require, nested + cyclic", function (assert) {

		this.server.respondWith(/first/, 'jQuery.sap.declare("my.first.module");' +
				'jQuery.sap.require("my.second.module");' +
				'my.first.module = "1st";');
		this.server.respondWith(/second/, 'jQuery.sap.declare("my.second.module");' +
				'jQuery.sap.require("my.first.module");' +
				'my.second.module = my.first.module;');

		jQuery.sap.require("my.first.module");

		assert.equal(ObjectPath.get("my.first.module"), "1st", "first module should have been loaded");
		assert.ok(sap.ui.loader._.getModuleState("my/first/module.js") !== 0, "module 'first' should be declared");
		assert.equal(ObjectPath.get("my.second.module"), undefined, "second module should have been loaded");
		assert.ok(sap.ui.loader._.getModuleState("my/second/module.js") !== 0, "module 'second' should be declared");

	});

	QUnit.test("jQuery.sap.require, nested + cyclic (2)", function (assert) {

		this.server.respondWith(/first/, 'jQuery.sap.declare("my.first.module");' +
				'my.first.module = "1st";' +
				'jQuery.sap.require("my.second.module");');
		this.server.respondWith(/second/, 'jQuery.sap.declare("my.second.module");' +
				'jQuery.sap.require("my.first.module");' +
				'my.second.module = my.first.module;');

		jQuery.sap.require("my.first.module");

		assert.equal(ObjectPath.get("my.first.module"), "1st", "first module should have been loaded");
		assert.equal(ObjectPath.get("my.second.module"), "1st", "second module should have been loaded");

	});

	QUnit.test("sap.ui.define (basic)", function (assert) {

		this.server.respondWith(/first/, 'sap.ui.define([], function () {' +
				'return {my : "firstmodule"}' +
				'}, /* bExport= */ true);');
		this.server.respondWith(/second/, 'sap.ui.define([], function () {' +
				'return {my : "secondmodule"}' +
				'});');

		var done = assert.async();
		sap.ui.require(["my/first/module", "my/second/module"], function (firstModule, secondModule) {
			assert.strictEqual(firstModule.my, "firstmodule");
			assert.strictEqual(firstModule, ObjectPath.get("my.first.module"));
			assert.strictEqual(secondModule.my, "secondmodule");
			assert.ok(my && my.second === undefined);
			done();
		});

	});

	QUnit.test("sap.ui.define (cycle)", function (assert) {

		/*
		 * This test verifies the behavior of sap.ui.define in case of a cyclic module dependency.
		 *
		 * Dependencies:
		 *   my/first/module --> my/second/module --> my/first/module
		 *
		 * When 'first' is loaded, it will trigger loading of 'second' as well.
		 * 'Second' in turn tries to access 'first'. As 'first' is currently loading,
		 * 'undefined' should be returned as its module value.
		 * After loading completed, any further reads of 'first' should return the expected value.
		 */

		this.server.respondWith(/first/, 'sap.ui.define(["my/second/module"], function (second) {' +
				'return {my : "firstmodule", second: second}' +
				'}, /* bExport= */ true);');
		this.server.respondWith(/second/, 'sap.ui.define(["my/first/module"], function (first) {' +
				'return {' +
				'  my : "secondmodule",' +
				'  first: first,' +
				'  requireDuringExec: sap.ui.require("my/first/module"),' +
				'  requireSyncDuringExec: sap.ui.requireSync("my/first/module"),' +
				'  requireSync: function() { return sap.ui.requireSync("my/first/module"); },' +
				'  require: function() { return sap.ui.require("my/first/module"); },' +
				'  requireAsync: function(callback) { return sap.ui.require(["my/first/module"], callback); }' +
				'};' +
				'}, /* bExport= */ true);');

		var done = assert.async();
		sap.ui.require(["my/first/module", "my/second/module"], function (firstModule, secondModule) {
			assert.strictEqual(firstModule.my, "firstmodule", "after loading, value of first module should be as expected");
			assert.strictEqual(secondModule.my, "secondmodule", "after loading, value of second module should be as expected");
			assert.ok(firstModule.second && firstModule.second.my === "secondmodule", "first module should have recevied value of second module");
			assert.ok(secondModule.first === undefined, "second module should not have recevied value of second module, due to cyclic dependency");
			assert.ok(secondModule.requireDuringExec === undefined, "when second module tries to access 'first' during execution, it still should receive 'undefined'");
			assert.ok(secondModule.requireSyncDuringExec === undefined, "when second module tries to sync access 'first' during execution, it still should receive 'undefined'");
			assert.strictEqual(secondModule.require(), firstModule, "when accessing first after load, it should return the expected value");
			assert.strictEqual(secondModule.requireSync(), firstModule, "when accessing first after load, it should return the expected value");

			secondModule.requireAsync(function(anotherfirst) {
				assert.strictEqual(anotherfirst, firstModule, "require");
				done();
			});
		});

	});

	QUnit.test("sap.ui.require (sync probe)", function (assert) {

		this.server.respondWith(/first/, 'jQuery.sap.declare("my.first.module");' +
				'jQuery.sap.require("my.second.module");' +
				'my.first.module = "1st";');
		this.server.respondWith(/second/, 'jQuery.sap.declare("my.second.module");' +
				'my.second.module = "2nd";');

		assert.equal(sap.ui.require("my/first/module"), undefined, "without prior loading, sap.ui.require should return undefined for first");
		assert.equal(sap.ui.require("my/second/module"), undefined, "without prior loading, sap.ui.require should return undefined for second");
		jQuery.sap.require("my.first.module");
		assert.equal(sap.ui.require("my/first/module"), "1st", "after loading, sap.ui.require should return the expected value for first");
		assert.equal(sap.ui.require("my/second/module"), "2nd", "after loading, sap.ui.require should return the expected value for second");

	});

	QUnit.test("sap.ui.require (async)", function (assert) {

		this.server.respondWith(/first/, 'sap.ui.define([], function () {' +
				'return {my : "firstmodule"}' +
				'}, /* bExport= */ true);');
		this.server.respondWith(/second/, 'sap.ui.define([], function () {' +
				'return {my : "secondmodule"}' +
				'}, /* bExport= */ true);');

		var done = assert.async();
		var calledBack = false;
		sap.ui.require(["my/first/module", "my/second/module"], function (firstModule, secondModule) {
			assert.strictEqual(firstModule.my, "firstmodule");
			assert.strictEqual(secondModule.my, "secondmodule");
			calledBack = true;
			done();
		});
		assert.equal(calledBack, false, "callback must not have been called synchronously");

	});

	QUnit.test("sap.ui.requireSync", function (assert) {

		this.server.respondWith(/first/, 'jQuery.sap.declare("my.first.module");' +
				'jQuery.sap.require("my.second.module");' +
				'my.first.module = "1st";');
		this.server.respondWith(/second/, 'jQuery.sap.declare("my.second.module");' +
				'my.second.module = "2nd";');

		assert.equal(sap.ui.require("my/first/module"), undefined, "without prior loading, sap.ui.require should return undefined for first");
		assert.equal(sap.ui.require("my/second/module"), undefined, "without prior loading, sap.ui.require should return undefined for second");

		assert.equal(sap.ui.requireSync("my/second/module"), "2nd", "sap.ui.requireSync should return the expected value for second");
		assert.equal(sap.ui.require("my/first/module"), undefined, "after loading 'second', sap.ui.require should still return undefined for first");
		assert.equal(sap.ui.require("my/second/module"), "2nd", "after loading 'second', sap.ui.require should return the expected value for second");

		assert.equal(sap.ui.requireSync("my/first/module"), "1st", "sap.ui.requireSync should return the expected value for first");
		assert.equal(sap.ui.require("my/first/module"), "1st", "after loading 'first', sap.ui.require should return the expected value for first");
		assert.equal(sap.ui.require("my/second/module"), "2nd", "after loading 'Second', sap.ui.require should return the expected value for second");

	});



	// ========================================================================================
	// Exotic Scenarios
	// ========================================================================================

	QUnit.module("Exotic Scenarios");

	QUnit.test("Nested anonymous sap.ui.define with relative dependencies", function(assert) {
		var done = assert.async();

		sap.ui.require([
			'fixture/exotic-use-cases/deferred',
			'fixture/exotic-use-cases/nested-anonymous-define-with-relative-dependencies'
		], function(deferred, main) {

			deferred.then(function(result) {
				assert.strictEqual(result.dependency1, "dependency1", "a relative dependency of the outer module should be resolved correctly");
				assert.strictEqual(result.dependency2, "dependency2", "a relative dependency of the inner module should be resolved correctly");
				assert.strictEqual(typeof result.outerModule, "object", "outer module should have got a module object");
				assert.strictEqual(result.outerModule.id, "fixture/exotic-use-cases/nested-anonymous-define-with-relative-dependencies",
						"module object for the outer module should report the expected ID");
				assert.strictEqual(result.outerUrl, sap.ui.loader._.toUrl("fixture/exotic-use-cases/data.json"),
						"contextual require for the outer module should resolve relative URLs as expected");
				assert.strictEqual(typeof result.innerModule, "object", "outer module should have got a module object");
				assert.strictEqual(result.innerModule.id, "fixture/exotic-use-cases/~anonymous~1",
						"module object for the inner module should report an anonymous ID");
				assert.strictEqual(result.innerUrl, sap.ui.loader._.toUrl("fixture/exotic-use-cases/data.json"),
						"contextual require for the inner module should resolve relative URLs as expected");
				done();
			});

		}, function(err) {
			assert.ok(false, "module with nested define calls couldn't be required successfully");
			done();
		});
	});



	//====================================================
	// error handling
	//====================================================

	QUnit.module('Error Handling', {});

	/*
	 * Helper to check error reporting of the (sap.ui.)require implementation.
	 *
	 * When an error callback is given, the implementation reports errors always via that callback.
	 * If none is given, it might throw synchronously, in a new task or in a micro task.
	 * This helper covers all 3 ways to decouple the tests from the implementation.
	 */
	function shouldThrow(assert, fnAct, expectedError) {
		var done = assert.async();
		var oldOnError = window.onerror;

		function checkAndRestore(msg, qualifier) {
			window.removeEventListener("error", onError);
			window.removeEventListener("unhandledrejection", onUnhandledRejection);
			window.onerror = oldOnError;
			assert.ok(expectedError.test(msg), "message of " + qualifier + " should match the expected message");
			done();
		}

		function onError(e) {
			e.stopImmediatePropagation();
			e.preventDefault();
			checkAndRestore(e.message, "uncaught global error");
		}

		function onUnhandledRejection(e) {
			e.stopImmediatePropagation();
			e.preventDefault();
			checkAndRestore(e.reason && e.reason.message, "unhandled rejection reason");
		}

		window.onerror = null; // deactivate qunit global error handler
		window.addEventListener("error", onError);
		window.addEventListener("unhandledrejection", onUnhandledRejection);

		try {
			fnAct();
		} catch (err) {
			checkAndRestore(err && err.message, "synchronously thrown error");
		}
	}

	QUnit.test("Execution Error (errback)", function(assert) {
		sap.ui.predefine('sap/test/FailingModule', [], function() {
			throw new Error("Sorry, my fault");
		});
		var done = assert.async();
		sap.ui.require(['sap/test/FailingModule'], function (mod1) {
			assert.ok(false, "callback should never be reached");
		}, function(err) {
			assert.ok(err && /Sorry, my fault/i.test(err.message), "module loading should fail in case of an execution error");
			done();
		});

	});

	QUnit.test("Execution Error (no errback)", function(assert) {
		sap.ui.predefine('sap/test/FailingModule', [], function() {
			throw new Error("Sorry, my fault");
		});

		shouldThrow(assert, function() {
			sap.ui.require(['sap/test/FailingModule'], function (mod1) {
				assert.ok(false, "callback should never be reached");
			});
		}, /Sorry, my fault/i);
	});



	//****************************************************
	// module name resolution (sap.ui.define)
	//****************************************************

	QUnit.module('Module Name Resolution', {

		unloadTestModules: function() {
			jQuery.sap.unloadResources('sap/test/myapp/Component.js', false, true, true);
			jQuery.sap.unloadResources('sap/test/myapp/views/MainView.js', false, true, true);
			jQuery.sap.unloadResources('sap/test/myapp/views/DetailView.js', false, true, true);
			jQuery.sap.unloadResources('sap/test/myapp/utils/Formatter.js', false, true, true);
			jQuery.sap.unloadResources('thirdparty/SomeOpenSource.js', false, true, true);
		},

		beforeEach: function(assert) {

			this.unloadTestModules();

			sap.ui.predefine('sap/test/myapp/Component', function(mod2) {
				return "Component";
			});

			sap.ui.predefine('sap/test/myapp/views/DetailView', function(mod2) {
				return "DetailView";
			});

			sap.ui.predefine('sap/test/myapp/utils/Formatter', function(mod2) {
				return "Formatter";
			});

			sap.ui.predefine('thirdparty/SomeOpenSource', function(mod2) {
				return "SomeOpenSource";
			});
		},

		afterEach: function() {
			this.unloadTestModules();
		}

	});

	QUnit.test("simple cases", function(assert) {

		var doneModule1 = assert.async();
		var doneModule2 = assert.async();

		sap.ui.predefine('sap/test/myapp/views/MainView',
		[
			'./DetailView', // same package
			'../Component', // parent package
			'../utils/Formatter', // relative to parent package
			'thirdparty/SomeOpenSource', // absolut name
			'../../../../thirdparty/SomeOpenSource', // navigation to root and then down again
			'sap/test/myapp/views/../utils/Formatter' // nav-to-parent somewhere inside a name
		],
		function(mod1, mod2, mod3, mod4, mod5, mod6) {
				assert.equal(mod1, 'DetailView');
				assert.equal(mod2, 'Component');
				assert.equal(mod3, 'Formatter');
				assert.equal(mod4, 'SomeOpenSource');
				assert.equal(mod5, 'SomeOpenSource');
				assert.equal(mod6, 'Formatter');
				return "MainView";
		});


		sap.ui.require(['sap/test/myapp/views/MainView'], function (mod1) {
			assert.equal(mod1, 'MainView', "required module value should be MainView");
			doneModule1();
		});

		sap.ui.require(['sap/test/myapp/utils/../views/MainView'], function (mod1) {
			assert.equal(mod1, 'MainView', "required module value should be MainView");
			doneModule2();
		});
	});


	QUnit.test("navigate to parent of root (begin,errback)", function(assert) {

		sap.ui.predefine('sap/test/myapp/views/MainView',
		[
			'../../../../../thirdparty/SomeOpenSource'
		], function(mod1) {
			return "MainView";
		});

		var done = assert.async();
		sap.ui.require(['sap/test/myapp/views/MainView'], function (mod1) {
			assert.ok(false, "callback should never be reached in case of module loading errors");
		}, function(err) {
			assert.ok(err && /parent of root/i.test(err.message), "module loading should fail due to dependency");
			done();
		});

	});

	QUnit.test("navigate to parent of root (begin,no errback)", function(assert) {

		sap.ui.predefine('sap/test/myapp/views/MainView',
		[
			'../../../../../thirdparty/SomeOpenSource'
		], function(mod1) {
			return "MainView";
		});

		shouldThrow(assert, function() {
			sap.ui.require(['sap/test/myapp/views/MainView'], function (mod1) {
				assert.ok(false, "callback should never be reached in case of module loading errors");
			});
		}, /parent of root/i);

	});

	QUnit.test("navigate to parent of root (inside, errback)", function(assert) {

		sap.ui.predefine('sap/test/myapp/views/MainView',
		[
			'sap/test/myapp/../../../../thirdparty/SomeOpenSource'
		], function(mod1) {
			return "MainView";
		});

		var done = assert.async();
		sap.ui.require(['sap/test/myapp/views/MainView'], function (mod1) {
			assert.ok(false, "callback should never be reached in case of module loading errors");
		}, function(err) {
			assert.ok(err && /parent of root/i.test(err.message), "module loading should fail due to dependency");
			done();
		});

	});

	QUnit.test("navigate to parent of root (inside, no errback)", function(assert) {

		sap.ui.predefine('sap/test/myapp/views/MainView',
		[
			'sap/test/myapp/../../../../thirdparty/SomeOpenSource'
		], function(mod1) {
			return "MainView";
		});

		shouldThrow(assert, function() {
			sap.ui.require(['sap/test/myapp/views/MainView'], function (mod1) {
				assert.ok(false, "callback should never be reached in case of module loading errors");
			});
		}, /parent of root/i);

	});

	QUnit.test("invalid dot-segment (errback)", function(assert) {

		sap.ui.predefine('sap/test/myapp/views/MainView', ['./.../Component'], function(mod1) {
			return "MainView";
		});

		var done = assert.async();
		sap.ui.require(['sap/test/myapp/views/MainView'], function (mod1) {
			assert.ok(false, "callback should never be reached in case of module loading errors");
		}, function(err) {
			assert.ok(err && /illegal.*segment/i.test(err.message), "module loading should fail due to dependency");
			done();
		});

	});

	QUnit.test("invalid dot-segment (no errback)", function(assert) {

		sap.ui.predefine('sap/test/myapp/views/MainView', ['./.../Component'], function(mod1) {
			return "MainView";
		});

		shouldThrow(assert, function() {
			sap.ui.require(['sap/test/myapp/views/MainView'], function (mod1) {
				assert.ok(false, "callback should never be reached in case of module loading errors");
			});
		}, /illegal.*segment/i);

	});

	QUnit.test("invalid use of relative paths in require", function(assert) {

		// sap.ui.require doesn't support relative paths
		shouldThrow(assert, function() {
			sap.ui.require(['./test/myapp/views/MainView'], function (mod1) {
				// if this factory function is reached, this will be an error
				// but QUnit.throws should have reported it already, so no need to add checks in here
			});
		}, /not supported/i, "module loading should fail due to relative path ");

		// sap.ui.require doesn't support relative paths with '../'
		shouldThrow(assert, function() {
			sap.ui.require(['../test/myapp/views/MainView'], function (mod1) {
			});
		}, /not supported/i, "module loading should fail due to relative path ");

		// sap.ui.require also doesn't support invalid segment
		shouldThrow(assert, function() {
			sap.ui.require(['.../test/myapp/views/MainView'], function (mod1) {
			});
		}, /not supported/i, "module loading should fail due to relative path ");

	});

	QUnit.test("standard name segments, but starting with dots", function(assert) {

		var done = assert.async();

		// predefine modules with special names
		sap.ui.predefine('.util/formatter', function(mod2) {
			return ".util/formatter";
		});

		sap.ui.predefine('..util/formatter', function(mod2) {
			return "..util/formatter";
		});

		sap.ui.predefine('...util/formatter', function(mod2) {
			return "...util/formatter";
		});

		sap.ui.predefine('common/.util/formatter', function(mod2) {
			return "common/.util/formatter";
		});

		sap.ui.predefine('common/..util/formatter', function(mod2) {
			return "common/..util/formatter";
		});

		sap.ui.predefine('common/...util/formatter', function(mod2) {
			return "common/...util/formatter";
		});

		// create a MainView module which references other modules with special names
		// loading the MainView will resolve the special names.
		// check that the name reoslution works as expected
		sap.ui.predefine('sap/test/myapp/views/MainView',
		[
			'.util/formatter',
			'..util/formatter',
			'...util/formatter',
			'common/.util/formatter',
			'common/..util/formatter',
			'common/...util/formatter'
		],
		function(mod1, mod2, mod3, mod4, mod5, mod6) {
			assert.equal(mod1, '.util/formatter', "standard name segment starting with a single dot should not cause relative name resolution");
			assert.equal(mod2, '..util/formatter', "standard name segment starting with two dot2 should not cause relative name resolution");
			assert.equal(mod3, '...util/formatter', "standard name segment starting with 3 dots should not be reported as error");
			assert.equal(mod4, 'common/.util/formatter', "standard name segment starting with a single dot should not cause relative name resolution");
			assert.equal(mod5, 'common/..util/formatter', "standard name segment starting with two dot2 should not cause relative name resolution");
			assert.equal(mod6, 'common/...util/formatter', "standard name segment starting with 3 dots should not be reported as error");
			return "MainView";
		});

		sap.ui.require(['sap/test/myapp/views/MainView'], function (mod1) {
			assert.equal(mod1, 'MainView', "required module value should be MainView");
			jQuery.sap.unloadResources('.util/formatter.js', false, true, true);
			jQuery.sap.unloadResources('..util/formatter.js', false, true, true);
			jQuery.sap.unloadResources('...util/formatter.js', false, true, true);
			jQuery.sap.unloadResources('common/.util/formatter.js', false, true, true);
			jQuery.sap.unloadResources('common/..util/formatter.js', false, true, true);
			jQuery.sap.unloadResources('common/...util/formatter.js', false, true, true);
			done();
		});

	});

	QUnit.test("module definiton should normalize names", function(assert) {

		var done = assert.async();

		sap.ui.predefine('common/./normalized1', function(mod2) {
			return "common/normalized1";
		});

		sap.ui.predefine('common/util/../normalized2', function(mod2) {
			return "common/normalized2";
		});

		sap.ui.require(['common/normalized1', 'common/normalized2'], function (mod1, mod2) {
			assert.equal(mod1, 'common/normalized1', "module declaration should have normalized module name");
			assert.equal(mod2, 'common/normalized2', "module declaration should have normalized module name");
			done();
		});

	});

	//****************************************************
	// loadResource tests
	//****************************************************

	QUnit.module("loadResource");

	QUnit.test("synchronous - basic", function(assert) {
		var sText = jQuery.sap.loadResource({
			url: "fixture/other-resources/test.properties",
			dataType: 'text',
			failOnError: false
		});
		assert.ok(sText && sText.length > 0, "Resource loaded successfully");
	});

	QUnit.test("synchronous - no fail on error", function(assert) {
		var sText = jQuery.sap.loadResource({
			url: "fixture/other-resources/testDoesNotExist.properties",
			dataType: 'text',
			failOnError: false
		});
		assert.ok(!sText, "Resource cannot be found but no error occurred");
	});

	QUnit.test("synchronous - fail on error", function(assert) {
		try {
			/* var sText = */ jQuery.sap.loadResource({
				url: "fixture/other-resources/testDoesNotExist.properties",
				dataType: 'text',
				failOnError: true
			});
			assert.ok(false, "Resource cannot be found but no error occurred");
		} catch (e){
			assert.ok(true, "Resource cannot be found and an error occurred");
		}
	});

	QUnit.test("synchronous - from module preload", function(assert) {
		// Register resource path and a preload bundle to test the URL to module name guessing.
		// Only if the resource name can be guessed, the file is taken from the preload.
		jQuery.sap.registerResourcePath("preload/testdata", "preload/testdata");
		jQuery.sap.registerPreloadedModules({
			"name": "test.moduleSystem.loadResource-preload",
			"version": "2.0",
			"modules": {
				"preload/testdata/test.properties": "KEY=VALUE",
				"preload/testdata/test_en.properties": ""
			}
		});

		var sText = jQuery.sap.loadResource({
			// Using a not normalized URL to test if URL resolution is working properly
			url: "./preload/../preload/testdata/test.properties",
			dataType: 'text',
			failOnError: false
		});
		assert.equal(sText, "KEY=VALUE", "Resource successfully taken from module preload");

		var sTextEmpty = jQuery.sap.loadResource({
			url: "./preload/testdata/test_en.properties",
			dataType: 'text',
			failOnError: false
		});
		assert.equal(sTextEmpty, "", "Empty resource successfully taken from module preload");

		jQuery.sap.registerResourcePath("preload/testdata");
		jQuery.sap.unloadResources("test.moduleSystem.loadResource-preload", true, true);
	});

	QUnit.test("synchronous - from module preload (different domain)", function(assert) {
		// Register cross-domain resource path and a preload bundle to test the URL to module name guessing.
		// Only if the resource name can be guessed, the file is taken from the preload.
		jQuery.sap.registerResourcePath("preload/testdata", "http://preload.example.com/testdata/");
		jQuery.sap.registerPreloadedModules({
			"name": "test.moduleSystem.loadResource-preload",
			"version": "2.0",
			"modules": {
				"preload/testdata/test.properties": "KEY=VALUE"
			}
		});

		var sText = jQuery.sap.loadResource({
			url: "http://preload.example.com/testdata/test.properties",
			dataType: 'text',
			failOnError: false
		});
		assert.equal(sText, "KEY=VALUE", "Resource successfully taken from module preload");

		jQuery.sap.registerResourcePath("preload/testdata");
		jQuery.sap.unloadResources("test.moduleSystem.loadResource-preload", true, true);
	});

	QUnit.test("synchronous - from module preload (different domain, url params)", function(assert) {
		// Register cross-domain resource path and a preload bundle to test the URL to module name guessing.
		// Only if the resource name can be guessed, the file is taken from the preload.
		jQuery.sap.registerResourcePath("preload/testdata", "http://preload.example.com/testdata/");
		jQuery.sap.registerPreloadedModules({
			"name": "test.moduleSystem.loadResource-preload",
			"version": "2.0",
			"modules": {
				"preload/testdata/test.properties": "KEY=VALUE"
			}
		});

		var sText = jQuery.sap.loadResource({
			url: "http://preload.example.com/testdata/test.properties?sap-language=en&sap-client=123",
			dataType: 'text',
			failOnError: false
		});
		assert.equal(sText, "KEY=VALUE", "Resource successfully taken from module preload");

		jQuery.sap.registerResourcePath("preload/testdata");
		jQuery.sap.unloadResources("test.moduleSystem.loadResource-preload", true, true);
	});

	QUnit.test("synchronous - from module preload (different domain, url fragment)", function(assert) {
		// Register cross-domain resource path and a preload bundle to test the URL to module name guessing.
		// Only if the resource name can be guessed, the file is taken from the preload.
		jQuery.sap.registerResourcePath("preload/testdata", "http://preload.example.com/testdata/");
		jQuery.sap.registerPreloadedModules({
			"name": "test.moduleSystem.loadResource-preload",
			"version": "2.0",
			"modules": {
				"preload/testdata/test.properties": "KEY=VALUE"
			}
		});

		var sText = jQuery.sap.loadResource({
			url: "http://preload.example.com/testdata/test.properties#head",
			dataType: 'text',
			failOnError: false
		});
		assert.equal(sText, "KEY=VALUE", "Resource successfully taken from module preload");

		jQuery.sap.registerResourcePath("preload/testdata");
		jQuery.sap.unloadResources("test.moduleSystem.loadResource-preload", true, true);
	});

	QUnit.test("asynchronous - basic", function(assert) {
		return jQuery.sap.loadResource({
			url: "fixture/other-resources/test.properties",
			dataType: 'text',
			failOnError: false,
			async: true
		}).then(function(sText){
			assert.ok(sText && sText.length > 0, "Promise.done: Resource loaded successfully");
		}, function(oError){
			assert.ok(false, "Promise.catch should not be called");
		});
	});

	QUnit.test("asynchronous - no fail on error", function(assert) {
		return jQuery.sap.loadResource({
			url: "fixture/other-resources/testDoesNotExist.properties",
			dataType: 'text',
			failOnError: false,
			async: true
		}).then(function(sText){
			assert.ok(!sText, "Promise.done: Resource cannot be found but no error occured");
		}, function(oError){
			assert.ok(false, "Promise.catch should not be called");
		});
	});

	QUnit.test("asynchronous - fail on error", function(assert) {
		return jQuery.sap.loadResource({
			url: "fixture/other-resources/testDoesNotExist.properties",
			dataType: 'text',
			failOnError: true,
			async: true
		}).then(function(sText){
			assert.ok(false, "Promise.done should not be called");
		}, function(oError){
			assert.ok(oError instanceof Error, "Promise.catch: Resource cannot be found and an error occured");
		});
	});


	//****************************************************
	// resource roots
	//****************************************************

	QUnit.module("register roots", {
		beforeEach: function() {
			var logSpy = this.logSpy = sinon.stub();
			this.listener = {
				onLogEntry: function(oLogEntry) {
					logSpy(oLogEntry.level, oLogEntry.message);
				}
			};
			Log.addLogListener(this.listener);
		},
		afterEach: function() {
			Log.removeLogListener(this.listener);
		}
	});

	QUnit.test("register w/o final flag (legacy variant)", function(assert) {

		var sPathInput = "/qunit/test/path";

		//first, set path to anything (should be overwritten then...)
		jQuery.sap.registerModulePath("qunit.test.path1", "/this/is/the/wrong/path/");
		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path1/))), "first path registration should have been logged");
		this.logSpy.resetHistory();

		jQuery.sap.registerModulePath("qunit.test.path1", sPathInput);
		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path1/))), "second path registration should have been logged");
		this.logSpy.resetHistory();

		assert.equal(jQuery.sap.getModulePath("qunit.test.path1"), sPathInput, "non-final path has been overwritten");

	});

	QUnit.test("register with final=false", function(assert) {
		var sPathInput = "/qunit/test/path";

		//first, set path to anything (should be overwritten then...)
		jQuery.sap.registerModulePath("qunit.test.path2", "/this/is/the/wrong/path/");
		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path2/))), "first path registration should have been logged");
		this.logSpy.resetHistory();

		jQuery.sap.registerModulePath("qunit.test.path2", {'url': sPathInput, 'final': false});
		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path2/))), "second path registration should have been logged");
		this.logSpy.resetHistory();

		assert.equal(jQuery.sap.getModulePath("qunit.test.path2"), sPathInput, "False final flag was handled successfully.");
	});

	QUnit.test("register with final=true", function(assert) {
		var sPathInput = "/qunit/test/path";

		//first, set path to the value it should be and stay (should NOT be overwritten then...)
		jQuery.sap.registerModulePath("qunit.test.path3", {'url': sPathInput, 'final': true});
		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path3/)).and(sinon.match(/final/))), "first path registration should have been logged");
		this.logSpy.resetHistory();

		jQuery.sap.registerModulePath("qunit.test.path3", "/this/is/the/wrong/path/");
		assert.ok(this.logSpy.calledWith(Log.Level.WARNING, sinon.match(/registerResourcePath/).and(sinon.match(/already set as final/))), "warning should be logged when a final path is to be overwritten");
		this.logSpy.resetHistory();

		assert.equal(jQuery.sap.getModulePath("qunit.test.path3"), sPathInput, "Active final flag was handled successfully.");
	});

	QUnit.test("no empty Module URLs allowed", function(assert) {
		jQuery.sap.registerModulePath("qunit.test.path4", "");

		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path4/))), "first path registration should have been logged");
		this.logSpy.resetHistory();

		assert.equal(jQuery.sap.getModulePath("qunit.test.path4"), ".", "Setting empty URL avoided successfully.");
	});

	QUnit.test("removing URL registration", function(assert) {
		// remember URL without registration
		var sUrl = jQuery.sap.getResourcePath("qunit/test/path10/module.js");

		// register and check
		jQuery.sap.registerResourcePath("qunit/test/path10", "http://localhost/");
		assert.strictEqual(jQuery.sap.getResourcePath("qunit/test/path10/module.js"), "http://localhost/module.js", "returned URL should use the configured prefix");

		// deregister and check again
		jQuery.sap.registerResourcePath("qunit/test/path10", null);
		assert.notStrictEqual(jQuery.sap.getResourcePath("qunit/test/path10/module.js"), "http://localhost/module.js", "after deregistering prefix, returned URL should no longer use the configured prefix");
		assert.strictEqual(jQuery.sap.getResourcePath("qunit/test/path10/module.js"), sUrl, "returned URL should be the same as before");
	});

	QUnit.test("removing root registration", function(assert) {
		// remember URL without registration
		var sUrl = jQuery.sap.getResourcePath("x.js");

		// register different baseUrl
		jQuery.sap.registerResourcePath("", "foo/resources/");
		assert.notStrictEqual(jQuery.sap.getResourcePath("x.js"), sUrl, "returned URL should not be the same");

		// try to deregister baseUrl
		jQuery.sap.registerResourcePath("", null);
		assert.strictEqual(jQuery.sap.getResourcePath("x.js"), "./x.js", "returned URL should be the same as before the test");

	});

	QUnit.test("single log entry for redundant calls", function(assert) {
		jQuery.sap.registerModulePath("qunit.test.path8", "/qunit/test/path8");
		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path8/))), "first path registration should have been logged");
		this.logSpy.resetHistory();

		jQuery.sap.registerModulePath("qunit.test.path8", "/qunit/test/path8");
		assert.ok(this.logSpy.neverCalledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path8/))), "redundant call should not be logged");

		jQuery.sap.registerModulePath("qunit.test.path9", "/qunit/test/path9");
		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path9/))), "call with differing args should be logged");

		jQuery.sap.registerModulePath("qunit.test.path8", "/qunit/test/path8");
		assert.ok(this.logSpy.neverCalledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path8/))), "redundant call should not be logged, even after other calls");

		jQuery.sap.registerResourcePath("qunit/test/path8");
		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path8/)).and(sinon.match(/registration removed/))), "cleanup call should be logged");
		this.logSpy.resetHistory();

		jQuery.sap.registerResourcePath("qunit/test/path8");
		assert.ok(this.logSpy.neverCalledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path8/)).and(sinon.match(/registration removed/))), "redundant cleanup call should not be logged");

		jQuery.sap.registerModulePath("qunit.test.path8", "/qunit/test/path8");
		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path8/))), "new call with same url should be logged after cleanup call");
		this.logSpy.resetHistory();

		jQuery.sap.registerModulePath("qunit.test.path8", { url: "/qunit/test/path8", "final": false });
		assert.ok(this.logSpy.neverCalledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path8/))), "redundant call should not be logged, even with different argument syntax");

		jQuery.sap.registerModulePath("qunit.test.path8", { url: "/qunit/test/path8", "final": true });
		assert.ok(this.logSpy.calledWith(Log.Level.INFO, sinon.match(/registerResourcePath/).and(sinon.match(/qunit\/test\/path8/)).and(sinon.match(/final/))), "call with same URL but different final flag should be logged");
	});

	QUnit.test("query parameters should be stripped off", function(assert) {
		var sExpected = "/qunit/test/path/with/query";
		jQuery.sap.registerModulePath("qunit.test.path5", sExpected + "?foo=bar&x=y");

		var sActual = jQuery.sap.getModulePath("qunit.test.path5");
		assert.equal(sActual, sExpected, "Query parameters should be stripped correctly.");
	});

	QUnit.test("hash should be stripped off", function(assert) {
		var sExpected = "/qunit/test/path/with/hash";
		jQuery.sap.registerModulePath("qunit.test.path6", sExpected + "#foo?bar=baz");

		var sActual = jQuery.sap.getModulePath("qunit.test.path6");
		assert.equal(sActual, sExpected, "Hash should be stripped correctly.");
	});

	QUnit.test("query parameters + hash should be stripped off", function(assert) {
		var sExpected = "/qunit/test/path/with/query/and/hash";
		jQuery.sap.registerModulePath("qunit.test.path7", sExpected + "?foo=bar&x=y#foo?bar=baz");

		var sActual = jQuery.sap.getModulePath("qunit.test.path7");
		assert.equal(sActual, sExpected, "Query parameters + hash should be stripped correctly.");
	});

	QUnit.test("getModulePath", function(assert) {
		jQuery.sap.registerModulePath("", "resources/");
		assert.equal(jQuery.sap.getModulePath("sap.ui.Global", ".js"), "resources/sap/ui/Global.js", "standard case 'sap.ui.Global'");
		assert.equal(jQuery.sap.getModulePath("jquery.sap.xml", ".js"), "resources/jquery.sap.xml.js", "special case 'jquery.sap.xml'");
		assert.equal(jQuery.sap.getModulePath("sap.ui.core", "/"), "resources/sap/ui/core/", "folder case");
		assert.equal(jQuery.sap.getModulePath("sap.ui.core", ""), "resources/sap/ui/core", "no suffix");

		jQuery.sap.registerModulePath("sap.ui.Global", "resources/Global/");
		assert.equal(jQuery.sap.getModulePath("sap.ui.Global", ".js"), "resources/Global.js", "special case base name mapping");
		jQuery.sap.registerModulePath("sap.ui.Global", "resources/sap/ui/Global/");

	});

	QUnit.test("getResourcePath", function(assert) {

		jQuery.sap.registerResourcePath("", "resources/");
		assert.equal(jQuery.sap.getResourcePath("sap/ui/Global.js"), "resources/sap/ui/Global.js", "standard case with extension .js: 'sap/ui/Global.js'");
		assert.equal(jQuery.sap.getResourcePath("sap/ui/Global.view.js"), "resources/sap/ui/Global.view.js", "standard case with extension .view.js: 'sap/ui/Global.view.js'");
		assert.strictEqual(jQuery.sap.getResourcePath("sap/ui/core/util/"), "resources/sap/ui/core/util", "packages resolve to a path without a trailing slash");
		assert.strictEqual(jQuery.sap.getResourcePath(""), "resources", "root package resolves to base URL without a trailing slash");

		jQuery.sap.registerResourcePath("sap/ui/Global", "resources/Global");
		assert.equal(jQuery.sap.getResourcePath("sap/ui/Global", ".js"), "resources/Global.js", "special case: mapping of the base name");
		jQuery.sap.registerResourcePath("sap/ui/Global");

		jQuery.sap.registerResourcePath("sap.ext", "resources/some/");
		assert.equal(jQuery.sap.getResourcePath("sap.ext/Global", ".js"), "resources/some/Global.js", "special case folder with dots in folder and single name");
		jQuery.sap.registerResourcePath("sap.ext", "resources/sap.ext/");

		jQuery.sap.registerResourcePath("sap/ui.ext", "resources/some/");
		assert.equal(jQuery.sap.getResourcePath("sap/ui.ext/Global", ".js"), "resources/some/Global.js", "special case: mapping with dots in folder");
		assert.equal(jQuery.sap.getResourcePath("sap/ui.ext.js"), "resources/some.js", "special case: base name mapping with dots in folder");
		assert.equal(jQuery.sap.getResourcePath("sap/ui.ext.view.js"), "resources/some.view.js", "special case: base name mapping with dots in folder and complex extension");
		assert.equal(jQuery.sap.getResourcePath("sap/ui.ext", ".js"), "resources/some.js", "special case base name mapping with dots in folder");
		jQuery.sap.registerResourcePath("sap/ui.ext");

	});

	QUnit.test("toUrl", function(assert) {
		var done = assert.async();

		jQuery.sap.registerResourcePath("", "resources/");

		// toURL special cases
		assert.throws(
			function() {
				sap.ui.require.toUrl('/sap/test');
			},
			Error("The provided argument '/sap/test' may not start with a slash"),
			"absolute path is not supported"
		);
		assert.equal(sap.ui.require.toUrl('sap/test'), "resources/sap/test", "toUrl should support standard path");
		assert.equal(sap.ui.require.toUrl('sap/test/'), "resources/sap/test/", "toUrl leaves trailing slash character intact");
		assert.equal(sap.ui.require.toUrl('sap/test/.library'), "resources/sap/test/.library", "toUrl supports files which start with a dot character");
		assert.equal(sap.ui.require.toUrl('sap/test/..library'), "resources/sap/test/..library", "toUrl supports files which start with two dot character");
		assert.equal(sap.ui.require.toUrl('sap/test/./library'), "resources/sap/test/library", "toUrl supports paths which contain relative segments");
		assert.equal(sap.ui.require.toUrl('sap/test/./library/'), "resources/sap/test/library/", "toUrl supports paths which contain relative segments and trailing slash character");
		assert.equal(sap.ui.require.toUrl('sap/test/./.library'), "resources/sap/test/.library", "toUrl supports paths which contain relative segments and filename starting with dot character");
		assert.equal(sap.ui.require.toUrl('sap/test/../.library'), "resources/sap/.library", "toUrl supports paths which contain relative segments with parent path and filename starting with dot character");
		assert.equal(sap.ui.require.toUrl('sap/test/../library'), "resources/sap/library", "toUrl supports paths which contain relative segments with parent path");
		assert.equal(sap.ui.require.toUrl('sap/test/.././test/./library'), "resources/sap/test/library", "toUrl supports paths which contain relative segments");

		/* relative names are not supported for the root
		assert.equal(sap.ui.require.toUrl('/../.library'), "resources/sap/.library", "toUrl should leave trailing slash intact");
		assert.equal(sap.ui.require.toUrl('../.library'), "resources/sap/.library", "toUrl should leave trailing slash intact");
		assert.equal(sap.ui.require.toUrl('./.library'), "resources/sap/.library", "toUrl should leave trailing slash intact");
		assert.equal(sap.ui.require.toUrl('/./.library'), "resources/sap/.library", "toUrl should leave trailing slash intact");
		*/
		assert.equal(sap.ui.require.toUrl('sap/test/manifest.json'), "resources/sap/test/manifest.json", "toUrl should resolve to the expected URL");
		jQuery.sap.registerResourcePath("sap/test", "some/");
		assert.equal(sap.ui.require.toUrl('sap/test/manifest.json'), "some/manifest.json", "toUrl should resolve to the expected URL");
		jQuery.sap.registerResourcePath("sap/test", null);
		assert.equal(sap.ui.require.toUrl('sap/test/manifest.json'), "resources/sap/test/manifest.json", "toUrl should resolve to the expected URL");

		jQuery.sap.registerResourcePath('fixture', './fixture');
		sap.ui.require(['fixture/contextual-to-url/module1'], function(module1) {
			assert.equal(module1.sibling, './fixture/contextual-to-url/manifest.json', "toUrl should resolve to the expected URL");
			assert.equal(module1.parent, './fixture/manifest.json', "toUrl should resolve to the expected URL");
			assert.equal(module1.grandparent, 'resources/manifest.json', "toUrl should resolve to the expected URL");
			assert.equal(module1.strange, 'resources/other/manifest.json', "toUrl should resolve to the expected URL");
			sap.ui.define("gg/test",['require'], function(require) {
				assert.throws(
					function() {
						require.toUrl('/library');
					},
					Error("The provided argument '/library' may not start with a slash"),
					"toUrl absolute path"
				);
				assert.equal(require.toUrl('./.library/'), "resources/gg/.library/", "toUrl leaves trailing slash intact");
				assert.equal(require.toUrl('./.library'), "resources/gg/.library", "toUrl with relative call same directory, file starting with dot character");
				assert.equal(require.toUrl('./library'), "resources/gg/library", "toUrl with relative call same directory");
				assert.equal(require.toUrl('../library'), "resources/library", "toUrl with relative call directory up");
				assert.equal(require.toUrl('../.library'), "resources/.library", "toUrl with relative call directory up and same directory");
				done();
			});
		});
	});

	//****************************************************
	// lazy stubs
	//****************************************************

	QUnit.module("lazyRequire", {
		beforeEach: function(assert) {

			// an AMD module that defines a simple class
			sap.ui.predefine("sap/test/lazy/MyClass", ["sap/ui/base/ManagedObject"], function(ManagedObject) {
				var MyClass = ManagedObject.extend("sap.test.lazy.MyClass");
				return MyClass;
			});

			// an AMD module that defines a native (Non-UI5) ES5 class whose constructor also can act as a cast
			sap.ui.predefine("sap/test/lazy/ClassWithCastBehavior", ['sap/base/util/ObjectPath'], function(ObjectPath) {
				function ClassWithCastBehavior(arg) {
					if ( !(this instanceof ClassWithCastBehavior) ) {
						return new ClassWithCastBehavior(arg);
					}
					this.value = arg;
				}
				ObjectPath.set("sap.test.lazy.ClassWithCastBehavior", ClassWithCastBehavior);
				return ClassWithCastBehavior;
			});

			// a module implemented with declare/require that defines a simple class
			jQuery.sap.registerPreloadedModules({
				version: "2.0",
				modules: {
					"sap/test/lazy/MyLegacyClass.js":
						"jQuery.sap.getObject('sap.test.lazy.MyLegacyClass', 1);" +
						"jQuery.sap.declare('sap.test.lazy.MyLegacyClass');" +
						"sap.test.lazy.MyLegacyClass = sap.ui.base.ManagedObject.extend('sap.test.lazy.MyLegacyClass');"
				}
			});

			// an AMD module that defines a static utility class
			sap.ui.predefine("sap/test/lazy/MyUtility", [], function() {
				var MyUtility = {
					// simple public method
					show : function() {
					},
					// another public method that relies on a proper 'this'
					hide : function() {
						this._internal();
					},
					_internal : function() {
					}
				};

				// an out-of-line method with name 'sap.test.factory',
				sap.test.factory = function() {
					MyUtility.show();
				};
				return MyUtility;
			}, true);

			// preconditions
			assert.ok(
				!sap.ui.require("sap/test/lazy/MyClass")
				&& !sap.ui.require("sap/test/lazy/MyLegacyClass")
				&& !sap.ui.require("sap/test/lazy/MyUtility")
				&& (sap.test == null || sap.test.lazy === undefined)
				&& (sap.test == null || sap.test.factory === undefined), "precondition: modules not loaded before test");

		},

		afterEach: function(assert) {
			jQuery.sap.unloadResources('sap/test/lazy/ClassWithCastBehavior.js', false, true, true);
			jQuery.sap.unloadResources('sap/test/lazy/MyClass.js', false, true, true);
			jQuery.sap.unloadResources('sap/test/lazy/MyLegacyClass.js', false, true, true);
			jQuery.sap.unloadResources('sap/test/lazy/MyUtility.js', false, true, true);
			delete sap.test.lazy;
			delete sap.test.factory; // don't forget the out-of-line method
		},

		isLazyStub: function isLazyStub(oContext, sProperty, sMethods) {
			if ( sMethods ) {
				oContext = oContext[sProperty];
				var isStub = typeof oContext === 'object';
				return sMethods.split(" ").reduce(function(isStub,name) {
					return isStub && isLazyStub(oContext, name);
				}, isStub);
			}

//				var oDescriptor = Object.getOwnPropertyDescriptor(oContext, sProperty);
//				return !!(oDescriptor && oDescriptor.get && oDescriptor.set);
			return !!(oContext && typeof oContext[sProperty] === 'function' && oContext[sProperty]._sapUiLazyLoader === true);
		}

	});

	QUnit.test("simple class scenario, read first", function(assert) {
		var oRequireSpy, oResult;

		sap.ui.lazyRequire('sap.test.lazy.MyClass');

		assert.ok(!sap.ui.require('sap/test/lazy/MyClass'), "module still not loaded after creation of lazy stub");
		assert.ok(sap.test && typeof sap.test.lazy === 'object', "lazy loader did create the parent namespace sap.test.lazy");
		assert.ok(this.isLazyStub(sap.test.lazy, 'MyClass'), "lazy loader defined property 'MyClass' with get and set methods");

		// read access first
		oRequireSpy = this.spy(sap.ui, 'requireSync');
		oResult = new sap.test.lazy.MyClass();
		sinon.assert.calledWith(oRequireSpy, 'sap/test/lazy/MyClass');
		assert.ok(sap.ui.require('sap/test/lazy/MyClass'), "read access should load the expected module");
		assert.ok(oResult instanceof sap.ui.base.ManagedObject && oResult.getMetadata().getName() === 'sap.test.lazy.MyClass', "read access should return the expected module content");
		assert.ok(!this.isLazyStub(sap.test.lazy, 'MyClass'), "the property must no longer be a lazy stub");
		oRequireSpy.restore();

		// second read access must no longer require module
		oRequireSpy = this.spy(jQuery.sap, 'require');
		oResult = sap.test.lazy.MyClass;
		sinon.assert.neverCalledWith(oRequireSpy, 'sap.test.lazy.MyClass');
		oRequireSpy.restore();

	});

	QUnit.test("simple class scenario, write first", function(assert) {

		sap.ui.lazyRequire('sap.test.lazy.MyClass');

		assert.ok(this.isLazyStub(sap.test.lazy, 'MyClass'), "lazy loader created a stub for the property MyClass");

		// explicitly require the module
		jQuery.sap.require('sap.test.lazy.MyClass');

		assert.ok(!this.isLazyStub(sap.test.lazy, 'MyClass'), "the property must no longer be a lazy stub");

		var oRequireSpy = this.spy(jQuery.sap, 'require');
		var oResult = new sap.test.lazy.MyClass();
		sinon.assert.neverCalledWith(oRequireSpy, 'sap.test.lazy.MyClass');
		oRequireSpy.restore();
		assert.ok(oResult instanceof sap.ui.base.ManagedObject && oResult.getMetadata().getName() === 'sap.test.lazy.MyClass', "read access should return the expected module content");

	});

	QUnit.test("simple static class scenario", function(assert) {

		sap.ui.lazyRequire('sap.test.lazy.MyUtility', 'show hide');

		assert.ok(sap.test && typeof sap.test.lazy === 'object', "lazy loader did create the parent namespace sap.test.lazy");
		assert.ok(this.isLazyStub(sap.test.lazy, 'MyUtility', 'show hide'), "lazy loader created a stub for the namespace");

		sap.test.lazy.MyUtility.show();

		assert.ok(sap.ui.require('sap/test/lazy/MyUtility'), "read access should load the expected module");

	});

	QUnit.test("complex static class scenario", function(assert) {

		sap.ui.lazyRequire('sap.test.lazy.MyUtility', 'show hide');

		assert.ok(sap.test && typeof sap.test.lazy === 'object', "lazy loader did create the parent namespace sap.test.lazy");
		assert.ok(this.isLazyStub(sap.test.lazy, 'MyUtility', 'show hide'), "lazy loader created a stub for the namespace");

		// method hide() calls an internal method via 'this', so the right context must be set when invoking 'show'
		sap.test.lazy.MyUtility.hide();

	});

	QUnit.test("out-of-line method (factory)", function(assert) {

		sap.ui.lazyRequire('sap.test', 'factory', 'sap.test.lazy.MyUtility');

		assert.ok(!sap.ui.require('sap/test/lazy/MyUtility'), "module still not loaded after creation of lazy stub");
		assert.ok(this.isLazyStub(sap.test, 'factory'), "lazy loader created a stub for the namespace");

		// invoke out-of-line method, should load the right module
		sap.test.factory(0);

		assert.ok(sap.ui.require("sap/test/lazy/MyUtility"), "read access should load the expected module");

	});

	QUnit.test("class that reads global property before writing it", function(assert) {

		// this module reads the global property before it defines it
		// with a bad implementation of lazyRequire, this could result in an endless recursion
		sap.ui.lazyRequire('sap.test.lazy.MyLegacyClass');

		new sap.test.lazy.MyLegacyClass();

		assert.ok(sap.ui.require('sap/test/lazy/MyLegacyClass'), "read access should load the expected module");

	});

	QUnit.test("wrong usage", function(assert) {

		// we do a lazyRequire for an out-of-line method that doesn't exist
		// So loading the module will not properly replace the lazy stub.
		// this needs to be detected and reported
		sap.ui.lazyRequire('sap.test', 'noSuchFactory', 'sap.test.lazy.MyUtility');

		assert.ok(this.isLazyStub(sap.test, 'noSuchFactory'), "lazy loader created a stub for the namespace");
		var Log = sap.ui.require("sap/base/Log");
		assert.ok(Log, "Log module should be available");
		var oLogSpy = this.spy(Log, 'error');
		var raised = false;
		try {
			sap.test.noSuchFactory();
		} catch (error) {
			raised = true;
		}
		assert.ok(raised, "read access doesn't resolve the property, but throws an error");
		//assert.equal(sap.test.noSuchFactory, undefined, "read access doesn't resolve the property, but writes an error"); // executed twice by intention!
		//sinon.assert.calledOnce(oLogSpy);
		oLogSpy.restore();

		assert.ok(sap.ui.require('sap/test/lazy/MyUtility'), "read access should load the expected module");

		delete sap.test.noSuchFactory;

	});

	QUnit.test("constructor with new", function(assert) {

		var Log = sap.ui.require("sap/base/Log");
		assert.ok(Log, "Log module should be available");
		this.spy(Log, 'error');

		Log.error.resetHistory();
		sap.ui.lazyRequire('sap.test.lazy.MyClass');
		new sap.test.lazy.MyClass();
		assert.ok(!sap.ui.lazyRequire._isStub("sap.test.lazy.MyClass"), "lazy stub has been resolved");
		assert.equal(Log.error.callCount, 0, "No error was logged");

		Log.error.resetHistory();
		sap.ui.lazyRequire('sap.test.lazy.ClassWithCastBehavior');
		new sap.test.lazy.ClassWithCastBehavior(5);
		assert.ok(!sap.ui.lazyRequire._isStub("sap.test.lazy.ClassWithCastBehavior"), "lazy stub has been resolved");
		assert.equal(Log.error.callCount, 0, "No error was logged");

	});

	QUnit.test("constructor without new", function(assert) {

		var Log = sap.ui.require("sap/base/Log");
		assert.ok(Log, "Log module should be available");
		this.spy(Log, 'error');

		Log.error.resetHistory();
		sap.ui.lazyRequire('sap.test.lazy.MyClass');
		sap.test.lazy.MyClass();
		assert.ok(!sap.ui.lazyRequire._isStub("sap.test.lazy.MyClass"), "lazy stub has been resolved");
		assert.ok(Log.error.calledOnce, "One error was logged");
		assert.ok(Log.error.calledWithMatch(sinon.match(/called without "?new"? operator/)), "Error message mentions 'new' operator");

		Log.error.resetHistory();
		sap.ui.lazyRequire('sap.test.lazy.ClassWithCastBehavior');
		var result = sap.test.lazy.ClassWithCastBehavior(5);
		assert.ok(!sap.ui.lazyRequire._isStub("sap.test.lazy.ClassWithCastBehavior"), "lazy stub has been resolved");
		assert.equal(Log.error.callCount, 0, "No error was logged");
		assert.ok(result instanceof sap.test.lazy.ClassWithCastBehavior, "Cast behavior works");

	});

});