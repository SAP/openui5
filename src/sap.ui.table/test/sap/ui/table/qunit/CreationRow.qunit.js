/*global QUnit */

sap.ui.define([
	"sap/ui/table/CreationRow"
], function(CreationRow) {
	"use strict";

	// TODO: a lot lot more...

	QUnit.module("Toolbar", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("Default Toolbar", function(assert) {
		var oCreationRow = new CreationRow();

		assert.strictEqual(oCreationRow.getToolbar(), null, "No toolbar is set");
		assert.ok(oCreationRow._oDefaultToolbar == null, "No default toolbar is created yet");

		//...
	});
});