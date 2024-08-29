/* global QUnit */

sap.ui.define([
	"sap/ui/base/DesignTime",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/Util",
	"sap/ui/rta/plugin/Rename",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/Device",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4"
], function(
	BaseDesignTime,
	ContextMenuPlugin,
	OverlayRegistry,
	DesignTime,
	DtUtil,
	RenamePlugin,
	CommandFactory,
	Device,
	QUnitUtils,
	Button,
	VerticalLayout,
	KeyCodes,
	nextUIUpdate,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	function openContextMenu(oOverlay) {
		return new Promise(function(resolve) {
			this.oContextMenuPlugin.attachEventOnce("openedContextMenu", resolve);
			oOverlay.setSelected(true);
			QUnitUtils.triggerMouseEvent(oOverlay.getDomRef(), "contextmenu");
		}.bind(this));
	}

	QUnit.module("ContextMenu API", {
	 async	beforeEach(assert) {
			var done = assert.async();
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2", {text: "Button 2 text"});
			this.oButtonUnselectable = new Button();
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton1, this.oButton2, this.oButtonUnselectable
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oMenuEntries = {};
			this.oMenuEntries.available = {
				id: "CTX_ALWAYS_THERE",
				text() {
					return "item that is always there";
				},
				handler: sinon.spy()
			};
			this.oMenuEntries.enabledBtn1 = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled: function(vElementOverlays) {
					var aElementOverlays = DtUtil.castArray(vElementOverlays);
					var oElement = aElementOverlays[0].getElement();
					return oElement === this.oButton1;
				}.bind(this)
			};
			this.oMenuEntries.disabledBtn1 = {
				id: "CTX_DISABLED_BUTTON1",
				text: "disabled for button 1",
				handler: sinon.spy(),
				enabled: function(vElementOverlays) {
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
			this.oMenuEntries.Btn2SubMenu = {
				id: "CTX_BUTTON2_SUB",
				text: "button 2 submenu",
				rank: 1,
				handler: sinon.spy(),
				submenu: [
					{
						id: "CTX_BUTTON2_SUB01",
						text: "text",
						icon: "sap-icon://fridge",
						enabled: true
					},
					{
						id: "CTX_BUTTON2_SUB01",
						text: "more_text",
						icon: "sap-icon://dishwasher",
						enabled: true
					}
				]
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
				startSection: function(oElement) {
					return oElement === this.oButton1;
				}.bind(this)
			};
			this.oMenuEntries.dynamicTextItem = {
				id: "CTX_DYNAMIC_TEXT",
				text(oOverlay) {
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
				id: "nonDefaultRenamePlugin",
				commandFactory: oCommandFactory
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
			this.oContextMenuControl = this.oContextMenuPlugin.oContextMenuControl;
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton1Overlay.setSelectable(true);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton2Overlay.setSelectable(true);
				this.oUnselectableOverlay = OverlayRegistry.getOverlay(this.oButtonUnselectable);
				this.clock = sinon.useFakeTimers();
				done();
			}.bind(this));
		},
		afterEach() {
			this.clock.restore();
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("When context menu is opened and an item is selected", function(assert) {
			var done = assert.async();
			var oItemSelectedStub = sandbox.stub(this.oContextMenuPlugin, "_onItemSelected");
			this.oContextMenuPlugin.oContextMenuControl.attachEventOnce("closed", function() {
				assert.ok(true, "then the context menu is closed");
			});
			this.oContextMenuPlugin.attachEventOnce("closedContextMenu", function() {
				assert.ok(true, "then the event closedContextMenu is fired");
			});
			this.oContextMenuPlugin.attachEventOnce("openedContextMenu", function(oEvent) {
				var {oContextMenuControl} = oEvent.getSource();
				// Works only with events on unified menu
				var aItems = oContextMenuControl._getMenu().getItems();
				var oMenuItem = aItems[aItems.length - 1];

				// triggers menu item handler()
				QUnitUtils.triggerEvent("click", oMenuItem.sId, {});
				assert.equal(oItemSelectedStub.callCount, 1, "then the method '_onItemSelected' was called");
				done();
			});

			sandbox.stub(this.oRenamePlugin, "getMenuItems")
			.callThrough()
			.withArgs([this.oButton2Overlay])
			.returns([
				{
					id: "CTX_RENAME_BUTTON_2",
					text: "Rename for button 2",
					rank: 999,
					handler: oItemSelectedStub
				},
				{
					id: "CTX_BUTTON2_SUB",
					text: "button 2 submenu",
					rank: 888,
					handler: oItemSelectedStub
				}
			]);

			this.oButton2Overlay.setSelected(true);
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
			this.clock.tick(50);
		});

		QUnit.test("Calling method 'open' after adding a not persisted menu item", function(assert) {
			var oTestItem1 = {
				id: "CTX_TEST_NOT_PERSISTED",
				text: "test for not persisted item",
				handler: sinon.spy(),
				enabled: true,
				group: "Test1"
			};
			this.oContextMenuPlugin.addMenuItem(oTestItem1, true);
			assert.strictEqual(this.oContextMenuPlugin._aMenuItems.length, 9, "there are 9 items in the array for the menu items");
			this.oContextMenuPlugin.open(this.oButton1Overlay, false, {});
			assert.strictEqual(this.oContextMenuPlugin._aMenuItems.length, 8, "there is 1 item less in the array for the menu items");
		});

		QUnit.test("Calling method '_addMenuItemToGroup'", function(assert) {
			var that = this;
			var oTestItem = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled(oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1;
				},
				group: "Test1"
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestItem);
			assert.strictEqual(this.oContextMenuPlugin._aGroupedItems.length, 1, "should add an Item to grouped Items");
			var oTestItem2 = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled(oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1;
				},
				group: "Test1"
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestItem2);
			assert.strictEqual(this.oContextMenuPlugin._aGroupedItems.length, 1, "should add an Item to grouped Items without creating a new group");
			var oTestItem3 = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled(oOverlay) {
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1;
				},
				group: "Test2"
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestItem3);
			assert.strictEqual(this.oContextMenuPlugin._aGroupedItems.length, 2, "should add an Item to grouped Items and creating a new group");
		});

		QUnit.test("Adding a Submenu", function(assert) {
			var sId = "I_AM_A_SUBMENU";
			var sSubId1 = "I_am_a_sub_menu_item";
			var sSubId2 = "I_am_another_sub_menu_item";
			var oTestItem = {
				id: sId,
				test: "submenu",
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
		});

		QUnit.test("Adding multiple Submenus", function(assert) {
			var fnHandler = function() {
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

		QUnit.test("Calling _addItemGroupsToMenu", function(assert) {
			var that = this;
			var oTestItem = {
				id: "CTX_ENABLED_BUTTON1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled(vElementOverlays) {
					var aElementOverlays = DtUtil.castArray(vElementOverlays);
					var oElement = aElementOverlays[0].getElement();
					return oElement === that.oButton1;
				},
				group: "Test1"
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestItem);
			var oTestItem2 = {
				id: "CTX_ENABLED_BUTTON3",
				text: "enabled for button 3",
				handler: sinon.spy(),
				enabled(vElementOverlays) {
					var aElementOverlays = DtUtil.castArray(vElementOverlays);
					var oElement = aElementOverlays[0].getElement();
					return oElement === that.oButton1;
				},
				group: "Test2",
				rank: 10
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestItem2);
			this.oContextMenuPlugin._addMenuItemToGroup(oTestItem2);
			this.oContextMenuPlugin._addItemGroupsToMenu(this.oTestEvent, this.oButton2Overlay);
			assert.strictEqual(this.oContextMenuPlugin._aMenuItems.length, 10, "Should have added 2 Items");
			assert.strictEqual(this.oContextMenuPlugin._aMenuItems[this.oContextMenuPlugin._aMenuItems.length - 1].menuItem.submenu.length, 2, "The second group has a submenu with two items");
		});

		QUnit.test("Testing click event when overlay is not selected", function(assert) {
			// regarding the rta directives the second click on an overlay deselects it,
			// if it is not "rename"-able. In this case ContextMenu shouldn't be opened
			var oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			this.oButton2Overlay.setSelected(false);
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
			assert.equal(oOpenStub.callCount, 0, "the open function was not triggered");
		});

		QUnit.test("Testing click event when in design mode", function(assert) {
			sandbox.stub(BaseDesignTime, "isDesignModeEnabled").returns(true);
			var oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "click");
			assert.equal(oOpenStub.callCount, 0, "the open function was not triggered");
		});

		QUnit.test("Testing onKeyUp function opening the expanded contextMenu", function(assert) {
			var oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			var _tempListener = function(oEvent) {
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

		QUnit.test("Testing onKeyUp function opening the compact contextMenu", function(assert) {
			var oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			var _tempListener = function(oEvent) {
				oEvent.keyCode = KeyCodes.ENTER;
				oEvent.shiftKey = false;
				oEvent.altKey = false;
				oEvent.ctrlKey = false;
				this.oContextMenuPlugin._onKeyUp(oEvent);
				assert.equal(oOpenStub.callCount, 1, "the open function was triggered");
			}.bind(this);
			this.oButton2Overlay.setSelected(true);
			this.oButton2Overlay.attachBrowserEvent("keyup", _tempListener, this);
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "keyup");
		});

		QUnit.test("Testing onKeyUp function (ENTER) with other plugin busy", function(assert) {
			var oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			var oCheckPluginLockStub = sandbox.stub(this.oContextMenuPlugin, "_checkForPluginLock").returns(true);
			var _tempListener = function(oEvent) {
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

		QUnit.test("Deregistering an Overlay", function(assert) {
			this.oContextMenuPlugin.deregisterElementOverlay(this.oButton1Overlay);
			assert.ok(true, "should throw no error");
		});

		QUnit.test("calling _checkForPluginLock", function(assert) {
			Device.os.ios = true;
			assert.notOk(this.oContextMenuPlugin._checkForPluginLock(), "then return false for ios devices");
			Device.os.ios = false;
			assert.notOk(this.oContextMenuPlugin._checkForPluginLock(), "then return false when no busy plugin exists");
			sandbox.stub(this.oRenamePlugin, "isBusy").returns(true);
			assert.ok(this.oContextMenuPlugin._checkForPluginLock(), "then return true when busy plugin exists");
		});

		QUnit.test("calling open with plain menu item for overlay", async function(assert) {
			var oPlainMenuItem = { id: "plainItem", group: undefined, submenu: undefined };
			var aPlugins = [
				{
					getMenuItems() {return [oPlainMenuItem];},
					isBusy() {return false;}
				}
			];
			var oAddMenuItemStub = sandbox.stub(this.oContextMenuPlugin, "addMenuItem");
			sandbox.stub(this.oDesignTime, "getPlugins").returns(aPlugins);
			await openContextMenu.call(this, this.oButton1Overlay);
			assert.equal(oAddMenuItemStub.callCount, 1, "then addMenuItems is called");
			assert.equal(oAddMenuItemStub.args[0][0], oPlainMenuItem, "then addMenuItems is called with the plain menu item");
			sandbox.restore();
		});

		QUnit.test("calling open with only submenu items for overlay", function(assert) {
			var oPlainMenuItem = { id: "plainItem", group: undefined, submenu: undefined };
			var oSubMenuItem = { id: "subItem", group: undefined, submenu: [oPlainMenuItem] };
			var aPlugins = [
				{
					getMenuItems() {return [oSubMenuItem];},
					isBusy() {return false;}
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

		QUnit.test("calling _ensureSelection for unselected overlay", function(assert) {
			this.oButton1Overlay.setSelected(false);
			this.oContextMenuPlugin._ensureSelection(this.oButton1Overlay);
			assert.equal(this.oButton1Overlay.getSelected(), true, "then the overlay is selected");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
