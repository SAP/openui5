/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/TabContainer",
	"sap/ui/webc/main/Tab",
	"sap/ui/webc/main/Button",
	"sap/ui/webc/main/TabSeparator"
], function(createAndAppendDiv, Core, TabContainer, Tab, Button, TabSeparator) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oTabContainer = new TabContainer({
				items: [
					new Tab({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
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
						subTabs: [
							new Tab({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
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
								subTabs: [
									new Tab({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										content: [

										],
										subTabs: [

										]
									}),
									new TabSeparator({

									}),
									new Tab({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										content: [

										],
										subTabs: [

										]
									})
								]
							}),
							new TabSeparator({

							}),
							new Tab({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
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
								subTabs: [
									new Tab({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										content: [

										],
										subTabs: [

										]
									}),
									new TabSeparator({

									}),
									new Tab({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										content: [

										],
										subTabs: [

										]
									})
								]
							})
						]
					}),
					new TabSeparator({

					}),
					new Tab({
						additionalText: "Some text...",
						icon: "employee",
						text: "Some text...",
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
						subTabs: [
							new Tab({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
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
								subTabs: [
									new Tab({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										content: [

										],
										subTabs: [

										]
									}),
									new TabSeparator({

									}),
									new Tab({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										content: [

										],
										subTabs: [

										]
									})
								]
							}),
							new TabSeparator({

							}),
							new Tab({
								additionalText: "Some text...",
								icon: "employee",
								text: "Some text...",
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
								subTabs: [
									new Tab({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										content: [

										],
										subTabs: [

										]
									}),
									new TabSeparator({

									}),
									new Tab({
										additionalText: "Some text...",
										icon: "employee",
										text: "Some text...",
										content: [

										],
										subTabs: [

										]
									})
								]
							})
						]
					})
				],
				overflowButton: new Button({
					icon: "employee",
					text: "Some text...",
					click: function(oEvent) {
						// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
					}
				}),
				startOverflowButton: new Button({
					icon: "employee",
					text: "Some text...",
					click: function(oEvent) {
						// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
					}
				}),
				tabSelect: function(oEvent) {
					// console.log("Event tabSelect fired for TabContainer with parameters: ", oEvent.getParameters());
				}
			});
			this.oTabContainer.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTabContainer.destroy();
			this.oTabContainer = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oTabContainer.$(), "Rendered");
	});
});