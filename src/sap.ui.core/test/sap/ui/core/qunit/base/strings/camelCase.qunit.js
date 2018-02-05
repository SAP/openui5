/*global QUnit */
sap.ui.define(["sap/base/strings/camelCase"], function(camelCase) {
	"use strict";

	QUnit.test("CamelCase", function(assert) {
		assert.expect(2);

		var sCamelCase = camelCase("this-is-an-camel-case-string");
		assert.equal(sCamelCase, "thisIsAnCamelCaseString", "CamelCase function returns the right value");

		sCamelCase = camelCase("this-is-an-1amel-case-ütring");
		assert.equal(sCamelCase, "thisIsAn1amelCaseÜtring", "CamelCase function returns the right value for numeric and umlauts chars");
	});
});