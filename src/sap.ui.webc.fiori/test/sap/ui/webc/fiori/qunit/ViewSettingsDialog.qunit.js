/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/fiori/ViewSettingsDialog",
	"sap/ui/webc/fiori/FilterItem",
	"sap/ui/webc/fiori/FilterItemOption",
	"sap/ui/webc/fiori/SortItem",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, nextUIUpdate, ViewSettingsDialog, FilterItem, FilterItemOption, SortItem, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oViewSettingsDialog = new ViewSettingsDialog({
				filterItems: [
					new FilterItem({
						text: "Some text...",
						values: [
							new FilterItemOption({
								text: "Some text..."
							}),
							new FilterItemOption({
								text: "Some text..."
							}),
							new FilterItemOption({
								text: "Some text..."
							})
						]
					}),
					new FilterItem({
						text: "Some text...",
						values: [
							new FilterItemOption({
								text: "Some text..."
							}),
							new FilterItemOption({
								text: "Some text..."
							}),
							new FilterItemOption({
								text: "Some text..."
							})
						]
					}),
					new FilterItem({
						text: "Some text...",
						values: [
							new FilterItemOption({
								text: "Some text..."
							}),
							new FilterItemOption({
								text: "Some text..."
							}),
							new FilterItemOption({
								text: "Some text..."
							})
						]
					})
				],
				sortItems: [
					new SortItem({
						text: "Some text..."
					}),
					new SortItem({
						text: "Some text..."
					}),
					new SortItem({
						text: "Some text..."
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
			await nextUIUpdate();
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