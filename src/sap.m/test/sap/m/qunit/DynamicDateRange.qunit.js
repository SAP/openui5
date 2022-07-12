/*global QUnit */
sap.ui.define([
	"sap/m/DynamicDateRange",
	"sap/m/CustomDynamicDateOption",
	"sap/m/StandardDynamicDateOption",
	"sap/m/DynamicDateValueHelpUIType",
	"sap/m/DynamicDateUtil",
	"sap/ui/unified/DateRange",
	"sap/ui/core/Core",
	"sap/ui/core/format/DateFormat",
	"sap/m/Button",
	"sap/ui/core/Icon",
	"sap/m/Label",
	'sap/ui/Device'
], function(
	DynamicDateRange,
	CustomDynamicDateOption,
	StandardDynamicDateOption,
	DynamicDateValueHelpUIType,
	DynamicDateUtil,
	DateRange,
	oCore,
	DateFormat,
	Button,
	Icon,
	Label,
	Device
) {
	"use strict";

	// shortcut for library resource bundle
	var oRb = oCore.getLibraryResourceBundle("sap.m");

	QUnit.module("initialization", {
		beforeEach: function() {
			this.ddr = new DynamicDateRange();
			this.ddr.setOptions([]);
			this.ddr.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("adding option", function(assert) {
		var oResultOptions;

		// act
		this.ddr.addOption("LASTDAYS");
		oResultOptions = this.ddr.getOptions();

		// assert
		assert.strictEqual(oResultOptions.length, 1, "correct number of options");
		assert.strictEqual(oResultOptions[0], "LASTDAYS", "correct option");
	});

	QUnit.test("creating custom option with working ID", function(assert) {
		//arrange
		var oOption = new CustomDynamicDateOption({
			key: "X To Last Work Week",
			valueTypes: ["int"],
			getValueHelpUITypes: function() {
				return [new DynamicDateValueHelpUIType({ type: "int" })];
			},
			createValueHelpUI: function () { return {}; },
			format: function(oValue) {
				return oValue.values[0] + " To Last Work Week";
			},
			parse: function(sValue) {
				return {};
			},
			validateValueHelpUI: function () { return {}; },
			toDates: function(oValue) {
				return {};
			}
		});

		// act
		this.ddr.addOption(oOption);
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

	QUnit.module("basic functionality", {
		beforeEach: function() {
			this.ddr = new DynamicDateRange();
			this.ddr.placeAt("qunit-fixture");
			oCore.applyChanges();
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
		var oCustomValue = { operator: "DATE", values: [new Date(2020, 2, 31)]};
		// act
		this.ddr.setValue(oCustomValue);

		// assert
		assert.strictEqual(this.ddr._oInput.getValue(), "Mar 31, 2020", "The set value is the correct value");

		// act
		this.ddr.setValue();

		// assert
		assert.strictEqual(this.ddr._oInput.getValue(), "", "The set empty value is the correct value");
	});

	QUnit.module("CustomDynamicDateOption", {
		beforeEach: function() {
			this.ddr = new DynamicDateRange();
			this.ddr.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("createValueHelpUI - no UI types", function(assert) {
		var oOption = new CustomDynamicDateOption({ key: "KEY" });

		assert.throws(function() {
			oOption.createValueHelpUI(this.ddr);
		},
			/Need implementation for method getValueHelpUITypes/,
			"throw an error when there are no UI types defined");

		oOption.destroy();
	});

	QUnit.test("createValueHelpUI - calendar types", function(assert) {
		var oOption = new CustomDynamicDateOption({
			key: "KEY",
			getValueHelpUITypes: function(oControl) {
				return [
					new DynamicDateValueHelpUIType({ type: "date" }),
					new DynamicDateValueHelpUIType({ type: "daterange" }),
					new DynamicDateValueHelpUIType({ type: "month" }),
					new DynamicDateValueHelpUIType({ type: "custommonth" }),
					new DynamicDateValueHelpUIType({ type: "int" })];
			}
		});

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
		var oOption = new CustomDynamicDateOption({
			key: "KEY",
			getValueHelpUITypes: function(oControl) {
				return [
					new DynamicDateValueHelpUIType({ type: "int", text: "days before Christmas" })
				];
			}
		}),
			aControls;

		aControls = oOption.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 2, "created the correct number of controls");
		assert.ok(aControls[0].isA("sap.m.Label"), "created an additional label");
		assert.ok(aControls[1].isA("sap.m.StepInput"), "created the correct control");

		assert.strictEqual(aControls[0].getText(), "days before Christmas", "label is correct");

		oOption.destroy();
	});

	QUnit.test("getValueHelpOutput - integer", function(assert) {
		var oOption = new CustomDynamicDateOption({
			key: "KEY",
			getValueHelpUITypes: function(oControl) {
				return [new DynamicDateValueHelpUIType({ type: "int" })];
			}
		}),
			aControls,
			oOutput;

		aControls = oOption.createValueHelpUI(this.ddr);

		aControls[0].setValue(5);

		oOutput = oOption.getValueHelpOutput(this.ddr);

		assert.strictEqual(oOutput.operator, "KEY", "returns the correct option key");
		assert.strictEqual(oOutput.values.length, 1, "returns the correct parameters");
		assert.strictEqual(oOutput.values[0], 5, "returns the correct parameters");

		oOption.destroy();
	});

	QUnit.test("getValueHelpOutput - date", function(assert) {
		var oOption = new CustomDynamicDateOption({
			key: "KEY",
			getValueHelpUITypes: function(oControl) {
				return [new DynamicDateValueHelpUIType({ type: "date" })];
			}
		}),
			aControls,
			oOutput;

		aControls = oOption.createValueHelpUI(this.ddr);

		aControls[0].addSelectedDate(new DateRange({
			startDate: new Date(2021, 3, 3)
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
		var oOption = new CustomDynamicDateOption({ key: "KEY" });

		assert.throws(function() {
			oOption.format({ operator: "KEY", values: [5] });
		},
			/Need implementation for method format/,
			"throws an error when there is no format defined");

		oOption.destroy();
	});

	QUnit.test("no parse", function(assert) {
		var oOption = new CustomDynamicDateOption({ key: "KEY" });

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
		var oOption = new CustomDynamicDateOption({ key: "KEY" });

		assert.throws(function() {
			oOption.toDates({ operator: "KEY", values: [5] });
		},
			/Need implementation for method toDates/,
			"throws an error when there is no toDates defined");

		oOption.destroy();
	});

	QUnit.test("format", function(assert) {
		var oOption = new CustomDynamicDateOption({
			key: "KEY",
			format: function(oValue) {
				return "some 5";
			}
		});

		assert.strictEqual(oOption.format({ operator: "KEY", values: [5] }), "some 5", "custom function is used to format");

		oOption.destroy();
	});

	QUnit.test("parse", function(assert) {
		var oOption = new CustomDynamicDateOption({
			key: "KEY",
			parse: function(sValue) {
				return { operator: "KEY", values: [5] };
			}
		});

		var oValue = oOption.parse("some 5");

		assert.strictEqual(oValue.operator, "KEY", "custom function is used to parse");
		assert.strictEqual(oValue.values[0], 5, "custom function is used to parse");

		oOption.destroy();
	});

	QUnit.test("toDates", function(assert) {
		var oOption = new CustomDynamicDateOption({
			key: "KEY",
			toDates: function(oValue) {
				return [new Date(123456788), new Date(123456789)];
			}
		});

		var aDates = oOption.toDates({ operator: "KEY", values: [5] });

		assert.strictEqual(aDates[0].getTime(), 123456788, "custom function is used to calculate dates");
		assert.strictEqual(aDates[1].getTime(), 123456789, "custom function is used to calculate dates");

		oOption.destroy();
	});

	QUnit.test("getText", function(assert) {
		var oOption = new CustomDynamicDateOption({
			key: "KEY"
		});

		assert.strictEqual(oOption.getText(this.ddr), "KEY", "the default UI text is the same as the option key");

		oOption.setGetText(function(oControl) {
			return "custom text";
		});

		assert.strictEqual(oOption.getText(this.ddr), "custom text", "custom getText is used when provided");

		oOption.destroy();
	});

	QUnit.test("getGroup", function(assert) {
		var oOption = new CustomDynamicDateOption({
			key: "KEY"
		});

		assert.strictEqual(oOption.getGroup(this.ddr), 0, "the default UI group is correct");

		oOption.setGetGroup(function(oControl) {
			return 7;
		});

		assert.strictEqual(oOption.getGroup(this.ddr), 7, "custom getGroup is used when provided");

		oOption.destroy();
	});

	QUnit.test("getGroupHeader", function(assert) {
		var oOption = new CustomDynamicDateOption({
			key: "KEY"
		});

		assert.strictEqual(oOption.getGroupHeader(this.ddr), "No Group", "the default UI group header is correct");

		oOption.setGetGroupHeader(function(oControl) {
			return "custom group header";
		});

		assert.strictEqual(oOption.getGroupHeader(this.ddr), "No Group", "custom header does not matter when the group is not defined");

		oOption.setGetGroup(function(oControl) {
			return 7;
		});

		assert.strictEqual(oOption.getGroupHeader(this.ddr), "custom group header", "custom getGroupHeader is used when provided");

		oOption.destroy();
	});

	QUnit.module("StandardDynamicDateOption last/next x", {
		beforeEach: function() {
			this.ddr = new DynamicDateRange();
			this.ddr.setOptions([]);

			this.ddr.addOption("LASTDAYS");
			this.ddr.addOption("LASTMONTHS");
			this.ddr.addOption("NEXTWEEKS");
			this.ddr.addOption("NEXTQUARTERS");

			this.ddr.placeAt("qunit-fixture");

			oCore.applyChanges();
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
		this.ddr.setOptions(["LASTQUARTERS"]);

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
		this.ddr.setOptions(["LASTDAYS", "NEXTDAYS"]);

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

	QUnit.test("Last/Next 1 days values when tomorrow and yesterday are included", function(assert) {
		// arrange
		this.ddr.setOptions(["LASTDAYS", "NEXTDAYS", "TOMORROW", "YESTERDAY"]);

		// act
		this.ddr.setValue({ operator: "LASTDAYS", values:[1] });

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
		this.ddr.setOptions(["NEXTDAYS", "TODAY"]);

		// act
		this.ddr.setValue({ operator: "NEXTDAYS", values:[0] });

		// assert
		assert.deepEqual(this.ddr.getValue(), { operator: "TODAY", values: [] }, "the value is correctly substituted");
		assert.equal(this.ddr._oInput.getValue().indexOf("Today"), 0, "the formatted value is correct");
	});

	QUnit.test("Last 0 days values", function(assert) {
		// arrange
		this.ddr.setOptions(["LASTDAYS", "TODAY"]);

		// act
		this.ddr.setValue({ operator: "LASTDAYS", values:[0] });

		// assert
		assert.deepEqual(this.ddr.getValue(), { operator: "TODAY", values: [] }, "the value is correctly substituted");
		assert.equal(this.ddr._oInput.getValue().indexOf("Today"), 0, "the formatted value is correct");
	});

	QUnit.test("DynamicDateUtil - removeTimezoneOffset", function(assert) {
		// arrange
		var oDateFormatter = DateFormat.getDateTimeInstance(),
			aResultRange;

		//act
		aResultRange = DynamicDateUtil.toDates({ operator: "DATE", values: [ DynamicDateUtil.removeTimezoneOffset(new Date(2021, 8, 23))] });

		// assert
		assert.equal(oDateFormatter.format(aResultRange[0]), "Sep 23, 2021, 12:00:00 AM", "correct start date");
		assert.equal(oDateFormatter.format(aResultRange[1]), "Sep 23, 2021, 11:59:59 PM", "correct end date");
	});

	QUnit.test("toDates - DATE", function(assert) {
		// arrange
		var oDateFormatter = DateFormat.getDateTimeInstance(),
			aResultRange;

		//act
		aResultRange = DynamicDateUtil.toDates({ operator: "DATE", values: [new Date(2021, 8, 23)] });

		// assert
		assert.equal(oDateFormatter.format(aResultRange[0]), "Sep 23, 2021, 12:00:00 AM", "correct start date");
		assert.equal(oDateFormatter.format(aResultRange[1]), "Sep 23, 2021, 11:59:59 PM", "correct end date");
	});

	QUnit.test("toDates - DATERANGE", function(assert) {
		// arrange
		var oDateFormatter = DateFormat.getDateTimeInstance(),
			aResultRange;

		//act
		aResultRange = DynamicDateUtil.toDates({ operator: "DATERANGE", values: [new Date(2021, 8, 23), new Date(2021, 8, 24)] });

		// assert
		assert.equal(oDateFormatter.format(aResultRange[0]), "Sep 23, 2021, 12:00:00 AM", "correct start date");
		assert.equal(oDateFormatter.format(aResultRange[1]), "Sep 24, 2021, 11:59:59 PM", "correct end date");
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
		beforeEach: function() {
			this.ddr = new DynamicDateRange();
			this.ddr.setOptions([]);

			this.ddr.addOption("DATETIME");

			this.ddr.placeAt("qunit-fixture");

			oCore.applyChanges();
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
		this.ddr.setOptions(["DATETIME"]);

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
			oDate = new Date(),
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
			oDate = new Date(2021, 11, 20, 15, 50, 0),
			oResult;

		//act
		oResult = DynamicDateUtil.toDates({ operator: "DATETIME", values: [oDate] });

		// assert
		assert.equal(oDateFormatter.format(oResult[0]), "Dec 20, 2021, 3:50:00 PM", "correct date/time");
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
		beforeEach: function() {
			this.ddr = new DynamicDateRange();
			this.ddr.setOptions([]);

			this.ddr.addOption("DATETIMERANGE");

			this.ddr.placeAt("qunit-fixture");

			oCore.applyChanges();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
	});

	QUnit.test("DateTimeRange text", function(assert) {
		var oDateTimeOption = DynamicDateUtil.getOption("DATETIMERANGE"),
			sText = oDateTimeOption.getText(this.ddr),
			sOptionText = oRb.getText("DYNAMIC_DATE_DATETIMERANGE_TITLE");

		assert.strictEqual(sText, sOptionText, "the text is correct");
	});

	QUnit.test("DateTimeRange creating value help UI", function(assert) {
		var oDateTimeOption = DynamicDateUtil.getOption("DATETIMERANGE"),
			aControls;

		aControls = oDateTimeOption.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 4, "controls are 4");
		assert.ok(aControls[1].isA("sap.m.DateTimePicker"), "is a sap.m.DateTimePicker");
		assert.ok(aControls[3].isA("sap.m.DateTimePicker"), "is a sap.m.DateTimePicker");
	});

	QUnit.test("DateTimeRange - values update callback", function(assert) {
		var oDateTimeOption = DynamicDateUtil.getOption("DATETIMERANGE"),
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
		var oDateTimeOption = DynamicDateUtil.getOption("DATETIMERANGE"),
			oDate = new Date(),
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
		var oOption = DynamicDateUtil.getOption("DATETIMERANGE");

		assert.strictEqual(oOption.getGroup(), 2, "the group is correct");
		assert.strictEqual(oOption.getGroupHeader(), "Date Ranges", "the group is correct");
	});

	QUnit.test("toDates - DATETIMERANGE", function(assert) {
		// arrange
		var oDateFormatter = DateFormat.getDateTimeInstance(),
			oDate = new Date(2021, 11, 20, 15, 50, 0),
			oDate2 = new Date(2021, 11, 29, 15, 50, 0),
			oResult;

		//act
		oResult = DynamicDateUtil.toDates({ operator: "DATETIMERANGE", values: [oDate, oDate2] });

		// assert
		assert.equal(oDateFormatter.format(oResult[0]) + " - " + oDateFormatter.format(oResult[1]), "Dec 20, 2021, 3:50:00 PM - Dec 29, 2021, 3:50:00 PM", "correct date/time");
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

	QUnit.test("labels are redirected to the inner input", function (assert) {
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
		oCore.applyChanges();

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

	QUnit.module("Misc", {
		beforeEach: function() {
			this.ddr = new DynamicDateRange();
			this.ddr.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.ddr.destroy();
		}
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

	QUnit.test("Open DynamicDateRange from Button", function(assert) {
		// Prepare
		var oDDR = new DynamicDateRange("HDDR", {
				hideInput: true
			}).placeAt("qunit-fixture"),
			oButton = new Button({
				icon: "sap-icon://appointment-2",
				press: function() {
					oCore.byId("HDDR").openBy(this.getDomRef());
				}
			}).placeAt("qunit-fixture");

		oCore.applyChanges();

		// Act
		oButton.firePress();
		oCore.applyChanges();

		// Assert
		assert.ok(oDDR._oPopup, oDDR.getId() + ": popup object exists");
		assert.ok(oCore.byId(oDDR.getId() + "-RP-popover"), oDDR.getId() + ": popover control exists");
		assert.ok(document.body.querySelector("#" + oDDR.getId() + "-RP-popover"), "popover exists in DOM");

		// Clean
		oDDR.destroy();
		oButton.destroy();
	});

});