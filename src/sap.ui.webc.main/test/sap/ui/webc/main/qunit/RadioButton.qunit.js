/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/RadioButton"
], function(createAndAppendDiv, Core, RadioButton) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oRadioButton = new RadioButton({
				text: "Some text...",
				value: "Control value",
				valueState: "Warning",
				change: function(oEvent) {
					// console.log("Event change fired for RadioButton with parameters: ", oEvent.getParameters());
				}
			});
			this.oRadioButton.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oRadioButton.destroy();
			this.oRadioButton = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oRadioButton.$(), "Rendered");
	});
});