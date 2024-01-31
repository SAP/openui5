/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/Dialog",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, nextUIUpdate, Dialog, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oDialog = new Dialog({
				headerText: "Some text...",
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
				footer: [
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
				header: [
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
				afterClose: function(oEvent) {
					// console.log("Event afterClose fired for Dialog with parameters: ", oEvent.getParameters());
				},
				afterOpen: function(oEvent) {
					// console.log("Event afterOpen fired for Dialog with parameters: ", oEvent.getParameters());
				},
				beforeClose: function(oEvent) {
					// console.log("Event beforeClose fired for Dialog with parameters: ", oEvent.getParameters());
				},
				beforeOpen: function(oEvent) {
					// console.log("Event beforeOpen fired for Dialog with parameters: ", oEvent.getParameters());
				}
			});
			this.oDialog.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oDialog.destroy();
			this.oDialog = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oDialog.$(), "Rendered");
	});
});