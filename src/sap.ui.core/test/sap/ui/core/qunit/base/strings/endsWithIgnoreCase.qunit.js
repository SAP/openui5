/*global QUnit */
sap.ui.define(["sap/base/strings/endsWithIgnoreCase", "sap/ui/thirdparty/es6-string-methods"], function(endsWithIgnoreCase) {
	"use strict";

	QUnit.test("EndsWithIgnoreCaseOk", function (assert) {
		assert.ok(endsWithIgnoreCase("abcdE", "cDe"), "'abcdE' ends with 'cDe'");
		assert.ok(endsWithIgnoreCase("abcdE", "cDe"), "'abcdE' does end with 'cDe'");
		assert.notOk((endsWithIgnoreCase("abcdE", "cE")), "'abcdE' doesn't end with 'cE'");

		assert.notOk(endsWithIgnoreCase("abcdE", ""), "'abcdE' doesn't end with ''");
		assert.notOk(endsWithIgnoreCase("abcdE", 10), "'abcdE' doesn't end with '10'");
		assert.notOk(endsWithIgnoreCase("abcdE", null), "'abcdE' doesn't end with null");
	});

	QUnit.test("EndsWithIgnoreCaseFailed", function (assert) {
		assert.throws(function() {
			endsWithIgnoreCase(null, "abC");
		}, "exception expected");
	});
});
