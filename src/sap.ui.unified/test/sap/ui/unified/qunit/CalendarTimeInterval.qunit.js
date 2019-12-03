/*global QUnit, window */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/unified/CalendarTimeInterval",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function(qutils, CalendarTimeInterval, CalendarLegend, CalendarLegendItem,
	DateRange, DateTypeRange, unifiedLibrary, waitForThemeApplied) {
	"use strict";

	// set language to en-US, since we have specific language strings tested
	sap.ui.getCore().getConfiguration().setLanguage("en_US");

	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var bSelectFired = false;
	var oSelectedStartDate;
	var oSelectedEndDate;

	var handleSelect = function(oEvent){
		bSelectFired = true;
		var oCalendar = oEvent.oSource;
		var aSelectedDates = oCalendar.getSelectedDates();
		if (aSelectedDates.length > 0 ) {
			oSelectedStartDate = aSelectedDates[0].getStartDate();
			oSelectedEndDate = aSelectedDates[0].getEndDate();
		}
	};

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

	var oCal1 = new CalendarTimeInterval("Cal1",{
		select: handleSelect,
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

	var oCal2StartDate = new Date("2015", "7", "13", "8", "57", "10");
	var oCal2 = new CalendarTimeInterval("Cal2",{
		select: handleSelect,
		startDateChange: handleStartDateChange,
		width: "1500px",
		startDate: oCal2StartDate,
		items: 24,
		intervalMinutes: 120,
		intervalSelection: true,
		selectedDates: [new DateRange({startDate: new Date("2015", "7", "13", "10", "25"), endDate: new Date("2015", "7", "13", "15", "45")})],
		specialDates: [new DateTypeRange({startDate: new Date("2015", "7", "14"), type: CalendarDayType.Type01, tooltip: "Text"}),
						new DateTypeRange({startDate: new Date("2015", "7", "13", "15", "11"), endDate: new Date("2015", "7", "13", "19", "15"), type: CalendarDayType.Type02, tooltip: "Text"})],
		legend: oLegend
	}).placeAt("content");

	var oCal3StartDate = new Date("2015", "7", "13", "8", "57", "10");
	var oCal3 = new CalendarTimeInterval("Cal3",{
		select: handleSelect,
		startDateChange: handleStartDateChange,
		width: "800px",
		startDate: oCal3StartDate,
		items: 6,
		intervalMinutes: 30,
		singleSelection: false,
		pickerPopup: true,
		selectedDates: [new DateRange({startDate: new Date("2015", "7", "13", "08", "45")}),
						new DateRange({startDate: new Date("2015", "7", "13", "10", "25")})],
		specialDates: [new DateTypeRange({startDate: new Date("2015", "7", "14"), type: CalendarDayType.Type01, tooltip: "Text"}),
						new DateTypeRange({startDate: new Date("2015", "7", "13", "09", "11"), endDate: new Date("2015", "7", "13", "09", "45"), type: CalendarDayType.Type02, tooltip: "Text"})]
	}).placeAt("content");

	var oFormatYyyyMMddHHmm = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMddHHmm"});
	//var oFormatTime = sap.ui.core.format.DateFormat.getTimeInstance({style: "short"});
	var oNow = new Date();
	oNow.setMinutes(0); // to compare with interval starts

	QUnit.module("Rendering");

	QUnit.test("rendered times", function(assert) {
		var $TimesRow = sap.ui.getCore().byId("Cal1").getAggregation("timesRow").$();
		var aItems = $TimesRow.find(".sapUiCalItem");
		assert.equal(aItems.length, 12, "Calendar1: 12 items rendered");
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), oFormatYyyyMMddHHmm.format(oNow), "Calendar1: curent item is now");
		assert.ok(!jQuery("#Cal1--TimesRow-Head").get(0), "Calendar1: no hader line rendered");

		$TimesRow = sap.ui.getCore().byId("Cal2").getAggregation("timesRow").$();
		aItems = $TimesRow.find(".sapUiCalItem");
		assert.equal(aItems.length, 24, "Calendar2: 24 items rendered");
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), "201508130800", "Calendar2: first item");
		assert.equal(jQuery(aItems[0]).text(), "8AM", "Calendar2: first item text");
		assert.equal(jQuery(aItems[1]).text(), "10", "Calendar2: second item text");
		assert.ok(jQuery("#Cal2--TimesRow-Head").get(0), "Calendar2: hader line rendered");
		var aHeaders = jQuery("#Cal2--TimesRow-Head").children();
		assert.equal(aHeaders.length, 3, "Calendar2: 3 days in header");
		assert.equal(jQuery(aHeaders[0]).text(), "Aug 13, 2015", "Calendar2: text of first day");

		$TimesRow = sap.ui.getCore().byId("Cal3").getAggregation("timesRow").$();
		aItems = $TimesRow.find(".sapUiCalItem");
		assert.equal(aItems.length, 6, "Calendar3: 6 items rendered");
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), "201508130800", "Calendar3: first item");
		assert.equal(jQuery(aItems[0]).text(), "8:00AM", "Calendar3: first item text");
		assert.equal(jQuery(aItems[1]).text(), "8:30", "Calendar3: second item text");
	});

	QUnit.test("Header", function(assert) {
		assert.ok(jQuery("#Cal1--Head-B0").get(0), "Calendar1: day button shown");
		assert.ok(jQuery("#Cal1--Head-B1").get(0), "Calendar1: month button shown");
		assert.ok(jQuery("#Cal1--Head-B2").get(0), "Calendar1: year button shown");
		assert.equal(jQuery("#Cal2--Head-B0").text(), "13", "Calendar2: 13 as day shown");
		assert.equal(jQuery("#Cal2--Head-B1").text(), "August", "Calendar2: August as month shown");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "2015", "Calendar2: year 2015 shown");
	});

	QUnit.test("Header in Japaneese", function(assert) {
		var sCurrentLanguage = sap.ui.getCore().getConfiguration().getLanguage();
		sap.ui.getCore().getConfiguration().setLanguage("ja_JP");

		var oCalJ = new CalendarTimeInterval("CalJ",{
			startDate: new Date("2015", "7", "13", "8", "57", "10")
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oHeader = sap.ui.getCore().byId("CalJ--Head").$()[0];
		assert.ok(oHeader.children[1].id, "#CalJ--Head-B2", "Calendar: year button is shown first");
		assert.ok(oHeader.children[2].id, "#CalJ--Head-B1", "Calendar: month button is shown second");
		assert.ok(oHeader.children[3].id, "#CalJ--Head-B0", "Calendar: day button is shown third");

		assert.equal(jQuery("#CalJ--Head-B0").text(), "13日", "Calendar: 13日 as day shown");
		assert.equal(jQuery("#CalJ--Head-B1").text(), "8月", "Calendar: 8月 (August) as month shown");
		assert.equal(jQuery("#CalJ--Head-B2").text(), "2015年", "Calendar: year 2015年  shown");

		oCalJ.destroy();
		sap.ui.getCore().getConfiguration().setLanguage(sCurrentLanguage);
	});

	QUnit.test("Header in Chinese", function(assert) {
		var sCurrentLanguage = sap.ui.getCore().getConfiguration().getLanguage();
		sap.ui.getCore().getConfiguration().setLanguage("zh_CN");

		var oCalJ = new CalendarTimeInterval("CalJ",{
			startDate: new Date("2015", "7", "13", "8", "57", "10")
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oHeader = sap.ui.getCore().byId("CalJ--Head").$()[0];
		assert.ok(oHeader.children[1].id, "#CalJ--Head-B2", "Calendar: year button is shown first");
		assert.ok(oHeader.children[2].id, "#CalJ--Head-B1", "Calendar: month button is shown second");
		assert.ok(oHeader.children[3].id, "#CalJ--Head-B0", "Calendar: day button is shown third");

		assert.equal(jQuery("#CalJ--Head-B0").text(), "13日", "Calendar: 13日 as day shown");
		assert.equal(jQuery("#CalJ--Head-B1").text(), "八月", "Calendar: 八月 (August) as month shown");
		assert.equal(jQuery("#CalJ--Head-B2").text(), "2015年", "Calendar: year 2015年  shown");

		oCalJ.destroy();
		sap.ui.getCore().getConfiguration().setLanguage(sCurrentLanguage);
	});

	QUnit.test("Japaneese language none case sensitive test", function(assert) {
		var sCurrentLanguage = sap.ui.getCore().getConfiguration().getLanguage();
		sap.ui.getCore().getConfiguration().setLanguage("JA");

		var oCalJ = new CalendarTimeInterval("CalJ",{
			startDate: new Date("2015", "7", "13", "8", "57", "10")
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oHeader = sap.ui.getCore().byId("CalJ--Head").$()[0];
		assert.ok(oHeader.children[1].id, "#CalJ--Head-B2", "Calendar: year button is shown first");
		assert.ok(oHeader.children[2].id, "#CalJ--Head-B1", "Calendar: month button is shown second");
		assert.ok(oHeader.children[3].id, "#CalJ--Head-B0", "Calendar: day button is shown third");

		assert.equal(jQuery("#CalJ--Head-B0").text(), "13日", "Calendar: 13日 as day shown");
		assert.equal(jQuery("#CalJ--Head-B1").text(), "8月", "Calendar: 8月 (August) as month shown");
		assert.equal(jQuery("#CalJ--Head-B2").text(), "2015年", "Calendar: year 2015年  shown");

		oCalJ.destroy();
		sap.ui.getCore().getConfiguration().setLanguage(sCurrentLanguage);
	});

	QUnit.test("width", function(assert) {
		assert.ok(!jQuery("#Cal1").attr("style"), "Calendar1: no width set");
		assert.equal(jQuery("#Cal2").css("width"), "1500px", "Calendar2: width set");
	});

	QUnit.test("selected days", function(assert) {
		assert.ok(!jQuery("#Cal2--TimesRow-201508130800").hasClass("sapUiCalItemSel"), "20150813-0800 is not selected");
		assert.ok(jQuery("#Cal2--TimesRow-201508131000").hasClass("sapUiCalItemSel"), "20150813-1000 is selected");
		assert.ok(jQuery("#Cal2--TimesRow-201508131000").hasClass("sapUiCalItemSelStart"), "20150813-1000 is selection start");
		assert.ok(!jQuery("#Cal2--TimesRow-201508131000").hasClass("sapUiCalItemSelBetween"), "20150813-1000 is not selected between");
		assert.ok(!jQuery("#Cal2--TimesRow-201508131000").hasClass("sapUiCalItemSelEnd"), "20150813-1000 is not selection end");
		assert.ok(jQuery("#Cal2--TimesRow-201508131200").hasClass("sapUiCalItemSel"), "20150813-1200 is selected");
		assert.ok(!jQuery("#Cal2--TimesRow-201508131200").hasClass("sapUiCalItemSelStart"), "20150813-1200 is not selection start");
		assert.ok(jQuery("#Cal2--TimesRow-201508131200").hasClass("sapUiCalItemSelBetween"), "20150813-1200 is selected between");
		assert.ok(!jQuery("#Cal2--TimesRow-201508131200").hasClass("sapUiCalItemSelEnd"), "20150813-1200 is not selection end");
		assert.ok(jQuery("#Cal2--TimesRow-201508131400").hasClass("sapUiCalItemSel"), "20150813-1400 is selected");
		assert.ok(!jQuery("#Cal2--TimesRow-201508131400").hasClass("sapUiCalItemSelStart"), "20150813-1400 is not selection start");
		assert.ok(!jQuery("#Cal2--TimesRow-201508131400").hasClass("sapUiCalItemSelBetween"), "20150813-1400 is not selected between");
		assert.ok(jQuery("#Cal2--TimesRow-201508131400").hasClass("sapUiCalItemSelEnd"), "20150813-1400 is selection end");
		assert.ok(!jQuery("#Cal2--TimesRow-201508131600").hasClass("sapUiCalItemSel"), "20150813-1600 is not selected");

		assert.ok(!jQuery("#Cal3--TimesRow-201508130800").hasClass("sapUiCalItemSel"), "20150813-0800 is not selected");
		assert.ok(jQuery("#Cal3--TimesRow-201508130830").hasClass("sapUiCalItemSel"), "20150813-0830 is selected");
		assert.ok(!jQuery("#Cal3--TimesRow-201508130900").hasClass("sapUiCalItemSel"), "20150813-0900 is not selected");
		assert.ok(jQuery("#Cal3--TimesRow-201508131000").hasClass("sapUiCalItemSel"), "20150813-1000 is selected");
	});

	QUnit.test("special days", function(assert) {
		assert.ok(!jQuery("#Cal2--TimesRow-201508131200").hasClass("sapUiCalItemType02"), "20150813-1200 is not special month of Type02");
		assert.ok(jQuery("#Cal2--TimesRow-201508131400").hasClass("sapUiCalItemType02"), "20150813-1400 is special month of Type02");
		assert.equal(jQuery("#Cal2--TimesRow-201508131400").attr("title"), "Text", "20150813-1400 has special days tooltip");
		assert.equal(jQuery("#Cal2--TimesRow-201508131400").attr("aria-label"), "August 13, 2015 at 2:00 PM; Type 2", "20150813-1400 aria-label");
		assert.ok(jQuery("#Cal2--TimesRow-201508131600").hasClass("sapUiCalItemType02"), "20150813-1600 is special month of Type02");
		assert.ok(jQuery("#Cal2--TimesRow-201508131800").hasClass("sapUiCalItemType02"), "20150813-1800 is special month of Type02");
		assert.ok(!jQuery("#Cal2--TimesRow-201508132000").hasClass("sapUiCalItemType02"), "20150813-2000 is not special month of Type02");
		assert.equal(jQuery("#Cal2--TimesRow-201508132000").attr("aria-label"), "August 13, 2015 at 8:00 PM", "20150813-2000 aria-label");

		assert.ok(jQuery("#Cal2--TimesRow-201508140000").hasClass("sapUiCalItemType01"), "20150814-0000 is special month of Type01");
		assert.ok(jQuery("#Cal2--TimesRow-201508140200").hasClass("sapUiCalItemType01"), "20150814-0200 is special month of Type01");
		assert.ok(jQuery("#Cal2--TimesRow-201508140400").hasClass("sapUiCalItemType01"), "20150814-0400 is special month of Type01");
		assert.ok(jQuery("#Cal2--TimesRow-201508140600").hasClass("sapUiCalItemType01"), "20150814-0600 is special month of Type01");

		assert.ok(!jQuery("#Cal3--TimesRow-201508130830").hasClass("sapUiCalItemType02"), "20150813-0830 is not special month of Type02");
		assert.ok(jQuery("#Cal3--TimesRow-201508130900").hasClass("sapUiCalItemType02"), "20150813-0900 is special month of Type02");
		assert.equal(jQuery("#Cal3--TimesRow-201508130930").attr("title"), "Text", "20150813-0930 has special days tooltip");
		assert.ok(!jQuery("#Cal3--TimesRow-201508131000").hasClass("sapUiCalItemType02"), "20150813-1000 is not special month of Type02");
	});

	QUnit.module("change date via API");
	QUnit.test("setStartDate", function(assert) {
		oCal1.setStartDate(new Date("2015", "2", "10", "10", "10"));
		var $TimesRow = sap.ui.getCore().byId("Cal1").getAggregation("timesRow").$();
		var aItems = $TimesRow.find(".sapUiCalItem");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), "201503101000", "Calendar1: new start time");
		assert.equal(jQuery("#Cal1--Head-B0").text(), "10", "Calendar1: 10 as day shown");
		assert.equal(jQuery("#Cal1--Head-B1").text(), "March", "Calendar1: March as month shown");
		assert.equal(jQuery("#Cal1--Head-B2").text(), "2015", "Calendar1: year 2015 shown");
	});

	QUnit.test("focusDate", function(assert) {
		oCal2.focusDate(new Date("2015", "7", "13", "10", "10"));
		var oStartDate = oCal2.getStartDate();
		sap.ui.getCore().applyChanges();
		assert.equal(oFormatYyyyMMddHHmm.format(oStartDate), "201508130857", "Calendar2: start date not changed");
		var $TimesRow = sap.ui.getCore().byId("Cal2").getAggregation("timesRow").$();
		var aItems = $TimesRow.find(".sapUiCalItem");
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), "201508130800", "Calendar2: rendered start item not changed");
		assert.equal(jQuery(aItems[1]).attr("tabindex"), "0", "Calendar2: second item has focus");

		oCal2.focusDate(new Date("2015", "3", "11", "11", "11"));
		sap.ui.getCore().applyChanges();
		oStartDate = oCal2.getStartDate();
		assert.equal(oFormatYyyyMMddHHmm.format(oStartDate), "201504110800", "Calendar2: new start date");
		aItems = $TimesRow.find(".sapUiCalItem");
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), "201504110800", "Calendar2: new start item rendered");
		assert.equal(jQuery(aItems[1]).attr("tabindex"), "0", "Calendar2: second item still has focus");

		assert.equal(jQuery("#Cal2--Head-B0").text(), "11", "Calendar2: 11 as day shown");
		assert.equal(jQuery("#Cal2--Head-B1").text(), "April", "Calendar2: April as month shown");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "2015", "Calendar2: year 2015 shown");
	});

	QUnit.module("change time via navigation");
	QUnit.test("next/prev items", function(assert) {
		bStartDateChanged = false;
		qutils.triggerEvent("click", "Cal2--Head-next");
		assert.ok(bStartDateChanged, "Calendar2: startDateChangeEvent fired");
		var oStartDate = oCal2.getStartDate();
		assert.equal(oFormatYyyyMMddHHmm.format(oStartDate), "201504130800", "Calendar2: new start date");
		var $TimesRow = sap.ui.getCore().byId("Cal2").getAggregation("timesRow").$();
		var aItems = $TimesRow.find(".sapUiCalItem");
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), "201504130800", "Calendar2: new start item rendered");
		assert.equal(jQuery(aItems[1]).attr("tabindex"), "0", "Calendar2: second item still has focus");

		bStartDateChanged = false;
		qutils.triggerEvent("click", "Cal2--Head-prev");
		assert.ok(bStartDateChanged, "Calendar2: startDateChangeEvent fired");
		oStartDate = oCal2.getStartDate();
		assert.equal(oFormatYyyyMMddHHmm.format(oStartDate), "201504110800", "Calendar2: new start date");
		aItems = $TimesRow.find(".sapUiCalItem");
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), "201504110800", "Calendar2: new start item rendered");
		assert.equal(jQuery(aItems[1]).attr("tabindex"), "0", "Calendar2: second item still has focus");
	});


	QUnit.test("After Rerendering, last focused hour is still focused", function(assert) {
		//Prepare
		var oCalendarTimeInt = new CalendarTimeInterval();
		oCalendarTimeInt.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var $timesRow = oCalendarTimeInt.getAggregation("timesRow").$();
		var aTimes = $timesRow.find(".sapUiCalItem");
		aTimes[1].focus();

		//Act
		oCalendarTimeInt.rerender();
		sap.ui.getCore().applyChanges();

		//Assert
		_assertFocus(aTimes[1], "Calendar: after rerendering  second hour still has focus", assert);
		oCalendarTimeInt.destroy();
	});

	QUnit.test("After Rerendering, the focus is not stolen from an external control (i.e. a button)", function(assert) {

		//Prepare
		var oCalendarTimeInt = new CalendarTimeInterval(),
			oExternalControl = new CalendarTimeInterval("extControl"),
			oElementToFocus;

		oCalendarTimeInt.placeAt("qunit-fixture");
		oExternalControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Get the focusable B1 button from the external CalendarTimeInterval, since CTI itself isn't focusable.
		oElementToFocus = oExternalControl.getAggregation("header").getDomRef("B1");
		oElementToFocus.focus();

		_assertFocus(oElementToFocus, "Prerequisites check: 'extControl' (another MonthInterval) should be focused", assert);

		//Act
		oCalendarTimeInt.rerender();

		//Assert
		_assertFocus(oElementToFocus, "After rerendering, the focus should stay on the 'extControl' (TimeInterval)", assert);
		oCalendarTimeInt.destroy();
		oExternalControl.destroy();
	});

	QUnit.module("Day Picker");
	QUnit.test("displayed days", function(assert) {
		assert.ok(!jQuery("#Cal1--DatesRow").get(0), "Calendar1: Day picker not initial rendered");
		qutils.triggerEvent("click", "Cal1--Head-B0");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Cal1--DatesRow").get(0), "Calendar1: Day picker rendered");
		assert.equal(jQuery("#Cal1--DatesRow").parent().attr("id"), "Cal1-content", "Calendar1: Day picker rendered in Calendar");
		assert.ok(jQuery(jQuery("#Cal1--DatesRow").get(0)).is(":visible"), "Calendar1: Day picker visible");
		var $DatesRow = sap.ui.getCore().byId("Cal1").getAggregation("datesRow").$();
		var aDays = $DatesRow.find(".sapUiCalItem");
		assert.equal(aDays.length, 18, "Calendar1: 18 days rendered");
		assert.equal(jQuery(aDays[0]).text(), "1", "Calendar1: first displayed day");
		assert.equal(jQuery(aDays[9]).attr("tabindex"), "0", "Calendar1: 10. displayed day is focused");
		assert.ok(jQuery(aDays[9]).hasClass("sapUiCalItemSel"), "Calendar1: 10. displayed day is selected");

		assert.ok(!jQuery("#Cal2--DatesRow").get(0), "Calendar2: Day picker not initial rendered");
		qutils.triggerEvent("click", "Cal2--Head-B0");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Cal2--DatesRow").get(0), "Calendar2: Day picker rendered");
		assert.ok(jQuery(jQuery("#Cal2--DatesRow").get(0)).is(":visible"), "Calendar2: Day picker visible");
		$DatesRow = sap.ui.getCore().byId("Cal2").getAggregation("datesRow").$();
		aDays = $DatesRow.find(".sapUiCalItem");
		assert.equal(aDays.length, 30, "Calendar2: 30 days (full month) rendered");
		assert.equal(jQuery(aDays[0]).text(), "1", "Calendar2: first displayed day");
		assert.equal(jQuery(aDays[10]).attr("tabindex"), "0", "Calendar2: 11. displayed day is focused");
		assert.ok(jQuery(aDays[10]).hasClass("sapUiCalItemSel"), "Calendar2: 11. displayed day is selected");
	});

	QUnit.test("change block", function(assert) {
		assert.ok(jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Calendar1: previous button disabled");
		assert.ok(!jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Calendar1: next button enabled");
		qutils.triggerEvent("click", "Cal1--Head-next");
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Calendar1: previous button enabled");
		assert.ok(jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Calendar1: next button disabled");
		var $DatesRow = sap.ui.getCore().byId("Cal1").getAggregation("datesRow").$();
		var aDays = $DatesRow.find(".sapUiCalItem");
		assert.equal(jQuery(aDays[0]).text(), "14", "Calendar1: first displayed day");
		assert.equal(jQuery(aDays[14]).attr("tabindex"), "0", "Calendar1: 14. displayed day is focused");
		qutils.triggerEvent("click", "Cal1--Head-B0");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Cal1--DatesRow").get(0), "Calendar1: Day picker still rendered after closing");
		assert.ok(!jQuery(jQuery("#Cal1--DatesRow").get(0)).is(":visible"), "Calendar1: Day picker not visible after closing");

	});

	QUnit.test("select day", function(assert) {
		bStartDateChanged = false;
		var $NewDay = jQuery("#Cal2--DatesRow-20150404"); // use keybord to select day to prevent event processing from ItemNavigation
		$NewDay.focus();
		qutils.triggerKeydown($NewDay.get(0), jQuery.sap.KeyCodes.ENTER, false, false, false);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Cal2--DatesRow").get(0), "Calendar2: Day picker still rendered after selecting day");
		assert.ok(!jQuery(jQuery("#Cal2--DatesRow").get(0)).is(":visible"), "Calendar2: Day picker not visible after selecting day");
		assert.equal(jQuery("#Cal2--Head-B0").text(), "4", "Calendar2: day 4 shown");
		var $TimesRow = sap.ui.getCore().byId("Cal2").getAggregation("timesRow").$();
		var aItems = $TimesRow.find(".sapUiCalItem");
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), "201504040800", "Calendar2: new start item");
		assert.ok(bStartDateChanged, "Calendar2: startDateChangeEvent fired");
	});

	QUnit.test("Selecting a date from previous month", function(assert) {
		//Prepare
		var oCalendarTimeInt = new CalendarTimeInterval("CTI", {
			startDate: new Date("2018", "10", "01"),
			pickerPopup: true
		}).placeAt("qunit-fixture"),
		oCalendar = oCalendarTimeInt._getCalendarPicker(),
		oLastDateOfOct = new Date("2018", "09", "31");

		sap.ui.getCore().applyChanges();

		// Act
		oCalendar.addSelectedDate(new DateRange({startDate: oLastDateOfOct}));
		oCalendar.fireSelect();

		// Assert
		assert.strictEqual(oCalendarTimeInt.getStartDate().getTime(), oLastDateOfOct.getTime(), "startDate correct");

		// Clean
		oCalendarTimeInt.destroy();
	});

	QUnit.test("Selecting a date from next month", function(assert) {
		//Prepare
		var oCalendarTimeInt = new CalendarTimeInterval("CTI", {
			startDate: new Date("2018", "00", "31"),
			pickerPopup: true
		}).placeAt("qunit-fixture"),
		oCalendar = oCalendarTimeInt._getCalendarPicker(),
		oFirstDateOfFeb = new Date("2018", "01", "01");

		sap.ui.getCore().applyChanges();

		// Act
		oCalendar.addSelectedDate(new DateRange({startDate: oFirstDateOfFeb}));
		oCalendar.fireSelect();

		// Assert
		assert.strictEqual(oCalendarTimeInt.getStartDate().getTime(), oFirstDateOfFeb.getTime(), "startDate correct");

		// Clean
		oCalendarTimeInt.destroy();
	});

	QUnit.module("Month Picker");
	QUnit.test("displayed months", function(assert) {
		assert.ok(!jQuery("#Cal1--MP").get(0), "Calendar1: Month picker not initial rendered");
		qutils.triggerEvent("click", "Cal1--Head-B1");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Cal1--MP").get(0), "Calendar1: month picker rendered");
		assert.equal(jQuery("#Cal1--MP").parent().attr("id"), "Cal1-content", "Calendar1: month picker rendered in Calendar");
		assert.ok(jQuery(jQuery("#Cal1--MP").get(0)).is(":visible"), "Calendar1: month picker visible");
		var $MP = sap.ui.getCore().byId("Cal1").getAggregation("monthPicker").$();
		var aMonths = $MP.find(".sapUiCalItem");
		assert.equal(aMonths.length, 6, "Calendar1: 4 months rendered");
		assert.equal(jQuery(aMonths[0]).text(), "Jan", "Calendar1: first displayed month");
		assert.equal(jQuery(aMonths[2]).attr("tabindex"), "0", "Calendar1: 3. displayed month is focused");
		assert.notOk(jQuery(aMonths[2]).hasClass("sapUiCalItemSel"), "Calendar1: 3. displayed month is selected");

		assert.ok(!jQuery("#Cal2--MP").get(0), "Calendar2: Month picker not initial rendered");
		qutils.triggerEvent("click", "Cal2--Head-B1");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Cal2--MP").get(0), "Calendar2: month picker rendered");
		assert.ok(jQuery(jQuery("#Cal2--MP").get(0)).is(":visible"), "Calendar2: month picker visible");
		$MP = sap.ui.getCore().byId("Cal2").getAggregation("monthPicker").$();
		aMonths = $MP.find(".sapUiCalItem");
		assert.equal(aMonths.length, 12, "Calendar2: 12 months rendered");
		assert.equal(jQuery(aMonths[0]).text(), "January", "Calendar2: first displayed month");
		assert.equal(jQuery(aMonths[3]).attr("tabindex"), "0", "Calendar2: 4. displayed month is focused");
		assert.notOk(jQuery(aMonths[3]).hasClass("sapUiCalItemSel"), "Calendar2: 4. displayed month is selected");
	});

	QUnit.test("change block", function(assert) {
		assert.ok(jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Calendar1: previous button disabled");
		assert.ok(!jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Calendar1: next button enabled");
		qutils.triggerEvent("click", "Cal1--Head-next");
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Calendar1: previous button enabled");
		assert.ok(jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Calendar1: next button disabled");
		var $MP = sap.ui.getCore().byId("Cal1").getAggregation("monthPicker").$();
		var aMonths = $MP.find(".sapUiCalItem");
		assert.equal(jQuery(aMonths[0]).text(), "Jul", "Calendar1: first displayed month");
		assert.equal(jQuery(aMonths[2]).attr("tabindex"), "0", "Calendar1: 3. displayed month is focused");

		qutils.triggerEvent("click", "Cal1--Head-prev");
		sap.ui.getCore().applyChanges();
		$MP = sap.ui.getCore().byId("Cal1").getAggregation("monthPicker").$();
		aMonths = $MP.find(".sapUiCalItem");
		assert.equal(jQuery(aMonths[0]).text(), "Jan", "Calendar1: first displayed month");
		assert.equal(jQuery(aMonths[2]).attr("tabindex"), "0", "Calendar1: 3. displayed month is focused");

		qutils.triggerEvent("click", "Cal1--Head-B1");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Cal1--MP").get(0), "Calendar1: Month picker still rendered after closing");
		assert.ok(!jQuery(jQuery("#Cal1--MP").get(0)).is(":visible"), "Calendar1: month picker not visible after closing");
	});

	QUnit.test("select month", function(assert) {
		bStartDateChanged = false;
		var $NewMonth = jQuery("#Cal2--MP-m1"); // use keybord to select day to prevent event processing from ItemNavigation
		$NewMonth.focus();
		qutils.triggerKeydown($NewMonth.get(0), jQuery.sap.KeyCodes.ENTER, false, false, false);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Cal2--MP").get(0), "Calendar2: Month picker still rendered after selecting month");
		assert.ok(!jQuery(jQuery("#Cal2--MP").get(0)).is(":visible"), "Calendar2: month picker not visible after selecting month");
		assert.equal(jQuery("#Cal2--Head-B1").text(), "February", "Calendar2: Feb. shown");
		var $TimesRow = sap.ui.getCore().byId("Cal2").getAggregation("timesRow").$();
		var aItems = $TimesRow.find(".sapUiCalItem");
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), "201502040800", "Calendar2: new start item");
		assert.ok(bStartDateChanged, "Calendar2: startDateChangeEvent fired");
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
		assert.ok(jQuery(aYears[3]).hasClass("sapUiCalItemSel"), "Calendar1: 4. displayed year is selected");

		assert.ok(!jQuery("#Cal2--YP").get(0), "Calendar2: Year picker not initial rendered");
		qutils.triggerEvent("click", "Cal2--Head-B2");
		assert.ok(jQuery("#Cal2--YP").get(0), "Calendar2: Year picker rendered");
		assert.ok(jQuery(jQuery("#Cal2--YP").get(0)).is(":visible"), "Calendar2: Year picker visible");
		$YearPicker = sap.ui.getCore().byId("Cal2").getAggregation("yearPicker").$();
		aYears = $YearPicker.find(".sapUiCalItem");
		assert.equal(aYears.length, 12, "Calendar2: 12 years rendered");
		assert.equal(jQuery(aYears[0]).text(), "2009", "Calendar2: first displayed year");
		assert.equal(jQuery(aYears[6]).attr("tabindex"), "0", "Calendar2: 7. displayed year is focused");
		assert.ok(jQuery(aYears[6]).hasClass("sapUiCalItemSel"), "Calendar2: 7. displayed year is selected");
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

		qutils.triggerEvent("click", "Cal2--Head-next");
		$YearPicker = sap.ui.getCore().byId("Cal2").getAggregation("yearPicker").$();
		aYears = $YearPicker.find(".sapUiCalItem");
		assert.equal(jQuery(aYears[0]).text(), "2021", "Calendar2: first displayed year");
		assert.equal(jQuery(aYears[6]).attr("tabindex"), "0", "Calendar2: 7. displayed year is focused");
	});

	QUnit.test("select year", function(assert) {
		bStartDateChanged = false;
		var $NewYear = jQuery("#Cal2--YP-y20220101"); // use keybord to select month to prevent event processing from ItemNavigation
		$NewYear.focus();
		qutils.triggerKeydown($NewYear.get(0), jQuery.sap.KeyCodes.ENTER, false, false, false);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery(jQuery("#Cal2--YP").get(0)).is(":visible"), "Calendar2: Year picker not visible after selecting year");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "2022", "Calendar2: year 2022 shown");
		var $TimesRow = sap.ui.getCore().byId("Cal2").getAggregation("timesRow").$();
		var aItems = $TimesRow.find(".sapUiCalItem");
		assert.equal(jQuery(aItems[0]).attr("data-sap-time"), "202202040800", "Calendar2: new start item");
		assert.ok(bStartDateChanged, "Calendar2: startDateChangeEvent fired");
	});


	QUnit.module("other");
	QUnit.test("Min/Max", function(assert) {
		oCal2.setStartDate(new Date(9999, 11, 29));
		assert.ok(!jQuery("#Cal2--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button enabled");
		assert.ok(!jQuery("#Cal2--Head-next").hasClass("sapUiCalDsbl"), "Next Button enabled");
		qutils.triggerEvent("click", "Cal2--Head-next");
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#Cal2--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button enabled on max month");
		assert.ok(jQuery("#Cal2--Head-next").hasClass("sapUiCalDsbl"), "Next Button disabled on max month");
		qutils.triggerEvent("click", "Cal2--Head-B2");
		sap.ui.getCore().applyChanges();
		var aYears = jQuery("#Cal2--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[aYears.length - 1]).text(), "9999", "Max Year is last rendered year");
		qutils.triggerEvent("click", "Cal2--Head-B2");
		sap.ui.getCore().applyChanges();

		var oDate = new Date(1, 0, 2);
		oDate.setFullYear(1);
		oCal2.setStartDate(oDate);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#Cal2--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button enabled");
		assert.ok(!jQuery("#Cal2--Head-next").hasClass("sapUiCalDsbl"), "Next Button enabled");
		qutils.triggerEvent("click", "Cal2--Head-prev");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Cal2--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button disabled on min month");
		assert.ok(!jQuery("#Cal2--Head-next").hasClass("sapUiCalDsbl"), "Next Button enabled on min month");
		qutils.triggerEvent("click", "Cal2--Head-B2");
		sap.ui.getCore().applyChanges();
		aYears = jQuery("#Cal2--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[0]).text(), "0001", "Min Year is first rendered year");
		qutils.triggerEvent("click", "Cal2--Head-B2");

		oCal2.setStartDate(new Date(2022, 1, 4, 8, 0));
	});

	QUnit.module("select time");
	QUnit.test("single selection", function(assert) {
		var $selectItem1 = jQuery("#Cal1--TimesRow-201503101300");
		bSelectFired = false;
		oSelectedStartDate = undefined;
		oSelectedEndDate = undefined;
		$selectItem1.focus();
		qutils.triggerKeyboardEvent($selectItem1[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.ok(bSelectFired, "Select event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oSelectedStartDate), "201503101300", "Item was selected");
		assert.ok(!oSelectedEndDate, "No end date");
		assert.ok($selectItem1.hasClass("sapUiCalItemSel"), "Item marked as selected");

		var $selectItem2 = jQuery("#Cal1--TimesRow-201503101500");
		bSelectFired = false;
		oSelectedStartDate = undefined;
		oSelectedEndDate = undefined;
		$selectItem2.focus();
		qutils.triggerKeyboardEvent($selectItem2[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.ok(bSelectFired, "Select event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oSelectedStartDate), "201503101500", "Item was selected");
		assert.ok(!oSelectedEndDate, "No end date");
		assert.ok($selectItem2.hasClass("sapUiCalItemSel"), "Item marked as selected");
		assert.ok(!$selectItem1.hasClass("sapUiCalItemSel"), "Old item not longer marked as selected");
	});

	QUnit.test("interval selection", function(assert) {
		var $selectItem1 = jQuery("#Cal2--TimesRow-202202041200");
		var $selectItem2 = jQuery("#Cal2--TimesRow-202202041400");
		var $selectItem3 = jQuery("#Cal2--TimesRow-202202041600");
		bSelectFired = false;
		oSelectedStartDate = undefined;
		oSelectedEndDate = undefined;
		$selectItem1.focus();
		qutils.triggerKeyboardEvent($selectItem1[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.ok(bSelectFired, "Select event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oSelectedStartDate), "202202041200", "Item1 was selected");
		assert.ok(!oSelectedEndDate, "No end date");
		assert.ok($selectItem1.hasClass("sapUiCalItemSel"), "Item1 marked as selected");
		assert.ok(!$selectItem1.hasClass("sapUiCalItemSelStart"), "Item1 not marked as selection start");
		assert.ok(!$selectItem1.hasClass("sapUiCalItemSelBetween"), "Item1 not marked as selection between");
		assert.ok(!$selectItem1.hasClass("sapUiCalItemSelEnd"), "Item1 not marked as selectionEnd");
		assert.ok(!$selectItem2.hasClass("sapUiCalItemSel"), "Item2 not marked as selected");
		assert.ok(!$selectItem2.hasClass("sapUiCalItemSelStart"), "Item2 not marked as selection start");
		assert.ok(!$selectItem2.hasClass("sapUiCalItemSelBetween"), "Item2 not marked as selection between");
		assert.ok(!$selectItem2.hasClass("sapUiCalItemSelEnd"), "Item2 not marked as selectionEnd");
		assert.ok(!$selectItem3.hasClass("sapUiCalItemSel"), "Item3 not marked as selected");
		assert.ok(!$selectItem3.hasClass("sapUiCalItemSelStart"), "Item3 not marked as selection start");
		assert.ok(!$selectItem3.hasClass("sapUiCalItemSelBetween"), "Item3 not marked as selection between");
		assert.ok(!$selectItem3.hasClass("sapUiCalItemSelEnd"), "Item3 not marked as selectionEnd");

		bSelectFired = false;
		oSelectedStartDate = undefined;
		oSelectedEndDate = undefined;
		$selectItem3.focus();
		qutils.triggerKeyboardEvent($selectItem3[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.ok(bSelectFired, "Select event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oSelectedStartDate), "202202041200", "Item was selected");
		assert.equal(oFormatYyyyMMddHHmm.format(oSelectedEndDate), "202202041600", "Item was selected");
		assert.ok($selectItem1.hasClass("sapUiCalItemSel"), "Item1 marked as selected");
		assert.ok($selectItem1.hasClass("sapUiCalItemSelStart"), "Item1 marked as selection start");
		assert.ok(!$selectItem1.hasClass("sapUiCalItemSelBetween"), "Item1 not marked as selection between");
		assert.ok(!$selectItem1.hasClass("sapUiCalItemSelEnd"), "Item1 not marked as selectionEnd");
		assert.ok($selectItem2.hasClass("sapUiCalItemSel"), "Item2 marked as selected");
		assert.ok(!$selectItem2.hasClass("sapUiCalItemSelStart"), "Item2 not marked as selection start");
		assert.ok($selectItem2.hasClass("sapUiCalItemSelBetween"), "Item2 marked as selection between");
		assert.ok(!$selectItem2.hasClass("sapUiCalItemSelEnd"), "Item2 not marked as selectionEnd");
		assert.ok($selectItem3.hasClass("sapUiCalItemSel"), "Item3 marked as selected");
		assert.ok(!$selectItem3.hasClass("sapUiCalItemSelStart"), "Item3 not marked as selection start");
		assert.ok(!$selectItem3.hasClass("sapUiCalItemSelBetween"), "Item3 not marked as selection between");
		assert.ok($selectItem3.hasClass("sapUiCalItemSelEnd"), "Item3 marked as selectionEnd");

		var $selectItem4 = jQuery("#Cal2--TimesRow-202202041800");
		var $selectItem5 = jQuery("#Cal2--TimesRow-202202042200");
		bSelectFired = false;
		oSelectedStartDate = undefined;
		oSelectedEndDate = undefined;
		$selectItem4.focus();
		qutils.triggerKeyboardEvent($selectItem4[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		$selectItem5.focus();
		qutils.triggerKeyboardEvent($selectItem5[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.ok(bSelectFired, "Select event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oSelectedStartDate), "202202041800", "Item was selected");
		assert.equal(oFormatYyyyMMddHHmm.format(oSelectedEndDate), "202202042200", "Item was selected");
		assert.ok(!$selectItem1.hasClass("sapUiCalItemSel"), "Item1not  marked as selected");
		assert.ok(!$selectItem1.hasClass("sapUiCalItemSelStart"), "Item1 not marked as selection start");
		assert.ok(!$selectItem1.hasClass("sapUiCalItemSelBetween"), "Item1 not marked as selection between");
		assert.ok(!$selectItem1.hasClass("sapUiCalItemSelEnd"), "Item1 not marked as selectionEnd");
		assert.ok(!$selectItem2.hasClass("sapUiCalItemSel"), "Item2 not marked as selected");
		assert.ok(!$selectItem2.hasClass("sapUiCalItemSelStart"), "Item2 not marked as selection start");
		assert.ok(!$selectItem2.hasClass("sapUiCalItemSelBetween"), "Item2 not marked as selection between");
		assert.ok(!$selectItem2.hasClass("sapUiCalItemSelEnd"), "Item2 not marked as selectionEnd");
		assert.ok(!$selectItem3.hasClass("sapUiCalItemSel"), "Item3 not marked as selected");
		assert.ok(!$selectItem3.hasClass("sapUiCalItemSelStart"), "Item3 not marked as selection start");
		assert.ok(!$selectItem3.hasClass("sapUiCalItemSelBetween"), "Item3 not marked as selection between");
		assert.ok(!$selectItem3.hasClass("sapUiCalItemSelEnd"), "Item3 not marked as selectionEnd");
		// not needed to check classes of new selected items as it is the same like before
	});

	QUnit.test("multiple selection", function(assert) {
		var done = assert.async();
		oCal3.destroySelectedDates();
		setTimeout(function(){
			// async because items are updated async if DateRange changed
			var $selectItem1 = jQuery("#Cal3--TimesRow-201508130800");
			var $selectItem2 = jQuery("#Cal3--TimesRow-201508130900");
			bSelectFired = false;
			oSelectedStartDate = undefined;
			oSelectedEndDate = undefined;
			$selectItem1.focus();
			qutils.triggerKeyboardEvent($selectItem1[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
			assert.ok(bSelectFired, "Select event fired");
			var aSelectedDates = oCal3.getSelectedDates();
			assert.equal(aSelectedDates.length, 1, "1 item selected");
			oSelectedStartDate = aSelectedDates[0].getStartDate();
			oSelectedEndDate = aSelectedDates[0].getEndDate();
			assert.equal(oFormatYyyyMMddHHmm.format(oSelectedStartDate), "201508130800", "Item1 was selected");
			assert.ok(!oSelectedEndDate, "No end date");
			assert.ok($selectItem1.hasClass("sapUiCalItemSel"), "Item1 marked as selected");
			assert.ok(!$selectItem2.hasClass("sapUiCalItemSel"), "Item2 not marked as selected");

			bSelectFired = false;
			oSelectedStartDate = undefined;
			oSelectedEndDate = undefined;
			$selectItem2.focus();
			qutils.triggerKeyboardEvent($selectItem2[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
			assert.ok(bSelectFired, "Select event fired");
			aSelectedDates = oCal3.getSelectedDates();
			assert.equal(aSelectedDates.length, 2, "2 items selected");
			oSelectedStartDate = aSelectedDates[0].getStartDate();
			oSelectedEndDate = aSelectedDates[0].getEndDate();
			assert.equal(oFormatYyyyMMddHHmm.format(oSelectedStartDate), "201508130800", "Item1 was selected");
			oSelectedStartDate = aSelectedDates[1].getStartDate();
			oSelectedEndDate = aSelectedDates[1].getEndDate();
			assert.equal(oFormatYyyyMMddHHmm.format(oSelectedStartDate), "201508130900", "Item2 was selected");
			assert.ok(!oSelectedEndDate, "No end date");
			assert.ok($selectItem2.hasClass("sapUiCalItemSel"), "Item2 marked as selected");
			assert.ok($selectItem1.hasClass("sapUiCalItemSel"), "Item1 marked as selected");

			bSelectFired = false;
			oSelectedStartDate = undefined;
			oSelectedEndDate = undefined;
			$selectItem1.focus();
			qutils.triggerKeyboardEvent($selectItem2[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
			assert.ok(bSelectFired, "Select event fired");
			aSelectedDates = oCal3.getSelectedDates();
			assert.equal(aSelectedDates.length, 1, "1 items selected");
			oSelectedStartDate = aSelectedDates[0].getStartDate();
			oSelectedEndDate = aSelectedDates[0].getEndDate();
			assert.equal(oFormatYyyyMMddHHmm.format(oSelectedStartDate), "201508130900", "Item2 was selected");
			assert.ok(!oSelectedEndDate, "No end date");
			assert.ok($selectItem2.hasClass("sapUiCalItemSel"), "Item2 marked as selected");
			assert.ok(!$selectItem1.hasClass("sapUiCalItemSel"), "Item1 not marked as selected");
			done();
		}, 0);
	});


	QUnit.module("Calendar Picker");
	QUnit.test("Chosen date from the date picker is set as start date of the underying view", function(assert) {
		// arrange
		var $Date,
			oCalP = new CalendarTimeInterval("CalP",{
			startDate: new Date("2015", "7", "13", "8", "0", "0"),
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
			oSpyFireDateChange = this.spy(sap.ui.unified.CalendarTimeInterval.prototype, "fireStartDateChange"),
			oCalP = new CalendarTimeInterval("CalP",{
			startDate: new Date("2015", "7", "13", "8", "0", "0"),
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
		assert.strictEqual(oSpyFireDateChange.callCount, 1, "CalendarTimeInterval 'fireStartDateChange' was called once after selecting month, year and date");

		// clean
		oCalP.destroy();
	});

	QUnit.test("User opens the picker but escapes it - click outside for desktop or click cancel button", function(assert) {
		// arrange
		var oSpyCancel = this.spy(sap.ui.unified.CalendarTimeInterval.prototype, "fireCancel");
		var oCalP = new CalendarTimeInterval("CalP",{
			pickerPopup: true
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("click", "CalP--Head-B1");
		assert.ok(jQuery(jQuery("#CalP--Cal").get(0)).is(":visible"), "Calendar picker visible");

		sap.ui.test.qunit.triggerKeydown(sap.ui.getCore().byId("CalP").getFocusDomRef(), jQuery.sap.KeyCodes.ESCAPE);
		assert.ok(!jQuery(jQuery("#CalP--Cal").get(0)).is(":visible"), "Calendar picker not visible after closing");
		assert.strictEqual(oSpyCancel.callCount, 1, "CalendarTimeInterval 'fireCancel' was called once");

		// clean
		oCalP.destroy();
	});

	QUnit.test("Changing of the pickerPopup mode doesn't break min and max date inside yearPicker aggregation", function(assert) {
		// arrange
		var oCalP = new CalendarTimeInterval("CalP",{
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
			oCalP = new CalendarTimeInterval("CalP",{
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
		var oCalP = new CalendarTimeInterval("CalP",{
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

	QUnit.test("Content overlay is shown when picker is open", function(assert) {
		// arrange
		var oCalP = new CalendarTimeInterval("CalP",{
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

	QUnit.test("Custom data scenario", function(assert) {
		// arrange
		var oCTI = new CalendarTimeInterval("customDataCTI",{
			intervalMinutes: 60
		}),
		oTimesRow = sap.ui.getCore().byId("customDataCTI").getAggregation("timesRow"),
		oCustomData = sap.ui.getCore().getConfiguration().getFormatSettings().getCustomLocaleData();

		oCustomData["timeFormats-short"] = "HHmm";
		oTimesRow._oFormatTime = undefined;

		// assert
		assert.strictEqual(oTimesRow._getFormatTime().oFormatOptions["pattern"], "H", "The custom data's format is respected - H");

		// act
		oCustomData["timeFormats-short"] = "stringWithAcceptableLetterAtTheEndk";
		oTimesRow._oFormatTime = undefined;

		// assert
		assert.strictEqual(oTimesRow._getFormatTime().oFormatOptions["pattern"], "k", "The custom data's format is respected - k");

		// destroy
		oCTI.destroy();
	});

	return waitForThemeApplied();
});