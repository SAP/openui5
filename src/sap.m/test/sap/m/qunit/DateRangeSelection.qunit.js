/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/format/DateFormat",
	"sap/ui/test/TestUtils",
	"sap/ui/model/json/JSONModel",
	"sap/m/DateRangeSelection",
	"sap/m/DatePicker",
	"jquery.sap.keycodes",
	"sap/ui/Device",
	"sap/ui/core/library",
	"sap/ui/core/LocaleData",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/dom/jquery/cursorPos",
	"jquery.sap.global"
], function(
	qutils,
	createAndAppendDiv,
	DateFormat,
	TestUtils,
	JSONModel,
	DateRangeSelection,
	DatePicker,
	jQuery,
	Device,
	coreLibrary,
	LocaleData,
	ODataModel,
	EventExtension
) {
	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// shortcut for sap.ui.core.CalendarType
	var CalendarType = coreLibrary.CalendarType;

	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");
	var sMyxml =
		"<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\" controllerName=\"my.own.controller\">" +
		"	<VBox>" +
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


	var Log = sap.ui.require("sap/base/Log");

	var JSONModel = sap.ui.model.json.JSONModel;
	var DateRangeSelection = sap.m.DateRangeSelection;

	var oDefaultMinDate = new DatePicker()._oMinDate;
	var oDefaultMaxDate = new DatePicker()._oMaxDate;

	//Preparing input dates for testing purposes:
	//From: April 1, 2014 0:00 (local time)
	var dateFrom = new Date(2014, 3, 1, 0, 0, 0);

	//To: April 10, 2014 0:00 (local time)
	var dateTo1 = new Date(2014, 3, 10, 0, 0, 0);

	//To: April 3, 2014 0:00 (local time)
	var dateTo2 = new Date(2014, 3, 3, 0, 0, 0);

	var bChange = false;
	var sValue = "";
	var bValid = false;
	var sId = "";

	function handleChange(oEvent){
			var oDRS = oEvent.oSource;
			sValue = oEvent.getParameter("newValue");
			bValid = oEvent.getParameter("valid");
			bChange = true;
			sId = oDRS.getId();
		}

	var oDRS1 = new DateRangeSelection("DRS1", {
		delimiter : "-",
		displayFormat : "dd.MM.yyyy"
	}).placeAt("uiArea1");

	var oDRS2 = new DateRangeSelection("DRS2", {
		width : "250px",
		delimiter : "-",
		displayFormat : "dd+MM+yyyy",
		from : dateFrom,
		to : dateTo1,
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

	QUnit.test("interval selection is correctly set to the YearPicker", function(assert) {
		// Prepare
		var oDRS = new DateRangeSelection({
				displayFormat: "yyyy"
			}).placeAt("qunit-fixture"),
			oYearPicker;

		sap.ui.getCore().applyChanges();

		// Act
		oDRS.toggleOpen();
		oYearPicker = oDRS._getCalendar()._getYearPicker();

		// Assert
		assert.ok(oYearPicker.getIntervalSelection(), "interval selection is set to 'true'");

		// Clean
		oDRS.destroy();
	});

	QUnit.module("Rendering");

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

	QUnit.test("Ok button gets enabled after a range is selected", function(assert) {
		// Prepare
		var oDPS = new DateRangeSelection({
				showFooter: true
			}),
			oDPSPopover,
			oCalendar;

			oDPS.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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

	QUnit.module("interaction");

	QUnit.test("min/max", function(assert) {
		var oNewMinDate = new Date(2014,0,1);
		var oNewMaxDate = new Date(2014,11,31);
		oDRS2.setMinDate(oNewMinDate);
		oDRS2.setMaxDate(oNewMaxDate);
		sap.ui.getCore().applyChanges();

		bChange = false;
		bValid = true;
		oDRS2.focus();
		jQuery("#DRS2").find("input").val("01+04+2013 - 10+04+2014");
		qutils.triggerKeyboardEvent("DRS2-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DRS2").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.ok(bChange, "DRS2: change event fired by typing invalid date");
		assert.ok(!bValid, "DRS2: invalid typed date is not valid");
		assert.ok(jQuery.sap.equal(oDRS2.getDateValue(), dateFrom), "DRS2: dateValue not changed by invalid typing");

		bChange = false;
		bValid = true;
		oDRS2.focus();
		jQuery("#DRS2").find("input").val("02+04+2014 - 11+04+2014");
		qutils.triggerKeyboardEvent("DRS2-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DRS2").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.ok(bChange, "DRS2: change event fired by typing valid date");
		assert.ok(bValid, "DRS2: valid typed date is valid");
		assert.ok(jQuery.sap.equal(oDRS2.getDateValue(), new Date(2014,3,2)), "DRS2: dateValue changed by valid typing");
		assert.ok(jQuery.sap.equal(oDRS2.getSecondDateValue(), new Date(2014,3,11,23,59,59,999)), "DRS2: secondDateValue changed by valid typing");

		bChange = false;
		bValid = true;
		oDRS2.focus();
		jQuery("#DRS2").find("input").val("01+04+2014 - 10+04+2015");
		qutils.triggerKeyboardEvent("DRS2-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DRS2").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.ok(bChange, "DRS2: change event fired by typing invalid date");
		assert.ok(!bValid, "DRS2: invalid typed date is not valid");
		assert.ok(jQuery.sap.equal(oDRS2.getDateValue(), new Date(2014,3,2)), "DRS2: dateValue not changed by invalid typing");
		assert.ok(jQuery.sap.equal(oDRS2.getSecondDateValue(), new Date(2014,3,11,23,59,59,999)), "DRS2: secondDateValue not changed by invalid typing");

		oDRS2.setMinDate();
		oDRS2.setMaxDate();
		sap.ui.getCore().applyChanges();

	});

	QUnit.test("When invalid date is set as value the control detects it and doesn't throw error", function(assert) {
		//Prepare
		var oDRS = new sap.m.DateRangeSelection("DRS", {
			value: "Invalid Date"
		});

		// Act
		oDRS.onChange();

		// Assert
		assert.ok(true, "Test does not throw");

		// Clean
		oDRS.destroy();
	});

	QUnit.test("interval selection is correctly set to the MonthPicker", function(assert) {
		// Prepare
		var oDRS = new DateRangeSelection({
				displayFormat: "yyyy-MM"
			}).placeAt("qunit-fixture"),
			oMonthPicker;

		sap.ui.getCore().applyChanges();

		// Act
		oDRS.toggleOpen();
		oMonthPicker = oDRS._getCalendar()._getMonthPicker();

		// Assert
		assert.ok(oMonthPicker.getIntervalSelection(), "interval selection is set to 'true'");

		// Clean
		oDRS.destroy();
	});

	QUnit.test("opening picker when current values are outside min/max range", function(assert) {
		//Prepare
		var oMinDate = new Date(2014,0,1),
			oDRS = new DateRangeSelection({
			minDate: oMinDate,
			maxDate: new Date(2014,11,31)
		});
		oDRS.setDateValue(new Date(2001, 0, 1));
		oDRS.setSecondDateValue(new Date(2001, 0, 10));
		oDRS.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Act - user opens the picker when current input value is outside min/max range
		oDRS.focus();
		qutils.triggerEvent("click", oDRS.getId() + "-icon");//to load the picker and initialize the calendar
		oDRS._fillDateRange();

		//Assert
		var oNewMinDateUTC = new Date(Date.UTC(oMinDate.getFullYear(), oMinDate.getMonth(), oMinDate.getDate()));
		var oFocusedDate = oDRS._oCalendar._getFocusedDate().toUTCJSDate();
		var aSelectedDates = oDRS._oCalendar.getSelectedDates();
		assert.equal(oFocusedDate.toString(), oNewMinDateUTC.toString(), "DRS: focused date equals min date " +
			"when current dateValue & secondDateValue  are out of min/max range");
		assert.equal(aSelectedDates[0].getStartDate(), undefined, "DRS: has empty selection's startDate when current dateValue & secondDateValue " +
			"are out of min/max range");

		assert.equal(aSelectedDates[0].getEndDate(), undefined, "DRS: has empty selection's endDate when current dateValue & secondDateValue " +
			"are out of min/max range");

		//Cleanup
		qutils.triggerEvent("click", oDRS.getId() + "-icon"); //closes picker
		oDRS.destroy();
	});

	QUnit.test("focused element after picker close", function(assert) {
		var bOrigTouch = Device.support.touch,
			bOrigDesktop = Device.system.desktop;

		// On a desktop (non-touch) device
		sap.ui.Device.support.touch = false;
		sap.ui.Device.system.desktop = true;
		qutils.triggerEvent("click", "DRS2-icon");
		jQuery("#DRS2-cal--Month0-20140406").focus();
		qutils.triggerKeyboardEvent("DRS2-cal--Month0-20140406", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DRS2-cal--Month0-20140409").focus();
		qutils.triggerKeyboardEvent("DRS2-cal--Month0-20140409", jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.equal(document.activeElement.id, "DRS2-inner", "Focus is on the input field after date selection");

		qutils.triggerEvent("click", "DRS2-icon");
		jQuery("#DRS2-cal").control(0).fireCancel();
		assert.equal(document.activeElement.id, "DRS2-inner", "Focus is on the input field after cancel");

		// On a touch device
		sap.ui.Device.support.touch = true;
		sap.ui.Device.system.desktop = false;
		qutils.triggerEvent("click", "DRS2-icon");
		jQuery("#DRS2-cal--Month0-20140406").focus();
		qutils.triggerKeyboardEvent("DRS2-cal--Month0-20140406", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DRS2-cal--Month0-20140409").focus();
		qutils.triggerKeyboardEvent("DRS2-cal--Month0-20140409", jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.notEqual(document.activeElement.id, "DRS2-inner", "Focus is NOT on the input field after date selection");

		qutils.triggerEvent("click", "DRS2-icon");
		jQuery("#DRS2-cal").control(0).fireCancel();
		assert.notEqual(document.activeElement.id, "DRS2-inner", "Focus is NOT on the input field after cancel");

		sap.ui.Device.system.desktop = bOrigDesktop;
		sap.ui.Device.support.touch = bOrigTouch;
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
				dateValue: new Date(2019,0,17),
				secondDateValue: new Date(2019,0,18)
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

	QUnit.module("Keyboard Interaction", {
		beforeEach: function() {
			this.oDRS = new DateRangeSelection("DRS4", {
				delimiter : "@",
				displayFormat: "yyyy/MM/dd",
				dateValue: new Date(2014, 2, 16),
				secondDateValue: new Date(2014, 2, 27)
			});
			this.oFakeEvent = {
				target: {
					id: this.oDRS.getId() + "-inner",
					which: jQuery.sap.KeyCodes.PAGE_UP
				},
				preventDefault: function() {}
			};
			this.fnIncreaseDateRangeSpy = sinon.spy(this.oDRS, "_increaseDateRange");
			this.fnFireChangeEventSpy = sinon.spy(this.oDRS, "fireChangeEvent");

			this.oDRS.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oDRS.destroy();
		}
	});

	QUnit.test("Change date with page up key when 'date' value is not set", function(assert) {
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
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(1, "day"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/17 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/17 @ 2014/03/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), new Date(2014, 2, 17).getTime(), "PageUp: dateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/17 @ 2014/03/27", "PageUp: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change first date day with page down key", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(11);

		// act
		this.oDRS.onsappagedown(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(-1, "day"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/15 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/15 @ 2014/03/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), new Date(2014, 2, 15).getTime(), "PageDown: dateValue set");
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
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(1, "month"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/04/16 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/04/16 @ 2014/03/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), new Date(2014, 3, 16).getTime(), "PageUp: dateValue set");
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
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(-1, "month"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/02/16 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/02/16 @ 2014/03/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), new Date(2014, 1, 16).getTime(), "PageDown: dateValue set");
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
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(1, "year"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2015/03/16 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2015/03/16 @ 2014/03/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), new Date(2015, 2, 16).getTime(), "PageUp: dateValue set");
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
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(-1, "year"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2013/03/16 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2013/03/16 @ 2014/03/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), new Date(2013, 2, 16).getTime(), "PageDown: dateValue set");
		assert.equal(this.oDRS._$input.val(), "2013/03/16 @ 2014/03/27", "PageDown: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change second date day with page up key", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(12);

		// act
		this.oDRS.onsappageup(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(1, "day"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2014/03/28", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2014/03/28", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), new Date(2014, 2, 28).getTime(), "PageUp: secondDateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/16 @ 2014/03/28", "PageUp: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change second date day with page down key", function(assert) {
		// prepare
		this.oDRS._$input.cursorPos(12);

		// act
		this.oDRS.onsappagedown(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(-1, "day"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2014/03/26", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2014/03/26", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), new Date(2014, 2, 26).getTime(), "PageDown: secondDateValue set");
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
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(1, "month"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2014/04/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2014/04/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), new Date(2014, 3, 27).getTime(), "PageUp: secondDateValue set");
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
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(-1, "month"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2014/02/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2014/02/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), new Date(2014, 1, 27).getTime(), "PageDown: secondDateValue set");
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
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(1, "year"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2015/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2015/03/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), new Date(2015, 2, 27).getTime(), "PageUp: secondDateValue set");
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
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(-1, "year"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/03/16 @ 2013/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/03/16 @ 2013/03/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getSecondDateValue().getTime(), new Date(2013, 2, 27).getTime(), "PageDown: secondDateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/03/16 @ 2013/03/27", "PageDown: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change first date month with page up + shift key when current day dosen't exist in the next month", function(assert) {
		// prepare
		this.oDRS.setDateValue(new Date(2014, 0, 31));
		this.oDRS._$input.cursorPos(11);
		this.oFakeEvent.shiftKey = true;

		// act
		this.oDRS.onsappageupmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(1, "month"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2014/02/28 @ 2014/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2014/02/28 @ 2014/03/27", "PageUp: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), new Date(2014, 1, 28).getTime(), "PageUp: DateValue set");
		assert.equal(this.oDRS._$input.val(), "2014/02/28 @ 2014/03/27", "PageUp: Value in external format displayed");

		//cleanup
	});

	QUnit.test("Change first date year with page down + shift key when current day dosen't exist in the next year (leep year)", function(assert) {
		// prepare
		this.oDRS.setDateValue(new Date(2020, 1, 29));
		this.oDRS.setSecondDateValue(new Date(2020, 2, 27));
		this.oDRS._$input.cursorPos(11);
		this.oFakeEvent.shiftKey = true;
		this.oFakeEvent.ctrlKey = true;

		// act
		this.oDRS.onsappagedownmodifiers(this.oFakeEvent);

		// assert
		assert.ok(this.fnIncreaseDateRangeSpy.calledOnce, "_increaseDateRange was called once");
		assert.ok(this.fnIncreaseDateRangeSpy.calledWithExactly(-1, "year"), "_increaseDateRange called with correct parameters");

		assert.ok(this.fnFireChangeEventSpy.calledOnce, "fireChangeEvent was called once");
		assert.ok(this.fnFireChangeEventSpy.calledWithExactly("2019/02/28 @ 2020/03/27", {valid: true}), "fireChangeEvent called with correct parameters");

		assert.equal(this.oDRS.getValue(), "2019/02/28 @ 2020/03/27", "PageDown: Value in internal format set");
		assert.equal(this.oDRS.getDateValue().getTime(), new Date(2019, 1, 28).getTime(), "PageDown: DateValue set");
		assert.equal(this.oDRS._$input.val(), "2019/02/28 @ 2020/03/27", "PageDown: Value in external format displayed");

		//cleanup
	});

	QUnit.module("Accessibility");

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
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATEINPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value  date", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oInput.setValue("");
		oInput.setEnabled(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "date", "Description");
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
		assert.strictEqual(oInfo.description, "2014-03-26 @ 2014-03-27  date", "Description");
		oInput.destroy();
	});

	QUnit.module("binding type DateInterval", {
		beforeEach: function() {
			this.model = new JSONModel({
				"ShipName": "Titanic",
				"OrderDate": new Date(2017,5,28),
				"ShippedDate": new Date(2017,6,1)
			});

			this.modelUTCDates = new JSONModel({
				"ShipName": "Titanic",
				"OrderDate": new Date(Date.UTC(2017,5,28)),
				"ShippedDate": new Date(Date.UTC(2017,6,1))
			});

			this.sut = new DateRangeSelection();
			this.sut.setModel(this.model);
			this.sut.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
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
			}, sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale());
		},
		getExpectedFormat: function (sFormat, bUTC) {
			return DateFormat.getDateInstance({
				format: sFormat,
				interval: true,
				UTC: bUTC
			}, sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale());
		},
		getDefaultLocaleData: function() {
			var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
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
			type: 'sap.ui.model.type.DateInterval',
			formatOptions: {format: "yMEd"}
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
		oOrderDateLocalDate = new Date(oOrderDateUTCModel.getUTCFullYear(), oOrderDateUTCModel.getUTCMonth(),
			oOrderDateUTCModel.getUTCDate(), oOrderDateUTCModel.getUTCHours(), oOrderDateUTCModel.getUTCMinutes(), oOrderDateUTCModel.getUTCSeconds());

		oShippedDateUTCModel = this.sut.getModel().getProperty("/ShippedDate");
		oShippedDateLocalDate = new Date(oShippedDateUTCModel.getUTCFullYear(), oShippedDateUTCModel.getUTCMonth(),
			oShippedDateUTCModel.getUTCDate(), oShippedDateUTCModel.getUTCHours(), oShippedDateUTCModel.getUTCMinutes(), oShippedDateUTCModel.getUTCSeconds());

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
			expectedDatePattern = this.getDefaultLocaleData().getDatePattern("medium"),
			expectedPlaceholder = expectedDatePattern + " - " + expectedDatePattern;

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
		sap.ui.controller("my.own.controller", {
			onInit: function() {
				this.getView().bindObject("/EdmTypesCollection(ID='1')");
			}
		});

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
		var view = sap.ui.view({ viewContent: sMyxml, type: ViewType.XML })
			.setModel(oModelV2)
			.placeAt("qunit-fixture");

		oModelV2.attachRequestCompleted(function () {
			var oDateModelUTC, oDate2UTCModel,
				oDateLocalDate, oDate2Localdate;

			oDateModelUTC = oModelV2.getProperty("/EdmTypesCollection('1')/TravelStartDate");
			/*Time part is cut off by the sap.ui.model.type.DateInterval when DateRangeSelection.setValue is called*/
			oDateLocalDate = new Date(oDateModelUTC.getUTCFullYear(), oDateModelUTC.getUTCMonth(), oDateModelUTC.getUTCDate());

			oDate2UTCModel = oModelV2.getProperty("/EdmTypesCollection('1')/TravelEndDate");
			oDate2Localdate = new Date(oDate2UTCModel.getUTCFullYear(), oDate2UTCModel.getUTCMonth(), oDate2UTCModel.getUTCDate());

			var oSut = view.byId("drs_odata");

			//Assert
			//char code 8211 is a dash
			assert.equal(oSut._$input.val(), "Sat, 12/23/2017 " + String.fromCharCode(8211) + " Mon, 1/1/2018", oSut._$input.val() + " is correct");
			assert.equal(oSut.getDateValue().toString(), oDateLocalDate.toString(), "dateValue should be always a local date");
			assert.equal(oSut.getSecondDateValue().toString(), oDate2Localdate.toString(), "secondDateValue should be always a local date");
			done();
		});
	});

	QUnit.test("Binding with OData when user picks a new date rangeoFormatOptions.format: yMEd, UTC:true", function(assert) {
		//Arrange
		var done = assert.async();
		sap.ui.controller("my.own.controller", {
			onInit: function () {
				this.getView().bindObject("/EdmTypesCollection(ID='1')");
			}
		});

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

		var view = sap.ui.view({
			viewContent: sMyxml,
			type: ViewType.XML
		}).setModel(oModelV2).placeAt("qunit-fixture");

		oModelV2.attachRequestCompleted(function () {
			var oDRS = view.byId('drs_odata'),
				oCalendar,
				oDateInterval;

			//Act
			oDRS.$().find(".sapUiIcon").click(); //to open the calendar popoup
			//Simulate the user has selected 10 - 20 Dec 2017.
			oCalendar = oDRS._oPopup.getContent()[0];
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
			assert.equal(oDRS.getDateValue().toString(), new Date(2017, 11, 10).toString(),
				"dateValue corresponds to the chosen by the end user date range in local time");
			assert.equal(oDRS.getSecondDateValue().toString(), new Date(2017, 11, 20, 23, 59, 59, 999).toString(),
				"secondDateValue corresponds to the chosen by the end user date range in local time");

			assert.equal(oDRS.getValue(), oDateInterval.formatValue([
					new Date(Date.UTC(2017, 11, 10)),
					new Date(Date.UTC(2017, 11, 20))], "string"),
				"Value corresponds to the chosen by the end user range");

			//Clean up
			oDRS._oPopup.close();
			done();
		});
	});

	QUnit.test("Binded value is not accepted if it's not from the correct type", function(assert) {
		//prepare
		var oModel = new sap.ui.model.json.JSONModel([
			{ value: "02.02.2019-03.03.2019" }
		]),
			oDSR4 = new sap.m.DateRangeSelection({
				value: {
					path: "value",
					type: "sap.ui.model.type.DateInterval"
				}
			}).placeAt('qunit-fixture');

		sap.ui.getCore().setModel(oModel);
		sap.ui.getCore().applyChanges();

		//act
		var aDates = oDSR4._parseValue("123");

		//assert
		assert.ok(!aDates[0], "The value is not of the right type so it's not accepted &" +
			"handled from the catch block");

		//cleanup
		oDSR4.destroy();
	});

	QUnit.module("API");

	QUnit.test("setMinDate when dateValue & secondDateValue do not match the new min date", function (assert) {
		assert.ok(Log, "Log module should be available");
		var oDateValue = new Date(2017, 0, 1),
			oNewMinDate = new Date(2018, 0, 1),
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
		sap.ui.getCore().applyChanges();

		//Act
		oSut.setMinDate(oNewMinDate);
		sap.ui.getCore().applyChanges();

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

	QUnit.test("setMaxDate when dateValue & secondDateValue do not match the new max date", function (assert) {
		assert.ok(Log, "Log module should be available");
		var oDateValue = new Date(2017, 0, 1),
			oNewMaxDate = new Date(2016, 0, 1),
			oSut = new DateRangeSelection({
				dateValue: oDateValue,
				secondDateValue: oDateValue,
				displayFormat: "yyyyMMdd",
				delimiter: "-"
			}),
			sExpectedErrorMsg1 = "dateValue " + oSut.getDateValue().toString() + "(value=20170101 - 20170101) does" +
				" not match min/max date range(" + oDefaultMinDate.toString() + " - " +
				new Date(oNewMaxDate.setHours(23, 59, 59)).toString() + "). App. developers should take care to " +
				"maintain dateValue/value accordingly.",
			sExpectedErrorMsg2 = "secondDateValue " + oSut.getSecondDateValue().toString() + "(value=20170101 - 20170101) does" +
				" not match min/max date range(" + oDefaultMinDate.toString() + " - " +
				new Date(oNewMaxDate.setHours(23, 59, 59)).toString() + "). App. developers should take care to " +
				"maintain secondDateValue/value accordingly.",
			oSpySetProperty = this.spy(oSut, "setProperty"),
			oSpyLogError = this.spy(Log, "error");

		oSut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Act
		oSut.setMaxDate(oNewMaxDate);
		sap.ui.getCore().applyChanges();

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
			function (assert) {
				assert.ok(Log, "Log module should be available");
				/**
				 * value in second model is intentionally 20170120-20170130, in order to examine the scenario, where value
				 * setter is called before the minDate setter and a potentially valid value is not yet considered such,
				 * because the corresponding valid minDate didn't arrive yet.
				 */
				var oModelInvalid = new JSONModel({
							value: "20170101 - 20170120",
							minDate: new Date(2018, 0, 1)
						}),
						oModelValid = new JSONModel({
							minDate: new Date(2017, 0, 10),
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
						sErrorMsgDP11 = "dateValue " + new Date(2017, 0, 1).toString() + "(value=20170101 - 20170120)" +
							" does not match min/max date range(" + oModelInvalid.getProperty("/minDate").toString() +
							" - " + oDefaultMaxDate.toString() + "). App. developers should take care to maintain " +
							"dateValue/value accordingly.",
						sErrorMsgDP12 = "secondDateValue " + new Date(2017, 0, 20).toString() + "(value=20170101 - 20170120)" +
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
				sap.ui.getCore().applyChanges();

				//Pre-Assert
				assert.equal(oDP1.getValue().toString(), "20170101 - 20170120",
						"Although outside min range, DP1 property <value> should be always set");
				assert.equal(oDP2.getValue().toString(), "20170101 - 20170120",
						"Although outside min range, DP2 property <value> should be always set");

				assert.equal(oDP1.getDateValue().toString(), new Date(2017, 0, 1).toString(),
						"Although outside min range, DP1 property <value> should update the <dateValue> as well");
				assert.equal(oDP1.getSecondDateValue().toString(), new Date(2017, 0, 20).toString(),
					"Although outside min range, DP1 property <value> should update the <secondDateValue> as well");

				assert.equal(oDP2.getDateValue().toString(), new Date(2017, 0, 1).toString(),
					"Although outside min range, DP2 property <value> should update the <dateValue> as well");
				assert.equal(oDP2.getSecondDateValue().toString(), new Date(2017, 0, 20).toString(),
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

				oSpyLogError.reset();

				//Act - set a valid model
				oDP1.setModel(oModelValid);
				oDP2.setModel(oModelValid);
				sap.ui.getCore().applyChanges();

				//Assert
				assert.equal(oDP1.getValue().toString(), "20170120 - 20170130", "A valid DP1 property <value> should be always set");
				assert.equal(oDP2.getValue().toString(), "20170120 - 20170130", "A valid DP2 property <value> should be always set");

				assert.equal(oDP1.getDateValue().toString(), new Date(2017, 0, 20).toString(),
					"A valid DP1 property <value> should update the <dateValue> as well");
				assert.equal(oDP2.getDateValue().toString(), new Date(2017, 0, 20).toString(),
					"A valid DP2 property <value> should update the <dateValue> as well");

				assert.equal(oDP1.getSecondDateValue().toString(), new Date(2017, 0, 30).toString(),
					"A valid DP1 property <value> should update the <secondDateValue> as well");
				assert.equal(oDP2.getSecondDateValue().toString(), new Date(2017, 0, 30).toString(),
					"A valid DP2 property <value> should update the <secondDateValue> as well");

				assert.equal(oSpyLogError.callCount, 0, "There must be no error messages in the console");

				//Cleanup
				oSpyLogError.restore();
				oDP1.destroy();
				oDP2.destroy();
			}
	);

	QUnit.test("setValue,dateValue,secondDateValue to undefined", function(assert) {
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
		sap.ui.getCore().applyChanges();

		//Act
		oDP1.setDateValue();
		oDP1.setSecondDateValue();
		oDP2.setValue();
		sap.ui.getCore().applyChanges();

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

	QUnit.module("Misc");

	QUnit.test("Date with seconds set to the last second of the maxDate is displayed", function(assert) {
		var oDateRangeSelector = new DateRangeSelection({
			displayFormat: "yyyy-MM-dd",
			minDate: new Date(2017, 0, 1, 0, 0, 0, 0),
			maxDate: new Date(2017, 11, 31, 23, 59, 59, 100),
			dateValue: new Date(2017, 0, 1, 0, 0, 0, 0),
			secondDateValue: new Date(2017, 11, 31, 23, 59, 59, 100)
		});
		oDateRangeSelector.placeAt('qunit-fixture');
		sap.ui.getCore().applyChanges();

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

	// BCP: 1880193676
	QUnit.test("For IE & Edge the input selection is cleared before opening the picker and restoring back when picker is closed", function(assert) {
		// Arrange
		var done = assert.async(),
			oBrowserStub = this.stub(Device, "browser", {msie: true}),
			oTouchStub = this.stub(Device, "support", {touch: false});

		this.clock = sinon.useFakeTimers();
		var oDateRangeSelection = new DateRangeSelection("DTP6", {
			dateValue: new Date()
		}).placeAt("uiArea2");
		sap.ui.getCore().applyChanges();

		oDateRangeSelection._$input.get(0).selectionStart = 3;
		oDateRangeSelection._$input.get(0).selectionEnd = 3;

		oDateRangeSelection.$().find(".sapUiIcon").click(); //simulate opening
		this.clock.tick(100);

		//Assert
		assert.equal(oDateRangeSelection._$input.get(0).selectionStart, 0, "selection start should be 0");
		assert.equal(oDateRangeSelection._$input.get(0).selectionEnd, 0, "selection end should be 0");

		//Act
		oDateRangeSelection._oPopup.close();

		setTimeout(function(){
			//Assert
			assert.equal(oDateRangeSelection._$input.get(0).selectionStart, 3, "selection start must be restored");
			assert.equal(oDateRangeSelection._$input.get(0).selectionEnd, 3, "selection end must be restored");

			//Cleanup
			oBrowserStub.restore();
			oTouchStub.restore();
			this.clock.restore();
			done();
		}.bind(this), 1000);

		this.clock.tick(1000);//"waits" for close popup animation to complete
	});

	// BCP: 1880193676
	QUnit.test("For IE & Edge the input selection is stored and cleared from _openPopup method (before opening the Popover)", function (assert) {
		// Arrange
		var fn = function () {},
			oBrowserStub = this.stub(Device, "browser", { msie: true }),
			oTouchStub = this.stub(Device, "support", {touch: false}),
			oDP = new DateRangeSelection(),
			oDPStoreInputSelectionSpy = this.spy(oDP, "_storeInputSelection");

		oDP._oPopup = {
			openBy: fn,
			isOpen: fn,
			_getPopup: function() {
				return { setAutoCloseAreas: fn, open: fn, isOpen: fn };
			}
		}; // simulate that there is a popup
		oDP.placeAt("uiArea2");
		sap.ui.getCore().applyChanges();

		// Act
		oDP._openPopup();

		// Arrange
		assert.equal(oDPStoreInputSelectionSpy.callCount, 1, "_storeInputSelection is called once on _openPopup");

		// Cleanup
		oBrowserStub.restore();
		oTouchStub.restore();
		oDPStoreInputSelectionSpy.restore();
		oDP.destroy();
	});
});