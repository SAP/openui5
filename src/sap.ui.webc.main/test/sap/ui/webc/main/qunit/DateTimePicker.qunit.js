/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/DateTimePicker",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, DateTimePicker, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oDateTimePicker = new DateTimePicker({
				placeholder: "This is my placeholder value",
				value: "Control value",
				valueState: "Warning",
				valueStateMessage: "Value State Message",
				change: function(oEvent) {
					// console.log("Event change fired for DateTimePicker with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for DateTimePicker with parameters: ", oEvent.getParameters());
				}
			});
			this.oDateTimePicker.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oDateTimePicker.destroy();
			this.oDateTimePicker = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oDateTimePicker.$(), "Rendered");
	});
});