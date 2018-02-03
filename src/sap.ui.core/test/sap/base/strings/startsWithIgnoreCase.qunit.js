/*global QUnit */
sap.ui.define(["sap/base/strings/startsWithIgnoreCase", "sap/ui/thirdparty/es6-string-methods"], function(startsWithIgnoreCase) {
	"use strict";

	QUnit.test("StartsWithIgnoreCaseOk", function (assert) {
		assert.ok(startsWithIgnoreCase("abcde", "Abc"), "'abcde' starts with 'abc'");
		assert.ok(startsWithIgnoreCase("abCde", "aBCd"), "'abCde' starts with 'aBCd'");
		assert.ok(startsWithIgnoreCase("abC de", "abc D"), "'abC de' starts with 'abc D'");
		assert.ok(startsWithIgnoreCase("abC de", "aBc "), "'abC de' starts with 'aBc '");
		assert.notOk(startsWithIgnoreCase("abCde", "aC"), "'abCde' doesn't start with 'aC'");

		assert.notOk(startsWithIgnoreCase("abcdE", ""), "'abcdE' doesn't start with ''");
		assert.notOk(startsWithIgnoreCase("abcdE", 10), "'abcdE' doesn't start with '10'");
		assert.notOk(startsWithIgnoreCase("abcdE", null), "'abcdE' doesn't start with null");
	});

	QUnit.test("StartsWithIgnoreCaseFailed", function (assert) {

		assert.throws(function() {
			startsWithIgnoreCase(null, "aBc");
		}, "exception expected");
	});
});
