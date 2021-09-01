/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/CardHeader",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, CardHeader, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oCardHeader = new CardHeader({
				subtitleText: "Some text...",
				titleText: "Some text...",
				action: [
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
				avatar: [
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
				click: function(oEvent) {
					// console.log("Event click fired for CardHeader with parameters: ", oEvent.getParameters());
				}
			});
			this.oCardHeader.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oCardHeader.destroy();
			this.oCardHeader = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oCardHeader.$(), "Rendered");
	});
});