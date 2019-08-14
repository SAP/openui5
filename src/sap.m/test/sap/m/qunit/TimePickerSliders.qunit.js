/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/TimePickerSliders",
	"jquery.sap.keycodes",
	"jquery.sap.global"
], function(QUnitUtils, TimePickerSliders, jQuery) {
	QUnit.module("API", {
		beforeEach: function () {
			this.oTPS = new TimePickerSliders();

			this.oTPS.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oTPS.destroy();
			this.oTPS = null;
		}
	});

	QUnit.test("Call to setLocaleId sets right AM and PM values and regenerates the lists", function (assert) {
		var sExpectedAM = "AM",
			sExpectedPM = "PM",
			sLocale = "de_DE",
			oSetPropertySpy = this.spy(this.oTPS, "setProperty"),
			oSetupListsSpy = this.spy(this.oTPS, "_setupLists");

		this.oTPS.setLocaleId(sLocale);
		sap.ui.getCore().applyChanges();

		assert.equal(this.oTPS._sAM, sExpectedAM, "_sAM property should be set to proper locale AM");
		assert.equal(this.oTPS._sPM, sExpectedPM, "_sPM property should be set to proper locale PM");
		assert.equal(oSetPropertySpy.calledWithExactly("localeId", sLocale, true), true, "setProperty is called with right arguments");
		assert.ok(oSetupListsSpy.called, "_setupLists is called to regenerate the lists");

		oSetPropertySpy.restore();
		oSetupListsSpy.restore();
	});

	QUnit.test("Call to setDisplayFormat sets displayFormat and regenerates the lists", function (assert) {
		var sDisplayFormat = "medium",
			oSetPropertySpy = this.spy(this.oTPS, "setProperty"),
			oSetupListsSpy = this.spy(this.oTPS, "_setupLists");

		this.oTPS.setDisplayFormat(sDisplayFormat);
		sap.ui.getCore().applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("displayFormat", sDisplayFormat, true), true, "setProperty is called with right arguments");
		assert.ok(oSetupListsSpy.called, "_setupLists is called to regenerate the lists");

		oSetPropertySpy.restore();
		oSetupListsSpy.restore();
	});

	QUnit.test("Call to setLabelText sets the label", function (assert) {
		var sLabelText = "text",
			oSetPropertySpy = this.spy(this.oTPS, "setProperty");

		this.oTPS.setLabelText(sLabelText);
		sap.ui.getCore().applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("labelText", sLabelText), true, "setProperty is called with right arguments");
	});

	QUnit.test("Call to setMinutesStep sets minutesStep and regenerates the lists", function(assert) {
		var oSetPropertySpy = this.spy(this.oTPS, "setProperty"),
			oSetupListsSpy = this.spy(this.oTPS, "_setupLists"),
			iStep = 23;

		this.oTPS.setMinutesStep(iStep);
		sap.ui.getCore().applyChanges();

		assert.ok(oSetPropertySpy.calledWithExactly("minutesStep", iStep, true), "setProperty is called with right arguments");
		assert.ok(oSetupListsSpy.called, "_setupLists is called to regenerate the lists");

		oSetPropertySpy.restore();
		oSetupListsSpy.restore();
	});

	QUnit.test("Call to setMinutesStep corrects value 0 to 1", function(assert) {
		var oSetPropertySpy = this.spy(this.oTPS, "setProperty"),
			iStep = 0,
			iExpectedStep = 1;

		this.oTPS.setMinutesStep(iStep);
		sap.ui.getCore().applyChanges();

		assert.ok(oSetPropertySpy.calledWithExactly("minutesStep", iExpectedStep, true), "setProperty is called with right arguments");
		assert.equal(this.oTPS.getMinutesStep(), iExpectedStep, "minutesStep is corrected to 1");

		oSetPropertySpy.restore();
	});

	QUnit.test("Call to setSecondsStep sets secondsStep and regenerates the lists", function(assert) {
		var oSetPropertySpy = this.spy(this.oTPS, "setProperty"),
				oSetupListsSpy = this.spy(this.oTPS, "_setupLists"),
				iStep = 23;

		this.oTPS.setSecondsStep(iStep);
		sap.ui.getCore().applyChanges();

		assert.ok(oSetPropertySpy.calledWithExactly("secondsStep", iStep, true), "setProperty is called with right arguments");
		assert.ok(oSetupListsSpy.called, "_setupLists is called to regenerate the lists");

		oSetPropertySpy.restore();
		oSetupListsSpy.restore();
	});

	QUnit.test("Call to setSecondsStep corrects value 0 to 1", function(assert) {
		var oSetPropertySpy = this.spy(this.oTPS, "setProperty"),
				iStep = 0,
				iExpectedStep = 1;

		this.oTPS.setSecondsStep(iStep);
		sap.ui.getCore().applyChanges();

		assert.ok(oSetPropertySpy.calledWithExactly("secondsStep", iExpectedStep, true), "setProperty is called with right arguments");
		assert.equal(this.oTPS.getSecondsStep(), iExpectedStep, "secondsStep is corrected to 1");

		oSetPropertySpy.restore();
	});

	QUnit.test("Call to setWidth sets the width", function (assert) {
		var sWidth = "500px",
			oSetPropertySpy = this.spy(this.oTPS, "setProperty");

		this.oTPS.setWidth(sWidth);
		sap.ui.getCore().applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("width", sWidth), true, "setProperty is called with right arguments");
		assert.equal(this.oTPS.$().outerWidth() + "px", sWidth, "width is properly set");
	});

	QUnit.test("Call to setHeight sets the height", function (assert) {
		var sHeight = "500px",
			oSetPropertySpy = this.spy(this.oTPS, "setProperty");

		this.oTPS.setHeight(sHeight);
		sap.ui.getCore().applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("height", sHeight), true, "setProperty is called with right arguments");
		assert.equal(this.oTPS.$().outerHeight() + "px", sHeight, "height is properly set");
	});

	QUnit.test("Call to setValue sets the value", function (assert) {
		var sValue = "15:16:17",
			oSetPropertySpy = this.spy(this.oTPS, "setProperty");

		this.oTPS.setValue(sValue);
		sap.ui.getCore().applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("value", sValue, true), true, "setProperty is called with right arguments");

		oSetPropertySpy.restore();
	});

	QUnit.test("Call to setValue calls the _setTimeValues", function (assert) {
		var sValue = "15:16:17",
			sExpectedDate = new Date(2017, 11, 17, 15, 16, 17), // year, month, day, hours, minutes, seconds
			oSetTimeValuesSpy = this.spy(this.oTPS, "_setTimeValues"),
			oParseValueStub = this.stub(this.oTPS, "_parseValue", function () {
				return sExpectedDate;
			});

		this.oTPS.setValue(sValue);
		sap.ui.getCore().applyChanges();

		assert.equal(oSetTimeValuesSpy.calledWithExactly(sExpectedDate, false), true, "_setTimeValues is called with parsed date");

		oParseValueStub.restore();
		oSetTimeValuesSpy.restore();
	});

	QUnit.test("Call to setValue with '24:00:00' sets the value", function (assert) {
		var sValue = "24:00:00",
				oSetPropertySpy = this.spy(this.oTPS, "setProperty");

		this.oTPS.setValueFormat("HH:mm:ss");
		this.oTPS.setValue(sValue);
		sap.ui.getCore().applyChanges();

		assert.equal(oSetPropertySpy.calledWithExactly("value", sValue, true), true, "setProperty is called with right arguments");

		oSetPropertySpy.restore();
	});

	QUnit.test("Call to setValue with value '24:00:00' calls the _setTimeValues", function (assert) {
		var sValue = "24:00:00",
				sExpectedDate = new Date(2017, 11, 17, 0, 0, 0), // year, month, day, hours, minutes, seconds
				oSetTimeValuesSpy = this.spy(this.oTPS, "_setTimeValues"),
				oParseValueStub = this.stub(this.oTPS, "_parseValue", function () {
					return sExpectedDate;
				});

		this.oTPS.setValueFormat("HH:mm:ss");
		this.oTPS.setValue(sValue);
		sap.ui.getCore().applyChanges();

		assert.equal(oSetTimeValuesSpy.calledWithExactly(sExpectedDate, true), true, "_setTimeValues is called with parsed date");

		oParseValueStub.restore();
		oSetTimeValuesSpy.restore();
	});

	QUnit.test("Call to collapseAll should close all sliders", function (assert) {
		var aSliders = this.oTPS.getAggregation("_columns");
		aSliders[0].setIsExpanded(true);

		this.oTPS.collapseAll();
		sap.ui.getCore().applyChanges();

		aSliders.forEach(function (oSlider, index) {
			assert.equal(oSlider.getIsExpanded(), false, "slider " + index + " is not expanded");
		});
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oTPS = new TimePickerSliders();

			this.oTPS.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oTPS.destroy();
			this.oTPS = null;
		}
	});

	QUnit.test("Change event is fired when slider is collapsed", function (assert) {
		var sEventParam,
			sExpectedValue = "13:14:15",
			fnChangeEventSpy = sinon.spy(function (oEvent) {
				sEventParam = oEvent.getParameter('value');
			}),
			oGetValueStub = this.stub(this.oTPS, "getValue", function () { return sExpectedValue; });

		this.oTPS.attachChange(fnChangeEventSpy);

		this.oTPS.getAggregation("_columns")[0].setIsExpanded(false);
		sap.ui.getCore().applyChanges();

		assert.equal(fnChangeEventSpy.callCount, 1, "closing of a slider should");
		assert.equal(sEventParam, sExpectedValue, "TimepickerSliders value should be passed as a parameter to the change event");

		oGetValueStub.restore();
		oGetValueStub.restore();
	});

	QUnit.module("Internals", {
		beforeEach: function () {
			this.oTPS = new TimePickerSliders();

			this.oTPS.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oTPS.destroy();
			this.oTPS = null;
		}
	});

	QUnit.test("_setTimevalues properly set value to sliders when Date(2017, 7, 8, 11, 12, 13) date is used", function (assert) {
		var oHoursSlider = { setSelectedValue: this.spy() },
			oMinutesSlider = { setSelectedValue: this.spy(), _setEnabled: this.spy(), _updateStepAndValue: this.spy() },
			oSecondsSlider = { setSelectedValue: this.spy(), _setEnabled: this.spy(), _updateStepAndValue: this.spy() },
			oHoursSliderStub = this.stub(this.oTPS, "_getHoursSlider", function () { return oHoursSlider; }),
			oMinutesSliderStub = this.stub(this.oTPS, "_getMinutesSlider", function () { return oMinutesSlider; }),
			oSecondsSliderStub = this.stub(this.oTPS, "_getSecondsSlider", function () { return oSecondsSlider; });

		this.oTPS.setValueFormat("HH:mm:ss");
		this.oTPS._setTimeValues(new Date(2017, 7, 8, 11, 12, 13), false);

		assert.ok(oHoursSlider.setSelectedValue.calledWithExactly("11"), "Hours are properly set to 11");
		assert.ok(oMinutesSlider._updateStepAndValue.calledWithExactly(12, 1), "Minutes are properly set to 12");
		assert.ok(oSecondsSlider._updateStepAndValue.calledWithExactly(13, 1), "Seconds are properly set to 13");

		oHoursSliderStub.restore();
		oMinutesSliderStub.restore();
		oSecondsSliderStub.restore();
	});

	QUnit.test("_setTimeValues properly enables Minutes and Seconds Slider when Date(2017, 7, 8, 11, 12, 13) date is used", function (assert) {
		var oMinutesSlider = { setSelectedValue: this.spy(), _setEnabled: this.spy(), _updateStepAndValue: this.spy() },
				oSecondsSlider = { setSelectedValue: this.spy(), _setEnabled: this.spy(), _updateStepAndValue: this.spy() },
				oMinutesSliderStub = this.stub(this.oTPS, "_getMinutesSlider", function () { return oMinutesSlider; }),
				oSecondsSliderStub = this.stub(this.oTPS, "_getSecondsSlider", function () { return oSecondsSlider; });

		this.oTPS.setValueFormat("HH:mm:ss");
		this.oTPS._setTimeValues(new Date(2017, 7, 8, 11, 12, 13), false);

		assert.ok(oMinutesSlider._setEnabled.calledWithExactly(true), "Minutes slider is enabled");
		assert.ok(oSecondsSlider._setEnabled.calledWithExactly(true), "Seconds slider is enabled");

		oMinutesSliderStub.restore();
		oSecondsSliderStub.restore();
	});

	QUnit.test("_setTimeValues properly set value to sliders when date value is marking the end of the day new Date(2017, 7, 8, 0, 0, 0)", function (assert) {
		var oHoursSlider = { setSelectedValue: this.spy() },
			oMinutesSlider = { setSelectedValue: this.spy(), _setEnabled: this.spy(), _updateStepAndValue: this.spy() },
			oSecondsSlider = { setSelectedValue: this.spy(), _setEnabled: this.spy(), _updateStepAndValue: this.spy() },
			oHoursSliderStub = this.stub(this.oTPS, "_getHoursSlider", function () { return oHoursSlider; }),
			oMinutesSliderStub = this.stub(this.oTPS, "_getMinutesSlider", function () { return oMinutesSlider; }),
			oSecondsSliderStub = this.stub(this.oTPS, "_getSecondsSlider", function () { return oSecondsSlider; }),
			oFormatSliderStub = this.stub(this.oTPS, "_getFormatSlider", function () { return null; });

		this.oTPS.setValueFormat("HH:mm:ss");
		this.oTPS._setTimeValues(new Date(2017, 7, 8, 0, 0, 0), true);

		assert.ok(oHoursSlider.setSelectedValue.calledWithExactly("24"), "Hours are properly set to 24");
		assert.ok(oMinutesSlider.setSelectedValue.calledWithExactly("0"), "Minutes are properly set to 0");
		assert.ok(oSecondsSlider.setSelectedValue.calledWithExactly("0"), "Seconds are properly set to 0");

		oHoursSliderStub.restore();
		oMinutesSliderStub.restore();
		oSecondsSliderStub.restore();
		oFormatSliderStub.restore();
	});

	QUnit.test("_setTimeValues properly disables Minutes and Seconds Slider when value is marking the end of the day new Date(2017, 7, 8, 0, 0, 0)", function (assert) {
		var oMinutesSlider = { setSelectedValue: this.spy(), _setEnabled: this.spy(), _updateStepAndValue: this.spy() },
			oSecondsSlider = { setSelectedValue: this.spy(), _setEnabled: this.spy(), _updateStepAndValue: this.spy() },
			oMinutesSliderStub = this.stub(this.oTPS, "_getMinutesSlider", function () { return oMinutesSlider; }),
			oSecondsSliderStub = this.stub(this.oTPS, "_getSecondsSlider", function () { return oSecondsSlider; });

		this.oTPS.setValueFormat("HH:mm:ss");
		this.oTPS._setTimeValues(new Date(2017, 7, 8, 0, 0, 0), true);

		assert.ok(oMinutesSlider._setEnabled.calledWithExactly(false), "Minutes slider is disabled");
		assert.ok(oSecondsSlider._setEnabled.calledWithExactly(false), "Seconds slider is disabled");

		oMinutesSliderStub.restore();
		oSecondsSliderStub.restore();
	});

	QUnit.test("_generatePickerListValues with step 1 and range 0 - 59 should have all items visible", function (assert) {
		var iLower = 0,
			iUpper = 59,
			iStep = 1,
			aItems = this.oTPS._generatePickerListValues(iLower, iUpper, iStep, true);

		for (var i = iLower; i <= iUpper; i++) {
			assert.ok(aItems[i].getVisible(), "item is visible");
		}
	});

	QUnit.test("_generatePickerListValues with step 3 and range 0 - 59 should have every third item visible", function (assert) {
		var iLower = 0,
			iUpper = 59,
			iStep = 3,
			aItems = this.oTPS._generatePickerListValues(iLower, iUpper, iStep, true);

		for (var i = iLower; i <= iUpper; i++) {
			if (i % 3 === 0) {
				assert.ok(aItems[i].getVisible(), "item is visible");
			} else {
				assert.ok(!aItems[i].getVisible(), "item is not visible");
			}
		}
	});

	QUnit.test("_checkStyle returns true for one of the predefined format names (short, medium, long or full)", function (assert) {
		var aValidStyles = ["short", "medium", "long", "full"];

		aValidStyles.forEach(function (sStyle) {
			assert.ok(this.oTPS._checkStyle(sStyle));
		}, this);
	});

	QUnit.test("_checkStyle returns false for not valid styles", function (assert) {
		var aValidStyles = ["s", "m", "notValid", "test"];

		aValidStyles.forEach(function (sStyle) {
			assert.ok(!this.oTPS._checkStyle(sStyle));
		}, this);
	});

	QUnit.test("_getDisplayFormatPattern should return displayFormat if not default format names (short, medium, long or full) are used ", function (assert) {
		var aDisplayFormats = ["HH:mm:ss", "hh:mm:ss", "mm:ss", "mm", "ss"];

		aDisplayFormats.forEach(function (sStyle) {
			this.oTPS.setDisplayFormat(sStyle);
			assert.equal(this.oTPS._getDisplayFormatPattern(sStyle), sStyle, "displayFormat is returned directly without modifications");
		}, this);
	});

	QUnit.test("_getDisplatFormatPattern should return local based pattern if default format names are used (short, medium, long or full)", function (assert) {
		var sExpectedResult = "HH:mm:ss a",
			aDisplayFormats = ["short", "medium", "long", "full"],
			oGetLocaleBasedPatternStub = this.stub(this.oTPS, "_getLocaleBasedPattern", function () { return sExpectedResult;});

		aDisplayFormats.forEach(function (sStyle) {
			this.oTPS.setDisplayFormat(sStyle);
			assert.equal(this.oTPS._getDisplayFormatPattern(sStyle), sExpectedResult, "displayFormat is returned directly without modifications");
		}, this);

		oGetLocaleBasedPatternStub.restore();
	});

	QUnit.test("_getCurrentSlider returns null if no slider is expanded", function(assert) {
		assert.equal(this.oTPS._getCurrentSlider(), null, "no slider is selected");
	});

	QUnit.test("_getCurrentSlider returns the expanded slider", function (assert) {
		var oSlider = this.oTPS.getAggregation("_columns")[1];

		assert.equal(this.oTPS._getCurrentSlider(), null, "no slider is selected");

		oSlider.setIsExpanded(true);

		assert.equal(this.oTPS._getCurrentSlider(), oSlider, "expanded slider should be returned");
	});

	QUnit.test("_getHoursSlider should return null if format does not create Hours Slider", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("mm");

		// assert
		assert.equal(this.oTPS._getHoursSlider(), null, "no listHours slider");
	});

	QUnit.test("_getHoursSlider should return TimePickerSlider if format creates Hours Slider", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPS._getHoursSlider() instanceof sap.m.TimePickerSlider, "should be instance of sap.m.TimePickerSlider");
		assert.ok(this.oTPS._getHoursSlider().getId().indexOf("-listHours") !== -1, "id of the slider should contain listHours");
	});

	QUnit.test("_getMinutesSlider should return null if format does not create Minutes Slider", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("hh");

		// assert
		assert.equal(this.oTPS._getMinutesSlider(), null, "no listMins slider");
	});

	QUnit.test("_getMinutesSlider should return TimePickerSlider if format creates Minutes Slider", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPS._getMinutesSlider() instanceof sap.m.TimePickerSlider, "should be instance of sap.m.TimePickerSlider");
		assert.ok(this.oTPS._getMinutesSlider().getId().indexOf("-listMins") !== -1, "id of the slider should contain listMins");
	});

	QUnit.test("_getSecondsSlider should return null if format does not create Seconds Slider", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("hh");

		// assert
		assert.equal(this.oTPS._getSecondsSlider(), null, "no listSecs slider");
	});

	QUnit.test("_getSecondsSlider should return TimePickerSlider if format creates Seconds Slider", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPS._getSecondsSlider() instanceof sap.m.TimePickerSlider, "should be instance of sap.m.TimePickerSlider");
		assert.ok(this.oTPS._getSecondsSlider().getId().indexOf("-listSecs") !== -1, "id of the slider should contain listSecs");
	});

	QUnit.test("_getFormatSlider should return null if format does not create Format Slider", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("hh");

		// assert
		assert.equal(this.oTPS._getFormatSlider(), null, "no listFormat slider");
	});

	QUnit.test("_getFormatSlider should return TimePickerSlider if format creates Format Slider", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("h:mm:ss a");

		// assert
		assert.ok(this.oTPS._getFormatSlider() instanceof sap.m.TimePickerSlider, "should be instance of sap.m.TimePickerSlider");
		assert.ok(this.oTPS._getFormatSlider().getId().indexOf("-listFormat") !== -1, "id of the slider should contain listFormat");
	});

	QUnit.test("_getFirstSlider should return the first Hours slider if format is h:m:s", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("h:m:s");

		// assert
		assert.ok(this.oTPS._getFirstSlider() instanceof sap.m.TimePickerSlider, "should be instance of sap.m.TimePickerSlider");
		assert.ok(this.oTPS._getFirstSlider().getId().indexOf("-listHours") !== -1, "id of the slider should contain listHours");
	});

	QUnit.test("_getLastSlider should return the last Secs slider if format is h:m:s", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("h:m:s");

		// assert
		assert.ok(this.oTPS._getLastSlider() instanceof sap.m.TimePickerSlider, "should be instance of sap.m.TimePickerSlider");
		assert.ok(this.oTPS._getLastSlider().getId().indexOf("-listSecs") !== -1, "id of the slider should contain listSecs");
	});

	QUnit.test("_isSliderEnabled returns true if the passed slider is enabled", function (assert) {
		// arrange
		var oSliderStub = { _getEnabled: function () { return true; } };

		// act & assert
		assert.ok(this.oTPS._isSliderEnabled(oSliderStub), "method should return true");
	});

	QUnit.test("_isSliderEnabled returns false if the passed slider is not enabled", function (assert) {
		// arrange
		var oSliderStub = { _getEnabled: function () { return false; } };

		// act & assert
		assert.ok(!this.oTPS._isSliderEnabled(oSliderStub), "method should return false");
	});

	QUnit.test("_isFormatSupport24 should return true if displayFormat contains HH or H", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("HH:mm:ss");

		// assert
		assert.ok(this.oTPS._isFormatSupport24(), "should return true if format contains HH");

		// arrange
		this.oTPS.setDisplayFormat("H:mm:ss");

		// assert
		assert.ok(this.oTPS._isFormatSupport24(), "should return true if format contains H");
	});

	QUnit.test("_isFormatSupport24 should return false if displayFormat not contains HH or H", function (assert) {
		// arrange
		this.oTPS.setDisplayFormat("hh:mm:ss");

		// assert
		assert.equal(this.oTPS._isFormatSupport24(), false, "should return false if format contains hh");

		// arrange
		this.oTPS.setDisplayFormat("h:mm:ss");

		// assert
		assert.equal(this.oTPS._isFormatSupport24(), false, "should return false if format contains h");

		// arrange
		this.oTPS.setDisplayFormat("mm:ss");

		// assert
		assert.equal(this.oTPS._isFormatSupport24(), false, "should return false if format not contains HH or H");
	});

	QUnit.test("_handleHoursChange enables minutes and seconds slider and sets restored values to them", function (assert) {
		// arrange
		var iExpectedMinutes = 11,
			iExpectedSeconds = 12,
			oMinutesSlider = { _getEnabled: function () { return false; }, _setEnabled: this.spy(), setSelectedValue: this.spy(), _updateStepAndValue: this.spy() },
			oSecondsSlider = { _getEnabled: function () { return false; }, _setEnabled: this.spy(), setSelectedValue: this.spy(), _updateStepAndValue: this.spy() },
			oMinutesSliderStub = this.stub(this.oTPS, "_getMinutesSlider", function () { return oMinutesSlider; }),
			oSecondsSliderStub = this.stub(this.oTPS, "_getSecondsSlider", function () { return oSecondsSlider; });
		this.oTPS.setSupport2400(true);
		this.oTPS._iMinutes = iExpectedMinutes;
		this.oTPS._iSeconds = iExpectedSeconds;

		// act
		this.oTPS._handleHoursChange({ getParameter: function() { "23"; } });

		// assert
		assert.ok(oMinutesSlider._setEnabled.calledWithExactly(true), "Minutes slider should be enabled");
		assert.ok(oMinutesSlider.setSelectedValue.calledWithExactly(iExpectedMinutes), "Minutes slider value should be set to " + iExpectedMinutes);
		assert.ok(oSecondsSlider._setEnabled.calledWithExactly(true), "Seconds slider should be enabled");
		assert.ok(oSecondsSlider.setSelectedValue.calledWithExactly(iExpectedSeconds), "Seconds slider value should be set to " + iExpectedSeconds);

		// cleanup
		oMinutesSliderStub.restore();
		oSecondsSliderStub.restore();
	});

	QUnit.test("_handleHoursChange disables minutes and seconds slider and sets 0 values them", function (assert) {
		// arrange
		var iExpectedMinutes = "0",
			iExpectedSeconds = "0",
			oMinutesSlider = { _getEnabled: function () { return true; }, _setEnabled: this.spy(), setSelectedValue: this.spy(), _updateStepAndValue: this.spy(), getSelectedValue: this.spy() },
			oSecondsSlider = { _getEnabled: function () { return true; }, _setEnabled: this.spy(), setSelectedValue: this.spy(), _updateStepAndValue: this.spy(), getSelectedValue: this.spy() },
			oMinutesSliderStub = this.stub(this.oTPS, "_getMinutesSlider", function () { return oMinutesSlider; }),
			oSecondsSliderStub = this.stub(this.oTPS, "_getSecondsSlider", function () { return oSecondsSlider; });
		this.oTPS.setSupport2400(true);

		// act
		this.oTPS._handleHoursChange({ getParameter: function() { return "24"; } });

		// assert
		assert.ok(oMinutesSlider._setEnabled.calledWithExactly(true), "Minutes slider should be disabled");
		assert.ok(oMinutesSlider.setSelectedValue.calledWithExactly(iExpectedMinutes), "Minutes slider value should be set to " + iExpectedMinutes);
		assert.ok(oSecondsSlider._setEnabled.calledWithExactly(true), "Seconds slider should be disabled");
		assert.ok(oSecondsSlider.setSelectedValue.calledWithExactly(iExpectedSeconds), "Seconds slider value should be set to " + iExpectedSeconds);

		// cleanup
		oMinutesSliderStub.restore();
		oSecondsSliderStub.restore();
	});

	QUnit.test("_replaceZeroHoursWith24 should properly replace the hours part from the string", function (assert) {
		// Hours part is in the first part
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("00:00:00", 0, 0), "24:00:00"); // valueFormat is "HH:mm:ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("0:00:00", -1, 0), "24:00:00"); // valueFormat is "H:mm:ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("00:00:00", 3, 3), "00:24:00"); // valueFormat is "mm:HH:ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("00:0:00", -1, 3), "00:24:00"); // valueFormat is "mm:H:ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("00:00:00", 6, 6), "00:00:24"); // valueFormat is "mm:ss:HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("00:00:0", -1, 6), "00:00:24"); // valueFormat is "mm:ss:H", iIndexOfHH is -1, iIndexOfH is 6

		// Use Different separators than the ":" For example "-"

		// Hours part is in the first part
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("00-00-00", 0, 0), "24-00-00"); // valueFormat is "HH-mm-ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("0-00-00", -1, 0), "24-00-00"); // valueFormat is "H-mm-ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("00-00-00", 3, 3), "00-24-00"); // valueFormat is "mm-HH-ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("00-0-00", -1, 3), "00-24-00"); // valueFormat is "mm-H-ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("00-00-00", 6, 6), "00-00-24"); // valueFormat is "mm-ss-HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.equal(TimePickerSliders._replaceZeroHoursWith24("00-00-0", -1, 6), "00-00-24"); // valueFormat is "mm-ss-H", iIndexOfHH is -1, iIndexOfH is 6
	});

	QUnit.test("_replaceZeroHoursWith24 should properly replace the hours part from the string", function (assert) {
		// Hours part is in the first part
		assert.equal(TimePickerSliders._replace24HoursWithZero("24:00:00", 0, 0), "00:00:00"); // valueFormat is "HH:mm:ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.equal(TimePickerSliders._replace24HoursWithZero("24:00:00", -1, 0), "0:00:00"); // valueFormat is "H:mm:ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.equal(TimePickerSliders._replace24HoursWithZero("00:24:00", 3, 3), "00:00:00"); // valueFormat is "mm:HH:ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.equal(TimePickerSliders._replace24HoursWithZero("00:24:00", -1, 3), "00:0:00"); // valueFormat is "mm:H:ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.equal(TimePickerSliders._replace24HoursWithZero("00:00:24", 6, 6), "00:00:00"); // valueFormat is "mm:ss:HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.equal(TimePickerSliders._replace24HoursWithZero("00:00:24", -1, 6), "00:00:0"); // valueFormat is "mm:ss:H", iIndexOfHH is -1, iIndexOfH is 6

		// Use Different separators than the ":" For example "-"

		// Hours part is in the first part
		assert.equal(TimePickerSliders._replace24HoursWithZero("24-00-00", 0, 0), "00-00-00"); // valueFormat is "HH-mm-ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.equal(TimePickerSliders._replace24HoursWithZero("24-00-00", -1, 0), "0-00-00"); // valueFormat is "H-mm-ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.equal(TimePickerSliders._replace24HoursWithZero("00-24-00", 3, 3), "00-00-00"); // valueFormat is "mm-HH-ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.equal(TimePickerSliders._replace24HoursWithZero("00-24-00", -1, 3), "00-0-00"); // valueFormat is "mm-H-ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.equal(TimePickerSliders._replace24HoursWithZero("00-00-24", 6, 6), "00-00-00"); // valueFormat is "mm-ss-HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.equal(TimePickerSliders._replace24HoursWithZero("00-00-24", -1, 6), "00-00-0"); // valueFormat is "mm-ss-H", iIndexOfHH is -1, iIndexOfH is 6
	});

	QUnit.test("_isHoursValue24 should properly checks if hours value is 24", function (assert) {
		// Hours part is in the first part
		assert.ok(TimePickerSliders._isHoursValue24("24:00:00", 0, 0)); // valueFormat is "HH:mm:ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.ok(TimePickerSliders._isHoursValue24("24:00:00", -1, 0)); // valueFormat is "H:mm:ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.ok(TimePickerSliders._isHoursValue24("00:24:00", 3, 3)); // valueFormat is "mm:HH:ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.ok(TimePickerSliders._isHoursValue24("00:24:00", -1, 3)); // valueFormat is "mm:H:ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.ok(TimePickerSliders._isHoursValue24("00:00:24", 6, 6)); // valueFormat is "mm:ss:HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.ok(TimePickerSliders._isHoursValue24("00:00:24", -1, 6)); // valueFormat is "mm:ss:H", iIndexOfHH is -1, iIndexOfH is 6

		// Use Different separators than the ":" For example "-"

		// Hours part is in the first part
		assert.ok(TimePickerSliders._isHoursValue24("24-00-00", 0, 0)); // valueFormat is "HH-mm-ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.ok(TimePickerSliders._isHoursValue24("24-00-00", -1, 0)); // valueFormat is "H-mm-ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.ok(TimePickerSliders._isHoursValue24("00-24-00", 3, 3)); // valueFormat is "mm-HH-ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.ok(TimePickerSliders._isHoursValue24("00-24-00", -1, 3)); // valueFormat is "mm-H-ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.ok(TimePickerSliders._isHoursValue24("00-00-24", 6, 6)); // valueFormat is "mm-ss-HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.ok(TimePickerSliders._isHoursValue24("00-00-24", -1, 6)); // valueFormat is "mm-ss-H", iIndexOfHH is -1, iIndexOfH is 6
	});

	QUnit.test("_isHoursValue24 should properly checks if hours value is not 24", function (assert) {
		// Hours part is in the first part
		assert.ok(!TimePickerSliders._isHoursValue24("23:00:00", 0, 0)); // valueFormat is "HH:mm:ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.ok(!TimePickerSliders._isHoursValue24("23:00:00", -1, 0)); // valueFormat is "H:mm:ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.ok(!TimePickerSliders._isHoursValue24("00:23:00", 3, 3)); // valueFormat is "mm:HH:ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.ok(!TimePickerSliders._isHoursValue24("00:23:00", -1, 3)); // valueFormat is "mm:H:ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.ok(!TimePickerSliders._isHoursValue24("00:00:23", 6, 6)); // valueFormat is "mm:ss:HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.ok(!TimePickerSliders._isHoursValue24("00:00:23", -1, 6)); // valueFormat is "mm:ss:H", iIndexOfHH is -1, iIndexOfH is 6

		// Use Different separators than the ":" For example "-"

		// Hours part is in the first part
		assert.ok(!TimePickerSliders._isHoursValue24("23-00-00", 0, 0)); // valueFormat is "HH-mm-ss", iIndexOfHH is 0, iIndexOfH is 0
		assert.ok(!TimePickerSliders._isHoursValue24("23-00-00", -1, 0)); // valueFormat is "H-mm-ss", iIndexOfHH is -1, iIndexOfH is 0

		// Hours part is in the second part
		assert.ok(!TimePickerSliders._isHoursValue24("00-23-00", 3, 3)); // valueFormat is "mm-HH-ss", iIndexOfHH is 3, iIndexOfH is 3
		assert.ok(!TimePickerSliders._isHoursValue24("00-23-00", -1, 3)); // valueFormat is "mm-H-ss", iIndexOfHH is -1, iIndexOfH is 3

		// Hours part is in the third part
		assert.ok(!TimePickerSliders._isHoursValue24("00-00-23", 6, 6)); // valueFormat is "mm-ss-HH", iIndexOfHH is 6, iIndexOfH is 6
		assert.ok(!TimePickerSliders._isHoursValue24("00-00-23", -1, 6)); // valueFormat is "mm-ss-H", iIndexOfHH is -1, iIndexOfH is 6
	});

	QUnit.test("_disableSlider should set value to 0 and call _setEnabled with proper value", function(assert) {
		// arrange
		var oSlider = { _setEnabled: this.spy() };

		// act
		this.oTPS._disableSlider(oSlider);

		// assert
		assert.ok(oSlider._setEnabled.calledWith(false), "_setEnabled should be called with false");
	});

	QUnit.test("_enableSlider should set value to provided value and call _setEnbled with proper value", function(assert) {
		// arrange
		var oSlider = { _setEnabled: this.spy() };

		// act
		this.oTPS._enableSlider(oSlider);

		// assert
		assert.ok(oSlider._setEnabled.calledWith(true), "_setEnabled should be called with true");
	});

	QUnit.module("Misc", {
		beforeEach: function () {
			this.oTPS = new TimePickerSliders();

			this.oTPS.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oTPS.destroy();
			this.oTPS = null;
		}
	});

	QUnit.test("When drag and drop a slider, mouse wheel events are not handled", function () {
		var oFirstSlider = this.oTPS._getFirstSlider(),
			oSpyWheeling = this.spy(oFirstSlider, "_handleWheelScroll");

		// act
		oFirstSlider.setIsExpanded(true);
		oFirstSlider._animateScroll();
		oFirstSlider._onmousewheel({
			preventDefault: function () {},
			stopPropagation: function () {}
		});

		// assert
		sinon.assert.notCalled(oSpyWheeling, "_onmousewheel didn't simulate the wheeling");
	});

	// BCP: 1880065660
	QUnit.test("_setTimeValues with iframe's JS date object should set properly the date", function (assert) {
		// arrange
		var iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		var oWindow = iframe.contentWindow;
		oWindow.dateObj = new oWindow.Date(2017, 11, 12);

		// act
		this.oTPS._setTimeValues(oWindow.dateObj);

		// assert
		assert.ok(true, "_setTimeValues did not throw an expection with date object from an iframe");

		// cleanup
		document.body.removeChild(iframe);
		iframe = null;
	});

	QUnit.test("_convertNumPadToNumKeyCode on TimePickerSlider should convert numpad to nums", function (assert) {
		// arrange
		var oKCs = jQuery.sap.KeyCodes,
			oSlider = this.oTPS._getFirstSlider();

		// assert
		assert.equal(oSlider._convertNumPadToNumKeyCode(oKCs.NUMPAD_0), "0".charCodeAt(0), "numpad 0 char code should be converted to 0's char code");
		assert.equal(oSlider._convertNumPadToNumKeyCode(oKCs.NUMPAD_1), "1".charCodeAt(0), "numpad 1 char code should be converted to 1's char code");
		assert.equal(oSlider._convertNumPadToNumKeyCode(oKCs.NUMPAD_2), "2".charCodeAt(0), "numpad 2 char code should be converted to 2's char code");
		assert.equal(oSlider._convertNumPadToNumKeyCode(oKCs.NUMPAD_3), "3".charCodeAt(0), "numpad 3 char code should be converted to 3's char code");
		assert.equal(oSlider._convertNumPadToNumKeyCode(oKCs.NUMPAD_4), "4".charCodeAt(0), "numpad 4 char code should be converted to 4's char code");
		assert.equal(oSlider._convertNumPadToNumKeyCode(oKCs.NUMPAD_5), "5".charCodeAt(0), "numpad 5 char code should be converted to 5's char code");
		assert.equal(oSlider._convertNumPadToNumKeyCode(oKCs.NUMPAD_6), "6".charCodeAt(0), "numpad 6 char code should be converted to 6's char code");
		assert.equal(oSlider._convertNumPadToNumKeyCode(oKCs.NUMPAD_7), "7".charCodeAt(0), "numpad 7 char code should be converted to 7's char code");
		assert.equal(oSlider._convertNumPadToNumKeyCode(oKCs.NUMPAD_8), "8".charCodeAt(0), "numpad 8 char code should be converted to 8's char code");
		assert.equal(oSlider._convertNumPadToNumKeyCode(oKCs.NUMPAD_9), "9".charCodeAt(0), "numpad 9 char code should be converted to 9's char code");
	});

	QUnit.test("_convertNumPadToNumKeyCode on TimePickerSlider should return the keycode of the provided key if it is not numpad", function (assert) {
		// arrange
		var oKCs = jQuery.sap.KeyCodes,
			oSlider = this.oTPS._getFirstSlider();

		// assert
		for (var i = 0; i < 10; i++) {
			assert.equal(oSlider._convertNumPadToNumKeyCode(("" + i).charCodeAt(0)), ("" + i).charCodeAt(0), "should be not converted");
		}
	});

	QUnit.test("Given an Hours slider, when collapsed before animation is completed", function(assert) {
		// Prepare
		var oSpyScrollerSnapped = this.spy(this.oTPS._getHoursSlider(), "_scrollerSnapped"),
			currentIndex = this.oTPS._getHoursSlider()._iSelectedItemIndex;

		// Act
		this.oTPS._getHoursSlider()._offsetValue(1); // moves (offsets) the value by one (vertically). Animation is stared.
		try {
			this.oTPS._getHoursSlider().setIsExpanded(false);
		} catch (e) {
			assert.ok(false, "then no exception should be thrown");
		}

		// Assert
		assert.equal(oSpyScrollerSnapped.callCount, 1, "_scrollerSnapped should be called");
		assert.ok(oSpyScrollerSnapped.calledWith(currentIndex + 1), "snapped to the next value");
	});

	QUnit.test("Given an Hours slider, when another animation is queued", function(assert) {
		// Prepare
		var oSpyScrollerSnapped = this.spy(this.oTPS._getHoursSlider(), "_scrollerSnapped"),
			currentIndex = this.oTPS._getHoursSlider()._iSelectedItemIndex;

		// Act
		this.oTPS._getHoursSlider()._offsetValue(1); // moves (offsets) the value by one (vertically). Animation is stared.
		this.oTPS._getHoursSlider()._offsetValue(1); // another animation is started

		// Assert - before the second animation finished
		assert.equal(oSpyScrollerSnapped.callCount, 1, "_scrollerSnapped should be called");
		assert.ok(oSpyScrollerSnapped.calledWith(currentIndex + 1), "snapped to the next value");
	});
});