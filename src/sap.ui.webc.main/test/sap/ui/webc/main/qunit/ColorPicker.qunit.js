/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/ColorPicker"
], function(createAndAppendDiv, Core, ColorPicker) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oColorPicker = new ColorPicker({
				color: "blue",
				change: function(oEvent) {
					// console.log("Event change fired for ColorPicker with parameters: ", oEvent.getParameters());
				}
			});
			this.oColorPicker.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oColorPicker.destroy();
			this.oColorPicker = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oColorPicker.$(), "Rendered");
	});
});