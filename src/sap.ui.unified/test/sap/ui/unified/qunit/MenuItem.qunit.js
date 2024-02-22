/*global QUnit */
sap.ui.define([
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/Label",
	"sap/ui/core/TooltipBase"
], function(Menu, MenuItem, nextUIUpdate, Label, TooltipBase) {
	"use strict";

	QUnit.module("Accessibility");

	QUnit.test("Default labeling", function(assert) {
		// Prepare
		var oMenuItem = new MenuItem(),
			oMenu = new Menu({ items: oMenuItem }).placeAt("qunit-fixture");

		// act
		oMenu.open();
		var $menuItem = oMenuItem.$();

		// assert
		assert.strictEqual($menuItem.attr("aria-labelledby"), oMenuItem.getId() + "-txt",
			"Only a reference to the internal text element is added");

		// clean up
		oMenu.destroy();
	});

	QUnit.test("ariaLabelledBy association", async function (assert) {
		var oLabel = new Label("menuItemLabel", {
			text: "Some label"
		});
		var oMenuItem = new MenuItem({
			text: "Some MenuItem",
			icon: "sap-icon://accept",
			ariaLabelledBy: oLabel
		});
		var oMenu = new Menu({
			items: oMenuItem
		});

		oLabel.placeAt("qunit-fixture");
		oMenu.placeAt("qunit-fixture");
		await nextUIUpdate();

		oMenu.open();
		var $menuItemRef = oMenuItem.$();
		var aAriaLabelledByIDs = $menuItemRef.attr("aria-labelledby").split(" ");

		assert.ok(aAriaLabelledByIDs.indexOf("menuItemLabel") !== -1, "Menu item is correctly labelled");
		assert.ok(aAriaLabelledByIDs.length > 1, "Label ID is correctly appended to the initially rendered ID's");

		oMenu.close();
		oMenu.destroy();
		oLabel.destroy();
	});

	QUnit.test("aria-haspopup", async function (assert) {
		var oMenuItem = new MenuItem({ text: "Plain" }),
			oMenuItemWithSubmenu = new MenuItem({ text: "With submenu", submenu: new Menu() }),
			oMenu = new Menu({ items: [oMenuItem, oMenuItemWithSubmenu] });

		oMenu.placeAt("qunit-fixture");
		await nextUIUpdate();

		oMenu.open();
		assert.notOk(oMenuItem.$().attr("aria-haspopup"), "Menu items don't have aria-haspopup when there's no submenu");
		assert.strictEqual(oMenuItemWithSubmenu.$().attr("aria-haspopup"), "menu", "Submenu presence is indicated in aria-haspopup");

		oMenu.destroy();
	});

	var Tooltip = TooltipBase.extend("Tooltip", {
		renderer: {
			apiVersion: 2,
			render: function(oRm, oTooltip) {
				oRm.openStart("div", oTooltip)
					.openEnd()
					.close("div");
			}
		}
	});

	QUnit.module("Events", {
		beforeEach: async function() {
			this.oMenuItem = new MenuItem({
				text: "Some MenuItem",
				tooltip: new Tooltip({
					title: "Test"
				})
			});

			this.oMenu = new Menu({
				items: this.oMenuItem
			});

			this.oMenu.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("mouseover", function(assert) {
		// Prepare
		this.oMenu.open();

		// Act
		this.oMenuItem.$().trigger("mouseover");

		// Assert
		assert.ok(true, "mouseover event does not lead to an exception");

	});

	QUnit.module("Misc");

	QUnit.test("set custom image as icon", function (assert) {
		// Arrange
		var oIcon,
			oMenuItem = new MenuItem({
				text: "Menu Item",
				icon: "https://openui5.org/7726d076e89ac67994e0a4d96106d534/B_OpenUI5_H.svg"
			});

		// Act
		oIcon = oMenuItem._getIcon();

		// Assert
		assert.ok(oIcon, "Icon with custom image was successfully created");
	});
});
