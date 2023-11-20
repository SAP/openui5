/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Select",
	"sap/ui/webc/main/Button",
	"sap/ui/webc/main/Option"
], function(createAndAppendDiv, Core, Select, Button, Option) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oSelect = new Select({
				valueState: "Warning",
				valueStateMessage: "Value State Message",
				label: [
					new Button({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
						}
					}),
					new Button({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
						}
					}),
					new Button({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
						}
					})
				],
				options: [
					new Option({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
						value: "Control value"
					}),
					new Option({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
						value: "Control value"
					}),
					new Option({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
						value: "Control value"
					})
				],
				change: function(oEvent) {
					// console.log("Event change fired for Select with parameters: ", oEvent.getParameters());
				},
				close: function(oEvent) {
					// console.log("Event close fired for Select with parameters: ", oEvent.getParameters());
				},
				liveChange: function(oEvent) {
					// console.log("Event liveChange fired for Select with parameters: ", oEvent.getParameters());
				},
				open: function(oEvent) {
					// console.log("Event open fired for Select with parameters: ", oEvent.getParameters());
				}
			});
			this.oSelect.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oSelect.destroy();
			this.oSelect = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oSelect.$(), "Rendered");
	});
});