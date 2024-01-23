/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/BusyIndicator",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, nextUIUpdate, BusyIndicator, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oBusyIndicator = new BusyIndicator({
				text: "Some text...",
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
			});
			this.oBusyIndicator.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oBusyIndicator.destroy();
			this.oBusyIndicator = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oBusyIndicator.$(), "Rendered");
	});
});