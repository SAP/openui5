/* global QUnit */
sap.ui.define([], function () {
	"use strict";

	QUnit.module("FESR");

	QUnit.test("meta tag", function(assert) {
		var FESR = sap.ui.require("sap/ui/performance/trace/FESR");
		assert.notOk(FESR, "FESR module has not been loaded");
	});

});