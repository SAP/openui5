/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/ToggleButton"
], function(createAndAppendDiv, Core, ToggleButton) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oToggleButton = new ToggleButton({
				icon: "employee",
				text: "Some text...",
				click: function(oEvent) {
					// console.log("Event click fired for ToggleButton with parameters: ", oEvent.getParameters());
				}
			});
			this.oToggleButton.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oToggleButton.destroy();
			this.oToggleButton = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oToggleButton.$(), "Rendered");
	});
});