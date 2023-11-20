/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/TextArea"
], function(createAndAppendDiv, Core, TextArea) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oTextArea = new TextArea({
				placeholder: "This is my placeholder value",
				value: "Control value",
				valueState: "Warning",
				valueStateMessage: "Value State Message",
				change: function(oEvent) {
					// console.log("Event change fired for TextArea with parameters: ", oEvent.getParameters());
				},
				input: function(oEvent) {
					// console.log("Event input fired for TextArea with parameters: ", oEvent.getParameters());
				}
			});
			this.oTextArea.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTextArea.destroy();
			this.oTextArea = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oTextArea.$(), "Rendered");
	});
});