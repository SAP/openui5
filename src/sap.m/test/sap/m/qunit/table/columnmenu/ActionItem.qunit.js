/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/ActionItem"
], function (QUnitUtils, ActionItem) {
	"use strict";

	var sText = "Test",
		sIcon = "sap-icon://example";

	// Test setup
	QUnit.module("Action Item", {
		beforeEach: function () {
			this.oActionItem = new ActionItem({
				label: sText,
				icon: sIcon
			});
		},
		afterEach: function () {
			this.oActionItem.destroy();
		}
	});

	QUnit.test("Retrieve label", function (assert) {
		assert.equal(this.oActionItem.getLabel(), sText);
	});

	QUnit.test("Retrieve icon", function (assert) {
		assert.equal(this.oActionItem.getIcon(), sIcon);
	});

	QUnit.test("Content", function (assert) {
		assert.equal(this.oActionItem.getContent(), null);
	});

});