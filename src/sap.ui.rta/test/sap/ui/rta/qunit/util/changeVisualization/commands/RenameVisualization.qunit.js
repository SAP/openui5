/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/commands/RenameVisualization",
	"sap/ui/core/Core"
], function(
	RenameVisualization,
	oCore
) {
	"use strict";
	var oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");

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
		document.getElementById("qunit-fixture").style.display = "none";
	});
});