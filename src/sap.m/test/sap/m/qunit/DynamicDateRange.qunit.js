/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/m/DynamicDateRange",
	"sap/m/DynamicDateOption",
	"sap/m/StandardDynamicDateOption",
	"sap/m/DynamicDateValueHelpUIType",
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/DateRange",
	"sap/ui/core/Element",
	"sap/ui/core/format/DateFormat",
	"sap/m/Button",
	"sap/ui/core/Icon",
	"sap/m/Label",
	"sap/ui/Device",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/date/CalendarWeekNumbering"
], function(
	Formatting,
	Localization,
	DynamicDateRange,
	DynamicDateOption,
	StandardDynamicDateOption,
	DynamicDateValueHelpUIType,
	Library,
	nextUIUpdate,
	DateRange,
	Element,
	DateFormat,
	Button,
	Icon,
	Label,
	Device,
	UI5Date,
	CalendarWeekNumbering
) {
	"use strict";

	// shortcut for library resource bundle
	var oRb = Library.getResourceBundleFor("sap.m"),
		testDate = function(assert, oDate, iDuration, sUnit, iFullYear, iMonth, iDate, iHours, iMinutes, iSecond, iMilliseconds) {
			assert.strictEqual(oDate.getFullYear(), iFullYear, "toDates " + iDuration +  " " + sUnit + ": year set correctly");
			assert.strictEqual(oDate.getMonth(), iMonth, "toDates " + iDuration +  " " + sUnit + ": month set correctly");
			assert.strictEqual(oDate.getDate(), iDate, "toDates " + iDuration +  " " + sUnit + ": date set correctly");
			assert.strictEqual(oDate.getHours(), iHours, "toDates " + iDuration +  " " + sUnit + ": hours set correctly");
			assert.strictEqual(oDate.getMinutes(), iMinutes, "toDates " + iDuration +  " " + sUnit + ": minutes set correctly");
			assert.strictEqual(oDate.getSeconds(), iSecond, "toDates " + iDuration +  " " + sUnit + ": seconds set correctly");
			assert.strictEqual(oDate.getMilliseconds(), iMilliseconds, "toDates " + iDuration +  " " + sUnit + ": milliseconds set correctly");
		};

	QUnit.module("initialization", {
		beforeEach: async function() {
			this.ddr = new DynamicDateRange();
			this.ddr.setStandardOptions([]);
			this.ddr.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("adding option", function(assert) {
		var oResultOptions;

		// act
		this.ddr.addStandardOption("LASTDAYS");
		oResultOptions = this.ddr.getStandardOptions();

		// assert
		assert.strictEqual(oResultOptions.length, 1, "correct number of options");
		assert.strictEqual(oResultOptions[0], "LASTDAYS", "correct option");
	});

	QUnit.test("creating custom option with working ID", function(assert) {
		//arrange
		var oOption = new DynamicDateOption({
			key: "X To Last Work Week",
			valueTypes: ["int"]});

		oOption.getValueHelpUITypes = function() {
			return [new DynamicDateValueHelpUIType({ type: "int" })];
		};
		oOption.createValueHelpUI = function () { return {}; };
		oOption.format = function(oValue) {
			return oValue.values[0] + " To Last Work Week";
		};
		oOption.parse = function() {
			return {};
		};
		oOption.validateValueHelpUI = function () { return {}; };
		oOption.toDates = function() {
			return {};
		};

		// act
		this.ddr.addCustomOption(oOption);
		var oOptionListItem = this.ddr._createListItem(oOption);

		// assert
		assert.strictEqual(oOptionListItem.getId(), this.ddr.getId() + "-option-XToLastWorkWeek", "correct id of options");
	});

	QUnit.test("getFocusDomRef", function(assert) {
		assert.strictEqual(
			this.ddr.getFocusDomRef().id,
			this.ddr.getAggregation("_input").getFocusDomRef().id,
			"getFocusDomRef returns the DOM of the inner input control"
		);
	});

	QUnit.test("Native autocomplete is swiched off", function(assert) {
		// prepare
		var oInput = this.ddr._oInput;
		var oInputDom = oInput.getDomRef().querySelector("input");

		// assert
		assert.strictEqual(oInputDom.getAttribute("autocomplete"), "off", "The autocomplete is off");
	});

	QUnit.module("basic functionality", {
		beforeEach: async function() {
			this.ddr = new DynamicDateRange();
			this.ddr.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("suggestions popover should not be opened on icon click on mobile", function(assert) {
		//arrange
		var oCustomEvent = { srcControl : new Icon()};
		this.stub(this.ddr._oInput, "isMobileDevice").returns(true);

		// assert
		assert.strictEqual(this.ddr._oInput.shouldSuggetionsPopoverOpenOnMobile(oCustomEvent), false, "the suggestions popover is not opened on mobile when the icon is clicked");
	});

	QUnit.test("value help popover should be closed when focus is moved to the control input field", function(assert) {
		// arrange
		this.ddr._createPopup();
		this.stub(this.ddr._oPopup, "isOpen").returns(true);
		this.stub(Device, "system").value({
			desktop: true,
			tablet: false,
			phone: false
		});
		var oPopupCloseSpy = this.spy(this.ddr._oPopup, "close");
		this.ddr._oNavContainer = {
			to: function() {},
			getPages: function() {
				return [];
			}
		};

		// act
		this.ddr._oInput.onfocusin();

		// assert
		assert.ok(oPopupCloseSpy.calledOnce, "The value help popover is closed");
	});

	QUnit.test("value help popover should stay opened on tablet when focus is moved to the control input field", function(assert) {
		// arrange
		this.ddr._createPopup();
		this.stub(this.ddr._oPopup, "isOpen").returns(true);
		this.stub(Device, "system").value({
			desktop: false,
			tablet: true,
			phone: false
		});
		var oPopupCloseSpy = this.spy(this.ddr._oPopup, "close");
		this.ddr._oNavContainer = {
			to: function() {},
			getPages: function() {
				return [];
			}
		};

		// act
		this.ddr._oInput.onfocusin();

		// assert
		assert.ok(oPopupCloseSpy.notCalled, "The value help popover is opened");
	});

	QUnit.test("Setting value", function(assert) {
		// arrange
		var oCustomValue = { operator: "DATE", values: [UI5Date.getInstance(2020, 2, 31)]};
		// act
		this.ddr.setValue(oCustomValue);

		// assert
		assert.strictEqual(this.ddr._oInput.getValue(), "Mar 31, 2020", "The set value is the correct value");

		// act
		this.ddr.setValue();

		// assert
		assert.strictEqual(this.ddr._oInput.getValue(), "", "The set empty value is the correct value");
	});

	QUnit.test("Setting tooltip", function(assert) {
		// arrange
		var sTooltip = "Select a year range";

		// act
		this.ddr.setTooltip(sTooltip);

		// assert
		assert.strictEqual(this.ddr._oInput.getTooltip(), sTooltip, "The tooltip is set to the inner input field");
	});

	QUnit.test("Date ranges are handled properly", async function(assert) {
		// arrange
		var oDDR = new DynamicDateRange(),
			oFakeEvent = {
				getParameter: function() {
					return "Nov 15, 2022 - Nov 10, 2022";
				}
			},
			oSwapDatesSpy = this.spy(oDDR, "_swapDates");

		// act
		oDDR.placeAt("qunit-fixture");
		oDDR._handleInputChange(oFakeEvent);
		// assert
		assert.ok(oSwapDatesSpy.calledOnce, "Dates are swapped on input change");

		// act
		this.stub(oDDR._oSelectedOption, "getValueHelpOutput").returns({
			operator: "DATETIMERANGE",
			values: [UI5Date.getInstance(2022, 10, 15), UI5Date.getInstance(2022, 10, 10)]
		});
		this.stub(oDDR, "_closePopup").returns(function() {});

		oDDR._applyValue();
		// assert
		assert.ok(oSwapDatesSpy.calledTwice, "Dates are swapped on apply changes");

		// act
		this.stub(oDDR._oSelectedOption, "getValueHelpOutput").returns({
			operator: "DATETIMERANGE",
			values: [UI5Date.getInstance(2022, 10, 15), UI5Date.getInstance(2022, 10, 10)]
		});
		this.stub(oDDR, "_getDatesLabel").returns({
			setText: function() {}
		});
		await nextUIUpdate();

		oDDR.open();
		oDDR._updateDatesLabel();
		// assert
		assert.ok(oSwapDatesSpy.calledThrice, "Dates are swapped on for the label");
		oDDR.destroy();
	});

	QUnit.module("CustomDynamicDateOption", {
		beforeEach: async function() {
			this.ddr = new DynamicDateRange();
			this.ddr.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("createValueHelpUI - no UI types", function(assert) {
		var oOption = new DynamicDateOption({ key: "KEY" });

		assert.throws(function() {
			oOption.createValueHelpUI(this.ddr);
		},
			/Need implementation for method getValueHelpUITypes/,
			"throw an error when there are no UI types defined");

		oOption.destroy();
	});

	QUnit.test("createValueHelpUI - calendar types", function(assert) {
		var oOption = new DynamicDateOption({
			key: "KEY"
		});
		oOption.getValueHelpUITypes = function() {
			return [
				new DynamicDateValueHelpUIType({ type: "date" }),
				new DynamicDateValueHelpUIType({ type: "daterange" }),
				new DynamicDateValueHelpUIType({ type: "month" }),
				new DynamicDateValueHelpUIType({ type: "custommonth" }),
				new DynamicDateValueHelpUIType({ type: "int" })];
		};

		var aControls = oOption.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 5, "created the correct number of controls");
		assert.ok(aControls[0].isA("sap.ui.unified.Calendar"), "created the correct control");
		assert.ok(aControls[1].isA("sap.ui.unified.Calendar"), "created the correct control");
		assert.ok(aControls[2].isA("sap.ui.unified.calendar.MonthPicker"), "created the correct control");
		assert.ok(aControls[3].isA("sap.ui.unified.internal.CustomMonthPicker"), "created the correct control");
		assert.ok(aControls[4].isA("sap.m.StepInput"), "created the correct control");

		assert.strictEqual(aControls[0].getIntervalSelection(), false, "interval selection is off for the date UI");
		assert.strictEqual(aControls[1].getIntervalSelection(), true, "interval selection is on for the daterange UI");

		oOption.destroy();
	});

	QUnit.test("createValueHelpUI - control with label", function(assert) {
		var oOption = new DynamicDateOption({
			key: "KEY"
		}),
		aControls;

		oOption.getValueHelpUITypes = function(oControl) {
			return [
				new DynamicDateValueHelpUIType({ type: "int", text: "days before Christmas" })
			];
		};

		aControls = oOption.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 2, "created the correct number of controls");
		assert.ok(aControls[0].isA("sap.m.Label"), "created an additional label");
		assert.ok(aControls[1].isA("sap.m.StepInput"), "created the correct control");

		assert.strictEqual(aControls[0].getText(), "days before Christmas", "label is correct");

		oOption.destroy();
	});

	QUnit.test("getValueHelpOutput - integer", function(assert) {
		var oOption = new DynamicDateOption({
			key: "KEY"
		}),
		aControls,
		oOutput;

		oOption.getValueHelpUITypes = function(oControl) {
			return [new DynamicDateValueHelpUIType({ type: "int" })];
		};

		aControls = oOption.createValueHelpUI(this.ddr);

		aControls[0].setValue(5);

		oOutput = oOption.getValueHelpOutput(this.ddr);

		assert.strictEqual(oOutput.operator, "KEY", "returns the correct option key");
		assert.strictEqual(oOutput.values.length, 1, "returns the correct parameters");
		assert.strictEqual(oOutput.values[0], 5, "returns the correct parameters");

		oOption.destroy();
	});

	QUnit.test("getValueHelpOutput - date", function(assert) {
		var oOption = new DynamicDateOption({
			key: "KEY"
		}),
		aControls,
		oOutput;

		oOption.getValueHelpUITypes = function(oControl) {
			return [new DynamicDateValueHelpUIType({ type: "date" })];
		};

		aControls = oOption.createValueHelpUI(this.ddr);

		aControls[0].addSelectedDate(new DateRange({
			startDate: UI5Date.getInstance(2021, 3, 3)
		}));

		oOutput = oOption.getValueHelpOutput(this.ddr);

		assert.strictEqual(oOutput.operator, "KEY", "returns the correct option key");
		assert.strictEqual(oOutput.values.length, 1, "returns the correct parameters");
		assert.strictEqual(oOutput.values[0].getFullYear(), 2021, "returns the correct parameters");
		assert.strictEqual(oOutput.values[0].getMonth(), 3, "returns the correct parameters");
		assert.strictEqual(oOutput.values[0].getDate(), 3, "returns the correct parameters");

		oOption.destroy();
	});

	QUnit.test("no format", function(assert) {
		var oOption = new DynamicDateOption({ key: "KEY" });

		assert.throws(function() {
			oOption.format({ operator: "KEY", values: [5] });
		},
			/Need implementation for method format/,
			"throws an error when there is no format defined");

		oOption.destroy();
	});

	QUnit.test("no parse", function(assert) {
		var oOption = new DynamicDateOption({ key: "KEY" });

		assert.throws(function() {
			oOption.parse("some 5");
		},
			/Need implementation for method parse/,
			"throws an error when there is no parse defined");

		oOption.destroy();
	});

	QUnit.test("This month parsing is working correctly" , function(assert) {
		assert.strictEqual(this.ddr._parseValue("This Month").operator, "THISMONTH","The parsing is correct");
	});

	QUnit.test("no toDates", function(assert) {
		var oOption = new DynamicDateOption({ key: "KEY" });

		assert.throws(function() {
			oOption.toDates({ operator: "KEY", values: [5] });
		},
			/Need implementation for method toDates/,
			"throws an error when there is no toDates defined");

		oOption.destroy();
	});

	QUnit.test("format", function(assert) {
		var oOption = new DynamicDateOption({
			key: "KEY"
		});

		oOption.format = function(oValue) {
			return "some 5";
		};

		assert.strictEqual(oOption.format({ operator: "KEY", values: [5] }), "some 5", "custom function is used to format");

		oOption.destroy();
	});

	QUnit.test("parse", function(assert) {
		var oOption = new DynamicDateOption({
			key: "KEY"
		});

		oOption.parse =  function(sValue) {
			return { operator: "KEY", values: [5] };
		};

		var oValue = oOption.parse("some 5");

		assert.strictEqual(oValue.operator, "KEY", "custom function is used to parse");
		assert.strictEqual(oValue.values[0], 5, "custom function is used to parse");

		oOption.destroy();
	});

	QUnit.test("toDates", function(assert) {
		var oOption = new DynamicDateOption({
			key: "KEY"
		});

		oOption.toDates = function(oValue) {
			return [UI5Date.getInstance(123456788), UI5Date.getInstance(123456789)];
		};

		var aDates = oOption.toDates({ operator: "KEY", values: [5] });

		assert.strictEqual(aDates[0].getTime(), 123456788, "custom function is used to calculate dates");
		assert.strictEqual(aDates[1].getTime(), 123456789, "custom function is used to calculate dates");

		oOption.destroy();
	});

	QUnit.test("getText", function(assert) {
		var oOption = new DynamicDateOption({
			key: "KEY"
		});

		assert.strictEqual(oOption.getText(this.ddr), "KEY", "the default UI text is the same as the option key");

		oOption.getText = function(oControl) {
			return "custom text";
		};

		assert.strictEqual(oOption.getText(this.ddr), "custom text", "custom getText is used when provided");

		oOption.destroy();
	});

	QUnit.test("getGroup", function(assert) {
		var oOption = new DynamicDateOption({
			key: "KEY"
		});

		assert.strictEqual(oOption.getGroup(this.ddr), 0, "the default UI group is correct");

		oOption.getGroup = function(oControl) {
			return 7;
		};

		assert.strictEqual(oOption.getGroup(this.ddr), 7, "custom getGroup is used when provided");

		oOption.destroy();
	});

	QUnit.test("getGroupHeader", function(assert) {
		var oOption = new DynamicDateOption({
			key: "KEY"
		});

		assert.strictEqual(oOption.getGroupHeader(this.ddr), "No Group", "the default UI group header is correct");

		oOption.getGroupHeader = function(oControl) {
			return "custom group header";
		};

		oOption.getGroup = function(oControl) {
			return 7;
		};

		assert.strictEqual(oOption.getGroupHeader(this.ddr), "custom group header", "custom getGroupHeader is used when provided");

		oOption.destroy();
	});

	QUnit.module("StandardDynamicDateOption last/next x", {
		beforeEach: async function() {
			this.ddr = new DynamicDateRange();
			this.ddr.setStandardOptions([]);

			this.ddr.addStandardOption("LASTDAYS");
			this.ddr.addStandardOption("LASTMONTHS");
			this.ddr.addStandardOption("NEXTWEEKS");
			this.ddr.addStandardOption("NEXTQUARTERS");

			this.ddr.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("last/next x text", function(assert) {
		var oOptionLast = new StandardDynamicDateOption({ key: "LASTDAYS" }),
			oOptionNext = new StandardDynamicDateOption({ key: "NEXTWEEKS" }),
			sText;

		sText = oOptionLast.getText(this.ddr);

		var sLastText = oRb.getText("DYNAMIC_DATE_LASTX_TITLE", "Days / Months");
		assert.strictEqual(sText, sLastText, "the text is correct");

		sText = oOptionNext.getText(this.ddr);

		var sNextText = oRb.getText("DYNAMIC_DATE_NEXTX_TITLE", "Weeks / Quarters");
		assert.strictEqual(sText, sNextText, "the text is correct");

		oOptionLast.destroy();
		oOptionNext.destroy();
	});

	QUnit.test("last/next x creating value help UI", function(assert) {
		var oOptionLast = new StandardDynamicDateOption({ key: "LASTDAYS" }),
			aControls;

		aControls = oOptionLast.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 4, "created controls");
		assert.ok(aControls[0].isA("sap.m.Label"), "created the correct control");
		assert.ok(aControls[1].isA("sap.m.StepInput"), "created the correct control");
		assert.strictEqual(aControls[1].getMin(), 1, "The step input has correct min value");
		assert.strictEqual(aControls[1].getMax(), 6000, "The step input has correct max value");
		assert.ok(aControls[2].isA("sap.m.Label"), "created the correct control");
		assert.ok(aControls[3].isA("sap.m.RadioButtonGroup"), "created the correct control");

		assert.strictEqual(aControls[3].getButtons().length, 2, "two radio buttons are created");

		oOptionLast.destroy();
	});

	QUnit.test("last x one option creating value help UI", function(assert) {
		var oOptionLast = new StandardDynamicDateOption({ key: "LASTDAYS" }),
			aControls;

		// leave only one option
		this.ddr.setStandardOptions(["LASTQUARTERS"]);

		aControls = oOptionLast.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 2, "controls are only 2");
		assert.ok(aControls[0].isA("sap.m.Label"), "a label");
		assert.ok(aControls[1].isA("sap.m.StepInput"), "an input");

		oOptionLast.destroy();
	});

	QUnit.test("creating value help UI - values update callback", function(assert) {
		var oOptionLast = new StandardDynamicDateOption({ key: "LASTDAYS" }),
			fnUpdateCallback = this.spy(),
			aControls,
			oStepInput,
			oRadioButton;

		aControls = oOptionLast.createValueHelpUI(this.ddr, fnUpdateCallback);
		oStepInput = aControls[1];
		oRadioButton = aControls[3];

		//simulate input interaction
		oStepInput.fireChange();

		assert.strictEqual(fnUpdateCallback.callCount, 1, "value update callback was called");

		//simulate radio button interaction
		oRadioButton.fireSelect();

		assert.strictEqual(fnUpdateCallback.callCount, 2, "value update callback was called");

		oOptionLast.destroy();
	});

	QUnit.test("last x - getValueHelpOutput", function(assert) {
		var oOptionLast = new StandardDynamicDateOption({ key: "LASTDAYS" }),
			aControls,
			oOutput;

		aControls = oOptionLast.createValueHelpUI(this.ddr);

		aControls[1].setValue(3);

		oOutput = oOptionLast.getValueHelpOutput(this.ddr);

		assert.strictEqual(oOutput.operator, "LASTDAYS", "returns the correct option key");
		assert.strictEqual(oOutput.values.length, 1, "returns the correct parameters");
		assert.strictEqual(oOutput.values[0], 3, "returns the correct parameters");

		oOptionLast.destroy();
	});

	QUnit.test("today -x/+y creating and validating the option UI", function(assert) {
		this.ddr.open();
		this.ddr.addStandardOption("TODAYFROMTO");
		var oOptionToday = new StandardDynamicDateOption({ key: "TODAYFROMTO" }),
			oValidateValueHelpUISpy = this.spy(oOptionToday, "validateValueHelpUI"),
			oStepInput,
			aControls = oOptionToday.createValueHelpUI(this.ddr, this.ddr._updateInternalControls.bind(this.ddr));

		this.ddr._createInfoDatesFooter();
		this.ddr._oSelectedOption = oOptionToday;
		oStepInput = aControls[4];

		oStepInput.setValue(7000);
		//simulate input interaction
		oStepInput.fireChange();

		assert.ok(oValidateValueHelpUISpy.calledOnce, "validation for the option UI is triggered");
		assert.ok(oValidateValueHelpUISpy.returned(false), "validation failed");

		oStepInput.setValue(10);
		oStepInput.fireChange();

		assert.ok(oValidateValueHelpUISpy.calledTwice, "validation for the option UI is triggered");
		assert.ok(oValidateValueHelpUISpy.returned(true), "validation succeeded");
	});

	QUnit.test("today -x/+y maintaining negative and zero values in the step inputs", function(assert) {
		var oDDR = new DynamicDateRange(),
			oValue = {
				operator: "TODAYFROMTO",
				values: []
			};

		oDDR.placeAt("qunit-fixture");

		// act
		oValue.values = [2, 3];
		oDDR._updateInputValue(oValue);
		// assert
		assert.strictEqual(oDDR._oInput.getValue(), "Today -2 / +3 Days", "Input value is correct (default scenario)");

		// act
		oValue.values = [-2, 3];
		oDDR._updateInputValue(oValue);
		// assert
		assert.strictEqual(oDDR._oInput.getValue(), "Today +2 / +3 Days", "Input Value is correct (negative before date)");

		// act
		oValue.values = [2, -3];
		oDDR._updateInputValue(oValue);
		// assert
		assert.strictEqual(oDDR._oInput.getValue(), "Today -3 / -2 Days", "Input Value is correct (negative after date)");

		// act
		oValue.values = [-2, -3];
		oDDR._updateInputValue(oValue);
		// assert
		assert.strictEqual(oDDR._oInput.getValue(), "Today -3 / +2 Days", "Input Value is correct (negative before and after dates)");

		// act
		oValue.values = [0, 3];
		oDDR._updateInputValue(oValue);
		// assert
		assert.strictEqual(oDDR._oInput.getValue(), "Today -0 / +3 Days", "Input Value is correct (zero before date)");

		// act
		oValue.values = [0, -3];
		oDDR._updateInputValue(oValue);
		// assert
		assert.strictEqual(oDDR._oInput.getValue(), "Today -3 / +0 Days", "Input Value is correct (zero before date, negative after date)");

		// act
		oValue.values = [2, 0];
		oDDR._updateInputValue(oValue);
		// assert
		assert.strictEqual(oDDR._oInput.getValue(), "Today -2 / +0 Days", "Input Value is correct (zero after date)");

		// act
		oValue.values = [-2, 0];
		oDDR._updateInputValue(oValue);
		// assert
		assert.strictEqual(oDDR._oInput.getValue(), "Today -0 / +2 Days", "Input Value is correct (negative before date, zero after date)");

		// act
		oValue.values = [0, 0];
		oDDR._updateInputValue(oValue);
		// assert
		assert.strictEqual(oDDR._oInput.getValue(), "Today -0 / +0 Days", "Input Value is correct (zero before and after dates)");

		// cleanup
		oDDR.destroy();
		oValue = null;
	});

	QUnit.test("today -x/+y parsing manually entered values", function(assert) {
		var oDDR = new DynamicDateRange();

		oDDR.placeAt("qunit-fixture");

		// act/assert
		assert.strictEqual(oDDR._parseValue("Today -5 / +10 Days").values.join("/"), "5/10", "Parsed values are correct (default scenario - X is negative, Y is positive)");
		assert.strictEqual(oDDR._parseValue("Today +10 / -5 Days").values.join("/"), "5/10", "Parsed values are correct (default scenario, but X and Y are swapped)");
		assert.strictEqual(oDDR._parseValue("Today -5 / -10 Days").values.join("/"), "10/-5", "Parsed values are correct (X and Y are negative)");
		assert.strictEqual(oDDR._parseValue("Today -10 / -5 Days").values.join("/"), "10/-5", "Parsed values are correct (X and Y are negative)");
		assert.strictEqual(oDDR._parseValue("Today +5 / +10 Days").values.join("/"), "-5/10", "Parsed values are correct (X and Y are positive)");
		assert.strictEqual(oDDR._parseValue("Today +10 / +5 Days").values.join("/"), "-5/10", "Parsed values are correct (X and Y are positive)");
		assert.strictEqual(oDDR._parseValue("Today -5 / 0 Days").values.join("/"), "5/0", "Parsed values are correct (X is negative, Y is 0)");
		assert.strictEqual(oDDR._parseValue("Today +5 / 0 Days").values.join("/"), "0/5", "Parsed values are correct (X is positive, Y is 0)");
		assert.strictEqual(oDDR._parseValue("Today 0 / 0 Days").values.join("/"), "0/0", "Parsed values are correct (X and Y are 0)");
		assert.strictEqual(oDDR._parseValue("Today 0 / -5 Days").values.join("/"), "5/0", "Parsed values are correct (X is 0, Y is negative)");
		assert.strictEqual(oDDR._parseValue("Today 0 / +5 Days").values.join("/"), "0/5", "Parsed values are correct (X is 0, Y is positive)");

		// cleanup
		oDDR.destroy();
	});

	QUnit.test("getGroup and getGroupHeader - several options", function(assert) {
		var oOption = new StandardDynamicDateOption({ key: "LASTDAYS" });

		assert.strictEqual(oOption.getGroup(), 2, "the group is correct");
		assert.strictEqual(oOption.getGroupHeader(), "Date Ranges", "the group is correct");

		oOption.setKey("NEXTWEEK");

		assert.strictEqual(oOption.getGroup(), 3, "the group is correct");
		assert.strictEqual(oOption.getGroupHeader(), "Weeks", "the group is correct");

		oOption.setKey("LASTYEAR");

		assert.strictEqual(oOption.getGroup(), 6, "the group is correct");
		assert.strictEqual(oOption.getGroupHeader(), "Years", "the group is correct");

		oOption.destroy();
	});

	QUnit.test("enhanceFormattedValue - several options", function(assert) {
		var oOption = new StandardDynamicDateOption({ key: "LASTDAYS" });

		assert.notOk(oOption.enhanceFormattedValue(), "correct value");

		oOption.setKey("YESTERDAY");

		assert.ok(oOption.enhanceFormattedValue(), "correct value");

		oOption.setKey("LASTWEEK");

		assert.ok(oOption.enhanceFormattedValue(), "correct value");

		oOption.destroy();
	});

	QUnit.test("Last/Next 1 days values", function(assert) {
		// arrange
		this.ddr.setStandardOptions(["LASTDAYS", "NEXTDAYS"]);

		// act
		this.ddr.setValue({ operator: "LASTDAYS", values:[1] });

		// assert
		assert.deepEqual(this.ddr.getValue(), { operator: "LASTDAYS", values: [1] }, "the value is correctly substituted");
		assert.equal(this.ddr._oInput.getValue().indexOf("Yesterday"), -1, "the formatted value is correct");

		// act
		this.ddr.setValue({ operator: "NEXTDAYS", values:[1] });

		// assert
		assert.deepEqual(this.ddr.getValue(), { operator: "NEXTDAYS", values: [1] }, "the value is correctly substituted");
		assert.equal(this.ddr._oInput.getValue().indexOf("Tomorrow"), -1, "the formatted value is correct");
	});

	QUnit.test("Last/Next 1 days values when tomorrow and yesterday are included", async function(assert) {
		// arrange
		this.ddr.setStandardOptions(["LASTDAYS", "NEXTDAYS", "TOMORROW", "YESTERDAY"]);

		// act
		this.ddr.setValue({ operator: "LASTDAYS", values:[1] });
		await nextUIUpdate();

		// assert
		assert.deepEqual(this.ddr.getValue(), { operator: "YESTERDAY", values: [] }, "the value is correctly substituted");
		assert.equal(this.ddr._oInput.getValue().indexOf("Yesterday"), 0, "the formatted value is correct");

		// act
		this.ddr.setValue({ operator: "NEXTDAYS", values:[1] });

		// assert
		assert.deepEqual(this.ddr.getValue(), { operator: "TOMORROW", values: [] }, "the value is correctly substituted");
		assert.equal(this.ddr._oInput.getValue().indexOf("Tomorrow"), 0, "the formatted value is correct");
	});

	QUnit.test("Next 0 days values", function(assert) {
		// arrange
		this.ddr.setStandardOptions(["NEXTDAYS", "TODAY"]);

		// act
		this.ddr.setValue({ operator: "NEXTDAYS", values:[0] });

		// assert
		assert.deepEqual(this.ddr.getValue(), { operator: "TODAY", values: [] }, "the value is correctly substituted");
		assert.equal(this.ddr._oInput.getValue().indexOf("Today"), 0, "the formatted value is correct");
	});

	QUnit.test("Last 0 days values", function(assert) {
		// arrange
		this.ddr.setStandardOptions(["LASTDAYS", "TODAY"]);

		// act
		this.ddr.setValue({ operator: "LASTDAYS", values:[0] });

		// assert
		assert.deepEqual(this.ddr.getValue(), { operator: "TODAY", values: [] }, "the value is correctly substituted");
		assert.equal(this.ddr._oInput.getValue().indexOf("Today"), 0, "the formatted value is correct");
	});

	QUnit.test("DynamicDateRange - Last/Next options", async function(assert) {
		// arrange
		var oCurrentDate = UI5Date.getInstance('2023-01-08T00:13:37'),
		oClock = sinon.useFakeTimers(oCurrentDate.getTime());

		await nextUIUpdate(oClock);
		var oDDR = new DynamicDateRange({id: "myDDRLast"});
		var oLastMinutesOption;
		var oLastHoursOption;
		var sLabelText;
		var oPages;

		//act
		oDDR.placeAt("qunit-fixture");
		await nextUIUpdate(oClock);
		oDDR.setStandardOptions([]);
		oDDR.addStandardOption("LASTMINUTES");
		oDDR.open();
		oLastMinutesOption = Element.getElementById('myDDRLast-option-LASTMINUTES');

		oLastMinutesOption.firePress();
		await nextUIUpdate(oClock);

		oPages = oDDR._oNavContainer.getPages()[1];
		sLabelText = oPages
			.getAggregation('footer')
			.getAggregation('content')[0]
			.getText();

		//Check the label. Char code \u202f is a Narrow No-Break Space and \u2009 is a thin space (both introduced with CLDR version 43), \u2013 is a dash
		assert.strictEqual(sLabelText, "Selected: Jan 8, 2023, 12:12:37\u202fAM\u2009\u2013\u2009Jan 8, 2023, 12:13:37\u202fAM", "correct label for last minute");

		oDDR.setStandardOptions([]);
		oDDR.addStandardOption("LASTHOURS");
		oDDR.open();
		oLastHoursOption = Element.getElementById('myDDRLast-option-LASTHOURS');
		oLastHoursOption.firePress();
		await nextUIUpdate(oClock);

		sLabelText = oDDR._oNavContainer.getPages()[1]
			.getAggregation('footer')
			.getAggregation('content')[0]
			.getText();

		//Check the label. Char code \u202f is a Narrow No-Break Space and \u2009 is a thin space (both introduced with CLDR version 43), \u2013 is a dash
		assert.strictEqual(sLabelText, "Selected: Jan 7, 2023, 11:13:37\u202fPM\u2009\u2013\u2009Jan 8, 2023, 12:13:37\u202fAM", "correct label for last hour");

		//cleanup
		oDDR.destroy();
		await nextUIUpdate(oClock);
		oClock.restore();
	});

	QUnit.test("toDates - DATE", function(assert) {
		// arrange
		var oDateFormatter = DateFormat.getDateTimeInstance(),
			aResultRange;

		//act
		aResultRange = DynamicDateRange.toDates({ operator: "DATE", values: [UI5Date.getInstance(2021, 8, 23)] });

		// assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oDateFormatter.format(aResultRange[0]), "Sep 23, 2021, 12:00:00\u202fAM", "correct start date");
		assert.equal(oDateFormatter.format(aResultRange[1]), "Sep 23, 2021, 11:59:59\u202fPM", "correct end date");
	});

	QUnit.test("toDates - DATERANGE", function(assert) {
		// arrange
		var oDateFormatter = DateFormat.getDateTimeInstance(),
			aResultRange;

		//act
		aResultRange = DynamicDateRange.toDates({ operator: "DATERANGE", values: [UI5Date.getInstance(2021, 8, 23), UI5Date.getInstance(2021, 8, 24)] });

		// assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oDateFormatter.format(aResultRange[0]), "Sep 23, 2021, 12:00:00\u202fAM", "correct start date");
		assert.equal(oDateFormatter.format(aResultRange[1]), "Sep 24, 2021, 11:59:59\u202fPM", "correct end date");
	});

	QUnit.test("valueHelpUITypes objects lifecycle", function(assert) {
		// arrange
		var oOptionLast = new StandardDynamicDateOption({ key: "LASTDAYS" }),
			aValueHelpUITypes1, aValueHelpUITypes2;

		// act
		aValueHelpUITypes1 = oOptionLast.getValueHelpUITypes(this.ddr);

		// assert
		assert.strictEqual(aValueHelpUITypes1.length, 1, "there are UI types, describing the UI for some of the standard options");

		// act
		aValueHelpUITypes2 = oOptionLast.getValueHelpUITypes(this.ddr);

		// assert
		assert.equal(aValueHelpUITypes1[0], aValueHelpUITypes2[0], "UI types for the standard options are reused");

		// act
		oOptionLast.destroy();

		// assert
		assert.ok(aValueHelpUITypes1[0].isDestroyed(), "the UI types are destroyed with the option");
	});

	QUnit.module("StandardDynamicDateOption DateTime (single)", {
		beforeEach: async function() {
			this.ddr = new DynamicDateRange();
			this.ddr.setStandardOptions([]);

			this.ddr.addStandardOption("DATETIME");

			this.ddr.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("DateTime text", function(assert) {
		var oDateTimeOption = new StandardDynamicDateOption({ key: "DATETIME" }),
			sText = oDateTimeOption.getText(this.ddr),
			sOptionText = oRb.getText("DYNAMIC_DATE_DATETIME_TITLE");

		assert.strictEqual(sText, sOptionText, "the text is correct");

		oDateTimeOption.destroy();
	});

	QUnit.test("DateTime creating value help UI", function(assert) {
		var oDateTimeOption = new StandardDynamicDateOption({ key: "DATETIME" }),
			aControls;

		// leave only one option
		this.ddr.setStandardOptions(["DATETIME"]);

		aControls = oDateTimeOption.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 1, "control is only 1");
		assert.ok(aControls[0].isA("sap.m.internal.DateTimePickerPopup"), "is a sap.m.internal.DateTimePickerPopup");

		oDateTimeOption.destroy();
	});

	QUnit.test("DateTime - values update callback", function(assert) {
		var oDateTimeOption = new StandardDynamicDateOption({ key: "DATETIME" }),
			fnUpdateCallback = this.spy(),
			aControls,
			oCalendar,
			oClocks;

		aControls = oDateTimeOption.createValueHelpUI(this.ddr, fnUpdateCallback);
		oCalendar = aControls[0].getCalendar();
		oClocks = aControls[0].getClocks();

		//simulate input interaction
		oCalendar.fireSelect();

		assert.strictEqual(fnUpdateCallback.callCount, 1, "value update callback was called on date selection");

		//simulate radio button interaction
		oClocks.getAggregation("_clocks")[0].fireChange();

		assert.strictEqual(fnUpdateCallback.callCount, 2, "value update callback was called on time change");

		oDateTimeOption.destroy();
	});

	QUnit.test("DateTime - getValueHelpOutput", function(assert) {
		var oDateTimeOption = new StandardDynamicDateOption({ key: "DATETIME" }),
			oDate = UI5Date.getInstance(),
			aControls,
			oOutput;

		aControls = oDateTimeOption.createValueHelpUI(this.ddr);

		aControls[0].getCalendar().addSelectedDate(new DateRange({startDate: oDate}));
		aControls[0].getClocks().setValue(oDate);

		oOutput = oDateTimeOption.getValueHelpOutput(this.ddr);

		assert.strictEqual(oOutput.operator, "DATETIME", "returns the correct option key");
		assert.strictEqual(oOutput.values.length, 1, "returns the correct parameters");
		assert.strictEqual(oOutput.values[0], oDate, "returns the correct parameters");

		oDateTimeOption.destroy();
	});

	QUnit.test("getGroup and getGroupHeader - several options", function(assert) {
		var oOption = new StandardDynamicDateOption({ key: "DATETIME" });

		assert.strictEqual(oOption.getGroup(), 1, "the group is correct");
		assert.strictEqual(oOption.getGroupHeader(), "Single Dates", "the group is correct");

		oOption.destroy();
	});

	QUnit.test("toDates - DATETIME", function(assert) {
		// arrange
		var oDateFormatter = DateFormat.getDateTimeInstance(),
			oDate = UI5Date.getInstance(2021, 11, 20, 15, 50, 0),
			oResult;

		//act
		oResult = DynamicDateRange.toDates({ operator: "DATETIME", values: [oDate] });

		// assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oDateFormatter.format(oResult[0]), "Dec 20, 2021, 3:50:00\u202fPM", "correct date/time");
	});

	QUnit.test("valueHelpUITypes objects lifecycle", function(assert) {
		// arrange
		var oDateTimeOption = new StandardDynamicDateOption({ key: "DATETIME" }),
			aValueHelpUITypes1, aValueHelpUITypes2;

		// act
		aValueHelpUITypes1 = oDateTimeOption.getValueHelpUITypes(this.ddr);

		// assert
		assert.strictEqual(aValueHelpUITypes1.length, 1, "there are UI types, describing the UI for some of the standard options");

		// act
		aValueHelpUITypes2 = oDateTimeOption.getValueHelpUITypes(this.ddr);

		// assert
		assert.equal(aValueHelpUITypes1[0], aValueHelpUITypes2[0], "UI types for the standard options are reused");

		// act
		oDateTimeOption.destroy();

		// assert
		assert.ok(aValueHelpUITypes1[0].isDestroyed(), "the UI types are destroyed with the option");
	});

	QUnit.module("StandardDynamicDateOption DateTimeRange", {
		beforeEach: async function() {
			this.ddr = new DynamicDateRange();
			this.ddr.setStandardOptions([]);

			this.ddr.addStandardOption("DATETIMERANGE");

			this.ddr.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("DateTimeRange text", function(assert) {
		this.ddr.open();

		var oDateTimeOption = this.ddr.getOption("DATETIMERANGE"),
			sText = oDateTimeOption.getText(this.ddr),
			sOptionText = oRb.getText("DYNAMIC_DATE_DATETIMERANGE_TITLE");

		assert.strictEqual(sText, sOptionText, "the text is correct");
	});

	QUnit.test("DateTimeRange creating value help UI", function(assert) {
		var oDateTimeOption = this.ddr.getOption("DATETIMERANGE"),
			aControls;

		aControls = oDateTimeOption.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 4, "controls are 4");
		assert.ok(aControls[1].isA("sap.m.DateTimePicker"), "is a sap.m.DateTimePicker");
		assert.ok(aControls[3].isA("sap.m.DateTimePicker"), "is a sap.m.DateTimePicker");
	});

	QUnit.test("DateTimeRange - values update callback", function(assert) {
		var oDateTimeOption = this.ddr.getOption("DATETIMERANGE"),
			fnUpdateCallback = this.spy(),
			aControls,
			oFirstDateTimePicker,
			oSecondDateTimePicker;

		aControls = oDateTimeOption.createValueHelpUI(this.ddr, fnUpdateCallback);
		oFirstDateTimePicker = aControls[1];
		oSecondDateTimePicker = aControls[3];

		//simulate input interaction
		oFirstDateTimePicker.fireChange();

		assert.strictEqual(fnUpdateCallback.callCount, 1, "value update callback was called on date time selection");

		//simulate radio button interaction
		oSecondDateTimePicker.fireChange();

		assert.strictEqual(fnUpdateCallback.callCount, 2, "value update callback was called on date time selection");
	});

	QUnit.test("DateTimeRange - getValueHelpOutput", function(assert) {
		var oDateTimeOption = this.ddr.getOption("DATETIMERANGE"),
			oDate = UI5Date.getInstance(),
			aControls,
			oOutput;

		aControls = oDateTimeOption.createValueHelpUI(this.ddr);

		aControls[1].setDateValue(oDate);
		aControls[3].setDateValue(oDate);

		oOutput = oDateTimeOption.getValueHelpOutput(this.ddr);

		assert.strictEqual(oOutput.operator, "DATETIMERANGE", "returns the correct option key");
		assert.strictEqual(oOutput.values.length, 2, "returns the correct parameters");
		assert.strictEqual(oOutput.values[0], oDate, "returns the correct parameters");
	});

	QUnit.test("getGroup and getGroupHeader - several options", function(assert) {
		var oOption = this.ddr.getOption("DATETIMERANGE");

		assert.strictEqual(oOption.getGroup(), 2, "the group is correct");
		assert.strictEqual(oOption.getGroupHeader(), "Date Ranges", "the group is correct");
	});

	QUnit.test("toDates - DATETIMERANGE", function(assert) {
		// arrange
		var oDateFormatter = DateFormat.getDateTimeInstance(),
			oDate = UI5Date.getInstance(2021, 11, 20, 15, 50, 0),
			oDate2 = UI5Date.getInstance(2021, 11, 29, 15, 50, 0),
			oResult;

		//act
		oResult = this.ddr.toDates({ operator: "DATETIMERANGE", values: [oDate, oDate2] });

		// assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oDateFormatter.format(oResult[0]) + " - " + oDateFormatter.format(oResult[1]), "Dec 20, 2021, 3:50:00\u202fPM - Dec 29, 2021, 3:50:00\u202fPM", "correct date/time");
	});

	QUnit.test("valueHelpUITypes objects lifecycle", function(assert) {
		// arrange
		var oDateTimeOption = new StandardDynamicDateOption({ key: "DATETIMERANGE" }),
			aValueHelpUITypes1, aValueHelpUITypes2;

		// act
		aValueHelpUITypes1 = oDateTimeOption.getValueHelpUITypes(this.ddr);

		// assert
		assert.strictEqual(aValueHelpUITypes1.length, 2, "there are UI types, describing the UI for some of the standard options");

		// act
		aValueHelpUITypes2 = oDateTimeOption.getValueHelpUITypes(this.ddr);

		// assert
		assert.equal(aValueHelpUITypes1[0], aValueHelpUITypes2[0], "UI types for the standard options are reused");

		// act
		oDateTimeOption.destroy();

		// assert
		assert.ok(aValueHelpUITypes1[0].isDestroyed(), "the UI types are destroyed with the option");
	});

	QUnit.test("labels are redirected to the inner input", async function(assert) {
		// Prepare
		var oDynamicDateRange = new DynamicDateRange(),
			oLabel = new Label({
				labelFor: oDynamicDateRange.getId(),
				text: "Label text",
				required: true
			}),
			oDynamicDateRangeInput;

		oLabel.placeAt("qunit-fixture");
		oDynamicDateRange.placeAt("qunit-fixture");
		await nextUIUpdate();

		oDynamicDateRangeInput = oDynamicDateRange.getDomRef().querySelector("input");

		// Assert
		assert.strictEqual(
			oLabel.getDomRef().getAttribute("for"),
			oDynamicDateRangeInput.getAttribute("id"),
			"External label is referenced to the innter input field");

		assert.strictEqual(
			oDynamicDateRangeInput.getAttribute("aria-labelledby"),
			oLabel.getId(),
			"Internal input has reference to the external label"
		);

		assert.strictEqual(
			oDynamicDateRangeInput.getAttribute("aria-required"),
			"true",
			"Internal input has aria-required attribute set"
		);

		// Cleanup
		oLabel.destroy();
		oDynamicDateRange.destroy();
	});

	QUnit.module("StandardDynamicDateOption first day of week / this week", {
		beforeEach: async function() {
			this.ddr = new DynamicDateRange();
			this.ddr.setStandardOptions([]);

			this.ddr.addStandardOption("FIRSTDAYWEEK");
			this.ddr.addStandardOption("THISWEEK");

			this.ddr.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("Week options respect calendarWeekNumbering", async function(assert) {
		var sOriginalLocale = Formatting.getLanguageTag().toString();

		// test with "en" locale
		await testFirstDayOfWeek(this.ddr, "en", CalendarWeekNumbering.Default, 0);
		await testFirstDayOfWeek(this.ddr, "en", CalendarWeekNumbering.ISO_8601, 1);
		await testFirstDayOfWeek(this.ddr, "en", CalendarWeekNumbering.WesternTraditional, 0);
		await testFirstDayOfWeek(this.ddr, "en", CalendarWeekNumbering.MiddleEastern, 6);

		// test with "en_GB" locale
		await testFirstDayOfWeek(this.ddr, "en_GB", CalendarWeekNumbering.Default, 1);
		await testFirstDayOfWeek(this.ddr, "en_GB", CalendarWeekNumbering.ISO_8601, 1);
		await testFirstDayOfWeek(this.ddr, "en_GB", CalendarWeekNumbering.WesternTraditional, 0);
		await testFirstDayOfWeek(this.ddr, "en_GB", CalendarWeekNumbering.MiddleEastern, 6);

		// test with "bg" locale
		await testFirstDayOfWeek(this.ddr, "bg_BG", CalendarWeekNumbering.Default, 1);
		await testFirstDayOfWeek(this.ddr, "bg_BG", CalendarWeekNumbering.ISO_8601, 1);
		await testFirstDayOfWeek(this.ddr, "bg_BG", CalendarWeekNumbering.WesternTraditional, 0);
		await testFirstDayOfWeek(this.ddr, "bg_BG", CalendarWeekNumbering.MiddleEastern, 6);

		// restore original locale
		Formatting.setLanguageTag(sOriginalLocale);

		// Tests the DDR control 'First Day Of Week' and 'This Week' options return values first day of week by setting specific locale and calendarWeekNumbering
		async function testFirstDayOfWeek(oDDR, sLocale, sCalendarWeekNumbering, iFirstDayOfWeek) {
			var oFirstDayOfWeek,
				oThisWeek,
				aDates;

			// arrange
			Formatting.setLanguageTag(sLocale);
			oDDR.setCalendarWeekNumbering(sCalendarWeekNumbering);
			oDDR.open();
			await nextUIUpdate();
			oFirstDayOfWeek = Element.getElementById(oDDR.getId() + '-option-FIRSTDAYWEEK');
			oThisWeek = Element.getElementById(oDDR.getId() + '-option-THISWEEK');

			// act
			oFirstDayOfWeek.firePress();
			await nextUIUpdate();
			aDates = oDDR.toDates(oDDR.getValue());

			// assert
			assert.strictEqual(aDates[0].getDay(), iFirstDayOfWeek, "FIRSTDAYWEEK: First day of week is proper for locale '" + sLocale + "' and calendarWeekNumbering '" + sCalendarWeekNumbering + "'");

			// act
			oThisWeek.firePress();
			await nextUIUpdate();
			aDates = oDDR.toDates(oDDR.getValue());

			// assert
			assert.strictEqual(aDates[0].getDay(), iFirstDayOfWeek, "THISWEEK: First day of week is proper for locale '" + sLocale + "' and calendarWeekNumbering '" + sCalendarWeekNumbering + "'");
		}
	});

	QUnit.module("Clear Icon", {
		beforeEach: async function() {
			this.oDDR = new DynamicDateRange({});
			this.oDDR.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oDDR.destroy();
		}
	});

	QUnit.test("showClearIcon property is propagated to the inner Input", async function (assert){
		// Assert
		assert.equal(this.oDDR.getShowClearIcon(), this.oDDR._oInput.getShowClearIcon(), "showClearIcon property is in sync initially");

		// Act
		this.oDDR.setShowClearIcon(true);
		await nextUIUpdate();

		// Assert
		assert.equal(this.oDDR.getShowClearIcon(), this.oDDR._oInput.getShowClearIcon(), "showClearIcon property is properly propagated");

		// Act
		this.oDDR.setShowClearIcon(false);
		await nextUIUpdate();

		// Assert
		assert.equal(this.oDDR.getShowClearIcon(), this.oDDR._oInput.getShowClearIcon(), "showClearIcon property is properly propagated");
	});

	QUnit.module("Misc", {
		beforeEach: async function() {
			this.ddr = new DynamicDateRange();
			this.ddr.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("calendarWeekNumbering affects days of week", async function(assert) {
		var oDRS = new DynamicDateRange({
				id: 'myDDR',
				value: {operator: 'DATE', values: [UI5Date.getInstance('2023-01-09T18:00:00')]},
				calendarWeekNumbering: "MiddleEastern"
			}),
			sCalendarId;

			oDRS.placeAt("qunit-fixture");
			await nextUIUpdate();
			oDRS.open();
			await nextUIUpdate();

			var oDateOptionDomRef = Element.getElementById('myDDR-option-DATE');
			await nextUIUpdate();

			oDateOptionDomRef.firePress();
			await nextUIUpdate();
			sCalendarId = document.querySelector("#" + oDRS.getId() + "-RP-popover .sapUiCal").getAttribute("id");
			var oMonthDomRef = Element.getElementById(sCalendarId).getAggregation("month")[0].getDomRef();
			var aWeekHeaders = oMonthDomRef.querySelectorAll("#" + sCalendarId + " .sapUiCalWH:not(.sapUiCalDummy)");

			//Assert
			assert.strictEqual(aWeekHeaders.length, 7, "7 weekheaders rendered");
			assert.strictEqual(aWeekHeaders[0].textContent, "Sat", "Saturday is the first weekday for MiddleEastern");

			oDRS.setCalendarWeekNumbering('ISO_8601');
			await nextUIUpdate();
			oDateOptionDomRef.firePress();
			await nextUIUpdate();
			sCalendarId = document.querySelector("#" + oDRS.getId() + "-RP-popover .sapUiCal").getAttribute("id");
			oMonthDomRef = Element.getElementById(sCalendarId).getAggregation("month")[0].getDomRef();
			aWeekHeaders = oMonthDomRef.querySelectorAll("#" + sCalendarId + " .sapUiCalWH:not(.sapUiCalDummy)");
			//Assert
			assert.equal(aWeekHeaders[0].textContent, "Mon", "Monday is the first weekday for ISO_8601");

			oDRS.setCalendarWeekNumbering('WesternTraditional');
			await nextUIUpdate();
			oDateOptionDomRef.firePress();
			await nextUIUpdate();
			sCalendarId = document.querySelector("#" + oDRS.getId() + "-RP-popover .sapUiCal").getAttribute("id");
			oMonthDomRef = Element.getElementById(sCalendarId).getAggregation("month")[0].getDomRef();
			aWeekHeaders = oMonthDomRef.querySelectorAll("#" + sCalendarId + " .sapUiCalWH:not(.sapUiCalDummy)");
			//Assert
			assert.equal(aWeekHeaders[0].textContent, "Sun", "Sunday is the first weekday for WesternTraditional");

			//Cleanup
			oDRS.destroy();
	});

	QUnit.test("DynamicDateFormat doesn't allow year outside of the range [1-9999]", function (assert) {
		var oResult;

		// act
		oResult = this.ddr._parseValue("Jul 1, 2019");
		// assert
		assert.notEqual(oResult, null, "(date) When year is within the allowed range, value is parsed properly");
		assert.strictEqual(oResult.values[0].getFullYear(), 2019, "The year is correct");

		// act
		oResult = this.ddr._parseValue("Jul 1, 0000");
		// assert
		assert.strictEqual(oResult, null, "(date) When year is < 1, parsing returns null (value is not parsed)");

		// act
		oResult = this.ddr._parseValue("Jul 1, 10000");
		// assert
		assert.strictEqual(oResult, null, "(date) When year is > 9999, parsing returns null (value is not parsed)");

		// act
		oResult = this.ddr._parseValue("Jul 1, 2019, 11:33:00 AM");
		// assert
		assert.notEqual(oResult, null, "(datetime) When year is within the allowed range, value is parsed properly");
		assert.strictEqual(oResult.values[0].getFullYear(), 2019, "The year is correct");

		// act
		oResult = this.ddr._parseValue("Jul 1, 0000, 11:33:00 AM");
		// assert
		assert.strictEqual(oResult, null, "(datetime) When year is < 1, parsing returns null (value is not parsed)");

		// act
		oResult = this.ddr._parseValue("Jul 1, 10000, 11:33:00 AM");
		// assert
		assert.strictEqual(oResult, null, "(datetime) When year is > 9999, parsing returns null (value is not parsed)");
	});


	QUnit.test("DynamicDateFormat doesn't cut ' in different language", function (assert) {
		var sLanguage = Localization.getLanguage();

		Localization.setLanguage("fr_FR");

		// act
		this.ddr.setValue({values: Array(0), operator: 'TODAY'});

		// assert
		assert.ok(this.ddr._oInput.getValue().indexOf("Aujourd'hui") !== -1, "The year is correct");

		Localization.setLanguage(sLanguage);
	});

	QUnit.test("Open DynamicDateRange from Button", async function(assert) {
		// Prepare
		var oDDR = new DynamicDateRange("HDDR", {
				hideInput: true
			}).placeAt("qunit-fixture"),
			oButton = new Button({
				icon: "sap-icon://appointment-2",
				press: function() {
					Element.getElementById("HDDR").openBy(this.getDomRef());
				}
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Act
		oButton.firePress();
		await nextUIUpdate();

		// Assert
		assert.ok(oDDR._oPopup, oDDR.getId() + ": popup object exists");
		assert.ok(Element.getElementById(oDDR.getId() + "-RP-popover"), oDDR.getId() + ": popover control exists");
		assert.ok(document.body.querySelector("#" + oDDR.getId() + "-RP-popover"), "popover exists in DOM");

		// Clean
		oDDR.destroy();
		oButton.destroy();
	});

	QUnit.test("icon is properly configured", function (assert) {
		// arrange
		var oIconOne = new DynamicDateRange().getAggregation("_input").getAggregation("_endIcon")[0];

		// act
		// assert
		assert.notOk(oIconOne.getTooltip(), "icon has no tooltip");
		assert.ok(oIconOne.getDecorative(), "icon is decorative");
		assert.notOk(oIconOne.getUseIconTooltip(), "icon doesn't have default tooltip");
		assert.strictEqual(oIconOne.getAlt(), Library.getResourceBundleFor("sap.m").getText("INPUT_VALUEHELP_BUTTON") , "icon alt is present");

		// arrange
		var oTouchStub = this.stub(Device, "support").value({touch: true});
		var oDeviceStub = this.stub(Device, "system").value({phone: true});
		var oIconTwo = new DynamicDateRange().getAggregation("_input").getAggregation("_endIcon")[0];

		// assert
		assert.notOk(oIconTwo.getDecorative(), "icon is not decorative");

		// clean
		oTouchStub.restore();
		oDeviceStub.restore();
	});

	QUnit.test("DynamicDateRange.toDates method with timezones", function(assert) {
		var oTimezoneStub = this.stub(Localization, 'getTimezone').returns("Pacific/Chatham"),
			myGetInstance = UI5Date.getInstance,
			oCurrentDateStub = this.stub(UI5Date, 'getInstance'),
			aDateRange;

		oCurrentDateStub.callsFake(function() {
			if (arguments.length > 0) {
				return myGetInstance.apply(UI5Date, arguments);
			} else {
				return UI5Date.getInstance(2023, 0, 8);
			}
		});

		aDateRange = DynamicDateRange.toDates({operator: "TODAYFROMTO", values: [3, 4]}, "WesternTraditional");

		testDate(assert, aDateRange[0], '-3/+4', "TODAYFROMTO", 2023, 0, 5, 0,0,0,0);
		testDate(assert, aDateRange[1], '-3/+4', "TODAYFROMTO", 2023, 0, 12, 23,59,59,999);
		aDateRange = DynamicDateRange.toDates({operator: "DATE", values: [UI5Date.getInstance(2023, 0, 8)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "DATE", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "DATE", 2023, 0, 8, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "DATETIME", values: [UI5Date.getInstance(2023, 0, 8, 6, 0, 0)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "DATETIME", 2023, 0, 8, 6,0,0,0);
		testDate(assert, aDateRange[1], 1, "DATETIME", 2023, 0, 8, 6,0,0,0);

		aDateRange = DynamicDateRange.toDates({operator: "DATERANGE", values: [UI5Date.getInstance(2023, 0, 8), UI5Date.getInstance(2023, 0, 9)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "DATERANGE", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "DATERANGE", 2023, 0, 9, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "DATETIMERANGE", values: [UI5Date.getInstance(2023, 0, 8, 6, 0, 0), UI5Date.getInstance(2023, 0, 9, 6, 1, 0)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "DATETIMERANGE", 2023, 0, 8, 6,0,0,0);
		testDate(assert, aDateRange[1], 1, "DATETIMERANGE", 2023, 0, 9, 6,1,0,999);

		aDateRange = DynamicDateRange.toDates({operator: "YESTERDAY", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "YESTERDAY", 2023, 0, 7, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "YESTERDAY", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "TOMORROW", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "TOMORROW", 2023, 0, 9, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "TOMORROW", 2023, 0, 9, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "TODAY", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "TODAY", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "TODAY", 2023, 0, 8, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "THISWEEK", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "THISWEEK", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "THISWEEK", 2023, 0, 14, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTWEEK", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "LASTWEEK", 2023, 0, 1, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "LASTWEEK", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "NEXTWEEK", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "NEXTWEEK", 2023, 0, 15, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "NEXTWEEK", 2023, 0, 21, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTDAYS", values: [2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "LASTDAYS", 2023, 0, 6, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "LASTDAYS", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTDAYS", values: [-2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], -2, "LASTDAYS", 2023, 0, 9, 0,0,0,0);
		testDate(assert, aDateRange[1], -2, "LASTDAYS", 2023, 0, 10, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "NEXTDAYS", values: [2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "NEXTDAYS", 2023, 0, 9, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "NEXTDAYS", 2023, 0, 10, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "NEXTDAYS", values: [-2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], -2, "NEXTDAYS", 2023, 0, 6, 0,0,0,0);
		testDate(assert, aDateRange[1], -2, "NEXTDAYS", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTWEEKS", values: [2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "LASTWEEKS", 2022, 11, 25, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "LASTWEEKS", 2023, 0, 7, 23,59,59,999);

		oTimezoneStub.returns("Pacific/Honolulu");

		aDateRange = DynamicDateRange.toDates({operator: "TODAYFROMTO", values: [3, 4]}, "WesternTraditional");
		testDate(assert, aDateRange[0], "-3/+4", "TODAYFROMTO", 2023, 0, 5, 0,0,0,0);
		testDate(assert, aDateRange[1], "-3/+4", "TODAYFROMTO", 2023, 0, 12, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "DATE", values: [UI5Date.getInstance(2023, 0, 8)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "DATE", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "DATE", 2023, 0, 8, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "DATETIME", values: [UI5Date.getInstance(2023, 0, 8, 6, 0, 0)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "DATETIME", 2023, 0, 8, 6,0,0,0);
		testDate(assert, aDateRange[1], 1, "DATETIME", 2023, 0, 8, 6,0,0,0);

		aDateRange = DynamicDateRange.toDates({operator: "DATERANGE", values: [UI5Date.getInstance(2023, 0, 8), UI5Date.getInstance(2023, 0, 9)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "DATERANGE", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "DATERANGE", 2023, 0, 9, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "DATETIMERANGE", values: [UI5Date.getInstance(2023, 0, 8, 0, 0, 0), UI5Date.getInstance(2023, 0, 9, 0, 0, 0)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "DATETIMERANGE", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "DATETIMERANGE", 2023, 0, 9, 0,0,0,999);

		aDateRange = DynamicDateRange.toDates({operator: "TODAY", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "TODAY", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "TODAY", 2023, 0, 8, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "YESTERDAY", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "YESTERDAY", 2023, 0, 7, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "YESTERDAY", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "TOMORROW", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "TOMORROW", 2023, 0, 9, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "TOMORROW", 2023, 0, 9, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "THISWEEK", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "THISWEEK", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "THISWEEK", 2023, 0, 14, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTWEEK", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "LASTWEEK", 2023, 0, 1, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "LASTWEEK", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "NEXTWEEK", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "NEXTWEEK", 2023, 0, 15, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "NEXTWEEK", 2023, 0, 21, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTDAYS", values: [2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "LASTDAYS", 2023, 0, 6, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "LASTDAYS", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTDAYS", values: [-2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], -2, "LASTDAYS", 2023, 0, 9, 0,0,0,0);
		testDate(assert, aDateRange[1], -2, "LASTDAYS", 2023, 0, 10, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "NEXTDAYS", values: [2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "NEXTDAYS", 2023, 0, 9, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "NEXTDAYS", 2023, 0, 10, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "NEXTDAYS", values: [-2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], -2, "NEXTDAYS", 2023, 0, 6, 0,0,0,0);
		testDate(assert, aDateRange[1], -2, "NEXTDAYS", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTWEEKS", values: [2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "LASTWEEKS", 2022, 11, 25, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "LASTWEEKS", 2023, 0, 7, 23,59,59,999);

		oTimezoneStub.returns("America/Chicago");

		aDateRange = DynamicDateRange.toDates({operator: "TODAYFROMTO", values: [3, 4]}, "WesternTraditional");

		testDate(assert, aDateRange[0], "-3/+4", "TODAYFROMTO", 2023, 0, 5, 0,0,0,0);
		testDate(assert, aDateRange[1], "-3/+4", "TODAYFROMTO", 2023, 0, 12, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "DATE", values: [UI5Date.getInstance(2023, 0, 8)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "DATE", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "DATE", 2023, 0, 8, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "DATETIME", values: [UI5Date.getInstance(2023, 0, 8, 6, 0, 0)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "DATETIME", 2023, 0, 8, 6,0,0,0);
		testDate(assert, aDateRange[1], 1, "DATETIME", 2023, 0, 8, 6,0,0,0);

		aDateRange = DynamicDateRange.toDates({operator: "DATERANGE", values: [UI5Date.getInstance(2023, 0, 8), UI5Date.getInstance(2023, 0, 9)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "DATERANGE", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "DATERANGE", 2023, 0, 9, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "DATETIMERANGE", values: [UI5Date.getInstance(2023, 0, 8), UI5Date.getInstance(2023, 0, 9 ,1)]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "DATETIMERANGE", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "DATETIMERANGE", 2023, 0, 9, 1,0,0,999);

		aDateRange = DynamicDateRange.toDates({operator: "TODAY", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "TODAY", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "TODAY", 2023, 0, 8, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "YESTERDAY", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "YESTERDAY", 2023, 0, 7, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "YESTERDAY", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "TOMORROW", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "TOMORROW", 2023, 0, 9, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "TOMORROW", 2023, 0, 9, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "THISWEEK", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "THISWEEK", 2023, 0, 8, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "THISWEEK", 2023, 0, 14, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTWEEK", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "LASTWEEK", 2023, 0, 1, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "LASTWEEK", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "NEXTWEEK", values: []}, "WesternTraditional");

		testDate(assert, aDateRange[0], 1, "NEXTWEEK", 2023, 0, 15, 0,0,0,0);
		testDate(assert, aDateRange[1], 1, "NEXTWEEK", 2023, 0, 21, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTDAYS", values: [2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "LASTDAYS", 2023, 0, 6, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "LASTDAYS", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTDAYS", values: [-2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], -2, "LASTDAYS", 2023, 0, 9, 0,0,0,0);
		testDate(assert, aDateRange[1], -2, "LASTDAYS", 2023, 0, 10, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "NEXTDAYS", values: [2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "LASTDAYS", 2023, 0, 9, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "LASTDAYS", 2023, 0, 10, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "NEXTDAYS", values: [-2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], -2, "NEXTDAYS", 2023, 0, 6, 0,0,0,0);
		testDate(assert, aDateRange[1], -2, "NEXTDAYS", 2023, 0, 7, 23,59,59,999);

		aDateRange = DynamicDateRange.toDates({operator: "LASTWEEKS", values: [2]}, "WesternTraditional");

		testDate(assert, aDateRange[0], 2, "NEXTDAYS", 2022, 11, 25, 0,0,0,0);
		testDate(assert, aDateRange[1], 2, "NEXTDAYS", 2023, 0, 7, 23,59,59,999);
	});

	QUnit.test("ValueHelp responsive popover cancels bubbling of internal validation errors", async function(assert) {
		var validationErrorHandler = {
				handler: function(){}
			},
			validationErrorSpy = this.spy(validationErrorHandler, "handler"),
			oLastMinutes,
			oInnerInput,
			oPopup,
			fnDone = assert.async();

		// act
		this.ddr.attachValidationError(validationErrorHandler.handler);
		this.ddr.setStandardOptions(["LASTDAYS"]);
		this.ddr.open();
		await nextUIUpdate();
		oPopup = this.ddr._oPopup;

		oPopup.attachAfterClose(function() {
			// assert - check if the validation handler's bubbling is cancelled by the responsive popover
			assert.ok(validationErrorSpy.notCalled, "Validation Error Handler is not called when there is validation error in an option");
			fnDone();
		});

		// open LASTDAYS option
		oLastMinutes =  Element.getElementById(this.ddr.getId() + '-option-LASTDAYS');
		oLastMinutes.firePress();
		await nextUIUpdate();

		// simulate entering of 0
		oInnerInput = Element.getElementById(document.querySelector(".sapMStepInput").id);
		oInnerInput.setValue(0);
		oInnerInput._verifyValue();
		await nextUIUpdate();

		// close the DDR option
		this.ddr._oPopup.close();
	});

	QUnit.test("Internal Popover is invalidated only on setting footer visibility to true", function(assert) {
		// arrange
		this.ddr._createPopup();

		var oPopover = this.ddr._oPopup.getAggregation("_popup"),
			oPopupInvalidateSpy = this.spy(oPopover, "invalidate");

		// act
		this.ddr._setFooterVisibility(false);

		// assert - check if the validation handler's bubbling is cancelled by the responsive popover
		assert.ok(oPopupInvalidateSpy.notCalled, "invalidate method of the popover is not called when footer visibity is set fo false");

		// act
		this.ddr._setFooterVisibility(true);

		// assert - check if the validation handler's bubbling is cancelled by the responsive popover
		assert.ok(oPopupInvalidateSpy.called, "invalidate method of the popover is called when footer visibity is set fo truse");
	});

	QUnit.module("Groups", {
		beforeEach: async function() {
			this.ddr = new DynamicDateRange();
			this.ddr.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("addGroup and removeGroups", function(assert) {
		this.ddr.addGroup("Test", "Test Group");

		assert.strictEqual(this.ddr._getGroups()["Test"], 7, "A new group is added");

		this.ddr.removeCustomGroups();

		assert.strictEqual(Object.keys(this.ddr._getGroups()).length, 6, "All new groups are deleted");
	});

	QUnit.test("changne group header", function(assert) {
		this.ddr.addGroup("Test", "Test Group");

		assert.strictEqual(this.ddr._getGroups()["Test"], 7, "A new group is added");
		assert.strictEqual(this.ddr._getCustomGroupHeader("Test"), "Test Group", "A new group is added");

		this.ddr.setGroupHeader("Test", "Not a Test Group");

		assert.strictEqual(this.ddr._getCustomGroupHeader("Test"), "Not a Test Group", "A new group is added");
	});

});

