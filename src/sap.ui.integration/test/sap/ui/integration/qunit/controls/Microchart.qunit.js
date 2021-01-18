/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/controls/Microchart",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function (
	Core,
	Microchart,
	waitForThemeApplied
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Rendering");

	QUnit.test("Value of the chart has same color as the chart", function (assert) {
		// arrange
		var oMicrochart = new Microchart({
			valueColor: "Good"
		});

		oMicrochart.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.ok(oMicrochart.$().find(".sapUiIntMicrochartValue" + oMicrochart.getValueColor()).length, "The value div should have 'Good' class.");

		// clean up
		oMicrochart.destroy();
	});

	return waitForThemeApplied();
});
