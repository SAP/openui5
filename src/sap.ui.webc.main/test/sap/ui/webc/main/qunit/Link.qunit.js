/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/Link"
], function(createAndAppendDiv, nextUIUpdate, Link) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oLink = new Link({
				text: "Some text...",
				click: function(oEvent) {
					// console.log("Event click fired for Link with parameters: ", oEvent.getParameters());
				}
			});
			this.oLink.placeAt("uiArea");
			await nextUIUpdate();
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