sap.ui.define(["sap/ui/fl/support/apps/contentbrowser/utils/HtmlEscapeUtils"],
	function (HtmlEscapeUtils){
	"use strict";

	QUnit.module("HtmlEscapeUtils", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("repaces all occurrences of a pattern within a string", function(assert) {
		var sString = "thisSPACEisSPACEaSPACEtextSPACEwithSPACEspacesSPACEwhichSPACEwereSPACEreplaced";
		var sExpectedString = "this is a text with spaces which were replaced";
		var sModifiedString = HtmlEscapeUtils._replaceAll(sString, "SPACE", " ");

		assert.equal(sModifiedString, sExpectedString);
	});

	QUnit.test("escapes slashes", function(assert) {
		var sString = "/a/b/";
		var sExpectedString = "%2Fa%2Fb%2F";
		var sModifiedString = HtmlEscapeUtils.escapeSlashes(sString);

		assert.equal(sModifiedString, sExpectedString);
	});

	QUnit.test("unescapes slashes", function(assert) {
		var sString = "%2Fa%2Fb%2F";
		var sExpectedString = "/a/b/";
		var sModifiedString = HtmlEscapeUtils.unescapeSlashes(sString);

		assert.equal(sModifiedString, sExpectedString);
	});
});