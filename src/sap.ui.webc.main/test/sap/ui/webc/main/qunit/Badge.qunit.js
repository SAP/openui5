/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/Badge",
	"sap/ui/webc/main/Icon"
], function(createAndAppendDiv, Core, nextUIUpdate, Badge, Icon) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oBadge = new Badge({
				text: "Some text...",
				icon: [
					new Icon({
						color: "blue",
						name: "add",
						click: function(oEvent) {
							// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
						}
					}),
					new Icon({
						color: "blue",
						name: "add",
						click: function(oEvent) {
							// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
						}
					}),
					new Icon({
						color: "blue",
						name: "add",
						click: function(oEvent) {
							// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
						}
					})
				]
			});
			this.oBadge.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oBadge.destroy();
			this.oBadge = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oBadge.$(), "Rendered");
	});
});