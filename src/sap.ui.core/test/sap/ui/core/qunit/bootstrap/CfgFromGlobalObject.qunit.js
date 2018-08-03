/*global QUnit */
(function() {
	"use strict";

	QUnit.module("Configuration From Global Object");

	QUnit.test("Settings", function(assert) {
		var oCfg = new sap.ui.core.Configuration();

		// compare values where possible
		assert.equal(oCfg.theme, "fantasy", "theme");
		assert.equal(oCfg.language, "klingon", "language");
		assert.equal(oCfg.accessibility, true, "accessibility");
		assert.equal(oCfg.animation, false, "animation");
		assert.equal(oCfg.rtl, true, "rtl");
		assert.equal(oCfg.debug, true, "debug");
		assert.equal(oCfg.noConflict, true, "noConflict");
		assert.equal(oCfg.trace, true, "trace");
		// Note: libs and modules cannot be checked in that simple way, see below
		assert.deepEqual(oCfg.areas, ["area-51", "no-go"], "areas");
		assert.equal(typeof oCfg.onInit, "function", "onInit");
		assert.equal(oCfg.ignoreUrlParams, true, "ignoreUrlParams");

		// libs must have been converted and prepended to modules
		assert.deepEqual(oCfg.modules, ["sap.m.library", "sap.m.Button"], "modules and libraries");

		// init function must have been called
		assert.strictEqual(window["I was here"], "u.g.a.d.m.k.", "onInit hook has not been called");

		assert.ok(sap.ui.require("sap/m/Button"), "configured module has been loaded");
	});

	QUnit.test("jQuery and $", function(assert) {
		// we configured noConflict=true, so $ shouldn't be the same as jQuery
		assert.ok(window.jQuery, "window.jQuery is available");
		assert.ok(!window.$ || window.$ !== window.jQuery, "window.$ not available or not the same as jQuery");
	});

}());