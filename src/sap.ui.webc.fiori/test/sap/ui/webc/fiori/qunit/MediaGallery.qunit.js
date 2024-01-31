/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/fiori/MediaGallery",
	"sap/ui/webc/fiori/MediaGalleryItem",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, nextUIUpdate, MediaGallery, MediaGalleryItem, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oMediaGallery = new MediaGallery({
				items: [
					new MediaGalleryItem({
						content: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						}),
						thumbnail: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						})
					}),
					new MediaGalleryItem({
						content: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						}),
						thumbnail: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						})
					}),
					new MediaGalleryItem({
						content: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						}),
						thumbnail: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						})
					})
				],
				displayAreaClick: function(oEvent) {
					// console.log("Event displayAreaClick fired for MediaGallery with parameters: ", oEvent.getParameters());
				},
				overflowClick: function(oEvent) {
					// console.log("Event overflowClick fired for MediaGallery with parameters: ", oEvent.getParameters());
				},
				selectionChange: function(oEvent) {
					// console.log("Event selectionChange fired for MediaGallery with parameters: ", oEvent.getParameters());
				}
			});
			this.oMediaGallery.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oMediaGallery.destroy();
			this.oMediaGallery = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oMediaGallery.$(), "Rendered");
	});
});