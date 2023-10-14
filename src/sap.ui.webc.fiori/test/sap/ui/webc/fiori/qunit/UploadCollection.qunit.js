/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/UploadCollection",
	"sap/ui/webc/main/Button",
	"sap/ui/webc/fiori/UploadCollectionItem"
], function(createAndAppendDiv, Core, UploadCollection, Button, UploadCollectionItem) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oUploadCollection = new UploadCollection({
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
					new UploadCollectionItem({
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
						deleteButton: new Button({
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
						}),
						detailClick: function(oEvent) {
							// console.log("Event detailClick fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						fileNameClick: function(oEvent) {
							// console.log("Event fileNameClick fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						rename: function(oEvent) {
							// console.log("Event rename fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						retry: function(oEvent) {
							// console.log("Event retry fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						terminate: function(oEvent) {
							// console.log("Event terminate fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						}
					}),
					new UploadCollectionItem({
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
						deleteButton: new Button({
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
						}),
						detailClick: function(oEvent) {
							// console.log("Event detailClick fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						fileNameClick: function(oEvent) {
							// console.log("Event fileNameClick fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						rename: function(oEvent) {
							// console.log("Event rename fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						retry: function(oEvent) {
							// console.log("Event retry fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						terminate: function(oEvent) {
							// console.log("Event terminate fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						}
					}),
					new UploadCollectionItem({
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
						deleteButton: new Button({
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
						}),
						detailClick: function(oEvent) {
							// console.log("Event detailClick fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						fileNameClick: function(oEvent) {
							// console.log("Event fileNameClick fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						rename: function(oEvent) {
							// console.log("Event rename fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						retry: function(oEvent) {
							// console.log("Event retry fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						},
						terminate: function(oEvent) {
							// console.log("Event terminate fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
						}
					})
				],
				drop: function(oEvent) {
					// console.log("Event drop fired for UploadCollection with parameters: ", oEvent.getParameters());
				},
				itemDelete: function(oEvent) {
					// console.log("Event itemDelete fired for UploadCollection with parameters: ", oEvent.getParameters());
				},
				selectionChange: function(oEvent) {
					// console.log("Event selectionChange fired for UploadCollection with parameters: ", oEvent.getParameters());
				}
			});
			this.oUploadCollection.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oUploadCollection.$(), "Rendered");
	});
});