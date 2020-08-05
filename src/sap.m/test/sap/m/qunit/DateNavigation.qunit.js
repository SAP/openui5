/*global QUnit */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	'sap/ui/unified/library',
	"sap/m/delegate/DateNavigation"
], function(
	qutils,
	unifiedLibrary,
	DateNavigation
) {
		"use strict";

		// first day of the week needs to be fixed (Monday)
		sap.ui.getCore().getConfiguration().setLanguage("en_GB");

		var Periods = unifiedLibrary.CalendarIntervalType;

		QUnit.module("days");

		QUnit.test("next without current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Day);
			oDateNavigation.setStart(new Date(2019, 0, 1));
			oDateNavigation.setStep(7);

			// act
			oDateNavigation.next();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 0, 8));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 0, 8));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("previous without current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Day);
			oDateNavigation.setStart(new Date(2019, 0, 1));
			oDateNavigation.setStep(7);

			// act
			oDateNavigation.previous();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2018, 11, 25));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2018, 11, 25));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("next with current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Day);
			oDateNavigation.setStart(new Date(2019, 0, 1));
			oDateNavigation.setCurrent(new Date(2019, 0, 3));
			oDateNavigation.setStep(7);

			// act
			oDateNavigation.next();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 0, 8));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 0, 10));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("previous with current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Day);
			oDateNavigation.setStart(new Date(2019, 0, 1));
			oDateNavigation.setCurrent(new Date(2019, 0, 3));
			oDateNavigation.setStep(7);

			// act
			oDateNavigation.previous();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2018, 11, 25));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2018, 11, 27));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate earlier period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Day);
			oDateNavigation.setStart(new Date(2019, 2, 1));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.toDate(new Date(2019, 1, 27));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 27));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 1, 27));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate later period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Day);
			oDateNavigation.setStart(new Date(2019, 2, 1));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.toDate(new Date(2019, 2, 5));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 2, 3));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 2, 5));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate current period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Day);
			oDateNavigation.setStart(new Date(2019, 2, 1));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.toDate(new Date(2019, 2, 3));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 2, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 2, 3));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("getEnd", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Day);
			oDateNavigation.setStart(new Date(2019, 0, 2));
			oDateNavigation.setStep(3);

			// assert
			assert.deepEqual(oDateNavigation.getEnd(), new Date(2019, 0, 4));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.module("one month");

		QUnit.test("next without current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.OneMonth);
			oDateNavigation.setStart(new Date(2019, 0, 1));
			oDateNavigation.setStep(31);

			// act
			oDateNavigation.next();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 1, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("previous without current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.OneMonth);
			oDateNavigation.setStart(new Date(2019, 0, 1));
			oDateNavigation.setStep(31);

			// act
			oDateNavigation.previous();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2018, 11, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2018, 11, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("next with current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.OneMonth);
			oDateNavigation.setStart(new Date(2019, 0, 1));
			oDateNavigation.setCurrent(new Date(2019, 0, 3));
			oDateNavigation.setStep(31);

			// act
			oDateNavigation.next();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 1, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("previous with current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.OneMonth);
			oDateNavigation.setStart(new Date(2019, 0, 1));
			oDateNavigation.setCurrent(new Date(2019, 0, 3));
			oDateNavigation.setStep(31);

			// act
			oDateNavigation.previous();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2018, 11, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2018, 11, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate earlier period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.OneMonth);
			oDateNavigation.setStart(new Date(2019, 2, 1));

			// act
			oDateNavigation.toDate(new Date(2019, 1, 28));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 1, 28));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate later period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.OneMonth);
			oDateNavigation.setStart(new Date(2019, 2, 1));

			// act
			oDateNavigation.toDate(new Date(2019, 3, 5));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 3, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 3, 5));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate current period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.OneMonth);
			oDateNavigation.setStart(new Date(2019, 2, 1));

			// act
			oDateNavigation.toDate(new Date(2019, 2, 5));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 2, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 2, 5));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.module("week");

		QUnit.test("next without current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Week);
			oDateNavigation.setStart(new Date(2019, 7, 19));
			oDateNavigation.setStep(7);

			// act
			oDateNavigation.next();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 7, 26));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 7, 26));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("previous without current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Week);
			oDateNavigation.setStart(new Date(2019, 7, 26));
			oDateNavigation.setStep(7);

			// act
			oDateNavigation.previous();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 7, 19));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 7, 19));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("next with current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Week);
			oDateNavigation.setStart(new Date(2019, 7, 19));
			oDateNavigation.setCurrent(new Date(2019, 7, 22));
			oDateNavigation.setStep(7);

			// act
			oDateNavigation.next();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 7, 26));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 7, 29));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("previous with current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Week);
			oDateNavigation.setStart(new Date(2019, 7, 26));
			oDateNavigation.setCurrent(new Date(2019, 7, 29));
			oDateNavigation.setStep(7);

			// act
			oDateNavigation.previous();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 7, 19));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 7, 22));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate earlier period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Week);
			oDateNavigation.setStart(new Date(2019, 7, 26));

			// act
			oDateNavigation.toDate(new Date(2019, 7, 21));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 7, 19));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 7, 21));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate later period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Week);
			oDateNavigation.setStart(new Date(2019, 7, 26));

			// act
			oDateNavigation.toDate(new Date(2019, 8, 3));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 8, 2));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 8, 3));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate current period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Week);
			oDateNavigation.setStart(new Date(2019, 7, 26));

			// act
			oDateNavigation.toDate(new Date(2019, 7, 28));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 7, 26));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 7, 28));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("getEnd", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Week);
			oDateNavigation.setStart(new Date(2019, 7, 19));
			oDateNavigation.setStep(7);

			// assert
			assert.deepEqual(oDateNavigation.getEnd(), new Date(2019, 7, 25));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.module("months");

		QUnit.test("next without current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Month);
			oDateNavigation.setStart(new Date(2019, 1, 1));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.next();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 4, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 4, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("previous without current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Month);
			oDateNavigation.setStart(new Date(2019, 4, 1));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.previous();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 1, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("next with current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Month);
			oDateNavigation.setStart(new Date(2019, 1, 1));
			oDateNavigation.setCurrent(new Date(2019, 2, 1));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.next();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 4, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 5, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("previous with current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Month);
			oDateNavigation.setStart(new Date(2019, 4, 1));
			oDateNavigation.setCurrent(new Date(2019, 5, 1));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.previous();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 2, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate earlier period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Month);
			oDateNavigation.setStart(new Date(2019, 2, 1));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.toDate(new Date(2019, 1, 1));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 1, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate later period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Month);
			oDateNavigation.setStart(new Date(2019, 2, 1));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.toDate(new Date(2019, 5, 1));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 3, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 5, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate current period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Month);
			oDateNavigation.setStart(new Date(2019, 2, 1));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.toDate(new Date(2019, 4, 1));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 2, 1));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 4, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("getEnd", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Month);
			oDateNavigation.setStart(new Date(2019, 1, 1));
			oDateNavigation.setStep(3);

			// assert
			assert.deepEqual(oDateNavigation.getEnd(), new Date(2019, 3, 1));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.module("hour");

		QUnit.test("next without current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Hour);
			oDateNavigation.setStart(new Date(2019, 1, 1, 5));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.next();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 1, 8));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 1, 1, 8));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("previous without current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Hour);
			oDateNavigation.setStart(new Date(2019, 1, 1, 8));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.previous();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 1, 5));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 1, 1, 5));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("next with current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Hour);
			oDateNavigation.setStart(new Date(2019, 1, 1, 5));
			oDateNavigation.setCurrent(new Date(2019, 1, 1, 6));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.next();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 1, 8));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 1, 1, 9));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("previous with current", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Hour);
			oDateNavigation.setStart(new Date(2019, 1, 1, 8));
			oDateNavigation.setCurrent(new Date(2019, 1, 1, 9));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.previous();

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 1, 1, 5));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 1, 1, 6));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate earlier period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Hour);
			oDateNavigation.setStart(new Date(2019, 2, 1, 9, 0, 0));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.toDate(new Date(2019, 2, 1, 7, 0, 0));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 2, 1, 7, 0, 0));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 2, 1, 7, 0, 0));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate later period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Hour);
			oDateNavigation.setStart(new Date(2019, 2, 1, 9, 0, 0));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.toDate(new Date(2019, 2, 1, 13, 0, 0));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 2, 1, 13, 0, 0));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 2, 1, 13, 0, 0));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("toDate current period", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Hour);
			oDateNavigation.setStart(new Date(2019, 2, 1, 9, 0, 0));
			oDateNavigation.setStep(3);

			// act
			oDateNavigation.toDate(new Date(2019, 2, 1, 11, 0, 0));

			// assert
			assert.deepEqual(oDateNavigation.getStart(), new Date(2019, 2, 1, 9, 0, 0));
			assert.deepEqual(oDateNavigation.getCurrent(), new Date(2019, 2, 1, 11, 0, 0));

			// clean
			oDateNavigation.destroy();
		});

		QUnit.test("getEnd", function(assert) {
			// arrange
			var oDateNavigation = new DateNavigation();
			oDateNavigation.setUnit(Periods.Hour);
			oDateNavigation.setStart(new Date(2019, 1, 1, 18));
			oDateNavigation.setStep(3);

			// assert
			assert.deepEqual(oDateNavigation.getEnd(), new Date(2019, 1, 1, 20));

			// clean
			oDateNavigation.destroy();
		});
	});