/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/ViewSettingsDialog",
	"sap/ui/webc/main/CustomListItem",
	"sap/ui/webc/main/Button",
	"sap/ui/webc/main/GroupHeaderListItem",
	"sap/ui/webc/main/StandardListItem"
], function(createAndAppendDiv, Core, ViewSettingsDialog, CustomListItem, Button, GroupHeaderListItem, StandardListItem) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oViewSettingsDialog = new ViewSettingsDialog({
				sortItems: [
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
				cancel: function(oEvent) {
					// console.log("Event cancel fired for ViewSettingsDialog with parameters: ", oEvent.getParameters());
				},
				confirm: function(oEvent) {
					// console.log("Event confirm fired for ViewSettingsDialog with parameters: ", oEvent.getParameters());
				}
			});
			this.oViewSettingsDialog.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oViewSettingsDialog.destroy();
			this.oViewSettingsDialog = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oViewSettingsDialog.$(), "Rendered");
	});
});