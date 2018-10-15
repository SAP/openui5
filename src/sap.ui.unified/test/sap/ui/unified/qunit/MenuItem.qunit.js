/*global QUnit, window */
sap.ui.define([
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem"
], function(Menu, MenuItem) {
	"use strict";

	QUnit.module("Accessibility");

	QUnit.test("ariaLabelledBy", function (assert) {
		var oLabel = new sap.m.Label("menuItemLabel", {
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
});
