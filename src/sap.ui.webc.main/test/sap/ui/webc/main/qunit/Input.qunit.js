/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Input",
	"sap/ui/webc/main/Icon",
	"sap/ui/webc/main/SuggestionGroupItem",
	"sap/ui/webc/main/SuggestionItem",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, Input, Icon, SuggestionGroupItem, SuggestionItem, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oInput = new Input({
				placeholder: "This is my placeholder value",
				value: "Control value",
				valueState: "Warning",
				valueStateMessage: "Value State Message",
				icon: [
					new Icon({
						color: "blue",
						name: "add",
						click: function(oEvent) {
							// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
						}
					}),
					new Icon({
						color: "blue",
						name: "add",
						click: function(oEvent) {
							// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
						}
					}),
					new Icon({
						color: "blue",
						name: "add",
						click: function(oEvent) {
							// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
						}
					})
				],
				suggestionItems: [
					new SuggestionGroupItem({
						text: "Some text..."
					}),
					new SuggestionItem({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text..."
					}),
					new SuggestionGroupItem({
						text: "Some text..."
					})
				],
				change: function(oEvent) {
					// console.log("Event change fired for Input with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for Input with parameters: ", oEvent.getParameters());
				},
				suggestionItemPreview: function(oEvent) {
					// console.log("Event suggestionItemPreview fired for Input with parameters: ", oEvent.getParameters());
				},
				suggestionItemSelect: function(oEvent) {
					// console.log("Event suggestionItemSelect fired for Input with parameters: ", oEvent.getParameters());
				}
			});
			this.oInput.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oInput.destroy();
			this.oInput = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oInput.$(), "Rendered");
	});
});