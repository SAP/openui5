/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/RadioButtonGroup",
	"sap/ui/core/Item",
	"sap/ui/core/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/jqueryui/jquery-ui-position" // jQuery.fn.position
], function(
	qutils,
	createAndAppendDiv,
	RadioButtonGroup,
	Item,
	coreLibrary,
	jQuery
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4"]);



	// 1. RadioButtonGroup
	var oRBGroup1 = new RadioButtonGroup("RBG1");

	var oItem = new Item("RB1-1");
	oItem.setText("Option 1");
	oItem.setTooltip("Tooltip 1");
	oItem.setKey("Key1");
	oRBGroup1.addItem(oItem);

	oItem = new Item("RB1-2");
	oItem.setText("Option 2");
	oItem.setTooltip("Tooltip 2");
	oItem.setKey("Key2");
	oRBGroup1.addItem(oItem);

	oItem = new Item("RB1-3");
	oItem.setText("Option 3");
	oItem.setTooltip("Tooltip 3");
	oItem.setKey("Key3");
	oItem.setEnabled(false);
	oRBGroup1.addItem(oItem);

	oItem = new Item("RB1-4");
	oItem.setText("Option 4");
	oItem.setTooltip("Tooltip 4");
	oItem.setKey("Key4");
	oRBGroup1.addItem(oItem);

	oRBGroup1.placeAt("uiArea1");

	// 2. RadioButtonGroup (invisible)
	var oRBGroup2 = new RadioButtonGroup("RBG2");
	oRBGroup2.setVisible(false);

	oItem = new Item("RB2-1");
	oItem.setText("Option 1");
	oItem.setTooltip("Tooltip 1");
	oItem.setKey("Key1");
	oRBGroup2.addItem(oItem);

	oItem = new Item("RB2-2");
	oItem.setText("Option 2");
	oItem.setTooltip("Tooltip 2");
	oItem.setKey("Key2");
	oRBGroup2.addItem(oItem);

	oRBGroup2.placeAt("uiArea2");

	// 3. RadioButtonGroup
	var oRBGroup3 = new RadioButtonGroup("RBG3");
	oRBGroup3.setColumns(3);

	oItem = new Item("RB3-1");
	oItem.setText("Option 1");
	oItem.setTooltip("Tooltip 1");
	oItem.setKey("Key1");
	oRBGroup3.addItem(oItem);

	oItem = new Item("RB3-2");
	oItem.setText("Option 2");
	oItem.setTooltip("Tooltip 2");
	oItem.setKey("Key2");
	oItem.setEnabled(false);
	oRBGroup3.addItem(oItem);

	oItem = new Item("RB3-3");
	oItem.setText("Option 3");
	oItem.setTooltip("Tooltip 3");
	oItem.setKey("Key3");
	oRBGroup3.addItem(oItem);

	oItem = new Item("RB3-4");
	oItem.setText("Option 4");
	oItem.setTooltip("Tooltip 4");
	oItem.setKey("Key4");
	oRBGroup3.addItem(oItem);

	oItem = new Item("RB3-5");
	oItem.setText("Option 5");
	oItem.setTooltip("Tooltip 5");
	oItem.setKey("Key5");
	oRBGroup3.addItem(oItem);

	oItem = new Item("RB3-6");
	oItem.setText("Option 6");
	oItem.setTooltip("Tooltip 6");
	oItem.setKey("Key6");
	oRBGroup3.addItem(oItem);

	oItem = new Item("RB3-7");
	oItem.setText("Option 7");
	oItem.setTooltip("Tooltip 7");
	oItem.setKey("Key7");
	oRBGroup3.addItem(oItem);

	oRBGroup3.placeAt("uiArea3");

	// 4. RadioButtonGroup
	var oRBGroup4 = new RadioButtonGroup("RBG4");
	oRBGroup4.setColumns(3);
	oRBGroup4.setEditable(false);
	oRBGroup4.setValueState(ValueState.Error);

	oItem = new Item("RB4-1");
	oItem.setText("Option 1");
	oItem.setTooltip("Tooltip 1");
	oItem.setKey("Key1");
	oRBGroup4.addItem(oItem);

	oItem = new Item("RB4-2");
	oItem.setText("Option 2");
	oItem.setTooltip("Tooltip 2");
	oItem.setKey("Key2");
	oItem.setEnabled(false);
	oRBGroup4.addItem(oItem);

	oItem = new Item("RB4-3");
	oItem.setText("Option 3");
	oItem.setTooltip("Tooltip 3");
	oItem.setKey("Key3");
	oRBGroup4.addItem(oItem);

	oRBGroup4.placeAt("uiArea4");

	// TEST functions

	QUnit.module("Properties");

	QUnit.test("Default Values", function(assert) {
		assert.equal(oRBGroup1.getEditable(), true, "Editable");
		assert.equal(oRBGroup1.getColumns(), 1, "Columns");
		assert.equal(oRBGroup1.getVisible(), true, "Visible");
		assert.equal(oRBGroup1.getValueState(), ValueState.None, "ValueState");
		assert.equal(oRBGroup1.getWidth(), "", "Width");
		assert.equal(oRBGroup1.getSelectedIndex(), 0, "Selected Index");
	});

	QUnit.test("Properties of Radio Buttons", function(assert) {
		assert.equal(sap.ui.getCore().getElementById("RBG1-0").getText(), "Option 1", "RadioButton 0 - Text");
		assert.equal(sap.ui.getCore().getElementById("RBG1-0").getTooltip(), "Tooltip 1", "RadioButton 0 - Tooltip");
		assert.equal(sap.ui.getCore().getElementById("RBG1-0").getEnabled(), true, "RadioButton 0 - Enabled");
		assert.equal(sap.ui.getCore().getElementById("RBG1-0").getKey(), "Key1", "RadioButton 0 - Key");
		assert.equal(sap.ui.getCore().getElementById("RBG1-0").getEditable(), true, "RadioButton 0 - Editable");
		assert.equal(sap.ui.getCore().getElementById("RBG1-0").getGroupName(), "RBG1", "RadioButton 0 - GroupName");
		assert.equal(sap.ui.getCore().getElementById("RBG1-0").getValueState(),ValueState.None , "RadioButton 0 - ValueState");
		assert.equal(sap.ui.getCore().getElementById("RBG1-0").getWidth(), "", "RadioButton 0 - Width");
		assert.equal(sap.ui.getCore().getElementById("RBG1-0").getSelected(), true, "RadioButton 0 - Selected");

		assert.equal(sap.ui.getCore().getElementById("RBG1-1").getSelected(), false, "RadioButton 1 - Selected");

		assert.equal(sap.ui.getCore().getElementById("RBG1-2").getEnabled(), false, "RadioButton 2 - Enabled");
		assert.equal(sap.ui.getCore().getElementById("RBG1-2").getSelected(), false, "RadioButton 2 - Selected");

		assert.equal(sap.ui.getCore().getElementById("RBG1-3").getSelected(), false, "RadioButton 3 - Selected");

		assert.equal(sap.ui.getCore().getElementById("RBG4-0").getEditable(), false, "Editable on Group = false: RadioButton 0 - Editable");
		assert.equal(sap.ui.getCore().getElementById("RBG4-1").getEditable(), false, "Editable on Group = false: RadioButton 1 - Editable");
		assert.equal(sap.ui.getCore().getElementById("RBG4-2").getEditable(), false, "Editable on Group = false: RadioButton 2 - Editable");
		assert.equal(sap.ui.getCore().getElementById("RBG4-0").getValueState(),ValueState.Error , "ValueState.Error on Group: RadioButton 0 - ValueState");
		assert.equal(sap.ui.getCore().getElementById("RBG4-1").getValueState(),ValueState.Error , "ValueState.Error on Group: RadioButton 1 - ValueState");
		assert.equal(sap.ui.getCore().getElementById("RBG4-2").getValueState(),ValueState.Error , "ValueState.Error on Group: RadioButton 2 - ValueState");

	});

	QUnit.test("Toggle Enabled", function(assert) {
		oRBGroup1.setEnabled(false);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#RBG1").attr("tabindex"), -1, "RadioButtonGroup - Tabindex = -1");
		assert.equal(sap.ui.getCore().byId("RBG1-0").getEnabled(), false, "RadioButton 0 - Enabled = false");
		assert.equal(jQuery("#RBG1-0").attr("tabindex"), -1, "RadioButton 0 - Tabindex = -1");
		assert.equal(sap.ui.getCore().byId("RBG1-1").getEnabled(), false, "RadioButton 1 - Enabled = false");
		assert.equal(jQuery("#RBG1-1").attr("tabindex"), -1, "RadioButton 1 - Tabindex = -1");
		assert.equal(sap.ui.getCore().byId("RBG1-2").getEnabled(), false, "RadioButton 2 - Enabled = false");
		assert.equal(jQuery("#RBG1-2").attr("tabindex"), -1, "RadioButton 2 - Tabindex = -1");
		assert.equal(sap.ui.getCore().byId("RBG1-3").getEnabled(), false, "RadioButton 3 - Enabled = false");
		assert.equal(jQuery("#RBG1-3").attr("tabindex"), -1, "RadioButton 3 - Tabindex = -1");

		oRBGroup1.setEnabled(true);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#RBG1").attr("tabindex"), -1, "RadioButtonGroup - Tabindex = -1");
		assert.equal(sap.ui.getCore().byId("RBG1-0").getEnabled(), true, "RadioButton 0 - Enabled = true");
		assert.equal(jQuery("#RBG1-0").attr("tabindex"), 0, "RadioButton 0 - Tabindex = 0");
		assert.equal(sap.ui.getCore().byId("RBG1-1").getEnabled(), true, "RadioButton 1 - Enabled = true");
		assert.equal(jQuery("#RBG1-1").attr("tabindex"), -1, "RadioButton 1 - Tabindex = -1");
		assert.equal(sap.ui.getCore().byId("RBG1-2").getEnabled(), true, "RadioButton 2 - Enabled = true");
		assert.equal(jQuery("#RBG1-2").attr("tabindex"), -1, "RadioButton 2 - Tabindex = -1");
		assert.equal(sap.ui.getCore().byId("RBG1-3").getEnabled(), true, "RadioButton 3 - Enabled = true");
		assert.equal(jQuery("#RBG1-3").attr("tabindex"), -1, "RadioButton 3 - Tabindex = -1");
	});

	QUnit.module("Appearance");

	QUnit.test("Visibility", function(assert) {
		// Visible
		assert.ok(jQuery("#RBG1").get(0), "Visible, expected defined");
		assert.equal(jQuery("#RBG2").get(0), undefined, "Invisible");
	});

	QUnit.test("Radio buttons rendered correctly", function (assert) {
		assert.ok(jQuery("#RBG1-0").get(0), "RadioButton 0, expected defined");
		assert.ok(jQuery("#RBG1-1").get(0), "RadioButton 1, expected defined");
		assert.ok(jQuery("#RBG1-2").get(0), "RadioButton 2, expected defined");
		assert.ok(jQuery("#RBG1-3").get(0), "RadioButton 3, expected defined");
	});

	QUnit.test("Output of RadioButtons in first group", function (assert) {
		// arrange
		var iOffsetLeft0 = jQuery("#RBG1-0").position().left;
		var iOffsetTop0 = jQuery("#RBG1-0").position().top;
		var iOffsetLeft1 = jQuery("#RBG1-1").position().left;
		var iOffsetTop1 = jQuery("#RBG1-1").position().top;
		var iOffsetLeft3 = jQuery("#RBG1-3").position().left;
		var iOffsetTop3 = jQuery("#RBG1-3").position().top;

		// assert
		assert.equal(iOffsetLeft0 == iOffsetLeft1, true, "Group 1: Left Position Radiobutton 0 and 1 equal");
		assert.equal(iOffsetTop0 < iOffsetTop1, true, "Group 1: Top Position Radiobutton 0 less than 1");
		assert.equal(iOffsetLeft0 == iOffsetLeft3, true, "Group 1: Left Position Radiobutton 0 and 3 equal");
		assert.equal(iOffsetTop1 < iOffsetTop3, true, "Group 1: Top Position Radiobutton 1 less than 3");
	});

	QUnit.test("Output of RadioButtons in third group", function (assert) {
		// arrange
		var iOffsetLeft0 = jQuery("#RBG3-0").position().left;
		var iOffsetTop0 = jQuery("#RBG3-0").position().top;
		var iOffsetLeft1 = jQuery("#RBG3-1").position().left;
		var iOffsetTop1 = jQuery("#RBG3-1").position().top;
		var iOffsetLeft3 = jQuery("#RBG3-3").position().left;
		var iOffsetTop3 = jQuery("#RBG3-3").position().top;

		// assert
		assert.equal(iOffsetLeft0 < iOffsetLeft1, true, "Group 3: Left Position Radiobutton 0 less than 1");
		assert.equal(iOffsetTop0 == iOffsetTop1, true, "Group 3: Top Position Radiobutton 0 equal 1");
		assert.equal(iOffsetLeft0 == iOffsetLeft3, true, "Group 3: Left Position Radiobutton 0 and 3 equal");
		assert.equal(iOffsetTop1 < iOffsetTop3, true, "Group 3: Top Position Radiobutton 0 less than 3");
	});

	QUnit.test("Output of RadioButtons in last group", function (assert) {
		var iOffsetLeft0 = jQuery("#RBG4-0").position().left,
			iOffsetTop0 = jQuery("#RBG4-0").position().top,
			iOffsetLeft1 = jQuery("#RBG4-1").position().left,
			iOffsetTop1 = jQuery("#RBG4-1").position().top;

		assert.equal(iOffsetLeft0 < iOffsetLeft1, true, "Group 4: Left Position Radiobutton 0 less than 1");
		assert.equal(iOffsetTop0 == iOffsetTop1, true, "Group 4: Top Position Radiobutton 0 equal 1");
	});

	QUnit.test("ARIA", function(assert) {
		var oRBGDom = document.getElementById('RBG1');
		assert.equal(jQuery(oRBGDom).attr("role"),"radiogroup","ARIA role");
		assert.equal(jQuery(oRBGDom).attr("aria-disabled"),"false","ARIA-disabled: for enabled field");
		assert.equal(jQuery(oRBGDom).attr("aria-invalid"),"false","ARIA-invalid: for normal field");

	});

	QUnit.module("Behaviour");

	QUnit.test("Change Selection", function(assert) {
		// via method - index
		oRBGroup1.setSelectedIndex(1);
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup1.getSelectedIndex(), 1, "SetSelectedIndex(1): SelectedIndex");
		assert.equal(oRBGroup1.getSelectedItem().getId(), "RB1-2", "SetSelectedIndex(1): SelectedItem(ID)");
		assert.equal(sap.ui.getCore().getElementById("RBG1-0").getSelected(), false, "SetSelectedIndex(1): RadioButton 0 - Selected");
		assert.equal(sap.ui.getCore().getElementById("RBG1-1").getSelected(), true, "SetSelectedIndex(1): RadioButton 1 - Selected");
		assert.equal(jQuery('#RBG1-0').attr("tabindex"),"-1","SetSelectedIndex(1): RadioButton 0 - tabindex");
		assert.equal(jQuery('#RBG1-1').attr("tabindex"),"0","SetSelectedIndex(1): RadioButton 1 - tabindex");

		// via method - item
		oRBGroup1.setSelectedItem(sap.ui.getCore().getElementById("RB1-4"));
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup1.getSelectedIndex(), 3, "SetSelectedItem(RB1-4): SelectedIndex");
		assert.equal(oRBGroup1.getSelectedItem().getId(), "RB1-4", "SetSelectedItem(RB1-4): SelectedItem(ID)");
		assert.equal(sap.ui.getCore().getElementById("RBG1-1").getSelected(), false, "SetSelectedItem(RB1-4): RadioButton 1 - Selected");
		assert.equal(sap.ui.getCore().getElementById("RBG1-3").getSelected(), true, "SetSelectedItem(RB1-4): RadioButton 3 - Selected");
		assert.equal(jQuery('#RBG1-1').attr("tabindex"),"-1","SetSelectedItem(RB1-4): RadioButton 1 - tabindex");
		assert.equal(jQuery('#RBG1-3').attr("tabindex"),"0","SetSelectedItem(RB1-4): RadioButton 3 - tabindex");

		// via mouse
		qutils.triggerMouseEvent("RBG1-1", "click");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup1.getSelectedIndex(), 1, "Mouseclick: SelectedIndex");
		assert.equal(oRBGroup1.getSelectedItem().getId(), "RB1-2", "Mouseclick: SelectedItem(ID)");
		assert.equal(sap.ui.getCore().getElementById("RBG1-3").getSelected(), false, "Mouseclick: RadioButton 3 - Selected");
		assert.equal(sap.ui.getCore().getElementById("RBG1-1").getSelected(), true, "Mouseclick: RadioButton 1 - Selected");
		assert.equal(jQuery('#RBG1-3').attr("tabindex"),"-1","Mouseclick: RadioButton 3 - tabindex");
		assert.equal(jQuery('#RBG1-1').attr("tabindex"),"0","Mouseclick: RadioButton 1 - tabindex");

	});

	QUnit.test("Keyboard Navigation", function(assert) {

		// via keyboard
		qutils.triggerKeyboardEvent("RBG3", "ARROW_RIGHT");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup3.getSelectedIndex(), 0, "Key-ARROW_RIGHT: SelectedIndex");
		assert.equal(oRBGroup3.getSelectedItem().getId(), "RB3-1", "Key-ARROW_RIGHT: SelectedItem(ID)");
		assert.equal(sap.ui.getCore().getElementById("RBG3-0").getSelected(), true, "Key-ARROW_RIGHT: RadioButton 0 - Selected");
		assert.equal(sap.ui.getCore().getElementById("RBG3-1").getSelected(), false, "Key-ARROW_RIGHT: RadioButton 1 - Selected");
		assert.equal(jQuery('#RBG3-0').attr("tabindex"),"-1","Key-ARROW_RIGHT: RadioButton 0 - tabindex");
		assert.equal(jQuery('#RBG3-1').attr("tabindex"),"0","Key-ARROW_RIGHT: RadioButton 0 - tabindex");

		qutils.triggerKeyboardEvent("RBG3", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_RIGHT");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup3.getSelectedIndex(), 6, "Key-ARROW_RIGHT (5 times): SelectedIndex");

		qutils.triggerKeyboardEvent("RBG3", "ARROW_RIGHT");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup3.getSelectedIndex(), 0, "Key-ARROW_RIGHT: SelectedIndex");

		qutils.triggerKeyboardEvent("RBG3", "ARROW_RIGHT", false, false, true);
		qutils.triggerKeyboardEvent("RBG3", "ARROW_RIGHT", false, false, true);
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup3.getSelectedIndex(), 0, "Key-ARROW_RIGHT+CTRL: SelectedIndex");
		assert.equal(oRBGroup3.getSelectedItem().getId(), "RB3-1", "Key-ARROW_RIGHT+CTRL: SelectedItem(ID)");
		assert.equal(sap.ui.getCore().getElementById("RBG3-0").getSelected(), true, "Key-ARROW_RIGHT+CTRL: RadioButton 0 - Selected");
		assert.equal(sap.ui.getCore().getElementById("RBG3-2").getSelected(), false, "Key-ARROW_RIGHT+CTRL: RadioButton 2 - Selected");
		assert.equal(jQuery('#RBG3-0').attr("tabindex"),"-1","Key-ARROW_RIGHT+CTRL: RadioButton 0 - tabindex");
		assert.equal(jQuery('#RBG3-2').attr("tabindex"),"0","Key-ARROW_RIGHT+CTRL: RadioButton 2 - tabindex");

		qutils.triggerKeyboardEvent("RBG3-2", "SPACE");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup3.getSelectedIndex(), 2, "Key-SPACE: SelectedIndex");
		assert.equal(oRBGroup3.getSelectedItem().getId(), "RB3-3", "Key-SPACE: SelectedItem(ID)");
		assert.equal(sap.ui.getCore().getElementById("RBG3-0").getSelected(), false, "Key-SPACE: RadioButton 0 - Selected");
		assert.equal(sap.ui.getCore().getElementById("RBG3-2").getSelected(), true, "Key-SPACE: RadioButton 2 - Selected");
		assert.equal(jQuery('#RBG3-0').attr("tabindex"),"-1","Key-SPACE: RadioButton 0 - tabindex");
		assert.equal(jQuery('#RBG3-2').attr("tabindex"),"0","Key-SPACE: RadioButton 2 - tabindex");

		qutils.triggerKeyboardEvent("RBG3", "ARROW_LEFT");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_LEFT");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_LEFT");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_LEFT");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup3.getSelectedIndex(), 5, "Key-ARROW_LEFT (4 times): SelectedIndex");

		qutils.triggerKeyboardEvent("RBG3", "ARROW_UP");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_UP");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_UP");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_UP");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup3.getSelectedIndex(), 6, "Key-ARROW_UP (4 times): SelectedIndex");

		qutils.triggerKeyboardEvent("RBG3", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("RBG3", "ARROW_DOWN");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup3.getSelectedIndex(), 0, "Key-ARROW_DOWN (5 times): SelectedIndex");

	});

	QUnit.test("TestCleanUp", function(assert) {
		assert.ok(!!sap.ui.getCore().byId("RBG1-0"), "RBG1-0 must exist");
		assert.ok(!!sap.ui.getCore().byId("RBG1-1"), "RBG1-1 must exist");
		assert.ok(!!sap.ui.getCore().byId("RBG1-2"), "RBG1-2 must exist");
		assert.ok(!!sap.ui.getCore().byId("RBG1-3"), "RBG1-3 must exist");
		oRBGroup1.destroy();
		assert.ok(!sap.ui.getCore().byId("RBG1-0"), "RBG1-0 must no longer exist");
		assert.ok(!sap.ui.getCore().byId("RBG1-1"), "RBG1-1 must no longer exist");
		assert.ok(!sap.ui.getCore().byId("RBG1-2"), "RBG1-2 must no longer exist");
		assert.ok(!sap.ui.getCore().byId("RBG1-3"), "RBG1-3 must no longer exist");
	});
});