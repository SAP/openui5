/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/FileUploader",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, FileUploader, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
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
			Core.applyChanges();
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