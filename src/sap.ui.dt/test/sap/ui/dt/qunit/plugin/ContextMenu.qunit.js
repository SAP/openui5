/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/base/DesignTime",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/events/KeyCodes",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/rename/Rename",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/Device"
], function(
	Button,
	BaseDesignTime,
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
	sinon,
	Device
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	function openContextMenu(oOverlay) {
		return new Promise(function(resolve) {
			this.oContextMenuPlugin.attachEventOnce("openedContextMenu", resolve);
			oOverlay.setSelected(true);
			oOverlay.getDomRef().dispatchEvent(new MouseEvent("contextmenu"));
		}.bind(this));
	}

	QUnit.module("ContextMenu API", {
	 async	beforeEach(assert) {
			const done = assert.async();
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
					const oElement = oOverlay.getElement();
					return oElement.getId();
				},
				handler: sinon.spy()
			};
			this.oMenuEntries.propagatedBtn1 = {
				id: "CTX_PROPAGATED_BUTTON1",
				text: "propagated for button 1",
				propagatingControl: this.oLayout,
				propagatingControlName: "Layout",
				handler: sinon.spy(),
				enabled: true
			};
			this.oMenuEntries.propagatedBtn2 = {
				id: "CTX_PROPAGATED_BUTTON2",
				text: "propagated for button 2",
				propagatingControl: this.oLayout,
				propagatingControlName: "Layout",
				handler: sinon.spy(),
				enabled: function(vElementOverlays) {
					const aElementOverlays = DtUtil.castArray(vElementOverlays);
					const oElement = aElementOverlays[0].getElement();
					return oElement === this.oButton1;
				}.bind(this)
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
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton1Overlay.setSelectable(true);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton2Overlay.setSelectable(true);
				this.oUnselectableOverlay = OverlayRegistry.getOverlay(this.oButtonUnselectable);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
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
		// QUnit.test("When context menu is opened and items are selected", function(assert) {
		// 	const done = assert.async();
		// 	const oItemSelectedStub = sandbox.stub(this.oContextMenuPlugin, "_onItemSelected");
		// 	const oClickedPropagatedItem = this.oMenuEntries.propagatedBtn1;
		// 	this.oContextMenuPlugin.oContextMenuControl.attachEventOnce("closed", function() {
		// 		assert.ok(true, "then the context menu is closed");
		// 	});
		// 	this.oContextMenuPlugin.attachEventOnce("closedContextMenu", function() {
		// 		assert.ok(true, "then the event closedContextMenu is fired");
		// 	});

		// 	const onOpenedContextMenuAgain = function(oEvent) {
		// 		const {oContextMenuControl} = oEvent.getSource();
		// 		// Works only with events on unified menu
		// 		const aItems = oContextMenuControl._getMenu().getItems();

		// 		// triggers menu item handler() on propagated item
		// 		const oPropagatedMenuItem = aItems.find((oItem) => {
		// 			return oItem.getText() === "propagated for button 1";
		// 		});
		// 		QUnitUtils.triggerEvent("click", oPropagatedMenuItem.sId, {});
		// 		assert.ok(
		// 			oClickedPropagatedItem.handler.calledWith([this.oLayoutOverlay]),
		// 			"then the menu item handler was called with the propagating control"
		// 		);

		// 		done();
		// 	};

		// 	const onOpenedContextMenu = function(oEvent) {
		// 		const {oContextMenuControl} = oEvent.getSource();
		// 		// Works only with events on unified menu
		// 		const aItems = oContextMenuControl._getMenu().getItems();
		// 		const oRenameMenuItem = aItems.find((oItem) => {
		// 			return oItem.getText() === "Rename for button 2";
		// 		});

		// 		// triggers menu item handler() on normal item
		// 		QUnitUtils.triggerEvent("click", oRenameMenuItem.sId, {});
		// 		assert.ok(oItemSelectedStub.calledWith([this.oButton2Overlay]), "then the method '_onItemSelected' was called");

		// 		// additional information on menu items
		// 		const oEnabledButton1Item = aItems.find((oItem) => {
		// 			return oItem.getText() === "enabled for button 1";
		// 		});
		// 		const oDisabledButton1Item = aItems.find((oItem) => {
		// 			return oItem.getText() === "disabled for button 1";
		// 		});
		// 		const oButton2SubmenuItem = aItems.find((oItem) => {
		// 			return oItem.getText() === "button 2 submenu";
		// 		});
		// 		const oFirstSubmenuItem = oButton2SubmenuItem?.getSubmenu()?.getItems()?.[0];
		// 		assert.strictEqual(
		// 			oEnabledButton1Item.getEndContent()[0].getItems()[0].getTooltip_Text(),
		// 			"AdditionalInfo_enabledBtn1",
		// 			"then the additional info on the enabled item is set correctly"
		// 		);
		// 		assert.strictEqual(
		// 			oDisabledButton1Item.getEndContent()[0].getItems()[0].getTooltip_Text(),
		// 			"AdditionalInfo_disabledBtn1",
		// 			"then the additional info on the disabled item is set correctly"
		// 		);
		// 		assert.strictEqual(
		// 			oFirstSubmenuItem.getEndContent()[0].getItems()[0].getTooltip_Text(),
		// 			"AdditionalInfo_button2_sub01",
		// 			"then the additional info on the first submenu item is set correctly"
		// 		);

		// 		this.oContextMenuPlugin.attachEventOnce("openedContextMenu", onOpenedContextMenuAgain.bind(this));

		// 		this.oButton2Overlay.setSelected(true);
		// 		this.oButton2Overlay.getDomRef().dispatchEvent(new MouseEvent("contextmenu"));
		// 		this.clock.tick(50);
		// 	};
		// 	this.oContextMenuPlugin.attachEventOnce("openedContextMenu", onOpenedContextMenu.bind(this));

		// 	sandbox.stub(this.oRenamePlugin, "getMenuItems")
		// 	.callThrough()
		// 	.withArgs([this.oButton2Overlay])
		// 	.returns([
		// 		{
		// 			id: "CTX_RENAME_BUTTON_2",
		// 			text: "Rename for button 2",
		// 			rank: 999,
		// 			handler: oItemSelectedStub
		// 		},
		// 		{
		// 			id: "CTX_BUTTON2_SUB",
		// 			text: "button 2 submenu",
		// 			rank: 888,
		// 			handler: oItemSelectedStub
		// 		}
		// 	]);

		// 	this.oButton2Overlay.setSelected(true);
		// 	var oTargetDomRef = this.oButton2Overlay.getDomRef();
		// 	oTargetDomRef.dispatchEvent(new MouseEvent("contextmenu"));
		// 	this.clock.tick(50);
		// });

		QUnit.test("Calling method 'open' after adding a not persisted menu item", function(assert) {
			const oTestItem1 = {
				id: "CTX_TEST_NOT_PERSISTED",
				text: "test for not persisted item",
				handler: sinon.spy(),
				enabled: true,
				group: "Test1"
			};
			this.oContextMenuPlugin.addMenuItem(oTestItem1, true);
			assert.strictEqual(this.oContextMenuPlugin._aMenuItems.length, 11, "there are 9 items in the array for the menu items");
			this.oContextMenuPlugin.open(this.oButton1Overlay, false, {});
			assert.strictEqual(this.oContextMenuPlugin._aMenuItems.length, 10, "there is 1 item less in the array for the menu items");
		});

		// QUnit.test("Calling method 'open' after adding a propagated menu item", function(assert) {
		// 	const done = assert.async();
		// 	this.oContextMenuPlugin.attachEventOnce("openedContextMenu", function(oEvent) {
		// 		const {oContextMenuControl} = oEvent.getSource();
		// 		// Works only with events on unified menu
		// 		const aItems = oContextMenuControl._getMenu().getItems();
		// 		const oMenuItem1 = aItems[aItems.length - 2];
		// 		const oMenuItem2 = aItems[aItems.length - 1];
		// 		assert.ok(oMenuItem1.getStartsSection(), "Propagated Item is in a new section");
		// 		assert.strictEqual(
		// 			oMenuItem1.getEndContent()[0].getItems()[0].getHtmlText(),
		// 			"<strong>Layout</strong>",
		// 			"and has the correct end content"
		// 		);
		// 		assert.notOk(oMenuItem2.getStartsSection(), "Propagated Item is in the same section");
		// 		assert.strictEqual(
		// 			oMenuItem2.getEndContent()[0].getItems()[0].getHtmlText(),
		// 			"<strong>Layout</strong>",
		// 			"and has the correct end content"
		// 		);
		// 		done();
		// 	});
		// 	this.oContextMenuPlugin.open(this.oButton1Overlay, false, {});
		// });

		// QUnit.test("Calling method '_addMenuItemToGroup'", function(assert) {
		// 	const that = this;
		// 	const oTestItem = {
		// 		id: "CTX_ENABLED_BUTTON1",
		// 		text: "enabled for button 1",
		// 		handler: sinon.spy(),
		// 		enabled(oOverlay) {
		// 			const oElement = oOverlay.getElement();
		// 			return oElement === that.oButton1;
		// 		},
		// 		group: "Test1"
		// 	};
		// 	this.oContextMenuPlugin._addMenuItemToGroup(oTestItem);
		// 	assert.strictEqual(
		// 		this.oContextMenuPlugin._aGroupedItems.length,
		// 		1,
		// 		"should add an Item to grouped Items"
		// 	);
		// 	const oTestItem2 = {
		// 		id: "CTX_ENABLED_BUTTON1",
		// 		text: "enabled for button 1",
		// 		handler: sinon.spy(),
		// 		enabled(oOverlay) {
		// 			const oElement = oOverlay.getElement();
		// 			return oElement === that.oButton1;
		// 		},
		// 		group: "Test1"
		// 	};
		// 	this.oContextMenuPlugin._addMenuItemToGroup(oTestItem2);
		// 	assert.strictEqual(
		// 		this.oContextMenuPlugin._aGroupedItems.length,
		// 		1,
		// 		"should add an Item to grouped Items without creating a new group"
		// 	);
		// 	const oTestItem3 = {
		// 		id: "CTX_ENABLED_BUTTON1",
		// 		text: "enabled for button 1",
		// 		handler: sinon.spy(),
		// 		enabled(oOverlay) {
		// 			const oElement = oOverlay.getElement();
		// 			return oElement === that.oButton1;
		// 		},
		// 		group: "Test2"
		// 	};
		// 	this.oContextMenuPlugin._addMenuItemToGroup(oTestItem3);
		// 	assert.strictEqual(
		// 		this.oContextMenuPlugin._aGroupedItems.length,
		// 		2,
		// 		"should add an Item to grouped Items and creating a new group"
		// 	);
		// });

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

		// QUnit.test("Calling _addItemGroupsToMenu", function(assert) {
		// 	const that = this;
		// 	const oTestItem = {
		// 		id: "CTX_ENABLED_BUTTON1",
		// 		text: "enabled for button 1",
		// 		handler: sinon.spy(),
		// 		enabled(vElementOverlays) {
		// 			const aElementOverlays = DtUtil.castArray(vElementOverlays);
		// 			const oElement = aElementOverlays[0].getElement();
		// 			return oElement === that.oButton1;
		// 		},
		// 		group: "Test1"
		// 	};
		// 	this.oContextMenuPlugin._addMenuItemToGroup(oTestItem);
		// 	const oTestItem2 = {
		// 		id: "CTX_ENABLED_BUTTON3",
		// 		text: "enabled for button 3",
		// 		handler: sinon.spy(),
		// 		enabled(vElementOverlays) {
		// 			const aElementOverlays = DtUtil.castArray(vElementOverlays);
		// 			const oElement = aElementOverlays[0].getElement();
		// 			return oElement === that.oButton1;
		// 		},
		// 		group: "Test2",
		// 		rank: 10
		// 	};
		// 	this.oContextMenuPlugin._addMenuItemToGroup(oTestItem2);
		// 	this.oContextMenuPlugin._addMenuItemToGroup(oTestItem2);
		// 	this.oContextMenuPlugin._addItemGroupsToMenu(this.oTestEvent, this.oButton2Overlay);
		// 	assert.strictEqual(
		// 		this.oContextMenuPlugin._aMenuItems.length,
		// 		12,
		// 		"Should have added 2 Items"
		// 	);
		// 	assert.strictEqual(
		// 		this.oContextMenuPlugin._aMenuItems[this.oContextMenuPlugin._aMenuItems.length - 1].menuItem.submenu.length,
		// 		2,
		// 		"The second group has a submenu with two items"
		// 	);
		// });

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

		QUnit.test("Testing onKeyUp function opening the expanded contextMenu", function(assert) {
			const oOpenSpy = sandbox.spy(this.oContextMenuPlugin, "open");
			const _tempListener = function() {
				assert.equal(oOpenSpy.callCount, 1, "the open function was triggered");
			};
			this.oButton2Overlay.setSelected(true);
			this.oButton2Overlay.attachBrowserEvent("keyup", _tempListener, this);
			const oTargetDomRef = this.oButton2Overlay.getDomRef();
			const oKeyUpEvent = new KeyboardEvent("keyup", {
				keyCode: KeyCodes.F10,
				which: KeyCodes.F10,
				shiftKey: true
			});
			oTargetDomRef.dispatchEvent(oKeyUpEvent);
		});

		QUnit.test("Testing onKeyUp function opening the compact contextMenu", function(assert) {
			const oOpenSpy = sandbox.spy(this.oContextMenuPlugin, "open");
			const _tempListener = function() {
				assert.equal(oOpenSpy.callCount, 1, "the open function was triggered");
			};
			this.oButton2Overlay.setSelected(true);
			this.oButton2Overlay.attachBrowserEvent("keyup", _tempListener, this);
			const oTargetDomRef = this.oButton2Overlay.getDomRef();
			const oKeyUpEvent = new KeyboardEvent("keyup", {
				keyCode: KeyCodes.ENTER,
				which: KeyCodes.ENTER
			});
			oTargetDomRef.dispatchEvent(oKeyUpEvent);
			QUnitUtils.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "keyup");
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
			const oPlainMenuItem = { id: "plainItem", group: undefined, submenu: undefined };
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
			sandbox.restore();
		});

		QUnit.test("calling open with only submenu items for overlay", function(assert) {
			const oPlainMenuItem = { id: "plainItem", group: undefined, submenu: undefined };
			const oSubMenuItem = { id: "subItem", group: undefined, submenu: [oPlainMenuItem] };
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
				sandbox.restore();
			});
		});

		QUnit.test("calling _ensureSelection for unselected overlay", function(assert) {
			this.oButton1Overlay.setSelected(false);
			this.oContextMenuPlugin._ensureSelection(this.oButton1Overlay);
			assert.equal(this.oButton1Overlay.getSelected(), true, "then the overlay is selected");
		});

		QUnit.test("calling open with propagated action info", async function(assert) {
			const oPlainMenuItem = { id: "plainItem", group: undefined, submenu: undefined };
			const oPropagatedMenuItem = { id: "ItemForPropagatedAction", group: undefined, submenu: undefined };
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
							propagatingControlName: "Layout"
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
			sandbox.restore();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});