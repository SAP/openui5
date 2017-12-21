/* global QUnit, sinon */

sap.ui.require([
	"sap/ui/fl/Utils",
	"sap/ui/dt/plugin/MiniMenu",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/MiniMenuControl"

], 	function(
	Utils,
	MiniMenu,
	OverlayRegistry,
	DesignTime,
	MiniMenuControl
){

	"use strict";

    var sandbox = sinon.sandbox.create();
    QUnit.module("MiniMenu API", {
		beforeEach: function(assert) {
			var that = this;
			this.oButton1 = new sap.m.Button();
			this.oButton2 = new sap.m.Button();
			this.oButtonUnselectable = new sap.m.Button();

			this.oLayout = new sap.ui.layout.VerticalLayout({
				content: [
					this.oButton1, this.oButton2, this.oButtonUnselectable
				]
			});

			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oMenuEntries = {};
			this.oMenuEntries.available = {
				id : "CTX_ALWAYS_THERE",
				text : function () {return "item that is always there"; },
				handler : sinon.spy()
			};
			this.oMenuEntries.enabledBtn1 = {
				id : "CTX_ENABLED_BUTTON1",
				text : "enabled for button 1",
				handler : sinon.spy(),
				enabled : function(oOverlay){
					var oElement = oOverlay.getElementInstance();
					return oElement === that.oButton1;
				}
			};
			this.oMenuEntries.disabledBtn1 = {
				id : "CTX_DISABLED_BUTTON1",
				text : "disabled for button 1",
				handler : sinon.spy(),
				available : function(oOverlay){
					var oElement = oOverlay.getElementInstance();
					return oElement === that.oButton1 || oElement === that.oButton2;
				},
				enabled : function(oOverlay){
					var oElement = oOverlay.getElementInstance();
					return oElement !== that.oButton1;
				}
			};
			this.oMenuEntries.onlyBtn2 = {
				id : "CTX_ONLY_BUTTON2",
				text : "only shown for button 2",
				rank : 1,
				handler : sinon.spy(),
				available : function(oOverlay){
					var oElement = oOverlay.getElementInstance();
					return oElement === that.oButton2;
				}
			};
			this.oMenuEntries.alwaysStartSection = {
				id : "CTX_START_SECTION",
				text : "starts new section ",
				rank : 2,
				handler : sinon.spy(),
				startSection : true
			};
			this.oMenuEntries.startSectionButton1 = {
				id : "CTX_START_SECTION_BTN1",
				text : "starts new section for button1",
				handler : sinon.spy(),
				startSection : function(oElement){
					return oElement === that.oButton1;
				}
			};
			this.oMenuEntries.dynamicTextItem = {
				id : "CTX_DYNAMIC_TEXT",
				text : function(oOverlay) {
					var oElement = oOverlay.getElementInstance();
					return oElement.getId();
				},
				handler : sinon.spy()
			};


			this.oMiniMenuPlugin = new MiniMenu();
			for (var key in this.oMenuEntries){
				this.oMiniMenuPlugin.addMenuItem(this.oMenuEntries[key]);
			}

			var done = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				],
				plugins: [
					this.oMiniMenuPlugin
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();

				that.oButton1Overlay = OverlayRegistry.getOverlay(that.oButton1);
				that.oButton1Overlay.setSelectable(true);
				that.oButton2Overlay = OverlayRegistry.getOverlay(that.oButton2);
				that.oButton2Overlay.setSelectable(true);
				that.oUnselectableOverlay = OverlayRegistry.getOverlay(that.oButtonUnselectable);

				done();
			});

			this.oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
    });

    QUnit.test("Hiding then showing the MiniMenu", function (assert) {
		this.clock = sinon.useFakeTimers();
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(oMiniMenu.getPopover().isOpen(), "MiniMenu should be open");
		oMiniMenu.close();
		this.clock.tick(400); //animation of the closing of the Popover
		assert.ok(!oMiniMenu.getPopover().isOpen(), "MiniMenu should be closed");
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
        assert.ok(oMiniMenu.getPopover().isOpen(), "MiniMenu should be open");

		oMiniMenu = null;
		this.clock.restore();
	});

	QUnit.test("Calling the _popupClosed function", function (assert){
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		oMiniMenu.openNew = false;
		oMiniMenu._popupClosed();
		assert.ok(!oMiniMenu.isOpen, "MiniMenu should be closed");

		oMiniMenu = null;
	});

	QUnit.test("Calling the _popupClosed function in expanded mode", function (assert){
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(oMiniMenu.isOpen, "MiniMenu should be opened");
		oMiniMenu._popupClosed();
		assert.ok(!oMiniMenu.isOpen, "MiniMenu should be closed");
		oMiniMenu = null;
	});

	QUnit.test("Calling _checkForPluginLock", function (assert){
		assert.ok(!this.oMiniMenuPlugin._checkForPluginLock(this.oButton2Overlay), "Should return false");
	});

	QUnit.test("Calling _addMenuItemToGroup", function (assert){

		var that = this;

		var testButton = {
			id : "CTX_ENABLED_BUTTON1",
			text : "enabled for button 1",
			handler : sinon.spy(),
			enabled : function(oOverlay){
				var oElement = oOverlay.getElementInstance();
				return oElement === that.oButton1;
			},
			group : "Test1"
		};

		this.oMiniMenuPlugin._addMenuItemToGroup(testButton);

		assert.strictEqual(this.oMiniMenuPlugin._aGroupedItems.length, 1, "should add a Button to grouped Items");

		var testButton2 = {
			id : "CTX_ENABLED_BUTTON1",
			text : "enabled for button 1",
			handler : sinon.spy(),
			enabled : function(oOverlay){
				var oElement = oOverlay.getElementInstance();
				return oElement === that.oButton1;
			},
			group : "Test1"
		};

		this.oMiniMenuPlugin._addMenuItemToGroup(testButton2);

		assert.strictEqual(this.oMiniMenuPlugin._aGroupedItems.length, 1, "should add a Button to grouped Items without creating a new grouped Button");

		var testButton3 = {
			id : "CTX_ENABLED_BUTTON1",
			text : "enabled for button 1",
			handler : sinon.spy(),
			enabled : function(oOverlay){
				var oElement = oOverlay.getElementInstance();
				return oElement === that.oButton1;
			},
			group : "Test2"
		};

		this.oMiniMenuPlugin._addMenuItemToGroup(testButton3);

		assert.strictEqual(this.oMiniMenuPlugin._aGroupedItems.length, 2, "should add a Button to grouped Items with creating a new grouped button");
	});

	QUnit.test("Calling _addItemGroupsToMenu", function (assert){
		this.clock = sinon.useFakeTimers();
		var that = this;

			var testButton = {
				id : "CTX_ENABLED_BUTTON1",
				text : "enabled for button 1",
				handler : sinon.spy(),
				enabled : function(oOverlay){
					var oElement = oOverlay.getElementInstance();
					return oElement === that.oButton1;
				},
				group : "Test1"
			};

			this.oMiniMenuPlugin._addMenuItemToGroup(testButton);

			var testButton2 = {
				id : "CTX_ENABLED_BUTTON3",
				text : "enabled for button 3",
				handler : sinon.spy(),
				enabled : function(oOverlay){
					var oElement = oOverlay.getElementInstance();
					return oElement === that.oButton1;
				},
				group : "Test2",
				rank : 10
			};

			this.oMiniMenuPlugin._addMenuItemToGroup(testButton2);
			this.oMiniMenuPlugin._addMenuItemToGroup(testButton2);

			this.oButton2Overlay.attachBrowserEvent("click", function (oEvent) {
				this.oTestEvent = oEvent;
				oEvent.stopPropagation();
			}, this);

			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");

			this.oMiniMenuPlugin._addItemGroupsToMenu(this.oTestEvent, this.oButton2Overlay);

			assert.strictEqual(this.oMiniMenuPlugin._aMenuItems.length, 9, "Should have added 2 Buttons");

			this.oMiniMenuPlugin._aMenuItems[this.oMiniMenuPlugin._aMenuItems.length - 1].menuItem.handler();

			assert.strictEqual(this.oMiniMenuPlugin.isMenuOpeningLocked(), true, "Opening should be locked");

			this.oMiniMenuPlugin.oMiniMenu.close();
		    this.clock.restore();
	});

	QUnit.test("Pressing the Overflow Button on a MiniMenu", function(assert){
		this.clock = sinon.useFakeTimers();
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		this.clock.tick(this.oMiniMenuPlugin.iMenuLeftclickOpeningDelay);

		oMiniMenu._onOverflowPress.bind(oMiniMenu)();
		assert.ok(true, "Should throw no error");
		oMiniMenu = null;

		this.clock.restore();
	});

	QUnit.test("Testing onHover function", function (assert) {
		this.clock = sinon.useFakeTimers();
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseover");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");

		this.clock.tick(this.oMiniMenuPlugin.iMenuHoverOpeningDelay);

		assert.ok(oMiniMenu.isOpen, "MiniMenu should be open");
		assert.strictEqual(oMiniMenu.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
		oMiniMenu = null;
		this.clock.restore();
	});

	QUnit.test("Testing onHover with onHoverExit function", function (assert) {
		this.clock = sinon.useFakeTimers();
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseover");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");

		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseout");
		this.clock.tick(this.oMiniMenuPlugin.iMenuHoverOpeningDelay);

		assert.ok(!oMiniMenu.isOpen, "MiniMenu should not be open");
		oMiniMenu = null;

		this.clock.restore();
	});

	QUnit.test("Testing onClick function", function (assert) {
		this.clock = sinon.useFakeTimers();
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");

		this.clock.tick(this.oMiniMenuPlugin.iMenuLeftclickOpeningDelay);


		assert.ok(oMiniMenu.isOpen, "MiniMenu should be open");
		assert.strictEqual(oMiniMenu.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
		oMiniMenu = null;

		this.clock.restore();
	});


	QUnit.test("Testing onClick function unlocking opening of the MiniMenu", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		this.oMiniMenuPlugin.lockMenuOpening();
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");

		this.clock.tick(this.oMiniMenuPlugin.iMenuLeftclickOpeningDelay);

		assert.ok(!oMiniMenu.isOpen, "MiniMenu should not be open");
		oMiniMenu = null;
		this.clock.restore();
	});

	QUnit.test("Testing onTouch function", function (assert) {
		this.clock = sinon.useFakeTimers();
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "touchstart");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");

		this.clock.tick(this.oMiniMenuPlugin.iMenuTouchOpeningDelay);

		assert.ok(oMiniMenu.isOpen, "MiniMenu should be open");
		assert.strictEqual(oMiniMenu.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
		oMiniMenu = null;
		this.clock.restore();
	});

	QUnit.test("Testing onKeyDown function", function (assert) {
		var _tempListener = function (oEvent){
			oEvent.keyCode = jQuery.sap.KeyCodes.F10;
			oEvent.shiftKey = true;
			oEvent.altKey = false;
			oEvent.ctrlKey = false;


			var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;
			this.oMiniMenuPlugin._onKeyDown(oEvent);

			assert.ok(oMiniMenu.isOpen, "MiniMenu should be open");
			assert.strictEqual(oMiniMenu.getFlexbox().getDirection(), "Column", "Flexbox should be set to Column");
			oMiniMenu = null;

		}.bind(this);

		this.oButton2Overlay.attachBrowserEvent("keydown", _tempListener, this);
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "keydown");
	});


	QUnit.test("Performing a right click when a Timeout from left-click/hover is active", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		assert.ok(oMiniMenu.isOpen, "MiniMenu should be open");
		assert.strictEqual(oMiniMenu.getFlexbox().getDirection(), "Column", "Flexbox should be set to Column");
		oMiniMenu = null;

	});

	QUnit.test("Clicking on a button in the MiniMenu", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(oMiniMenu.isOpen , "MiniMenu should be open");
		assert.strictEqual(oMiniMenu.getFlexbox().getDirection(), "Column", "Flexbox should be set to Column");
		this.oMiniMenuPlugin._currentOverlay = this.oButton2Overlay;
		oMiniMenu.getFlexbox().getItems()[0].firePress();
		oMiniMenu = null;
	});

	QUnit.test("Deregistering an Overlay", function (assert) {

		this.oMiniMenuPlugin.deregisterElementOverlay(this.oButton1Overlay);
		assert.ok(true, "Should throw no error");

	});

	QUnit.test("calling _getPopoverDimensions for different kinds of menus", function (assert) {
		this.clock = sinon.useFakeTimers();
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		this.clock.tick(this.oMiniMenuPlugin.iMenuLeftclickOpeningDelay);

		var oPopoverContext = oMiniMenu._getPopoverDimensions(true, false);
		var oPopover = oMiniMenu._getPopoverDimensions(false, true);
		var oPopoverExpanded = oMiniMenu._getPopoverDimensions(true, true);

		assert.strictEqual(typeof oPopoverContext.height, "number", "the height of a context menu should be a number");
		assert.ok(!isNaN(oPopoverContext.height), "the height of a context menu shouldn't be NaN");

		assert.strictEqual(typeof oPopoverContext.width, "number", "the width of a context menu should be a number");
		assert.ok(!isNaN(oPopoverContext.width), "the width of a context menu shouldn't be NaN");

		assert.strictEqual(typeof oPopover.height, "number", "the height of a non-expanded MiniMenu should be a number");
		assert.ok(!isNaN(oPopover.height), "the height of a non-expanded MiniMenu shouldn't be NaN");

		assert.strictEqual(typeof oPopover.width, "number", "the width of a non-expanded MiniMenu should be a number");
		assert.ok(!isNaN(oPopover.width), "the width of a non-expanded MiniMenu shouldn't be NaN");

		assert.strictEqual(typeof oPopoverExpanded.height, "number", "the height of an expanded MiniMenu should be a number");
		assert.ok(!isNaN(oPopoverExpanded.height), "the height of an expanded MiniMenu shouldn't be NaN");

		assert.strictEqual(typeof oPopoverExpanded.width, "number", "the width of an expanded MiniMenu should be a number");
		assert.ok(!isNaN(oPopoverExpanded.width), "the width of an expanded MiniMenu shouldn't be NaN");

		assert.ok(oPopoverContext.height < oPopoverExpanded.height, "the height of a context menu should be less than the hight of an expanded MiniMenu (if they have the same amount of buttons)");
		assert.ok(oPopoverContext.width < oPopoverExpanded.width, "the width of a context menu should be less than that of an expanded MiniMenu (if they have the same amount of buttons)");
		assert.ok(oPopover.height < oPopoverExpanded.width, "an expanded MiniMenu should be higher than a non-expanded MiniMenu (if the expanded one has more than one buttons");

		this.clock.restore();
	});

	QUnit.module("MiniMenuControl API", {
		beforeEach: function(assert) {
			var that = this;
			this.oButton1 = new sap.m.Button();
			this.oButton2 = new sap.m.Button();
			this.oButtonUnselectable = new sap.m.Button();

			this.oLayout = new sap.ui.layout.VerticalLayout({
				content: [
					this.oButton1, this.oButton2, this.oButtonUnselectable
				]
			});

			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oMenuEntries = {};
			this.oMenuEntries.available = {
				id : "CTX_ALWAYS_THERE",
				text : function () {return "item that is always there"; },
				handler : sinon.spy()
			};
			this.oMenuEntries.alwaysStartSection = {
				id : "CTX_START_SECTION",
				text : "starts new section ",
				rank : 2,
				handler : sinon.spy(),
				startSection : true
			};
			this.oMenuEntries.dynamicTextItem = {
				id : "CTX_DYNAMIC_TEXT",
				text : function() {
					return "Test";
				},
				handler : sinon.spy()
			};

			this.oMiniMenu = new MiniMenuControl();
			for (var key in this.oMenuEntries){
				this.oMiniMenu.addButton(this.oMenuEntries[key]);
			}

			var done = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				],
				plugins: [
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();

				that.oButton1Overlay = OverlayRegistry.getOverlay(that.oButton1);
				that.oButton1Overlay.setSelectable(true);
				that.oButton2Overlay = OverlayRegistry.getOverlay(that.oButton2);
				that.oButton2Overlay.setSelectable(true);
				that.oUnselectableOverlay = OverlayRegistry.getOverlay(that.oButtonUnselectable);

				done();
			});
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.oMiniMenu.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("calling getPopover", function (assert) {
		assert.ok(this.oMiniMenu.getPopover() instanceof sap.m.Popover, "should return a Popover");
	});

	QUnit.test("calling getFlexbox", function (assert) {
		assert.ok(this.oMiniMenu.getFlexbox() instanceof sap.m.FlexBox, "should return a FlexBox");
	});

	QUnit.test("default value of maxButtonsDisplayed", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");

		assert.strictEqual(this.oMiniMenu.getMaxButtonsDisplayed(), 4, "Should return 4.");
	});

	QUnit.test("setting value of maxButtonsDisplayed", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");

		this.oMiniMenu.setMaxButtonsDisplayed(19);

		assert.strictEqual(this.oMiniMenu.getMaxButtonsDisplayed(), 19, "Should return 19.");
	});

	QUnit.test("setting value of maxButtonsDisplayed to an illegal value", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");

		assert.throws(function () {this.oMiniMenu.setMaxButtonsDisplayed(1);}, "Should throw an Error.");
    });


    QUnit.test("adding a button", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");

        var oBtn = {
            text: "TestText",
            icon: "",
            handler: function () {}
        };

        assert.strictEqual(this.oMiniMenu.addButton(oBtn), this.oMiniMenu, "Should return the MiniMenu");

		assert.strictEqual(this.oMiniMenu.getFlexbox(true).getItems()[this.oMiniMenu.getFlexbox(true).getItems().length - 1].getText(), oBtn.text, "Button should be added to Flexbox 1");
		assert.strictEqual(this.oMiniMenu.getFlexbox(true).getItems()[this.oMiniMenu.getFlexbox(true).getItems().length - 1].getText(), oBtn.text, "Button should be added to Flexbox 2");
	});

    QUnit.test("removing a button", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");

        var oRemovedButton = this.oMiniMenu.removeButton(0);

		var aItems = this.oMiniMenu.getFlexbox(true).getItems();
		var aItems2 = this.oMiniMenu.getFlexbox(false).getItems();

        for (var i = 0; i < aItems.length; i++) {
            if (aItems[i] === oRemovedButton) {
                assert.ok(false, "didn't remove the button");
            }
		}

		for (var i1 = 0; i1 < aItems2.length; i1++) {
            if (aItems2[i1] === oRemovedButton) {
                assert.ok(false, "didn't remove the button");
            }
        }

		assert.strictEqual(aItems.length, 2,"should remove a button");
		assert.strictEqual(aItems2.length, 2,"should remove a button");
    });

    QUnit.test("removing all buttons", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");

        this.oMiniMenu.removeAllButtons();

		assert.strictEqual(this.oMiniMenu.getDependents()[0].getContent()[0].getItems().length, 0, "should remove all buttons");
	});

	QUnit.test("getting all buttons", function (assert) {
		assert.strictEqual(this.oMiniMenu.getButtons().length, 3, "Should return the number of buttons");
    });

    QUnit.test("Inserting a button", function (assert) {
        assert.strictEqual(this.oMiniMenu.insertButton(new sap.m.Button({text : "abc"}), 1), this.oMiniMenu, "Should return the MiniMenu");
        assert.strictEqual(this.oMiniMenu.getButtons()[1].getText(), "abc", "Should return the text of the inserted button");
	});


	QUnit.test("calling _getOverlayDimensions", function (assert) {

		jQuery("#qunit-fixture").append("<div id=\"fakeOverlay\" style=\"width:10px; height:12px; position: absolute; top:3px; left:5px;\" />");

		var oOverlay = this.oMiniMenu._getOverlayDimensions("fakeOverlay");

		assert.strictEqual(typeof oOverlay.top, "number", "top should be a number");
		assert.ok(!isNaN(oOverlay.top), "top shouldn't be NaN");

		assert.strictEqual(typeof oOverlay.left, "number", "left should be a number");
		assert.ok(!isNaN(oOverlay.left), "left shouldn't be NaN");

		assert.strictEqual(typeof oOverlay.width, "number", "width should be a number");
		assert.ok(!isNaN(oOverlay.width), "width shouldn't be NaN");

		assert.strictEqual(typeof oOverlay.height, "number", "heigth should be a number");
		assert.ok(!isNaN(oOverlay.height), "height shouldn't be NaN");

		assert.strictEqual(typeof oOverlay.right, "number", "right should be a number");
		assert.ok(!isNaN(oOverlay.right), "right shouldn't be NaN");
		assert.strictEqual(oOverlay.right, oOverlay.left + oOverlay.width, "right  should be equal to left + width");

		assert.strictEqual(typeof oOverlay.bottom, "number", "bottom should be a number");
		assert.ok(!isNaN(oOverlay.bottom), "bottom shouldn't be NaN");
		assert.strictEqual(oOverlay.bottom, oOverlay.top + oOverlay.height, "bottom should be equal to top + height");
	});

	QUnit.test("calling _getViewportDimensions", function (assert) {
		var oViewport = this.oMiniMenu._getViewportDimensions();

		assert.strictEqual(typeof oViewport.top, "number", "top should be a number");
		assert.ok(!isNaN(oViewport.top), "top shouldn't be NaN");

		assert.strictEqual(typeof oViewport.bottom, "number", "bottom should be a number");
		assert.ok(!isNaN(oViewport.bottom), "bottrop shouldn't be NaN");
		assert.strictEqual(oViewport.bottom, oViewport.top + oViewport.height, "bottom should be equal to top + height");

		assert.strictEqual(typeof oViewport.width, "number", "width should be a number");
		assert.ok(!isNaN(oViewport.width), "width shouldn't be NaN");

		assert.strictEqual(typeof oViewport.height, "number", "height should be a number");
		assert.ok(!isNaN(oViewport.height), "height shouldn't be NaN");
	});

	QUnit.test("calling _getMiddleOfOverlayAndViewportEdges", function (assert) {

		var oOverlay = {top: 10, bottom: 20};
		var oViewport = {top: 0, bottom: 30};

		var iTop = this.oMiniMenu._getMiddleOfOverlayAndViewportEdges(oOverlay, oViewport);
		assert.strictEqual(iTop, 15, "entire overlay inside of viewport");

		oOverlay = {top: 0, bottom: 20};
		oViewport = {top: 10, bottom: 30};

		iTop = this.oMiniMenu._getMiddleOfOverlayAndViewportEdges(oOverlay, oViewport);
		assert.strictEqual(iTop, 15, "top of overlay outside of viewport");

		oOverlay = {top: 10, bottom: 30};
		oViewport = {top: 0, bottom: 20};

		iTop = this.oMiniMenu._getMiddleOfOverlayAndViewportEdges(oOverlay, oViewport);
		assert.strictEqual(iTop, 15, "bottom of overlay outside of viewport");

		oOverlay = {top: 0, bottom: 30};
		oViewport = {top: 10, bottom: 20};

		iTop = this.oMiniMenu._getMiddleOfOverlayAndViewportEdges(oOverlay, oViewport);
		assert.strictEqual(iTop, 15, "top and bottom of overlay outside of viewport");

		oOverlay = null;
		oViewport = null;
		iTop = null;
	});

	QUnit.test("calling _getMiniMenuSidewaysPlacement", function (assert) {

		var oOverlay = {right: 60};
		var oPopover = {width: 20};
		var oViewport = {width: 100};

		var iLeft = this.oMiniMenu._getMiniMenuSidewaysPlacement(oOverlay, oPopover, oViewport);
		assert.strictEqual(iLeft, 60, "There is enough space on the right");
		assert.strictEqual(this.oMiniMenu.getPopover().getPlacement(), "Right", "Placment should be Right");

		oOverlay = {left: 40};
		oPopover = {width: 20};
		oViewport = {};

		iLeft = this.oMiniMenu._getMiniMenuSidewaysPlacement(oOverlay, oPopover, oViewport);
		assert.strictEqual(iLeft, 40, "There is enough space on the left");
		assert.strictEqual(this.oMiniMenu.getPopover().getPlacement(), "Left", "Placment should be Right");

		oOverlay = {left: 22, width: 40};
		oPopover = {width: 30};
		oViewport = {width: 80};

		iLeft = this.oMiniMenu._getMiniMenuSidewaysPlacement(oOverlay, oPopover, oViewport);
		assert.strictEqual(iLeft, 42, "The MiniMenu can be opened to the right from the center of the overlay");
		assert.strictEqual(this.oMiniMenu.getPopover().getPlacement(), "Right", "Placment should be Right");

		oOverlay = {left: 22, width: 40};
		oPopover = {width: 50};
		oViewport = {width: 80};

		iLeft = this.oMiniMenu._getMiniMenuSidewaysPlacement(oOverlay, oPopover, oViewport);
		assert.strictEqual(iLeft, 30, "The MiniMenu can be opened to the right from some place left of the center of the overlay");
		assert.strictEqual(this.oMiniMenu.getPopover().getPlacement(), "Right", "Placment should be Right");

		oOverlay = null;
		oPopover = null;
		oViewport = null;
		iLeft = null;
	});

	QUnit.test("calling _placeMiniMenuSideways", function (assert) {

		var oOverlay = {right: 60, top: 10, bottom: 20};
		var oPopover = {width: 20};
		var oViewport = {top: 0, bottom: 30, width: 100};

		var spy1 = sinon.spy(this.oMiniMenu, "_getMiddleOfOverlayAndViewportEdges");
		var spy2 = sinon.spy(this.oMiniMenu, "_getMiniMenuSidewaysPlacement");

		this.oMiniMenu._placeMiniMenuSideways(oOverlay, oPopover, oViewport);
		sinon.assert.calledOnce(spy1);
		sinon.assert.calledOnce(spy2);

		oOverlay = null;
		oPopover = null;
		oViewport = null;
		spy1 = null;
		spy2 = null;
	});

	QUnit.test("calling _placeMiniMenuAtTheBottom", function (assert) {

		var oOverlay = {left: 20, width: 30, height: 30, bottom: 90, top: 60};
		var oPopover = {height: 60};
		var oViewport = {height: 200};

		var oPos = this.oMiniMenu._placeMiniMenuAtTheBottom(oOverlay, oPopover, oViewport);
		assert.strictEqual(oPos.top, 90, "Should be at the bottom of the overlay");
		assert.strictEqual(oPos.left, 35, "Should be the middle of the overlay");

		oOverlay = {top: 60, height: 30};
		oPopover = {};
		oViewport = {top: 0};

		oPos = this.oMiniMenu._placeMiniMenuAtTheBottom(oOverlay, oPopover, oViewport);
		assert.strictEqual(oPos.top, 65, "Should be 5 bellow the top of the overlay");

		oOverlay = {top: 60};
		oPopover = {};
		oViewport = {top: 0};

		oPos = this.oMiniMenu._placeMiniMenuAtTheBottom(oOverlay, oPopover, oViewport);
		assert.strictEqual(oPos.top, 65, "Should be 5 bellow the top of the overlay");

		oOverlay = {top: 60};
		oPopover = {height: 60};
		oViewport = {top: 80};

		oPos = this.oMiniMenu._placeMiniMenuAtTheBottom(oOverlay, oPopover, oViewport);
		assert.strictEqual(oPos.top, 85, "Should be 5 bellow the top of the viewport");

		oOverlay = null;
		oPopover = null;
		oViewport = null;
		oPos = null;
	});

	QUnit.test("calling _placeMiniMenuOnTop", function (assert) {

		var oOverlay = {top: 100, left: 20, width: 30};

		var oPos = this.oMiniMenu._placeMiniMenuOnTop(oOverlay);
		assert.strictEqual(oPos.top, 100, "Should be the top of the overlay");
		assert.strictEqual(oPos.left, 35, "Should be the middle of the overlay");

		oOverlay = null;
		oPos = null;
	});

	QUnit.test("calling _placeAsMiniMenu", function (assert) {

		var oOverlay = {top: 100};
		var oPopover = {height: 50, width: 40};
		var oViewport = {width: 100};

		var spyTop = sinon.spy(this.oMiniMenu, "_placeMiniMenuOnTop");
		var spyBottom = sinon.spy(this.oMiniMenu, "_placeMiniMenuAtTheBottom");
		var spySideways = sinon.spy(this.oMiniMenu, "_placeMiniMenuSideways");

		this.oMiniMenu._placeAsMiniMenu(oOverlay, oPopover, oViewport);
		sinon.assert.calledOnce(spyTop);
		sinon.assert.notCalled(spyBottom);
		sinon.assert.notCalled(spySideways);
		assert.strictEqual(this.oMiniMenu.getPopover().getShowArrow(), true, "Arrow should be visible");

		oOverlay = {top: 50};
		oPopover = {height: 60, width: 40};
		oViewport = {height: 200, width: 200};

		spyTop.reset();
		spyBottom.reset();
		spySideways.reset();

		this.oMiniMenu._placeAsMiniMenu(oOverlay, oPopover, oViewport);
		sinon.assert.notCalled(spyTop);
		sinon.assert.calledOnce(spyBottom);
		sinon.assert.notCalled(spySideways);

		oOverlay = {};
		oPopover = {height: 50, width: 40};
		oViewport = {height: 100, width: 100};

		spyTop.reset();
		spyBottom.reset();
		spySideways.reset();

		this.oMiniMenu._placeAsMiniMenu(oOverlay, oPopover, oViewport);
		sinon.assert.notCalled(spyTop);
		sinon.assert.notCalled(spyBottom);
		sinon.assert.calledOnce(spySideways);

		oOverlay = {};
		oPopover = {height: 270, width: 40};
		oViewport = {height: 200, width: 200};

		spyTop.reset();
		spyBottom.reset();
		spySideways.reset();


		assert.throws(this.oMiniMenu._placeAsMiniMenu.bind(this.oMiniMenu, oOverlay, oPopover, oViewport), Error("Your screen size is not supported!"), "Should throw an error");
		sinon.assert.notCalled(spyTop);
		sinon.assert.notCalled(spyBottom);
		sinon.assert.notCalled(spySideways);

		oOverlay = null;
		oPopover = null;
		oViewport = null;
		spyTop = null;
		spyBottom = null;
		spySideways = null;
	});

	QUnit.test("calling _placeAsContextMenu", function (assert) {

		var oContPos = {x: 90, y: 80};
		var oPopover = {width: 40, height: 60};
		var oViewport = {width: 200, height: 200};

		var oPos = this.oMiniMenu._placeAsContextMenu(oContPos, oPopover, oViewport);
		assert.strictEqual(oPos.top, 80, "should be the y coordinate of the context menu position");
		assert.strictEqual(oPos.left, 90, "should be the x coordinate of the context menu position");
		assert.strictEqual(this.oMiniMenu.getPopover().getPlacement(), "Bottom", "placement should be Bottom");
		assert.strictEqual(this.oMiniMenu.getPopover().getShowArrow(), false, "Arrow shouldn't be visible");

		oContPos = {x: 180, y: 160};
		oPopover = {width: 40, height: 60};
		oViewport = {width: 200, height: 200};

		oPos = this.oMiniMenu._placeAsContextMenu(oContPos, oPopover, oViewport);
		assert.strictEqual(oPos.top, 160, "should be the y coordinate of the context menu position");
		assert.strictEqual(oPos.left, 140, "should be oContPos.x - oPopover.width");
		assert.strictEqual(this.oMiniMenu.getPopover().getPlacement(), "Top", "placement should be Top");

		oContPos = {x: 50, y: 60};
		oPopover = {width: 60, height: 80};
		oViewport = {width: 100, height: 100};

		oPos = this.oMiniMenu._placeAsContextMenu(oContPos, oPopover, oViewport);
		assert.strictEqual(oPos.top, 20, "should be oViewport.height - oContPos.y");
		assert.strictEqual(oPos.left, 40, "should be oViewport.width - oContPos.x");
		assert.strictEqual(this.oMiniMenu.getPopover().getPlacement(), "Bottom", "placement should be Bottom");

		oContPos = {x: 40, y: 60};
		oPopover = {width: 60, height: 80};
		oViewport = {width: 50, height: 200};

		assert.throws(this.oMiniMenu._placeAsContextMenu.bind(this.oMiniMenu, oContPos, oPopover, oViewport), Error("Your screen size is not supported!"), "Should throw an error");

		oContPos = {x: 60, y: 40};
		oPopover = {width: 60, height: 80};
		oViewport = {width: 200, height: 50};

		assert.throws(this.oMiniMenu._placeAsContextMenu.bind(this.oMiniMenu, oContPos, oPopover, oViewport), Error("Your screen size is not supported!"), "Should throw an error");

		oContPos = null;
		oPopover = null;
		oViewport = null;
		oPos = null;
	});

	QUnit.test("calling _placeMiniMenu", function (assert) {

		this.oMiniMenu._contextMenuPosition = {x: 314, y: 42};

		this.oMiniMenu.addButton({text: "button", handler: function () {return undefined;}, id: "newButton0"});

		var spyContext = sinon.spy(this.oMiniMenu, "_placeAsContextMenu");
		var spyMini = sinon.spy(this.oMiniMenu, "_placeAsMiniMenu");

		var fakeDiv = this.oMiniMenu._placeMiniMenu(this.oButton2Overlay, true, true);

		assert.ok(fakeDiv instanceof Element, "should return an HTML Element");
		assert.strictEqual(fakeDiv.getAttribute("overlay"), this.oButton2Overlay.getId(), "the fakeDiv should have an overlay attribute containing the id of the original overlay");
		assert.strictEqual(fakeDiv.getAttribute("id"), "fakeDiv", "the fakeDiv should have the id \"fakeDiv\"");
		assert.strictEqual(fakeDiv, jQuery("#" + this.oButton2Overlay.getId()).children()[1], "the fakeDiv should be a child of the overlay the MiniMenu was placed by");

		sinon.assert.calledOnce(spyContext);
		sinon.assert.notCalled(spyMini);

		spyContext.reset();
		spyMini.reset();

		this.oMiniMenu._iButtonsVisible = 3;
		this.oMiniMenu._placeMiniMenu(this.oButton2Overlay, false, false);

		sinon.assert.calledOnce(spyMini);
		sinon.assert.notCalled(spyContext);

		spyContext = null;
		spyMini = null;
		fakeDiv = null;
	});

	QUnit.test("calling _placeMiniMenuWrapper", function (assert) {

		var oBtn = new sap.m.Button({}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		this.oMiniMenu.show(oBtn, false);

		this.oMiniMenu._placeMiniMenuWrapper();

		var oMiniMenuWrapper = document.getElementById("MiniMenuWrapper");

		assert.ok(oMiniMenuWrapper instanceof Element, "The MiniMenu wrapper should be an Element in the DOM");

		oBtn = null;
	});

	QUnit.test("comparing the height of an actual rendered sap.m.Button to the return value of _getButtonHeight", function (assert) {

		var oCozyBtn = new sap.m.Button({
			id : "cozyBtnH",
			icon : "sap-icon://fridge",
			text : "Cozy Button"
		}).placeAt("qunit-fixture");

		var oCompactBtn = new sap.m.Button({
			id : "compactBtnH",
			icon : "sap-icon://dishwasher",
			text : "Compact Button"
		}).placeAt("compact-fixture");

		sap.ui.getCore().applyChanges();

		var fCalculatedCozyHeight = this.oMiniMenu._getButtonHeight(false);
		var fMeasuredCozyHeight = parseInt(jQuery(oCozyBtn.getDomRef()).css("height"), 10) / 16;
		var fCalculatedCompactHeight = this.oMiniMenu._getButtonHeight(true);
		var fMeasuredCompactHeight = parseInt(jQuery(oCompactBtn.getDomRef()).css("height"), 10) / 16;

		assert.strictEqual(fCalculatedCozyHeight, fMeasuredCozyHeight, "To prevent rendering the MiniMenu a bunch of times its height is calculated based on the css values of sap.m.Button. If this test fails the css values of sap.m.Buttons may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getButtonHeight (for bCompact = false) has to be adjusted to whatever the expected value was in this test.");
		assert.strictEqual(fCalculatedCompactHeight, fMeasuredCompactHeight, "To prevent rendering the MiniMenu a bunch of times height size is calculated based on the css values of sap.m.Button. If this test fails the css values of sap.m.Buttons may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getButtonHeight (for bCompact = true) has to be adjusted to whatever the expected value was in this test.");

		oCozyBtn = null;
		oCompactBtn = null;
		fCalculatedCozyHeight = null;
		fMeasuredCozyHeight = null;
		fCalculatedCompactHeight = null;
		fMeasuredCompactHeight = null;
	});

	QUnit.test("comparing the width of an actual rendered sap.m.Button (icon only) to the return value of _getButtonWidth", function (assert) {

		var oCozyBtn = new sap.m.Button({
			id : "cozyBtnW",
			icon : "sap-icon://fridge"
		}).placeAt("qunit-fixture");

		var oCompactBtn = new sap.m.Button({
			id : "compactBtnW",
			icon : "sap-icon://dishwasher"
		}).placeAt("compact-fixture");

		sap.ui.getCore().applyChanges();

		var fCalculatedCozyWidth = this.oMiniMenu._getButtonWidth(false);
		var fMeasuredCozyWidth = parseInt(jQuery(oCozyBtn.getDomRef()).css("width"), 10) / 16;
		var fCalculatedCompactWidth = this.oMiniMenu._getButtonWidth(true);
		var fMeasuredCompactWidth = parseInt(jQuery(oCompactBtn.getDomRef()).css("width"), 10) / 16;

		assert.strictEqual(fCalculatedCozyWidth, fMeasuredCozyWidth, "To prevent rendering the MiniMenu a bunch of times its width is calculated based on the css values of sap.m.Button. If this test fails the css values of sap.m.Buttons may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getButtonWidth (for bCompact = false) has to be adjusted to whatever the expected value was in this test.");
		assert.strictEqual(fCalculatedCompactWidth, fMeasuredCompactWidth, "To prevent rendering the MiniMenu a bunch of times its width is calculated based on the css values of sap.m.Button. If this test fails the css values of sap.m.Buttons may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getButtonWidth (for bCompact = true) has to be adjusted to whatever the expected value was in this test.");

		oCozyBtn = null;
		oCompactBtn = null;
		fCalculatedCozyWidth = null;
		fMeasuredCozyWidth = null;
		fCalculatedCompactWidth = null;
		fMeasuredCompactWidth = null;
	});

	QUnit.test("comparing the height of the arrow of an actual rendered sap.m.Popover to the return value of _getArrowHeight", function (assert) {

		var oCozyBtn = new sap.m.Button({
			id : "cozyBtnA",
			icon : "sap-icon://fridge"
		}).placeAt("qunit-fixture");

		var oCompactBtn = new sap.m.Button({
			id : "compactBtnA",
			icon : "sap-icon://dishwasher"
		}).placeAt("compact-fixture");

		sap.ui.getCore().applyChanges();

		var oCozyPop = new sap.m.Popover({
			id : "cozyPopA",
			placement : "Bottom"
		}).openBy(oCozyBtn);

		var oCompactPop = new sap.m.Popover({
			id : "compactPopA",
			placement : "Bottom"
		}).openBy(oCompactBtn);

		var fCalculatedCozyArrowSize = this.oMiniMenu._getArrowHeight(false);
		var fMeasuredCozyArrowSize = parseInt(jQuery("#cozyPopA-arrow").css("height"), 10) / 16;
		var fCalculatedCompactArrowSize = this.oMiniMenu._getArrowHeight(true);
		var fMeasuredCompactArrowSize = parseInt(jQuery("#compactPopA-arrow").css("height"), 10) / 16;

		oCozyPop.close();
		oCompactPop.close();

		assert.strictEqual(fCalculatedCozyArrowSize, fMeasuredCozyArrowSize, "To prevent rendering the MiniMenu a bunch of times the size of the Popover's Arrow is calculated based on the css values of sap.m.Popover. If this test fails the css values of sap.m.Popover may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getArrowHeight (for bCompact = false) has to be adjusted to whatever the expected value was in this test.");
		assert.strictEqual(fCalculatedCompactArrowSize, fMeasuredCompactArrowSize, "To prevent rendering the MiniMenu a bunch of times the size of the Popover's Arrow is calculated based on the css values of sap.m.Popover. If this test fails the css values of sap.m.Popover may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getArrowHeight (for bCompact = true) has to be adjusted to whatever the expected value was in this test.");

		oCozyBtn = null;
		oCompactBtn = null;
		oCozyPop = null;
		oCompactPop = null;
		fCalculatedCozyArrowSize = null;
		fMeasuredCozyArrowSize = null;
		fCalculatedCompactArrowSize = null;
		fMeasuredCompactArrowSize = null;
	});

	QUnit.test("calling _getBaseFontSize", function (assert) {

		var iBaseFontSize = this.oMiniMenu._getBaseFontSize();

		assert.strictEqual(typeof iBaseFontSize, "number", "The base font size should be a number.");
		assert.ok(!isNaN(iBaseFontSize), "The base font size shouldn't be NaN.");

		iBaseFontSize = null;
	});

	QUnit.test("calling _makeAllButtonsVisible", function (assert) {

		var aButtons = [

			new sap.m.OverflowToolbarButton({
				id: "btn0",
				text: "Button 0",
				visible : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn1",
				text: "Button 1",
				visible : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn2",
				text: "Button 2",
				visible : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn3",
				text: "Button 3",
				visible : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn4",
				text: "Button 4",
				visible : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn5",
				text: "Button 5",
				visible : false
			})
		];

		this.oMiniMenu._makeAllButtonsVisible(aButtons);

		for (var i = 0; i < aButtons.length; i++) {

			assert.strictEqual(aButtons[i].getVisible(), true, "Button " + i + " should be visible.");
			assert.strictEqual(aButtons[i].getText(), "Button " + i, "Text should be Button " + i + ".");
			assert.strictEqual(aButtons[i]._bInOverflow, true, "_bInOverflow of Button " + i + " should be true.");
		}

		aButtons = null;
	});

	QUnit.test("calling _getNumberOfEnabledButtons", function (assert) {

		var aButtons = [

			new sap.m.OverflowToolbarButton({
				id: "btn0E",
				text: "Button 0",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn1E",
				text: "Button 1",
				visible : true,
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn2E",
				text: "Button 2",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn3E",
				text: "Button 3",
				visible : true,
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn4E",
				text: "Button 4",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn5E",
				text: "Button 5",
				visible : true,
				enabled : true
			})
		];

		var iEnabledButtons = this.oMiniMenu._getNumberOfEnabledButtons(aButtons);

		assert.strictEqual(iEnabledButtons, 4, "4 buttons should be enabled");

		iEnabledButtons = null;
		aButtons = null;
	});

	QUnit.test("calling _hideDisabledButtons", function (assert) {

		var aButtons = [

			new sap.m.OverflowToolbarButton({
				id: "btn0D",
				text: "Button 0",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn1D",
				text: "Button 1",
				visible : true,
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn2D",
				text: "Button 2",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn3D",
				text: "Button 3",
				visible : true,
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn4D",
				text: "Button 4",
				visible : true,
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn5D",
				text: "Button 5",
				visible : true,
				enabled : true
			})
		];

		var iVisibleButtons = this.oMiniMenu._hideDisabledButtons(aButtons);

		assert.strictEqual(iVisibleButtons, 3, "3 Buttons should be visible");

		for (var i = 0; i < aButtons.length; i++) {
			assert.strictEqual(aButtons[i].getVisible(), aButtons[i].getEnabled(), "Enabled Buttons should be visible. Disabled Buttons should be hidden");
		}

		iVisibleButtons = null;
		aButtons = null;
	});

	QUnit.test("calling _hideButtonsInOverflow", function (assert) {

		var aButtons = [

			new sap.m.OverflowToolbarButton({
				id: "btn0O",
				text: "Button 0",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn1O",
				text: "Button 1",
				visible : false,
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn2O",
				text: "Button 2",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn3O",
				text: "Button 3",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn4O",
				text: "Button 4",
				visible : false,
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn5O",
				text: "Button 5",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn6O",
				text: "Button 6",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn7O",
				text: "Button 7",
				visible : true,
				enabled : true
			})
		];

		var iVisibleButtons = this.oMiniMenu._hideButtonsInOverflow(aButtons);

		assert.strictEqual(iVisibleButtons, 4, "4 Buttons should be visible");

		assert.strictEqual(aButtons[0].getVisible(), true, "should be visible");
		assert.strictEqual(aButtons[1].getVisible(), false, "should be hidden");
		assert.strictEqual(aButtons[2].getVisible(), true, "should be visible");
		assert.strictEqual(aButtons[3].getVisible(), true, "should be visible");
		assert.strictEqual(aButtons[4].getVisible(), false, "should be hidden");
		assert.strictEqual(aButtons[5].getVisible(), true, "should be visible");
		assert.strictEqual(aButtons[6].getVisible(), false, "should be hidden");
		assert.strictEqual(aButtons[7].getVisible(), false, "should be hidden");

		iVisibleButtons = null;
		aButtons = null;
	});

	QUnit.test("calling _hideButtonsInOverflow when no buttons are in overflow", function (assert) {

		var aButtons = [

			new sap.m.OverflowToolbarButton({
				id: "btn0N",
				text: "Button 0",
				visible : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn1N",
				text: "Button 1",
				visible : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn2N",
				text: "Button 2",
				visible : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn3N",
				text: "Button 3",
				visible : true
			})
		];

		var iVisibleButtons = this.oMiniMenu._hideButtonsInOverflow(aButtons);

		assert.strictEqual(iVisibleButtons, 4, "4 Buttons should be visible");

		for (var i = 0; i < aButtons.length; i++) {
			assert.strictEqual(aButtons[i].getVisible(), true, "Button " + i + " should be visible");
		}

		iVisibleButtons = null;
		aButtons = null;
	});

	QUnit.test("calling _replaceLastVisibleButtonWithOverflowButton", function (assert) {

		var aButtons = [

			new sap.m.OverflowToolbarButton({
				id: "btn0R",
				text: "Button 0",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn1R",
				text: "Button 1",
				visible : false,
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn2R",
				text: "Button 2",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn3R",
				text: "Button 3",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn4R",
				text: "Button 4",
				visible : false,
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn5R",
				text: "Button 5",
				visible : true,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn6R",
				text: "Button 6",
				visible : false,
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn7R",
				text: "Button 7",
				visible : false,
				enabled : true
			})
		];

		this.oMiniMenu._replaceLastVisibleButtonWithOverflowButton(aButtons);

		assert.strictEqual(aButtons[5].getVisible(), false, "should be hidden");

		var oLastButton = this.oMiniMenu.getButtons()[this.oMiniMenu.getButtons().length - 1];

		assert.strictEqual(oLastButton.getIcon(), "sap-icon://overflow", "Last Button should be the Overflow Button.");

		oLastButton = null;
		aButtons = null;
	});

	QUnit.test("calling _setButtonsForMiniMenu with 3 disabled Buttons", function (assert) {

		var aButtons = [

			new sap.m.OverflowToolbarButton({
				id: "btn0S",
				text: "Button 0",
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn1S",
				text: "Button 1",
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn2S",
				text: "Button 2",
				enabled : false
			})
		];

		var spyEnabledButtons = sinon.spy(this.oMiniMenu, "_getNumberOfEnabledButtons");
		var spyHideDisabled = sinon.spy(this.oMiniMenu, "_hideDisabledButtons");
		var spyHideInOverflow = sinon.spy(this.oMiniMenu, "_hideButtonsInOverflow");
		var spyReplaceLast = sinon.spy(this.oMiniMenu, "_replaceLastVisibleButtonWithOverflowButton");
		var spyCreateOverflow = sinon.spy(this.oMiniMenu, "_createOverflowButton");

		this.oMiniMenu._setButtonsForMiniMenu(aButtons, new sap.m.Button({id : "btn0_"}));

		for (var i = 0; i < aButtons.length; i++) {
			assert.notEqual(aButtons[i].getTooltip(), "", "ToolTip shouldn't be empty string");
		}

		sinon.assert.calledOnce(spyEnabledButtons);
		sinon.assert.notCalled(spyHideDisabled);
		sinon.assert.calledOnce(spyHideInOverflow);
		sinon.assert.notCalled(spyReplaceLast);
		sinon.assert.notCalled(spyCreateOverflow);

		aButtons = null;
		spyEnabledButtons = null;
		spyHideDisabled = null;
		spyHideInOverflow = null;
		spyReplaceLast = null;
		spyCreateOverflow = null;
	});

	QUnit.test("calling _setButtonsForMiniMenu with 2 enabled and 2 disabled buttons", function (assert) {

		var aButtons = [

			new sap.m.OverflowToolbarButton({
				id: "btn0B",
				text: "Button 0",
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn1B",
				text: "Button 1",
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn2B",
				text: "Button 2",
				enabled : false
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn3B",
				text: "Button 3",
				enabled : true
			})
		];

		var spyEnabledButtons = sinon.spy(this.oMiniMenu, "_getNumberOfEnabledButtons");
		var spyHideDisabled = sinon.spy(this.oMiniMenu, "_hideDisabledButtons");
		var spyHideInOverflow = sinon.spy(this.oMiniMenu, "_hideButtonsInOverflow");
		var spyReplaceLast = sinon.spy(this.oMiniMenu, "_replaceLastVisibleButtonWithOverflowButton");
		var spyCreateOverflow = sinon.spy(this.oMiniMenu, "_createOverflowButton");

		this.oMiniMenu._setButtonsForMiniMenu(aButtons, new sap.m.Button({id : "btn1_"}));

		sinon.assert.calledOnce(spyEnabledButtons);
		sinon.assert.calledOnce(spyHideDisabled);
		sinon.assert.calledOnce(spyHideInOverflow);
		sinon.assert.notCalled(spyReplaceLast);
		sinon.assert.calledOnce(spyCreateOverflow);

		aButtons = null;
		spyEnabledButtons = null;
		spyHideDisabled = null;
		spyHideInOverflow = null;
		spyReplaceLast = null;
		spyCreateOverflow = null;
	});

	QUnit.test("calling _setButtonsForMiniMenu with 3 enabled and 1 disabled buttons", function (assert) {

		this.oMiniMenu.setMaxButtonsDisplayed(3);

		var aButtons = [

			new sap.m.OverflowToolbarButton({
				id: "btn0M",
				text: "Button 0",
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn1M",
				text: "Button 1",
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn2M",
				text: "Button 2",
				enabled : true
			}),

			new sap.m.OverflowToolbarButton({
				id: "btn3M",
				text: "Button 3",
				enabled : false
			})
		];

		var spyEnabledButtons = sinon.spy(this.oMiniMenu, "_getNumberOfEnabledButtons");
		var spyHideDisabled = sinon.spy(this.oMiniMenu, "_hideDisabledButtons");
		var spyHideInOverflow = sinon.spy(this.oMiniMenu, "_hideButtonsInOverflow");
		var spyReplaceLast = sinon.spy(this.oMiniMenu, "_replaceLastVisibleButtonWithOverflowButton");
		var spyCreateOverflow = sinon.spy(this.oMiniMenu, "_createOverflowButton");

		this.oMiniMenu._setButtonsForMiniMenu(aButtons, new sap.m.Button({id : "btn2_"}));

		sinon.assert.calledOnce(spyEnabledButtons);
		sinon.assert.calledOnce(spyHideDisabled);
		sinon.assert.calledOnce(spyHideInOverflow);
		sinon.assert.calledOnce(spyReplaceLast);
		sinon.assert.calledOnce(spyCreateOverflow);

		aButtons = null;
		spyEnabledButtons = null;
		spyHideDisabled = null;
		spyHideInOverflow = null;
		spyReplaceLast = null;
		spyCreateOverflow = null;
	});

	QUnit.test("calling show with contextMenu = true and contextMenu = false", function (assert) {

		var spyMiniMenu = sinon.spy(this.oMiniMenu, "_setButtonsForMiniMenu");
		var spyContextMenu = sinon.spy(this.oMiniMenu, "_makeAllButtonsVisible");

		var oBtn = new sap.m.Button({}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		this.oMiniMenu.show(oBtn, true, {x : 0, y : 0});

		sinon.assert.notCalled(spyMiniMenu);
		sinon.assert.calledOnce(spyContextMenu);

		spyMiniMenu.reset();
		spyContextMenu.reset();

		this.oMiniMenu.show(oBtn, false);

		sinon.assert.calledOnce(spyMiniMenu);
		sinon.assert.notCalled(spyContextMenu);

		spyMiniMenu = null;
		spyContextMenu = null;
	});
});