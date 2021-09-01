/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/List",
	"sap/ui/webc/main/Button",
	"sap/ui/webc/main/CustomListItem",
	"sap/ui/webc/main/GroupHeaderListItem",
	"sap/ui/webc/main/StandardListItem"
], function(createAndAppendDiv, Core, List, Button, CustomListItem, GroupHeaderListItem, StandardListItem) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oList = new List({
				footerText: "Some text...",
				headerText: "Some text...",
				noDataText: "Some text...",
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
					new CustomListItem({
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
						detailClick: function(oEvent) {
							// console.log("Event detailClick fired for CustomListItem with parameters: ", oEvent.getParameters());
						}
					}),
					new GroupHeaderListItem({
						text: "Some text..."
					}),
					new StandardListItem({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
						detailClick: function(oEvent) {
							// console.log("Event detailClick fired for StandardListItem with parameters: ", oEvent.getParameters());
						}
					})
				],
				itemClick: function(oEvent) {
					// console.log("Event itemClick fired for List with parameters: ", oEvent.getParameters());
				},
				itemClose: function(oEvent) {
					// console.log("Event itemClose fired for List with parameters: ", oEvent.getParameters());
				},
				itemDelete: function(oEvent) {
					// console.log("Event itemDelete fired for List with parameters: ", oEvent.getParameters());
				},
				itemToggle: function(oEvent) {
					// console.log("Event itemToggle fired for List with parameters: ", oEvent.getParameters());
				},
				loadMore: function(oEvent) {
					// console.log("Event loadMore fired for List with parameters: ", oEvent.getParameters());
				},
				selectionChange: function(oEvent) {
					// console.log("Event selectionChange fired for List with parameters: ", oEvent.getParameters());
				}
			});
			this.oList.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oList.destroy();
			this.oList = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oList.$(), "Rendered");
	});
});