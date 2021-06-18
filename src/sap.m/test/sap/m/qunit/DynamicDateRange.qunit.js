/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/m/DynamicDateRange",
	"sap/m/CustomDynamicDateOption",
	"sap/m/StandardDynamicDateOption",
	"sap/m/DynamicDateValueHelpUIType",
	"sap/ui/unified/DateRange"
], function(
	DynamicDateRange,
	CustomDynamicDateOption,
	StandardDynamicDateOption,
	DynamicDateValueHelpUIType,
	DateRange
) {
	var oCore = sap.ui.getCore();

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

		assert.strictEqual(sText, "Last X days / months", "the text is correct");

		sText = oOptionNext.getText(this.ddr);

		assert.strictEqual(sText, "Next X weeks / quarters", "the text is correct");

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
});