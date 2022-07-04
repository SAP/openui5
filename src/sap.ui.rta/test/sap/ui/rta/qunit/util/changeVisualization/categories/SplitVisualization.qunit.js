/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/categories/SplitVisualization",
	"sap/ui/core/Core"
], function(
	SplitVisualization,
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
		QUnit.test("when a payload with the label is passed", function(assert) {
			assert.strictEqual(
				SplitVisualization.getDescription(undefined, "label").descriptionText,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_SPLIT", ["label"]),
				"then the description text is returned"
			);
			assert.strictEqual(
				SplitVisualization.getDescription(undefined, "label").buttonText,
				oResourceBundle.getText("BTN_CHANGEVISUALIZATION_SHOW_DEPENDENT_CONTAINER_SPLIT"),
				"then the button text is returned"
			);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});