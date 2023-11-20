/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Table",
	"sap/ui/webc/main/TableColumn",
	"sap/ui/webc/main/Button",
	"sap/ui/webc/main/TableGroupRow",
	"sap/ui/webc/main/TableRow",
	"sap/ui/webc/main/TableCell"
], function(createAndAppendDiv, Core, Table, TableColumn, Button, TableGroupRow, TableRow, TableCell) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oTable = new Table({
				growingButtonSubtext: "Some text...",
				growingButtonText: "Some text...",
				noDataText: "Some text...",
				columns: [
					new TableColumn({
						popinText: "Some text...",
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
						]
					}),
					new TableColumn({
						popinText: "Some text...",
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
						]
					}),
					new TableColumn({
						popinText: "Some text...",
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
						]
					})
				],
				rows: [
					new TableGroupRow({
						text: "Some text..."
					}),
					new TableRow({
						cells: [
							new TableCell({
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
								]
							}),
							new TableCell({
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
								]
							}),
							new TableCell({
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
								]
							})
						]
					}),
					new TableGroupRow({
						text: "Some text..."
					})
				],
				loadMore: function(oEvent) {
					// console.log("Event loadMore fired for Table with parameters: ", oEvent.getParameters());
				},
				popinChange: function(oEvent) {
					// console.log("Event popinChange fired for Table with parameters: ", oEvent.getParameters());
				},
				rowClick: function(oEvent) {
					// console.log("Event rowClick fired for Table with parameters: ", oEvent.getParameters());
				},
				selectionChange: function(oEvent) {
					// console.log("Event selectionChange fired for Table with parameters: ", oEvent.getParameters());
				}
			});
			this.oTable.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oTable = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oTable.$(), "Rendered");
	});
});