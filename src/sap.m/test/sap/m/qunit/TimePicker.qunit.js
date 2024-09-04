/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/LanguageTag",
	"sap/base/i18n/Localization",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/InvisibleText",
	"sap/ui/test/TestUtils",
	"sap/m/TimePickerClocks",
	"sap/m/library",
	"sap/m/TimePicker",
	"sap/ui/thirdparty/jquery",
	"sap/m/DatePicker",
	"sap/m/DateTimeField",
	"sap/ui/model/type/Time",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/InputBase",
	"sap/ui/core/Locale",
	"sap/m/Label",
	"sap/m/Button",
	"sap/ui/core/LocaleData",
	"sap/m/MaskEnabler",
	"sap/ui/model/odata/type/Time",
	"sap/ui/Device",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/nextUIUpdate",
	// provides jQuery.fn.cursorPos
	"sap/ui/dom/jquery/cursorPos"
], function(
	Formatting,
	LanguageTag,
	Localization,
	Library,
	qutils,
	createAndAppendDiv,
	DateFormat,
	InvisibleText,
	TestUtils,
	TimePickerClocks,
	mobileLibrary,
	TimePicker,
	jQuery,
	DatePicker,
	DateTimeField,
	Time,
	JSONModel,
	ODataModel,
	InputBase,
	Locale,
	Label,
	Button,
	LocaleData,
	MaskEnabler,
	typeTime,
	Device,
	XMLView,
	KeyCodes,
	UI5Date,
	Element,
	nextUIUpdate
) {
	"use strict";

	// shortcut for sap.m.TimePickerMaskMode
	var TimePickerMaskMode = mobileLibrary.TimePickerMaskMode;

	createAndAppendDiv("content");
	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");
	var sMyxml =
		"<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\">" +
		"    <VBox binding=\"{/EdmTypesCollection(ID='1')}\">" +
		"        <TimePicker id=\"tp1\"" +
		"            value=\"{" +
		"                path: 'Time'," +
		"                type: 'sap.ui.model.odata.type.Time'" +
		"            }\"" +
		"            displayFormat= \"HH:mm\"" +
		"        />" +
		"        <TimePicker id=\"tp2\"" +
		"            valueFormat= \"HH:mm\"" +
		"            value=\"{" +
		"                path: 'Time'," +
		"                type: 'sap.ui.model.odata.type.Time'," +
		"                constraints: { nullable: false }" +
		"            }\"" +
		"        />" +
		"        <TimePicker id=\"tp3\"" +
		"            displayFormat= \"HH:mm:ss\"" +
		"            value=\"{" +
		"                path: 'Time'," +
		"                type: 'sap.ui.model.odata.type.Time'," +
		"                formatOptions: {" +
		"                    style: 'short'" +
		"                }" +
		"            }\"" +
		"            valueFormat= \"h:mm:ss a\"" +
		"        />" +
		"        <TimePicker id=\"tp4\"" +
		"            value=\"{" +
		"                path: 'Time'," +
		"                type: 'sap.ui.model.odata.type.Time'," +
		"                formatOptions: {" +
		"                    pattern: 'HH:mm'" +
		"                }" +
		"            }\"" +
		"        />" +
		"    </VBox>" +
		"</mvc:View>";


	QUnit.module("step precision in time picker", {
		beforeEach: async function() {
			this.oTp = new TimePicker();
			this.oTp.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTp.destroy();
			this.oTp = null;
		}
	});

	QUnit.test("clocks initial minutesStep value", function(assert) {
		var STEP = 17;
		this.oTp.setMinutesStep(STEP);

		//Assert
		assert.ok(!this.oTp._getClocks(), "no picker -> no clocks");

		//Act
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		//Assert
		assert.equal(this.oTp._getClocks().getMinutesStep(), STEP, "initial value of the time picker for minutesStep is used");
	});

	QUnit.test("setMinutesStep", function(assert) {
		var oSpySetProperty,
			oSpyClocksSetMinutesStep,
				STEP = 23;
		//arrange
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		oSpySetProperty = this.spy(this.oTp, "setProperty");
		oSpyClocksSetMinutesStep = this.spy(this.oTp._getClocks(), "setMinutesStep");

		//Act
		this.oTp.setMinutesStep(STEP);

		//Assert
		assert.ok(oSpyClocksSetMinutesStep.calledWith(STEP), "setMinutesStep is propagated to the picker part");
		assert.ok(oSpySetProperty.calledWith("minutesStep", STEP, true), "property is updated without re-rendering");
	});

	QUnit.test("setMinutesStep corrects value 0 to 1", function(assert) {
		var oSpySetProperty,
			oSpyClocksSetMinutesStep,
				step = 0,
				expectedStep = 1;

		//arrange
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		oSpySetProperty = this.spy(this.oTp, "setProperty");
		oSpyClocksSetMinutesStep = this.spy(this.oTp._getClocks(), "setMinutesStep");

		//Act
		this.oTp.setMinutesStep(step);

		//Assert
		assert.ok(oSpyClocksSetMinutesStep.calledWith(expectedStep), "setMinutesStep is propagated to the picker part with corrected value - 0 becomes 1");
		assert.ok(oSpySetProperty.calledWith("minutesStep", expectedStep, true), "property is updated without re-rendering. Setter is called with corrected value - 0 becomes 1");

		oSpySetProperty.restore();
		oSpyClocksSetMinutesStep.restore();
	});

	QUnit.test("setSecondsStep corrects value 0 to 1", function(assert) {
		var oSpySetProperty,
				oSpyClocksSetSecondsStep,
				step = 0,
				expectedStep = 1;

		//arrange
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		oSpySetProperty = this.spy(this.oTp, "setProperty");
		oSpyClocksSetSecondsStep = this.spy(this.oTp._getClocks(), "setSecondsStep");

		//Act
		this.oTp.setSecondsStep(step);

		//Assert
		assert.ok(oSpyClocksSetSecondsStep.calledWith(expectedStep), "setSecondsStep is propagated to the picker part with corrected value - 0 becomes 1");
		assert.ok(oSpySetProperty.calledWith("secondsStep", expectedStep, true), "property is updated without re-rendering. Setter is called with corrected value - 0 becomes 1");

		oSpySetProperty.restore();
		oSpyClocksSetSecondsStep.restore();
	});

	QUnit.test("setMinutesStep corrects negative values to 1", function(assert) {
		var oSpySetProperty,
				oSpyClocksSetMinutesStep,
				step = -2,
				expectedStep = 1;

		//arrange
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		oSpySetProperty = this.spy(this.oTp, "setProperty");
		oSpyClocksSetMinutesStep = this.spy(this.oTp._getClocks(), "setMinutesStep");

		//Act
		this.oTp.setMinutesStep(step);

		//Assert
		assert.ok(oSpyClocksSetMinutesStep.calledWith(expectedStep), "setMinutesStep is propagated to the picker part with corrected value - -2 becomes 1");
		assert.ok(oSpySetProperty.calledWith("minutesStep", expectedStep, true), "property is updated without re-rendering. Setter is called with corrected value - -2 becomes 1");

		oSpySetProperty.restore();
		oSpyClocksSetMinutesStep.restore();
	});

	QUnit.test("setSecondsStep corrects negative values to 1", function(assert) {
		var oSpySetProperty,
				oSpyClocksSetSecondsStep,
				step = -2,
				expectedStep = 1;

		//arrange
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		oSpySetProperty = this.spy(this.oTp, "setProperty");
		oSpyClocksSetSecondsStep = this.spy(this.oTp._getClocks(), "setSecondsStep");

		//Act
		this.oTp.setSecondsStep(step);

		//Assert
		assert.ok(oSpyClocksSetSecondsStep.calledWith(expectedStep), "setSecondsStep is propagated to the picker part with corrected value - -2 becomes 1");
		assert.ok(oSpySetProperty.calledWith("secondsStep", expectedStep, true), "property is updated without re-rendering. Setter is called with corrected value - -2 becomes 1");

		oSpySetProperty.restore();
		oSpyClocksSetSecondsStep.restore();
	});

	QUnit.module("step precision in clocks", {
		beforeEach: async function() {
			this.oClocks = new TimePickerClocks({
				labelText: "label",
				minutesStep: this.STEP
			});
			this.oClocks.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oClocks.destroy();
			this.oClocks = null;
		},
		STEP: 5,
		ANOTHER_STEP: 14
	});

	QUnit.test("setMinutesStep", function(assert) {
		var oSpySetProperty = this.spy(this.oClocks, "setProperty");

		//Act
		this.oClocks.setMinutesStep(this.ANOTHER_STEP);

		//Assert
		assert.ok(oSpySetProperty.calledWith("minutesStep", this.ANOTHER_STEP, true), "property updated without re-rendering");
	});

	QUnit.module("API", {
		beforeEach : async function() {
			this.clock = sinon.useFakeTimers();
			this.oTimePicker = new TimePicker("t1");
			this.oTimePicker.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach : async function() {
			this.clock.restore();
			this.oTimePicker.destroy();
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("DOM", function(assert) {
		assert.strictEqual(this.oTimePicker.$().length, 1, "the control is in the DOM");
	});

	QUnit.test("After creating a timePicker, the picker aggregation is empty until the picker is opened", function (assert) {
		assert.ok(!this.oTimePicker._getPicker(), "the picker aggregation is empty before opening the picker");
	});

	QUnit.test("After creating a timePicker, the picker aggregation holds a responsivePopover instance", function(assert) {
		this.oTimePicker._openPicker();
		assert.ok(this.oTimePicker._getPicker(), "the picker aggregation is not empty");
		assert.strictEqual(this.oTimePicker._getPicker().getMetadata().getName(), "sap.m.ResponsivePopover", "the picker aggregation holds an instance of responsivePopover");
	});

	QUnit.test("After creating new timePicker, the format property is initialized with its default value", function(assert) {
		//\u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.strictEqual(this.oTimePicker.getDisplayFormat(), "h:mm:ss\u202fa", "the default value is h:mm:ss a");
	});

	QUnit.test("After changing the displayFormat property, the getDisplayFormat function returns the new value", function(assert) {
		var newFormat = "hh:mm:ss";
		this.oTimePicker.setDisplayFormat(newFormat);
		assert.strictEqual(this.oTimePicker.getDisplayFormat(), newFormat, "the format property was changed");
	});

	QUnit.test("ValueHelp icon is not visible when timepicker is not editable", function (assert) {
		// arrange
		var oTimePicker = new DatePicker({ editable: false }),
			oValueHelpIconSetPropertySpy = this.spy(),
			oValueHelpIconStub = this.stub(oTimePicker, "_getValueHelpIcon").callsFake(function () {
				return { setProperty: oValueHelpIconSetPropertySpy };
			});

		// act
		oTimePicker.onBeforeRendering();

		// assert
		assert.equal(oValueHelpIconSetPropertySpy.getCall(0).args[0], "visible", "setProperty of the icon should be called for visible");
		assert.equal(oValueHelpIconSetPropertySpy.getCall(0).args[1], false, "visible property should be set to false");

		// cleanup
		oValueHelpIconStub.restore();
		oTimePicker.destroy();
	});

	QUnit.test("showCurrentTimeButton - button existence", async function(assert) {
		// Prepare
		this.oTimePicker.setShowCurrentTimeButton(true);
		await nextUIUpdate(this.clock);
		this.oTimePicker.toggleOpen();
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(this.oTimePicker._getClocks().getShowCurrentTimeButton(), "Now button visibility is propagated to the clocks");
	});

	QUnit.test('No exception thrown when onBeforeOpen runs without set value', function (assert) {
		this.stub(this.oTimePicker, "_getClocks").returns(
			{
				setValue: function () {},
				_setTimeValues: function () {}
			});

		this.oTimePicker.onBeforeOpen();

		assert.ok(true, "Еxception is not thrown when running onBeforeOpen without date value");
	});

	QUnit.module("Placeholder", {
		beforeEach: async function () {
			// SUT
			this.oTimePicker = new TimePicker();
			this.oTimePicker.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			// Cleanup
			this.oTimePicker.destroy();
			this.oTimePicker = null;
		}
	});

	QUnit.test("Default", function (assert) {
		// Assert
		assert.equal(this.oTimePicker.getPlaceholder(), "", "The placeholder is empty string");
	});

	QUnit.test("Empty", function (assert) {
		// Act
		this.oTimePicker.setPlaceholder();
		// Assert
		assert.equal(this.oTimePicker.getPlaceholder(), "", "The placeholder is empty string");
	});

	QUnit.test("Custom", function (assert) {
		// Act
		this.oTimePicker.setPlaceholder("My Placeholder");
		// Assert
		assert.equal(this.oTimePicker.getPlaceholder(), "My Placeholder", "The placeholder is 'My Placeholder'");
	});

	QUnit.test("Set displayFormat to 'HH:mm'", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat("HH:mm");
		var sPlaceholderPrefix = Library.getResourceBundleFor("sap.ui.core").getText("date.placeholder").split("{")[0];
		// Assert
		assert.ok(this.oTimePicker._getPlaceholder().includes(sPlaceholderPrefix), "The placeholder is correct");
	});

	QUnit.test("Set displayFormat to 'short'", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat("short");
		var sPlaceholderPrefix = Library.getResourceBundleFor("sap.ui.core").getText("date.placeholder").split("{")[0];
		// Assert
		assert.ok(this.oTimePicker._getPlaceholder().includes(sPlaceholderPrefix), "The placeholder is correct");
	});

	QUnit.module("Display format", {
		beforeEach: async function () {
			// SUT
			this.oTimePicker = new TimePicker({
				dateValue: UI5Date.getInstance(2016, 1, 17, 10, 11, 12)
			});
			this.oTimePicker.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			// Cleanup
			this.oTimePicker.destroy();
			this.oTimePicker = null;
		}
	});

	QUnit.test("Default", function (assert) {
		// Assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(this.oTimePicker._$input.val(), "10:11:12\u202fAM", "Display format is correct");
	});

	QUnit.test("Empty", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat();
		// Assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(this.oTimePicker._$input.val(), "10:11:12\u202fAM", "Display format is correct");
	});

	QUnit.test("Custom", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat("HH+mm");
		// Assert
		assert.equal(this.oTimePicker._$input.val(), "10+11", "Display format is correct");
	});

	QUnit.test("Wrong", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat("jj:ll:TT");
		// Assert
		assert.equal(this.oTimePicker._$input.val(), "jj:ll:TT", "Display format is wrong");
	});

	QUnit.test("HH:mm", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat("HH:mm");
		// Assert
		assert.equal(this.oTimePicker._$input.val(), "10:11", "Display format is correct");
	});

	QUnit.test("short", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat("short");
		// Assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(this.oTimePicker._$input.val(), "10:11\u202fAM", "Display format is correct");
	});

	QUnit.test("medium", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat("medium");
		// Assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(this.oTimePicker._$input.val(), "10:11:12\u202fAM", "Display format is correct");
	});

	QUnit.module("Input formats, display formats and values", {
		beforeEach: function() {
			this._defaultFormatter = DateFormat.getTimeInstance({style: "medium", strictParsing: true, relative: false});
		}
	});

	//helpers
	var caseIndex = 0;
	function getID() {
		return "case" + (++caseIndex).toString();
	}

	function getDate(hours, minutes, seconds) {
		return UI5Date.getInstance("2000", "1", "1", hours, minutes, seconds);
	}

	//test the final result after setting some properties in order
	async function generateValuesTest(aSetValues, oExpectedValues) {
		//system under test
		var tp = new TimePicker(),
			i;

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate();

		//act
		for (i = 0; i < aSetValues.length; i++) {
			tp[aSetValues[i]["key"]](aSetValues[i]["value"]);
		}

		//assert
		// trim because the framework formatter has no leading space,
		// but the tp now has a leading space for for h:mm, H:mm format
		QUnit.assert.equal(jQuery("#" + tp.getId() + "-inner").val().trim(), oExpectedValues["expInputVal"], "$input.val() ok");

		QUnit.assert.equal(tp.getValue(), oExpectedValues["expValue"], "getValue() ok");

		var oDateValue = tp.getDateValue();
		oDateValue.setFullYear(oExpectedValues["expDateValue"].getFullYear());
		oDateValue.setMonth(oExpectedValues["expDateValue"].getMonth());
		oDateValue.setDate(oExpectedValues["expDateValue"].getDate());
		QUnit.assert.equal(oDateValue.toString(), oExpectedValues["expDateValue"].toString(), "getDateValue ok");

		//cleanup
		tp.destroy();
	}

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setValue", value: "13:34:00" },
					{ key: "setValueFormat", value: "HH:mm:ss" }
				],
				{
					expInputVal: that._defaultFormatter.format(getDate(13, 34, 0)),
					expValue: "13:34:00",
					expDateValue: getDate(13, 34, 0)
				});
	});

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setValueFormat", value: "HH:mm:ss" },
					{ key: "setValue", value: "21:13:14" }
				],
				{
					expInputVal: that._defaultFormatter.format(getDate(21, 13, 14)),
					expValue: "21:13:14",
					expDateValue: getDate(21, 13, 14)
				});
	});

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setValue", value: "4:15:55" }
				],
				{
					expInputVal: that._defaultFormatter.format(getDate(4, 15, 55)),
					expValue: "4:15:55",
					expDateValue: getDate(4, 15, 55)
				});
	});

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setValue", value: that._defaultFormatter.format(getDate(17, 27, 43)) },
					{ key: "setDisplayFormat", value: "HH:mm" }
				],
				{
					expInputVal: "17:27",
					expValue: that._defaultFormatter.format(getDate(17, 27, 43)),
					expDateValue: getDate(17, 27, 43)
				});
	});

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setDisplayFormat", value: "HH:mm" },
					{ key: "setValue", value:  that._defaultFormatter.format(getDate(17, 5, 33)) }
				],
				{
					expInputVal: "17:05",
					expValue:  that._defaultFormatter.format(getDate(17, 5, 33)),
					expDateValue: getDate(17, 5, 33)
				});
	});

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setDisplayFormat", value: "HH:mm" },
					{ key: "setDateValue", value: getDate(17, 27, 43) }
				],
				{
					expInputVal: "17:27",
					expValue: that._defaultFormatter.format(getDate(17, 27, 43)),
					expDateValue: getDate(17, 27, 43)
				});
	});

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setDateValue", value: getDate(17, 27, 43) },
					{ key: "setDisplayFormat", value: "HH:mm" }
				],
				{
					expInputVal: "17:27",
					expValue: that._defaultFormatter.format(getDate(17, 27, 43)),
					expDateValue: getDate(17, 27, 43)
				});
	});

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setDateValue", value: getDate(17, 27, 43) },
					{ key: "setValue", value: that._defaultFormatter.format(getDate(18, 37, 23)) }
				],
				{
					expInputVal: that._defaultFormatter.format(getDate(18, 37, 23)),
					expValue: that._defaultFormatter.format(getDate(18, 37, 23)),
					expDateValue: getDate(18, 37, 23)
				});
	});

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setValue", value: that._defaultFormatter.format(getDate(6, 37, 23)) },
					{ key: "setDateValue", value: getDate(5, 28, 40) }
				],
				{
					expInputVal: that._defaultFormatter.format(getDate(5, 28, 40)),
					expValue: that._defaultFormatter.format(getDate(5, 28, 40)),
					expDateValue: getDate(5, 28, 40)
				});
	});

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setValue", value: that._defaultFormatter.format(getDate(6, 37, 23)) },
					{ key: "setDisplayFormat", value: "hh:mm a" },
					{ key: "setDateValue", value: getDate(5, 28, 40) }
				],
				{
					expInputVal: DateFormat.getTimeInstance({pattern: "hh:mm a", strictParsing: true, relative: false}).format(getDate(5, 28, 40)),
					expValue: that._defaultFormatter.format(getDate(5, 28, 40)),
					expDateValue: getDate(5, 28, 40)
				});
	});

	QUnit.test(getID(), async function(assert) {
		var that = this;
		await generateValuesTest([
					{ key: "setValue", value: that._defaultFormatter.format(getDate(6, 37, 23)) },
					{ key: "setDateValue", value: getDate(5, 28, 40) },
					{ key: "setDisplayFormat", value: "hh:mm a" }
				],
				{
					expInputVal: DateFormat.getTimeInstance({pattern: "hh:mm a", strictParsing: true, relative: false}).format(getDate(5, 28, 40)),
					expValue: that._defaultFormatter.format(getDate(5, 28, 40)),
					expDateValue: getDate(5, 28, 40)
				});
	});

	QUnit.test(getID(), async function(assert) {
		await generateValuesTest([
					{ key: "setValueFormat", value: "HH:mm" },
					{ key: "setValue", value: "18:37" },
					{ key: "setDisplayFormat", value: "hh:mm:ss a" }
				],
				{
					expInputVal: DateFormat.getTimeInstance({pattern: "hh:mm:ss a", strictParsing: true, relative: false}).format(getDate(18, 37, 0)),
					expValue:  "18:37",
					expDateValue: getDate(18, 37, 0)
				});
	});

	QUnit.test(getID(), async function(assert) {
		await generateValuesTest([
					{ key: "setValueFormat", value: "HH:mm" },
					{ key: "setValue", value: "18:37" },
					{ key: "setDisplayFormat", value: "hh a" }
				],
				{
					expInputVal: DateFormat.getTimeInstance({pattern: "hh a", strictParsing: true, relative: false}).format(getDate(18, 37, 0)),
					expValue: "18:37",
					expDateValue: getDate(18, 37, 0)
				});
	});

	QUnit.test(getID(), async function(assert) {
		await generateValuesTest([
					{ key: "setValueFormat", value: "HH:mm" },
					{ key: "setDateValue", value: getDate(18, 37, 0) },
					{ key: "setDisplayFormat", value: "hh a" }
				],
				{
					expInputVal: DateFormat.getTimeInstance({pattern: "hh a", strictParsing: true, relative: false}).format(getDate(18, 37, 0)),
					expValue: "18:37",
					expDateValue: getDate(18, 37, 0)
				});
	});

	QUnit.test("test locale", async function(assert) {
		await generateValuesTest([
					{ key: "setValueFormat", value: "hh:mm a" },
					{ key: "setValue", value: "11:50 PM" },
					{ key: "setDisplayFormat", value: "hh:mm a" },
					{ key: "setLocaleId", value: "de_DE"}
				],
				{
					expInputVal: "11:50 PM",
					expValue: "11:50 PM",
					expDateValue: getDate(23, 50, 0)
				});
	});

	QUnit.test("test default locale", async function (assert) {
		var stub = sinon.stub(Formatting, "getLanguageTag").returns(new LanguageTag('ar'));
		//Test default browser locale set to arabic
		await generateValuesTest([
			{ key: "setDisplayFormat", value: "hh:mm:ss a"},
			{ key: "setValueFormat", value: "hh:mm a"},
			{ key: "setDateValue", value: getDate(23, 32, 0)}
		], {
			expInputVal: "11:32:00 م",
			expValue: "11:32 م",
			expDateValue: getDate(23, 32, 0)
		});
		//Test default browser local set to arabic and also custom TimePicker locale set to German
		await generateValuesTest([
			{ key: "setLocaleId", value: "de_DE"},
			{ key: "setValueFormat", value: "h:mm a" },
			{ key: "setDisplayFormat", value: "hh:mm:ss a" },
			{ key: "setDateValue", value: getDate(17, 23, 18) }
		],
		{
			expValue: "5:23 PM",
			expInputVal: "05:23:18 PM",
			expDateValue: getDate(17, 23, 18)
		});

		stub.restore();
	});

	QUnit.test("_getLocale when no localeId is set", function (assert) {
		//arrange
		var oTP = new TimePicker(),
			oLocale,
			oSystemLocale = new Locale(Formatting.getLanguageTag());

		// act
		oLocale = oTP._getLocale();

		// assert
		assert.ok(!oTP.getLocaleId(), "there is no localeId specified");
		assert.strictEqual(oLocale.toString(), oSystemLocale.toString(), "'_getLocale' returns system configuration, if the user haven't specified localeId");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("_getLocale when localeId is set", function (assert) {
		// arrange
		var oTP = new TimePicker({localeId:'en'}),
			oLocale,
			oSystemLocale = new Locale(Formatting.getLanguageTag());

		// act
		oLocale = oTP._getLocale();

		// assert
		assert.equal(oTP.getLocaleId(), "en");
		assert.ok(oLocale !== oSystemLocale, "'_getLocale' is different from the system configuration, if the user have specified localeId");

		// cleanup
		oTP.destroy();
	});

	QUnit.test("Value is validated when setValue is called with null or undefined", async function (assert) {
		var oTP = new TimePicker({
				displayFormat: "HH:mm"
			});

		oTP.placeAt('qunit-fixture');
		await nextUIUpdate();

		oTP.setValue(null);
		assert.strictEqual(oTP.getValue(), "", "'getValue' is updated and returns correct VALIDATED value");
		oTP.setValue(undefined);
		assert.strictEqual(oTP.getValue(), "", "'getValue' is updated and returns correct VALIDATED value");

		oTP.destroy();
	});

	QUnit.module("Keyboard handling of input");

	QUnit.test("pageup increases the hours", function(assert) {
		//arrange
		var iHours = 4,
			oTP = new TimePicker({
				dateValue: UI5Date.getInstance(2000, 10, 10, iHours, 10, 10)
			}),
			oFakePageupEventObject = {
				preventDefault: function() {}
			};

		//act
		oTP.onsappageup(oFakePageupEventObject);

		//assert
		assert.equal(oTP.getDateValue().getHours(), iHours + 1, "The time picker hours are increased");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("pagedown decreases the hours", function(assert) {
		//arrange
		var iHours = 4,
			oTP = new TimePicker({
				dateValue: UI5Date.getInstance(2000, 10, 10, iHours, 10, 10)
			}),
			oFakePagedownEventObject = {
				preventDefault: function() {}
			};

		//act
		oTP.onsappagedown(oFakePagedownEventObject);

		//assert
		assert.equal(oTP.getDateValue().getHours(), iHours - 1, "The time picker hours are decreased");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("pageup does not have side effects", function(assert) {
		//arrange
		var iSeconds = 21,
			iMinutes = 20,
			oTP = new TimePicker({
				dateValue: UI5Date.getInstance(2000, 10, 10, 10, iMinutes, iSeconds)
			}),
			oFakePageupEventObject = {
				preventDefault: function() {}
			};

		//act
		oTP.onsappageup(oFakePageupEventObject);

		//assert
		assert.equal(oTP.getDateValue().getMinutes(), iMinutes, "The time picker minutes stay the same");
		assert.equal(oTP.getDateValue().getSeconds(), iSeconds, "The time picker seconds stay the same");
		assert.ok(!oTP._getPicker(), "picker is missing");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("shift+pageup increases the minutes", function(assert) {
		//arrange
		var iMinutes = 15,
			oTP = new TimePicker({
				dateValue: UI5Date.getInstance(2000, 10, 10, 10, iMinutes, 10)
			}),
			oFakePageupEventObject = {
				ctrlKey: false,
				metaKey: false,
				altKey:  false,
				shiftKey: true,
				preventDefault: function() {}
			};

		//act
		oTP.onsappageupmodifiers(oFakePageupEventObject);

		//assert
		assert.equal(oTP.getDateValue().getMinutes(), iMinutes + 1, "The time picker minutes are increased");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("shift+pagedown decreases the minutes", function(assert) {
		//arrange
		var iMinutes = 13,
			oTP = new TimePicker({
				dateValue: UI5Date.getInstance(2000, 10, 10, 10, iMinutes, 10)
			}),
			oFakePagedownEventObject = {
				ctrlKey: false,
				metaKey: false,
				altKey:  false,
				shiftKey: true,
				preventDefault: function() {}
			};

		//act
		oTP.onsappagedownmodifiers(oFakePagedownEventObject);

		//assert
		assert.equal(oTP.getDateValue().getMinutes(), iMinutes - 1, "The time picker minutes are decreased");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("shift+pageup does not have side effects", function(assert) {
		//arrange
		var iHours = 5,
			iSeconds = 21,
			oTP = new TimePicker({
				dateValue: UI5Date.getInstance(2000, 10, 10, iHours, 10, iSeconds)
			}),
			oFakePageupEventObject = {
				ctrlKey: false,
				metaKey: false,
				altKey:  false,
				shiftKey: true,
				preventDefault: function() {}
			};

		//act
		oTP.onsappageupmodifiers(oFakePageupEventObject);

		//assert
		assert.equal(oTP.getDateValue().getHours(), iHours, "The time picker hours stay the same");
		assert.equal(oTP.getDateValue().getSeconds(), iSeconds, "The time picker seconds stay the same");
		assert.ok(!oTP._getPicker(), "picker is missing");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("ctrl+shift+pageup increases the seconds", function(assert) {
		//arrange
		var iSeconds = 11,
			oTP = new TimePicker({
				dateValue: UI5Date.getInstance(2000, 10, 10, 10, 10, iSeconds)
			}),
			oFakePageupEventObject = {
				ctrlKey: true,
				metaKey: false,
				altKey:  false,
				shiftKey: true,
				preventDefault: function() {}
			};

		//act
		oTP.onsappageupmodifiers(oFakePageupEventObject);

		//assert
		assert.equal(oTP.getDateValue().getSeconds(), iSeconds + 1, "The time picker seconds are increased");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("ctrl+shift+pagedown decreases the seconds", function(assert) {
		//arrange
		var iSeconds = 4,
			oTP = new TimePicker({
				dateValue: UI5Date.getInstance(2000, 10, 10, 10, 10, iSeconds)
			}),
			oFakePagedownEventObject = {
				ctrlKey: true,
				metaKey: false,
				altKey:  false,
				shiftKey: true,
				preventDefault: function() {}
			};

		//act
		oTP.onsappagedownmodifiers(oFakePagedownEventObject);

		//assert
		assert.equal(oTP.getDateValue().getSeconds(), iSeconds - 1, "The time picker seconds are decreased");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("ctrl+pageup does not have side effects", function(assert) {
		//arrange
		var iHours = 5,
			iMinutes = 38,
			oTP = new TimePicker({
				dateValue: UI5Date.getInstance(2000, 10, 10, iHours, iMinutes, 10)
			}),
			oFakePageupEventObject = {
				ctrlKey: true,
				metaKey: false,
				altKey:  false,
				shiftKey: false,
				preventDefault: function() {}
			};

		//act
		oTP.onsappageupmodifiers(oFakePageupEventObject);

		//assert
		assert.equal(oTP.getDateValue().getHours(), 5, "The time picker hours stay the same");
		assert.equal(oTP.getDateValue().getMinutes(), 38, "The time picker minutes stay the same");
		assert.ok(!oTP._getPicker(), "picker is missing");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("arrow up opens the picker", async function(assert) {
		//sut
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		await nextUIUpdate();

		//arrange
		tp.focus();

		//assert
		assert.ok(!tp._getPicker(), "picker does not exist");

		//act
		qutils.triggerKeydown(tp.getDomRef(), KeyCodes.ARROW_UP, false, true, false);

		//assert
		assert.ok(tp._getPicker().isOpen(), "picker is open");

		//cleanup
		tp.destroy();
	});

	QUnit.test("arrow down opens the picker", async function(assert) {
		//sut
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		await nextUIUpdate();

		//arrange
		tp.focus();

		//assert
		assert.ok(!tp._getPicker(), "picker does not exist");

		//act
		qutils.triggerKeydown(tp.getDomRef(), KeyCodes.ARROW_DOWN, false, true, false);

		//assert
		assert.ok(tp._getPicker().isOpen(), "picker is open");

		//cleanup
		tp.destroy();
	});

	QUnit.test("right moves the cursor but jumps over the immutable chars", async function(assert) {
		//arrange
		var oDate = UI5Date.getInstance();
		oDate.setHours(5);
		oDate.setMinutes(38);

		//sut
		var tp = new TimePicker({
			dateValue: oDate,
			displayFormat: "HH:mm"
		});
		tp.placeAt("qunit-fixture");
		await nextUIUpdate();

		//arrange
		tp.focus();
		jQuery(tp.getFocusDomRef()).cursorPos(0);

		//act
		qutils.triggerKeydown(tp.getDomRef(), KeyCodes.ARROW_RIGHT, false, false, false);
		qutils.triggerKeydown(tp.getDomRef(), KeyCodes.ARROW_RIGHT, false, false, false);

		//assert
		assert.equal(jQuery(tp.getFocusDomRef()).cursorPos(), 3, "After right + right the cursor is at the first minute digit");

		//cleanup
		tp.destroy();
	});

	QUnit.test("left moves the cursor but jumps over the immutable chars", async function(assert) {
		//arrange
		var oDate = UI5Date.getInstance();
		oDate.setHours(5);
		oDate.setMinutes(38);

		//sut
		var tp = new TimePicker({
			dateValue: oDate,
			displayFormat: "HH:mm"
		});
		tp.placeAt("qunit-fixture");
		await nextUIUpdate();

		//arrange
		tp.focus();

		jQuery(tp.getFocusDomRef()).cursorPos(3);
		assert.equal(jQuery(tp.getFocusDomRef()).cursorPos(), 3, "Initially the cursor is at the first minute digit");

		qutils.triggerKeydown(tp.getDomRef(), KeyCodes.ARROW_LEFT, false, false, false);
		assert.equal(jQuery(tp.getFocusDomRef()).cursorPos(), 1, "After left the cursor is at the second hour digit");

		//cleanup
		tp.destroy();
	});

	QUnit.module("picker interaction");

	QUnit.test("cancel button closes the picker", async function(assert) {
		//sut
		var tp = new TimePicker();
		var oBtnCancel, oPopoverCloseSpy;
		tp.placeAt("qunit-fixture");
		await nextUIUpdate();

		//arrange
		tp._openPicker();

		oPopoverCloseSpy = this.spy(tp._getPicker(), "close");
		oBtnCancel = tp._getPicker().getEndButton();

		//act
		oBtnCancel.firePress();

		assert.equal(oPopoverCloseSpy.callCount, 1, "At the end cancel button invokes the popover's close method");

		//cleanup
		tp._getPicker().close.restore();
		tp.destroy();
	});

	QUnit.test("open TimePicker from button", async function(assert) {
		// Prepare
		var oTP = new TimePicker("HTP", {
				hideInput: true
			}).placeAt("qunit-fixture"),
			oButton = new Button({
				icon: "sap-icon://appointment-2",
				press: function() {
					Element.getElementById("HTP").openBy(this.getDomRef());
				}
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Act
		oButton.firePress();
		await nextUIUpdate();

		// Assert
		assert.ok(oTP.getAggregation("_picker"), oTP.getId() + ": picker exists");
		assert.ok(jQuery("#" + oTP.getId() + "-RP"), "picker is rendered");
		assert.ok(jQuery("#" + oTP.getId() + "-clocks")[0], "clocks are rendered");

		// Clean
		oTP.destroy();
		oButton.destroy();
	});

	QUnit.test("icon is properly configured", function (assert) {
		// arrange
		var oIconOne = new TimePicker().getAggregation("_endIcon")[0];

		// act
		// assert
		assert.notOk(oIconOne.getTooltip(), "icon has no tooltip");
		assert.ok(oIconOne.getDecorative(), "icon is decorative");
		assert.notOk(oIconOne.getUseIconTooltip(), "icon doesn't have default tooltip");
		assert.strictEqual(oIconOne.getAlt(), Library.getResourceBundleFor("sap.m").getText("OPEN_PICKER_TEXT") , "icon alt is present");

		// arrange
		var oTouchStub = this.stub(Device, "support").value({touch: true});
		var oDeviceStub = this.stub(Device, "system").value({phone: true});
		var oIconTwo = new TimePicker().getAggregation("_endIcon")[0];

		// assert
		assert.notOk(oIconTwo.getDecorative(), "icon is not decorative");

		// clean
		oTouchStub.restore();
		oDeviceStub.restore();
	});

	QUnit.module("data binding");

	QUnit.test("binding to value property is correct", async function(assert) {
		//sut
		var tp = new TimePicker({
			value: {
				path: "/timeValue",
				type: new Time({pattern: "HH:mm", strictParsing: true})
			}
		});

		//arrange
		var oModel = new JSONModel();
		var oDate = UI5Date.getInstance(2000, 1, 2, 16, 35, 54);
		var oDate2 = UI5Date.getInstance(2000, 1, 2, 20, 10, 11);
		oModel.setData({
			timeValue: oDate
		});

		tp.setModel(oModel);

		tp.placeAt("qunit-fixture");
		await nextUIUpdate();

		//act

		//assert
		assert.equal(tp.getValue(), "16:35", "the value property is set in and formatted correctly");

		//act
		oModel.setData({
			timeValue: oDate2
		});

		//assert
		assert.equal(tp.getValue(), "20:10", "the value property has changed with the model");

		//cleanup
		tp.destroy();
	});

	QUnit.test("binding to value property overrides displayFormat property", async function(assert) {
		//sut
		var tp = new TimePicker({
			value: {
				path: "/timeValue",
				type: new Time({
					style: "short",
					strictParsing: true
				})
			}
		});

		//arrange
		var oModel = new JSONModel();
		oModel.setData({
			timeValue: UI5Date.getInstance(2000, 1, 2, 16, 35, 54)
		});
		tp.setModel(oModel);

		tp.placeAt("qunit-fixture");
		await nextUIUpdate();

		//assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(tp.getValue(), "4:35\u202fPM", "the value property is set in and formatted correctly");

		//act
		qutils.triggerEvent("focusin", tp.getDomRef());
		//assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(tp._getInputValue(), " 4:35\u202fPM", "the value property is formatted correctly (with leading space)");

		//act
		tp._openPicker();

		//assert
		assert.equal(tp._getClocks().getAggregation("_clocks").length, 2, "the picker should display 3 clocks");

		//cleanup
		tp.destroy();
	});

	QUnit.test("data binding with OData", function(assert) {
		var done = assert.async();

		TestUtils.useFakeServer(sinon.sandbox.create(),
			"sap/ui/core/demokit/sample/ViewTemplate/types/data", {
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

		return XMLView.create({
			definition: sMyxml
		}).then(function(view) {
			view
			.setModel(oModelV2)
			.placeAt("qunit-fixture");

			oModelV2.attachRequestCompleted(function () {
				// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
				assert.equal(view.byId("tp1")._$input.val(), "11:33:55\u202fAM", "TP1 has coorect value!");
				assert.equal(view.byId("tp2")._$input.val(), "11:33:55\u202fAM", "TP2 has coorect value!");
				assert.equal(view.byId("tp3")._$input.val(), "11:33\u202fAM", "TP3 has coorect value!");
				assert.equal(view.byId("tp4")._$input.val(), "11:33", "TP4 has coorect value!");
				done();
			});
		});
	});

	QUnit.module("picker interactions", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();

		},
		afterEach: function() {
			this.clock.restore();
		}
	});

	QUnit.test("tap on the input icon open/closes the picker", async function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		var icon = tp.$().find(".sapUiIcon");
		qutils.triggerEvent("mousedown", icon[0]);
		qutils.triggerEvent("click", icon[0]);
		this.clock.tick(1000);

		assert.strictEqual(jQuery(".sapMPopover").is(":visible"), true, "the picker is opened");

		qutils.triggerEvent("mousedown", icon[0]);
		qutils.triggerEvent("click", icon[0]);
		this.clock.tick(1000);

		assert.strictEqual(jQuery(".sapMPopover").is(":visible"), false, "the picker is closed");

		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("focussed input is styled correctly", async function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		tp._openPicker();
		this.clock.tick(1000);

		assert.strictEqual(jQuery("." + InputBase.ICON_PRESSED_CSS_CLASS).is(":visible"), true, "the picker is opened and focussed");

		tp._closePicker();
		this.clock.tick(1000);

		assert.strictEqual(jQuery("." + InputBase.ICON_PRESSED_CSS_CLASS).is(":visible"), false, "the picker is closed and not focussed");

		qutils.triggerEvent("focusout", tp.getDomRef());
		assert.ok(!tp.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS), "the picker is closed and not focussed");


		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("_getInputValue", async function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		tp.setValue("10:55:13 AM");
		var result = tp._getInputValue();

		// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.strictEqual(result, "10:55:13\u202fAM", "_getInputValue returns the correct time");

		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("decrease time", async function(assert) {
		var oGetTimezoneStub = this.stub(Localization, "getTimezone").callsFake(function () { return "Europe/Sofia"; });

		var oTp = new TimePicker();
		oTp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		oTp.setDateValue(UI5Date.getInstance(2015, 11, 1, 3, 12, 15));
		oTp._increaseTime(-1, "hour");

		assert.equal(oTp.getDateValue().toString(), UI5Date.getInstance(2015, 11, 1, 2, 12, 15).toString(), "_increaseTime works as expected when decreasing in standart time");

		oTp.destroy();
		oGetTimezoneStub.restore();
		await nextUIUpdate(this.clock);
	 });

	QUnit.module("support2400");

	QUnit.test("support2400 - value is set to 24:00:00 instead of 00:00:00 when entered manually", async function(assert) {
		//prepare
		var oTP = new TimePicker({
			displayFormat: "HH:mm:ss",
			valueFormat: "HH:mm:ss",
			dateValue: UI5Date.getInstance(2000, 1, 2, 23, 35, 54),
			support2400: true
		});

		oTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		//act
		oTP._handleInputChange("24:00:00");

		//assert
		assert.equal(oTP.getValue(), "24:00:00", "Value is set to 24:00:00");

		//act
		oTP._handleInputChange("24:15:33");

		//assert
		assert.equal(oTP.getValue(), "24:00:00", "Value is set to 24:00:00 if the entry is 24:15:33");

		oTP.setValueFormat("HH:mm");
		oTP.setValue("23:11");

		//act
		oTP._handleInputChange("24:00:00");

		//assert
		assert.equal(oTP.getValue(), "24:00", "Value is set to 24:00 when format is HH:mm");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("support2400 - 24:00:00 value works correctly in all scenarios", async function(assert) {
		//prepare
		//this test checks the scenario when the default date pattern has HH for hours. this happens when "de-DE" is set for language.
		Localization.setLanguage("de-DE");
		await nextUIUpdate();

		var tpId = "timepicker",
			oClocksSpy = this.spy(TimePickerClocks.prototype, "_setTimeValues"),
			oTimePickerClocks = new TimePickerClocks(tpId + "-clocks").placeAt("qunit-fixture"),
			oTP = new TimePicker(tpId, {
				support2400: true
			}).placeAt("qunit-fixture"),
			oGetClocksStub = this.stub(oTP, "_getClocks").callsFake(function () { return oTimePickerClocks; });

		await nextUIUpdate();

		//act
		oTP.setValue('24:00:00');
		await nextUIUpdate();

		//assert
		assert.ok(oTP._bValid, "value is valid");
		assert.equal(jQuery("#" + tpId + "-inner").val(), '24:00:00', "input value is correct");

		//act
		oTP._handleInputChange("23:00:00");
		oTP._handleInputChange("24:00:00");

		//assert
		assert.equal(oTP.getValue(), "24:00:00", "Value is set to 24:00:00");
		assert.ok(oTP._bValid, "value is valid");
		assert.equal(jQuery("#" + tpId + "-inner").val(), '24:00:00', "input value is correct");

		//act
		oTP._formatValue(UI5Date.getInstance(2022, 4, 1));

		//assert
		assert.equal(oTP.getValue(), "24:00:00", "Value is set to 24:00:00");
		assert.ok(oTP._bValid, "value is valid");
		assert.equal(jQuery("#" + tpId + "-inner").val(), '24:00:00', "input value is correct");

		//act
		oTP.onBeforeOpen();

		//assert
		assert.ok(oClocksSpy.calledWithExactly(UI5Date.getInstance(1970, 0, 1), true), "The set value is passed to the clocks");

		//cleanup
		oClocksSpy.restore();
		oGetClocksStub.restore();
		oTimePickerClocks.destroy();
		oTP.destroy();
		Localization.setLanguage("en-US");
	});

	QUnit.module("properties in constructor options", {
		beforeEach: function() {
			this._defaultFormatter = DateFormat.getTimeInstance({style: "medium", strictParsing: true, relative: false});
		}
	});

	QUnit.test("displayFormat after value", async function(assert) {
		//system under test
		var tpId = "tp" + ++caseIndex,
				tp = new TimePicker(tpId, {
					value: this._defaultFormatter.format(getDate(17, 27, 43)),
					displayFormat: "HH:mm"
				}),
				expDateValue = getDate(17, 27, 43);

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate();

		//render

		//assert
		assert.equal(jQuery("#" + tpId + "-inner").val(), "17:27", "$input.val() ok");
		assert.equal(tp.getValue(), this._defaultFormatter.format(getDate(17, 27, 43)), "getValue() ok");

		var oDateValue = tp.getDateValue();
		oDateValue.setFullYear(expDateValue.getFullYear());
		oDateValue.setMonth(expDateValue.getMonth());
		oDateValue.setDate(expDateValue.getDate());
		assert.equal(oDateValue.toString(), expDateValue.toString(), "getDateValue ok");

		//cleanup
		tp.destroy();
	});

	QUnit.module("Time picker on mobile", {
		beforeEach: function () {
			jQuery("html").removeClass("sap-desktop");
			jQuery("html").removeClass("sapUiMedia-Std-Desktop");
			jQuery("html").addClass("sap-phone");
			jQuery("html").addClass("sapUiMedia-Std-Phone");
		},
		afterEach: function () {
			jQuery("html").removeClass("sap-phone");
			jQuery("html").removeClass("sapUiMedia-Std-Phone");
			jQuery("html").addClass("sap-desktop");
			jQuery("html").addClass("sapUiMedia-Std-Desktop");
		}
	});

	QUnit.test("focus on the input does not open the picker on mobile", async function(assert) {
		//system under test
		var tp = new TimePicker('tp');

		// arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		qutils.triggerEvent("focusin", tp.getDomRef());

		assert.strictEqual(tp.$().hasClass("sapMFocus"), true, "the input is focused");
		assert.strictEqual(tp._getPicker(), null, "the picker is not opened");

		//cleanup
		tp.destroy();
	});

	QUnit.test("_createPopup: mobile device", async function(assert) {
		// prepare
		var oTimePicker = new TimePicker(),
			oSandbox = sinon.createSandbox({}),
			oLabel = new Label({text: "TimePicker Label", labelFor: oTimePicker.getId()}),
			oDialog;

		oSandbox.stub(Device.system, "phone").value(true);
		oSandbox.stub(Device.system, "desktop").value(false);
		oTimePicker.placeAt("qunit-fixture");
		oLabel.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oTimePicker._createPicker("medium");
		oDialog = oTimePicker.getAggregation("_picker");

		// assert
		assert.ok(oDialog.getShowHeader(), "Header is shown");
		assert.notOk(oDialog.getShowCloseButton(), "Close button in the header is set");
		assert.strictEqual(oDialog.getTitle(), "TimePicker Label", "Title is set");
		assert.strictEqual(oDialog.getBeginButton().getType(), "Emphasized", "OK button type is set");
		assert.ok(oDialog.getEndButton(), "Close button in the footer is set");

		// clean
		oSandbox.restore();
		oTimePicker.destroy();
		oLabel.destroy();
	});

	QUnit.module("Accessibility", {
		beforeEach: async function () {
			this.oRB = Library.getResourceBundleFor('sap.m');
			this.oTP = new TimePicker({
				localeId: 'en' //set localeId explicitly otherwise it will be taken from the system configuration and the test won't be stable
			});
			this.sandbox = sinon.sandbox;
			this.oTP.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oTP.destroy();
		},
		fnAriaRoleTest: function (oSlider, iIndex) {
			var iNonZeroIndex = iIndex + 1,
					bHasRoleAttribute = oSlider.$().is('[role]'),
					sRole = oSlider.$().attr('role');

			QUnit.assert.ok(bHasRoleAttribute, "TimePickerSlider " + iNonZeroIndex + " has role attribute");
			QUnit.assert.strictEqual(sRole, "list", "TimePickerSlider " + iNonZeroIndex + " has role='" + sRole + "'");
		},
		fnAriaLiveAndHiddenTest: function (oSlider, iIndex) {
			var iNonZeroIndex = iIndex + 1,
					$Target = oSlider.$('valDescription'),
					bHasAriaHiddenAttr = $Target.is("[aria-hidden]"),
					sAriaHiddenValue = $Target.attr("aria-hidden"),
					bHasAriaLiveAttr = $Target.is("[aria-live]"),
					sAriaLiveValue = $Target.attr("aria-live");

			QUnit.assert.ok(bHasAriaHiddenAttr, "TimePickerSlider " + iNonZeroIndex + " live-region child has aria-hidden attribute");
			QUnit.assert.strictEqual(sAriaHiddenValue, "false", "TimePickerSlider " + iNonZeroIndex + " live-region child has aria-hidden='" + sAriaHiddenValue + "'");
			QUnit.assert.ok(bHasAriaLiveAttr, "TimePickerSlider " + iNonZeroIndex + " live-region child has aria-live attribute");
			QUnit.assert.strictEqual(sAriaLiveValue, "assertive", "TimePickerSlider " + iNonZeroIndex + " live-region child has aria-live='" + sAriaLiveValue + "'");
		},
		fnAriaLabelledByTest: function (oSlider, iIndex) {
			var iNonZeroIndex = iIndex + 1,
					sAriaLabelledById = oSlider.$().attr('aria-labelledby'),
					$AriaLabelledTarget = oSlider.$('label');

			QUnit.assert.ok($AriaLabelledTarget.length, "TimePickerSlider " + iNonZeroIndex + " has aria-labelledby association");
			QUnit.assert.strictEqual(sAriaLabelledById, $AriaLabelledTarget.attr("id"), "TimePickerSlider " + iNonZeroIndex + " aria-labelledby association has a correct value " + sAriaLabelledById);
		},
		fnAriaDescribedByTest: function (oSlider, iIndex) {
			var iNonZeroIndex = iIndex + 1,
					sAriaDescribedById = oSlider.$().attr('aria-describedby'),
					$AriaDescribedTarget = oSlider.$('valDescription');

			QUnit.assert.ok(sAriaDescribedById.length, "TimePickerSlider " + iNonZeroIndex + " has aria-describedby association");
			QUnit.assert.strictEqual(sAriaDescribedById, $AriaDescribedTarget.attr("id"), "TimePickerSlider " + iNonZeroIndex + " aria-describedby association has a correct value " + sAriaDescribedById);
		},
		fnTestReferencing: function (oSut, fnAssert, oResourceManager, aScenarios) {
			//prepare
			var sInnerInputSuffix = oSut.getRenderer().getInnerSuffix(),
				fnTestCustomRole = function () {
					fnAssert.strictEqual(oSut.$(sInnerInputSuffix).attr("aria-roledescription"), oSut._oResourceBundle.getText("ACC_CTR_TYPE_TIMEINPUT"),
						"Control description is added in aria-roledescription");
				},
				fnTestExternalLabelReference = async function (bReferencedWithExternalLabel) {
					var sLabelId = "timepicker-aria-label";
					if (bReferencedWithExternalLabel) {
						//prepare
						var oLabel = new Label(sLabelId, {
							labelFor: oSut
						}).placeAt('qunit-fixture');
						await nextUIUpdate();
						//assert
						fnAssert.strictEqual(oSut.$(sInnerInputSuffix).attr("aria-labelledby").indexOf(sLabelId) > -1, true, "External label reference is applied");
						//clear
						oLabel.destroy();
					} else {
						//assert
						fnAssert.strictEqual(oSut.$(sInnerInputSuffix).attr("aria-labelledby").indexOf(sLabelId) > -1, false, "External label reference is not applied");
					}
				};

			//Test execution check
			if (!Array.isArray(aScenarios)) {
				fnAssert.ok(false, "First argument of 'fnTestLabelReferencing' test function is not of a correct type");
			} else if (aScenarios.length !== 2) {
				fnAssert.ok(false, "First argument of 'fnTestLabelReferencing' test function do not have sufficient number of items. For more information please read the test comment");
			}

			aScenarios.forEach(async function (bExpectation, iIndex) {
				switch (iIndex) {
					case 0:
						fnTestCustomRole();
						await fnTestExternalLabelReference(bExpectation);
						break;
					default:
						fnTestCustomRole();
						break;
				}
			});
		}
	});

	QUnit.test("getAccessibilityInfo", async function(assert) {
		//arrange
		var oInfo;
		this.oTP.setValue("Value");
		this.oTP.setPlaceholder("Placeholder");
		//assert
		assert.ok(!!this.oTP.getAccessibilityInfo, "TimePicker has a getAccessibilityInfo function");
		await nextUIUpdate();
		oInfo = this.oTP.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_TIMEINPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		this.oTP.setValue("");
		this.oTP.setEnabled(false);
		oInfo = this.oTP.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Placeholder", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		this.oTP.setEnabled(true);
		this.oTP.setEditable(false);
		oInfo = this.oTP.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		this.oTP.setValueFormat("HH.mm.ss");
		this.oTP.setDisplayFormat("HH-mm-ss");
		this.oTP.setValue("10.32.30");
		oInfo = this.oTP.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "10-32-30", "Description");
	});

	/*
	TimePicker inherits two artifacts that hold useful information which can be used as a WAI-ARIA label or description - placeholder and tooltip.
	To do this, we need to render a hidden span element with a value that is the same with the value of the corresponding artifact (if present) and associate it
	by adding its ID to one of its "aria-labelledby" or "aria-describedby" DOM attributes. We also have into consideration that its "displayFormat" pattern is
	assigned as a default placeholder if no placeholder value is set by the application developer.

	In addition, it can also be referenced with external label like any other Input control either by using the "labelFor" association of the given label or
	by using its own "ariaLabelledBy" association. By design, it has an ARIA custom string role which is also rendered as a hidden child span element
	with particular ID and added to its "aria-describedby" DOM attribute.

	So here are all possible reference combinations.
	|===============================================================================================================================================================|
	|	TP is labelled by other label(X)		|		Placeholder		ariaDescribedBy			|			ariaLabelledBy 						|
	|===============================================================================================================================================================|
	1						no					|		yes (default)	"TimePicker"			|		default placeholder						|
	2						no					|			yes			"TimePicker"			|		custom placeholder						|
	3						yes					|			yes			"TimePicker"			|		X + custom placeholder					|
	4						yes					|		yes (default)	"TimePicker"			|		X + default placeholder					|
	*/
	QUnit.test("Time picker aria references: Scenario 1: 'aria-labelledby' is correctly referenced with its default placeholder", async function(assert) {
		await this.fnTestReferencing(this.oTP, assert, this.oRB, [false, false]);
	});

	QUnit.test("Time picker aria references: Scenario 2: 'aria-labelledby' & 'aria-describedby' are correctly referenced with its custom placeholder", async function (assert) {
		await this.fnTestReferencing(this.oTP, assert, this.oRB, [false, true]);
	});

	QUnit.test("Time picker aria references: Scenario 3: 'aria-labelledby' & 'aria-describedby' are correctly referenced with its external label & custom placeholder", async function (assert) {
		await this.fnTestReferencing(this.oTP, assert, this.oRB, [true, true]);
	});

	QUnit.test("Time picker aria references: Scenario 4: 'aria-labelledby' & 'aria-describedby' are correctly referenced with its external label", async function (assert) {
		await this.fnTestReferencing(this.oTP, assert, this.oRB, [true, false]);
	});

	QUnit.test("Popover's placeholder text", function (assert) {
		// Prepare
		var sPlaceholderId = InvisibleText.getStaticId("sap.m", "TIMEPICKER_SET_TIME"),
			oPicker;

		// Act
		this.oTP.toggleOpen(false); // Open TimePicker's popover
		oPicker = this.oTP._getPicker();

		// Assert
		assert.ok(oPicker.getAriaLabelledBy().indexOf(sPlaceholderId) !== -1, "Placeholder's reference is set on API level");
		assert.ok(oPicker.$().attr("aria-labelledby").indexOf(sPlaceholderId) !== -1, "Placeholder reference can be found in the DOM");
	});

	QUnit.test("Default senatic accessible role gets used", function(assert) {
		// Prepare
		var oTP = new TimePicker();

		// Assert
		assert.strictEqual(oTP.getRenderer().getAriaRole() , "", "The role attribute is empty");
	});

	QUnit.module("MaskInput integration", {
		beforeEach : function() {
			this._defaultFormatter = DateFormat.getTimeInstance({style: "medium", strictParsing: true, relative: false});
		},
		typeAndCheckValueForDisplayFormat: async function(sDisplayFormat, sInput, sExpectedValue, sMaskMode) {
			//system under test
			var tp = new TimePicker({
				displayFormat: sDisplayFormat,
				maskMode: sMaskMode
			});

			//arrange
			tp.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

			//act
			triggerMultipleKeypress(tp, sInput);

			//assert
			QUnit.assert.equal(jQuery("#" + tp.getId() + "-inner").val(), sExpectedValue, "$input.val() ok");

			//cleanup
			tp.destroy();
			await nextUIUpdate(this.clock);
		}
	});

	//valid
	QUnit.test("allows input of valid time string - HH format, hours < 9", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "0615", "06:15");
	});

	QUnit.test("allows input of valid time string - HH format, hours === 11", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "1115", "11:15");
	});

	QUnit.test("allows input of valid time string - HH format, hours > 12", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "1715", "17:15");
	});

	QUnit.test("allows input of valid time string - hh format, hours < 9", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("hh:mm", "0615", "06:15");
	});

	QUnit.test("allows input of valid time string - hh format, hours === 12", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("hh:mm", "1215", "12:15");
	});

	QUnit.test("allows input of valid time string - style short", async function(assert) {
		// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		await this.typeAndCheckValueForDisplayFormat("short", "1215a", "12:15\u202fAM", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("short", "1215a", "", TimePickerMaskMode.On);
	});

	QUnit.test("allows input of valid time string - style medium", async function(assert) {
		// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		await this.typeAndCheckValueForDisplayFormat("medium", "12159a", "12:15:09\u202fAM", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("medium", "12159a", "", TimePickerMaskMode.On);
	});



	//time semantics - shifts and replaces
	//first number in hour
	//no leading zero
	QUnit.test("1 for first hour digit is valid - h format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("h:mm", "115", "11:5-", TimePickerMaskMode.Enforce); //not " 1:15"
		await this.typeAndCheckValueForDisplayFormat("h:mm", "115", "", TimePickerMaskMode.On);
	});

	QUnit.test("2 for first hour digit are preceded by space - h format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("h:mm", "215", " 2:15", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("h:mm", "215", "", TimePickerMaskMode.On);
	});

	QUnit.test("numbers > 2 for first hour digit are preceded by space - h format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("h:mm", "315", " 3:15", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("h:mm", "315", "", TimePickerMaskMode.On);
	});



	QUnit.test("2 for first hour digit is valid - H format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("H:mm", "215", "21:5-", TimePickerMaskMode.Enforce); //not " 2:15"
		await this.typeAndCheckValueForDisplayFormat("H:mm", "215", "", TimePickerMaskMode.On); //not " 2:15"
	});

	QUnit.test("numbers > 2 for first hour digit are preceded by space - H format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("H:mm", "315", " 3:15", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("H:mm", "315", "", TimePickerMaskMode.On);
	});


	QUnit.test("space is valid for hours - H format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("H:mm", " 115", " 1:15", TimePickerMaskMode.Enforce); //not "11:5-"
		await this.typeAndCheckValueForDisplayFormat("H:mm", " 115", "", TimePickerMaskMode.On); //not "11:5-"
	});

	//...could have more of those

	QUnit.test("0 is replaced with space for hours - h format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("h:mm", "0115", " 1:15", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("h:mm", "0115", "", TimePickerMaskMode.On);
	});

	QUnit.test("0 is preceeded with space for hours - H format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("H:mm", "0115", " 0:11", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("H:mm", "0115", "", TimePickerMaskMode.On);
	});


	//leading zero
	QUnit.test("1 for first hour digit is valid - hh format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("hh:mm", "115", "11:5-");
	});

	QUnit.test("2 for first hour digit are preceded by 0 - hh format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("hh:mm", "215", "02:15");
	});



	QUnit.test("2 for first hour digit is valid - HH format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "215", "21:5-"); //not " 2:15"
	});

	QUnit.test("numbers > 2 for first hour digit are preceded by 0 - HH format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "415", "04:15");
	});



	QUnit.test("space is replaced with 0 for hours - HH format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", " 115", "01:15");
	});

	QUnit.test("0 is valid for hours - hh format, pos 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("hh:mm", "0115", "01:15"); //not "11:5-"
	});



	//invalid (partially valid)
	QUnit.test("do not allow letters, placeholders, immutables and asterisks - HH format", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "-:aQ*?spam1", "1-:--");
	});

	QUnit.test("do not allow letters, placeholders, immutables and asterisks - hh format", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("hh:mm", "-1:spamaQ1*?", "11:--");
	});

	//second number in hour
	QUnit.test("do not allow numbers > 2 for 2nd number in hour if 1st === 1 - hh format", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("hh:mm", "13", "1-:--");
	});

	QUnit.test("allow numbers <= 2 for 2nd number in hour if 1st === 1 - hh format", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("hh:mm", "12", "12:--");
	});

	QUnit.test("do not allow numbers > 2 for 2nd number in hour if 1st === 1 - h format", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("h:mm", "13", "1-:--", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("h:mm", "13", "", TimePickerMaskMode.On);
	});

	QUnit.test("allow numbers <= 2 for 2nd number in hour if 1st === 1 - h format", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("h:mm", "12", "12:--", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("h:mm", "12", "", TimePickerMaskMode.On);
	});

	QUnit.test("do not allow numbers > 3 for 2nd number in hour if 1st === 2 - HH format", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "24", "2-:--");
	});

	QUnit.test("allow numbers <= 3 for 2nd number in hour if 1st === 2 - HH format", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "23", "23:--");
	});

	QUnit.test("do not allow numbers > 3 for 2nd number in hour if 1st === 2 - H format", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("H:mm", "24", "2-:--", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("H:mm", "24", "", TimePickerMaskMode.On);
	});

	QUnit.test("allow numbers <= 3 for 2nd number in hour if 1st === 2 - H format", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("H:mm", "23", "23:--", TimePickerMaskMode.Enforce);
		await this.typeAndCheckValueForDisplayFormat("H:mm", "23", "", TimePickerMaskMode.On);
	});

	//first number in minutes
	QUnit.test("numbers > 5 for 1st number in minutes are preceded by 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "226", "22:06");
	});

	QUnit.test("allow numbers <= 5 for 1st number in minutes", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "225", "22:5-");
	});

	//we probably do not need this separately
	QUnit.test("allow 0 for 1st number in minutes", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm", "220", "22:0-");
	});

	//first number in seconds
	QUnit.test("numbers > 5 for 1st number in seconds are preceded by 0", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm:ss", "22556", "22:55:06");
	});

	QUnit.test("allow numbers <= 5 for 1st number in seconds", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("HH:mm:ss", "22595", "22:59:5-");
	});

	//am/pm values type assistence
	QUnit.test("am autocompletes the value on first different letter", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("hh a", "01A", "01 AM");
	});

	QUnit.test("pm autocompletes the value on first different letter", async function(assert) {
		await this.typeAndCheckValueForDisplayFormat("hh a", "01P", "01 PM");
	});

	QUnit.test("allows input to the second hour number by preceding the fitst hour number with 0 - hh format, pos 1", async function(assert) {
		// prepare
		var oTimePicker = new TimePicker({
			displayFormat: "HH:mm"
		}).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		// act
		qutils.triggerKeydown(jQuery(oTimePicker.getFocusDomRef()), KeyCodes.ARROW_RIGHT);
		triggerMultipleKeypress(oTimePicker, "830");

		// assert
		assert.equal(jQuery("#" + oTimePicker.getId() + "-inner").val(), "08:30", "$input.val() ok");

		// cleanup
		oTimePicker.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("entering incomplete value updates the model only once", async function(assert) {
		// arrange
		var oModel = new JSONModel({
				timeValue: UI5Date.getInstance(2000, 1, 2, 16, 35, 54)
			}),
			oTp = new TimePicker({
				value: {
					path: "/timeValue",
					type: new Time({pattern: "HH:mm", strictParsing: true})
				}
			}).setModel(oModel),
			iCallCount;

		oTp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		oModel.attachEvent("propertyChange", function() {
			iCallCount++;
		});

		iCallCount = 0;

		//act
		triggerMultipleKeypress(oTp, "12");
		qutils.triggerKeydown(jQuery(oTp.getFocusDomRef()), KeyCodes.ENTER);
		await nextUIUpdate(this.clock);

		//assert
		assert.equal(iCallCount, 1, "model uopdated only once");

		//cleanup
		oTp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("on enter '15:--:--', autocomplete to '15:00:00'", async function(assert) {
		//system under test
		var oTp = new TimePicker({
			displayFormat: "HH:mm:ss"
		});

		//arrange
		oTp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//act
		triggerMultipleKeypress(oTp, "15");
		qutils.triggerKeydown(jQuery(oTp.getFocusDomRef()), KeyCodes.ENTER);

		//assert
		assert.equal(jQuery("#" + oTp.getId() + "-inner").val(), "15:00:00", "$input.val() ok");

		//cleanup
		oTp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("on enter '15:1-:--', autocomplete to '15:01:00'", async function(assert) {
		//system under test
		var oTp = new TimePicker({
			displayFormat: "HH:mm:ss"
		});

		//arrange
		oTp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//act
		triggerMultipleKeypress(oTp, "151");
		qutils.triggerKeydown(jQuery(oTp.getFocusDomRef()), KeyCodes.ENTER);
		//assert
		assert.equal(jQuery("#" + oTp.getId() + "-inner").val(), "15:01:00", "$input.val() ok");

		//cleanup
		oTp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("on enter '07:-- --', autocomplete to '07:00 AM'", async function(assert) {
		this.clock = sinon.useFakeTimers();

		//system under test
		var oTp = new TimePicker({
			displayFormat: "HH:mm a"
		});

		//arrange
		oTp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);
		//focus is explicitly needed, because sending a single key ('7' - see below) does not focus the element.
		jQuery(oTp).trigger("focus");
		this.clock.tick(1000);

		//act
		triggerMultipleKeypress(oTp, "7");
		qutils.triggerKeydown(jQuery(oTp.getFocusDomRef()), KeyCodes.ENTER);
		//assert
		assert.equal(jQuery("#" + oTp.getId() + "-inner").val(), "07:00 AM", "$input.val() ok");

		//cleanup
		oTp.destroy();
		await nextUIUpdate(this.clock);
		this.clock.restore();
	});

	QUnit.test("am match start - then autocomplete on any letter", async function(assert) {
		//system under test
		var tp = new TimePicker({
			valueFormat: "hh a",
			value: "12 AM",
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), KeyCodes.BACKSPACE);

		assert.equal(jQuery("#" + tp.getId() + "-inner").val(), "12 A-", "$input.val() correctly preset");

		triggerMultipleKeypress(tp, "y");

		//assert
		assert.equal(jQuery("#" + tp.getId() + "-inner").val(), "12 AM", "$input.val() ok");

		//cleanup
		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("minutes only values are correctly synced with the input",async function(assert) {
		//system under test
		var oTp = new TimePicker({
			displayFormat: "mm"
		});

		//arrange
		oTp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//act
		triggerMultipleKeypress(oTp, "15");
		qutils.triggerKeydown(jQuery(oTp.getFocusDomRef()), KeyCodes.ENTER);

		//assert
		assert.equal(jQuery("#" + oTp.getId() + "-inner").val(), "15", "$input.val() ok");

		//cleanup
		oTp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("pm match start - then autocomplete on any letter", async function(assert) {
		//system under test
		var tp = new TimePicker({
			valueFormat: "hh a",
			value: "12 PM",
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), KeyCodes.BACKSPACE);

		assert.equal(jQuery("#" + tp.getId() + "-inner").val(), "12 P-", "$input.val() correctly preset");

		triggerMultipleKeypress(tp, "b");

		//assert
		assert.equal(jQuery("#" + tp.getId() + "-inner").val(), "12 PM", "$input.val() ok");

		//cleanup
		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar replaces any char when am or pm value match is the only possible", async function(assert) {
		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("y", 4, "12 P-");

		assert.equal(sCharReplaced, "M", "replaceChar replaces correctly");

		//cleanup
		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar replaces with unique value and completes with spaces when am,pm length differs", async function(assert) {
		sinon.stub(LocaleData.prototype, "getDayPeriods").returns([ "vorm.", "nachm."]);

		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//am/pm translation is - vorm./nachm. - which are different length

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("v", 3, "12 ------");

		assert.equal(sCharReplaced, "vorm. ", "replaceChar completes with spaces");

		//cleanup
		LocaleData.prototype.getDayPeriods.restore();
		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar any char completes am pm values to the first difference", async function(assert) {
		sinon.stub(LocaleData.prototype, "getDayPeriods").returns([ "MA", "MP"]);

		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);


		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("b", 3, "12 --");

		assert.equal(sCharReplaced, "M", "replaceChar completes to the first difference");

		//cleanup
		LocaleData.prototype.getDayPeriods.restore();
		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar correct char only completes am pm values on the position with difference", async function(assert) {
		sinon.stub(LocaleData.prototype, "getDayPeriods").returns([ "MABC", "MPBC"]);

		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);


		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("b", 4, "12 M---");

		assert.equal(sCharReplaced, "b", "replaceChar does not replace invalid char");

		//cleanup
		LocaleData.prototype.getDayPeriods.restore();
		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar completes am pm values on a middle position with difference, to the end", async function(assert) {
		sinon.stub(LocaleData.prototype, "getDayPeriods").returns([ "MABC", "MPBC"]);

		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);


		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("A", 4, "12 M---");

		assert.equal(sCharReplaced, "ABC", "replaceChar completes when difference is in the middle");

		//cleanup
		LocaleData.prototype.getDayPeriods.restore();
		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar autocomplete not case sensitive: a fills AM", async function(assert) {
		sinon.stub(LocaleData.prototype, "getDayPeriods").returns([ "AM", "PM"]);

		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);


		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("a", 3, "12 --");

		assert.equal(sCharReplaced, "AM", "replaceChar is not case sensitive");

		//cleanup
		LocaleData.prototype.getDayPeriods.restore();
		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("TimeSemanticMaskHelper constructor", function(assert) {
		//system under test
		var tp = new TimePicker({
			localeId: "en_US",
			displayFormat: "h:mm:ss a",
			valueFormat: "h:mm:ss",
			value: "13:22:52"
		});

		// assert
		assert.equal(tp._oTimeSemanticMaskHelper.iAmPmChar1Index, 9, "AM/PM char index");
		assert.equal(tp._oTimeSemanticMaskHelper.iHourNumber1Index, 0, "Hour start index");
		assert.equal(tp._oTimeSemanticMaskHelper.iHourNumber2Index, 1,  "Hour end index");
		assert.equal(tp._oTimeSemanticMaskHelper.iMinuteNumber1Index, 3, "Minute start index");
		assert.equal(tp._oTimeSemanticMaskHelper.iSecondNumber1Index, 6, "Second start index");


		//system under test
		tp = new TimePicker({
			localeId: "zh_CN",
			displayFormat: "ah:mm:ss",
			valueFormat: "HH:mm:ss",
			value: "13:22:52"
		});

		// assert
		assert.equal(tp._oTimeSemanticMaskHelper.iAmPmChar1Index, 0, "AM/PM char index");
		assert.equal(tp._oTimeSemanticMaskHelper.iHourNumber1Index, 2, "Hours start index");
		assert.equal(tp._oTimeSemanticMaskHelper.iHourNumber2Index, 3, "Hours end index");
		assert.equal(tp._oTimeSemanticMaskHelper.iMinuteNumber1Index, 5, "Minutes start index");
		assert.equal(tp._oTimeSemanticMaskHelper.iSecondNumber1Index, 8, "Seconds start index");
	});

	QUnit.test("TimeSemanticMaskHelper.prototype.formatValueWithLeadingTrailingSpaces", function(assert) {
		//system under test
		var tp = new TimePicker({
			localeId: "en_US",
			displayFormat: "h:mm:ss a"
		});

		//act && assert
		assert.equal(tp._oTimeSemanticMaskHelper.formatValueWithLeadingTrailingSpaces("1:22:52 AM"), " 1:22:52 AM", "1:22:52 AM");

		//system under test
		tp = new TimePicker({
			localeId: "zh_CN",
			displayFormat: "ah:mm:ss"
		});

		//act && assert
		assert.equal(tp._oTimeSemanticMaskHelper.formatValueWithLeadingTrailingSpaces("AM1:22:52"), "AM 1:22:52", "AM1:22:52");
	});

	QUnit.test("TimeSemanticMaskHelper.prototype.stripValueOfLeadingSpaces", function(assert) {
		//system under test
		var tp = new TimePicker({
			localeId: "en_US",
			displayFormat: "h:mm:ss a"
		});

		//act && assert
		assert.equal(tp._oTimeSemanticMaskHelper.stripValueOfLeadingSpaces("1:22:52 AM"), "1:22:52 AM", "1:22:52 AM");

		//system under test
		tp = new TimePicker({
			localeId: "zh_CN",
			displayFormat: "ah:mm:ss"
		});

		//act && assert
		assert.equal(tp._oTimeSemanticMaskHelper.stripValueOfLeadingSpaces("AM 1:22:52"), "AM1:22:52", "AM 1:22:52");
	});

	QUnit.test("TimeSemanticMaskHelper initialization destroyes any previous instances", async function(assert) {
		//prepare
		var tp = new TimePicker(),
				oSpyDestroy;

		//act
		tp._oTimeSemanticMaskHelper.destroy();
		await nextUIUpdate(this.clock);

		//assert
		assert.ok(!tp._oTimeSemanticMaskHelper._maskRuleHours, "Rule for Hours should be destroyed");
		assert.ok(!tp._oTimeSemanticMaskHelper._maskRuleMinSec, "Rule for MinutesSecs should be destroyed");
		assert.ok(!tp._oTimeSemanticMaskHelper._maskRuleChars, "Rule for Chars should be destroyed");

		//prepare
		oSpyDestroy = this.spy(tp._oTimeSemanticMaskHelper, "destroy");

		//act
		tp._initMask();

		//assert
		assert.equal(oSpyDestroy.callCount, 1, "When initMask is called, the old instance of semanticmask helper is destroyed");
		tp.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("In IE when both focusin + setValue(''), the order of their calling is reversed and that caused" +
		"missing first symbol in the mask", async function(assert) {
		//prepare
		var oTp = new TimePicker({
				value: "000000",
			placeholder: "Enter Value"
			});

		oTp.placeAt("content");
		await nextUIUpdate(this.clock);

		//act
		oTp.setValue("");
		oTp.focus();
		await nextUIUpdate(this.clock);

		//assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oTp._oTempValue.toString(), "--:--:--\u202f--", "the mask is the correct one");

	});

	QUnit.test("Initialisation of the mask is done when new dateValue is set", async function(assert) {
		//prepare
		var oTP = new TimePicker({
				value: "12:00"
			}).placeAt("content"),
			oInitMaskSpy = this.spy(oTP, "_initMask");

		await nextUIUpdate(this.clock);

		//act
		oTP.setDateValue();

		//assert
		assert.equal(oInitMaskSpy.calledOnce, true, "the _initMask method is called once");

		oTP.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("[Del] key deletes more than one character", async function(assert) {
		//prepare
		var oTP = new TimePicker({
				value: "12:00:33",
				displayFormat: "hh:mm:ss",
				maskMode: "On"
			}).placeAt("content"),
			iDelPressed = -1;

		await nextUIUpdate(this.clock);

		//act
		oTP.focus();
		await nextUIUpdate(this.clock);
		oTP._setCursorPosition(0);
		// first [Del] "press"
		await simulateDelPress(this);

		//assert
		assert.equal(oTP._oTempValue._aContent[iDelPressed], "-", "First character is deleted/replaced with placeholder");
		assert.notEqual(oTP._oTempValue._aContent[iDelPressed + 1], "-", "Second character is not deleted/replaced with placeholder");

		// second [Del] "press"
		await simulateDelPress(this);

		//assert
		assert.equal(oTP._oTempValue._aContent[iDelPressed], "-", "Second character is deleted/replaced with placeholder");
		assert.notEqual(oTP._oTempValue._aContent[iDelPressed + 1], "-", "Third character is not deleted/replaced with placeholder");

		// third [Del] "press"
		await simulateDelPress(this);

		//assert
		assert.equal(oTP._oTempValue._aContent[iDelPressed], "-", "Third character is deleted/replaced with placeholder");
		assert.notEqual(oTP._oTempValue._aContent[iDelPressed + 1], "-", "Fourth character is not deleted/replaced with placeholder");

		// cleanup
		oTP.destroy();
		await nextUIUpdate(this.clock);

		// helper function
		async function simulateDelPress(oClock) {
			oTP.selectText(0, 0);
			qutils.triggerKeydown(oTP._$input, KeyCodes.DELETE);
			iDelPressed++;
			await nextUIUpdate(oClock);
			if (oTP._oTempValue._aInitial[iDelPressed] != "-") {
				iDelPressed++;
			}
		}

	});

	QUnit.test("Hours, minutes and seconds characters from the displayFormat are escaped when setting the mask ", async function(assert) {
		//prepare
		var oTp = new TimePicker({
			displayFormat: "H 'h' mm 'mm' ss 'ss'"
		});

		oTp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//act
		//assert
		assert.equal(oTp._oTempValue.toString(), "-- h -- mm -- ss", "The mask is proeprly set");

		// destroy
		oTp.destroy();
		oTp = null;
		await nextUIUpdate(this.clock);
	});

	QUnit.test("When mask is enabled, focusing the input with mouse moves cursor to the start of the input", async function(assert) {
		// Prepare
		var oTp = new TimePicker({
			maskMode: "Enforce"
		});

		oTp.placeAt("content");
		// oTp.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Act
		oTp.focus();
		oTp._setCursorPosition(4);

		// Assert
		assert.equal(oTp._getCursorPosition(), 4, "The cursor position is moved to 4th position");

		// Act
		oTp.onmouseup();

		// Assert
		assert.equal(oTp._getCursorPosition(), 0, "The cursor position is moved to the start of the input");

		// destroy
		oTp.destroy();
		oTp = null;
		await nextUIUpdate(this.clock);
	});

	QUnit.module("maskMode property", {
		beforeEach: async function () {
			this.oTp = new TimePicker();
			this.oTp.placeAt("content");
			await nextUIUpdate(this.clock);
		},

		afterEach: async function () {
			this.oTp.destroy();
			this.oTp = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("_isMaskEnabled returns true if maskMode is 'On' if the display format is of fixed width ", async function (assert) {
		// prepare
		const oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.On; });
		let bFixWidthPattern = true;
		const sDisplayFormat = this.oTp._getDisplayFormatPattern().toLowerCase();
		const sSymbolPart = sDisplayFormat.replaceAll("hh", "").replaceAll("mm","").replaceAll("ss","").replaceAll("a","");
		const bHasIncorrectPatternHours = sSymbolPart.includes("h");
		const bHasIncorrectPatternMinutes = sSymbolPart.includes("m");
		const bHasIncorrectPatternSeconds = sSymbolPart.includes("s");
		const bHasIncorrectPatternSymbol = sSymbolPart.includes("a") || sSymbolPart.includes("b");
		if (bHasIncorrectPatternHours || bHasIncorrectPatternMinutes || bHasIncorrectPatternSeconds || bHasIncorrectPatternSymbol) {
			bFixWidthPattern = false;
		}

		await nextUIUpdate(this.clock);
		// assert
		assert.strictEqual(this.oTp._isMaskEnabled(),bFixWidthPattern, "The mask should be enabled if the 'maskMode' is set to 'On' and the display format is of fixed width.");
		await nextUIUpdate(this.clock);
		// cleanup
		oGetMaskModeStub.restore();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("_isMaskEnabled returns false if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; });

		// assert
		assert.ok(!this.oTp._isMaskEnabled(), "mask should be disabled if maskMode is 'Off'");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.test("_isMaskEnabled returns true if maskMode is 'Enforce', regardless of whether the display format is of fixed length", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Enforce; });

		// assert
		assert.ok(this.oTp._isMaskEnabled(), "mask should be enabled if maskMode is 'Enforce'");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.test("onfocusin event should call MaskEnabler's onfocusin if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.On; }),
				oMaskEnablerFocusInSpy = this.spy(MaskEnabler, "onfocusin");

		// act
		this.oTp.onfocusin({ target: this.oTp.getDomRef() });

		// assert
		assert.equal(oMaskEnablerFocusInSpy.callCount, 1, "MaskEnabler.onfocusin should be called once");

		// cleanup
		oMaskEnablerFocusInSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onfocusin event should call MaskEnabler's onfocusin if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			oMaskEnablerFocusInSpy = this.spy(MaskEnabler, "onfocusin");

		// act
		this.oTp.onfocusin({ target: this.oTp.getDomRef() });

		// assert
		assert.equal(oMaskEnablerFocusInSpy.callCount, 1, "MaskEnabler.onfocusin should be called once");

		// cleanup
		oMaskEnablerFocusInSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onfocusin event should call _applyMask and _positionCaret if maskMode is 'Enforce'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Enforce; }),
			oApplyMaskSpy = this.spy(this.oTp, "_applyMask"),
			oPositionCaret = this.spy(this.oTp, "_positionCaret");

		// act
		this.oTp.onfocusin({ target: this.oTp.getDomRef() });

		// assert
		assert.equal(oApplyMaskSpy.callCount, 1, "MaskEnabler._applyMask should be called once");
		assert.equal(oPositionCaret.callCount, 1, "MaskEnabler._positionCaret should be called once");

		// cleanup
		oApplyMaskSpy.restore();
		oPositionCaret.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onfocusin event should not call _applyMask and _positionCaret if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			oApplyMaskSpy = this.spy(this.oTp, "_applyMask"),
			oPositionCaret = this.spy(this.oTp, "_positionCaret");

		// act
		this.oTp.onfocusin({ target: this.oTp.getDomRef() });

		// assert
		assert.equal(oApplyMaskSpy.callCount, 0, "MaskEnabler._applyMask should not be called");
		assert.equal(oPositionCaret.callCount, 0, "MaskEnabler._positionCaret should not be called");

		// cleanup
		oApplyMaskSpy.restore();
		oPositionCaret.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("setValue method should call MaskEnabler's setValue method if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.On; }),
			oMaskEnablerSetValueSpy = this.spy(MaskEnabler, "setValue");

		// act
		this.oTp.setValue("12:12:12");

		// assert
		assert.equal(oMaskEnablerSetValueSpy.callCount, 1, "MaskEnabler.setValue should be called once");

		// cleanup
		oMaskEnablerSetValueSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("setValue method should call MaskEnabler's setValue method if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			oMaskEnablerSetValueSpy = this.spy(MaskEnabler, "setValue");

		// act
		this.oTp.setValue("12:12:12");

		// assert
		assert.equal(oMaskEnablerSetValueSpy.callCount, 1, "MaskEnabler.setValue should be called once");

		// cleanup
		oMaskEnablerSetValueSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("setValue method should call _applyRules if maskMode is 'Enforce'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Enforce; }),
			oApplyRulesSpy = this.spy(this.oTp, "_applyRules");

		// act
		this.oTp.setValue("12:12:12");

		// assert
		assert.equal(oApplyRulesSpy.callCount, 1, "MaskEnabler._applyRules should be called once");

		// cleanup
		oApplyRulesSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("setValue method should not call _applyRules if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			oApplyRulesSpy = this.spy(this.oTp, "_applyRules");

		// act
		this.oTp.setValue("12:12:12");

		// assert
		assert.equal(oApplyRulesSpy.callCount, 0, "MaskEnabler._applyRules should not be called");

		// cleanup
		oApplyRulesSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("setValue method should reset the mask temporary value", function (assert) {
		// prepare
		this.oTp.setValue("12:00:00 PM");
		this.oTp.setValueFormat("HH:mm:ss a");
		this.oTp.setDisplayFormat("HH:mm:ss a");

		// act
		this.oTp.setValue("12:00");

		// assert
		assert.equal(this.oTp._oTempValue.toString(), "--:--:-- --" , "MaskEnabler._oTempValue is reset");
	});

	QUnit.test("onkeydown event should call MaskEnabler's onkeydown event if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.On; }),
				oKeyDownSpy = this.spy(MaskEnabler, "onkeydown");

		// act
		this.oTp.onkeydown({});

		// assert
		assert.equal(oKeyDownSpy.callCount, 1, "MaskEnabler.onkeydown should be called once");

		// cleanup
		oKeyDownSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onkeydown event should call MaskEnabler's onkeydown event if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			oKeyDownSpy = this.spy(MaskEnabler, "onkeydown");

		// act
		this.oTp.onkeydown({});

		// assert
		assert.equal(oKeyDownSpy.callCount, 1, "MaskEnabler.onkeydown should be called once");

		// cleanup
		oKeyDownSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onkeydown event should call _keyDownHandler if maskMode is 'Enforce'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Enforce; }),
				oKeyDownHandlerSpy = this.spy(this.oTp, "_keyDownHandler");

		// act
		this.oTp.onkeydown({});

		// assert
		assert.equal(oKeyDownHandlerSpy.callCount, 1, "MaskEnabler._keyDownHandler should be called once");

		// cleanup
		oKeyDownHandlerSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onkeydown event should not call _keyDownHandler if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			oKeyDownHandlerSpy = this.spy(this.oTp, "_keyDownHandler");

		// act
		this.oTp.onkeydown({});

		// assert
		assert.equal(oKeyDownHandlerSpy.callCount, 0, "MaskEnabler._keyDownHandler should not be called");

		// cleanup
		oKeyDownHandlerSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onfocusout event should call closeValueStateMessage and _inputCompletedHandler if maskMode is 'Enforce'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Enforce; }),
			oCloseValueStateMessageSpy = this.spy(this.oTp, "closeValueStateMessage"),
			oInputCompletedHandlerSpy = this.spy(this.oTp, "_inputCompletedHandler");

		// act
		this.oTp.onfocusout({});

		// assert
		assert.equal(oCloseValueStateMessageSpy.callCount, 1, "MaskEnabler.closeValueStateMessage should be called once");
		assert.equal(oInputCompletedHandlerSpy.callCount, 1, "MaskEnabler._inputCompletedHandler should be called once");

		// cleanup
		oCloseValueStateMessageSpy.restore();
		oInputCompletedHandlerSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onfocusout event should call InputBase.prototype.onfocusout if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			oInputBaseFocusOutSpy = this.spy(InputBase.prototype, "onfocusout");

		// act
		this.oTp.onfocusout({});

		// assert
		assert.equal(oInputBaseFocusOutSpy.callCount, 1, "InputBase.prototype.onfocusout should be called once");

		// cleanup
		oInputBaseFocusOutSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("oninput event should call _applyMask and _positionCaret if maskMode is 'Enforce'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Enforce; }),
			oApplyMaskSpy = this.spy(this.oTp, "_applyMask"),
			oPositionCaretSpy = this.spy(this.oTp, "_positionCaret");

		// act
		this.oTp.oninput({ setMarked: function () {}});

		// assert
		assert.equal(oApplyMaskSpy.callCount, 1, "MaskEnabler._applyMask should be called once");
		assert.equal(oPositionCaretSpy.callCount, 1, "MaskEnabler._positionCaret should be called once");

		// cleanup
		oApplyMaskSpy.restore();
		oPositionCaretSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("oninput event should not call _applyMask and _positionCaret if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
				oApplyMaskSpy = this.spy(this.oTp, "_applyMask"),
				oPositionCaretSpy = this.spy(this.oTp, "_positionCaret");

		// act
		this.oTp.oninput({ setMarked: function () {}});

		// assert
		assert.equal(oApplyMaskSpy.callCount, 0, "MaskEnabler._applyMask should not be called");
		assert.equal(oPositionCaretSpy.callCount, 0, "MaskEnabler._positionCaret should not be called ");

		// cleanup
		oApplyMaskSpy.restore();
		oPositionCaretSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onkeypress event should call _keyPressHandler if maskMode is 'Enforce'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Enforce; }),
			okeyPressHandlerSpy = this.spy(this.oTp, "_keyPressHandler");

		// act
		this.oTp.onkeypress({ preventDefault: function() {}});

		// assert
		assert.equal(okeyPressHandlerSpy.callCount, 1, "MaskEnabler._keyPressHandler should be called once");

		// cleanup
		okeyPressHandlerSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onkeypress event should not call _keyPressHandler if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			okeyPressHandlerSpy = this.spy(this.oTp, "_keyPressHandler");

		// act
		this.oTp.onkeypress({ preventDefault: function() {}});

		// assert
		assert.equal(okeyPressHandlerSpy.callCount, 0, "MaskEnabler._keyPressHandler should not be called");

		// cleanup
		okeyPressHandlerSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onkeydown event should call _keyDownHandler if maskMode is 'Enforce'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Enforce; }),
			oKeyDownHandler = this.spy(this.oTp, "_keyDownHandler");

		// act
		this.oTp.onkeydown({});

		// assert
		assert.equal(oKeyDownHandler.callCount, 1, "MaskEnabler._keyDownHandler should be called once");

		// cleanup
		oKeyDownHandler.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onkeydown event should not call _keyDownHandler if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			oKeyDownHandler = this.spy(this.oTp, "_keyDownHandler");

		// act
		this.oTp.onkeydown({});

		// assert
		assert.equal(oKeyDownHandler.callCount, 0, "MaskEnabler._keyDownHandler should not be called");

		// cleanup
		oKeyDownHandler.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onfocusin: input value should be empty if the TimePickerMaskMode is 'Off'", function (assert) {
		// prepare
		var sExpectedValue = "",
			oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; });

		// act
		this.oTp.focus();

		// assert
		assert.equal(jQuery("#" + this.oTp.getId() + "-inner").val(), sExpectedValue, "mask should not be applied to the input");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.test("input should fire change event if value is changed and TimePickerMaskMode is 'Off' and focus leaves", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			oChangeSpy = this.spy();
		this.oTp.attachChange(oChangeSpy);

		// act
		this.oTp.focus();
		jQuery(this.oTp.getFocusDomRef()).val("11");
		jQuery(this.oTp.getFocusDomRef()).trigger("blur");

		// assert
		assert.equal(oChangeSpy.callCount, 1, "change event should be called once");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.test("onsapfocusleave: input should not fire change event if value is not changed and TimePickerMaskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
				oChangeSpy = this.spy();
		this.oTp.attachChange(oChangeSpy);

		// act
		this.oTp.focus();
		this.oTp.onsapfocusleave();

		// assert
		assert.equal(oChangeSpy.callCount, 0, "change event should not be called");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.test("on keydown enter: input should fire change event if value is changed and TimePickerMaskMode is 'Off'", async function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode").callsFake(function () { return TimePickerMaskMode.Off; }),
			oChangeSpy = this.spy();
		this.oTp.attachChange(oChangeSpy);
		await nextUIUpdate();

		// act
		jQuery(this.oTp.getFocusDomRef()).val("11");
		qutils.triggerKeydown(jQuery(this.oTp.getFocusDomRef()), KeyCodes.ENTER);

		// assert
		assert.equal(oChangeSpy.callCount, 1, "change event should be called once");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.module("initialFocusedDate property", {
		beforeEach: async function () {
			this.oTp = new TimePicker();
			this.oTp.placeAt("qunit-fixture");
			await nextUIUpdate();
		},

		afterEach: function () {
			this.oTp.destroy();
			this.oTp = null;
		},

		getFormatter: function(sPattern) {
			return DateFormat.getTimeInstance({ pattern: sPattern });
		}
	});

	QUnit.test("_shouldSetInitialFocusedDateValue should return false if TimePicker has value and initialFocusedDate", function (assert) {
		// prepare
		var oGetInitialFocusedDateValueStub = this.stub(this.oTp, "getInitialFocusedDateValue").callsFake(function () { return UI5Date.getInstance(2017, 10, 10, 10, 11, 12, 13); }),
			oIsValidValue = this.stub(this.oTp, "_isValidValue").callsFake(function () { return true; });
		this.oTp.setValue("12:11:10");

		// act && assert
		assert.equal(this.oTp._shouldSetInitialFocusedDateValue(), false, "method should return false");

		// cleanup
		oGetInitialFocusedDateValueStub.restore();
		oIsValidValue.restore();
	});

	QUnit.test("_shouldSetInitialFocusedDateValue should return false if TimePicker has value and no initialFocusedDate", function (assert) {
		// act
		this.oTp.setValue("12:11:10");

		// assert
		assert.equal(this.oTp._shouldSetInitialFocusedDateValue(), false, "method should return false");
	});

	QUnit.test("_shouldSetInitialFocusedDateValue should return false if TimePicker has no value and no initialFocusedDate", function (assert) {
		// prepare
		var oIsValidValue = this.stub(this.oTp, "_isValidValue").callsFake(function () { return true; });

		// assert
		assert.equal(this.oTp._shouldSetInitialFocusedDateValue(), false, "method should return false");

		// cleanup
		oIsValidValue.restore();
	});

	QUnit.test("_shouldSetInitialFocusedDateValue should return true if TimePicker has initialFocusedDate and no value", function (assert) {
		// prepare
		var oGetInitialFocusedDateValueStub = this.stub(this.oTp, "getInitialFocusedDateValue").callsFake(function () { return UI5Date.getInstance(2017, 10, 10, 10, 11, 12, 13); }),
				oIsValidValue = this.stub(this.oTp, "_isValidValue").callsFake(function () { return true; });

		// assert
		assert.equal(this.oTp._shouldSetInitialFocusedDateValue(), true, "method should return true");

		// cleanup
		oGetInitialFocusedDateValueStub.restore();
		oIsValidValue.restore();
	});

	QUnit.test("_shouldSetInitialFocusedDateValue should return true if TimePicker value is not valid", function (assert) {
		// prepare
		var oIsValidValue = this.stub(this.oTp, "_isValidValue").callsFake(function () { return false; });

		// assert
		assert.equal(this.oTp._shouldSetInitialFocusedDateValue(), true, "method should return true");

		// cleanup
		oIsValidValue.restore();
	});

	QUnit.test("onBeforeOpen should call _setTimeValues with provided dateValue not initialFocusedDateValue", function (assert) {
		// prepare
		var oExpectedDateValue = UI5Date.getInstance(2017, 8, 9, 10, 11, 12, 13),
			oInitialFocusedDateValue = UI5Date.getInstance(2017, 2, 3, 4, 5, 6, 7),
			oTimePickerClocks = new TimePickerClocks(this.oTp.getId() + "-clocks", {
				displayFormat: "hh:mm",
				labelText: "",
				minutesStep: this.oTp.getMinutesStep(),
				secondsStep: this.oTp.getSecondsStep()
			}),
			oGetDateValue = this.stub(this.oTp, "getDateValue").callsFake(function () { return oExpectedDateValue; }),
			oShouldSetInitialFocusedDateValueStub = this.stub(this.oTp, "_shouldSetInitialFocusedDateValue").callsFake(function () { return false; }),
			oGetInitialFocusedDateValueStub = this.stub(this.oTp, "getInitialFocusedDateValue").callsFake(function () { return oInitialFocusedDateValue; }),
			oGetClocksStub = this.stub(this.oTp, "_getClocks").callsFake(function () { return oTimePickerClocks; }),
			oIsValidValue = this.stub(this.oTp, "_isValidValue").callsFake(function () { return true; }),
			oSetTimeValuesSpy = this.spy(oTimePickerClocks, "_setTimeValues"),
			oTimeFormatter = this.getFormatter("HH:mm:ss");

		// act
		this.oTp.onBeforeOpen();

		assert.ok(oSetTimeValuesSpy.calledWith(oExpectedDateValue), "clocks value should be set to the getDateValue");
		assert.equal(oTimeFormatter.format(oSetTimeValuesSpy.getCall(0).args[0]), oTimeFormatter.format(oExpectedDateValue), "_setTimeValues should be called with " + oExpectedDateValue);

		// cleanup
		oGetDateValue.restore();
		oShouldSetInitialFocusedDateValueStub.restore();
		oGetInitialFocusedDateValueStub.restore();
		oGetClocksStub.restore();
		oSetTimeValuesSpy.restore();
		oIsValidValue.restore();
		oTimePickerClocks.destroy();
	});

	QUnit.test("onBeforeOpen should call _setTimeValues with provided initialFocusedDateValue if there is no value", function (assert) {
		// prepare
		var oExpectedDateValue = UI5Date.getInstance(2017, 8, 9, 10, 11, 12, 13),
			oTimePickerClocks = new TimePickerClocks(this.oTp.getId() + "-clocks", {
				displayFormat: "hh:mm",
				labelText: "",
				minutesStep: this.oTp.getMinutesStep(),
				secondsStep: this.oTp.getSecondsStep()
			}),
			oGetDateValue = this.stub(this.oTp, "getDateValue").callsFake(function () { return null; }),
			oGetInitialFocusedDateValueStub = this.stub(this.oTp, "getInitialFocusedDateValue").callsFake(function () { return oExpectedDateValue; }),
			oGetClocksStub = this.stub(this.oTp, "_getClocks").callsFake(function () { return oTimePickerClocks; }),
			oIsValidValue = this.stub(this.oTp, "_isValidValue").callsFake(function () { return true; }),
			oSetTimeValuesSpy = this.spy(oTimePickerClocks, "_setTimeValues");

		// act
		this.oTp.onBeforeOpen();

		assert.ok(oSetTimeValuesSpy.calledWith(oExpectedDateValue), "clocks value should be set to the initialFocusedDateValue");
		assert.equal(oSetTimeValuesSpy.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "_setTimeValues should be called with " + oExpectedDateValue);

		// cleanup
		oGetDateValue.restore();
		oGetInitialFocusedDateValueStub.restore();
		oGetClocksStub.restore();
		oSetTimeValuesSpy.restore();
		oIsValidValue.restore();
		oTimePickerClocks.destroy();
	});

	QUnit.test("The picker UI is created with the display format, its value is received in the same format", async function(assert) {
		var oTP = new TimePicker({
				value: "15:00:00",
				displayFormat: "h:mm:ss a",
				valueFormat: "HH:mm:ss"
			}),
			oClocks;

		// arrange
		oTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oTP._openPicker();
		oClocks = oTP._getClocks();

		// assert
		assert.strictEqual("h:mm:ss a", oClocks.getValueFormat(), "the picker UI uses the display format as value format");
		assert.strictEqual("h:mm:ss a", oClocks.getDisplayFormat(), "the picker UI uses only one format");
		assert.strictEqual(oClocks.getValue(), "3:00:00 PM", "the picker UI has the value formatted correctly");

		// clean
		oTP.destroy();
	});

	QUnit.module("events and event handlers", {
		beforeEach: async function () {
			this.oFakeClock = sinon.useFakeTimers();

			//system under test
			this.oTp = new TimePicker({
				valueFormat: "hh mm",
				displayFormat: "hh mm"
			});
			this.oSpy = sinon.spy();
			this.oTp.attachChange(this.oSpy);

			//arrange
			this.oTp.placeAt("qunit-fixture");
			await nextUIUpdate(this.oFakeClock);
		},
		afterEach: async function() {
			this.oTp.destroy();
			this.oSpy = null;
			this.oFakeClock.restore();
			await nextUIUpdate(this.oFakeClock);
		}
	});

	QUnit.test("change event fires only when the value really changed", async function(assert) {
		//system under test
		var tp = new TimePicker({
			valueFormat: "hh mm",
			value: "12 15"
		}), spy = {
				callCount: 0
		};

		tp.attachChange(function () {
			spy.callCount++;
		});

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.oFakeClock);

		tp._handleInputChange("13 00");
		tp._handleInputChange("13 00");
		tp._handleInputChange("13 15");
		tp._handleInputChange("13 15");
		tp._handleInputChange("13 15");

		assert.equal(spy.callCount, 2, "changed event fired only twice");

		spy = null;
		tp.destroy();
	});

	QUnit.test("change event fires when user-input has leading space, but the databinding type formats it without(mask on)",
			async function (assert) {
				//system under test
				var tp = new TimePicker({
					value: {
						path: "/timeValue",
						type: new typeTime(
								{
									"pattern": "h:mm:ss a"
								})
					}
				}), spyChangeEvent = this.spy();

				tp.setModel(new JSONModel({timeValue: "PT11H00M00S"}));
				tp.attachChange(spyChangeEvent);

				// Arrange
				tp.placeAt("qunit-fixture");
				await nextUIUpdate(this.oFakeClock);

				// Act
				tp.updateDomValue(" 8:00:00 AM");
				tp._inputCompletedHandler();

				// Assert
				assert.equal(spyChangeEvent.callCount, 1, "changed event fired only twice");

				// Cleanup
				tp.destroy();
			});

	QUnit.test("change event fires when user-input has leading space, but the databinding type formats it without(mask Off)",
			async function (assert) {
				//system under test
				var tp = new TimePicker({
					value: {
						path: "/timeValue",
						type: new typeTime(
								{
									"pattern": "h:mm:ss a"
								})
					},
					maskMode: TimePickerMaskMode.Off
				}), spyChangeEvent = this.spy();

				tp.setModel(new JSONModel({timeValue: "PT11H00M00S"}));
				tp.attachChange(spyChangeEvent);

				// Arrange
				tp.placeAt("qunit-fixture");
				await nextUIUpdate(this.oFakeClock);

				// Act
				tp.updateDomValue("08:00:00 AM");
				tp._inputCompletedHandlerNoMask();

				// Assert
				assert.equal(spyChangeEvent.callCount, 1, "changed event fired only twice");

				// Cleanup
				tp.destroy();
			});


	//BCP: 1670343229
	QUnit.test("change event fires on second change after the value is set in the change handler", async function(assert) {
		//system under test
		var tp = new TimePicker({
			valueFormat: "hh mm",
			displayFormat: "hh mm",
			value: "11 30"
		}), spy = {
			callCount: 0
		};

		tp.attachChange(function () {
			spy.callCount++;
			tp.setValue("11 30");
		});

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.oFakeClock);

		//act
		tp._handleInputChange("11 28");
		tp._handleInputChange("11 28");

		//assert
		assert.equal(spy.callCount, 2, "changed event fired twice");

		spy = null;
		tp.destroy();
	});

	QUnit.test("_handleInputChange formats correctly givven value before setting it to the property value", async function(assert) {
		//system under test
		var tp = new TimePicker("tp", {
			valueFormat: "h:mm:ss",
			displayFormat: "h:mm:ss"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.oFakeClock);

		//act
		tp._$input.val("2:28:34");
		tp._handleInputChange();

		//assert
		assert.equal(tp.getValue(), '2:28:34', "getValue is correct");

		tp.destroy();
		await nextUIUpdate(this.oFakeClock);
	});

	QUnit.test("change event fires when the value is reset", function(assert) {
		var oTpFocusDomRef = jQuery(this.oTp.getFocusDomRef());

		//system under test
		triggerMultipleKeypress(this.oTp, "09");
		qutils.triggerKeydown(oTpFocusDomRef, KeyCodes.ENTER);

		assert.equal(this.oSpy.callCount, 1, "changed event fired when the value is set");

		while (oTpFocusDomRef.val() !== "-- --") {
			qutils.triggerKeydown(oTpFocusDomRef, KeyCodes.BACKSPACE);
		}
		qutils.triggerKeydown(oTpFocusDomRef, KeyCodes.ENTER);

		assert.equal(this.oSpy.callCount, 2, "changed event fired when the value is reset");
	});

	QUnit.test("upon enter, change event fires only once", function(assert) {
		//act
		triggerMultipleKeypress(this.oTp, "09");
		qutils.triggerKeydown(jQuery(this.oTp.getFocusDomRef()), KeyCodes.ENTER);
		assert.equal(this.oSpy.callCount, 1, "changed event must be fired only once");
	});

	QUnit.test("upon focusin of timepicker input, no picker should be visible", function (assert) {
		//arrange (open picker in order it to be initialized and rendered
		this.oTp._openPicker();
		this.oFakeClock.tick(1000);
		qutils.triggerEvent('focusin', this.oTp.getDomRef());
		this.oFakeClock.tick(1000);
		//assert
		assert.ok(!this.oTp._getPicker().isOpen(), "The picker 'isOpen' state is false");
		assert.ok(!this.oTp._getPicker().$().is(":visible"), "jQuery.is(':visible') returned false");
		assert.strictEqual(this.oTp._getPicker().$().css('display'), 'none', "The picker css display property is none");
	});

	QUnit.test("tap on the input icon on Tablet opens the picker", async function(assert) {
		// releated to BCP: 1670338556
		var tp = new TimePicker(),
			oIsIconClickedSpy = this.spy(tp, "_isIconClicked");
		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.oFakeClock);

		tp._openPicker();
		var icon = tp.$().find(".sapUiIcon");
		var oEvent = {
			target: icon
		};

		tp.onfocusin(oEvent);
		this.oFakeClock.tick(1000);

		//assert
		assert.strictEqual(jQuery(".sapMPopover").is(":visible"), true, "When tapped on the button the picker stays opened");
		assert.strictEqual(oIsIconClickedSpy.callCount, 1, "_isIconClicked function is called on focusin");

		oEvent.target = tp.getDomRef();

		tp.onfocusin(oEvent);
		this.oFakeClock.tick(1000);

		//assert
		assert.strictEqual(jQuery(".sapMPopover").is(":visible"), false, "When focus on the field the picker is closed");
		assert.strictEqual(oIsIconClickedSpy.callCount, 2, "_isIconClicked function is called on focusin");

		// clean up
		tp.destroy();
		oIsIconClickedSpy.restore();
	});


	QUnit.test("_isIconClicked works correctly", function(assert) {
		// releated to BCP: 1880695361
		//arrange
		var tp = new TimePicker(),
			oEvent;

		oEvent = { target: ".sapUiIcon" };

		//assert
		assert.strictEqual(tp._isIconClicked(oEvent), true, "_isIconClicked returns true when the event has target sapUiIcon");

		oEvent = { target: ".sapMInputBaseIconContainer" };

		//assert
		assert.strictEqual(tp._isIconClicked(oEvent), true, "_isIconClicked returns true when the event has target sapMInputBaseIconContainer");

		oEvent = { target: ".someOtherClass" };

		//assert
		assert.strictEqual(tp._isIconClicked(oEvent), false, "_isIconClicked returns false when the event has some other target");

		// clean up
		tp.destroy();
	});

	QUnit.test("upon focusout, change event fires only once", async function(assert) {
		//system under test
		var	oTp2 = new TimePicker({
				valueFormat: "hh mm"
		});
		//arrange
		oTp2.placeAt("qunit-fixture");
		await nextUIUpdate(this.oFakeClock);

		//act
		triggerMultipleKeypress(this.oTp, "09");
		jQuery(oTp2.getFocusDomRef()).trigger("focus");

		assert.equal(this.oSpy.callCount, 1, "changed event must be fired only once");

		oTp2.destroy();
	});

	QUnit.test("upon focusout, change event not fired when no value change", async function(assert) {
		//system under test
		var	oTp2 = new TimePicker({
			valueFormat: "hh:mm"
		});
		//arrange
		this.oTp.setValue("07:15");
		oTp2.placeAt("content");
		await nextUIUpdate(this.oFakeClock);

		//act
		jQuery(this.oTp.getFocusDomRef()).trigger("focus");
		jQuery(oTp2.getFocusDomRef()).trigger("focus");

		assert.equal(this.oSpy.callCount, 0, "changed event must not be fired");

		oTp2.destroy();
	});

	QUnit.test("afterValueHelpOpen and afterValueHelpClose event fire when value help opens and closes",async function(assert) {
		var tp = new TimePicker(),
			spyOpen = this.spy(tp, "fireAfterValueHelpOpen"),
			spyClose = this.spy(tp, "fireAfterValueHelpClose");

		tp.placeAt("qunit-fixture");
		await nextUIUpdate(this.oFakeClock);

		var oPopup = tp._createPicker(tp._getDisplayFormatPattern());
		oPopup.fireAfterOpen();
		oPopup.fireAfterClose();

		assert.ok(spyOpen.calledOnce, "afterValueHelpOpen event fired");
		assert.ok(spyClose.calledOnce, "afterValueHelpClose event fired");

		spyOpen = null;
		spyClose = null;
		tp.destroy();
	});

	QUnit.test("liveChange fires on direct typing", async function (assert){
		var oTP = new TimePicker({
			maskMode: TimePickerMaskMode.Enforce
		}),
			spyLiveChange = this.spy(oTP, "fireLiveChange");

		oTP.placeAt("qunit-fixture");
		await nextUIUpdate(this.oFakeClock);

		// Act
		oTP.focus();
		this.oFakeClock.tick(100);

		// Act
		qutils.triggerKeypress(oTP.getDomRef(), "1");

		// Assert
		assert.equal(spyLiveChange.callCount, 1, "liveChange fired");

		// Act
		qutils.triggerKeypress(oTP.getDomRef(), "2");

		// Assert
		assert.equal(spyLiveChange.callCount, 2, "liveChange fired");

		// Act
		qutils.triggerKeydown(oTP.getDomRef(), KeyCodes.BACKSPACE);

		// Assert
		assert.equal(spyLiveChange.callCount, 3, "liveChange fired on Backspace");

		spyLiveChange = null;
		oTP.destroy();
	});

	QUnit.module("Private methods", {
		beforeEach: async function () {
			this.oTP = new TimePicker();
			this.oTP.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			this.oTP.destroy();
			this.oTP = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("_createPopupContent", function (assert) {
		var oPopupContent;

		// Act
		this.oTP.toggleOpen();

		oPopupContent = this.oTP.getAggregation("_picker").getContent();

		// Assert
		assert.ok(oPopupContent[0].isA("sap.m.ValueStateHeader"), "There is a sap.m.ValueStateHeader created in the popup content");
		assert.ok(oPopupContent[1].isA("sap.m.TimePickerClocks"), "There is a sap.m.TimePickerClocks created in the popup content");
	});

	QUnit.test("Value state and value state text are properly updated", function(assert) {
		// Arrange
		var oFocusInSpy = this.spy(DateTimeField.prototype, "onfocusin"),
			oFakeEvent = {
				target: {
					classList: {
						contains: function() { return false; }
					}
				}
			};

		// Act
		this.oTP.onfocusin(oFakeEvent);

		// Assert
		assert.ok(oFocusInSpy.calledOnce, "sap.m.DateTimeField.prototype.onfocusin method is called");
	});

	QUnit.test("_inPreferredUserInteraction", async function (assert) {
		// Prepare
		var oTP = new TimePicker(),
			oInPreferredUserInteractionSpy = this.spy(oTP, "_inPreferredUserInteraction");

		oTP.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oInPreferredUserInteractionSpy.calledOnce, "Preferred interaction is handled during rendering");

		// Clean
		oTP.destroy();
	});

	function triggerMultipleKeypress(timePicker, sFeed) {
		var aFeed = sFeed.split(""),
				$TimePicker = timePicker.getDomRef(),
				sChar;

		while (aFeed.length) {
			sChar = aFeed.splice(0, 1)[0];
			qutils.triggerKeydown($TimePicker, sChar);
			qutils.triggerKeypress($TimePicker, sChar);
		}
	}
});
