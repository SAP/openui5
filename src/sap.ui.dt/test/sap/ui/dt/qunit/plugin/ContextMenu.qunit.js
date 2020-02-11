/* global QUnit */

sap.ui.define([
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ContextMenuControl",
	"sap/ui/dt/Util",
	"sap/ui/rta/plugin/Rename",
	'sap/ui/rta/command/CommandFactory',
	"sap/ui/Device",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Button",
	"sap/m/Popover",
	"sap/m/OverflowToolbarButton",
	"sap/m/FlexBox",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/dt/DOMUtil"
], function (
	ContextMenuPlugin,
	OverlayRegistry,
	DesignTime,
	ContextMenuControl,
	DtUtil,
	RenamePlugin,
	CommandFactory,
	Device,
	QUnitUtils,
	Button,
	Popover,
	OverflowToolbarButton,
	FlexBox,
	VerticalLayout,
	KeyCodes,
	sinon,
	DOMUtil
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	function openContextMenu(oOverlay, bMiniMenu, bTouch, bRestoreClock) {
		if (bRestoreClock) {
			this.clock.restore();
		}
		return new Promise(function(resolve) {
			this.oContextMenuPlugin.attachEventOnce("openedContextMenu", resolve);

			var sEvent;
			if (bMiniMenu) {
				if (bTouch) {
					sEvent = "touchstart";
				} else {
					sEvent = "click";
				}
			} else {
				sEvent = "contextmenu";
			}
			oOverlay.setSelected(true);
			QUnitUtils.triggerMouseEvent(oOverlay.getDomRef(), sEvent);
			if (!bRestoreClock) {
				// context menu has a debouncing of 50 ms
				this.clock.tick(52);
			}
		}.bind(this));
	}

	QUnit.module("ContextMenu API", {
		beforeEach: function (assert) {
			var done = assert.async();
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
				enabled: function (vElementOverlays) {
					var aElementOverlays = DtUtil.castArray(vElementOverlays);
					var oElement = aElementOverlays[0].getElement();
					return oElement === this.oButton1;
				}.bind(this)
			};
			this.oMenuEntries.disabledBtn1 = {
				id: "CTX_DISABLED_BUTTON1",
				text: "disabled for button 1",
				handler: sinon.spy(),
				enabled: function (vElementOverlays) {
					var aElementOverlays = DtUtil.castArray(vElementOverlays);
					var oElement = aElementOverlays[0].getElement();
					return oElement !== this.oButton1;
				}.bind(this)
			};
			this.oMenuEntries.onlyBtn2 = {
				id: "CTX_ONLY_BUTTON2",
				text: "only shown for button 2",
				rank: 1,
				handler: sinon.spy()
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
					return oElement === this.oButton1;
				}.bind(this)
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
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton1Overlay.setSelectable(true);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton2Overlay.setSelectable(true);
				this.oUnselectableOverlay = OverlayRegistry.getOverlay(this.oButtonUnselectable);
				this.clock = sinon.useFakeTimers();
				done();
			}.bind(this));
			this.oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
		},
		afterEach: function () {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.clock.restore();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Showing the ContextMenu", function (assert) {
			return openContextMenu.call(this, this.oButton2Overlay).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				var fnSpy = sandbox.spy(oContextMenuControl, "_rememberPosition");
				assert.ok(oContextMenuControl.getPopover().isOpen(), "ContextMenu should be open");
				assert.ok(oContextMenuControl._oLastPosition === null, "The Last Position of the ContextMenu is not set, because it is the first opening");
				QUnitUtils.triggerKeydown(oContextMenuControl.getPopover().getDomRef(), KeyCodes.ESCAPE);
				this.clock.tick(400); //animation of the closing of the Popover
				var oLastPosition = oContextMenuControl._oLastPosition;
				assert.strictEqual(fnSpy.callCount, 1, "The Position of the ContextMenu is stored before closing");
				assert.ok(!oContextMenuControl.getPopover().isOpen(), "ContextMenu should be closed");
				return openContextMenu.call(this, this.oButton2Overlay, false/*bMiniMenu*/, false/*bTouch*/, true/*bRestoreClock*/).then(function() {
					assert.strictEqual(oContextMenuControl._oLastPosition, oLastPosition, "The Last Position of the ContextMenu is used because it is opened on same Overlay");
					assert.ok(oContextMenuControl.getPopover().isOpen(), "ContextMenu should be open");
				});
			}.bind(this));
		});

		QUnit.test("Closing the ContextMenu with existing caller-overlay", function (assert) {
			return openContextMenu.call(this, this.oButton2Overlay).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				var fnSpy = sinon.spy(DOMUtil, "focusWithoutScrolling");
				QUnitUtils.triggerKeydown(oContextMenuControl.getPopover().getDomRef(), KeyCodes.ESCAPE);
				this.clock.tick(400); //animation of the closing of the Popover
				assert.strictEqual(fnSpy.callCount, 1, "the focus without scrolling function is called");
				assert.ok(oContextMenuControl._oLastSourceOverlay === this.oButton2Overlay, "the last Caller Overlay of the ContextMenu is set");
				fnSpy.restore();
			}.bind(this));
		});

		QUnit.test("Closing the ContextMenu with non-existing caller-overlay", function (assert) {
			return openContextMenu.call(this, this.oButton2Overlay).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				// clear the overlay-reference to simulate non-existing overlay
				oContextMenuControl._oTarget.setAttribute("overlay", "");
				var fnSpy = sinon.spy(DOMUtil, "focusWithoutScrolling");
				QUnitUtils.triggerKeydown(oContextMenuControl.getPopover().getDomRef(), KeyCodes.ESCAPE);
				this.clock.tick(400); //animation of the closing of the Popover
				assert.strictEqual(fnSpy.callCount, 0, "the focus without scrolling function is not called");
				assert.ok(oContextMenuControl._oLastSourceOverlay === null, "the last Caller Overlay of the ContextMenu is not set");
				fnSpy.restore();
			}.bind(this));
		});

		QUnit.test("Many Events to open the ContextMenu in a short time", function(assert) {
			var oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			this.oButton2Overlay.setSelected(true);
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			this.oButton1Overlay.setSelected(true);
			QUnitUtils.triggerMouseEvent(this.oButton1Overlay.getDomRef(), "contextmenu");
			this.oButton2Overlay.setSelected(true);
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			this.oButton1Overlay.setSelected(true);
			QUnitUtils.triggerMouseEvent(this.oButton1Overlay.getDomRef(), "contextmenu");
			this.clock.tick(50);

			assert.equal(oOpenStub.callCount, 1, "the open function was only called once");
		});

		QUnit.test("Reopen the ContextMenu on another overlay", function (assert) {
			var done = assert.async();
			var bIsEdge = Device.browser.edge;
			Device.browser.edge = true;
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			var fnSpy = sandbox.spy(oContextMenuControl, "_rememberPosition");
			oContextMenuControl.attachEventOnce("Opened", function() {
				assert.ok(oContextMenuControl.getPopover().isOpen(), "ContextMenu should be open");
				openContextMenu.call(this, this.oButton2Overlay, false, false, true).then(function() {
					// the popup uses another setTimeout (50ms on firefox), without this the opened event won't be fired
					this.clock.tick(52);
				}.bind(this));
			}.bind(this));
			oContextMenuControl.attachEventOnce("Closed", function() {
				assert.ok(!oContextMenuControl.getPopover().isOpen(), "ContextMenu should be closed");
				assert.strictEqual(fnSpy.callCount, 0, "the Position of the ContextMenu is not stored before closing, because Contextmenu is not closed via ESCAPE");
				oContextMenuControl.attachEventOnce("Opened", function() {
					assert.ok(oContextMenuControl.getPopover().isOpen(), "ContextMenu should be reopened again");
					assert.ok(oContextMenuControl._oLastPosition === null, "the Last Position of the ContextMenu is not set");
					Device.browser.edge = bIsEdge;
					done();
				});
			});
			openContextMenu.call(this, this.oButton1Overlay).then(function() {
				// the popup uses another setTimeout (50ms on firefox), without this the opened event won't be fired
				this.clock.tick(52);
			}.bind(this));
		});

		QUnit.test("When a context menu is open and selection changes", function (assert) {
			return openContextMenu.call(this, this.oButton2Overlay).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				var fnSpy = sandbox.spy(oContextMenuControl, "_rememberPosition");
				var oContextMenuControlCloseSpy = sandbox.spy(oContextMenuControl, "close");
				this.oDesignTime.getSelectionManager().fireChange({
					selection: [this.oButton1Overlay]
				});
				assert.strictEqual(fnSpy.callCount, 0, "the Position of the ContextMenu is not stored before closing, because Contextmenu is not closed via ESCAPE");
				assert.ok(oContextMenuControlCloseSpy.called, "ContextMenu is closed");
			}.bind(this));
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
			var oCloseStub = sandbox.stub(this.oContextMenuPlugin.oContextMenuControl, "close");
			var oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			var oLockMenuOpeningStub = sandbox.stub(this.oContextMenuPlugin, "lockMenuOpening");
			var iItemsCount = this.oContextMenuPlugin._aMenuItems.length;
			oTestItem.handler();
			assert.equal(oCloseStub.callCount, 1, "then context menu control close function is called");
			assert.equal(this.oContextMenuPlugin._aMenuItems.length - iItemsCount, 2, "then submenu items were added to contextmenu");
			assert.equal(oLockMenuOpeningStub.callCount, 1, "then lockMenuOpening function is called");
			this.clock.tick();
			assert.equal(oOpenStub.callCount, 1, "then context menu open function is called");
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
			var that = this;
			var oTestButton = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled: function (vElementOverlays) {
					var aElementOverlays = DtUtil.castArray(vElementOverlays);
					var oElement = aElementOverlays[0].getElement();
					return oElement === that.oButton1;
				},
				group: "Test1"
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestButton);
			var oTestButton2 = {
				id: "CTX_ENABLED_BUTTON3",
				text: "enabled for button 3",
				handler: sinon.spy(),
				enabled: function (vElementOverlays) {
					var aElementOverlays = DtUtil.castArray(vElementOverlays);
					var oElement = aElementOverlays[0].getElement();
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
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
			this.oContextMenuPlugin._addItemGroupsToMenu(this.oTestEvent, this.oButton2Overlay);
			assert.strictEqual(this.oContextMenuPlugin._aMenuItems.length, 9, "Should have added 2 Buttons");
			this.oContextMenuPlugin._aMenuItems[this.oContextMenuPlugin._aMenuItems.length - 1].menuItem.handler();
			assert.strictEqual(this.oContextMenuPlugin.isMenuOpeningLocked(), true, "Opening should be locked");
			this.oContextMenuPlugin.oContextMenuControl.close();
		});

		QUnit.test("Pressing the Overflow Button on a ContextMenu", function (assert) {
			return openContextMenu.call(this, this.oButton2Overlay, true).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				var aContextMenuButtons = oContextMenuControl.getButtons();
				var oOverflowButton = aContextMenuButtons[aContextMenuButtons.length - 1];
				oContextMenuControl._onOverflowPress.bind(oContextMenuControl)({oSource : oOverflowButton});
				assert.ok(true, "Should throw no error");
			}.bind(this));
		});

		// FIXME: wait for hover PoC from UX colleagues
		// QUnit.test("Testing onHover function with mouse events", function (assert) {
		// 	QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseover");
		// 	var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
		// 	assert.ok(!oContextMenuControl.bOpen, "ContextMenu should not be opened");
		// 	this.clock.tick(this.oContextMenuPlugin.iMenuHoverOpeningDelay);
		// 	assert.ok(oContextMenuControl.bOpen, "ContextMenu should be open");
		// 	assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
		// });

		// QUnit.test("Testing onHover with onHoverExit function with mouse events", function (assert) {
		// 	QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseover");
		// 	var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
		// 	assert.ok(!oContextMenuControl.bOpen, "ContextMenu should not be opened");
		// 	QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseout");
		// 	this.clock.tick(this.oContextMenuPlugin.iMenuHoverOpeningDelay);
		// 	assert.ok(!oContextMenuControl.bOpen, "ContextMenu should not be open");
		// });

		// QUnit.test("Testing onHover with multiple overlays with mouse events", function (assert) {
		// 	var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
		// 	var oCloseContextMenuSpy = sandbox.spy(oContextMenuControl, "close");
		// 	QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseover");
		// 	this.clock.tick(this.oContextMenuPlugin.iMenuHoverOpeningDelay);
		// 	assert.ok(oContextMenuControl.bOpen, "then after onHover ContextMenu should be open on the first overlay");
		// 	QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "mouseout");
		// 	QUnitUtils.triggerMouseEvent(this.oButton1Overlay.getDomRef(), "mouseover");
		// 	this.clock.tick(this.oContextMenuPlugin.iMenuHoverClosingDelay);
		// 	assert.equal(oCloseContextMenuSpy.callCount, 1, "then after onHover at the second overlay the open contextmenu is closed");
		// 	this.clock.tick(this.oContextMenuPlugin.iMenuHoverOpeningDelay);
		// 	assert.ok(oContextMenuControl.bOpen, "then ContextMenu should be open at the second overlay");
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
			var oStartOpeningStub = sandbox.stub(this.oContextMenuPlugin, "_startOpening").returns(true);
			var oFakeEvent = {
				currentTarget: { id: this.oButton1Overlay.getId() },
				stopPropagation: function() {}
			};
			this.oContextMenuPlugin.iMenuHoverClosingDelay = 0;
			this.oContextMenuPlugin.iMenuHoverOpeningDelay = 5;
			this.oContextMenuPlugin._onHover(oFakeEvent);
			this.clock.tick(this.oContextMenuPlugin.iMenuHoverOpeningDelay);
			assert.equal(oStartOpeningStub.callCount, 1, "then after onHover _startOpeningFunction is called once");
		});

		QUnit.test("Testing onHover function when popover is already open", function (assert) {
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			var oContextMenuPopover = this.oContextMenuPlugin.oContextMenuControl.getPopover();
			var oCloseContextMenuStub = sandbox.stub(oContextMenuControl, "close");
			sandbox.stub(oContextMenuPopover, "isOpen").returns(true);
			var oFakeEvent = {
				currentTarget: { id: this.oButton1Overlay.getId() },
				stopPropagation: function() {}
			};
			this.oContextMenuPlugin.iMenuHoverClosingDelay = 0;
			this.oContextMenuPlugin.iMenuHoverOpeningDelay = 5;
			this.oContextMenuPlugin._onHover(oFakeEvent);
			this.clock.tick(this.oContextMenuPlugin.iMenuHoverClosingDelay);
			assert.equal(oCloseContextMenuStub.callCount, 1, "then after onHover contextMenuControl.close function is called once");
		});

		QUnit.test("Testing onClick function", function (assert) {
			return openContextMenu.call(this, this.oButton2Overlay, true).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				assert.ok(oContextMenuControl.isPopupOpen(false), "ContextMenu should be open");
				assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
				oContextMenuControl = null;
			}.bind(this));
		});

		QUnit.test("Testing onClick function with ctrl key pressed", function (assert) {
			return openContextMenu.call(this, this.oButton2Overlay, true).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				assert.ok(oContextMenuControl.isPopupOpen(false), "ContextMenu should be open");
				assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
				oContextMenuControl = null;
			}.bind(this));
		});

		QUnit.test("Testing onClick function unlocking opening of the ContextMenu", function (assert) {
			var oUnlockMenuOpeningSpy = sandbox.spy(this.oContextMenuPlugin, "unlockMenuOpening");
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			this.oContextMenuPlugin.lockMenuOpening();
			return openContextMenu.call(this, this.oButton2Overlay, true).then(function() {
				assert.equal(oUnlockMenuOpeningSpy.callCount, 1, "then 'unlockMenuOpening' should be called once");
				assert.ok(oContextMenuControl.isPopupOpen(false), "then after opening delay ContextMenu should be open");
			});
		});

		QUnit.test("Testing onClick function when overlay is not selected", function (assert) {
			// regarding the rta directives the second click on an overlay deselects it,
			// if it is not "rename"-able. In this case ContextMenu shouldn't be opened
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			this.oButton2Overlay.setSelected(false);
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
			assert.notOk(oContextMenuControl.isPopupOpen(true), "then after click the ContextMenu should not be opened");
		});

		QUnit.test("Testing onTouch function", function (assert) {
			this.oContextMenuPlugin._ensureSelection(this.oButton2Overlay);
			return openContextMenu.call(this, this.oButton2Overlay, true, true).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				assert.ok(oContextMenuControl.getPopover().isOpen(), "ContextMenu should be open");
				assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Row", "Flexbox should be set to Row");
			}.bind(this));
		});

		QUnit.test("Testing onKeyUp function opening the expanded contextMenu", function (assert) {
			var oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			var _tempListener = function (oEvent) {
				oEvent.keyCode = KeyCodes.F10;
				oEvent.shiftKey = true;
				oEvent.altKey = false;
				oEvent.ctrlKey = false;
				this.oContextMenuPlugin._onKeyUp(oEvent);
				assert.equal(oOpenStub.callCount, 1, "the open function was triggered");
			}.bind(this);
			this.oButton2Overlay.setSelected(true);
			this.oButton2Overlay.attachBrowserEvent("keyup", _tempListener, this);
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "keyup");
		});

		QUnit.test("Testing onKeyUp function opening the compact contextMenu", function (assert) {
			var oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			var _tempListener = function (oEvent) {
				oEvent.keyCode = KeyCodes.ENTER;
				oEvent.shiftKey = false;
				oEvent.altKey = false;
				oEvent.ctrlKey = false;
				this.oContextMenuPlugin._onKeyUp(oEvent);
				assert.equal(oOpenStub.callCount, 1, "the open function was triggered");
			}.bind(this);
			this.oButton2Overlay.attachBrowserEvent("keyup", _tempListener, this);
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "keyup");
		});

		QUnit.test("Testing onKeyUp function (ENTER) with other plugin busy", function (assert) {
			var oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			var oCheckPluginLockStub = sandbox.stub(this.oContextMenuPlugin, "_checkForPluginLock").returns(true);
			var _tempListener = function (oEvent) {
				oEvent.keyCode = KeyCodes.ENTER;
				oEvent.shiftKey = false;
				oEvent.altKey = false;
				oEvent.ctrlKey = false;
				this.oContextMenuPlugin._onKeyUp(oEvent);
				assert.equal(oOpenStub.callCount, 0, "the open function was not triggered");
				oCheckPluginLockStub.reset();
			}.bind(this);
			this.oButton2Overlay.attachBrowserEvent("keyup", _tempListener, this);
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "keyup");
		});

		QUnit.test("Clicking on a button in the ContextMenu", function (assert) {
			return openContextMenu.call(this, this.oButton2Overlay).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				assert.ok(oContextMenuControl.isPopupOpen(true), "ContextMenu should be open");
				assert.strictEqual(oContextMenuControl.getFlexbox().getDirection(), "Column", "Flexbox should be set to Column");
				this.oContextMenuPlugin._oCurrentOverlay = this.oButton2Overlay;
				oContextMenuControl.getFlexbox().getItems()[0].firePress();
			}.bind(this));
		});

		QUnit.test("Deregistering an Overlay", function (assert) {
			this.oContextMenuPlugin.deregisterElementOverlay(this.oButton1Overlay);
			assert.ok(true, "Should throw no error");
		});

		QUnit.test("calling _getPopoverDimensions for MiniMenu", function (assert) {
			return openContextMenu.call(this, this.oButton2Overlay, true).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				sandbox.stub(oContextMenuControl, "_getBaseFontSize").returns(16);
				sandbox.stub(oContextMenuControl, "_getArrowHeight").returns(0.5625);
				var iArrSize = oContextMenuControl._getBaseFontSize() * oContextMenuControl._getArrowHeight();
				var oPopover = oContextMenuControl._getPopoverDimensions(true);
				var iHeight = parseInt(jQuery("#" + oContextMenuControl.getPopover().getId()).css("height")) + iArrSize;
				var iWidth = parseInt(jQuery("#" + oContextMenuControl.getPopover().getId()).css("width")) + iArrSize;
				assert.strictEqual(typeof oPopover.height, "number", "the height of a non-expanded ContextMenu should be a number");
				assert.strictEqual(oPopover.height, iHeight, "the height of a non-expanded ContextMenu is correct");
				assert.ok(!isNaN(oPopover.height), "the height of a non-expanded ContextMenu shouldn't be NaN");
				assert.strictEqual(typeof oPopover.width, "number", "the width of a non-expanded ContextMenu should be a number");
				assert.strictEqual(oPopover.width, iWidth, "the width of a non-expanded ContextMenu is correct");
				assert.ok(!isNaN(oPopover.width), "the width of a non-expanded ContextMenu shouldn't be NaN");
			}.bind(this));
		});

		QUnit.test("calling _getPopoverDimensions for ContextMenu", function (assert) {
			return openContextMenu.call(this, this.oButton2Overlay).then(function() {
				var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
				var oPopoverContext = oContextMenuControl._getPopoverDimensions(false);
				var iHeight = parseInt(jQuery("#" + oContextMenuControl.getPopover().getId()).css("height"));
				var iWidth = parseInt(jQuery("#" + oContextMenuControl.getPopover().getId()).css("width"));
				assert.strictEqual(typeof oPopoverContext.height, "number", "the height of a context menu should be a number");
				assert.strictEqual(oPopoverContext.height, iHeight, "the height of a context menu is correct");
				assert.ok(!isNaN(oPopoverContext.height), "the height of a context menu shouldn't be NaN");
				assert.strictEqual(typeof oPopoverContext.width, "number", "the width of a context menu should be a number");
				assert.strictEqual(oPopoverContext.width, iWidth, "the width of a context menu is correct");
				assert.ok(!isNaN(oPopoverContext.width), "the width of a context menu shouldn't be NaN");
			}.bind(this));
		});

		QUnit.test("calling _checkForPluginLock", function (assert) {
			Device.os.ios = true;
			assert.notOk(this.oContextMenuPlugin._checkForPluginLock(), "then return false for ios devices");
			Device.os.ios = false;
			this.oContextMenuPlugin._bFocusLocked = true;
			assert.notOk(this.oContextMenuPlugin._checkForPluginLock(), "then return false when no busy plugin exists");
			assert.notOk(this.oContextMenuPlugin._bFocusLocked, "then reset the focus lock when no busy plugin exists");
			sandbox.stub(this.oRenamePlugin, "isBusy").returns(true);
			assert.ok(this.oContextMenuPlugin._checkForPluginLock(), "then return true when busy plugin exists");
		});

		QUnit.test("calling _shouldContextMenuOpen", function (assert) {
			this.oContextMenuPlugin._bOpeningLocked = true;
			assert.notOk(this.oContextMenuPlugin._shouldContextMenuOpen(), "then return false when menu opening locked");
			this.oContextMenuPlugin._bOpeningLocked = false;
			sandbox.stub(this.oContextMenuPlugin, "_checkForPluginLock").returns(true);
			assert.notOk(this.oContextMenuPlugin._shouldContextMenuOpen(), "then return false when busy plugin exists");

			sandbox.restore();
			sandbox.stub(this.oContextMenuPlugin, "_checkForPluginLock").returns(false);

			assert.ok(this.oContextMenuPlugin._shouldContextMenuOpen(oEvent, true), "then return true when no plugin is busy and it is on hover");
			assert.notOk(this.oContextMenuPlugin._oCurrentOverlay, "and current overlay is not set when on hover");

			var oEvent = { currentTarget: { id: "button1" } };
			assert.ok(this.oContextMenuPlugin._shouldContextMenuOpen(oEvent), "then return true when no plugin is busy");
			assert.equal(this.oContextMenuPlugin._oCurrentOverlay.getElement().getId(), oEvent.currentTarget.id, "and current overlay is set when not on hover");
		});

		QUnit.test("calling _clearHoverTimeout", function(assert) {
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
		});

		QUnit.test("calling open with plain menu item for overlay", function(assert) {
			var oPlainMenuItem = { id: "plainItem", group: undefined, submenu: undefined };
			var aPlugins = [
				{
					getMenuItems: function() {return [oPlainMenuItem];},
					isBusy: function() {return false;}
				}
			];
			var oAddMenuItemStub = sandbox.stub(this.oContextMenuPlugin, "addMenuItem");
			sandbox.stub(this.oDesignTime, "getPlugins").returns(aPlugins);
			return openContextMenu.call(this, this.oButton1Overlay).then(function() {
				assert.equal(oAddMenuItemStub.callCount, 1, "then addMenuItems is called");
				assert.equal(oAddMenuItemStub.args[0][0], oPlainMenuItem, "then addMenuItems is called with the plain menu item");
				sandbox.restore();
			});
		});

		QUnit.test("calling open with only group menu item for overlay", function(assert) {
			var oGroupMenuItem = { id: "groupItem", group: "group1", submenu: undefined };
			var aPlugins = [
				{
					getMenuItems: function() {return [oGroupMenuItem];},
					isBusy: function() {return false;}
				}
			];
			var oAddMenuItemToGroupStub = sandbox.stub(this.oContextMenuPlugin, "_addMenuItemToGroup");
			sandbox.stub(this.oDesignTime, "getPlugins").returns(aPlugins);
			return openContextMenu.call(this, this.oButton1Overlay, true).then(function() {
				assert.equal(oAddMenuItemToGroupStub.callCount, 1, "then _addMenuItemToGroup is called");
				assert.equal(oAddMenuItemToGroupStub.args[0][0], oGroupMenuItem, "then _addMenuItemToGroup is called with the group menu item");
				sandbox.restore();
			});
		});

		QUnit.test("calling open with only plain menu items for overlay", function(assert) {
			var oPlainMenuItem = { id: "plainItem", group: undefined, submenu: undefined };
			var oSubMenuItem = { id: "subItem", group: undefined, submenu: [oPlainMenuItem] };
			var aPlugins = [
				{
					getMenuItems: function() {return [oSubMenuItem];},
					isBusy: function() {return false;}
				}
			];
			var oAddSubMenuStub = sandbox.stub(this.oContextMenuPlugin, "_addSubMenu");
			sandbox.stub(this.oDesignTime, "getPlugins").returns(aPlugins);
			return openContextMenu.call(this, this.oButton1Overlay).then(function() {
				assert.equal(oAddSubMenuStub.callCount, 1, "then _addSubMenu is called");
				assert.equal(oAddSubMenuStub.args[0][0], oSubMenuItem, "then _addMenuItemToGroup is called with the sub menu item");
				sandbox.restore();
			});
		});

		QUnit.test("When the popup height is too big", function (assert) {
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			sandbox.stub(oContextMenuControl, "_getPopoverDimensions").returns({height : 250, width : 100});
			sandbox.stub(oContextMenuControl, "_getViewportDimensions").returns({width : 300, height : 300, top : 0, bottom : 300});
			return openContextMenu.call(this, this.oButton2Overlay).then(function() {
				assert.equal(oContextMenuControl.getPopover().getContentHeight(), "200px", "then vertical scrolling is added");
				sandbox.restore();
			});
		});

		QUnit.test("When the popup width is more than 400px", function (assert) {
			var oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			sandbox.stub(oContextMenuControl, "_getPopoverDimensions").returns({height : 250, width : 500});
			sandbox.stub(oContextMenuControl, "_getViewportDimensions").returns({width : 800, height : 800, top : 0, bottom : 800});
			return openContextMenu.call(this, this.oButton2Overlay).then(function() {
				assert.equal(oContextMenuControl.getPopover().getContentWidth(), "400px", "then the width is limited to 400px");
				sandbox.restore();
			});
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
				this.oContextMenuControl.addMenuButton(this.oMenuEntries[key], function () {}, []);
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
			sandbox.restore();
		}
	}, function () {
		QUnit.test("calling getPopover", function (assert) {
			assert.ok(this.oContextMenuControl.getPopover() instanceof Popover, "should return a Popover");
		});

		QUnit.test("calling getFlexbox", function (assert) {
			assert.ok(this.oContextMenuControl.getFlexbox() instanceof FlexBox, "should return a FlexBox");
		});

		QUnit.test("default value of maxButtonsDisplayed", function (assert) {
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			assert.strictEqual(this.oContextMenuControl.getMaxButtonsDisplayed(), 4, "Should return 4.");
		});

		QUnit.test("setting value of maxButtonsDisplayed", function (assert) {
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			this.oContextMenuControl.setMaxButtonsDisplayed(19);
			assert.strictEqual(this.oContextMenuControl.getMaxButtonsDisplayed(), 19, "Should return 19.");
		});

		QUnit.test("setting value of maxButtonsDisplayed to an illegal value", function (assert) {
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			assert.throws(function () {
				this.oContextMenuControl.setMaxButtonsDisplayed(1);
			}, "Should throw an Error.");
		});

		QUnit.test("adding a menu button", function (assert) {
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			var oBtn = {
				text: "TestText",
				icon: "",
				handler: function () {}
			};
			assert.strictEqual(this.oContextMenuControl.addMenuButton(oBtn), this.oContextMenuControl, "Should return the ContextMenu");
			assert.strictEqual(this.oContextMenuControl.getFlexbox(true).getItems()[this.oContextMenuControl.getFlexbox(true).getItems().length - 1].getText(), oBtn.text, "Button should be added to Flexbox 1");
			assert.strictEqual(this.oContextMenuControl.getFlexbox(true).getItems()[this.oContextMenuControl.getFlexbox(true).getItems().length - 1].getText(), oBtn.text, "Button should be added to Flexbox 2");
		});

		QUnit.test("removing a button", function (assert) {
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
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
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			this.oContextMenuControl.removeAllButtons();
			assert.strictEqual(this.oContextMenuControl.getPopover().getContent()[0].getItems().length, 0, "should remove all buttons");
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
			var oNextSpy = sinon.spy(this.oContextMenuControl, "_setFocusOnNextButton");
			var oPrevSpy = sinon.spy(this.oContextMenuControl, "_setFocusOnPreviousButton");
			this.oContextMenuControl.show(oTestBtn, false, {});
			var sId = this.oContextMenuControl.getButtons()[0].getId();
			this.oContextMenuControl._changeFocusOnButtons(sId);
			assert.ok(oNextSpy.calledOnce);
			assert.ok(oPrevSpy.notCalled);
			oNextSpy.reset();
			oPrevSpy.reset();
			this.oContextMenuControl._changeFocusOnButtons(sId, true);
			assert.ok(oNextSpy.notCalled);
			assert.ok(oPrevSpy.calledOnce);
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

		QUnit.test("calling _placeAsCompactContextMenu", function (assert) {
			// menu place at top
			var oContPos = {
				x: 10,
				y: 10
			};
			var oPopover = {
				height: 50,
				width: 40
			};
			var oViewport = {
				width: 100
			};
			this.oContextMenuControl._placeAsCompactContextMenu(oContPos, oPopover, oViewport);
			assert.strictEqual(this.oContextMenuControl.getPopover().getShowArrow(), true, "Arrow should be visible");
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
			assert.strictEqual(oPos.left, 160, "should be oContPos.x - oPopover.width / 2");
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
		});

		QUnit.test("calling _placeContextMenu", function (assert) {
			this.oContextMenuControl._oContextMenuPosition = {
				x: 314,
				y: 42
			};
			this.oContextMenuControl.addMenuButton({
				text: "button",
				handler: function () {
					return undefined;
				},
				id: "newButton0"
			});
			var oSpyContext = sinon.spy(this.oContextMenuControl, "_placeAsExpandedContextMenu");
			var oSpyMini = sinon.spy(this.oContextMenuControl, "_placeAsCompactContextMenu");
			var oFakeDiv = this.oContextMenuControl._placeContextMenu(this.oButton2Overlay, true);
			var sFakeDivId = "contextMenuFakeDiv";
			assert.ok(oFakeDiv instanceof Element, "should return an HTML Element");
			assert.strictEqual(oFakeDiv.getAttribute("overlay"), this.oButton2Overlay.getId(), "the fakeDiv should have an overlay attribute containing the id of the original overlay");
			assert.strictEqual(oFakeDiv.getAttribute("id"), sFakeDivId, "the fakeDiv should have the correct contextMenu fakeDiv id");
			assert.strictEqual(oFakeDiv, jQuery("#" + this.oButton2Overlay.getId()).children()[1], "the fakeDiv should be a child of the overlay the ContextMenu was placed by");
			assert.strictEqual(parseInt(oFakeDiv.style.top), 0, "the FakeDiv top position is zero when the Overlay is not on top position");
			assert.ok(oSpyContext.calledOnce);
			assert.ok(oSpyMini.notCalled);
			oSpyContext.reset();
			oSpyMini.reset();

			this.oContextMenuControl._iButtonsVisible = 3;
			// calling "_placeContextMenu" with faked overlay position to check top calculation
			sinon.stub(this.oContextMenuControl, "_getOverlayDimensions").returns({top: 40, left: 1787, width: 40, height: 48, right: 1827, bottom: 88, isOverlappedAtBottom: false, isOverlappedAtTop: false});
			oFakeDiv = this.oContextMenuControl._placeContextMenu(this.oButton2Overlay, false);
			assert.strictEqual(parseInt(oFakeDiv.style.top) > 0, true, "the FakeDiv top position is greater than zero when the Overlay is on top position");
			assert.ok(oSpyMini.calledOnce);
			assert.ok(oSpyContext.notCalled);
		});

		QUnit.test("comparing the height of the arrow of an actual rendered sap.m.Popover to the return value of _getArrowHeight", function (assert) {
			var oCozyBtn = new Button({
				icon: "sap-icon://fridge"
			}).placeAt("qunit-fixture");
			var $Compact = jQuery("<div/>", {
				"class": "sapUiSizeCompact"
			}).appendTo("#qunit-fixture");
			var oCompactBtn = new Button({
				icon: "sap-icon://dishwasher"
			}).placeAt($Compact);
			sap.ui.getCore().applyChanges();
			var oCozyPop = new Popover({
				placement: "Bottom"
			}).openBy(oCozyBtn);
			var oCompactPop = new Popover({
				placement: "Bottom"
			}).openBy(oCompactBtn);
			var fCalculatedCozyArrowSize = this.oContextMenuControl._getArrowHeight(false);
			var fMeasuredCozyArrowSize = parseInt(jQuery("#" + oCozyPop.getId() + "-arrow").css("height")) / 16;
			var fCalculatedCompactArrowSize = this.oContextMenuControl._getArrowHeight(true);
			var fMeasuredCompactArrowSize = parseInt(jQuery("#" + oCompactPop.getId() + "-arrow").css("height")) / 16;
			oCozyPop.close();
			oCompactPop.close();
			assert.strictEqual(fCalculatedCozyArrowSize, fMeasuredCozyArrowSize, "To prevent rendering the ContextMenu a bunch of times the size of the Popover's Arrow is calculated based on the css values of sap.m.Popover. If this test fails the css values of sap.m.Popover may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getArrowHeight (for bCompact = false) has to be adjusted to whatever the expected value was in this test.");
			assert.strictEqual(fCalculatedCompactArrowSize, fMeasuredCompactArrowSize, "To prevent rendering the ContextMenu a bunch of times the size of the Popover's Arrow is calculated based on the css values of sap.m.Popover. If this test fails the css values of sap.m.Popover may have changed. Please run this test again to make sure it didn't fail randomly. If it fails again the return value of _getArrowHeight (for bCompact = true) has to be adjusted to whatever the expected value was in this test.");
		});

		QUnit.test("calling _getBaseFontSize", function (assert) {
			var iBaseFontSize = this.oContextMenuControl._getBaseFontSize();
			assert.strictEqual(typeof iBaseFontSize, "number", "The base font size should be a number.");
			assert.ok(!isNaN(iBaseFontSize), "The base font size shouldn't be NaN.");
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
		});

		QUnit.test("calling _setButtonsForCollapsedMenu with 3 disabled Buttons", function (assert) {
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
			var oEnabledButtonsSpy = sinon.spy(this.oContextMenuControl, "_getNumberOfEnabledButtons");
			var oHideDisabledSpy = sinon.spy(this.oContextMenuControl, "_hideDisabledButtons");
			var oHideInOverflowSpy = sinon.spy(this.oContextMenuControl, "_hideButtonsInOverflow");
			var oReplaceLastSpy = sinon.spy(this.oContextMenuControl, "_replaceLastVisibleButtonWithOverflowButton");
			var oAddOverflowButtonSpy = sinon.spy(this.oContextMenuControl, "addOverflowButton");
			this.oContextMenuControl._setButtonsForCollapsedMenu(aButtons, new Button({
				id: "btn0_"
			}));
			for (var i = 0; i < aButtons.length; i++) {
				assert.notEqual(aButtons[i].getTooltip(), "", "ToolTip shouldn't be empty string");
			}
			assert.ok(oEnabledButtonsSpy.calledOnce);
			assert.ok(oHideDisabledSpy.notCalled);
			assert.ok(oHideInOverflowSpy.calledOnce);
			assert.ok(oReplaceLastSpy.notCalled);
			assert.ok(oAddOverflowButtonSpy.notCalled);
		});

		QUnit.test("calling _setButtonsForCollapsedMenu with 2 enabled and 2 disabled buttons", function (assert) {
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
			var oEnabledButtonsSpy = sinon.spy(this.oContextMenuControl, "_getNumberOfEnabledButtons");
			var oHideDisabledSpy = sinon.spy(this.oContextMenuControl, "_hideDisabledButtons");
			var oHideInOverflowSpy = sinon.spy(this.oContextMenuControl, "_hideButtonsInOverflow");
			var oReplaceLastSpy = sinon.spy(this.oContextMenuControl, "_replaceLastVisibleButtonWithOverflowButton");
			var oAddOverflowButtonSpy = sinon.spy(this.oContextMenuControl, "addOverflowButton");
			this.oContextMenuControl._setButtonsForCollapsedMenu(aButtons, new Button({
				id: "btn1_"
			}));
			assert.ok(oEnabledButtonsSpy.calledOnce);
			assert.ok(oHideDisabledSpy.calledOnce);
			assert.ok(oHideInOverflowSpy.calledOnce);
			assert.ok(oReplaceLastSpy.notCalled);
			assert.ok(oAddOverflowButtonSpy.calledOnce);
		});

		QUnit.test("calling _setButtonsForCollapsedMenu with 3 enabled and 1 disabled buttons", function (assert) {
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
			var oEnabledButtonsSpy = sinon.spy(this.oContextMenuControl, "_getNumberOfEnabledButtons");
			var oHideDisabledSpy = sinon.spy(this.oContextMenuControl, "_hideDisabledButtons");
			var oHideInOverflowSpy = sinon.spy(this.oContextMenuControl, "_hideButtonsInOverflow");
			var oReplaceLastSpy = sinon.spy(this.oContextMenuControl, "_replaceLastVisibleButtonWithOverflowButton");
			var oAddOverflowButtonSpy = sinon.spy(this.oContextMenuControl, "addOverflowButton");
			this.oContextMenuControl._setButtonsForCollapsedMenu(aButtons, new Button({
				id: "btn2_"
			}));
			assert.ok(oEnabledButtonsSpy.calledOnce);
			assert.ok(oHideDisabledSpy.calledOnce);
			assert.ok(oHideInOverflowSpy.calledOnce);
			assert.ok(oReplaceLastSpy.calledOnce);
			assert.ok(oAddOverflowButtonSpy.calledOnce);
		});

		QUnit.test("calling show with contextMenu = true and contextMenu = false", function (assert) {
			var spyColapsedContextMenu = sinon.spy(this.oContextMenuControl, "_setButtonsForCollapsedMenu");
			var spyExpandedContextMenu = sinon.spy(this.oContextMenuControl, "_makeAllButtonsVisible");
			var oBtn = new Button({}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oContextMenuControl.show(oBtn, true, {
				x: 0,
				y: 0
			});
			assert.ok(spyColapsedContextMenu.notCalled);
			assert.ok(spyExpandedContextMenu.calledOnce);
			spyColapsedContextMenu.reset();
			spyExpandedContextMenu.reset();
			this.oContextMenuControl.show(oBtn, false, {});
			assert.ok(spyColapsedContextMenu.calledOnce);
			assert.ok(spyExpandedContextMenu.notCalled);
		});

		QUnit.test("calling _onKeyDown", function (assert) {
			this.oButton1Overlay.focus();
			var oEvent = { key: "ArrowRight" };
			var oChangeFocusOnButtonsStub = sandbox.stub(this.oContextMenuControl, "_changeFocusOnButtons");
			var oRememberPositionStub = sandbox.stub(this.oContextMenuControl, "_rememberPosition");
			this.oContextMenuControl._onKeyDown(oEvent);
			assert.equal(oChangeFocusOnButtonsStub.callCount, 1, "_changeFocusOnButtons called first");
			assert.equal(oChangeFocusOnButtonsStub.args.length, 1, "_changeFocusOnButtons called with one argument");
			oEvent.key = "ArrowLeft";
			this.oContextMenuControl._onKeyDown(oEvent);
			assert.equal(oChangeFocusOnButtonsStub.callCount, 2, "_changeFocusOnButtons called second");
			assert.equal(oChangeFocusOnButtonsStub.args[1].length, 2, "_changeFocusOnButtons called with two arguments");
			oEvent.key = "ArrowUp";
			this.oContextMenuControl._onKeyDown(oEvent);
			assert.equal(oChangeFocusOnButtonsStub.callCount, 3, "_changeFocusOnButtons called third");
			assert.equal(oChangeFocusOnButtonsStub.args[2].length, 2, "_changeFocusOnButtons called with two arguments");
			oEvent.key = "ArrowDown";
			this.oContextMenuControl._onKeyDown(oEvent);
			assert.equal(oChangeFocusOnButtonsStub.callCount, 4, "_changeFocusOnButtons called fourth");
			assert.equal(oChangeFocusOnButtonsStub.args[3].length, 1, "_changeFocusOnButtons called with one argument");
			oEvent.key = "Tab";
			this.oContextMenuControl._onKeyDown(oEvent);
			assert.equal(oChangeFocusOnButtonsStub.callCount, 4, "_changeFocusOnButtons was not called again");
			oEvent = { key: "Escape" };
			this.oContextMenuControl._onKeyDown(oEvent);
			assert.equal(oChangeFocusOnButtonsStub.callCount, 4, "_changeFocusOnButtons was not called again");
			assert.equal(oRememberPositionStub.callCount, 1, "_rememberPosition called");
		});

		QUnit.test("calling _onContextMenu (attached at popover)", function(assert) {
			var done = assert.async();
			var oEvent = { preventDefault: function() {
				assert.ok(true, "oEvent.preventDefault is called");
				done();
			}};
			this.oContextMenuControl._onContextMenu(oEvent);
		});

		QUnit.test("calling close function with expliciteClose option", function(assert) {
			var oCloseExpandedPopoverStub = sandbox.stub(this.oContextMenuControl.getPopover(true), "close");
			var oCloseCompactPopoverStub = sandbox.stub(this.oContextMenuControl.getPopover(false), "close");
			this.oContextMenuControl.close(true);
			assert.equal(oCloseExpandedPopoverStub.callCount, 1, "then the close function on expanded popover is called once");
			assert.equal(oCloseCompactPopoverStub.callCount, 1, "then the close function on expanded popover is called once");
		});

		QUnit.test("calling _getIcon with invalid value", function(assert) {
			var sIncidentIcon = "sap-icon://incident";
			assert.strictEqual(this.oContextMenuControl._getIcon({ icon: "object is not valid" }), sIncidentIcon,
				"[object] - then icon for invalid value is returned");
			assert.strictEqual(this.oContextMenuControl._getIcon(undefined), sIncidentIcon,
				"undefined - then icon for invalid value is returned");
			assert.strictEqual(this.oContextMenuControl._getIcon(null), sIncidentIcon,
				"null - then icon for invalid value is returned");
		});

		QUnit.test("calling _getIcon with 'blank' value", function(assert) {
			var sBlankIconInButtonValue = " ";
			assert.strictEqual(this.oContextMenuControl._getIcon("blank"), sBlankIconInButtonValue,
				"then icon for blank icon in the button is returned");
		});

		QUnit.test("calling _getIcon with valid icon", function(assert) {
			var sValidIcon = "sap-icon://accept";
			assert.strictEqual(this.oContextMenuControl._getIcon(sValidIcon), sValidIcon,
				"then icon for blank icon in the button is returned");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});