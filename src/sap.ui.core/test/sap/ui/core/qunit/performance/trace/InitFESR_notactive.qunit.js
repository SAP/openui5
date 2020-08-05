/* global QUnit */
sap.ui.define(function () {
	"use strict";
	QUnit.module("FESR");

	QUnit.test("not active", function(assert) {
		var FESR = sap.ui.require("sap/ui/performance/trace/FESR");
		assert.ok(FESR, "FESR module has been loaded");
		assert.notOk(FESR.getActive(), "FESR is not active");
	});
});