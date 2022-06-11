/*global QUnit */
sap.ui.define([
	"sap/m/TimePickerClocks",
	"sap/m/TimePickerInternals",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core"
], function(TimePickerClocks, TimePickerInternals, KeyCodes, jQuery, oCore) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function () {
			this.oTPC = new TimePickerClocks();

			this.oTPC.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oTPC.destroy();
			this.oTPC = null;
		}
	});

	QUnit.test("Call to setLocaleId sets right AM and PM values and regenerates the controls", function (assert) {
		var sExpectedAM = "AM",
			sExpectedPM = "PM",
			sLocale = "de_DE",
			oSetPropertySpy = this.spy(this.oTPC, "setProperty"),
			oSetupControlsSpy = this.spy(this.oTPC, "_createControls");

		this.oTPC.setLocaleId(sLocale);
		oCore.applyChanges();

		assert.equal(this.oTPC._sAM, sExpectedAM, "_sAM property should be set to proper locale AM");
		assert.equal(this.oTPC._sPM, sExpectedPM, "_sPM property should be set to proper locale PM");
		assert.equal(oSetPropertySpy.calledWithExactly("localeId", sLocale, true), true, "setProperty is called with right arguments");
		assert.ok(oSetupControlsSpy.called, "_createControls is called to regenerate the controls");
	});

	QUnit.test("Call to setDisplayFormat sets displayFormat and regenerates the controls", function (assert) {
		var sDisplayFormat = "medium",
			oSetPropertySpy = this.spy(this.oTPC, "setProperty"),
			oSetupControlsSpy = this.spy(this.oTPC, "_createControls");

		this.oTPC.setDisplayFormat(sDisplayFormat);
		oCore.applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("displayFormat", sDisplayFormat, true), true, "setProperty is called with right arguments");
		assert.ok(oSetupControlsSpy.called, "_createControls is called to regenerate the controls");
	});

	QUnit.test("Call to setMinutesStep sets minutesStep and regenerates the controls", function(assert) {
		var oSetPropertySpy = this.spy(this.oTPC, "setProperty"),
			oSetupControlsSpy = this.spy(this.oTPC, "_createControls"),
			iStep = 23;

		this.oTPC.setMinutesStep(iStep);
		oCore.applyChanges();

		assert.ok(oSetPropertySpy.calledWithExactly("minutesStep", iStep, true), "setProperty is called with right arguments");
		assert.ok(oSetupControlsSpy.called, "_createControls is called to regenerate the controls");
	});

	QUnit.test("Call to setSecondsStep sets secondsStep and regenerates the controls", function(assert) {
		var oSetPropertySpy = this.spy(this.oTPC, "setProperty"),
			oSetupControlsSpy = this.spy(this.oTPC, "_createControls"),
			iStep = 23;

		this.oTPC.setSecondsStep(iStep);
		oCore.applyChanges();

		assert.ok(oSetPropertySpy.calledWithExactly("secondsStep", iStep, true), "setProperty is called with right arguments");
		assert.ok(oSetupControlsSpy.called, "_createControls is called to regenerate the controls");
	});

	QUnit.test("Call to setValue sets the value", function (assert) {
		var sValue = "15:16:17",
			oSetPropertySpy = this.spy(this.oTPC, "setProperty");

		this.oTPC.setValue(sValue);
		oCore.applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("value", sValue, true), true, "setProperty is called with right arguments");
	});

	QUnit.test("Call to setValue calls the _setTimeValues", function (assert) {
		var sValue = "15:16:17",
			sExpectedDate = new Date(2017, 11, 17, 15, 16, 17), // year, month, day, hours, minutes, seconds
			oSetTimeValuesSpy = this.spy(this.oTPC, "_setTimeValues");

		this.stub(this.oTPC, "_parseValue").returns(sExpectedDate);

		this.oTPC.setValue(sValue);
		oCore.applyChanges();

		assert.equal(oSetTimeValuesSpy.calledWithExactly(sExpectedDate, false), true, "_setTimeValues is called with parsed date");
	});

	QUnit.test("Call to setValue with '24:00:00' sets the value", function (assert) {
		var sValue = "24:00:00",
			oSetPropertySpy = this.spy(this.oTPC, "setProperty");

		this.oTPC.setValueFormat("HH:mm:ss");
		this.oTPC.setValue(sValue);
		oCore.applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("value", sValue, true), true, "setProperty is called with right arguments");
	});

	QUnit.test("Call to setValue with value '24:00:00' calls the _setTimeValues", function (assert) {
		var sValue = "24:00:00",
			sExpectedDate = new Date(2017, 11, 17, 0, 0, 0), // year, month, day, hours, minutes, seconds
			oSetTimeValuesSpy = this.spy(this.oTPC, "_setTimeValues");

		this.stub(this.oTPC, "_parseValue").returns(sExpectedDate);

		this.oTPC.setValueFormat("HH:mm:ss");
		this.oTPC.setValue(sValue);
		oCore.applyChanges();

		assert.equal(oSetTimeValuesSpy.calledWithExactly(sExpectedDate, true), true, "_setTimeValues is called with parsed date");
	});

	QUnit.module("Internals", {
		beforeEach: function () {
			this.oTPC = new TimePickerClocks();

			this.oTPC.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oTPC.destroy();
			this.oTPC = null;
		}
	});

	QUnit.test("_setTimevalues properly set value to clocks when Date(2017, 7, 8, 11, 12, 13) date is used", function (assert) {
		var oHoursClock = { setSelectedValue: this.spy() },
			oMinutesClock = { setSelectedValue: this.spy(), setEnabled: this.spy() },
			oSecondsClock = { setSelectedValue: this.spy(), setEnabled: this.spy() };

		this.stub(this.oTPC, "_getHoursClock").returns(oHoursClock);
		this.stub(this.oTPC, "_getMinutesClock").returns(oMinutesClock);
		this.stub(this.oTPC, "_getSecondsClock").returns(oSecondsClock);

		this.oTPC.setValueFormat("HH:mm:ss");
		this.oTPC._setTimeValues(new Date(2017, 7, 8, 11, 12, 13), false);

		assert.ok(oHoursClock.setSelectedValue.calledWithExactly(11), "Hours are properly set to 11");
		assert.ok(oMinutesClock.setSelectedValue.calledWithExactly(12), "Minutes are properly set to 12");
		assert.ok(oSecondsClock.setSelectedValue.calledWithExactly(13), "Seconds are properly set to 13");
	});

	QUnit.test("_setTimeValues properly enables Minutes and Seconds Clock when Date(2017, 7, 8, 11, 12, 13) date is used", function (assert) {
		var oMinutesClock = { setSelectedValue: this.spy(), setEnabled: this.spy() },
			oSecondsClock = { setSelectedValue: this.spy(), setEnabled: this.spy() };

		this.stub(this.oTPC, "_getMinutesClock").returns(oMinutesClock);
		this.stub(this.oTPC, "_getSecondsClock").returns(oSecondsClock);

		this.oTPC.setValueFormat("HH:mm:ss");
		this.oTPC._setTimeValues(new Date(2017, 7, 8, 11, 12, 13), false);

		assert.ok(oMinutesClock.setEnabled.calledWithExactly(true), "Minutes Clock is enabled");
		assert.ok(oSecondsClock.setEnabled.calledWithExactly(true), "Seconds Clock is enabled");
	});

	QUnit.test("_setTimeValues properly set value to Clocks when date value is marking the end of the day new Date(2017, 7, 8, 0, 0, 0)", function (assert) {
		var oHoursClock = this.oTPC._getHoursClock(),
			oMinutesClock = this.oTPC._getMinutesClock(),
			oSecondsClock = this.oTPC._getSecondsClock(),
			oHoursClockSetSelectedValue = this.spy(oHoursClock, "setSelectedValue"),
			oMinutesClockSetSelectedValue = this.spy(oMinutesClock, "setSelectedValue"),
			oSecondsClockSetSelectedValue = this.spy(oSecondsClock, "setSelectedValue");

		this.oTPC.setValueFormat("HH:mm:ss");
		this.oTPC._setTimeValues(new Date(2017, 7, 8, 0, 0, 0), true);

		assert.ok(oHoursClockSetSelectedValue.calledWithExactly(24), "Hours are properly set to 24");
		assert.ok(oMinutesClockSetSelectedValue.calledWithExactly(0), "Minutes are properly set to 0");
		assert.ok(oSecondsClockSetSelectedValue.calledWithExactly(0), "Seconds are properly set to 0");
	});

	QUnit.test("_setTimeValues properly disables Minutes and Seconds Clock when value is marking the end of the day new Date(2017, 7, 8, 0, 0, 0)", function (assert) {
		var oMinutesClock = this.oTPC._getMinutesClock(),
			oSecondsClock = this.oTPC._getSecondsClock(),
			oMinutesClockSetEnabled = this.spy(oMinutesClock, "setEnabled"),
			oSecondsClockSetEnabled = this.spy(oSecondsClock, "setEnabled");

		this.oTPC.setValueFormat("HH:mm:ss");
		this.oTPC._setTimeValues(new Date(2017, 7, 8, 0, 0, 0), true);

		assert.ok(oMinutesClockSetEnabled.calledWithExactly(false), "Minutes Clock is disabled");
		assert.ok(oSecondsClockSetEnabled.calledWithExactly(false), "Seconds Clock is disabled");

	});

	QUnit.test("_checkStyle returns true for one of the predefined format names (short, medium, long or full)", function (assert) {
		var aValidStyles = ["short", "medium", "long", "full"];

		aValidStyles.forEach(function (sStyle) {
			assert.ok(this.oTPC._checkStyle(sStyle));
		}, this);
	});

	QUnit.test("_checkStyle returns false for not valid styles", function (assert) {
		var aValidStyles = ["s", "m", "notValid", "test"];

		aValidStyles.forEach(function (sStyle) {
			assert.ok(!this.oTPC._checkStyle(sStyle));
		}, this);
	});

	QUnit.test("_getDisplayFormatPattern should return displayFormat if not default format names (short, medium, long or full) are used ", function (assert) {
		var aDisplayFormats = ["HH:mm:ss", "hh:mm:ss", "mm:ss", "mm", "ss"];

		aDisplayFormats.forEach(function (sStyle) {
			this.oTPC.setDisplayFormat(sStyle);
			assert.equal(this.oTPC._getDisplayFormatPattern(sStyle), sStyle, "displayFormat is returned directly without modifications");
		}, this);
	});

	QUnit.test("_getDisplatFormatPattern should return local based pattern if default format names are used (short, medium, long or full)", function (assert) {
		var sExpectedResult = "HH:mm:ss a",
			aDisplayFormats = ["short", "medium", "long", "full"];

		this.stub(this.oTPC, "_getLocaleBasedPattern").returns(sExpectedResult);

		aDisplayFormats.forEach(function (sStyle) {
			this.oTPC.setDisplayFormat(sStyle);
			assert.equal(this.oTPC._getDisplayFormatPattern(sStyle), sExpectedResult, "displayFormat is returned directly without modifications");
		}, this);
	});

	QUnit.test("_getActiveClock returns the displayed clock", function (assert) {
		var aClocks = this.oTPC.getAggregation("_clocks");

		assert.equal(this.oTPC._getActiveClockIndex(), 0, "first is selected");

		this.oTPC._switchClock(aClocks.length - 1);

		assert.equal(this.oTPC._getActiveClockIndex(), aClocks.length - 1, "active clock returned properly");
	});

	QUnit.test("_getHoursClock should return null if format does not create Hours Clock", function (assert) {
		// arrange
		this.oTPC.setDisplayFormat("mm");

		// assert
		assert.equal(this.oTPC._getHoursClock(), null, "no Hours Clock");
	});

	QUnit.test("_getHoursClock should return TimePickerClock if format creates Hours Clock", function (assert) {
		// arrange
		this.oTPC.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPC._getHoursClock().isA("sap.m.TimePickerClock"), "should be instance of sap.m.TimePickerClock");
		assert.ok(this.oTPC._getHoursClock().getId().indexOf("-clockH") !== -1, "id of the clock should contain '-clockH'");
	});

	QUnit.test("_getMinutesClock should return null if format does not create Minutes Clock", function (assert) {
		// arrange
		this.oTPC.setDisplayFormat("hh");

		// assert
		assert.equal(this.oTPC._getMinutesClock(), null, "no Minutes Clock");
	});

	QUnit.test("_getMinutesClock should return TimePickerClock if format creates Minutes Clock", function (assert) {
		// arrange
		this.oTPC.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPC._getMinutesClock().isA("sap.m.TimePickerClock"), "should be instance of sap.m.TimePickerClock");
		assert.ok(this.oTPC._getMinutesClock().getId().indexOf("-clockM") !== -1, "id of the clock should contain '-clockM'");
	});

	QUnit.test("_getSecondsClock should return null if format does not create Seconds Clock", function (assert) {
		// arrange
		this.oTPC.setDisplayFormat("hh");

		// assert
		assert.equal(this.oTPC._getSecondsClock(), null, "no Seconds Clock");
	});

	QUnit.test("_getSecondsClock should return TimePickerClock if format creates Seconds Clock", function (assert) {
		// arrange
		this.oTPC.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPC._getSecondsClock().isA("sap.m.TimePickerClock"), "should be instance of sap.m.TimePickerClock");
		assert.ok(this.oTPC._getSecondsClock().getId().indexOf("-clockS") !== -1, "id of the clock should contain '-clockS'");
	});

	QUnit.test("_getFormatButton should return null if format does not create Format Segmented Button", function (assert) {
		// arrange
		this.oTPC.setDisplayFormat("hh");

		// assert
		assert.equal(this.oTPC._getFormatButton(), null, "no Format Segmented Button");
	});

	QUnit.test("_getFormatButton should return SegmentedButton if format creates Format Segmented Button", function (assert) {
		// arrange
		this.oTPC.setDisplayFormat("h:mm:ss a");

		// assert
		assert.ok(this.oTPC._getFormatButton().isA("sap.m.SegmentedButton"), "should be instance of sap.m.SegmentedButton");
		assert.ok(this.oTPC._getFormatButton().getId().indexOf("-format") !== -1, "id of the segmented button should contain -format");
	});

	QUnit.test("_isFormatSupport24 should return true if displayFormat contains HH or H", function (assert) {
		// arrange
		this.oTPC.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPC._isFormatSupport24(), "should return true if format contains HH");

		// arrange
		this.oTPC.setDisplayFormat("H:mm:ss");

		// assert
		assert.ok(this.oTPC._isFormatSupport24(), "should return true if format contains H");
	});

	QUnit.test("_isFormatSupport24 should return false if displayFormat not contains HH or H", function (assert) {
		// arrange
		this.oTPC.setDisplayFormat("hh:mm:ss");

		// assert
		assert.equal(this.oTPC._isFormatSupport24(), false, "should return false if format contains hh");

		// arrange
		this.oTPC.setDisplayFormat("h:mm:ss");

		// assert
		assert.equal(this.oTPC._isFormatSupport24(), false, "should return false if format contains h");

		// arrange
		this.oTPC.setDisplayFormat("mm:ss");

		// assert
		assert.equal(this.oTPC._isFormatSupport24(), false, "should return false if format not contains HH or H");
	});

	QUnit.test("_handleHoursChange enables minutes and seconds buttons and sets restored values to them", function (assert) {
		// arrange
		var iExpectedMinutes = 11,
			iExpectedSeconds = 12,
			oMinutesClock = { setEnabled: this.spy(), getEnabled: this.spy(), setSelectedValue: this.spy() },
			oSecondsClock = { setEnabled: this.spy(), getEnabled: this.spy(), setSelectedValue: this.spy() };

		this.stub(this.oTPC, "_getMinutesClock").returns(oMinutesClock);
		this.stub(this.oTPC, "_getSecondsClock").returns(oSecondsClock);
		this.oTPC.setSupport2400(true);
		this.oTPC._sMinutes = iExpectedMinutes;
		this.oTPC._sSeconds = iExpectedSeconds;

		// act
		this.oTPC._handleHoursChange({ getParameter: function() { return 23; } });

		// assert
		assert.ok(oMinutesClock.setEnabled.calledWithExactly(true), "Minutes clock should be enabled");
		assert.ok(oMinutesClock.setSelectedValue.calledWithExactly(iExpectedMinutes), "Minutes clock value should be set to " + iExpectedMinutes);
		assert.ok(oSecondsClock.setEnabled.calledWithExactly(true), "Seconds clock should be enabled");
		assert.ok(oSecondsClock.setSelectedValue.calledWithExactly(iExpectedSeconds), "Seconds clock value should be set to " + iExpectedSeconds);
	});

	QUnit.test("_handleHoursChange disables minutes and seconds Clock and sets 0 values them", function (assert) {
		// arrange
		var iExpectedMinutes = 0,
			iExpectedSeconds = 0,
			oMinutesClock = { setEnabled: this.spy(), getEnabled: function() { return true; }, setSelectedValue: this.spy(), getSelectedValue: this.spy() },
			oSecondsClock = { setEnabled: this.spy(), getEnabled: function() { return true; }, setSelectedValue: this.spy(), getSelectedValue: this.spy() };

		this.stub(this.oTPC, "_getMinutesClock").returns(oMinutesClock);
		this.stub(this.oTPC, "_getSecondsClock").returns(oSecondsClock);
		this.oTPC.setSupport2400(true);

		// act
		this.oTPC._handleHoursChange({ getParameter: function() { return 24; } });

		// assert
		assert.ok(oMinutesClock.setEnabled.calledWithExactly(false), "Minutes clock should be disabled");
		assert.ok(oMinutesClock.setSelectedValue.calledWithExactly(iExpectedMinutes), "Minutes clock value should be set to " + iExpectedMinutes);
		assert.ok(oSecondsClock.setEnabled.calledWithExactly(false), "Seconds clock should be disabled");
		assert.ok(oSecondsClock.setSelectedValue.calledWithExactly(iExpectedSeconds), "Seconds clock value should be set to " + iExpectedSeconds);
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

	QUnit.module("Clocks Interactions", {
		beforeEach: function () {
			this.oTPC = new TimePickerClocks();

			this.oTPC.setValueFormat("HH:mm:ss");
			this.oTPC.setDisplayFormat("HH:mm:ss");
			this.oTPC._setTimeValues(new Date(2017, 7, 8, 22, 58, 58));

			this.oTPC.placeAt("qunit-fixture");
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
				srcControl: this.oTPC,
				which: 38, // arrow up
				altKey: false,
				metaKey: false,
				shiftKey: false,
				ctrlKey: false
			};
		},
		afterEach: function () {
			this.oTPC.destroy();
			this.oTPC = null;
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

	QUnit.test("Clicking on button changes the clock", function (assert) {
		var sId = this.oTPC.getId();

		oCore.byId(sId + "-btnH").focus();
		oCore.applyChanges();
		assert.ok(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is visible after clicking the Hours button");
		assert.notOk(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is not visible after clicking the Hours button");
		assert.notOk(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is not visible after clicking the Hours button");

		oCore.byId(sId + "-btnM").focus();
		oCore.applyChanges();

		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after clicking the Minutes button");
		assert.ok(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is visible after clicking the Minutes button");
		assert.notOk(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is not visible after clicking the Minutes button");

		oCore.byId(sId + "-btnS").focus();
		oCore.applyChanges();
		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after clicking the Seconds button");
		assert.notOk(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is not visible after clicking the Seconds button");
		assert.ok(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is visible after clicking the Seconds button");
	});

	QUnit.test("Arrows actions (covers arrows and mousewheel)", function (assert) {
		var oHoursClock = this.oTPC._getHoursClock(),
			oMinutesClock = this.oTPC._getMinutesClock(),
			oSecondsClock = this.oTPC._getSecondsClock(),
			oHoursButton = this.oTPC._getHoursButton(),
			oMinutesButton = this.oTPC._getMinutesButton(),
			oSecondsButton = this.oTPC._getSecondsButton(),
			oFinalDate;

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oHoursClock.getSelectedValue(), 23, "Arrow Up: Hours increased by 1");
		assert.equal(parseInt(oHoursButton.getText()), 23, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oHoursClock.getSelectedValue(), 0, "Arrow Up: Hours increased by 1, value is above max, min value is set");
		assert.equal(parseInt(oHoursButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oHoursClock.getSelectedValue(), 23, "Arrow Down: Hours decreased by 1, value is below min, max value is set");
		assert.equal(parseInt(oHoursButton.getText()), 23, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oHoursClock.getSelectedValue(), 22, "Arrow Down: Hours decreased by 1");
		assert.equal(parseInt(oHoursButton.getText()), 22, "... and Button text shows the same value");

		//change to minutes clock
		this.oTPC.onkeydown(this.fakeEvent(":"));
		oCore.applyChanges();

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 59, "Arrow Up: Minutes increased by 1");
		assert.equal(parseInt(oMinutesButton.getText()), 59, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 0, "Arrow Up: Minutes increased by 1, value is above max, min value is set");
		assert.equal(parseInt(oMinutesButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 59, "Arrow Down: Minutes decreased by 1");
		assert.equal(parseInt(oMinutesButton.getText()), 59, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 58, "Arrow Down: Minutes decreased by 1, value is above min, max value is set");
		assert.equal(parseInt(oMinutesButton.getText()), 58, "... and Button text shows the same value");

		//change to seconds clock
		this.oTPC.onkeydown(this.fakeEvent(":"));
		oCore.applyChanges();

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 59, "Arrow Up: Seconds increased by 1");
		assert.equal(parseInt(oSecondsButton.getText()), 59, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_UP));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 0, "Arrow Up: Second increased by 1, value is above max, min value is set");
		assert.equal(parseInt(oSecondsButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 59, "Arrow Down: Seconds decreased by 1");
		assert.equal(parseInt(oSecondsButton.getText()), 59, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.ARROW_DOWN));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 58, "Arrow Down: Seconds decreased by 1, value is above min, max value is set");
		assert.equal(parseInt(oSecondsButton.getText()), 58, "... and Button text shows the same value");

		oFinalDate = this.oTPC.getTimeValues();

		//assert
		assert.equal(oFinalDate.getHours(), 22, "Hours are set properly");
		assert.equal(oFinalDate.getMinutes(), 58, "Minutes are set properly");
		assert.equal(oFinalDate.getSeconds(), 58, "Seconds are set properly");
	});

	QUnit.test("PageUp/PageDown actions", function (assert) {
		var oHoursClock = this.oTPC._getHoursClock(),
			oMinutesClock = this.oTPC._getMinutesClock(),
			oSecondsClock = this.oTPC._getSecondsClock(),
			oHoursButton = this.oTPC._getHoursButton(),
			oMinutesButton = this.oTPC._getMinutesButton(),
			oSecondsButton = this.oTPC._getSecondsButton(),
			oFinalDate;

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP));
		//assert
		assert.equal(oHoursClock.getSelectedValue(), 23, "Page Up: Hours increased by 1");
		assert.equal(parseInt(oHoursButton.getText()), 23, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP));
		//assert
		assert.equal(oHoursClock.getSelectedValue(), 0, "Page Up: Hours increased by 1, value is above max, min value is set");
		assert.equal(parseInt(oHoursButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN));
		//assert
		assert.equal(oHoursClock.getSelectedValue(), 23, "Page Down: Hours decreased by 1, value is below min, max value is set");
		assert.equal(parseInt(oHoursButton.getText()), 23, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN));
		//assert
		assert.equal(oHoursClock.getSelectedValue(), 22, "Page Down: Hours decreased by 1");
		assert.equal(parseInt(oHoursButton.getText()), 22, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 59, "Shift + Page Up: Minutes increased by 1");
		assert.equal(parseInt(oMinutesButton.getText()), 59, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 0, "Shift + Page Up: Minutes increased by 1, value is above max, min value is set");
		assert.equal(parseInt(oMinutesButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 59, "Shift + Page Down: Minutes decreased by 1");
		assert.equal(parseInt(oMinutesButton.getText()), 59, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 58, "Shift + Page Down: Minutes decreased by 1, value is above min, max value is set");
		assert.equal(parseInt(oMinutesButton.getText()), 58, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 59, "Ctrl + Shift + Page Up: Seconds increased by 1");
		assert.equal(parseInt(oSecondsButton.getText()), 59, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 0, "Ctrl + Shift + Page Up: Second increased by 1, value is above max, min value is set");
		assert.equal(parseInt(oSecondsButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 59, "Ctrl + Shift + Page Down: Seconds decreased by 1");
		assert.equal(parseInt(oSecondsButton.getText()), 59, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 58, "Ctrl + Shift + Page Down: Seconds decreased by 1, value is above min, max value is set");
		assert.equal(parseInt(oSecondsButton.getText()), 58, "... and Button text shows the same value");

		oFinalDate = this.oTPC.getTimeValues();

		//assert
		assert.equal(oFinalDate.getHours(), 22, "Hours are set properly");
		assert.equal(oFinalDate.getMinutes(), 58, "Minutes are set properly");
		assert.equal(oFinalDate.getSeconds(), 58, "Seconds are set properly");
	});

	QUnit.test("Direct input of two-digit numbers", function (assert) {
		var sId = this.oTPC.getId(),
			oFinalDate;

		this.oTPC.setValueFormat("hh:mm:ss a");
		this.oTPC.setDisplayFormat("hh:mm:ss a");
		this.oTPC._setTimeValues(new Date(2017, 7, 8, 9, 10, 11));
		oCore.applyChanges();

		//act
		this.oTPC.onkeydown(this.fakeEvent("1"));
		this.oTPC.onkeydown(this.fakeEvent("1"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPC._getHoursClock().getSelectedValue(), 11, "Hours are set properly");
		assert.equal(parseInt(this.oTPC._getHoursButton().getText()), 11, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after entering hours value");
		assert.ok(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is visible after entering hours value");
		assert.notOk(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is not visible after entering hours value");

		//act
		this.oTPC.onkeydown(this.fakeEvent("2"));
		this.oTPC.onkeydown(this.fakeEvent("2"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPC._getMinutesClock().getSelectedValue(), 22, "Minutes are set properly");
		assert.equal(parseInt(this.oTPC._getMinutesButton().getText()), 22, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after entering minutes value");
		assert.notOk(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is not visible after entering minutes value");
		assert.ok(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is visible after entering minutes value");

		//act
		this.oTPC.onkeydown(this.fakeEvent("3"));
		this.oTPC.onkeydown(this.fakeEvent("3"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPC._getSecondsClock().getSelectedValue(), 33, "Seconds are set properly");
		assert.equal(parseInt(this.oTPC._getSecondsButton().getText()), 33, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after entering minutes value");
		assert.notOk(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is not visible after entering minutes value");
		assert.ok(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is visible after entering minutes value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.P));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPC._getFormatButton().getSelectedKey(), "pm", "AM/PM button is set properly");

		oFinalDate = this.oTPC.getTimeValues();

		//assert
		assert.equal(oFinalDate.getHours(), 23, "Hours are set properly");
		assert.equal(oFinalDate.getMinutes(), 22, "Minutes are set properly");
		assert.equal(oFinalDate.getSeconds(), 33, "Seconds are set properly");
	});

	QUnit.test("Direct input of one-digit numbers w/o overflow", function (assert) {
		var sId = this.oTPC.getId(),
			oFinalDate;

		this.oTPC.setValueFormat("hh:mm:ss a");
		this.oTPC.setDisplayFormat("hh:mm:ss a");
		this.oTPC._setTimeValues(new Date(2017, 7, 8, 9, 10, 11));
		oCore.applyChanges();

		//act
		this.oTPC.onkeydown(this.fakeEvent("1"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPC._getHoursClock().getSelectedValue(), 1, "Hours are set properly");
		assert.equal(parseInt(this.oTPC._getHoursButton().getText()), 1, "... and Button text shows the same value");
		assert.ok(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is still visible after entering hours value");
		assert.notOk(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is not visible after entering hours value");
		assert.notOk(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is not visible after entering hours value");

		// switch to the next clock
		this.oTPC.onkeydown(this.fakeEvent(":"));

		//act
		this.oTPC.onkeydown(this.fakeEvent("2"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPC._getMinutesClock().getSelectedValue(), 2, "Minutes are set properly");
		assert.equal(parseInt(this.oTPC._getMinutesButton().getText()), 2, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after entering minutes value");
		assert.ok(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is stil visible after entering minutes value");
		assert.notOk(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is not visible after entering minutes value");

		// switch to the next clock
		this.oTPC.onkeydown(this.fakeEvent(":"));

		//act
		this.oTPC.onkeydown(this.fakeEvent("3"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPC._getSecondsClock().getSelectedValue(), 3, "Seconds are set properly");
		assert.equal(parseInt(this.oTPC._getSecondsButton().getText()), 3, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after entering minutes value");
		assert.notOk(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is not visible after entering minutes value");
		assert.ok(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is visible after entering minutes value");

		oFinalDate = this.oTPC.getTimeValues();

		//assert
		assert.equal(oFinalDate.getHours(), 1, "Hours are set properly");
		assert.equal(oFinalDate.getMinutes(), 2, "Minutes are set properly");
		assert.equal(oFinalDate.getSeconds(), 3, "Seconds are set properly");
	});

	QUnit.test("Direct input of 24 when support2400 is enabled", function (assert) {
		var sId = this.oTPC.getId(),
			oHoursClock,
			oMinutesClock,
			oSecondsClock,
			oHoursButton,
			oMinutesButton,
			oSecondsButton;

		this.oTPC.setValueFormat("HH:mm:ss");
		this.oTPC.setDisplayFormat("HH:mm:ss");
		this.oTPC.setSupport2400(true);
		this.oTPC._setTimeValues(new Date(2017, 7, 8, 9, 10, 11));
		oCore.applyChanges();

		oHoursClock = this.oTPC._getHoursClock();
		oMinutesClock = this.oTPC._getMinutesClock();
		oSecondsClock = this.oTPC._getSecondsClock();
		oHoursButton = this.oTPC._getHoursButton();
		oMinutesButton = this.oTPC._getMinutesButton();
		oSecondsButton = this.oTPC._getSecondsButton();

		//act
		this.oTPC.onkeydown(this.fakeEvent("2"));
		this.oTPC.onkeydown(this.fakeEvent("4"));
		oCore.applyChanges();

		//assert
		assert.equal(oHoursClock.getSelectedValue(), 24, "Hours are set to 24");
		assert.equal(parseInt(oHoursButton.getText()), 24, "... and Button text shows the same value");
		assert.ok(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is visible after entering hours value");
		assert.ok(oHoursClock.getEnabled(), "Hours clock is enabled");
		assert.notOk(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is not visible after entering hours value");
		assert.notOk(oMinutesClock.getEnabled(), "Minutes clock is disabled");
		assert.notOk(oMinutesButton.getEnabled(), "Minutes button is disabled");
		assert.equal(oMinutesClock.getSelectedValue(), 0, "Minutes clock value is 00");
		assert.equal(parseInt(oMinutesButton.getText()), 0, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is not visible after entering hours value");
		assert.notOk(oSecondsClock.getEnabled(), "Seconds clock is disabled");
		assert.notOk(oSecondsButton.getEnabled(), "Seconds button is disabled");
		assert.equal(oSecondsClock.getSelectedValue(), 0, "Seconds clock value is 00");
		assert.equal(parseInt(oSecondsButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent("2"));
		this.oTPC.onkeydown(this.fakeEvent("2"));
		oCore.applyChanges();

		//assert
		assert.equal(oHoursClock.getSelectedValue(), 22, "Hours are set properly");
		assert.equal(parseInt(oHoursButton.getText()), 22, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after entering hours value");
		assert.ok(oHoursClock.getEnabled(), "Hours clock is enabled");
		assert.ok(oHoursButton.getEnabled(), "Hours button is enabled");
		assert.ok(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is visible after entering hours value");
		assert.ok(oMinutesClock.getEnabled(), "Minutes clock is enabled");
		assert.equal(oMinutesClock.getSelectedValue(), 10, "Minutes clock value is proper");
		assert.equal(parseInt(oMinutesButton.getText()), 10, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is not visible after entering hours value");
		assert.ok(oSecondsClock.getEnabled(), "Seconds clock is enabled");
		assert.ok(oSecondsButton.getEnabled(), "Seconds button is enabled");
		assert.equal(oSecondsClock.getSelectedValue(), 11, "Seconds clock value is proper");
		assert.equal(parseInt(oSecondsButton.getText()), 11, "... and Button text shows the same value");

	});

	QUnit.test("Direct input of one-digit numbers with overflow", function (assert) {
		var sId = this.oTPC.getId(),
			oFinalDate;

		this.oTPC.setValueFormat("hh:mm:ss");
		this.oTPC.setDisplayFormat("hh:mm:ss");
		this.oTPC._setTimeValues(new Date(2017, 7, 8, 9, 10, 11));
		oCore.applyChanges();

		//act
		this.oTPC.onkeydown(this.fakeEvent("7"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPC._getHoursClock().getSelectedValue(), 7, "Hours are set properly");
		assert.equal(parseInt(this.oTPC._getHoursButton().getText()), 7, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after entering hours value");
		assert.ok(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is visible after entering hours value");
		assert.notOk(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is not visible after entering hours value");

		//act
		this.oTPC.onkeydown(this.fakeEvent("7"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPC._getMinutesClock().getSelectedValue(), 7, "Minutes are set properly");
		assert.equal(parseInt(this.oTPC._getMinutesButton().getText()), 7, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after entering minutes value");
		assert.notOk(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is not visible after entering minutes value");
		assert.ok(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is visible after entering minutes value");

		//act
		this.oTPC.onkeydown(this.fakeEvent("7"));
		oCore.applyChanges();

		//assert
		assert.equal(this.oTPC._getSecondsClock().getSelectedValue(), 7, "Seconds are set properly");
		assert.equal(parseInt(this.oTPC._getSecondsButton().getText()), 7, "... and Button text shows the same value");
		assert.notOk(oCore.byId(sId + "-clockH").hasStyleClass("sapMTPCActive"), "Hours clock is not visible after entering minutes value");
		assert.notOk(oCore.byId(sId + "-clockM").hasStyleClass("sapMTPCActive"), "Minutes clock is not visible after entering minutes value");
		assert.ok(oCore.byId(sId + "-clockS").hasStyleClass("sapMTPCActive"), "Seconds clock is visible after entering minutes value");

		oFinalDate = this.oTPC.getTimeValues();

		//assert
		assert.equal(oFinalDate.getHours(), 7, "Hours are set properly");
		assert.equal(oFinalDate.getMinutes(), 7, "Minutes are set properly");
		assert.equal(oFinalDate.getSeconds(), 7, "Seconds are set properly");
	});

	QUnit.test("Increase/decrease with different steps for minutes and seconds (Page Up/Page Down)", function (assert) {
		var oMinutesClock,
			oSecondsClock,
			oMinutesButton,
			oSecondsButton;

		this.oTPC.setMinutesStep(5);
		this.oTPC.setSecondsStep(10);
		oCore.applyChanges();

		oMinutesClock = this.oTPC._getMinutesClock();
		oSecondsClock = this.oTPC._getSecondsClock();
		oMinutesButton = this.oTPC._getMinutesButton();
		oSecondsButton = this.oTPC._getSecondsButton();

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 0, "Shift + Page Up: Minutes increased to the nearest possible value");
		assert.equal(parseInt(oMinutesButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 5, "Shift + Page Up: Minutes increased by 5");
		assert.equal(parseInt(oMinutesButton.getText()), 5, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 0, "Shift + Page Down: Minutes decreased by 5");
		assert.equal(parseInt(oMinutesButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 55, "Shift + Page Down: Minutes decreased by 5");
		assert.equal(parseInt(oMinutesButton.getText()), 55, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 50, "Ctrl + Shift + Page Down: Seconds decreased to the nearest possible value");
		assert.equal(parseInt(oSecondsButton.getText()), 50, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 40, "Ctrl + Shift + Page Down: Second decreased by 10");
		assert.equal(parseInt(oSecondsButton.getText()), 40, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 50, "Ctrl + Shift + Page Up: Seconds increased by 10");
		assert.equal(parseInt(oSecondsButton.getText()), 50, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 0, "Ctrl + Shift + Page Up: Seconds increased by 10");
		assert.equal(parseInt(oSecondsButton.getText()), 0, "... and Button text shows the same value");
	});

	QUnit.test("Increase/decrease with different steps for minutes and seconds (Arrow Up/Arrow Down)", function (assert) {
		var oMinutesClock,
			oSecondsClock,
			oMinutesButton,
			oSecondsButton;

		this.oTPC.setMinutesStep(5);
		this.oTPC.setSecondsStep(10);
		oCore.applyChanges();

		oMinutesClock = this.oTPC._getMinutesClock();
		oSecondsClock = this.oTPC._getSecondsClock();
		oMinutesButton = this.oTPC._getMinutesButton();
		oSecondsButton = this.oTPC._getSecondsButton();

		//change to minutes clock
		this.oTPC.onkeydown(this.fakeEvent(":"));
		oCore.applyChanges();

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 0, "Arrow Up: Minutes increased to the nearest possible value");
		assert.equal(parseInt(oMinutesButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 5, "Arrow Up: Minutes increased by 5");
		assert.equal(parseInt(oMinutesButton.getText()), 5, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 0, "Arrow Down: Minutes decreased by 5");
		assert.equal(parseInt(oMinutesButton.getText()), 0, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, false));
		//assert
		assert.equal(oMinutesClock.getSelectedValue(), 55, "Arrow Down: Minutes decreased by 5");
		assert.equal(parseInt(oMinutesButton.getText()), 55, "... and Button text shows the same value");

		//change to seconds clock
		this.oTPC.onkeydown(this.fakeEvent(":"));
		oCore.applyChanges();

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 50, "Arrow Down: Seconds decreased to the nearest possible value");
		assert.equal(parseInt(oSecondsButton.getText()), 50, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_DOWN, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 40, "Arrow Down: Second decreased by 10");
		assert.equal(parseInt(oSecondsButton.getText()), 40, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 50, "Arrow Up: Seconds increased by 10");
		assert.equal(parseInt(oSecondsButton.getText()), 50, "... and Button text shows the same value");

		//act
		this.oTPC.onkeydown(this.fakeEvent(KeyCodes.PAGE_UP, false, false, true, true));
		//assert
		assert.equal(oSecondsClock.getSelectedValue(), 0, "Arrow Up: Seconds increased by 10");
		assert.equal(parseInt(oSecondsButton.getText()), 0, "... and Button text shows the same value");
	});

	QUnit.module("ACC", {
		beforeEach: function () {
			this.oTPC = new TimePickerClocks({
				valueFormat: "hh:mm:ss a",
				displayFormat: "hh:mm:ss a",
				value: "09:15:33 AM"
			});

			this.oTPC.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oTPC.destroy();
			this.oTPC = null;
		}
	});

	QUnit.test("Check for accessibility elements", function (assert) {
		var oHoursButtonDom = this.oTPC._getHoursButton().getDomRef(),
			oMinutesButtonDom = this.oTPC._getMinutesButton().getDomRef(),
			oSecondsButtonDom = this.oTPC._getSecondsButton().getDomRef(),
			oRB = this.oTPC._oResourceBundle,
			oClocksWrapper = jQuery(".sapMTPCClocks");

		//assert
		assert.equal(oHoursButtonDom.getAttribute("role"), "spinbutton", "Hours button have proper role attribute");
		assert.equal(oHoursButtonDom.getAttribute("aria-valuetext"), "9 " + oRB.getText("TIMEPICKER_LBL_HOURS"), "Hours button have proper aria-valuetext attribute");

		assert.equal(oMinutesButtonDom.getAttribute("role"), "spinbutton", "Minutes button have proper role attribute");
		assert.equal(oMinutesButtonDom.getAttribute("aria-valuetext"), "15 " + oRB.getText("TIMEPICKER_LBL_MINUTES"), "Minutes button have proper aria-valuetext attribute");

		assert.equal(oSecondsButtonDom.getAttribute("role"), "spinbutton", "Seconds button have proper role attribute");
		assert.equal(oSecondsButtonDom.getAttribute("aria-valuetext"), "33 " + oRB.getText("TIMEPICKER_LBL_SECONDS"), "Hours button have proper aria-valuetext attribute");

		assert.equal(this.oTPC._getFormatButton().getDomRef().getAttribute("title"), oRB.getText("TIMEPICKER_AMPM_BUTTON_TOOLTIP"), "AM/PM segmented button have proper tooltip");

		assert.equal(oClocksWrapper.attr("role"), "img", "Clocks wrapper have proper role attribute");
		assert.equal(oClocksWrapper.attr("aria-label"), oRB.getText("TIMEPICKER_CLOCK_DIAL_LABEL"), "Clocks wrapper have aria-label attribute");
	});

	QUnit.module("Misc", {
		beforeEach: function () {
			this.oTPC = new TimePickerClocks();

			this.oTPC.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oTPC.destroy();
			this.oTPC = null;
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
		this.oTPC._setTimeValues(oWindow.dateObj);

		// assert
		assert.ok(true, "_setTimeValues did not throw an exception with date object from an iframe");

		// cleanup
		document.body.removeChild(iframe);
		iframe = null;
	});

});