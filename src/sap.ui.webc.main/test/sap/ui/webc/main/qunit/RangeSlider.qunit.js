/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/RangeSlider"
], function(createAndAppendDiv, nextUIUpdate, RangeSlider) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oRangeSlider = new RangeSlider({
				change: function(oEvent) {
					// console.log("Event change fired for RangeSlider with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for RangeSlider with parameters: ", oEvent.getParameters());
				}
			});
			this.oRangeSlider.placeAt("uiArea");
			await nextUIUpdate();
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