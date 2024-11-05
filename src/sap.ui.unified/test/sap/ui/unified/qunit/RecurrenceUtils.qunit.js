/*global QUnit*/
sap.ui.define([
	"sap/ui/unified/calendar/RecurrenceUtils",
	"sap/ui/unified/NonWorkingPeriod",
	"sap/ui/unified/RecurringNonWorkingPeriod",
	"sap/ui/unified/TimeRange",
	"sap/ui/core/date/UI5Date"
], function(
	RecurrenceUtils,
	NonWorkingPeriod,
	RecurringNonWorkingPeriod,
	TimeRange,
	UI5Date
) {
	"use strict";

	function createNonWorkingPeriod(oDate, sStart, sEnd) {
		return new NonWorkingPeriod({
			date: oDate,
			timeRange: new TimeRange({
				start: sStart,
				end: sEnd
			})
		});
	}

	QUnit.module("working and non working segments");

	QUnit.test("Small segments of non-work periods within an hour", function (assert) {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 0, 0, 0);
		let iExpectDuration = 0;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:05", "00:10"));
		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:15", "00:20"));
		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:25", "00:30"));
		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:35", "00:40"));

		// Act
		const aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 9, "Nine items need to be filtered for this hour");
		for (let i = 0; i < aResult.length; i++) {
			if (i % 2 === 0) {
				iExpectDuration = i === aResult.length - 1 ? 20 : 5;
				assert.strictEqual(aResult[i].type, "working", "The type must be defined as working");
				assert.strictEqual(aResult[i].duration, iExpectDuration, "The duration of the period is correct");
			} else {
				iExpectDuration = 5;
				assert.strictEqual(aResult[i].type, "non-working", "The type must be defined as non-working");
				assert.strictEqual(aResult[i].duration, iExpectDuration, "The duration of the period is correct");
			}
		}
	});

	QUnit.test("Small segments of non-work periods within an hour", function (assert) {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 0, 0, 0);
		let iExpectDuration = 0;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:05", "00:10"));
		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:15", "00:20"));
		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:25", "00:30"));
		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:35", "00:40"));

		// Act
		const aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 9, "Nine items need to be filtered for this hour");
		for (let i = 0; i < aResult.length; i++) {
			if (i % 2 === 0) {
				iExpectDuration = i === aResult.length - 1 ? 20 : 5;
				assert.strictEqual(aResult[i].type, "working", "The type must be defined as working");
				assert.strictEqual(aResult[i].duration, iExpectDuration, "The duration of the period is correct");
			} else {
				iExpectDuration = 5;
				assert.strictEqual(aResult[i].type, "non-working", "The type must be defined as non-working");
				assert.strictEqual(aResult[i].duration, iExpectDuration, "The duration of the period is correct");
			}
		}
	});

	QUnit.test("One segments of non-work periods within an hour(start in 00min)", (assert) => {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 1, 0, 0);
		const iExpectDuration = 15;
		const iMinutesInOneHours = 60;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "01:00", "01:15"));

		// Act
		const aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 2, "two items need to be filtered for this hour");

		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		assert.strictEqual(aResult[1].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[1].duration, iMinutesInOneHours - iExpectDuration, "The duration of the period is correct");
	});

	QUnit.test("One segments of non-work periods within an hour(end in 00min)", (assert) => {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 1, 0, 0);
		const iExpectDuration = 45;
		const iMinutesInOneHours = 60;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "01:45", "02:00"));

		// Act
		const aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 2, "two items need to be filtered for this hour");

		assert.strictEqual(aResult[0].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		assert.strictEqual(aResult[1].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[1].duration, iMinutesInOneHours - iExpectDuration, "The duration of the period is correct");
	});

	QUnit.test("A non-work period extending over three consecutive hours", function (assert) {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 0, 0, 0);
		let iExpectDuration = 0;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:40", "02:10"));


		// Act
		let aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);
		iExpectDuration = 40;

		// Assert
		assert.strictEqual(aResult.length, 2, "Five items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		iExpectDuration = 20;

		// Assert
		assert.strictEqual(aResult[1].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[1].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		// next hour ("01:00")
		oCellStartDate.setHours(oCellStartDate.getHours() + 1);
		aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);
		iExpectDuration = 60;

		// Assert
		assert.strictEqual(aResult.length, 1, "One items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		// next hour ("02:00")
		oCellStartDate.setHours(oCellStartDate.getHours() + 1);
		aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);
		iExpectDuration = 10;

		// Assert
		assert.strictEqual(aResult.length, 2, "Two items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		iExpectDuration = 50;

		// Assert
		assert.strictEqual(aResult[1].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[1].duration, iExpectDuration, "The duration of the period is correct");
	});

	QUnit.test("A non-work period extending over three full consecutive hours.", function (assert) {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 0, 0, 0);
		const iExpectDuration = 60;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:00", "03:00"));

		// Act
		let aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 1, "One items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		// next hour ("01:00")
		oCellStartDate.setHours(oCellStartDate.getHours() + 1);
		aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 1, "One items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		// next hour ("02:00")
		oCellStartDate.setHours(oCellStartDate.getHours() + 1);
		aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 1, "One items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");
	});

	QUnit.test("A non-work period lasting one hour within two consecutive hours.", function (assert) {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 0, 0, 0);
		const iExpectDuration = 30;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:30", "01:30"));

		// Act
		let aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 2, "Two items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");
		assert.strictEqual(aResult[1].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[1].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		// next hour ("01:00")
		oCellStartDate.setHours(oCellStartDate.getHours() + 1);
		aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 2, "Two items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");
		assert.strictEqual(aResult[1].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[1].duration, iExpectDuration, "The duration of the period is correct");
	});

	QUnit.module("hasOccurrenceOnDate");

	QUnit.test("hasOccurrenceOnDate for a leap year", (assert) => {
		// Prepare
		const oEndDate = UI5Date.getInstance(2025, 11, 2);
		const oRecurrencePeriod = new RecurringNonWorkingPeriod({
			recurrenceType: "Daily",
			recurrenceEndDate: UI5Date.getInstance(2025, 11, 1),
			recurrencePattern: 1,
			date: UI5Date.getInstance(2024, 11 ,30),
			timeRange: new TimeRange({
				start: "1:55",
				end:"2:15",
				valueFormat:"HH:mm"
			})
		});
		const hasOccurrenceOnDate = RecurrenceUtils.hasOccurrenceOnDate.bind(oRecurrencePeriod);
		const oCurrentDate = UI5Date.getInstance(2024, 11 ,29);

		// Assert
		assert.notOk(hasOccurrenceOnDate(oCurrentDate), "It has been correctly determined that there is no non-working period for a date outside the recurring non-working interval");

		// Act
		oCurrentDate.setDate(oCurrentDate.getDate() + 1);

		while (oCurrentDate.getTime() < oEndDate.getTime()) {
			// Assert
			assert.ok(hasOccurrenceOnDate(oCurrentDate), "It has been correctly determined that there is a non-working period for a date within the recurring non-working interval");

			// Act
			oCurrentDate.setDate(oCurrentDate.getDate() + 1);
		}

		// Assert
		assert.notOk(hasOccurrenceOnDate(oCurrentDate), "It has been correctly determined that there is no non-working period for a date outside the recurring non-working interval");
	});
});
