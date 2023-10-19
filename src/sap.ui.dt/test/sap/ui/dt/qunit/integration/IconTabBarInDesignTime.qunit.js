/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/ui/core/library",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Button,
	IconTabBar,
	IconTabFilter,
	List,
	StandardListItem,
	coreLibrary,
	DesignTime,
	OverlayRegistry,
	nextUIUpdate
) {
	"use strict";

	var {IconColor} = coreLibrary;

	QUnit.module("Given the IconTabBar is created with 3 filters and different content..", {
		async beforeEach(assert) {
			this.oList = new List({
				items: [
					new StandardListItem({
						title: "List Item 1"
					}),
					new StandardListItem({
						title: "List Item 2"
					}),
					new StandardListItem({
						title: "List Item 3"
					})
				]
			});
			this.oButton = new Button({text: "Text"});
			this.oIconTabBar = new IconTabBar({
				items: [
					new IconTabFilter({
						showAll: true,
						count: "22",
						text: "Orders",
						content: [
							this.oList
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://task",
						iconColor: IconColor.Critical,
						count: "10",
						key: "Open",
						text: "Open",
						content: [
							this.oButton
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "5",
						key: "Shipped",
						text: "Shipped"
					})
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			var done = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oIconTabBar]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				done();
			});
		},
		afterEach() {
			this.oList.destroy();
			this.oButton.destroy();
			this.oIconTabBar.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("initially...", function(assert) {
			var oListOverlay = OverlayRegistry.getOverlay(this.oList);
			var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
			assert.strictEqual(oListOverlay.isVisible(), true, "List overlay is visible");
			assert.strictEqual(oButtonOverlay.isVisible(), false, "Button overlay is not visible");
		});

		QUnit.test("when the filter is switched...", async function(assert) {
			var fnDone = assert.async();
			var oListOverlay = OverlayRegistry.getOverlay(this.oList);
			var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);

			this.oIconTabBar.setSelectedKey("Open");
			await nextUIUpdate();
			var oIconTabBarOverlay = OverlayRegistry.getOverlay(this.oIconTabBar);

			oIconTabBarOverlay.attachEventOnce("geometryChanged", function() {
				assert.strictEqual(oListOverlay.isVisible(), false, "List overlay is not visible");
				assert.strictEqual(oButtonOverlay.isVisible(), true, "Button overlay is visible");
				fnDone();
			});

			oIconTabBarOverlay.applyStyles();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});