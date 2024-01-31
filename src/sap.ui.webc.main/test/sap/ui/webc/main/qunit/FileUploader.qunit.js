/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/FileUploader",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, nextUIUpdate, FileUploader, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oFileUploader = new FileUploader({
				placeholder: "This is my placeholder value",
				value: "Control value",
				valueState: "Warning",
				valueStateMessage: "Value State Message",
				content: [
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
				change: function(oEvent) {
					// console.log("Event change fired for FileUploader with parameters: ", oEvent.getParameters());
				}
			});
			this.oFileUploader.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oFileUploader.destroy();
			this.oFileUploader = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oFileUploader.$(), "Rendered");
	});
});