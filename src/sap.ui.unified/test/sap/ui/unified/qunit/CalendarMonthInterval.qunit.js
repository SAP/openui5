/*global QUnit, sinon, window */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/unified/CalendarMonthInterval",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/m/Button",
	"sap/ui/unified/library"
], function(qutils, CalendarMonthInterval, CalendarLegend, CalendarLegendItem,
	DateRange, DateTypeRange, Button, unifiedLibrary) {
	"use strict";

	// set language to en-US, since we have specific language strings tested
	sap.ui.getCore().getConfiguration().setLanguage("en_US");

	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var bSelectFired = false;
	var oSelectedDate;

	var bStartDateChanged = false;
	var handleStartDateChange = function(oEvent){
		bStartDateChanged = true;
	};

	var _assertFocus = function(oTarget, sMsg, assert) {
		var $activeElement = document.activeElement;
		assert.ok($activeElement, "There should be an active element. " +  sMsg);
		if ($activeElement) {
			assert.strictEqual($activeElement.id, oTarget.id, "Element with id: [" + oTarget.id + "] should be focused. " + sMsg);
		}
	};

	var oCal1 = new CalendarMonthInterval("Cal1",{
		select: function(oEvent){
			bSelectFired = true;
			var oCalendar = oEvent.oSource;
			var aSelectedDates = oCalendar.getSelectedDates();
			if (aSelectedDates.length > 0 ) {
				oSelectedDate = aSelectedDates[0].getStartDate();
			}
		},
		startDateChange: handleStartDateChange
	}).placeAt("content");

	var oLegend = new CalendarLegend("Legend1", {
		items: [
				new CalendarLegendItem("T1", {type: CalendarDayType.Type01, text: "Type 1"}),
				new CalendarLegendItem("T2", {type: CalendarDayType.Type02, text: "Type 2"}),
				new CalendarLegendItem("T3", {type: CalendarDayType.Type03, text: "Type 3"}),
				new CalendarLegendItem("T4", {type: CalendarDayType.Type04, text: "Type 4"}),
				new CalendarLegendItem("T5", {type: CalendarDayType.Type05, text: "Type 5"}),
				new CalendarLegendItem("T6", {type: CalendarDayType.Type06, text: "Type 6"}),
				new CalendarLegendItem("T7", {type: CalendarDayType.Type07, text: "Type 7"}),
				new CalendarLegendItem("T8", {type: CalendarDayType.Type08, text: "Type 8"}),
				new CalendarLegendItem("T9", {type: CalendarDayType.Type09, text: "Type 9"}),
				new CalendarLegendItem("T10", {type: CalendarDayType.Type10, text: "Type 10"})
				]
	});

	var oCal2 = new CalendarMonthInterval("Cal2",{
		startDateChange: handleStartDateChange,
		width: "1500px",
		startDate: new Date("2015", "7", "4"),
		minDate: new Date("2000", "1", "1"),
		maxDate: new Date("2050", "7", "31"),
		months: 18,
		intervalSelection: true,
		pickerPopup: true,
		selectedDates: [new DateRange({startDate: new Date("2015", "11", "4"), endDate: new Date("2016", "1", "6")})],
		specialDates: [new DateTypeRange({startDate: new Date("2015", "8", "8"), type: CalendarDayType.Type01, tooltip: "Text"}),
						new DateTypeRange({startDate: new Date("2015", "9", "9"), endDate: new Date("2015", "10", "10"), type: CalendarDayType.Type02, tooltip: "Text"})],
		legend: oLegend
	}).placeAt("content");

	var oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMdd"});

	QUnit.module("Rendering");

	QUnit.test("rendered months", function(assert) {
		// use sinon to simulate the June 24th 2015
		sinon.useFakeTimers(Date.UTC(2015, 6, 24));
		var oToday = new Date();
		oToday.setDate(1);
		var oCal = new CalendarMonthInterval("Cal",{}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var $MonthsRow = sap.ui.getCore().byId("Cal").getAggregation("monthsRow").$();
		var aMonths = $MonthsRow.find(".sapUiCalItem");
		assert.equal(aMonths.length, 12, "Calendar1: 12 months rendered");
		assert.equal(jQuery(aMonths[0]).attr("data-sap-month"), oFormatYyyymmdd.format(oToday), "Calendar1: curent date is in first month");

		$MonthsRow = sap.ui.getCore().byId("Cal2").getAggregation("monthsRow").$();
		aMonths = $MonthsRow.find(".sapUiCalItem");
		assert.equal(aMonths.length, 18, "Calendar2: 18 months rendered");
		assert.equal(jQuery(aMonths[0]).attr("data-sap-month"), "20150801", "Calendar2: first month");
		assert.equal(jQuery(aMonths[0]).text(), "August", "Calendar2: first month name is long");

		oCal.destroy();
	});

	QUnit.test("Header", function(assert) {
		assert.ok(!jQuery("#Cal1--Head-B1").get(0), "Calendar1: Header button 1 not shown");
		assert.ok(jQuery("#Cal1--Head-B2").get(0), "Calendar1: year button shown");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "2015 – 2017", "Calendar2: year 2015 - 2017 shown");
	});

	QUnit.test("width", function(assert) {
		assert.ok(!jQuery("#Cal1").attr("style"), "Calendar1: no width set");
		assert.equal(jQuery("#Cal2").css("width"), "1500px", "Calendar2: width set");
	});

	QUnit.test("selected days", function(assert) {
		assert.ok(!jQuery("#Cal2--MonthsRow-20151101").hasClass("sapUiCalItemSel"), "201511 is not selected");
		assert.ok(jQuery("#Cal2--MonthsRow-20151201").hasClass("sapUiCalItemSel"), "201512 is selected");
		assert.ok(jQuery("#Cal2--MonthsRow-20151201").hasClass("sapUiCalItemSelStart"), "201512 is selection start");
		assert.ok(!jQuery("#Cal2--MonthsRow-20151201").hasClass("sapUiCalItemSelBetween"), "201512 is not selected between");
		assert.ok(!jQuery("#Cal2--MonthsRow-20151201").hasClass("sapUiCalItemSelEnd"), "201512 is not selection end");
		assert.ok(jQuery("#Cal2--MonthsRow-20160101").hasClass("sapUiCalItemSel"), "201601 is selected");
		assert.ok(!jQuery("#Cal2--MonthsRow-20160101").hasClass("sapUiCalItemSelStart"), "201601 is not selection start");
		assert.ok(jQuery("#Cal2--MonthsRow-20160101").hasClass("sapUiCalItemSelBetween"), "201601 is selected between");
		assert.ok(!jQuery("#Cal2--MonthsRow-20160101").hasClass("sapUiCalItemSelEnd"), "201601 is not selection end");
		assert.ok(jQuery("#Cal2--MonthsRow-20160201").hasClass("sapUiCalItemSel"), "201602 is selected");
		assert.ok(!jQuery("#Cal2--MonthsRow-20160201").hasClass("sapUiCalItemSelStart"), "201602 is not selection start");
		assert.ok(!jQuery("#Cal2--MonthsRow-20160201").hasClass("sapUiCalItemSelBetween"), "201602 is not selected between");
		assert.ok(jQuery("#Cal2--MonthsRow-20160201").hasClass("sapUiCalItemSelEnd"), "201602 is selection end");
		assert.ok(!jQuery("#Cal2--MonthsRow-20160301").hasClass("sapUiCalItemSel"), "201603 is not selected");
	});

	QUnit.test("special days", function(assert) {
		assert.ok(jQuery("#Cal2--MonthsRow-20150901").hasClass("sapUiCalItemType01"), "201509 is special month of Type01");
		assert.equal(jQuery("#Cal2--MonthsRow-20150901").attr("title"), "Text", "201509 has special days tooltip");
		assert.equal(jQuery("#Cal2--MonthsRow-20150901").attr("aria-label"), "September 2015; Type 1", "201509 has special days tooltip");
		assert.ok(jQuery("#Cal2--MonthsRow-20151001").hasClass("sapUiCalItemType02"), "201510 is special month of Type02");
		assert.equal(jQuery("#Cal2--MonthsRow-20151001").attr("title"), "Text", "201510 has special days tooltip");
		assert.equal(jQuery("#Cal2--MonthsRow-20151001").attr("aria-label"), "October 2015; Type 2", "201510 has special days tooltip");
		assert.ok(jQuery("#Cal2--MonthsRow-20151101").hasClass("sapUiCalItemType02"), "201511 is special month of Type02");
		assert.equal(jQuery("#Cal2--MonthsRow-20151101").attr("title"), "Text", "201511 has special days tooltip");
		assert.equal(jQuery("#Cal2--MonthsRow-20151101").attr("aria-label"), "November 2015; Type 2", "201511 has special days tooltip");
	});

	QUnit.module("change date via API");

	QUnit.test("setStartDate", function(assert) {
		oCal1.setStartDate(new Date("2015", "2", "10"));
		var $MonthsRow = sap.ui.getCore().byId("Cal1").getAggregation("monthsRow").$();
		var aMonths = $MonthsRow.find(".sapUiCalItem");
		assert.equal(jQuery(aMonths[0]).attr("data-sap-month"), "20150301", "Calendar1: new start month");
	});

	QUnit.test("focusDate", function(assert) {
		oCal2.focusDate(new Date("2015", "8", "11"));
		var oStartDate = oCal2.getStartDate();
		assert.equal(oFormatYyyymmdd.format(oStartDate), "20150804", "Calendar2: start date not changed");
		var $MonthsRow = sap.ui.getCore().byId("Cal2").getAggregation("monthsRow").$();
		var aMonths = $MonthsRow.find(".sapUiCalItem");
		assert.equal(jQuery(aMonths[0]).attr("data-sap-month"), "20150801", "Calendar2: rendered start month not changed");
		assert.equal(jQuery(aMonths[1]).attr("tabindex"), "0", "Calendar2: second month has focus");

		oCal2.focusDate(new Date("2014", "3", "11"));
		oStartDate = oCal2.getStartDate();
		assert.equal(oFormatYyyymmdd.format(oStartDate), "20140301", "Calendar2: new start date");
		aMonths = $MonthsRow.find(".sapUiCalItem");
		assert.equal(jQuery(aMonths[0]).attr("data-sap-month"), "20140301", "Calendar2: new start month rendered");
		assert.equal(jQuery(aMonths[1]).attr("tabindex"), "0", "Calendar2: second month still has focus");

		// BCP 1780270593
		try {
			oCal2.focusDate(null);
			assert.ok(true, "focusDate() is called successfully with 'null'");
		} catch (e) {
			assert.ok(false, "focusDate() throws error when called with 'null'!");
		}
	});

	QUnit.module("change date via navigation");

	QUnit.test("next/prev months", function(assert) {
		bStartDateChanged = false;
		qutils.triggerEvent("click", "Cal2--Head-next");
		assert.ok(bStartDateChanged, "Calendar2: startDateChangeEvent fired");
		var oStartDate = oCal2.getStartDate();
		assert.equal(oFormatYyyymmdd.format(oStartDate), "20150901", "Calendar2: new start date");
		var $MonthsRow = sap.ui.getCore().byId("Cal2").getAggregation("monthsRow").$();
		var aMonths = $MonthsRow.find(".sapUiCalItem");
		assert.equal(jQuery(aMonths[0]).attr("data-sap-month"), "20150901", "Calendar2: new start month rendered");
		assert.equal(jQuery(aMonths[1]).attr("tabindex"), "0", "Calendar2: second month still has focus");

		bStartDateChanged = false;
		qutils.triggerEvent("click", "Cal2--Head-prev");
		assert.ok(bStartDateChanged, "Calendar2: startDateChangeEvent fired");
		oStartDate = oCal2.getStartDate();
		assert.equal(oFormatYyyymmdd.format(oStartDate), "20140301", "Calendar2: new start date");
		aMonths = $MonthsRow.find(".sapUiCalItem");
		assert.equal(jQuery(aMonths[0]).attr("data-sap-month"), "20140301", "Calendar2: new start month rendered");
		assert.equal(jQuery(aMonths[1]).attr("tabindex"), "0", "Calendar2: second month still has focus");
	});

	QUnit.test("After Rerendering, last focused month is still focused", function(assert) {
		//Prepare
		var oCalendarMonthInt = new CalendarMonthInterval();
		oCalendarMonthInt.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var $MonthsRow = oCalendarMonthInt.getAggregation("monthsRow").$();
		var aMonths = $MonthsRow.find(".sapUiCalItem");
		aMonths[1].focus();

		//Act
		oCalendarMonthInt.rerender();
		sap.ui.getCore().applyChanges();

		//Assert
		_assertFocus(aMonths[1], "Calendar: after rerendering  second month still has focus", assert);
		oCalendarMonthInt.destroy();
	});

	QUnit.test("After Rerendering, the focus is not stolen from an external control (i.e. a button)", function(assert) {
		//Prepare
		var oCalendarMonthInt = new CalendarMonthInterval(),
				oExternalControl = new Button("extControl");

		oCalendarMonthInt.placeAt("qunit-fixture");
		oExternalControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oExternalControl.$().focus();
		_assertFocus(oExternalControl.getDomRef(), "Prerequisites check: 'extControl' should be focused", assert);

		//Act
		oCalendarMonthInt.rerender();

		//Assert
		_assertFocus(oExternalControl.getDomRef(), "After rerendering, the focus should stay on the 'extControl'", assert);
		oCalendarMonthInt.destroy();
		oExternalControl.destroy();
	});

	QUnit.module("YearPicker");

	QUnit.test("displayed years", function(assert) {
		assert.ok(!jQuery("#Cal1--YP").get(0), "Calendar1: Year picker not initial rendered");
		qutils.triggerEvent("click", "Cal1--Head-B2");
		assert.ok(jQuery("#Cal1--YP").get(0), "Calendar1: Year picker rendered");
		assert.equal(jQuery("#Cal1--YP").parent().attr("id"), "Cal1-content", "Calendar1: year picker rendered in Calendar");
		assert.ok(jQuery(jQuery("#Cal1--YP").get(0)).is(":visible"), "Calendar1: Year picker visible");
		var $YearPicker = sap.ui.getCore().byId("Cal1").getAggregation("yearPicker").$();
		var aYears = $YearPicker.find(".sapUiCalItem");
		assert.equal(aYears.length, 6, "Calendar1: 6 Years rendered");
		assert.equal(jQuery(aYears[0]).text(), "2012", "Calendar1: first displayed year");
		assert.equal(jQuery(aYears[3]).attr("tabindex"), "0", "Calendar1: 4. displayed year is focused");
	});

	QUnit.test("change block", function(assert) {
		qutils.triggerEvent("click", "Cal1--Head-prev");
		var $YearPicker = sap.ui.getCore().byId("Cal1").getAggregation("yearPicker").$();
		var aYears = $YearPicker.find(".sapUiCalItem");
		assert.equal(jQuery(aYears[0]).text(), "2006", "Calendar1: first displayed year");
		assert.equal(jQuery(aYears[3]).attr("tabindex"), "0", "Calendar1: 4. displayed year is focused");
		qutils.triggerEvent("click", "Cal1--Head-B2");
		assert.ok(jQuery("#Cal1--YP").get(0), "Calendar1: Year picker still rendered after closing");
		assert.ok(!jQuery(jQuery("#Cal1--YP").get(0)).is(":visible"), "Calendar1: Year picker not visible after closing");
	});

	QUnit.module("Interaction");

	QUnit.test("year switch", function(assert) {
		bStartDateChanged = false;
		qutils.triggerEvent("click", "Cal1--Head-B2");
		sap.ui.getCore().applyChanges();
		var $NewYear = jQuery("#Cal1--YP-y20130101"); // use keybord to select year to prevent event processing from ItemNavigation
		$NewYear.focus();
		qutils.triggerKeydown($NewYear.get(0), jQuery.sap.KeyCodes.ENTER, false, false, false);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery(jQuery("#Cal1--YP").get(0)).is(":visible"), "Calendar1: Year picker not visible after selecting year");
		assert.equal(jQuery("#Cal1--Head-B2").text(), "2013 – 2014", "Calendar1: year 2013 - 2014 shown");
		var $MonthsRow = sap.ui.getCore().byId("Cal1").getAggregation("monthsRow").$();
		var aMonths = $MonthsRow.find(".sapUiCalItem");
		assert.equal(jQuery(aMonths[0]).attr("data-sap-month"), "20130301", "Calendar1: new start month");
		assert.ok(bStartDateChanged, "Calendar1: startDateChangeEvent fired");
	});

	QUnit.test("getSelectedDates returns the right values", function (assert) {
		// Prepare
		var oCalMonthInterval = new CalendarMonthInterval({
				primaryCalendarType: sap.ui.core.CalendarType.Gregorian
			}),
			oYearPicker = oCalMonthInterval.getAggregation("yearPicker"),
			aSelectedDays;

		// Act
		oCalMonthInterval.addSelectedDate(new DateRange(new Date("1/1/2019"), new Date("1/1/2021")));
		aSelectedDays  = oYearPicker.getSelectedDates();

		// Assert
		assert.deepEqual(aSelectedDays, oCalMonthInterval.getSelectedDates(),
			"YearPicker has selected dates control origin set");

		// Clean
		oCalMonthInterval.destroy();
	});

	QUnit.test("Min/Max", function(assert) {
		oCal1.focusDate(new Date(9998, 10, 10));
		assert.ok(!jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button enabled");
		assert.ok(!jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Next Button enabled");
		qutils.triggerEvent("click", "Cal1--Head-next");
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button enabled on max month");
		assert.ok(jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Next Button disabled on max month");
		qutils.triggerEvent("click", "Cal1--Head-B2");
		sap.ui.getCore().applyChanges();
		var aYears = jQuery("#Cal1--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[aYears.length - 1]).text(), "9999", "Max Year is last rendered year");
		qutils.triggerEvent("click", "Cal1--Head-B2");
		sap.ui.getCore().applyChanges();

		var oDate = new Date(2,1,1);
		oDate.setFullYear(2);
		oCal1.focusDate(oDate);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button enabled");
		assert.ok(!jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Next Button enabled");
		qutils.triggerEvent("click", "Cal1--Head-prev");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button disabled on min month");
		assert.ok(!jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Next Button enabled on min month");
		qutils.triggerEvent("click", "Cal1--Head-B2");
		sap.ui.getCore().applyChanges();
		aYears = jQuery("#Cal1--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[0]).text(), "0001", "Min Year is first rendered year");
		qutils.triggerEvent("click", "Cal1--Head-B2");

		oCal1.focusDate(new Date(2013, 1, 1));
	});

	QUnit.test("select event", function(assert) {
		var $selectMonth = jQuery("#Cal1--MonthsRow-20130501");
		bSelectFired = false;
		oSelectedDate = undefined;
		$selectMonth.focus();
		qutils.triggerKeyboardEvent($selectMonth[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.ok(bSelectFired, "Select event fired");
		assert.equal(oFormatYyyymmdd.format(oSelectedDate), "20130501", "Month was selected");
		assert.ok($selectMonth.hasClass("sapUiCalItemSel"), "Month marked as selected");
	});

	QUnit.module("Calendar Picker");

	QUnit.test("Chosen date from the year picker is set as start date of the underying view, fireStartDateChange event is called once", function(assert) {
		// arrange
		var oSpyFireDateChange = this.spy(sap.ui.unified.CalendarMonthInterval.prototype, "fireStartDateChange");
		var oCalP = new CalendarMonthInterval("CalP",{
			startDate: new Date("2015", "7", "13", "8", "0", "0"),
			pickerPopup: true
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		assert.ok(!jQuery("#CalP--Cal").get(0), "Calendar picker not initial rendered");
		qutils.triggerEvent("click", "CalP--Head-B2");
		assert.ok(jQuery("#CalP--Cal").get(0), "Year picker rendered");
		assert.equal(jQuery("#CalP--Cal").parent().attr("id"), "sap-ui-static", "year picker rendered in static area");
		assert.ok(jQuery(jQuery("#CalP--Cal").get(0)).is(":visible"), "Year picker visible");

		var $Date = jQuery("#CalP--Cal--YP-y20160101");
		$Date.focus();
		qutils.triggerKeyboardEvent($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);

		assert.equal(sap.ui.getCore().byId("CalP").getStartDate().getFullYear(), 2016, "start date is set correctly");
		assert.strictEqual(oSpyFireDateChange.callCount, 1, "CalendarMonthInterval 'fireStartDateChange' was called once after selecting year");

		// clean
		oCalP.destroy();
	});

	QUnit.test("User opens the picker but escapes it - click outside for desktop or click cancel button", function(assert) {
		// arrange
		var oSpyCancel = this.spy(sap.ui.unified.CalendarMonthInterval.prototype, "fireCancel"),
			oCalP = new CalendarMonthInterval("CalP",{
			pickerPopup: true
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("click", "CalP--Head-B2");
		assert.ok(jQuery(jQuery("#CalP--Cal").get(0)).is(":visible"), "Year picker visible");

		sap.ui.test.qunit.triggerKeydown(sap.ui.getCore().byId("CalP").getFocusDomRef(), jQuery.sap.KeyCodes.ESCAPE);
		assert.ok(!jQuery(jQuery("#CalP--Cal").get(0)).is(":visible"), "Year picker not visible after closing");
		assert.strictEqual(oSpyCancel.callCount, 1, "CalendarMonthInterval 'fireCancel' was called once");

		// clean
		oCalP.destroy();
	});

	QUnit.test("When the picker is opened, it allows only months to be selected.", function(assert) {
		// arrange
		this.spy(sap.ui.unified.CalendarMonthInterval.prototype, "fireCancel");
		var oCalP = new CalendarMonthInterval("CalP",{
			startDate: new Date("2015", "7", "13"),
			pickerPopup: true
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// open year picker
		qutils.triggerEvent("click", "CalP--Head-B2");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#CalP--Cal--Head").children().length, 3, "Only arrows and year picker button are rendered");
		assert.equal(jQuery("#CalP--Cal--Head-B2").get(0).innerHTML, "2005 - 2024", "Correct year range is shown on the button");

		sap.ui.test.qunit.triggerKeydown(sap.ui.getCore().byId("CalP").getFocusDomRef(), jQuery.sap.KeyCodes.ESCAPE);

		// clean
		oCalP.destroy();
	});

	QUnit.test("Changing of the pickerPopup mode doesn't break min and max date inside yearPicker aggregation", function(assert) {
		// arrange
		var oCalP = new CalendarMonthInterval("CalP",{
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
			oCalP = new CalendarMonthInterval("CalP",{
			pickerPopup: true
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// open calendarPicker
		qutils.triggerEvent("click", "CalP--Head-B2");

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
		qutils.triggerEvent("click", "CalP--Head-B2");

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
		var oCalP = new CalendarMonthInterval("CalP",{
			pickerPopup: true
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// open calendarPicker
		qutils.triggerEvent("click", "CalP--Head-B2");

		// close calendarPicker
		sap.ui.test.qunit.triggerKeydown(document.activeElement, jQuery.sap.KeyCodes.ESCAPE);

		// check if the triggering button receives the focus after picker close
		assert.strictEqual(document.activeElement.id, oCalP.getAggregation("header").getDomRef("B2").id, "After picker close the triggering button receives the focus");

		// clean
		oCalP.destroy();
	});

	QUnit.test("Content overlay is shown when picker is open", function(assert) {
		// arrange
		var oCalP = new CalendarMonthInterval("CalP",{
			pickerPopup: true
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();
		// open calendarPicker
		qutils.triggerEvent("click", "CalP--Head-B2");
		// Make rendering sync, so we can assert safely
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oCalP.$("contentOver").get(0).style.display, "", "After opening the picker overlay is shown");

		// close calendarPicker
		sap.ui.test.qunit.triggerKeydown(document.activeElement, jQuery.sap.KeyCodes.ESCAPE);

		// clean
		oCalP.destroy();
	});

	QUnit.module("Misc");

	QUnit.test("destroying CalendarMonthInterval", function(assert) {
		// arrange
		var oCal = new CalendarMonthInterval("Cal"),
			oRange = new sap.ui.unified.DateTypeRange();

		oRange.setTooltip("tooltip");
		oCal.addSpecialDate(oRange);

		oCal.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		try {
			oCal.destroy();
			this.clock.tick(0);

			assert.ok(true, "CalendarMonthInterval was destroyed correctly");
		} catch (err) {
			assert.ok(true, "CalendarMonthInterval wasn't destroyed correctly");
		}

	});
});