/*global QUnit */

sap.ui.define([
	"sap/ui/unified/NonWorkingPeriod",
	"sap/ui/unified/TimeRange",
	"sap/ui/core/date/UI5Date"
], function(
	NonWorkingPeriod,
	TimeRange,
	UI5Date
) {
	"use strict";

	QUnit.test("startDate and endDate", function (assert) {
		// Prepare
		const oNonWorkingPeriod = new NonWorkingPeriod({
			date: UI5Date.getInstance(2024, 0, 1, 20, 0, 0),
			timeRange: new TimeRange({start: "13:00", end: "14:00", valueFormat: "hh:mm"})
		});
		const oExpectedStartDate = UI5Date.getInstance(2024, 0, 1, 13, 0);
		const oExpectedEndDate = UI5Date.getInstance(2024, 0, 1, 14, 0);

		// Assert
		assert.equal(oNonWorkingPeriod.getStartDate().toString(), oExpectedStartDate.toString(), "StartDate is set to 13:00");
		assert.equal(oNonWorkingPeriod.getEndDate().toString(), oExpectedEndDate.toString(), "EndDate is set to 14:00");
	});

	QUnit.test("DurationInMinutes", function (assert) {
		// Prepare
		const oNonWorkingPeriod = new NonWorkingPeriod({
			date: UI5Date.getInstance(2024, 0, 1, 20, 0, 0),
			timeRange: new TimeRange({start: "13:00", end: "14:00", valueFormat: "hh:mm"})
		});
		const iDuration = 60;

		// Assert
		assert.strictEqual(oNonWorkingPeriod.getDurationInMinutes(), iDuration, "The duration is correctly calculated to be 1 hour.");
	});
});
