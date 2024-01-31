/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/ProgressIndicator"
], function(createAndAppendDiv, nextUIUpdate, ProgressIndicator) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oProgressIndicator = new ProgressIndicator({
				valueState: "Warning"
			});
			this.oProgressIndicator.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oProgressIndicator.destroy();
			this.oProgressIndicator = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oProgressIndicator.$(), "Rendered");
	});
});