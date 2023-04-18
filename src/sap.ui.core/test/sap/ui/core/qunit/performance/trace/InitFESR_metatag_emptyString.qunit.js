/* global QUnit */
sap.ui.define([], function () {
	"use strict";

	QUnit.module("FESR");

	QUnit.test("meta tag", function(assert) {
		var FESR = sap.ui.require("sap/ui/performance/trace/FESR");
		assert.ok(FESR, "FESR module has been loaded");
		assert.notOk(FESR.getActive(), "FESR is not active");
		assert.strictEqual(FESR.getBeaconURL(), undefined,  "Beacon URL has not been set");
	});

});