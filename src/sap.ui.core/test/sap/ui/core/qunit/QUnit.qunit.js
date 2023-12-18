/* global QUnit, require */
sap.ui.define(function() {
	"use strict";

	// make sure that the cleanup issue will not report an error!
	QUnit.config.ignoreCleanupFailure = true;

	QUnit.module("window.assert");

	/**
	 * @deprecated global assert is no longer supported by qunit-junit in 2.0
	 */
	QUnit.test("set by qunit-junit (clean)", function(assert) {
		assert.equal(typeof window.assert, "object", "window.assert is an object!");
	});

	QUnit.test("overridden by external script (jQuery.sap.require)", function(assert) {
		var done = assert.async();
		sap.ui.require(["testdata/core/QUnitExt"], function(){
			assert.equal(typeof window.assert, "function", "window.assert is a function!");
			done();
		});
	});

	QUnit.test("overridden by external script (requirejs)", function(assert) {
		var done = assert.async();
		sap.ui.loader.config({
			noConflict: true
		});

		sap.ui.require(["sap/ui/thirdparty/require"], function () {
			require.config({
				paths: {
					"testdata/core": "test-resources/sap/ui/core/qunit"
				}
			});
			require(["testdata/core/QUnitExt"], function(QUnitExt) {
				assert.ok(typeof window.assert === "function", "window.assert is a function!");
				sap.ui.loader.config({
					noConflict: false
				});
				done();
			});
		});
	});

	/**
	 * @deprecated global assert is no longer cleaned-up by qunit-junit in 2.0
	 */
	QUnit.test("set by qunit-junit (polluted)", function(assert) {
		assert.ok(typeof window.assert === "object", "window.assert is an object!");
	});

});