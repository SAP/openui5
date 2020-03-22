/*global QUnit, sinon, window */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/unified/CalendarDateInterval",
	"sap/ui/core/LocaleData",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/unified/CalendarWeekInterval",
	"sap/ui/unified/calendar/DatesRow",
	"sap/ui/unified/library",
	"sap/base/Log",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function(qutils, CalendarDateInterval, LocaleData, DateRange, DateTypeRange,
	CalendarDate, CalendarWeekInterval, DatesRow, unifiedLibrary, Log, waitForThemeApplied) {
	"use strict";

	// set language to en-US, since we have specific language strings tested
	sap.ui.getCore().getConfiguration().setLanguage("en_US");

	var iStartDateChanged = 0;
	var handleStartDateChange = function(oEvent){
		iStartDateChanged++;
	};

	var _assertFocus = function(oTarget, sId, sMsg, assert) {
		var $activeElement = document.activeElement;
		assert.ok($activeElement, "There should be an active element. " +  sMsg);
		if ($activeElement) {
			assert.strictEqual($activeElement.id, sId, "Element with id: [" + sId + "] should be focused. " + sMsg);
		}
	};

	var sControlId = "myCal";

	// Creates a CalendarDateInterval with generic properties
	// Config object can be passed as argument. If some property already exist it will be overridden
	function createCalendarDateInterval(oProps) {
		var oCalProps = {
			startDate: new Date()
		};
		oProps && jQuery.extend(oCalProps, oProps);

		return new CalendarDateInterval(sControlId, oCalProps);
	}

	var oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMdd"});
	var oToday = new Date();

	QUnit.module("Rendering");

	QUnit.test("Rendered days by default", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDateChange: handleStartDateChange
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		var $DatesRow = sap.ui.getCore().byId("myCal").getAggregation("month")[0].$();
		var aWeekHeaders = $DatesRow.find(".sapUiCalWH");
		var aDays = $DatesRow.find(".sapUiCalItem");

		// assert
		assert.equal(aWeekHeaders.length, 7, "7 week headers are rendered");
		assert.equal(aDays.length, 7, "7 days are rendered");
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), oFormatYyyymmdd.format(oToday), "Curent date is the first day");
		assert.equal(iStartDateChanged, 0, "no startDateChangeEvent fired by rendering");

		// clean up
		oCal.destroy();
	});

	QUnit.test("Rendered days with set properties days and startDate", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDateChange: handleStartDateChange,
			startDate: new Date("2015", "1", "2"),
			days: 14
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		var $DatesRow = sap.ui.getCore().byId("myCal").getAggregation("month")[0].$();
		var aWeekHeaders = $DatesRow.find(".sapUiCalWH");
		var aDays = $DatesRow.find(".sapUiCalItem");

		// assert
		assert.equal(aWeekHeaders.length, 14, "14 week headers are rendered.");
		assert.equal(aDays.length, 14, "14 days are rendered.");
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20150202", "Correct first day is set.");
		assert.equal(jQuery(aWeekHeaders[0]).text(), "Mon", "Weekday of first day is correct.");
		assert.equal(iStartDateChanged, 0, "no startDateChangeEvent fired by rendering");

		// clean up
		oCal.destroy();
	});

	QUnit.test("Rendered days with set properties days and startDate and showDayNamesLine set to false", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "1", "2"),
			days: 14,
			showDayNamesLine: false,
			startDateChange: handleStartDateChange
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		var $DatesRow = sap.ui.getCore().byId("myCal").getAggregation("month")[0].$();
		var aWeekHeaders = $DatesRow.find(".sapUiCalWH");
		var aDays = $DatesRow.find(".sapUiCalItem");

		// assert
		assert.equal(aWeekHeaders.length, 0, "Calendar: no weekheaders rendered");
		assert.equal(aDays.length, 14, "Calendar: 14 days rendered");
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20150202", "Calendar: first day");
		assert.equal(jQuery(aDays[0]).children(".sapUiCalDayName").length, 1, "Calendar: day name rendered");
		assert.equal(jQuery(aDays[0]).children(".sapUiCalDayName").text(), "Mon", "Weekday of first day");
		assert.equal(iStartDateChanged, 0, "no startDateChangeEvent fired by rendering");

		// clean up
		oCal.destroy();
	});

	QUnit.test("width default value", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval();

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(!jQuery("#myCal").attr("style"), "Calendar has no width set");

		// clean up
		oCal.destroy();
	});

	QUnit.test("set width", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			width: "1000px"
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(jQuery("#myCal").css("width"), "1000px", "Calendar: width set");

		// clean up
		oCal.destroy();
	});

	QUnit.test("YearRangePicker has three columns and three year ranges when the calendar type is Gregorian", function (assert) {
		// Prepare
		var oCal = new CalendarDateInterval({
				primaryCalendarType: sap.ui.core.CalendarType.Gregorian
			}).placeAt("qunit-fixture"),
			oYearRangePicker = oCal.getAggregation("yearRangePicker");

		sap.ui.getCore().applyChanges();

		// Act
		// Assert
		assert.ok(oYearRangePicker.getColumns(), 3, "YearRangePicker has number of columns");
		assert.ok(oYearRangePicker.getYears(), 3, "YearRangePicker has display correct nubmer of year ranges");

		// Clean
		oCal.destroy();
	});

	QUnit.test("YearRangePicker has two columns and two year ranges when the calendar type is Japanese", function (assert) {
		// Prepare
		var oCal = new CalendarDateInterval({
				primaryCalendarType: sap.ui.core.CalendarType.Japanese
			}).placeAt("qunit-fixture"),
			oYearRangePicker = oCal.getAggregation("yearRangePicker");

		sap.ui.getCore().applyChanges();

		// Act
		// Assert
		assert.ok(oYearRangePicker.getColumns(), 2, "YearRangePicker has number of columns");
		assert.ok(oYearRangePicker.getYears(), 2, "YearRangePicker has display correct nubmer of year ranges");

		// Clean
		oCal.destroy();
	});

	QUnit.module("initialize");

	QUnit.test("YearRangePicker aggregation is instantiated correctly", function (assert) {
		// Prepare
		var oCal = new CalendarDateInterval({
				primaryCalendarType: sap.ui.core.CalendarType.Gregorian
			}).placeAt("qunit-fixture"),
			oYearRangePicker = oCal.getAggregation("yearRangePicker"),
			oYearPicker = oCal.getAggregation("yearPicker");

		sap.ui.getCore().applyChanges();

		// Act
		// Assert
		assert.strictEqual(oYearRangePicker.getPrimaryCalendarType(), oCal.getPrimaryCalendarType(),
			"YearRangePicker instance has the same primary calendar type as the calendar instance");
		assert.ok(oYearRangePicker.getYears(), 6, "YearRangePicker has correct number of years");
		assert.ok(oYearRangePicker.getRangeSize(), oYearPicker.getYears(), "YearRangePicker has correct range size");

		// Clean
		oCal.destroy();
	});

	QUnit.test("MonthPicker aggregation is instantiated correctly", function (assert) {
		// Prepare
		var oCalDateInterval = new CalendarDateInterval({
				primaryCalendarType: sap.ui.core.CalendarType.Gregorian
			}),
			oMonthPicker = oCalDateInterval.getAggregation("monthPicker");

		// Act
		// Assert
		assert.deepEqual(oMonthPicker._oSelectedDatesControlOrigin, oCalDateInterval,
			"MonthPicker has selected dates control origin set");

		// Clean
		oCalDateInterval.destroy();
	});

	QUnit.module("change date via API");

	QUnit.test("setStartDate", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDateChange: handleStartDateChange
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		iStartDateChanged = 0;
		oCal.setStartDate(new Date("2015", "2", "10"));
		var $DatesRow = sap.ui.getCore().byId("myCal").getAggregation("month")[0].$();
		var aDays = $DatesRow.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20150310", "Calendar: new start date");
		assert.equal(iStartDateChanged, 0, "no startDateChangeEvent fired by API change");

		// clean up
		oCal.destroy();
	});

	QUnit.test("focusDate", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			days: 14,
			startDate: new Date("2015", "2", "10"),
			startDateChange: handleStartDateChange
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//act
		iStartDateChanged = 0;
		oCal.focusDate(new Date("2015", "2", "11"));
		var $DatesRow = sap.ui.getCore().byId("myCal").getAggregation("month")[0].$();
		var aDays = $DatesRow.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20150310", "Calendar: start date not changed");
		assert.equal(jQuery(aDays[1]).attr("tabindex"), "0", "Calendar: second day has focus");

		//act
		oCal.focusDate(new Date("2015", "3", "11"));
		aDays = $DatesRow.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20150410", "Calendar: new start date");
		assert.equal(jQuery(aDays[1]).attr("tabindex"), "0", "Calendar: second day still has focus");

		assert.equal(iStartDateChanged, 0, "no startDateChangeEvent fired by API change");

		// clean up
		oCal.destroy();
	});

	QUnit.module("change date via navigation");

	QUnit.test("next/prev days", function(assert) {
		// Prepare
		iStartDateChanged = 0;
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "3", "10"),
			startDateChange: handleStartDateChange
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oCal.focusDate(new Date("2015", "3", "11"));
		qutils.triggerEvent("click", "myCal--Head-next");

		// assert
		assert.equal(iStartDateChanged, 1, "Calendar: startDateChangeEvent fired");
		assert.equal(oFormatYyyymmdd.format(oCal.getStartDate()), "20150417", "Calendar: Start date property");

		// act
		var $DatesRow = sap.ui.getCore().byId("myCal").getAggregation("month")[0].$();
		var aDays = $DatesRow.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20150417", "Calendar: new start date");
		assert.equal(jQuery(aDays[1]).attr("tabindex"), "0", "Calendar: second day still has focus");

		// act
		iStartDateChanged = 0;
		qutils.triggerEvent("click", "myCal--Head-prev");

		// assert
		assert.equal(iStartDateChanged, 1, "Calendar: startDateChangeEvent fired");
		assert.equal(oFormatYyyymmdd.format(oCal.getStartDate()), "20150410", "Calendar: Start date property");

		// act
		aDays = $DatesRow.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20150410", "Calendar1: new start date");
		assert.equal(jQuery(aDays[1]).attr("tabindex"), "0", "Calendar1: second day still has focus");

		// clean up
		oCal.destroy();
	});

	QUnit.test("After Rerendering, last focused day is still focused", function(assert) {
		//Prepare
		var oCalendarDateInt = new CalendarDateInterval();
		oCalendarDateInt.placeAt("content");
		sap.ui.getCore().applyChanges();

		var $datesRow = oCalendarDateInt.getAggregation("month")[0].$();
		var aDates = $datesRow.find(".sapUiCalItem");
		aDates[1].focus();

		//Act
		oCalendarDateInt.rerender();

		//Assert
		_assertFocus(aDates[1], aDates[1].id, "Calendar: after rerendering  second day still has focus", assert);
		oCalendarDateInt.destroy();
	});

	QUnit.test("After Rerendering, the focus is not stolen from an external control (i.e. a button)", function(assert) {

		//Prepare
		var oCalendarDateInt = new CalendarDateInterval(),
				oExternalControl = new CalendarDateInterval("extControl");

		oCalendarDateInt.placeAt("content");
		oExternalControl.placeAt("content");
		sap.ui.getCore().applyChanges();
		var sExpected = oExternalControl.$().find(".sapUiCalItems").children()[0].id;

		oExternalControl.focus();
		_assertFocus(oExternalControl.getDomRef(), sExpected, "Prerequisites check: 'extControl' (another DateInterval) should be focused", assert);

		//Act
		oCalendarDateInt.rerender();

		//Assert
		_assertFocus(oExternalControl.getDomRef(), sExpected, "After rerendering, the focus should stay on the 'extControl' (another MonthInterval)", assert);
		oCalendarDateInt.destroy();
		oExternalControl.destroy();
	});

	QUnit.test("Header next button handler works correct for YearRangePicker", function (assert) {
		// Prepare
		var oCal = new CalendarDateInterval({
				primaryCalendarType: sap.ui.core.CalendarType.Gregorian,
				selectedDates: [new DateRange({startDate:new Date(2000, 0, 1)})]
			}).placeAt("qunit-fixture"),
			oYearRangePicker = oCal.getAggregation("yearRangePicker"),
			oNextPageSpy = this.spy(oYearRangePicker, "nextPage"),
			oUpdateYearsSpy = this.spy(oYearRangePicker, "_updateYears"),
			oTogglePrevNexYearPicker = this.spy(oCal, "_togglePrevNexYearPicker");

		sap.ui.getCore().applyChanges();

		// Act
		oCal._showYearPicker();
		oCal._showYearRangePicker();
		oCal._handleNext();

		// Assert
		assert.ok(oNextPageSpy.calledOnce, "YearRangePicker nextPage is called");
		assert.ok(oUpdateYearsSpy.called, "YearRangePicker _updateYears is called");
		assert.ok(oTogglePrevNexYearPicker.called, "Calendar _togglePrevNexYearPicker is called");
		assert.deepEqual(oYearRangePicker.getFirstRenderedDate(), new Date(2005, 0, 1), "Year picker page is updated correctly");

		// Clean
		oCal.destroy();
		oNextPageSpy.restore();
		oUpdateYearsSpy.restore();
		oTogglePrevNexYearPicker.restore();
	});

	QUnit.test("Header previous button handler works correct for YearRangePicker", function (assert) {
		// Prepare
		var oCal = new CalendarDateInterval({
				primaryCalendarType: sap.ui.core.CalendarType.Gregorian,
				selectedDates: [new DateRange({startDate:new Date(2000, 0, 1)})]
			}).placeAt("qunit-fixture"),
			oYearRangePicker = oCal.getAggregation("yearRangePicker"),
			oPreviousPageSpy = this.spy(oYearRangePicker, "previousPage"),
			oUpdateYearsSpy = this.spy(oYearRangePicker, "_updateYears"),
			oTogglePrevNexYearPicker = this.spy(oCal, "_togglePrevNexYearPicker");

		sap.ui.getCore().applyChanges();

		// Act
		oCal._showYearPicker();
		oCal._showYearRangePicker();
		oCal._handlePrevious();

		// Assert
		assert.ok(oPreviousPageSpy.calledOnce, "YearRangePicker previousPage is called");
		assert.ok(oUpdateYearsSpy.called, "YearRangePicker _updateYears is called");
		assert.ok(oTogglePrevNexYearPicker.called, "Calendar _togglePrevNexYearPicker is called");
		assert.deepEqual(oYearRangePicker.getFirstRenderedDate(), new Date(1987, 0, 1), "Year picker page is updated correctly");

		// Clean
		oCal.destroy();
		oPreviousPageSpy.restore();
		oUpdateYearsSpy.restore();
		oTogglePrevNexYearPicker.restore();
	});


	QUnit.module("MonthPicker");

	QUnit.test("displayed months default", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "3", "10")
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("click", "myCal--Head-B1");
		var $MonthPicker = sap.ui.getCore().byId("myCal").getAggregation("monthPicker").$();
		var aMonths = $MonthPicker.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery("#myCal--MP").parent().attr("id"), "myCal-content", "Month picker rendered in Calendar");
		assert.equal(aMonths.length, 3, "3 Months are rendered");
		assert.equal(jQuery(aMonths[0]).text(), "April", "First displayed month is correct");
		assert.equal(jQuery(aMonths[0]).attr("tabindex"), "0", "First displayed month is focused");
		assert.ok(!jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button is enabled");
		assert.ok(!jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Next Button is enabled");

		// clean up
		oCal.destroy();
	});

	QUnit.test("displayed months when days are 14", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "1", "2"),
			days: 14
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("click", "myCal--Head-B1");
		sap.ui.getCore().applyChanges();
		var $MonthPicker = sap.ui.getCore().byId("myCal").getAggregation("monthPicker").$();
		var aMonths = $MonthPicker.find(".sapUiCalItem");

		// assert
		assert.equal(aMonths.length, 5, "5 Months are rendered");
		assert.equal(jQuery(aMonths[0]).text(), "January", "First displayed month is correct");
		assert.equal(jQuery(aMonths[1]).attr("tabindex"), "0", "Second displayed month is focused");
		assert.ok(jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button is disabled");
		assert.ok(!jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Next Button is enabled");

		// clean up
		oCal.destroy();
	});

	QUnit.test("change block default", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "3", "10")
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("click", "myCal--Head-B1");
		qutils.triggerEvent("click", "myCal--Head-prev");
		sap.ui.getCore().applyChanges();
		var $MonthPicker = sap.ui.getCore().byId("myCal").getAggregation("monthPicker").$();
		var aMonths = $MonthPicker.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aMonths[0]).text(), "January", "Calendar: first displayed month");
		assert.equal(jQuery(aMonths[0]).attr("tabindex"), "0", "Calendar: first displayed month is focused");
		assert.ok(jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Calendar: Previous Button disabled");
		assert.ok(!jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Calendar: Next Button enabled");

		// clean up
		oCal.destroy();
	});

	QUnit.test("change block 14 days", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "1", "2"),
			days: 14
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("click", "myCal--Head-B1");
		qutils.triggerEvent("click", "myCal--Head-next");
		sap.ui.getCore().applyChanges();
		var $MonthPicker = sap.ui.getCore().byId("myCal").getAggregation("monthPicker").$();
		var aMonths = $MonthPicker.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aMonths[0]).text(), "June", "Calendar: first displayed month");
		assert.equal(jQuery(aMonths[1]).attr("tabindex"), "0", "Calendar: second displayed month is focused");
		assert.ok(!jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Calendar: Previous Button enabled");
		assert.ok(!jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Calendar: Next Button enabled");

		// act
		qutils.triggerEvent("click", "myCal--Head-next");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(!jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Calendar: Previous Button enabled");
		assert.ok(jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Calendar: Next Button disabled");
		qutils.triggerEvent("click", "myCal--Head-B1");

		// clean up
		oCal.destroy();
	});


	QUnit.module("YearPicker");

	QUnit.test("Select year after selecting a range of years", function(assert) {
		// prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "3", "10")
		}).placeAt("content");

		sap.ui.getCore().applyChanges();

		// act
		oCal._showYearPicker();
		oCal._showYearRangePicker();
		oCal._selectYearRange();
		oCal._selectYear();

		// assert
		assert.ok(true, "Selecting a year doesn't throw an error");

		// clean up
		oCal.destroy();
	});

	QUnit.test("displayed years default", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "3", "10")
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("click", "myCal--Head-B2");
		var $YearPicker = sap.ui.getCore().byId("myCal").getAggregation("yearPicker").$();
		var aYears = $YearPicker.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery("#myCal--YP").parent().attr("id"), "myCal-content", "Calendar: year picker rendered in Calendar");
		assert.equal(aYears.length, 3, "Calendar: 3 Years rendered");
		assert.equal(jQuery(aYears[0]).text(), "2014", "Calendar: first displayed year");
		assert.equal(jQuery(aYears[1]).attr("tabindex"), "0", "Calendar: second displayed year is focused");

		// clean up
		oCal.destroy();
	});

	QUnit.test("displayed years 14 days", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "1", "2"),
			days: 14
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("click", "myCal--Head-B2");
		var $YearPicker = sap.ui.getCore().byId("myCal").getAggregation("yearPicker").$();
		var aYears = $YearPicker.find(".sapUiCalItem");

		// assert
		assert.equal(aYears.length, 7, "Calendar: 7 years rendered");
		assert.equal(jQuery(aYears[0]).text(), "2012", "Calendar: first displayed year");
		assert.equal(jQuery(aYears[3]).attr("tabindex"), "0", "Calendar: 4. displayed year is focused");

		// clean up
		oCal.destroy();
	});

	QUnit.test("change block default days", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "3", "10")
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("click", "myCal--Head-B2");
		qutils.triggerEvent("click", "myCal--Head-prev");
		var $YearPicker = sap.ui.getCore().byId("myCal").getAggregation("yearPicker").$();
		var aYears = $YearPicker.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aYears[0]).text(), "2011", "Calendar: first displayed year");
		assert.equal(jQuery(aYears[1]).attr("tabindex"), "0", "Calendar: second displayed year is focused");
		qutils.triggerEvent("click", "myCal--Head-B2");

		// clean up
		oCal.destroy();
	});

	QUnit.test("change block 14 days", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "1", "2"),
			days: 14
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("click", "myCal--Head-B2");
		qutils.triggerEvent("click", "myCal--Head-next");
		var $YearPicker = sap.ui.getCore().byId("myCal").getAggregation("yearPicker").$();
		var aYears = $YearPicker.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aYears[0]).text(), "2019", "Calendar: first displayed year");
		assert.equal(jQuery(aYears[3]).attr("tabindex"), "0", "Calendar: 4. displayed year is focused");
		qutils.triggerEvent("click", "myCal--Head-B2");

		// clean up
		oCal.destroy();
	});

	QUnit.test("Min/Max", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2000", "1", "2"),
			minDate: new Date("2000", "1", "1"),
			maxDate: new Date("2050", "7", "31"),
			days: 14
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(!jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Calendar: Previous Button enabled");
		assert.ok(!jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Calendar: Next Button enabled");

		// act
		qutils.triggerEvent("click", "myCal--Head-B1");
		sap.ui.getCore().applyChanges();
		var $MonthPicker = sap.ui.getCore().byId("myCal").getAggregation("monthPicker").$();
		var aMonths = $MonthPicker.find(".sapUiCalItem");

		// assert
		assert.ok(jQuery(aMonths[0]).hasClass("sapUiCalItemDsbl"), "Calendar: January is disabled");
		assert.ok(!jQuery(aMonths[1]).hasClass("sapUiCalItemDsbl"), "Calendar: February is enabled");
		assert.ok(jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Calendar: Previous Button disabled");
		assert.ok(!jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Calendar: Next Button enabled");

		// act
		qutils.triggerEvent("click", "myCal--Head-B2");
		sap.ui.getCore().applyChanges();
		var $YearPicker = sap.ui.getCore().byId("myCal").getAggregation("yearPicker").$();
		var aYears = $YearPicker.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aYears[0]).text(), "2000", "Calendar: first displayed year");
		assert.ok(jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Calendar: Previous Button disabled");
		assert.ok(!jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Calendar: Next Button enabled");

		// act
		var $Date = jQuery("#myCal--YP-y20000101");
		$Date.focus();
		qutils.triggerKeydown($Date.get(0), jQuery.sap.KeyCodes.ENTER, false, false, false);
		qutils.triggerEvent("click", "myCal--Head-prev");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Calendar: Previous Button disabled");

		// act
		oCal.setStartDate(new Date(2050, 7, 17));
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(!jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Calendar: Previous Button enabled");
		assert.ok(!jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Calendar: Next Button enabled");

		// act
		qutils.triggerEvent("click", "myCal--Head-B1");
		sap.ui.getCore().applyChanges();
		$MonthPicker = sap.ui.getCore().byId("myCal").getAggregation("monthPicker").$();
		aMonths = $MonthPicker.find(".sapUiCalItem");

		// assert
		assert.ok(!jQuery(aMonths[2]).hasClass("sapUiCalItemDsbl"), "Calendar: August is enabled");
		assert.ok(jQuery(aMonths[3]).hasClass("sapUiCalItemDsbl"), "Calendar: September is disabled");
		assert.ok(!jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Calendar: Previous Button enabled");
		assert.ok(jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Calendar: Next Button disabled");

		// act
		qutils.triggerEvent("click", "myCal--Head-B2");
		sap.ui.getCore().applyChanges();
		$YearPicker = sap.ui.getCore().byId("myCal").getAggregation("yearPicker").$();
		aYears = $YearPicker.find(".sapUiCalItem");

		// assert
		assert.equal(jQuery(aYears[6]).text(), "2050", "Calendar: last displayed year");
		assert.ok(!jQuery("#myCal--Head-prev").hasClass("sapUiCalDsbl"), "Calendar: Previous Button enabled");
		assert.ok(jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Calendar: Next Button disabled");

		// act
		qutils.triggerEvent("click", "myCal--Head-B2");
		qutils.triggerEvent("click", "myCal--Head-next");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery("#myCal--Head-next").hasClass("sapUiCalDsbl"), "Calendar: Next Button disabled");

		// clean up
		oCal.destroy();
	});

	QUnit.module("Private API");
	QUnit.test("_getFocusedDate()", function(assert) {
		// Prepare
		var oCal = createCalendarDateInterval({
			startDate: new Date("2015", "1", "2")
		});

		// System under test
		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oOldFocusedDate = oCal._oFocusedDate;

		//Act
		oCal._getFocusedDate();

		//Assert
		assert.equal(oCal._oFocusedDate, oOldFocusedDate,
				"_getFocusedDate() does not change the oFocusedDate after initial calculation");

		var oNewDate = new Date(Date.UTC(2000, 1, 4));
		oCal.setProperty("startDate", oNewDate);

		//Act
		oCal._getFocusedDate(true);

		//Assert
		assert.equal(oCal._oFocusedDate.toUTCJSDate().toString(), oNewDate.toString(),
				"_getFocusedDate() changes the oFocusedDate if it's called with parameter bForceRecalculate = true");

		var oSpy = sinon.spy(oCal, "_getFocusedDate");

		//Act
		oCal.setStartDate(new Date(2000, 1, 4));

		assert.ok(oSpy.getCall(0).args[0], "When .setStartDate is called, _getFocusedDate is always forcing recalculation");

		// clean up
		oCal.destroy();
	});

	QUnit.test("_getMaxDateAlignedToMinDate should return provided maxDate if it is after the minDate", function (assert) {
		// Arrange
		var oResult,
			oMaxDate = new CalendarDate(2018, 10, 20),
			oMinDate = new CalendarDate(2018, 9, 20),
			oCalendarDateInterval = new CalendarDateInterval();

		// Act
		oResult = oCalendarDateInterval._getMaxDateAlignedToMinDate(oMaxDate, oMinDate);

		// Assert
		assert.deepEqual(oResult, oMaxDate, "new date should be same as the maxDate");

		// Cleanup
		oCalendarDateInterval.destroy();
	});

	QUnit.test("_getMaxDateAlignedToMinDate should return maxDate plus number of days to show minus one if it is before the minDate", function (assert) {
		// Arrange
		var oResult,
			iDays = 6,
			oMaxDate = new CalendarDate(2018, 9, 20),
			oMinDate = new CalendarDate(2018, 10, 20),
			oCalendarDateInterval = new CalendarDateInterval(),
			oGetDaysStub = this.stub(oCalendarDateInterval, "_getDays", function () { return iDays; });

		// Act
		oResult = oCalendarDateInterval._getMaxDateAlignedToMinDate(oMaxDate, oMinDate);

		// Assert
		assert.deepEqual(oResult.getDate(), oMaxDate.getDate() + iDays - 1, "new date should be calculated correctly");

		// Cleanup
		oGetDaysStub.restore();
		oCalendarDateInterval.destroy();
	});

	QUnit.test("_getStartDateAlignedToMinAndMaxDate should return the startDate if it is between max and min dates", function (assert) {
		// Arrange
		var oResult,
			oMinDate = new CalendarDate(2018, 9, 20),
			oStartDate = new CalendarDate(2018, 10, 20),
			oMaxDate = new CalendarDate(2018, 11, 20),
			oCalendarDateInterval = new CalendarDateInterval();

		// Act
		oResult = oCalendarDateInterval._getStartDateAlignedToMinAndMaxDate(oMaxDate, oMinDate, oStartDate);

		// Assert
		assert.deepEqual(oResult, oStartDate, "startDate should be returned");

		// Cleanup
		oCalendarDateInterval.destroy();
	});

	QUnit.test("_getStartDateAlignedToMinAndMaxDate should return the minDate if startDate is before it", function (assert) {
		// Arrange
		var oResult,
				oMinDate = new CalendarDate(2018, 10, 20),
				oStartDate = new CalendarDate(2018, 9, 20),
				oMaxDate = new CalendarDate(2018, 11, 20),
				oCalendarDateInterval = new CalendarDateInterval();

		// Act
		oResult = oCalendarDateInterval._getStartDateAlignedToMinAndMaxDate(oMaxDate, oMinDate, oStartDate);

		// Assert
		assert.deepEqual(oResult, oMinDate, "minDate should be returned");

		// Cleanup
		oCalendarDateInterval.destroy();
	});

	QUnit.test("_getStartDateAlignedToMinAndMaxDate should return the maxDate if startDate is after it", function (assert) {
		// Arrange
		var oResult,
				oMinDate = new CalendarDate(2018, 9, 20),
				oStartDate = new CalendarDate(2018, 11, 20),
				oMaxDate = new CalendarDate(2018, 10, 20),
				oCalendarDateInterval = new CalendarDateInterval();

		// Act
		oResult = oCalendarDateInterval._getStartDateAlignedToMinAndMaxDate(oMaxDate, oMinDate, oStartDate);

		// Assert
		assert.deepEqual(oResult, oMaxDate, "maxDate should be returned");

		// Cleanup
		oCalendarDateInterval.destroy();
	});

	QUnit.test("_calculateStartDate should call _getMaxDateAlignedToMinDate and _getStartDateAlignedToMinAndMaxDate with correct params", function (assert) {
		// Arrange
		var iDays = 6,
			oExpectedCalculatedMaxDate = new CalendarDate(2018, 11, 20 - iDays + 1),
			oStartDate = new CalendarDate(2018, 10, 20),
			oCalendarDateInterval = new CalendarDateInterval({ maxDate: new Date(2018, 11, 20) }),
			ogetMaxDateAlignedToMinDateSpy = this.spy(oCalendarDateInterval, "_getMaxDateAlignedToMinDate"),
			oAlignStartDateToMinAndMaxSpy = this.spy(oCalendarDateInterval, "_getStartDateAlignedToMinAndMaxDate"),
			oGetDaysStub = this.stub(oCalendarDateInterval, "_getDays", function () { return iDays; });

		// Act
		oCalendarDateInterval._calculateStartDate(oCalendarDateInterval._oMaxDate, oCalendarDateInterval._oMinDate, oStartDate);

		// Assert
		assert.equal(ogetMaxDateAlignedToMinDateSpy.getCall(0).args[0].toString(), oExpectedCalculatedMaxDate.toString(), "_getMaxDateAlignedToMinDate is called with right maxDate");
		assert.equal(oAlignStartDateToMinAndMaxSpy.getCall(0).args[0].toString(), oExpectedCalculatedMaxDate.toString(), "_getStartDateAlignedToMinAndMaxDate is called with right maxDate");

		// Cleanup
		ogetMaxDateAlignedToMinDateSpy.restore();
		oAlignStartDateToMinAndMaxSpy.restore();
		oGetDaysStub.restore();
		oCalendarDateInterval.destroy();
	});

	QUnit.test("_setHeaderText", function(assert) {
		//arrange
		var oCalendarDateInterval = new CalendarWeekInterval();
		var oHeader = oCalendarDateInterval.getAggregation("header");
		var oSetHeaderTextSpy = this.spy(oHeader, "setTextButton1");
		var oSetHeaderAriaSpy = this.spy(oHeader, "setAriaLabelButton1");
		//simulate as if it is in a planning calendar
		var oGetPickerPopupStub = this.stub(oCalendarDateInterval, "getPickerPopup", function() {return true;});
		var sDelimiter = LocaleData.getInstance(new sap.ui.core.Locale("en-US")).getIntervalPattern().replace("{0}", "").replace("{1}", "");

		//act
		oCalendarDateInterval._setHeaderText(new CalendarDate(2017, 11, 31));

		//assert
		assert.equal(oSetHeaderTextSpy.lastCall.args[0], "December 2017" + sDelimiter + "January 2018", "text of the header is ok");
		assert.equal(oSetHeaderAriaSpy.lastCall.args[0], "December 2017" + sDelimiter + "January 2018", "aria of the header is ok");

		//clean
		oGetPickerPopupStub.restore();
		oSetHeaderTextSpy.restore();
		oSetHeaderAriaSpy.restore();
		oCalendarDateInterval.destroy();
		oCalendarDateInterval = null;
		oHeader = null;
	});

	QUnit.module("Calendar Picker");
	QUnit.test("Chosen date from the date picker is set as start date of the underying view", function(assert) {
		// arrange
		var $Date,
			oCalP = new CalendarDateInterval("CalP",{
						startDate: new Date("2015", "7", "13"),
						pickerPopup: true
					}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		assert.ok(!jQuery("#CalP--Cal").get(0), "Calendar3: Calendar picker not initial rendered");
		qutils.triggerEvent("click", "CalP--Head-B1");
		assert.ok(jQuery("#CalP--Cal").get(0), "Calendar picker rendered");
		assert.equal(jQuery("#CalP--Cal").parent().attr("id"), "sap-ui-static", "Calendar picker rendered in static area");
		assert.ok(jQuery(jQuery("#CalP--Cal").get(0)).is(":visible"), "Calendar picker visible");

		// select 14.08.2015
		$Date = jQuery("#CalP--Cal--Month0-20150814");
		$Date.focus();
		qutils.triggerKeyboardEvent($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);

		assert.equal(sap.ui.getCore().byId("CalP").getStartDate().getDate(), 14, "start date is set correctly");

		assert.ok(jQuery("#CalP--Cal").get(0), "Calendar picker still rendered after closing");
		assert.ok(!jQuery(jQuery("#CalP--Cal").get(0)).is(":visible"), "Calendar picker not visible after closing");

		// clean
		oCalP.destroy();
	});

	QUnit.test("fireStartDateChange", function(assert) {
		// arrange
		var $Date, oCalStartDate,
			oSpyFireDateChange = this.spy(sap.ui.unified.CalendarDateInterval.prototype, "fireStartDateChange"),
			oCalP = new CalendarDateInterval("CalP",{
						startDate: new Date("2015", "7", "13"),
						pickerPopup: true
					}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		assert.ok(!jQuery("#CalP--Cal").get(0), "Calendar picker not initial rendered");
		qutils.triggerEvent("click", "CalP--Head-B1");

		// click on Month button inside calendar picker
		qutils.triggerEvent("click", "CalP--Cal--Head-B1");
		// click on September
		$Date = jQuery("#CalP--Cal--MP-m8");
		$Date.focus();
		qutils.triggerKeyboardEvent($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);

		// click on Year button inside calendar picker
		qutils.triggerEvent("click", "CalP--Cal--Head-B2");
		// click on 2016
		$Date = jQuery("#CalP--Cal--YP-y20160101");
		$Date.focus();
		qutils.triggerKeyboardEvent($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);

		// click on 14 of September
		$Date = jQuery("#CalP--Cal--Month0-20160914");
		$Date.focus();
		qutils.triggerKeyboardEvent($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);

		oCalStartDate = sap.ui.getCore().byId("CalP").getStartDate();

		assert.equal(oCalStartDate.getDate(), 14, "start date, date is set correctly");
		assert.equal(oCalStartDate.getMonth(), 8, "start date, month is set correctly");
		assert.equal(oCalStartDate.getFullYear(), 2016, "start date, year is set correctly");
		assert.strictEqual(oSpyFireDateChange.callCount, 1, "CalendarDateInterval 'fireStartDateChange' was called once after selecting month, year and date");

		// clean
		oCalP.destroy();
	});

	QUnit.test("User opens the picker but escapes it - click outside for desktop or click cancel button", function(assert) {
		// arrange
		var oSpyCancel = this.spy(sap.ui.unified.CalendarDateInterval.prototype, "fireCancel");
		var oCalP = new CalendarDateInterval("CalP",{
			pickerPopup: true
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("click", "CalP--Head-B1");
		assert.ok(jQuery(jQuery("#CalP--Cal").get(0)).is(":visible"), "Calendar picker visible");

		sap.ui.test.qunit.triggerKeydown(sap.ui.getCore().byId("CalP").getFocusDomRef(), jQuery.sap.KeyCodes.ESCAPE);
		assert.ok(!jQuery(jQuery("#CalP--Cal").get(0)).is(":visible"), "Calendar picker not visible after closing");
		assert.strictEqual(oSpyCancel.callCount, 1, "CalendarDateInterval 'fireCancel' was called once");

		// clean
		oCalP.destroy();
	});


	QUnit.test("User opens date picker from the button and sees a predefined range of days marked in the date picker.", function(assert) {
		// arrange
		var oCalPicker,
			$Date,
			oCalP = new CalendarDateInterval("CalP",{
						startDate: new Date("2017", "7", "10"),
						pickerPopup: true
					}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("click", "CalP--Head-B1");
		assert.ok(jQuery(jQuery("#CalP--Cal").get(0)).is(":visible"), "Calendar picker visible");

		oCalPicker = oCalP.getAggregation("calendarPicker");

		// check for selected date range
		assert.strictEqual(oCalPicker.getSelectedDates()[0].getStartDate().getDate(), 10, "start date is 10");
		assert.strictEqual(oCalPicker.getSelectedDates()[0].getEndDate().getDate(), 16, "end date is 16");

		// click on 17 of August 2017
		$Date = jQuery("#CalP--Cal--Month0-20170817");
		$Date.focus();
		qutils.triggerKeyboardEvent($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);

		// open again the CalendarPicker
		qutils.triggerEvent("click", "CalP--Head-B1");

		// check for the selected date range
		assert.strictEqual(oCalPicker.getSelectedDates()[0].getStartDate().getDate(), 17, "start date is 17");
		assert.strictEqual(oCalPicker.getSelectedDates()[0].getEndDate().getDate(), 23, "end date is 23");

		sap.ui.test.qunit.triggerKeydown(sap.ui.getCore().byId("CalP").getFocusDomRef(), jQuery.sap.KeyCodes.ESCAPE);

		// clean
		oCalP.destroy();
	});

	QUnit.test("Text of the direct navigation button is correct", function(assert) {
		// arrange
		var $Date,
			oCalP = new CalendarDateInterval("CalP",{
						startDate: new Date("2017", "4", "11"),
						pickerPopup: true
					}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("click", "CalP--Head-B1");

		// click on Month button inside calendar picker
		qutils.triggerEvent("click", "CalP--Cal--Head-B1");
		// click on December
		$Date = jQuery("#CalP--Cal--MP-m11");
		$Date.focus();
		qutils.triggerKeydown($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);

		// click on 11 of December
		$Date = jQuery("#CalP--Cal--Month0-20171211");
		$Date.focus();
		qutils.triggerKeydown($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(jQuery("#CalP--Head-B1").text(), "December 2017", "button text is correct");

		// clean
		oCalP.destroy();
	});

	QUnit.test("Changing of the pickerPopup mode doesn't break min and max date inside yearPicker aggregation", function(assert) {
		// arrange
		var oCalP = new CalendarDateInterval("CalP",{
			pickerPopup: false
			}),
			oYearPicker = oCalP.getAggregation("yearPicker");

		// initialy the yearPicker has default values for min and max year
		assert.strictEqual(oYearPicker._oMinDate.getYear(), 1, "min year is set to 1");
		assert.strictEqual(oYearPicker._oMaxDate.getYear(), 9999, "max year is set to 9999");

		// change the pickerPopup to true, this will destroy the yearPicker aggregation
		oCalP.setPickerPopup(true);
		// set new min and max dates
		oCalP.setMinDate(new Date("2015", "7", "13", "8", "0", "0"));
		oCalP.setMaxDate(new Date("2017", "7", "13", "8", "0", "0"));

		// return pickrPopup property to true, this will create the yearPicker aggregation
		oCalP.setPickerPopup(false);
		oYearPicker = oCalP.getAggregation("yearPicker");

		// check if the yearPicker has the newly setted min and max date of the Interval control
		assert.strictEqual(oYearPicker._oMinDate.getYear(), 2015, "min year is set to 2015");
		assert.strictEqual(oYearPicker._oMaxDate.getYear(), 2017, "max year is set to 2017");

		// clean
		oCalP.destroy();
	});

	QUnit.test("Changing of the pickerPopup mode doesn't break min and max date inside calendarPicker aggregation", function(assert) {
		// arrange
		var oCalPicker,
			oCalP = new CalendarDateInterval("CalP",{
				pickerPopup: true
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// open calendarPicker
		qutils.triggerEvent("click", "CalP--Head-B1");

		oCalPicker = oCalP.getAggregation("calendarPicker");

		// initialy the yearPicker has default values for min and max year
		assert.strictEqual(oCalPicker._oMinDate.getYear(), 1, "min year is set to 1");
		assert.strictEqual(oCalPicker._oMaxDate.getYear(), 9999, "max year is set to 9999");

		// close calendarPicker
		sap.ui.test.qunit.triggerKeydown(sap.ui.getCore().byId("CalP").getFocusDomRef(), jQuery.sap.KeyCodes.ESCAPE);
		sap.ui.getCore().applyChanges();

		// change the pickerPopup to false
		oCalP.setPickerPopup(false);
		// set new min and max dates
		oCalP.setMinDate(new Date("2015", "7", "13", "8", "0", "0"));
		oCalP.setMaxDate(new Date("2017", "7", "13", "8", "0", "0"));

		// return pickerPopup property to true, this will create the calendarPicker aggregation
		oCalP.setPickerPopup(true);

		// open calendarPicker
		qutils.triggerEvent("click", "CalP--Head-B1");

		oCalPicker = oCalP.getAggregation("calendarPicker");

		// check if the yearPicker has the newly setted min and max date of the Interval control
		assert.strictEqual(oCalPicker._oMinDate.getYear(), 2015, "min year is set to 2015");
		assert.strictEqual(oCalPicker._oMaxDate.getYear(), 2017, "max year is set to 2017");

		sap.ui.test.qunit.triggerKeydown(sap.ui.getCore().byId("CalP").getFocusDomRef(), jQuery.sap.KeyCodes.ESCAPE);
		// clean
		oCalP.destroy();
	});

	QUnit.test("Triggering button receives the focus on picker ESC", function(assert) {
		// arrange
		var oCalP = new CalendarDateInterval("CalP",{
				pickerPopup: true
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// open calendarPicker
		qutils.triggerEvent("click", "CalP--Head-B1");

		// close calendarPicker
		sap.ui.test.qunit.triggerKeydown(document.activeElement, jQuery.sap.KeyCodes.ESCAPE);

		// check if the triggering button receives the focus after picker close
		assert.strictEqual(document.activeElement.id, oCalP.getAggregation("header").getDomRef("B1").id, "After picker close the triggering button receives the focus");

		// clean
		oCalP.destroy();
	});

	// BCP: 1780521519
	QUnit.test("Closing the picker will remove the overlay", function (assert) {
		// arrange
		var oCalP = new CalendarDateInterval("CalP", {
				pickerPopup: true
			}).placeAt("qunit-fixture"),
			oCloseCalendarPickerStub = this.spy(oCalP, "_closeCalendarPicker"),
			oHideOverlayStub = this.spy(oCalP, "_hideOverlay");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("click", "CalP--Head-B1");
		oCalP._oPopup.close();

		// assert
		assert.ok(oCloseCalendarPickerStub.calledOnce, "_closeCalendarPicker method should be called");
		assert.ok(oHideOverlayStub.calledOnce, "_hideOverlay method should be called");
		assert.equal(oCalP.$("contentOver").css("display"), "none", "overlay should be with display: none style");

		// cleanup
		oCloseCalendarPickerStub.restore();
		oCalP.destroy();
	});

	QUnit.test("Content overlay is shown when picker is open", function(assert) {
		// arrange
		var oCalP = new CalendarDateInterval("CalP",{
			pickerPopup: true
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();
		// open calendarPicker
		qutils.triggerEvent("click", "CalP--Head-B1");
		// Make rendering sync, so we can assert safely
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oCalP.$("contentOver").get(0).style.display, "", "After opening the picker overlay is shown");

		// close calendarPicker
		sap.ui.test.qunit.triggerKeydown(document.activeElement, jQuery.sap.KeyCodes.ESCAPE);

		// clean
		oCalP.destroy();
	});

	QUnit.module("WeekNumbers");

	QUnit.test("DatesRow getWeekNumbers", function(assert) {
		//arrange
		var oDatesRow = new DatesRow({
			startDate: new Date(2016, 11, 26),
			days: 14
		});

		//act
		var aWeekNumbers = oDatesRow.getWeekNumbers();

		//assert
		assert.equal(aWeekNumbers.length, 3, "we get week info for 3 weeks");

		assert.equal(aWeekNumbers[0].len, 6, "first week is with 6 displayed days");
		assert.equal(aWeekNumbers[1].len, 7, "second week is with 7 displayed days");
		assert.equal(aWeekNumbers[2].len, 1, "last week is with 1 displayed day");

		assert.equal(aWeekNumbers[0].number, 53, "first week number is correct");
		assert.equal(aWeekNumbers[1].number, 1, "second week number is correct");
		assert.equal(aWeekNumbers[2].number, 2, "last week number is correct");

		//clean
		oDatesRow.destroy();
	});

	return waitForThemeApplied();
});