/*global QUnit */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/CalendarLegendRenderer",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/library",
	"sap/ui/unified/DateRange",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/DateTypeRange",
	"sap/base/Log",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/jquery"
], function(Element, CalendarLegend, nextUIUpdate, CalendarLegendRenderer, CalendarLegendItem, unifiedLibrary, DateRange, JSONModel, Calendar, DateTypeRange, Log, DateFormat, XMLView, jQuery) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var StandardCalendarLegendItem = unifiedLibrary.StandardCalendarLegendItem;

	var oFormatYyyymmdd = DateFormat.getInstance({
		pattern: "yyyyMMdd"
	});

	var aSpecialDays = [["20140801", undefined, "Type01", 1], ["20140802", undefined, "Type02", 2], ["20140803", undefined, "Type03", 3], ["20140804", undefined, "Type04", 4], ["20140805", undefined, "Type05", 5], ["20140806", undefined, "Type06", 6], ["20140807", undefined, "Type07", 7], ["20140808", undefined, "Type08", 8], ["20140809", undefined, "Type09", 9], ["20140810", undefined, "Type10", 10]];

	var oCal = new Calendar("Cal", {
		selectedDates: [new DateRange({startDate: oFormatYyyymmdd.parse("20140820")})],
		select: function (oEvent) {
			Log.info("Select");
		},
		cancel: function (oEvent) {
			Log.info("Cancel");
		}
	});

	//add specialDays
	for (var i = 0; i < aSpecialDays.length; i++) {
		var aSpecialDay = aSpecialDays[i];
		var sType = "";
		if (aSpecialDay[3] < 10) {
			sType = "Type0" + aSpecialDay[3];
		} else {
			sType = "Type" + aSpecialDay[3];
		}
		Element.getElementById("Cal").addSpecialDate(new DateTypeRange({
			startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
			endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
			type: sType,
			tooltip: aSpecialDay[2]
		}));
	}

	oCal.placeAt("content");

	QUnit.module("API");

	QUnit.test("getStandardItems initial default value", function (assert) {
		//Act
		var oPCLegend = new CalendarLegend();
		//Assert
		assert.deepEqual(oPCLegend.getStandardItems(), ['Today', 'Selected', 'WorkingDay', 'NonWorkingDay'], "Default value");

		//Cleanup
		oPCLegend.destroy();
	});

	QUnit.test("setStandardItems with undefined/null", function (assert) {
		//Prepare
		var oPCLegend = new CalendarLegend();

		//Act
		oPCLegend.setStandardItems();

		//Assert
		assert.deepEqual(oPCLegend.getStandardItems(), ['Today', 'Selected', 'WorkingDay', 'NonWorkingDay'], "Should return the default value");

		//Cleanup
		oPCLegend.destroy();
	});

	QUnit.test("setStandardItems with wrong type", function (assert) {
		//Prepare
		var oPCLegend = new CalendarLegend();

		//Act && Assert
		assert.throws(function () {
				oPCLegend.setStandardItems('Tomorrow');
			}, new Error("Invalid value 'Tomorrow'. Property standardItems must contain values from sap.ui.unified.StandardCalendarLegendItem."),
			"Setting value not part of the enumeration sap.ui.unified.StandardCalendarLegendItem should throw error");//'Tomorrow' is invalid.

		//Cleanup
		oPCLegend.destroy();
	});

	QUnit.test("setStandardItems", function (assert) {
		//Prepare
		var oPCLegend = new CalendarLegend(),
			aStandardItems = [StandardCalendarLegendItem.Today, StandardCalendarLegendItem.Selected];

		//Act
		oPCLegend.setStandardItems(aStandardItems);

		//Assert
		assert.deepEqual(oPCLegend.getStandardItems(), aStandardItems, "Should return the same items");

		//Cleanup
		oPCLegend.destroy();
	});

	QUnit.test("standardItems=\"\" in XML View", function (assert) {
		//Act
		var sView =
			'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.unified" xmlns:l="sap.ui.layout">\
				<CalendarLegend id="CalendarLegend"\
					standardItems="">\
					<items>\
						<CalendarLegendItem text="Calendar section Item 1" type="Type01" tooltip="Tooltip for Item 1" />\
					</items>\
				</CalendarLegend>\
			</mvc:View>';

		return XMLView.create({
			definition: sView
		}).then(function(myView) {
			var oCalLegend = myView.byId("CalendarLegend");

			//Assert
			assert.deepEqual(oCalLegend.getStandardItems(), [], "Should return the same items");
			assert.equal(oCalLegend.getItems().length, 1, "Should has 1 Calendar item");

			//Cleanup
			myView.destroy();
		});
	});

	QUnit.test("standardItems with DataBinding in XML View", function (assert) {
		//Act
		var sView =
		'<mvc:View\
			xmlns:core="sap.ui.core"\
			xmlns:mvc="sap.ui.core.mvc"\
			xmlns="sap.ui.unified"\
			xmlns:l="sap.ui.layout">\
			<CalendarLegend id="CalendarLegend"\
				standardItems="{/standardItems}">\
			</CalendarLegend>\
		</mvc:View>';

		return XMLView.create({
			definition: sView
		}).then(function(myView) {
			var oCalLegend = myView.byId("CalendarLegend");

			myView.setModel(new JSONModel({
				"standardItems": [StandardCalendarLegendItem.NonWorkingDay, StandardCalendarLegendItem.Selected]
			}));

			//Assert
			assert.deepEqual(oCalLegend.getStandardItems(), [StandardCalendarLegendItem.NonWorkingDay,
				StandardCalendarLegendItem.Selected], "Should return the same items");

			//Cleanup
			myView.destroy();
		});
	});

	QUnit.module("Rendering", {
		beforeEach: async function () {
			this.oLegend = new CalendarLegend("Leg", {}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oLegend.destroy();
			this.oLegend = null;
		}
	});

	QUnit.test("Standard categories", function (assert) {
		var aLegendItems = this.oLegend.$().find(".sapUiUnifiedLegendItems").children();
		assert.equal(aLegendItems.length, 4, "4 categories rendered");
	});

	QUnit.test("Custom categories", async function (assert) {

		var oLeg2 = new CalendarLegend("Leg2", {
			items: [new CalendarLegendItem("L2-I0", {text: "Type10", type: CalendarDayType.Type10, tooltip: "Type 10"}),
				new CalendarLegendItem("L2-I1", {text: "Type09", type: CalendarDayType.Type09, tooltip: "Type 9"}),
				new CalendarLegendItem("L2-I2", {text: "Type08", type: CalendarDayType.Type08, tooltip: "Type 8"}),
				new CalendarLegendItem("L2-I3", {text: "no type 1", tooltip: "no type 1"}),
				new CalendarLegendItem("L2-I4", {text: "Type07", type: CalendarDayType.Type07, tooltip: "Type 7"}),
				new CalendarLegendItem("L2-I5", {text: "no type 2", tooltip: "no type 2"})
			]
		}).placeAt("qunit-fixture");
		await nextUIUpdate();

		var aLegendItems = this.oLegend.$().find(".sapUiUnifiedLegendItems").children();
		assert.equal(aLegendItems.length, 4, "4 categories rendered");

		var i = 0;
		for (i; i < 9; i++) {
			this.oLegend.addItem(new CalendarLegendItem("L1-I" + i, {
				text: "Placeholder 0" + (i + 1)
			}));
		}
		this.oLegend.addItem(new CalendarLegendItem("L1-I" + i, {
			text: "Placeholder " + (i + 1)
		}));

		await nextUIUpdate();

		aLegendItems = this.oLegend.$().find(".sapUiUnifiedLegendItems").children();
		assert.equal(aLegendItems.length, 14, "14 categories rendered");

		assert.ok(jQuery("#L1-I0").hasClass("sapUiCalLegDayType01"), "Legend1: 1. item has type 01");
		assert.ok(jQuery("#L1-I1").hasClass("sapUiCalLegDayType02"), "Legend1: 2. item has type 02");

		assert.ok(jQuery("#L2-I0").hasClass("sapUiCalLegDayType10"), "Legend2: 1. item has type 10");
		assert.ok(jQuery("#L2-I1").hasClass("sapUiCalLegDayType09"), "Legend2: 2. item has type 09");
		assert.ok(jQuery("#L2-I2").hasClass("sapUiCalLegDayType08"), "Legend2: 3. item has type 08");
		assert.ok(jQuery("#L2-I3").hasClass("sapUiCalLegDayType01"), "Legend2: 4. item has type 01");
		assert.ok(jQuery("#L2-I4").hasClass("sapUiCalLegDayType07"), "Legend2: 5. item has type 07");
		assert.ok(jQuery("#L2-I5").hasClass("sapUiCalLegDayType02"), "Legend2: 6. item has type 02");

		oLeg2.destroy();
	});

	function _getCssColorProperty(oJQuerySet, sCssPropertyName) {
		return /rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/.exec(oJQuerySet.css(sCssPropertyName));
	}

	function _checkColor(oExtractedRGB, oExpectedRGB, sLabel, assert) {
		assert.equal(oExtractedRGB[1], oExpectedRGB.R, sLabel + " (RED)");
		assert.equal(oExtractedRGB[2], oExpectedRGB.G, sLabel + " (GREEN)");
		assert.equal(oExtractedRGB[3], oExpectedRGB.B, sLabel + " (BLUE)");
	}

	QUnit.test("Custom colors", async function (assert) {

		this.oLegend.addItem(new CalendarLegendItem("L1-I0", {
			text: "custom color 1",
			tooltip: "custom color 1", color: "#FF00FF"
		}));
		this.oLegend.addItem(new CalendarLegendItem("L1-I1", {
			text: "custom color 2",
			tooltip: "custom color 2", color: "#FF0000"
		}));
		await nextUIUpdate();

		var oCustomColorIfL4I6 = _getCssColorProperty(jQuery("#L1-I0 .sapUiUnifiedLegendSquareColor"), "background-color");
		var oCustomColorIfL4I7 = _getCssColorProperty(jQuery("#L1-I1 .sapUiUnifiedLegendSquareColor"), "background-color");
		_checkColor(oCustomColorIfL4I6, {
			R: 255,
			G: 0,
			B: 255
		}, "Legend1: custom color 1 item has the right color", assert);
		_checkColor(oCustomColorIfL4I7, {R: 255, G: 0, B: 0}, "Legend1: custom color 2 item has the right color", assert);
	});

	QUnit.test("Combination with Calendar", async function (assert) {
		var specialDates = oCal.getSpecialDates();
		for (var i = 0; i < specialDates.length; i++) {
			this.oLegend.addItem(new CalendarLegendItem({
				text: specialDates[i].getTooltip()
			}));
		}
		await nextUIUpdate();

		var $Leg = this.oLegend.$().find(".sapUiUnifiedLegendItems").children();

		for (var i = 1; i < 9; i++) {
			//compare specialDates of Calendar
			assert.ok(jQuery("#Cal--Month0-2014080" + i).hasClass("sapUiCalItemType0" + i), "2014080" + i + " is special day of Type0" + i);
			//with categories in CalendarLegend //skipping standard categories
			assert.ok(($Leg[i + 3].textContent == "Type0" + i), "Type0" + i + " is present in Legend");
			assert.equal($Leg[i + 3].textContent, specialDates[i - 1].getTooltip(), "Type0" + i + " matches");
		}
		//compare specialDates of Calendar
		assert.ok(jQuery("#Cal--Month0-20140810").hasClass("sapUiCalItemType10"), "201408010 is special day of Type10");
		//with categories in CalendarLegend //skipping standard categories
		assert.ok(($Leg[13].textContent == "Type10"), "Type10 is present in Legend");
		assert.equal($Leg[13].textContent, specialDates[9].getTooltip(), "Type10 matches");
	});

	QUnit.module("items", {
		beforeEach: function () {
			this.oLegend = new CalendarLegend({
				items: [
					new CalendarLegendItem({text: "1 none", type: CalendarDayType.None}),
					new CalendarLegendItem({text: "1 without type"}),
					new CalendarLegendItem({text: "2 none", type: CalendarDayType.None}),
					new CalendarLegendItem({text: "3 none", type: CalendarDayType.None}),
					new CalendarLegendItem({text: "2 without type"}),
					new CalendarLegendItem({text: "Type01", type: CalendarDayType.Type01}),
					new CalendarLegendItem({text: "Type02", type: CalendarDayType.Type02}),
					new CalendarLegendItem({text: "Type03", type: CalendarDayType.Type03}),
					new CalendarLegendItem({text: "Type05", type: CalendarDayType.Type05}),
					new CalendarLegendItem({text: "Type07", type: CalendarDayType.Type07}),
					new CalendarLegendItem({text: "Type08", type: CalendarDayType.Type08}),
					new CalendarLegendItem({text: "Type09", type: CalendarDayType.Type09}),
					new CalendarLegendItem({text: "Type10", type: CalendarDayType.Type10})
				]
			});
		},
		afterEach: function () {
			this.oLegend.destroy();
			this.oLegend = null;
		}
	});

	QUnit.test("_getItemType", function (assert) {
		var aLegendItems = this.oLegend.getItems();

		assert.equal(this.oLegend._getItemType(aLegendItems[0], aLegendItems), "Type04", 'item has the correct type');
		assert.equal(this.oLegend._getItemType(aLegendItems[1], aLegendItems), "Type06", 'item has the correct type');
		assert.equal(this.oLegend._getItemType(aLegendItems[2], aLegendItems), "Type11", 'item has the correct type');
	});

	QUnit.test("_getItemByType", function (assert) {
		var aLegendItems = this.oLegend.getItems();

		assert.equal(this.oLegend._getItemByType("Type12"), aLegendItems[3], 'item is correct');
		assert.equal(this.oLegend._getItemByType("Type09"), aLegendItems[11], 'item is correct');
		assert.equal(this.oLegend._getItemByType("Type06"), aLegendItems[1], 'item is correct');
	});

	QUnit.test("_getUnusedItemTypes", function (assert) {
		assert.equal(this.oLegend._getUnusedItemTypes(this.oLegend.getItems())[0], "Type04", "unused item types are correct");
		assert.equal(this.oLegend._getUnusedItemTypes(this.oLegend.getItems())[1], "Type06", "unused item types are correct");
	});

	QUnit.test("getTypeAriaText", function (assert) {
		var oInvisibleText = CalendarLegendRenderer.getTypeAriaText("Type03");

		assert.ok(oInvisibleText, "there is a label created");
		assert.equal(CalendarLegendRenderer.getTypeAriaText("Type03").getId(), oInvisibleText.getId(), "the label is static");
		assert.ok(oInvisibleText.getDomRef(), "the label is in the dom");
	});

	QUnit.test("CalendarLegendRenderer.addCalendarTypeAccInfo", function (assert) {
		//Prepare
		var mAccProps = {},
			oLegendType01Type02 = new CalendarLegend({
				items: [
					new CalendarLegendItem({type: CalendarDayType.Type01, text: "Day off"}),
					new CalendarLegendItem({type: CalendarDayType.Type02, text: "On Duty"})
				]
			});


		//Act
		CalendarLegendRenderer.addCalendarTypeAccInfo(mAccProps, CalendarDayType.Type01, oLegendType01Type02);
		//Assert
		assert.equal(mAccProps["label"], "Day off", "When the given type matches legend item's, type 'label' is correct");
		assert.equal(mAccProps["describedby"], undefined, "When the given type matches legend item's type, 'describedby' is correct");

		//Prepare
		mAccProps = {"label": "Day off", "describedby": "__text999"};

		//Act
		CalendarLegendRenderer.addCalendarTypeAccInfo(mAccProps, CalendarDayType.Type02, oLegendType01Type02);
		//Assert
		assert.equal(mAccProps["label"], "Day off; On Duty", "When the given type matches legend item's, type 'label' is correctly accumulated");
		assert.equal(mAccProps["describedby"], "__text999", "When the given type matches legend item's, type 'describedby' is correctly accumulated");

		//Prepare
		mAccProps = {};
		//Act
		CalendarLegendRenderer.addCalendarTypeAccInfo(mAccProps, CalendarDayType.Type03, oLegendType01Type02);
		//Assert
		assert.equal(mAccProps["label"], undefined, "When the given type does not match legend item's, type 'label' is correct");
		assert.equal(mAccProps["describedby"], CalendarLegendRenderer.getTypeAriaText(CalendarDayType.Type03).getId(),
			"When the given type does not match legend item's type, 'describedby' is correct");

	});

	QUnit.module("Calendar Legend Navigation", {
		beforeEach: async function () {
			var aLegendTypes = [],
				aSpecialDay,
				sType,
				oSpecialDate,
				i,
				aSpecialDays = [
				["20140801", undefined, "Placeholder01", 1],
				["20140821", undefined, "Placeholder01", 1],
				["20140802", undefined, "Placeholder02", 2],
				["20140803", undefined, "Placeholder02", 2],
				["20140804", undefined, "Placeholder03", 3],
				["20140814", undefined, "Placeholder03", 3],
				["20140901", undefined, "Placeholder01", 1],
				["20140902", undefined, "Placeholder02", 2],
				["20140924", undefined, "Placeholder03", 3]
			];

			this.oLegend = new CalendarLegend();

			this.oCalendar = new Calendar({
				selectedDates: [new DateRange({startDate: oFormatYyyymmdd.parse("20140820")})],
				months: 2,
				legend: this.oLegend
			});

			for (i = 0; i < aSpecialDays.length; i++) {
				aSpecialDay = aSpecialDays[i];
				sType = "";
				if (aSpecialDay[3] < 10) {
					sType = "Type0" + aSpecialDay[3];
				} else {
					sType = "Type" + aSpecialDay[3];
				}
				oSpecialDate = new DateTypeRange({
					startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
					endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
					type: sType,
					tooltip: aSpecialDay[2]
				});
				this.oCalendar.addSpecialDate(oSpecialDate);
				if (aLegendTypes.indexOf(sType) === -1) {
					this.oLegend.addItem(new CalendarLegendItem({
						text: aSpecialDay[2],
						type: sType
					}));
					aLegendTypes.push(sType);
				}
			}

			this.oCalendar.placeAt("content");
			this.oLegend.placeAt("content");
			await nextUIUpdate();

		},
		afterEach: function () {
			this.oLegend.destroy();
			this.oLegend = null;
			this.oCalendar.destroy();
			this.oCalendar = null;
		}
	});

	QUnit.test("Calendar Legend items are focusable", function (assert) {
		var	aStandardItems = this.oLegend.getAggregation("_standardItems"),
			aLegendItems = this.oLegend.getItems();

		// Act
		aStandardItems[0].focus();

		// Assert
		assert.equal(document.activeElement.id, aStandardItems[0].getId(), "the first standard calendar legend item is focused");

		// Act
		aLegendItems[0].focus();

		// Assert
		assert.equal(document.activeElement.id, aLegendItems[0].getId(), "the first calendar legend item is focused");
	});

	QUnit.test("Filtering special dates in calendar", async function (assert) {
		var aLegendItems = this.oLegend.getItems(),
			aStandardItems = this.oLegend.getAggregation("_standardItems"),
			aMonths = this.oCalendar.getAggregation("month");

		// Assert (no calendar legend items are focused and no filtered special day types)
		assert.notOk(document.activeElement.classList.contains(".sapUiUnifiedLegendItem"), "there are no calendar legend items focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 2, "the first month in calendar shows 2 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 1, "the second month in calendar shows 1 special date from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 2, "the first month in calendar shows 2 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 1, "the second month in calendar shows 1 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 2, "the first month in calendar shows 2 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 1, "the second month in calendar shows 1 special date from the third calendar legend type");

		// Act (focus first standard calendar legend item)
		aStandardItems[0].focus();
		await nextUIUpdate();

		// Assert (no filtered special day types)
		assert.strictEqual(document.activeElement.id, aStandardItems[0].getId(), "the first standard legend item is focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 2, "the first month in calendar shows 2 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 1, "the second month in calendar shows 1 special date from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 2, "the first month in calendar shows 2 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 1, "the second month in calendar shows 1 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 2, "the first month in calendar shows 2 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 1, "the second month in calendar shows 1 special date from the third calendar legend type");

		// Act (focus first calendar legend item)
		aLegendItems[0].focus();
		await nextUIUpdate();

		// Assert (filter first special day type)
		assert.strictEqual(document.activeElement.id, aLegendItems[0].getId(), "the first calendar legend item is focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 2, "the first month in calendar shows 2 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 1, "the second month in calendar shows 1 special date from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 0, "the first month in calendar shows 0 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 0, "the second month in calendar shows 0 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 0, "the first month in calendar shows 0 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 0, "the second month in calendar shows 0 special date from the third calendar legend type");

		// Act (focus the calendar)
		this.oCalendar.focus();
		await nextUIUpdate();

		// Assert (again no filtered special day types)
		assert.notOk(document.activeElement.classList.contains(".sapUiUnifiedLegendItem"), "there are no calendar legend items focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 2, "the first month in calendar shows 2 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 1, "the second month in calendar shows 1 special date from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 2, "the first month in calendar shows 2 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 1, "the second month in calendar shows 1 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 2, "the first month in calendar shows 2 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 1, "the second month in calendar shows 1 special date from the third calendar legend type");
	});

	QUnit.test("Filtering special dates with color in calendar", async function (assert) {
		const aLegendItems = this.oLegend.getItems();
		const aStandardItems = this.oLegend.getAggregation("_standardItems");
		const aMonths = this.oCalendar.getAggregation("month");
		const oColor = {};
		aLegendItems.forEach((oItem, iIndex) => {
				if (oItem.getType() === CalendarDayType.None || oItem.getType() === CalendarDayType.NonWorking || oItem.getType() === CalendarDayType.Working) {
					return;
				}
				const sColor = `#${String(iIndex).repeat(5)}a`;
				oColor[oItem.getType()] = sColor;
				oItem.setColor(sColor);
		});
		this.oCalendar.getSpecialDates().forEach((oItem) => {
			if (oItem.getType() === "Type02") {
				return;
			}
			oItem.setColor(oColor[oItem.getType()]);
		});
		await nextUIUpdate();


		// Assert (no calendar legend items are focused and no filtered special day types)
		assert.notOk(document.activeElement.classList.contains(".sapUiUnifiedLegendItem"), "there are no calendar legend items focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 2, "the first month in calendar shows 2 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 1, "the second month in calendar shows 1 special date from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 2, "the first month in calendar shows 2 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 1, "the second month in calendar shows 1 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 2, "the first month in calendar shows 2 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 1, "the second month in calendar shows 1 special date from the third calendar legend type");

		// Act (focus first standard calendar legend item)
		aStandardItems[0].focus();
		await nextUIUpdate();

		// Assert (no filtered special day types)
		assert.strictEqual(document.activeElement.id, aStandardItems[0].getId(), "the first standard legend item is focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 2, "the first month in calendar shows 2 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 1, "the second month in calendar shows 1 special date from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 2, "the first month in calendar shows 2 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 1, "the second month in calendar shows 1 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 2, "the first month in calendar shows 2 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 1, "the second month in calendar shows 1 special date from the third calendar legend type");

		// Act (focus first calendar legend item)
		aLegendItems[0].focus();
		await nextUIUpdate();

		// Assert (filter first special day type)
		assert.strictEqual(document.activeElement.id, aLegendItems[0].getId(), "the first calendar legend item is focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 2, "the first month in calendar shows 2 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 1, "the second month in calendar shows 1 special date from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 0, "the first month in calendar shows 0 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 0, "the second month in calendar shows 0 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 0, "the first month in calendar shows 0 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 0, "the second month in calendar shows 0 special date from the third calendar legend type");

		// Act (focus second calendar legend item)
		aLegendItems[1].focus();
		await nextUIUpdate();

		// Assert (filter first special day type)
		assert.strictEqual(document.activeElement.id, aLegendItems[1].getId(), "the second calendar legend item is focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 0, "the first month in calendar shows 0 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 0, "the second month in calendar shows 0 special date from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 0, "the first month in calendar shows 0 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 0, "the second month in calendar shows 0 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 0, "the first month in calendar shows 0 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 0, "the second month in calendar shows 0 special date from the third calendar legend type");

		// Act (focus the calendar)
		this.oCalendar.focus();
		await nextUIUpdate();

		// Assert (again no filtered special day types)
		assert.notOk(document.activeElement.classList.contains(".sapUiUnifiedLegendItem"), "there are no calendar legend items focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 2, "the first month in calendar shows 2 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 1, "the second month in calendar shows 1 special date from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 2, "the first month in calendar shows 2 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 1, "the second month in calendar shows 1 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 2, "the first month in calendar shows 2 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 1, "the second month in calendar shows 1 special date from the third calendar legend type");
	});

	QUnit.test("Filtering special dates with color in calendar", async function (assert) {
		const aSpecialDays = [
			["20140915", undefined, "Type and color", "Type09", "#AA2C95"],
			["20140916", undefined, "Color without type", undefined, "#A1D129"],
			["20140917", undefined, "Type.None and color", CalendarDayType.None, "#1E47AE"]
		];

		this.oLegend.addItem(new CalendarLegendItem({
			text: "Type and color",
			type: "Type09",
			color: "#aa2c95"
		}));
		this.oLegend.addItem(new CalendarLegendItem({
			text: "Color without type",
			color: "#a1d129"
		}));
		this.oLegend.addItem(new CalendarLegendItem({
			text: "Type.None and color",
			type: CalendarDayType.None,
			color: "#1e47ae"
		}));

		aSpecialDays.forEach((aSpecialDate) => {
			const oSpecialDate = new DateTypeRange({
				startDate: oFormatYyyymmdd.parse(aSpecialDate[0]),
				endDate: oFormatYyyymmdd.parse(aSpecialDate[1]),
				type: aSpecialDate[3],
				tooltip: aSpecialDate[2],
				color: aSpecialDate[4]
			});
			this.oCalendar.addSpecialDate(oSpecialDate);
		});

		const aLegendItems = this.oLegend.getItems();
		const aMonths = this.oCalendar.getAggregation("month");
		let aFilterByColor;

		await nextUIUpdate();

		// Act (focus second calendar legend item)
		aLegendItems[3].focus();
		await nextUIUpdate();

		// Assert (filter first special day type)
		assert.strictEqual(document.activeElement.id, aLegendItems[3].getId(), "the second calendar legend item (Type and color) is focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 0, "the first month in calendar shows 0 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 0, "the second month in calendar shows 0 special date from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 0, "the first month in calendar shows 0 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 0, "the second month in calendar shows 0 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 0, "the first month in calendar shows 0 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 0, "the second month in calendar shows 0 special date from the third calendar legend type");

		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[3]).length, 0, "the second month in calendar shows 0 special date from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[3]).length, 1, "the second month in calendar shows 1 special date from the third calendar legend type and color");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[4]).length, 0, "the second month in calendar shows 0 special date from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[4]).length, 0, "the second month in calendar shows 0 special date from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[5]).length, 0, "the second month in calendar shows 0 special date from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[5]).length, 0, "the second month in calendar shows 0 special date from the third calendar legend type");


		// Act (focus second calendar legend item)
		aLegendItems[4].focus();
		await nextUIUpdate();

		aFilterByColor = Array.from(aMonths[1].getDomRef().querySelectorAll("div .sapUiCalSpecialDate")).filter((oItem) => {
			return oItem.style?.backgroundColor;
		});

		// Assert
		assert.strictEqual(aFilterByColor.length, 1, "the second month in calendar shows 1 special date from the second calendar legend color without type");

		// Act (focus second calendar legend item)
		aLegendItems[5].focus();
		await nextUIUpdate();
		aFilterByColor = Array.from(aMonths[1].getDomRef().querySelectorAll("div .sapUiCalSpecialDate")).filter((oItem) => {
			return oItem.style?.backgroundColor;
		});

		// Assert
		assert.strictEqual(aFilterByColor.length, 1, "the second month in calendar shows 1 special date from the second calendar legend Type.None and color");

		// Act (focus the calendar)
		this.oCalendar.focus();
		await nextUIUpdate();

		// Assert (again no filtered special day types)
		assert.notOk(document.activeElement.classList.contains(".sapUiUnifiedLegendItem"), "there are no calendar legend items focused");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[0]).length, 2, "the first month in calendar shows 2 special dates from the first calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[0]).length, 2, "the second month in calendar shows 1 special date from the first calendar legend type (The second item has the default type01)");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[1]).length, 2, "the first month in calendar shows 2 special dates from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[1]).length, 1, "the second month in calendar shows 1 special date from the second calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[0], aLegendItems[2]).length, 2, "the first month in calendar shows 2 special dates from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[2]).length, 1, "the second month in calendar shows 1 special date from the third calendar legend type");
		assert.strictEqual(getMonthDatesByLegendItem(aMonths[1], aLegendItems[3]).length, 1, "the second month in calendar shows 1 special date from the third calendar legend type");
	});

	QUnit.test("Accessibility attributes", function (assert) {
		var oLegendDomRef = this.oLegend.getDomRef(),
			aStandardItems = this.oLegend.getAggregation("_standardItems"),
			aLegendItems = this.oLegend.getItems(),
			iCount = (aStandardItems ? aStandardItems.length : 0) + (aLegendItems ? aLegendItems.length : 0);

		// Assert (Calendar Legend)
		assert.strictEqual(oLegendDomRef.getAttribute("aria-label"), this.oLegend._getLegendAriaLabel(), "calendar legend has proper aria-label attribute");
		assert.strictEqual(oLegendDomRef.getAttribute("role"), "list", "calendar legend has proper role attribute");

		// Assert (Calendar Legend Items)
		assert.strictEqual(aLegendItems[0].getDomRef().getAttribute("role"), "listitem", "calendar legend items have proper role attribute");
		assert.strictEqual(parseInt(aStandardItems[0].getDomRef().getAttribute("aria-posinset")), 1, "first standard calendar legend item has proper aria-posinset attribute");
		assert.strictEqual(parseInt(aStandardItems[0].getDomRef().getAttribute("aria-setsize")), iCount, "first standard calendar legend item has proper aria-setsize attribute");
		assert.strictEqual(parseInt(aLegendItems[0].getDomRef().getAttribute("aria-posinset")), aStandardItems.length + 1, "first calendar legend item has proper aria-posinset attribute");
		assert.strictEqual(parseInt(aLegendItems[0].getDomRef().getAttribute("aria-setsize")), iCount, "first calendar legend item has proper aria-setsize attribute");
		assert.strictEqual(parseInt(aLegendItems[aLegendItems.length - 1].getDomRef().getAttribute("aria-posinset")), iCount, "last calendar legend item has proper aria-posinset attribute");
		assert.strictEqual(parseInt(aLegendItems[aLegendItems.length - 1].getDomRef().getAttribute("aria-setsize")), iCount, "last calendar legend item has proper aria-setsize attribute");
	});

	// returns DOM references of all dates in a Month that are special dates of given Calendar Legend Item type
	function getMonthDatesByLegendItem(oMonth, oLegendItem) {
		return oMonth.getDomRef().querySelectorAll(".sapUiCalItem" + oLegendItem.getType());
	}

});