/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/demo/cardExplorer/model/formatter"
], function(formatter) {
	"use strict";

	QUnit.module("formatter");

	QUnit.test("_formatExampleName", function (assert) {
		assert.strictEqual(formatter._formatExampleName({"sap.app": {"id": "card.explorer.list.sample"}}), "card-explorer-list-sample", "Dots should be replace with hyphens");
		assert.strictEqual(formatter._formatExampleName({"sap.app": {"id": "nodots"}}), "nodots", "String should NOT be changed");
	});
});