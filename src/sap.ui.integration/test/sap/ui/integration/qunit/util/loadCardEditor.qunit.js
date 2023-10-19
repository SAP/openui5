/*global QUnit */

sap.ui.define([
	"sap/ui/integration/util/loadCardEditor"
],
function (
	loadCardEditor
) {
	"use strict";

	QUnit.module("loadCardEditor");

	QUnit.test("Return type", function (assert) {
		const result = loadCardEditor();

		assert.ok(result instanceof Promise, "Promise should be returned");
	});
});