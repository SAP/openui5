/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/ProgressIndicator"
], function(createAndAppendDiv, Core, ProgressIndicator) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oProgressIndicator = new ProgressIndicator({
				valueState: "Warning"
			});
			this.oProgressIndicator.placeAt("uiArea");
			Core.applyChanges();
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