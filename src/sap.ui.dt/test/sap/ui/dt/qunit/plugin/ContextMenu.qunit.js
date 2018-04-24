/* global QUnit, sinon */
sap.ui.require([
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ContextMenuControl",
	"sap/ui/rta/plugin/Rename",
	'sap/ui/rta/command/CommandFactory',
	"sap/ui/Device",
	// controls
	"sap/m/Button",
	"sap/m/Popover",
	"sap/m/OverflowToolbarButton",
	"sap/m/FlexBox",
	"sap/ui/layout/VerticalLayout"
], function (
	ContextMenuPlugin,
	OverlayRegistry,
	DesignTime,
	ContextMenuControl,
	RenamePlugin,
	CommandFactory,
	Device,
	Button,
	Popover,
	OverflowToolbarButton,
	FlexBox,
	VerticalLayout
) {
	"use strict";
	var oSandbox = sinon.sandbox.create();

	QUnit.module("ContextMenu API", {
		beforeEach: function (assert) {
			var that = this;
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button();
			this.oButtonUnselectable = new Button();
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton1, this.oButton2, this.oButtonUnselectable
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oMenuEntries = {};
			this.oMenuEntries.available = {
				id: "CTX_ALWAYS_THERE",
				text: function () {
					return "item that is always there";
				},
				handler: sinon.spy()
			};
			this.oMenuEntries.enabledBtn1 = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled: function (oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1;
				}
			};
			this.oMenuEntries.disabledBtn1 = {
				id: "CTX_DISABLED_BUTTON1",
				text: "disabled for button 1",
				handler: sinon.spy(),
				available: function (oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1 || oElement === that.oButton2;
				},
				enabled: function (oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement !== that.oButton1;
				}
			};
			this.oMenuEntries.onlyBtn2 = {
				id: "CTX_ONLY_BUTTON2",
				text: "only shown for button 2",
				rank: 1,
				handler: sinon.spy(),
				available: function (oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton2;
				}
			};
			this.oMenuEntries.alwaysStartSection = {
				id: "CTX_START_SECTION",
				text: "starts new section ",
				rank: 2,
				handler: sinon.spy(),
				startSection: true
			};
			this.oMenuEntries.startSectionButton1 = {
				id: "CTX_START_SECTION_BTN1",
				text: "starts new section for button1",
				handler: sinon.spy(),
				startSection: function (oElement) {
					return oElement === that.oButton1;
				}
			};
			this.oMenuEntries.dynamicTextItem = {
				id: "CTX_DYNAMIC_TEXT",
				text: function (oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement.getId();
				},
				handler: sinon.spy()
			};
			var oCommandFactory = new CommandFactory();
			this.oContextMenuPlugin = new ContextMenuPlugin();
			for (var key in this.oMenuEntries) {
				this.oContextMenuPlugin.addMenuItem(this.oMenuEntries[key]);
			}
			this.oRenamePlugin = new RenamePlugin({
				id : "nonDefaultRenamePlugin",
				commandFactory : oCommandFactory
			});
			var done = assert.async();
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				],
				plugins: [
					this.oContextMenuPlugin,
					this.oRenamePlugin
				]
			});
			this.oDesignTime.attachEventOnce("synced", function () {
				sap.ui.getCore().applyChanges();
				that.oButton1Overlay = OverlayRegistry.getOverlay(that.oButton1);
				that.oButton1Overlay.setSelectable(true);
				that.oButton2Overlay = OverlayRegistry.getOverlay(that.oButton2);
				that.oButton2Overlay.setSelectable(true);
				that.oUnselectableOverlay = OverlayRegistry.getOverlay(that.oButtonUnselectable);
				done();
			});
			this.oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
		},
		afterEach: function () {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			oSandbox.restore();
		}
	}, function() {

		QUnit.test("Showing the ContextMenu", function (assert) {
			this.clock = sinon.useFakeTimers();
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			assert.ok(oContextMenuControl.getPopover().isOpen(), "ContextMenu should be open");
			sap.ui.test.qunit.triggerKeydown(oContextMenuControl.getPopover().getDomRef(), jQuery.sap.KeyCodes.ESCAPE);
			this.clock.tick(400); //animation of the closing of the Popover
			assert.ok(!oContextMenuControl.getPopover().isOpen(), "ContextMenu should be closed");
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			assert.ok(oContextMenuControl.getPopover().isOpen(), "ContextMenu should be open");
			oContextMenuControl = null;
			this.clock.restore();
		});

		QUnit.test("Reopen the ContextMenu on another overlay", function (assert) {
			var done = assert.async();
			Device.browser.edge = true;
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			sap.ui.test.qunit.triggerMouseEvent(this.oButton1Overlay.getDomRef(), "contextmenu");
			oContextMenuControl.attachEventOnce("Opened", function() {
				assert.ok(oContextMenuControl.getPopover().isOpen(), "ContextMenu should be open");
				sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			}.bind(this));
			oContextMenuControl.attachEventOnce("Closed", function() {
				assert.ok(!oContextMenuControl.getPopover().isOpen(), "ContextMenu should be closed");
				oContextMenuControl.attachEventOnce("Opened", function() {
					assert.ok(oContextMenuControl.getPopover().isOpen(), "ContextMenu should be reopened again");
					oContextMenuControl = null;
					Device.browser.edge = false;
					done();
				});
			});
		});

		QUnit.test("Calling the _popupClosed function", function (assert) {
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			oContextMenuControl.bOpenNew = false;
			oContextMenuControl._popupClosed();
			assert.ok(!oContextMenuControl.bOpen, "ContextMenu should be closed");
			oContextMenuControl = null;
		});

		QUnit.test("Calling the _popupClosed function in expanded mode", function (assert) {
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "ContextMenu should be opened");
			oContextMenuControl._popupClosed();
			assert.ok(!oContextMenuControl.bOpen, "ContextMenu should be closed");
			oContextMenuControl = null;
		});

		QUnit.test("Calling _checkForPluginLock", function (assert) {
			assert.ok(!this.oContextMenuPlugin._checkForPluginLock(this.oButton2Overlay), "Should return false");
		});

		QUnit.test("Calling _addMenuItemToGroup", function (assert) {
			var that = this;
			var oTestButton = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled: function (oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1;
				},
				group: "Test1"
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestButton);
			assert.strictEqual(this.oContextMenuPlugin._aGroupedItems.length, 1, "should add a Button to grouped Items");
			var oTestButton2 = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled: function (oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1;
				},
				group: "Test1"
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestButton2);
			assert.strictEqual(this.oContextMenuPlugin._aGroupedItems.length, 1, "should add a Button to grouped Items without creating a new group");
			var oTestButton3 = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled: function (oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1;
				},
				group: "Test2"
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestButton3);
			assert.strictEqual(this.oContextMenuPlugin._aGroupedItems.length, 2, "should add a Button to grouped Items and creating a new group");
		});

		QUnit.test("Adding a Submenu", function (assert) {
			this.clock = sinon.useFakeTimers();
			var fnHandler = function () {
				return undefined;
			};
			var sId = "I_AM_A_SUBMENU";
			var sSubId1 = "I_am_a_sub_menu_item";
			var sSubId2 = "I_am_another_sub_menu_item";
			var oTestItem = {
				id: sId,
				test: "submenu",
				handler: fnHandler,
				enabled: true,
				submenu: [
					{
						id: sSubId1,
						text: "text",
						icon: "sap-icon://fridge",
						enabled: true
					},
					{
						id: sSubId2,
						text: "more_text",
						icon: "sap-icon://dishwasher",
						enabled: true
					}
				]
			};
			this.oContextMenuPlugin._addSubMenu(oTestItem, {}, this.oButton1Overlay);
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus.length, 1, "there should be one submenu");
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus[0].sSubMenuId, sId, "should add the submenu");
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus[0].aSubMenuItems[0].id, sSubId1, "should add the submenu items");
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus[0].aSubMenuItems[1].id, sSubId2, "should add all the submenu items");
			var oCloseStub = oSandbox.stub(this.oContextMenuPlugin.oContextMenuControl, "close");
			var oOpenStub = oSandbox.stub(this.oContextMenuPlugin, "open");
			var oLockMenuOpeningStub = oSandbox.stub(this.oContextMenuPlugin, "lockMenuOpening");
			var iItemsCount = this.oContextMenuPlugin._aMenuItems.length;
			oTestItem.handler();
			assert.equal(oCloseStub.callCount, 1, "then context menu control close function is called");
			assert.equal(this.oContextMenuPlugin._aMenuItems.length - iItemsCount, 2, "then submenu items were added to contextmenu");
			assert.equal(oLockMenuOpeningStub.callCount, 1, "then lockMenuOpening function is called");
			this.clock.tick();
			assert.equal(oOpenStub.callCount, 1, "then context menu open function is called");
			this.clock.restore();
		});

		QUnit.test("Adding multiple Submenus", function (assert) {
			var fnHandler = function () {
				return undefined;
			};
			var sId0 = "I_AM_A_SUBMENU";
			var sSubId0 = "I_am_in_sub_menu_0";
			var sSubId1 = "I_am_also_in_sub_menu_0";
			var sId1 = "I_AM_ANOTHER_SUBMENU";
			var sSubId2 = "I_am_in_sub_menu_1";
			var sSubId3 = "I_am_also_in_sub_menu_1";
			var oTestItem0 = {
				id: sId0,
				test: "submenu",
				handler: fnHandler,
				enabled: true,
				submenu: [
					{
						id: sSubId0,
						text: "text",
						icon: "sap-icon://fridge",
						enabled: true
					},
					{
						id: sSubId1,
						text: "more_text",
						icon: "sap-icon://dishwasher",
						enabled: true
					}
				]
			};
			var oTestItem1 = {
				id: sId1,
				test: "submenu",
				handler: fnHandler,
				enabled: true,
				submenu: [
					{
						id: sSubId2,
						text: "even_more_text",
						icon: "sap-icon://washing-machine",
						enabled: true
					},
					{
						id: sSubId3,
						text: "hmm_text",
						icon: "sap-icon://sap-ui5",
						enabled: true
					}
				]
			};
			this.oContextMenuPlugin._addSubMenu(oTestItem0);
			this.oContextMenuPlugin._addSubMenu(oTestItem1);
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus.length, 2, "there should be two submenu");
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus[0].sSubMenuId, sId0, "should add submenu 0");
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus[0].aSubMenuItems[0].id, sSubId0, "should add submenu item 0 to sub menu 0");
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus[0].aSubMenuItems[1].id, sSubId1, "should add submenu item 1 to sub menu 0");
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus[1].sSubMenuId, sId1, "should add submenu 1");
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus[1].aSubMenuItems[0].id, sSubId2, "should add submenu item 2 to sub menu 1");
			assert.strictEqual(this.oContextMenuPlugin._aSubMenus[1].aSubMenuItems[1].id, sSubId3, "should add submenu item 3 to sub menu 1");
		});

		QUnit.test("Calling _addItemGroupsToMenu", function (assert) {
			this.clock = sinon.useFakeTimers();
			var that = this;
			var oTestButton = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled: function (oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1;
				},
				group: "Test1"
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestButton);
			var oTestButton2 = {
				id: "CTX_ENABLED_BUTTON3",
				text: "enabled for button 3",
				handler: sinon.spy(),
				enabled: function (oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1;
				},
				group: "Test2",
				rank: 10
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestButton2);
			this.oContextMenuPlugin._addMenuItemToGroup(oTestButton2);
			this.oButton2Overlay.attachBrowserEvent("click", function (oEvent) {
				this.oTestEvent = oEvent;
				oEvent.stopPropagation();
			}, this);
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
			this.oContextMenuPlugin._addItemGroupsToMenu(this.oTestEvent, this.oButton2Overlay);
			assert.strictEqual(this.oContextMenuPlugin._aMenuItems.length, 9, "Should have added 2 Buttons");
			this.oContextMenuPlugin._aMenuItems[this.oContextMenuPlugin._aMenuItems.length - 1].menuItem.handler();
			assert.strictEqual(this.oContextMenuPlugin.isMenuOpeningLocked(), true, "Opening should be locked");
			this.clock.tick();
			this.oContextMenuPlugin.oContextMenuControl.close();
			this.clock.restore();
		});

		QUnit.test("Pressing the Overflow Button on a ContextMenu", function (assert) {
			this.clock = sinon.useFakeTimers();
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			this.clock.tick(this.oContextMenuPlugin.iMenuLeftclickOpeningDelay);
			oContextMenuControl._onOverflowPress.bind(oContextMenuControl)();
			assert.ok(true, "Should throw no error");
			oContextMenuControl = null;
			this.clock.restore();
		});

		// FIXME: wait for hover PoC from UX colleagues
		// QUnit.test("Testing onHover function with mouse events", function (assert) {
		// 	this.clock = sinon.useFakeTimers();
		// 	sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseover");
		// 	var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
		// 	assert.ok(!oContextMenuControl.bOpen, "ContextMenu should not be opened");
		// 	this.clock.tick(this.oContextMenuPlugin.iMenuHoverOpeningDelay);
		// 	assert.ok(oContextMenuControl.bOpen, "ContextMenu should be open");
		// 	assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
		// 	oContextMenuControl = null;
		// 	this.clock.restore();
		// });

		// QUnit.test("Testing onHover with onHoverExit function with mouse events", function (assert) {
		// 	this.clock = sinon.useFakeTimers();
		// 	sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseover");
		// 	var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
		// 	assert.ok(!oContextMenuControl.bOpen, "ContextMenu should not be opened");
		// 	sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseout");
		// 	this.clock.tick(this.oContextMenuPlugin.iMenuHoverOpeningDelay);
		// 	assert.ok(!oContextMenuControl.bOpen, "ContextMenu should not be open");
		// 	oContextMenuControl = null;
		// 	this.clock.restore();
		// });

		// QUnit.test("Testing onHover with multiple overlays with mouse events", function (assert) {
		// 	this.clock = sinon.useFakeTimers();
		// 	var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
		// 	var oCloseContextMenuSpy = oSandbox.spy(oContextMenuControl, "close");
		// 	sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseover");
		// 	this.clock.tick(this.oContextMenuPlugin.iMenuHoverOpeningDelay);
		// 	assert.ok(oContextMenuControl.bOpen, "then after onHover ContextMenu should be open on the first overlay");
		// 	sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseout");
		// 	sap.ui.test.qunit.triggerMouseEvent(this.oButton1Overlay.getDomRef(), "mouseover");
		// 	this.clock.tick(this.oContextMenuPlugin.iMenuHoverClosingDelay);
		// 	assert.equal(oCloseContextMenuSpy.callCount, 1, "then after onHover at the second overlay the open contextmenu is closed");
		// 	this.clock.tick(this.oContextMenuPlugin.iMenuHoverOpeningDelay);
		// 	assert.ok(oContextMenuControl.bOpen, "then ContextMenu should be open at the second overlay");
		// 	this.clock.restore();
		// 	oContextMenuControl = null;
		// });

		QUnit.test("Testing onHover wrong delay exception", function (assert) {
			var oFakeEvent = {
				currentTarget: { id: this.oButton1Overlay.getId() },
				stopPropagation: function() {}
			};
			this.oContextMenuPlugin.iMenuHoverClosingDelay = 100;
			this.oContextMenuPlugin.iMenuHoverOpeningDelay = 50;
			assert.throws(function() { this.oContextMenuPlugin._onHover(oFakeEvent); }.bind(this),
				/sap.ui.dt ContextMenu iMenuHoverClosingDelay is bigger or equal to iMenuHoverOpeningDelay!/,
				"then corresoponding exception is thrown");
		});

		QUnit.test("Testing onHover function via direct function call", function (assert) {
			this.clock = sinon.useFakeTimers();
			var oStartOpeningStub = oSandbox.stub(this.oContextMenuPlugin, "_startOpening").returns(true);
			var oFakeEvent = {
				currentTarget: { id: this.oButton1Overlay.getId() },
				stopPropagation: function() {}
			};
			this.oContextMenuPlugin.iMenuHoverClosingDelay = 0;
			this.oContextMenuPlugin.iMenuHoverOpeningDelay = 5;
			this.oContextMenuPlugin._onHover(oFakeEvent);
			this.clock.tick(this.oContextMenuPlugin.iMenuHoverOpeningDelay);
			assert.equal(oStartOpeningStub.callCount, 1, "then after onHover _startOpeningFunction is called once");
			this.clock.restore();
		});

		QUnit.test("Testing onHover function when popover is already open", function (assert) {
			this.clock = sinon.useFakeTimers();
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			var oContextMenuPopover = this.oContextMenuPlugin.oContextMenuControl.getPopover();
			var oCloseContextMenuStub = oSandbox.stub(oContextMenuControl, "close");
			oSandbox.stub(oContextMenuPopover, "isOpen").returns(true);
			var oFakeEvent = {
				currentTarget: { id: this.oButton1Overlay.getId() },
				stopPropagation: function() {}
			};
			this.oContextMenuPlugin.iMenuHoverClosingDelay = 0;
			this.oContextMenuPlugin.iMenuHoverOpeningDelay = 5;
			this.oContextMenuPlugin._onHover(oFakeEvent);
			this.clock.tick(this.oContextMenuPlugin.iMenuHoverClosingDelay);
			assert.equal(oCloseContextMenuStub.callCount, 1, "then after onHover contextMenuControl.close function is called once");
			this.clock.restore();
		});

		QUnit.test("Testing onClick function", function (assert) {
			this.clock = sinon.useFakeTimers();
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			assert.ok(!oContextMenuControl.bOpen, "ContextMenu should not be opened");
			this.clock.tick(this.oContextMenuPlugin.iMenuLeftclickOpeningDelay);
			assert.ok(oContextMenuControl.bOpen, "ContextMenu should be open");
			assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
			oContextMenuControl = null;
			this.clock.restore();
		});

		QUnit.test("Testing onClick function unlocking opening of the ContextMenu", function (assert) {
			this.clock = sinon.useFakeTimers();
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			this.oContextMenuPlugin.lockMenuOpening();
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
			assert.ok(!oContextMenuControl.bOpen, "ContextMenu should not be opened");
			this.clock.tick(this.oContextMenuPlugin.iMenuLeftclickOpeningDelay);
			assert.ok(!oContextMenuControl.bOpen, "ContextMenu should not be open");
			oContextMenuControl = null;
			this.clock.restore();
		});

		QUnit.test("Testing onTouch function", function (assert) {
			this.clock = sinon.useFakeTimers();
			this.oContextMenuPlugin._ensureSelection(this.oButton2Overlay);
			this.oContextMenuPlugin.iMenuTouchOpeningDelay = 150;
			this.oContextMenuPlugin.touchTimeout = setTimeout(function() {
				assert.notOk(true, "timeout should not be executed, it should be cleared onTouch!");
			}, 100);
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "touchstart");
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			assert.ok(!oContextMenuControl.getPopover().isOpen(), "ContextMenu should not be opened");
			this.clock.tick(this.oContextMenuPlugin.iMenuTouchOpeningDelay);
			assert.ok(oContextMenuControl.getPopover().isOpen(), "ContextMenu should be open");
			assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
			oContextMenuControl = null;
			this.clock.restore();
		});

		QUnit.test("Testing onKeyDown function opening the expanded contextMenu", function (assert) {
			var _tempListener = function (oEvent) {
				oEvent.keyCode = jQuery.sap.KeyCodes.F10;
				oEvent.shiftKey = true;
				oEvent.altKey = false;
				oEvent.ctrlKey = false;
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				this.oContextMenuPlugin._onKeyDown(oEvent);
				assert.ok(oContextMenuControl.bOpen, "ContextMenu should be open");
				assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Column", "Flexbox should be set to Column");
				oContextMenuControl = null;
			}.bind(this);
			this.oButton2Overlay.attachBrowserEvent("keydown", _tempListener, this);
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "keydown");
		});

		QUnit.test("Testing onKeyDown function opening the compact contextMenu", function (assert) {
			var _tempListener = function (oEvent) {
				oEvent.keyCode = jQuery.sap.KeyCodes.ENTER;
				oEvent.shiftKey = false;
				oEvent.altKey = false;
				oEvent.ctrlKey = false;
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				this.oContextMenuPlugin._onKeyDown(oEvent);
				assert.ok(oContextMenuControl.bOpen, "ContextMenu should be open");
				assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
				oContextMenuControl = null;
			}.bind(this);
			this.oButton2Overlay.attachBrowserEvent("keydown", _tempListener, this);
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "keydown");
		});

		QUnit.test("Performing a right click when a Timeout from left-click/hover is active", function (assert) {
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			assert.ok(!oContextMenuControl.bOpen, "ContextMenu should not be opened");
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			assert.ok(oContextMenuControl.bOpen, "ContextMenu should be open");
			assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Column", "Flexbox should be set to Column");
			oContextMenuControl = null;
		});

		QUnit.test("Clicking on a button in the ContextMenu", function (assert) {
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "ContextMenu should be open");
			assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Column", "Flexbox should be set to Column");
			this.oContextMenuPlugin._oCurrentOverlay = this.oButton2Overlay;
			oContextMenuControl.getFlexbox().getItems()[0].firePress();
			oContextMenuControl = null;
		});

		QUnit.test("Deregistering an Overlay", function (assert) {
			this.oContextMenuPlugin.deregisterElementOverlay(this.oButton1Overlay);
			assert.ok(true, "Should throw no error");
		});

		QUnit.test("calling _getPopoverDimensions for different kinds of menus", function (assert) {
			this.clock = sinon.useFakeTimers();
			sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			this.clock.tick(this.oContextMenuPlugin.iMenuLeftclickOpeningDelay);
			var oPopoverContext = oContextMenuControl._getPopoverDimensions(true, false);
			var oPopover = oContextMenuControl._getPopoverDimensions(false, true);
			var oPopoverExpanded = oContextMenuControl._getPopoverDimensions(true, true);
			assert.strictEqual(typeof oPopoverContext.height, "number", "the height of a context menu should be a number");
			assert.ok(!isNaN(oPopoverContext.height), "the height of a context menu shouldn't be NaN");
			assert.strictEqual(typeof oPopoverContext.width, "number", "the width of a context menu should be a number");
			assert.ok(!isNaN(oPopoverContext.width), "the width of a context menu shouldn't be NaN");
			assert.strictEqual(typeof oPopover.height, "number", "the height of a non-expanded ContextMenu should be a number");
			assert.ok(!isNaN(oPopover.height), "the height of a non-expanded ContextMenu shouldn't be NaN");
			assert.strictEqual(typeof oPopover.width, "number", "the width of a non-expanded ContextMenu should be a number");
			assert.ok(!isNaN(oPopover.width), "the width of a non-expanded ContextMenu shouldn't be NaN");
			assert.strictEqual(typeof oPopoverExpanded.height, "number", "the height of an expanded ContextMenu should be a number");
			assert.ok(!isNaN(oPopoverExpanded.height), "the height of an expanded ContextMenu shouldn't be NaN");
			assert.strictEqual(typeof oPopoverExpanded.width, "number", "the width of an expanded ContextMenu should be a number");
			assert.ok(!isNaN(oPopoverExpanded.width), "the width of an expanded ContextMenu shouldn't be NaN");
			assert.ok(oPopoverContext.height < oPopoverExpanded.height, "the height of a context menu should be less than the hight of an expanded ContextMenu (if they have the same amount of buttons)");
			assert.ok(oPopoverContext.width < oPopoverExpanded.width, "the width of a context menu should be less than that of an expanded ContextMenu (if they have the same amount of buttons)");
			assert.ok(oPopover.height < oPopoverExpanded.width, "an expanded ContextMenu should be higher than a non-expanded ContextMenu (if the expanded one has more than one buttons");
			this.clock.restore();
		});

		QUnit.test("calling _checkForPluginLock", function (assert) {
			Device.os.ios = true;
			assert.notOk(this.oContextMenuPlugin._checkForPluginLock(), "then return false for ios devices");
			Device.os.ios = false;
			this.oContextMenuPlugin._bFocusLocked = true;
			assert.notOk(this.oContextMenuPlugin._checkForPluginLock(), "then return false when no busy plugin exists");
			assert.notOk(this.oContextMenuPlugin._bFocusLocked, "then reset the focus lock when no busy plugin exists");
			var oBusyPlugin = { isBusy: function() { return true; } };
			this.oContextMenuPlugin._aPluginsWithBusyFunction.push(oBusyPlugin);
			assert.ok(this.oContextMenuPlugin._checkForPluginLock(), "then return true when busy plugin exists");
		});

		QUnit.test("calling _shouldContextMenuOpen", function (assert) {
			this.oContextMenuPlugin._bTouched = false;
			this.oContextMenuPlugin._bOpeningLocked = true;
			assert.notOk(this.oContextMenuPlugin._shouldContextMenuOpen(), "then return false when menu opening locked");
			this.oContextMenuPlugin._bOpeningLocked = false;
			oSandbox.stub(this.oContextMenuPlugin, "_checkForPluginLock").returns(true);
			assert.notOk(this.oContextMenuPlugin._shouldContextMenuOpen(), "then return false when busy plugin exists");
			this.oContextMenuPlugin._bTouched = true;
			assert.ok(this.oContextMenuPlugin._shouldContextMenuOpen({}, true), "then return true if touched");
			var oEvent = { currentTarget: { id: "button1" } };
			assert.ok(this.oContextMenuPlugin._shouldContextMenuOpen(oEvent, false), "then return true if touched");
			assert.equal(this.oContextMenuPlugin._oCurrentOverlay.getId(), oEvent.currentTarget.id, "then current overlay is set when not locked and not on hover");
		});

		QUnit.test("calling _clearHoverTimeout", function(assert) {
			this.clock = sinon.useFakeTimers();
			var done = assert.async();
			this.oContextMenuPlugin.hoverTimeout = setTimeout(function() {
				assert.notOk(true, "hover timeout should not be finished");
			}, 500);
			this.oContextMenuPlugin._closingTimeout = setTimeout(function() {
				assert.notOk(true, "closing timeout should not be finished");
			}, 500);
			this.oContextMenuPlugin._clearHoverTimeout();
			setTimeout(function() {
				assert.ok(true, "then both timeouts have been cleared");
				done();
			}, 1000);
			this.clock.tick(1000);
			this.clock.restore();
		});

		QUnit.test("calling open with plain menu item for overlay", function(assert) {
			var oEvent = {};
			var oPlainMenuItem = { id: "plainItem", group: undefined, submenu: undefined };
			var aPlugins = [
				{ getMenuItems: function() { return [oPlainMenuItem]; } }
			];
			var oAddMenuItemStub = oSandbox.stub(this.oContextMenuPlugin, "addMenuItem");
			oSandbox.stub(this.oDesignTime, "getPlugins").returns(aPlugins);
			this.oContextMenuPlugin.open(oEvent, this.oButton1Overlay, true, false);
			assert.equal(oAddMenuItemStub.callCount, 1, "then addMenuItems is called");
			assert.equal(oAddMenuItemStub.args[0][0], oPlainMenuItem, "then addMenuItems is called with the plain menu item");
			oSandbox.restore();
		});

		QUnit.test("calling open with only group menu item for overlay", function(assert) {
			var oEvent = {};
			var oGroupMenuItem = { id: "groupItem", group: "group1", submenu: undefined };
			var aPlugins = [
				{ getMenuItems: function() { return [oGroupMenuItem]; } }
			];
			var oAddMenuItemToGroupStub = oSandbox.stub(this.oContextMenuPlugin, "_addMenuItemToGroup");
			oSandbox.stub(this.oDesignTime, "getPlugins").returns(aPlugins);
			this.oContextMenuPlugin.open(oEvent, this.oButton1Overlay, false, false);
			assert.equal(oAddMenuItemToGroupStub.callCount, 1, "then _addMenuItemToGroup is called");
			assert.equal(oAddMenuItemToGroupStub.args[0][0], oGroupMenuItem, "then _addMenuItemToGroup is called with the group menu item");
			oSandbox.restore();
		});

		QUnit.test("calling open with only plain menu items for overlay", function(assert) {
			var oEvent = {};
			var oPlainMenuItem = { id: "plainItem", group: undefined, submenu: undefined };
			var oSubMenuItem = { id: "subItem", group: undefined, submenu: [oPlainMenuItem] };
			var aPlugins = [
				{ getMenuItems: function() { return [oSubMenuItem]; } }
			];
			var oAddSubMenuStub = oSandbox.stub(this.oContextMenuPlugin, "_addSubMenu");
			oSandbox.stub(this.oDesignTime, "getPlugins").returns(aPlugins);
			this.oContextMenuPlugin.open(oEvent, this.oButton1Overlay, true, false);
			assert.equal(oAddSubMenuStub.callCount, 1, "then _addSubMenu is called");
			assert.equal(oAddSubMenuStub.args[0][0], oSubMenuItem, "then _addMenuItemToGroup is called with the sub menu item");
			oSandbox.restore();
		});
	});

	QUnit.module("ContextMenuControl API", {
		beforeEach: function (assert) {
			var that = this;
			this.oButton1 = new Button();
			this.oButton2 = new Button();
			this.oButtonUnselectable = new Button();
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton1, this.oButton2, this.oButtonUnselectable
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oMenuEntries = {};
			this.oMenuEntries.available = {
				id: "CTX_ALWAYS_THERE",
				text: function () {
					return "item that is always there";
				},
				handler: sinon.spy()
			};
			this.oMenuEntries.alwaysStartSection = {
				id: "CTX_START_SECTION",
				text: "starts new section ",
				rank: 2,
				handler: sinon.spy(),
				startSection: true
			};
			this.oMenuEntries.dynamicTextItem = {
				id: "CTX_DYNAMIC_TEXT",
				text: function () {
					return "Test";
				},
				handler: sinon.spy()
			};
			this.oContextMenuControl = new ContextMenuControl();
			for (var key in this.oMenuEntries) {
				this.oContextMenuControl.addButton(this.oMenuEntries[key]);
			}
			var done = assert.async();
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				],
				plugins: []
			});
			this.oDesignTime.attachEventOnce("synced", function () {
				sap.ui.getCore().applyChanges();
				that.oButton1Overlay = OverlayRegistry.getOverlay(that.oButton1);
				that.oButton1Overlay.setSelectable(true);
				that.oButton2Overlay = OverlayRegistry.getOverlay(that.oButton2);
				that.oButton2Overlay.setSelectable(true);
				that.oUnselectableOverlay = OverlayRegistry.getOverlay(that.oButtonUnselectable);
				done();
			});
		},
		afterEach: function () {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.oContextMenuControl.destroy();
			oSandbox.restore();
		}
	});

	QUnit.test("calling getPopover", function (assert) {
		assert.ok(this.oContextMenuControl.getPopover() instanceof Popover, "should return a Popover");
	});

	QUnit.test("calling getFlexbox", function (assert) {
		assert.ok(this.oContextMenuControl.getFlexbox() instanceof FlexBox, "should return a FlexBox");
	});

	QUnit.test("default value of maxButtonsDisplayed", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		assert.strictEqual(this.oContextMenuControl.getMaxButtonsDisplayed(), 4, "Should return 4.");
	});

	QUnit.test("setting value of maxButtonsDisplayed", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		this.oContextMenuControl.setMaxButtonsDisplayed(19);
		assert.strictEqual(this.oContextMenuControl.getMaxButtonsDisplayed(), 19, "Should return 19.");
	});

	QUnit.test("setting value of maxButtonsDisplayed to an illegal value", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		assert.throws(function () {
			this.oContextMenuControl.setMaxButtonsDisplayed(1);
		}, "Should throw an Error.");
	});

	QUnit.test("adding a button", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oBtn = {
			text: "TestText",
			icon: "",
			handler: function () {}
		};
		assert.strictEqual(this.oContextMenuControl.addButton(oBtn), this.oContextMenuControl, "Should return the ContextMenu");
		assert.strictEqual(this.oContextMenuControl.getFlexbox(true).getItems()[this.oContextMenuControl.getFlexbox(true).getItems().length - 1].getText(), oBtn.text, "Button should be added to Flexbox 1");
		assert.strictEqual(this.oContextMenuControl.getFlexbox(true).getItems()[this.oContextMenuControl.getFlexbox(true).getItems().length - 1].getText(), oBtn.text, "Button should be added to Flexbox 2");
	});

	QUnit.test("removing a button", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oRemovedButton = this.oContextMenuControl.removeButton(0);
		var aItems = this.oContextMenuControl.getFlexbox(true).getItems();
		var aItems2 = this.oContextMenuControl.getFlexbox(false).getItems();
		for (var i0 = 0; i0 < aItems.length; i0++) {
			if (aItems[i0] === oRemovedButton) {
				assert.ok(false, "didn't remove the button");
			}
		}
		for (var i1 = 0; i1 < aItems2.length; i1++) {
			if (aItems2[i1] === oRemovedButton) {
				assert.ok(false, "didn't remove the button");
			}
		}
		assert.strictEqual(aItems.length, 2, "should remove a button");
		assert.strictEqual(aItems2.length, 2, "should remove a button");
	});

	QUnit.test("removing all buttons", function (assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		this.oContextMenuControl.removeAllButtons();
		assert.strictEqual(this.oContextMenuControl.getDependents()[0].getContent()[0].getItems().length, 0, "should remove all buttons");
	});

	QUnit.test("getting all buttons", function (assert) {
		assert.strictEqual(this.oContextMenuControl.getButtons().length, 3, "Should return the number of buttons");
	});

	QUnit.test("Inserting a button", function (assert) {
		assert.strictEqual(this.oContextMenuControl.insertButton(new Button({
			text: "abc"
		}), 1), this.oContextMenuControl, "Should return the ContextMenu");
		assert.strictEqual(this.oContextMenuControl.getButtons()[1].getText(), "abc", "Should return the text of the inserted button");
	});

	QUnit.test("Calling _setFocusOnNextButton", function (assert) {
		var oTestButton1 = new Button({}).placeAt("qunit-fixture");
		var oTestButton2 = new Button({}).placeAt("qunit-fixture");
		var oTestButton3 = new Button({}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		oTestButton1.focus();
		this.oContextMenuControl._setFocusOnNextButton([oTestButton1, oTestButton2, oTestButton3], 0);
		assert.strictEqual(document.activeElement.id, oTestButton2.getId(), "Focus should be at second button");
		this.oContextMenuControl._setFocusOnNextButton([oTestButton1, oTestButton2, oTestButton3], 2);
		assert.strictEqual(document.activeElement.id, oTestButton1.getId(), "Focus should be at first button");
	});

	QUnit.test("Calling _setFocusOnPreviousButton", function (assert) {
		var oTestButton1 = new Button({}).placeAt("qunit-fixture");
		var oTestButton2 = new Button({}).placeAt("qunit-fixture");
		var oTestButton3 = new Button({}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		oTestButton1.focus();
		this.oContextMenuControl._setFocusOnPreviousButton([oTestButton1, oTestButton2, oTestButton3], 1);
		assert.strictEqual(document.activeElement.id, oTestButton1.getId(), "Focus should be at second button");
		this.oContextMenuControl._setFocusOnPreviousButton([oTestButton1, oTestButton2, oTestButton3], 0);
		assert.strictEqual(document.activeElement.id, oTestButton3.getId(), "Focus should be at first button");
	});

	QUnit.test("Calling _changeFocusOnButtons", function (assert) {
		var oTestBtn = new Button({}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		var nextSpy = sinon.spy(this.oContextMenuControl, "_setFocusOnNextButton");
		var prevSpy = sinon.spy(this.oContextMenuControl, "_setFocusOnPreviousButton");
		this.oContextMenuControl.show(oTestBtn, false);
		var sId = this.oContextMenuControl.getButtons()[0].getId();
		this.oContextMenuControl._changeFocusOnButtons(sId);
		sinon.assert.calledOnce(nextSpy);
		sinon.assert.notCalled(prevSpy);
		nextSpy.reset();
		prevSpy.reset();
		this.oContextMenuControl._changeFocusOnButtons(sId, true);
		sinon.assert.notCalled(nextSpy);
		sinon.assert.calledOnce(prevSpy);
		nextSpy = null;
		prevSpy = null;
	});

	QUnit.test("calling _getOverlayDimensions", function (assert) {
		jQuery("#qunit-fixture").append("<div id=\"fakeOverlay\" style=\"width:10px; height:12px; position: fixed; top:3px; left:5px;\" />");
		var oOverlay = this.oContextMenuControl._getOverlayDimensions("fakeOverlay");
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
		assert.strictEqual(oOverlay.right, oOverlay.left + oOverlay.width, "right should be equal to left + width");
		assert.strictEqual(typeof oOverlay.bottom, "number", "bottom should be a number");
		assert.ok(!isNaN(oOverlay.bottom), "bottom shouldn't be NaN");
		assert.strictEqual(oOverlay.bottom, oOverlay.top + oOverlay.height, "bottom should be equal to top + height");
		assert.strictEqual(typeof oOverlay.isOverlappedAtTop, "boolean", "then isOverlappedAtTop parameter should be a boolean");
		assert.notOk(oOverlay.isOverlappedAtTop, "then isOverlappedAtTop should be false (not overlapped)");
		assert.strictEqual(typeof oOverlay.isOverlappedAtBottom, "boolean", "then isOverlappedAtBottom parameter should be a boolean");
		assert.notOk(oOverlay.isOverlappedAtBottom, "then isOverlappedAtBottom should be false (not overlapped)");
	});

	QUnit.test("calling _getOverlayDimensions when overlay is overlapped with child overlay", function (assert) {
		jQuery("#qunit-fixture").append("<div id=\"fakeOverlay\" style=\"width:200px; height:200px; position: fixed; top:3px; left:5px;\" />");
		jQuery("#fakeOverlay").append("<div id=\"fakeChildOverlay\" style=\"width:200px; height:20px; position: fixed; top:3px; left:5px;\" />");
		var oOverlay = this.oContextMenuControl._getOverlayDimensions("fakeOverlay");
		assert.strictEqual(typeof oOverlay.isOverlappedAtTop, "boolean", "then isOverlappedAtTop parameter should be a boolean");
		assert.notOk(oOverlay.isOverlappedAtTop, "then isOverlappedAtTop should be false (only overlapped with child overlay)");
		assert.strictEqual(typeof oOverlay.isOverlappedAtBottom, "boolean", "then isOverlappedAtBottom parameter should be a boolean");
		assert.notOk(oOverlay.isOverlappedAtBottom, "then isOverlappedAtBottom should be false (not overlapped)");
	});

	QUnit.test("calling _getOverlayDimensions when overlay is overlapped", function (assert) {
		jQuery("#qunit-fixture").append("<div id=\"fakeOverlay\" style=\"width:200px; height:200px; position: fixed; top:3px; left:5px;\" />");
		jQuery("#qunit-fixture").append("<div id=\"fakeChildOverlay\" style=\"width:200px; height:20px; position: fixed; top:3px; left:5px;\" />");
		var oOverlay = this.oContextMenuControl._getOverlayDimensions("fakeOverlay");
		assert.strictEqual(typeof oOverlay.isOverlappedAtTop, "boolean", "then isOverlappedAtTop parameter should be a boolean");
		assert.ok(oOverlay.isOverlappedAtTop, "then isOverlappedAtTop should be true (overlapped)");
		assert.strictEqual(typeof oOverlay.isOverlappedAtBottom, "boolean", "then isOverlappedAtBottom parameter should be a boolean");
		assert.notOk(oOverlay.isOverlappedAtBottom, "then isOverlappedAtBottom should be false (not overlapped)");
	});

	QUnit.test("calling _getViewportDimensions", function (assert) {
		var oViewport = this.oContextMenuControl._getViewportDimensions();
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
		var oOverlay = {
			top: 10,
			bottom: 20
		};
		var oViewport = {
			top: 0,
			bottom: 30
		};
		var iTop = this.oContextMenuControl._getMiddleOfOverlayAndViewportEdges(oOverlay, oViewport);
		assert.strictEqual(iTop, 15, "entire overlay inside of viewport");
		oOverlay = {
			top: 0,
			bottom: 20
		};
		oViewport = {
			top: 10,
			bottom: 30
		};
		iTop = this.oContextMenuControl._getMiddleOfOverlayAndViewportEdges(oOverlay, oViewport);
		assert.strictEqual(iTop, 15, "top of overlay outside of viewport");
		oOverlay = {
			top: 10,
			bottom: 30
		};
		oViewport = {
			top: 0,
			bottom: 20
		};
		iTop = this.oContextMenuControl._getMiddleOfOverlayAndViewportEdges(oOverlay, oViewport);
		assert.strictEqual(iTop, 15, "bottom of overlay outside of viewport");
		oOverlay = {
			top: 0,
			bottom: 30
		};
		oViewport = {
			top: 10,
			bottom: 20
		};
		iTop = this.oContextMenuControl._getMiddleOfOverlayAndViewportEdges(oOverlay, oViewport);
		assert.strictEqual(iTop, 15, "top and bottom of overlay outside of viewport");
		oOverlay = null;
		oViewport = null;
		iTop = null;
	});

	QUnit.test("calling _getContextMenuSidewaysPlacement", function (assert) {
		var oOverlay = {
			right: 60
		};
		var oPopover = {
			width: 20
		};
		var oViewport = {
			width: 100
		};
		var iLeft = this.oContextMenuControl._getContextMenuSidewaysPlacement(oOverlay, oPopover, oViewport);
		assert.strictEqual(iLeft, 60, "There is enough space on the right");
		assert.strictEqual(this.oContextMenuControl.getPopover().getPlacement(), "Right", "Placment should be Right");
		oOverlay = {
			left: 40
		};
		oPopover = {
			width: 20
		};
		oViewport = {};
		iLeft = this.oContextMenuControl._getContextMenuSidewaysPlacement(oOverlay, oPopover, oViewport);
		assert.strictEqual(iLeft, 40, "There is enough space on the left");
		assert.strictEqual(this.oContextMenuControl.getPopover().getPlacement(), "Left", "Placment should be Right");
		oOverlay = {
			left: 22,
			width: 40
		};
		oPopover = {
			width: 30
		};
		oViewport = {
			width: 80
		};
		iLeft = this.oContextMenuControl._getContextMenuSidewaysPlacement(oOverlay, oPopover, oViewport);
		assert.strictEqual(iLeft, 42, "The ContextMenu can be opened to the right from the center of the overlay");
		assert.strictEqual(this.oContextMenuControl.getPopover().getPlacement(), "Right", "Placment should be Right");
		oOverlay = {
			left: 22,
			width: 40
		};
		oPopover = {
			width: 50
		};
		oViewport = {
			width: 80
		};
		iLeft = this.oContextMenuControl._getContextMenuSidewaysPlacement(oOverlay, oPopover, oViewport);
		assert.strictEqual(iLeft, 30, "The ContextMenu can be opened to the right from some place left of the center of the overlay");
		assert.strictEqual(this.oContextMenuControl.getPopover().getPlacement(), "Right", "Placment should be Right");
		oOverlay = null;
		oPopover = null;
		oViewport = null;
		iLeft = null;
	});

	QUnit.test("calling _placeContextMenuSideways", function (assert) {
		var oOverlay = {
			right: 60,
			top: 10,
			bottom: 20
		};
		var oPopover = {
			width: 20
		};
		var oViewport = {
			top: 0,
			bottom: 30,
			width: 100
		};
		var spy1 = sinon.spy(this.oContextMenuControl, "_getMiddleOfOverlayAndViewportEdges");
		var spy2 = sinon.spy(this.oContextMenuControl, "_getContextMenuSidewaysPlacement");
		this.oContextMenuControl._placeContextMenuSideways(oOverlay, oPopover, oViewport);
		sinon.assert.calledOnce(spy1);
		sinon.assert.calledOnce(spy2);
		oOverlay = null;
		oPopover = null;
		oViewport = null;
		spy1 = null;
		spy2 = null;
	});

	QUnit.test("calling _placeContextMenuAtTheBottom with overlay height < 60", function (assert) {
		var oOverlay = {
			left: 20,
			width: 30,
			height: 30,
			bottom: 90,
			top: 60
		};
		var oPopover = {
			height: 60
		};
		var oViewport = {
			height: 200
		};
		var oPos = this.oContextMenuControl._placeContextMenuAtTheBottom(oOverlay, oPopover, oViewport);
		assert.strictEqual(oPos.top, 90, "Should be at the bottom of the overlay");
		assert.strictEqual(oPos.left, 35, "Should be the middle of the overlay");
		oOverlay = null;
		oPopover = null;
		oViewport = null;
		oPos = null;
	});

	QUnit.test("calling _placeContextMenuAtTheBottom when menu popover does not have enough space above and bellow the overlay", function (assert) {
		var oOverlay = {
			top: 60,
			height: 30
		};
		var oPopover = {};
		var oViewport = {
			top: 0
		};
		var oPos = this.oContextMenuControl._placeContextMenuAtTheBottom(oOverlay, oPopover, oViewport);
		assert.strictEqual(oPos.top, 65, "Should be 5 bellow the top of the overlay");
	});

	QUnit.test("calling _placeContextMenuAtTheBottom when menu popover does not have enoughspace above the overlay", function (assert) {
		var oOverlay = {
			top: 60
		};
		var oPopover = {};
		var oViewport = {
			top: 0
		};
		var oPos = this.oContextMenuControl._placeContextMenuAtTheBottom(oOverlay, oPopover, oViewport);
		assert.strictEqual(oPos.top, 65, "Should be 5 bellow the top of the overlay");
	});

	QUnit.test("calling _placeContextMenuAtTheBottom when menu popover does not have enough space around the overlay", function (assert) {
		var oOverlay = {
			top: 60
		};
		var oPopover = {
			height: 60
		};
		var oViewport = {
			top: 80
		};
		var oPos = this.oContextMenuControl._placeContextMenuAtTheBottom(oOverlay, oPopover, oViewport);
		assert.strictEqual(oPos.top, 85, "Should be 5 bellow the top of the viewport");
	});

	QUnit.test("calling _placeContextMenuAtTheBottom when overlay is overlapped with another overlay at the top", function (assert) {
		var oOverlay = {
			top: 80,
			height: 80,
			bottom: 160,
			isOverlappedAtTop: true
		};
		var oPopover = {
			height: 60
		};
		var oViewport = {
			top: 80,
			height: 250
		};
		var oPos = this.oContextMenuControl._placeContextMenuAtTheBottom(oOverlay, oPopover, oViewport);
		assert.strictEqual(oPos.top, 160, "Should be at the bottom of the overlay");
		oOverlay = null;
		oPopover = null;
		oViewport = null;
		oPos = null;
	});

	QUnit.test("calling _placeContextMenuOnTop", function (assert) {
		var oOverlay = {
			top: 100,
			left: 20,
			width: 30
		};
		var oPos = this.oContextMenuControl._placeContextMenuOnTop(oOverlay);
		assert.strictEqual(oPos.top, 100, "Should be the top of the overlay");
		assert.strictEqual(oPos.left, 35, "Should be the middle of the overlay");
		oOverlay = null;
		oPos = null;
	});

	QUnit.test("calling _placeAsCompactContextMenu", function (assert) {
		// menu place at top
		var oOverlay = {
			top: 100
		};
		var oPopover = {
			height: 50,
			width: 40
		};
		var oViewport = {
			width: 100
		};
		var spyTop = sinon.spy(this.oContextMenuControl, "_placeContextMenuOnTop");
		var spyBottom = sinon.spy(this.oContextMenuControl, "_placeContextMenuAtTheBottom");
		var spySideways = sinon.spy(this.oContextMenuControl, "_placeContextMenuSideways");
		this.oContextMenuControl._placeAsCompactContextMenu(oOverlay, oPopover, oViewport);
		sinon.assert.calledOnce(spyTop);
		sinon.assert.notCalled(spyBottom);
		sinon.assert.notCalled(spySideways);
		assert.strictEqual(this.oContextMenuControl.getPopover().getShowArrow(), true, "Arrow should be visible");
		// menu placed at the bottom
		oOverlay = {
			top: 50
		};
		oPopover = {
			height: 60,
			width: 40
		};
		oViewport = {
			height: 200,
			width: 200
		};
		spyTop.reset();
		spyBottom.reset();
		spySideways.reset();
		this.oContextMenuControl._placeAsCompactContextMenu(oOverlay, oPopover, oViewport);
		sinon.assert.notCalled(spyTop);
		sinon.assert.calledOnce(spyBottom);
		sinon.assert.notCalled(spySideways);
		// menu placed sideways
		oOverlay = {};
		oPopover = {
			height: 50,
			width: 40
		};
		oViewport = {
			height: 100,
			width: 100
		};
		spyTop.reset();
		spyBottom.reset();
		spySideways.reset();
		this.oContextMenuControl._placeAsCompactContextMenu(oOverlay, oPopover, oViewport);
		sinon.assert.notCalled(spyTop);
		sinon.assert.notCalled(spyBottom);
		sinon.assert.calledOnce(spySideways);
		// unsupported screensize test
		oOverlay = {};
		oPopover = {
			height: 270,
			width: 40
		};
		oViewport = {
			height: 200,
			width: 200
		};
		spyTop.reset();
		spyBottom.reset();
		spySideways.reset();
		assert.throws(this.oContextMenuControl._placeAsCompactContextMenu.bind(this.oContextMenuControl, oOverlay, oPopover, oViewport), Error("Your screen size is not supported!"), "Should throw an error");
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

	QUnit.test("calling _placeAsExpandedContextMenu", function (assert) {
		var oContPos = {
			x: 90,
			y: 80
		};
		var oPopover = {
			width: 40,
			height: 60
		};
		var oViewport = {
			width: 200,
			height: 200
		};
		var oPos = this.oContextMenuControl._placeAsExpandedContextMenu(oContPos, oPopover, oViewport);
		assert.strictEqual(oPos.top, 80, "should be the y coordinate of the context menu position");
		assert.strictEqual(oPos.left, 90, "should be the x coordinate of the context menu position");
		assert.strictEqual(this.oContextMenuControl.getPopover().getPlacement(), "Bottom", "placement should be Bottom");
		assert.strictEqual(this.oContextMenuControl.getPopover().getShowArrow(), false, "Arrow shouldn't be visible");
		oContPos = {
			x: 180,
			y: 160
		};
		oPopover = {
			width: 40,
			height: 60
		};
		oViewport = {
			width: 200,
			height: 200
		};
		oPos = this.oContextMenuControl._placeAsExpandedContextMenu(oContPos, oPopover, oViewport);
		assert.strictEqual(oPos.top, 160, "should be the y coordinate of the context menu position");
		assert.strictEqual(oPos.left, 140, "should be oContPos.x - oPopover.width");
		assert.strictEqual(this.oContextMenuControl.getPopover().getPlacement(), "Top", "placement should be Top");
		oContPos = {
			x: 50,
			y: 60
		};
		oPopover = {
			width: 60,
			height: 80
		};
		oViewport = {
			width: 100,
			height: 100
		};
		oPos = this.oContextMenuControl._placeAsExpandedContextMenu(oContPos, oPopover, oViewport);
		assert.strictEqual(oPos.top, 20, "should be oViewport.height - oContPos.y");
		assert.strictEqual(oPos.left, 40, "should be oViewport.width - oContPos.x");
		assert.strictEqual(this.oContextMenuControl.getPopover().getPlacement(), "Bottom", "placement should be Bottom");
		oContPos = {
			x: 40,
			y: 60
		};
		oPopover = {
			width: 60,
			height: 80
		};
		oViewport = {
			width: 50,
			height: 200
		};
		assert.throws(this.oContextMenuControl._placeAsExpandedContextMenu.bind(this.oContextMenuControl, oContPos, oPopover, oViewport), Error("Your screen size is not supported!"), "Should throw an error");
		oContPos = {
			x: 60,
			y: 40
		};
		oPopover = {
			width: 60,
			height: 80
		};
		oViewport = {
			width: 200,
			height: 50
		};
		assert.throws(this.oContextMenuControl._placeAsExpandedContextMenu.bind(this.oContextMenuControl, oContPos, oPopover, oViewport), Error("Your screen size is not supported!"), "Should throw an error");
		oContPos = null;
		oPopover = null;
		oViewport = null;
		oPos = null;
	});

	QUnit.test("calling _placeContextMenu", function (assert) {
		this.oContextMenuControl._oContextMenuPosition = {
			x: 314,
			y: 42
		};
		this.oContextMenuControl.addButton({
			text: "button",
			handler: function () {
				return undefined;
			},
			id: "newButton0"
		});
		var spyContext = sinon.spy(this.oContextMenuControl, "_placeAsExpandedContextMenu");
		var spyMini = sinon.spy(this.oContextMenuControl, "_placeAsCompactContextMenu");
		var oFakeDiv = this.oContextMenuControl._placeContextMenu(this.oButton2Overlay, true, true);
		var sFakeDivId = "contextMenuFakeDiv";
		assert.ok(oFakeDiv instanceof Element, "should return an HTML Element");
		assert.strictEqual(oFakeDiv.getAttribute("overlay"), this.oButton2Overlay.getId(), "the fakeDiv should have an overlay attribute containing the id of the original overlay");
		assert.strictEqual(oFakeDiv.getAttribute("id"), sFakeDivId, "the fakeDiv should have the correct contextMenu fakeDiv id");
		assert.strictEqual(oFakeDiv, jQuery("#" + this.oButton2Overlay.getId()).children()[1], "the fakeDiv should be a child of the overlay the ContextMenu was placed by");
		sinon.assert.calledOnce(spyContext);
		sinon.assert.notCalled(spyMini);
		spyContext.reset();
		spyMini.reset();
		this.oContextMenuControl._iButtonsVisible = 3;
		this.oContextMenuControl._placeContextMenu(this.oButton2Overlay, false, false);
		sinon.assert.calledOnce(spyMini);
		sinon.assert.notCalled(spyContext);
		spyContext = null;
		spyMini = null;
		oFakeDiv = null;
	});

	QUnit.test("calling _placeContextMenuWrapper", function (assert) {
		var oBtn = new Button({}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		this.oContextMenuControl.show(oBtn, false);
		this.oContextMenuControl._placeContextMenuWrapper();
		var oContextMenuWrapper = document.getElementById("ContextMenuWrapper");
		assert.ok(oContextMenuWrapper instanceof Element, "The ContextMenu wrapper should be an Element in the DOM");
		oBtn = null;
	});

	QUnit.test("comparing the height of an actual rendered sap.m.Button to the return value of _getButtonHeight", function (assert) {
		var oCozyBtn = new Button({
			icon: "sap-icon://fridge",
			text: "Cozy Button"
		}).placeAt("qunit-fixture");
		var oCompactBtn = new Button({
			icon: "sap-icon://dishwasher",
			text: "Compact Button"
		}).placeAt("compact-fixture");
		sap.ui.getCore().applyChanges();
		var fCalculatedCozyHeight = this.oContextMenuControl._getButtonHeight(false);
		var fMeasuredCozyHeight = parseInt(jQuery(oCozyBtn.getDomRef()).css("height"), 10) / 16;
		var fCalculatedCompactHeight = this.oContextMenuControl._getButtonHeight(true);
		var fMeasuredCompactHeight = parseInt(jQuery(oCompactBtn.getDomRef()).css("height"), 10) / 16;
		assert.strictEqual(fCalculatedCozyHeight, fMeasuredCozyHeight, "To prevent rendering the ContextMenu a bunch of times its height is calculated based on the css values of sap.m.Button. If this test fails the css values of sap.m.Buttons may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getButtonHeight (for bCompact = false) has to be adjusted to whatever the expected value was in this test.");
		assert.strictEqual(fCalculatedCompactHeight, fMeasuredCompactHeight, "To prevent rendering the ContextMenu a bunch of times height size is calculated based on the css values of sap.m.Button. If this test fails the css values of sap.m.Buttons may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getButtonHeight (for bCompact = true) has to be adjusted to whatever the expected value was in this test.");
		oCozyBtn = null;
		oCompactBtn = null;
		fCalculatedCozyHeight = null;
		fMeasuredCozyHeight = null;
		fCalculatedCompactHeight = null;
		fMeasuredCompactHeight = null;
	});

	QUnit.test("comparing the width of an actual rendered sap.m.Button (icon only) to the return value of _getButtonWidth", function (assert) {
		var oCozyBtn = new Button({
			icon: "sap-icon://fridge"
		}).placeAt("qunit-fixture");
		var oCompactBtn = new Button({
			icon: "sap-icon://dishwasher"
		}).placeAt("compact-fixture");
		sap.ui.getCore().applyChanges();
		var fCalculatedCozyWidth = this.oContextMenuControl._getButtonWidth(false);
		var fMeasuredCozyWidth = parseInt(jQuery(oCozyBtn.getDomRef()).css("width"), 10) / 16;
		var fCalculatedCompactWidth = this.oContextMenuControl._getButtonWidth(true);
		var fMeasuredCompactWidth = parseInt(jQuery(oCompactBtn.getDomRef()).css("width"), 10) / 16;
		assert.strictEqual(fCalculatedCozyWidth, fMeasuredCozyWidth, "To prevent rendering the ContextMenu a bunch of times its width is calculated based on the css values of sap.m.Button. If this test fails the css values of sap.m.Buttons may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getButtonWidth (for bCompact = false) has to be adjusted to whatever the expected value was in this test.");
		assert.strictEqual(fCalculatedCompactWidth, fMeasuredCompactWidth, "To prevent rendering the ContextMenu a bunch of times its width is calculated based on the css values of sap.m.Button. If this test fails the css values of sap.m.Buttons may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getButtonWidth (for bCompact = true) has to be adjusted to whatever the expected value was in this test.");
		oCozyBtn = null;
		oCompactBtn = null;
		fCalculatedCozyWidth = null;
		fMeasuredCozyWidth = null;
		fCalculatedCompactWidth = null;
		fMeasuredCompactWidth = null;
	});

	QUnit.test("comparing the height of the arrow of an actual rendered sap.m.Popover to the return value of _getArrowHeight", function (assert) {
		var oCozyBtn = new Button({
			icon: "sap-icon://fridge"
		}).placeAt("qunit-fixture");
		var oCompactBtn = new Button({
			icon: "sap-icon://dishwasher"
		}).placeAt("compact-fixture");
		sap.ui.getCore().applyChanges();
		var oCozyPop = new Popover({
			placement: "Bottom"
		}).openBy(oCozyBtn);
		var oCompactPop = new Popover({
			placement: "Bottom"
		}).openBy(oCompactBtn);
		var fCalculatedCozyArrowSize = this.oContextMenuControl._getArrowHeight(false);
		var fMeasuredCozyArrowSize = parseInt(jQuery("#" + oCozyPop.getId() + "-arrow").css("height"), 10) / 16;
		var fCalculatedCompactArrowSize = this.oContextMenuControl._getArrowHeight(true);
		var fMeasuredCompactArrowSize = parseInt(jQuery("#" + oCompactPop.getId() + "-arrow").css("height"), 10) / 16;
		oCozyPop.close();
		oCompactPop.close();
		assert.strictEqual(fCalculatedCozyArrowSize, fMeasuredCozyArrowSize, "To prevent rendering the ContextMenu a bunch of times the size of the Popover's Arrow is calculated based on the css values of sap.m.Popover. If this test fails the css values of sap.m.Popover may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getArrowHeight (for bCompact = false) has to be adjusted to whatever the expected value was in this test.");
		assert.strictEqual(fCalculatedCompactArrowSize, fMeasuredCompactArrowSize, "To prevent rendering the ContextMenu a bunch of times the size of the Popover's Arrow is calculated based on the css values of sap.m.Popover. If this test fails the css values of sap.m.Popover may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getArrowHeight (for bCompact = true) has to be adjusted to whatever the expected value was in this test.");
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
		var iBaseFontSize = this.oContextMenuControl._getBaseFontSize();
		assert.strictEqual(typeof iBaseFontSize, "number", "The base font size should be a number.");
		assert.ok(!isNaN(iBaseFontSize), "The base font size shouldn't be NaN.");
		iBaseFontSize = null;
	});

	QUnit.test("calling _makeAllButtonsVisible", function (assert) {
		var aButtons = [
			new OverflowToolbarButton({
				text: "Button 0",
				visible: false
			}),
			new OverflowToolbarButton({
				text: "Button 1",
				visible: false
			}),
			new OverflowToolbarButton({
				text: "Button 2",
				visible: false
			}),
			new OverflowToolbarButton({
				text: "Button 3",
				visible: false
			}),
			new OverflowToolbarButton({
				text: "Button 4",
				visible: false
			}),
			new OverflowToolbarButton({
				text: "Button 5",
				visible: false
			})
		];
		this.oContextMenuControl._makeAllButtonsVisible(aButtons);
		for (var i = 0; i < aButtons.length; i++) {
			assert.strictEqual(aButtons[i].getVisible(), true, "Button " + i + " should be visible.");
			assert.strictEqual(aButtons[i].getText(), "Button " + i, "Text should be Button " + i + ".");
			assert.strictEqual(aButtons[i]._bInOverflow, true, "_bInOverflow of Button " + i + " should be true.");
		}
		aButtons = null;
	});

	QUnit.test("calling _getNumberOfEnabledButtons", function (assert) {
		var aButtons = [
			new OverflowToolbarButton({
				text: "Button 0",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 1",
				visible: true,
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 2",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 3",
				visible: true,
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 4",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 5",
				visible: true,
				enabled: true
			})
		];
		var iEnabledButtons = this.oContextMenuControl._getNumberOfEnabledButtons(aButtons);
		assert.strictEqual(iEnabledButtons, 4, "4 buttons should be enabled");
		iEnabledButtons = null;
		aButtons = null;
	});

	QUnit.test("calling _hideDisabledButtons", function (assert) {
		var aButtons = [
			new OverflowToolbarButton({
				text: "Button 0",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 1",
				visible: true,
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 2",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 3",
				visible: true,
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 4",
				visible: true,
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 5",
				visible: true,
				enabled: true
			})
		];
		var iVisibleButtons = this.oContextMenuControl._hideDisabledButtons(aButtons);
		assert.strictEqual(iVisibleButtons, 3, "3 Buttons should be visible");
		for (var i = 0; i < aButtons.length; i++) {
			assert.strictEqual(aButtons[i].getVisible(), aButtons[i].getEnabled(), "Enabled Buttons should be visible. Disabled Buttons should be hidden");
		}
		iVisibleButtons = null;
		aButtons = null;
	});

	QUnit.test("calling _hideButtonsInOverflow", function (assert) {
		var aButtons = [
			new OverflowToolbarButton({
				text: "Button 0",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 1",
				visible: false,
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 2",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 3",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 4",
				visible: false,
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 5",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 6",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 7",
				visible: true,
				enabled: true
			})
		];
		var iVisibleButtons = this.oContextMenuControl._hideButtonsInOverflow(aButtons);
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
			new OverflowToolbarButton({
				text: "Button 0",
				visible: true
			}),
			new OverflowToolbarButton({
				text: "Button 1",
				visible: true
			}),
			new OverflowToolbarButton({
				text: "Button 2",
				visible: true
			}),
			new OverflowToolbarButton({
				text: "Button 3",
				visible: true
			})
		];
		var iVisibleButtons = this.oContextMenuControl._hideButtonsInOverflow(aButtons);
		assert.strictEqual(iVisibleButtons, 4, "4 Buttons should be visible");
		for (var i = 0; i < aButtons.length; i++) {
			assert.strictEqual(aButtons[i].getVisible(), true, "Button " + i + " should be visible");
		}
		iVisibleButtons = null;
		aButtons = null;
	});

	QUnit.test("calling _replaceLastVisibleButtonWithOverflowButton", function (assert) {
		var aButtons = [
			new OverflowToolbarButton({
				text: "Button 0",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 1",
				visible: false,
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 2",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 3",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 4",
				visible: false,
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 5",
				visible: true,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 6",
				visible: false,
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 7",
				visible: false,
				enabled: true
			})
		];
		this.oContextMenuControl._replaceLastVisibleButtonWithOverflowButton(aButtons);
		assert.strictEqual(aButtons[5].getVisible(), false, "should be hidden");
		var oLastButton = this.oContextMenuControl.getButtons()[this.oContextMenuControl.getButtons().length - 1];
		assert.strictEqual(oLastButton.getIcon(), "sap-icon://overflow", "Last Button should be the Overflow Button.");
		oLastButton = null;
		aButtons = null;
	});

	QUnit.test("calling _setButtonsForContextMenu with 3 disabled Buttons", function (assert) {
		var aButtons = [
			new OverflowToolbarButton({
				text: "Button 0",
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 1",
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 2",
				enabled: false
			})
		];
		var spyEnabledButtons = sinon.spy(this.oContextMenuControl, "_getNumberOfEnabledButtons");
		var spyHideDisabled = sinon.spy(this.oContextMenuControl, "_hideDisabledButtons");
		var spyHideInOverflow = sinon.spy(this.oContextMenuControl, "_hideButtonsInOverflow");
		var spyReplaceLast = sinon.spy(this.oContextMenuControl, "_replaceLastVisibleButtonWithOverflowButton");
		var spyCreateOverflow = sinon.spy(this.oContextMenuControl, "_createOverflowButton");
		this.oContextMenuControl._setButtonsForContextMenu(aButtons, new Button({
			id: "btn0_"
		}));
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

	QUnit.test("calling _setButtonsForContextMenu with 2 enabled and 2 disabled buttons", function (assert) {
		var aButtons = [
			new OverflowToolbarButton({
				text: "Button 0",
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 1",
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 2",
				enabled: false
			}),
			new OverflowToolbarButton({
				text: "Button 3",
				enabled: true
			})
		];
		var spyEnabledButtons = sinon.spy(this.oContextMenuControl, "_getNumberOfEnabledButtons");
		var spyHideDisabled = sinon.spy(this.oContextMenuControl, "_hideDisabledButtons");
		var spyHideInOverflow = sinon.spy(this.oContextMenuControl, "_hideButtonsInOverflow");
		var spyReplaceLast = sinon.spy(this.oContextMenuControl, "_replaceLastVisibleButtonWithOverflowButton");
		var spyCreateOverflow = sinon.spy(this.oContextMenuControl, "_createOverflowButton");
		this.oContextMenuControl._setButtonsForContextMenu(aButtons, new Button({
			id: "btn1_"
		}));
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

	QUnit.test("calling _setButtonsForContextMenu with 3 enabled and 1 disabled buttons", function (assert) {
		this.oContextMenuControl.setMaxButtonsDisplayed(3);
		var aButtons = [
			new OverflowToolbarButton({
				text: "Button 0",
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 1",
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 2",
				enabled: true
			}),
			new OverflowToolbarButton({
				text: "Button 3",
				enabled: false
			})
		];
		var spyEnabledButtons = sinon.spy(this.oContextMenuControl, "_getNumberOfEnabledButtons");
		var spyHideDisabled = sinon.spy(this.oContextMenuControl, "_hideDisabledButtons");
		var spyHideInOverflow = sinon.spy(this.oContextMenuControl, "_hideButtonsInOverflow");
		var spyReplaceLast = sinon.spy(this.oContextMenuControl, "_replaceLastVisibleButtonWithOverflowButton");
		var spyCreateOverflow = sinon.spy(this.oContextMenuControl, "_createOverflowButton");
		this.oContextMenuControl._setButtonsForContextMenu(aButtons, new Button({
			id: "btn2_"
		}));
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
		var spyColapsedContextMenu = sinon.spy(this.oContextMenuControl, "_setButtonsForContextMenu");
		var spyExpandedContextMenu = sinon.spy(this.oContextMenuControl, "_makeAllButtonsVisible");
		var oBtn = new Button({}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		this.oContextMenuControl.show(oBtn, true, {
			x: 0,
			y: 0
		});
		sinon.assert.notCalled(spyColapsedContextMenu);
		sinon.assert.calledOnce(spyExpandedContextMenu);
		spyColapsedContextMenu.reset();
		spyExpandedContextMenu.reset();
		this.oContextMenuControl.show(oBtn, false);
		sinon.assert.calledOnce(spyColapsedContextMenu);
		sinon.assert.notCalled(spyExpandedContextMenu);
		spyColapsedContextMenu = null;
		spyExpandedContextMenu = null;
	});

	QUnit.test("calling _changeFocusOnKeyStroke", function (assert) {
		this.oButton1Overlay.focus();
		var oEvent = { key: "ArrowRight" };
		var oChangeFocusOnButtonsStub = oSandbox.stub(this.oContextMenuControl, "_changeFocusOnButtons");
		this.oContextMenuControl._changeFocusOnKeyStroke(oEvent);
		assert.equal(oChangeFocusOnButtonsStub.callCount, 1, "_changeFocusOnButtons called first");
		assert.equal(oChangeFocusOnButtonsStub.args.length, 1, "_changeFocusOnButtons called with one argument");
		oEvent.key = "ArrowLeft";
		this.oContextMenuControl._changeFocusOnKeyStroke(oEvent);
		assert.equal(oChangeFocusOnButtonsStub.callCount, 2, "_changeFocusOnButtons called second");
		assert.equal(oChangeFocusOnButtonsStub.args[1].length, 2, "_changeFocusOnButtons called with two arguments");
		oEvent.key = "ArrowUp";
		this.oContextMenuControl._changeFocusOnKeyStroke(oEvent);
		assert.equal(oChangeFocusOnButtonsStub.callCount, 3, "_changeFocusOnButtons called third");
		assert.equal(oChangeFocusOnButtonsStub.args[2].length, 2, "_changeFocusOnButtons called with two arguments");
		oEvent.key = "ArrowDown";
		this.oContextMenuControl._changeFocusOnKeyStroke(oEvent);
		assert.equal(oChangeFocusOnButtonsStub.callCount, 4, "_changeFocusOnButtons called fourth");
		assert.equal(oChangeFocusOnButtonsStub.args[3].length, 1, "_changeFocusOnButtons called with one argument");
		oEvent.key = "Tab";
		this.oContextMenuControl._changeFocusOnKeyStroke(oEvent);
		assert.equal(oChangeFocusOnButtonsStub.callCount, 4, "_changeFocusOnButtons was not called again");
	});

	QUnit.test("calling _onContextMenu (attached at popover)", function(assert) {
		var done = assert.async();
		var oEvent = { preventDefault: function() {
			assert.ok(true, "oEvent.preventDefault is called");
			done();
		}};
		this.oContextMenuControl._onContextMenu(oEvent);
	});

	QUnit.module("ContextMenuControl API", {
		beforeEach: function (assert) {
		},
		afterEach: function () {
			oSandbox.restore();
		}
	}, function() {

		QUnit.test("when instantiating context menu which throws an error", function (assert) {
			oSandbox.stub(sap.ui.getCore(), "getStaticAreaRef").throws(new Error("DOM is not ready yet. Static UIArea cannot be created."));
			assert.throws(function() { this.oContextMenuControl = new ContextMenuControl(); },
				/Popup cannot be opened because static UIArea cannot be determined./,
				"then error with correct message ist thrown");
			assert.ok(true);
		});
	});
});