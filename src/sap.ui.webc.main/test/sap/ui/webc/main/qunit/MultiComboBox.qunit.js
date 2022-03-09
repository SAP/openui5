/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/MultiComboBox",
	"sap/ui/webc/main/Icon",
	"sap/ui/webc/main/MultiComboBoxItem",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, MultiComboBox, Icon, MultiComboBoxItem, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oMultiComboBox = new MultiComboBox({
				placeholder: "This is my placeholder value",
				value: "Control value",
				valueState: "Warning",
				valueStateMessage: "Value State Message",
				icon: new Icon({
					color: "blue",
					name: "add",
					click: function(oEvent) {
						// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
					}
				}),
				items: [
					new MultiComboBoxItem({
						additionalText: "Some text...",
						text: "Some text..."
					}),
					new MultiComboBoxItem({
						additionalText: "Some text...",
						text: "Some text..."
					}),
					new MultiComboBoxItem({
						additionalText: "Some text...",
						text: "Some text..."
					})
				],
				change: function(oEvent) {
					// console.log("Event change fired for MultiComboBox with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for MultiComboBox with parameters: ", oEvent.getParameters());
				},
				openChange: function(oEvent) {
					// console.log("Event openChange fired for MultiComboBox with parameters: ", oEvent.getParameters());
				},
				selectionChange: function(oEvent) {
					// console.log("Event selectionChange fired for MultiComboBox with parameters: ", oEvent.getParameters());
				}
			});
			this.oMultiComboBox.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oMultiComboBox.destroy();
			this.oMultiComboBox = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oMultiComboBox.$(), "Rendered");
	});
});