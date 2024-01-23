/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/ToggleButton"
], function(createAndAppendDiv, Core, nextUIUpdate, ToggleButton) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oToggleButton = new ToggleButton({
				icon: "employee",
				text: "Some text...",
				click: function(oEvent) {
					// console.log("Event click fired for ToggleButton with parameters: ", oEvent.getParameters());
				}
			});
			this.oToggleButton.placeAt("uiArea");
			await nextUIUpdate();
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