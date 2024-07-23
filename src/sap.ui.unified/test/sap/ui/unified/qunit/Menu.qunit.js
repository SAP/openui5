/*global QUnit, sinon */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/ui/unified/MenuItemBase",
	"sap/ui/unified/MenuTextFieldItem",
	"sap/ui/unified/MenuItemGroup",
	"sap/m/Button",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Popup",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	// jQuery Plugin "cursorPos"
	"sap/ui/dom/jquery/cursorPos"
], function(Localization, Element, qutils, nextUIUpdate, Menu, MenuItem, MenuItemBase, MenuTextFieldItem, MenuItemGroup, Button, Device, KeyCodes, Popup, jQuery, Control) {
	"use strict";

	var Dock = Popup.Dock;

	var oMenuItems = {};
	var oMenus = {};
	var lastSelectedItemId = null;

	var createMenu = function(idx, bIsSubmenu){
		var sId = "menu" + idx;
		var oMenu = new Menu(sId);
		oMenus[sId] = oMenu;
		return oMenu;
	};

	var createMenuItem = function(idx, sText, bIcon, bEnabled, bVisible, oSubMenu, bSection){
		var sId = "item" + idx;
		var oMenuItem = new MenuItem(sId);
		if (sText) { oMenuItem.setText(sText); }
		if (bIcon) { oMenuItem.setIcon("../images/help.gif"); }
		if (bEnabled != -1) { oMenuItem.setEnabled(bEnabled); }
		if (bVisible != -1) { oMenuItem.setVisible(bVisible); }
		if (bSection) { oMenuItem.setStartsSection(true); }
		if (oSubMenu) { oMenuItem.setSubmenu(oSubMenu); }
		oMenuItem.attachSelect(function(oControlEvent){
			lastSelectedItemId = oControlEvent.getParameter("id");
		});
		oMenuItems[sId] = oMenuItem;
		return oMenuItem;
	};

	var toggleMenuItemsEnabling = function(oMenu) {
		var oMenuItems = oMenu.getItems();
		for (var i = 0; i < oMenuItems.length; i++) {
			oMenuItems[i].setEnabled(!oMenuItems[i].getEnabled());
		}
	};

	createMenuItem(1, null, false, -1, -1, null); //Default values only
	createMenuItem(2, "Text", true, false, false, createMenu(1, true)); //All properties set

	var oRootMenu = createMenu(2, false);
	var oSubMenu = createMenu(3, true);
	var oSubSubMenu = createMenu(4, true);
	oRootMenu.addItem(createMenuItem(3, "I3", false, -1, -1, null));
	oRootMenu.addItem(createMenuItem(4, "I4", true, -1, -1, null, true));
	oRootMenu.addItem(createMenuItem(5, "I5", false, false, -1, null));
	oRootMenu.addItem(createMenuItem(6, "I6", false, true, false, null));
	oRootMenu.addItem(createMenuItem(7, "I7", false, -1, -1, oSubMenu));
	oSubMenu.addItem(createMenuItem(8, "I8", false, -1, -1, null));
	oSubMenu.addItem(createMenuItem(9, "I9", false, -1, -1, null));
	oSubMenu.addItem(createMenuItem(10, "I10", false, false, -1, oSubSubMenu));

	var oButton = new Button("button", {text: "Open Menu", press: function(){
		oRootMenu.open(false, null, Dock.LeftTop, Dock.LeftTop, document, "0 0");
	}});
	oButton.placeAt("qunit-fixture");

	var oSpecialMenu = createMenu(5, false);
	oSpecialMenu.addItem(createMenuItem(11, "I11", false, -1, -1, null));
	oMenuItems["item12"] = new MenuTextFieldItem("item12", {value: "FilterValue", label: "Filter", select: function(oControlEvent){
		lastSelectedItemId = oControlEvent.getParameter("id");
	}});
	oSpecialMenu.addItem(oMenuItems["item12"]);
	oSpecialMenu.addItem(createMenuItem(13, "I13", false, -1, -1, null));

	var oLongMenu = createMenu(14, false);
	for (var i = 15; i < 115; i++) {
		oLongMenu.addItem(createMenuItem(i, "I" + i, false, (i % 7 > 0), -1, null));
	}

	oButton = new Button("button3", {text: "Open Menu 2", press: function(){
		oSpecialMenu.open(false, null, Dock.LeftTop, Dock.LeftTop, document, "0 0");
	}});
	oButton.placeAt("qunit-fixture");

	oButton = new Button("button4", {text: "Open Menu 3", press: function(){
		oLongMenu.open(false, null, Dock.LeftTop, Dock.LeftTop, document, "0 0");
	}});
	oButton.placeAt("qunit-fixture");

	oButton = new Button("button2", {text: "Toggle Menu Enabling", press: function(){
		oRootMenu.setEnabled(!oRootMenu.getEnabled());
		oSpecialMenu.setEnabled(!oSpecialMenu.getEnabled());
		oLongMenu.setEnabled(!oLongMenu.getEnabled());
	}});

	oButton.placeAt("qunit-fixture");

	oButton = new Button("button5", {text: "Toggle Menu Items Enabling", press: function(){
		toggleMenuItemsEnabling(oRootMenu);
		toggleMenuItemsEnabling(oSpecialMenu);
		toggleMenuItemsEnabling(oLongMenu);
	}});

	oButton.placeAt("qunit-fixture");

	/* Expected Menu Structure:
		------------------------

		+-------------+
		|   I3        |
		| # I4        |
		|   I5 (dis.) |
		|   I7      > |+----------------+
		+-------------+|   I8           |
						|   I9           |
						|   I10 (dis.) > |+----------------+
						+----------------++----------------+

		+--------------+
		|   I11        |
		|   I12 (TF)   |
		|   I13        |
		+--------------+

		+--------------+
		|   I15        |
		|   I16        |
		|   I17        |
			...
		|   I115       |
		+--------------+

	*/

	var checkHoveredItem = function(sExpectedId, oMenu, assert){
		if (!oMenu){
			oMenu = oRootMenu;
		}
		if (sExpectedId){
			assert.ok(oMenu.oHoveredItem, "Hovered Item exists");
			if (oMenu.oHoveredItem) {
				assert.equal(oMenu.oHoveredItem.getId(), sExpectedId, "Correct item '" + sExpectedId + "' hovered:");
			}
		} else {
			assert.ok(!oMenu.oHoveredItem, "Hovered Item doesn't exist");
		}
	};
	var checkFocusedItem = function(sExpectedId, assert) {
		assert.equal(document.activeElement.id, sExpectedId, "Correct item '" + sExpectedId + "' focused:");
	};
	var checkMenusClosed = function(sText, assert){
		sText = sText ? " (" + sText + ")" : "";
		assert.ok(!oRootMenu.isOpen(), "Rootmenu closed" + sText);
		assert.ok(!oSubMenu.isOpen(), "Submenu closed" + sText);
		assert.ok(!oSpecialMenu.isOpen(), "Menu with special items closed" + sText);
	};

	var closeAllMenusAndCheck = function(assert){
		oRootMenu.close();
		oSpecialMenu.close();
		oLongMenu.close();
		checkMenusClosed(undefined, assert);
	};

	var openMenu = function(oMenu, bWithMouse, assert){
		var oDomRef = jQuery("#qunit-fixture").get(0);
		oMenu.open(!bWithMouse, oDomRef, Dock.LeftTop, Dock.LeftTop, oDomRef, "5 5");
		assert.ok(oMenu.isOpen(), "Menu opened");
	};

	var openRootMenu = function(bWithMouse, assert){
		openMenu(oRootMenu, bWithMouse, assert);
	};

	var triggerKey = function(target, sKey){
		qutils.triggerKeydown(target, sKey); //keydown
		qutils.triggerKeyEvent("keyup", target, sKey); //keyup
	};

	var triggerSpace = function(target){
		triggerKey(target, "SPACE");
	};

	QUnit.module("Properties an Aggregations");

	QUnit.test("Item - Default Values", function(assert) {
		var oItem = oMenuItems["item1"];
		assert.equal(oItem.getText(), "", "Default 'text':");
		assert.equal(oItem.getIcon(), "", "Default 'icon':");
		assert.equal(oItem.getEnabled(), true, "Default 'enabled':");
		assert.equal(oItem.getVisible(), true, "Default 'visible':");
		assert.equal(oItem.getSubmenu(), null, "Default 'submenu':");
	});

	QUnit.test("Item - Custom Values", function(assert) {
		var oItem = oMenuItems["item2"];
		assert.equal(oItem.getText(), "Text", "Custom 'text':");
		assert.equal(oItem.getIcon(), "../images/help.gif", "Custom 'icon':");
		assert.equal(oItem.getEnabled(), false, "Custom 'enabled':");
		assert.equal(oItem.getVisible(), false, "Custom 'visible':");
		var oItemSubmenu = oItem.getSubmenu();
		assert.ok(oItemSubmenu, "Submenu available");
		if (oItemSubmenu) {
			assert.equal(oItem.getSubmenu().getId(), "menu1", "Custom 'submenu':");
		}
	});

	QUnit.test("Menu - Default Values", function(assert) {
		assert.equal(oRootMenu.getEnabled(), true, "Default 'enabled':");
		assert.equal(oRootMenu.getPageSize(), 5, "Default 'page size':");
	});

	QUnit.test("Menu - Custom Values", function(assert) {
		qutils.triggerEvent("tap", "button2", {});
		assert.equal(oRootMenu.getEnabled(), false, "Custom 'enabled':");
		qutils.triggerEvent("tap", "button2", {});
		assert.equal(oRootMenu.getEnabled(), true, "Custom 'enabled':");
	});

	QUnit.test("Menu - Item Aggregation", function(assert) {
		var done = assert.async();
		var oMenu = new Menu();
		openMenu(oMenu, true, assert);
		oMenu.addItem(new MenuItem());
		assert.equal(oMenu.getItems().length, 1, "Number of items after add");
		var oItem = new MenuItem();
		oMenu.insertItem(oItem, 0);
		assert.equal(oMenu.getItems().length, 2, "Number of items after insert");
		assert.equal(oMenu.getItems()[0].getId(), oItem.getId(), "Item at first position");
		oMenu.removeItem(oItem);
		assert.equal(oMenu.getItems().length, 1, "Number of items after remove");
		oMenu.removeAllItems();
		assert.equal(oMenu.getItems().length, 0, "Number of items after removeAll");
		oMenu.addItem(new MenuItem());
		assert.equal(oMenu.getItems().length, 1, "Number of items after add");
		oMenu.destroyItems();
		assert.equal(oMenu.getItems().length, 0, "Number of items after destroyItems");
		setTimeout(function(){
			oMenu.close();
			oMenu.destroy();
			done();
		}, 100);
	});

	QUnit.module("Keyboard");

	/* if menu is opened from keyboard, the first enabled item sould be hovered and focused*/
	QUnit.test("Check Hover State upon Menu.open", function(assert) {
		// prepare
		var oMenuTextFiledItem = new MenuTextFieldItem("item14", {});

		// act
		// assert
		openRootMenu(false, assert);
		checkHoveredItem("item3", undefined, assert);
		checkFocusedItem("item3", assert);
		assert.strictEqual(oRootMenu.oHoveredItem.getId(), document.activeElement.id, "Correct item '" + document.activeElement.id + "' focused:");

		// act
		oSpecialMenu.insertItem(oMenuTextFiledItem, 0);

		// assert
		openMenu(oSpecialMenu, false, assert);
		assert.strictEqual(document.querySelector("#item14 input").id, document.activeElement.id, "Correct item '" + document.activeElement.id + "' focused:");

		closeAllMenusAndCheck(assert);

		// act
		/* try on a menu with the first two items disabled */
		qutils.triggerEvent("tap", "button5", {});

		// assert
		assert.equal(oRootMenu.getEnabled(), true, "Custom 'enabled':");
		assert.equal(oRootMenu.getItems()[0].getEnabled(), false, "Custom 'enabled':");
		assert.equal(oRootMenu.getItems()[1].getEnabled(), false, "Custom 'enabled':");
		openRootMenu(false, assert);
		checkHoveredItem("item3", undefined, assert);
		checkFocusedItem("item3", assert);
		qutils.triggerEvent("tap", "button5", {});
		closeAllMenusAndCheck(assert);

		// cleanup
		oSpecialMenu.removeItem(oMenuTextFiledItem);
	});

	/* ARROW_UP/ARROW_DOWN should hover one item up/down, skipping any disabled items */
	QUnit.test("Check Hover State and Arrow up / Arrow down", function(assert) {
		openRootMenu(false, assert);
		checkHoveredItem("item3", undefined, assert);
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		checkHoveredItem("item4", undefined, assert);
		checkFocusedItem("item4", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		checkHoveredItem("item5", undefined, assert);
		checkFocusedItem("item5", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		checkHoveredItem("item7", undefined, assert);
		checkFocusedItem("item7", assert);
		closeAllMenusAndCheck(assert);
	});

	QUnit.test("Shift + Arrow up / Arrow down", function(assert) {
		openRootMenu(false, assert);
		checkHoveredItem("item3", undefined, assert);
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN", true);
		checkHoveredItem("item4", undefined, assert);
		checkFocusedItem("item4", assert);

		qutils.triggerKeydown("menu2", "ARROW_UP", true);
		checkHoveredItem("item3", undefined, assert);
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN", true);
		checkHoveredItem("item4", undefined, assert);
		checkFocusedItem("item4", assert);

		qutils.triggerKeydown("menu2", "ARROW_DOWN", true);
		checkHoveredItem("item5", undefined, assert);
		checkFocusedItem("item5", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN", true);
		checkHoveredItem("item7", undefined, assert);
		checkFocusedItem("item7", assert);
		closeAllMenusAndCheck(assert);
	});

	QUnit.test("Ctrl + Arrow up / Arrow down", function(assert) {
		openRootMenu(false, assert);
		checkHoveredItem("item3", undefined, assert);
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN", false, false, true);
		checkHoveredItem("item4", undefined, assert);
		checkFocusedItem("item4", assert);

		qutils.triggerKeydown("menu2", "ARROW_UP", false, false, true);
		checkHoveredItem("item3", undefined, assert);
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN", false, false, true);
		checkHoveredItem("item4", undefined, assert);
		checkFocusedItem("item4", assert);

		qutils.triggerKeydown("menu2", "ARROW_DOWN", false, false, true);
		checkHoveredItem("item5", undefined, assert);
		checkFocusedItem("item5", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN", false, false, true);
		checkHoveredItem("item7", undefined, assert);
		checkFocusedItem("item7", assert);
		closeAllMenusAndCheck(assert);
	});

	/* RIGHT key should have no effect on a menu with no submenu */
	QUnit.test("Check Hover State and ARROW_RIGHT", function(assert) {
		openRootMenu(true, assert);
		checkHoveredItem("item3", undefined, assert); /* no hovered item since opened with mouse */
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu2", "ARROW_RIGHT");
		checkHoveredItem("item3", undefined, assert); /* no change */
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		checkHoveredItem("item4", undefined, assert);
		checkFocusedItem("item4", assert);
		qutils.triggerKeydown("menu2", "ARROW_RIGHT");
		checkHoveredItem("item4", undefined, assert); /* no change */
		checkFocusedItem("item4", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		checkHoveredItem("item5", undefined, assert);
		checkFocusedItem("item5", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_RIGHT");
		checkHoveredItem("item8", oSubMenu, assert);
		checkFocusedItem("item8", assert);

		closeAllMenusAndCheck(assert);
	});

	/* LEFT key should have no effect on a menu with no parent menu */
	QUnit.test("Check Hover State and LEFT", function(assert) {
		openRootMenu(false, assert);
		checkHoveredItem("item3", undefined, assert);
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu2", "ARROW_LEFT");
		checkHoveredItem("item3", undefined, assert); /* no change */
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		checkHoveredItem("item4", undefined, assert);
		checkFocusedItem("item4", assert);
		qutils.triggerKeydown("menu2", "ARROW_LEFT");
		checkHoveredItem("item4", undefined, assert); /* no change */
		checkFocusedItem("item4", assert);
		closeAllMenusAndCheck(assert);
	});

	/* PAGE_UP/PAGE_DOWN should hover one pageSize up/down, skipping any disabled items */
	QUnit.test("Check Hover State and Page up / Page down", function(assert) {
		openMenu(oLongMenu, false, assert);
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);
		qutils.triggerKeydown("menu14", "PAGE_DOWN");
		checkHoveredItem("item20", oLongMenu, assert);
		checkFocusedItem("item20", assert);
		qutils.triggerKeydown("menu14", "PAGE_DOWN");
		checkHoveredItem("item25", oLongMenu, assert);
		checkFocusedItem("item25", assert);
		qutils.triggerKeydown("menu14", "PAGE_DOWN");
		checkHoveredItem("item30", oLongMenu, assert);
		checkFocusedItem("item30", assert);
		qutils.triggerKeydown("menu14", "PAGE_DOWN");
		checkHoveredItem("item35", oLongMenu, assert);
		checkFocusedItem("item35", assert);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item30", oLongMenu, assert);
		checkFocusedItem("item30", assert);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item25", oLongMenu, assert);
		checkFocusedItem("item25", assert);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item20", oLongMenu, assert); /* disabled item I21 skipped */
		checkFocusedItem("item20", assert);
		closeAllMenusAndCheck(assert);
	});

	/* PAGE_UP/PAGE_DOWN should respect the current "pageSize" value of the menu */
	QUnit.test("Custom page size and Page up / Page down", function(assert) {
		oLongMenu.setPageSize(10);
		openMenu(oLongMenu, false, assert);
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);
		qutils.triggerKeydown("menu14", "PAGE_DOWN");
		checkHoveredItem("item25", oLongMenu, assert);
		checkFocusedItem("item25", assert);
		qutils.triggerKeydown("menu14", "PAGE_DOWN");
		checkHoveredItem("item35", oLongMenu, assert);
		checkFocusedItem("item35", assert);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item25", oLongMenu, assert);
		checkFocusedItem("item25", assert);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);

		oLongMenu.setPageSize(200);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);
		qutils.triggerKeydown("menu14", "PAGE_DOWN");
		checkHoveredItem("item114", oLongMenu, assert);
		checkFocusedItem("item114", assert);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);

		oLongMenu.setPageSize(0); /* value < 1,
		so infinite number of items per page,
		so PAGE_UP will behave like HOME
		and PAGE_DOW will behave like END */
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);
		qutils.triggerKeydown("menu14", "PAGE_DOWN");
		checkHoveredItem("item114", oLongMenu, assert);
		checkFocusedItem("item114", assert);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);

		oLongMenu.setPageSize(-1); /* value < 1,
		so infinite number of items per page,
		so PAGE_UP will behave like HOME
		and PAGE_DOW will behave like END */
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);
		qutils.triggerKeydown("menu14", "PAGE_DOWN");
		checkHoveredItem("item114", oLongMenu, assert);
		checkFocusedItem("item114", assert);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);

		oLongMenu.setPageSize(5); /* restore to default value */
		closeAllMenusAndCheck(assert);
	});

	/* HOME/END should hover to the first/last enabled menu-item [i.e. skipping any disabled items] */
	QUnit.test("Check Hover State and Home / End", function(assert) {
		openMenu(oLongMenu, false, assert);
		qutils.triggerKeydown("menu14", "END");
		checkHoveredItem("item114", oLongMenu, assert);
		checkFocusedItem("item114", assert);
		qutils.triggerKeydown("menu14", "HOME");
		checkHoveredItem("item15", oLongMenu, assert);
		checkFocusedItem("item15", assert);
		closeAllMenusAndCheck(assert);

		/* try on a menu with the first and last items disabled */
		qutils.triggerEvent("tap", "button5", {});
		assert.equal(oLongMenu.getEnabled(), true, "Custom 'enabled':");
		/* beforeEach: first 6 menu-items are disabled */
		assert.equal(oLongMenu.getItems()[0].getEnabled(), false, "Custom 'enabled':");
		assert.equal(oLongMenu.getItems()[1].getEnabled(), false, "Custom 'enabled':");
		assert.equal(oLongMenu.getItems()[2].getEnabled(), false, "Custom 'enabled':");
		assert.equal(oLongMenu.getItems()[3].getEnabled(), false, "Custom 'enabled':");
		assert.equal(oLongMenu.getItems()[4].getEnabled(), false, "Custom 'enabled':");
		assert.equal(oLongMenu.getItems()[5].getEnabled(), false, "Custom 'enabled':");
		/* beforeEach: last 2 menu-items are also disabled */
		assert.equal(oLongMenu.getItems()[98].getEnabled(), false, "Custom 'enabled':");
		assert.equal(oLongMenu.getItems()[99].getEnabled(), false, "Custom 'enabled':");

		openMenu(oLongMenu, false, assert);
		checkHoveredItem("item15", oLongMenu, assert); /* the first enabled item from the list is hovered */
		checkFocusedItem("item15", assert);


		qutils.triggerKeydown("menu14", "END");
		checkHoveredItem("item114", oLongMenu, assert); /* the last enabled item from the list is hovered */
		checkFocusedItem("item114", assert);

		qutils.triggerKeydown("menu14", "HOME");
		checkHoveredItem("item15", oLongMenu, assert); /* the first enabled item from the list is hovered */
		checkFocusedItem("item15", assert);

		qutils.triggerEvent("tap", "button5", {});
		closeAllMenusAndCheck(assert);
	});

	/* ARROW_UP/ARROW_DOWN/PAGE_UP/PAGE_DOWN/HOME/END should not change the hover state
	if the menu has only one enabled item */
	QUnit.test("Check Hover State on Single Item Menu", function(assert) {
		/* toggle rootmenu items enabling: only one item will be enabled */
		qutils.triggerEvent("tap", "button5", {});
		assert.equal(oRootMenu.getEnabled(), true, "Custom 'enabled':");
		assert.equal(oRootMenu.getItems()[0].getEnabled(), false, "Custom 'enabled':");
		assert.equal(oRootMenu.getItems()[1].getEnabled(), false, "Custom 'enabled':");
		assert.equal(oRootMenu.getItems()[2].getEnabled(), true, "Custom 'enabled':");
		assert.equal(oRootMenu.getItems()[3].getEnabled(), false, "Custom 'enabled':");

		openRootMenu(false, assert);
		checkHoveredItem("item3", undefined, assert);
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu14", "PAGE_DOWN");
		checkHoveredItem("item3", undefined, assert); /* no change */
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu14", "PAGE_UP");
		checkHoveredItem("item3", undefined, assert); /* no change */
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu14", "PAGE_RIGHT");
		checkHoveredItem("item3", undefined, assert); /* no change */
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu14", "PAGE_LEFT");
		checkHoveredItem("item3", undefined, assert); /* no change */
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu14", "HOME");
		checkHoveredItem("item3", undefined, assert); /* no change */
		checkFocusedItem("item3", assert);
		qutils.triggerKeydown("menu14", "END");
		checkHoveredItem("item3", undefined, assert); /* no change */
		checkFocusedItem("item3", assert);

		qutils.triggerEvent("tap", "button5", {});
		closeAllMenusAndCheck(assert);
	});

	QUnit.test("Submenu Navigation", function(assert) {
		openRootMenu(false, assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_RIGHT");
		qutils.triggerKeydown("menu3", "ARROW_DOWN");
		qutils.triggerKeydown("menu5", "ARROW_DOWN");
		checkFocusedItem("item5", assert);
		qutils.triggerKeydown("menu3", "ARROW_LEFT");
		assert.ok(oRootMenu.isOpen(), "Rootmenu not closed after Arrow Left");
		assert.ok(!oSubMenu.isOpen(), "Submenu closed after Arrow Left");
		checkHoveredItem("item5", undefined, assert);
		checkFocusedItem("item5", assert);
		closeAllMenusAndCheck(assert);
	});

	QUnit.test("Escape", function(assert) {
		openRootMenu(false, assert);
		lastSelectedItemId = null;
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ESCAPE");
		checkMenusClosed("after Escape", assert);
		assert.ok(!lastSelectedItemId, "No Event triggered on Escape");

		openRootMenu(false, assert);
		lastSelectedItemId = null;
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_RIGHT");
		qutils.triggerKeydown("menu3", "ESCAPE");
		assert.ok(oRootMenu.isOpen(), "Rootmenu not closed after Escape");
		assert.ok(!oSubMenu.isOpen(), "Submenu closed after Escape");
		assert.ok(!lastSelectedItemId, "No Event triggered on Escape");
		checkHoveredItem("item5", undefined, assert);
		checkFocusedItem("item5", assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		checkHoveredItem("item7", undefined, assert);
		checkFocusedItem("item7", assert);
		closeAllMenusAndCheck(assert);
	});

	QUnit.test("Space", function(assert) {
		openRootMenu(false, assert);
		lastSelectedItemId = null;
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		triggerSpace("menu2", undefined, assert);
		checkMenusClosed("after Space", assert);
		assert.equal(lastSelectedItemId, "item4", "Event triggered on selected item:");

		openRootMenu(false, assert);
		lastSelectedItemId = null;
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_UP");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_RIGHT");
		triggerSpace("menu3");
		checkMenusClosed("after Space", assert);
		assert.equal(lastSelectedItemId, "item8", "Event triggered on selected item:");
	});

	QUnit.test("Disabled Menu", function(assert) {
		qutils.triggerEvent("tap", "button2", {});
		assert.equal(oRootMenu.getEnabled(), false, "Custom 'enabled':");
		openRootMenu(true, assert);

		lastSelectedItemId = null;
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		triggerSpace("menu2");
		assert.equal(lastSelectedItemId, null, "Event not triggered on disabled menu:");

		qutils.triggerKeydown("menu2", "END");
		checkHoveredItem("item7", undefined, assert);

		qutils.triggerKeydown("menu2", "HOME");
		checkHoveredItem("item3", undefined, assert);

		qutils.triggerKeydown("menu2", "PAGE-UP");
		checkHoveredItem("item3", undefined, assert);

		qutils.triggerKeydown("menu2", "PAGE-DOWN");
		checkHoveredItem("item7", undefined, assert);

		qutils.triggerEvent("tap", "button2", {});
		assert.equal(oRootMenu.getEnabled(), true, "Custom 'enabled':");

		closeAllMenusAndCheck(assert);
	});

	QUnit.test("alt/meta key + right/left or + home/end is not handled", function(assert) {
		// Prepare
		var oMenuItem = new MenuItem({
				text:"WSL"
			}),
			oMenu = new Menu({
				items: oMenuItem
			}),
			oEvent = {
				metaKey: true
			};

		// Act
		oMenu.onsapprevious(oEvent);

		// Assert
		assert.ok(true, "left is not handled when meta key is pressed");

		// Act
		oMenu.onsapnext(oEvent);

		// Assert
		assert.ok(true, "right is not handled when meta key is pressed");

		// Prepare
		oEvent = {
			altKey: true
		};

		// Act
		oMenu.onsapprevious(oEvent);

		// Assert
		assert.ok(true, "left is not handled when alt key is pressed");

		// Act
		oMenu.onsapnext(oEvent);

		// Assert
		assert.ok(true, "right is not handled when alt key is pressed");

		// Cleanup
		oMenu.destroy();
	});

	QUnit.module("Mouse");

	Menu._DELAY_SUBMENU_TIMER = 10;
	Menu._DELAY_SUBMENU_TIMER_EXT = 10;
	var DELAY_SUBMENU_TIMER = Menu._DELAY_SUBMENU_TIMER + 20;

	if (Device.system.desktop) {
		QUnit.test("Delayed Open Submenu", function(assert) {
			var done = assert.async();
			openRootMenu(true, assert);
			var oSpyMenuFocusFn = sinon.spy(oRootMenu.getDomRef(), "focus");
			qutils.triggerEvent("mousemove", "item7", {});
			checkHoveredItem("item7", undefined, assert);
			checkFocusedItem("item7", assert);
			assert.ok(oRootMenu.isOpen(), "Rootmenu open");
			assert.ok(!oSubMenu.isOpen(), "Submenu not yet open");
			setTimeout(function(){
				checkHoveredItem("item7", undefined, assert);
				checkFocusedItem("item7", assert);
				assert.ok(oRootMenu.isOpen(), "Rootmenu open");
				assert.ok(oSubMenu.isOpen(), "Submenu open");
				checkMenuFocusing();
				closeAllMenusAndCheck(assert);
				done();
			}, DELAY_SUBMENU_TIMER);
			function checkMenuFocusing() {
				var iExpectedFocusFnCall = 0;
				assert.equal(oSpyMenuFocusFn.callCount, iExpectedFocusFnCall, "Menu should not be directly focused for Edge, but so it should for the rest");
			}
		});
	}

	if (Device.system.desktop) {
		QUnit.test("Select", function(assert) {
			var done = assert.async();
			openRootMenu(true, assert);
			lastSelectedItemId = null;
			checkHoveredItem("item3", undefined, assert);
			checkFocusedItem("item3", assert);
			qutils.triggerEvent("mousemove", "item7", {});
			setTimeout(function(){
				checkHoveredItem("item7", undefined, assert);
				checkFocusedItem("item7", assert);
				checkHoveredItem(null, oSubMenu, assert);
				assert.ok(oRootMenu.isOpen(), "Rootmenu open");
				assert.ok(oSubMenu.isOpen(), "Submenu open");
				qutils.triggerEvent("mousemove", "item8", {});
				setTimeout(function(){
					checkHoveredItem("item8", oSubMenu, assert);
					checkFocusedItem("item8", assert);
					qutils.triggerEvent("click", "item8", {});
					assert.equal(lastSelectedItemId, "item8", "Event triggered on item:");
					closeAllMenusAndCheck(assert);
					done();
				}, DELAY_SUBMENU_TIMER);
			}, DELAY_SUBMENU_TIMER);
		});
	} else {
		QUnit.test("Select", function(assert) {
			openRootMenu(true, assert);
			lastSelectedItemId = null;
			checkHoveredItem(null, undefined, assert);
			qutils.triggerEvent("click", "item7", {});
			checkHoveredItem(null, oSubMenu, assert);
			assert.ok(oRootMenu.isOpen(), "Rootmenu open");
			assert.ok(oSubMenu.isOpen(), "Submenu open");
			qutils.triggerEvent("click", "item8", {});
			assert.equal(lastSelectedItemId, "item8", "Event triggered on item:");
			closeAllMenusAndCheck(assert);
		});
	}

	QUnit.test("Hovered item", function(assert) {
		// prepare
		var oMenuItem = new MenuItem({
			text:"WSL"
		});
		var oMenu = new Menu({
			items:[oMenuItem]
		});
		var oFakeEvent = {
			srcControl: oMenuItem
		};

		// act
		var oSpy = this.spy(oMenu, "setHoveredItem");
		oMenu.setHoveredItem(oMenuItem);
		oMenu.onmouseout(oFakeEvent);

		// assert
		assert.ok(oSpy.calledWith(oMenuItem), "Proper hovered item is set");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("Disabled Item", function(assert) {
		openRootMenu(true, assert);
		lastSelectedItemId = null;
		if (Device.system.desktop) {
			qutils.triggerEvent("mousemove", "item5", {});
			checkHoveredItem("item5", undefined, assert);
		}
		checkFocusedItem("item5", assert);
		qutils.triggerEvent("click", "item5", {});
		assert.equal(lastSelectedItemId, null, "No Event triggered on disabled item:");
		assert.ok(oRootMenu.isOpen(), "Rootmenu still open");
		closeAllMenusAndCheck(assert);
	});

	if (Device.system.desktop) {
		QUnit.test("Disabled Item with Submenu", function(assert) {
			var done = assert.async();
			openRootMenu(true, assert);
			lastSelectedItemId = null;
			checkHoveredItem("item3", undefined, assert);
			qutils.triggerEvent("mousemove", "item7", {});
			setTimeout(function(){
				checkHoveredItem("item7", undefined, assert);
				assert.ok(oRootMenu.isOpen(), "Rootmenu open");
				assert.ok(oSubMenu.isOpen(), "Submenu open");
				qutils.triggerEvent("mousemove", "item10", {});
				setTimeout(function(){
					checkHoveredItem("item10", oSubMenu, assert);
					checkFocusedItem("item10", assert);
					qutils.triggerEvent("click", "item10", {});
					assert.equal(lastSelectedItemId, null, "Event not triggered on disabled item:");
					assert.ok(oRootMenu.isOpen(), "Rootmenu still open");
					assert.ok(oSubMenu.isOpen(), "Submenu still open");
					assert.ok(!oSubSubMenu.isOpen(), "SubSubmenu not open");
					closeAllMenusAndCheck(assert);
					done();
				}, DELAY_SUBMENU_TIMER);
			}, DELAY_SUBMENU_TIMER);
		});
	} else {
		QUnit.test("Disabled Item with Submenu", function(assert) {
			openRootMenu(true, assert);
			lastSelectedItemId = null;
			checkHoveredItem(null, undefined, assert);
			qutils.triggerEvent("click", "item7", {});
			checkHoveredItem(null, oSubMenu, assert);
			assert.ok(oRootMenu.isOpen(), "Rootmenu open");
			assert.ok(oSubMenu.isOpen(), "Submenu open");
			lastSelectedItemId = null;
			qutils.triggerEvent("click", "item10", {});
			assert.equal(lastSelectedItemId, null, "Event not triggered on disabled item:");
			assert.ok(oRootMenu.isOpen(), "Rootmenu still open");
			assert.ok(oSubMenu.isOpen(), "Submenu still open");
			assert.ok(!oSubSubMenu.isOpen(), "SubSubmenu not open");
			closeAllMenusAndCheck(assert);
		});
	}

	QUnit.test("Disabled Menu", function(assert) {
		qutils.triggerEvent("tap", "button2", {});
		assert.equal(oRootMenu.getEnabled(), false, "Custom 'enabled':");
		openRootMenu(true, assert);

		lastSelectedItemId = null;
		qutils.triggerEvent("mousemove", "item3", {});
		qutils.triggerEvent("click", "item3", {});
		assert.equal(lastSelectedItemId, null, "Event not triggered on disabled menu:");

		lastSelectedItemId = null;
		qutils.triggerEvent("mousemove", "item4", {});
		qutils.triggerEvent("click", "item4", {});
		assert.equal(lastSelectedItemId, null, "Event not triggered on disabled menu:");

		lastSelectedItemId = null;
		qutils.triggerEvent("mousemove", "item5", {});
		qutils.triggerEvent("click", "item5", {});
		assert.equal(lastSelectedItemId, null, "Event not triggered on disabled menu:");

		lastSelectedItemId = null;
		qutils.triggerEvent("mousemove", "item7", {});
		qutils.triggerEvent("click", "item7", {});
		assert.equal(lastSelectedItemId, null, "Event not triggered on disabled menu:");

		qutils.triggerEvent("tap", "button2", {});
		assert.equal(oRootMenu.getEnabled(), true, "Custom 'enabled':");

		closeAllMenusAndCheck(assert);
	});


	QUnit.module("Auto-Close");

	QUnit.test("Focusleave", function(assert) {
		jQuery("#qunit-fixture").attr("tabindex", -1);
		openRootMenu(false, assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_RIGHT");
		checkHoveredItem("item8", oSubMenu, assert);
		checkFocusedItem("item8", assert);
		// if the device supports touches the programmatic focus is not working correctly
		// so use touch events
		if (!Device.support.touch) {
			jQuery("#qunit-fixture").get(0).focus();
		} else {
			qutils.triggerEvent("touchstart", "qunit-fixture", {touches:[{pageX:0, pageY:0}], targetTouches: [{pageX:0, pageY:0}], changedTouches: [{pageX:0, pageY:0}]});
		}
		checkMenusClosed("after focus leave to outer html", assert);

		openRootMenu(false, assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_RIGHT");
		checkHoveredItem("item8", oSubMenu, assert);
		checkFocusedItem("item8", assert);
		// if the device supports touches the programmatic focus is not working correctly
		// so use touch events
		if (!Device.support.touch) {
			oButton.focus();
		} else {
			qutils.triggerEvent("touchstart", oButton.getId(), {touches:[{pageX:0, pageY:0}], targetTouches: [{pageX:0, pageY:0}], changedTouches: [{pageX:0, pageY:0}]});
		}
		checkMenusClosed("after focus leave to other control", assert);

		closeAllMenusAndCheck(assert);
		jQuery("#qunit-fixture").removeAttr("tabindex");
	});

	QUnit.test("MouseDown", function(assert) {
		openRootMenu(false, assert);
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_DOWN");
		qutils.triggerKeydown("menu2", "ARROW_RIGHT");
		checkHoveredItem("item8", oSubMenu, assert);
		checkFocusedItem("item8", assert);
		qutils.triggerEvent("mousedown", "qunit-fixture", {});
		checkMenusClosed("after mousedown", assert);

		closeAllMenusAndCheck(assert);
	});

	QUnit.module("TextField Item");

	QUnit.test("Properties - Default Values", function(assert) {
		var oItem = new MenuTextFieldItem();
		assert.equal(oItem.getLabel(), "", "Default 'label':");
		assert.equal(oItem.getIcon(), "", "Default 'icon':");
		assert.equal(oItem.getValue(), "", "Default 'value':");
		assert.equal(oItem.getSubmenu(), null, "Default 'submenu':");
	});

	QUnit.test("Properties - Custom Values", function(assert) {
		var oItem = new MenuTextFieldItem({label: "Hallo", icon: "../images/help.gif", value: "Value", submenu: new Menu()});
		assert.equal(oItem.getLabel(), "Hallo", "Custom 'label':");
		assert.equal(oItem.getIcon(), "../images/help.gif", "Custom 'icon':");
		assert.equal(oItem.getValue(), "Value", "Custom 'value':");
		assert.equal(oItem.getSubmenu(), null, "Custom 'submenu':");
	});


	QUnit.test("Keyboard - Arrow Down, Arrow Up, Escape", function(assert) {
		var done = assert.async();
		lastSelectedItemId = null;
		var sTfId = "item12-tf";
		setTimeout(function(){
			openMenu(oSpecialMenu, undefined, assert);
			checkHoveredItem("item11", oSpecialMenu, assert);
			checkFocusedItem("item11", assert);
			qutils.triggerKeydown("menu5", "ARROW_DOWN");
			checkHoveredItem("item12", oSpecialMenu, assert);
			checkFocusedItem(sTfId, assert);

			qutils.triggerKeydown(sTfId, "ARROW_DOWN");
			checkHoveredItem("item13", oSpecialMenu, assert);
			checkFocusedItem("item13", assert);
			qutils.triggerKeydown("menu5", "ARROW_UP");
			checkHoveredItem("item12", oSpecialMenu, assert);
			checkFocusedItem(sTfId, assert);

			qutils.triggerCharacterInput(sTfId, "A");
			qutils.triggerKeyEvent("keyup", sTfId, "A");

			// use keyooen and keypress because on Firefox keypress is used in TextField
			qutils.triggerKeyEvent("keydown", sTfId, KeyCodes.ESCAPE);
			qutils.triggerKeyEvent("keypress", sTfId, KeyCodes.ESCAPE);
			// 2 times because the undo stops propagation
			qutils.triggerKeyEvent("keydown", sTfId, KeyCodes.ESCAPE);
			qutils.triggerKeyEvent("keypress", sTfId, KeyCodes.ESCAPE);
			checkMenusClosed("after 2.Escape", assert);
			assert.ok(!lastSelectedItemId, "No Event triggered on Escape");

			assert.equal(oMenuItems["item12"].getValue(), "FilterValue", "Value of item after Escape");
			done();
		}, 100);
	});

	QUnit.test("Keyboard - Page-up, Page-down", function(assert) {
		var done = assert.async();
		lastSelectedItemId = null;
		var sTfId = "item12-tf";
		setTimeout(function(){
			openMenu(oSpecialMenu, undefined, assert);
			checkHoveredItem("item11", oSpecialMenu, assert);
			checkFocusedItem("item11", assert);
			qutils.triggerKeydown("menu5", "ARROW_DOWN");
			checkHoveredItem("item12", oSpecialMenu, assert);
			checkFocusedItem(sTfId, assert);

			qutils.triggerKeydown(sTfId, "PAGE_DOWN");
			checkHoveredItem("item13", oSpecialMenu, assert);
			checkFocusedItem("item13", assert);
			qutils.triggerKeydown("menu5", "ARROW_UP");
			checkHoveredItem("item12", oSpecialMenu, assert);
			checkFocusedItem(sTfId, assert);

			qutils.triggerKeydown(sTfId, "PAGE_UP");
			checkHoveredItem("item11", oSpecialMenu, assert);
			checkFocusedItem("item11", assert);
			done();
		}, 100);
	});

	QUnit.test("Keyboard - keyup sets correctly focus depending on the focused item", function(assert) {
		var done = assert.async();
		lastSelectedItemId = null;
		var sTfId = "item12-tf";
		setTimeout(function(){
			openMenu(oSpecialMenu, undefined, assert);
			checkHoveredItem("item11", oSpecialMenu, assert); // we are on item11
			checkFocusedItem("item11", assert);
			qutils.triggerKeydown("menu5", "ARROW_DOWN"); // press arrow down to go on item12 which contains a text field
			qutils.triggerKeyEvent("keyup", sTfId, "ARROW_DOWN"); //key up happens on the text field
			checkHoveredItem("item12", oSpecialMenu, assert); // item 12 is hovered
			checkFocusedItem(sTfId, assert);
			assert.ok(jQuery("#" + sTfId).is(":focus"), 'Text field should be focused'); // text field inside item12 is focused

			if (jQuery("html").attr("data-sap-ui-browser") != "ie8"){
				assert.ok(document.activeElement.id == sTfId, "Focus on textfield -1");
			}

			qutils.triggerKeydown(sTfId, "ARROW_UP"); // arrow up on the text field inside item12
			qutils.triggerKeyEvent("keyup", "item11", "ARROW_UP"); // key up happens on item 11
			assert.ok(jQuery('#item11').is(":focus"), 'Item11 should be focused'); // item11 should be focused (to have a focus outline)
			checkHoveredItem("item11", oSpecialMenu, assert); // item11 should be hovered
			checkFocusedItem("item11", assert);

			done();
		}, 100);
	});

	QUnit.test("Keyboard - Home, End, Enter", function(assert) {
		var done = assert.async();
		lastSelectedItemId = null;
		var sTfId = "item12-tf";
		setTimeout(function(){
			openMenu(oSpecialMenu, undefined, assert);
			checkHoveredItem("item11", oSpecialMenu, assert);
			checkFocusedItem("item11", assert);
			qutils.triggerKeydown("menu5", "ARROW_DOWN");
			checkHoveredItem("item12", oSpecialMenu, assert);
			checkFocusedItem(sTfId, assert);

			jQuery("#" + sTfId).cursorPos(1);
			qutils.triggerKeydown(sTfId, "HOME");
			checkHoveredItem("item12", oSpecialMenu, assert);
			checkFocusedItem(sTfId, assert);
			jQuery("#" + sTfId).cursorPos(0);
			qutils.triggerKeydown(sTfId, "HOME");
			checkHoveredItem("item11", oSpecialMenu, assert);
			checkFocusedItem("item11", assert);

			qutils.triggerKeydown("menu5", "ARROW_DOWN");
			checkHoveredItem("item12", oSpecialMenu, assert);
			checkFocusedItem(sTfId, assert);

			jQuery("#" + sTfId).cursorPos(0);
			qutils.triggerKeydown(sTfId, "END");
			checkHoveredItem("item12", oSpecialMenu, assert);
			checkFocusedItem(sTfId, assert);
			jQuery("#" + sTfId).cursorPos(jQuery("#" + sTfId).val().length);
			qutils.triggerKeydown(sTfId, "END");
			checkHoveredItem("item13", oSpecialMenu, assert);
			checkFocusedItem("item13", assert);

			qutils.triggerKeydown("menu5", "ARROW_UP");
			checkHoveredItem("item12", oSpecialMenu, assert);
			checkFocusedItem(sTfId, assert);

			qutils.triggerCharacterInput(sTfId, "A");
			qutils.triggerKeyEvent("keyup", sTfId, "A");

			triggerKey(sTfId, "ENTER");
			checkMenusClosed("after Enter", assert);
			assert.equal(lastSelectedItemId, "item12", "Event triggered on selected item:");

			assert.equal(oMenuItems["item12"].getValue(), "FilterValueA", "Value of item after Enter");
			done();
		}, 100);
	});

	QUnit.test("Keyboard - Disabled Menu", function(assert) {
		lastSelectedItemId = null;
		var sTfId = "item12-tf";
		oSpecialMenu.setEnabled(false);
		openMenu(oSpecialMenu, undefined, assert);
		checkHoveredItem("item11", oSpecialMenu, assert);
		qutils.triggerKeydown("menu5", "ARROW_DOWN");
		checkHoveredItem("item12", oSpecialMenu, assert);
		assert.ok(document.activeElement.id != sTfId, "Focus not on textfield");

		qutils.triggerKeydown(sTfId, "ESCAPE");
		checkMenusClosed("after Escape", assert);
		assert.ok(!lastSelectedItemId, "No Event triggered on Escape");
	});

	QUnit.test("_fnInvisibleDescriptionFactory", function(assert) {
		// arrange
		// act
		var oLanguageStub = this.stub(Localization, "getLanguage")
			.callsFake(function() {
				return "en-US";
			}),
			oInvisibleCountInformation = new MenuTextFieldItem()
			._fnInvisibleDescriptionFactory({
				iItemNo: 1,
				iTotalItems: 3
			});

		// assert
		assert.strictEqual(oInvisibleCountInformation.getText(), "1 of 3 Type in text", "Proper count information is created");

		// clean up
		oLanguageStub.restore();
	});

	QUnit.module("Item Selection", {
		beforeEach: function () {
			this.oMenu = new Menu({
				items: [
					new MenuItem({text: "Item 1"}),
					new MenuItem({text: "Item 2"}),
					new MenuItem({text: "Item 3"}),
					new MenuItemGroup("singleGroup",{
						itemSelectionMode: "SingleSelect",
						items: [
							new MenuItem({text: "Item 4"}),
							new MenuItem({text: "Item 5"}),
							new MenuItem({text: "Item 6"})
						]
					}),
					new MenuItemGroup("multiGroup",{
						itemSelectionMode: "MultiSelect",
						items: [
							new MenuItem({text: "Item 7"}),
							new MenuItem({text: "Item 8"}),
							new MenuItem({text: "Item 9"})
						]
					}),
					new MenuItemGroup("noneGroup",{
						itemSelectionMode: "None",
						items: [
							new MenuItem({text: "Item 10"}),
							new MenuItem({text: "Item 11"}),
							new MenuItem({text: "Item 12"})
						]
					}),
					new MenuItem({text: "Item 13"})
				]
			}).placeAt("qunit-fixture");
		},
		afterEach : function () {
			this.oMenu.destroy();
			this.oMenu = null;
		}
	});

	QUnit.test("All items (including those in groups) are rendered", function(assert) {
		// Act
		openMenu(this.oMenu, undefined, assert);

		// Assert
		assert.equal(this.oMenu._getItems().length, 13, "Total number of items is correct");
		assert.equal(this.oMenu.getDomRef().querySelectorAll(".sapUiMnuItm").length, 13, "All items are rendered");
	});

	QUnit.test("Items selection in single-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			aGroupItems = oGroup.getItems();

		// Act - setelct one item
		openMenu(this.oMenu, undefined, assert);
		aGroupItems[0].setSelected(true);
		await nextUIUpdate();

		// Assert
		assert.equal(aGroupItems[0].getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(aGroupItems[0].getDomRef().querySelector(".sapUiMnuItmSel"), "First item has selection mark rendered");

		// Act - deselect selected item
		aGroupItems[0].setSelected(false);
		await nextUIUpdate();

		// Assert
		assert.notOk(aGroupItems[0].getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(aGroupItems[0].getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");

		// Act - select more than one item
		aGroupItems[0].setSelected(true);
		aGroupItems[1].setSelected(true);
		aGroupItems[2].setSelected(true);
		await nextUIUpdate();

		// Assert
		assert.notOk(aGroupItems[0].getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(aGroupItems[0].getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");
		assert.notOk(aGroupItems[1].getDomRef().getAttribute("aria-checked"), "Second item has no 'aria-checked' attribute set");
		assert.notOk(aGroupItems[1].getDomRef().querySelector(".sapUiMnuItmSel"), "Second item has no selection mark rendered");
		assert.equal(aGroupItems[2].getDomRef().getAttribute("aria-checked"), "true", "Third item has 'aria-checked' attribute set");
		assert.ok(aGroupItems[2].getDomRef().querySelector(".sapUiMnuItmSel"), "Third item has selection mark rendered");
	});

	QUnit.test("Items selection in multi-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[4],
			aGroupItems = oGroup.getItems();

		// Act - setelct one item
		openMenu(this.oMenu, undefined, assert);
		aGroupItems[0].setSelected(true);
		await nextUIUpdate();

		// Assert
		assert.equal(aGroupItems[0].getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(aGroupItems[0].getDomRef().querySelector(".sapUiMnuItmSel"), "First item has selection mark rendered");

		// Act - deselect selected item
		aGroupItems[0].setSelected(false);
		await nextUIUpdate();

		// Assert
		assert.notOk(aGroupItems[0].getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(aGroupItems[0].getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");

		// Act - select more than one item
		aGroupItems[0].setSelected(true);
		aGroupItems[1].setSelected(true);
		aGroupItems[2].setSelected(true);
		await nextUIUpdate();

		// Assert
		assert.equal(aGroupItems[0].getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(aGroupItems[0].getDomRef().querySelector(".sapUiMnuItmSel"), "First item has selection mark rendered");
		assert.equal(aGroupItems[1].getDomRef().getAttribute("aria-checked"), "true", "Second item has 'aria-checked' attribute set");
		assert.ok(aGroupItems[1].getDomRef().querySelector(".sapUiMnuItmSel"), "Second item has selection mark rendered");
		assert.equal(aGroupItems[2].getDomRef().getAttribute("aria-checked"), "true", "Third item has 'aria-checked' attribute set");
		assert.ok(aGroupItems[2].getDomRef().querySelector(".sapUiMnuItmSel"), "Third item has selection mark rendered");
	});

	QUnit.test("Items selection in group with no selection set", async function(assert) {
		var oGroup = this.oMenu.getItems()[5],
			aGroupItems = oGroup.getItems();

		// Act - setelct one item
		openMenu(this.oMenu, undefined, assert);
		aGroupItems[0].setSelected(true);
		await nextUIUpdate();

		// Assert
		assert.notOk(aGroupItems[0].getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(aGroupItems[0].getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");

		// Act - deselect selected item
		aGroupItems[0].setSelected(false);
		await nextUIUpdate();

		// Assert
		assert.notOk(aGroupItems[0].getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(aGroupItems[0].getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");
	});

	QUnit.test("Items selection of item outside of a group", async function(assert) {
		// Act - setelct one item
		openMenu(this.oMenu, undefined, assert);
		this.oMenu.getItems()[0].setSelected(true);
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oMenu.getItems()[0].getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(this.oMenu.getItems()[0].getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");

		// Act - deselect selected item
		this.oMenu.getItems()[0].setSelected(false);
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oMenu.getItems()[0].getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(this.oMenu.getItems()[0].getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");
	});


	QUnit.test("Items selection with click in single-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			aGroupItems = oGroup.getItems();

		// Act - setelct one item
		openMenu(this.oMenu, undefined, assert);
		aGroupItems[0].$().trigger("click");
		await nextUIUpdate();

		// Assert
		assert.ok(aGroupItems[0].getSelected(), "First item is selected");

		// Act - deselect selected item
		openMenu(this.oMenu, undefined, assert);
		await nextUIUpdate();
		aGroupItems[1].$().trigger("click");
		await nextUIUpdate();

		// Assert
		assert.notOk(aGroupItems[0].getSelected(), "First item is not selected");
		assert.ok(aGroupItems[1].getSelected(), "Second item is selected");
	});

	QUnit.test("Items selection with click in multi-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[4],
			aGroupItems = oGroup.getItems();

		// Act - setelct one item
		openMenu(this.oMenu, undefined, assert);
		aGroupItems[0].$().trigger("click");
		await nextUIUpdate();

		// Assert
		assert.ok(aGroupItems[0].getSelected(), "First item is selected");

		// Act - deselect selected item
		openMenu(this.oMenu, undefined, assert);
		await nextUIUpdate();
		aGroupItems[1].$().trigger("click");
		await nextUIUpdate();

		// Assert
		assert.ok(aGroupItems[0].getSelected(), "First item is selected");
		assert.ok(aGroupItems[1].getSelected(), "Second item is selected");
	});

	QUnit.test("Items selection with click in group with no selection", async function(assert) {
		var oGroup = this.oMenu.getItems()[5],
			aGroupItems = oGroup.getItems();

		// Act - setelct one item
		openMenu(this.oMenu, undefined, assert);

		aGroupItems[0].$().trigger("click");
		await nextUIUpdate();

		// Assert
		assert.notOk(aGroupItems[0].getSelected(), "First item is not selected");
	});

	QUnit.test("Items selection with click for item outside a group", async function(assert) {
		// Act - setelct one item
		openMenu(this.oMenu, undefined, assert);

		this.oMenu.getItems()[0].$().trigger("click");
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oMenu.getItems()[0].getSelected(), "First item is not selected");
	});

	QUnit.module("Aria");

	QUnit.test("Root element is clear of any ARIA labelling", function(assert) {
		// Act
		openMenu(oRootMenu, undefined, assert);

		// Assert
		assert.notOk(oRootMenu.$().attr("aria-labelledby"), "Root element isn't labelled");
	});

	QUnit.test("Role 'menu' is set to the unordered list html element", function(assert) {
		// Act
		openMenu(oRootMenu, undefined, assert);
		// Assert
		assert.equal(oRootMenu.$().find(".sapUiMnuLst").attr("role"), "menu", "The role menu is set correctly");
	});

	QUnit.test("Aria-level is not used anymore", function(assert) {
		//Act
		openMenu(oRootMenu, undefined, assert);
		//Assert
		assert.equal(oRootMenu.$().attr("aria-level"), undefined, "There must be no any aria-level attribute");
	});

	QUnit.test("The 'disabled' attribute makes 'aria-disabled' redundant", function(assert) {
		// Prepare
		var oMenuItem = new MenuItem({
				enabled: false
			}),
			oMenuTextFieldItem = new MenuTextFieldItem({
				enabled: false
			}),
			oMenu = new Menu({
				items: [
					oMenuItem,
					oMenuTextFieldItem
				]
			}).placeAt("qunit-fixture");

		// act
		oMenu.open();
		var $menuItem = oMenuItem.$(),
			$menuTextFieldItem = oMenuTextFieldItem.$(),
			$menuTextFieldItemInput = oMenuTextFieldItem.$("tf");

		// assert
		assert.notOk($menuItem.attr("disabled"), "Disabled MenuItem has a disabled attribute");
		assert.ok($menuItem.attr("aria-disabled"), "Disabled MenuItem doesn't have aria-disabled");

		assert.ok($menuTextFieldItem.attr("aria-disabled"), "Disabled MenuItemTextField doesn't have aria-disabled");

		assert.ok($menuTextFieldItemInput.attr("disabled"), "Disabled MenuItemTextField's input has a disabled attribute");
		assert.notOk($menuTextFieldItemInput.attr("aria-disabled"), "Disabled MenuItemTextField's input doesn't have aria-disabled");

		// clean up
		oMenu.destroy();
	});

	QUnit.test("aria-posinset and aria-setsize", function(assert) {
		// Prepare
		var oItem1 = new MenuItem(),
			oItem2 = new MenuTextFieldItem(),
			oMenu = new Menu({
				items: [oItem1, oItem2]
			}).placeAt("qunit-fixture");

		// act
		oMenu.open();
		var $item1 = oItem1.$(),
			$item2TF = oItem2.$();

		// assert
		assert.equal($item1.attr("aria-posinset"), 1, "Correct posinset information is set on the MenuItem");
		assert.equal($item1.attr("aria-setsize"), 2, "Correct setsize information is set on the MenuItem");
		assert.equal($item2TF.attr("aria-posinset"), 2, "Correct posinset information is set on the MenuTextFieldItem");
		assert.equal($item2TF.attr("aria-setsize"), 2, "Correct setsize information is set on the MenuTextFieldItem");

		// clean up
		oMenu.destroy();
	});

	QUnit.test("MenuTextFieldItem input field has count and type information referenced", function(assert) {
		// arrange
		var oLanguageStub = this.stub(Localization, "getLanguage"),
			oInputFields, sCountDescriptionOne, sCountDescriptionTwo,
			oMenu = new Menu({
				items: [new MenuTextFieldItem(), new MenuTextFieldItem()]
			}).placeAt("qunit-fixture");

		// act
		oMenu.open();
		oInputFields = oMenu.getDomRef().querySelectorAll("input");

		sCountDescriptionOne = document.getElementById(oInputFields[0].getAttribute("aria-describedby")).innerText;
		sCountDescriptionTwo = document.getElementById(oInputFields[1].getAttribute("aria-describedby")).innerText;

		// assert
		assert.strictEqual(sCountDescriptionOne, "1 of 2 Type in text", "Proper description text is referenced");
		assert.strictEqual(sCountDescriptionTwo, "2 of 2 Type in text", "Proper description text is referenced");

		// clean up
		oMenu.destroy();
		oLanguageStub.restore();
	});

	QUnit.module("Misc");

	QUnit.test("Destruction", function(assert) {
		var sId = oRootMenu.getId();
		var sSubId = oSubMenu.getId();
		openRootMenu(true, assert);
		var bHasPopup = !!oRootMenu.oPopup;
		oRootMenu.destroy();
		assert.ok(!Element.getElementById(sId), "No Menu registered in the Core anymore");
		assert.ok(!Element.getElementById(sSubId), "No Submenu registered in the Core anymore");
		assert.ok(!oRootMenu.oPopup && bHasPopup, "Internal Popup cleaned up");
	});


	QUnit.test("Destroy detaches resize handler", function(assert) {
		// Prepare
		var oMenu = new Menu(),
			bSpyDestroyHandler;

		oMenu.open();
		bSpyDestroyHandler = this.spy(Device.resize, "detachHandler");

		// Act
		oMenu.destroy();

		// Assert
		assert.equal(bSpyDestroyHandler.callCount, 1, " resize handler should be called");
	});

	QUnit.test("Calling close and destroy detaches resize handler only once", function(assert) {
		// Prepare
		var oMenu = new Menu(),
			bSpyDestroyHandler;

		oMenu.open();
		bSpyDestroyHandler = this.spy(Device.resize, "detachHandler");

		// Act
		oMenu.close();
		oMenu.destroy();

		// Assert
		assert.ok(bSpyDestroyHandler.calledOnce, " resize handler should be called only once");
	});

	QUnit.test("setRootMenuTopStyle", async function(assert) {
		var oSubMenu = new Menu();
		var oMenu = new Menu({
			items: [new MenuItem({submenu: oSubMenu})]
		});
		oMenu.open();
		assert.ok(oSubMenu.getRootMenu() === oMenu, "Menu is the root");
		oSubMenu.setRootMenuTopStyle(true);
		assert.ok(oMenu.bUseTopStyle, "Top Style active");
		await nextUIUpdate();
		assert.ok(oMenu.$().hasClass("sapUiMnuTop"), "Top Style CSS class set");
		oMenu.setRootMenuTopStyle(false);
		assert.ok(!oMenu.bUseTopStyle, "Top Style inactive");
		await nextUIUpdate();
		assert.ok(!oMenu.$().hasClass("sapUiMnuTop"), "Top Style CSS class not set");
		oMenu.destroy();
	});

	QUnit.test("getPreviousSelectableItem", function(assert) {
		var oItem1 = new MenuItem();
		var oItem2 = new MenuItem();
		var oItem3 = new MenuItem({enabled: false});
		var oItem4 = new MenuItem({visible: false});
		var oMenu = new Menu({
			items: [oItem1, oItem2, oItem3, oItem4]
		});

		var oItem = oMenu.getPreviousSelectableItem(1);
		assert.ok(oItem === oItem1, "Previous selectable item of item 2 is item 1");
		oItem = oMenu.getPreviousSelectableItem(0);
		assert.ok(oItem === oItem1, "Previous selectable item of item 1 is item 2");
		oMenu.destroy();
	});

	QUnit.test("getNextSelectableItem", function(assert) {
		var oItem1 = new MenuItem();
		var oItem2 = new MenuItem();
		var oItem3 = new MenuItem({enabled: false});
		var oItem4 = new MenuItem({visible: false});
		var oMenu = new Menu({
			items: [oItem1, oItem2, oItem3, oItem4]
		});

		var oItem = oMenu.getNextSelectableItem(0);
		assert.ok(oItem === oItem2, "Previous selectable item of item 1 is item 2");
		oItem = oMenu.getNextSelectableItem(1);
		assert.ok(oItem === oItem3, "Previous selectable item of item 2 is item 1");
		oMenu.destroy();
	});

	QUnit.test("Max Height", function(assert) {
		var oMenu = new Menu({maxVisibleItems: 5});
		for (var i = 0; i < 10; i++) {
			oMenu.addItem(new MenuItemBase());
		}
		openMenu(oMenu, false, assert);
		assert.ok(!!oMenu.$().css("max-height"), "Max. height is set");
		assert.ok(oMenu.$().hasClass("sapUiMnuScroll"), "Scrolling is enabled");
		oMenu.destroy();
	});

	QUnit.test("Legacy Positioning", function(assert) {
		var flipfit = jQuery.ui.position.flipfit;
		jQuery.ui.position.flipfit = null;

		var oMenu = new Menu();
		for (var i = 0; i < 10; i++) {
			oMenu.addItem(new MenuItem());
		}
		openMenu(oMenu, false, assert);

		oMenu.destroy();
		jQuery.ui.position.flipfit = flipfit;
	});

	QUnit.test("openAsContextMenu functionality", function(assert) {
		var oMenu = new Menu({tooltip: "a tooltip"});
		var fnEventHandler = function (oEvent) {
			oMenu.openAsContextMenu(oEvent, jQuery("#qunit-fixture").get(0));
			assert.ok(oMenu.isOpen(), "Menu opened");
		};
		jQuery("#qunit-fixture").on("contextmenu", fnEventHandler);
		jQuery("#qunit-fixture").trigger("contextmenu");
		jQuery("#qunit-fixture").off("contextmenu", fnEventHandler);
		oMenu.destroy();
	});

	QUnit.test("openAsContextMenu functionality with explicit positions", function(assert) {
		// arrange
		var oMenu = new Menu(),
			oOpenerRef = document.createElement("DIV"),
			oOpenStub = this.stub(oMenu, "open"),
			oPositionObject = {
				offsetX: 10,
				offsetY: 10,
				left: 10,
				top: 10
			};

		// act
		oMenu.openAsContextMenu(oPositionObject, oOpenerRef);

		// assert
		assert.ok(oOpenStub.firstCall.args[5], "10 10", "open method should be called with right parameters");

		// cleanup
		oMenu.destroy();
		oOpenStub.restore();
	});


	QUnit.test("Invalidate", function(assert) {
		// prepare
		var oMenu = new Menu(),
			oInvalidateSpy = this.spy(Control.prototype, "invalidate"),
			oPopup = oMenu.getPopup(),
			oIsOpenStub;

		// act
		oMenu.invalidate();

		// assert
		assert.notOk(oMenu.isOpen(), "Menu isn't opened");
		assert.strictEqual(oInvalidateSpy.callCount, 0, "Control invalidation gets skipped");

		// prepare
		oIsOpenStub = this.stub(oPopup, "isOpen").callsFake(function() {
			return true;
		});

		// act
		oMenu.invalidate();

		// assert
		assert.ok(oInvalidateSpy.calledOnce, "Control invalidation triggered");

		// clean
		oIsOpenStub.restore();
		oInvalidateSpy.restore();
	});
});