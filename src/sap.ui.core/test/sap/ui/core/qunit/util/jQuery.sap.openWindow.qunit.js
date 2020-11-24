/*global QUnit */
sap.ui.define(['jquery.sap.script'], function(jQuery) {
	"use strict";
	QUnit.module("jQuery.sap.openWindow");

	QUnit.test("Noopener noreferrer", function(assert) {
		assert.equal(jQuery.sap.openWindow("https://www.sap.com", "newWindow"), null, "Reference to the newly open window object is" +
			"broken");
	});
});