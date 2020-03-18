/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/InvisibleText",
	"sap/ui/test/TestUtils",
	"sap/m/TimePickerSliders",
	"sap/m/TimePickerSlider",
	"sap/m/VisibleItem",
	"sap/m/library",
	"sap/m/TimePicker",
	"jquery.sap.keycodes",
	"sap/m/DatePicker",
	"sap/ui/model/type/Time",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/library",
	"sap/m/InputBase",
	"sap/ui/core/Locale",
	"sap/m/Label",
	"sap/ui/core/LocaleData",
	"sap/m/MaskEnabler",
	"sap/ui/model/odata/type/Time",
	"jquery.sap.global"
], function(
	qutils,
	createAndAppendDiv,
	DateFormat,
	InvisibleText,
	TestUtils,
	TimePickerSliders,
	TimePickerSlider,
	VisibleItem,
	mobileLibrary,
	TimePicker,
	jQuery,
	DatePicker,
	Time,
	JSONModel,
	ODataModel,
	coreLibrary,
	InputBase,
	Locale,
	Label,
	LocaleData,
	MaskEnabler,
	typeTime
) {
	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// shortcut for sap.m.TimePickerMaskMode
	var TimePickerMaskMode = mobileLibrary.TimePickerMaskMode;

	createAndAppendDiv("content");
	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");
	var sMyxml =
		"<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\" controllerName=\"my.own.controller\">" +
		"    <VBox>" +
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
		beforeEach: function() {
			this.oTp = new TimePicker();
			this.oTp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oTp.destroy();
			this.oTp = null;
		}
	});

	QUnit.test("sliders initial minutesStep value", function(assert) {
		var STEP = 17;
		this.oTp.setMinutesStep(STEP);

		//Assert
		assert.ok(!this.oTp._getSliders(), "no picker -> no sliders");

		//Act
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		//Assert
		assert.equal(this.oTp._getSliders().getMinutesStep(), STEP, "initial value of the time picker for minutesStep is used");
	});

	QUnit.test("setMinutesStep", function(assert) {
		var oSpySetProperty,
				oSpySlidersSetMinutesStep,
				STEP = 23;
		//arrange
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		oSpySetProperty = this.spy(this.oTp, "setProperty");
		oSpySlidersSetMinutesStep = this.spy(this.oTp._getSliders(), "setMinutesStep");

		//Act
		this.oTp.setMinutesStep(STEP);

		//Assert
		assert.ok(oSpySlidersSetMinutesStep.calledWith(STEP), "setMinutesStep is propagated to the picker part");
		assert.ok(oSpySetProperty.calledWith("minutesStep", STEP, true), "property is updated without re-rendering");
	});

	QUnit.test("setMinutesStep corrects value 0 to 1", function(assert) {
		var oSpySetProperty,
				oSpySlidersSetMinutesStep,
				step = 0,
				expectedStep = 1;

		//arrange
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		oSpySetProperty = this.spy(this.oTp, "setProperty");
		oSpySlidersSetMinutesStep = this.spy(this.oTp._getSliders(), "setMinutesStep");

		//Act
		this.oTp.setMinutesStep(step);

		//Assert
		assert.ok(oSpySlidersSetMinutesStep.calledWith(expectedStep), "setMinutesStep is propagated to the picker part with corrected value - 0 becomes 1");
		assert.ok(oSpySetProperty.calledWith("minutesStep", expectedStep, true), "property is updated without re-rendering. Setter is called with corrected value - 0 becomes 1");

		oSpySetProperty.restore();
		oSpySlidersSetMinutesStep.restore();
	});

	QUnit.test("setSecondsStep corrects value 0 to 1", function(assert) {
		var oSpySetProperty,
				oSpySlidersSetSecondsStep,
				step = 0,
				expectedStep = 1;

		//arrange
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		oSpySetProperty = this.spy(this.oTp, "setProperty");
		oSpySlidersSetSecondsStep = this.spy(this.oTp._getSliders(), "setSecondsStep");

		//Act
		this.oTp.setSecondsStep(step);

		//Assert
		assert.ok(oSpySlidersSetSecondsStep.calledWith(expectedStep), "setSecondsStep is propagated to the picker part with corrected value - 0 becomes 1");
		assert.ok(oSpySetProperty.calledWith("secondsStep", expectedStep, true), "property is updated without re-rendering. Setter is called with corrected value - 0 becomes 1");

		oSpySetProperty.restore();
		oSpySlidersSetSecondsStep.restore();
	});

	QUnit.test("setMinutesStep corrects negative values to 1", function(assert) {
		var oSpySetProperty,
				oSpySlidersSetMinutesStep,
				step = -2,
				expectedStep = 1;

		//arrange
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		oSpySetProperty = this.spy(this.oTp, "setProperty");
		oSpySlidersSetMinutesStep = this.spy(this.oTp._getSliders(), "setMinutesStep");

		//Act
		this.oTp.setMinutesStep(step);

		//Assert
		assert.ok(oSpySlidersSetMinutesStep.calledWith(expectedStep), "setMinutesStep is propagated to the picker part with corrected value - -2 becomes 1");
		assert.ok(oSpySetProperty.calledWith("minutesStep", expectedStep, true), "property is updated without re-rendering. Setter is called with corrected value - -2 becomes 1");

		oSpySetProperty.restore();
		oSpySlidersSetMinutesStep.restore();
	});

	QUnit.test("setSecondsStep corrects negative values to 1", function(assert) {
		var oSpySetProperty,
				oSpySlidersSetSecondsStep,
				step = -2,
				expectedStep = 1;

		//arrange
		this.oTp._createPicker(this.oTp.getDisplayFormat());

		oSpySetProperty = this.spy(this.oTp, "setProperty");
		oSpySlidersSetSecondsStep = this.spy(this.oTp._getSliders(), "setSecondsStep");

		//Act
		this.oTp.setSecondsStep(step);

		//Assert
		assert.ok(oSpySlidersSetSecondsStep.calledWith(expectedStep), "setSecondsStep is propagated to the picker part with corrected value - -2 becomes 1");
		assert.ok(oSpySetProperty.calledWith("secondsStep", expectedStep, true), "property is updated without re-rendering. Setter is called with corrected value - -2 becomes 1");

		oSpySetProperty.restore();
		oSpySlidersSetSecondsStep.restore();
	});

	QUnit.module("step precision in sliders", {
		beforeEach: function() {
			this.oSliders = new TimePickerSliders({
				format: "hh mm ss",
				labelText: "label",
				minutesStep: this.STEP
			});
			this.oSliders.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oSliders.destroy();
			this.oSliders = null;
		},
		STEP: 5,
		ANOTHER_STEP: 14
	});

	QUnit.test("setMinutesStep", function(assert) {
		var oSpySetProperty = this.spy(this.oSliders, "setProperty"),
			oSpySetupLists = this.spy(this.oSliders, "_setupLists");

		//Act
		this.oSliders.setMinutesStep(this.ANOTHER_STEP);

		//Assert
		assert.ok(oSpySetProperty.calledWith("minutesStep", this.ANOTHER_STEP, true), "property updated without re-rendering");
		assert.ok(oSpySetupLists.calledOnce, "sliders are re-build");
	});

	QUnit.module("step precision in a single slider", {
		beforeEach: function() {
			this.oSlider = new TimePickerSlider({
				items: [
					TimePickerSliders.prototype._generatePickerListValues(0, 59, this.STEP, true)
				]
			});
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oSlider.destroy();
			this.oSlider = null;
		},
		STEP: 11,
		ANOTHER_STEP: 14
	});

	QUnit.test("_updateStepAndValue", function(assert) {
		var $ValuesContainer = this.oSlider.$().find(".sapMTimePickerSlider"),
			SELECTED_VALUE = 18,
			STEP = this.ANOTHER_STEP,
			fnHasValueMultipleOfStepOrEqualToSelectedValue = function(oItem) {
				var iItemValue = parseInt(oItem.getText());
				return iItemValue === SELECTED_VALUE
						|| iItemValue % STEP === 0;
			};

		//Act
		this.oSlider._updateStepAndValue(SELECTED_VALUE, STEP);

		//Assert
		assert.ok($ValuesContainer.hasClass("SliderValues6"), "values container has the right class");
		assert.ok(this.oSlider._getVisibleItems().every(fnHasValueMultipleOfStepOrEqualToSelectedValue), "all visible items have correct values");
		assert.equal(this.oSlider.getSelectedValue(), SELECTED_VALUE, "slider has the right selected value");
	});

	QUnit.test("margins are updated on expand", function(assert) {
		var oSpyUpdateMargins = this.spy(this.oSlider, "_updateMargins");

		//Act
		this.oSlider.setIsExpanded(true, true);

		//Assert
		assert.ok(oSpyUpdateMargins.calledOnce, "margins are updated on expand");

		//Act
		this.oSlider.setIsExpanded(false, true);

		//Assert
		assert.ok(oSpyUpdateMargins.calledTwice, "margins are updated on collapse");
	});

	QUnit.test("setIsCyclic", function(assert) {
		this.oSlider.setIsCyclic(true);
		sap.ui.getCore().applyChanges();

		assert.ok(!this.oSlider.$().hasClass("sapMTimePickerSliderShort"), "slider styled correctly");
		assert.equal(this.oSlider.getProperty("isCyclic"), true, "property is updated");

		this.oSlider.setIsCyclic(false);
		sap.ui.getCore().applyChanges();

		assert.ok(this.oSlider.$().hasClass("sapMTimePickerSliderShort"), "slider styled correctly");
		assert.equal(this.oSlider.getProperty("isCyclic"), false, "property is updated");
	});

	QUnit.module("slider select value by typing", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();
			//SUT
			this.oSlider = new TimePickerSlider({
				items: [
					new VisibleItem({key: "1", text: "01"}),
					new VisibleItem({key: "2", text: "02"}),
					new VisibleItem({key: "3", text: "03"}),
					new VisibleItem({key: "11", text: "11"}),
					new VisibleItem({key: "113", text: "113"})
				]
			});
			this.oSpy = sinon.spy(this.oSlider, "setSelectedValue");
			this.iNowTimeStamp = 50501234;
		},
		afterEach: function() {
			this.clock.restore();
			this.oSpy.restore();
			this.oSlider.destroy();
			this.oSlider = null;
		}
	});

	QUnit.test("_fnHandleTypeValues immediately sets the selected value when a unique key is matched", function(assert) {
		//Act
		this.oSlider._fnHandleTypeValues(this.iNowTimeStamp, jQuery.sap.KeyCodes.DIGIT_2);

		//Assert
		assert.ok(this.oSpy.calledOnce, "setSelectedValue is called once");
		assert.ok(this.oSpy.calledWith("2"), "setSelectedValue is called with the right item key");
	});

	QUnit.test("_fnHandleTypeValues stacks calls that do not have exact match within a second", function(assert) {
		//Act
		this.oSlider._fnHandleTypeValues(this.iNowTimeStamp, jQuery.sap.KeyCodes.DIGIT_1);
		this.oSlider._fnHandleTypeValues(this.iNowTimeStamp + 500, jQuery.sap.KeyCodes.DIGIT_1);

		//Assert
		assert.equal(this.oSpy.callCount, 0, "setSelectedValue is not called yet, because there are 2 matched keys");

		//Wait
		this.clock.tick(1000);

		//Assert
		assert.ok(this.oSpy.calledOnce, "setSelectedValue is called only once after 1 second when there are multiple matched keys");
		assert.ok(this.oSpy.calledWith("11"), "setSelectedValue is called with the right item key");
	});

	QUnit.test("_fnHandleTypeValues does not change selection when there is no matched item key", function(assert) {
		//Act
		this.oSlider._fnHandleTypeValues(this.iNowTimeStamp, jQuery.sap.KeyCodes.DIGIT_5);

		//Assert
		assert.equal(this.oSpy.callCount, 0, "setSelectedValue is not called after typing non-existent item key");

		//Wait
		this.clock.tick(1000);

		//Assert
		assert.equal(this.oSpy.callCount, 0, "setSelectedValue is still not called after waiting 1 second");
	});

	QUnit.module("API", {
		beforeEach : function() {
			this.clock = sinon.useFakeTimers();
			this.oTimePicker = new TimePicker("t1");
			this.oTimePicker.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.clock.restore();
			this.oTimePicker.destroy();
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
		assert.strictEqual(this.oTimePicker.getDisplayFormat(), "h:mm:ss a", "the default value is h:mm:ss a");
	});

	QUnit.test("After changing the displayFormat property, the getDisplayFormat function returns the new value", function(assert) {
		var newFormat = "hh:mm:ss";
		this.oTimePicker.setDisplayFormat(newFormat);
		assert.strictEqual(this.oTimePicker.getDisplayFormat(), newFormat, "the format property was changed");
	});

	QUnit.test("The method generatePickerListValues generates the correct result", function(assert) {
		var iStart = 2;
		var iEnd = 5;
		var aList = TimePickerSliders.prototype._generatePickerListValues(iStart, iEnd, 1, false);
		assert.strictEqual(jQuery.isArray(aList), true, "the method returns an array");
		assert.strictEqual(aList.length, iEnd - iStart + 1, "the method returns an array with the correct number of objects");
		assert.strictEqual(parseInt(aList[0].getKey()), iStart, "the key property of the first element of the array is correct");
		assert.strictEqual(parseInt(aList[0].getText()), iStart, "the text property of the first element of the array is correct");
		assert.strictEqual(parseInt(aList[aList.length - 1].getKey()), iEnd, "the key property of the last element of the array is correct");
		assert.strictEqual(parseInt(aList[aList.length - 1].getText()), iEnd, "the text property of the last element of the array is correct");
	});

	QUnit.test("ValueHelp icon is not visible when timepicker is not editable", function (assert) {
		// arrange
		var oTimePicker = new DatePicker({ editable: false }),
			oValueHelpIconSetPropertySpy = this.spy(),
			oValueHelpIconStub = this.stub(oTimePicker, "_getValueHelpIcon", function () {
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

	QUnit.module("Placeholder", {
		beforeEach: function () {
			// SUT
			this.oTimePicker = new TimePicker();
			this.oTimePicker.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
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
		// Assert
		assert.equal(this.oTimePicker._getPlaceholder(), "HH:mm", "The placeholder is 'HH:mm'");
	});

	QUnit.test("Set displayFormat to 'short'", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat("short");
		// Assert
		assert.equal(this.oTimePicker._getPlaceholder(), "h:mm a", "The placeholder is 'h:mm a'");
	});

	QUnit.module("Display format", {
		beforeEach: function () {
			// SUT
			this.oTimePicker = new TimePicker({
				dateValue: new Date(2016, 1, 17, 10, 11, 12)
			});
			this.oTimePicker.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			// Cleanup
			this.oTimePicker.destroy();
			this.oTimePicker = null;
		}
	});

	QUnit.test("Default", function (assert) {
		// Assert
		assert.equal(this.oTimePicker._$input.val(), "10:11:12 AM", "Display format is correct");
	});

	QUnit.test("Empty", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat();
		// Assert
		assert.equal(this.oTimePicker._$input.val(), "10:11:12 AM", "Display format is correct");
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
		// Assert
		assert.equal(this.oTimePicker._$input.val(), "10:11 AM", "Display format is correct");
	});

	QUnit.test("medium", function (assert) {
		// Act
		this.oTimePicker.setDisplayFormat("medium");
		// Assert
		assert.equal(this.oTimePicker._$input.val(), "10:11:12 AM", "Display format is correct");
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
		return new Date("2000", "1", "1", hours, minutes, seconds);
	}

	//test the final result after setting some properties in order
	function generateValuesTest(aSetValues, oExpectedValues) {
		//system under test
		var tp = new TimePicker(),
			i,
			key;

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//act
		for (i = 0; i < aSetValues.length; i++) {
			tp[aSetValues[i]["key"]](aSetValues[i]["value"]);
		}

		//assert
		// trim because the framework formatter has no leading space,
		// but the tp now has a leading space for for h:mm, H:mm format
		assert.equal(jQuery("#" + tp.getId() + "-inner").val().trim(), oExpectedValues["expInputVal"], "$input.val() ok");

		assert.equal(tp.getValue(), oExpectedValues["expValue"], "getValue() ok");

		var oDateValue = tp.getDateValue();
		oDateValue.setFullYear(oExpectedValues["expDateValue"].getFullYear());
		oDateValue.setMonth(oExpectedValues["expDateValue"].getMonth());
		oDateValue.setDate(oExpectedValues["expDateValue"].getDate());
		assert.equal(oDateValue.toString(), oExpectedValues["expDateValue"].toString(), "getDateValue ok");

		//cleanup
		tp.destroy();
	}

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
					{ key: "setValue", value: "13:34:00" },
					{ key: "setValueFormat", value: "HH:mm:ss" }
				],
				{
					expInputVal: that._defaultFormatter.format(getDate(13, 34, 0)),
					expValue: "13:34:00",
					expDateValue: getDate(13, 34, 0)
				});
	});

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
					{ key: "setValueFormat", value: "HH:mm:ss" },
					{ key: "setValue", value: "21:13:14" }
				],
				{
					expInputVal: that._defaultFormatter.format(getDate(21, 13, 14)),
					expValue: "21:13:14",
					expDateValue: getDate(21, 13, 14)
				});
	});

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
					{ key: "setValue", value: "4:15:55" }
				],
				{
					expInputVal: that._defaultFormatter.format(getDate(4, 15, 55)),
					expValue: "4:15:55",
					expDateValue: getDate(4, 15, 55)
				});
	});

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
					{ key: "setValue", value: that._defaultFormatter.format(getDate(17, 27, 43)) },
					{ key: "setDisplayFormat", value: "HH:mm" }
				],
				{
					expInputVal: "17:27",
					expValue: that._defaultFormatter.format(getDate(17, 27, 43)),
					expDateValue: getDate(17, 27, 43)
				});
	});

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
					{ key: "setDisplayFormat", value: "HH:mm" },
					{ key: "setValue", value:  that._defaultFormatter.format(getDate(17, 5, 33)) }
				],
				{
					expInputVal: "17:05",
					expValue:  that._defaultFormatter.format(getDate(17, 5, 33)),
					expDateValue: getDate(17, 5, 33)
				});
	});

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
					{ key: "setDisplayFormat", value: "HH:mm" },
					{ key: "setDateValue", value: getDate(17, 27, 43) }
				],
				{
					expInputVal: "17:27",
					expValue: that._defaultFormatter.format(getDate(17, 27, 43)),
					expDateValue: getDate(17, 27, 43)
				});
	});

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
					{ key: "setDateValue", value: getDate(17, 27, 43) },
					{ key: "setDisplayFormat", value: "HH:mm" }
				],
				{
					expInputVal: "17:27",
					expValue: that._defaultFormatter.format(getDate(17, 27, 43)),
					expDateValue: getDate(17, 27, 43)
				});
	});

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
					{ key: "setDateValue", value: getDate(17, 27, 43) },
					{ key: "setValue", value: that._defaultFormatter.format(getDate(18, 37, 23)) }
				],
				{
					expInputVal: that._defaultFormatter.format(getDate(18, 37, 23)),
					expValue: that._defaultFormatter.format(getDate(18, 37, 23)),
					expDateValue: getDate(18, 37, 23)
				});
	});

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
					{ key: "setValue", value: that._defaultFormatter.format(getDate(6, 37, 23)) },
					{ key: "setDateValue", value: getDate(5, 28, 40) }
				],
				{
					expInputVal: that._defaultFormatter.format(getDate(5, 28, 40)),
					expValue: that._defaultFormatter.format(getDate(5, 28, 40)),
					expDateValue: getDate(5, 28, 40)
				});
	});

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
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

	QUnit.test(getID(), function(assert) {
		var that = this;
		generateValuesTest([
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

	QUnit.test(getID(), function(assert) {
		generateValuesTest([
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

	QUnit.test(getID(), function(assert) {
		generateValuesTest([
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

	QUnit.test(getID(), function(assert) {
		generateValuesTest([
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

	QUnit.test("test locale", function(assert) {
		generateValuesTest([
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

	QUnit.test("test default locale", function (assert) {
		var stub = sinon.stub(sap.ui.getCore().getConfiguration().getFormatSettings(), 'getFormatLocale').returns(new Locale('ar'));
		//Test default browser locale set to arabic
		generateValuesTest([
			{ key: "setDisplayFormat", value: "hh:mm:ss a"},
			{ key: "setValueFormat", value: "hh:mm a"},
			{ key: "setDateValue", value: getDate(23, 32, 0)}
		], {
			expInputVal: "11:32:00 م",
			expValue: "11:32 م",
			expDateValue: getDate(23, 32, 0)
		});
		//Test default browser local set to arabic and also custom TimePicker locale set to German
		generateValuesTest([
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
			oSystemLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();

		// act
		oLocale = oTP._getLocale();

		// assert
		assert.ok(!oTP.getLocaleId(), "there is no localeId specified");
		assert.strictEqual(oLocale, oSystemLocale, "'_getLocale' returns system configuration, if the user haven't specified localeId");

		//cleanup
		oTP.destroy();
	});

	QUnit.test("_getLocale when localeId is set", function (assert) {
		// arrange
		var oTP = new TimePicker({localeId:'en'}),
			oLocale,
			oSystemLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();

		// act
		oLocale = oTP._getLocale();

		// assert
		assert.equal(oTP.getLocaleId(), "en");
		assert.ok(oLocale !== oSystemLocale, "'_getLocale' is different from the system configuration, if the user have specified localeId");

		// cleanup
		oTP.destroy();
	});

	QUnit.test("Value is validated when setValue is called with null or undefined", function (assert) {
		var oTP = new TimePicker({
				displayFormat: "HH:mm"
			});

		oTP.placeAt('qunit-fixture');
		sap.ui.getCore().applyChanges();

		oTP.setValue(null);
		assert.strictEqual(oTP.getValue(), "", "'getValue' is updated and returns correct VALIDATED value");
		oTP.setValue(undefined);
		assert.strictEqual(oTP.getValue(), "", "'getValue' is updated and returns correct VALIDATED value");

		oTP.destroy();
	});

	QUnit.module("Keyboard handling of picker", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();

		},
		afterEach: function() {
			this.clock.restore();
		}
	});

	QUnit.test("initial focus", function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp._openPicker();
		this.clock.tick(1000);

		var $firstSlider = tp._getSliders().getAggregation("_columns")[0];
		var oSliderFocusSpy = this.spy($firstSlider, "focus");

		assert.ok(oSliderFocusSpy.callCount >= 0, "picker exists and its first slider is focussed at some point");

		//cleanup
		tp.destroy();
		$firstSlider.focus.restore();
	});

	QUnit.test("arrow left", function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp._openPicker();
		this.clock.tick(1000);

		var $oElement = document.activeElement;
		var sliders = tp._getSliders();
		var firstSlider = sliders.getAggregation("_columns")[0];
		var lastSlider = sliders.getAggregation("_columns")[3];
		var secondLastSlider = sliders.getAggregation("_columns")[2];

		assert.equal($oElement.id, firstSlider.getId(), "picker exists and first slider is the current focussed element");

		qutils.triggerKeydown(sliders.getDomRef(), jQuery.sap.KeyCodes.ARROW_LEFT);
		this.clock.tick(100);

		$oElement = document.activeElement;
		assert.equal($oElement.id, lastSlider.getId(), "the last slider is the focussed element");

		qutils.triggerKeydown(sliders.getDomRef(), jQuery.sap.KeyCodes.ARROW_LEFT);
		this.clock.tick(100);

		$oElement = document.activeElement;
		assert.equal($oElement.id, secondLastSlider.getId(), "the second last slider is the focussed element");

		//cleanup
		tp.destroy();
	});


	QUnit.test("arrow right", function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp._openPicker();
		this.clock.tick(1000);

		var $oElement = document.activeElement;
		var sliders = tp._getSliders();
		var firstSlider = sliders.getAggregation("_columns")[0];
		var secondSlider = sliders.getAggregation("_columns")[1];

		assert.equal($oElement.id, firstSlider.getId(), "picker exists and first slider is the current focussed element");

		qutils.triggerKeydown(sliders.getDomRef(), jQuery.sap.KeyCodes.ARROW_RIGHT);
		this.clock.tick(100);

		$oElement = document.activeElement;
		assert.equal($oElement.id, secondSlider.getId(), "the second slider is the focussed element");

		qutils.triggerKeydown(sliders.getDomRef(), jQuery.sap.KeyCodes.ARROW_RIGHT);
		this.clock.tick(100);
		qutils.triggerKeydown(sliders.getDomRef(), jQuery.sap.KeyCodes.ARROW_RIGHT);
		this.clock.tick(100);
		qutils.triggerKeydown(sliders.getDomRef(), jQuery.sap.KeyCodes.ARROW_RIGHT);
		this.clock.tick(100);

		$oElement = document.activeElement;
		assert.equal($oElement.id, firstSlider.getId(), "the first slider is the focussed element again");

		//cleanup
		tp.destroy();
	});

	QUnit.test("end and home", function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp._openPicker();
		this.clock.tick(1000);

		var $oElement = document.activeElement;
		var sliders = tp._getSliders();
		var firstSlider = sliders.getAggregation("_columns")[0];
		var lastSlider = sliders.getAggregation("_columns")[3];

		qutils.triggerKeydown(sliders.getDomRef(), jQuery.sap.KeyCodes.END);
		this.clock.tick(100);

		$oElement = document.activeElement;
		assert.equal($oElement.id, lastSlider.getId(), "the last slider is the focussed element");

		qutils.triggerKeydown(sliders.getDomRef(), jQuery.sap.KeyCodes.HOME);
		this.clock.tick(100);

		$oElement = document.activeElement;
		assert.equal($oElement.id, firstSlider.getId(), "the first slider is the focussed element again");

		//cleanup
		tp.destroy();
	});

	QUnit.test("pageup and pagedown", function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp._openPicker();
		this.clock.tick(1000);

		var sliders = tp._getSliders();
		var firstSlider = sliders.getAggregation("_columns")[0];

		qutils.triggerKeydown(firstSlider.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP);
		this.clock.tick(100);


		assert.equal(firstSlider.getSelectedValue(), firstSlider.getItems()[0].getKey(), "the selected value is the first value");

		qutils.triggerKeydown(firstSlider.getDomRef(), jQuery.sap.KeyCodes.PAGE_DOWN);
		this.clock.tick(100);

		assert.equal(firstSlider.getSelectedValue(), firstSlider.getItems()[firstSlider.getItems().length - 1].getKey(), "the selected value is the last value");

		qutils.triggerKeydown(firstSlider.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP);
		this.clock.tick(100);

		assert.equal(firstSlider.getSelectedValue(), firstSlider.getItems()[0].getKey(), "the selected value is the first value again");

		//cleanup
		tp.destroy();
	});

	QUnit.test("up and down", function(assert) {
		var oDate = new Date();
		oDate.setHours(4);
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp._openPicker();
		this.clock.tick(1000);

		var sliders = tp._getSliders();
		var firstSlider = sliders.getAggregation("_columns")[0];

		qutils.triggerKeydown(firstSlider.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(210);


		assert.equal(firstSlider.getSelectedValue(), "3", "the selected value is one value upwards");

		qutils.triggerKeydown(firstSlider.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		this.clock.tick(210);

		assert.equal(firstSlider.getSelectedValue(), "4", "the selected value is one value downwards");

		//cleanup
		tp.destroy();
	});

	QUnit.test("Alt + up", function(assert) {
		var oDate = new Date();
		oDate.setHours(4);
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp._openPicker();
		this.clock.tick(100);

		var sliders = tp._getSliders();
		var firstSlider = sliders.getAggregation("_columns")[0];
		var picker = tp._getPicker();
		var oHandleOkSpy = this.spy(tp, "_handleOkPress");

		//slider one up
		qutils.triggerKeydown(firstSlider.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(300);

		//close and save
		qutils.triggerKeydown(firstSlider.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, false, true, false);
		this.clock.tick(300);

		assert.ok(!picker.isOpen(), "picker is closed");
		assert.equal(oHandleOkSpy.callCount, 1, "the picker date value is saved");

		//cleanup
		tp.destroy();
		tp._handleOkPress.restore();
	});

	QUnit.test("Alt + down", function(assert) {
		var oDate = new Date();
		oDate.setHours(4);
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp._openPicker();
		this.clock.tick(100);

		var sliders = tp._getSliders();
		var firstSlider = sliders.getAggregation("_columns")[0];
		var picker = tp._getPicker();
		var oHandleOkSpy = this.spy(tp, "_handleOkPress");

		//slider one up
		qutils.triggerKeydown(firstSlider.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(300);

		//close and save
		qutils.triggerKeydown(firstSlider.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, false, true, false);
		this.clock.tick(300);

		assert.ok(!picker.isOpen(), "picker is closed");
		assert.equal(oHandleOkSpy.callCount, 1, "the picker date value is saved");

		//cleanup
		tp.destroy();
		tp._handleOkPress.restore();
	});

	QUnit.module("Keyboard handling of input");

	QUnit.test("pageup increases the hours", function(assert) {
		//arrange
		var oDate = new Date();
		oDate.setHours(5);

		//sut
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP);

		//assert
		assert.equal(tp.getDateValue().getHours(), 6, "The time picker hours are increased");

		//cleanup
		tp.destroy();
	});

	QUnit.test("pagedown decreases the hours", function(assert) {
		//arrange
		var oDate = new Date();
		oDate.setHours(5);

		//sut
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.PAGE_DOWN);

		//assert
		assert.equal(tp.getDateValue().getHours(), 4, "The time picker hours are decreased");

		//cleanup
		tp.destroy();
	});

	QUnit.test("pageup does not have side effects", function(assert) {
		//arrange
		var oDate = new Date();
		oDate.setMinutes(20);
		oDate.setSeconds(21);

		//sut
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP);

		//assert
		assert.equal(tp.getDateValue().getMinutes(), 20, "The time picker minutes stay the same");
		assert.equal(tp.getDateValue().getSeconds(), 21, "The time picker seconds stay the same");
		assert.ok(!tp._getPicker(), "picker is missing");

		//cleanup
		tp.destroy();
	});

	QUnit.test("shift+pageup increases the minutes", function(assert) {
		//arrange
		var oDate = new Date();
		oDate.setMinutes(15);

		//sut
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP, true, false, false);

		//assert
		assert.equal(tp.getDateValue().getMinutes(), 16, "The time picker minutes are increased");

		//cleanup
		tp.destroy();
	});

	QUnit.test("shift+pagedown decreases the minutes", function(assert) {
		//arrange
		var oDate = new Date();
		oDate.setMinutes(13);

		//sut
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.PAGE_DOWN, true, false, false);

		//assert
		assert.equal(tp.getDateValue().getMinutes(), 12, "The time picker minutes are decreased");

		//cleanup
		tp.destroy();
	});

	QUnit.test("shift+pageup does not have side effects", function(assert) {
		//arrange
		var oDate = new Date(),
			tp,
			tpDomRef,
			oDelegate;

		oDate.setHours(5);
		oDate.setSeconds(21);

		//sut
		tp = new TimePicker({
			dateValue: oDate
		});

		oDelegate = {
			onAfterRendering: function() {

				tpDomRef = tp.getDomRef();
				tp.focus();

				//arrange
				qutils.triggerKeydown(tpDomRef, jQuery.sap.KeyCodes.PAGE_UP, true, false, false);
				sap.ui.getCore().applyChanges();

				//assert
				assert.equal(tp.getDateValue().getHours(), 5, "The time picker hours stay the same");
				assert.equal(tp.getDateValue().getSeconds(), 21, "The time picker seconds stay the same");
				assert.ok(!tp._getPicker(), "picker is missing");

				//cleanup
				tp.destroy();
			}
		};
		tp.addEventDelegate(oDelegate);

		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

	});

	QUnit.test("ctrl+shift+pageup increases the seconds", function(assert) {
		//arrange
		var oDate = new Date();
		oDate.setSeconds(11);

		//sut
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP, true, false, true);

		//assert
		assert.equal(tp.getDateValue().getSeconds(), 12, "The time picker seconds are increased");

		//cleanup
		tp.destroy();
	});

	QUnit.test("ctrl+shift+pagedown decreases the seconds", function(assert) {
		//arrange
		var oDate = new Date();
		oDate.setSeconds(4);

		//sut
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.PAGE_DOWN, true, false, true);

		//assert
		assert.equal(tp.getDateValue().getSeconds(), 3, "The time picker seconds are decreased");

		//cleanup
		tp.destroy();
	});

	QUnit.test("ctrl+pageup does not have side effects", function(assert) {
		//arrange
		var oDate = new Date();
		oDate.setHours(5);
		oDate.setMinutes(38);

		//sut
		var tp = new TimePicker({
			dateValue: oDate
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP, false, false, true);

		//assert
		assert.equal(tp.getDateValue().getHours(), 5, "The time picker hours stay the same");
		assert.equal(tp.getDateValue().getMinutes(), 38, "The time picker minutes stay the same");
		assert.ok(!tp._getPicker(), "picker is missing");

		//cleanup
		tp.destroy();
	});

	QUnit.test("arrow up opens the picker", function(assert) {
		//sut
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		//assert
		assert.ok(!tp._getPicker(), "picker does not exist");

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, false, true, false);

		//assert
		assert.ok(tp._getPicker().isOpen(), "picker is open");

		//cleanup
		tp.destroy();
	});

	QUnit.test("arrow down opens the picker", function(assert) {
		//sut
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		//assert
		assert.ok(!tp._getPicker(), "picker does not exist");

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, false, true, false);

		//assert
		assert.ok(tp._getPicker().isOpen(), "picker is open");

		//cleanup
		tp.destroy();
	});

	QUnit.test("right moves the cursor but jumps over the immutable chars", function(assert) {
		//arrange
		var oDate = new Date();
		oDate.setHours(5);
		oDate.setMinutes(38);

		//sut
		var tp = new TimePicker({
			dateValue: oDate,
			displayFormat: "HH:mm"
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();
		jQuery(tp.getFocusDomRef()).cursorPos(0);

		//act
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);

		//assert
		assert.equal(jQuery(tp.getFocusDomRef()).cursorPos(), 3, "After right + right the cursor is at the first minute digit");

		//cleanup
		tp.destroy();
	});

	QUnit.test("left moves the cursor but jumps over the immutable chars", function(assert) {
		//arrange
		var oDate = new Date();
		oDate.setHours(5);
		oDate.setMinutes(38);

		//sut
		var tp = new TimePicker({
			dateValue: oDate,
			displayFormat: "HH:mm"
		});
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp.focus();

		jQuery(tp.getFocusDomRef()).cursorPos(3);
		assert.equal(jQuery(tp.getFocusDomRef()).cursorPos(), 3, "Initially the cursor is at the first minute digit");

		qutils.triggerKeydown(tp.getDomRef(), jQuery.sap.KeyCodes.ARROW_LEFT, false, false, false);
		assert.equal(jQuery(tp.getFocusDomRef()).cursorPos(), 1, "After left the cursor is at the second hour digit");

		//cleanup
		tp.destroy();
	});

	QUnit.module("picker interaction");

	QUnit.test("cancel button closes the picker", function(assert) {
		//sut
		var tp = new TimePicker();
		var oBtnCancel, oPopoverCloseSpy;
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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

	QUnit.module("data binding");

	QUnit.test("binding to value property is correct", function(assert) {
		//sut
		var tp = new TimePicker({
			value: {
				path: "/timeValue",
				type: new Time({pattern: "HH:mm", strictParsing: true})
			}
		});

		//arrange
		var oModel = new JSONModel();
		var oDate = new Date(2000, 1, 2, 16, 35, 54);
		var oDate2 = new Date(2000, 1, 2, 20, 10, 11);
		oModel.setData({
			timeValue: oDate
		});

		tp.setModel(oModel);

		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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

	QUnit.test("binding to value property overrides displayFormat property", function(assert) {
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
			timeValue: new Date(2000, 1, 2, 16, 35, 54)
		});
		tp.setModel(oModel);

		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//assert
		assert.equal(tp.getValue(), "4:35 PM", "the value property is set in and formatted correctly");

		//act
		qutils.triggerEvent("focusin", tp.getDomRef());
		//assert
		assert.equal(tp._getInputValue(), " 4:35 PM", "the value property is formatted correctly (with leading space)");

		//act
		tp._openPicker();

		//assert
		assert.equal(tp._getSliders().getAggregation("_columns").length, 3, "the picker should display 3 sliders");

		//cleanup
		tp.destroy();
	});

	QUnit.test("data binding with OData", function(assert) {
		var done = assert.async();
		sap.ui.controller("my.own.controller", {
			onInit: function() {
				this.getView().bindObject("/EdmTypesCollection(ID='1')");
			}
		});

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

		var view = sap.ui.view({ viewContent: sMyxml, type: ViewType.XML })
			.setModel(oModelV2)
			.placeAt("qunit-fixture");

		oModelV2.attachRequestCompleted(function () {
			assert.equal(view.byId("tp1")._$input.val(), "11:33:55 AM", "TP1 has coorect value!");
			assert.equal(view.byId("tp2")._$input.val(), "11:33:55 AM", "TP2 has coorect value!");
			assert.equal(view.byId("tp3")._$input.val(), "11:33 AM", "TP3 has coorect value!");
			assert.equal(view.byId("tp4")._$input.val(), "11:33", "TP4 has coorect value!");
			done();
		});
	});

	QUnit.module("slider interactions", {
		_createMouseWheelEvent: function(iWheelSteps) {
			var oEvent = {};
			oEvent.originalEvent = {};
			oEvent.originalEvent.wheelDelta = iWheelSteps * 120;
			oEvent.originalEvent.detail = iWheelSteps * -3;
			oEvent.preventDefault = function() {};
			oEvent.stopPropagation = function() {};

			return oEvent;
		},
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();

		},
		afterEach: function() {
			this.clock.restore();
		}
	});

	QUnit.test("fireTap expands slider", function(assert) {
		//sut
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp._openPicker();
		this.clock.tick(100);

		var sliders = tp._getSliders();
		var sliderMinutes = sliders.getAggregation("_columns")[1];

		assert.ok(!sliderMinutes.getIsExpanded(), "slider is collapsed");

		//act
		sliderMinutes.fireTap(null);

		//assert
		assert.ok(sliderMinutes.getIsExpanded(), "slider is expanded");

		//cleanup
		tp.destroy();
	});

	QUnit.test("support2400 - property play",function(assert) {
		//prepare
		var oTP = new TimePicker({
			displayFormat: "HH:mm:ss",
			dateValue: new Date(2000, 1, 2, 23, 35, 54)
		}),
			oEvent,
			oSliders,
			oSliderHours;

		oTP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(oTP.getSupport2400(), false, "'support2400' is false by default");

		//act
		oTP.setSupport2400(true);

		//assert
		assert.strictEqual(oTP.getSupport2400(), true, "'support2400' is now set to 'true'");

		//act
		oTP._openPicker();
		this.clock.tick(1000);
		oBtnOK = oTP._getPicker().getBeginButton();
		oSliders = oTP._getSliders();
		oSliderHours = oSliders.getAggregation("_columns")[0];
		oEvent = this._createMouseWheelEvent(-1);
		oSliders._onmousewheel(oEvent); //these values are inside the event object when we scroll just a little
		this.clock.tick(160);

		//assert
		assert.equal(oSliderHours.getSelectedValue(), "24", "slider's hour value changed to 24");

		//cleanup
		oTP.destroy();

	});

	QUnit.test("support2400 - minutes and seconds are disabled and set to '0' when hours are '24'", function(assert) {
		//prepare
		var oTP = new TimePicker({
			displayFormat: "HH:mm:ss",
			dateValue: new Date(2000, 1, 2, 23, 35, 54)
		}),
			oSliders,
			oSliderHours,
			oSliderMinutes,
			oSliderSeconds,
			oEvent;

		oTP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();


		//assert
		assert.strictEqual(oTP.getSupport2400(), false, "support2400 is false by default");

		//act
		oTP.setSupport2400(true);
		oTP._openPicker();
		this.clock.tick(1000); //wait the initial focus of the first slider

		oSliders = oTP._getSliders();
		oSliderHours = oSliders.getAggregation("_columns")[0];
		oSliderMinutes = oSliders.getAggregation("_columns")[1];
		oSliderSeconds = oSliders.getAggregation("_columns")[2];

		//set hours to '24'
		oEvent = this._createMouseWheelEvent(-1);
		oSliders._onmousewheel(oEvent); //these values are inside the event object when we scroll just a little
		this.clock.tick(300);

		//assert
		assert.equal(oSliderMinutes.getSelectedValue(), "0", "When hours are set to 24, minutes are set to 0");
		assert.ok(oSliderMinutes.$().hasClass("sapMTPDisabled"),
				"When hours are set to 24, minutes have 'sapMTPDisabled' class");
		assert.equal(oSliderSeconds.getSelectedValue(), "0", "When hours are set to 24, seconds are set to 0");
		assert.ok(oSliderSeconds.$().hasClass("sapMTPDisabled"),
				"When hours are set to 24, seconds have 'sapMTPDisabled' class");

		//act
		//scroll hours to their previous state
		oEvent = this._createMouseWheelEvent(-1);
		oSliders._onmousewheel(oEvent); //these values are inside the event object when we scroll just a little
		this.clock.tick(160);

		//assert
		assert.equal(oSliderHours.getSelectedValue(), "0", "slider's hour value changed to 0");
		assert.equal(oSliderMinutes.getSelectedValue(), "35",
				"Minutes are back to their previous value before scrolling though '24' for hours");
		assert.ok(!oSliderMinutes.$().hasClass("sapMTP2400"),
				"When minutes are back to their previous value, they don't have 'sapMTP2400' class");
		assert.equal(oSliderSeconds.getSelectedValue(), "54",
				"Seconds are back to their previous value before scrolling though '24' for hours");
		assert.ok(!oSliderSeconds.$().hasClass("sapMTP2400"),
				"When seconds are back to their previous value, they don't have 'sapMTP2400' class");

		//cleanup
		oTP.destroy();

	});

	QUnit.test("_getUpdatedCycleScrollTop returns a new top value with the right offset", function(assert) {
		//sut
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp._openPicker();
		this.clock.tick(100);

		var sliders = tp._getSliders();
		var sliderHours = sliders.getAggregation("_columns")[0];
		sliderHours._bIsDrag = true;

		var params = [
			600, //$ContainerHeight
			5000, //$ContentHeight,
			100, //current top position
			150, //dragMargin
			5 //contentRepeat value
		];

		//act
		var updatedTop = sliderHours._getUpdatedCycleScrollTop.apply(sliderHours, params);

		//assert
		assert.equal(updatedTop, 1100, "_getUpdatedCycleScrollTop has jumped top by one time the unique content height");

		//cleanup
		tp.destroy();
	});

	QUnit.test("_doDrag method updates the top position", function(assert) {
		//sut
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp._openPicker();
		this.clock.tick(100);

		var sliders = tp._getSliders();
		var sliderHours = sliders.getAggregation("_columns")[0];

		//act
		sliderHours._startDrag(200);
		sliderHours._bIsDrag = true;

		var oJQueryScrollTopSpy = this.spy(jQuery.fn, "scrollTop");
		sliderHours._doDrag(240, 1435829481235);
		sliderHours._doDrag(293, 1435829481277);

		//assert
		assert.equal(oJQueryScrollTopSpy.callCount, 2, "slider's top position has been updated once for every _doDrag");

		//cleanup
		jQuery.fn.scrollTop.restore();
		tp.destroy();
	});

	QUnit.test("_endDrag method initiates an animation on the slider's content", function(assert) {
		//sut
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp._openPicker();
		this.clock.tick(100);

		var sliders = tp._getSliders();
		var sliderHours = sliders.getAggregation("_columns")[0];
		var oAnimateScrollSpy = this.spy(sliderHours, "_animateScroll");

		//act
		sliderHours._startDrag(200);
		sliderHours._doDrag(240, 1435829481235); //about 40ms offset each drag
		sliderHours._doDrag(293, 1435829481277);
		sliderHours._doDrag(340, 1435829481323);
		sliderHours._doDrag(382, 1435829481364);
		sliderHours._endDrag(439, 1435829481402);

		//assert
		assert.equal(oAnimateScrollSpy.callCount, 1, "animation was started");
		assert.ok(Math.abs(oAnimateScrollSpy.args[0][0]) < 2, "animation was started with reasonable speed");

		//cleanup
		sliderHours._animateScroll.restore();
		tp.destroy();
	});

	QUnit.test("Drag completed: After animation is completed, _animateScroll method does not call _scrollerSnapped " +
		"if slider is not visible", function(assert) {

		//sut
		var tp = new TimePicker(),
			sliderHours,
			oScrollerSnappedSpy;

		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp._openPicker();
		this.clock.tick(100);

		sliderHours = tp._getSliders().getAggregation("_columns")[0];
		oScrollerSnappedSpy = this.spy(sliderHours, "_scrollerSnapped");

		//act
		sliderHours._animateScroll(0.04); //0.04 to make sure snapping logic inside _animateScroll will take place.
		this.clock.tick(30); //to bypass frameFrequencyMs inside _animateScroll
		sliderHours.$().find(".sapMTimePickerSlider").css('visibility', 'hidden');
		this.clock.tick(250);//to make sure the animation in _animateScroll is completed(check SCROLL_ANIMATION_DURATION)

		//assert
		assert.equal(oScrollerSnappedSpy.callCount, 0, "_scrollerSnapped is not called");

		//cleanup
		oScrollerSnappedSpy.restore();
		tp.destroy();
	});

	QUnit.test("Arrow Up' button pressed: After animation is completed, _offsetValue method does not call " +
		"_scrollerSnapped if slider is not visible", function(assert) {

		//sut
		var tp = new TimePicker(),
			sliderHours,
			oScrollerSnappedSpy;

		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp._openPicker();
		this.clock.tick(100);

		sliderHours = tp._getSliders().getAggregation("_columns")[0];
		oScrollerSnappedSpy = this.spy(sliderHours, "_scrollerSnapped");

		//act
		sliderHours.getAggregation("_arrowUp").firePress();
		sliderHours.$().find(".sapMTimePickerSlider").css('visibility', 'hidden');
		this.clock.tick(250);//to make sure the animation is completed(check SCROLL_ANIMATION_DURATION)

		//assert
		assert.equal(oScrollerSnappedSpy.callCount, 0, "_scrollerSnapped is not called");

		//cleanup
		oScrollerSnappedSpy.restore();
		tp.destroy();
	});

	QUnit.test("tap on the input icon open/closes the picker", function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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
	});

	QUnit.test("mouse wheel scrolls the sliders proportionally to the speed", function(assert) {
		//sut
		var tp = new TimePicker({
				displayFormat: "HH:mm",
				dateValue: new Date(2000, 1, 2, 16, 35, 54)
			}),
			oEvent,
			oSliders,
			oSliderHours;

		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//arrange
		tp._openPicker();
		this.clock.tick(1000); //wait the initial focus of the first slider

		oSliders = tp._getSliders();
		oSliderHours = oSliders.getAggregation("_columns")[0];

		//act
		oEvent = this._createMouseWheelEvent(1);
		oSliders._onmousewheel(oEvent); //these values are inside the event object when we scroll just a little
		this.clock.tick(300);

		//assert
		assert.equal(oSliderHours.getSelectedValue(), "15", "slider's value changed by 1");

		//act again
		oEvent = this._createMouseWheelEvent(-2);
		oSliders._onmousewheel(oEvent);
		this.clock.tick(160);

		//assert
		assert.equal(oSliderHours.getSelectedValue(), "17", "slider's value changed by 2 in the other direction");

		//cleanup
		tp.destroy();
	});

	QUnit.test("focussed input is styled correctly", function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp._openPicker();
		this.clock.tick(1000);

		assert.strictEqual(jQuery("." + InputBase.ICON_PRESSED_CSS_CLASS).is(":visible"), true, "the picker is opened and focussed");

		tp._closePicker();
		this.clock.tick(1000);

		assert.strictEqual(jQuery("." + InputBase.ICON_PRESSED_CSS_CLASS).is(":visible"), false, "the picker is closed and not focussed");

		qutils.triggerEvent("focusout", tp.getDomRef());
		assert.ok(!tp.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS), "the picker is closed and not focussed");


		tp.destroy();
	});

	QUnit.test("_getInputValue", function(assert) {
		var tp = new TimePicker();
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp.setValue("10:55:13 AM");
		var result = tp._getInputValue();

		assert.strictEqual(result, "10:55:13 AM", "_getInputValue returns the correct time");

		tp.destroy();
	});

	/* Temporary disabled until robust solution (across all timezones is implemented) QUnit.test("decrease time when daylight saving begins", function(assert) {
	 var tp = new sap.m.TimePicker();
	 tp.placeAt("qunit-fixture");
	 sap.ui.getCore().applyChanges();

	 tp.setDateValue(new Date(2015, 2, 29, 3, 12, 15));
	 tp._increaseTime(-1, "hour");

	 assert.equal(tp.getDateValue().toString(), new Date(2015, 2, 29, 1, 12, 15).toString(), "_increaseTime works as expected when decreasing in daylight saving");

	 tp.destroy();
	 });*/

	QUnit.module("properties in constructor options", {
		beforeEach: function() {
			this._defaultFormatter = DateFormat.getTimeInstance({style: "medium", strictParsing: true, relative: false});
		}
	});

	QUnit.test("displayFormat after value", function(assert) {
		//system under test
		var tpId = "tp" + ++caseIndex,
				tp = new TimePicker(tpId, {
					value: this._defaultFormatter.format(getDate(17, 27, 43)),
					displayFormat: "HH:mm"
				}),
				expDateValue = getDate(17, 27, 43);

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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

	QUnit.module("Time picker has same behaviour on mobile like on desktop", {
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

	QUnit.test("focus on the input does not open the picker on mobile", function(assert) {
		//system under test
		var tp = new TimePicker('tp');

		// arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("focusin", tp.getDomRef());

		assert.strictEqual(tp.$().hasClass("sapMFocus"), true, "the input is focused");
		assert.strictEqual(tp._getPicker(), null, "the picker is not opened");

		//cleanup
		tp.destroy();
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.oRB = sap.ui.getCore().getLibraryResourceBundle('sap.m');
			this.oTP = new TimePicker({
				localeId: 'en' //set localeId explicitly otherwise it will be taken from the system configuration and the test won't be stable
			});
			this.sandbox = sinon.sandbox;
			this.oTP.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oTP.destroy();
		},
		fnAriaExpandedTest: function (oSlider, iIndex) {
			var bHasAriaExpandedAttr = oSlider.$().is("[aria-expanded]"),
					bAriaExpanded = oSlider.$().attr("aria-expanded"),
					iNonZeroIndex = iIndex + 1;

			assert.ok(bHasAriaExpandedAttr, "TimePickerSlider " + iNonZeroIndex + " has aria-expanded attribute");
			assert.strictEqual(bAriaExpanded, iIndex == 0 ? "true" : "false", "TimePickerSlider " + iNonZeroIndex + " aria-expanded='" + bAriaExpanded + "'");
		},
		fnAriaRoleTest: function (oSlider, iIndex) {
			var iNonZeroIndex = iIndex + 1,
					bHasRoleAttribute = oSlider.$().is('[role]'),
					sRole = oSlider.$().attr('role');

			assert.ok(bHasRoleAttribute, "TimePickerSlider " + iNonZeroIndex + " has role attribute");
			assert.strictEqual(sRole, "list", "TimePickerSlider " + iNonZeroIndex + " has role='" + sRole + "'");
		},
		fnAriaLiveAndHiddenTest: function (oSlider, iIndex) {
			var iNonZeroIndex = iIndex + 1,
					$Target = oSlider.$('valDescription'),
					bHasAriaHiddenAttr = $Target.is("[aria-hidden]"),
					sAriaHiddenValue = $Target.attr("aria-hidden"),
					bHasAriaLiveAttr = $Target.is("[aria-live]"),
					sAriaLiveValue = $Target.attr("aria-live"),
					sCurrentSelectionValue = oSlider.getSelectedValue(),
					sExpectedSelectionValue;

			assert.ok(bHasAriaHiddenAttr, "TimePickerSlider " + iNonZeroIndex + " live-region child has aria-hidden attribute");
			assert.strictEqual(sAriaHiddenValue, "false", "TimePickerSlider " + iNonZeroIndex + " live-region child has aria-hidden='" + sAriaHiddenValue + "'");
			assert.ok(bHasAriaLiveAttr, "TimePickerSlider " + iNonZeroIndex + " live-region child has aria-live attribute");
			assert.strictEqual(sAriaLiveValue, "assertive", "TimePickerSlider " + iNonZeroIndex + " live-region child has aria-live='" + sAriaLiveValue + "'");
		},
		fnAriaLabelledByTest: function (oSlider, iIndex) {
			var iNonZeroIndex = iIndex + 1,
					sAriaLabelledById = oSlider.$().attr('aria-labelledby'),
					$AriaLabelledTarget = oSlider.$('label');

			assert.ok($AriaLabelledTarget.length, "TimePickerSlider " + iNonZeroIndex + " has aria-labelledby association");
			assert.strictEqual(sAriaLabelledById, $AriaLabelledTarget.attr("id"), "TimePickerSlider " + iNonZeroIndex + " aria-labelledby association has a correct value " + sAriaLabelledById);
		},
		fnAriaDescribedByTest: function (oSlider, iIndex) {
			var iNonZeroIndex = iIndex + 1,
					sAriaDescribedById = oSlider.$().attr('aria-describedby'),
					$AriaDescribedTarget = oSlider.$('valDescription');

			assert.ok(sAriaDescribedById.length, "TimePickerSlider " + iNonZeroIndex + " has aria-describedby association");
			assert.strictEqual(sAriaDescribedById, $AriaDescribedTarget.attr("id"), "TimePickerSlider " + iNonZeroIndex + " aria-describedby association has a correct value " + sAriaDescribedById);
		},
		fnAriaSelectionChangeTest: function (oTP, oSlider, iIndex) {
			var bIsFormatType = oSlider.getLabel() === this.oRB.getText("TIMEPICKER_LBL_AMPM"),
					iIterations = 3,
					iNonZeroIndex = iIndex + 1,
					sLocaleId = oTP.getLocaleId(),
					oLocale = new Locale(sLocaleId),
					sCurrentSelectionValue,
					sExpectedSelectionValue,
					sNewSelectedValue,
					$Target = oSlider.$("valDescription");

			for (var iLoopIndex = 1; iLoopIndex <= iIterations; iLoopIndex++) {
				//arrange
				sCurrentSelectionValue = oSlider.getSelectedValue();
				if (!bIsFormatType) {
					sNewSelectedValue = sExpectedSelectionValue = parseInt(sCurrentSelectionValue) + iLoopIndex + "";
				} else {
					sNewSelectedValue = sCurrentSelectionValue === "am" ? "pm" : "am";
					if (sLocaleId) {
						var oAPPMFormatter = DateFormat.getTimeInstance({pattern: "a"}, oLocale);
						sExpectedSelectionValue = oAPPMFormatter.format(sNewSelectedValue === "am" ? new Date(2017, 0, 1, 1) : new Date(2017, 0, 1, 13));
					}
				}
				oSlider.setSelectedValue(sNewSelectedValue);

				this.clock.tick(2000);
				//assert
				assert.strictEqual($Target.text(), sExpectedSelectionValue, "Timepicker " + iNonZeroIndex + " live-region updates and its value is as expected (" + sExpectedSelectionValue + ")");
			}
		},
		fnTestReferencing: function (oSut, fnAssert, oResourceManager, aScenarios) {
			//prepare
			var sCustomRoleHiddenLblIdSuffix = "descr",
				sPlaceholderHiddenLblIdSuffix = "labelledby",
				sTooltipHiddenLblIdSuffix = "describedby",
				sInnerInputSuffix = oSut.getRenderer().getInnerSuffix(),
				fnTestCustomRole = function () {
					//prepare
					var $CustomRoleHiddenLabel = oSut.$(sCustomRoleHiddenLblIdSuffix),
						sCustomRoleId = $CustomRoleHiddenLabel.attr('id'),
						sCustomRoleRealText = $CustomRoleHiddenLabel.text(),
						sCustomRoleExpectedText = oResourceManager.getText("TIMEPICKER_SCREENREADER_TAG");

					assert.strictEqual($CustomRoleHiddenLabel.length, 1, "The custom role invisible label is rendered");
					assert.strictEqual(sCustomRoleRealText, sCustomRoleExpectedText, "The text of custom role invisible label is as expected");
					assert.ok(oSut.$(sInnerInputSuffix).attr("aria-describedby").indexOf(sCustomRoleId) > -1, "'aria-labelledby' contains the custom role invisible label id");
				},
				fnTestExternalLabelReference = function (bReferencedWithExternalLabel) {
					var sLabelId = "timepicker-aria-label";
					if (bReferencedWithExternalLabel) {
						//prepare
						var oLabel = new Label(sLabelId, {
							labelFor: oSut
						}).placeAt('qunit-fixture');
						sap.ui.getCore().applyChanges();
						//assert
						fnAssert.strictEqual(oSut.$(sInnerInputSuffix).attr("aria-labelledby").indexOf(sLabelId) > -1, true, "External label reference is applied");
						//clear
						oLabel.destroy();
					} else {
						//assert
						fnAssert.strictEqual(oSut.$(sInnerInputSuffix).attr("aria-labelledby").indexOf(sLabelId) > -1, false, "External label reference is not applied");
					}
				},
				fnTestPlaceholderReference = function (bReferencedWithPlaceholder) {
					var sDefaultPlaceholder = oSut._getPlaceholder();
					if (bReferencedWithPlaceholder) {
						//prepare
						oSut.setPlaceholder("Placeholder");
						sap.ui.getCore().applyChanges();
						//assert
						fnAssert.strictEqual(oSut.$(sPlaceholderHiddenLblIdSuffix).length, 1, "placeholder invisible label is rendered");
						fnAssert.strictEqual(oSut.$(sPlaceholderHiddenLblIdSuffix).text(), "Placeholder", "placeholder invisible label text is as expected");
						//clear
						oSut.setPlaceholder(null);
						sap.ui.getCore().applyChanges();
					} else {
						//assert
						fnAssert.strictEqual(oSut.$(sPlaceholderHiddenLblIdSuffix).length, 1, "placeholder invisible label is rendered");
						fnAssert.strictEqual(oSut.$(sPlaceholderHiddenLblIdSuffix).text(), sDefaultPlaceholder, "placeholder invisible label text is as expected");
					}
				};

			//Test execution check
			if (!Array.isArray(aScenarios)) {
				fnAssert.ok(false, "First argument of 'fnTestLabelReferencing' test function is not of a correct type");
			} else if (aScenarios.length !== 2) {
				fnAssert.ok(false, "First argument of 'fnTestLabelReferencing' test function do not have sufficient number of items. For more information please read the test comment");
			}

			aScenarios.forEach(function (bExpectation, iIndex) {
				switch (iIndex) {
					case 0:
						fnTestCustomRole();
						fnTestExternalLabelReference(bExpectation);
						break;
					case 1:
						fnTestCustomRole();
						fnTestPlaceholderReference(bExpectation);
						break;
					case 2:
						fnTestCustomRole();
						break;
					default:
						break;
				}
			});
		}
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		//arrange
		var oInfo;
		this.oTP.setValue("Value");
		this.oTP.setTooltip("Tooltip");
		this.oTP.setPlaceholder("Placeholder");
		//assert
		assert.ok(!!this.oTP.getAccessibilityInfo, "TimePicker has a getAccessibilityInfo function");
		sap.ui.getCore().applyChanges();
		oInfo = this.oTP.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, "combobox", "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_TIMEINPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value Placeholder", "Description");
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
		assert.strictEqual(oInfo.description, "10-32-30 Placeholder", "Description");
	});

	QUnit.test("Dynamic selection change announcement", function (assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var oSliders, aColumns;
		this.oTP.setValue("13:15");
		this.oTP.setDisplayFormat("hh:mm:ss aa");
		sap.ui.getCore().applyChanges();
		this.oTP._openPicker();
		this.clock.tick(2000);
		oSliders = this.oTP._getSliders();
		aColumns = oSliders.getAggregation("_columns");
		//assert
		if (oSliders && oSliders instanceof TimePickerSliders) {
			assert.strictEqual(oSliders.$().attr('aria-label'), this.oRB.getText("TIMEPICKER_SCREENREADER_TAG"), "TimePickerSliders aria-label is as expected");
			aColumns.forEach(function (oColumn, iIndex) {
				this.fnAriaRoleTest(oColumn, iIndex);
				this.fnAriaExpandedTest(oColumn, iIndex);
				this.fnAriaLiveAndHiddenTest(oColumn, iIndex);
				this.fnAriaLabelledByTest(oColumn, iIndex);
				this.fnAriaDescribedByTest(oColumn, iIndex);
				this.fnAriaSelectionChangeTest(this.oTP, oColumn, iIndex);
			}, this);
		}
		this.clock.restore();
	});


	QUnit.test("AM/PM values when TimePicker localeId is different than English ", function (assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var oSliders, aColumns;
		this.oTP.setValue("13:15");
		this.oTP.setDisplayFormat("hh:mm:ss aa");

		//Act
		this.oTP.setLocaleId("de_DE");
		sap.ui.getCore().applyChanges();
		this.oTP._openPicker();
		this.clock.tick(2000);
		oSliders = this.oTP._getSliders();
		oAPPMColumn = oSliders.getAggregation("_columns")[3];

		//assert
		this.fnAriaSelectionChangeTest(this.oTP, oAPPMColumn, 3);

		//Cleanup
		this.clock.restore();
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
	QUnit.test("Time picker aria references: Scenario 1: 'aria-labelledby' is correctly referenced with its default placeholder", function(assert) {
		this.fnTestReferencing(this.oTP, assert, this.oRB, [false, false]);
	});

	QUnit.test("Time picker aria references: Scenario 2: 'aria-labelledby' & 'aria-describedby' are correctly referenced with its custom placeholder", function (assert) {
		this.fnTestReferencing(this.oTP, assert, this.oRB, [false, true]);
	});

	QUnit.test("Time picker aria references: Scenario 3: 'aria-labelledby' & 'aria-describedby' are correctly referenced with its external label & custom placeholder", function (assert) {
		this.fnTestReferencing(this.oTP, assert, this.oRB, [true, true]);
	});

	QUnit.test("Time picker aria references: Scenario 4: 'aria-labelledby' & 'aria-describedby' are correctly referenced with its external label", function (assert) {
		this.fnTestReferencing(this.oTP, assert, this.oRB, [true, false]);
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

	QUnit.module("MaskInput integration", {
		beforeEach : function() {
			this.clock = sinon.useFakeTimers();
			this._defaultFormatter = DateFormat.getTimeInstance({style: "medium", strictParsing: true, relative: false});
		},
		typeAndCheckValueForDisplayFormat: function(sDisplayFormat, sInput, sExpectedValue) {
			//system under test
			var tp = new TimePicker({
				displayFormat: sDisplayFormat
			});

			//arrange
			tp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			//act
			triggerMultipleKeypress(tp, sInput);

			//assert
			assert.equal(jQuery("#" + tp.getId() + "-inner").val(), sExpectedValue, "$input.val() ok");

			//cleanup
			this.clock.restore();
			tp.destroy();
		}
	});

	//valid
	QUnit.test("allows input of valid time string - HH format, hours < 9", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "0615", "06:15");
	});

	QUnit.test("allows input of valid time string - HH format, hours === 11", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "1115", "11:15");
	});

	QUnit.test("allows input of valid time string - HH format, hours > 12", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "1715", "17:15");
	});

	QUnit.test("allows input of valid time string - hh format, hours < 9", function(assert) {
		this.typeAndCheckValueForDisplayFormat("hh:mm", "0615", "06:15");
	});

	QUnit.test("allows input of valid time string - hh format, hours === 12", function(assert) {
		this.typeAndCheckValueForDisplayFormat("hh:mm", "1215", "12:15");
	});

	QUnit.test("allows input of valid time string - style short", function(assert) {
		this.typeAndCheckValueForDisplayFormat("short", "1215a", "12:15 AM");
	});

	QUnit.test("allows input of valid time string - style medium", function(assert) {
		this.typeAndCheckValueForDisplayFormat("medium", "12159a", "12:15:09 AM");
	});



	//time semantics - shifts and replaces
	//first number in hour
	//no leading zero
	QUnit.test("1 for first hour digit is valid - h format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("h:mm", "115", "11:5-"); //not " 1:15"
	});

	QUnit.test("2 for first hour digit are preceded by space - h format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("h:mm", "215", " 2:15");
	});

	QUnit.test("numbers > 2 for first hour digit are preceded by space - h format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("h:mm", "315", " 3:15");
	});



	QUnit.test("2 for first hour digit is valid - H format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("H:mm", "215", "21:5-"); //not " 2:15"
	});

	QUnit.test("numbers > 2 for first hour digit are preceded by space - H format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("H:mm", "315", " 3:15");
	});


	QUnit.test("space is valid for hours - H format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("H:mm", " 115", " 1:15"); //not "11:5-"
	});

	//...could have more of those

	QUnit.test("0 is replaced with space for hours - h format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("h:mm", "0115", " 1:15");
	});

	QUnit.test("0 is preceeded with space for hours - H format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("H:mm", "0115", " 0:11");
	});


	//leading zero
	QUnit.test("1 for first hour digit is valid - hh format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("hh:mm", "115", "11:5-");
	});

	QUnit.test("2 for first hour digit are preceded by 0 - hh format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("hh:mm", "215", "02:15");
	});



	QUnit.test("2 for first hour digit is valid - HH format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "215", "21:5-"); //not " 2:15"
	});

	QUnit.test("numbers > 2 for first hour digit are preceded by 0 - HH format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "415", "04:15");
	});



	QUnit.test("space is replaced with 0 for hours - HH format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", " 115", "01:15");
	});

	QUnit.test("0 is valid for hours - hh format, pos 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("hh:mm", "0115", "01:15"); //not "11:5-"
	});



	//invalid (partially valid)
	QUnit.test("do not allow letters, placeholders, immutables and asterisks - HH format", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "-:aQ*?spam1", "1-:--");
	});

	QUnit.test("do not allow letters, placeholders, immutables and asterisks - hh format", function(assert) {
		this.typeAndCheckValueForDisplayFormat("hh:mm", "-1:spamaQ1*?", "11:--");
	});

	//second number in hour
	QUnit.test("do not allow numbers > 2 for 2nd number in hour if 1st === 1 - hh format", function(assert) {
		this.typeAndCheckValueForDisplayFormat("hh:mm", "13", "1-:--");
	});

	QUnit.test("allow numbers <= 2 for 2nd number in hour if 1st === 1 - hh format", function(assert) {
		this.typeAndCheckValueForDisplayFormat("hh:mm", "12", "12:--");
	});

	QUnit.test("do not allow numbers > 2 for 2nd number in hour if 1st === 1 - h format", function(assert) {
		this.typeAndCheckValueForDisplayFormat("h:mm", "13", "1-:--");
	});

	QUnit.test("allow numbers <= 2 for 2nd number in hour if 1st === 1 - h format", function(assert) {
		this.typeAndCheckValueForDisplayFormat("h:mm", "12", "12:--");
	});



	QUnit.test("do not allow numbers > 3 for 2nd number in hour if 1st === 2 - HH format", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "24", "2-:--");
	});

	QUnit.test("allow numbers <= 3 for 2nd number in hour if 1st === 2 - HH format", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "23", "23:--");
	});

	QUnit.test("do not allow numbers > 3 for 2nd number in hour if 1st === 2 - H format", function(assert) {
		this.typeAndCheckValueForDisplayFormat("H:mm", "24", "2-:--");
	});

	QUnit.test("allow numbers <= 3 for 2nd number in hour if 1st === 2 - H format", function(assert) {
		this.typeAndCheckValueForDisplayFormat("H:mm", "23", "23:--");
	});

	//first number in minutes
	QUnit.test("numbers > 5 for 1st number in minutes are preceded by 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "226", "22:06");
	});

	QUnit.test("allow numbers <= 5 for 1st number in minutes", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "225", "22:5-");
	});

	//we probably do not need this separately
	QUnit.test("allow 0 for 1st number in minutes", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm", "220", "22:0-");
	});

	//first number in seconds
	QUnit.test("numbers > 5 for 1st number in seconds are preceded by 0", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm:ss", "22556", "22:55:06");
	});

	QUnit.test("allow numbers <= 5 for 1st number in seconds", function(assert) {
		this.typeAndCheckValueForDisplayFormat("HH:mm:ss", "22595", "22:59:5-");
	});

	//am/pm values type assistence
	QUnit.test("am autocompletes the value on first different letter", function(assert) {
		this.typeAndCheckValueForDisplayFormat("hh a", "01A", "01 AM");
	});

	QUnit.test("pm autocompletes the value on first different letter", function(assert) {
		this.typeAndCheckValueForDisplayFormat("hh a", "01P", "01 PM");
	});

	QUnit.test("on enter '15:--:--', autocomplete to '15:00:00'", function(assert) {
		//system under test
		var oTp = new TimePicker({
			displayFormat: "HH:mm:ss"
		});

		//arrange
		oTp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//act
		triggerMultipleKeypress(oTp, "15");
		qutils.triggerKeydown(jQuery(oTp.getFocusDomRef()), jQuery.sap.KeyCodes.ENTER);

		//assert
		assert.equal(jQuery("#" + oTp.getId() + "-inner").val(), "15:00:00", "$input.val() ok");

		//cleanup
		oTp.destroy();
	});

	QUnit.test("on enter '15:1-:--', autocomplete to '15:01:00'", function(assert) {
		//system under test
		var oTp = new TimePicker({
			displayFormat: "HH:mm:ss"
		});

		//arrange
		oTp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//act
		triggerMultipleKeypress(oTp, "151");
		qutils.triggerKeydown(jQuery(oTp.getFocusDomRef()), jQuery.sap.KeyCodes.ENTER);
		//assert
		assert.equal(jQuery("#" + oTp.getId() + "-inner").val(), "15:01:00", "$input.val() ok");

		//cleanup
		oTp.destroy();
	});

	QUnit.test("on enter '07:-- --', autocomplete to '07:00 AM'", function(assert) {
		this.clock = sinon.useFakeTimers();

		//system under test
		var oTp = new TimePicker({
			displayFormat: "HH:mm a"
		});

		//arrange
		oTp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		//focus is explicitly needed, because sending a single key ('7' - see below) does not focus the element.
		jQuery(oTp).focus();
		this.clock.tick(1000);

		//act
		triggerMultipleKeypress(oTp, "7");
		qutils.triggerKeydown(jQuery(oTp.getFocusDomRef()), jQuery.sap.KeyCodes.ENTER);
		//assert
		assert.equal(jQuery("#" + oTp.getId() + "-inner").val(), "07:00 AM", "$input.val() ok");

		//cleanup
		oTp.destroy();
		this.clock.restore();
	});

	QUnit.test("am match start - then autocomplete on any letter", function(assert) {
		//system under test
		var tp = new TimePicker({
			valueFormat: "hh a",
			value: "12 AM",
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), jQuery.sap.KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), jQuery.sap.KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), jQuery.sap.KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), jQuery.sap.KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), jQuery.sap.KeyCodes.BACKSPACE);

		assert.equal(jQuery("#" + tp.getId() + "-inner").val(), "12 A-", "$input.val() correctly preset");

		triggerMultipleKeypress(tp, "y");

		//assert
		assert.equal(jQuery("#" + tp.getId() + "-inner").val(), "12 AM", "$input.val() ok");

		//cleanup
		tp.destroy();
	});

	QUnit.test("minutes only values are correctly synced with the input", function(assert) {
		//system under test
		var oTp = new TimePicker({
			displayFormat: "mm"
		});

		//arrange
		oTp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//act
		triggerMultipleKeypress(oTp, "15");
		qutils.triggerKeydown(jQuery(oTp.getFocusDomRef()), jQuery.sap.KeyCodes.ENTER);

		//assert
		assert.equal(jQuery("#" + oTp.getId() + "-inner").val(), "15", "$input.val() ok");

		//cleanup
		oTp.destroy();
	});

	QUnit.test("pm match start - then autocomplete on any letter", function(assert) {
		//system under test
		var tp = new TimePicker({
			valueFormat: "hh a",
			value: "12 PM",
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), jQuery.sap.KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), jQuery.sap.KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), jQuery.sap.KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), jQuery.sap.KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(jQuery(tp.getFocusDomRef()), jQuery.sap.KeyCodes.BACKSPACE);

		assert.equal(jQuery("#" + tp.getId() + "-inner").val(), "12 P-", "$input.val() correctly preset");

		triggerMultipleKeypress(tp, "b");

		//assert
		assert.equal(jQuery("#" + tp.getId() + "-inner").val(), "12 PM", "$input.val() ok");

		//cleanup
		tp.destroy();
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar replaces any char when am or pm value match is the only possible", function(assert) {
		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("y", 4, "12 P-");

		assert.equal(sCharReplaced, "M", "replaceChar replaces correctly");

		//cleanup
		tp.destroy();
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar replaces with unique value and completes with spaces when am,pm length differs", function(assert) {
		sinon.stub(LocaleData.prototype, "getDayPeriods").returns([ "vorm.", "nachm."]);

		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//am/pm translation is - vorm./nachm. - which are different length

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("v", 3, "12 ------");

		assert.equal(sCharReplaced, "vorm. ", "replaceChar completes with spaces");

		//cleanup
		LocaleData.prototype.getDayPeriods.restore();
		tp.destroy();
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar any char completes am pm values to the first difference", function(assert) {
		sinon.stub(LocaleData.prototype, "getDayPeriods").returns([ "MA", "MP"]);

		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();


		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("b", 3, "12 --");

		assert.equal(sCharReplaced, "M", "replaceChar completes to the first difference");

		//cleanup
		LocaleData.prototype.getDayPeriods.restore();
		tp.destroy();
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar correct char only completes am pm values on the position with difference", function(assert) {
		sinon.stub(LocaleData.prototype, "getDayPeriods").returns([ "MABC", "MPBC"]);

		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();


		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("b", 4, "12 M---");

		assert.equal(sCharReplaced, "b", "replaceChar does not replace invalid char");

		//cleanup
		LocaleData.prototype.getDayPeriods.restore();
		tp.destroy();
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar completes am pm values on a middle position with difference, to the end", function(assert) {
		sinon.stub(LocaleData.prototype, "getDayPeriods").returns([ "MABC", "MPBC"]);

		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();


		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("A", 4, "12 M---");

		assert.equal(sCharReplaced, "ABC", "replaceChar completes when difference is in the middle");

		//cleanup
		LocaleData.prototype.getDayPeriods.restore();
		tp.destroy();
	});

	QUnit.test("TimeSemanticMaskHelper.replaceChar autocomplete not case sensitive: a fills AM", function(assert) {
		sinon.stub(LocaleData.prototype, "getDayPeriods").returns([ "AM", "PM"]);

		//system under test
		var tp = new TimePicker({
			displayFormat: "hh a"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();


		var sCharReplaced = tp._oTimeSemanticMaskHelper.replaceChar("a", 3, "12 --");

		assert.equal(sCharReplaced, "AM", "replaceChar is not case sensitive");

		//cleanup
		LocaleData.prototype.getDayPeriods.restore();
		tp.destroy();
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

	QUnit.test("TimeSemanticMaskHelper initialization destroyes any previous instances", function(assert) {
		//prepare
		var tp = new TimePicker(),
				oSpyDestroy;

		//act
		tp._oTimeSemanticMaskHelper.destroy();

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
	});

	QUnit.test("In IE when both focusin + setValue(''), the order of their calling is reversed and that caused" +
		"missing first symbol in the mask", function(assert) {
		//prepare
		var oTp = new TimePicker({
				value: "000000",
			placeholder: "Enter Value"
			});

		oTp.placeAt("content");
		sap.ui.getCore().applyChanges();

		//act
		oTp.setValue("");
		oTp.focus();
		this.clock.tick(1000);

		//assert
		assert.equal(oTp._oTempValue.toString(), "--:--:-- --", "the mask is the correct one");

	});

	QUnit.test("Initialisation of the mask is done when new dateValue is set", function(assert) {
		//prepare
		var oTP = new TimePicker({
				value: "12:00"
			}).placeAt("content"),
			oInitMaskSpy = this.spy(oTP, "_initMask");

		sap.ui.getCore().applyChanges();

		//act
		oTP.setDateValue();

		//assert
		assert.equal(oInitMaskSpy.calledOnce, true, "the _initMask method is called once");

	});

	QUnit.module("maskMode property", {
		beforeEach: function () {
			this.oTp = new TimePicker();
			this.oTp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},

		afterEach: function () {
			this.oTp.destroy();
			this.oTp = null;
		}
	});

	QUnit.test("_isMaskEnabled returns true if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; });

		// assert
		assert.ok(this.oTp._isMaskEnabled(), "mask should be enabled if maskMode is 'On'");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.test("_isMaskEnabled returns false if maskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; });

		// assert
		assert.ok(!this.oTp._isMaskEnabled(), "mask should be disabled if maskMode is 'Off'");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.test("onfocusin event should call MaskEnabler's onfocusin if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
			oMaskEnablerFocusInSpy = this.spy(MaskEnabler, "onfocusin");

		// act
		this.oTp.onfocusin({ target: this.oTp.getDomRef() });

		// assert
		assert.equal(oMaskEnablerFocusInSpy.callCount, 1, "MaskEnabler.onfocusin should be called once");

		// cleanup
		oMaskEnablerFocusInSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onfocusin event should call _applyMask and _positionCaret if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
			oMaskEnablerSetValueSpy = this.spy(MaskEnabler, "setValue");

		// act
		this.oTp.setValue("12:12:12");

		// assert
		assert.equal(oMaskEnablerSetValueSpy.callCount, 1, "MaskEnabler.setValue should be called once");

		// cleanup
		oMaskEnablerSetValueSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("setValue method should call _applyRules if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
			oApplyRulesSpy = this.spy(this.oTp, "_applyRules");

		// act
		this.oTp.setValue("12:12:12");

		// assert
		assert.equal(oApplyRulesSpy.callCount, 0, "MaskEnabler._applyRules should not be called");

		// cleanup
		oApplyRulesSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onkeydown event should call MaskEnabler's onkeydown event if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
			oKeyDownSpy = this.spy(MaskEnabler, "onkeydown");

		// act
		this.oTp.onkeydown({});

		// assert
		assert.equal(oKeyDownSpy.callCount, 1, "MaskEnabler.onkeydown should be called once");

		// cleanup
		oKeyDownSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onkeydown event should call _keyDownHandler if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
			oKeyDownHandlerSpy = this.spy(this.oTp, "_keyDownHandler");

		// act
		this.oTp.onkeydown({});

		// assert
		assert.equal(oKeyDownHandlerSpy.callCount, 0, "MaskEnabler._keyDownHandler should not be called");

		// cleanup
		oKeyDownHandlerSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onfocusout event should call closeValueStateMessage and _inputCompletedHandler if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
			oInputBaseFocusOutSpy = this.spy(InputBase.prototype, "onfocusout");

		// act
		this.oTp.onfocusout({});

		// assert
		assert.equal(oInputBaseFocusOutSpy.callCount, 1, "InputBase.prototype.onfocusout should be called once");

		// cleanup
		oInputBaseFocusOutSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("oninput event should call _applyMask and _positionCaret if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
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

	QUnit.test("onkeypress event should call _keyPressHandler if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
			okeyPressHandlerSpy = this.spy(this.oTp, "_keyPressHandler");

		// act
		this.oTp.onkeypress({ preventDefault: function() {}});

		// assert
		assert.equal(okeyPressHandlerSpy.callCount, 0, "MaskEnabler._keyPressHandler should not be called");

		// cleanup
		okeyPressHandlerSpy.restore();
		oGetMaskModeStub.restore();
	});

	QUnit.test("onkeydown event should call _keyDownHandler if maskMode is 'On'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.On; }),
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
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
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
			oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; });

		// act
		this.oTp.focus();

		// assert
		assert.equal(jQuery("#" + this.oTp.getId() + "-inner").val(), sExpectedValue, "mask should not be applied to the input");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.test("input should fire change event if value is changed and TimePickerMaskMode is 'Off' and focus leaves", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
			oChangeSpy = this.spy();
		this.oTp.attachChange(oChangeSpy);

		// act
		this.oTp.focus();
		jQuery(this.oTp.getFocusDomRef()).val("11");
		jQuery(this.oTp.getFocusDomRef()).blur();

		// assert
		assert.equal(oChangeSpy.callCount, 1, "change event should be called once");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.test("onsapfocusleave: input should not fire change event if value is not changed and TimePickerMaskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
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

	QUnit.test("on keydown enter: input should fire change event if value is changed and TimePickerMaskMode is 'Off'", function (assert) {
		// prepare
		var oGetMaskModeStub = this.stub(this.oTp, "getMaskMode", function () { return TimePickerMaskMode.Off; }),
			oChangeSpy = this.spy();
		this.oTp.attachChange(oChangeSpy);
		sap.ui.getCore().applyChanges();

		// act
		jQuery(this.oTp.getFocusDomRef()).val("11");
		qutils.triggerKeydown(jQuery(this.oTp.getFocusDomRef()), jQuery.sap.KeyCodes.ENTER);

		// assert
		assert.equal(oChangeSpy.callCount, 1, "change event should be called once");

		// cleanup
		oGetMaskModeStub.restore();
	});

	QUnit.module("initialFocusedDate property", {
		beforeEach: function () {
			this.oTp = new TimePicker();
			this.oTp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},

		afterEach: function () {
			this.oTp.destroy();
			this.oTp = null;
		}
	});

	QUnit.test("_shouldSetInitialFocusedDateValue should return false if TimePicker has value and initialFocusedDate", function (assert) {
		// prepare
		var oGetInitialFocusedDateValueStub = this.stub(this.oTp, "getInitialFocusedDateValue", function () { return new Date(2017, 10, 10, 10, 11, 12, 13); }),
			oIsValidValue = this.stub(this.oTp, "_isValidValue", function () { return true; });
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
		var oIsValidValue = this.stub(this.oTp, "_isValidValue", function () { return true; });

		// assert
		assert.equal(this.oTp._shouldSetInitialFocusedDateValue(), false, "method should return false");

		// cleanup
		oIsValidValue.restore();
	});

	QUnit.test("_shouldSetInitialFocusedDateValue should return true if TimePicker has initialFocusedDate and no value", function (assert) {
		// prepare
		var oGetInitialFocusedDateValueStub = this.stub(this.oTp, "getInitialFocusedDateValue", function () { return new Date(2017, 10, 10, 10, 11, 12, 13); }),
				oIsValidValue = this.stub(this.oTp, "_isValidValue", function () { return true; });

		// assert
		assert.equal(this.oTp._shouldSetInitialFocusedDateValue(), true, "method should return true");

		// cleanup
		oGetInitialFocusedDateValueStub.restore();
		oIsValidValue.restore();
	});

	QUnit.test("_shouldSetInitialFocusedDateValue should return true if TimePicker value is not valid", function (assert) {
		// prepare
		var oIsValidValue = this.stub(this.oTp, "_isValidValue", function () { return false; });

		// assert
		assert.equal(this.oTp._shouldSetInitialFocusedDateValue(), true, "method should return true");

		// cleanup
		oIsValidValue.restore();
	});

	QUnit.test("onBeforeOpen should call _setTimeValues with provided dateValue not initialFocusedDateValue", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 8, 9, 10, 11, 12, 13),
			oInitialFocusedDateValue = new Date(2017, 2, 3, 4, 5, 6, 7),
			oTimePickerSliders = new TimePickerSliders(this.oTp.getId() + "-sliders", {
				displayFormat: "hh:mm",
				labelText: "",
				minutesStep: this.oTp.getMinutesStep(),
				secondsStep: this.oTp.getSecondsStep()
			}),
			oGetDateValue = this.stub(this.oTp, "getDateValue", function () { return oExpectedDateValue; }),
			oShouldSetInitialFocusedDateValueStub = this.stub(this.oTp, "_shouldSetInitialFocusedDateValue", function () { return false; }),
			oGetInitialFocusedDateValueStub = this.stub(this.oTp, "getInitialFocusedDateValue", function () { return oInitialFocusedDateValue; }),
			oGetSlidersStub = this.stub(this.oTp, "_getSliders", function () { return oTimePickerSliders; }),
			oIsValidValue = this.stub(this.oTp, "_isValidValue", function () { return true; }),
			oSetTimeValuesSpy = this.spy(oTimePickerSliders, "_setTimeValues");

		// act
		this.oTp.onBeforeOpen();

		assert.ok(oSetTimeValuesSpy.calledWith(oExpectedDateValue), "sliders value should be set to the getDateValue");
		assert.equal(oSetTimeValuesSpy.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "_setTimeValues should be called with " + oExpectedDateValue);

		// cleanup
		oGetDateValue.restore();
		oShouldSetInitialFocusedDateValueStub.restore();
		oGetInitialFocusedDateValueStub.restore();
		oGetSlidersStub.restore();
		oSetTimeValuesSpy.restore();
		oIsValidValue.restore();
		oTimePickerSliders.destroy();
	});

	QUnit.test("onBeforeOpen should call _setTimeValues with provided initialFocusedDateValue if there is no value", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 8, 9, 10, 11, 12, 13),
			oTimePickerSliders = new TimePickerSliders(this.oTp.getId() + "-sliders", {
				displayFormat: "hh:mm",
				labelText: "",
				minutesStep: this.oTp.getMinutesStep(),
				secondsStep: this.oTp.getSecondsStep()
			}),
			oGetDateValue = this.stub(this.oTp, "getDateValue", function () { return null; }),
			oGetInitialFocusedDateValueStub = this.stub(this.oTp, "getInitialFocusedDateValue", function () { return oExpectedDateValue; }),
			oGetSlidersStub = this.stub(this.oTp, "_getSliders", function () { return oTimePickerSliders; }),
			oIsValidValue = this.stub(this.oTp, "_isValidValue", function () { return true; }),
			oSetTimeValuesSpy = this.spy(oTimePickerSliders, "_setTimeValues");

		// act
		this.oTp.onBeforeOpen();

		assert.ok(oSetTimeValuesSpy.calledWith(oExpectedDateValue), "sliders value should be set to the initialFocusedDateValue");
		assert.equal(oSetTimeValuesSpy.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "_setTimeValues should be called with " + oExpectedDateValue);

		// cleanup
		oGetDateValue.restore();
		oGetInitialFocusedDateValueStub.restore();
		oGetSlidersStub.restore();
		oSetTimeValuesSpy.restore();
		oIsValidValue.restore();
		oTimePickerSliders.destroy();
	});

	QUnit.module("events and event handlers", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();

			//system under test
			this.oTp = new TimePicker({
				valueFormat: "hh mm",
				displayFormat: "hh mm"
			});
			this.oSpy = sinon.spy();
			this.oTp.attachChange(this.oSpy);

			//arrange
			this.oTp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.clock.restore();
			this.oTp.destroy();
			this.oSpy = null;
		}
	});

	QUnit.test("change event fires only when the value really changed", function(assert) {
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
		sap.ui.getCore().applyChanges();

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
			function (assert) {
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
				sap.ui.getCore().applyChanges();

				// Act
				tp.updateDomValue(" 8:00:00 AM");
				tp._inputCompletedHandler();

				// Assert
				assert.equal(spyChangeEvent.callCount, 1, "changed event fired only twice");

				// Cleanup
				tp.destroy();
			});

	QUnit.test("change event fires when user-input has leading space, but the databinding type formats it without(mask Off)",
			function (assert) {
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
				sap.ui.getCore().applyChanges();

				// Act
				tp.updateDomValue("08:00:00 AM");
				tp._inputCompletedHandlerNoMask();

				// Assert
				assert.equal(spyChangeEvent.callCount, 1, "changed event fired only twice");

				// Cleanup
				tp.destroy();
			});


	//BCP: 1670343229
	QUnit.test("change event fires on second change after the value is set in the change handler", function(assert) {
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
		sap.ui.getCore().applyChanges();

		//act
		tp._handleInputChange("11 28");
		tp._handleInputChange("11 28");

		//assert
		assert.equal(spy.callCount, 2, "changed event fired twice");

		spy = null;
		tp.destroy();
	});

	QUnit.test("_handleInputChange formats correctly givven value before setting it to the property value", function(assert) {
		//system under test
		var tp = new TimePicker("tp", {
			valueFormat: "h:mm:ss",
			displayFormat: "h:mm:ss"
		});

		//arrange
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//act
		tp._$input.val("2:28:34");
		tp._handleInputChange();

		//assert
		assert.equal(tp.getValue(), '2:28:34', "getValue is correct");

		tp.destroy();
	});

	QUnit.test("change event fires when the value is reset", function(assert) {
		var oTpFocusDomRef = jQuery(this.oTp.getFocusDomRef());

		//system under test
		triggerMultipleKeypress(this.oTp, "09");
		qutils.triggerKeydown(oTpFocusDomRef, jQuery.sap.KeyCodes.ENTER);

		assert.equal(this.oSpy.callCount, 1, "changed event fired when the value is set");

		while (oTpFocusDomRef.val() !== "-- --") {
			qutils.triggerKeydown(oTpFocusDomRef, jQuery.sap.KeyCodes.BACKSPACE);
		}
		qutils.triggerKeydown(oTpFocusDomRef, jQuery.sap.KeyCodes.ENTER);

		assert.equal(this.oSpy.callCount, 2, "changed event fired when the value is reset");
	});

	QUnit.test("upon enter, change event fires only once", function(assert) {
		//act
		triggerMultipleKeypress(this.oTp, "09");
		qutils.triggerKeydown(jQuery(this.oTp.getFocusDomRef()), jQuery.sap.KeyCodes.ENTER);
		assert.equal(this.oSpy.callCount, 1, "changed event must be fired only once");
	});

	QUnit.test("upon focusin of timepicker input, no picker should be visible", function (assert) {
		//arrange (open picker in order it to be initialized and rendered
		this.oTp._openPicker();
		this.clock.tick(1000);
		qutils.triggerEvent('focusin', this.oTp.getDomRef());
		this.clock.tick(1000);
		//assert
		assert.ok(!this.oTp._getPicker().isOpen(), "The picker 'isOpen' state is false");
		assert.ok(!this.oTp._getPicker().$().is(":visible"), "jQuery.is(':visible') returned false");
		assert.strictEqual(this.oTp._getPicker().$().css('display'), 'none', "The picker css display property is none");
	});

	QUnit.test("tap on the input icon on Tablet opens the picker", function(assert) {
		// releated to BCP: 1670338556
		var tp = new TimePicker(),
			oIsIconClickedSpy = this.spy(tp, "_isIconClicked");
		tp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		tp._openPicker();
		var icon = tp.$().find(".sapUiIcon");
		var oEvent = {
			target: icon
		};

		tp.onfocusin(oEvent);
		this.clock.tick(1000);

		//assert
		assert.strictEqual(jQuery(".sapMPopover").is(":visible"), true, "When tapped on the button the picker stays opened");
		assert.strictEqual(oIsIconClickedSpy.callCount, 1, "_isIconClicked function is called on focusin");

		oEvent.target = tp.getDomRef();

		tp.onfocusin(oEvent);
		this.clock.tick(1000);

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

	QUnit.test("upon focusout, change event fires only once", function(assert) {
		//system under test
		var	oTp2 = new TimePicker({
				valueFormat: "hh mm"
		});
		//arrange
		oTp2.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//act
		triggerMultipleKeypress(this.oTp, "09");
		jQuery(oTp2.getFocusDomRef()).focus();

		assert.equal(this.oSpy.callCount, 1, "changed event must be fired only once");

		oTp2.destroy();
	});

	QUnit.test("upon focusout, change event not fired when no value change", function(assert) {
		//system under test
		var	oTp2 = new TimePicker({
			valueFormat: "hh:mm"
		});
		//arrange
		this.oTp.setValue("07:15");
		oTp2.placeAt("content");
		sap.ui.getCore().applyChanges();

		//act
		jQuery(this.oTp.getFocusDomRef()).focus();
		jQuery(oTp2.getFocusDomRef()).focus();

		assert.equal(this.oSpy.callCount, 0, "changed event must not be fired");

		oTp2.destroy();
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