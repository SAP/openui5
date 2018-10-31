/*global QUnit */
sap.ui.define(["sap/base/strings/camelize"], function(camelize) {
	"use strict";

	QUnit.module("Camelize");

	QUnit.test("camelize", function(assert) {
		assert.expect(2);

		var sCamelCase = camelize("this-is-a-camel-case-string");
		assert.equal(sCamelCase, "thisIsACamelCaseString", "Camelize function returns the right value");

		sCamelCase = camelize("this-is-an-1amel-case-ütring");
		assert.equal(sCamelCase, "thisIsAn1amelCaseÜtring", "Camelize function returns the right value for numeric and umlauts chars");
	});
});