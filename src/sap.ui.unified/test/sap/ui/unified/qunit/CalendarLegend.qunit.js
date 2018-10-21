/*global QUnit, window */
/*eslint no-undef:1, no-unused-vars:1, strict: 1, no-alert: 1*/
sap.ui.define([
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendRenderer",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/CalendarDayType",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Date"
], function(CalendarLegend, CalendarLegendRenderer, CalendarLegendItem,
	CalendarDayType, DateRange, DateTypeRange, JSONModel) {
	"use strict";

	var StandardCalendarLegendItem = sap.ui.unified.StandardCalendarLegendItem;
	var oLeg1 = new CalendarLegend("Leg1", {}).placeAt("content");
	var oLeg2 = new CalendarLegend("Leg2", {}).placeAt("content");
	var oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({
		pattern: "yyyyMMdd"
	});

	var aSpecialDays = [["20140801", undefined, "Type01", 1], ["20140802", undefined, "Type02", 2], ["20140803", undefined, "Type03", 3], ["20140804", undefined, "Type04", 4], ["20140805", undefined, "Type05", 5], ["20140806", undefined, "Type06", 6], ["20140807", undefined, "Type07", 7], ["20140808", undefined, "Type08", 8], ["20140809", undefined, "Type09", 9], ["20140810", undefined, "Type10", 10]];

	var oCal = new sap.ui.unified.Calendar("Cal", {
		selectedDates: [new DateRange({startDate: oFormatYyyymmdd.parse("20140820")})],
		select: function (oEvent) {
			alert("Select");
		},
		cancel: function (oEvent) {
			alert("Cancel");
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
		sap.ui.getCore().byId("Cal").addSpecialDate(new DateTypeRange({
			startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
			endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
			type: sType,
			tooltip: aSpecialDay[2]
		}));
	}

	var oLeg3 = new CalendarLegend("Leg3", {});
	oCal.placeAt("content");
	oLeg3.placeAt("content");

	var oLeg4 = new CalendarLegend("Leg4", {
		items: [new CalendarLegendItem("L4-I0", {text: "Type10", type: CalendarDayType.Type10, tooltip: "Type 10"}),
			new CalendarLegendItem("L4-I1", {text: "Type09", type: CalendarDayType.Type09, tooltip: "Type 9"}),
			new CalendarLegendItem("L4-I2", {text: "Type08", type: CalendarDayType.Type08, tooltip: "Type 8"}),
			new CalendarLegendItem("L4-I3", {text: "no type 1", tooltip: "no type 1"}),
			new CalendarLegendItem("L4-I4", {text: "Type07", type: CalendarDayType.Type07, tooltip: "Type 7"}),
			new CalendarLegendItem("L4-I5", {text: "no type 2", tooltip: "no type 2"}),
			new CalendarLegendItem("L4-I6", {text: "custom color 1", tooltip: "custom color 1", color: "#FF00FF"}),
			new CalendarLegendItem("L4-I7", {text: "custom color 2", tooltip: "custom color 2", color: "#FF0000"})
		]
	}).placeAt("content");

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

		var myView = sap.ui.xmlview({viewContent: sView}),
			oCalLegend = myView.byId("CalendarLegend");

		//Assert
		assert.deepEqual(oCalLegend.getStandardItems(), [], "Should return the same items");
		assert.equal(oCalLegend.getItems().length, 1, "Should has 1 Calendar item");

		//Cleanup
		myView.destroy();
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

		var myView = sap.ui.xmlview({viewContent: sView}),
			oCalLegend = myView.byId("CalendarLegend");

		myView.setModel(new JSONModel({
			"standardItems": [StandardCalendarLegendItem.NonWorkingDay, StandardCalendarLegendItem.Selected]
		}));

		//Assert
		assert.deepEqual(oCalLegend.getStandardItems(), [StandardCalendarLegendItem.NonWorkingDay,
			StandardCalendarLegendItem.Selected], "Should return the same items");

		//Cleanup
		myView.destroy();
	});

	QUnit.module("Rendering");

	QUnit.test("Standard categories", function (assert) {
		var $Leg1 = sap.ui.getCore().byId("Leg1").$();
		var aLegendItems = $Leg1.find(".sapUiUnifiedLegendItems").children();
		assert.equal(aLegendItems.length, 4, "4 categories rendered");
	});

	QUnit.test("Custom categories", function (assert) {
		var $Leg2 = sap.ui.getCore().byId("Leg2").$();
		var aLegendItems = $Leg2.find(".sapUiUnifiedLegendItems").children();
		assert.equal(aLegendItems.length, 4, "4 categories rendered");

		oLeg2 = sap.ui.getCore().byId("Leg2");
		var i = 0;
		for (i; i < 9; i++) {
			oLeg2.addItem(new CalendarLegendItem("L2-I" + i, {
				text: "Placeholder 0" + (i + 1)
			}));
		}
		oLeg2.addItem(new CalendarLegendItem("L2-I" + i, {
			text: "Placeholder " + (i + 1)
		}));

		sap.ui.getCore().applyChanges();

		$Leg2 = oLeg2.$();
		var aLegendItems = $Leg2.find(".sapUiUnifiedLegendItems").children();
		assert.equal(aLegendItems.length, 14, "14 categories rendered");

		assert.ok(jQuery("#L2-I0").hasClass("sapUiCalLegDayType01"), "Legend2: 1. item has type 01");
		assert.ok(jQuery("#L2-I1").hasClass("sapUiCalLegDayType02"), "Legend2: 2. item has type 02");

		assert.ok(jQuery("#L4-I0").hasClass("sapUiCalLegDayType10"), "Legend4: 1. item has type 10");
		assert.ok(jQuery("#L4-I1").hasClass("sapUiCalLegDayType09"), "Legend4: 2. item has type 09");
		assert.ok(jQuery("#L4-I2").hasClass("sapUiCalLegDayType08"), "Legend4: 3. item has type 08");
		assert.ok(jQuery("#L4-I3").hasClass("sapUiCalLegDayType01"), "Legend4: 4. item has type 01");
		assert.ok(jQuery("#L4-I4").hasClass("sapUiCalLegDayType07"), "Legend4: 5. item has type 07");
		assert.ok(jQuery("#L4-I5").hasClass("sapUiCalLegDayType02"), "Legend4: 6. item has type 02");
	});

	function _getCssColorProperty(oJQuerySet, sCssPropertyName) {
		return /rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/.exec(oJQuerySet.css(sCssPropertyName));
	}

	function _checkColor(oExtractedRGB, oExpectedRGB, sLabel, assert) {
		assert.equal(oExtractedRGB[1], oExpectedRGB.R, sLabel + " (RED)");
		assert.equal(oExtractedRGB[2], oExpectedRGB.G, sLabel + " (GREEN)");
		assert.equal(oExtractedRGB[3], oExpectedRGB.B, sLabel + " (BLUE)");
	}

	QUnit.test("Custom colors", function (assert) {
		var oCustomColorIfL4I6 = _getCssColorProperty(jQuery("#L4-I6 .sapUiUnifiedLegendSquareColor"), "background-color");
		var oCustomColorIfL4I7 = _getCssColorProperty(jQuery("#L4-I7 .sapUiUnifiedLegendSquareColor"), "background-color");
		_checkColor(oCustomColorIfL4I6, {
			R: 255,
			G: 0,
			B: 255
		}, "Legend 4: custom color 1 item has the right color", assert);
		_checkColor(oCustomColorIfL4I7, {R: 255, G: 0, B: 0}, "Legend 4: custom color 2 item has the right color", assert);
	});

	QUnit.test("Combination with Calendar", function (assert) {
		var specialDates = oCal.getSpecialDates();
		for (var i = 0; i < specialDates.length; i++) {
			oLeg3.addItem(new CalendarLegendItem({
				text: specialDates[i].getTooltip()
			}));
		}

		sap.ui.getCore().applyChanges();

		var $Leg = oLeg3.$().find(".sapUiUnifiedLegendItems").children();

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
});