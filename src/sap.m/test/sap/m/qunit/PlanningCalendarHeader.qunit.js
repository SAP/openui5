/*global QUnit, window */
sap.ui.define([
	"sap/m/PlanningCalendarHeader",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/calendar/CustomMonthPicker",
	"sap/ui/unified/calendar/CustomYearPicker",
	"sap/m/SegmentedButtonItem",
	"sap/ui/core/InvisibleText"
], function(
	PlanningCalendarHeader,
	Calendar,
	CustomMonthPicker,
	CustomYearPicker,
	SegmentedButtonItem,
	InvisibleText
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

	QUnit.module("ARIA");

	QUnit.test("View switch has an invisible label", function (assert) {
		var oPlanningCalendarHeader = new PlanningCalendarHeader(),
			oFirstMockView = new SegmentedButtonItem({ text: "A view" }),
			oSecondMockView = new SegmentedButtonItem({ text: "Another view" }),
			$viewSwitch;

		oPlanningCalendarHeader._oViewSwitch.addItem(oFirstMockView);
		oPlanningCalendarHeader._oViewSwitch.addItem(oSecondMockView);

		oPlanningCalendarHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();


		$viewSwitch = oPlanningCalendarHeader._oViewSwitch.$();
		assert.strictEqual($viewSwitch.attr("aria-labelledby"), InvisibleText.getStaticId("sap.m", "PCH_VIEW_SWITCH"),
			"View switch has an invisible label, which indicates its purpose ");

		oPlanningCalendarHeader.destroy();
	});
});