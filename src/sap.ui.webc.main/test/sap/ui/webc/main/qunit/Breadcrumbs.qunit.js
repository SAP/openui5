/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Breadcrumbs",
	"sap/ui/webc/main/BreadcrumbsItem"
], function(createAndAppendDiv, Core, Breadcrumbs, BreadcrumbsItem) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oBreadcrumbs = new Breadcrumbs({
				items: [
					new BreadcrumbsItem({
						text: "Some text..."
					}),
					new BreadcrumbsItem({
						text: "Some text..."
					}),
					new BreadcrumbsItem({
						text: "Some text..."
					})
				],
				itemClick: function(oEvent) {
					// console.log("Event itemClick fired for Breadcrumbs with parameters: ", oEvent.getParameters());
				}
			});
			this.oBreadcrumbs.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oBreadcrumbs.destroy();
			this.oBreadcrumbs = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oBreadcrumbs.$(), "Rendered");
	});
});