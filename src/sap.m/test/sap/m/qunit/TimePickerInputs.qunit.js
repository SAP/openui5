/*global QUnit, sinon */
sap.ui.define([
	"sap/m/TimePickerInputs",
	"sap/m/TimePickerInternals",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/core/date/UI5Date"
], function(TimePickerInputs, TimePickerInternals, KeyCodes, oCore, UI5Date) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function () {
			this.oTPI = new TimePickerInputs();

			this.oTPI.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oTPI.destroy();
			this.oTPI = null;
		}
	});

	QUnit.test("Call to setLocaleId sets right AM and PM values and regenerates the controls", function (assert) {
		var sExpectedAM = "AM",
			sExpectedPM = "PM",
			sLocale = "de_DE",
			oSetPropertySpy = this.spy(this.oTPI, "setProperty"),
			oSetupControlsSpy = this.spy(this.oTPI, "_createControls");

		this.oTPI.setLocaleId(sLocale);
		oCore.applyChanges();

		assert.equal(this.oTPI._sAM, sExpectedAM, "_sAM property should be set to proper locale AM");
		assert.equal(this.oTPI._sPM, sExpectedPM, "_sPM property should be set to proper locale PM");
		assert.equal(oSetPropertySpy.calledWithExactly("localeId", sLocale, true), true, "setProperty is called with right arguments");
		assert.ok(oSetupControlsSpy.called, "_createControls is called to regenerate the controls");
	});

	QUnit.test("Call to setDisplayFormat sets displayFormat and regenerates the controls", function (assert) {
		var sDisplayFormat = "medium",
			oSetPropertySpy = this.spy(this.oTPI, "setProperty"),
			oSetupControlsSpy = this.spy(this.oTPI, "_createControls");

		this.oTPI.setDisplayFormat(sDisplayFormat);
		oCore.applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("displayFormat", sDisplayFormat, true), true, "setProperty is called with right arguments");
		assert.ok(oSetupControlsSpy.called, "_createControls is called to regenerate the controls");
	});

	QUnit.test("Call to setMinutesStep sets minutesStep and regenerates the controls", function(assert) {
		var oSetPropertySpy = this.spy(this.oTPI, "setProperty"),
			oSetupControlsSpy = this.spy(this.oTPI, "_createControls"),
			iStep = 23;

		this.oTPI.setMinutesStep(iStep);
		oCore.applyChanges();

		assert.ok(oSetPropertySpy.calledWithExactly("minutesStep", iStep, true), "setProperty is called with right arguments");
		assert.ok(oSetupControlsSpy.called, "_createControls is called to regenerate the controls");
	});

	QUnit.test("Call to setSecondsStep sets secondsStep and regenerates the inputs", function(assert) {
		var oSetPropertySpy = this.spy(this.oTPI, "setProperty"),
				oSetupControlsSpy = this.spy(this.oTPI, "_createControls"),
				iStep = 23;

		this.oTPI.setSecondsStep(iStep);
		oCore.applyChanges();

		assert.ok(oSetPropertySpy.calledWithExactly("secondsStep", iStep, true), "setProperty is called with right arguments");
		assert.ok(oSetupControlsSpy.called, "_createControls is called to regenerate the controls");
	});

	QUnit.test("Call to setValue sets the value", function (assert) {
		var sValue = "15:16:17",
			oSetPropertySpy = this.spy(this.oTPI, "setProperty");

		this.oTPI.setValue(sValue);
		oCore.applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("value", sValue, true), true, "setProperty is called with right arguments");
	});

	QUnit.test("Call to setValue calls the _setTimeValues", function (assert) {
		var sValue = "15:16:17",
			sExpectedDate = UI5Date.getInstance(2017, 11, 17, 15, 16, 17), // year, month, day, hours, minutes, seconds
			oSetTimeValuesSpy = this.spy(this.oTPI, "_setTimeValues");

		this.stub(this.oTPI, "_parseValue").returns(sExpectedDate);

		this.oTPI.setValue(sValue);
		oCore.applyChanges();

		assert.equal(oSetTimeValuesSpy.calledWithExactly(sExpectedDate, false), true, "_setTimeValues is called with parsed date");
	});

	QUnit.test("Call to setValue with '24:00:00' sets the value", function (assert) {
		var sValue = "24:00:00",
				oSetPropertySpy = this.spy(this.oTPI, "setProperty");

		this.oTPI.setValueFormat("HH:mm:ss");
		this.oTPI.setValue(sValue);
		oCore.applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("value", sValue, true), true, "setProperty is called with right arguments");
	});

	QUnit.test("Call to setValue with value '24:00:00' calls the _setTimeValues", function (assert) {
		var sValue = "24:00:00",
				sExpectedDate = UI5Date.getInstance(2017, 11, 17, 0, 0, 0), // year, month, day, hours, minutes, seconds
				oSetTimeValuesSpy = this.spy(this.oTPI, "_setTimeValues");

		this.stub(this.oTPI, "_parseValue").returns(sExpectedDate);

		this.oTPI.setValueFormat("HH:mm:ss");
		this.oTPI.setValue(sValue);
		oCore.applyChanges();

		assert.equal(oSetTimeValuesSpy.calledWithExactly(sExpectedDate, true), true, "_setTimeValues is called with parsed date");
	});

