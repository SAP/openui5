/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/ColorPalette",
	"sap/ui/webc/main/ColorPaletteItem"
], function(createAndAppendDiv, Core, ColorPalette, ColorPaletteItem) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oColorPalette = new ColorPalette({
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
					// console.log("Event itemClick fired for ColorPalette with parameters: ", oEvent.getParameters());
				}
			});
			this.oColorPalette.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oColorPalette.destroy();
			this.oColorPalette = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oColorPalette.$(), "Rendered");
	});
});