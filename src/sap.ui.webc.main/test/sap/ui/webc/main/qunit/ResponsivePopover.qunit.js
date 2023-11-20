/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/ResponsivePopover",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, ResponsivePopover, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oResponsivePopover = new ResponsivePopover({
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
					// console.log("Event afterClose fired for ResponsivePopover with parameters: ", oEvent.getParameters());
				},
				afterOpen: function(oEvent) {
					// console.log("Event afterOpen fired for ResponsivePopover with parameters: ", oEvent.getParameters());
				},
				beforeClose: function(oEvent) {
					// console.log("Event beforeClose fired for ResponsivePopover with parameters: ", oEvent.getParameters());
				},
				beforeOpen: function(oEvent) {
					// console.log("Event beforeOpen fired for ResponsivePopover with parameters: ", oEvent.getParameters());
				}
			});
			this.oResponsivePopover.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oResponsivePopover.destroy();
			this.oResponsivePopover = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oResponsivePopover.$(), "Rendered");
	});
});