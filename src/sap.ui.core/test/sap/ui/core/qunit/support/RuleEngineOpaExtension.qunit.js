/* global QUnit */

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/support/RuleEngineOpaExtension"
], function (RuleEngineOpaExtension) {
	"use strict";

	QUnit.module("Private API");

	QUnit.test("#_formatFileName", function (assert) {
		assert.strictEqual(RuleEngineOpaExtension._formatFileName("report.support-assistant.json"), "report.support-assistant.json",
							"If the right extension is given, file name should NOT be changed.");
		assert.strictEqual(RuleEngineOpaExtension._formatFileName("report"), "report.support-assistant.json",
							"If no extension is given, file name should be changed.");
		assert.strictEqual(RuleEngineOpaExtension._formatFileName("report.json"), "report.support-assistant.json",
							"If .json extension is given, file name should be changed.");
		assert.strictEqual(RuleEngineOpaExtension._formatFileName("report.txt"), "report.txt.support-assistant.json",
							"If different extension is given, file name should be changed.");
	});

});