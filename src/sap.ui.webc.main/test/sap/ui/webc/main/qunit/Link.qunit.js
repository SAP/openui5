/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Link"
], function(createAndAppendDiv, Core, Link) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oLink = new Link({
				text: "Some text...",
				click: function(oEvent) {
					// console.log("Event click fired for Link with parameters: ", oEvent.getParameters());
				}
			});
			this.oLink.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oLink.destroy();
			this.oLink = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oLink.$(), "Rendered");
	});
});