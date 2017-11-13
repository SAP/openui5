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

    QUnit.test("default value of maxButtonsDisplayed", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

        assert.strictEqual(oMiniMenu.getProperty("maxButtonsDisplayed"), 4, "Should return 4.");

		oMiniMenu = null;
    });

    QUnit.test("setting value of maxButtonsDisplayed", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

        oMiniMenu.setMaxButtonsDisplayed(19);

		assert.strictEqual(oMiniMenu.getProperty("maxButtonsDisplayed"), 19, "Should return 19.");
		oMiniMenu = null;
    });


    QUnit.test("setting value of maxButtonsDisplayed to an illegal value", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.throws(function () {oMiniMenu.setMaxButtonsDisplayed(1);}, "Should throw an Error.");
		oMiniMenu = null;
    });


    QUnit.test("adding a button", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

        var oBtn = {
            text: "Test",
            icon: "",
            handler: function () {}
        };

        assert.strictEqual(oMiniMenu.addButton(oBtn), oMiniMenu, "Should return the MiniMenu");

		assert.strictEqual(oMiniMenu.getFlexbox().getItems()[oMiniMenu.getFlexbox().getItems().length - 1].getText(), oBtn.text, "should add a button");
		oMiniMenu = null;
    });

    QUnit.test("removing a button", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

        var oRemovedButton = oMiniMenu.removeButton(0);

        var aItems = oMiniMenu.getFlexbox().getItems();

        for (var i = 0; i < aItems.length; i++) {
            if (aItems[i] === oRemovedButton) {
                assert.ok(false, "didn't remove the button");
            }
        }

		assert.ok(true, "should remove a button");
		oMiniMenu = null;
    });

    QUnit.test("removing all buttons", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

        oMiniMenu.removeAllButtons();

		assert.strictEqual(oMiniMenu.getDependents()[0].getContent()[0].getItems().length, 0, "should remove all buttons");
		oMiniMenu = null;
    });

    QUnit.test("Showing the MiniMenu", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

        var testButton = new sap.m.Button({});

        oMiniMenu.show(testButton);
        assert.ok(true, "Should throw no error");

		testButton.destroy();
		oMiniMenu = null;
    });

    QUnit.test("Closing the MiniMenu", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

        var testButton = new sap.m.Button({});

        oMiniMenu.show(testButton);
        oMiniMenu.close();
        assert.ok(true, "Should throw no error");
		testButton.destroy();
		oMiniMenu = null;
    });

    QUnit.test("Hiding then showing the MiniMenu", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

        var testButton = new sap.m.Button({});

        oMiniMenu.show(testButton);
        oMiniMenu.close();
        oMiniMenu.show(testButton);

        assert.ok(true, "Should throw no error");
		testButton.destroy();
		oMiniMenu = null;
	});

	QUnit.test("Calling the _popupClosed function", function (assert){
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		oMiniMenu.show(this.oButton2);
		oMiniMenu.openNew = false;
		oMiniMenu._popupClosed();
		assert.ok(!oMiniMenu.isOpen, "MiniMenu should be closed");

		oMiniMenu = null;
	});

	QUnit.test("Calling the _popupClosed function in expanded mode", function (assert){
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		oMiniMenu._openAsContextMenu = true;
		oMiniMenu.show(this.oButton2);
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

		assert.strictEqual(this.oMiniMenuPlugin._aGroupedItems.length, 1, "should add a Button to grouped Items");

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

		assert.strictEqual(this.oMiniMenuPlugin._aGroupedItems.length, 2, "should add a Button to grouped Items");
	});

	QUnit.test("Calling _addItemGroupsToMenu", function (assert){

		var that = this;

		var done = assert.async();

		setTimeout(function ()  {
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
			done();
		}.bind(this), 0);
	});

	QUnit.test("Pressing the Overflow Button on a MiniMenu", function(assert){
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		var done = assert.async();

		setTimeout(function (){

			oMiniMenu._onOverflowPress.bind(oMiniMenu)();
			assert.ok(true, "Should throw no error");
			oMiniMenu = null;
			done();

		}, this.oMiniMenuPlugin.iMenuLeftclickOpeningDelay + 10);
	});


     QUnit.test("getting all buttons", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

        var testButton = new sap.m.Button({});

        oMiniMenu.show(testButton);
        assert.strictEqual(oMiniMenu.getButtons().length, 8, "Should return the number of buttons");
		testButton.destroy();
		oMiniMenu = null;
    });

    QUnit.test("Inserting a button", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

        var testButton = new sap.m.Button({});

        oMiniMenu.show(testButton);
        assert.strictEqual(oMiniMenu.insertButton(new sap.m.Button({text : "abc"}), 1), oMiniMenu, "Should return the MiniMenu");
        assert.strictEqual(oMiniMenu.getButtons()[1].getText(), "abc", "Should return the text of the inserted button");
		testButton.destroy();
		oMiniMenu = null;
	});

	QUnit.test("Testing onHover function", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseover");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");
		var done = assert.async();

		setTimeout(function (){
			assert.ok(oMiniMenu.isOpen, "MiniMenu should be open");
			oMiniMenu = null;
			done();
		}, this.oMiniMenuPlugin.iMenuHoverOpeningDelay + 10);
	});

	QUnit.test("Testing onHover with onHoverExit function", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseover");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");
		var done = assert.async();
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseout");
		setTimeout(function (){
			assert.ok(!oMiniMenu.isOpen, "MiniMenu should not be open");
			oMiniMenu = null;
			done();
		}, this.oMiniMenuPlugin.iMenuHoverOpeningDelay + 10);
	});

	QUnit.test("Testing onClick function", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");
		var done = assert.async();

		setTimeout(function (){
			assert.ok(oMiniMenu.isOpen, "MiniMenu should be open");
			oMiniMenu = null;
			done();
		}, this.oMiniMenuPlugin.iMenuLeftclickOpeningDelay + 10);
	});


	QUnit.test("Testing onClick function unlocking opening of the MiniMenu", function (assert) {
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		this.oMiniMenuPlugin.lockMenuOpening();
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");
		var done = assert.async();

		setTimeout(function (){
			assert.ok(!oMiniMenu.isOpen, "MiniMenu should not be open");
			oMiniMenu = null;
			done();
		}, this.oMiniMenuPlugin.iMenuLeftclickOpeningDelay + 10);
	});

	QUnit.test("Testing onTouch function", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "touchstart");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");
		var done = assert.async();

		setTimeout(function (){
			assert.ok(oMiniMenu.isOpen, "MiniMenu should be open");
			oMiniMenu = null;
			done();
		}, this.oMiniMenuPlugin.iMenuTouchOpeningDelay + 10);
	});


	QUnit.test("Performing a right click when a Timeout from left-click/hover is active", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(!oMiniMenu.isOpen , "MiniMenu should not be opened");
		var done = assert.async();

		setTimeout(function (){
			oMiniMenu._inTimout = true;
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			assert.ok(oMiniMenu.isOpen, "MiniMenu should be open");
			oMiniMenu = null;
			done();
		}.bind(this), 0);
	});

	QUnit.test("Clicking on a button in the MiniMenu", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.ok(oMiniMenu.isOpen , "MiniMenu should be open");
		this.oMiniMenuPlugin._currentOverlay = this.oButton2Overlay;
		oMiniMenu.getFlexbox().getItems()[0].firePress();
		oMiniMenu = null;
	});

	QUnit.test("Deregistering an Overlay", function (assert) {

		this.oMiniMenuPlugin.deregisterElementOverlay(this.oButton1Overlay);
		assert.ok(true, "Should throw no error");

	});

	QUnit.test("calling _getPopoverDimensions for different kinds of menus", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		var done = assert.async();

		setTimeout(function() {
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

			done();
		}, this.oMiniMenuPlugin.iMenuLeftclickOpeningDelay + 10);

	});

	QUnit.test("calling _getOverlayDimensions", function (assert) {
        sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		var testButton = new sap.m.Button({});

		oMiniMenu.show(testButton);

		var oOverlay = oMiniMenu._getOverlayDimensions(oMiniMenu.getPopover()._oOpenBy.getAttribute("overlay"));

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
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		var oViewport = oMiniMenu._getViewportDimensions();

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

/*	sandbox = sinon.sandbox.create();
	QUnit.module("Place MiniMenu API", {
		beforeEach: function(assert) {

			this.doNothing = function () {
				return undefined;
			};

			this.oMiniMenu = new sap.ui.dt.MiniMenuControl({
				id: "miniMenu",
				maxButtonsDisplayed: 3,
				buttons: [
					{
						id : "btn1",
						text : "button1",
						handler : this.doNothing
					},
					{
						id : "btn1",
						text : "button1",
						handler : this.doNothing
					},
					{
						id : "btn2",
						text : "button2",
						handler : this.doNothing
					},
					{
						id : "btn3",
						text : "button3",
						handler : this.doNothing
					},
					{
						id : "btn4",
						text : "button4",
						handler : this.doNothing
					},
					{
						id : "btn5",
						text : "button5",
						handler : this.doNothing
					}
				]
			});
		},
		afterEach: function() {
			this.doNothing = null;
			// window.removeEventListener("scroll");
			this.oMiniMenu.destroy();
			sandbox.restore();
		}
	});*/

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
		// debugger;

		var fakeDiv = this.oMiniMenu._placeMiniMenu(this.oButton2Overlay, true, true);

		assert.ok(fakeDiv instanceof Element, "should return an HTML Element");
		assert.strictEqual(fakeDiv.getAttribute("overlay"), this.oButton2Overlay.getId(), "the fakeDiv should have an overlay attribute containing the id of the original overlay");
		assert.strictEqual(fakeDiv.getAttribute("id"), "fakeDiv", "the fakeDiv should have the id \"fakeDiv\"");
		assert.strictEqual(fakeDiv, jQuery("#" + this.oButton2Overlay.getId()).children()[1], "the fakeDiv should be a child of the overlay the MiniMenu was placed by");

		sinon.assert.calledOnce(spyContext);
		sinon.assert.notCalled(spyMini);

		spyContext.reset();
		spyMini.reset();

		this.oMiniMenu._placeMiniMenu(this.oButton2Overlay, false, false);

		sinon.assert.calledOnce(spyMini);
		sinon.assert.notCalled(spyContext);
	});

	QUnit.test("calling getPopover", function (assert) {
		assert.ok(this.oMiniMenu.getPopover() instanceof sap.m.Popover, "should return a Popover");
	});

	QUnit.test("calling getFlexbox", function (assert) {
		assert.ok(this.oMiniMenu.getFlexbox() instanceof sap.m.FlexBox, "should return a FlexBox");
	});
});