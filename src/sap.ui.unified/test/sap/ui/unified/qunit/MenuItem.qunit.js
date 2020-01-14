/*global QUnit, window */
sap.ui.define([
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/m/Label",
	"sap/ui/commons/RichTooltip"
], function(Menu, MenuItem, Label, RichTooltip) {
	"use strict";

	QUnit.module("Accessibility");

	QUnit.test("ariaLabelledBy", function (assert) {
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
		this.oMenuItem.$().mouseover();

		// Assert
		assert.ok(true, "mouseover event does not lead to an exception");

	});
});
