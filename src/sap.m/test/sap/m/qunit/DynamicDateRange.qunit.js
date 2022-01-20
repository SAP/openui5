/*global QUnit */
sap.ui.define([
	"sap/m/DynamicDateRange",
	"sap/m/CustomDynamicDateOption",
	"sap/m/StandardDynamicDateOption",
	"sap/m/DynamicDateValueHelpUIType",
	"sap/m/DynamicDateUtil",
	"sap/ui/unified/DateRange",
	"sap/ui/core/format/DateFormat"
], function(
	DynamicDateRange,
	CustomDynamicDateOption,
	StandardDynamicDateOption,
	DynamicDateValueHelpUIType,
	DynamicDateUtil,
	DateRange,
	DateFormat
) {
	"use strict";

	var oCore = sap.ui.getCore();

	// shortcut for library resource bundle
	var oRb = oCore.getLibraryResourceBundle("sap.m");

	QUnit.module("initialization", {
		beforeEach: function() {
			this.ddr = new DynamicDateRange();
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
					new DynamicDateValueHelpUIType({ type: "int" })];
			}
		});

		var aControls = oOption.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 4, "created the correct number of controls");
		assert.ok(aControls[0].isA("sap.ui.unified.Calendar"), "created the correct control");
		assert.ok(aControls[1].isA("sap.ui.unified.Calendar"), "created the correct control");
		assert.ok(aControls[2].isA("sap.ui.unified.calendar.MonthPicker"), "created the correct control");
		assert.ok(aControls[3].isA("sap.m.StepInput"), "created the correct control");

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

		var sLastText = oRb.getText("DYNAMIC_DATE_LASTX_TITLE", "days / months");
		assert.strictEqual(sText, sLastText, "the text is correct");

		sText = oOptionNext.getText(this.ddr);

		var sNextText = oRb.getText("DYNAMIC_DATE_NEXTX_TITLE", "weeks / quarters");
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
		assert.ok(aControls[2].isA("sap.m.Label"), "created the correct control");
		assert.ok(aControls[3].isA("sap.m.RadioButtonGroup"), "created the correct control");

		assert.strictEqual(aControls[0].getText(), "Value for X:", "label text is correct");
		assert.strictEqual(aControls[2].getText(), "Time Periods:", "label text is correct");
		assert.strictEqual(aControls[3].getButtons().length, 2, "two radio buttons are created");
		assert.strictEqual(aControls[3].getButtons()[0].getText(), "days", "two radio buttons are created");
		assert.strictEqual(aControls[3].getButtons()[1].getText(), "months", "two radio buttons are created");

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
		oStepInput = aControls[3];

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
});