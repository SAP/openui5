/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/fiori/SideNavigation",
	"sap/ui/webc/fiori/SideNavigationItem",
	"sap/ui/webc/fiori/SideNavigationSubItem",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, nextUIUpdate, SideNavigation, SideNavigationItem, SideNavigationSubItem, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oSideNavigation = new SideNavigation({
				fixedItems: [
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							})
						],
						click: function(oEvent) {
							// console.log("Event click fired for SideNavigationItem with parameters: ", oEvent.getParameters());
						}
					}),
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							})
						],
						click: function(oEvent) {
							// console.log("Event click fired for SideNavigationItem with parameters: ", oEvent.getParameters());
						}
					}),
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							})
						],
						click: function(oEvent) {
							// console.log("Event click fired for SideNavigationItem with parameters: ", oEvent.getParameters());
						}
					})
				],
				header: [
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
				items: [
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							})
						],
						click: function(oEvent) {
							// console.log("Event click fired for SideNavigationItem with parameters: ", oEvent.getParameters());
						}
					}),
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							})
						],
						click: function(oEvent) {
							// console.log("Event click fired for SideNavigationItem with parameters: ", oEvent.getParameters());
						}
					}),
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text...",
								click: function(oEvent) {
									// console.log("Event click fired for SideNavigationSubItem with parameters: ", oEvent.getParameters());
								}
							})
						],
						click: function(oEvent) {
							// console.log("Event click fired for SideNavigationItem with parameters: ", oEvent.getParameters());
						}
					})
				],
				selectionChange: function(oEvent) {
					// console.log("Event selectionChange fired for SideNavigation with parameters: ", oEvent.getParameters());
				}
			});
			this.oSideNavigation.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oSideNavigation.destroy();
			this.oSideNavigation = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oSideNavigation.$(), "Rendered");
	});
});