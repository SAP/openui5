/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/FlexibleColumnLayout",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, FlexibleColumnLayout, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oFlexibleColumnLayout = new FlexibleColumnLayout({
				endColumn: new Button({
					icon: "employee",
					text: "Some text...",
					click: function(oEvent) {
						// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
					}
				}),
				midColumn: new Button({
					icon: "employee",
					text: "Some text...",
					click: function(oEvent) {
						// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
					}
				}),
				startColumn: new Button({
					icon: "employee",
					text: "Some text...",
					click: function(oEvent) {
						// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
					}
				}),
				layoutChange: function(oEvent) {
					// console.log("Event layoutChange fired for FlexibleColumnLayout with parameters: ", oEvent.getParameters());
				}
			});
			this.oFlexibleColumnLayout.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oFlexibleColumnLayout.destroy();
			this.oFlexibleColumnLayout = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oFlexibleColumnLayout.$(), "Rendered");
	});
});