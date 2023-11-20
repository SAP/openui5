/*global QUnit */

sap.ui.define([
	"sap/ui/demo/cardExplorer/model/formatter"
], function(formatter) {
	"use strict";

	QUnit.module("formatter");

	QUnit.test("formatExampleName", function (assert) {
		assert.strictEqual(formatter.formatExampleName({"sap.app": {"id": "card.explorer.list.sample"}}), "card-explorer-list-sample", "Dots should be replace with hyphens");
		assert.strictEqual(formatter.formatExampleName({"sap.app": {"id": "nodots"}}), "nodots", "String should NOT be changed");
	});
});