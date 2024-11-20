/*global QUnit, sinon */
sap.ui.define([
	"sap/m/DynamicDateRange",
	"sap/m/DynamicDateOption",
	"sap/m/StandardDynamicDateOption",
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element",
	"sap/ui/core/date/UI5Date"
], function(
	DynamicDateRange,
	DynamicDateOption,
	StandardDynamicDateOption,
	Library,
	nextUIUpdate,
	Element,
	UI5Date
) {
	"use strict";

	// shortcut for library resource bundle
	var oRb = Library.getResourceBundleFor("sap.m");

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

		assert.strictEqual(oOption.getGroupHeader(this.ddr), "Keine Gruppe", "the default UI group header is correct");

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

	QUnit.test("last/next x creating value help UI", function(assert) {
		var oOptionLast = new StandardDynamicDateOption({ key: "LASTDAYS" }),
			aControls;

		aControls = oOptionLast.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 6, "created controls");
		assert.ok(aControls[0].isA("sap.m.Label"), "created the correct control");
		assert.ok(aControls[1].isA("sap.m.StepInput"), "created the correct control");
		assert.strictEqual(aControls[1].getMin(), 1, "The step input has correct min value");
		assert.strictEqual(aControls[1].getMax(), 6000, "The step input has correct max value");
		assert.ok(aControls[2].isA("sap.m.Label"), "created the correct control");
		assert.ok(aControls[3].isA("sap.m.Select"), "created the correct control");

		assert.strictEqual(aControls[3].getItems().length, 2, "two options are created");

		oOptionLast.destroy();
	});

	QUnit.test("last x one option creating value help UI", function(assert) {
		var oOptionLast = new StandardDynamicDateOption({ key: "LASTQUARTERS" }),
			aControls,
			oGetTextSpy = this.spy(oRb, "getText");

		// leave only one option
		this.ddr.setStandardOptions(["LASTQUARTERS", "LASTQUARTERSINCLUDED"]);

		aControls = oOptionLast.createValueHelpUI(this.ddr);

		assert.strictEqual(aControls.length, 6, "controls are only 6");
		assert.ok(aControls[0].isA("sap.m.Label"), "a label");
		assert.ok(aControls[1].isA("sap.m.StepInput"), "an input");
		assert.notOk(oGetTextSpy.calledWithExactly("DYNAMIC_DATE_QUARTALE"), "quarter text is used");
		oOptionLast.destroy();
	});

	QUnit.test("creating value help UI - values update callback", function(assert) {
		var oOptionLast = new StandardDynamicDateOption({ key: "LASTDAYS" }),
			fnUpdateCallback = this.spy(),
			aControls,
			oStepInput,
			oSelect;

		aControls = oOptionLast.createValueHelpUI(this.ddr, fnUpdateCallback);
		oStepInput = aControls[1];
		oSelect = aControls[3];

		//simulate input interaction
		oStepInput.fireChange();

		assert.strictEqual(fnUpdateCallback.callCount, 1, "value update callback was called");

		//simulate select button interaction
		oSelect.fireChange( { selectedItem: {}} );

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
		assert.strictEqual(sLabelText, "Ausgewählt: 08.01.2023, 00:12:37\u2009–\u200908.01.2023, 00:13:37");

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
		assert.strictEqual(sLabelText, "Ausgewählt: 07.01.2023, 23:13:37\u2009–\u200908.01.2023, 00:13:37", "correct label for last hour");

		//cleanup
		oDDR.destroy();
		await nextUIUpdate(oClock);
		oClock.restore();
	});

	QUnit.test("LASTDAYSINCLUDED option is found in the message bundle", async function(assert) {
		var oDDR = new DynamicDateRange({id: "myDDRLast", standardOptions: ["LASTDAYSINCLUDED"]}),
			oGetTextSpy = this.spy(oRb, "getText");

		//act
		oDDR.placeAt("qunit-fixture");
		await nextUIUpdate();
		oDDR.open();

		assert.ok(oGetTextSpy.calledWithExactly("DYNAMIC_DATE_LASTDAYSINCLUDED_TITLE"), "LASTDAYSINCLUDED TITLE text is used");

		//cleanup
		oDDR.destroy();
	});

});
