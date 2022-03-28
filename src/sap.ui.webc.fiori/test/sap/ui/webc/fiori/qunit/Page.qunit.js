/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/Page",
	"sap/ui/webc/main/Button",
	"sap/ui/webc/fiori/Bar"
], function(createAndAppendDiv, Core, Page, Button, Bar) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oPage = new Page({
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
				footer: new Bar({
					endContent: [
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
					middleContent: [
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
					startContent: [
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
				header: new Bar({
					endContent: [
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
					middleContent: [
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
					startContent: [
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
			});
			this.oPage.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oPage.destroy();
			this.oPage = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oPage.$(), "Rendered");
	});
});