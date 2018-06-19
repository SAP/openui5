/*global QUnit */
sap.ui.define(["sap/ui/util/ActivityDetection"], function(ActivityDetection) {
	"use strict";
	QUnit.module("sap/ui/util/ActivityDetection");

	QUnit.test("isActive check", function(assert) {
		assert.ok(ActivityDetection.isActive(), "ActivityDetection should be active by default");
	});
});