/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Carousel",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, Carousel, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oCarousel = new Carousel({
				content: [
					new Button({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
						}
					}),
					new Button({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
						}
					}),
					new Button({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
						}
					})
				],
				navigate: function(oEvent) {
					// console.log("Event navigate fired for Carousel with parameters: ", oEvent.getParameters());
				}
			});
			this.oCarousel.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oCarousel.destroy();
			this.oCarousel = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oCarousel.$(), "Rendered");
	});
});