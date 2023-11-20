/*global QUnit */
sap.ui.define(["sap/base/strings/escapeRegExp"], function(escapeRegExp) {
	"use strict";

	QUnit.module("EscapeRegExp");

	QUnit.test("escapeRegExp", function (assert) {
		assert.equal(escapeRegExp("ab.c"), "ab\\.c", "Dot character gets escaped");
	});
});
