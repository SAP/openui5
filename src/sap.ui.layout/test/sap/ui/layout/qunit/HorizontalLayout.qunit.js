/*global QUnit */

sap.ui.define([
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Label",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/core/Element"
], function(HorizontalLayout, Button, Input, Label, Device, jQuery, oCore, Element) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("", {
		beforeEach: function() {
			this.oLayout1 = new HorizontalLayout("Layout1", {
				content: [new Button("B1",{text:"X", tooltip:"Button tooltip"}),
						new Input("IN1",{value:"Test",width:"50px"}),
						new Button("B2",{text:"Y", tooltip:"Button tooltip"})]
			}).placeAt(DOM_RENDER_LOCATION);
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oLayout1.destroy();
		}
	});

	QUnit.test("Children Rendered", function(assert) {
		assert.ok(document.getElementById('B1'), "Button should be rendered");
		assert.ok(document.getElementById('IN1'), "Input should be rendered");
		assert.ok(document.getElementById('B2'), "Second button should be rendered");
	});

	QUnit.test("Layout", function(assert) {
		var oButton = jQuery('#B1');
		var oInput = jQuery('#IN1');
		var oImage = jQuery('#B2');
		assert.ok(oButton.offset().left < oInput.offset().left, "Left offset of Button < Input");
		assert.ok(oInput.offset().left < oImage.offset().left, "Left offset of Input < Second button");

		// offset() returns fractional numbers on Firefox Mac, so use offsetLeft instead
		assert.equal(oInput[0].offsetLeft, oButton[0].offsetLeft + oButton[0].offsetWidth, "Input should be exactly right of Button");
	});

	QUnit.test("NoWrap", function(assert) {
		this.oLayout1.setAllowWrapping(false);
		Element.registry.get("IN1").setWidth("5000px");
		oCore.applyChanges();

		var oButton = jQuery('#B1');
		var oInput = jQuery('#IN1');
		var oImage = jQuery('#B2');
		assert.ok(oButton.offset().left < oInput.offset().left, "Left offset of Button < Input");
		assert.ok(oInput.offset().left < oImage.offset().left, "Left offset of Input < Second button");
	});

	QUnit.test("Wrapping", function(assert) {
		this.oLayout1.setAllowWrapping(true);
		Element.registry.get("IN1").setWidth("5000px");
		oCore.applyChanges();

		var oButton = jQuery('#B1');
		var oInput = jQuery('#IN1');
		var oImage = jQuery('#B2');
		assert.equal(oInput.offset().left, oButton.offset().left, "Left offset of Button == Input");
		assert.equal(oImage.offset().left, oInput.offset().left, "Left offset of Input == Second button");
	});

	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new HorizontalLayout({
				content: [
					new Label({text: "foo"}),
					new Label({text: "bar"})
				]
			}),
			sResponsiveSize = "0px",
			aResponsiveSize,
			$containerContent;

		if (Device.resize.width > 599) {
			sResponsiveSize = Device.resize.width <= 1023 ? "16px" : "16px 32px";
		}

		aResponsiveSize = sResponsiveSize.split(" ");

		// Act
		oContainer.placeAt(DOM_RENDER_LOCATION);
		oCore.applyChanges();
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
		assert.strictEqual($containerContent.children().css("padding-right"), "16px", "The container children have 1rem right content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.children().last().css("padding-right"), "0px", "The last container child has no right content padding when class \"sapUiContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiContentPadding");
		oContainer.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-right"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]) , "The container has " + sResponsiveSize + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.children().css("padding-right"), (Device.resize.width <= 599 ? "0px" : "16px"), "The container children have " + (Device.resize.width <= 599 ? "0px" : "16px") + " right content padding when class \"sapUiResponsiveContentPadding\" is set");
		assert.strictEqual($containerContent.children().last().css("padding-right"), "0px", "The last container child has no right content padding when class \"sapUiResponsiveContentPadding\" is set");

		// Cleanup
		oContainer.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oLayout = new HorizontalLayout({
			content: [
				new HorizontalLayout(),
				new HorizontalLayout()
			]
		});
		assert.ok(!!oLayout.getAccessibilityInfo, "HorizontalLayout has a getAccessibilityInfo function");
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
});