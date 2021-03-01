/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/SideNavigation",
	"sap/ui/webc/fiori/SideNavigationItem",
	"sap/ui/webc/fiori/SideNavigationSubItem",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, SideNavigation, SideNavigationItem, SideNavigationSubItem, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oSideNavigation = new SideNavigation({
				fixedItems: [
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							})
						]
					}),
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							})
						]
					}),
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							})
						]
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
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							})
						]
					}),
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							})
						]
					}),
					new SideNavigationItem({
						icon: "employee",
						text: "Some text...",
						items: [
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							}),
							new SideNavigationSubItem({
								icon: "employee",
								text: "Some text..."
							})
						]
					})
				],
				selectionChange: function(oEvent) {
					// console.log("Event selectionChange fired for SideNavigation with parameters: ", oEvent.getParameters());
				}
			});
			this.oSideNavigation.placeAt("uiArea");
			Core.applyChanges();
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