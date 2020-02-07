/* global QUnit,sinon */

sap.ui.define([
	"sap/base/Log",
	"sap/m/RangeSlider",
	"sap/m/ResponsiveScale",
	"sap/m/SliderTooltipBase",
	"sap/m/SliderTooltipBaseRenderer",
	"sap/m/Text",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"jquery.sap.keycodes",
	"sap/ui/model/json/JSONModel",
	"jquery.sap.global"
], function(
	Log,
	RangeSlider,
	ResponsiveScale,
	SliderTooltipBase,
	SliderTooltipBaseRenderer,
	Text,
	KeyCodes,
	qutils,
	jQuery,
	JSONModel
) {
	"use strict";


	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("HTML", {
		beforeEach: function () {
			this.rangeSlider = new RangeSlider();

			this.rangeSlider.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.rangeSlider.destroy();
			this.rangeSlider = null;
		}
	});

	QUnit.test("RangeSlider container", function (assert) {
		// assert
		assert.ok(this.rangeSlider, "RangeSlider should be rendered");
		assert.ok(jQuery(".sapMSliderProgress"), "The range slider's progress is rendered");
	});

	QUnit.test("Handles", function (assert) {
		assert.strictEqual(jQuery(".sapMSliderHandle").length, 2, "There should be two handles.");
		assert.strictEqual(jQuery("[id*='-handle']").length, 2, "There should be four elements in the handles section rendered.");
		assert.strictEqual(jQuery("[id$='-handle1']").length, 1, "There should be only one handle rendered with id \"-handle1\".");
		assert.strictEqual(jQuery("[id$='-handle2']").length, 1, "There should be only one handle rendered with id \"-handle2\".");
		assert.strictEqual(this.rangeSlider.getDomRef("handle1").style.left, "0%", "Left handle should be 0% left positioned");
		assert.strictEqual(this.rangeSlider.getDomRef("handle2").style.left, "100%", "Right handle should be 0% right positioned.");

		assert.ok(jQuery("[id$='-handle1']").attr("aria-orientation"), "Aria attribute \"aria-orientation\" should be rendered for handle1.");
		assert.ok(jQuery("[id$='-handle1']").attr("aria-valuemin"), "Aria attribute \"aria-valuemin\" should be rendered for handle1.");
		assert.ok(jQuery("[id$='-handle1']").attr("aria-valuemax"), "Aria attribute \"aria-valuemax\" should be rendered for handle1.");
		assert.ok(jQuery("[id$='-handle1']").attr("aria-valuenow"), "Aria attribute \"aria-valuenow\" should be rendered for handle1.");

		assert.ok(jQuery("[id$='-handle2']").attr("aria-orientation"), "Aria attribute \"aria-orientation\" should be rendered for handle2.");
		assert.ok(jQuery("[id$='-handle2']").attr("aria-valuemin"), "Aria attribute \"aria-valuemin\" should be rendered for handle2.");
		assert.ok(jQuery("[id$='-handle2']").attr("aria-valuemax"), "Aria attribute \"aria-valuemax\" should be rendered for handle2.");
		assert.ok(jQuery("[id$='-handle2']").attr("aria-valuenow"), "Aria attribute \"aria-valuenow\" should be rendered for handle2.");
	});

	QUnit.test("Aria labels forwarding to handles and progress indicator", function (assert) {
		// arrange & act
		var s1stHandleLabels, s2ndHandleLabels, sProgressIndicatorLabels, sRSLabelId;
		this.rangeSlider.addAriaLabelledBy(new Text({text: "LabelForRS"}));

		sap.ui.getCore().applyChanges();

		sRSLabelId = this.rangeSlider.getAriaLabelledBy()[0];
		s1stHandleLabels = this.rangeSlider.getDomRef("handle1").getAttribute("aria-labelledby");
		s2ndHandleLabels = this.rangeSlider.getDomRef("handle2").getAttribute("aria-labelledby");
		sProgressIndicatorLabels = this.rangeSlider.getDomRef("progress").getAttribute("aria-labelledby");

		// assert
		assert.ok(s1stHandleLabels.indexOf(sRSLabelId) > -1, "The slider's label is forwarded to its 1st handle");
		assert.ok(s2ndHandleLabels.indexOf(sRSLabelId) > -1, "The slider's label is forwarded to its 2nd handle");
		assert.ok(sProgressIndicatorLabels.indexOf(sRSLabelId) > -1, "The slider's label is forwarded to its progress indicator");

	});

	QUnit.test("Handles' Tooltips", function (assert) {
		this.rangeSlider.setShowAdvancedTooltip(true);
		sap.ui.getCore().applyChanges();

		this.rangeSlider.getAggregation("_tooltipContainer").show(this.rangeSlider);
		assert.strictEqual(jQuery(".sapMSliderTooltip").length, 2, "There should be two tooltips.");
	});

	QUnit.test("RangeSlider's Labels", function (assert) {
		assert.ok(jQuery(".sapMSliderLabels"), "The labels container is rendered.");
		assert.strictEqual(jQuery(".sapMSliderRangeLabel").length, 2, "There are two labels rendered.");
		assert.strictEqual(jQuery(".sapMSliderRangeLabel").length, 2, "There are two labels rendered.");
		assert.equal(this.rangeSlider.$().find(".sapMSliderRangeLabel:eq(0)").html(), this.rangeSlider.getMin(), "The start label shows the min value");
		assert.equal(this.rangeSlider.$().find(".sapMSliderRangeLabel:eq(1)").html(), this.rangeSlider.getMax(), "The end label shows the max value");
	});

	QUnit.test("RangeSlider's Labels Width", function (assert) {
		this.rangeSlider.setMax(10000000000000);
		this.rangeSlider.rerender();

		assert.equal(this.rangeSlider.$().find(".sapMSliderRangeLabel:eq(1)").width(), 120, "The end label should have 120px width when the value consists of 14 digits");

	});

	QUnit.test("Overlapping handles", function (assert) {
		this.rangeSlider.setRange([50, 50]);
		sap.ui.getCore().applyChanges();

		assert.ok(this.rangeSlider.$().find(".sapMSliderHandle"), "The handles should be added an Overlap class");
		assert.strictEqual(this.rangeSlider.$().find(".sapMSliderHandle").length, 2, "Both handles should be affected");
	});

	QUnit.test("Memory leak on rerender", function (assert) {
		var oldLabel = this.rangeSlider._oRangeLabel;
		this.rangeSlider.rerender();
		sap.ui.getCore().applyChanges();
		var newLabel = this.rangeSlider._oRangeLabel;
		assert.equal(oldLabel, newLabel, "No new range label should be created on control rerendering");
	});

	QUnit.module("API", {
		beforeEach: function () {
			this.rangeSlider = new RangeSlider();

			this.rangeSlider.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.rangeSlider.destroy();
			this.rangeSlider = null;
		}
	});

	QUnit.test("it should not throw an error when the .destroy() method is called twice", function (assert) {
		this.rangeSlider.destroy();
		assert.ok(true);
	});

	QUnit.test("Default Values", function (assert) {
		// assert
		var aRange = this.rangeSlider.getRange();
		assert.strictEqual(this.rangeSlider.getEnabled(), true, "By default the RangeSlider is enabled");
		assert.strictEqual(this.rangeSlider.getVisible(), true, "By default the RangeSlider is visible");
		assert.strictEqual(this.rangeSlider.getName(), "", "By default the RangeSlider's name is ''");
		assert.strictEqual(this.rangeSlider.getWidth(), "100%", "The initial width is set to \"100%\"");
		assert.strictEqual(this.rangeSlider.getMin(), 0, "The default value for min is 0.");
		assert.strictEqual(this.rangeSlider.getMax(), 100, "The default value for max is 100.");
		assert.strictEqual(this.rangeSlider.getStep(), 1, "By default the RangeSlider's step is 1");
		assert.ok(Array.isArray(aRange), "The range of the RangeSlider should be an array.");
		assert.strictEqual(aRange.length, 2, "The range of the RangeSlider should be an array with two values in it.");
		assert.strictEqual(aRange[0], 0, "The default low value of the range should be 0.");
		assert.strictEqual(aRange[1], 100, "The default high value of the range should be 100.");
	});

	QUnit.test("_handlesLabels aggregation", function (assert) {
		// arrange & act
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			oBoundleCalledStub = this.stub(oResourceBundle, "getText"),
			oSlider = new RangeSlider(),
			aLabels = oSlider.getAggregation("_handlesLabels");

		oSlider.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(aLabels.length, 3, "Label for handles should be added as an aggregation");
		assert.ok(oBoundleCalledStub.calledWith("RANGE_SLIDER_LEFT_HANDLE"), "Text should be regarding the left handle");
		assert.ok(oBoundleCalledStub.calledWith("RANGE_SLIDER_RIGHT_HANDLE"), "Text should be regarding the right handle");
		assert.ok(oBoundleCalledStub.calledWith("RANGE_SLIDER_RANGE_HANDLE"), "Text should be regarding the range");
		assert.strictEqual(oSlider.getDomRef("progress").getAttribute("aria-labelledby"), aLabels[2].getId());

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("getRange()", function (assert) {
		var aRange = this.rangeSlider.getRange();

		assert.strictEqual(aRange[0], 0, "The getRange()[0] function should return the default min value of 0");
		assert.strictEqual(aRange[1], 100, "The getRange()[1] function should return the default max value of 100");
	});

	QUnit.test("setRange()", function (assert) {
		var newRange = [25, 75],
			aRange;

		this.rangeSlider.setRange(newRange);
		this.rangeSlider.setWidth("100px");
		this.rangeSlider.setShowAdvancedTooltip(true);
		sap.ui.getCore().applyChanges();

		aRange = this.rangeSlider.getRange();

		this.rangeSlider.getAggregation("_tooltipContainer").show(this.rangeSlider);

		assert.strictEqual(aRange[0], newRange[0], "The first value of the range should be set to " + newRange[0]);
		assert.strictEqual(aRange[1], newRange[1], "The second value of the range should be set to " + newRange[1]);
		assert.strictEqual(parseInt(this.rangeSlider.getAggregation("_tooltipContainer").getAssociatedTooltipsAsControls()[0].getValue()), newRange[0], "The tooltip1's value should be changed to the left handle's value of " + newRange[0]);
		assert.strictEqual(parseInt(this.rangeSlider.getAggregation("_tooltipContainer").getAssociatedTooltipsAsControls()[1].getValue()), newRange[1], "The tooltip2's value should be changed to the right handle's value of " + newRange[1]);
	});

	QUnit.test("set/getValue()", function (assert) {
		//act
		this.rangeSlider.setValue(54);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(this.rangeSlider.getRange(), [54, 100], "The value should be set properly within the range");
		assert.strictEqual(this.rangeSlider.getValue(), 54, "Value should be set properly");

		//act
		this.rangeSlider.setValue(7815287);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(this.rangeSlider.getRange(), [100, 100], "The value should be set properly within the range");
		assert.strictEqual(this.rangeSlider.getValue(), 100, "Value should be limited to the MAX properly");

		//act
		this.rangeSlider.setValue(-100);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(this.rangeSlider.getRange(), [0, 100], "The value should be set properly within the range");
		assert.strictEqual(this.rangeSlider.getValue(), 0, "Value should be limited to the MIN properly");
	});

	QUnit.test("set/getValue2()", function (assert) {
		//act
		this.rangeSlider.setValue2(54);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(this.rangeSlider.getRange(), [0, 54], "The value should be set properly within the range");
		assert.strictEqual(this.rangeSlider.getValue2(), 54, "Value should be set properly");

		//act
		this.rangeSlider.setValue2(7815287);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(this.rangeSlider.getRange(), [0, 100], "The value should be set properly within the range");
		assert.strictEqual(this.rangeSlider.getValue2(), 100, "Value should be limited to the MAX properly");

		//act
		this.rangeSlider.setValue2(-100);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(this.rangeSlider.getRange(), [0, 0], "The value should be set properly within the range");
		assert.strictEqual(this.rangeSlider.getValue2(), 0, "Value should be limited to the MIN properly");
	});

	QUnit.test("set/getStep()", function (assert) {
		//arrange
		var aTooltips, fnWarningSpy = this.spy(Log, "warning");

		assert.strictEqual(this.rangeSlider._iDecimalPrecision, 0, "The decimal precision should be 0 initially");

		//act
		this.rangeSlider.setStep(0.05);
		this.rangeSlider.setShowAdvancedTooltip(true);
		sap.ui.getCore().applyChanges();

		//assert
		aTooltips = this.rangeSlider.getAggregation("_tooltipContainer").getAssociatedTooltipsAsControls();

		assert.strictEqual(this.rangeSlider.getStep(), 0.05, "The step should be set properly within the range");
		assert.strictEqual(this.rangeSlider._iDecimalPrecision, 2, "The decimal precision should be 2");
		assert.strictEqual(fnWarningSpy.callCount, 0, "No warnings were logged");

		assert.strictEqual(aTooltips[0].getStep(), 0.05, "Tooltip 1 step property was updated correctly");
		assert.strictEqual(aTooltips[1].getStep(), 0.05, "Tooltip 2 step property was updated correctly");

		//act
		this.rangeSlider.setStep(-0.5);
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.rangeSlider.getStep(), -0.5, "The step should be set properly within the range");
		assert.strictEqual(this.rangeSlider._iDecimalPrecision, 1, "The decimal precision should be 1");
		assert.ok(fnWarningSpy.calledOnce, "One warning was logged");
	});

	QUnit.test("set/getValue() with decimal precision", function (assert) {
		//arrange
		this.rangeSlider.setStep(0.05);
		sap.ui.getCore().applyChanges();

		//act
		this.rangeSlider.setValue(0.150000000000000001);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(this.rangeSlider.getRange(), [0.15, 100], "The value should be set properly within the range");
		assert.strictEqual(this.rangeSlider.getValue(), 0.15, "The value should be set with its proper decimal precision");
	});

	QUnit.test("set/getValue2() with decimal precision", function (assert) {
		//arrange
		this.rangeSlider.setStep(0.05);
		sap.ui.getCore().applyChanges();

		//act
		this.rangeSlider.setValue2(0.150000000000000001);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(this.rangeSlider.getRange(), [0, 0.15], "The value should be set properly within the range");
		assert.strictEqual(this.rangeSlider.getValue2(), 0.15, "The value should be set with its proper decimal precision");
	});

	QUnit.test("Invalid range starting value of -20 (where min is 0)", function (assert) {
		var fnWarningSpy = this.spy(Log, "warning");

		this.rangeSlider.setRange([-20, 50]);
		sap.ui.getCore().applyChanges();

		var aRange = this.rangeSlider.getRange();

		assert.strictEqual(aRange[0], this.rangeSlider.getMin(), "The starting value of the range should be set to 0");
		assert.ok(fnWarningSpy.callCount === 1, "A warning is logged.");
		assert.ok(fnWarningSpy.calledWith("Warning: Min value (-20) not in the range: [0,100]"), "A correct warning is logged");
		assert.strictEqual(aRange[1], 50, "The end value of the range should be set to 50");

		// cleanup
		fnWarningSpy.restore();
	});

	QUnit.test("Invalid range ending value of 150 (where max is 100)", function (assert) {
		var fnWarningSpy = this.spy(Log, "warning");

		this.rangeSlider.setRange([20, 150]);
		sap.ui.getCore().applyChanges();

		var aRange = this.rangeSlider.getRange();

		assert.strictEqual(aRange[0], 20, "The starting value of the range should be set to 20");
		assert.ok(fnWarningSpy.callCount === 1, "A warning is logged.");
		assert.ok(fnWarningSpy.calledWith("Warning: Max value (150) not in the range: [0,100]"), "A correct warning is logged");
		assert.strictEqual(aRange[1], this.rangeSlider.getMax(), "The end value of the range should be set to 100");

		// cleanup
		fnWarningSpy.restore();
	});

	QUnit.test("getClosestHandleDomRef() with coordinates for left handle", function (assert) {
		this.rangeSlider.setWidth("1000px");
		this.rangeSlider._fSliderOffsetLeft = 0;

		var oMockEventData = {"clientX": 0};
		var oHandleDomRef = this.rangeSlider.getClosestHandleDomRef(oMockEventData);

		assert.strictEqual(oHandleDomRef, this.rangeSlider.getDomRef("handle1"), "The function should return the first handle");
	});

	QUnit.test("getClosestHandleDomRef() with coordinates for right handle", function (assert) {
		this.rangeSlider.setWidth("1000px");
		this.rangeSlider._fSliderOffsetLeft = 0;

		var oMockEventData = {clientX: 1000, pageX: 1000};
		var oHandleDomRef = this.rangeSlider.getClosestHandleDomRef(oMockEventData);

		assert.strictEqual(oHandleDomRef, this.rangeSlider.getDomRef("handle2"), "The function should return the second handle");
	});

	QUnit.test("setValue()", function (assert) {
		var vResult = this.rangeSlider.setValue();
		assert.ok(vResult === this.rangeSlider, "The function should not do anything and return this for chaining");
	});

	QUnit.test("_calculateHandlePosition()", function (assert) {
		this.rangeSlider._fSliderWidth = 100;
		this.rangeSlider._fSliderOffsetLeft = 0;
		this.rangeSlider._fSliderPaddingLeft = 0;

		var value1 = 0,
			value2 = 100,
			value3 = 73,
			value4 = -1,
			value5 = 105;

		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value1), 0, "The function should return 0");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value2), 100, "The function should return 100");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value3), 73, "The function should return 73");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value4), 0, "The function should return 0");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value5), 100, "The function should return 100");
	});

	QUnit.test("_calculateHandlePosition() with even step", function (assert) {
		this.rangeSlider._fSliderWidth = 100;
		this.rangeSlider._fSliderOffsetLeft = 0;
		this.rangeSlider._fSliderPaddingLeft = 0;
		this.rangeSlider.setStep(2);

		var value1 = 0,
			value2 = 100,
			value3 = 73;

		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value1), 0, "The function should return 0");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value2), 100, "The function should return 100");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value3), 74, "The function should return 74");
	});

	QUnit.test("_calculateHandlePosition() with odd step", function (assert) {
		this.rangeSlider._fSliderWidth = 100;
		this.rangeSlider._fSliderOffsetLeft = 0;
		this.rangeSlider._fSliderPaddingLeft = 0;
		this.rangeSlider.setStep(3);

		var value1 = 0,
			value2 = 9,
			value3 = 102,
			value4 = 73;

		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value1), 0, "The function should return 0");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value2), 9, "The function should return 9");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value3), 100, "The function should return 100");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value4), 72, "The function should return 72");
	});

	QUnit.test("_calculateHandlePosition() with decimal step", function (assert) {
		this.rangeSlider._fSliderWidth = 100;
		this.rangeSlider._fSliderOffsetLeft = 0;
		this.rangeSlider._fSliderPaddingLeft = 0;
		this.rangeSlider.setStep(0.5);

		var value1 = 0.0,
			value2 = 5.5,
			value3 = 25.2,
			value4 = 30.8;

		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value1), 0, "The function should return 0");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value2), 5.5, "The function should return 5.5");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value3), 25, "The function should return 25");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value4), 31, "The function should return 31");
	});

	QUnit.test('Slider with decimal values, should apply all dom element attributes correctly', function (assert) {
		// arrange
		var oSliderInputElement,
			oSlider = new RangeSlider({
				min: -10,
				max: 10,
				range: [-5.05, 3],
				name: "RangeSlider12",
				step: 0.05
			}).placeAt(DOM_RENDER_LOCATION);

		// act
		oSlider.setValue(1.2542324);
		oSlider.setValue2(3.4122);

		sap.ui.getCore().applyChanges();

		oSliderInputElement = oSlider.$().find('.sapMSliderInput')[0];

		// assert
		assert.strictEqual(parseFloat(oSliderInputElement.getAttribute('start')), 1.25, "Range[0] to be set properly");
		assert.strictEqual(parseFloat(oSliderInputElement.getAttribute('end')), 3.40, "Range[1] to be set properly");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("Calculate movement offset", function (assert) {
		var aRange = [4, 27],
			iStep = 5,
			oSlider = new RangeSlider("RangeSlider6", {
				step: iStep,
				min: 4,
				max: 27,
				range: aRange
			}).placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		//Act
		oSlider._updateSliderValues(iStep, oSlider._mHandleTooltip.start.handle);
		sap.ui.getCore().applyChanges();

		//Test
		aRange = oSlider.getRange();
		assert.strictEqual(aRange[0], 9, "First value of the range to be updated");
		// clock.tick(1000);

		//Act
		aRange = [10, 27];
		oSlider.setRange(aRange);
		sap.ui.getCore().applyChanges();
		// clock.tick(1000);

		assert.strictEqual(aRange[0], 10, "Range[0] to be set properly");
		assert.strictEqual(aRange[1], 27, "Range[1] to be set properly");

		//Act
		oSlider._updateSliderValues(-1 * iStep, oSlider._mHandleTooltip.start.handle);
		sap.ui.getCore().applyChanges();

		//Test
		aRange = oSlider.getRange();
		assert.strictEqual(aRange[0], 4, "First value of the range to be set at the lowest possible value");

		oSlider.destroy();
		oSlider = null;
	});

	QUnit.test("_updateHandleAria", function (assert) {
		var oSlider = new RangeSlider().placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		//Act
		oSlider._updateHandleAria(oSlider._mHandleTooltip.start.handle, 12);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oSlider._mHandleTooltip.start.handle.getAttribute("aria-valuenow"), "12", "Change valuenow property");

		oSlider.destroy();
		oSlider = null;
	});

	QUnit.test("_updateHandlesAriaLabels", function (assert) {
		var clock = sinon.useFakeTimers(),
			oSlider = new RangeSlider().placeAt(DOM_RENDER_LOCATION),
			oInitStateStartLabel, oInitStateEndLabel;
		sap.ui.getCore().applyChanges();

		oInitStateStartLabel = oSlider._mHandleTooltip.start.label;
		oInitStateEndLabel = oSlider._mHandleTooltip.end.label;

		//Act
		oSlider.setRange([60, 20]);
		sap.ui.getCore().applyChanges();
		clock.tick(1000);

		//Assert
		assert.ok(oSlider._mHandleTooltip.start.label === oInitStateEndLabel, "Labels are swapped");
		assert.ok(oSlider._mHandleTooltip.end.label === oInitStateStartLabel, "Labels are swapped");

		assert.strictEqual(oSlider._mHandleTooltip.start.handle.getAttribute("aria-labelledby"), oInitStateEndLabel.getId(), "Labels are swapped");
		assert.strictEqual(oSlider._mHandleTooltip.end.handle.getAttribute("aria-labelledby"), oInitStateStartLabel.getId(), "Labels are swapped");

		oSlider.destroy();
		oSlider = null;
		clock.restore();
	});

	QUnit.test("_swapTooltips", function (assert) {
		var oSlider = new RangeSlider({
			showAdvancedTooltip: true
		}).placeAt(DOM_RENDER_LOCATION),
			oInitStateStartTooltip, oInitStateEndTooltip;
		sap.ui.getCore().applyChanges();

		oInitStateStartTooltip = oSlider._mHandleTooltip.start.tooltip;
		oInitStateEndTooltip = oSlider._mHandleTooltip.end.tooltip;

		//Act
		oSlider._swapTooltips([60, 20]);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oSlider._mHandleTooltip.start.tooltip === oInitStateEndTooltip, "Tooltips are swapped");
		assert.ok(oSlider._mHandleTooltip.end.tooltip === oInitStateStartTooltip, "Tooltips are swapped");

		oSlider.destroy();
		oSlider = null;
	});

	QUnit.test("The order of the arguments should not matter when setting the properties min/max, value/value2", function (assert) {
		var check = function (oSliderConfig) {
			var oSlider = new RangeSlider(oSliderConfig).placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

			//Assert
			assert.strictEqual(oSlider.getValue(), oSliderConfig.value, "'Value' property value should be adjusted correctly");
			assert.strictEqual(oSlider.getValue2(), oSliderConfig.value2, "'Value2' property value should be adjusted correctly");
			assert.strictEqual(oSlider.getMin(), oSliderConfig.min, "'Min' property values should be equal");
			assert.strictEqual(oSlider.getMax(), oSliderConfig.max, "'Max' property values should be equal");
			assert.strictEqual(oSlider.getRange()[0], oSlider.getValue(), "The start of the range should be equal to the value of the property 'value'");
			assert.strictEqual(oSlider.getRange()[1], oSlider.getValue2(), "The end of the range should be equal to the value of the property 'value2'");

			//Cleanup
			oSlider.destroy();
			oSlider = null;
		};

		check({value: 500, value2: 1000, min: 0, max: 2000});
		check({value: 1000, value2: 500, min: 0, max: 2000});
	});

	QUnit.test("The values of value and value2 properties should be adjusted correctly when they are not in the boundaries of min and max values", function (assert) {
		var check = function (oSliderConfig) {
			var oSlider = new RangeSlider(oSliderConfig).placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

			//Assert
			assert.strictEqual(oSlider.getValue(), oSliderConfig.min, "'Value' property value should be equal to the min value");
			assert.strictEqual(oSlider.getValue2(), oSliderConfig.max, "'Value2' property value should be equal to the max");
			assert.strictEqual(oSlider.getMin(), oSliderConfig.min, "'Min' property values should be equal");
			assert.strictEqual(oSlider.getMax(), oSliderConfig.max, "'Max' property values should be equal");
			assert.strictEqual(oSlider.getRange()[0], oSlider.getValue(), "The start of the range should be equal to the value of the property 'value'");
			assert.strictEqual(oSlider.getRange()[1], oSlider.getValue2(), "The end of the range should be equal to the value of the property 'value2'");

			//Cleanup
			oSlider.destroy();
			oSlider = null;
		};

		check({value: 100, max: 500, value2: 600, min: 200});
		check({value: 100, min: 200, max: 2000,value2: 5000});
	});

	QUnit.test("The order of the arguments should not matter when setting the properties min/max, range", function (assert) {
		var check = function (oSliderConfig) {
			var oSlider = new RangeSlider(oSliderConfig).placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

			//Assert
			assert.strictEqual(oSlider.getValue(), oSlider.getRange()[0], "'Value' property value should be equal to the start of the range");
			assert.strictEqual(oSlider.getValue2(), oSlider.getRange()[1], "'Value2' property value should be equal to the end of the range");
			assert.strictEqual(oSlider.getRange()[0], oSliderConfig.range[0], "'Range' property start value should be the adjusted correctly");
			assert.strictEqual(oSlider.getRange()[1], oSliderConfig.range[1], "'Range' property end value should be the adjusted correctly");

			//Cleanup
			oSlider.destroy();
			oSlider = null;
		};

		check({range: [500, 1000], min: -100, max: 2000});
		check({min: -100, max: 2000, range: [500, 1000]});
	});

	QUnit.test("The values of the range property should be adjusted correctly when they are not in the boundaries of min and max values", function (assert) {
		var check = function (oSliderConfig) {
			var oSlider = new RangeSlider(oSliderConfig).placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

			//Assert
			assert.strictEqual(oSlider.getValue(), oSlider.getRange()[0], "'Value' property value should be equal to the start of the range");
			assert.strictEqual(oSlider.getValue2(), oSlider.getRange()[1], "'Value2' property value should be equal to the end of the range");
			assert.strictEqual(oSlider.getRange()[0], oSliderConfig.min, "'Range' property start value should be the adjusted correctly");
			assert.strictEqual(oSlider.getRange()[1], oSliderConfig.max, "'Range' property end value should be the adjusted correctly");

			//Cleanup
			oSlider.destroy();
			oSlider = null;
		};

		check({range: [-200, 3000], min: -100, max: 2000});
		check({min: -100, max: 2000, range: [-500, 3000]});
	});

	QUnit.test("Swap tooltips when values are swapped.", function (assert) {
		//Setup
		var oLeftTooltip, oRightTooltip,
			oRangeSlider = new RangeSlider({
				showAdvancedTooltip: true,
				showHandleTooltip: true,
				enableTickmarks: false,
				range: [8, 2],
				min: 2,
				max: 10,
				step: 1,
				width: "600px"
			}).placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

		oRangeSlider.getAggregation("_tooltipContainer").show(oRangeSlider);

		oLeftTooltip = jQuery("#" + oRangeSlider.getId() + "-" + "leftTooltip").control(0);
		oRightTooltip = jQuery("#" + oRangeSlider.getId() + "-" + "rightTooltip").control(0);

		//Assert
		assert.equal(oLeftTooltip.getValue(), "2");
		assert.equal(oRightTooltip.getValue(), "8");

		//Cleanup
		oRangeSlider.destroy();
	});

	QUnit.module("SAP KH", {
		beforeEach: function () {
			this.oRangeSlider = new RangeSlider({range: [20, 30]});
			this.oRangeSlider.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

			this.oEvent = {
				target: this.oRangeSlider._mHandleTooltip.start.handle,
				preventDefault: function () {
				},
				stopPropagation: function () {
				},
				setMarked: function () {
				}
			};

			this.testSAPEvents = function testSAPEvents(assert, methodName) {
				var oMock = sinon.mock(this.oRangeSlider),
					aCurRange = this.oRangeSlider.getRange();

				oMock.expects("_fireChangeAndLiveChange").once();

				this.oRangeSlider[methodName](this.oEvent);
				sap.ui.getCore().applyChanges();

				oMock.verify();
				assert.notDeepEqual(this.oRangeSlider.getRange(), aCurRange, "Not equals");
			};
		},
		afterEach: function () {
			this.oEvent = null;
			this.testSAPEvents = null;
			this.oRangeSlider.destroy();
			this.oRangeSlider = null;
		}
	});

	QUnit.test("KH: onsapincrease", function (assert) {
		this.testSAPEvents(assert, "onsapincrease");
	});

	QUnit.test("KH: onsapplus", function (assert) {
		this.testSAPEvents(assert, "onsapplus");
	});

	QUnit.test("KH: onsapincreasemodifiers", function (assert) {
		this.testSAPEvents(assert, "onsapincreasemodifiers");
	});

	QUnit.test("KH: onsappageup", function (assert) {
		this.testSAPEvents(assert, "onsappageup");
	});

	QUnit.test("KH: onsapdecrease", function (assert) {
		this.testSAPEvents(assert, "onsapdecrease");
	});

	QUnit.test("KH: onsapminus", function (assert) {
		this.testSAPEvents(assert, "onsapminus");
	});

	QUnit.test("KH: onsapdecreasemodifiers", function (assert) {
		this.testSAPEvents(assert, "onsapdecreasemodifiers");
	});

	QUnit.test("KH: onsappagedown", function (assert) {
		this.testSAPEvents(assert, "onsappagedown");
	});

	QUnit.test("KH: onsapend", function (assert) {
		this.testSAPEvents(assert, "onsapend");
	});

	QUnit.test("KH: onsaphome", function (assert) {
		assert.deepEqual(this.oRangeSlider.getRange(), [20, 30], "Initial value is correct");

		//Check start handle home event
		//Act
		this.testSAPEvents(assert, "onsaphome");

		// Assert
		assert.deepEqual(this.oRangeSlider.getRange(), [0, 30], "Start handle home event is correctly triggered");

		//Check end handle home event
		//Act
		qutils.triggerKeydown(this.oRangeSlider._mHandleTooltip.end.handle, jQuery.sap.KeyCodes.HOME);

		// Assert
		assert.deepEqual(this.oRangeSlider.getRange(), [0, 0], "End handle home event is correctly triggered");
	});

	QUnit.test("KH: Global ALT + Arrow", function (assert) {
		var oMockEvent = {
				target: {type: ""},
				altKey: true,
				preventDefault: function () {},
				stopPropagation: function () {},
				setMarked: function () {}
			},
			oRangeSlider = new RangeSlider().placeAt(DOM_RENDER_LOCATION),
			oEventSpyPreventDefault = this.spy(oMockEvent, "preventDefault"),
			oEventSpySetMarked = this.spy(oMockEvent, "setMarked");

		// Act
		oRangeSlider.onsapincreasemodifiers(oMockEvent);

		// Assert
		assert.ok(oEventSpyPreventDefault.callCount === 0, "The method is skipped and the event went to the global KH");
		assert.ok(oEventSpySetMarked.callCount === 0, "The method is skipped and the event went to the global KH");

		// Act
		oRangeSlider.onsapdecreasemodifiers(oMockEvent);

		// Assert
		assert.ok(oEventSpyPreventDefault.callCount === 0, "The method is skipped and the event went to the global KH");
		assert.ok(oEventSpySetMarked.callCount === 0, "The method is skipped and the event went to the global KH");
	});

	QUnit.module("Events");

	QUnit.test("liveChange trigger should be fired only when the range is actually changed.", function (assert) {
		//Setup
		var aRange = [12, 38],
			fnLiveChange = this.spy(function (oEvent) {
				var aRangeParam = oEvent.getParameter("range");
				assert.deepEqual(aRangeParam, aRange, "Range should be properly set");
			}),
			oRangeSlider = new RangeSlider({range: aRange, min: 0, max: 100, liveChange: fnLiveChange}).placeAt(DOM_RENDER_LOCATION);

		assert.expect(5);

		//Act
		oRangeSlider._triggerLiveChange();
		//Assert
		assert.ok(fnLiveChange.calledOnce, "liveChange listener should be called once.");

		//Act
		oRangeSlider._triggerLiveChange();
		//Assert
		assert.ok(fnLiveChange.calledOnce, "liveChange listener should still be called once.");

		//Act
		aRange = [20, 30];
		oRangeSlider.setRange(aRange);
		oRangeSlider._triggerLiveChange();
		//Assert
		assert.ok(fnLiveChange.calledTwice, "liveChange listener should be called once again when the range is changed.");

		//Cleanup
		oRangeSlider.destroy();
	});

	QUnit.module("Overwritten methods");

	QUnit.test("getRange", function (assert) {
		var aRange = [12, 38],
			oRangeSlider = new RangeSlider({range: aRange, min: 0, max: 100}).placeAt(DOM_RENDER_LOCATION);

		sap.ui.getCore().applyChanges();

		assert.deepEqual(oRangeSlider.getRange(), aRange, "Range should equal to the initial set value: " + aRange);
		assert.deepEqual(oRangeSlider.getRange(), oRangeSlider.getRange(), "Ranges should be equal");
		assert.ok(oRangeSlider.getRange() !== oRangeSlider.getRange(), "Ranges should not be the same instance");

		oRangeSlider.destroy();
	});

	QUnit.module("Integrations:");

	QUnit.test("Model change from the outside", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new JSONModel(oData),
			oRangeSlider = new RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}"});

		oRangeSlider.setModel(oModel);
		oRangeSlider.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oData.min, oRangeSlider.getMin(), "Min threshold to be set properly");
		assert.strictEqual(oData.max, oRangeSlider.getMax(), "Max threshold to be set properly");
		assert.deepEqual(oData.range, oRangeSlider.getRange(), "Ranges should be equal");
		assert.ok(oData.range !== oRangeSlider.getRange(), "Range array should not be the same instances");

		//Act
		oModel.setProperty("/range", [120, 150]);
		oModel.setProperty("/min", 100);
		oModel.setProperty("/max", 200);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(100, oRangeSlider.getMin(), "Min threshold to be set properly");
		assert.strictEqual(200, oRangeSlider.getMax(), "Max threshold to be set properly");
		assert.strictEqual(120, oRangeSlider.getValue(), "Max threshold to be set properly");
		assert.strictEqual(150, oRangeSlider.getValue2(), "Max threshold to be set properly");
		assert.deepEqual([120, 150], oRangeSlider.getRange(), "Ranges should be equal");

		oRangeSlider.destroy();
		oModel.destroy();
	});

	QUnit.test("Model change from the inside", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new JSONModel(oData),
			oRangeSlider = new RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}"});

		oRangeSlider.setModel(oModel);
		oRangeSlider.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		//Act
		var oData2 = [50, 80];
		oRangeSlider.setRange(oData2);
		sap.ui.getCore().applyChanges();

		assert.deepEqual([50, 80], oModel.getProperty("/range"), "Ranges should be equal");
		assert.deepEqual([50, 80], oRangeSlider.getRange(), "Ranges should be equal");
		assert.ok(oData2 !== oRangeSlider.getRange(), "Range array should not be the same instances");

		oRangeSlider.destroy();
		oModel.destroy();
	});

	QUnit.test("Change whole range when a to-be-set is lower than min value", function (assert) {
		var oRangeSlider = new RangeSlider({min: -100, max: 100, range: [-50, 50]}),
			aInitialRange = oRangeSlider.getRange(), aNormalizedRange,
			aHandles = [oRangeSlider._mHandleTooltip.start.tooltip, oRangeSlider._mHandleTooltip.end.tooltip];

		oRangeSlider.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		//Act
		aNormalizedRange = oRangeSlider._getNormalizedRange([-110, -10], aInitialRange, aHandles);
		sap.ui.getCore().applyChanges();

		assert.deepEqual(aNormalizedRange, [-100, 0], "Ranges should be equal");

		oRangeSlider.destroy();
	});

	QUnit.test("XML value", function (assert) {
		var oRangeSlider,
			sXMLText = '<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc"><RangeSlider id="range" range="5,20" /></mvc:View>',
			oView = sap.ui.xmlview({viewContent: sXMLText});

		oView.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		oRangeSlider = oView.byId("range");

		assert.ok(oRangeSlider, "Slider should have been initialized");
		assert.deepEqual(oRangeSlider.getRange(), [5, 20], "Range's string array should have been parsed properly");

		oRangeSlider.destroy();
		oRangeSlider = null;
		oView.destroy();
	});

	QUnit.test("value, value2 and range bindings through setters", function (assert) {
		var oRangeSlider = new RangeSlider({value: 12, value2: 88, min: 0, max: 90});
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [12, 88], "Range should be equal to [12, 88]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");


		//act
		oRangeSlider.setValue(22);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 88], "Range should be equal to [22, 88]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be updated properly");

		//act
		oRangeSlider.setValue2(35);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 35], "Range should be equal to [22, 35]");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be updated properly");

		//act
		oRangeSlider.setRange([5, 15]);

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [5, 15], "Range should be equal to [5, 15]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");

		//Destroy
		oRangeSlider.destroy();
		oRangeSlider = null;
	});

	QUnit.test("value, value2 and range setters, bindings + outer Model", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new JSONModel(oData),
			oRangeSlider = new RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}"});

		oRangeSlider.setModel(oModel);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [100, 500], "Range should be equal to [100, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");


		//act
		oRangeSlider.setValue(22);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 500], "Range should be equal to [22, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], 22, "Range 0 and value should be updated properly to 22");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oRangeSlider.setValue2(35);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 35], "Range should be equal to [22, 35]");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oRangeSlider.setRange([5, 15]);

		//assert
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//Destroy
		oRangeSlider.destroy();
		oRangeSlider = null;
		oModel.destroy();
		oModel = null;
	});

	QUnit.test("value, value2 and range setters, bindings + outer Model V2", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new JSONModel(oData),
			oRangeSlider = new RangeSlider({min: "{/min}", max: "{/max}", value: "{/range/0}", value2: "{/range/1}", range: "{/range}"});

		oRangeSlider.setModel(oModel);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [100, 500], "Range should be equal to [100, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");


		//act
		oRangeSlider.setValue(22);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 500], "Range should be equal to [22, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], 22, "Range 0 and value should be updated properly to 22");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oRangeSlider.setValue2(35);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 35], "Range should be equal to [22, 35]");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oRangeSlider.setRange([5, 15]);

		//assert
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//Destroy
		oRangeSlider.destroy();
		oRangeSlider = null;
		oModel.destroy();
		oModel = null;
	});

	QUnit.test("value, value2 and range setters, bindings + outer Model change", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new JSONModel(oData),
			oRangeSlider = new RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}", value: "{/range/0}", value2: "{/range/1}"});

		oRangeSlider.setModel(oModel);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [100, 500], "Range should be equal to [100, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");


		//act
		oModel.setProperty("/range/0", 22);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 500], "Range should be equal to [22, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], 22, "Range 0 and value should be updated properly to 22");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oModel.setProperty("/range/1", 35);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 35], "Range should be equal to [22, 35]");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oModel.setProperty("/range", [5, 15]);
		oModel.setProperty("/range/1", 99);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [5, 99], "Range should be equal to [5, 99]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//Destroy
		oRangeSlider.destroy();
		oRangeSlider = null;
		oModel.destroy();
		oModel = null;
	});

	QUnit.test("Range can be changed with progress bar when the current range is 1 step lower that max number of steps", function (assert) {

		var clock = sinon.useFakeTimers(),
			oRangeSlider = new RangeSlider({
			enableTickmarks: true,
			range: [0,9],
			min: 0,
			max: 10
		});

		oRangeSlider.placeAt(DOM_RENDER_LOCATION);

		sap.ui.getCore().applyChanges();

		var oEvent = {
			target: oRangeSlider.getDomRef("progress"),
			preventDefault: function () {
			},
			stopPropagation: function () {
			},
			setMarked: function () {
			},
			isMarked: function () {
				return false;
			},
			originalEvent: {
				type: "mousemove"
			},
			type: "mousemove",
			targetTouches: [
				{
					clientX: 305,
					pageX: 305
				}
			]
		};

		var oHandle1 = oRangeSlider.getDomRef("handle1"),
			oHandle2 = oRangeSlider.getDomRef("handle2");

		clock.tick(10);

		oRangeSlider._ontouchmove(9, [0, 9], [oHandle1, oHandle2], oEvent);

		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [1, 10], "Range should be equal to [1, 10]");

		oRangeSlider.destroy();
		oRangeSlider = null;
	});

	QUnit.module("Scale");

	QUnit.test("RangeSlider with custom scale, should fallback to default one, after the scale is destroyed", function(assert) {
		var oSlider, oDefaultScale,
			oScale = new ResponsiveScale({tickmarksBetweenLabels: 1});

		oSlider = new RangeSlider({
			enableTickmarks: true,
			scale: oScale
		});

		// arrange
		oSlider.placeAt(DOM_RENDER_LOCATION);

		assert.strictEqual(oScale.sId, oSlider._getUsedScale().sId, "The _getUsedScale function, should return the user defined scale.");

		oScale.destroy();
		sap.ui.getCore().applyChanges();
		oDefaultScale = oSlider.getAggregation('_defaultScale');

		// assert
		assert.ok(oDefaultScale, "The default scale should be set");
		assert.strictEqual(oDefaultScale.sId, oSlider._getUsedScale().sId, "The _getUsedScale function, should return the default scale.");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("RangeSlider with enabled tickmarks and not set scale, should remove the default one, after 'scale' aggregation is set", function(assert) {
		var oSlider, oDefaultScale,
			oScale = new ResponsiveScale({tickmarksBetweenLabels: 1});

		oSlider = new RangeSlider({
			enableTickmarks: true
		});

		// arrange
		oSlider.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		oDefaultScale = oSlider.getAggregation('_defaultScale');

		// assert
		assert.ok(oDefaultScale ,"The default scale should be set");
		assert.strictEqual(oDefaultScale.sId, oSlider._getUsedScale().sId, "The _getUsedScale function, should return the default scale.");

		// arrange
		oSlider.setAggregation('scale', oScale);
		sap.ui.getCore().applyChanges();
		oDefaultScale = oSlider.getAggregation('_defaultScale');

		// assert
		assert.notOk(oDefaultScale ,"The default scale, should not be present");
		assert.strictEqual(oScale.sId, oSlider._getUsedScale().sId, "The _getUsedScale function, should return the new scale.");

		// cleanup
		oSlider.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("RangeSlider with inputs as tooltip should add an aria", function(assert) {
		var clock = sinon.useFakeTimers(),
			sFirstHandleAriaId,
			sSecondHandleAriaId,
			sResourceBundleText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SLIDER_INPUT_TOOLTIP"),
			oSlider = new RangeSlider({
				showAdvancedTooltip: true,
				inputsAsTooltips: true
			});

		// arrange
		oSlider.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		sFirstHandleAriaId = oSlider.getDomRef("handle1").getAttribute("aria-describedby");
		sSecondHandleAriaId = oSlider.getDomRef("handle2").getAttribute("aria-describedby");

		// assert
		assert.strictEqual(sFirstHandleAriaId, sSecondHandleAriaId, "aria-describedby attributes should point to the same element");
		assert.strictEqual(sap.ui.getCore().byId(sFirstHandleAriaId).getText(), sResourceBundleText);
		assert.strictEqual(sap.ui.getCore().byId(sSecondHandleAriaId).getText(), sResourceBundleText);

		assert.ok(!oSlider.getDomRef("handle1").getAttribute("aria-controls"), 'The "aria-controls" should not be set, before the tooltip is rendered');
		assert.ok(!oSlider.getDomRef("handle2").getAttribute("aria-controls"), 'The "aria-controls" should not be set, before the tooltip is rendered');

		oSlider.focus();
		clock.tick(1);

		assert.ok(oSlider.getDomRef("handle1").getAttribute("aria-controls"), 'The "aria-controls" should be set');
		assert.ok(oSlider.getDomRef("handle2").getAttribute("aria-controls"), 'The "aria-controls" should be set');

		// cleanup
		oSlider.destroy();
		clock.restore();
	});

	QUnit.test("RangeSlider with custom scale should change handle title html attribute accordingly", function(assert) {
		var clock = sinon.useFakeTimers(),
			oSlider,
			oScale = new ResponsiveScale({tickmarksBetweenLabels: 1}),
			oHandleDomRef, oProgressHandle, oSecondHandleDomRef;

		oScale.getLabel = function (fCurValue, oSlider) {
			var monthList = ["Zero", "One", "2", "3"];

			return monthList[fCurValue];
		};

		oSlider = new RangeSlider({
			step: 1,
			min: 0,
			max: 3,
			range: [0,1],
			enableTickmarks: true,
			scale: oScale
		});

		// arrange
		oSlider.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();
		oHandleDomRef = oSlider.getDomRef("handle1");
		oSecondHandleDomRef = oSlider.getDomRef("handle2");
		oProgressHandle = oSlider.getDomRef("progress");

		// assert
		assert.strictEqual(oHandleDomRef.getAttribute("title"), "Zero", "The title should be Zero.");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuenow"), "0", "The aria-valuenow should be 0.");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuetext"), "Zero", "The aria-valuetext should be Zero.");
		assert.ok(!oHandleDomRef.getAttribute("aria-controls"), "aria-controls should not be present before the tooltip is in the DOM.");
		assert.strictEqual(oProgressHandle.getAttribute("aria-valuetext"), oSlider._oResourceBundle.getText('RANGE_SLIDER_RANGE_ANNOUNCEMENT', ["Zero", "One"]),
			"The aria-valuetext of the progress handle should be From Zero to One.");

		oSlider.setValue2(2);
		sap.ui.getCore().applyChanges();
		clock.tick(1000);

		assert.strictEqual(oSecondHandleDomRef.getAttribute("title"), "2", "The title should be 2.");
		assert.strictEqual(oSecondHandleDomRef.getAttribute("aria-valuenow"), "2", "The aria-valuenow should be 2, since the label is numeric.");
		assert.notOk(oSecondHandleDomRef.getAttribute("aria-valuetext"), "The aria-valuetext should not be defined.");
		assert.ok(!oSecondHandleDomRef.getAttribute("aria-controls"), "aria-controls should not be present before the tooltip is in the DOM.");

		// cleanup
		clock.restore();
		oSlider.destroy();
	});

	QUnit.test("RangeSlider with scale and tooltip should use the prioritisation of the labelling", function (assert) {
		var oSlider, oTooltip, oHandleDomRef, oSecondHandleDomRef, oProgressHandle,
			clock = sinon.useFakeTimers(),
			oScale = new ResponsiveScale({tickmarksBetweenLabels: 1});

		oScale.getLabel = function (fCurValue) {
			var monthList = ["Zero", "One", "2"];

			return monthList[fCurValue];
		};

		oTooltip = SliderTooltipBase.extend("sap.xx.TestTooltip", {
			renderer: function (oRm, oControl) {
				SliderTooltipBaseRenderer.render.apply({
					renderTooltipContent: function (oRm, oControl) {
						oRm.write("zzzz");
					}
				}, arguments);
			}
		});

		oTooltip.prototype.getLabel = function (fValue) {
			return "XXXXXXX-" + fValue;
		};

		oSlider = new RangeSlider({
			step: 1,
			min: 0,
			max: 2,
			enableTickmarks: true,
			showAdvancedTooltip: true,
			scale: oScale,
			customTooltips: [
				new oTooltip(),
				new oTooltip()
			]
		});

		// arrange
		oSlider.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();
		oHandleDomRef = oSlider.getDomRef("handle1");
		oSecondHandleDomRef = oSlider.getDomRef("handle2");
		oProgressHandle = oSlider.getDomRef("progress");

		// assert
		assert.ok(!oHandleDomRef.getAttribute("title"), "The title should be undefined if there's a tooltip.");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuenow"), "0", "The aria-valuenow should be 0.");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuetext"), "XXXXXXX-0", "The aria-valuetext should be XXXXXXX-0.");

		assert.ok(!oSecondHandleDomRef.getAttribute("title"), "The title should be undefined if there's a tooltip.");
		assert.strictEqual(oSecondHandleDomRef.getAttribute("aria-valuenow"), "2", "The aria-valuenow should be 0.");
		assert.strictEqual(oSecondHandleDomRef.getAttribute("aria-valuetext"), "XXXXXXX-2", "The aria-valuetext should be XXXXXXX-2.");
		assert.strictEqual(oProgressHandle.getAttribute("aria-valuetext"), "From XXXXXXX-0 to XXXXXXX-2", "The aria-valuetext should be 'From XXXXXXX-0 to XXXXXXX-2'.");

		// Act
		oSlider.setValue(1);
		sap.ui.getCore().applyChanges();
		clock.tick(1000);
		oHandleDomRef = oSlider.getDomRef("handle1");
		oSecondHandleDomRef = oSlider.getDomRef("handle2");
		oProgressHandle = oSlider.getDomRef("progress");

		// Assert
		assert.ok(!oHandleDomRef.getAttribute("title"), "The title should be undefined if there's a tooltip.");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuenow"), "1", "The aria-valuenow should be 1.");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuetext"), "XXXXXXX-1", "The aria-valuetext should be XXXXXXX-1.");

		assert.ok(!oSecondHandleDomRef.getAttribute("title"), "The title should be undefined if there's a tooltip.");
		assert.strictEqual(oSecondHandleDomRef.getAttribute("aria-valuenow"), "2", "The aria-valuenow should be 0.");
		assert.strictEqual(oSecondHandleDomRef.getAttribute("aria-valuetext"), "XXXXXXX-2", "The aria-valuetext should be XXXXXXX-2.");

		assert.strictEqual(oProgressHandle.getAttribute("aria-valuetext"), "From XXXXXXX-1 to XXXXXXX-2", "The aria-valuetext should be 'From XXXXXXX-1 to XXXXXXX-2'.");


		//Act
		oSlider.setShowAdvancedTooltip(false);
		sap.ui.getCore().applyChanges();
		clock.tick(1000);
		oHandleDomRef = oSlider.getDomRef("handle1");

		assert.strictEqual(oHandleDomRef.getAttribute("title"), "One", "The title should be One.");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuenow"), "1", "The aria-valuenow should be 1.");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuetext"), "One", "The aria-valuetext should be One.");

		// Cleanup
		oSlider.destroy();
	});

	QUnit.module("Tooltips", function (hooks) {
		hooks.before(function () {
			// dummy class
			SliderTooltipBase.extend("sap.xx.SliderTooltipCustom", {});
		});

		hooks.beforeEach(function () {
			this.oRangeSlider = new RangeSlider({
				showAdvancedTooltip: true
			});

			this.oRangeSlider.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		});

		hooks.afterEach(function () {
			this.oRangeSlider.destroy();
		});

		QUnit.test("Tooltips: Adding just one custom tooltip should fallback to default", function (assert) {
			var oTooltipContainer = this.oRangeSlider.getAggregation("_tooltipContainer"),
				oAssociatedTooltips;

			this.oRangeSlider.addCustomTooltip(new sap.xx.SliderTooltipCustom());
			sap.ui.getCore().applyChanges();

			oAssociatedTooltips = oTooltipContainer.getAssociatedTooltipsAsControls();

			assert.strictEqual(oAssociatedTooltips.length, 2, "Two tooltips should be associated with the TooltipContainer");
			assert.strictEqual(this.oRangeSlider.getCustomTooltips().length, 1, "One custom tooltips is provided");
			assert.strictEqual(oAssociatedTooltips[0], this.oRangeSlider.getAggregation("_defaultTooltips")[0], "The default tooltips should be associated with TooltipContainer");
			assert.strictEqual(oAssociatedTooltips[1], this.oRangeSlider.getAggregation("_defaultTooltips")[1], "The default tooltips should be associated with TooltipContainer");
		});

		QUnit.test("Tooltips: Adding more than two custom tooltip should take the first two to render", function (assert) {
			var oTooltipContainer = this.oRangeSlider.getAggregation("_tooltipContainer"),
				oAssociatedTooltips, aCustomTooltips;

			this.oRangeSlider.addCustomTooltip(new sap.xx.SliderTooltipCustom());
			this.oRangeSlider.addCustomTooltip(new sap.xx.SliderTooltipCustom());
			this.oRangeSlider.addCustomTooltip(new sap.xx.SliderTooltipCustom());
			sap.ui.getCore().applyChanges();

			oAssociatedTooltips = oTooltipContainer.getAssociatedTooltipsAsControls();
			aCustomTooltips = this.oRangeSlider.getCustomTooltips();

			assert.strictEqual(oAssociatedTooltips.length, 2, "The default tooltips should be associated with TooltipContainer");
			assert.strictEqual(this.oRangeSlider.getCustomTooltips().length, 3, "Three custom tooltips are provided");
			assert.strictEqual(oAssociatedTooltips[0], aCustomTooltips[0], "Custom tooltips should be associated with TooltipContainer");
			assert.strictEqual(oAssociatedTooltips[1], aCustomTooltips[1], "Custom tooltips should be associated with TooltipContainer");
			assert.notEqual(oAssociatedTooltips[2], aCustomTooltips[2], "Third Custom tooltip should not be associated with the TooltipContainer");
		});

		QUnit.test("Tooltips: Destroying Custom tooltip when 2 are available", function (assert) {
			var oFirstCustomTooltip = new sap.xx.SliderTooltipCustom(),
				oSecondCustomTooltip = new sap.xx.SliderTooltipCustom(),
				oSliderTooltipContainer = this.oRangeSlider.getAggregation("_tooltipContainer"),
				oAssociatedTooltips;

			this.oRangeSlider.addCustomTooltip(oFirstCustomTooltip);
			this.oRangeSlider.addCustomTooltip(oSecondCustomTooltip);
			sap.ui.getCore().applyChanges();

			// act
			oFirstCustomTooltip.destroy();
			sap.ui.getCore().applyChanges();

			oAssociatedTooltips = oSliderTooltipContainer.getAssociatedTooltipsAsControls();

			// assert
			assert.ok(true, "No exception have been thrown");
			assert.strictEqual(oAssociatedTooltips[0], this.oRangeSlider.getAggregation("_defaultTooltips")[0], "The default tooltips should be associated with TooltipContainer");
			assert.strictEqual(oAssociatedTooltips[1], this.oRangeSlider.getAggregation("_defaultTooltips")[1], "The default tooltips should be associated with TooltipContainer");

		});

		QUnit.test("Tooltips: Destroying Custom tooltip when more than 2 are available", function (assert) {
			var oFirstCustomTooltip = new sap.xx.SliderTooltipCustom(),
				oSecondCustomTooltip = new sap.xx.SliderTooltipCustom(),
				oThirdCustomTooltip = new sap.xx.SliderTooltipCustom(),
				oSliderTooltipContainer = this.oRangeSlider.getAggregation("_tooltipContainer"),
				oAssociatedTooltips;

			this.oRangeSlider.addCustomTooltip(oFirstCustomTooltip);
			this.oRangeSlider.addCustomTooltip(oSecondCustomTooltip);
			this.oRangeSlider.addCustomTooltip(oThirdCustomTooltip);
			sap.ui.getCore().applyChanges();

			// act
			oThirdCustomTooltip.destroy();
			sap.ui.getCore().applyChanges();

			oAssociatedTooltips = oSliderTooltipContainer.getAssociatedTooltipsAsControls();

			// assert
			assert.strictEqual(oAssociatedTooltips[0], oFirstCustomTooltip, "The first custom tooltip should be associated with TooltipContainer");
			assert.strictEqual(oAssociatedTooltips[1], oSecondCustomTooltip, "The second tooltip should be associated with TooltipContainer");
		});

		QUnit.test("Tooltips: Destroying Custom tooltip when more than 2 are available", function (assert) {
			var oFirstCustomTooltip = new sap.xx.SliderTooltipCustom(),
				oSecondCustomTooltip = new sap.xx.SliderTooltipCustom(),
				oThirdCustomTooltip = new sap.xx.SliderTooltipCustom(),
				oSliderTooltipContainer = this.oRangeSlider.getAggregation("_tooltipContainer"),
				oAssociatedTooltips;

			this.oRangeSlider.addCustomTooltip(oFirstCustomTooltip);
			this.oRangeSlider.addCustomTooltip(oSecondCustomTooltip);
			this.oRangeSlider.addCustomTooltip(oThirdCustomTooltip);
			sap.ui.getCore().applyChanges();

			// act
			oSecondCustomTooltip.destroy();
			sap.ui.getCore().applyChanges();

			oAssociatedTooltips = oSliderTooltipContainer.getAssociatedTooltipsAsControls();

			// assert
			assert.strictEqual(oAssociatedTooltips[0], oFirstCustomTooltip, "The first tooltip should be associated with TooltipContainer");
			assert.strictEqual(oAssociatedTooltips[1], oThirdCustomTooltip, "The third tooltip should be associated with TooltipContainer");
		});

		QUnit.test("Tooltips: Rendering when advanced tooltips are not used", function (assert) {
			// setup
			var oRangeSlider = new RangeSlider({
				showAdvancedTooltip: false,
				inputsAsTooltips: true
			});

			oRangeSlider.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

			// assert
			assert.ok(oRangeSlider.getDomRef(), true, "The rangeslider was successfully rendered.");

			// clean up
			oRangeSlider.destroy();
		});

		QUnit.test("Tooltips: Setting a value when TooltipContainer is not visible", function (assert) {
			this.oRangeSlider.setValue(4);
			sap.ui.getCore().applyChanges();

			assert.ok(true, "should not throw an error");
		});

		QUnit.test("Firing event keydown === SPACE should prevent the page to scroll down", function(assert) {

			// system under test
			var oRangeSlider = new RangeSlider();

			// arrange
			var preventDefaultSpy = this.spy(),
				fnFakeEvent = {
					preventDefault: preventDefaultSpy,
					keyCode: KeyCodes.SPACE
				};
			oRangeSlider.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

			// act
			oRangeSlider.onkeydown(fnFakeEvent);

			// assert
			assert.ok(preventDefaultSpy.calledOnce, "Prevent default should be called once.");

			// cleanup
			oRangeSlider.destroy();
		});
	});
});