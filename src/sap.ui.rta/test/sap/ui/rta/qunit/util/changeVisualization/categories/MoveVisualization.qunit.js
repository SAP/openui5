/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/util/changeVisualization/categories/MoveVisualization",
	"sap/ui/core/Core"
], function(
	jQuery,
	MoveVisualization,
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
				MoveVisualization.getDescription(undefined, "label").descriptionText,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE", ["label"]),
				"then the description text is returned"
			);
			assert.strictEqual(
				MoveVisualization.getDescription(undefined, "label").buttonText,
				oResourceBundle.getText("BTN_CHANGEVISUALIZATION_SHOW_DEPENDENT_CONTAINER_MOVE"),
				"then the button text is returned"
			);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});