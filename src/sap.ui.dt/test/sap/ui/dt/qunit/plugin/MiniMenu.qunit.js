/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/Utils",
	"sap/ui/dt/plugin/MiniMenu",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	// should be last
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
], 	function(
	Utils,
	MiniMenu,
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
				handler : sinon.spy(),
				available : function(oOverlay){
					var oElement = oOverlay.getElementInstance();
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
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when context menu is opened (via mouse) for button 2 ...", function(assert) {
		sap.ui.test.qunit.triggerMouseEvent(this.oButton2Overlay.getDomRef(), "contextmenu");
		var oMiniMenu = this.oMiniMenuPlugin.oMiniMenu;

		assert.equal(oMiniMenu.getButtons().length, 8, " and 8 Menu Items are available");
		assert.equal(oMiniMenu.getButtons()[0].data().id, this.oMenuEntries.available.id, " 1. item id is there");
		assert.equal(oMiniMenu.getButtons()[0].getEnabled(), true, " item without enabled handler is enabled");
		assert.equal(oMiniMenu.getButtons()[1].data().id, this.oMenuEntries.enabledBtn1.id, " 2. item id is there");
		assert.equal(oMiniMenu.getButtons()[2].data().id, this.oMenuEntries.disabledBtn1.id, " 3. item id is there");
		assert.equal(oMiniMenu.getButtons()[2].getEnabled(), true, " item with truthy handler is enabled");
		assert.equal(oMiniMenu.getButtons()[3].data().id, this.oMenuEntries.onlyBtn2.id, " 4. item id is there");
		assert.equal(oMiniMenu.getButtons()[3].getEnabled(), true, " item with truthy handler is enabled");
		assert.equal(oMiniMenu.getButtons()[4].data().id, this.oMenuEntries.alwaysStartSection.id, " 5. item id is there");
		assert.equal(oMiniMenu.getButtons()[5].data().id, this.oMenuEntries.startSectionButton1.id, " 6. item id is there");
		assert.equal(oMiniMenu.getButtons()[6].data().id, this.oMenuEntries.dynamicTextItem.id, " 7. item id is there");
	});

});