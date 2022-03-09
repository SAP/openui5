/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Icon"
], function(createAndAppendDiv, Core, Icon) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oIcon = new Icon({
				color: "blue",
				name: "add",
				click: function(oEvent) {
					// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
				}
			});
			this.oIcon.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oIcon.destroy();
			this.oIcon = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oIcon.$(), "Rendered");
	});
});