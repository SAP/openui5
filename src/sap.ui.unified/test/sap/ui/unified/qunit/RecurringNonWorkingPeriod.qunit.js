/*global QUnit */

sap.ui.define([
	"sap/ui/unified/RecurringNonWorkingPeriod",
	"sap/ui/unified/calendar/RecurrenceUtils",
	"sap/ui/unified/library",
	"sap/ui/unified/TimeRange",
	"sap/ui/core/date/UI5Date"
], function(
	RecurringNonWorkingPeriod,
	RecurrenceUtils,
	library,
	TimeRange,
	UI5Date
) {
	"use strict";
	// shortcut for sap.ui.unified.CalendarAppointmentHeight
	const RecurrenceType = library.RecurrenceType;

	QUnit.module("RecurringNonWorkingPeriod");

	QUnit.test("start and end date for recurrence", function (assert) {
		// Prepare
		const oRecurringNonWorkingPeriod = new RecurringNonWorkingPeriod({
			recurrenceType: RecurrenceType.Daily,
			recurrenceEndDate: UI5Date.getInstance(2024, 0, 20, 20, 0),
			recurrencePattern: 1,
			date: UI5Date.getInstance(2024, 0, 1, 20, 0, 0),
			timeRange: new TimeRange({start: "13:00", end: "14:00", valueFormat: "hh:mm"})
		});
		const oExpectedStartDate = UI5Date.getInstance(2024, 0, 1, 13, 0);
		const oExpectedEndDate = UI5Date.getInstance(2024, 0, 20, 20, 0);

		// Assert
		assert.equal(oRecurringNonWorkingPeriod.getStartDate().toString(), oExpectedStartDate.toString(), "StartDate is set to 1.1.2024 13:00");
		assert.equal(oRecurringNonWorkingPeriod.getRecurrenceEndDate().toString(), oExpectedEndDate.toString(), "EndDate is set to 20.1.2024: 20:00");
	});

	QUnit.test("hasNonWorkingAtHours", function (assert) {
		// Prepare
		const oRecurringNonWorkingPeriod = new RecurringNonWorkingPeriod({
			recurrenceType: RecurrenceType.Daily,
			recurrenceEndDate: UI5Date.getInstance(2024, 0, 22, 20, 0),
			recurrencePattern: 1,
			date: UI5Date.getInstance(2024, 0, 2, 20, 0, 0),
			timeRange: new TimeRange({start: "13:00", end: "14:00", valueFormat: "hh:mm"})
		});
		const oExpectedDate = UI5Date.getInstance(UI5Date.getInstance(2024, 0, 1, 13, 0));

		// Assert
		assert.ok(oRecurringNonWorkingPeriod.hasNonWorkingAtHours(oExpectedDate), "RecurringNonWorkingPeriod for a date outside the time frame of recurrences is correct.");

		for (let i = 2; i <= 22; i++) {
			//Act
			oExpectedDate.setDate(i);

			// Assert
			assert.ok(oRecurringNonWorkingPeriod.hasNonWorkingAtHours(oExpectedDate), "RecurringNonWorkingPeriod for 20 days is correct");
		}

		//Act
		oExpectedDate.setDate(23);

		// Assert
		assert.ok(oRecurringNonWorkingPeriod.hasNonWorkingAtHours(oExpectedDate), "RecurringNonWorkingPeriod for a date outside the time frame of recurrences is correct.");

	});

	QUnit.module("RecurrenceUtils");

	QUnit.test("hasOccurrenceOnDate from RecurrenceUtils", function (assert) {
		// Prepare
		const oRecurringNonWorkingPeriod = new RecurringNonWorkingPeriod({
			recurrenceType: RecurrenceType.Daily,
			recurrenceEndDate: UI5Date.getInstance(2024, 0, 22, 20, 0),
			recurrencePattern: 1,
			date: UI5Date.getInstance(2024, 0, 2, 20, 0, 0),
			timeRange: new TimeRange({start: "13:00", end: "14:00", valueFormat: "hh:mm"})
		});

		const oExpectedDate = UI5Date.getInstance(UI5Date.getInstance(2024, 0, 1, 0, 0));
		const hasOccurrenceOnDate = RecurrenceUtils.hasOccurrenceOnDate.bind(oRecurringNonWorkingPeriod);

		// Assert
		assert.notOk(hasOccurrenceOnDate(oExpectedDate), "hasOccurrenceOnDate for a date outside the time frame of recurrences is correct.");

		for (let i = 2; i <= 22; i++) {
			//Act
			oExpectedDate.setDate(i);

			// Assert
			assert.ok(hasOccurrenceOnDate(oExpectedDate), "hasOccurrenceOnDate for 20 days is correct");
		}

		//Act
		oExpectedDate.setDate(23);

		// Assert
		assert.notOk(hasOccurrenceOnDate(oExpectedDate), "hasOccurrenceOnDate for a date outside the time frame of recurrences is correct.");

	});
});
