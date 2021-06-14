/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/TimePicker",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, TimePicker, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oTimePicker = new TimePicker({
				placeholder: "This is my placeholder value",
				value: "Control value",
				valueState: "Warning",
				valueStateMessage: "Value State Message",
				change: function(oEvent) {
					// console.log("Event change fired for TimePicker with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for TimePicker with parameters: ", oEvent.getParameters());
				}
			});
			this.oTimePicker.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTimePicker.destroy();
			this.oTimePicker = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oTimePicker.$(), "Rendered");
	});
});