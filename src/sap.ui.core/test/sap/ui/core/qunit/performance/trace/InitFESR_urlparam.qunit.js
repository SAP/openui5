/* global QUnit */
sap.ui.define(function () {
	"use strict";

	QUnit.module("FESR");

	QUnit.test("url param", function(assert) {
		var FESR = sap.ui.require("sap/ui/performance/trace/FESR");
		assert.ok(FESR, "FESR module has been loaded");
		assert.ok(FESR.getActive(), "FESR is active");
	});
});