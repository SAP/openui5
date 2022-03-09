/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/MessageStrip",
	"sap/ui/webc/main/Icon"
], function(createAndAppendDiv, Core, MessageStrip, Icon) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oMessageStrip = new MessageStrip({
				text: "Some text...",
				icon: new Icon({
					color: "blue",
					name: "add",
					click: function(oEvent) {
						// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
					}
				}),
				close: function(oEvent) {
					// console.log("Event close fired for MessageStrip with parameters: ", oEvent.getParameters());
				}
			});
			this.oMessageStrip.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oMessageStrip.destroy();
			this.oMessageStrip = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oMessageStrip.$(), "Rendered");
	});
});