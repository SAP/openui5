/* global QUnit */
sap.ui.define(function () {
	"use strict";

	QUnit.module("FESR");

	QUnit.test("meta tag", function(assert) {
		var FESR = sap.ui.require("sap/ui/performance/trace/FESR");
		assert.ok(FESR, "FESR module has been loaded");
		assert.ok(FESR.getActive(), "FESR is active");
		assert.notOk(FESR.getBeaconURL(), "Beacon URL has not been set");
	});

});