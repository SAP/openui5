/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/ComboBox",
	"sap/ui/webc/main/Icon",
	"sap/ui/webc/main/ComboBoxGroupItem",
	"sap/ui/webc/main/ComboBoxItem"
], function(createAndAppendDiv, Core, ComboBox, Icon, ComboBoxGroupItem, ComboBoxItem) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oComboBox = new ComboBox({
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
					new ComboBoxGroupItem({
						text: "Some text..."
					}),
					new ComboBoxItem({
						additionalText: "Some text...",
						text: "Some text..."
					}),
					new ComboBoxGroupItem({
						text: "Some text..."
					})
				],
				change: function(oEvent) {
					// console.log("Event change fired for ComboBox with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for ComboBox with parameters: ", oEvent.getParameters());
				},
				selectionChange: function(oEvent) {
					// console.log("Event selectionChange fired for ComboBox with parameters: ", oEvent.getParameters());
				}
			});
			this.oComboBox.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oComboBox.destroy();
			this.oComboBox = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oComboBox.$(), "Rendered");
	});
});