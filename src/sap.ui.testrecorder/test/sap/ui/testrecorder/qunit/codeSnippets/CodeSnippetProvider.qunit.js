/* global QUnit */

sap.ui.define([
	"sap/ui/testrecorder/codeSnippets/CodeSnippetProvider",
	"sap/ui/testrecorder/DialectRegistry",
	"sap/ui/testrecorder/Dialects"
], function (ControlSnippetProvider, DialectRegistry, Dialects) {
	"use strict";

	QUnit.module("CodeSnippetProvider", {
		beforeEach: function () {
			// default is UIVeri5
			this.initialDialect = DialectRegistry.getActiveDialect();
			this.mSelector = {
				id: "container-cart---homeView--searchField1"
			};
		},
		afterEach: function () {
			DialectRegistry.setActiveDialect(this.initialDialect);
		}
	});

	QUnit.test("Should get UIVeri5 snippet", function (assert) {
		var fnDone = assert.async();
		ControlSnippetProvider.getSnippet({
			controlSelector: this.mSelector
		}).then(function (sResult) {
			assert.ok(sResult.startsWith("element(by.control("), "Should include waitFor call");
			assert.ok(!sResult.match(".click()"), "Should not include empty action");
			return ControlSnippetProvider.getSnippet({
				controlSelector: this.mSelector,
				action: "PRESS"
			});
		}.bind(this)).then(function (sResult) {
			assert.ok(sResult.match(".click()"), "Should include action");
		}).finally(fnDone);
	});

	QUnit.test("Should get OPA5 snippet", function (assert) {
		DialectRegistry.setActiveDialect(Dialects.OPA5);

		var fnDone = assert.async();
		ControlSnippetProvider.getSnippet({
			controlSelector: this.mSelector
		}).then(function (sResult) {
			assert.ok(sResult.startsWith("this.waitFor("), "Should include waitFor call");
			assert.ok(!sResult.match("actions: "), "Should not include empty action");
			return ControlSnippetProvider.getSnippet({
				controlSelector: this.mSelector,
				action: "PRESS"
			});
		}.bind(this)).then(function (sResult) {
			assert.ok(sResult.match("actions: new Press()"), "Should include action");
		}).finally(fnDone);
	});

	QUnit.test("Should get raw snippet", function (assert) {
		DialectRegistry.setActiveDialect(Dialects.RAW);

		var fnDone = assert.async();
		ControlSnippetProvider.getSnippet({
			controlSelector: this.mSelector
		}).then(function (sResult) {
			assert.ok(sResult.startsWith("{\n    \"id\":"), "Should not add prefix");
			assert.ok(!sResult.match("\"actions\": "), "Should not include empty action");
			return ControlSnippetProvider.getSnippet({
				controlSelector: this.mSelector,
				action: "PRESS"
			});
		}.bind(this)).then(function (sResult) {
			assert.ok(!sResult.match("\"actions\": "), "Should not include action even if given as arg");
		}).finally(fnDone);
	});
});
