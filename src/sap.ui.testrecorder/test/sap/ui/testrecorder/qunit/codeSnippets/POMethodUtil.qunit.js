/* global QUnit */

sap.ui.define([
	"sap/ui/testrecorder/codeSnippets/POMethodUtil",
	"sap/ui/testrecorder/DialectRegistry",
	"sap/ui/testrecorder/Dialects"
], function (POMethodUtil, DialectRegistry, Dialects) {
	"use strict";

	QUnit.module("POMethodUtil", {
		beforeEach: function () {
			// default is UIVeri5
			this.initialDialect = DialectRegistry.getActiveDialect();
			this.aSnippets = [
				"element(by.control({\n" +
				"    id: \"container-cart---homeView--searchField1\"\n" +
				"}));\n" +
				"element(by.control({\n" +
				"    id: \"container-cart---homeView--searchField2\"\n" +
				"}));"
			];
		},
		afterEach: function () {
			DialectRegistry.setActiveDialect(this.initialDialect);
		}
	});

	QUnit.test("Should wrap as PO method when setting is enabled - action", function (assert) {
		var sResultMulti = POMethodUtil.getPOMethod(this.aSnippets, {
			formatAsPOMethod: true,
			multipleSnippets: true,
			action: "PRESS"
		});
		assert.ok(sResultMulti.startsWith("iInteractWithTheControls: function () {\n"), "Should include method call - multiple snippets");

		var sResultSingle = POMethodUtil.getPOMethod(this.aSnippets, {
			formatAsPOMethod: true,
			action: "PRESS"
		});
		assert.ok(sResultSingle.startsWith("iPressTheControl: function () {\n"), "Should include method call - single snippet");
	});

	QUnit.test("Should wrap as PO method when setting is enabled - assertion", function (assert) {
		var sResultMulti = POMethodUtil.getPOMethod(this.aSnippets, {
			formatAsPOMethod: true,
			multipleSnippets: true
		});
		assert.ok(sResultMulti.startsWith("iAssertTheUIState: function () {\n"), "Should include method call - multiple snippets");

		var sResultSingle = POMethodUtil.getPOMethod(this.aSnippets, {
			formatAsPOMethod: true
		});
		assert.ok(sResultSingle.startsWith("iAssertTheControlState: function () {\n"), "Should include method call - single snippet");
	});

	QUnit.test("Should not wrap as PO method when setting is disabled", function (assert) {
		var sResultMulti = POMethodUtil.getPOMethod(this.aSnippets, {
			formatAsPOMethod: false,
			multipleSnippets: true
		});
		assert.ok(sResultMulti.startsWith("element(by.control({\n"), "Should not include method call - multiple snippets");

		var sResultSingle = POMethodUtil.getPOMethod(this.aSnippets, {
			formatAsPOMethod: false
		});
		assert.ok(sResultSingle.startsWith("element(by.control({\n"), "Should not include method call - single snippet");

	});
});
