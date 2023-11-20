/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Slider"
], function(createAndAppendDiv, Core, Slider) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oSlider = new Slider({
				change: function(oEvent) {
					// console.log("Event change fired for Slider with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for Slider with parameters: ", oEvent.getParameters());
				}
			});
			this.oSlider.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oSlider.destroy();
			this.oSlider = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oSlider.$(), "Rendered");
	});
});