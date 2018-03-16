/*global QUnit */
sap.ui.define(["sap/ui/ActivityDetection"], function(ActivityDetection) {
	"use strict";
	QUnit.module("sap.ui.ActivityDetection");

	QUnit.test("jQuery.browser", function(assert) {
		assert.ok(ActivityDetection.isActive(), "ActivityDetection should be active by default");
	});
});