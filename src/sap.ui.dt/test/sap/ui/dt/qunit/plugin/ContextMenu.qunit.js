/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/Utils",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	// should be last
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
], 	function(
	Utils,
	ContextMenu,
	OverlayRegistry,
	DesignTime,
	sinon
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given 2 buttons and designtime with context menu, tailored to these buttons...", {
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

			this.oLayout.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oMenuEntries = {};
			this.oMenuEntries.available = {
				id : "CTX_ALWAYS_THERE",
				text : "item that is always there",
				handler : sinon.spy()
			};
			this.oMenuEntries.enabledBtn1 = {
				id : "CTX_ENABLED_BUTTON1",
				text : "enabled for button 1",
				handler : sinon.spy(),
				enabled : function(oOverlay){
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1;
				}
			};
			this.oMenuEntries.disabledBtn1 = {
				id : "CTX_DISABLED_BUTTON1",
				text : "disabled for button 1",
				handler : sinon.spy(),
				available : function(oOverlay){
					var oElement = oOverlay.getElement();
					return oElement === that.oButton1 || oElement === that.oButton2;
				},
				enabled : function(oOverlay){
					var oElement = oOverlay.getElement();
					return oElement !== that.oButton1;
				}
			};
			this.oMenuEntries.onlyBtn2 = {
				id : "CTX_ONLY_BUTTON2",
				text : "only shown for button 2",
				handler : sinon.spy(),
				available : function(oOverlay){
					var oElement = oOverlay.getElement();
					return oElement === that.oButton2;
				}
			};
			this.oMenuEntries.alwaysStartSection = {
				id : "CTX_START_SECTION",
				text : "starts new section ",
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
					var oElement = oOverlay.getElement();
					return oElement.getId();
				},
				handler : sinon.spy()
			};

			var	oMockedAppComponent = {
					getModel: function () { return {}; }
				},
				aVariantItems = [
					{id: "variant0", text: "titleVariant0", enabled: true},
					{id: "variant1", text: "titleVariant1", enabled: false}
				];
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

			this.oMenuEntries.startSubMenu = {
				id : "CTX_VARIANT_SWITCH_SUBMENU",
				text : "CTX_VARIANT_SWITCH",
				/* handler for submenu items */
				handler: sinon.spy(),
				available : function() { return true; },
				enabled : function() { return true; },
				submenu : aVariantItems
			};

			this.oContextMenuPlugin = new ContextMenu();
			for (var key in this.oMenuEntries){
				this.oContextMenuPlugin.addMenuItem(this.oMenuEntries[key]);
			}

			var done = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				],
				plugins: [
					this.oContextMenuPlugin
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
			sandbox.restore();
		}
	});

	QUnit.test("when context menu is opened (via keyboard) for button 1, then ...", function(assert) {
		this.oButton1Overlay.focus();
		sap.ui.test.qunit.triggerKeydown(this.oButton1Overlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);
		var oContextMenu = this.oContextMenuPlugin._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 7, " and 7 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data().id, this.oMenuEntries.available.id, " 1. item id is there");
		assert.equal(oContextMenu.getItems()[0].getEnabled(), true, " item without enabled handler is enabled");
		assert.equal(oContextMenu.getItems()[0].getStartsSection(), false, " item without startSection handler doesn't start a new section");
		assert.equal(oContextMenu.getItems()[1].data().id, this.oMenuEntries.enabledBtn1.id, " 2. item id is there");
		assert.equal(oContextMenu.getItems()[1].getEnabled(), true, " item with truthy enabled handler is enabled");
		assert.equal(oContextMenu.getItems()[2].data().id, this.oMenuEntries.disabledBtn1.id, " 3. item id is there");
		assert.equal(oContextMenu.getItems()[2].getEnabled(), false, " item with falsy handler is disabled");
		assert.equal(oContextMenu.getItems()[3].data().id, this.oMenuEntries.alwaysStartSection.id, " 4. item id is there");
		assert.equal(oContextMenu.getItems()[3].getStartsSection(), true, " item with boolean startSection handler starts a new section");
		assert.equal(oContextMenu.getItems()[4].data().id, this.oMenuEntries.startSectionButton1.id, " 5. item id is there");
		assert.equal(oContextMenu.getItems()[4].getStartsSection(), true, " item with truthy startSection handler starts a new section");
		assert.equal(oContextMenu.getItems()[5].data().id, this.oMenuEntries.dynamicTextItem.id, " 6. item id is there");
		assert.equal(oContextMenu.getItems()[5].getText(), this.oButton1.getId(), " 6. item text is set dynamically");
		assert.equal(oContextMenu.getItems()[6].data().id, this.oMenuEntries.startSubMenu.id, " 7. item id is there");
		assert.equal(oContextMenu.getItems()[6].getText(), this.oMenuEntries.startSubMenu.text, " 7. subMenu item text is set");
		var oSubMenu = oContextMenu.getItems()[6].getSubmenu();
		assert.equal(oSubMenu.getItems().length, 2, " 2 submenu items are available");
		assert.equal(oSubMenu.getItems()[0].data().id, this.oMenuEntries.startSubMenu.id, " 1. submenu item id is there");
		assert.equal(oSubMenu.getItems()[0].data().key, this.oMenuEntries.startSubMenu.submenu[0].id, " 1. submenu item key is there");
		assert.equal(oSubMenu.getItems()[0].getText(), this.oMenuEntries.startSubMenu.submenu[0].text, " 1. subMenu item text is set");
		assert.equal(oSubMenu.getItems()[1].data().id, this.oMenuEntries.startSubMenu.id, " 2. submenu item id is there");
		assert.equal(oSubMenu.getItems()[1].data().key, this.oMenuEntries.startSubMenu.submenu[1].id, " 2. submenu item key is there");
		assert.equal(oSubMenu.getItems()[1].getText(), this.oMenuEntries.startSubMenu.submenu[1].text, " 2. subMenu item text is set");
	});

	QUnit.test("when context menu is opened (via mouse) for button 2 ...", function(assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oContextMenu = this.oContextMenuPlugin._oContextMenuControl;

		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 8, " and 8 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data().id, this.oMenuEntries.available.id, " 1. item id is there");
		assert.equal(oContextMenu.getItems()[0].getEnabled(), true, " item without enabled handler is enabled");
		assert.equal(oContextMenu.getItems()[0].getStartsSection(), false, " item without startSection handler doesn't start a new section");
		assert.equal(oContextMenu.getItems()[1].data().id, this.oMenuEntries.enabledBtn1.id, " 2. item id is there");
		assert.equal(oContextMenu.getItems()[1].getEnabled(), false, " item with falsy enabled handler is disabled");
		assert.equal(oContextMenu.getItems()[2].data().id, this.oMenuEntries.disabledBtn1.id, " 3. item id is there");
		assert.equal(oContextMenu.getItems()[2].getEnabled(), true, " item with truthy handler is enabled");
		assert.equal(oContextMenu.getItems()[3].data().id, this.oMenuEntries.onlyBtn2.id, " 4. item id is there");
		assert.equal(oContextMenu.getItems()[3].getEnabled(), true, " item with truthy handler is enabled");
		assert.equal(oContextMenu.getItems()[4].data().id, this.oMenuEntries.alwaysStartSection.id, " 5. item id is there");
		assert.equal(oContextMenu.getItems()[4].getStartsSection(), true, " item with boolean startSection handler starts a new section");
		assert.equal(oContextMenu.getItems()[5].data().id, this.oMenuEntries.startSectionButton1.id, " 6. item id is there");
		assert.equal(oContextMenu.getItems()[5].getStartsSection(), false, " item with falsy startSection handler doesn't starts a new section");
		assert.equal(oContextMenu.getItems()[6].data().id, this.oMenuEntries.dynamicTextItem.id, " 7. item id is there");
		assert.equal(oContextMenu.getItems()[6].getText(), this.oButton2.getId(), " 7. item text is set dynamically");
		assert.equal(oContextMenu.getItems()[7].data().id, this.oMenuEntries.startSubMenu.id, " 8. item id is there");
		assert.equal(oContextMenu.getItems()[7].getText(), this.oMenuEntries.startSubMenu.text, " 8. subMenu item text is set");
		var oSubMenu = oContextMenu.getItems()[7].getSubmenu();
		assert.equal(oSubMenu.getItems().length, 2, " 2 submenu items are available");
		assert.equal(oSubMenu.getItems()[0].data().id, this.oMenuEntries.startSubMenu.id, " 1. submenu item id is there");
		assert.equal(oSubMenu.getItems()[0].data().key, this.oMenuEntries.startSubMenu.submenu[0].id, " 1. submenu item key is there");
		assert.equal(oSubMenu.getItems()[0].getText(), this.oMenuEntries.startSubMenu.submenu[0].text, " 1. subMenu item text is set");
		assert.equal(oSubMenu.getItems()[1].data().id, this.oMenuEntries.startSubMenu.id, " 2. submenu item id is there");
		assert.equal(oSubMenu.getItems()[1].data().key, this.oMenuEntries.startSubMenu.submenu[1].id, " 2. submenu item key is there");
		assert.equal(oSubMenu.getItems()[1].getText(), this.oMenuEntries.startSubMenu.submenu[1].text, " 2. subMenu item text is set");
	});

	QUnit.test("when context menu is opened (via mouse) for unselectable overlay ...", function(assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oUnselectableOverlay.getDomRef(), "contextmenu");
		var oContextMenu = this.oContextMenuPlugin._oContextMenuControl;

		assert.ok(!oContextMenu, "then Menu will not be opened");

	});

	QUnit.test("when context menu entry is triggered for button 2...", function(assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");

		var oContextMenu = this.oContextMenuPlugin._oContextMenuControl;
		sap.ui.test.qunit.triggerMouseEvent(oContextMenu.getItems()[0].getDomRef(), "click");

		assert.equal(this.oMenuEntries.available.handler.callCount, 1, "then the corresponding handler function is called");
		assert.equal(this.oMenuEntries.available.handler.getCall(0).args[0][0].getElement(), this.oButton2, "then the correct element is passed to handler");

		assert.equal(this.oMenuEntries.disabledBtn1.handler.callCount, 0, "then other handler functions are not called");
	});

	QUnit.test("When calling _sortMenuItems", function(assert){
		var mShouldBeSecond = {
			rank : 10
		};
		var mShouldBeFirst = {};
		var mShouldBeThird = {
			rank : 20
		};
		var mShouldBeLast = {
			rank : 50
		};

		var aItems = [
			mShouldBeLast,
			mShouldBeThird,
			mShouldBeSecond,
			mShouldBeFirst
		];

		var oContextMenuPlugin = this.oContextMenuPlugin;

		var aSortedItems = oContextMenuPlugin._sortMenuItems(aItems);

		assert.equal(aSortedItems[0], mShouldBeFirst, "first item is in the right position");
		assert.equal(aSortedItems[1], mShouldBeSecond, "second item is in the right position");
		assert.equal(aSortedItems[2], mShouldBeThird, "third item is in the right position");
		assert.equal(aSortedItems[3], mShouldBeLast, "last item is in the right position");
	});

});