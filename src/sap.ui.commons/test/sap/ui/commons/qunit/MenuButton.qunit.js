/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/MenuButton",
	"sap/ui/commons/Menu",
	"sap/ui/commons/MenuItem",
	"sap/ui/thirdparty/jquery"
], function(qutils, createAndAppendDiv, MenuButton, Menu, MenuItem, jQuery) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	var oMenuButton1 = new MenuButton("menuButton1");
	oMenuButton1.setText("Menu Button");
	oMenuButton1.setTooltip("This is a test tooltip");
	oMenuButton1.setIcon("test-resources/sap/ui/commons/images/menu.gif");
	oMenuButton1.setIconFirst(false);
	oMenuButton1.setWidth("200px");

	var oMenu1	= new Menu("menu1");
	oMenuButton1.setMenu(oMenu1);
	var oMenuItem1 = new MenuItem("menuitem1", {text:"Item1"});
	oMenu1.addItem(oMenuItem1);
	var oMenuItem2 = new MenuItem("menuitem2", {text:"Item2"});
	oMenu1.addItem(oMenuItem2);

	var oMenuButton2 = new MenuButton("menuButton2");

	oMenuButton1.placeAt("uiArea1");



	QUnit.module("Basic");

	QUnit.test("Initial Rendering", function(assert) {
		assert.notEqual(oMenuButton1.getDomRef(), null, "MenuButton HTML Element should be rendered");
		assert.equal(oMenu1.getDomRef(), null, "Menu HTML Element is not yet rendered");
	});

	QUnit.test("Property - Default Values", function(assert) {
		assert.equal(oMenuButton2.getVisible(), true, "Default 'visible':");
		assert.equal(oMenuButton2.getTooltip(), null, "Default 'tooltip':");
		assert.equal(oMenuButton2.getEnabled(), true, "Default 'enabled':");
		assert.equal(oMenuButton2.getText(), "", "Default 'text':");
		assert.equal(oMenuButton2.getIcon(), "", "Default 'icon':");
		assert.equal(oMenuButton2.getIconFirst(), true, "Default 'iconFirst':");
		assert.equal(oMenuButton2.getWidth(), "", "Default 'width':");
		assert.equal(oMenuButton2.getMenu(), null, "Default 'menu':");
		assert.equal(oMenuButton2.getDockButton(), "", "Default 'dockButton':");
		assert.equal(oMenuButton2.getDockMenu(), "", "Default 'dockMenu':");
	 });

	QUnit.test("Property - Custom Values", function(assert) {
		assert.equal(oMenuButton1.getTooltip(), "This is a test tooltip", "Custom 'tooltip':");
		assert.equal(oMenuButton1.getText(), "Menu Button", "Custom 'text':");
		assert.equal(oMenuButton1.getIcon(), "test-resources/sap/ui/commons/images/menu.gif", "Custom 'icon':");
		assert.equal(oMenuButton1.getIconFirst(), false, "Custom 'iconFirst':");
		assert.equal(oMenuButton1.getWidth(), "200px", "Custom 'width':");
		assert.equal(oMenuButton1.getMenu().getId(), oMenu1.getId(), "Custom 'menu':");
	 });


	QUnit.module("Menu Open / Close Tests");

	QUnit.test("Test Open/Close via Mouse", function(assert) {
		oMenuButton1.focus();
		qutils.triggerEvent("click", oMenuButton1.getId());
		assert.ok(oMenu1.$().is(":visible"), "Menu is visible after click");

		qutils.triggerEvent("click", "menuitem1");
		assert.ok(oMenu1.$().length == 0, "Menu is hidden after click on a menuitem and DOM is removed");

	});

	QUnit.test("Test Open/Close via Keyboard", function(assert) {
		oMenuButton1.focus();
		qutils.triggerKeyboardEvent(oMenuButton1.getId(), "SPACE");
		qutils.triggerEvent("click", oMenuButton1.getId()); //In real life the space will followed by a click
		assert.ok(oMenu1.$().is(":visible"), "Menu is visible after SPACE is pressed");

		qutils.triggerKeyboardEvent(oMenuItem1.getId(), "SPACE"); //keydown
		qutils.triggerKeyEvent("keyup", oMenuItem1.getId(), "SPACE"); //keyup
		assert.ok(oMenu1.$().length == 0, "Menu is hidden after SPACE is pressed on a menuitem and DOM is removed");
	});

	QUnit.module("Events");

	QUnit.test("Test Press Event", function(assert){
		var done = assert.async();
		oMenuButton1.focus();

		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("item").getId(), oMenuItem1.getId(), "Parameter 'item' of press event:");
			assert.equal(oControlEvent.getParameter("itemId"), oMenuItem1.getId(), "Parameter 'itemId' of press event:");
			oMenuButton1.detachPress(handler);
			done();
		};
		oMenuButton1.attachPress(handler);

		qutils.triggerEvent("click", oMenuButton1.getId());
		qutils.triggerEvent("click", oMenuItem1.getId());
	});

	QUnit.test("Test ItemSelected Event", function(assert){
		var done = assert.async();
		oMenuButton1.focus();

		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("item").getId(), oMenuItem1.getId(), "Parameter 'item' of itemSelected event:");
			assert.equal(oControlEvent.getParameter("itemId"), oMenuItem1.getId(), "Parameter 'itemId' of itemSelected event:");
			oMenuButton1.detachItemSelected(handler);
			done();
		};
		oMenuButton1.attachItemSelected(handler);

		qutils.triggerEvent("click", oMenuButton1.getId());
		qutils.triggerEvent("click", oMenuItem1.getId());
	});
});