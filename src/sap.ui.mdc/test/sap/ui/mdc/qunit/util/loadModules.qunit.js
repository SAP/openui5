/*!
 * ${copyright}
 */

/* global QUnit */

 sap.ui.define([
	"sap/ui/mdc/util/loadModules"
 ], function(
	loadModules
 ) {
	"use strict";

	QUnit.test("it should load the given modules in order (initial loading)", function(assert) {

		// arrange
		const done = assert.async();
		const aModulePaths = [
			"sap/base/strings/capitalize",
			"sap/base/strings/toHex"
		];

		// act
		const oLoadModulesPromise = loadModules(aModulePaths);

		// arrange
		oLoadModulesPromise.then(function onModulesLoaded(aModules) {
			const capitalize = aModules[0],
				toHex = aModules[1];

			// assert
			const MESSAGE = "the correct module should be loaded";
			assert.strictEqual(capitalize("lorem"), "Lorem", MESSAGE);
			assert.strictEqual(toHex(10, 2), "0a", MESSAGE);
			assert.strictEqual(aModules.length, 2, "the exact number of modules should be loaded");
			done();
		}).catch(function onModulesLoadedFailed() {
			assert.notOk(true, "the modules could not be loaded");
		});
	});

	QUnit.test("it should load the given modules in order (cached version)", function(assert) {

		// arrange
		const done = assert.async();
		const aModulePaths = [
			"sap/base/strings/camelize",
			"sap/base/strings/hash"
		];
		const MESSAGE = "the correct module should be loaded";

		// act
		const oLoadModulesPromise = loadModules(aModulePaths);

		// assert
		function onModulesLoaded(aModules) {
			let bModulesLoadedSync = false;

			const camelize = aModules[0],
				hash = aModules[1];

			assert.strictEqual(camelize("lorem-ipsum"), "loremIpsum", MESSAGE);
			assert.strictEqual(hash("a"), 97, MESSAGE);
			assert.strictEqual(aModules.length, 2, "the exact number of modules should be loaded");

			loadModules(aModulePaths).then(function(aModules) {
				bModulesLoadedSync = true;
				assert.strictEqual(camelize("lorem-ipsum"), "loremIpsum", MESSAGE);
				assert.strictEqual(hash("a"), 97, MESSAGE);
				assert.strictEqual(aModules.length, 2, "the exact number of modules should be loaded");
				done();
			}).catch(onModulesLoadedFailed);

			assert.ok(bModulesLoadedSync,
				"the second onModulesLoaded callback function should be called sync " +
				"(to prevent microtasks scheduling) when the modules are already loaded");
		}

		function onModulesLoadedFailed() {
			assert.notOk(true, "the modules could not be loaded");
		}

		oLoadModulesPromise.then(onModulesLoaded).catch(onModulesLoadedFailed);
	});

	QUnit.test("it should load the given module (initial loading)", function(assert) {

		// arrange
		const done = assert.async();

		// act
		const oLoadModulesPromise = loadModules("sap/base/strings/camelize");

		// arrange
		oLoadModulesPromise.then(function onModulesLoaded(aModules) {
			const camelize = aModules[0];

			// assert
			const MESSAGE = "the correct module should be loaded";
			assert.strictEqual(camelize("lorem-ipsum"), "loremIpsum", MESSAGE);
			assert.strictEqual(aModules.length, 1, "only one module should be loaded");
			done();
		}).catch(function onModulesLoadedFailed() {
			assert.notOk(true, "the module could not be loaded");
		});
	});

});
