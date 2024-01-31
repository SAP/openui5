/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/fiori/IllustratedMessage",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, nextUIUpdate, IllustratedMessage, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oIllustratedMessage = new IllustratedMessage({
				subtitleText: "Some text...",
				titleText: "Some text...",
				actions: [
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
				subtitle: new Button({
					icon: "employee",
					text: "Some text...",
					click: function(oEvent) {
						// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
					}
				}),
				title: new Button({
					icon: "employee",
					text: "Some text...",
					click: function(oEvent) {
						// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
					}
				})
			});
			this.oIllustratedMessage.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oIllustratedMessage.$(), "Rendered");
	});
});