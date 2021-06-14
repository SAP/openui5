/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/SegmentedButton",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, SegmentedButton, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oSegmentedButton = new SegmentedButton({
				buttons: [
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
				selectionChange: function(oEvent) {
					// console.log("Event selectionChange fired for SegmentedButton with parameters: ", oEvent.getParameters());
				}
			});
			this.oSegmentedButton.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oSegmentedButton.destroy();
			this.oSegmentedButton = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oSegmentedButton.$(), "Rendered");
	});
});