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
						icon: "employee",
						text: "Some text...",
						items: [
							new MenuItem({
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									})
								]
							}),
							new MenuItem({
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									})
								]
							}),
							new MenuItem({
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									})
								]
							})
						]
					}),
					new MenuItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new MenuItem({
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									})
								]
							}),
							new MenuItem({
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									})
								]
							}),
							new MenuItem({
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									})
								]
							})
						]
					}),
					new MenuItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new MenuItem({
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									})
								]
							}),
							new MenuItem({
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									})
								]
							}),
							new MenuItem({
								icon: "employee",
								text: "Some text...",
								items: [
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									}),
									new MenuItem({
										icon: "employee",
										text: "Some text...",
										items: [

										]
									})
								]
							})
						]
					})
				],
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