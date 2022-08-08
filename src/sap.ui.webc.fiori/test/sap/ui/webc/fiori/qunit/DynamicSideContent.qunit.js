/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/DynamicSideContent",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, DynamicSideContent, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oDynamicSideContent = new DynamicSideContent({
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
				sideContent: [
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
				layoutChange: function(oEvent) {
					// console.log("Event layoutChange fired for DynamicSideContent with parameters: ", oEvent.getParameters());
				}
			});
			this.oDynamicSideContent.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oDynamicSideContent.destroy();
			this.oDynamicSideContent = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oDynamicSideContent.$(), "Rendered");
	});
});