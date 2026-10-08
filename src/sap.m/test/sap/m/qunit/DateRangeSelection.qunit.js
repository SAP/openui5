/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/base/i18n/date/CalendarType",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/format/DateFormat",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/test/TestUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/unified/DateTypeRange",
	"sap/m/DateRangeSelection",
	"sap/m/Label",
	"sap/m/InputBase",
	"sap/m/DatePicker",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/ui/core/LocaleData",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/events/KeyCodes",
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Element",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/type/DateInterval",
	"sap/m/DateHighZoomInputs",
	"sap/ui/dom/jquery/cursorPos"
], function(
	Formatting,
	Localization,
	CalendarType,
	Library,
	Locale,
	qutils,
	createAndAppendDiv,
	DateFormat,
	nextUIUpdate,
	TestUtils,
	JSONModel,
	CalendarDate,
	DateTypeRange,
	DateRangeSelection,
	Label,
	InputBase,
	DatePicker,
	Button,
	Dialog,
	Device,
	LocaleData,
	XMLView,
	ODataModel,
	KeyCodes,
	deepEqual,
	Log,
	jQuery,
	Element,
	UI5Date,
	DateInterval,
	DateHighZoomInputs
) {
	"use strict";

	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");
	var sMyxml =
		"<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\">" +
		"	<VBox binding=\"{/EdmTypesCollection(ID='1')}\">" +
		"		<DateRangeSelection id=\"drs_odata\"" +
		"			value=\"{" +
		"				parts: [{ path: 'TravelStartDate'},{ path:'TravelEndDate'}]," +
		"				type: 'sap.ui.model.type.DateInterval'," +
		"				formatOptions: {" +
		"					format: 'yMEd'," +
		"					UTC: true" +
		"				}" +
		"			}\"" +
		"		/>" +
		"		<!-- at the backend, date/time values should be always stored in UTC-->" +
		"	</VBox>" +
		"</mvc:View>";


	var oDefaultMinDate = new DatePicker()._oMinDate;
	var oDefaultMaxDate = new DatePicker()._oMaxDate;

	//Preparing input dates for testing purposes:
	//From: April 1, 2014 0:00 (local time)
	var dateFrom = UI5Date.getInstance(2014, 3, 1, 0, 0, 0);

	//To: April 10, 2014 0:00 (local time)
	var dateTo1 = UI5Date.getInstance(2014, 3, 10, 0, 0, 0);

	//To: April 3, 2014 0:00 (local time)
	var dateTo2 = UI5Date.getInstance(2014, 3, 3, 0, 0, 0);

	var bChange = false;
	var bValid = false;

	function handleChange(oEvent){
			bValid = oEvent.getParameter("valid");
			bChange = true;
		}

	var oDRS1 = new DateRangeSelection("DRS1", {
		delimiter : "-",
		displayFormat : "dd.MM.yyyy"
	}).placeAt("uiArea1");

	var oDRS2 = new DateRangeSelection("DRS2", {
		width : "250px",
		delimiter : "-",
		displayFormat : "dd+MM+yyyy",
		dateValue : dateFrom,
		secondDateValue : dateTo1,
		change: handleChange
	}).placeAt("uiArea2");

	var oDRS3 = new DateRangeSelection("DRS3", {
		delimiter : "-",
		displayFormat : "long",
		dateValue : dateFrom,
		secondDateValue : dateTo2
	}).placeAt("uiArea3");


	QUnit.module("initialization");

	QUnit.test("Date formatter", function(assert) {
		assert.ok(!oDRS1.getValue(), "DRS1: no value");
		assert.ok(!oDRS1.getDateValue(), "DRS1: no DateValue");
		assert.equal(oDRS2.getDateValue().getTime(), dateFrom.getTime(), "DRS2: DateValue set");
		assert.equal(oDRS2.getSecondDateValue().getTime(), dateTo1.getTime(), "DRS2: SecondDateValue set");
		assert.equal(oDRS3.getDateValue().getTime(), dateFrom.getTime(), "DRS3: DateValue set");
		assert.equal(oDRS3.getSecondDateValue().getTime(), dateTo2.getTime(), "DRS3: SecondDateValue set");
	});

	QUnit.test("interval selection is correctly set to the YearPicker", async function(assert) {
		// Prepare
		var oDRS = new DateRangeSelection({
				displayFormat: "yyyy"
			}).placeAt("qunit-fixture"),
			oYearPicker;

		await nextUIUpdate();

		// Act
		oDRS.toggleOpen();
		oYearPicker = oDRS._getCalendar()._getYearPicker();

		// Assert
		assert.ok(oYearPicker.getIntervalSelection(), "interval selection is set to 'true'");

		// Clean
		oDRS.destroy();
	});

	QUnit.module("Rendering");

	QUnit.test("native browser autocomplete is disabled on the inner input", async function(assert) {
		// arrange
		var oDateRangeSelection = new DateRangeSelection().placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oDateRangeSelection.getFocusDomRef().getAttribute("autocomplete"), "off",
			"autocomplete='off' is set so the native browser suggestions are not shown");

		// cleanup
		oDateRangeSelection.destroy();
	});

	QUnit.test("Styling", function(assert) {
		assert.equal(jQuery("#DRS1").css("width"), jQuery("body").css("width"), "Default width is 100%");
		assert.equal(jQuery("#DRS2").css("width"), "250px", "given width used");
		assert.ok(jQuery("#DRS1-icon")[0], "Calendar icon rendered");
		assert.ok(!jQuery("#DRS3-cal")[0], "no calendar rendered");
	});

	QUnit.test("Date format", function(assert) {
		assert.ok(!jQuery("#DRS1").find("input").val(), "DRS1 : empty date");
		assert.equal(jQuery("#DRS2").find("input").val(), "01+04+2014 - 10+04+2014", "DRS2: defined output format used");
		assert.equal(jQuery("#DRS3").find("input").val(), "April 1, 2014 - April 3, 2014", "DRS3: defined output format used");
	});

	QUnit.test("Ok button gets enabled after a range is selected", async function(assert) {
		// Prepare
		var oDPS = new DateRangeSelection({
				showFooter: true
			}),
			oDPSPopover,
			oCalendar;

		oDPS.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oDPS.toggleOpen();
		oDPSPopover = oDPS._oPopup;
		oCalendar = oDPS._getCalendar();

		// Assert
		assert.notOk(
			oDPSPopover.getBeginButton().getEnabled(),
			"Begin button is disabled when the popover is opened and the DateRangeSelection input field is empty"
		);

		// Act
		oCalendar.getSelectedDates()[0].setStartDate(oCalendar._getFocusedDate().toLocalJSDate());
		oCalendar.fireSelect();

		// Assert
		assert.notOk(
			oDPSPopover.getBeginButton().getEnabled(),
			"Begin button is still disabled when we choose a start date for our interval"
		);

		// Act
		oCalendar.getSelectedDates()[0].setEndDate(oCalendar._getFocusedDate().toLocalJSDate());
		oCalendar.fireSelect();

		// Assert
		assert.ok(
			oDPSPopover.getBeginButton().getEnabled(),
			"Begin button is enabled when the end date is chosen"
		);

		// Act
		oCalendar.getSelectedDates()[0].setStartDate(oCalendar._getFocusedDate().toLocalJSDate());
		oCalendar.getSelectedDates()[0].setEndDate(null);
		oCalendar.fireSelect();

		// Assert
		assert.notOk(
			oDPSPopover.getBeginButton().getEnabled(),
			"Begin button is disabled again when we choose a start date for a new interval"
		);

		// Cleanup
		oDPS.destroy();
	});

	QUnit.test("Current year is focused when there are no selected years", async function(assert) {
		// Prepare
		var oDRS = new DateRangeSelection({
				displayFormat: "yyyy"
			}),
			oYear = UI5Date.getInstance().getFullYear(),
			oYearPicker;

		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oDRS.toggleOpen();
		await nextUIUpdate();
		oYearPicker = oDRS._getCalendar()._getYearPicker();

		// Assert
		assert.equal(oYearPicker.getFocusDomRef().id, oYearPicker.getId() + "-y" + oYear + "0101", "Current year is focused");

		// Cleanup
		oDRS.destroy();
	});

	QUnit.module("interaction");

	QUnit.test("min/max", async function(assert) {
		var oNewMinDate = UI5Date.getInstance(2014,0,1);
		var oNewMaxDate = UI5Date.getInstance(2014,11,31);
		oDRS2.setMinDate(oNewMinDate);
		oDRS2.setMaxDate(oNewMaxDate);
		await nextUIUpdate();

		bChange = false;
		bValid = true;
		oDRS2.focus();
		jQuery("#DRS2").find("input").val("01+04+2013 - 10+04+2014");
		qutils.triggerKeydown("DRS2-inner", KeyCodes.ENTER, false, false, false);
		jQuery("#DRS2").find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.ok(bChange, "DRS2: change event fired by typing invalid date");
		assert.ok(!bValid, "DRS2: invalid typed date is not valid");
		assert.ok(deepEqual(oDRS2.getDateValue(), dateFrom), "DRS2: dateValue not changed by invalid typing");

		bChange = false;
		bValid = true;
		oDRS2.focus();
		jQuery("#DRS2").find("input").val("02+04+2014 - 11+04+2014");
		qutils.triggerKeydown("DRS2-inner", KeyCodes.ENTER, false, false, false);
		jQuery("#DRS2").find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.ok(bChange, "DRS2: change event fired by typing valid date");
		assert.ok(bValid, "DRS2: valid typed date is valid");
		assert.ok(deepEqual(oDRS2.getDateValue(), UI5Date.getInstance(2014,3,2)), "DRS2: dateValue changed by valid typing");
		assert.ok(deepEqual(oDRS2.getSecondDateValue(), UI5Date.getInstance(2014,3,11,23,59,59,999)), "DRS2: secondDateValue changed by valid typing");

		bChange = false;
		bValid = true;
		oDRS2.focus();
		jQuery("#DRS2").find("input").val("01+04+2014 - 10+04+2015");
		qutils.triggerKeydown("DRS2-inner", KeyCodes.ENTER, false, false, false);
		jQuery("#DRS2").find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.ok(bChange, "DRS2: change event fired by typing invalid date");
		assert.ok(!bValid, "DRS2: invalid typed date is not valid");
		assert.ok(deepEqual(oDRS2.getDateValue(), UI5Date.getInstance(2014,3,2)), "DRS2: dateValue not changed by invalid typing");
		assert.ok(deepEqual(oDRS2.getSecondDateValue(), UI5Date.getInstance(2014,3,11,23,59,59,999)), "DRS2: secondDateValue not changed by invalid typing");

		oDRS2.setMinDate();
		oDRS2.setMaxDate();
		await nextUIUpdate();

	});

	QUnit.test("When invalid date is set as value the control detects it and doesn't throw error", function(assert) {
		//Prepare
		var oDRS = new DateRangeSelection("DRS", {
			value: "Invalid Date"
		});

		// Act
		oDRS.onChange();

		// Assert
		assert.ok(true, "Test does not throw");

		// Clean
		oDRS.destroy();
	});

	QUnit.test("change event fires with undefined 'from'/'to' when value is invalid, and with date objects when valid", async function(assert) {
		// Prepare
		var oDRS = new DateRangeSelection({
				delimiter: "-",
				displayFormat: "dd.MM.yyyy",
				minDate: UI5Date.getInstance(2020, 0, 1),
				maxDate: UI5Date.getInstance(2020, 11, 31)
			}),
			oFireChangeEventSpy = sinon.spy(oDRS, "fireChangeEvent");

		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act - enter an invalid date (outside min/max range)
		oDRS.focus();
		oDRS._$input.val("01.01.2019 - 10.01.2019");
		oDRS.onChange();

		// Assert - invalid: from and to should be undefined
		assert.ok(oFireChangeEventSpy.calledOnce, "change event was fired for invalid input");
		assert.strictEqual(oFireChangeEventSpy.getCall(0).args[1].valid, false, "valid is false for invalid input");
		assert.strictEqual(oFireChangeEventSpy.getCall(0).args[1].from, undefined, "from is undefined when value is invalid");
		assert.strictEqual(oFireChangeEventSpy.getCall(0).args[1].to, undefined, "to is undefined when value is invalid");

		oFireChangeEventSpy.resetHistory();

		// Act - enter a valid date
		oDRS._$input.val("05.06.2020 - 15.06.2020");
		oDRS.onChange();

		// Assert - valid: from and to should be date objects
		assert.ok(oFireChangeEventSpy.calledOnce, "change event was fired for valid input");
		assert.strictEqual(oFireChangeEventSpy.getCall(0).args[1].valid, true, "valid is true for valid input");
		assert.ok(oFireChangeEventSpy.getCall(0).args[1].from instanceof Date, "from is a Date object when value is valid");
		assert.ok(oFireChangeEventSpy.getCall(0).args[1].to instanceof Date, "to is a Date object when value is valid");

		// Clean
		oDRS.destroy();
	});

	QUnit.test("interval selection is correctly set to the MonthPicker", async function(assert) {
		// Prepare
		var oDRS = new DateRangeSelection({
				displayFormat: "yyyy-MM"
			}).placeAt("qunit-fixture"),
			oMonthPicker;

		await nextUIUpdate();

		// Act
		oDRS.toggleOpen();
		oMonthPicker = oDRS._getCalendar()._getMonthPicker();

		// Assert
		assert.ok(oMonthPicker.getIntervalSelection(), "interval selection is set to 'true'");

		// Clean
		oDRS.destroy();
	});

	QUnit.test("opening picker when current values are outside min/max range", async function(assert) {
		//Prepare
		var oMaxDate = UI5Date.getInstance(2014,0,1),
			oDRS = new DateRangeSelection({
			minDate: UI5Date.getInstance(2014,0,1),
			maxDate: oMaxDate
		});
		oDRS.setDateValue(UI5Date.getInstance(2001, 0, 1));
		oDRS.setSecondDateValue(UI5Date.getInstance(2001, 0, 10));
		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act - user opens the picker when current input value is outside min/max range
		oDRS.focus();
		qutils.triggerEvent("click", oDRS.getId() + "-icon");//to load the picker and initialize the calendar
		oDRS._fillDateRange();

		//Assert
		var oNewMaxDateUTC = UI5Date.getInstance(Date.UTC(oMaxDate.getFullYear(), oMaxDate.getMonth(), oMaxDate.getDate()));
		var oFocusedDate = oDRS._oCalendar._getFocusedDate().toUTCJSDate();
		var aSelectedDates = oDRS._oCalendar.getSelectedDates();
		assert.equal(oFocusedDate.toString(), oNewMaxDateUTC.toString(), "DRS: focused date equals min date " +
			"when current dateValue & secondDateValue  are out of min/max range");
		assert.equal(aSelectedDates[0].getStartDate(), undefined, "DRS: has empty selection's startDate when current dateValue & secondDateValue " +
			"are out of min/max range");

		assert.equal(aSelectedDates[0].getEndDate(), undefined, "DRS: has empty selection's endDate when current dateValue & secondDateValue " +
			"are out of min/max range");

		//Cleanup
		qutils.triggerEvent("click", oDRS.getId() + "-icon"); //closes picker
		oDRS.destroy();
	});

	QUnit.test("Choosing a range in month with 4 weeks is possible", async function(assert) {
		//Prepare
		var oDRS = new DateRangeSelection({
			dateValue: UI5Date.getInstance(2021, 1, 1)
		}).placeAt("qunit-fixture");
		Localization.setLanguage("en-GB"); // ensure that there are 4 weeks
		await nextUIUpdate();

		//Act
		qutils.triggerEvent("click", oDRS.getId() + "-icon");
		await nextUIUpdate();

		try {
			oDRS._getCalendar().getAggregation("month")[0]._selectDay(CalendarDate.fromLocalJSDate(UI5Date.getInstance(2021, 1, 10)));
			//Assert
			assert.ok(1, "The control doesn't throw error when the the user selects a date range");
		} catch (e) {
			assert.ok(0, "The control throws an error " + e.stack);
		}

		//Cleanup
		oDRS.destroy();
		Localization.setLanguage("en-US");
	});

	QUnit.test("focused element after picker close", async function(assert) {
		var bOrigTouch = Device.support.touch,
			bOrigDesktop = Device.system.desktop;

		// On a desktop (non-touch) device
		Device.support.touch = false;
		Device.system.desktop = true;
		qutils.triggerEvent("click", "DRS2-icon");
		await nextUIUpdate();
		jQuery("#DRS2-cal--Month0-20140406").trigger("focus");
		qutils.triggerKeydown("DRS2-cal--Month0-20140406", KeyCodes.ENTER, false, false, false);
		jQuery("#DRS2-cal--Month0-20140409").trigger("focus");
		qutils.triggerKeydown("DRS2-cal--Month0-20140409", KeyCodes.ENTER, false, false, false);
		assert.equal(document.activeElement.id, "DRS2-inner", "Focus is on the input field after date selection");

		qutils.triggerEvent("click", "DRS2-icon");
		Element.closestTo("#DRS2-cal").fireCancel();
		assert.equal(document.activeElement.id, "DRS2-inner", "Focus is on the input field after cancel");

		// On a touch device
		// eslint-disable-next-line require-atomic-updates
		Device.support.touch = true;
		// eslint-disable-next-line require-atomic-updates
		Device.system.desktop = false;
		qutils.triggerEvent("click", "DRS2-icon");
		jQuery("#DRS2-cal--Month0-20140406").trigger("focus");
		qutils.triggerKeydown("DRS2-cal--Month0-20140406", KeyCodes.ENTER, false, false, false);
		jQuery("#DRS2-cal--Month0-20140409").trigger("focus");
		qutils.triggerKeydown("DRS2-cal--Month0-20140409", KeyCodes.ENTER, false, false, false);
		assert.notEqual(document.activeElement.id, "DRS2-inner", "Focus is NOT on the input field after date selection");

		qutils.triggerEvent("click", "DRS2-icon");
		Element.closestTo("#DRS2-cal").fireCancel();
		assert.notEqual(document.activeElement.id, "DRS2-inner", "Focus is NOT on the input field after cancel");

		// eslint-disable-next-line require-atomic-updates
		Device.system.desktop = bOrigDesktop;
		// eslint-disable-next-line require-atomic-updates
		Device.support.touch = bOrigTouch;
	});

	QUnit.test("Control destroy", function(assert) {
		assert.strictEqual(oDRS1.$().length + oDRS2.$().length + oDRS3.$().length, 3, "Before destroy DateRangeSelection is available");
		oDRS1.destroy();
		oDRS2.destroy();
		oDRS3.destroy();
		assert.strictEqual(oDRS1.$().length + oDRS2.$().length + oDRS3.$().length, 0, "DateRangeSelection is destroyed");
	});

	//BCP: 1770061639
	QUnit.test("Single date validity", function(assert) {
		//arrange, act
		var oDateRangeSelection = new DateRangeSelection({
				displayFormat: "dd.MM.yyyy",
				displayFormatType: CalendarType.Gregorian
			}),
			oDate = oDateRangeSelection._parseValue("12.04.2017 - ");

		//assert
		assert.ok(oDate[0], "the first value is successfully parsed");
		assert.ok(!oDate[1], "the second value does not exist");

		//act
		oDate = oDateRangeSelection._parseValue("12.04.2017 -");

		//assert
		assert.ok(oDate[0], "the first value is successfully parsed");
		assert.ok(!oDate[1], "the second value does not exist");

		//act
		oDate = oDateRangeSelection._parseValue("12.04.2017 ");

		//assert
		assert.ok(oDate[0], "the first value is successfully parsed");
		assert.ok(!oDate[1], "the second value does not exist");

		//act
		oDate = oDateRangeSelection._parseValue("12.04.2017");

		//assert
		assert.ok(oDate[0], "the first value is successfully parsed");
		assert.ok(!oDate[1], "the second value does not exist");

		//clean
		oDateRangeSelection.destroy();
	});

	//BCP: 1870496053
	QUnit.test("parsing undefined value doesn't throw error", function(assert) {
		//arrange, act
		var oDateRangeSelection = new DateRangeSelection({
				displayFormat: "dd.MM.yyyy",
				displayFormatType: CalendarType.Gregorian
			}),
			oDate;
		// act
		try {
			oDate = oDateRangeSelection._parseValue();
			//assert
			assert.equal(1, 1, "The control doesn't throw error when the added date range is undefined");
			assert.ok(!oDate[0], "the first value does not exist");
			assert.ok(!oDate[1], "the second value does not exist");
		} catch (e) {
			assert.equal(1, 0, "Throws an error " + e.stack);
		}

		//clean
		oDateRangeSelection.destroy();
	});

	QUnit.test("using all types of dashes as a delimiter when empty string is passed to delimiter property", function(assert) {
		//arrange
		var oDateRangeSelection = new DateRangeSelection({
				displayFormat: "dd.MM.yyyy",
				displayFormatType: CalendarType.Gregorian,
				delimiter:'',
				dateValue: UI5Date.getInstance(2019,0,17),
				secondDateValue: UI5Date.getInstance(2019,0,18)
			}),
			aDates;

		// act
		aDates = oDateRangeSelection._splitValueByDelimiter("17.01.2019 " + String.fromCharCode(45) + " 18.01.2019");
		//assert
		assert.notEqual(aDates[0], null, "Using hyphen(45) as delimiter: The first value exists");
		assert.notEqual(aDates[1], undefined, "Using dash 45 as delimiter: The second value exists");

		// act
		aDates = oDateRangeSelection._splitValueByDelimiter("17.01.2019 " + String.fromCharCode(8211) + " 18.01.2019");
		//assert
		assert.notEqual(aDates[0], null, "Using endash(8211) as delimiter: The first value exists");
		assert.notEqual(aDates[1], undefined, "Using dash 8211 as delimiter: The second value exists");

		// act
		aDates = oDateRangeSelection._splitValueByDelimiter("17.01.2019 " + String.fromCharCode(8212) + " 18.01.2019");
		//assert
		assert.notEqual(aDates[0], null, "Using emdash(8212) as delimiter: The first value exists");
		assert.notEqual(aDates[1], undefined, "Using dash 8212 as delimiter: The second value exists");

		// act
		aDates = oDateRangeSelection._splitValueByDelimiter("17.01.2019");
		//assert
		assert.notEqual(aDates[0], null, "Passing only one date without a delimiter: The first value exists");
		assert.ok(!aDates[1], "Passing only one date without a delimiter: The second value does not exist");

		// act
		aDates = oDateRangeSelection._splitValueByDelimiter("");
		//assert
		assert.ok(Array.isArray(aDates), "Passing an empty string as a value: The returned value is an array");
		assert.equal(aDates.length, 0, "Passing an empty string as a value: The returned array is empty");

		//clean
		oDateRangeSelection.destroy();
	});

	QUnit.test("Using the same delimiter and separator for the date components", function(assert) {
		//arrange
		const oFirstDate = UI5Date.getInstance(2019, 1, 17);
		const oSecondDate = UI5Date.getInstance(2019, 1, 18);
		const sFirstDate = `${oFirstDate.getDate()}-${oFirstDate.getMonth() + 1}-${oFirstDate.getFullYear()}`;
		const sSecondDate = `${oSecondDate.getDate()}-${oSecondDate.getMonth() + 1}-${oSecondDate.getFullYear()}`;
		const oDateRangeSelection = new DateRangeSelection({
				displayFormat: "dd-MM-yyyy",
				displayFormatType: CalendarType.Gregorian,
				delimiter:'-',
				dateValue: UI5Date.getInstance(2019,0,17),
				secondDateValue: UI5Date.getInstance(2019,0,18)
			});
		let aDates;

		// act
		aDates = oDateRangeSelection._splitValueByDelimiter(sFirstDate + String.fromCharCode(45) + sSecondDate);
		//assert
		assert.strictEqual(aDates.length, 6, "When the same symbol is used as both the delimiter and separator, an array of all the date components is obtained");

		// act
		aDates = oDateRangeSelection._parseValue(sFirstDate + String.fromCharCode(45) + sSecondDate);

		//assert
		assert.strictEqual(aDates.length, 2, "When the same symbol is used as both the delimiter and separator, the array contains only two dates");
		assert.ok(CalendarDate.fromLocalJSDate(oFirstDate).isSame(CalendarDate.fromLocalJSDate(aDates[0]), "The first date is correctly parsed"));
		assert.ok(CalendarDate.fromLocalJSDate(oSecondDate).isSame(CalendarDate.fromLocalJSDate(aDates[1]), "The second date is correctly parsed"));

		//clean
		oDateRangeSelection.destroy();
	});

	QUnit.test("Correct selection when submitting only one date.", function(assert) {
		//arrange
		const oFirstDate = UI5Date.getInstance(2022, 10, 1);
		const sFirstDate = `Nov 1, 2022`;
		const oDateRangeSelection = new DateRangeSelection({
				displayFormat: "MMM d, yyyy",
				displayFormatType: CalendarType.Gregorian,
				delimiter:'-',
				value: "Nov 1, 2022"
			});
		let aDates;

		// act
		aDates = oDateRangeSelection._splitValueByDelimiter(sFirstDate);
		//assert
		assert.strictEqual(aDates.length, 3, "");

		// act
		aDates = oDateRangeSelection._parseValue(sFirstDate);

		//assert
		assert.strictEqual(aDates.length, 2, "When a date is submitted, it is expected to be broken down into three components.");
		assert.ok(CalendarDate.fromLocalJSDate(oFirstDate).isSame(CalendarDate.fromLocalJSDate(aDates[0]), "The first date is correctly parsed"));
		assert.notOk(aDates[1], "The second date does not exist");

		//clean
		oDateRangeSelection.destroy();
	});

	QUnit.test("weekNumberSelect applies new selection", async function(assert) {
		// Arrange
		var oDateRangeSelection = new DateRangeSelection({
				dateValue: UI5Date.getInstance(2014,1,2),
				secondDateValue: UI5Date.getInstance(2014,1,18)
			}).placeAt("qunit-fixture"),
			oStartDate = UI5Date.getInstance(2014, 1, 16),
			oEndDate = UI5Date.getInstance(2014, 1, 22);
		await nextUIUpdate();

		// Act
		oDateRangeSelection.toggleOpen();
		oDateRangeSelection._getCalendar().fireWeekNumberSelect({
			weekNumber: 8,
			weekDays: new DateTypeRange({
				startDate: oStartDate,
				endDate: oEndDate
			})
		});
		await nextUIUpdate();

		// Assert
		assert.equal(oDateRangeSelection.getDateValue().getTime(), oStartDate.getTime(), "dateValue is at the beginning of the week");
		assert.equal(oDateRangeSelection.getSecondDateValue().getTime(), oEndDate.getTime(), "secondDateValue is at the end of the week");

		// Clean
		oDateRangeSelection.destroy();
	});

	QUnit.module("Keyboard Interaction", {
		beforeEach: async function() {
			this.oDRS = new DateRangeSelection("DRS4", {
				delimiter : "@",
				displayFormat: "yyyy/MM/dd",
				dateValue: UI5Date.getInstance(2014, 2, 16),
				secondDateValue: UI5Date.getInstance(2014, 2, 27)
			});
			this.oFakeEvent = {
				target: {
					id: this.oDRS.getId() + "-inner",
					which: KeyCodes.PAGE_UP
				},
				preventDefault: function() {}
			};
			this.fnIncreaseDateSpy = sinon.spy(this.oDRS, "_increaseDate");
			this.fnFireChangeEventSpy = sinon.spy(this.oDRS, "fireChangeEvent");

			this.oDRS.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oDRS.destroy();
		}
	});

	QUnit.test("Change date range with keyboard handlng when 'secondDateValue' isn't set", function(assert) {
		// prepare
		var oSpyLogError = this.spy(Log, "error");

		this.oDRS.setSecondDateValue(null);
		this.oDRS._$input.cursorPos(0);

		// act
		this.oDRS.onsappageup(this.oFakeEvent);

		// assert
		assert.ok(oSpyLogError.notCalled, "Error is not logged");
	});

	QUnit.test("Change date with keyboard when 'value' binding with type is used", async function(assert) {
		// prepare
		var oTestStartDate = UI5Date.getInstance(2022, 10, 10, 10, 15, 10),
			oTestEndDate = UI5Date.getInstance(2022, 10, 15, 10, 15, 10),
			oModel = new JSONModel({
				start: oTestStartDate,
				end: oTestEndDate
			}),
			oDRS = new DateRangeSelection({
				value: {
					type: new DateInterval({format: "yMEd"}),
					parts: [
						{ path: "/start" },
						{ path: "/end" }
					]
				}
			}),
			oFakeEvent = {
				target: {
					id: oDRS.getId() + "-inner",
					which: KeyCodes.PAGE_UP
				},
				preventDefault: function() {}
			};
		oDRS.setModel(oModel);
		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();
		oDRS._$input.cursorPos(15);

		// act
		oDRS.onsappageup(oFakeEvent);

		// assert
		assert.equal(oDRS.getDateValue().getDate(), oTestStartDate.getDate() + 1, "Date is incremented");

		// clean
		oDRS.destroy();
	});

	QUnit.test("Change date with page up key when 'date' value isn't set", function(assert) {
		// prepare
		this.oDRS.setDateValue(null);
		this.oDRS._$input.cursorPos(0);

		// act
		this.oDRS.onsappageup(this.oFakeEvent);

		// assert
		assert.ok(this.fnFireChangeEventSpy.notCalled, "fireChangeEvent was not called");
	});

	QUnit.test("Change date day with page up key", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(11);

		// act
		this.oDRS.onsappageup(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(1, "day"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/17 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/17 @ 2014/03/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), UI5Date.getInstance(2014, 2, 17).getTime(), "PageUp: dateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/17 @ 2014/03/27", "PageUp: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change first date day with page down key", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(11);

		// act
		this.oDRS.onsappagedown(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(-1, "day"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/15 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/15 @ 2014/03/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), UI5Date.getInstance(2014, 2, 15).getTime(), "PageDown: dateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/15 @ 2014/03/27", "PageDown: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change first date month with page up + shift keys", function(assert) {
		// prepare
		this.oFakeEvent.shiftKey = true;
		this.oDRS._$input.cursorPos(11);

		// act
		this.oDRS.onsappageupmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(1, "month"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/04/16 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/04/16 @ 2014/03/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), UI5Date.getInstance(2014, 3, 16).getTime(), "PageUp: dateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/04/16 @ 2014/03/27", "PageUp: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change first date month with page down + shift keys", function(assert) {
		// prepare
		this.oFakeEvent.shiftKey = true;
		this.oDRS._$input.cursorPos(11);

		// act
		this.oDRS.onsappagedownmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(-1, "month"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/02/16 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/02/16 @ 2014/03/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), UI5Date.getInstance(2014, 1, 16).getTime(), "PageDown: dateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/02/16 @ 2014/03/27", "PageDown: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change first date year with page up + shift + ctrl keys", function(assert) {
		// prepare
		this.oFakeEvent.shiftKey = true;
		this.oFakeEvent.ctrlKey = true;
		this.oDRS._$input.cursorPos(11);

		// act
		this.oDRS.onsappageupmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(1, "year"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2015/03/16 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2015/03/16 @ 2014/03/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), UI5Date.getInstance(2015, 2, 16).getTime(), "PageUp: dateValue set");
		assert.equal(this.oDRS._$input.val(), "2015/03/16 @ 2014/03/27", "PageUp: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change first date year with page down + shift + ctrl keys", function(assert) {
		// prepare
		this.oFakeEvent.shiftKey = true;
		this.oFakeEvent.ctrlKey = true;
		this.oDRS._$input.cursorPos(11);

		// act
		this.oDRS.onsappagedownmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(-1, "year"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2013/03/16 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2013/03/16 @ 2014/03/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), UI5Date.getInstance(2013, 2, 16).getTime(), "PageDown: dateValue set");
		assert.equal(this.oDRS._$input.val(), "2013/03/16 @ 2014/03/27", "PageDown: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change second date day with page up key", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(12);

		// act
		this.oDRS.onsappageup(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(1, "day"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2014/03/28", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2014/03/28", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), UI5Date.getInstance(2014, 2, 28).getTime(), "PageUp: secondDateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/16 @ 2014/03/28", "PageUp: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change second date day with page down key", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(12);

		// act
		this.oDRS.onsappagedown(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(-1, "day"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2014/03/26", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2014/03/26", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), UI5Date.getInstance(2014, 2, 26).getTime(), "PageDown: secondDateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/16 @ 2014/03/26", "PageDown: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change second date month with page up + shift keys", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(12);
		this.oFakeEvent.shiftKey = true;

		// act
		this.oDRS.onsappageupmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(1, "month"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2014/04/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2014/04/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), UI5Date.getInstance(2014, 3, 27).getTime(), "PageUp: secondDateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/16 @ 2014/04/27", "PageUp: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change second date month with page down + shift keys", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(12);
		this.oFakeEvent.shiftKey = true;

		// act
		this.oDRS.onsappagedownmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(-1, "month"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2014/02/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2014/02/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), UI5Date.getInstance(2014, 1, 27).getTime(), "PageDown: secondDateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/16 @ 2014/02/27", "PageDown: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change second date year with page up + shift + ctrl keys", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(12);
		this.oFakeEvent.shiftKey = true;
		this.oFakeEvent.ctrlKey = true;

		// act
		this.oDRS.onsappageupmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(1, "year"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2015/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2015/03/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), UI5Date.getInstance(2015, 2, 27).getTime(), "PageUp: secondDateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/16 @ 2015/03/27", "PageUp: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change second date year with page down + shift + ctrl keys", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(12);
		this.oFakeEvent.shiftKey = true;
		this.oFakeEvent.ctrlKey = true;

		// act
		this.oDRS.onsappagedownmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(-1, "year"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2013/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2013/03/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), UI5Date.getInstance(2013, 2, 27).getTime(), "PageDown: secondDateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/16 @ 2013/03/27", "PageDown: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change first date month with page up + shift key when current day dosen't exist in the next month", function(assert) {
		// prepare
		this.oDRS.setDateValue(UI5Date.getInstance(2014, 0, 31));
		this.oDRS._$input.cursorPos(11);
		this.oFakeEvent.shiftKey = true;

		// act
		this.oDRS.onsappageupmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(1, "month"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/02/28 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/02/28 @ 2014/03/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), UI5Date.getInstance(2014, 1, 28).getTime(), "PageUp: DateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/02/28 @ 2014/03/27", "PageUp: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change first date year with page down + shift key when current day dosen't exist in the next year (leep year)", function(assert) {
		// prepare
		this.oDRS.setDateValue(UI5Date.getInstance(2020, 1, 29));
		this.oDRS.setSecondDateValue(UI5Date.getInstance(2020, 2, 27));
		this.oDRS._$input.cursorPos(11);
		this.oFakeEvent.shiftKey = true;
		this.oFakeEvent.ctrlKey = true;

		// act
		this.oDRS.onsappagedownmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateSpy.calledOnce, "_increaseDate was called once");
		assert.ok(this.fnIncreaseDateSpy.calledWithExactly(-1, "year"), "_increaseDate called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2019/02/28 @ 2020/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2019/02/28 @ 2020/03/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), UI5Date.getInstance(2019, 1, 28).getTime(), "PageDown: DateValue set");
		assert.equal(this.oDRS._$input.val(), "2019/02/28 @ 2020/03/27", "PageDown: Value in external format displayed");

		//cleanup
	});

	QUnit.test("onsapescape: closes popup and restores previous value without firing change", async function(assert) {
		// Arrange
		var oDRS = new DateRangeSelection({
				value: "2014/03/16 - 2014/03/27"
			});
		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();

		// open the popover/calendar
		qutils.triggerEvent("click", oDRS.getId() + "-icon");
		await nextUIUpdate();

		assert.ok(oDRS._oPopup && oDRS._oPopup.isOpen && oDRS._oPopup.isOpen(), "Popup opened");

		// simulate user editing the input
		oDRS._$input.val("invalid change").trigger("input");

		// spy on change firing
		var fnFireChangeSpy = this.spy(oDRS, "fireChange");

		// Act - press Escape
		qutils.triggerKeydown(oDRS._oPopup.getFocusDomRef(), KeyCodes.ESCAPE);

		await nextUIUpdate();

		// Assert
		assert.ok(!oDRS._oPopup.isOpen(), "Popup closed after Escape");
		assert.strictEqual(oDRS.getValue(), "2014/03/16 - 2014/03/27", "Original value restored after Escape");
		assert.ok(fnFireChangeSpy.notCalled, "fireChange was not called on Escape");

		// Cleanup
		oDRS.destroy();
	});

	QUnit.test("onsapescape: closes dialog containing DateRangeSelection", async function(assert) {
		// Arrange
		var oEvent = {
			preventDefault: this.spy(),
			setMarked: function() {}
		},
		model = new JSONModel({
			startDate: "",
			endDate: ""
		}),
		oDRS = new DateRangeSelection({
			value: {
				type: new DateInterval({format: "yMEd"}),
				parts: [
					{ path: "/startDate" },
					{ path: "/endDate" }
				]
			}
		}),
		oDialog = new Dialog({
			content: [ oDRS ]
		}),
		oButton = new Button({
			text: "Open Dialog",
			press: function () {
				oDialog.open();
			}
		});
		oDialog.setModel(model);
		oButton.placeAt("qunit-fixture");
		await nextUIUpdate();

		// open the dialog
		qutils.triggerKeydown(oButton.getFocusDomRef(), KeyCodes.ENTER);
		oDRS._$input.focus();

		// Act - press Escape
		qutils.triggerKeydown(oDRS._$input, KeyCodes.ESCAPE);
		oDRS.onsapescape(oEvent);

		await nextUIUpdate();

		// Assert
		assert.equal(oEvent.preventDefault.callCount, 0, "PreventDefault is not called");

		// Cleanup
		oDRS.destroy();
		oButton.destroy();
		oDialog.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("aria-roledescription", async function (assert) {
		var oDRS = new DateRangeSelection(),
			sRoledescription = Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_DATERANGEINPUT");

		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(oDRS._$input.attr("aria-roledescription"), sRoledescription, "Input's DateRange type is indicated in aria-roledescription");

		oDRS.destroy();
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oInput = new DateRangeSelection({
			value: "Value",
			tooltip: "Tooltip",
			placeholder: "Placeholder",
			delimiter: "@"
		});

		assert.ok(!!oInput.getAccessibilityInfo, "DateRangeSelection has a getAccessibilityInfo function");
		var oInfo = oInput.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oInput.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_DATERANGEINPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oInput.setValue("");
		oInput.setEnabled(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Placeholder", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setEnabled(true);
		oInput.setEditable(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setDisplayFormat("yyyy-MM-dd");
		oInput.setValue("2014-03-26@2014-03-27");
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "2014-03-26 @ 2014-03-27", "Description");
		oInput.destroy();
	});

	QUnit.test("Default senatic accessible role gets used", function(assert) {
		// Prepare
		var oDRS = new DateRangeSelection();

		// Assert
		assert.strictEqual(oDRS.getRenderer().getAriaRole() , "", "The role attribute is empty");
	});

	QUnit.test("Dialog accessible name", async function(assert) {
		// Prepare
		var oLabel = new Label({labelFor: "DRS-for"}),
			oDRS = new DateRangeSelection("DRS-for"),
			sAriaLabelledbyText = Library.getResourceBundleFor("sap.m").getText("DATERANGESELECTION_POPOVER_ACCESSIBLE_NAME", [oLabel.getText()]),
			sLabelId;

		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		qutils.triggerEvent("click", "DRS-for-icon");
		await nextUIUpdate();
		sLabelId = oDRS._oPopup.getDomRef().getAttribute("aria-labelledby");

		// Assert
		assert.strictEqual(Element.getElementById(sLabelId).getDomRef().textContent, sAriaLabelledbyText, "The dialog has the correct accessible name");

		oDRS.destroy();
	});

	QUnit.test("Month range dialog accessible name", async function(assert) {
		// Prepare
		var oLabel = new Label({labelFor: "DRS1-for"}),
			oDRS = new DateRangeSelection("DRS1-for", {
				displayFormat: "MM/yyyy"
			}),
			sAriaLabelledbyText = Library.getResourceBundleFor("sap.m").getText("DATERANGESELECTION_MONTH_POPOVER_ACCESSIBLE_NAME", [oLabel.getText()]),
			sLabelId;

		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		qutils.triggerEvent("click", "DRS1-for-icon");
		await nextUIUpdate();
		sLabelId = oDRS._oPopup.getDomRef().getAttribute("aria-labelledby");

		// Assert
		assert.strictEqual(Element.getElementById(sLabelId).getDomRef().textContent, sAriaLabelledbyText, "The dialog has the correct accessible name");

		oDRS.destroy();
	});

	QUnit.test("Year range dialog accessible name", async function(assert) {
		// Prepare
		var oLabel = new Label({labelFor: "DRS2-for"}),
			oDRS = new DateRangeSelection("DRS2-for", {
				displayFormat: "yyyy"
			}),
			sAriaLabelledbyText = Library.getResourceBundleFor("sap.m").getText("DATERANGESELECTION_YEAR_POPOVER_ACCESSIBLE_NAME", [oLabel.getText()]),
			sLabelId;

		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		qutils.triggerEvent("click", "DRS2-for-icon");
		await nextUIUpdate();
		sLabelId = oDRS._oPopup.getDomRef().getAttribute("aria-labelledby");

		// Assert
		assert.strictEqual(Element.getElementById(sLabelId).getDomRef().textContent, sAriaLabelledbyText, "The dialog has the correct accessible name");

		oDRS.destroy();
	});

	QUnit.module("binding type DateInterval", {
		beforeEach: async function() {
			this.model = new JSONModel({
				"ShipName": "Titanic",
				"OrderDate": UI5Date.getInstance(2017,5,28),
				"ShippedDate": UI5Date.getInstance(2017,6,1)
			});

			this.modelUTCDates = new JSONModel({
				"ShipName": "Titanic",
				"OrderDate": UI5Date.getInstance(Date.UTC(2017,5,28)),
				"ShippedDate": UI5Date.getInstance(Date.UTC(2017,6,1))
			});

			this.sut = new DateRangeSelection();
			this.sut.setModel(this.model);
			this.sut.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function () {
			this.sut.destroy();
			this.sut = null;
			this.model = null;
		},
		getDefaultFormat: function() {
			return DateFormat.getDateInstance({
				style: "medium",
				interval: true
			}, new Locale(Formatting.getLanguageTag()));
		},
		getExpectedFormat: function (sFormat, bUTC) {
			return DateFormat.getDateInstance({
				format: sFormat,
				interval: true,
				UTC: bUTC
			}, new Locale(Formatting.getLanguageTag()));
		},
		getDefaultLocaleData: function() {
			var oLocale = new Locale(Formatting.getLanguageTag());
			return LocaleData.getInstance(oLocale);
		}
	});

	QUnit.test("oFormatOptions.format: yMEd", function(assert) {
		//arrange
		var expectedValue = this.getExpectedFormat("yMEd").format([
				this.sut.getModel().oData.OrderDate,
				this.sut.getModel().oData.ShippedDate
			]),
			expectedDatePattern = this.getDefaultLocaleData().getCustomDateTimePattern("yMEd"),
			expectedPlaceholder = expectedDatePattern + " - " + expectedDatePattern;

		//act
		this.sut.bindValue({
			parts:[{path:'/OrderDate'}, {path:'/ShippedDate'}],
			type: new DateInterval({format: "yMEd"})
		});

		//assert
		assert.equal(this.sut.getValue(), expectedValue, "value is correct");
		assert.equal(this.sut._getPlaceholder(), expectedPlaceholder, "placeholder is correct");
	});

	QUnit.test("oFormatOptions.format: yMEd, UTC:true", function(assert) {
		//arrange
		var oOrderDateUTCModel, oShippedDateUTCModel,
			oOrderDateLocalDate, oShippedDateLocalDate;

		this.sut.setModel(this.modelUTCDates);
		var expectedValue = this.getExpectedFormat("yMEd", true).format([
				this.sut.getModel().oData.OrderDate,
				this.sut.getModel().oData.ShippedDate
			]),
			expectedDatePattern = this.getDefaultLocaleData().getCustomDateTimePattern("yMEd"),
			expectedPlaceholder = expectedDatePattern + " - " + expectedDatePattern;

		//act
		this.sut.bindValue({
			parts:[{path:'/OrderDate'}, {path:'/ShippedDate'}],
			type: 'sap.ui.model.type.DateInterval',
			formatOptions: {format: "yMEd", UTC: true}
		});

		//assert
		assert.equal(this.sut.getValue(), expectedValue, "value is correct");
		oOrderDateUTCModel = this.sut.getModel().getProperty("/OrderDate");
		oOrderDateLocalDate = UI5Date.getInstance(oOrderDateUTCModel.getUTCFullYear(), oOrderDateUTCModel.getUTCMonth(),
			oOrderDateUTCModel.getUTCDate(), oOrderDateUTCModel.getUTCHours(), oOrderDateUTCModel.getUTCMinutes(), oOrderDateUTCModel.getUTCSeconds());

		oShippedDateUTCModel = this.sut.getModel().getProperty("/ShippedDate");
		oShippedDateLocalDate = UI5Date.getInstance(oShippedDateUTCModel.getUTCFullYear(), oShippedDateUTCModel.getUTCMonth(),
			oShippedDateUTCModel.getUTCDate(), 23, 59, 59);

		assert.equal(this.sut.getDateValue().toString(), oOrderDateLocalDate.toString(), "dateValue should be always a local date");
		assert.equal(this.sut.getSecondDateValue().toString(), oShippedDateLocalDate.toString(), "secondDateValue should be always a local date");
		assert.equal(this.sut._getPlaceholder(), expectedPlaceholder, "placeholder is correct");

	});

	QUnit.test("no format options", function(assert) {
		//arrange
		var expectedValue = this.getDefaultFormat().format([
				this.sut.getModel().oData.OrderDate,
				this.sut.getModel().oData.ShippedDate
			]),

			expectedPlaceholder = this.getDefaultFormat().getPlaceholderText();

		//act
		this.sut.bindValue({
			parts:[{path:'/OrderDate'}, {path:'/ShippedDate'}],
			type: 'sap.ui.model.type.DateInterval'
		});

		//assert
		assert.equal(this.sut.getValue(), expectedValue, "value is correct");
		assert.equal(this.sut._getPlaceholder(), expectedPlaceholder, "placeholder is correct");
	});

	QUnit.test("Binding with OData initial loading(oFormatOptions.format: yMEd, UTC:true)", function(assert) {
		//Arrange
		var done = assert.async();

		TestUtils.useFakeServer(sinon.sandbox.create(),
			"sap/m/qunit/data/datetime", {
				"/sap/opu/odata/sap/ZUI5_EDM_TYPES/$metadata" : {
					source : "metadataV2.xml"
				},
				"/sap/opu/odata/sap/ZUI5_EDM_TYPES/EdmTypesCollection(ID='1')" : {
					source : "EdmTypesV2.json"
				}
			});

		var oModelV2 = new ODataModel({
			serviceUrl : "/sap/opu/odata/sap/ZUI5_EDM_TYPES/",
			useBatch : false
		});

		//Act
		XMLView.create({
			definition: sMyxml
		}).then(function(view) {
			view.setModel(oModelV2)
				.placeAt("qunit-fixture");

			oModelV2.attachRequestCompleted(function () {
				var oDateModelUTC, oDate2UTCModel,
					oDateLocalDate, oDate2Localdate;

				oDateModelUTC = oModelV2.getProperty("/EdmTypesCollection('1')/TravelStartDate");
				/*Time part is cut off by the sap.ui.model.type.DateInterval when DateRangeSelection.setValue is called*/
				oDateLocalDate = UI5Date.getInstance(oDateModelUTC.getUTCFullYear(), oDateModelUTC.getUTCMonth(), oDateModelUTC.getUTCDate());

				oDate2UTCModel = oModelV2.getProperty("/EdmTypesCollection('1')/TravelEndDate");
				oDate2Localdate = UI5Date.getInstance(oDate2UTCModel.getUTCFullYear(), oDate2UTCModel.getUTCMonth(), oDate2UTCModel.getUTCDate(),
					23, 59, 59, 999);

				var oSut = view.byId("drs_odata");

				//Assert
				//char code \u2009 is a thin space (introduced with CLDR version 43), \u2013 is a dash
				assert.equal(oSut._$input.val(), "Sat, 12/23/2017\u2009\u2013\u2009Mon, 1/1/2018", oSut._$input.val() + " is correct");
				assert.equal(oSut.getDateValue().toString(), oDateLocalDate.toString(), "dateValue should be always a local date");
				assert.equal(oSut.getSecondDateValue().toString(), oDate2Localdate.toString(), "secondDateValue should be always a local date");
				done();
			});
		});
	});

	QUnit.test("Binding with OData when user picks a new date rangeoFormatOptions.format: yMEd, UTC:true", function(assert) {
		//Arrange
		var done = assert.async();

		TestUtils.useFakeServer(sinon.sandbox.create(),
			"sap/m/qunit/data/datetime", {
				"/sap/opu/odata/sap/ZUI5_EDM_TYPES/$metadata": {
					source: "metadataV2.xml"
				},
				"/sap/opu/odata/sap/ZUI5_EDM_TYPES/EdmTypesCollection(ID='1')": {
					source: "EdmTypesV2.json"
				}
		});

		var oModelV2 = new ODataModel({
			serviceUrl: "/sap/opu/odata/sap/ZUI5_EDM_TYPES/",
			useBatch: false
		});

		XMLView.create({
			definition: sMyxml
		}).then(function(view) {
			view.setModel(oModelV2).placeAt("qunit-fixture");

			oModelV2.attachRequestCompleted(async function () {
				var oDRS = view.byId('drs_odata'),
					oCalendar,
					oDateInterval;

				//Act
				oDRS.$().find(".sapUiIcon").trigger("click"); //to open the calendar popoup
				await nextUIUpdate();
				//Simulate the user has selected 10 - 20 Dec 2017.
				oCalendar = oDRS._oPopup.getContent()[1];
				var $EventTarget1 = oCalendar.$().find("[data-sap-day='20171210']"),
					$EventTarget2 = oCalendar.$().find("[data-sap-day='20171220']"),
					oEvent1 = { clientX: 100, clientY: 100, target: $EventTarget1.children().get(0) },
					oEvent2 = { clientX: 100, clientY: 100, target: $EventTarget2.children().get(0) },
					oMouseDownEvent1 = jQuery.Event("mousedown", oEvent1),
					oMouseUpEvent1 = jQuery.Event("mouseup", oEvent1),
					oMouseDownEvent2 = jQuery.Event("mousedown", oEvent2),
					oMouseUpEvent2 = jQuery.Event("mouseup", oEvent2);

				$EventTarget1.trigger(oMouseDownEvent1).trigger(oMouseUpEvent1);
				$EventTarget2.trigger(oMouseDownEvent2).trigger(oMouseUpEvent2);

				oDateInterval = oDRS.getBinding("value").getType();

				//Assert
				assert.equal(oDRS.getDateValue().toString(), UI5Date.getInstance(2017, 11, 10).toString(),
					"dateValue corresponds to the chosen by the end user date range in local time");
				assert.equal(oDRS.getSecondDateValue().toString(), UI5Date.getInstance(2017, 11, 20, 23, 59, 59, 999).toString(),
					"secondDateValue corresponds to the chosen by the end user date range in local time");

				assert.equal(oDRS.getValue(), oDateInterval.formatValue([
						UI5Date.getInstance(Date.UTC(2017, 11, 10)),
						UI5Date.getInstance(Date.UTC(2017, 11, 20))], "string"),
					"Value corresponds to the chosen by the end user range");

				//Clean up
				oDRS._oPopup.close();
				done();
			});
		});
	});

	QUnit.test("Binded value is not accepted if it's not from the correct type", async function(assert) {
		//prepare
		var oModel = new JSONModel([
			{ value: "02.02.2019-03.03.2019" }
		]),
			oDSR4 = new DateRangeSelection({
				value: {
					path: "value",
					type: new DateInterval()
				}
			}).placeAt('qunit-fixture');

		oDSR4.setModel(oModel);
		await nextUIUpdate();

		//act
		var aDates = oDSR4._parseValue("123");

		//assert
		assert.ok(!aDates[0], "The value is not of the right type so it's not accepted &" +
			"handled from the catch block");

		//cleanup
		oDSR4.destroy();
	});

	QUnit.test("Binded value is not parsed when its value is empty string", async function(assert) {
		var oModel = new JSONModel([
				{ value: "02.02.2019-03.03.2019" }
			]),
			oDSR4 = new DateRangeSelection({
				value: {
					path: "value",
					type: new DateInterval({UTC: true})
				}
			}).placeAt('qunit-fixture');

		oDSR4.setModel(oModel);
		await nextUIUpdate();

		//act
		oDSR4._getInputValue();

		//assert
		assert.ok(true, "_getInputValue doesn't throw an exception");

		//cleanup
		oDSR4.destroy();
	});

	QUnit.test("value binding with timestamps", async function(assert) {
		var oTestStartDate = UI5Date.getInstance(2022, 10, 10),
			oTestEndDate = UI5Date.getInstance(2022,10, 15 );

		var oModel = new JSONModel({
				start: oTestStartDate.getTime(),
				end: oTestEndDate.getTime()
			}),
			oDRS = new DateRangeSelection({
				value: {
					type: new DateInterval({source: {pattern: "timestamp"}}),
					parts: [
							{ path: "/start" },
							{ path: "/end" }
					]
				}
			}),
			oNormalizeResult,
			aParseResult,
			//char code \u2009 is a thin space (introduced with CLDR version 43), \u2013 is a dash
			sDateRange = "Nov 10, 2022\u2009\u2013\u2009Nov 15, 2022";

		oDRS.setModel(oModel);
		oDRS.placeAt('qunit-fixture');
		await nextUIUpdate();

		oNormalizeResult = oDRS._normalizeDateValue(oModel.getData().start);
		aParseResult = oDRS._parseValue(sDateRange);

		//assert
		assert.strictEqual(typeof oNormalizeResult, "object", "the value returned by _normalizeDateValue is of type object");
		assert.strictEqual(oNormalizeResult.getTime(), oModel.getData().start, "the date returned by _normalizeDateValue is equal to the date given as timestamp");

		assert.strictEqual(oDRS._formatValue(oDRS.getDateValue(), oDRS.getSecondDateValue()), sDateRange, "the value returned by _formatValue method is correct");
		assert.strictEqual(aParseResult[0], oDRS.getDateValue().getTime(), "the first date returned by _parseValue method is correct");
		assert.strictEqual(aParseResult[1], oDRS.getSecondDateValue().getTime(), "the second date returned by _parseValue method is correct");

		//cleanup
		oDRS.destroy();
	});

	QUnit.test("value binding with strings", async function(assert) {

		var oModel = new JSONModel({
				start: '2022-11-11',
				end: '2022-11-16'
			}),
			oDRS = new DateRangeSelection({
				value: {
					type: new DateInterval({
						source: {
							pattern: "yyyy-MM-dd"
						}
					}),
					parts: [
							{ path: "/start" },
							{ path: "/end" }
					]
				}
			}),
			oSpy;

		oDRS.setModel(oModel);
		oDRS.placeAt('qunit-fixture');
		await nextUIUpdate();

		// act
		oSpy = this.spy(oDRS, "_normalizeDateValue");
		oDRS.onChange();

		//assert
		assert.ok(true, "DateRangeSelection doesn't throw an exception");
		assert.strictEqual(oSpy.callCount, 2, "_normalizeDateValue method is called twice when onChange method is called");

		//cleanup
		oDRS._normalizeDateValue.restore();
		oDRS.destroy();
	});

	QUnit.module("API");

	QUnit.test("setMinDate when dateValue & secondDateValue do not match the new min date", async function (assert) {
		var oDateValue = UI5Date.getInstance(2017, 0, 1),
			oNewMinDate = UI5Date.getInstance(2018, 0, 1),
			oSut = new DateRangeSelection({
				dateValue: oDateValue,
				secondDateValue: oDateValue,
				displayFormat: "yyyyMMdd",
				delimiter: "-"
			}),
			sExpectedErrorMsg1 = "dateValue " + oSut.getDateValue().toString() + "(value=20170101 - 20170101) does " +
				"not match min/max date range(" + oNewMinDate.toString() + " - " + oDefaultMaxDate.toString() + "). " +
				"App. developers should take care to maintain dateValue/value accordingly.",
			sExpectedErrorMsg2 = "secondDateValue " + oSut.getSecondDateValue().toString() + "(value=20170101 - 20170101) " +
				"does not match min/max date range(" + oNewMinDate.toString() + " - " + oDefaultMaxDate.toString() + "). " +
				"App. developers should take care to maintain secondDateValue/value accordingly.",
			oSpySetProperty = this.spy(oSut, "setProperty"),
			oSpyLogError = this.spy(Log, "error");

		oSut.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		oSut.setMinDate(oNewMinDate);
		await nextUIUpdate();

		//Assert
		assert.equal(oSpySetProperty.withArgs("dateValue").callCount, 0, ".. should not update the property <dateValue>");
		assert.equal(oSpySetProperty.withArgs("secondDateValue").callCount, 0, ".. should not update the property <secondDateValue>");
		assert.equal(oSpySetProperty.withArgs("value").callCount, 0, ".. should not update the property <value>");
		assert.equal(oSpyLogError.callCount, 2, "..should log error messages in the console");
		oSpyLogError.callCount && assert.equal(oSpyLogError.getCall(0).args[0], sExpectedErrorMsg1,
			".. with concrete 1st message text");
		oSpyLogError.callCount && oSpyLogError.callCount > 1 && assert.equal(oSpyLogError.getCall(1).args[0],
			sExpectedErrorMsg2, ".. with concrete 2nd message text");

		//Cleanup
		oSut.destroy();
	});

	QUnit.test("setMaxDate when dateValue & secondDateValue do not match the new max date", async function (assert) {
		var oDateValue = UI5Date.getInstance(2017, 0, 1),
			oNewMaxDate = UI5Date.getInstance(2016, 0, 1),
			oSut = new DateRangeSelection({
				dateValue: oDateValue,
				secondDateValue: oDateValue,
				displayFormat: "yyyyMMdd",
				delimiter: "-"
			}),
			sExpectedErrorMsg1 = "dateValue " + oSut.getDateValue().toString() + "(value=20170101 - 20170101) does" +
				" not match min/max date range(" + oDefaultMinDate.toString() + " - " +
				UI5Date.getInstance(oNewMaxDate.setHours(23, 59, 59)).toString() + "). App. developers should take care to " +
				"maintain dateValue/value accordingly.",
			sExpectedErrorMsg2 = "secondDateValue " + oSut.getSecondDateValue().toString() + "(value=20170101 - 20170101) does" +
				" not match min/max date range(" + oDefaultMinDate.toString() + " - " +
				UI5Date.getInstance(oNewMaxDate.setHours(23, 59, 59)).toString() + "). App. developers should take care to " +
				"maintain secondDateValue/value accordingly.",
			oSpySetProperty = this.spy(oSut, "setProperty"),
			oSpyLogError = this.spy(Log, "error");

		oSut.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		oSut.setMaxDate(oNewMaxDate);
		await nextUIUpdate();

		//Assert
		assert.equal(oSpySetProperty.withArgs("dateValue").callCount, 0, ".. should not update the property <dateValue>");
		assert.equal(oSpySetProperty.withArgs("secondDateValue").callCount, 0, ".. should not update the property <secondDateValue>");
		assert.equal(oSpySetProperty.withArgs("value").callCount, 0, ".. should not update the property <value>");
		assert.equal(oSpyLogError.callCount, 2, "..should log error messages in the console");
		oSpyLogError.callCount && assert.equal(oSpyLogError.getCall(0).args[0], sExpectedErrorMsg1,
			".. with concrete 1st message text");
		oSpyLogError.callCount && oSpyLogError.callCount > 1 && assert.equal(oSpyLogError.getCall(1).args[0],
			sExpectedErrorMsg2, ".. with concrete 2nd message text");

		//Cleanup
		oSpySetProperty.restore();
		oSpyLogError.restore();
		oSut.destroy();
	});

	QUnit.test("minDate and value in databinding scenario where the order of setters is not known",
			async function (assert) {
				/**
				 * value in second model is intentionally 20170120-20170130, in order to examine the scenario, where value
				 * setter is called before the minDate setter and a potentially valid value is not yet considered such,
				 * because the corresponding valid minDate didn't arrive yet.
				 */
				var oModelInvalid = new JSONModel({
							value: "20170101 - 20170120",
							minDate: UI5Date.getInstance(2018, 0, 1)
						}),
						oModelValid = new JSONModel({
							minDate: UI5Date.getInstance(2017, 0, 10),
							value: "20170120 - 20170130"
						}),
						oDP1 = new DateRangeSelection({
							displayFormat: "yyyyMMdd",
							delimiter: "-",
							value: "{/value}",
							minDate: "{/minDate}"
						}),
						oDP2 = new DateRangeSelection({
							displayFormat: "yyyyMMdd",
							delimiter: "-",
							minDate: "{/minDate}",
							value: "{/value}"
						}),
						sErrorMsgDP11 = "dateValue " + UI5Date.getInstance(2017, 0, 1).toString() + "(value=20170101 - 20170120)" +
							" does not match min/max date range(" + oModelInvalid.getProperty("/minDate").toString() +
							" - " + oDefaultMaxDate.toString() + "). App. developers should take care to maintain " +
							"dateValue/value accordingly.",
						sErrorMsgDP12 = "secondDateValue " + UI5Date.getInstance(2017, 0, 20).toString() + "(value=20170101 - 20170120)" +
							" does not match min/max date range(" + oModelInvalid.getProperty("/minDate").toString() +
							" - " + oDefaultMaxDate.toString() + "). App. developers should take care to maintain " +
							"secondDateValue/value accordingly.",
						sErrorMsgDP21 = sErrorMsgDP11,
						sErrorMsgDP22 = sErrorMsgDP12,
				oSpyLogError = this.spy(Log, "error");

				oDP1.setModel(oModelInvalid);
				oDP2.setModel(oModelInvalid);
				oDP1.placeAt("qunit-fixture");
				oDP2.placeAt("qunit-fixture");
				await nextUIUpdate();

				//Pre-Assert
				assert.equal(oDP1.getValue().toString(), "20170101 - 20170120",
						"Although outside min range, DP1 property <value> should be always set");
				assert.equal(oDP2.getValue().toString(), "20170101 - 20170120",
						"Although outside min range, DP2 property <value> should be always set");

				assert.equal(oDP1.getDateValue().toString(), UI5Date.getInstance(2017, 0, 1).toString(),
						"Although outside min range, DP1 property <value> should update the <dateValue> as well");
				assert.equal(oDP1.getSecondDateValue().toString(), UI5Date.getInstance(2017, 0, 20).toString(),
					"Although outside min range, DP1 property <value> should update the <secondDateValue> as well");

				assert.equal(oDP2.getDateValue().toString(), UI5Date.getInstance(2017, 0, 1).toString(),
					"Although outside min range, DP2 property <value> should update the <dateValue> as well");
				assert.equal(oDP2.getSecondDateValue().toString(), UI5Date.getInstance(2017, 0, 20).toString(),
					"Although outside min range, DP2 property <value> should update the <secondDateValue> as well");

				assert.equal(oSpyLogError.callCount, 4, "There should be error messages in the console");

				oSpyLogError.callCount && assert.equal(oSpyLogError.getCall(0).args[0], sErrorMsgDP11,
					"And the DP1 first message is with expected text");
				oSpyLogError.callCount > 1 && assert.equal(oSpyLogError.getCall(1).args[0], sErrorMsgDP12,
					"And the DP1 second message is with expected text");
				oSpyLogError.callCount > 2 && assert.equal(oSpyLogError.getCall(2).args[0], sErrorMsgDP21,
					"And the DP2 first message is with expected text");
				oSpyLogError.callCount > 3 && assert.equal(oSpyLogError.getCall(3).args[0], sErrorMsgDP22,
					"And the DP2 second message is with expected text");

				oSpyLogError.resetHistory();

				//Act - set a valid model
				oDP1.setModel(oModelValid);
				oDP2.setModel(oModelValid);
				await nextUIUpdate();

				//Assert
				assert.equal(oDP1.getValue().toString(), "20170120 - 20170130", "A valid DP1 property <value> should be always set");
				assert.equal(oDP2.getValue().toString(), "20170120 - 20170130", "A valid DP2 property <value> should be always set");

				assert.equal(oDP1.getDateValue().toString(), UI5Date.getInstance(2017, 0, 20).toString(),
					"A valid DP1 property <value> should update the <dateValue> as well");
				assert.equal(oDP2.getDateValue().toString(), UI5Date.getInstance(2017, 0, 20).toString(),
					"A valid DP2 property <value> should update the <dateValue> as well");

				assert.equal(oDP1.getSecondDateValue().toString(), UI5Date.getInstance(2017, 0, 30).toString(),
					"A valid DP1 property <value> should update the <secondDateValue> as well");
				assert.equal(oDP2.getSecondDateValue().toString(), UI5Date.getInstance(2017, 0, 30).toString(),
					"A valid DP2 property <value> should update the <secondDateValue> as well");

				assert.equal(oSpyLogError.callCount, 0, "There must be no error messages in the console");

				//Cleanup
				oSpyLogError.restore();
				oDP1.destroy();
				oDP2.destroy();
			}
	);

	QUnit.test("setValue,dateValue,secondDateValue to undefined", async function(assert) {
		var oDP1 = new DateRangeSelection({
					value: "20170101-20170120",
					displayFormat: "yyyyMMdd"
				}),
				oDP2  = new DateRangeSelection({
					value: "20170101-20170120",
					displayFormat: "yyyyMMdd"
				});

		oDP1.placeAt("qunit-fixture");
		oDP2.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		oDP1.setDateValue();
		oDP1.setSecondDateValue();
		oDP2.setValue();
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oDP1.getDateValue(), null, "Property <dateValue> should be null as it was just set to undefined");
		assert.strictEqual(oDP1.getSecondDateValue(), null, "Property <secondDateValue> should be null as it was just set to undefined");
		assert.strictEqual(oDP1.getValue(), "", "Property <value> should be empty, because property <dateValue> was just set to undefined");

		assert.strictEqual(oDP2.getValue(), "", "Property <value> should be empty, as it was just set to undefined");
		assert.strictEqual(oDP2.getDateValue(), null, "Property <dateValue> should be null, because property <value> was just set to undefiend");
		assert.strictEqual(oDP2.getSecondDateValue(), null, "Property <secondDateValue> should be null, because property <value> was just set to undefiend");

		//Cleanup
		oDP1.destroy();
		oDP2.destroy();
	});

	QUnit.test("_getInputValue", function (assert) {
		// Prepare
		var oDDR = new DateRangeSelection(),
			oGetInputValueSpy = this.spy(InputBase.prototype, "_getInputValue"),
			oGetFocusDomRefStub = this.stub(oDDR, "getFocusDomRef").callsFake(function () {
				return { value: undefined };
			});

		// Act
		oDDR.handleInputValueConcurrency("test");

		// Assert
		assert.ok(oGetInputValueSpy.calledOnce, "sap.m.InputBase.prototype._getInputValue called");

		// Clean
		oGetFocusDomRefStub.restore();
	});

	QUnit.test("Overwriting the user input with model updates will be prevented", async function (assert) {
		// Prepare
		var oDDR = new DateRangeSelection(),
			oHandleInputValueConcurrencySpy = this.spy(oDDR, "handleInputValueConcurrency");

		oDDR.setPreferUserInteraction(true);
		oDDR.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oDDR.setValue("test value");

		// Assert
		assert.ok(oHandleInputValueConcurrencySpy.calledOnce, "Model update is prevented");

		// Clean
		oDDR.destroy();
	});

	QUnit.module("placeholder with min/max date");

	QUnit.test("minDate and maxDate are passed to getPlaceholderText", function(assert) {
		// Arrange
		var oMinDate = UI5Date.getInstance(2021, 2, 5),
			oMaxDate = UI5Date.getInstance(2021, 2, 20),
			oDRS = new DateRangeSelection({
				minDate: oMinDate,
				maxDate: oMaxDate
			}),
			oSpy = this.spy(DateFormat.prototype, "getPlaceholderText");

		oDRS.placeAt("qunit-fixture");

		oDRS._getPlaceholder();

		// Assert
		assert.ok(oSpy.calledOnce, "getPlaceholderText is called");
		assert.strictEqual(oSpy.firstCall.args[0], oMinDate, "minDate is passed to getPlaceholderText");
		assert.strictEqual(oSpy.firstCall.args[1], oMaxDate, "maxDate is passed to getPlaceholderText");

		oDRS.destroy();
	});

	QUnit.module("Misc");

	QUnit.test("Date with seconds set to the last second of the maxDate is displayed", async function(assert) {
		var oDateRangeSelector = new DateRangeSelection({
			displayFormat: "yyyy-MM-dd",
			minDate: UI5Date.getInstance(2017, 0, 1, 0, 0, 0, 0),
			maxDate: UI5Date.getInstance(2017, 11, 31, 23, 59, 59, 100),
			dateValue: UI5Date.getInstance(2017, 0, 1, 0, 0, 0, 0),
			secondDateValue: UI5Date.getInstance(2017, 11, 31, 23, 59, 59, 100)
		});
		oDateRangeSelector.placeAt('qunit-fixture');
		await nextUIUpdate();

		assert.strictEqual(oDateRangeSelector.getValue(), "2017-01-01 - 2017-12-31", "Date range is set correctly");

		oDateRangeSelector.destroy();
	});

	// BCP: 1880065660
	QUnit.test("setDateValue with iframe's JS date object should set properly the date", function (assert) {
		// arrange
		var oDateRangeSelector = new DateRangeSelection(),
				iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		var oWindow = iframe.contentWindow;
		oWindow.dateObj = new oWindow.Date(2017, 11, 12);

		// act
		oDateRangeSelector.setDateValue(oWindow.dateObj);

		// assert
		assert.ok(true, "setDateValue did not throw an expection with date object from an iframe");

		// cleanup
		oDateRangeSelector.destroy();
		document.body.removeChild(iframe);
		iframe = null;
		oDateRangeSelector = null;
	});

	// BCP: 1880065660
	QUnit.test("setSecondDateValue with iframe's JS date object should set properly the date", function (assert) {
		// arrange
		var oDateRangeSelector = new DateRangeSelection(),
				iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		var oWindow = iframe.contentWindow;
		oWindow.dateObj = new oWindow.Date(2017, 11, 12);

		// act
		oDateRangeSelector.setSecondDateValue(oWindow.dateObj);

		// assert
		assert.ok(true, "setSecondDateValue did not throw an expection with date object from an iframe");

		// cleanup
		oDateRangeSelector.destroy();
		document.body.removeChild(iframe);
		iframe = null;
		oDateRangeSelector = null;
	});

	QUnit.test("_inPreferredUserInteraction", async function (assert) {
		// Prepare
		var oDRS = new DateRangeSelection(),
			oInPreferredUserInteractionSpy = this.spy(oDRS, "_inPreferredUserInteraction");

		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.ok(oInPreferredUserInteractionSpy.calledOnce, "Preferred interaction is handled during rendering");

		// Clean
		oDRS.destroy();
	});

	QUnit.test("CustomMonthPicker sets MonthPicker year", async function (assert) {
		// Prepare
		var oDRS = new DateRangeSelection("MMyyyy", {
				displayFormat: "MM/yyyy",
				dateValue: UI5Date.getInstance(2003, 6, 10),
				secondDateValue: UI5Date.getInstance(2003, 10, 27)
			}),
			oMP;

		oDRS.placeAt("qunit-fixture");
		await nextUIUpdate();

		oDRS.focus();
		qutils.triggerEvent("click", oDRS.getId() + "-icon"); // open the picker and initialize the calendar
		await nextUIUpdate();
		oMP = oDRS._getCalendar()._getMonthPicker();

		// Assert
		assert.strictEqual(oMP._iYear, 2003, "Proper year is set to the internal MonthPicker");

		// Clean
		oDRS.destroy();
	});

	// =========================================================
	// Zoom support
	// =========================================================

	QUnit.module("Zoom support", {
		beforeEach: async function() {
			this.oDRS = new DateRangeSelection({
				displayFormat: "dd.MM.yyyy",
				dateValue: UI5Date.getInstance(2026, 4, 1),
				secondDateValue: UI5Date.getInstance(2026, 4, 31),
				minDate: UI5Date.getInstance(2020, 0, 1),
				maxDate: UI5Date.getInstance(2030, 11, 31)
			});
			this.oDRS.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oSandbox = sinon.createSandbox();
		},
		afterEach: function() {
			this.oSandbox.restore();
			this.oDRS.destroy();
			this.oDRS = null;
		}
	});

	QUnit.test("_getOrCreateHighZoomInputs creates DateHighZoomInputs in range mode", function(assert) {
		var oInputs = this.oDRS._getOrCreateHighZoomInputs();
		assert.ok(oInputs.isA("sap.m.DateHighZoomInputs"), "returns DateHighZoomInputs");
		assert.strictEqual(oInputs.getMode(), "Range", "mode is 'Range'");
	});

	QUnit.test("_getOrCreateHighZoomInputs returns the same instance on repeated calls", function(assert) {
		var oFirst  = this.oDRS._getOrCreateHighZoomInputs();
		var oSecond = this.oDRS._getOrCreateHighZoomInputs();
		assert.strictEqual(oFirst, oSecond, "singleton — same instance returned");
	});

	QUnit.test("_switchPickerContent syncs start and end date to zoom inputs", async function(assert) {
		this.oDRS.toggleOpen(false);
		await nextUIUpdate();

		this.oDRS._bHighZoom = true;
		this.oDRS._switchPickerContent(true);
		await nextUIUpdate();

		var oInputs = this.oDRS._oHighZoomInputs;
		assert.ok(oInputs && oInputs.getVisible(), "DateHighZoomInputs visible");
		assert.ok(oInputs._oYearInputEnd, "End-date controls created (range mode rendered)");

		this.oDRS.toggleOpen(true);
	});

	QUnit.test("_handleOKButton at high zoom closes popup and commits both dates", async function(assert) {
		this.oDRS.toggleOpen(false);
		await nextUIUpdate();

		this.oDRS._bHighZoom = true;
		this.oDRS._switchPickerContent(true);
		await nextUIUpdate();

		// Sync to current values
		this.oDRS._oHighZoomInputs.syncStartDate();
		this.oDRS._oHighZoomInputs.syncEndDate(this.oDRS.getSecondDateValue());

		var bClosed = false;
		var fnOrig = this.oDRS._oPopup.close.bind(this.oDRS._oPopup);
		this.oDRS._oPopup.close = function() { bClosed = true; fnOrig(); };

		this.oDRS._handleOKButton();

		assert.ok(bClosed, "Popup closed after valid OK");

		var oDateValue = this.oDRS.getDateValue();
		var oSecondDateValue = this.oDRS.getSecondDateValue();
		assert.ok(oDateValue instanceof Date, "dateValue is a Date");
		assert.ok(oSecondDateValue instanceof Date, "secondDateValue is a Date");
		// Verify actual values match what was synced (May 1 and May 31, 2026)
		assert.strictEqual(oDateValue.getMonth(), 4, "dateValue month is May");
		assert.strictEqual(oDateValue.getDate(), 1, "dateValue day is 1");
		assert.strictEqual(oSecondDateValue.getMonth(), 4, "secondDateValue month is May");
		assert.strictEqual(oSecondDateValue.getDate(), 31, "secondDateValue day is 31");

		this.oDRS._oPopup.close = fnOrig;
	});

	QUnit.test("_handleOKButton keeps popup open when start validation fails", async function(assert) {
		this.oDRS.toggleOpen(false);
		await nextUIUpdate();

		this.oDRS._bHighZoom = true;
		this.oDRS._switchPickerContent(true);
		await nextUIUpdate();

		this.oSandbox.stub(this.oDRS._oHighZoomInputs, "validate").returns(false);

		var bClosed = false;
		this.oDRS._oPopup.close = function() { bClosed = true; };

		this.oDRS._handleOKButton();

		assert.notOk(bClosed, "Popup stays open when start validation fails");
	});

	QUnit.test("_handleOKButton keeps popup open when end validation fails", async function(assert) {
		this.oDRS.toggleOpen(false);
		await nextUIUpdate();

		this.oDRS._bHighZoom = true;
		this.oDRS._switchPickerContent(true);
		await nextUIUpdate();

		this.oSandbox.stub(this.oDRS._oHighZoomInputs, "validateEndDate").returns(false);

		var bClosed = false;
		this.oDRS._oPopup.close = function() { bClosed = true; };

		this.oDRS._handleOKButton();

		assert.notOk(bClosed, "Popup stays open when end validation fails");
	});

	QUnit.test("_handleCancelButton clears error states on both start and end fields", async function(assert) {
		this.oDRS.toggleOpen(false);
		await nextUIUpdate();

		this.oDRS._bHighZoom = true;
		this.oDRS._switchPickerContent(true);
		await nextUIUpdate();

		// Set errors
		this.oDRS._oHighZoomInputs.setFieldValueState("year", "Error", "out of range");
		this.oDRS._oHighZoomInputs.setFieldValueState("year", "Error", "out of range", /*bEnd=*/true);

		this.oDRS._handleCancelButton();

		assert.strictEqual(
			this.oDRS._oHighZoomInputs._oYearInput.getValueState(), "None",
			"start year error cleared"
		);
		assert.strictEqual(
			this.oDRS._oHighZoomInputs._oYearInputEnd.getValueState(), "None",
			"end year error cleared"
		);
	});

	QUnit.test("exit destroys _oHighZoomInputs", function(assert) {
		var oInputs = this.oDRS._getOrCreateHighZoomInputs();
		var bDestroyed = false;
		var fnOrig = oInputs.destroy.bind(oInputs);
		oInputs.destroy = function() { bDestroyed = true; fnOrig(); };
		this.oDRS.destroy();
		assert.ok(bDestroyed, "_oHighZoomInputs.destroy() called on exit");
		// afterEach will call destroy() again — UI5 ignores double-destroy on a destroyed control
	});

});