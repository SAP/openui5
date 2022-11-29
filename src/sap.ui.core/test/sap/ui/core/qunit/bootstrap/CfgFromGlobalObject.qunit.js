/*global QUnit */
sap.ui.define([
	"sap/ui/core/Configuration"
], function(Configuration) {
	"use strict";

	QUnit.module("Configuration From Global Object");

	QUnit.test("Settings", function(assert) {
		// compare values where possible
		assert.equal(Configuration.getTheme(), "fantasy", "theme");
		assert.equal(Configuration.getLanguage(), "klingon", "language");
		assert.equal(Configuration.getAccessibility(), true, "accessibility");
		assert.equal(Configuration.getAnimationMode(), Configuration.AnimationMode.minimal, "animation mode set to 'minimal'");
		assert.equal(Configuration.getRTL(), true, "rtl");
		assert.equal(Configuration.getDebug(), true, "debug");
		assert.equal(Configuration.getValue("noConflict"), true, "noConflict");
		assert.equal(Configuration.getTrace(), true, "trace");
		// Note: libs and modules cannot be checked in that simple way, see below
		assert.deepEqual(Configuration.getValue("areas"), ["area-51", "no-go"], "areas");
		assert.equal(typeof Configuration.getValue("onInit"), "function", "onInit");
		assert.equal(Configuration.getValue("ignoreUrlParams"), true, "ignoreUrlParams");

		// libs must have been converted and prepended to modules
		assert.deepEqual(Configuration.getValue("modules"), [ "sap.m.library", "sap.m.Button" ], "modules and libraries");

		// init function must have been called
		assert.strictEqual(window["I was here"], "u.g.a.d.m.k.", "onInit hook has not been called");

		assert.ok(sap.ui.require("sap/m/Button"), "configured module has been loaded");
	});

	QUnit.test("jQuery and $", function(assert) {
		// we configured noConflict=true, so $ shouldn't be the same as jQuery
		assert.ok(window.jQuery, "window.jQuery is available");
		assert.ok(!window.$ || window.$ !== window.jQuery, "window.$ not available or not the same as jQuery");
	});

});