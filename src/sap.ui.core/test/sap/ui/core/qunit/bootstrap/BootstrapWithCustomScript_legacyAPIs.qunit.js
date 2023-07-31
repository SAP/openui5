/*global QUnit */
(function(){
	"use strict";

	var coreReady = false;

	QUnit.test("After loading the minimal bootstrap code...", function(assert) {
		assert.strictEqual(typeof sap.ui.define, "function", "...function sap.ui.define should exist");
		assert.strictEqual(typeof sap.ui.require, "function", "...function sap.ui.require should exist");
		assert.strictEqual(typeof sap.ui.Device, "undefined", "...utility object sap.ui.Device should not yet exist");
		assert.strictEqual(typeof sap.ui.base, "undefined", "...but namespace sap.ui.base should not yet exist"); // Note: QUnitUtils would load DataType!
		assert.strictEqual(typeof sap.ui.core, "undefined", "...and sap.ui.core should not yet exist");
		assert.strictEqual(typeof sap.ui.model, "undefined", "...and namespace sap.ui.model should not yet exist");
		assert.strictEqual(typeof sap.ui.getCore, "undefined", "...and function sap.ui.getCore should not yet exist");
		assert.strictEqual(typeof sap.ui.version, "undefined", "...and sap.ui.version should not yet exist");
		assert.strictEqual(typeof sap.ui.layout, "undefined", "...also library sap.ui.layout should not yet exist");
		assert.strictEqual(typeof sap.m, "undefined", "...also library sap.m should not yet exist");
	});

	QUnit.test("When sap/ui/core/Core has been required", function(assert) {
		var done = assert.async();
		sap.ui.require(['sap/ui/core/Core'], function(Core) {
			assert.strictEqual(typeof sap.ui.Device, "object", "...utility object sap.ui.Device should exist");
			assert.strictEqual(typeof sap.ui.base, "object", "...the namespace sap.ui.base should exist");
			assert.strictEqual(typeof sap.ui.core, "object", "...the namespace sap.ui.core should exist");
			assert.strictEqual(typeof sap.ui.model, "object", "...the namespace sap.ui.model should exist (status quo, not mandatory)");
			assert.strictEqual(typeof sap.ui.getCore, "function", "...the function sap.ui.getCore should exist");
			Core.ready().then(function() {
				coreReady = true;
			});
			setTimeout(function() {
				assert.notOk(coreReady, "...but Core should not have fired init event");
				assert.strictEqual(typeof sap.m, "undefined", "...and library namespace sap.m should not yet exist");
				assert.strictEqual(typeof sap.ui.layout, "undefined", "...and library namespace sap.ui.layout should not yet exist");
				done();
			}, 500);
		});
	});

	QUnit.test("When boot() has been called on the Core...", function(assert) {
		var done = assert.async();
		sap.ui.require(['sap/ui/core/Core'], function(Core) {
			Core.ready().then(function() {
				assert.ok(true, "...then the Core should fire the init event");
				assert.strictEqual(typeof sap.m, "object", "...the library sap.m should have been loaded");
				assert.strictEqual(typeof sap.ui.layout, "object", "...the library sap.ui.layout should have been loaded");
				done();
			});
			Core.boot();
		});
	});

}());