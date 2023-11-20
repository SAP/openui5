/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Menu",
	"sap/ui/webc/main/MenuItem",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, Menu, MenuItem, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oMenu = new Menu({
				headerText: "Some text...",
				items: [
					new MenuItem({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
						items: [
							new MenuItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									})
								]
							}),
							new MenuItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									})
								]
							}),
							new MenuItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									})
								]
							})
						]
					}),
					new MenuItem({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
						items: [
							new MenuItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									})
								]
							}),
							new MenuItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									})
								]
							}),
							new MenuItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									})
								]
							})
						]
					}),
					new MenuItem({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
						items: [
							new MenuItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									})
								]
							}),
							new MenuItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									})
								]
							}),
							new MenuItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									}),
									new MenuItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text..."
									})
								]
							})
						]
					})
				],
				afterClose: function(oEvent) {
					// console.log("Event afterClose fired for Menu with parameters: ", oEvent.getParameters());
				},
				afterOpen: function(oEvent) {
					// console.log("Event afterOpen fired for Menu with parameters: ", oEvent.getParameters());
				},
				beforeClose: function(oEvent) {
					// console.log("Event beforeClose fired for Menu with parameters: ", oEvent.getParameters());
				},
				beforeOpen: function(oEvent) {
					// console.log("Event beforeOpen fired for Menu with parameters: ", oEvent.getParameters());
				},
				itemClick: function(oEvent) {
					// console.log("Event itemClick fired for Menu with parameters: ", oEvent.getParameters());
				}
			});
			this.oMenu.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oMenu.destroy();
			this.oMenu = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oMenu.$(), "Rendered");
	});
});