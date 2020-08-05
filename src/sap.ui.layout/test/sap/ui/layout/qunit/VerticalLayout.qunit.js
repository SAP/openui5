/*global QUnit*/
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/commons/Button",
	"sap/ui/commons/TextField",
	"sap/ui/commons/Image",
	"sap/ui/commons/Slider",
	"sap/ui/commons/TextArea",
	"sap/ui/commons/RatingIndicator",
	"sap/ui/commons/CheckBox",
	"sap/ui/commons/Label",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function(Device, qutils, VerticalLayout, Button, TextField, Image, Slider, TextArea, RatingIndicator, CheckBox, Label, waitForThemeApplied) {
	"use strict";

	var oLayout1 = new VerticalLayout("Layout1", {
		content: [new Button("B1",{text:"Press me", tooltip:"Button tooltip"}),
				new TextField("TF1",{value:"Test"}),
				new Image("I1",{src:"http://www.sap.com/global/images/SAPLogo.gif"})]
	});
	oLayout1.placeAt("content");

	var oLayout2 = new VerticalLayout("Layout2", {
		width: "200px",
		content: [new Slider("S2",{value:25, tooltip:"Slider tooltip", width: "300px"}),
				new TextArea("TA2",{value:"Test \n1\n2\n3\n4\n5\n6\n7\n8\n9", width: "250px", height: "150px"}),
				new RatingIndicator("RI2",{value: 4}),
				new CheckBox("CB2",{text: "Test"})]
	});
	oLayout2.placeAt("content");

	QUnit.module("Properties");

	QUnit.test("Default Values", function(assert) {
		assert.equal(oLayout1.getWidth(), "", "Default 'Width':");
	});

	QUnit.test("Custom Values", function(assert) {
		assert.equal(oLayout2.getWidth(), "200px", "Custom 'Width':");
	});

	QUnit.module("Visual Appearence");

	QUnit.test("Visibility", function(assert) {
		// controls must be one below the other -> same X coordinate, nut higher Y coordinate
		var oButtonDom = document.getElementById('B1');
		var oTextDom = document.getElementById('TF1');
		var oImageDom = document.getElementById('I1');
		assert.equal(oButtonDom.offsetLeft, oTextDom.offsetLeft, "Left offset of Button same as for TextField");
		assert.equal(oButtonDom.offsetLeft, oImageDom.offsetLeft, "Left offset of Button same as for Image");
		assert.ok(oButtonDom.offsetTop < oTextDom.offsetTop, "Top offset of Button < TextField");
		assert.ok(oTextDom.offsetTop < oImageDom.offsetTop, "Top offset of TextField < Image");

		// width must fit to defined one even if content is larger
		var oLayout2Dom = document.getElementById('Layout2');
		assert.equal(oLayout2Dom.offsetWidth, 200, "Width of Layout fits defined one");
		var oSliderDom = document.getElementById('S2');
		var oTextADom = document.getElementById('TA2');
		var oRatingDom = document.getElementById('RI2');
		var oCheckBDom = document.getElementById('CB2');
		assert.equal(oSliderDom.offsetLeft, oTextADom.offsetLeft, "Left offset of Slider same as for TextArea");
		assert.equal(oSliderDom.offsetLeft, oRatingDom.offsetLeft, "Left offset of Slider same as for RatingIndicator");
		assert.equal(oSliderDom.offsetLeft, oCheckBDom.offsetLeft, "Left offset of Slider same as for CheckBox");
		assert.ok(oSliderDom.offsetTop < oTextADom.offsetTop, "Top offset of Slider < TextArea");
		assert.ok(oTextADom.offsetTop < oRatingDom.offsetTop, "Top offset of TextArea < RatingIndicator");
		assert.ok(oRatingDom.offsetTop < oCheckBDom.offsetTop, "Top offset of RatingIndicator < CheckBox");
	});

	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new VerticalLayout({
			content: [
				new Label({text: "foo"}),
				new Label({text: "bar"})
			]
		}),
		sResponsiveSize,
		$containerContent;

		if (Device.resize.width <= 599) {
			sResponsiveSize = "0px";
		} else if (Device.resize.width <= 1023) {
			sResponsiveSize = "16px";
		} else {
			sResponsiveSize = "16px 32px";
		}
		var aResponsiveSize = sResponsiveSize.split(" ");
		// Act
		oContainer.placeAt("content");
		sap.ui.getCore().applyChanges();
		oContainer.addStyleClass("sapUiNoContentPadding");
		$containerContent = oContainer.$();

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "0px", "The container has no left content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "0px", "The container has no right content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "0px", "The container has no top content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "0px", "The container has no bottom content padding when class \"sapUiNoContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiNoContentPadding");
		oContainer.addStyleClass("sapUiContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "16px", "The container has 1rem left content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "16px", "The container has 1rem right content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "16px", "The container has 1rem top content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "16px", "The container has 1rem bottom content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.children().css("padding-bottom"), "16px", "The container children have 1rem bottom content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.children().last().css("padding-bottom"), "0px", "The last container child has no bottom content padding when class \"sapUiContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiContentPadding");
		oContainer.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-right"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]) , "The container has " + sResponsiveSize + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.children().css("padding-bottom"), (Device.resize.width <= 599 ? "0px" : "16px"), "The container children have " + (Device.resize.width <= 599 ? "0px" : "16px") + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set");
		assert.strictEqual($containerContent.children().last().css("padding-bottom"), "0px", "The last container child has no bottom content padding when class \"sapUiResponsiveContentPadding\" is set");

		// Cleanup
		oContainer.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oLayout = new VerticalLayout({
			content: [
				new VerticalLayout(),
				new VerticalLayout()
			]
		});
		assert.ok(!!oLayout.getAccessibilityInfo, "VerticalLayout has a getAccessibilityInfo function");
		var oInfo = oLayout.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.ok(oInfo.role === undefined || oInfo.editable === null, "AriaRole");
		assert.ok(oInfo.type === undefined || oInfo.editable === null, "Type");
		assert.ok(oInfo.description === undefined || oInfo.editable === null, "Description");
		assert.ok(oInfo.focusable === undefined || oInfo.editable === null, "Focusable");
		assert.ok(oInfo.enabled === undefined || oInfo.editable === null, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		assert.ok(oInfo.children && oInfo.children.length == 2, "Children");
		oLayout.destroy();
	});

	return waitForThemeApplied();
});
