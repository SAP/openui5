(function () {
	"use strict";
	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("HTML", {
		setup: function () {
			this.rangeSlider = new sap.m.RangeSlider();

			this.rangeSlider.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
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

	QUnit.test("Handles' Tooltips", function (assert) {
		assert.strictEqual(jQuery(".sapMSliderHandleTooltip").length, 2, "There should be two tooltips.");

		assert.strictEqual(jQuery("[id$='-LeftTooltip']").length, 1, "There should be only one handle tooltip rendered for handle1.");
		assert.strictEqual(jQuery("[id$='-RightTooltip']").length, 1, "There should be only one handle tooltip rendered for handle2.");
	});

	QUnit.test("Handles' Tooltips' width percent ", function (assert) {
		var oldPercent = this.rangeSlider._fTooltipHalfWidthPercent;

		this.rangeSlider.setMin(-1000);
		this.rangeSlider.setMax(0);
		sap.ui.getCore().applyChanges();

		assert.ok(oldPercent < this.rangeSlider._fTooltipHalfWidthPercent, "The new calculated percent should be bigger than the old one");
	});

	QUnit.test("RangeSlider's Labels", function (assert) {
		assert.ok(jQuery(".sapMSliderLabels"), "The labels container is rendered.");
		assert.strictEqual(jQuery(".sapMSliderLabel").length, 2, "There are two labels rendered.");
		assert.strictEqual(jQuery(".sapMSliderLabel").length, 2, "There are two labels rendered.");
		assert.equal(this.rangeSlider.$().find(".sapMSliderLabel:eq(0)").html(), this.rangeSlider.getMin(), "The start label shows the min value");
		assert.equal(this.rangeSlider.$().find(".sapMSliderLabel:eq(1)").html(), this.rangeSlider.getMax(), "The end label shows the max value");
	});

	QUnit.test("Overlapping handles", function (assert) {
		this.rangeSlider.setRange([50, 50]);
		sap.ui.getCore().applyChanges();

		assert.ok(this.rangeSlider.$().find(".sapMSliderHandle"), "The handles should be added an Overlap class");
		assert.strictEqual(this.rangeSlider.$().find(".sapMSliderHandle").length, 2, "Both handles should be affected");
	});

	QUnit.module("API", {
		setup: function () {
			this.rangeSlider = new sap.m.RangeSlider();

			this.rangeSlider.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
			this.rangeSlider.destroy();
			this.rangeSlider = null;
		}
	});

	QUnit.test("Advanced tooltips", function (assert) {
		// Setup
		var oRangeSlider = new sap.m.RangeSlider({
			inputsAsTooltips: true,
			showAdvancedTooltip: true
		}).placeAt(DOM_RENDER_LOCATION);

		// Assert
		assert.ok(true, "No exception thrown. So, everything is fine.");

		// Cleanup
		oRangeSlider.destroy();
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
		sap.ui.getCore().applyChanges();

		aRange = this.rangeSlider.getRange();

		assert.strictEqual(aRange[0], newRange[0], "The first value of the range should be set to " + newRange[0]);
		assert.strictEqual(aRange[1], newRange[1], "The second value of the range should be set to " + newRange[1]);

		assert.strictEqual(parseInt(this.rangeSlider.$("LeftTooltip").text()), newRange[0], "The tooltip1's value should be changed to the left handle's value of " + newRange[0]);
		assert.strictEqual(parseInt(this.rangeSlider.$("RightTooltip").text()), newRange[1], "The tooltip2's value should be changed to the right handle's value of " + newRange[1])
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

	QUnit.test("Invalid range starting value of -20 (where min is 0)", function (assert) {
		this.rangeSlider.setRange([-20, 50]);
		sap.ui.getCore().applyChanges();

		var aRange = this.rangeSlider.getRange();

		assert.strictEqual(aRange[0], this.rangeSlider.getMin(), "The starting value of the range should be set to 0");
		assert.strictEqual(aRange[1], 50, "The end value of the range should be set to 50");
	});

	QUnit.test("Invalid range ending value of 150 (where max is 100)", function (assert) {
		this.rangeSlider.setRange([20, 150]);
		sap.ui.getCore().applyChanges();

		var aRange = this.rangeSlider.getRange();

		assert.strictEqual(aRange[0], 20, "The starting value of the range should be set to 20");
		assert.strictEqual(aRange[1], this.rangeSlider.getMax(), "The end value of the range should be set to 100");
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

	QUnit.test("setValue()", function () {
		var that = this.rangeSlider.setValue();
		assert.ok(that === this.rangeSlider, "The function should not do anything and return this for chaining");
	});

	QUnit.test("_calculateHandlePosition()", function () {
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

	QUnit.test("_calculateHandlePosition() with even step", function () {
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

	QUnit.test("_calculateHandlePosition() with odd step", function () {
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

	QUnit.test("_calculateHandlePosition() with decimal step", function () {
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

	QUnit.test("Calculate movement offset", function (assert) {
		var aRange = [4, 27],
			iStep = 5,
			oSlider = new sap.m.RangeSlider("RangeSlider6", {
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
		var oSlider = new sap.m.RangeSlider().placeAt(DOM_RENDER_LOCATION);
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
			oSlider = new sap.m.RangeSlider().placeAt(DOM_RENDER_LOCATION),
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
		var oSlider = new sap.m.RangeSlider().placeAt(DOM_RENDER_LOCATION),
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
			var oSlider = new sap.m.RangeSlider(oSliderConfig).placeAt(DOM_RENDER_LOCATION);
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
		}

		check({value: 500, value2: 1000, min: 0, max: 2000});
		check({value: 1000, value2: 500, min: 0, max: 2000});
	});

	QUnit.test("The values of value and value2 properties should be adjusted correctly when they are not in the boundaries of min and max values", function (assert) {
		var check = function (oSliderConfig) {
			var oSlider = new sap.m.RangeSlider(oSliderConfig).placeAt(DOM_RENDER_LOCATION);
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
		}

		check({value: 100, max: 500, value2: 600, min: 200});
		check({value: 100, min: 200, max: 2000,value2: 5000});
	});

	QUnit.test("The order of the arguments should not matter when setting the properties min/max, range", function (assert) {
		var check = function (oSliderConfig) {
			var oSlider = new sap.m.RangeSlider(oSliderConfig).placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

			//Assert
			assert.strictEqual(oSlider.getValue(), oSlider.getRange()[0], "'Value' property value should be equal to the start of the range");
			assert.strictEqual(oSlider.getValue2(), oSlider.getRange()[1], "'Value2' property value should be equal to the end of the range");
			assert.strictEqual(oSlider.getRange()[0], oSliderConfig.range[0], "'Range' property start value should be the adjusted correctly");
			assert.strictEqual(oSlider.getRange()[1], oSliderConfig.range[1], "'Range' property end value should be the adjusted correctly");

			//Cleanup
			oSlider.destroy();
			oSlider = null;
		}

		check({range: [500, 1000], min: -100, max: 2000});
		check({min: -100, max: 2000, range: [500, 1000]});
	});

	QUnit.test("The values of the range property should be adjusted correctly when they are not in the boundaries of min and max values", function (assert) {
		var check = function (oSliderConfig) {
			var oSlider = new sap.m.RangeSlider(oSliderConfig).placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

			//Assert
			assert.strictEqual(oSlider.getValue(), oSlider.getRange()[0], "'Value' property value should be equal to the start of the range");
			assert.strictEqual(oSlider.getValue2(), oSlider.getRange()[1], "'Value2' property value should be equal to the end of the range");
			assert.strictEqual(oSlider.getRange()[0], oSliderConfig.min, "'Range' property start value should be the adjusted correctly");
			assert.strictEqual(oSlider.getRange()[1], oSliderConfig.max, "'Range' property end value should be the adjusted correctly");

			//Cleanup
			oSlider.destroy();
			oSlider = null;
		}

		check({range: [-200, 3000], min: -100, max: 2000});
		check({min: -100, max: 2000, range: [-500, 3000]});
	});

	QUnit.test("Swap tooltips when values are swapped.", function (assert) {
		//Setup
		var oRangeSlider = new sap.m.RangeSlider({
			showAdvancedTooltip: false,
			showHandleTooltip: false,
			enableTickmarks: true,
			range: [8, 2],
			min: 2,
			max: 10,
			step: 1
		}).placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oRangeSlider.getDomRef("LeftTooltip").innerHTML, "2");
		assert.strictEqual(oRangeSlider.getDomRef("RightTooltip").innerHTML, "8");

		//Cleanup
		oRangeSlider.destroy();
	});

	QUnit.module("SAP KH", {
		setup: function () {
			this.oRangeSlider = new sap.m.RangeSlider({range: [20, 30]});
			this.oRangeSlider.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();

			this.oEvent = {
				target: this.oRangeSlider._mHandleTooltip.start.handle,
				preventDefault: function () {
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
		teardown: function () {
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
		this.testSAPEvents(assert, "onsaphome");
	});

	QUnit.test("KH: Global ALT + Arrow", function (assert) {
		var oMockEvent = {
				target: {type: ""},
				altKey: true,
				preventDefault: function () {},
				setMarked: function () {}
			},
			oRangeSlider = new sap.m.RangeSlider().placeAt(DOM_RENDER_LOCATION),
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
			oRangeSlider = new sap.m.RangeSlider({range: aRange, min: 0, max: 100, liveChange: fnLiveChange}).placeAt(DOM_RENDER_LOCATION);

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
			oRangeSlider = new sap.m.RangeSlider({range: aRange, min: 0, max: 100}).placeAt(DOM_RENDER_LOCATION);

		sap.ui.getCore().applyChanges();

		assert.deepEqual(oRangeSlider.getRange(), aRange, "Range should equal to the initial set value: " + aRange);
		assert.deepEqual(oRangeSlider.getRange(), oRangeSlider.getRange(), "Ranges should be equal");
		assert.ok(oRangeSlider.getRange() !== oRangeSlider.getRange(), "Ranges should not be the same instance");

		oRangeSlider.destroy();
	});

	QUnit.module("Integrations:");

	QUnit.test("Model change from the outside", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new sap.ui.model.json.JSONModel(oData),
			oRangeSlider = new sap.m.RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}"});

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
			oModel = new sap.ui.model.json.JSONModel(oData),
			oRangeSlider = new sap.m.RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}"});

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
		var oRangeSlider = new sap.m.RangeSlider({value: 12, value2: 88, min: 0, max: 90});
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
			oModel = new sap.ui.model.json.JSONModel(oData),
			oRangeSlider = new sap.m.RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}"});

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
			oModel = new sap.ui.model.json.JSONModel(oData),
			oRangeSlider = new sap.m.RangeSlider({min: "{/min}", max: "{/max}", value: "{/range/0}", value2: "{/range/1}", range: "{/range}"});

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
			oModel = new sap.ui.model.json.JSONModel(oData),
			oRangeSlider = new sap.m.RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}", value: "{/range/0}", value2: "{/range/1}"});

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
}());