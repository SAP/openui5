/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/RatingIndicator"
], function(createAndAppendDiv, Core, RatingIndicator) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oRatingIndicator = new RatingIndicator({
				change: function(oEvent) {
					// console.log("Event change fired for RatingIndicator with parameters: ", oEvent.getParameters());
				}
			});
			this.oRatingIndicator.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oRatingIndicator.destroy();
			this.oRatingIndicator = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oRatingIndicator.$(), "Rendered");
	});
});