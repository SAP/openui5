/*global QUnit, window */
sap.ui.define([
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/m/Label",
	"sap/ui/commons/RichTooltip"
], function(Menu, MenuItem, Label, RichTooltip) {
	"use strict";

	QUnit.module("Accessibility");

	QUnit.test("Default labelling", function(assert) {
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

	QUnit.test("ariaLabelledBy association", function (assert) {
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
		sap.ui.getCore().applyChanges();

		oMenu.open();
		var $menuItemRef = oMenuItem.$();
		var aAriaLabelledByIDs = $menuItemRef.attr("aria-labelledby").split(" ");

		assert.ok(aAriaLabelledByIDs.indexOf("menuItemLabel") !== -1, "Menu item is correctly labelled");
		assert.ok(aAriaLabelledByIDs.length > 1, "Label ID is correctly appended to the initially rendered ID's");

		oMenu.close();
		oMenu.destroy();
		oLabel.destroy();
	});

	QUnit.test("aria-haspopup", function (assert) {
		var oMenuItem = new MenuItem({ text: "Plain" }),
			oMenuItemWithSubmenu = new MenuItem({ text: "With submenu", submenu: new Menu() }),
			oMenu = new Menu({ items: [oMenuItem, oMenuItemWithSubmenu] });

		oMenu.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oMenu.open();
		assert.notOk(oMenuItem.$().attr("aria-haspopup"), "Menu items don't have aria-haspopup when there's no submenu");
		assert.strictEqual(oMenuItemWithSubmenu.$().attr("aria-haspopup"), "menu", "Submenu presence is indicated in aria-haspopup");

		oMenu.destroy();
	});

	QUnit.module("Events", {
		beforeEach: function() {
			this.oMenuItem = new MenuItem({
				text: "Some MenuItem",
				tooltip: new RichTooltip({
					title: "Test"
				})
			});

			this.oMenu = new Menu({
				items: this.oMenuItem
			});

			this.oMenu.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
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
});
