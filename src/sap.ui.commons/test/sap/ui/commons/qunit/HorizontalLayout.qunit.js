/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/layout/HorizontalLayout",
	"sap/ui/commons/Button",
	"sap/ui/commons/TextField",
	"sap/ui/thirdparty/jquery",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/Device"
], function(
	createAndAppendDiv,
	HorizontalLayout,
	Button,
	TextField,
	jQuery,
	LayoutHorizontalLayout,
	Device
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1");



	var oLayout1 = new HorizontalLayout("Layout1", {
		content: [
			new Button("B1",{text:"X", tooltip:"Button tooltip"}),
			new TextField("TF1",{value:"Test",width:"50px"}),
			new Button("B2",{text:"Y", tooltip:"Button tooltip"})
		]
	});
	oLayout1.placeAt("uiArea1");


	QUnit.test("Children Rendered", function(assert) {
		assert.ok(document.getElementById('B1'), "Button should be rendered");
		assert.ok(document.getElementById('TF1'), "TextField should be rendered");
		assert.ok(document.getElementById('B2'), "Second button should be rendered");
	});

	QUnit.test("Layout", function(assert) {
		var oButton = jQuery('#B1');
		var oText = jQuery('#TF1');
		var oImage = jQuery('#B2');
		assert.ok(oButton.offset().left < oText.offset().left, "Left offset of Button < TextField");
		assert.ok(oText.offset().left < oImage.offset().left, "Left offset of TextField < Second button");

		// offset() returns fractional numbers on Firefox Mac, so use offsetLeft instead
		assert.equal(oText[0].offsetLeft, oButton[0].offsetLeft + oButton[0].offsetWidth, "TextField should be exactly right of Button");
	});

	QUnit.test("NoWrap", function(assert) {
		sap.ui.getCore().byId("TF1").setWidth("5000px");
		sap.ui.getCore().applyChanges();

		var oButton = jQuery('#B1');
		var oText = jQuery('#TF1');
		var oImage = jQuery('#B2');
		assert.ok(oButton.offset().left < oText.offset().left, "Left offset of Button < TextField");
		assert.ok(oText.offset().left < oImage.offset().left, "Left offset of TextField < Second button");
	});

	QUnit.test("Wrapping", function(assert) {
		oLayout1.setAllowWrapping(true);
		sap.ui.getCore().applyChanges();

		var oButton = jQuery('#B1');
		var oText = jQuery('#TF1');
		var oImage = jQuery('#B2');
		assert.equal(oText.offset().left, oButton.offset().left, "Left offset of Button == TextField");
		assert.equal(oImage.offset().left, oText.offset().left, "Left offset of TextField == Second button");
	});

	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new LayoutHorizontalLayout(),
			sResponsiveSize = (Device.resize.width <= 599 ? "0px" : (Device.resize.width <= 1023 ? "16px" : "16px 32px")), //eslint-disable-line no-nested-ternary
			aResponsiveSize = sResponsiveSize.split(" "),
			$containerContent;

		// Act
		oContainer.placeAt("uiArea1");

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

		// Act
		oContainer.removeStyleClass("sapUiContentPadding");
		oContainer.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-right"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]) , "The container has " + sResponsiveSize + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");

		// Cleanup
		oContainer.destroy();
	});
});