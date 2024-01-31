/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/SelectMenu",
	"sap/ui/webc/main/SelectMenuOption",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, nextUIUpdate, SelectMenu, SelectMenuOption, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oSelectMenu = new SelectMenu({
				content: [
					new SelectMenuOption({
						displayText: "Some text...",
						value: "Control value",
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
						]
					}),
					new SelectMenuOption({
						displayText: "Some text...",
						value: "Control value",
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
						]
					}),
					new SelectMenuOption({
						displayText: "Some text...",
						value: "Control value",
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
						]
					})
				]
			});
			this.oSelectMenu.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oSelectMenu.destroy();
			this.oSelectMenu = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oSelectMenu.$(), "Rendered");
	});
});