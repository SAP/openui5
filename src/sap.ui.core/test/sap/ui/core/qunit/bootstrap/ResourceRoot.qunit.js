/*global QUnit */
(function() {
	"use strict";

	QUnit.test("Check Resource Root", function(assert) {
		/* check that SAPUI5 has been loaded */
		assert.ok(window.jQuery, "jQuery has been loaded");
		assert.ok(jQuery.sap, "jQuery.sap namespace exists");
		assert.ok(window.sap, "sap namespace exists");
		assert.ok(sap.ui, "sap.ui namespace exists");
		assert.ok(typeof sap.ui.getCore === "function", "sap.ui.getCore exists");
		assert.ok(sap.ui.getCore(), "sap.ui.getCore() returns a value");

		var tag = document.querySelector("[data-expected-root]");
		var expected = tag && tag.getAttribute("data-expected-root");
		assert.notEqual(expected, null, "Test Page must contain a 'data-expected-root' attribute");
		assert.equal(jQuery.sap.getModulePath("", "/"), expected);
	});

}());
