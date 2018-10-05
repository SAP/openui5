/*global QUnit */
sap.ui.define([
	"sap/ui/core/library",
	"sap/m/DisplayListItem"
], function(coreLibrary, DisplayListItem) {
	"use strict";



	QUnit.module("Rendering");

	QUnit.test("test rendering", function(assert) {
		var oDLI = new DisplayListItem({
			label : "text",
			value : "value"
		});

		oDLI.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oDLI.$().length, 1, "DisplayListItem is in DOM");
		assert.ok(oDLI.$().hasClass("sapMDLI"), "DisplayListItem has correct class name");

		oDLI.destroy();
	});

	QUnit.module("Right to left support");

	QUnit.test("Value text direction set to RTL", function(assert) {
		var sDisplayListItem = new DisplayListItem({
			label: "Title text",
			value: "(+359) 111 222 333",
			valueTextDirection: coreLibrary.TextDirection.RTL
		});

		sDisplayListItem.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(sDisplayListItem.$().find('.sapMDLIValue').attr('dir'), 'rtl', "The dir element must be set to 'rtl'");

		sDisplayListItem.destroy();
	});

	QUnit.test("Value text direction set to LTR", function(assert) {
		var sDisplayListItem = new DisplayListItem({
			label: "Title text",
			value: "(+359) 111 222 333",
			valueTextDirection: coreLibrary.TextDirection.LTR
		});

		sDisplayListItem.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(sDisplayListItem.$().find('.sapMDLIValue').attr('dir'), 'ltr', "The dir element must be set to 'ltr'");

		sDisplayListItem.destroy();
	});

	QUnit.test("Value text direction not set", function(assert) {
		var sDisplayListItem = new DisplayListItem({
			label: "Title text",
			value: "(+359) 111 222 333"
		});

		sDisplayListItem.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(sDisplayListItem.$().find('.sapMDLIValue').attr('dir'), undefined, "The dir attribute should not be rendered");

		sDisplayListItem.destroy();
	});
});