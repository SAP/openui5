/*global QUnit, window */
sap.ui.define([
	"sap/m/PlanningCalendarHeader",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/calendar/CustomMonthPicker",
	"sap/ui/unified/calendar/CustomYearPicker"
], function(
	PlanningCalendarHeader,
	Calendar,
	CustomMonthPicker,
	CustomYearPicker
) {
	"use strict";

	QUnit.module("initialize");

	QUnit.test("unified.Calendar aggregations are instantiated correctly", function (assert) {
		// Prepare
		var oPCHeader = new PlanningCalendarHeader(),
			oCalendar = oPCHeader.getAggregation("_calendarPicker"),
			oCustomMonthPicker = oPCHeader.getAggregation("_monthPicker"),
			oCustomYearPicker = oPCHeader.getAggregation("_yearPicker");

		// Act
		// Assert
		assert.ok(oCalendar instanceof Calendar, "Calendar is instantiated");
		assert.ok(oCustomMonthPicker instanceof CustomMonthPicker, "CustomMonthPicker is instantiated");
		assert.ok(oCustomYearPicker instanceof CustomYearPicker, "CustomYearPicker is instantiated");

		assert.ok(oCalendar._bPoupupMode, "setPopupMode(true) is called for the Calendar instance");
		assert.ok(oCustomMonthPicker._bPoupupMode, "setPopupMode(true) is called for the CustomMonthPicker instance");
		assert.ok(oCustomYearPicker._bPoupupMode, "setPopupMode(true) is called for the CustomYearPicker instance");

		// Clean
		oPCHeader.destroy();
	});
});