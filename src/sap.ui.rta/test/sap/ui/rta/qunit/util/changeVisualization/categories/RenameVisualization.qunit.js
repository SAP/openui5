/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/util/changeVisualization/categories/RenameVisualization"
], function(
	jQuery,
	RenameVisualization
) {
	"use strict";
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

	QUnit.module("Base tests", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	}, function() {
		QUnit.test("when a payload with the old label and the new label is passed", function(assert) {
			assert.strictEqual(
				RenameVisualization.getDescription({ originalLabel: "old", newLabel: "new" }, "fallback").descriptionText,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_RENAME_FROM_TO", ["new", "old"]),
				"then the full label is returned"
			);
		});

		QUnit.test("when a payload with the new label is passed", function(assert) {
			assert.strictEqual(
				RenameVisualization.getDescription({ newLabel: "new" }, "fallback").descriptionText,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_RENAME_TO", ["new"]),
				"then the alternative label is returned"
			);
		});

		QUnit.test("when a payload without the new label is passed", function(assert) {
			assert.strictEqual(
				RenameVisualization.getDescription({ originalLabel: "old" }, "fallback").descriptionText,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_RENAME_FROM_TO", ["fallback", "old"]),
				"then the fallback label is used"
			);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});