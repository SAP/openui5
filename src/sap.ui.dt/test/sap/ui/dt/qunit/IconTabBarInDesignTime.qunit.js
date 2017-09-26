/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	// internal
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	// external
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Button",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter"
], function(
	DesignTime,
	OverlayRegistry,
	List,
	StandardListItem,
	Button,
	IconTabBar,
	IconTabFilter
) {
	'use strict';

	QUnit.module("Given the IconTabBar is created with 3 filters and different content..", {
		beforeEach : function(assert) {
			this.oList = new List({
				items : [
					new StandardListItem({
						title : "List Item 1"
					}),
					new StandardListItem({
						title : "List Item 2"
					}),
					new StandardListItem({
						title : "List Item 3"
					})
				]
			});
			this.oButton = new Button({text : "Text"});
			this.oIconTabBar = new IconTabBar({
				items : [
					new IconTabFilter({
						showAll : true,
						count : "22",
						text : "Orders",
						content : [
							this.oList
						]
					}),
					new IconTabFilter({
						icon : "sap-icon://task",
						iconColor : sap.ui.core.IconColor.Critical,
						count : "10",
						key : "Open",
						text : "Open",
						content: [
							this.oButton
						]
					}),
					new IconTabFilter({
						icon : "sap-icon://shipping-status",
						iconColor : sap.ui.core.IconColor.Positive,
						count : "5",
						key : "Shipped",
						text : "Shipped"
					})
				]
			}).placeAt("content");

			var done = assert.async();


			this.oIconTabBar.addEventDelegate({
				onAfterRendering : function() {
					this.oDesignTime = new DesignTime({
						rootElements : [this.oIconTabBar]
					});
					this.oDesignTime.attachEventOnce("synced", function() {
						sap.ui.getCore().applyChanges();
						done();
					});
				}.bind(this)
			});
		},
		afterEach : function() {
			this.oList.destroy();
			this.oButton.destroy();
			this.oIconTabBar.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("initially...", function(assert) {
		var oListOverlay = OverlayRegistry.getOverlay(this.oList);
		var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
		assert.strictEqual(oListOverlay.isVisible(), true, "List overlay is visible");
		assert.strictEqual(oButtonOverlay.isVisible(), false, "Button overlay is not visible");
	});

	QUnit.test("when the filter is switched...", function(assert) {
		var oListOverlay = OverlayRegistry.getOverlay(this.oList);
		var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);

		this.oIconTabBar.setSelectedKey("Open");
		sap.ui.getCore().applyChanges();
		OverlayRegistry.getOverlay(this.oIconTabBar).applyStyles();

		assert.strictEqual(oListOverlay.isVisible(), false, "List overlay is not visible");
		assert.strictEqual(oButtonOverlay.isVisible(), true, "Button overlay is visible");
	});

	QUnit.start();
});