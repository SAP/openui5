/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/base/DesignTime",
	"sap/ui/Device",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/events/KeyCodes",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/rename/Rename",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	BaseDesignTime,
	Device,
	ContextMenuPlugin,
	DesignTime,
	Overlay,
	OverlayRegistry,
	DtUtil,
	KeyCodes,
	VerticalLayout,
	nextUIUpdate,
	QUnitUtils,
	CommandFactory,
	RenamePlugin,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	function openContextMenu(oOverlay, oEvent, oFocusOverlay) {
		return new Promise(function(resolve) {
			this.oContextMenuPlugin.attachEventOnce("openedContextMenu", resolve);
			const oTriggerEvent = oEvent || new MouseEvent("contextmenu");
			oOverlay.setSelected(true);
			oOverlay.getDomRef().dispatchEvent(oTriggerEvent);
			if (oFocusOverlay) {
				oFocusOverlay.focus();
			}
		}.bind(this));
	}

	QUnit.module("ContextMenu API", {
	 async	beforeEach(assert) {
			const done = assert.async();
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2", { text: "Button 2 text" });
			this.oButtonUnselectable = new Button();
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton1, this.oButton2, this.oButtonUnselectable
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oMenuEntries = {};
			this.oPropagatedMenuEntries = {};
			this.oMenuEntries.available = {
				id: "CTX_ALWAYS_THERE",
				text() {
					return "item that is always there";
				},
				handler: sinon.spy()
			};
			this.oMenuEntries.enabledBtn1 = {
				id: "CTX_ENABLED_BUTTON1",
				additionalInfo: "AdditionalInfo_enabledBtn1",
				text: "enabled for button 1",
				handler: sinon.spy(),
				enabled: function(vElementOverlays) {
					const aElementOverlays = DtUtil.castArray(vElementOverlays);
					const oElement = aElementOverlays[0].getElement();
					return oElement === this.oButton1;
				}.bind(this)
			};
			this.oMenuEntries.disabledBtn1 = {
				id: "CTX_DISABLED_BUTTON1",
				additionalInfo: "AdditionalInfo_disabledBtn1",
				text: "disabled for button 1",
				handler: sinon.spy(),
				enabled: function(vElementOverlays) {
					const aElementOverlays = DtUtil.castArray(vElementOverlays);
					const oElement = aElementOverlays[0].getElement();
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
						additionalInfo: "AdditionalInfo_button2_sub01",
						text: "first submenu icon text",
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

			this.oMenuEntries.dynamicTextItem = {
				id: "CTX_DYNAMIC_TEXT",
				text(oOverlay) {
					const oElement = oOverlay.getElement();
					return oElement.getId();
				},
				handler: sinon.spy()
			};

		 // Propagated Items
		 this.oPropagatedMenuEntries.propagatedBtn1 =	 {
			 id: "CTX_BUTTON2_PROPAGATED_1",
				 text: "first propagated item for button 2",
			 icon: "sap-icon://share",
			 propagatingControl: this.oLayout,
			 propagatingControlName: "VerticalLayout",
			 enabled: true,
			 rank: 888,
			 submenu: undefined,
			 handler: sinon.spy(),
			 additionalInfo: "Additional Info for first propagated item for button 2."
		 };
		 this.oPropagatedMenuEntries.propagatedBtn2 = {
			 id: "CTX_BUTTON2_PROPAGATED_2",
				 text: "2.nd propagated item for button 2",
			 icon: "sap-icon://developer-settings",
			 propagatingControl: this.oLayout,
			 propagatingControlName: "VerticalLayout",
			 enabled: true,
			 rank: 898,
			 submenu: undefined,
			 handler: sinon.spy(),
			 additionalInfo: "Additional Info for 2.nd propagated item for button 2."
		 };
		 this.oPropagatedMenuEntries.propagatedBtn3 = {
			 id: "CTX_BUTTON2_PROPAGATED_3",
			 text: "3.rd propagated item for button 2",
			 icon: "sap-icon://key-user-settings",
			 propagatingControl: this.oButton2,
			 propagatingControlName: "Other Button",
			 enabled: true,
			 rank: 898,
			 submenu: undefined,
			 handler: sinon.spy(),
			 additionalInfo: "Additional Info for 3.rd propagated item for button 2."
		 };
		 this.oPropagatedMenuEntries.propagatedBtn4 = {
			 id: "CTX_BUTTON2_PROPAGATED_4",
			 text: "4.rd propagated item for button 2",
			 icon: "sap-icon://sap-ui5",
			 propagatingControl: this.oButton2,
			 propagatingControlName: "Button",
			 enabled: true,
			 rank: 908,
			 submenu: undefined,
			 handler: sinon.spy()
		 };

			const oCommandFactory = new CommandFactory();
			this.oContextMenuPlugin = new ContextMenuPlugin();
			for (const key in this.oMenuEntries) {
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
			this.oMenuSpy = sinon.spy(this.oContextMenuControl, "openAsContextMenu");
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton1Overlay.setSelectable(true);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton2Overlay.setSelectable(true);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.oContextMenuPlugin.destroy();
		}
	}, function() {
		QUnit.test("When context menu is opened and items are selected", async function(assert) {
			const done = assert.async();
			const oItemSelectedStub = sandbox.stub(this.oContextMenuPlugin, "_onItemSelected");
			const oClickedPropagatedItem = this.oPropagatedMenuEntries.propagatedBtn1;
			this.oContextMenuPlugin.oContextMenuControl.attachEventOnce("closed", function() {
				assert.ok(true, "then the context menu is closed");
			});
			this.oContextMenuPlugin.attachEventOnce("closedContextMenu", function() {
				assert.ok(true, "then the event closedContextMenu is fired");
			});

			const onOpenedContextMenuAgain = function(oEvent) {
				const { oContextMenuControl } = oEvent.getSource();
				// check if the Menu is called with correct parameters (Keyboard event)
				const oEventParameter = this.oMenuSpy.getCall(1).args[0];
				const oOpenerRefParameter = this.oMenuSpy.getCall(1).args[1];
				assert.equal(oEventParameter.type, "keyup", "then the sap.m.Menu is called with correct event parameter (Keyboard event)");
				assert.equal(
					oOpenerRefParameter,
					this.oButton2Overlay,
					"then the sap.m.Menu is called with correct openerRef parameter (Keyboard event)"
				);

				const aItems = oContextMenuControl.getItems();
				// triggers menu item handler() on propagated item
				const oPropagatedMenuItem = aItems.find((oItem) => {
					return oItem.getText() === "first propagated item for button 2";
				});
				QUnitUtils.triggerEvent("click", oPropagatedMenuItem.sId, {});
				assert.ok(
					oClickedPropagatedItem.handler.calledWith([this.oLayoutOverlay]),
					"then the menu item handler was called with the propagating control"
				);
				done();
			};

			const onOpenedContextMenu = async function(oEvent) {
				const { oContextMenuControl } = oEvent.getSource();
				// check if the Menu is called with correct parameters (Mouse event)
				const oEventParameter = this.oMenuSpy.getCall(0).args[0];
				const oOpenerRefParameter = this.oMenuSpy.getCall(0).args[1];
				assert.equal(oEventParameter.type, "click", "then the sap.m.Menu is called with correct event parameter (Mouse event)");
				assert.equal(oOpenerRefParameter, undefined, "then the sap.m.Menu is called without openerRef parameter (Mouse event)");

				const aItems = oContextMenuControl.getItems();
				const oRenameMenuItem = aItems.find((oItem) => {
					return oItem.getText() === "Rename for button 2";
				});

				// triggers menu item handler() on normal item
				QUnitUtils.triggerEvent("click", oRenameMenuItem.sId, {});
				assert.ok(oItemSelectedStub.calledWith([this.oButton2Overlay]), "then the method '_onItemSelected' was called");

				// additional information on menu items
				const oEnabledButton1Item = aItems.find((oItem) => {
					return oItem.getText() === "enabled for button 1";
				});
				const oDisabledButton1Item = aItems.find((oItem) => {
					return oItem.getText() === "disabled for button 1";
				});
				const oButton2SubmenuItem = aItems.find((oItem) => {
					return oItem.getText() === "button 2 submenu";
				});
				const oFirstSubmenuItem = oButton2SubmenuItem?.getItems()?.[0];
				assert.strictEqual(
					oEnabledButton1Item.getEndContent()[0].getTooltip(),
					"AdditionalInfo_enabledBtn1",
					"then the additional info on the enabled item is set correctly"
				);
				assert.notOk(
					oEnabledButton1Item.getEndContent()[0].getEnabled(),
					"then the additional info Button is disabled (not clickable)");
				assert.strictEqual(
					oDisabledButton1Item.getEndContent()[0].getTooltip(),
					"AdditionalInfo_disabledBtn1",
					"then the additional info on the disabled item is set correctly"
				);
				assert.strictEqual(
					oFirstSubmenuItem.getEndContent()[0].getTooltip(),
					"AdditionalInfo_button2_sub01",
					"then the additional info on the first submenu item is set correctly"
				);

				this.oContextMenuPlugin.attachEventOnce("openedContextMenu", onOpenedContextMenuAgain.bind(this));
				const oKeyUpEvent = new KeyboardEvent("keyup", {
					keyCode: KeyCodes.ENTER,
					which: KeyCodes.ENTER
				});
				await openContextMenu.call(this, this.oButton2Overlay, oKeyUpEvent);
			};
			this.oContextMenuPlugin.attachEventOnce("openedContextMenu", onOpenedContextMenu.bind(this));

			// propagated menu items are coming from the Rename plugin
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
				this.oPropagatedMenuEntries.propagatedBtn1,
				this.oPropagatedMenuEntries.propagatedBtn2
			]);

			// open the context menu with mouse click
			const oMouseEvent = new MouseEvent("click", {
				clientX: 100,
				clientY: 100
			});
			await openContextMenu.call(this, this.oButton2Overlay, oMouseEvent);
		});

		QUnit.test("Calling method 'open' after adding a not persisted menu item", async function(assert) {
			const oTestItem1 = {
				id: "CTX_TEST_NOT_PERSISTED",
				text: "test for not persisted item",
				handler: sinon.spy(),
				enabled: true
			};
			// prevent adding menu items from rename plugin
			sandbox.stub(this.oRenamePlugin, "getMenuItems")
			.callThrough()
			.withArgs([this.oButton1Overlay])
			.returns([]);
			this.oContextMenuPlugin.addMenuItem(oTestItem1, true);
			assert.strictEqual(this.oContextMenuPlugin._aMenuItems.length, 7, "there are 7 items in the array for the menu items");
			await openContextMenu.call(this, this.oButton1Overlay);
			assert.strictEqual(this.oContextMenuPlugin._aMenuItems.length, 6, "there is 1 item less in the array for the menu items");
		});

		QUnit.test("Calling method 'open' after adding propagated menu items (with two propagated controls)", async function(assert) {
			const done = assert.async();
			const oItemSelectedStub = sandbox.stub(this.oContextMenuPlugin, "_onItemSelected");
			sandbox.stub(this.oRenamePlugin, "getMenuItems")
			.callThrough()
			.withArgs([this.oButton1Overlay])
			.returns([
				{
					id: "CTX_RENAME_BUTTON_1",
					text: "Rename for button 1",
					rank: 999,
					handler: oItemSelectedStub
				},
				this.oPropagatedMenuEntries.propagatedBtn1,
				this.oPropagatedMenuEntries.propagatedBtn2,
				this.oPropagatedMenuEntries.propagatedBtn3
			]);
			this.oContextMenuPlugin.attachEventOnce("openedContextMenu", function(oEvent) {
				const { oContextMenuControl } = oEvent.getSource();
				const aItems = oContextMenuControl.getItems();
				const oRenameMenuItem = aItems.find((oItem) => {
					return oItem.getText() === "Rename for button 1";
				});
				const oExtendedMenuTitleItem = aItems.find((oItem) => {
					return oItem.getId().endsWith("CTX_EXTENDED_MENU_TITLE");
				});
				const aExtendedMenuControlNameItems = aItems.filter((oItem) => {
					return oItem.getId().includes("CTX_PROPAGATED_CONTROL_NAME");
				});

				assert.strictEqual(
					aItems.length,
					14,
					"there are 14 items in the context menu"
				);
				assert.strictEqual(
					aItems.indexOf(oRenameMenuItem),
					7,
					"the Rename item is at pos 8 in the menu (last non-propagated item)"
				);
				assert.strictEqual(
					oExtendedMenuTitleItem.getText(),
					"Extended Actions",
					"the Extended Actions title item is in the menu"
				);
				assert.strictEqual(
					aItems.indexOf(oExtendedMenuTitleItem),
					8,
					"the Extended Actions title is at pos 9 in the menu (first propagated item)"
				);
				assert.ok(
					oExtendedMenuTitleItem.getTooltip(),
					"the Extended Menu Title item should have a tooltip"
				);
				assert.strictEqual(
					aExtendedMenuControlNameItems.length,
					2,
					"there are 2 propagated control name items in the menu"
				);
				assert.strictEqual(
					aExtendedMenuControlNameItems[0].getText(),
					"VerticalLayout",
					"the first propagated control name is correct (VerticalLayout)"
				);
				assert.strictEqual(
					aExtendedMenuControlNameItems[1].getText(),
					"Other Button",
					"the 2.nd propagated control name is correct (Other Button)"
				);
				assert.strictEqual(
					aItems.indexOf(aExtendedMenuControlNameItems[0]),
					9,
					"the first propagated control name is at pos 10 in the menu (after the title item)"
				);
				assert.strictEqual(
					aItems.indexOf(aExtendedMenuControlNameItems[1]),
					12,
					"the 2.nd propagated control name is at pos 13 in the menu (after the actions of the first propagated control)"
				);
				done();
			});
			await openContextMenu.call(this, this.oButton1Overlay);
		});

		QUnit.test("Calling method 'open' after adding propagated menu items (with same name as selected control)", async function(assert) {
			const done = assert.async();
			const oItemSelectedStub = sandbox.stub(this.oContextMenuPlugin, "_onItemSelected");
			sandbox.stub(this.oRenamePlugin, "getMenuItems")
			.callThrough()
			.withArgs([this.oButton1Overlay])
			.returns([
				{
					id: "CTX_RENAME_BUTTON_1",
					text: "Rename for button 1",
					rank: 999,
					handler: oItemSelectedStub
				},
				this.oPropagatedMenuEntries.propagatedBtn4
			]);
			this.oContextMenuPlugin.attachEventOnce("openedContextMenu", function(oEvent) {
				const { oContextMenuControl } = oEvent.getSource();
				const aItems = oContextMenuControl.getItems();
				const oRenameMenuItem = aItems.find((oItem) => {
					return oItem.getText() === "Rename for button 1";
				});
				const oExtendedMenuTitleItem = aItems.find((oItem) => {
					return oItem.getId().endsWith("CTX_EXTENDED_MENU_TITLE");
				});
				const aExtendedMenuControlNameItems = aItems.filter((oItem) => {
					return oItem.getId().includes("CTX_PROPAGATED_CONTROL_NAME");
				});
				assert.strictEqual(
					aItems.length,
					9,
					"there are 9 items in the context menu"
				);
				assert.strictEqual(
					aItems.indexOf(oRenameMenuItem),
					7,
					"the Rename item is at pos 8 in the menu (last non-propagated item)"
				);
				assert.notOk(
					oExtendedMenuTitleItem,
					"the Extended Actions title item is in the menu"
				);
				assert.strictEqual(
					aExtendedMenuControlNameItems.length,
					0,
					"there are no propagated control name items in the menu"
				);
				assert.strictEqual(
					aItems.pop().getKey(),
					"CTX_BUTTON2_PROPAGATED_4",
					"the only propagated item is at the end of the menu"
				);
				done();
			});
			await openContextMenu.call(this, this.oButton1Overlay);
		});

		QUnit.test("Adding propagated menu items with two propagated controls, one with same name as selected control", async function(assert) {
			const done = assert.async();
			const oItemSelectedStub = sandbox.stub(this.oContextMenuPlugin, "_onItemSelected");
			sandbox.stub(this.oRenamePlugin, "getMenuItems")
			.callThrough()
			.withArgs([this.oButton1Overlay])
			.returns([
				{
					id: "CTX_RENAME_BUTTON_1",
					text: "Rename for button 1",
					rank: 999,
					handler: oItemSelectedStub
				},
				this.oPropagatedMenuEntries.propagatedBtn1,
				this.oPropagatedMenuEntries.propagatedBtn2,
				this.oPropagatedMenuEntries.propagatedBtn4
			]);
			this.oContextMenuPlugin.attachEventOnce("openedContextMenu", function(oEvent) {
				const { oContextMenuControl } = oEvent.getSource();
				const aItems = oContextMenuControl.getItems();
				const oRenameMenuItem = aItems.find((oItem) => {
					return oItem.getText() === "Rename for button 1";
				});
				const oExtendedMenuTitleItem = aItems.find((oItem) => {
					return oItem.getId().endsWith("CTX_EXTENDED_MENU_TITLE");
				});
				const aExtendedMenuControlNameItems = aItems.filter((oItem) => {
					return oItem.getId().includes("CTX_PROPAGATED_CONTROL_NAME");
				});
				assert.strictEqual(
					aItems.length,
					13,
					"there are 13 items in the context menu"
				);
				assert.strictEqual(
					aItems.indexOf(oRenameMenuItem),
					7,
					"the Rename item is at pos 8 in the menu (last non-propagated item)"
				);
				assert.strictEqual(
					oExtendedMenuTitleItem.getText(),
					"Extended Actions",
					"the Extended Actions title item is in the menu"
				);
				assert.strictEqual(
					aItems.indexOf(oExtendedMenuTitleItem),
					9,
					"the Extended Actions title is at pos 10 in the menu (first propagated item)"
				);
				assert.ok(
					oExtendedMenuTitleItem.getTooltip(),
					"the Extended Menu Title item should have a tooltip"
				);
				assert.strictEqual(
					aExtendedMenuControlNameItems.length,
					1,
					"there is 1 propagated control name item in the menu"
				);
				assert.strictEqual(
					aExtendedMenuControlNameItems[0].getText(),
					"VerticalLayout",
					"the first propagated control name is correct (VerticalLayout)"
				);
				assert.strictEqual(
					aItems.indexOf(aExtendedMenuControlNameItems[0]),
					10,
					"the first propagated control name is at pos 11 in the menu (after the title item)"
				);
				assert.strictEqual(
					aItems[8].getKey(),
					"CTX_BUTTON2_PROPAGATED_4",
					"the propagated item with same name as selected control is at pos 9 in the menu"
				);
				done();
			});
			await openContextMenu.call(this, this.oButton1Overlay);
		});

		QUnit.test("Calling method 'open' after adding propagated menu items in developer mode", async function(assert) {
			// fake developer mode
			sandbox.stub(BaseDesignTime, "isDesignModeEnabled").returns(true);
			const done = assert.async();
			const oItemSelectedStub = sandbox.stub(this.oContextMenuPlugin, "_onItemSelected");
			sandbox.stub(this.oRenamePlugin, "getMenuItems")
			.callThrough()
			.withArgs([this.oButton1Overlay])
			.returns([
				{
					id: "CTX_RENAME_BUTTON_1",
					text: "Rename for button 1",
					rank: 999,
					handler: oItemSelectedStub
				},
				this.oPropagatedMenuEntries.propagatedBtn1
			]);
			this.oContextMenuPlugin.attachEventOnce("openedContextMenu", function(oEvent) {
				const { oContextMenuControl } = oEvent.getSource();
				const aItems = oContextMenuControl.getItems();
				const oControlTitleItem = aItems.find((oItem) => {
					return oItem.getId().endsWith("CTX_CONTROL_NAME");
				});
				const aExtendedMenuControlNameItems = aItems.filter((oItem) => {
					return oItem.getId().includes("CTX_PROPAGATED_CONTROL_NAME");
				});
				assert.strictEqual(
					oControlTitleItem.getText(),
					"Button",
					"the control name is correct (Button)"
				);
				assert.strictEqual(
					aExtendedMenuControlNameItems[0].getText(),
					"VerticalLayout",
					"the propagated control name is correct (VerticalLayout)"
				);
				done();
			});
			await openContextMenu.call(this, this.oButton1Overlay);
		});

		QUnit.test("Calling method '_addMenuItemToGroup'", function(assert) {
			const oTestItem =	 {
				id: "CTX_TEST_ITEM_GROUP",
				text: "first test item for group",
				icon: "sap-icon://share",
				propagatingControl: this.oLayout,
				propagatingControlName: "VerticalLayout",
				enabled: true,
				rank: 888,
				submenu: undefined,
				handler: sinon.spy(),
				additionalInfo: "Additional Info for first test item for group."
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestItem);
			assert.strictEqual(
				this.oContextMenuPlugin._aGroupedItems.length,
				1,
				"should add an Item to grouped Items"
			);
			const oTestItem2 =	 {
				id: "CTX_TEST_ITEM_GROUP2",
				text: "2.nd test item for group",
				icon: "sap-icon://share",
				propagatingControl: this.oLayout,
				propagatingControlName: "VerticalLayout",
				enabled: true,
				rank: 899,
				submenu: undefined,
				handler: sinon.spy()
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestItem2);
			assert.strictEqual(
				this.oContextMenuPlugin._aGroupedItems.length,
				1,
				"should add an Item to grouped Items without creating a new group"
			);
			const oTestItem3 =	 {
				id: "CTX_TEST_ITEM_GROUP3",
				text: "3.rd test item for group",
				icon: "sap-icon://share",
				propagatingControl: this.oButton1,
				propagatingControlName: "Button",
				enabled: true,
				rank: 901,
				submenu: undefined,
				handler: sinon.spy()
			};
			this.oContextMenuPlugin._addMenuItemToGroup(oTestItem3);
			assert.strictEqual(
				this.oContextMenuPlugin._aGroupedItems.length,
				2,
				"should add an Item to grouped Items and creating a new group"
			);
		});

		QUnit.test("Adding a Submenu", function(assert) {
			const sId = "I_AM_A_SUBMENU";
			const sSubId1 = "I_am_a_sub_menu_item";
			const sSubId2 = "I_am_another_sub_menu_item";
			const oTestItem = {
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
			const fnHandler = function() {
				return undefined;
			};
			const sId0 = "I_AM_A_SUBMENU";
			const sSubId0 = "I_am_in_sub_menu_0";
			const sSubId1 = "I_am_also_in_sub_menu_0";
			const sId1 = "I_AM_ANOTHER_SUBMENU";
			const sSubId2 = "I_am_in_sub_menu_1";
			const sSubId3 = "I_am_also_in_sub_menu_1";
			const oTestItem0 = {
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
			const oTestItem1 = {
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
			assert.strictEqual(
				this.oContextMenuPlugin._aSubMenus.length,
				2,
				"there should be two submenu"
			);
			assert.strictEqual(
				this.oContextMenuPlugin._aSubMenus[0].sSubMenuId,
				sId0,
				"should add submenu 0"
			);
			assert.strictEqual(
				this.oContextMenuPlugin._aSubMenus[0].aSubMenuItems[0].id,
				sSubId0,
				"should add submenu item 0 to sub menu 0"
			);
			assert.strictEqual(
				this.oContextMenuPlugin._aSubMenus[0].aSubMenuItems[1].id,
				sSubId1,
				"should add submenu item 1 to sub menu 0"
			);
			assert.strictEqual(
				this.oContextMenuPlugin._aSubMenus[1].sSubMenuId,
				sId1,
				"should add submenu 1"
			);
			assert.strictEqual(
				this.oContextMenuPlugin._aSubMenus[1].aSubMenuItems[0].id,
				sSubId2,
				"should add submenu item 2 to sub menu 1"
			);
			assert.strictEqual(
				this.oContextMenuPlugin._aSubMenus[1].aSubMenuItems[1].id,
				sSubId3,
				"should add submenu item 3 to sub menu 1"
			);
		});

		QUnit.test("Testing click event when overlay is not selected", function(assert) {
			// regarding the rta directives the second click on an overlay deselects it,
			// if it is not "rename"-able. In this case ContextMenu shouldn't be opened
			const oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			this.oButton2Overlay.setSelected(false);
			this.oButton2Overlay.getDomRef().dispatchEvent(new MouseEvent("click"));
			assert.equal(oOpenStub.callCount, 0, "the open function was not triggered");
		});

		QUnit.test("Testing click event when in design mode", function(assert) {
			sandbox.stub(BaseDesignTime, "isDesignModeEnabled").returns(true);
			const oOpenStub = sandbox.stub(this.oContextMenuPlugin, "open");
			this.oButton2Overlay.getDomRef().dispatchEvent(new MouseEvent("click"));
			assert.equal(oOpenStub.callCount, 0, "the open function was not triggered");
		});

		QUnit.test("Testing onKeyUp function with Shift+F10 for opening the contextMenu", async function(assert) {
			const oOpenSpy = sandbox.spy(this.oContextMenuPlugin, "open");
			const _tempListener = function() {
				assert.equal(oOpenSpy.callCount, 1, "the open function was triggered");
			};
			this.oButton2Overlay.attachBrowserEvent("keyup", _tempListener, this);
			const oKeyUpEvent = new KeyboardEvent("keyup", {
				keyCode: KeyCodes.F10,
				which: KeyCodes.F10,
				shiftKey: true
			});
			await openContextMenu.call(this, this.oButton2Overlay, oKeyUpEvent);
		});

		QUnit.test("Testing onKeyUp function with ENTER for opening the contextMenu", async function(assert) {
			const oOpenSpy = sandbox.spy(this.oContextMenuPlugin, "open");
			const _tempListener = function() {
				assert.equal(oOpenSpy.callCount, 1, "the open function was triggered");
			};
			this.oButton2Overlay.attachBrowserEvent("keyup", _tempListener, this);
			const oKeyUpEvent = new KeyboardEvent("keyup", {
				keyCode: KeyCodes.ENTER,
				which: KeyCodes.ENTER
			});
			await openContextMenu.call(this, this.oButton2Overlay, oKeyUpEvent);
		});

		QUnit.test("Testing onKeyUp function with SPACE for opening the contextMenu", async function(assert) {
			const oOpenSpy = sandbox.spy(this.oContextMenuPlugin, "open");
			const _tempListener = function() {
				assert.equal(oOpenSpy.callCount, 1, "the open function was triggered");
			};
			this.oButton2Overlay.attachBrowserEvent("keyup", _tempListener, this);
			const oKeyUpEvent = new KeyboardEvent("keyup", {
				keyCode: KeyCodes.SPACE,
				which: KeyCodes.SPACE
			});
			await openContextMenu.call(this, this.oButton2Overlay, oKeyUpEvent);
		});

		QUnit.test("Testing onKeyUp function with CMD+ENTER on macintosh (contextMenu must not open)", function(assert) {
			sandbox.stub(Device, "os").value({ ...Device.os, macintosh: true });
			const oOpenSpy = sandbox.spy(this.oContextMenuPlugin, "open");
			const oKeyUpEvent = new KeyboardEvent("keyup", {
				keyCode: KeyCodes.ENTER,
				which: KeyCodes.ENTER,
				metaKey: true
			});
			this.oButton2Overlay.getDomRef().dispatchEvent(oKeyUpEvent);
			// on macintosh the meta-key is the equivalent of ctrl-key, so the menu must stay closed
			assert.strictEqual(oOpenSpy.callCount, 0, "the open function was not triggered");
		});

		QUnit.test("Testing onKeyUp function with ENTER on macintosh (contextMenu opens)", async function(assert) {
			sandbox.stub(Device, "os").value({ ...Device.os, macintosh: true });
			const oOpenSpy = sandbox.spy(this.oContextMenuPlugin, "open");
			const fnTempListener = () => {
				assert.strictEqual(oOpenSpy.callCount, 1, "the open function was triggered");
			};
			this.oButton2Overlay.attachBrowserEvent("keyup", fnTempListener, this);
			const oKeyUpEvent = new KeyboardEvent("keyup", {
				keyCode: KeyCodes.ENTER,
				which: KeyCodes.ENTER
			});
			await openContextMenu.call(this, this.oButton2Overlay, oKeyUpEvent);
		});

		QUnit.test("Testing onKeyUp function (ENTER) with other plugin busy", function(assert) {
			const oOpenSpy = sandbox.spy(this.oContextMenuPlugin, "open");
			const oCheckPluginLockStub = sandbox.stub(this.oContextMenuPlugin, "_checkForPluginLock").returns(true);
			const _tempListener = function() {
				assert.equal(oOpenSpy.callCount, 0, "the open function was not triggered");
				oCheckPluginLockStub.reset();
			};
			this.oButton2Overlay.attachBrowserEvent("keyup", _tempListener, this);
			const oTargetDomRef = this.oButton2Overlay.getDomRef();
			const oKeyUpEvent = new KeyboardEvent("keyup", {
				keyCode: KeyCodes.ENTER,
				which: KeyCodes.ENTER
			});
			oTargetDomRef.dispatchEvent(oKeyUpEvent);
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
			const oPlainMenuItem = { id: "plainItem", submenu: undefined };
			const aPlugins = [
				{
					getMenuItems() {return [oPlainMenuItem];},
					isBusy() {return false;},
					getPropagatedActionInfo() {return null;}
				}
			];
			const oAddMenuItemStub = sandbox.stub(this.oContextMenuPlugin, "addMenuItem");
			sandbox.stub(this.oDesignTime, "getPlugins").returns(aPlugins);
			await openContextMenu.call(this, this.oButton1Overlay);
			assert.equal(oAddMenuItemStub.callCount, 1, "then addMenuItems is called");
			assert.equal(oAddMenuItemStub.args[0][0], oPlainMenuItem, "then addMenuItems is called with the plain menu item");
		});

		QUnit.test("calling open with only submenu items for overlay", function(assert) {
			const oPlainMenuItem = { id: "plainItem", submenu: undefined };
			const oSubMenuItem = { id: "subItem", submenu: [oPlainMenuItem] };
			const aPlugins = [
				{
					getMenuItems() {return [oSubMenuItem];},
					isBusy() {return false;},
					getPropagatedActionInfo() {return null;}
				}
			];
			const oAddSubMenuStub = sandbox.stub(this.oContextMenuPlugin, "_addSubMenu");
			sandbox.stub(this.oDesignTime, "getPlugins").returns(aPlugins);
			return openContextMenu.call(this, this.oButton1Overlay).then(function() {
				assert.equal(oAddSubMenuStub.callCount, 1, "then _addSubMenu is called");
				assert.equal(oAddSubMenuStub.args[0][0], oSubMenuItem, "then _addMenuItemToGroup is called with the sub menu item");
			});
		});

		QUnit.test("calling _ensureSelection for unselected overlay", function(assert) {
			this.oButton1Overlay.setSelected(false);
			this.oContextMenuPlugin._ensureSelection(this.oButton1Overlay);
			assert.equal(this.oButton1Overlay.getSelected(), true, "then the overlay is selected");
		});

		QUnit.test("calling open with propagated action info", async function(assert) {
			const oPlainMenuItem = { id: "plainItem", submenu: undefined };
			const oPropagatedMenuItem = { id: "ItemForPropagatedAction", submenu: undefined };
			const aPlugins = [
				{
					getMenuItems: (aOverlays) => {
						if (aOverlays[0].getElement() === this.oButton1) {
							return [oPlainMenuItem];
						}
						if (aOverlays[0].getElement() === this.oLayout) {
							return [oPropagatedMenuItem];
						}
						return null;
					},
					isBusy() {return false;},
					getPropagatedActionInfo: () => {
						return {
							propagatingControl: this.oLayout,
							propagatingControlName: "VerticalLayout"
						};
					}
				}
			];
			const oAddMenuItemStub = sandbox.stub(this.oContextMenuPlugin, "addMenuItem");
			sandbox.stub(this.oDesignTime, "getPlugins").returns(aPlugins);
			await openContextMenu.call(this, this.oButton1Overlay);
			assert.equal(oAddMenuItemStub.callCount, 2, "then addMenuItems is called for both the plain item and the propagated one");
			assert.equal(oAddMenuItemStub.args[0][0], oPlainMenuItem, "then addMenuItems is called with the plain menu item");
			assert.equal(oAddMenuItemStub.args[1][0], oPropagatedMenuItem, "then addMenuItems is called with the propagated menu item");
		});

		QUnit.test("When context menu is opened with mouse and closed, but the clicked element is not the overlay responsible for the menu", async function(assert) {
			// open the context menu with mouse click
			const oMouseEvent = new MouseEvent("click", {
				clientX: 100,
				clientY: 100
			});
			// set the focus to another overlay before opening the context menu (parameter this.oButton1Overlay)
			await openContextMenu.call(this, this.oButton2Overlay, oMouseEvent, this.oButton1Overlay);
			const oMenu = this.oContextMenuPlugin.oContextMenuControl;
			oMenu.close();
			assert.ok(this.oButton2Overlay.hasFocus(), "then the focus is back on the overlay");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});