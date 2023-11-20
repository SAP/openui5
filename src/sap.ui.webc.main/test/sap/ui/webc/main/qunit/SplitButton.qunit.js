/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/SplitButton"
], function(createAndAppendDiv, Core, SplitButton) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oSplitButton = new SplitButton({
				icon: "employee",
				text: "Some text...",
				arrowClick: function(oEvent) {
					// console.log("Event arrowClick fired for SplitButton with parameters: ", oEvent.getParameters());
				},
				click: function(oEvent) {
					// console.log("Event click fired for SplitButton with parameters: ", oEvent.getParameters());
				}
			});
			this.oSplitButton.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oSplitButton.destroy();
			this.oSplitButton = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oSplitButton.$(), "Rendered");
	});
});