/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/MultiInput",
	"sap/ui/webc/main/Icon",
	"sap/ui/webc/main/SuggestionGroupItem",
	"sap/ui/webc/main/SuggestionItem",
	"sap/ui/webc/main/Token",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, MultiInput, Icon, SuggestionGroupItem, SuggestionItem, Token, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oMultiInput = new MultiInput({
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
				tokens: [
					new Token({
						text: "Some text...",
						closeIcon: new Icon({
							color: "blue",
							name: "add",
							click: function(oEvent) {
								// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
							}
						}),
						select: function(oEvent) {
							// console.log("Event select fired for Token with parameters: ", oEvent.getParameters());
						}
					}),
					new Token({
						text: "Some text...",
						closeIcon: new Icon({
							color: "blue",
							name: "add",
							click: function(oEvent) {
								// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
							}
						}),
						select: function(oEvent) {
							// console.log("Event select fired for Token with parameters: ", oEvent.getParameters());
						}
					}),
					new Token({
						text: "Some text...",
						closeIcon: new Icon({
							color: "blue",
							name: "add",
							click: function(oEvent) {
								// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
							}
						}),
						select: function(oEvent) {
							// console.log("Event select fired for Token with parameters: ", oEvent.getParameters());
						}
					})
				],
				change: function(oEvent) {
					// console.log("Event change fired for MultiInput with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for MultiInput with parameters: ", oEvent.getParameters());
				},
				suggestionItemPreview: function(oEvent) {
					// console.log("Event suggestionItemPreview fired for MultiInput with parameters: ", oEvent.getParameters());
				},
				suggestionItemSelect: function(oEvent) {
					// console.log("Event suggestionItemSelect fired for MultiInput with parameters: ", oEvent.getParameters());
				},
				tokenDelete: function(oEvent) {
					// console.log("Event tokenDelete fired for MultiInput with parameters: ", oEvent.getParameters());
				},
				valueHelpTrigger: function(oEvent) {
					// console.log("Event valueHelpTrigger fired for MultiInput with parameters: ", oEvent.getParameters());
				}
			});
			this.oMultiInput.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oMultiInput.destroy();
			this.oMultiInput = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oMultiInput.$(), "Rendered");
	});
});