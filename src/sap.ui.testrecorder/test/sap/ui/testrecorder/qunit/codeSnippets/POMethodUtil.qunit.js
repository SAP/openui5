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

	QUnit.test("Should wrap as PO method when setting is enabled", function (assert) {
		var sResult = POMethodUtil.getPOMethod(this.aSnippets, {
			formatAsPOMethod: true
		});
		assert.ok(sResult.startsWith("<iDoAction>: function () {\n"), "Should include method call");
	});

	QUnit.test("Should not wrap as PO method when setting is disabled", function (assert) {
		var sResult = POMethodUtil.getPOMethod(this.aSnippets, {
			formatAsPOMethod: false
		});
		assert.ok(sResult.startsWith("element(by.control({\n"), "Should not include method call");
	});

	QUnit.test("Should not do anything in Raw dialect", function (assert) {
		DialectRegistry.setActiveDialect(Dialects.RAW);
		var sResult = POMethodUtil.getPOMethod(this.aSnippets, {
			formatAsPOMethod: false
		});
		assert.ok(sResult.startsWith("element(by.control({\n"), "Should not include method call");
	});
});
