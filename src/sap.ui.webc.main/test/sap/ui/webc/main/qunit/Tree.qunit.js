/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Tree",
	"sap/ui/webc/main/Button",
	"sap/ui/webc/main/TreeItem",
	"sap/ui/webc/main/TreeItemCustom"
], function(createAndAppendDiv, Core, Tree, Button, TreeItem, TreeItemCustom) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oTree = new Tree({
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
					new TreeItem({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
						deleteButton: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						}),
						items: [
							new TreeItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								deleteButton: new Button({
									icon: "employee",
									text: "Some text...",
									click: function(oEvent) {
										// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
									}
								}),
								items: [
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItemCustom({
										icon: "employee",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									})
								],
								detailClick: function(oEvent) {
									// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
								}
							}),
							new TreeItemCustom({
								icon: "employee",
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
								items: [
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItemCustom({
										icon: "employee",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									})
								],
								detailClick: function(oEvent) {
									// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
								}
							}),
							new TreeItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								deleteButton: new Button({
									icon: "employee",
									text: "Some text...",
									click: function(oEvent) {
										// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
									}
								}),
								items: [
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItemCustom({
										icon: "employee",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									})
								],
								detailClick: function(oEvent) {
									// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
								}
							})
						],
						detailClick: function(oEvent) {
							// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
						}
					}),
					new TreeItemCustom({
						icon: "employee",
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
						items: [
							new TreeItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								deleteButton: new Button({
									icon: "employee",
									text: "Some text...",
									click: function(oEvent) {
										// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
									}
								}),
								items: [
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItemCustom({
										icon: "employee",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									})
								],
								detailClick: function(oEvent) {
									// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
								}
							}),
							new TreeItemCustom({
								icon: "employee",
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
								items: [
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItemCustom({
										icon: "employee",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									})
								],
								detailClick: function(oEvent) {
									// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
								}
							}),
							new TreeItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								deleteButton: new Button({
									icon: "employee",
									text: "Some text...",
									click: function(oEvent) {
										// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
									}
								}),
								items: [
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItemCustom({
										icon: "employee",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									})
								],
								detailClick: function(oEvent) {
									// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
								}
							})
						],
						detailClick: function(oEvent) {
							// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
						}
					}),
					new TreeItem({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
						deleteButton: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						}),
						items: [
							new TreeItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								deleteButton: new Button({
									icon: "employee",
									text: "Some text...",
									click: function(oEvent) {
										// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
									}
								}),
								items: [
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItemCustom({
										icon: "employee",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									})
								],
								detailClick: function(oEvent) {
									// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
								}
							}),
							new TreeItemCustom({
								icon: "employee",
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
								items: [
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItemCustom({
										icon: "employee",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									})
								],
								detailClick: function(oEvent) {
									// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
								}
							}),
							new TreeItem({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
								deleteButton: new Button({
									icon: "employee",
									text: "Some text...",
									click: function(oEvent) {
										// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
									}
								}),
								items: [
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItemCustom({
										icon: "employee",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItemCustom with parameters: ", oEvent.getParameters());
										}
									}),
									new TreeItem({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										detailClick: function(oEvent) {
											// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
										}
									})
								],
								detailClick: function(oEvent) {
									// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
								}
							})
						],
						detailClick: function(oEvent) {
							// console.log("Event detailClick fired for TreeItem with parameters: ", oEvent.getParameters());
						}
					})
				],
				itemClick: function(oEvent) {
					// console.log("Event itemClick fired for Tree with parameters: ", oEvent.getParameters());
				},
				itemDelete: function(oEvent) {
					// console.log("Event itemDelete fired for Tree with parameters: ", oEvent.getParameters());
				},
				itemMouseout: function(oEvent) {
					// console.log("Event itemMouseout fired for Tree with parameters: ", oEvent.getParameters());
				},
				itemMouseover: function(oEvent) {
					// console.log("Event itemMouseover fired for Tree with parameters: ", oEvent.getParameters());
				},
				itemToggle: function(oEvent) {
					// console.log("Event itemToggle fired for Tree with parameters: ", oEvent.getParameters());
				},
				selectionChange: function(oEvent) {
					// console.log("Event selectionChange fired for Tree with parameters: ", oEvent.getParameters());
				}
			});
			this.oTree.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oTree.$(), "Rendered");
	});
});