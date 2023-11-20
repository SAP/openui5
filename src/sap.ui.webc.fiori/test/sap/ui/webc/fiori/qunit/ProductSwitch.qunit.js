/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/ProductSwitch",
	"sap/ui/webc/fiori/ProductSwitchItem"
], function(createAndAppendDiv, Core, ProductSwitch, ProductSwitchItem) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oProductSwitch = new ProductSwitch({
				items: [
					new ProductSwitchItem({
						icon: "employee",
						subtitleText: "Some text...",
						titleText: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for ProductSwitchItem with parameters: ", oEvent.getParameters());
						}
					}),
					new ProductSwitchItem({
						icon: "employee",
						subtitleText: "Some text...",
						titleText: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for ProductSwitchItem with parameters: ", oEvent.getParameters());
						}
					}),
					new ProductSwitchItem({
						icon: "employee",
						subtitleText: "Some text...",
						titleText: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for ProductSwitchItem with parameters: ", oEvent.getParameters());
						}
					})
				]
			});
			this.oProductSwitch.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oProductSwitch.destroy();
			this.oProductSwitch = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oProductSwitch.$(), "Rendered");
	});
});