/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/ColorPalettePopover",
	"sap/ui/webc/main/ColorPaletteItem",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, ColorPalettePopover, ColorPaletteItem, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oColorPalettePopover = new ColorPalettePopover({
				defaultColor: "blue",
				colors: [
					new ColorPaletteItem({
						value: "blue"
					}),
					new ColorPaletteItem({
						value: "blue"
					}),
					new ColorPaletteItem({
						value: "blue"
					})
				],
				itemClick: function(oEvent) {
					// console.log("Event itemClick fired for ColorPalettePopover with parameters: ", oEvent.getParameters());
				}
			});
			this.oColorPalettePopover.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oColorPalettePopover.destroy();
			this.oColorPalettePopover = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oColorPalettePopover.$(), "Rendered");
	});
});