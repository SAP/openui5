/*global QUnit*/

sap.ui.define([
	"sap/ui/table/AnalyticalColumn",
	"sap/m/Label"
], function(
	AnalyticalColumn,
	Label
) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function() {
			this._oColumn = new AnalyticalColumn();
		},
		afterEach: function() {
			this._oColumn.destroy();
		}
	});

	/*
	 * Checks all cases where the AnalyticalColumn should be rendered based on the visibility, the grouping and the template.
	 */
	QUnit.test("shouldRender", function(assert) {
		const that = this;

		function test(bShouldRender, bVisible, bGrouped, vTemplate) {
			that._oColumn.setVisible(bVisible);
			that._oColumn.setGrouped(bGrouped);
			that._oColumn.setTemplate(vTemplate);

			assert.strictEqual(that._oColumn.shouldRender(), bShouldRender,
				"Returned " + bShouldRender + ": "
				+ (bVisible ? "Visible" : "Not visible")
				+ ", " + (bGrouped ? "grouped" : "not grouped")
				+ ", " + (vTemplate != null ? "has template" : "has no template"));
		}
		// If either the column has no vTemplate, the bVisible is set to false or bGrouped is true the column shouldn't render.
		test(true, true, false, new Label({text: "{dummy}"}));
		test(false, true, true, new Label({text: "{dummy}"}));
		test(false, false, false, new Label({text: "{dummy}"}));
		test(false, false, true, new Label({text: "{dummy}"}));
		test(false, true, true, null);
		test(false, true, false, null);
		test(false, false, false, null);
		test(false, false, true, null);
	});
});