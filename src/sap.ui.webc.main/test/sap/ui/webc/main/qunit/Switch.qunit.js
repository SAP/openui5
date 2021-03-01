/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Switch"
], function(createAndAppendDiv, Core, Switch) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oSwitch = new Switch({
				textOff: "Some text...",
				textOn: "Some text...",
				change: function(oEvent) {
					// console.log("Event change fired for Switch with parameters: ", oEvent.getParameters());
				}
			});
			this.oSwitch.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oSwitch.destroy();
			this.oSwitch = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oSwitch.$(), "Rendered");
	});
});