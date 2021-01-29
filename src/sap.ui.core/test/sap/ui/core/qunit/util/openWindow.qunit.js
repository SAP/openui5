/*global QUnit */
sap.ui.define(["sap/ui/util/openWindow"], function(openWindow) {
	"use strict";
	QUnit.module("sap/ui/util/openWindow");

	QUnit.test("Noopener noreferrer", function(assert) {
		var oRes = openWindow("https://www.sap.com", "newWindow");
		assert.ok(oRes === null, "Reference to the newly open window object is broken");
	});
});