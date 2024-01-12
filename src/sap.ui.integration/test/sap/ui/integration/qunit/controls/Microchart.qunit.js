/* global QUnit */

sap.ui.define([
	"sap/ui/integration/controls/Microchart",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Microchart,
	nextUIUpdate
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Rendering");

	QUnit.test("Value of the chart has same color as the chart", async function (assert) {
		// arrange
		var oMicrochart = new Microchart({
			valueColor: "Good"
		});

		oMicrochart.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// assert
		assert.ok(oMicrochart.$().find(".sapUiIntMicrochartValue" + oMicrochart.getValueColor()).length, "The value div should have 'Good' class.");

		// clean up
		oMicrochart.destroy();
	});
});
