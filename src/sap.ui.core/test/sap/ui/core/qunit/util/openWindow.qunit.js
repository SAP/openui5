/*global QUnit */
sap.ui.define(["sap/ui/util/openWindow"], function(openWindow) {
	"use strict";
	QUnit.module("sap/ui/util/openWindow");

	QUnit.test("Noopener noreferrer", function(assert) {
		assert.equal(openWindow("https://www.sap.com", "newWindow"), null, "Reference to the newly open window object is" +
			"broken");
	});
});