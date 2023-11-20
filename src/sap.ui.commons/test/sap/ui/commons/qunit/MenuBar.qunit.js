/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/MenuBar",
	"sap/ui/commons/MenuItem",
	"sap/ui/commons/Menu"
], function(qutils, createAndAppendDiv, MenuBar, MenuItem, Menu) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4", "uiArea5", "uiArea6"]);



	var createMenuBar = function(iIdSuffix, oProps){
		var oMenuBar = new MenuBar("menubar" + iIdSuffix, oProps);
		for (var i = 0; i < 6; i++){
			var sItemId = oMenuBar.getId() + "_item" + (i + 1);
			var oMenuItem = new MenuItem(sItemId, {
				text: "Item " + (i + 1),
				tooltip: "Item " + (i + 1) + " Tooltip",
				enabled: i != 3,
				visible: i != 2
			});
			oMenuBar.addItem(oMenuItem);
			var oMenu = new Menu(sItemId + "_menu");
			oMenu.addItem(new MenuItem(sItemId + "_menuitem", {text: "Item " + (i + 1) + "-1"}));
			oMenuItem.setSubmenu(oMenu);
		}
		oMenuBar.placeAt("uiArea" + iIdSuffix);
		return oMenuBar;
	};

	var oMenuBar1 = createMenuBar(1); //Menubar with default properties
	var oMenuBar2 = createMenuBar(2, {design: "Header"}); //Menubar with Header design
	var oMenuBar3 = createMenuBar(3, {visible: false}); //Invisible Menubar
	var oMenuBar4 = createMenuBar(4, {enabled: false}); //Disabled Menubar
	var oMenuBar5 = createMenuBar(5, {width: "150px"}); //Menubar with fixed width (Overflow should happen)
	var oMenuBar6 = createMenuBar(6, {width: "150px", enabled: false}); //Disabled Menubar with fixed width (Overflow should happen)



	var checkFocus = function(sId, sText, assert){
		assert.equal(document.activeElement.id, sId, sText);
	};

	var triggerKeyBoardAndCheckFocus = function(sMenuBarId, sKey, oItem, assert){
		qutils.triggerKeyboardEvent(sMenuBarId, sKey);
		var sItemId = sMenuBarId + "_item" + oItem;
		var sItemName = "Item " + oItem;
		if (oItem == "ovrflw"){
			sItemId = sMenuBarId + "-ovrflw";
			sItemName = "Overflow";
		}
		checkFocus(sItemId, sItemName + " is focused after " + sKey, assert);
	};

	var checkMenuOpenedAndClosed = function(oMenuBar, oItem, bShouldBeOpen, sAction, assert){
		var oMenu = oItem == "ovrflw" ? oMenuBar.oOvrFlwMnu : oMenuBar.getItems()[oItem - 1].getSubmenu();
		if (bShouldBeOpen){
			assert.ok(oMenu.bOpen, "Menu is opened on " + sAction);
			var sId = oItem == "ovrflw" ? oMenuBar.oOvrFlwMnu.getItems()[1].getId() : oMenuBar.getId() + "_item" + oItem + "_menuitem";
			qutils.triggerKeyboardEvent(sId, "ESCAPE"); //Close the menu
			assert.ok(!oMenu.bOpen, "Menu is closed on Escape");
		} else {
			assert.ok(!oMenu.bOpen, "Menu is not opened on " + sAction);
		}
	};



	QUnit.module("Properties and Aggregations");

	QUnit.test("Properties - Default Values", function(assert) {
		assert.equal(oMenuBar1.getDesign(), "Standard", "Default 'design'");
		assert.equal(oMenuBar1.getWidth(), "100%", "Default 'width'");
		assert.equal(oMenuBar1.getEnabled(), true, "Default 'enabled'");
		assert.equal(oMenuBar1.getVisible(), true, "Default 'visible'");
	});

	QUnit.test("Properties - Custom Values", function(assert) {
		assert.equal(oMenuBar2.getDesign(), "Header", "Custom 'design'");
		assert.equal(oMenuBar5.getWidth(), "150px", "Custom 'width'");
		assert.equal(oMenuBar4.getEnabled(), false, "Custom 'enabled'");
		assert.equal(oMenuBar3.getVisible(), false, "Custom 'visible'");
	});

	QUnit.test("Aggregation 'Items'", function(assert) {
		assert.equal(oMenuBar3.getItems().length, 6, "# Items");
		oMenuBar3.removeItem(5);
		assert.equal(oMenuBar3.getItems().length, 5, "# Items after remove");
		oMenuBar3.insertItem(new MenuItem("newmenuitem"), 1);
		assert.equal(oMenuBar3.getItems().length, 6, "# Items after insert");
		assert.equal(oMenuBar3.getItems()[1].getId(), "newmenuitem", "Id of inserted Item");
		oMenuBar3.destroyItems();
		assert.equal(oMenuBar3.getItems().length, 0, "# Items after destroy");
	});

	QUnit.module("Appearance");

	QUnit.test("Visibility", function(assert) {
		assert.equal(jQuery("#menubar1").length, 1, "Visible MenuBar is rendered");
		assert.equal(jQuery("#menubar3").length, 0, "Hidden MenuBar is not rendered");

		assert.equal(jQuery("#menubar1_item3").length, 0, "Hidden Menu item is not rendered");
	});

	QUnit.test("Width", function(assert) {
		assert.equal(jQuery("#menubar1").outerWidth(), jQuery("#uiArea1").width(), "By default the MenuBar has 100% width");
		assert.equal(jQuery("#menubar5").outerWidth(), 150, "Fixed MenuBar width");
	});

	QUnit.test("Enablement", function(assert) {
		assert.ok(!jQuery("#menubar1").hasClass("sapUiMnuBarDsbl"), "Enabled MenuBar has no special CSS class");
		assert.ok(jQuery("#menubar4").hasClass("sapUiMnuBarDsbl"), "Disabled MenuBar has special CSS class");
		//All items (incl. overflow) are disabled
		var jItems = jQuery("#menubar6-area").children();
		jItems.each(function(iIdx){
			assert.ok(jQuery(this).hasClass("sapUiMnuBarItmDsbl"), "Item " + iIdx + " disabled on disabled MenuBar");
		});

		assert.ok(jQuery("#menubar1_item4").hasClass("sapUiMnuBarItmDsbl"), "Item 4 disabled on enabled MenuBar");
	});

	QUnit.test("Design", function(assert) {
		assert.ok(!jQuery("#menubar1").hasClass("sapUiMnuBarHeader"), "Standard MenuBar has no special CSS class");
		jQuery("#menubar1").get(0).focus();
		qutils.triggerKeyboardEvent("menubar1_item1", "SPACE"); //Open the menu
		assert.ok(!jQuery("#menubar1_item1_menu").hasClass("sapUiMnuBarHeader"), "Standard Menu has no special CSS class");
		qutils.triggerKeyboardEvent("menubar1_item1_menuitem", "ESCAPE"); //Close the menu

		assert.ok(jQuery("#menubar2").hasClass("sapUiMnuBarHeader"), "Header MenuBar has special CSS class");
		jQuery("#menubar2").get(0).focus();
		qutils.triggerKeyboardEvent("menubar2_item1", "SPACE"); //Open the menu
		assert.ok(jQuery("#menubar2_item1_menu").hasClass("sapUiMnuTop"), "Header Menu has special CSS class");
		qutils.triggerKeyboardEvent("menubar2_item1_menuitem", "ESCAPE"); //Close the menu
	});

	QUnit.test("Overflow", function(assert) {
		var done = assert.async();

		setTimeout(function(){
			assert.ok(!jQuery("#menubar1-ovrflw").is(":visible"), "Overflow hidden if enough space");
			assert.ok(jQuery("#menubar5-ovrflw").is(":visible"), "Overflow visible if not enough space");
			assert.equal(oMenuBar5.oOvrFlwMnu.getItems().length, 4, "# Items in overflow menu");

			done();
		}, 100);
	});

	QUnit.module("Interaction - Mouse");

	QUnit.test("Click on item", function(assert) {
		qutils.triggerEvent("click", "menubar1_item5", {});
		checkMenuOpenedAndClosed(oMenuBar1, 5, true, "click", assert);
	});

	QUnit.test("Click on disabled item", function(assert) {
		qutils.triggerEvent("click", "menubar1_item4", {});
		checkMenuOpenedAndClosed(oMenuBar1, 4, false, "click", assert);
	});

	QUnit.test("Click on overflow", function(assert) {
		qutils.triggerEvent("click", "menubar5-ovrflw", {});
		checkMenuOpenedAndClosed(oMenuBar5, "ovrflw", true, "click", assert);
	});

	QUnit.test("Click on disabled overflow", function(assert) {
		qutils.triggerEvent("click", "menubar6-ovrflw", {});
		checkMenuOpenedAndClosed(oMenuBar6, "ovrflw", false, "click", assert);
	});

	QUnit.module("Interaction - Keyboard");

	QUnit.test("Item navigation", function(assert) {
		var done = assert.async();
		jQuery("#menubar1").get(0).focus();
		setTimeout(function(){
			checkFocus("menubar1_item1", "First item is focused when entering the MenuBar", assert);
			triggerKeyBoardAndCheckFocus("menubar1", "ARROW_RIGHT", 2, assert);
			triggerKeyBoardAndCheckFocus("menubar1", "ARROW_LEFT", 1, assert);
			triggerKeyBoardAndCheckFocus("menubar1", "ARROW_RIGHT", 2, assert);
			triggerKeyBoardAndCheckFocus("menubar1", "ARROW_LEFT", 1, assert);
			triggerKeyBoardAndCheckFocus("menubar1", "ARROW_LEFT", 1, assert);
			done();
		}, 0);
	});

	QUnit.test("Item navigation with overflow", function(assert) {
		var done = assert.async();
		jQuery("#menubar5").get(0).focus();
		setTimeout(function(){
			checkFocus("menubar5_item1", "First item is focused when entering the MenuBar", assert);
			triggerKeyBoardAndCheckFocus("menubar5", "ARROW_RIGHT", 2, assert);
			triggerKeyBoardAndCheckFocus("menubar5", "ARROW_RIGHT", "ovrflw", assert);
			triggerKeyBoardAndCheckFocus("menubar5", "ARROW_LEFT", 2, assert);
			done();
		}, 0);
	});

	QUnit.test("Enter on item", function(assert) {
		qutils.triggerKeyboardEvent("menubar1_item5", "ENTER");
		checkMenuOpenedAndClosed(oMenuBar1, 5, true, "ENTER", assert);
	});

	QUnit.test("Enter on disabled item", function(assert) {
		qutils.triggerKeyboardEvent("menubar1_item4", "ENTER");
		checkMenuOpenedAndClosed(oMenuBar1, 4, false, "ENTER", assert);
	});

	QUnit.test("Enter on overflow", function(assert) {
		qutils.triggerKeyboardEvent("menubar5-ovrflw", "ENTER");
		checkMenuOpenedAndClosed(oMenuBar5, "ovrflw", true, "ENTER", assert);
	});

	QUnit.test("Enter on disabled overflow", function(assert) {
		qutils.triggerKeyboardEvent("menubar6-ovrflw", "ENTER");
		checkMenuOpenedAndClosed(oMenuBar6, "ovrflw", false, "ENTER", assert);
	});

	QUnit.test("Space on item", function(assert) {
		qutils.triggerKeyboardEvent("menubar1_item5", "SPACE");
		checkMenuOpenedAndClosed(oMenuBar1, 5, true, "SPACE", assert);
	});

	QUnit.test("Space on disabled item", function(assert) {
		qutils.triggerKeyboardEvent("menubar1_item4", "SPACE");
		checkMenuOpenedAndClosed(oMenuBar1, 4, false, "SPACE", assert);
	});

	QUnit.test("Space on overflow", function(assert) {
		qutils.triggerKeyboardEvent("menubar5-ovrflw", "SPACE");
		checkMenuOpenedAndClosed(oMenuBar5, "ovrflw", true, "SPACE", assert);
	});

	QUnit.test("Space on disabled overflow", function(assert) {
		qutils.triggerKeyboardEvent("menubar6-ovrflw", "SPACE");
		checkMenuOpenedAndClosed(oMenuBar6, "ovrflw", false, "SPACE", assert);
	});

	QUnit.test("Alt+Down on item", function(assert) {
		qutils.triggerKeyboardEvent("menubar1_item5", "ARROW_DOWN", false, true, false);
		checkMenuOpenedAndClosed(oMenuBar1, 5, true, "ALT+ARROW_DOWN", assert);
	});

	QUnit.test("Alt+Down on disabled item", function(assert) {
		qutils.triggerKeyboardEvent("menubar1_item4", "ARROW_DOWN", false, true, false);
		checkMenuOpenedAndClosed(oMenuBar1, 4, false, "ALT+ARROW_DOWN", assert);
	});

	QUnit.test("Alt+Down on overflow", function(assert) {
		qutils.triggerKeyboardEvent("menubar5-ovrflw", "ARROW_DOWN", false, true, false);
		checkMenuOpenedAndClosed(oMenuBar5, "ovrflw", true, "ALT+ARROW_DOWN", assert);
	});

	QUnit.test("Alt+Down on disabled overflow", function(assert) {
		qutils.triggerKeyboardEvent("menubar6-ovrflw", "ARROW_DOWN", false, true, false);
		checkMenuOpenedAndClosed(oMenuBar6, "ovrflw", false, "ALT+ARROW_DOWN", assert);
	});

	QUnit.test("Down on item", function(assert) {
		qutils.triggerKeyboardEvent("menubar1_item5", "ARROW_DOWN");
		checkMenuOpenedAndClosed(oMenuBar1, 5, true, "ARROW_DOWN", assert);
	});

	QUnit.test("Down on disabled item", function(assert) {
		qutils.triggerKeyboardEvent("menubar1_item4", "ARROW_DOWN");
		checkMenuOpenedAndClosed(oMenuBar1, 4, false, "ARROW_DOWN", assert);
	});

	QUnit.test("Down on overflow", function(assert) {
		qutils.triggerKeyboardEvent("menubar5-ovrflw", "ARROW_DOWN");
		checkMenuOpenedAndClosed(oMenuBar5, "ovrflw", true, "ARROW_DOWN", assert);
	});

	QUnit.test("Down on disabled overflow", function(assert) {
		qutils.triggerKeyboardEvent("menubar6-ovrflw", "ARROW_DOWN");
		checkMenuOpenedAndClosed(oMenuBar6, "ovrflw", false, "ARROW_DOWN", assert);
	});
});