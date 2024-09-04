/*global QUnit, sinon*/

sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendRenderer",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/core/CalendarType",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/HTML",
	'sap/ui/events/KeyCodes',
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/format/DateFormat",
	"sap/ui/unified/library",
	"sap/ui/unified/calendar/MonthRenderer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date",
	// load all required calendars in advance
	"sap/ui/core/date/Buddhist",
	"sap/ui/core/date/Gregorian",
	"sap/ui/core/date/Islamic",
	"sap/ui/core/date/Japanese"
], function(
	Formatting,
	Localization,
	Element,
	qutils,
	nextUIUpdate,
	Calendar,
	DateRange,
	DateTypeRange,
	CalendarLegend,
	CalendarLegendRenderer,
	CalendarLegendItem,
	CalendarType,
	Locale,
	LocaleData,
	HTML,
	KeyCodes,
	CalendarDate,
	InvisibleText,
	DateFormat,
	unifiedLibrary,
	MonthRenderer,
	jQuery,
	UI5Date
) {

	"use strict";
	// set language to en-US, since we have specific language strings tested
	Localization.setLanguage("en_US");

	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var bSelectFired = false;
	var oSelectedDate;
	var iStartDateChangeFired = 0;
	var oLocaleUS = new Locale("en-US");
	var oLocaleDataUS = LocaleData.getInstance(oLocaleUS);

	var handleStartDateChange = function(oEvent) {
		iStartDateChangeFired++;
	};

	var getExpectedSecondaryMonthARIAInfo = function (oCalendar, sPrimaryType, sSecondaryType) {
		var oDisplayedSecondaryMonths = oCalendar._getDisplayedSecondaryMonths(sPrimaryType, sSecondaryType),
			aSecondaryWideMonths = oLocaleDataUS.getMonthsStandAlone("wide", sSecondaryType),
			sIntervalPattern = oLocaleDataUS.getIntervalPattern();

		return sIntervalPattern.replace(/\{0\}/, aSecondaryWideMonths[oDisplayedSecondaryMonths.start]).replace(/\{1\}/, aSecondaryWideMonths[oDisplayedSecondaryMonths.end]);
	};

	var oLegend = new CalendarLegend("Legend1", {
		items: [
				new CalendarLegendItem("T1", {type: CalendarDayType.Type01, text: "My Type 1"}),
				new CalendarLegendItem("T2", {type: CalendarDayType.Type02, text: "My Type 2"}),
				new CalendarLegendItem("T3", {type: CalendarDayType.Type03, text: "My Type 3"}),
				new CalendarLegendItem("T5", {type: CalendarDayType.Type05, text: "My Type 5"}),
				new CalendarLegendItem("T6", {type: CalendarDayType.Type06, text: "My Type 6"}),
				new CalendarLegendItem("T7", {type: CalendarDayType.Type07, text: "My Type 7"}),
				new CalendarLegendItem("T8", {type: CalendarDayType.Type08, text: "My Type 8"}),
				new CalendarLegendItem("T9", {type: CalendarDayType.Type09, text: "My Type 9"}),
				new CalendarLegendItem("T10", {type: CalendarDayType.Type10, text: "My Type 10"})
			]
	});

	var oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyyMMdd"});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oCal1 = new Calendar("Cal1",{
				select: function(oEvent){
					bSelectFired = true;
					var oCalendar = oEvent.oSource;
					var aSelectedDates = oCalendar.getSelectedDates();
					if (aSelectedDates.length > 0 ) {
						oSelectedDate = aSelectedDates[0].getStartDate();
					}
				},
				startDateChange: handleStartDateChange
			}).placeAt("qunit-fixture");
			this.oCal2 = new Calendar("Cal2",{
				intervalSelection: true,
				width: "400px",
				selectedDates: [new DateRange({startDate: UI5Date.getInstance("2011", "0", "10"), endDate: UI5Date.getInstance("2011", "0", "13")})],
				specialDates: [new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "1"), type: CalendarDayType.Type01, tooltip: "Text"}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "2"), endDate: UI5Date.getInstance("2011", "0", "4"), type: CalendarDayType.Type02, tooltip: "Text"}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "5"), type: CalendarDayType.Type04}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "6"),
						endDate: UI5Date.getInstance("2011", "0", "10"), type: CalendarDayType.NonWorking}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "6"),
						endDate: UI5Date.getInstance("2011", "0", "6"), type: CalendarDayType.Type01}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "21"), type:
						CalendarDayType.NonWorking}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "26"), type:
						CalendarDayType.Type04, secondaryType: CalendarDayType.NonWorking})
				],
				legend: oLegend,
				startDateChange: handleStartDateChange
			}).placeAt("qunit-fixture");
			this.oCal2.setLocale("de-DE");
			this.oCal3 = new Calendar("Cal3",{
				months: 2,
				firstDayOfWeek: 2,
				nonWorkingDays: [3, 5],
				minDate: UI5Date.getInstance("2000", "0", "7"),
				maxDate: UI5Date.getInstance("2015", "1", "25"),
				selectedDates: [new DateRange({startDate: UI5Date.getInstance("2015", "0", "5")})],
				disabledDates: [new DateRange({startDate: UI5Date.getInstance("2015", "0", "10")}),
					new DateRange({startDate: UI5Date.getInstance("2015", "1", "10"), endDate: UI5Date.getInstance("2015", "1", "20")})],
				specialDates: [new DateTypeRange({startDate: UI5Date.getInstance("2015", "0", "26"), type:
					CalendarDayType.Type04, secondaryType: CalendarDayType.NonWorking})],
				startDateChange: handleStartDateChange
			}).placeAt("qunit-fixture");
			this.oCal3.setLocale("de-DE");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCal1.destroy();
			this.oCal2.destroy();
			this.oCal3.destroy();
		}
	});

	QUnit.test("width", function(assert) {
		var sStyle = jQuery("#Cal1").attr("style");
		assert.ok((!sStyle || sStyle.search("width") < 0), "Calendar1: no width set");

		sStyle = jQuery("#Cal2").attr("style");
		assert.ok((sStyle && sStyle.search("width:") >= 0  && sStyle.search("400px") >= 0), "Calendar2: width set");
	});

	QUnit.test("Week day orders", function(assert) {
		var oMonthDomRef = Element.getElementById("Cal1").getAggregation("month")[0].getDomRef(),
			aWeekHeaders = oMonthDomRef.querySelectorAll(".sapUiCalWH:not(.sapUiCalDummy)");

		assert.equal(aWeekHeaders.length, 7, "7 weekheaders rendered");
		assert.equal(aWeekHeaders[0].textContent, "Sun", "Sunday is the first weekday for en-US");

		oMonthDomRef = Element.getElementById("Cal2").getAggregation("month")[0].getDomRef();
		aWeekHeaders = oMonthDomRef.querySelectorAll(".sapUiCalWH:not(.sapUiCalDummy)");
		assert.equal(aWeekHeaders[0].textContent, "Mo", "Monday is the first weekday for de-DE");

		oMonthDomRef = Element.getElementById("Cal3").getAggregation("month")[0].getDomRef();
		aWeekHeaders = oMonthDomRef.querySelectorAll(".sapUiCalWH:not(.sapUiCalDummy)");
		assert.equal(aWeekHeaders[0].textContent, "Di", "Thuesday is the first weekday for custom setting");

		assert.equal(iStartDateChangeFired, 0, "Initially no startdateChange event fired");
		assert.equal(oFormatYyyymmdd.format(this.oCal2.getStartDate()), "20110101", "Cal2: Start date");
	});

	QUnit.test("Week day orders", function(assert) {
		//Assert
		this.oCal1.setCalendarWeekNumbering("ISO_8601");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var oMonthDomRef = Element.getElementById("Cal1").getAggregation("month")[0].getDomRef(),
			aWeekHeaders = oMonthDomRef.querySelectorAll(".sapUiCalWH:not(.sapUiCalDummy)");

		assert.equal(aWeekHeaders.length, 7, "7 weekheaders rendered");
		assert.equal(aWeekHeaders[0].textContent, "Mon", "Sunday is the first weekday for ISO_8601");

		this.oCal2.setCalendarWeekNumbering("MiddleEastern");
		this.oCal2.setLocale("en-US");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oMonthDomRef = Element.getElementById("Cal2").getAggregation("month")[0].getDomRef();
		aWeekHeaders = oMonthDomRef.querySelectorAll(".sapUiCalWH:not(.sapUiCalDummy)");
		assert.equal(aWeekHeaders[0].textContent, "Sat", "Saturday is the first weekday for MiddleEastern");

		this.oCal3.setCalendarWeekNumbering("WesternTraditional");
		this.oCal3.setLocale("en-US");
		this.oCal3.setFirstDayOfWeek(-1);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oMonthDomRef = Element.getElementById("Cal3").getAggregation("month")[0].getDomRef();
		aWeekHeaders = oMonthDomRef.querySelectorAll(".sapUiCalWH:not(.sapUiCalDummy)");
		assert.equal(aWeekHeaders[0].textContent, "Sun", "Sunday is the first weekday for WesternTraditional");

		assert.equal(iStartDateChangeFired, 0, "Initially no startdateChange event fired");
		assert.equal(oFormatYyyymmdd.format(this.oCal2.getStartDate()), "20110101", "Cal2: Start date");
	});

	QUnit.test("rendered month", function(assert) {
		var oToday = UI5Date.getInstance(),
			aMonths = jQuery("#Cal1-content").children(".sapUiCalMonthView"),
			$FocusedDay = jQuery(aMonths[0]).find("[tabindex='0']"),
			$Today = jQuery(aMonths[0]).find(".sapUiCalItemNow"),
			aSelectedDays,
			bOK = false,
			aDays;

		assert.equal(jQuery("#Cal1--Head-B1").text(), oLocaleDataUS.getMonthsStandAlone("wide")[oToday.getMonth()], "curent month shown");
		assert.equal(jQuery("#Cal1--Head-B2").text(), oToday.getFullYear(), "curent year shown");

		assert.equal(aMonths.length, 1, "1 month rendered");
		assert.equal($FocusedDay.attr("data-sap-day"), oFormatYyyymmdd.format(oToday), "curent date has tabindex 0");

		assert.equal($Today.attr("data-sap-day"), oFormatYyyymmdd.format(oToday), "current date is marked as today");
		assert.ok(!$Today.hasClass(".sapUiCalItemOtherMonth"), "current date is not in other month");
		assert.ok(!$Today.hasClass("sapUiCalItemSel"), "current date not marked as selected");
		assert.equal($Today.attr("aria-selected"), "false", "current date aria-selected = false");


		aMonths = jQuery("#Cal2-content").children(".sapUiCalMonthView");
		assert.equal(jQuery("#Cal2--Head-B1").text(), "Januar", "January shown");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "2011", "year 2011 shown");
		$FocusedDay = jQuery(aMonths[0]).find("[tabindex='0']");
		assert.equal($FocusedDay.attr("data-sap-day"), "20110110", "day 10 has tabindex 0");

		aSelectedDays = jQuery(aMonths[0]).find(".sapUiCalItemSel");
		assert.equal(aSelectedDays.length, 4, "4 days selected");
		assert.equal(jQuery(aSelectedDays[0]).attr("data-sap-day"), "20110110", "first day selected: 10");
		assert.ok(jQuery(aSelectedDays[0]).hasClass("sapUiCalItemSelStart"), "first selected day marked as selction start");
		assert.equal(jQuery(aSelectedDays[0]).attr("aria-selected"), "true", "first selected day aria-selected = true");
		assert.equal(jQuery(aSelectedDays[3]).attr("data-sap-day"), "20110113", "last day selected: 13");
		assert.ok(jQuery(aSelectedDays[3]).hasClass("sapUiCalItemSelEnd"), "last selected day marked as selction end");
		assert.equal(jQuery(aSelectedDays[3]).attr("aria-selected"), "true", "last selected day aria-selected  = true");

		aDays = jQuery(aMonths[0]).find(".sapUiCalItem");
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20101227", "first displayed day");
		assert.equal(jQuery(aDays[0]).attr("id"), "Cal2--Month0-20101227", "first displayed day has right ID");
		assert.ok(jQuery(aDays[0]).hasClass("sapUiCalItemOtherMonth"), "first displayed day is in other month");
		assert.equal(jQuery(aDays[aDays.length - 1]).attr("data-sap-day"), "20110206", "last displayed day");
		assert.ok(jQuery(aDays[aDays.length - 1]).hasClass("sapUiCalItemOtherMonth"), "last displayed day is in other month");

		if (!jQuery(aDays[0]).hasClass("sapUiCalItemWeekEnd") &&
			!jQuery(aDays[1]).hasClass("sapUiCalItemWeekEnd") &&
			!jQuery(aDays[2]).hasClass("sapUiCalItemWeekEnd") &&
			!jQuery(aDays[3]).hasClass("sapUiCalItemWeekEnd") &&
			!jQuery(aDays[4]).hasClass("sapUiCalItemWeekEnd") &&
			jQuery(aDays[5]).hasClass("sapUiCalItemWeekEnd") &&
			jQuery(aDays[6]).hasClass("sapUiCalItemWeekEnd")){
			bOK = true;
		}
		assert.ok(bOK, "Only Saturday and Sunday are Weekend");

		assert.equal(jQuery("#Cal3--Head-B1").text(), "Januar", "January shown");
		assert.equal(jQuery("#Cal3--Head-B2").text(), "2015", "year 2015 shown");

		aMonths = jQuery("#Cal3-content").children(".sapUiCalMonthView");
		assert.equal(aMonths.length, 2, "2 months rendered");

		$FocusedDay = jQuery(aMonths[0]).find("[tabindex='0']");
		assert.equal($FocusedDay.attr("data-sap-day"), "20150105", "first Month: day 2015-01-05 has tabindex 0");

		aDays = jQuery(aMonths[0]).find(".sapUiCalItem");
		bOK = false;

		if (!jQuery(aDays[0]).hasClass("sapUiCalItemWeekEnd") &&
			jQuery(aDays[1]).hasClass("sapUiCalItemWeekEnd") &&
			!jQuery(aDays[2]).hasClass("sapUiCalItemWeekEnd") &&
			jQuery(aDays[3]).hasClass("sapUiCalItemWeekEnd") &&
			!jQuery(aDays[4]).hasClass("sapUiCalItemWeekEnd") &&
			!jQuery(aDays[5]).hasClass("sapUiCalItemWeekEnd") &&
			!jQuery(aDays[6]).hasClass("sapUiCalItemWeekEnd")){
			bOK = true;
		}
		assert.ok(bOK, "Custom weekend used");
	});

	QUnit.test("disabled date", function(assert) {
		assert.ok(jQuery("#Cal3--Month0-20150110").hasClass("sapUiCalItemDsbl"), "Calendar3: 20150110 is disabled");
		assert.ok(jQuery("#Cal3--Month0-20150110").attr("aria-disabled"), "Calendar3: 20150110 has aria-disabled");
		assert.ok(jQuery("#Cal3--Month1-20150211").hasClass("sapUiCalItemDsbl"), "Calendar3: 20150211 is disabled");
		assert.ok(jQuery("#Cal3--Month1-20150211").attr("aria-disabled"), "Calendar3: 20150211 has aria-disabled");
		assert.ok(jQuery("#Cal3--Month1-20150212").hasClass("sapUiCalItemDsbl"), "Calendar3: 20150212 is disabled");
		assert.ok(jQuery("#Cal3--Month1-20150212").attr("aria-disabled"), "Calendar3: 20150212 has aria-disabled");
		assert.ok(jQuery("#Cal3--Month1-20150219").hasClass("sapUiCalItemDsbl"), "Calendar3: 20150219 is disabled");
		assert.ok(jQuery("#Cal3--Month1-20150219").attr("aria-disabled"), "Calendar3: 20150219 has aria-disabled");
		assert.ok(!jQuery("#Cal3--Month1-20150220").hasClass("sapUiCalItemDsbl"), "Calendar3: 20150220 is not disabled");
		assert.ok(!jQuery("#Cal3--Month1-20150220").attr("aria-disabled"), "Calendar3: 20150220 has no aria-disabled");
		assert.ok(jQuery("#Cal3--Month1-20150226").hasClass("sapUiCalItemDsbl"), "Calendar3: 20150226 is disabled");
		assert.ok(jQuery("#Cal3--Month1-20150226").attr("aria-disabled"), "Calendar3: 20150226 has aria-disabled");
	});

	QUnit.test("focusDate method", function(assert) {
		var bFound = false,
			i = 0,
			aMonths, aDays,
			oFocusSpy = this.spy(HTMLElement.prototype, "focus");

		iStartDateChangeFired = 0;
		this.oCal2.focusDate(UI5Date.getInstance(2012, 11, 12));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		aMonths = jQuery("#Cal2-content").children(".sapUiCalMonthView");
		aDays = jQuery(aMonths[0]).find(".sapUiCalItem");

		assert.equal(jQuery("#Cal2--Head-B1").text(), "Dezember", "December shown");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "2012", "year 2012 shown");

		for (i = 0; i < aDays.length; i++){
			if (jQuery(aDays[i]).attr("tabindex") == "0"){
				bFound = true;
				break;
			}
		}

		assert.ok((bFound && jQuery(aDays[i]).attr("data-sap-day") == "20121212"), "20121212 focused");
		assert.equal(oFocusSpy.callCount, 1, "an item was focused");
		assert.ok(oFocusSpy.calledOn(jQuery(aDays[i])[0]), "the correct item was focused");
		assert.equal(iStartDateChangeFired, 0, "no startdateChange event fired");

		// BCP 1780270593
		try {
			this.oCal2.focusDate(null);
			assert.ok(true, "focusDate() is called successfully with 'null'");
		} catch (e) {
			assert.ok(false, "focusDate() throws error when called with 'null'!");
		}

		this.oCal2.focusDate(UI5Date.getInstance(2011, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act - move the focus out of Cal2 (to Cal1) and set focus date to the same date on Cal2
		this.oCal1.focus();
		this.oCal2.focusDate(UI5Date.getInstance(2011, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(jQuery(document.activeElement).attr("id"), "Cal2--Month0-20110110",
					"Focus should NOT remain on Cal1 but on Cal2 focused date");
	});

	QUnit.test("week number with calendarWeekNumbering calculation", function(assert) {
		// ISO_8601
		this.oCal1.focusDate(UI5Date.getInstance(2011, 0, 10));
		this.oCal1.setCalendarWeekNumbering("ISO_8601");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var aMonths = jQuery("#Cal1-content").children(".sapUiCalMonthView"),
			aWeekNumbers = jQuery(aMonths[0]).find(".sapUiCalWeekNum");

		assert.equal(jQuery(aWeekNumbers[0]).text(), "52", "week number 2011 first week for ISO_8601");
		assert.equal(jQuery(aWeekNumbers[1]).text(), "1", "week number 2011 second week for ISO_8601");
		this.oCal1.focusDate(UI5Date.getInstance(2014, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		aWeekNumbers = jQuery(aMonths[0]).find(".sapUiCalWeekNum");
		assert.equal(jQuery(aWeekNumbers[0]).text(), "1", "week number 2014 first week for ISO_8601");
		assert.equal(jQuery(aWeekNumbers[1]).text(), "2", "week number 2014 second week for ISO_8601");
		this.oCal1.focusDate(UI5Date.getInstance());
		this.oCal1.setCalendarWeekNumbering("Default");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Prepare
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oCal12 = new Calendar("Cal12",{
			calendarWeekNumbering: "MiddleEastern",
			width: "400px"
		}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		this.oCal12.focusDate(UI5Date.getInstance(2011, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aMonths = jQuery("#Cal12-content").children(".sapUiCalMonthView");
		aWeekNumbers = jQuery(aMonths[0]).find(".sapUiCalWeekNum");

		// Assert
		assert.equal(jQuery(aWeekNumbers[0]).text(), "1", "week number 2011 first week for MiddleEastern");
		assert.equal(jQuery(aWeekNumbers[1]).text(), "2", "week number 2011 second week for MiddleEastern");

		// Act
		this.oCal12.focusDate(UI5Date.getInstance(2014, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aMonths = jQuery("#Cal12-content").children(".sapUiCalMonthView");
		aWeekNumbers = jQuery(aMonths[0]).find(".sapUiCalWeekNum");

		// Assert
		assert.equal(jQuery(aWeekNumbers[0]).text(), "1", "week number 2014 first week for MiddleEastern");
		assert.equal(jQuery(aWeekNumbers[1]).text(), "2", "week number 2014 second week for MiddleEastern");

		// Prepare
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oCal122 = new Calendar("Cal122",{
			calendarWeekNumbering: "WesternTraditional",
			width: "400px"
		}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		this.oCal122.focusDate(UI5Date.getInstance(2011, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aMonths = jQuery("#Cal122-content").children(".sapUiCalMonthView");
		aWeekNumbers = jQuery(aMonths[0]).find(".sapUiCalWeekNum");

		// Assert
		assert.equal(jQuery(aWeekNumbers[0]).text(), "1", "week number 2011 first week for WesternTraditional");
		assert.equal(jQuery(aWeekNumbers[1]).text(), "2", "week number 2011 second week for WesternTraditional");

		// Act
		this.oCal122.focusDate(UI5Date.getInstance(2014, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aMonths = jQuery("#Cal122-content").children(".sapUiCalMonthView");
		aWeekNumbers = jQuery(aMonths[0]).find(".sapUiCalWeekNum");

		// Assert
		assert.equal(jQuery(aWeekNumbers[0]).text(), "1", "week number 2014 first week for WesternTraditional");
		assert.equal(jQuery(aWeekNumbers[1]).text(), "2", "week number 2014 second week for WesternTraditional");

		Localization.setLanguage("en-US");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oCal2.focusDate(UI5Date.getInstance(2011, 0, 10));

		// Clean
		this.oCal122.destroy();
		this.oCal12.destroy();
	});

	QUnit.test("week number calculation", function(assert) {
		// en-US
		this.oCal1.focusDate(UI5Date.getInstance(2011, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var aMonths = jQuery("#Cal1-content").children(".sapUiCalMonthView"),
			aWeekNumbers = jQuery(aMonths[0]).find(".sapUiCalWeekNum");

		assert.equal(jQuery(aWeekNumbers[0]).text(), "1", "week number 2011 first week for en-US");
		assert.equal(jQuery(aWeekNumbers[1]).text(), "2", "week number 2011 second week for en-US");
		this.oCal1.focusDate(UI5Date.getInstance(2014, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		aWeekNumbers = jQuery(aMonths[0]).find(".sapUiCalWeekNum");
		assert.equal(jQuery(aWeekNumbers[0]).text(), "1", "week number 2014 first week for en-US");
		assert.equal(jQuery(aWeekNumbers[1]).text(), "2", "week number 2014 second week for en-US");
		this.oCal1.focusDate(UI5Date.getInstance());
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// de-DE
		// Prepare
		Localization.setLanguage("de-DE");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oCal12 = new Calendar("Cal12",{
			width: "400px"
		}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		this.oCal12.focusDate(UI5Date.getInstance(2011, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aMonths = jQuery("#Cal12-content").children(".sapUiCalMonthView");
		aWeekNumbers = jQuery(aMonths[0]).find(".sapUiCalWeekNum");

		// Assert
		assert.equal(jQuery(aWeekNumbers[0]).text(), "52", "week number 2011 first week for de-DE");
		assert.equal(jQuery(aWeekNumbers[1]).text(), "1", "week number 2011 second week for de-DE");

		// Act
		this.oCal12.focusDate(UI5Date.getInstance(2014, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aMonths = jQuery("#Cal12-content").children(".sapUiCalMonthView");
		aWeekNumbers = jQuery(aMonths[0]).find(".sapUiCalWeekNum");

		// Assert
		assert.equal(jQuery(aWeekNumbers[0]).text(), "1", "week number 2014 first week for de-DE");
		assert.equal(jQuery(aWeekNumbers[1]).text(), "2", "week number 2014 second week for de-DE");

		// Act
		Localization.setLanguage("en-US");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oCal2.focusDate(UI5Date.getInstance(2011, 0, 10));

		// Clean
		this.oCal12.destroy();
	});

	QUnit.test("special days", function(assert) {
		var sDescribingDomTextId;

		assert.ok(jQuery("#Cal2--Month0-20110101").hasClass("sapUiCalItemType01"), "20110101 is special day of Type01");
		assert.equal(jQuery("#Cal2--Month0-20110101").attr("title"), "Non-Working Day Text", "20110101 has special days tooltip");
		assert.equal(jQuery("#Cal2--Month0-20110101").attr("aria-label"), "1. Januar 2011; My Type 1", "20110101 aria label");

		assert.ok(jQuery("#Cal2--Month0-20110102").hasClass("sapUiCalItemType02"), "20110102 is special day of Type02");
		assert.equal(jQuery("#Cal2--Month0-20110102").attr("title"), "Non-Working Day Text", "20110102 has special days tooltip");
		assert.equal(jQuery("#Cal2--Month0-20110102").attr("aria-label"), "2. Januar 2011; My Type 2", "20110102 aria label");

		assert.ok(jQuery("#Cal2--Month0-20110103").hasClass("sapUiCalItemType02"), "20110103 is special day of Type02");
		assert.equal(jQuery("#Cal2--Month0-20110103").attr("title"), "Text", "20110103 has special days tooltip");
		assert.equal(jQuery("#Cal2--Month0-20110103").attr("aria-label"), "3. Januar 2011; My Type 2", "20110103 aria label");


		assert.ok(jQuery("#Cal2--Month0-20110104").hasClass("sapUiCalItemType02"), "20110104 is special day of Type02");
		assert.equal(jQuery("#Cal2--Month0-20110104").attr("title"), "Text", "20110104 has special days tooltip");
		assert.equal(jQuery("#Cal2--Month0-20110104").attr("aria-label"), "4. Januar 2011; My Type 2", "20110104 aria label");

		sDescribingDomTextId = CalendarLegendRenderer.typeARIATexts["Type04"].getId();
		assert.ok(jQuery("#Cal2--Month0-20110105").attr("aria-describedby").indexOf(sDescribingDomTextId) > -1, "special day is described by a static label");

		assert.equal(jQuery("#Cal2--Month0-20110106").attr("aria-label"), "6. Januar 2011; My Type 1", "20110106 aria label");
		assert.ok(jQuery("#Cal2--Month0-20110106").hasClass("sapUiCalItemWeekEnd"),
				"20110106 is date of type 'NonWorking' as part of a date range");
		assert.notOk(jQuery("#Cal2--Month0-20110106").hasClass("sapUiCalItemType01") && jQuery("#Cal2--Month0-20110106").hasClass("sapUiCalItemWeekEnd"),
		"20110106 is date of type 'Type0' and type 'NonWorking'");
		assert.ok(jQuery("#Cal2--Month0-20110108").hasClass("sapUiCalItemWeekEnd"),
				"20110108 is date of type 'NonWorking' as part of a date range");
		assert.ok(jQuery("#Cal2--Month0-20110110").hasClass("sapUiCalItemWeekEnd"),
				"20110110 is date of type 'NonWorking' as part of a date range");
		assert.ok(!jQuery("#Cal2--Month0-20110111").hasClass("sapUiCalItemWeekEnd"),
				"20110111 is a regular working date");
		assert.ok(jQuery("#Cal2--Month0-20110121").hasClass("sapUiCalItemWeekEnd"),
				"20110121 is date of type 'NonWorking' as part of a single date");
		assert.ok(jQuery("#Cal2--Month0-20110126").hasClass("sapUiCalItemWeekEnd"),
				"20110126 is date of type 'NonWorking' as part of a single date with property secondaryDate");
		assert.ok(jQuery("#Cal2--Month0-20110126").hasClass("sapUiCalItemType04"),
				"20110126 is date of type Type04 as part of a single date with property secondaryDate");


		assert.equal(jQuery("#Cal3--Month0-20150126").attr("aria-label"), "26. Januar 2015", "20150126 is a date of type 'NonWorking' and is added without legend");

		// act
		this.oCal2.setLegend(null);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.equal(jQuery("#Cal2--Month0-20110129").attr("aria-label"), "29. Januar 2011", "20110129 is a day from the weekend and this is the reason why 'NonWorking' is added");
		assert.equal(jQuery("#Cal2--Month0-20110123").attr("aria-label"), "23. Januar 2011", "20110123 is a day from the weekend and this is the reason why 'NonWorking' is added");

		//act
		this.oCal2.setLegend(oLegend);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oCal2.addSpecialDate(new DateTypeRange({
			type: CalendarDayType.NonWorking,
			startDate: UI5Date.getInstance(2011, 0, 22)
		}));

		//assert
		assert.ok(jQuery("#Cal2--Month0-20110122").hasClass("sapUiCalItemWeekEnd"), "20110122 is a date of type 'NonWorking'");

	});

	QUnit.test("YearPicker primaryCalendarType", function(assert) {

		var oCalItems, aMonths, aYears, $Date;

		assert.equal(this.oCal2.getPrimaryCalendarType(), undefined, "Calendar2: PrimaryCalendarType default");
		this.oCal2.focusDate(UI5Date.getInstance(2011, 0, 1)); // to be sure where focus is
		this.oCal2.setPrimaryCalendarType(CalendarType.Islamic);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		aMonths = jQuery("#Cal2-content").children(".sapUiCalMonthView");
		oCalItems = jQuery(aMonths[0]).find(".sapUiCalItem");

		assert.equal(oCalItems.length, 42, "Calendar2: number of displayed days");
		assert.equal(jQuery(oCalItems[0]).attr("data-sap-day"), "20101206", "Calendar2: first displayed day");
		assert.equal(jQuery(oCalItems[oCalItems.length - 1]).attr("data-sap-day"), "20110116", "Calendar2: last displayed day");
		assert.equal(jQuery("#Cal2--Head-B1").text(), "Muharram", "Muharram shown");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "1432 AH", "year 1432 shown");
		qutils.triggerEvent("click", "Cal2--Head-B1");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oCalItems = jQuery("#Cal2--MP").find(".sapUiCalItem");
		assert.equal(jQuery(oCalItems[0]).text(), "Muharram", "Calendar2: first displayed month");

		qutils.triggerEvent("click", "Cal2--Head-B2");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aYears = jQuery("#Cal2--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[0]).text(), "1422 AH", "Calendar2: first displayed year");

		$Date = jQuery("#Cal2--YP-y20101208");
		$Date.trigger("focus");
		qutils.triggerKeydown($Date.get(0), KeyCodes.ENTER, false, false, false);

		this.oCal2.setPrimaryCalendarType(Formatting.getCalendarType());
		nextUIUpdate.runSync()/*fake timer is used in module*/;
	});

	QUnit.test("YearRangePicker correct text is displayed for the year ranges based on the calendar type", function(assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Japanese,
				selectedDates: [new DateRange({startDate: UI5Date.getInstance("3015", "0", "1")})]
			}).placeAt("qunit-fixture"),
			oHeaderButton2,
			$yearRanges;

		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oHeaderButton2 = document.querySelector("#__calendar0--Head-B2");

		// Act
		qutils.triggerEvent("click", oHeaderButton2.id);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		// Assert
		assert.strictEqual(oHeaderButton2.innerText, "987 Reiwa - 1006 Reiwa", "Header button two has correct text displayed");

		// Act
		qutils.triggerEvent("click", oHeaderButton2.id);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		$yearRanges = jQuery("#__calendar0--YRP").find(".sapUiCalItem");

		// Assert
		assert.strictEqual($yearRanges.length, 4, "Correct number of year ranges are displayed");
		// \u2009 is a thin space (both introduced with CLDR version 43), \u2013 is a dash
		assert.strictEqual($yearRanges[0].innerText, "947 Reiwa\u2009\u2013\u2009966 Reiwa", "Correct first year range is displayed");
		assert.strictEqual(document.activeElement.innerText, "987 Reiwa\u2009\u2013\u20091006 Reiwa", "Correct year range is displayed and focused");

		// Clean
		oCal.destroy();
	});

	QUnit.test("secondaryCalendarType", function(assert) {
		this.oCal2.setSecondaryCalendarType(CalendarType.Islamic);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var aMonths = jQuery("#Cal2-content").children(".sapUiCalMonthView"),
			aDays = jQuery(aMonths[0]).find(".sapUiCalItem");

		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20101227", "Calendar2: first displayed day");
		assert.equal(jQuery(jQuery(aDays[0]).children(".sapUiCalItemText")[0]).text(), "27", "Calendar2: first displayed day - text");
		assert.equal(jQuery(jQuery(aDays[0]).children(".sapUiCalItemSecText")[0]).text(), "20", "Calendar2: first displayed day - secondary text");
		assert.equal(jQuery(jQuery("#Cal2--Head-B1").children(".sapUiCalHeadBText")[0]).text(), "Januar", "Januar shown");
		// \u2009 is a thin space (both introduced with CLDR version 43), \u2013 is a dash
		assert.equal(jQuery(jQuery("#Cal2--Head-B1").children(".sapUiCalHeadBAddText")[0]).text(), "Muh.\u2009\u2013\u2009Saf.", "Muh. - Saf. shown");
		assert.equal(jQuery(jQuery("#Cal2--Head-B2").children(".sapUiCalHeadBText")[0]).text(), "2011", "year 2011 shown");
		assert.equal(jQuery(jQuery("#Cal2--Head-B2").children(".sapUiCalHeadBAddText")[0]).text(), "1432 AH", "year 1432 shown");

		this.oCal2.setSecondaryCalendarType(Formatting.getCalendarType());
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		aDays = jQuery(aMonths[0]).find(".sapUiCalItem");
		assert.ok(!jQuery(aDays[0]).children(".sapUiCalItemSecText")[0], "Calendar2: first displayed day - no secondary text");
		assert.equal(jQuery("#Cal2--Head-B1").text(), "Januar", "Januar shown");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "2011", "year 2011 shown");
	});

	QUnit.test("check if Month names are too long to fit", function(assert) {
		var oCalM = new Calendar("CalM", {}),
			month = oCalM.getAggregation("month"),
			aMonthHeadersShort = [{clientWidth:123, scrollWidth:123}], //array with values that will fit inside "month boxes"
			aMonthHeadersLong = [{clientWidth:156, scrollWidth:145}], //array with values that will not fit inside "month boxes"
			monthSpy = this.spy(month[0], "_isMonthNameLong");

		//arrange
		oCalM.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//act
		assert.equal(monthSpy.callCount, 1, "The function was called once");
		assert.equal(month[0]._isMonthNameLong(aMonthHeadersShort), false, "Month names are fitting inside the boxes, no need of using short one");
		assert.equal(month[0]._isMonthNameLong(aMonthHeadersLong), true, "Month names are not fitting inside the boxes, we shoud use short one");

		// clean up
		oCalM.destroy();
	});

	QUnit.test("Remove selectedDate", function(assert) {
		//Arrange
		var oSelectedDateRange = new DateRange({startDate: UI5Date.getInstance()}),
			oCal = new Calendar("calSelectedDates", {
				selectedDates: oSelectedDateRange
			}).placeAt("qunit-fixture");

		//Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		var aSelectedDates = oCal.getDomRef().querySelectorAll(".sapUiCalMonthView .sapUiCalItemSel");
		assert.equal(aSelectedDates.length, 1, "Initially there should be one selected date");

		//Act
		oCal.removeSelectedDate(oSelectedDateRange);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aSelectedDates = oCal.getDomRef().querySelectorAll(".sapUiCalMonthView .sapUiCalItemSel");

		//Assert
		assert.equal(aSelectedDates.length, 0, "The selected date is removed.");

		// clean up
		oCal.destroy();
	});

	QUnit.test("_adjustYearRangeDisplay is called in setPrimaryCalendarType", function(assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: "Islamic"
			}),
			oAdjustYearRangeDisplaySpy = this.spy(oCal, "_adjustYearRangeDisplay");

		oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		// Assert
		assert.ok(oAdjustYearRangeDisplaySpy.calledTwice, "_adjustYearRangeDisplay is called once");

		// Clean
		oCal.destroy();
	});

	QUnit.test("YearRangePicker has three columns and 9 year ranges when the calendar type is Gregorian", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian
			}).placeAt("qunit-fixture"),
			oYearRangePicker = oCal.getAggregation("yearRangePicker");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		// Assert
		assert.ok(oYearRangePicker.getColumns(), 3, "YearRangePicker has three columns");
		assert.ok(oYearRangePicker.getYears(), 9, "YearRangePicker has display nine year ranges");

		// Clean
		oCal.destroy();
	});

	QUnit.test("YearRangePicker has two columns and 8 year ranges when the calendar type is Islamic", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Islamic
			}).placeAt("qunit-fixture"),
			oYearRangePicker;

		// Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oYearRangePicker = oCal.getAggregation("yearRangePicker");

		// Assert
		assert.ok(oYearRangePicker.getColumns(), 2, "YearRangePicker has two columns");
		assert.ok(oYearRangePicker.getYears(), 8, "YearRangePicker has display eight year ranges");

		// Clean
		oCal.destroy();
	});

	QUnit.test("YearRangePicker has one column and four year ranges when the calendar type is Japanese", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Japanese
			}).placeAt("qunit-fixture"),
			oYearRangePicker = oCal.getAggregation("yearRangePicker");

		nextUIUpdate.runSync()/*fake timer is used in module*/;
		// Act
		// Assert
		assert.ok(oYearRangePicker.getColumns(), 1, "YearRangePicker has one column");
		assert.ok(oYearRangePicker.getYears(), 4, "YearRangePicker has display four year ranges");

		// Clean
		oCal.destroy();
	});

	QUnit.test("Calendar type affects YearRangePicker rendering", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian
			}).placeAt("qunit-fixture"),
			oYearRangePicker = oCal.getAggregation("yearRangePicker"),
			oAdjustYearRangeDisplaySpy = this.spy(oCal, "_adjustYearRangeDisplay");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal.setPrimaryCalendarType(CalendarType.Buddhist);

		// Assert
		assert.ok(oAdjustYearRangeDisplaySpy.called, "_adjustYearRangeDisplay is called once");
		assert.ok(oYearRangePicker.getColumns(), 2, "YearRangePicker has two columns");
		assert.ok(oYearRangePicker.getYears(), 8, "YearRangePicker has display eight year ranges");

		// Clean
		oCal.destroy();
		oAdjustYearRangeDisplaySpy.restore();
	});

	QUnit.test("Month Button appearance (hidden/visible)", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian
			}).placeAt("qunit-fixture"),
			oHeader = oCal.getAggregation("header");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// check initial Month Button visibility
		assert.equal(oHeader.getVisibleButton1(), true, "At the beginning, Month Button is visible");

		// open MonthPicker and check Button visibility
		oCal._showMonthPicker(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(oHeader.getVisibleButton1(), false, "After opening of the Month Picker, Month Button is hidden");

		// close MonthPicker and check Button visibility
		oCal._selectMonth();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(oHeader.getVisibleButton1(), true, "After closing of the Month Picker, Month Button is visible");

		oCal.destroy();
	});

	QUnit.test("Month Button appearance on two months in two columns", function (assert) {
		// arrange
		var oCal3 = new Calendar("Cal_3",{ months: 2 }).placeAt("qunit-fixture"),
			oMP = oCal3.getAggregation("monthPicker");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act: click on first header month button and set month
		qutils.triggerEvent("click", "Cal_3--Head-B1");
		oMP.setMonth(7);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.notOk(oCal3.getAggregation("header").getVisibleButton1(), "First header button must be hidden");
		assert.ok(oCal3.getAggregation("header")._getVisibleButton3(), "Third header button must be visible");

		// act: select month and close popover
		oCal3._selectMonth(oMP.getMonth());
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.ok(oCal3.getAggregation("header").getVisibleButton1(), "First header button must be visible");
		assert.ok(oCal3.getAggregation("header")._getVisibleButton3(), "Third header button must be visible");

		// act: click on second header month button and set month
		qutils.triggerEvent("click", "Cal_3--Head-B3");
		oMP.setMonth(7);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.ok(oCal3.getAggregation("header").getVisibleButton1(), "First header button must be visible");
		assert.notOk(oCal3.getAggregation("header")._getVisibleButton3(), "Third header button must be hidden");

		// cleanup
		oCal3.destroy();
		oCal3 = null;
		oMP.destroy();
		oMP = null;
	});

	QUnit.module("initialize");

	QUnit.test("SecondMonthHeader is invisible", function(assert) {
		var oCal = new Calendar();

		// Act
		// Assert
		assert.notOk(oCal.getAggregation("secondMonthHeader").getVisible(), "secondMonthHeader aggregation is not visible");
	});

	QUnit.test("YearRangePicker aggregation is instantiated correctly", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Islamic
			}),
			oYearRangePicker = oCal.getAggregation("yearRangePicker");

		// Act
		// Assert
		assert.strictEqual(oYearRangePicker.getPrimaryCalendarType(), oCal.getPrimaryCalendarType(),
			"YearRangePicker instance has the same primary calendar type as the calendar instance");

		// Clean
		oCal.destroy();
	});

	QUnit.test("getSelectedDates returns the right values", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian
			}),
			oMonthPicker = oCal.getAggregation("monthPicker"),
			aSelectedDays;

		// Act
		oCal.addSelectedDate(new DateRange(UI5Date.getInstance(2019,1,1), UI5Date.getInstance(2021,1,1)));
		aSelectedDays  = oMonthPicker.getSelectedDates();

		// Assert
		assert.deepEqual(aSelectedDays, oCal.getSelectedDates(),
			"MonthPicker has selected dates control origin set");
		// Clean
		oCal.destroy();
	});

	QUnit.test("there should be no focus on initialisation", function(assert) {
		// Prepare
		var oCal = new Calendar().placeAt("qunit-fixture"),
			oMonthFocusDelegateSpy = this.spy(oCal, "_addMonthFocusDelegate");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal.onThemeChanged();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oMonthFocusDelegateSpy.callCount, 0, "the delegate for adding a focus to the month is not used");

		// Clean
		oMonthFocusDelegateSpy.restore();
		oCal.destroy();
	});

	QUnit.module("Interaction", {
		beforeEach: function () {
			this.oCal1 = new Calendar("Cal1",{
				select: function(oEvent){
					bSelectFired = true;
					var oCalendar = oEvent.oSource;
					var aSelectedDates = oCalendar.getSelectedDates();
					if (aSelectedDates.length > 0 ) {
						oSelectedDate = aSelectedDates[0].getStartDate();
					}
				},
				startDateChange: handleStartDateChange
			}).placeAt("qunit-fixture");
			this.oCal2 = new Calendar("Cal2",{
				intervalSelection: true,
				width: "400px",
				selectedDates: [new DateRange({startDate: UI5Date.getInstance("2011", "0", "10"), endDate: UI5Date.getInstance("2011", "0", "13")})],
				specialDates: [new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "1"), type: CalendarDayType.Type01, tooltip: "Text"}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "2"), endDate: UI5Date.getInstance("2011", "0", "4"), type: CalendarDayType.Type02, tooltip: "Text"}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "5"), type: CalendarDayType.Type04}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "6"),
						endDate: UI5Date.getInstance("2011", "0", "10"), type: CalendarDayType.NonWorking}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "6"),
						endDate: UI5Date.getInstance("2011", "0", "6"), type: CalendarDayType.Type01}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "21"), type:
						CalendarDayType.NonWorking}),
					new DateTypeRange({startDate: UI5Date.getInstance("2011", "0", "26"), type:
						CalendarDayType.Type04, secondaryType: CalendarDayType.NonWorking})
				],
				legend: oLegend,
				startDateChange: handleStartDateChange
			}).placeAt("qunit-fixture");
			this.oCal2.setLocale("de-DE");
			this.oCal3 = new Calendar("Cal3",{
				months: 2,
				firstDayOfWeek: 2,
				nonWorkingDays: [3, 5],
				minDate: UI5Date.getInstance("2005", "0", "7"),
				maxDate: UI5Date.getInstance("2015", "1", "25"),
				selectedDates: [new DateRange({startDate: UI5Date.getInstance("2015", "0", "5")})],
				disabledDates: [new DateRange({startDate: UI5Date.getInstance("2015", "0", "10")}),
					new DateRange({startDate: UI5Date.getInstance("2015", "1", "10"), endDate: UI5Date.getInstance("2015", "1", "20")})],
				specialDates: [new DateTypeRange({startDate: UI5Date.getInstance("2015", "0", "26"), type:
					CalendarDayType.Type04, secondaryType: CalendarDayType.NonWorking})],
				startDateChange: handleStartDateChange
			}).placeAt("qunit-fixture");
			this.oCal3.setLocale("de-DE");
			this.oCal4 = new Calendar("Cal4",{
				months: 2,
				minDate: UI5Date.getInstance("2016", "10", "1"),
				startDateChange: handleStartDateChange,
				singleSelection: false
			}).placeAt("qunit-fixture");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCal1.destroy();
			this.oCal2.destroy();
			this.oCal3.destroy();
			this.oCal4.destroy();
		}
	});

	QUnit.test("month switch", function(assert) {
		iStartDateChangeFired = 0;
		qutils.triggerEvent("click", "Cal2--Head-prev");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(jQuery("#Cal2--Head-B1").text(), "Dezember", "December shown");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "2010", "year 2010 shown");

		var aMonths = jQuery("#Cal2-content").children(".sapUiCalMonthView"),
			aDays = jQuery(aMonths[0]).find(".sapUiCalItem");

		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20101129", "first displayed day");
		assert.ok(jQuery(aDays[0]).hasClass("sapUiCalItemOtherMonth"), "first displayed day is in other month");
		assert.equal(jQuery(aDays[aDays.length - 1]).attr("data-sap-day"), "20110109", "last displayed day");
		assert.ok(jQuery(aDays[aDays.length - 1]).hasClass("sapUiCalItemOtherMonth"), "last displayed day is in other month");
		assert.equal(iStartDateChangeFired, 1, "startdateChange event fired");
		assert.equal(oFormatYyyymmdd.format(this.oCal2.getStartDate()), "20101201", "Start date");

		iStartDateChangeFired = 0;
		qutils.triggerEvent("click", "Cal2--Head-next");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(jQuery("#Cal2--Head-B1").text(), "Januar", "january shown again");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "2011", "year 2011 shown again");

		aMonths = jQuery("#Cal2-content").children(".sapUiCalMonthView");
		aDays = jQuery(aMonths[0]).find(".sapUiCalItem");
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20101227", "first displayed day");
		assert.ok(jQuery(aDays[0]).hasClass("sapUiCalItemOtherMonth"), "first displayed day is in other month");
		assert.equal(jQuery(aDays[aDays.length - 1]).attr("data-sap-day"), "20110206", "last displayed day");
		assert.ok(jQuery(aDays[aDays.length - 1]).hasClass("sapUiCalItemOtherMonth"), "last displayed day is in other month");
		assert.equal(iStartDateChangeFired, 1, "startdateChange event fired");
		assert.equal(oFormatYyyymmdd.format(this.oCal2.getStartDate()), "20110101", "Start date");

		iStartDateChangeFired = 0;
		qutils.triggerEvent("click", "Cal2--Head-B1");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(jQuery(jQuery("#Cal2--MP").get(0)).is(":visible"), "Month picker rendered");
		var $July = jQuery("#Cal2--MP-m6"); // use keybord to select month to prevent event processing from ItemNavigation
		$July.trigger("focus");
		qutils.triggerKeydown($July.get(0), KeyCodes.ENTER, false, false, false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(!jQuery(jQuery("#Cal2--MP").get(0)).is(":visible"), "Month picker removed after selecting month");
		assert.equal(jQuery("#Cal2--Head-B1").text(), "Juli", "July shown");

		aMonths = jQuery("#Cal2-content").children(".sapUiCalMonthView");
		aDays = jQuery(aMonths[0]).find(".sapUiCalItem");
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20110627", "first displayed day");
		assert.ok(jQuery(aDays[0]).hasClass("sapUiCalItemOtherMonth"), "first displayed day is in other month");
		assert.equal(jQuery(aDays[aDays.length - 1]).attr("data-sap-day"), "20110807", "last displayed day");
		assert.ok(jQuery(aDays[aDays.length - 1]).hasClass("sapUiCalItemOtherMonth"), "last displayed day is in other month");
		assert.equal(iStartDateChangeFired, 1, "startdateChange event fired");
		assert.equal(oFormatYyyymmdd.format(this.oCal2.getStartDate()), "20110701", "Start date");

		// go back to january
		qutils.triggerEvent("click", "Cal20--Head-B1");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var $January = jQuery("#Cal2--MP-m0"); // use keybord to select month to prevent event processing from ItemNavigation
		$January.trigger("focus");
		qutils.triggerKeydown($January.get(0), KeyCodes.ENTER, false, false, false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		qutils.triggerEvent("click", "Cal3--Head-prev");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(jQuery("#Cal3--Head-B1").text(), "Dezember", "Dezember shown");
		assert.equal(jQuery("#Cal3--Head-B2").text(), "2014", "year 2014 shown");
		assert.equal(jQuery("#Cal3--Head-B3").text(), "Januar", "Januar shown");
		assert.equal(jQuery("#Cal3--Head-B4").text(), "2015", "year 2015 shown");

		aMonths = jQuery("#Cal3-content").children(".sapUiCalMonthView");
		aDays = jQuery(aMonths[0]).find(".sapUiCalItem");
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20141125", "first displayed day");

		aDays = jQuery(aMonths[1]).find(".sapUiCalItem");
		assert.equal(jQuery(aDays[aDays.length - 1]).attr("data-sap-day"), "20150202", "last displayed day");
		qutils.triggerEvent("click", "Cal3--Head-next");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(jQuery("#Cal3--Head-B1").text(), "Januar", "january shown again");
		assert.equal(jQuery("#Cal3--Head-B2").text(), "2015", "year 2015 shown again");
		assert.equal(jQuery("#Cal3--Head-B3").text(), "Februar", "februar shown again");
		assert.equal(jQuery("#Cal3--Head-B4").text(), "2015", "year 2015 shown again");

		aMonths = jQuery("#Cal3-content").children(".sapUiCalMonthView");
		aDays = jQuery(aMonths[0]).find(".sapUiCalItem");
		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "20141230", "first displayed day");
		aDays = jQuery(aMonths[1]).find(".sapUiCalItem");
		assert.equal(jQuery(aDays[aDays.length - 1]).attr("data-sap-day"), "20150302", "last displayed day");

		// creat event and spy on it on space press
		var oEvent = jQuery.Event("sapspace");
		var oSpy = this.spy();
		oEvent.preventDefault = oSpy;



		//Move to March to test <,> navigation through month with different days (e.g. March-April)
		//Prepare
		var oCal5 = new Calendar("Cal5");
		oCal5.setLocale("en-US");
		oCal5.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCal5.displayDate(UI5Date.getInstance(2017, 3, 1));

		//Act
		qutils.triggerEvent("click", "Cal5--Head-prev");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.equal(jQuery("#Cal5--Head-B1").text(), "March", "March is shown");
		assert.equal(jQuery("#Cal5--Head-B2").text(), "2017", "year 2017 shown");

		//Act
		qutils.triggerEvent("click", "Cal5--Head-next");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.equal(oCal5.getStartDate().toString(), UI5Date.getInstance(2017, 3, 1).toString(), "1st of April 2017 should be shown");
		assert.equal(jQuery("#Cal5--Head-B1").text(), "April", "April is shown");
		assert.equal(jQuery("#Cal5--Head-B2").text(), "2017", "year 2017 shown");

		//Cleanup
		oCal5.destroy();
	});

	QUnit.test("year switch", function(assert) {
		iStartDateChangeFired = 0;
		qutils.triggerEvent("click", "Cal2--Head-B2");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(jQuery("#Cal2--YP").get(0), "Year picker rendered");
		assert.ok(jQuery(jQuery("#Cal2--YP").get(0)).is(":visible"), "Year picker visible");
		var aYears = jQuery("#Cal2--YP").find(".sapUiCalItem");
		assert.equal(aYears.length, 20, "20 years rendered");
		assert.equal(jQuery(aYears[0]).text(), "2001", "first rendered year");
		assert.equal(jQuery(aYears[aYears.length - 1]).text(), "2020", "last rendered year");

		qutils.triggerEvent("click", "Cal2--Head-prev");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aYears = jQuery("#Cal2--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[0]).text(), "1981", "first rendered year after prev clicked");
		assert.equal(jQuery(aYears[aYears.length - 1]).text(), "2000", "last rendered year after prev clicked");

		var $NewYear = jQuery("#Cal2--YP-y19990101"); // use keybord to select month to prevent event processing from ItemNavigation
		$NewYear.trigger("focus");
		qutils.triggerKeydown($NewYear.get(0), KeyCodes.ENTER, false, false, false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(!jQuery(jQuery("#Cal2--YP").get(0)).is(":visible"), "Year picker not visible after selecting year");
		assert.equal(jQuery("#Cal2--Head-B1").text(), "Januar", "January still shown");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "1999", "year 1999 shown");

		var aMonths = jQuery("#Cal2-content").children(".sapUiCalMonthView"),
			aDays = jQuery(aMonths[0]).find(".sapUiCalItem");

		assert.equal(jQuery(aDays[0]).attr("data-sap-day"), "19981228", "first displayed day");
		assert.ok(jQuery(aDays[0]).hasClass("sapUiCalItemOtherMonth"), "first displayed day is in other month");
		assert.equal(jQuery(aDays[aDays.length - 1]).attr("data-sap-day"), "19990207", "last displayed day");
		assert.ok(jQuery(aDays[aDays.length - 1]).hasClass("sapUiCalItemOtherMonth"), "last displayed day is in other month");
		assert.equal(iStartDateChangeFired, 1, "startdateChange event fired");
		assert.equal(oFormatYyyymmdd.format(this.oCal2.getStartDate()), "19990101", "Start date");

		qutils.triggerEvent("click", "Cal2--Head-B2");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(jQuery("#Cal2--YP").get(0), "Year picker rendered");
		assert.ok(jQuery(jQuery("#Cal2--YP").get(0)).is(":visible"), "Year picker visible");
		var aYears = jQuery("#Cal2--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[0]).text(), "1989", "first rendered year");
		assert.equal(jQuery(aYears[aYears.length - 1]).text(), "2008", "last rendered year");

		qutils.triggerEvent("click", "Cal2--Head-next");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aYears = jQuery("#Cal2--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[0]).text(), "2009", "first rendered year after prev clicked");
		assert.equal(jQuery(aYears[aYears.length - 1]).text(), "2028", "last rendered year after prev clicked");

		$NewYear = jQuery("#Cal2--YP-y20110101"); // use keybord to select month to prevent event processing from ItemNavigation
		$NewYear.trigger("focus");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		qutils.triggerKeydown($NewYear.get(0), KeyCodes.ENTER, false, false, false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(!jQuery(jQuery("#Cal2--YP").get(0)).is(":visible"), "Year picker not visible after selecting year");
		assert.equal(jQuery("#Cal2--Head-B1").text(), "Januar", "January still shown");
		assert.equal(jQuery("#Cal2--Head-B2").text(), "2011", "year 2011 shown again");
	});

	QUnit.test("Min/Max", function(assert) {
		this.oCal1.focusDate(UI5Date.getInstance(9999, 10, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(!jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button enabled");
		assert.ok(!jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Next Button disabled");
		qutils.triggerEvent("click", "Cal1--Head-next");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(!jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button enabled on max month");
		assert.ok(jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Next Button disabled on max month");
		qutils.triggerEvent("click", "Cal1--Head-B2");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var aYears = jQuery("#Cal1--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[aYears.length - 1]).text(), "9999", "Max Year is last rendered year");

		var $Date = jQuery("#Cal1--YP-y99990101");
		$Date.trigger("focus");
		qutils.triggerKeydown($Date.get(0), KeyCodes.ENTER, false, false, false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var oDate = UI5Date.getInstance(1,1,1);
		oDate.setFullYear(1);
		this.oCal1.focusDate(oDate);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(!jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button disabled");
		assert.ok(!jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Next Button enabled");
		qutils.triggerEvent("click", "Cal1--Head-prev");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(jQuery("#Cal1--Head-prev").hasClass("sapUiCalDsbl"), "Previous Button disabled on min month");
		assert.ok(!jQuery("#Cal1--Head-next").hasClass("sapUiCalDsbl"), "Next Button enabled on min month");
		qutils.triggerEvent("click", "Cal1--Head-B2");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aYears = jQuery("#Cal1--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[0]).text(), "0001", "Min Year is first rendered year");

		$Date = jQuery("#Cal1--YP-y00010101");
		$Date.trigger("focus");
		qutils.triggerKeydown($Date.get(0), KeyCodes.ENTER, false, false, false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.oCal1.focusDate(UI5Date.getInstance());

		assert.ok(!jQuery("#Cal3--Head-prev").hasClass("sapUiCalDsbl"), "Calendar3: Previous Button enabled");
		assert.ok(jQuery("#Cal3--Head-next").hasClass("sapUiCalDsbl"), "Calendar3: Next Button disabled");
		qutils.triggerEvent("click", "Cal3--Head-B1");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(!jQuery("#Cal3--Head-prev").hasClass("sapUiCalDsbl"), "Calendar3: Previous Button for MonthPicker enabled");
		assert.ok(jQuery("#Cal3--Head-next").hasClass("sapUiCalDsbl"), "Calendar3: Next Button for MonthPicker disabled");
		assert.ok(!jQuery("#Cal3--MP-m0").hasClass("sapUiCalItemDsbl"), "Calendar3: January enabled");
		assert.ok(!jQuery("#Cal3--MP-m1").hasClass("sapUiCalItemDsbl"), "Calendar3: February enabled");
		assert.ok(jQuery("#Cal3--MP-m2").hasClass("sapUiCalItemDsbl"), "Calendar3: March disabled");
		assert.ok(jQuery("#Cal3--MP-m3").hasClass("sapUiCalItemDsbl"), "Calendar3: April disabled");
		assert.ok(jQuery("#Cal3--MP-m4").hasClass("sapUiCalItemDsbl"), "Calendar3: May disabled");
		assert.ok(jQuery("#Cal3--MP-m5").hasClass("sapUiCalItemDsbl"), "Calendar3: June disabled");
		assert.ok(jQuery("#Cal3--MP-m6").hasClass("sapUiCalItemDsbl"), "Calendar3: July disabled");
		assert.ok(jQuery("#Cal3--MP-m7").hasClass("sapUiCalItemDsbl"), "Calendar3: August disabled");
		assert.ok(jQuery("#Cal3--MP-m8").hasClass("sapUiCalItemDsbl"), "Calendar3: September disabled");
		assert.ok(jQuery("#Cal3--MP-m9").hasClass("sapUiCalItemDsbl"), "Calendar3: October disabled");
		assert.ok(jQuery("#Cal3--MP-m10").hasClass("sapUiCalItemDsbl"), "Calendar3: November disabled");
		assert.ok(jQuery("#Cal3--MP-m11").hasClass("sapUiCalItemDsbl"), "Calendar3: December disabled");
		qutils.triggerEvent("click", "Cal3--Head-prev");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(!jQuery("#Cal3--Head-prev").hasClass("sapUiCalDsbl"), "Calendar3: Previous Button for MonthPicker enabled");
		assert.ok(!jQuery("#Cal3--Head-next").hasClass("sapUiCalDsbl"), "Calendar3: Next Button for MonthPicker enabled");
		assert.ok(!jQuery("#Cal3--MP-m0").hasClass("sapUiCalItemDsbl"), "Calendar3: January enabled");
		assert.ok(!jQuery("#Cal3--MP-m1").hasClass("sapUiCalItemDsbl"), "Calendar3: February enabled");
		assert.ok(!jQuery("#Cal3--MP-m2").hasClass("sapUiCalItemDsbl"), "Calendar3: March enabled");
		assert.ok(!jQuery("#Cal3--MP-m3").hasClass("sapUiCalItemDsbl"), "Calendar3: April enabled");
		assert.ok(!jQuery("#Cal3--MP-m4").hasClass("sapUiCalItemDsbl"), "Calendar3: May enabled");
		assert.ok(!jQuery("#Cal3--MP-m5").hasClass("sapUiCalItemDsbl"), "Calendar3: June enabled");
		assert.ok(!jQuery("#Cal3--MP-m6").hasClass("sapUiCalItemDsbl"), "Calendar3: July enabled");
		assert.ok(!jQuery("#Cal3--MP-m7").hasClass("sapUiCalItemDsbl"), "Calendar3: August enabled");
		assert.ok(!jQuery("#Cal3--MP-m8").hasClass("sapUiCalItemDsbl"), "Calendar3: September enabled");
		assert.ok(!jQuery("#Cal3--MP-m9").hasClass("sapUiCalItemDsbl"), "Calendar3: October enabled");
		assert.ok(!jQuery("#Cal3--MP-m10").hasClass("sapUiCalItemDsbl"), "Calendar3: November enabled");
		assert.ok(!jQuery("#Cal3--MP-m11").hasClass("sapUiCalItemDsbl"), "Calendar3: December enabled");
		qutils.triggerEvent("click", "Cal3--Head-B2");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(jQuery("#Cal3--Head-prev").hasClass("sapUiCalDsbl"), "Calendar3: Previous Button for YearPicker disabled");
		assert.ok(jQuery("#Cal3--Head-next").hasClass("sapUiCalDsbl"), "Calendar3: Next Button for YearPicker disabled");
		var aYears = jQuery("#Cal3--YP").find(".sapUiCalItem");
		assert.equal(jQuery(aYears[0]).text(), "2004", "Calendar3: first displayed year");
		assert.ok(jQuery(aYears[0]).hasClass("sapUiCalItemDsbl"), "Calendar3: 2004 is disabled");
		assert.ok(jQuery(aYears[0]).attr("aria-disabled"), "Calendar3: 2004 has aria-disabled");
		assert.equal(jQuery(aYears[4]).text(), "2008", "Calendar3: 4. displayed year");
		assert.ok(!jQuery(aYears[4]).hasClass("sapUiCalItemDsbl"), "Calendar3: 2008 is enabled");
		assert.ok(!jQuery(aYears[4]).attr("aria-disabled"), "Calendar3: 2000 has no aria-disabled");

		$Date = jQuery("#Cal3--YP-y20140101");
		$Date.trigger("focus");
		qutils.triggerKeydown($Date.get(0), KeyCodes.ENTER, false, false, false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.oCal3.focusDate(UI5Date.getInstance(2005, 0, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(jQuery("#Cal3--Head-prev").hasClass("sapUiCalDsbl"), "Calendar3: Previous Button disabled");
		assert.ok(!jQuery("#Cal3--Head-next").hasClass("sapUiCalDsbl"), "Calendar3: Next Button enabled");

		this.oCal3.focusDate(UI5Date.getInstance(2015, 0, 5));
	});


	QUnit.test("YearRangePicker correct max range is displayed when next header arrow button is pressed", function(assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian,
				selectedDates: [new DateRange({startDate: UI5Date.getInstance("9900", "0", "1")})]
			}).placeAt("qunit-fixture"),
			$NextArrowButton,
			$yearRanges;

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal._showYearPicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCal._showYearRangePicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		$NextArrowButton = jQuery("#" + oCal.getId() + "--Head-next");
		qutils.triggerEvent("click", $NextArrowButton.attr("id"));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		$yearRanges = jQuery("#" + oCal.getId() + "--YRP").find(".sapUiCalItem");

		// Assert
		assert.ok($NextArrowButton.hasClass("sapUiCalDsbl"), "Header next button is disabled");
		// \u2009 is a thin space (both introduced with CLDR version 43), \u2013 is a dash
		assert.strictEqual($yearRanges[$yearRanges.length - 1].innerText, "9980\u2009\u2013\u20099999", "Correct year range is displayed and focused");

		// Clean
		oCal.destroy();
	});

	QUnit.test("YearRangePicker correct min range is displayed when previous header arrow button is pressed", function(assert) {
		// Prepare
		var oStartDate = new CalendarDate(1, 0, 1),
			oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian,
				selectedDates: [new DateRange({startDate: oStartDate.toLocalJSDate()})]
			}).placeAt("qunit-fixture"),
			$prevArrowButton,
			$yearRanges;

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal._showYearPicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCal._showYearRangePicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		$prevArrowButton = jQuery("#" + oCal.getId() + "--Head-prev");
		qutils.triggerEvent("click", $prevArrowButton.attr("id"));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		$yearRanges = jQuery("#" + oCal.getId() + "--YRP").find(".sapUiCalItem");

		// Assert
		assert.ok($prevArrowButton.hasClass("sapUiCalDsbl"), "Header previous button is disabled");
		// \u2009 is a thin space (both introduced with CLDR version 43), \u2013 is a dash
		assert.strictEqual($yearRanges[0].innerText, "0001\u2009\u2013\u20090020", "Correct year range is displayed and focused");

		// Clean
		oCal.destroy();
	});

	QUnit.test("select event", function(assert) {
		var aMonths = jQuery("#Cal1-content").children(".sapUiCalMonthView"),
			$Today = jQuery(aMonths[0]).find(".sapUiCalItemNow"),
			oToday = UI5Date.getInstance();

		bSelectFired = false;
		oSelectedDate = undefined;
		$Today.trigger("focus");
		qutils.triggerKeydown($Today[0], KeyCodes.ENTER, false, false, false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(bSelectFired, "Select event fired");
		assert.equal(oSelectedDate.getDate(), oToday.getDate(), "Today was selected");
		assert.ok($Today.hasClass("sapUiCalItemSel"), "Today marked as selected");
		assert.equal($Today.attr("aria-selected"), "true", "Today aria-selected = true");

		bSelectFired = false;
		oSelectedDate = undefined;
		var $Date = jQuery("#Cal3--Month0-20150110");
		$Date.trigger("focus");
		qutils.triggerKeydown($Date[0], KeyCodes.ENTER, false, false, false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(!bSelectFired, "No Select event fired on disabled date");
		assert.ok(!$Date.hasClass("sapUiCalItemSel"), "Disabled date not marked as selected");
		assert.equal($Date.attr("aria-selected"), "false", "Disabled date aria-selected = false");
	});

	QUnit.test("Multiple selection", function(assert) {

		// ensure that tested date range is displayed in calendar
		this.oCal4.displayDate(this.oCal4.getMinDate());
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var $selectedDate = jQuery("#Cal4--Month0-20161130"),
			$otherSelectedDate,
			$otherSelectedDateFromTheOtherMonth;

		$selectedDate.trigger("focus");
		qutils.triggerKeydown($selectedDate, KeyCodes.ENTER);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok($selectedDate.hasClass("sapUiCalItemSel"),
				"30th of November is selected in the calendar of November");

		$otherSelectedDate = jQuery("#Cal4--Month0-20161129");
		$otherSelectedDateFromTheOtherMonth = jQuery("#Cal4--Month1-20161129");
		$otherSelectedDate.trigger("focus");
		qutils.triggerKeydown($otherSelectedDate, KeyCodes.ENTER);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok($otherSelectedDate.hasClass("sapUiCalItemSel"),
				"29th of November is selected in the calendar of November");

		$otherSelectedDate.trigger("focus");
		qutils.triggerKeydown($otherSelectedDate, KeyCodes.ENTER);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(!$otherSelectedDateFromTheOtherMonth.hasClass("sapUiCalItemSel"),
				"Both selected 29th of November are deselected successfully");

	});

	QUnit.test("YearRangePicker min/max dates are set correctly", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian
			}).placeAt("qunit-fixture");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal.setMinDate(UI5Date.getInstance(2000, 10, 10));

		// Assert
		assert.deepEqual(oCal.getAggregation("yearPicker")._oMinDate, oCal.getAggregation("yearRangePicker")._oMinDate,
			"YearRangePicker instance has correct minDate set");

		// Act
		oCal.setMaxDate(UI5Date.getInstance(2020, 10, 10));

		// Assert
		assert.deepEqual(oCal.getAggregation("yearPicker")._oMaxDate, oCal.getAggregation("yearRangePicker")._oMaxDate,
					"YearRangePicker instance has correct maxDate set");

		// Clean
		oCal.destroy();
	});

	QUnit.test("Header buttons visibility and text is correctly managed when displaying YearPicker and YearRangePicker instances", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian
			}).placeAt("qunit-fixture"),
			oHeader = oCal.getAggregation("header"),
			oUpdateHeadersYearPrimaryTextSpy = this.spy(oCal, "_updateHeadersYearPrimaryText"),
			oShowYearPickerSpy = this.spy(oCal, "_showYearPicker");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal._showYearPicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(oUpdateHeadersYearPrimaryTextSpy.calledAfter(oShowYearPickerSpy), "button2 text is updated");
		assert.notOk(oHeader.getVisibleButton1(), "Button one (for opening MonthPicker) is invisible");

		// Act
		oCal._showYearRangePicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.notOk(oHeader.getVisibleButton2(), "Button two (for opening MonthPicker) is invisible");

		// Clean
		oCal.destroy();
		oUpdateHeadersYearPrimaryTextSpy.restore();
		oShowYearPickerSpy.restore();
	});

	QUnit.test("Header buttons visibility and text is correctly managed when selecting a year range", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian,
				selectedDates: [new DateRange({startDate: UI5Date.getInstance("2015", "0", "1")})]
			}).placeAt("qunit-fixture"),
			oHeader = oCal.getAggregation("header"),
			oUpdateHeadersYearPrimaryTextSpy = this.spy(oCal, "_updateHeadersYearPrimaryText"),
			oSelectYearRangeSpy = this.spy(oCal, "_selectYearRange");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal._showYearPicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCal._showYearRangePicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.notOk(oHeader.getVisibleButton2(), "Button two (for opening MonthPicker) is invisible");

		// Act
		oCal._selectYearRange();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(oUpdateHeadersYearPrimaryTextSpy.calledAfter(oSelectYearRangeSpy), "Header button2 is correctly updated");
		assert.ok(oHeader.getVisibleButton2(), "Button two (for opening MonthPicker) is visible");

		// Clean
		oCal.destroy();
		oUpdateHeadersYearPrimaryTextSpy.restore();
		oSelectYearRangeSpy.restore();
	});

	QUnit.test("The right year range is selected in the YearRangePicker when calendar type min date is selected", function (assert) {
		// Prepare
		var oStartDate = new CalendarDate(1, 0, 1),
			oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian,
				selectedDates: [new DateRange({startDate: oStartDate.toLocalJSDate()})]
			}).placeAt("qunit-fixture"),
			oTogglePrevNexYearPicker = this.spy(oCal, "_togglePrevNexYearPicker"),
			oEvent = {
				getSource: function() {
					return {
						sParentAggregationName: ""
					};
				}
			};

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal._handleButton2(oEvent);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCal._handleButton2(oEvent);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oCal.getAggregation("yearRangePicker")._oItemNavigation.getFocusedIndex(), 0,
			"Correct element is selected in the YearRangePicker");
		assert.ok(oTogglePrevNexYearPicker.called, "_togglePrevNexYearPicker was called");
		assert.notOk(oCal.getAggregation("header").getEnabledPrevious(), "Header previous button is disabled");

		// Clean
		oCal.destroy();
		oTogglePrevNexYearPicker.restore();
	});

	QUnit.test("The right year range is selected in the YearRangePicker when calendar type max date is selected", function (assert) {
		// Prepare
		var oStartDate = new CalendarDate(9999, 0, 1),
			oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian,
				selectedDates: [new DateRange({startDate: oStartDate.toLocalJSDate()})]
			}).placeAt("qunit-fixture"),
			oTogglePrevNexYearPicker = this.spy(oCal, "_togglePrevNexYearPicker"),
			oItemNavigation,
			oEvent = {
				getSource: function() {
					return {
						sParentAggregationName: ""
					};
				}
			};

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal._handleButton2(oEvent);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCal._handleButton2(oEvent);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oItemNavigation = oCal.getAggregation("yearRangePicker")._oItemNavigation;

		// Assert
		assert.strictEqual(oItemNavigation.getFocusedIndex(),
			oItemNavigation.getItemDomRefs().length - 1,
			"Correct element is selected in the YearRangePicker");
		assert.ok(oTogglePrevNexYearPicker.called, "_togglePrevNexYearPicker was called");
		assert.notOk(oCal.getAggregation("header").getEnabledNext(), "Header next button is disabled");

		// Clean
		oCal.destroy();
		oTogglePrevNexYearPicker.restore();
	});

	QUnit.test("Header next button handler works correct for YearRangePicker", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian,
				selectedDates: [new DateRange({startDate:UI5Date.getInstance(2000, 0, 1)})]
			}).placeAt("qunit-fixture"),
			oYearRangePicker = oCal.getAggregation("yearRangePicker"),
			oNextPageSpy = this.spy(oYearRangePicker, "nextPage"),
			oTogglePrevNexYearPicker = this.spy(oCal, "_togglePrevNexYearPicker");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal._showYearPicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCal._showYearRangePicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCal._handleNext();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(oNextPageSpy.calledOnce, "YearRangePicker nextPage is called");
		assert.ok(oTogglePrevNexYearPicker.called, "Calendar _togglePrevNexYearPicker is called");
		assert.deepEqual(oYearRangePicker.getFirstRenderedDate(), UI5Date.getInstance(2090, 0, 1), "Year picker page is updated correctly");

		// Clean
		oCal.destroy();
		oNextPageSpy.restore();
		oTogglePrevNexYearPicker.restore();
	});

	QUnit.test("Header previous button handler works correct for YearRangePicker", function (assert) {
		// Prepare
		var oCal = new Calendar({
				primaryCalendarType: CalendarType.Gregorian,
				selectedDates: [new DateRange({startDate:UI5Date.getInstance(2000, 0, 1)})]
			}).placeAt("qunit-fixture"),
			oYearRangePicker = oCal.getAggregation("yearRangePicker"),
			oPreviousPageSpy = this.spy(oYearRangePicker, "previousPage"),
			oTogglePrevNexYearPicker = this.spy(oCal, "_togglePrevNexYearPicker");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCal._showYearPicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCal._showYearRangePicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCal._handlePrevious();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(oPreviousPageSpy.calledOnce, "YearRangePicker previousPage is called");
		assert.ok(oTogglePrevNexYearPicker.called, "Calendar _togglePrevNexYearPicker is called");
		assert.deepEqual(oYearRangePicker.getFirstRenderedDate(), UI5Date.getInstance(1730, 0, 1), "Year picker page is updated correctly");

		// Clean
		oCal.destroy();
		oPreviousPageSpy.restore();
		oTogglePrevNexYearPicker.restore();
	});

	QUnit.test("Set proper year when year is selected from the first month in multiple month calendar", function (assert) {
		// Prepare
		var oCal = new Calendar({
				months: 2
			}),
			oCalId = oCal.getId(),
			oFirstYearButton,
			oSecondYearButton;

		// initial setup
		oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oFirstYearButton = jQuery("#" + oCalId + "--Head-B2");
		oSecondYearButton = jQuery("#" + oCalId + "--Head-B4");

		// set calendar to November-December 2019 and select year 2020 using first calendar's year button
		oCal.focusDate(UI5Date.getInstance(2019,10,15));
		setYearWithButton(oCal, "2024", oFirstYearButton);

		// assert
		assert.equal(oFirstYearButton.html(), "2024", "First month is November, first YearPicker is used, first calendar's year is set properly");
		assert.equal(oSecondYearButton.html(), "2024", "Second month is December, first YearPicker is used, first calendar's year is set properly");

		// set calendar to December 2019-January 2020 and select year 2024 using first calendar's year button
		oCal.focusDate(UI5Date.getInstance(2019,11,15));
		setYearWithButton(oCal, "2024", oFirstYearButton);

		// assert
		assert.equal(oFirstYearButton.html(), "2024", "First month is December, first YearPicker is used, first calendar's year is set properly");
		assert.equal(oSecondYearButton.html(), "2025", "Second month is January, first YearPicker is used, first calendar's year is set properly");

		// cleanup
		oCal.destroy();

	});

	QUnit.test("Set proper year when year is selected from the second month in multiple month calendar", function (assert) {
		// Prepare
		var oCal = new Calendar({
				months: 2
			}),
			oCalId = oCal.getId(),
			oFirstYearButton,
			oSecondYearButton;

		// initial setup
		oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oFirstYearButton = jQuery("#" + oCalId + "--Head-B2");
		oSecondYearButton = jQuery("#" + oCalId + "--Head-B4");

		// set calendar to November-December 2019 and select year 2020 using second calendar's year button
		oCal.focusDate(UI5Date.getInstance(2019,10,15));
		setYearWithButton(oCal, "2024", oSecondYearButton);

		// assert
		assert.equal(oFirstYearButton.html(), "2024", "First month is November, first YearPicker is used, first calendar's year is set properly");
		assert.equal(oSecondYearButton.html(), "2024", "Second month is December, first YearPicker is used, first calendar's year is set properly");

		// set calendar to December 2019-January 2020 and select year 2024 using second calendar's year button
		oCal.focusDate(UI5Date.getInstance(2019,11,15));
		setYearWithButton(oCal, "2024", oSecondYearButton);

		// assert
		assert.equal(oFirstYearButton.html(), "2023", "First month is December, first YearPicker is used, first calendar's year is set properly");
		assert.equal(oSecondYearButton.html(), "2024", "Second month is January, first YearPicker is used, first calendar's year is set properly");

		// cleanup
		oCal.destroy();

	});

	QUnit.test("Do not rerender on calendarWeekSelection in multi months scenario", function (assert) {
		// Prepare
		var oCal = new Calendar({
				months: 2,
				intervalSelection: true
			}),
			oMockedEvent = {
				getParameter: function(sParam) {
					if (sParam === "weekDays") {
						return new DateRange({
							startDate: UI5Date.getInstance(2024, 2, 25),
							endDate: UI5Date.getInstance(2024, 2, 31)
						});
					} else if (sParam === "weekNumber"){
						return 13;
					}
				},
				getSource: function() {
					return {
						getDate: function () {
							return UI5Date.getInstance(2024, 2, 1);
						}
					};
				}
			},
			oRenderMonthSpy = this.spy(oCal, "_renderMonth");

		oCal.focusDate(UI5Date.getInstance(2024, 1, 24));
		// initial setup
		oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oCal._handleWeekNumberSelect(oMockedEvent);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.strictEqual(oRenderMonthSpy.callCount, 0, "Rerendering is not triggered");

		// cleanup
		oCal.destroy();

	});

	/** helper function that simulates selection of an year */
	function setYearWithButton(oCal, sYear, oButton) {
		var oYearPickerButton,
			oCalId = oCal.getId();

		// simulate year button press
		qutils.triggerEvent("click", oButton.attr("id"));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// select given year
		oYearPickerButton = jQuery("#" + oCalId + "--YP-y" + sYear + "0101");
		oYearPickerButton.trigger("focus");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		qutils.triggerKeydown(oYearPickerButton.get(0), KeyCodes.ENTER);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
	}

	QUnit.test("showCurrentDateButton", function (assert) {
		var oFakeNow = UI5Date.getInstance(2021, 11, 31),
			clock = sinon.useFakeTimers(oFakeNow.getTime()),
			oFocusDateSpy;

		// Prepare - day view
		this.oCal1.displayDate(UI5Date.getInstance(2020, 0, 1));
		this.oCal1.setShowCurrentDateButton(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oFocusDateSpy = this.spy(this.oCal1, "focusDate");

		// Act
		qutils.triggerEvent("click", this.oCal1.getId() + "--Head-today");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(oFocusDateSpy.calledOnce, "Today is focused when used in day view");

		// Prepare - month view
		this.oCal1.displayDate(UI5Date.getInstance(2020, 0, 1));
		qutils.triggerEvent("click", "Cal1--Head-B1");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerEvent("click", this.oCal1.getId() + "--Head-today");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oCal1.getProperty("_currentPicker"), "month", "Navigation from month to day view performed");
		assert.ok(oFocusDateSpy.calledTwice, "Today is focused when used in month view");

		// Prepare - year view
		this.oCal1.displayDate(UI5Date.getInstance(2020, 0, 1));
		qutils.triggerEvent("click", "Cal1--Head-B2");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerEvent("click", this.oCal1.getId() + "--Head-today");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oCal1.getProperty("_currentPicker"), "month", "Navigation from year to day view performed");
		assert.ok(oFocusDateSpy.calledThrice, "Today is focused when used in year view");

		// Prepare - year range view
		this.oCal1.displayDate(UI5Date.getInstance(2020, 0, 1));
		qutils.triggerEvent("click", "Cal1--Head-B2");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		qutils.triggerEvent("click", "Cal1--Head-B2");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerEvent("click", this.oCal1.getId() + "--Head-today");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oCal1.getProperty("_currentPicker"), "month", "Navigation from year range to day view performed");
		assert.strictEqual(oFocusDateSpy.callCount, 4, "Today is focused when used in year range view");

		// Prepare
		this.oCal1.setMaxDate(UI5Date.getInstance(2020, 11, 31));

		// Act
		qutils.triggerEvent("click", this.oCal1.getId() + "--Head-today");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(jQuery(document.activeElement).attr("id"), "Cal1--Month0-20201231", "Focused date is correct");

		// Prepare
		this.oCal1.setMaxDate(null);
		this.oCal1.setMinDate(UI5Date.getInstance(2022, 11, 31));

		// Act
		qutils.triggerEvent("click", this.oCal1.getId() + "--Head-today");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(jQuery(document.activeElement).attr("id"), "Cal1--Month0-20221231", "Focused date is correct");

		// Clean up
		clock.restore();
	});

	QUnit.module("Misc");


	QUnit.test("Check if the CSS toggle is called", function(assert) {
		//arrange
		var oCalendar = new Calendar({
			months: 1
		}).placeAt("qunit-fixture");

		var oSpyHandleColumnsCss = this.spy(oCalendar, "_toggleTwoMonthsInColumnsCSS");

		//act.
		oCalendar.setMonths(3);

		//assert
		assert.ok(oSpyHandleColumnsCss.calledOnce, "Proper CSS styles are applied to header");

		//clean
		oCalendar.destroy();
	});

	QUnit.test("dates are correctly styled as special or not", function(assert) {
		//arrange
		var oCal = new Calendar({
			specialDates: [
				new DateTypeRange({
					startDate: UI5Date.getInstance(1969, 11, 2),
					type: "Type04"
				})
			]
		}).placeAt("qunit-fixture");

		//act
		oCal.focusDate(UI5Date.getInstance(1969, 11, 1));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//assert
		assert.equal(oCal.$().find(".sapUiCalItemType04").length, 1, "There should be only one special date displayed");

		//clean
		oCal.destroy();
	});

	QUnit.test("setShowWeekNumbers should forward the property value to the connected months", function(assert) {
		var oCalendar = new Calendar({
			months: 1
		}), oMonth = oCalendar.getAggregation("month")[0];

		oCalendar.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.ok(oMonth.getShowWeekNumbers(), "Week numbers should be shown by default");

		oCalendar.setShowWeekNumbers(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.notOk(oMonth.getShowWeekNumbers(), "Week numbers should not be shown");

		oCalendar.destroy();
	});

	QUnit.test("setShowWeekNumbers should forward the property value to the connected months", function(assert) {
		var oCalendar = new Calendar({
			months: 2
		}), aMonths = oCalendar.getAggregation("month");

		oCalendar.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		aMonths.forEach(function(oMonth) {
			assert.ok(oMonth.getShowWeekNumbers(), "Week numbers should be shown by default");
		});

		oCalendar.setShowWeekNumbers(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		aMonths.forEach(function(oMonth) {
			assert.notOk(oMonth.getShowWeekNumbers(), "Week numbers should not be shown by default");
		});

		oCalendar.destroy();
	});

	QUnit.module("Focus", {
		beforeEach: function () {
			this.oCal = new Calendar().placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oCal.destroy();
			this.oCal = null;
		}
	});

	QUnit.test("Adding special date should not move the focus to the calendar control", function (oAssert) {
		// Arrange
		var fnDone = oAssert.async(), // Async test
			oSpecialDate = new DateTypeRange({
				type: CalendarDayType.Type01,
				startDate: UI5Date.getInstance(2017, 1, 20)
			}),
			oHTMLButton = new HTML("persist_focus_target", {
				content: "<button>Btn</button>"
			}).placeAt("qunit-fixture");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act - focus the control and add a special date to the month
		oHTMLButton.focus();
		this.oCal.addSpecialDate(oSpecialDate);

		// Assert
		setTimeout(function () {
			var $Focus = jQuery(document.activeElement);

			if ($Focus.length === 0) {
				oAssert.ok(false, "The focus should be on the browser tab on which this " +
					"QUnit is executed. If not the test will fail!");
				fnDone(); // Complete async test
				return;
			}

			oAssert.strictEqual($Focus.attr("id"), oHTMLButton.getId(),
				"Focus should remain on the button");

			// Cleanup
			oHTMLButton.destroy();

			fnDone();
		}, 0);

	});

	// BCP: 1780156715
	QUnit.test("Adding selected date should not move the focus to the calendar control", function (oAssert) {
		// Arrange
		var fnDone = oAssert.async(), // Async test
				oSelectedDate = new DateRange({
					startDate: UI5Date.getInstance(2017, 1, 20)
				}),
				oHTMLButton = new HTML("persist_focus_target", {
					content: "<button>Btn</button>"
				}).placeAt("qunit-fixture");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act - focus the control and add a selected date to the month
		oHTMLButton.focus();
		this.oCal.addSelectedDate(oSelectedDate);

		// Assert
		setTimeout(function () {
			var $Focus = jQuery(document.activeElement);

			if ($Focus.length === 0) {
				oAssert.ok(false, "The focus should be on the browser tab on which this " +
						"QUnit is executed. If not the test will fail!");
				fnDone(); // Complete async test
				return;
			}

			oAssert.strictEqual($Focus.attr("id"), oHTMLButton.getId(),
					"Focus should remain on the button");

			// Cleanup
			oHTMLButton.destroy();

			fnDone();
		}, 0);

	});

	QUnit.test("initialFocusedDate", function(assert) {
		// Arrange
		var oFocusDateSpy = this.spy(this.oCal, "focusDate");
		this.oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		this.oCal.setInitialFocusedDate(UI5Date.getInstance(2022, 5, 10));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(oFocusDateSpy.calledOnce, "Calendar is properly navigated");
	});

	QUnit.module("Other");

	QUnit.test("interval selection feedback", function(assert) {
		//arrange
		var oCal = new Calendar({
				intervalSelection: true,
				months: 2
			}),
			$HoveredDate,
			$HoveredDateNextMonth,
			oSelectedDate = new DateRange({ startDate: UI5Date.getInstance(2017, 6, 19) }),
			aMonths;

		oCal.displayDate(UI5Date.getInstance(2017, 6, 19)); //2017, July 19
		oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		aMonths = oCal.getAggregation("month");

		//act - hover a date, with nothing selected yet
		$HoveredDate = jQuery("#" + aMonths[0].getId() + "-20170725");
		aMonths[0].onmouseover({ target: $HoveredDate }); //2017, July 25

		//assert
		assert.equal(jQuery("#" + aMonths[0].getId() + ' .sapUiCalItemSelBetween').length, 0, 'no selection feedback yet');

		//act - hover the same end date
		oCal.addSelectedDate(oSelectedDate);
		aMonths[0].onmouseover({ target: $HoveredDate }); //2017, July 25

		//assert
		assert.equal(jQuery("#" + aMonths[0].getId() + ' .sapUiCalItemSelBetween').length, 5, 'selection feedback is applied');

		//act - hover a date in another month
		$HoveredDateNextMonth = jQuery("#" + aMonths[1].getId() + "-20170806");
		aMonths[1].onmouseover({ target: $HoveredDateNextMonth }); //2017, August 6

		//assert
		assert.equal(jQuery("#" + aMonths[0].getId() + ' .sapUiCalItemSelBetween').length, 17, 'selection feedback is applied on hovered dates from the first month');
		assert.equal(jQuery("#" + aMonths[1].getId() + ' .sapUiCalItemSelBetween').length, 7, 'selection feedback is applied on hovered dates from the second month');

		//clean
		oCal.destroy();
	});

	QUnit.test("interval selection when start date is in different month", function(assert) {
		//arrange
		var oCal = new Calendar({
				intervalSelection: true,
				months: 1
			}),
			oMonth;

		oCal.displayDate(UI5Date.getInstance(2022, 10, 1)); //2017, July 19
		oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oMonth = oCal.getAggregation("month")[0];

		// simulate focusing of a date in current month (focusedDate = 2022-11-24)
		oMonth.setProperty("_focusedDate", new CalendarDate(2022, 10, 24));

		// act
		// add empty date range (BCP: 2280197094)
		oCal.addSelectedDate(new DateRange());

		//assert - check if _checkDateSelected throws an error when date range is empty
		assert.equal(oMonth._checkDateSelected(new CalendarDate(2022, 10, 26)), 0, "_checkDateSelected doesn't throw error when the selected dates range is empty");

		// act
		// select a date that is outside the current month (startDate of the interval selection = 2022-12-01)
		oCal.getSelectedDates()[0].setStartDate(UI5Date.getInstance(2022, 11, 1));

		//assert - check if a date between focusedDate and startDate is eligible for marking as "between" date (for example 2022-11-26)
		assert.equal(oMonth._checkDateSelected(new CalendarDate(2022, 10, 26)), 0, "date between focusedDate and startDate is not marked as any kind of selected");

		//clean
		oCal.destroy();
	});

	QUnit.test("getFocusDomRef", function (assert) {
		//arrange
		var $selectedDate,
			oCal6 = new Calendar("Cal6");
		oCal6.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//act
		oCal6.displayDate(UI5Date.getInstance(2017, 6, 8));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		$selectedDate = jQuery("#Cal6--Month0-20170725");
		$selectedDate.trigger("focus");
		qutils.triggerKeydown($selectedDate, KeyCodes.ENTER);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//assert
		assert.equal(oCal6.getFocusDomRef().id, "Cal6--Month0-20170725",
				"getFocusDomRef returns the correct selected date when only one month");

		//arrange
		var oCal7 = new Calendar("Cal7", {
			months: 2
		});
		oCal7.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//act
		oCal7.displayDate(UI5Date.getInstance(2017, 6, 8));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		$selectedDate = jQuery("#Cal7--Month1-20170825");
		$selectedDate.trigger("focus");
		qutils.triggerKeydown($selectedDate, KeyCodes.ENTER);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//assert
		assert.equal(oCal7.getFocusDomRef().id, "Cal7--Month1-20170825",
				"getFocusDomRef returns the correct selected date when multiple months");

		//cleanup
		oCal6.destroy();
		oCal7.destroy();
	});

	// BCP: 1780409322
	QUnit.test("month change update aria-label of the button", function (assert) {
		// prepare
		var oCalendar = new Calendar(),
			oCurrentDate = UI5Date.getInstance(2017, 5, 2),
			oNewFocusedDate = UI5Date.getInstance(2017, 6, 3),
			sExpectedAriaLabel;

		oCalendar.displayDate(oCurrentDate);
		oCalendar.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		sExpectedAriaLabel = oCalendar.$("-Head-B1").text();
		assert.equal(oCalendar.$("-Head-B1").attr("aria-label"), sExpectedAriaLabel, "aria-label should be equal to the text of the button");

		// act
		oCalendar.focusDate(oNewFocusedDate);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		sExpectedAriaLabel = oCalendar.$("-Head-B1").text();
		assert.equal(oCalendar.$("-Head-B1").attr("aria-label"), sExpectedAriaLabel, "aria-label should be equal to the text of the button");

		// cleanup
		oCalendar.destroy();
	});

	// BCP: 1870534995
	QUnit.test("Secondary month info should be added in button's aria-label", function (assert) {
		// prepare
		var oCalendar = new Calendar({
				primaryCalendarType: "Islamic",
				secondaryCalendarType: "Gregorian"
			}),
			oCurrentDate = UI5Date.getInstance(2017, 5, 2),
			oNewFocusedDate = UI5Date.getInstance(2018, 6, 3),
			sExpectedSecondaryInfo,
			sExpectedAriaLabel;

		oCalendar.displayDate(oCurrentDate);
		oCalendar.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		sExpectedSecondaryInfo = getExpectedSecondaryMonthARIAInfo(oCalendar, "Islamic", "Gregorian");
		sExpectedAriaLabel = oCalendar.$("-Head-B1-Text").text() + ", " +  sExpectedSecondaryInfo;
		assert.equal(oCalendar.$("-Head-B1").attr("aria-label"), sExpectedAriaLabel,
			"aria-label should contain info for both primary and secondary month");

		// act
		oCalendar.displayDate(oNewFocusedDate);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		sExpectedSecondaryInfo = getExpectedSecondaryMonthARIAInfo(oCalendar, "Islamic", "Gregorian");
		sExpectedAriaLabel = oCalendar.$("-Head-B1-Text").text() + ", " + sExpectedSecondaryInfo;
		assert.equal(oCalendar.$("-Head-B1").attr("aria-label"), sExpectedAriaLabel,
			"aria-label should contain info for the updated primary and secondary month");

		// cleanup
		oCalendar.destroy();
	});

	QUnit.test("_initializeSecondMonthHeader creates a header", function (assert) {
		// arrange & act
		var oCalendar = new Calendar(),
			oSecondHeader = oCalendar.getAggregation("secondMonthHeader");

		// assert
		assert.ok(oSecondHeader, "second month header is added as an association");
		assert.ok(oSecondHeader.hasStyleClass("sapUiCalHeadSecondMonth"), "second month header has custom CSS class sapUiCalHeadSecondMonth");
		assert.ok(oSecondHeader.hasListeners("pressPrevious"), "second month header has listener for pressPrevious event");
		assert.ok(oSecondHeader.hasListeners("pressNext"), "second month header has listener for pressNext event");
		assert.ok(oSecondHeader.hasListeners("pressButton1"), "second month header has listener for pressButton1 event");
		assert.ok(oSecondHeader.hasListeners("pressButton2"), "second month header has listener for pressButton2 event");

		// cleanup
		oCalendar.destroy();
	});

	QUnit.test("onThemeChanged calls _updateHeadersButtons, _setPrimaryHeaderMonthButtonText and _toggleTwoMonthsInColumnsCSS methods", function (assert) {
		// arrange
		var oCalendar = new Calendar(),
			oUpdateHeadersButtonsSpy = this.spy(oCalendar, "_updateHeadersButtons"),
			oSetPrimaryHeaderMonthButtonTextSpy = this.spy(oCalendar, "_setPrimaryHeaderMonthButtonText"),
			oToggleTwoMonthsInTwoColumnsCSSSpy = this.spy(oCalendar, "_toggleTwoMonthsInColumnsCSS");
		oCalendar.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		oCalendar.onThemeChanged();

		// assert
		assert.equal(oUpdateHeadersButtonsSpy.callCount, 2, "_updateHeadersButtons should be called once onThemeChanged");
		assert.equal(oSetPrimaryHeaderMonthButtonTextSpy.callCount, 1, "_setPrimaryHeaderMonthButtonText should be called once onThemeChanged");
		assert.equal(oToggleTwoMonthsInTwoColumnsCSSSpy.callCount, 1, "_toggleTwoMonthsInColumnsCSS should be called once onThemeChanged");

		// cleanup
		oCalendar.destroy();
	});

	QUnit.test("_setHeaderText sets the correct month name to the third button", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 2 }),
			oHeader = oCalendar.getAggregation("header"),
			oSetTextButton3Spy = this.spy(oHeader, "_setTextButton3"),
			oSetAriaLabelButton3Spy = this.spy(oHeader, "_setAriaLabelButton3");

		// act
		oCalendar._setHeaderText(new CalendarDate(2017, 2, 14, oCalendar.getPrimaryCalendarType()));

		// assert
		assert.equal(oSetTextButton3Spy.getCall(0).args[0], "April", "_setTextButton3 is called with April");
		assert.equal(oSetAriaLabelButton3Spy.getCall(0).args[0], "April", "_setAriaLabelButton3 is called with April");

		// cleanup
		oCalendar.destroy();
	});

	QUnit.test("_setHeaderText sets the correct month name to the first button in secondMonthHeader aggregation", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 2 }),
				oHeader = oCalendar.getAggregation("secondMonthHeader"),
				oSetTextButton1Spy = this.spy(oHeader, "setTextButton1"),
				oSetAriaLabelButton1Spy = this.spy(oHeader, "setAriaLabelButton1");

		// act
		oCalendar._setHeaderText(CalendarDate.fromLocalJSDate(UI5Date.getInstance(2017, 2, 14), oCalendar.getPrimaryCalendarType()));

		// assert
		assert.equal(oSetTextButton1Spy.getCall(0).args[0], "April", "setTextButton1 is called with April");
		assert.equal(oSetAriaLabelButton1Spy.getCall(0).args[0], "April", "setAriaLabelButton1 is called with April");

		// cleanup
		oCalendar.destroy();
		oSetTextButton1Spy.restore();
		oSetAriaLabelButton1Spy.restore();
	});

	QUnit.test("_setColumns sets properly the inner iColumns property", function (assert) {
		// arrange
		var oCalendar = new Calendar();

		// act
		oCalendar._setColumns(4);

		// assert
		assert.equal(oCalendar._iColumns, 4, "Columns are properly set to 4");

		// cleanup
		oCalendar.destroy();
	});

	QUnit.test("_getColumns gets properly the inner iColumns property", function (assert) {
		// arrange
		var oCalendar = new Calendar();

		// act && assert
		assert.equal(oCalendar._getColumns(), oCalendar._iColumns, "getColumns returns the value of iColumns");

		// cleanup
		oCalendar.destroy();
	});

	QUnit.test("_isTwoMonthsInTwoColumns returns true if calendar is with two months in two columns", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 2 }),
			oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(2);

		// act & assert
		assert.ok(oCalendar._isTwoMonthsInTwoColumns(), "should return true");

		// cleanup
		oCalendar.destroy();
		oGetColumnsStub.restore();
	});

	QUnit.test("_isTwoMonthsInTwoColumns returns false if calendar is with two months in one column", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 2 }),
			oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(1);

		// act & assert
		assert.equal(oCalendar._isTwoMonthsInTwoColumns(), false, "should return false");

		// cleanup
		oCalendar.destroy();
		oGetColumnsStub.restore();
	});

	QUnit.test("_isTwoMonthsInTwoColumns returns false if calendar is with not two months in two columns", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 1 }),
			oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(2);

		// act & assert
		assert.equal(oCalendar._isTwoMonthsInTwoColumns(), false, "should return false");

		// cleanup
		oCalendar.destroy();
		oGetColumnsStub.restore();
	});

	QUnit.test("_isTwoMonthsInOneColumn returns true if calendar is with two months in one column", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 2 }),
			oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(1);

		// act & assert
		assert.ok(oCalendar._isTwoMonthsInOneColumn(), "should return true");

		// cleanup
		oCalendar.destroy();
		oGetColumnsStub.restore();
	});

	QUnit.test("_isTwoMonthsInOneColumn returns false if calendar is with two months in more than one column", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 2 }),
			oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(3);

		// act & assert
		assert.equal(oCalendar._isTwoMonthsInOneColumn(), false, "should return false");

		// cleanup
		oCalendar.destroy();
		oGetColumnsStub.restore();
	});

	QUnit.test("_isTwoMonthsInOneColumn returns false if calendar is with not two months in one column", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 1 }),
			oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(1);

		// act & assert
		assert.equal(oCalendar._isTwoMonthsInOneColumn(), false, "should return false");

		// cleanup
		oCalendar.destroy();
		oGetColumnsStub.restore();
	});

	QUnit.test("_toggleTwoMonthsInColumnsCSS should call addStyleClass if calendar is with two months in one column", function (assert) {
		// arrange
		var oCalendar = new Calendar(),
			oAddStyleClassSpy = this.spy(oCalendar, "addStyleClass"),
			oRemoveStyleClassSpy = this.spy(oCalendar, "removeStyleClass"),
			oIsTwoMonthsInTwoColumnsStub = this.stub(oCalendar, "_isTwoMonthsInTwoColumns").returns(false),
			oIsTwoMonthsInOneColumnStub = this.stub(oCalendar, "_isTwoMonthsInOneColumn").returns(true);

		// act
		oCalendar._toggleTwoMonthsInColumnsCSS();

		// assert
		assert.equal(oAddStyleClassSpy.getCall(0).args[0], "sapUiCalTwoMonthsInOneColumn", "addStyleClass is called with sapUiCalTwoMonthsInOneColumn param");
		assert.equal(oRemoveStyleClassSpy.callCount, 2, "removeStyleClass is called twice");

		// cleanup
		oCalendar.destroy();
		oAddStyleClassSpy.restore();
		oRemoveStyleClassSpy.restore();
		oIsTwoMonthsInTwoColumnsStub.restore();
		oIsTwoMonthsInOneColumnStub.restore();
	});

	QUnit.test("_toggleTwoMonthsInColumnsCSS should call addStyleClass if calendar is with two months in two columns", function (assert) {
		// arrange
		var oCalendar = new Calendar(),
			oAddStyleClassSpy = this.spy(oCalendar, "addStyleClass"),
			oRemoveStyleClassSpy = this.spy(oCalendar, "removeStyleClass"),
			oIsTwoMonthsInTwoColumnsStub = this.stub(oCalendar, "_isTwoMonthsInTwoColumns").returns(true);

		// act
		oCalendar._toggleTwoMonthsInColumnsCSS();

		// assert
		assert.equal(oAddStyleClassSpy.callCount, 1, "addStyleClass is called once");
		assert.equal(oAddStyleClassSpy.getCall(0).args[0], "sapUiCalTwoMonthsTwoColumns", "addStyleClass is called with sapUiCalTwoMonthsTwoColumns param");
		assert.equal(oRemoveStyleClassSpy.callCount, 2, "removeStyleClass is called twice");

		// cleanup
		oCalendar.destroy();
		oAddStyleClassSpy.restore();
		oRemoveStyleClassSpy.restore();
		oIsTwoMonthsInTwoColumnsStub.restore();
	});

	QUnit.test("_toggleTwoMonthsInColumnsCSS should call removeStyleClass if calendar is not with two months in one or two columns", function (assert) {
		// arrange
		var oCalendar = new Calendar(),
			oAddStyleClassSpy = this.spy(oCalendar, "addStyleClass"),
			oRemoveStyleClassSpy = this.spy(oCalendar, "removeStyleClass"),
			oIsTwoMonthsInTwoColumnsStub = this.stub(oCalendar, "_isTwoMonthsInTwoColumns").returns(false),
			oIsTwoMonthsInOneColumnStub = this.stub(oCalendar, "_isTwoMonthsInOneColumn").returns(false);

		// act
		oCalendar._toggleTwoMonthsInColumnsCSS();

		// assert
		assert.equal(oAddStyleClassSpy.callCount, 0, "addStyleClass is not called");
		assert.equal(oRemoveStyleClassSpy.getCall(0).args[0], "sapUiCalTwoMonthsTwoColumnsJaZh", "removeStyleClass is called with sapUiCalTwoMonthsTwoColumnsJaZh param");
		assert.equal(oRemoveStyleClassSpy.getCall(1).args[0], "sapUiCalTwoMonthsTwoColumns", "removeStyleClass is called with sapUiCalTwoMonthsTwoColumns param");
		assert.equal(oRemoveStyleClassSpy.getCall(2).args[0], "sapUiCalTwoMonthsInOneColumn", "removeStyleClass is called with sapUiCalTwoMonthsInOneColumn param");
		assert.equal(oRemoveStyleClassSpy.callCount, 3, "removeStyleClass is called three times");

		// cleanup
		oCalendar.destroy();
		oAddStyleClassSpy.restore();
		oRemoveStyleClassSpy.restore();
		oIsTwoMonthsInTwoColumnsStub.restore();
		oIsTwoMonthsInOneColumnStub.restore();
	});

	QUnit.test("_setPrimaryHeaderMonthButtonText should sets the button1 text of the header to _sFirstName value if calendar is in two columns with two months", function (assert) {
		// arrange
		var sExpectedText = "Text of the button",
			oCalendar = new Calendar({ months: 2 }),
			oHeader = oCalendar.getAggregation("header"),
			oSetTextButton1Spy = this.spy(oHeader, "setTextButton1"),
			oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(2);
		oCalendar._sFirstMonthName = sExpectedText;

		// act
		oCalendar._setPrimaryHeaderMonthButtonText();

		// assert
		assert.equal(oSetTextButton1Spy.getCall(0).args[0], sExpectedText, "setTextButton1 should be called with: " + sExpectedText);

		// cleanup
		oCalendar.destroy();
		oSetTextButton1Spy.restore();
		oGetColumnsStub.restore();
	});

	QUnit.test("_setPrimaryHeaderMonthButtonText should sets the button1 text of the header to _sFirstName value if calendar is in one columns with two months", function (assert) {
		// arrange
		var sExpectedText = "Text of the button",
			oCalendar = new Calendar({ months: 2 }),
			oHeader = oCalendar.getAggregation("header"),
			oSetTextButton1Spy = this.spy(oHeader, "setTextButton1"),
			oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(1);
		oCalendar._sFirstMonthName = sExpectedText;

		// act
		oCalendar._setPrimaryHeaderMonthButtonText();

		// assert
		assert.equal(oSetTextButton1Spy.getCall(0).args[0], sExpectedText, "setTextButton1 should be called with: " + sExpectedText);

		// cleanup
		oCalendar.destroy();
		oSetTextButton1Spy.restore();
		oGetColumnsStub.restore();
	});

	QUnit.test("_setPrimaryHeaderMonthButtonText should not call setTextButton1 if months are different than two", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 1 }),
			oHeader = oCalendar.getAggregation("header"),
			oSetTextButton1Spy = this.spy(oHeader, "setTextButton1"),
			oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(2);

		// act
		oCalendar._setPrimaryHeaderMonthButtonText();

		// assert
		assert.equal(oSetTextButton1Spy.callCount, 0, "setTextButton1 should not be called");

		// cleanup
		oCalendar.destroy();
		oSetTextButton1Spy.restore();
		oGetColumnsStub.restore();
	});

	QUnit.test("_updateHeadersButtons should hide 3 and 4 button of the header and show the secondMOnthHeader if months are 2 and columns is 1", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 2 }),
			oHeader = oCalendar.getAggregation("header"),
			oSecondMonthHeader = oCalendar.getAggregation("secondMonthHeader"),
			oSetVisibleSpy = this.spy(oSecondMonthHeader, "setVisible"),
			oSetVisibleButton3Spy = this.spy(oHeader, "_setVisibleButton3"),
			oSetVisibleButton4Spy = this.spy(oHeader, "_setVisibleButton4"),
			oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(1);

		// act
		oCalendar._updateHeadersButtons();

		// assert
		assert.equal(oSetVisibleSpy.getCall(0).args[0], true, "secondMonthHeader should visible");
		assert.equal(oSetVisibleButton3Spy.getCall(0).args[0], false, "third button of header should not be visible");
		assert.equal(oSetVisibleButton4Spy.getCall(0).args[0], false, "fourth button of header should not be visible");

		// cleanup
		oCalendar.destroy();
		oSetVisibleSpy.restore();
		oSetVisibleButton3Spy.restore();
		oSetVisibleButton4Spy.restore();
		oGetColumnsStub.restore();
	});

	QUnit.test("_updateHeadersButtons should show 3 and 4 button of the header and hide the secondMOnthHeader if months are 2 and columns are 2", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 2 }),
				oHeader = oCalendar.getAggregation("header"),
				oSecondMonthHeader = oCalendar.getAggregation("secondMonthHeader"),
				oSetVisibleSpy = this.spy(oSecondMonthHeader, "setVisible"),
				oSetVisibleButton3Spy = this.spy(oHeader, "_setVisibleButton3"),
				oSetVisibleButton4Spy = this.spy(oHeader, "_setVisibleButton4"),
				oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(2);

		// act
		oCalendar._updateHeadersButtons();

		// assert
		assert.equal(oSetVisibleSpy.getCall(0).args[0], false, "secondMonthHeader should not visible");
		assert.equal(oSetVisibleButton3Spy.getCall(0).args[0], true, "third button of header should be visible");
		assert.equal(oSetVisibleButton4Spy.getCall(0).args[0], true, "fourth button of header should be visible");

		// cleanup
		oCalendar.destroy();
		oSetVisibleSpy.restore();
		oSetVisibleButton3Spy.restore();
		oSetVisibleButton4Spy.restore();
		oGetColumnsStub.restore();
	});

	QUnit.test("_updateHeadersButtons should hide 3 and 4 button of the header and hide the secondMOnthHeader if months different than two", function (assert) {
		// arrange
		var oCalendar = new Calendar({ months: 3 }),
				oHeader = oCalendar.getAggregation("header"),
				oSecondMonthHeader = oCalendar.getAggregation("secondMonthHeader"),
				oSetVisibleSpy = this.spy(oSecondMonthHeader, "setVisible"),
				oSetVisibleButton3Spy = this.spy(oHeader, "_setVisibleButton3"),
				oSetVisibleButton4Spy = this.spy(oHeader, "_setVisibleButton4"),
				oGetColumnsStub = this.stub(oCalendar, "_getColumns").returns(3);

		// act
		oCalendar._updateHeadersButtons();

		// assert
		assert.equal(oSetVisibleSpy.getCall(0).args[0], false, "secondMonthHeader should not be visible");
		assert.equal(oSetVisibleButton3Spy.getCall(0).args[0], false, "third button of header should not be visible");
		assert.equal(oSetVisibleButton4Spy.getCall(0).args[0], false, "fourth button of header should not be visible");

		// cleanup
		oCalendar.destroy();
		oSetVisibleSpy.restore();
		oSetVisibleButton3Spy.restore();
		oSetVisibleButton4Spy.restore();
		oGetColumnsStub.restore();
	});

	QUnit.test("_updateHeadersYearPrimaryText should call header and secondMonthHeader methods with proper value", function (assert) {
		// arrange
		var sYear = "2018",
			oHeader = {
				setTextButton2: this.spy(),
				setAriaLabelButton2: this.spy(),
				_setTextButton4: this.spy(),
				_setAriaLabelButton4: this.spy()
			},
			oSecondMonthHeader = {
				setTextButton2: this.spy(),
				setAriaLabelButton2: this.spy()
			},
			oCalendar = new Calendar(),
			oGetAggregationStub = this.stub(oCalendar, "getAggregation");

		oGetAggregationStub.withArgs("header").returns(oHeader);
		oGetAggregationStub.withArgs("secondMonthHeader").returns(oSecondMonthHeader);

		// act
		oCalendar._updateHeadersYearPrimaryText(sYear);

		// assert
		assert.equal(oHeader.setTextButton2.getCall(0).args[0], sYear, "setTextButton2 should be called with " + sYear);
		assert.equal(oHeader._setTextButton4.getCall(0).args[0], sYear, "_setTextButton4 should be called with " + sYear);
		assert.equal(oSecondMonthHeader.setTextButton2.getCall(0).args[0], sYear, "setTextButton2 should be called with " + sYear);

		// cleanup
		oCalendar.destroy();
		oGetAggregationStub.restore();
	});

	QUnit.test("_updateHeadersYearAdditionalText should call header and secondMonthHeader methods with proper value", function (assert) {
		// arrange
		var sExpectedValue = "2018",
				oHeader = {
					setAdditionalTextButton2: this.spy(),
					_setAdditionalTextButton4: this.spy(),
					getAriaLabelButton2: this.spy(),
					setAriaLabelButton2: this.spy()
				},
				oSecondMonthHeader = {
					setAdditionalTextButton2: this.spy()
				},
				oCalendar = new Calendar(),
				oGetAggregationStub = this.stub(oCalendar, "getAggregation");
		oGetAggregationStub.withArgs("header").returns(oHeader);
		oGetAggregationStub.withArgs("secondMonthHeader").returns(oSecondMonthHeader);

		// act
		oCalendar._updateHeadersYearAdditionalText(sExpectedValue);

		// assert
		assert.equal(oHeader.setAdditionalTextButton2.getCall(0).args[0], sExpectedValue, "setAdditionalTextButton2 should be called with " + sExpectedValue);
		assert.equal(oHeader._setAdditionalTextButton4.getCall(0).args[0], sExpectedValue, "_setAdditionalTextButton4 should be called with " + sExpectedValue);
		assert.equal(oSecondMonthHeader.setAdditionalTextButton2.getCall(0).args[0], sExpectedValue, "setAdditionalTextButton2 should be called with " + sExpectedValue);

		// cleanup
		oCalendar.destroy();
		oGetAggregationStub.restore();
	});

	QUnit.test("weekNumberSelect event", function (assert) {
		// Prepare
		var oCal3 = new Calendar("Cal3",{
				months: 2,
				firstDayOfWeek: 2,
				nonWorkingDays: [3, 5],
				minDate: UI5Date.getInstance("2000", "0", "7"),
				maxDate: UI5Date.getInstance("2015", "1", "25"),
				selectedDates: [new DateRange({startDate: UI5Date.getInstance("2015", "0", "5")})],
				disabledDates: [new DateRange({startDate: UI5Date.getInstance("2015", "0", "10")}),
					new DateRange({startDate: UI5Date.getInstance("2015", "1", "10"), endDate: UI5Date.getInstance("2015", "1", "20")})],
				specialDates: [new DateTypeRange({startDate: UI5Date.getInstance("2015", "0", "26"), type:
					CalendarDayType.Type04, secondaryType: CalendarDayType.NonWorking})],
				startDateChange: handleStartDateChange
			}).placeAt("qunit-fixture"),
			oEventSpy = this.spy(oCal3, "fireWeekNumberSelect"),
			oFakeEvent = {
				weekNumber: 1,
				weekDays: new DateRange({
					startDate: UI5Date.getInstance(2015, 0, 5)
				})
			};
		// Act
		// Get one of the internal months and just fire it's weekNumberSelect directly
		oCal3.getAggregation("month")[0].fireWeekNumberSelect(oFakeEvent);

		// Assert
		assert.ok(oEventSpy.called, "Detected internal Months firing weekNumberSelect, so Calendar did the same");

		// Clean
		oCal3.destroy();
	});

	QUnit.test("weekNumberSelect event handling", function(assert) {
		// prepare
		var oCal = new Calendar(),
			oDate = UI5Date.getInstance(2015, 0, 5),
			oCalendarDate = CalendarDate.fromLocalJSDate(oDate, oCal.getPrimaryCalendarType()),
			oFakeEvent = {
				getParameter: function(sParam) {
					return sParam === "weekDays" ?
						new DateRange({
							startDate: oDate
						}) : 1;
				},
				getSource: function() {
					return {
						getDate: function() {
							return false;
						}
					};
				}
			},
			oFocusDateSpy = this.spy(oCal, "_focusDate");

		// act
		oCal._handleWeekNumberSelect(oFakeEvent);

		// assert
		assert.ok(oFocusDateSpy.calledWith(oCalendarDate), "Calendar.prototype._focusDate is called");
	});

	QUnit.test("onkeydown handler when F4 is pressed", function(assert) {
		// Prepare
		var oSpyEventPreventDefault = this.spy(),
			oEvent = { keyCode: KeyCodes.F4, preventDefault: oSpyEventPreventDefault },
			oCalendar = new Calendar(),
			oSpyShowMonthPicker = this.stub(oCalendar, "_showMonthPicker");

		oCalendar.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oCalendar.onkeydown(oEvent);

		// Assert
		assert.equal(oSpyShowMonthPicker.callCount, 1, "month picker is about to show");
		assert.equal(oSpyEventPreventDefault.callCount, 1, "the event is prevented from default browser action");

		// Cleanup
		oCalendar.destroy();
	});

	QUnit.test("onkeydown handler when Shift+F4 is pressed", function(assert) {
		// Prepare
		var oSpyEventPreventDefault = this.spy(),
			oEvent = { keyCode: KeyCodes.F4, preventDefault: oSpyEventPreventDefault, shiftKey: true },
			oCalendar = new Calendar(),
			oSpyShowYearPicker = this.stub(oCalendar, "_showYearPicker");

		// Act
		oCalendar.onkeydown(oEvent);

		// Assert
		assert.equal(oSpyShowYearPicker.callCount, 1, "year picker is about to to show");
		assert.equal(oSpyEventPreventDefault.callCount, 1, "the event is prevented from default browser action");

		// Cleanup
		oCalendar.destroy();
	});

	QUnit.test("onkeydown handler when F4 is pressed, but there is a picker popup", function(assert) {
		// Prepare
		var oSpyEventPreventDefault = this.spy(),
			oEvent = { keyCode: KeyCodes.F4, preventDefault: oSpyEventPreventDefault, shiftKey: true },
			oCalendar = new Calendar(),
			oYRFirstDateStub = this.stub(oCalendar._getYearPicker(), "getFirstRenderedDate").callsFake(function () { return UI5Date.getInstance(); });

		this.stub(oCalendar, "_getSucessorsPickerPopup").returns(true);

		// Act
		oCalendar.onkeydown(oEvent);

		// Assert
		assert.equal(oSpyEventPreventDefault.callCount, 1, "browser's event handler is prevented");

		// Cleanup
		oCalendar.destroy();
		oYRFirstDateStub.restore();
	});

	QUnit.test("onsapescape fires cancel event in all views (days, months and years)", function (assert) {
		// Prepare
		var oCalendar = new Calendar(),
			oSpyFireCancel = this.spy(oCalendar, "fireCancel");

		// Act in Day view
		oCalendar._iMode = 0;
		oCalendar.onsapescape();

		// Assert in Day view
		assert.equal(oSpyFireCancel.callCount, 1, "fireCancel should be called once in Day view");

		oSpyFireCancel.resetHistory();

		// Act in Month view
		oCalendar._iMode = 1;
		oCalendar.onsapescape();

		// Assert in Month view
		assert.equal(oSpyFireCancel.callCount, 1, "fireCancel should be called once in Month view");

		oSpyFireCancel.resetHistory();

		// Act in year view
		oCalendar._iMode = 2;
		oCalendar.onsapescape();

		// Assert in Year view
		assert.equal(oSpyFireCancel.callCount, 1, "fireCancel should be called once in Year view");

		// Cleanup
		oSpyFireCancel.restore();
		oCalendar.destroy();
	});

	QUnit.test("calendar reacts on monthpicker's pagechange, the same way as with the arrow buttons", function(assert) {
		// arrange
		var oCalendar = new Calendar(),
			oMonthPicker = oCalendar.getAggregation("monthPicker"),
			oSpyHandleNext = this.spy(oCalendar, "_handleNext"),
			oSpyHandlePrev = this.spy(oCalendar, "_handlePrevious");

		// act
		oMonthPicker.firePageChange({ offset: 1 });

		// assert
		assert.equal(oSpyHandleNext.callCount, 1, "_handleNext is called");

		// act
		oMonthPicker.firePageChange({ offset: -1 });

		// assert
		assert.equal(oSpyHandlePrev.callCount, 1, "_handlePrevious is called");

		// clean
		oCalendar.destroy();
	});

	QUnit.test("F4 opens month picker", function(assert) {
		// prepare
		var oCalendar = new Calendar().placeAt("qunit-fixture"),
			oFakeEvent = {
				target: {
					id: oCalendar.getId() + "-inner",
					which: KeyCodes.PAGE_UP
				},
				which: 115,
				defaultPrevented: false,
				preventDefault: function() {
					this.defaultPrevented = true;
				}
			}, oSpy = this.spy(oCalendar, "_showMonthPicker");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		oCalendar.onkeydown(oFakeEvent);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.ok(oSpy.calledOnce, "the month picker is opened");

		// clean
		oCalendar.destroy();
		oSpy.restore();
	});

	QUnit.test("Shift+F4 opens year picker", function(assert) {
		// prepare
		var oCalendar = new Calendar().placeAt("qunit-fixture"),
			oFakeEvent = {
				target: {
					id: oCalendar.getId() + "-inner",
					which: KeyCodes.PAGE_UP
				},
				shiftKey: true,
				which: 115,
				defaultPrevented: false,
				preventDefault: function() {
					this.defaultPrevented = true;
				}
			}, oSpy = this.spy(oCalendar, "_showYearPicker"),
			oYRFirstDateStub = this.stub(oCalendar._getYearPicker(), "getFirstRenderedDate").callsFake(function () { return UI5Date.getInstance(); });

		// act
		oCalendar.onkeydown(oFakeEvent);

		// assert
		assert.ok(oSpy.calledOnce, "the year picker is opened");

		// clean
		oCalendar.destroy();
		oSpy.restore();
		oYRFirstDateStub.restore();
	});

	QUnit.test("Shift+F4 twice opens year range picker", function(assert) {
		// prepare
		var oCalendar = new Calendar().placeAt("qunit-fixture"),
			oFakeEvent = {
				target: {
					id: oCalendar.getId() + "-inner",
					which: KeyCodes.PAGE_UP
				},
				shiftKey: true,
				which: 115,
				defaultPrevented: false,
				preventDefault: function() {
					this.defaultPrevented = true;
				}
			}, oSpy = this.spy(oCalendar, "_showYearRangePicker"),
			oYRFirstDateStub = this.stub(oCalendar._getYearPicker(), "getFirstRenderedDate").callsFake(function () { return UI5Date.getInstance(); });

		// act
		oCalendar.onkeydown(oFakeEvent);
		oCalendar.onkeydown(oFakeEvent);

		// assert
		assert.ok(oSpy.calledOnce, "the year range picker is opened");

		// clean
		oCalendar.destroy();
		oSpy.restore();
		oYRFirstDateStub.restore();
	});

	QUnit.test("F4 doesnt open month picker, when year picker is already opened", function(assert) {
		// prepare
		var oCalendar = new Calendar().placeAt("qunit-fixture"),
			oFakeEvent = {
				which: 115,
				defaultPrevented: false,
				preventDefault: function() {
					this.defaultPrevented = true;
				}
			}, oShowMonthPickerSpy;

		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oCalendar._showYearPicker();

		// act
		oShowMonthPickerSpy = this.spy(oCalendar, "_showMonthPicker");
		oCalendar.onkeydown(oFakeEvent);

		// assert
		assert.ok(oShowMonthPickerSpy.notCalled, "the month picker is not opened");

		// clean
		oCalendar.destroy();
		oShowMonthPickerSpy.restore();
	});

	QUnit.test("displayDate shows the given date always in the first rendered month", function(assert) {
		// prepare
		var oCalendar = new Calendar("cal", {months: 2}).placeAt("qunit-fixture"),
			aMonths, aDays;

		oCalendar.displayDate(UI5Date.getInstance(2021, 4, 1));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		oCalendar.displayDate(UI5Date.getInstance(2021, 5, 30));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		aMonths = jQuery("#cal-content").children(".sapUiCalMonthView");
		aDays = jQuery(aMonths[0]).find(".sapUiCalItem");
		assert.strictEqual(jQuery(aDays[0]).attr("data-sap-day"), "20210530", "The first rendered date is correct");

		// clean
		oCalendar.destroy();
	});

	QUnit.test("Dummy cell above week numbers is rendered only when necessary", function(assert) {
		// prepare
		var oCalM = new Calendar("CalM", {
				showWeekNumbers: false,
				primaryCalendarType: CalendarType.Gregorian
			}),
			dummyCellSpy = this.spy(MonthRenderer, "renderDummyCell");

		//arrange
		oCalM.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		//act
		assert.equal(dummyCellSpy.callCount, 0, "The function wasn't called when calendar type is Gregorian and showWeekNumber=false");
		//arrange
		oCalM.setShowWeekNumbers(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		//act
		assert.equal(dummyCellSpy.callCount, 1, "The function was called when calendar type is Gregorian and showWeekNumber=true");
		//arrange
		oCalM.setPrimaryCalendarType(CalendarType.Islamic);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		//act
		assert.equal(dummyCellSpy.callCount, 1, "The function wasn't called when calendar type is Islamic and showWeekNumber=true");
		//arrange
		oCalM.setShowWeekNumbers(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		//act
		assert.equal(dummyCellSpy.callCount, 1, "The function wasn't called when calendar type is Islamic and showWeekNumber=false");
		// clean up
		oCalM.destroy();
	});

	QUnit.test("Islamic calendar year stays consistent", function(assert) {
		// prepare
		var oConfigStub = sinon.stub(Formatting, 'getCalendarType').returns("Islamic"),
			oInitialDate = UI5Date.getInstance(2023, 7, 10),
			oFocusedCalendarDate = CalendarDate.fromLocalJSDate(oInitialDate, CalendarType.Islamic),
			oCal = new Calendar("CalTypeTest", {
				months: 2,
				initialFocusedDate: oInitialDate,
				primaryCalendarType: CalendarType.Islamic
			}),
			oFocusDateSpy = this.spy(oCal, "_focusDate"),
			oUi5DateOriginalGetInstance = UI5Date.getInstance,
			oCurrentDateStub = sinon.stub(UI5Date, 'getInstance'),
			sDateString;

		oCurrentDateStub.callsFake(function () {
		if (arguments.length > 0) {
				return oUi5DateOriginalGetInstance.apply(UI5Date, arguments);
			} else {
				return oInitialDate;
			}
		});

		this.stub(oCal, "_closePickers").returns(oCal);

		oCal._getMonthPicker()._iYear = oFocusedCalendarDate.getYear();
		oCal._bActionTriggeredFromSecondHeader = true;
		// act
		oCal._selectMonth();
		sDateString = oFocusDateSpy.getCall(0).args[0].toString();
		assert.strictEqual(sDateString, 'Islamic: 1444/12/23');

		// clean up
		oConfigStub.restore();
		oCurrentDateStub.restore();
	});

	//================================================================================
	// Month Button Label
	//================================================================================

	QUnit.module("Month Button Label");

	QUnit.test("When there is one month, the label of the button must contain only one month name", function (assert) {
		// arrange
		var iAugust = 7,
			oCal1 = new Calendar("Cal_1").placeAt("qunit-fixture");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act: click on month select button
		qutils.triggerEvent("click", "Cal_1--Head-B1");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act: select a month
		oCal1.getAggregation("monthPicker").setMonth(iAugust);
		oCal1._selectMonth(iAugust);

		// assert
		assert.equal(oCal1.getAggregation("header").getTextButton1(), "August", "One month calendar, August selected, 'August' shown as label");

		// cleanup
		oCal1.destroy();
	});

	QUnit.test("When there are 2 months, the label of first month button must contain only one month name", function(assert) {
		// arrange
		var iFebruary = 1,
			o1June2021 = UI5Date.getInstance(2021, 5, 1),
			oCal2 = new Calendar("Cal_2", {
				months: 2
			}).placeAt("qunit-fixture");

		oCal2.addSelectedDate(new DateRange({
			startDate: o1June2021
		}));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act: click on month select button
		qutils.triggerEvent("click", "Cal_2--Head-B1");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act: select a month (February)
		oCal2.getAggregation("monthPicker").setMonth(iFebruary);
		oCal2._selectMonth();

		// assert
		assert.equal(oCal2.getAggregation("header").getTextButton1(), "February",
			"Two months calendar, February selected, 'February' shown as label");

		// cleanup
		oCal2.destroy();
	});

	QUnit.test("When months are > 2, the label of first month button must contain 'start_month - end_month' names", function (assert) {
		// arrange
		var oCal,
			oMP,
			oLocaleData,
			sPattern,
			aMonthNames,
			iMonthCount,
			iStartMonth,
			sStartMonth,
			sText;

		// setup
		iMonthCount = 4;
		iStartMonth = 11; // December
		oCal = new Calendar("Cal",{ months: iMonthCount }).placeAt("qunit-fixture");
		oMP = oCal.getAggregation("monthPicker");
		oLocaleData = oCal._getLocaleData();
		sPattern = oLocaleData.getIntervalPattern();
		aMonthNames = oLocaleData.getMonthsStandAlone("wide", oCal.getPrimaryCalendarType());
		aMonthNames = aMonthNames.concat(aMonthNames); // just in case that some of the last monht is selected for start month
		sStartMonth = aMonthNames[iStartMonth];
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		sText = sPattern.replace(/\{0\}/, aMonthNames[iStartMonth]).replace(/\{1\}/, aMonthNames[iStartMonth + iMonthCount - 1]);

		// act: click on month select button
		qutils.triggerEvent("click", "Cal--Head-B1");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act: select a month (August)
		oMP.setMonth(7);
		oCal._selectMonth(oMP.getMonth());
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act: click on month select button
		qutils.triggerEvent("click", "Cal--Head-B1");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act: select a month (December)
		oMP.setMonth(iStartMonth);
		oCal._selectMonth(oMP.getMonth());
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert setup
		assert.equal(jQuery("#Cal--Head-B1").text(), sText, iMonthCount + " months calendar, " + sStartMonth + " selected, '" + sText + "' shown as label");

		// cleanup
		oMP.destroy();
		oCal.destroy();
		oMP = null;
		oCal = null;
		oLocaleData = null;
	});

	QUnit.module("Accessibility");

	QUnit.test("Calendar root element has roledescription attribute", function(assert) {
		// prepare
		var oCal = new Calendar();

		oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		// assert
		assert.equal(oCal.getDomRef().getAttribute("aria-roledescription"), "Calendar", "aria-roledescription corretly set");

		// clean
		oCal.destroy();
	});

	QUnit.test("Month instance DOM ref has keybord shortcut hints in aria-labelledby attribute'", function(assert) {
		// prepare
		var oCal = new Calendar(),
			oMonth = oCal.getAggregation("month")[0],
			aMonthDesc;

		oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		aMonthDesc = oMonth.getDomRef().getAttribute("aria-describedby").trim().split(" ");

		// assert
		assert.equal(
			aMonthDesc[0],
			InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_MONTH_PICKER_OPEN_HINT"),
			"month picker hint corretly set"
		);
		assert.equal(
			aMonthDesc[1],
			InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_YEAR_PICKER_OPEN_HINT"),
			"year picker hint corretly set"
		);

		// clean
		oCal.destroy();
	});

	QUnit.test("MonthPicker instance DOM ref has keybord shortcut hints in aria-labelledby attribute'", function(assert) {
		// prepare
		var oCal = new Calendar(),
			oMonthPicker = oCal._getMonthPicker(),
			aMonthPickerDesc;

		oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		oCal._showMonthPicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		aMonthPickerDesc = oMonthPicker.getDomRef().getAttribute("aria-describedby").trim().split(" ");

		// assert
		assert.equal(
			aMonthPickerDesc[0],
			InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_YEAR_PICKER_OPEN_HINT"),
			"year picker hint corretly set"
		);

		assert.equal(aMonthPickerDesc.length, 1, "Only year picker hint is added");

		// clean
		oCal.destroy();
	});

	QUnit.test("Year picker instance DOM ref has keybord shortcut hints in aria-labelledby attribute'", function(assert) {
		// prepare
		var oCal = new Calendar(),
			oYearPicker = oCal._getYearPicker(),
			oYearDesc;

		oCal.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		oCal._showYearPicker();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oYearDesc = oYearPicker.getDomRef().getAttribute("aria-describedby").trim().split(" ");

		// assert
		assert.equal(
			oYearDesc[0],
			InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_YEAR_RANGE_PICKER_OPEN_HINT"),
			"year range picker hint corretly set"
		);

		assert.equal(oYearDesc.length, 1, "Only year range picker hint is added");

		// clean
		oCal.destroy();
	});

	QUnit.test("Calendar special dates tooltips", function(assert) {
		// prepare
		var oDate = UI5Date.getInstance("2017", "3", "9");
		var oCalendar = new Calendar({
			selectedDates: [
				new DateTypeRange({startDate: oDate})
			],
			specialDates: [
				new DateTypeRange({startDate: oDate, type: "Type10", tooltip: "Holiday 1"})
			]
		});

		oCalendar.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var oDay = oCalendar.getDomRef().querySelector("[data-sap-day='20170409'");

		// assert
		assert.strictEqual(oDay.getAttribute("title"), "Non-Working Day Holiday 1", "Proper tooltip is set");

		// clean
		oCalendar.destroy();
	});
});