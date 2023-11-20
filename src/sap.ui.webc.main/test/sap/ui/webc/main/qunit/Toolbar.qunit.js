/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Toolbar",
	"sap/ui/webc/main/ToolbarButton",
	"sap/ui/webc/main/ToolbarSelect",
	"sap/ui/webc/main/Option",
	"sap/ui/webc/main/ToolbarSeparator"
], function(createAndAppendDiv, Core, Toolbar, ToolbarButton, ToolbarSelect, Option, ToolbarSeparator) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oToolbar = new Toolbar({
				items: [
					new ToolbarButton({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for ToolbarButton with parameters: ", oEvent.getParameters());
						}
					}),
					new ToolbarSelect({
						valueState: "Warning",
						options: [
							new Option({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								value: "Control value"
							}),
							new Option({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								value: "Control value"
							}),
							new Option({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								value: "Control value"
							})
						],
						change: function(oEvent) {
							// console.log("Event change fired for ToolbarSelect with parameters: ", oEvent.getParameters());
						},
						close: function(oEvent) {
							// console.log("Event close fired for ToolbarSelect with parameters: ", oEvent.getParameters());
						},
						open: function(oEvent) {
							// console.log("Event open fired for ToolbarSelect with parameters: ", oEvent.getParameters());
						}
					}),
					new ToolbarSeparator({

					})
				]
			});
			this.oToolbar.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oToolbar.destroy();
			this.oToolbar = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oToolbar.$(), "Rendered");
	});
});