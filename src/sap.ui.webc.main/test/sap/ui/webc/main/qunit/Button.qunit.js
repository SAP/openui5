/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oButton = new Button({
				icon: "employee",
				text: "Some text...",
				click: function(oEvent) {
					// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
				}
			});
			this.oButton.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oButton.destroy();
			this.oButton = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oButton.$(), "Rendered");
	});
});