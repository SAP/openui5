/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/RangeSlider"
], function(createAndAppendDiv, Core, RangeSlider) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oRangeSlider = new RangeSlider({
				change: function(oEvent) {
					// console.log("Event change fired for RangeSlider with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for RangeSlider with parameters: ", oEvent.getParameters());
				}
			});
			this.oRangeSlider.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oRangeSlider.destroy();
			this.oRangeSlider = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oRangeSlider.$(), "Rendered");
	});
});