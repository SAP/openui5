/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ToggleButton",
	"sap/m/Toolbar",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/Lib"
], function(qutils, createAndAppendDiv, ToggleButton, Toolbar, KeyCodes, oCore, Element, Lib) {
	"use strict";

	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");



	var oToggleButton1 = new ToggleButton("testToggleButton_1", {
		text : "TestButton 1",
		pressed : true
	});
	oToggleButton1.placeAt("uiArea1");

	var oToggleButton2 = new ToggleButton("testToggleButton_2", {
		text : "TestButton 2",
		pressed : false
	});
	oToggleButton2.placeAt("uiArea2");

	var oToggleButton3 = new ToggleButton("testToggleButton_3", {
		text : "TestButton 3",
		pressed : true,
		enabled : false
	});
	oToggleButton3.placeAt("uiArea3");

	QUnit.module("pressed state");

	QUnit.test("TestGetPressedStateOK", function(assert) {
		assert.equal(oToggleButton1.getPressed(), true, "getPressedState for testToggleButton_1");
		assert.equal(oToggleButton2.getPressed(), false, "getPressedState for testToggleButton_2");
	});

	QUnit.test("Check Accessibility States", function(assert) {
		assert.strictEqual(oToggleButton1.$().attr("aria-pressed"), "true", "aria-pressed state is true for testToggleButton_1");
		assert.strictEqual(oToggleButton2.$().attr("aria-pressed"), "false", "aria-pressed state is false for testToggleButton_2");
		assert.strictEqual(oToggleButton3.$().attr("aria-disabled"), undefined, "aria-disabled status is not rendered");
	});

	QUnit.test("TestPressedToUnpressedOK", function(assert) {
		qutils.triggerEvent("tap", oToggleButton1.getId());
		oCore.applyChanges();
		assert.equal(oToggleButton1.getPressed(), false, "getPressedState");
		assert.strictEqual(oToggleButton1.$().attr("aria-pressed"), "false", "aria-pressed state is false for testToggleButton_1 after tap");
	});

	QUnit.test("TestUnpressedToPressedOK", function(assert) {
		qutils.triggerEvent("tap", oToggleButton2.getId());
		oCore.applyChanges();
		assert.equal(oToggleButton2.getPressed(), true, "getPressedState");
		assert.strictEqual(oToggleButton2.$().attr("aria-pressed"), "true", "aria-pressed state is true for testToggleButton_2 after tap");
	});

	QUnit.test("Should not change the pressed state, from toggled to untoggled, on a tap Event if the toggle button is disabled", function(assert) {
		// Arrange + System under Test
		var oToggleButton = new ToggleButton({
				enabled : false,
				pressed : true
			}),
			oTapSpy = this.spy(oToggleButton, "ontap");

		oToggleButton.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		qutils.triggerEvent("tap", oToggleButton.getId());

		// Assert
		assert.strictEqual(oToggleButton.getPressed(), true, "the pressed state is still true");
		assert.strictEqual(oTapSpy.callCount, 1, "tap was fired");
		assert.strictEqual(oToggleButton.$().attr("aria-disabled"), undefined, "aria-disabled is not rendered");
	});

	QUnit.test("Should not change pressed state when Shift is pressed between the keydown and keyup  of the Space press", function(assert) {
		var oToggleButton = Element.registry.get("testToggleButton_2"),
			bIsPressed = oToggleButton.getPressed();

		qutils.triggerKeyEvent("keydown", "testToggleButton_2", KeyCodes.SPACE);
		qutils.triggerKeyEvent("keydown", "testToggleButton_2", KeyCodes.SHIFT);
		qutils.triggerKeyEvent("keyup", "testToggleButton_2", KeyCodes.SPACE);

		assert.strictEqual(oToggleButton.getPressed(), bIsPressed, "The pressed state has not changed");
	});

	QUnit.test("Should not change the pressed state, from untoggled to toggled, on a tap Event if the toggle button is disabled", function(assert) {
		// Arrange + System under Test
		var oToggleButton = new ToggleButton({
				enabled : false,
				pressed : false
			}),
			oTapSpy = this.spy(oToggleButton, "ontap");

		oToggleButton.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		qutils.triggerEvent("tap", oToggleButton.getId());

		// Assert
		assert.strictEqual(oToggleButton.getPressed(), false, "the pressed state is still false");
		assert.strictEqual(oTapSpy.callCount, 1, "tap was fired");
	});

	QUnit.test("Should change the pressed state, from toggled to untoggled, if it was called over the API", function(assert) {
		// Arrange + System under Test
		var oToggleButton = new ToggleButton({
				enabled : false,
				pressed : true
			});

		oToggleButton.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oToggleButton.setPressed(false);

		// Assert
		assert.strictEqual(oToggleButton.getPressed(), false, "the pressed state is still false");
	});

	QUnit.test("Should change the pressed state, from untoggled to toggled, if it was called over the API", function(assert) {
		// Arrange + System under Test
		var oToggleButton = new ToggleButton({
				enabled : false,
				pressed : false
			});

		oToggleButton.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oToggleButton.setPressed(true);

		// Assert
		assert.strictEqual(oToggleButton.getPressed(), true, "the pressed state is still true");
	});


	QUnit.module("Integration tests");

	QUnit.test("Should not change the pressed state on a tap Event if the toggle button is in a disabled Toolbar", function(assert) {
		var oToolbar = new Toolbar({
			enabled : false
		});

		// System under Test
		var oToggleButton = new ToggleButton({
				pressed : true
			}),
			oTapSpy = this.spy(oToggleButton, "ontap");
		oToolbar.addContent(oToggleButton);

		oToolbar.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		qutils.triggerEvent("tap", oToggleButton.getId());

		// Assert
		assert.strictEqual(oToggleButton.getEnabled(), false, "the enabled state of the toolbar got propagated");
		assert.strictEqual(oToggleButton.$().attr("aria-disabled"), undefined, "aria-disabled is not rendered");
		assert.strictEqual(oToggleButton.getPressed(), true, "the pressed state is still true");
		assert.ok(oToggleButton.$("inner").hasClass("sapMToggleBtnPressed"), "still has the pressed class");
		assert.strictEqual(oTapSpy.callCount, 1, "tap was fired");
	});

	QUnit.test("'Enter' should fire 'press' event on keydown", function (assert) {
		// Prepare
		var oToggleButton = new ToggleButton(),
			oFirePressSpy = this.spy(oToggleButton, "firePress");

		// Act
		qutils.triggerKeydown(oToggleButton, KeyCodes.ENTER);

		// Assert
		assert.equal(oFirePressSpy.callCount, 1, "press event should be called once");

		// Cleanup
		oToggleButton.destroy();
	});

	QUnit.test("'Space' should fire 'press' event on keyup", function (assert) {
		// Prepare
		var oToggleButton = new ToggleButton(),
			oFirePressSpy = this.spy(oToggleButton, "firePress");

		// Act
		qutils.triggerKeyup(oToggleButton, KeyCodes.SPACE);

		// Assert
		assert.equal(oFirePressSpy.callCount, 1, "press event should be called once");

		// Cleanup
		oToggleButton.destroy();
	});

	QUnit.test("ToggleButton _toggleLiveChangeAnnouncement method is properly overwritten", function (assert) {
		// Prepare
		var oToggleButton = new ToggleButton();
			var oLiveChangeSpy = this.spy(ToggleButton.prototype, "_toggleLiveChangeAnnouncement");

		// Act
		oToggleButton.onfocusin();

		// Assert
		assert.ok(oLiveChangeSpy.calledOnce, "Overwriting funcion should be called");
	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oButton = new ToggleButton({tooltip: "Tooltip"});
		assert.ok(!!oButton.getAccessibilityInfo, "ToggleButton has a getAccessibilityInfo function");
		var oInfo = oButton.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, "button", "AriaRole");
		assert.strictEqual(oInfo.type, Lib.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_BUTTON"), "Type");
		assert.strictEqual(oInfo.description, "Tooltip", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		oButton.setText("Text");
		oButton.setEnabled(false);
		oInfo = oButton.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Text", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		oButton.setText(null);
		oButton.setTooltip(null);
		oButton.setIcon("sap-icon://search");
		oInfo = oButton.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, Lib.getResourceBundleFor("sap.ui.core").getText("Icon.search"), "Description");
		oButton.setPressed(true);
		oInfo = oButton.getAccessibilityInfo();
		assert.strictEqual(oInfo.description,
				Lib.getResourceBundleFor("sap.ui.core").getText("Icon.search") + " " + Lib.getResourceBundleFor("sap.m").getText("ACC_CTR_STATE_PRESSED"),
				"Description");
		oButton.destroy();
	});
});
