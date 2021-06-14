/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/DateRangePicker",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, DateRangePicker, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oDateRangePicker = new DateRangePicker({
				placeholder: "This is my placeholder value",
				value: "Control value",
				valueState: "Warning",
				valueStateMessage: "Value State Message",
				change: function(oEvent) {
					// console.log("Event change fired for DateRangePicker with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for DateRangePicker with parameters: ", oEvent.getParameters());
				}
			});
			this.oDateRangePicker.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oDateRangePicker.destroy();
			this.oDateRangePicker = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oDateRangePicker.$(), "Rendered");
	});
});