/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/ChangeCategories"
], function(
	ChangeCategories
) {
	"use strict";

	QUnit.module("Base tests", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	}, function() {
		QUnit.test("getCategories", function(assert) {
			assert.deepEqual(
				Object.keys(ChangeCategories.getCategories()),
				["add", "move", "rename", "combinesplit", "remove", "other"],
				"then the change categories are returned as object keys"
			);
			assert.deepEqual(
				ChangeCategories.getCategories()["add"],
				["createContainer", "addDelegateProperty", "reveal", "addIFrame"],
				"then the commands for the categories are returned"
			);
		});
		QUnit.test("getIconForCategory", function(assert) {
			assert.strictEqual(
				ChangeCategories.getIconForCategory("other"),
				"sap-icon://key-user-settings",
				"then the icon is returned for the category"
			);
		});
	});
});