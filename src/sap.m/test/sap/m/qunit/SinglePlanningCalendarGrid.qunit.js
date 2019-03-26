/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"jquery.sap.global",
	"sap/m/SinglePlanningCalendarGrid"
], function(
	qutils,
	jQuery,
	SinglePlanningCalendarGrid
) {
	"use strict";

	QUnit.module("Other");

	QUnit.test("updateNowMarkerPosition and text is called on after rendering", function (assert) {
		// Arrange
		var oSPCGrid = new SinglePlanningCalendarGrid(),
			oUpdateRowHeaderAndNowMarkerSpy = this.spy(oSPCGrid, "_updateRowHeaderAndNowMarker");

		// Act
		oSPCGrid.onAfterRendering();

		// Assert
		assert.equal(oUpdateRowHeaderAndNowMarkerSpy.callCount, 1, "_updateRowHeaderAndNowMarker is called once onAfterRendering");

		// Cleanup
		oUpdateRowHeaderAndNowMarkerSpy.restore();
		oSPCGrid.destroy();
	});
});