/*
	QUnit.module("Events", {
		beforeEach: function () {
			this.oTPI = new TimePickerInputs();

			this.oTPI.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oTPI.destroy();
			this.oTPI = null;
		}
	});
*/
	QUnit.module("Internals", {
		beforeEach: function () {
			this.oTPI = new TimePickerInputs();

			this.oTPI.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oTPI.destroy();
			this.oTPI = null;
		}
	});

	QUnit.test("_setTimevalues properly set value to inputs when Date(2017, 7, 8, 11, 12, 13) date is used", function (assert) {
		var oHoursInput = this.oTPI._getHoursInput(),
			oMinutesInput = this.oTPI._getMinutesInput(),
			oSecondsInput = this.oTPI._getSecondsInput(),
			oHoursSetValue = this.spy(oHoursInput, "setValue"),
			oMinutesSetValue = this.spy(oMinutesInput, "setValue"),
			oSecondsSetValue = this.spy(oSecondsInput, "setValue");

		this.oTPI.setValueFormat("HH:mm:ss");
		this.oTPI._setTimeValues(UI5Date.getInstance(2017, 7, 8, 11, 12, 13), false);

		assert.ok(oHoursSetValue.calledWithExactly("11"), "Hours are properly set to 11");
		assert.ok(oMinutesSetValue.calledWithExactly("12"), "Minutes are properly set to 12");
		assert.ok(oSecondsSetValue.calledWithExactly("13"), "Seconds are properly set to 13");
	});

	QUnit.test("_setTimeValues properly enables Minutes and Seconds inputs when Date(2017, 7, 8, 11, 12, 13) date is used", function (assert) {
		var oMinutesInput = this.oTPI._getMinutesInput(),
			oSecondsInput = this.oTPI._getSecondsInput(),
			oMinutesSetEnabled = this.spy(oMinutesInput, "setEnabled"),
			oSecondsSetEnabled = this.spy(oSecondsInput, "setEnabled");

		this.oTPI.setValueFormat("HH:mm:ss");
		this.oTPI._setTimeValues(UI5Date.getInstance(2017, 7, 8, 11, 12, 13), false);

		assert.ok(oMinutesSetEnabled.calledWithExactly(true), "Minutes Input is enabled");
		assert.ok(oSecondsSetEnabled.calledWithExactly(true), "Seconds Input is enabled");
	});

	QUnit.test("_setTimeValues properly set value to Inputs when date value is marking the end of the day UI5Date.getInstance(2017, 7, 8, 0, 0, 0)", function (assert) {
		var oHoursInput = this.oTPI._getHoursInput(),
			oMinutesInput = this.oTPI._getMinutesInput(),
			oSecondsInput = this.oTPI._getSecondsInput(),
			oHoursSetValue = this.spy(oHoursInput, "setValue"),
			oMinutesSetValue = this.spy(oMinutesInput, "setValue"),
			oSecondsSetValue = this.spy(oSecondsInput, "setValue");

		this.oTPI.setValueFormat("HH:mm:ss");
		this.oTPI._setTimeValues(UI5Date.getInstance(2017, 7, 8, 0, 0, 0), true);

		assert.ok(oHoursSetValue.calledWithExactly("24"), "Hours are properly set to 24");
		assert.ok(oMinutesSetValue.calledWithExactly("00"), "Minutes are properly set to 0");
		assert.ok(oSecondsSetValue.calledWithExactly("00"), "Seconds are properly set to 0");
	});

	QUnit.test("_setTimeValues properly disables Minutes and Seconds Clock when value is marking the end of the day UI5Date.getInstance(2017, 7, 8, 0, 0, 0)", function (assert) {
		var oMinutesInput = this.oTPI._getMinutesInput(),
			oSecondsInput = this.oTPI._getSecondsInput(),
			oMinutesInputSetEnabled = this.spy(oMinutesInput, "setEnabled"),
			oSecondsInputSetEnabled = this.spy(oSecondsInput, "setEnabled");

		this.oTPI.setValueFormat("HH:mm:ss");
		this.oTPI._setTimeValues(UI5Date.getInstance(2017, 7, 8, 0, 0, 0), true);

		assert.ok(oMinutesInputSetEnabled.calledWithExactly(false), "Minutes Clock is disabled");
		assert.ok(oSecondsInputSetEnabled.calledWithExactly(false), "Seconds Clock is disabled");

	});

	QUnit.test("_checkStyle returns true for one of the predefined format names (short, medium, long or full)", function (assert) {
		var aValidStyles = ["short", "medium", "long", "full"];

		aValidStyles.forEach(function (sStyle) {
			assert.ok(this.oTPI._checkStyle(sStyle));
		}, this);
	});

	QUnit.test("_checkStyle returns false for not valid styles", function (assert) {
		var aValidStyles = ["s", "m", "notValid", "test"];

		aValidStyles.forEach(function (sStyle) {
			assert.ok(!this.oTPI._checkStyle(sStyle));
		}, this);
	});

	QUnit.test("_getDisplayFormatPattern should return displayFormat if not default format names (short, medium, long or full) are used ", function (assert) {
		var aDisplayFormats = ["HH:mm:ss", "hh:mm:ss", "mm:ss", "mm", "ss"];

		aDisplayFormats.forEach(function (sStyle) {
			this.oTPI.setDisplayFormat(sStyle);
			assert.equal(this.oTPI._getDisplayFormatPattern(sStyle), sStyle, "displayFormat is returned directly without modifications");
		}, this);
	});

	QUnit.test("_getDisplatFormatPattern should return local based pattern if default format names are used (short, medium, long or full)", function (assert) {
		var sExpectedResult = "HH:mm:ss a",
			aDisplayFormats = ["short", "medium", "long", "full"];

		this.stub(this.oTPI, "_getLocaleBasedPattern").returns(sExpectedResult);

		aDisplayFormats.forEach(function (sStyle) {
			this.oTPI.setDisplayFormat(sStyle);
			assert.equal(this.oTPI._getDisplayFormatPattern(sStyle), sExpectedResult, "displayFormat is returned directly without modifications");
		}, this);
	});

	QUnit.test("_getActiveInput returns the focused input", function (assert) {
		var aInputs = this.oTPI.getAggregation("_inputs");

		assert.equal(this.oTPI._getActiveInput(), 0, "first is focused");

		this.oTPI._switchInput(aInputs.length - 1);

		assert.equal(this.oTPI._getActiveInput(), aInputs.length - 1, "focused input returned properly");
	});

	QUnit.test("_getHoursInput should return null if format does not create Hours input", function (assert) {
		// arrange
		this.oTPI.setDisplayFormat("mm");

		// assert
		assert.equal(this.oTPI._getHoursInput(), null, "no Hours Input");
	});

	QUnit.test("_getHoursInput should return Input if format creates Hours input", function (assert) {
		// arrange
		this.oTPI.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPI._getHoursInput().isA("sap.m.Input"), "should be instance of sap.m.Input");
		assert.equal(this.oTPI._getHoursInput().getType().toLowerCase(), "number", "should be of type number");
		assert.ok(this.oTPI._getHoursInput().getId().indexOf("-inputH") !== -1, "id of the input should contain '-inputH'");
	});

	QUnit.test("_getMinutesInput should return null if format does not create Minutes input", function (assert) {
		// arrange
		this.oTPI.setDisplayFormat("hh");

		// assert
		assert.equal(this.oTPI._getMinutesInput(), null, "no Minutes Input");
	});

	QUnit.test("_getMinutesInput should return Input if format creates Minutes input", function (assert) {
		// arrange
		this.oTPI.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPI._getMinutesInput().isA("sap.m.Input"), "should be instance of sap.m.Input");
		assert.equal(this.oTPI._getMinutesInput().getType().toLowerCase(), "number", "should be of type number");
		assert.ok(this.oTPI._getMinutesInput().getId().indexOf("-inputM") !== -1, "id of the input should contain '-inputM'");
	});

	QUnit.test("_getSecondsInput should return null if format does not create Seconds input", function (assert) {
		// arrange
		this.oTPI.setDisplayFormat("hh");

		// assert
		assert.equal(this.oTPI._getSecondsInput(), null, "no Seconds Input");
	});

	QUnit.test("_getSecondsInput should return Input if format creates Seconds input", function (assert) {
		// arrange
		this.oTPI.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPI._getSecondsInput().isA("sap.m.Input"), "should be instance of sap.m.Input");
		assert.equal(this.oTPI._getSecondsInput().getType().toLowerCase(), "number", "should be of type number");
		assert.ok(this.oTPI._getSecondsInput().getId().indexOf("-inputS") !== -1, "id of the input should contain '-inputS'");
	});

	QUnit.test("_getFormatButton should return null if format does not create Format Segmented Button", function (assert) {
		// arrange
		this.oTPI.setDisplayFormat("hh");

		// assert
		assert.equal(this.oTPI._getFormatButton(), null, "no Format Segmented Button");
	});

	QUnit.test("_getFormatButton should return SegmentedButton if format creates Format Segmented Button", function (assert) {
		// arrange
		this.oTPI.setDisplayFormat("h:mm:ss a");

		// assert
		assert.ok(this.oTPI._getFormatButton().isA("sap.m.SegmentedButton"), "should be instance of sap.m.SegmentedButton");
		assert.ok(this.oTPI._getFormatButton().getId().indexOf("-format") !== -1, "id of the segmented button should contain -format");
	});

	QUnit.test("_isFormatSupport24 should return true if displayFormat contains HH or H", function (assert) {
		// arrange
		this.oTPI.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPI._isFormatSupport24(), "should return true if format contains HH");

		// arrange
		this.oTPI.setDisplayFormat("H:mm:ss");

		// assert
		assert.ok(this.oTPI._isFormatSupport24(), "should return true if format contains H");
	});

	QUnit.test("_isFormatSupport24 should return false if displayFormat not contains HH or H", function (assert) {
		// arrange
		this.oTPI.setDisplayFormat("hh:mm:ss");

		// assert
		assert.equal(this.oTPI._isFormatSupport24(), false, "should return false if format contains hh");

		// arrange
		this.oTPI.setDisplayFormat("h:mm:ss");

		// assert
		assert.equal(this.oTPI._isFormatSupport24(), false, "should return false if format contains h");

		// arrange
		this.oTPI.setDisplayFormat("mm:ss");

		// assert
		assert.equal(this.oTPI._isFormatSupport24(), false, "should return false if format not contains HH or H");
	});

	QUnit.test("_handleHoursChange enables minutes and seconds buttons and sets restored values to them", function (assert) {
		// arrange
		var iExpectedMinutes = 11,
			iExpectedSeconds = 12,
			oMinutesInput,
			oSecondsInput,
			oMinutesSetValue,
			oSecondsSetValue,
			oMinutesSetEnabled,
			oSecondsSetEnabled;

		this.oTPI.setSupport2400(true);
		this.oTPI._sMinutes = iExpectedMinutes;
		this.oTPI._sSeconds = iExpectedSeconds;

		oMinutesInput = this.oTPI._getMinutesInput().setEnabled(false);
		oSecondsInput = this.oTPI._getSecondsInput().setEnabled(false);
		oMinutesSetValue = this.spy(oMinutesInput, "setValue");
		oSecondsSetValue = this.spy(oSecondsInput, "setValue");
		oMinutesSetEnabled = this.spy(oMinutesInput, "setEnabled");
		oSecondsSetEnabled = this.spy(oSecondsInput, "setEnabled");

		// act
		this.oTPI._handleHoursChange({ getParameter: function() {} });

		// assert
		assert.ok(oMinutesSetEnabled.calledWithExactly(true), "Minutes input should be enabled");
		assert.ok(oMinutesSetValue.calledWithExactly(iExpectedMinutes), "Minutes input value should be set to " + iExpectedMinutes);
		assert.ok(oSecondsSetEnabled.calledWithExactly(true), "Seconds input should be enabled");
		assert.ok(oSecondsSetValue.calledWithExactly(iExpectedSeconds), "Seconds input value should be set to " + iExpectedSeconds);
	});

	QUnit.test("_handleHoursChange disables minutes and seconds Clock and sets 0 values them", function (assert) {
		var oMinutesInput,
			oSecondsInput,
			oMinutesSetValue,
			oSecondsSetValue,
			oMinutesSetEnabled,
			oSecondsSetEnabled;

		this.oTPI.setSupport2400(true);

		oMinutesInput = this.oTPI._getMinutesInput();
		oSecondsInput = this.oTPI._getSecondsInput();
		oMinutesSetValue = this.spy(oMinutesInput, "setValue");
		oSecondsSetValue = this.spy(oSecondsInput, "setValue");
		oMinutesSetEnabled = this.spy(oMinutesInput, "setEnabled");
		oSecondsSetEnabled = this.spy(oSecondsInput, "setEnabled");

		// act
		this.oTPI._handleHoursChange("24");

		assert.ok(oMinutesSetValue.calledWithExactly("00"), "Minutes are properly set to 00");
		assert.ok(oMinutesSetEnabled.calledWithExactly(false), "Minutes input is disabled");
		assert.ok(oSecondsSetValue.calledWithExactly("00"), "Seconds are properly set to 00");
		assert.ok(oSecondsSetEnabled.calledWithExactly(false), "Seconds input is disabled");
	});

	QUnit.test("_replaceZeroHoursWith24 should properly replace the hours part from the string", function (assert) {
		// Hours part is in the first part
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("00:00:00", 0, 0), "24:00:00"); // valueFormat is "HH:mm:ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("0:00:00", -1, 0), "24:00:00"); // valueFormat is "H:mm:ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("00:00:00", 3, 3), "00:24:00"); // valueFormat is "mm:HH:ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("00:0:00", -1, 3), "00:24:00"); // valueFormat is "mm:H:ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("00:00:00", 6, 6), "00:00:24"); // valueFormat is "mm:ss:HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("00:00:0", -1, 6), "00:00:24"); // valueFormat is "mm:ss:H", iIndexOfHH is -1, iIndexOfH is 6

		// Use Different separators than the ":" For example "-"

		// Hours part is in the first part
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("00-00-00", 0, 0), "24-00-00"); // valueFormat is "HH-mm-ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("0-00-00", -1, 0), "24-00-00"); // valueFormat is "H-mm-ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("00-00-00", 3, 3), "00-24-00"); // valueFormat is "mm-HH-ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("00-0-00", -1, 3), "00-24-00"); // valueFormat is "mm-H-ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("00-00-00", 6, 6), "00-00-24"); // valueFormat is "mm-ss-HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.equal(TimePickerInternals._replaceZeroHoursWith24("00-00-0", -1, 6), "00-00-24"); // valueFormat is "mm-ss-H", iIndexOfHH is -1, iIndexOfH is 6
	});

	QUnit.test("_replaceZeroHoursWith24 should properly replace the hours part from the string", function (assert) {
		// Hours part is in the first part
		assert.equal(TimePickerInternals._replace24HoursWithZero("24:00:00", 0, 0), "00:00:00"); // valueFormat is "HH:mm:ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.equal(TimePickerInternals._replace24HoursWithZero("24:00:00", -1, 0), "0:00:00"); // valueFormat is "H:mm:ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.equal(TimePickerInternals._replace24HoursWithZero("00:24:00", 3, 3), "00:00:00"); // valueFormat is "mm:HH:ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.equal(TimePickerInternals._replace24HoursWithZero("00:24:00", -1, 3), "00:0:00"); // valueFormat is "mm:H:ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.equal(TimePickerInternals._replace24HoursWithZero("00:00:24", 6, 6), "00:00:00"); // valueFormat is "mm:ss:HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.equal(TimePickerInternals._replace24HoursWithZero("00:00:24", -1, 6), "00:00:0"); // valueFormat is "mm:ss:H", iIndexOfHH is -1, iIndexOfH is 6

		// Use Different separators than the ":" For example "-"

		// Hours part is in the first part
		assert.equal(TimePickerInternals._replace24HoursWithZero("24-00-00", 0, 0), "00-00-00"); // valueFormat is "HH-mm-ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.equal(TimePickerInternals._replace24HoursWithZero("24-00-00", -1, 0), "0-00-00"); // valueFormat is "H-mm-ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.equal(TimePickerInternals._replace24HoursWithZero("00-24-00", 3, 3), "00-00-00"); // valueFormat is "mm-HH-ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.equal(TimePickerInternals._replace24HoursWithZero("00-24-00", -1, 3), "00-0-00"); // valueFormat is "mm-H-ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.equal(TimePickerInternals._replace24HoursWithZero("00-00-24", 6, 6), "00-00-00"); // valueFormat is "mm-ss-HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.equal(TimePickerInternals._replace24HoursWithZero("00-00-24", -1, 6), "00-00-0"); // valueFormat is "mm-ss-H", iIndexOfHH is -1, iIndexOfH is 6
	});

	QUnit.test("_isHoursValue24 should properly checks if hours value is 24", function (assert) {
		// Hours part is in the first part
		assert.ok(TimePickerInternals._isHoursValue24("24:00:00", 0, 0)); // valueFormat is "HH:mm:ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.ok(TimePickerInternals._isHoursValue24("24:00:00", -1, 0)); // valueFormat is "H:mm:ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.ok(TimePickerInternals._isHoursValue24("00:24:00", 3, 3)); // valueFormat is "mm:HH:ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.ok(TimePickerInternals._isHoursValue24("00:24:00", -1, 3)); // valueFormat is "mm:H:ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.ok(TimePickerInternals._isHoursValue24("00:00:24", 6, 6)); // valueFormat is "mm:ss:HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.ok(TimePickerInternals._isHoursValue24("00:00:24", -1, 6)); // valueFormat is "mm:ss:H", iIndexOfHH is -1, iIndexOfH is 6

		// Use Different separators than the ":" For example "-"

		// Hours part is in the first part
		assert.ok(TimePickerInternals._isHoursValue24("24-00-00", 0, 0)); // valueFormat is "HH-mm-ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.ok(TimePickerInternals._isHoursValue24("24-00-00", -1, 0)); // valueFormat is "H-mm-ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.ok(TimePickerInternals._isHoursValue24("00-24-00", 3, 3)); // valueFormat is "mm-HH-ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.ok(TimePickerInternals._isHoursValue24("00-24-00", -1, 3)); // valueFormat is "mm-H-ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.ok(TimePickerInternals._isHoursValue24("00-00-24", 6, 6)); // valueFormat is "mm-ss-HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.ok(TimePickerInternals._isHoursValue24("00-00-24", -1, 6)); // valueFormat is "mm-ss-H", iIndexOfHH is -1, iIndexOfH is 6
	});

	QUnit.test("_isHoursValue24 should properly checks if hours value is not 24", function (assert) {
		// Hours part is in the first part
		assert.ok(!TimePickerInternals._isHoursValue24("23:00:00", 0, 0)); // valueFormat is "HH:mm:ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.ok(!TimePickerInternals._isHoursValue24("23:00:00", -1, 0)); // valueFormat is "H:mm:ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.ok(!TimePickerInternals._isHoursValue24("00:23:00", 3, 3)); // valueFormat is "mm:HH:ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.ok(!TimePickerInternals._isHoursValue24("00:23:00", -1, 3)); // valueFormat is "mm:H:ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.ok(!TimePickerInternals._isHoursValue24("00:00:23", 6, 6)); // valueFormat is "mm:ss:HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.ok(!TimePickerInternals._isHoursValue24("00:00:23", -1, 6)); // valueFormat is "mm:ss:H", iIndexOfHH is -1, iIndexOfH is 6

		// Use Different separators than the ":" For example "-"

		// Hours part is in the first part
		assert.ok(!TimePickerInternals._isHoursValue24("23-00-00", 0, 0)); // valueFormat is "HH-mm-ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.ok(!TimePickerInternals._isHoursValue24("23-00-00", -1, 0)); // valueFormat is "H-mm-ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.ok(!TimePickerInternals._isHoursValue24("00-23-00", 3, 3)); // valueFormat is "mm-HH-ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.ok(!TimePickerInternals._isHoursValue24("00-23-00", -1, 3)); // valueFormat is "mm-H-ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.ok(!TimePickerInternals._isHoursValue24("00-00-23", 6, 6)); // valueFormat is "mm-ss-HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.ok(!TimePickerInternals._isHoursValue24("00-00-23", -1, 6)); // valueFormat is "mm-ss-H", iIndexOfHH is -1, iIndexOfH is 6
	});

	QUnit.module("Inputs", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.oTPI = new TimePickerInputs();

			this.oTPI.setValueFormat("HH:mm:ss");
			this.oTPI.setDisplayFormat("HH:mm:ss");
			this.oTPI._setTimeValues(UI5Date.getInstance(2017, 7, 8, 22, 58, 58));

			this.oTPI.placeAt("qunit-fixture");
			oCore.applyChanges();
			this.oFakeEvent = {
				target: {
					classList: {
						contains: function() {
							return false;
						}
					}
				},
				preventDefault: function() {
					return true;
				},
				srcControl: this.oTPI,
				which: 38, // arrow up
				altKey: false,
				metaKey: false,
				shiftKey: false,
				ctrlKey: false
			};
		},
		afterEach: function () {
			this.oTPI.destroy();
			this.oTPI = null;
		},
		fakeEvent: function fakeEventKey(vWhich, bAltKey, bMetaKey, bShiftKey, bCtrlKey) {
			if (typeof vWhich === "string") {
				this.oFakeEvent.key = vWhich;
				this.oFakeEvent.which = null;
			} else {
				this.oFakeEvent.which = vWhich;
				this.oFakeEvent.key = null;
			}
			this.oFakeEvent.altKey = bAltKey;
			this.oFakeEvent.metaKey = bMetaKey;
			this.oFakeEvent.shiftKey = bShiftKey;
			this.oFakeEvent.ctrlKey = bCtrlKey;
			return this.oFakeEvent;
		}
	});

	QUnit.test("Arrows actions (covers arrows and mousewheel) with min value", function (assert) {
		var oHoursInput = this.oTPI._getHoursInput(),
			oMinutesInput = this.oTPI._getMinutesInput(),
			oSecondsInput = this.oTPI._getSecondsInput(),
			oFinalDate;

		this.oTPI._setTimeValues(UI5Date.getInstance(2017, 7, 8, 1, 1, 1));

		oHoursInput = this.oTPI._getHoursInput();
		oMinutesInput = this.oTPI._getMinutesInput();
		oSecondsInput = this.oTPI._getSecondsInput();

			//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oHoursInput.getValue(), 0, "Arrow Down: Hours decreased by 1");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oHoursInput.getValue(), 0, "Arrow Down: Hours not decreased by 1, because reached min value");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oHoursInput.getValue(), 1, "Arrow Up: Hours increased by 1");

		//change to minutes input
		this.oTPI.onkeydown(this.fakeEvent(":"));
		oCore.applyChanges();

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oMinutesInput.getValue(), 0, "Arrow Down: Minutes decreased by 1");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oMinutesInput.getValue(), 0, "Arrow Down: Minutes not decreased by 1, because reached min value");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oMinutesInput.getValue(), 1, "Arrow Up: Minutes increased by 1");

		//change to seconds input
		this.oTPI.onkeydown(this.fakeEvent(":"));
		oCore.applyChanges();

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oSecondsInput.getValue(), 0, "Arrow Down: Seconds decreased by 1");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oSecondsInput.getValue(), 0, "Arrow Down: Second not decreased by 1, because reached min value");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oSecondsInput.getValue(), 1, "Arrow Up: Seconds increased by 1");

		oFinalDate = this.oTPI.getTimeValues();

		//assert
		assert.equal(oFinalDate.getHours(), 1, "Hours are set properly");
		assert.equal(oFinalDate.getMinutes(), 1, "Minutes are set properly");
		assert.equal(oFinalDate.getSeconds(), 1, "Seconds are set properly");


	});

	QUnit.test("Arrows actions (covers arrows and mousewheel) with max value", function (assert) {
		var oHoursInput = this.oTPI._getHoursInput(),
			oMinutesInput = this.oTPI._getMinutesInput(),
			oSecondsInput = this.oTPI._getSecondsInput(),
			oFinalDate;

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oHoursInput.getValue(), 23, "Arrow Up: Hours increased by 1");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oHoursInput.getValue(), 23, "Arrow Up: Hours not increased by 1, because reached max value");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oHoursInput.getValue(), 22, "Arrow Down: Hours decreased by 1");

		//change to minutes input
		this.oTPI.onkeydown(this.fakeEvent(":"));
		oCore.applyChanges();

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oMinutesInput.getValue(), 59, "Arrow Up: Minutes increased by 1");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oMinutesInput.getValue(), 59, "Arrow Up: Minutes not increased by 1, because reached max value");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oMinutesInput.getValue(), 58, "Arrow Down: Minutes decreased by 1, value is above min, max value is set");

		//change to seconds input
		this.oTPI.onkeydown(this.fakeEvent(":"));
		oCore.applyChanges();

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oSecondsInput.getValue(), 59, "Arrow Up: Seconds increased by 1");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oSecondsInput.getValue(), 59, "Arrow Up: Second not increased by 1, because reached max value");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oSecondsInput.getValue(), 58, "Arrow Down: Seconds decreased by 1, value is above min, max value is set");

		oFinalDate = this.oTPI.getTimeValues();

		//assert
		assert.equal(oFinalDate.getHours(), 22, "Hours are set properly");
		assert.equal(oFinalDate.getMinutes(), 58, "Minutes are set properly");
		assert.equal(oFinalDate.getSeconds(), 58, "Seconds are set properly");
	});

	QUnit.test("Direct input of two-digit numbers", function (assert) {
		var oFinalDate;

		this.oTPI.setValueFormat("hh:mm:ss a");
		this.oTPI.setDisplayFormat("hh:mm:ss a");
		this.oTPI._setTimeValues(UI5Date.getInstance(2017, 7, 8, 9, 10, 11));
		oCore.applyChanges();

		//act
		this.oTPI.onkeydown(this.fakeEvent("1"));
		this.oTPI.onkeydown(this.fakeEvent("1"));
		oCore.applyChanges();
		this.clock.tick(100);

		//assert
		assert.equal(this.oTPI._getHoursInput().getValue(), 11, "Hours are set properly");

		//act
		this.oTPI.onkeydown(this.fakeEvent("2"));
		this.oTPI.onkeydown(this.fakeEvent("2"));
		oCore.applyChanges();
		this.clock.tick(100);

		//assert
		assert.equal(this.oTPI._getMinutesInput().getValue(), 22, "Minutes are set properly");

		//act
		this.oTPI.onkeydown(this.fakeEvent("3"));
		this.oTPI.onkeydown(this.fakeEvent("3"));
		oCore.applyChanges();
		this.clock.tick(100);

		//assert
		assert.equal(this.oTPI._getSecondsInput().getValue(), 33, "Seconds are set properly");

		//act
		this.oTPI.onkeydown(this.fakeEvent(KeyCodes.P));
		oCore.applyChanges();
		this.clock.tick(100);

		//assert
		assert.equal(this.oTPI._getFormatButton().getSelectedKey(), "pm", "AM/PM button is set properly");

		oFinalDate = this.oTPI.getTimeValues();

		//assert
		assert.equal(oFinalDate.getHours(), 23, "Hours are set properly");
		assert.equal(oFinalDate.getMinutes(), 22, "Minutes are set properly");
		assert.equal(oFinalDate.getSeconds(), 33, "Seconds are set properly");
	});

	QUnit.test("Direct input of one-digit numbers when value doesn't overflow the maximum", function (assert) {
		var oFinalDate;

		this.oTPI.setValueFormat("hh:mm:ss a");
		this.oTPI.setDisplayFormat("hh:mm:ss a");
		this.oTPI._setTimeValues(UI5Date.getInstance(2017, 7, 8, 9, 10, 11));
		oCore.applyChanges();

		//act
		this.oTPI.onkeydown(this.fakeEvent("1"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPI._getHoursInput().getValue(), 1, "Hours are set properly");

		// switch to the next input
		this.oTPI.onkeydown(this.fakeEvent(":"));

		//act
		this.oTPI.onkeydown(this.fakeEvent("2"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPI._getMinutesInput().getValue(), 2, "Minutes are set properly");

		// switch to the next input
		this.oTPI.onkeydown(this.fakeEvent(":"));

		//act
		this.oTPI.onkeydown(this.fakeEvent("3"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPI._getSecondsInput().getValue(), 3, "Seconds are set properly");

		oFinalDate = this.oTPI.getTimeValues();

		//assert
		assert.equal(oFinalDate.getHours(), 1, "Hours are set properly");
		assert.equal(oFinalDate.getMinutes(), 2, "Minutes are set properly");
		assert.equal(oFinalDate.getSeconds(), 3, "Seconds are set properly");
	});

	QUnit.test("Direct input of one-digit numbers when value overflows the maximum", function (assert) {
		var oFinalDate;

		this.oTPI.setValueFormat("hh:mm:ss");
		this.oTPI.setDisplayFormat("hh:mm:ss");
		this.oTPI._setTimeValues(UI5Date.getInstance(2017, 7, 8, 9, 10, 11));
		oCore.applyChanges();

		//act
		this.oTPI.onkeydown(this.fakeEvent("7"));
		oCore.applyChanges();
		this.clock.tick(100);

		//assert
		assert.equal(this.oTPI._getHoursInput().getValue(), 7, "Hours are set properly");

		//act
		this.oTPI.onkeydown(this.fakeEvent("7"));
		oCore.applyChanges();
		this.clock.tick(100);

		//assert
		assert.equal(this.oTPI._getMinutesInput().getValue(), 7, "Minutes are set properly");

		//act
		this.oTPI.onkeydown(this.fakeEvent("7"));
		oCore.applyChanges();
		this.clock.tick(100);

		//assert
		assert.equal(this.oTPI._getSecondsInput().getValue(), 7, "Seconds are set properly");

		oFinalDate = this.oTPI.getTimeValues();

		//assert
		assert.equal(oFinalDate.getHours(), 7, "Hours are set properly");
		assert.equal(oFinalDate.getMinutes(), 7, "Minutes are set properly");
		assert.equal(oFinalDate.getSeconds(), 7, "Seconds are set properly");
	});

	QUnit.test("Direct input of 24 when support2400 is enabled", function (assert) {
		var oHoursInput,
			oMinutesInput,
			oSecondsInput;

		this.oTPI.setValueFormat("HH:mm:ss");
		this.oTPI.setDisplayFormat("HH:mm:ss");
		this.oTPI.setSupport2400(true);
		this.oTPI._setTimeValues(UI5Date.getInstance(2017, 7, 8, 9, 10, 11));
		oCore.applyChanges();

		oHoursInput = this.oTPI._getHoursInput();
		oMinutesInput = this.oTPI._getMinutesInput();
		oSecondsInput = this.oTPI._getSecondsInput();

		//act
		this.oTPI.onkeydown(this.fakeEvent("2"));
		this.oTPI.onkeydown(this.fakeEvent("4"));
		oCore.applyChanges();

		//assert
		assert.equal(oHoursInput.getValue(), 24, "Hours are set to 24");
		assert.ok(oHoursInput.getEnabled(), "Hours input is enabled");
		assert.notOk(oMinutesInput.getEnabled(), "Minutes input is disabled");
		assert.equal(oMinutesInput.getValue(), 0, "Minutes input value is 00");
		assert.notOk(oSecondsInput.getEnabled(), "Seconds input is disabled");
		assert.equal(oSecondsInput.getValue(), 0, "Seconds input value is 00");

		//act
		this.oTPI.onkeydown(this.fakeEvent("2"));
		this.oTPI.onkeydown(this.fakeEvent("2"));
		oCore.applyChanges();

		//assert
		assert.equal(oHoursInput.getValue(), 22, "Hours are set properly");
		assert.ok(oHoursInput.getEnabled(), "Hours input is enabled");
		assert.ok(oMinutesInput.getEnabled(), "Minutes input is enabled");
		assert.equal(oMinutesInput.getValue(), 10, "Minutes input value is proper");
		assert.ok(oSecondsInput.getEnabled(), "Seconds input is enabled");
		assert.equal(oSecondsInput.getValue(), 11, "Seconds input value is proper");
	});

	QUnit.module("ACC", {
		beforeEach: function () {
			this.oTPI = new TimePickerInputs({
				valueFormat: "hh:mm:ss a",
				displayFormat: "hh:mm:ss a",
				value: "09:15:33 AM"
			});

			this.oTPI.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oTPI.destroy();
			this.oTPI = null;
		}
	});

	QUnit.test("Check for accessibility elements", function (assert) {
		var oHoursInput = this.oTPI._getHoursInput(),
			oMinutesInput = this.oTPI._getMinutesInput(),
			oSecondsInput = this.oTPI._getSecondsInput(),
			oRB = this.oTPI._oResourceBundle,
			oInputsWrapper = this.oTPI.getDomRef(),
			sHoursLabelled = oHoursInput.getAriaLabelledBy()[0],
			sMinutesLabelled = oMinutesInput.getAriaLabelledBy()[0],
			sSecondsLabelled = oSecondsInput.getAriaLabelledBy()[0];

		//assert
		assert.equal(oCore.byId(sHoursLabelled).getText(), oRB.getText("TIMEPICKER_INPUTS_ENTER_HOURS"), "Hours input is aria-labelledby properly");

		assert.equal(oCore.byId(sMinutesLabelled).getText(), oRB.getText("TIMEPICKER_INPUTS_ENTER_MINUTES"), "Minutes input is aria-labelledby properly");

		assert.equal(oCore.byId(sSecondsLabelled).getText(), oRB.getText("TIMEPICKER_INPUTS_ENTER_SECONDS"), "Seconds input is aria-labelledby properly");

		assert.equal(this.oTPI._getFormatButton().getDomRef().getAttribute("title"), oRB.getText("TIMEPICKER_AMPM_BUTTON_TOOLTIP"), "AM/PM segmented button have proper tooltip");

		assert.equal(oInputsWrapper.getAttribute("role"), "application", "Inputs wrapper have proper role attribute");
		assert.equal(oInputsWrapper.getAttribute("aria-roledescription"), oRB.getText("TIMEPICKER_INPUTS_ROLE_DESCRIPTION"), "Inputs wrapper have aria-roledescription attribute");
	});

	QUnit.module("Misc", {
		beforeEach: function () {
			this.oTPI = new TimePickerInputs();

			this.oTPI.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oTPI.destroy();
			this.oTPI = null;
		}
	});

	// BCP: 1880065660
	QUnit.test("_setTimeValues with iframe's JS date object should set properly the date", function (assert) {
		// arrange
		var iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		var oWindow = iframe.contentWindow;
		oWindow.dateObj = new oWindow.Date(2017, 11, 12);

		// act
		this.oTPI._setTimeValues(oWindow.dateObj);

		// assert
		assert.ok(true, "_setTimeValues did not throw an exception with date object from an iframe");

		// cleanup
		document.body.removeChild(iframe);
		iframe = null;
	});

});