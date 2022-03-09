/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/ShellBar",
	"sap/ui/webc/fiori/ShellBarItem",
	"sap/ui/webc/main/Avatar",
	"sap/ui/webc/main/Button",
	"sap/ui/webc/main/CustomListItem",
	"sap/ui/webc/main/GroupHeaderListItem",
	"sap/ui/webc/main/StandardListItem",
	"sap/ui/webc/main/Input",
	"sap/ui/webc/main/Icon",
	"sap/ui/webc/main/SuggestionGroupItem",
	"sap/ui/webc/main/SuggestionItem"
], function(createAndAppendDiv, Core, ShellBar, ShellBarItem, Avatar, Button, CustomListItem, GroupHeaderListItem, StandardListItem, Input, Icon, SuggestionGroupItem, SuggestionItem) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oShellBar = new ShellBar({
				items: [
					new ShellBarItem({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for ShellBarItem with parameters: ", oEvent.getParameters());
						}
					}),
					new ShellBarItem({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for ShellBarItem with parameters: ", oEvent.getParameters());
						}
					}),
					new ShellBarItem({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for ShellBarItem with parameters: ", oEvent.getParameters());
						}
					})
				],
				logo: new Avatar({
					icon: "employee",
					image: new Button({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
						}
					}),
					click: function(oEvent) {
						// console.log("Event click fired for Avatar with parameters: ", oEvent.getParameters());
					}
				}),
				menuItems: [
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
				profile: new Avatar({
					icon: "employee",
					image: new Button({
						icon: "employee",
						text: "Some text...",
						click: function(oEvent) {
							// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
						}
					}),
					click: function(oEvent) {
						// console.log("Event click fired for Avatar with parameters: ", oEvent.getParameters());
					}
				}),
				searchField: new Input({
					placeholder: "This is my placeholder value",
					value: "Control value",
					valueState: "Warning",
					valueStateMessage: "Value State Message",
					icon: [
						new Icon({
							color: "blue",
							name: "add",
							click: function(oEvent) {
								// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
							}
						}),
						new Icon({
							color: "blue",
							name: "add",
							click: function(oEvent) {
								// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
							}
						}),
						new Icon({
							color: "blue",
							name: "add",
							click: function(oEvent) {
								// console.log("Event click fired for Icon with parameters: ", oEvent.getParameters());
							}
						})
					],
					suggestionItems: [
						new SuggestionGroupItem({
							text: "Some text..."
						}),
						new SuggestionItem({
							additionalText: "Some text...",
							icon: "employee",
							text: "Some text..."
						}),
						new SuggestionGroupItem({
							text: "Some text..."
						})
					],
					change: function(oEvent) {
						// console.log("Event change fired for Input with parameters: ", oEvent.getParameters());
					},
					input: function(oEvent) {
						// console.log("Event input fired for Input with parameters: ", oEvent.getParameters());
					},
					suggestionItemPreview: function(oEvent) {
						// console.log("Event suggestionItemPreview fired for Input with parameters: ", oEvent.getParameters());
					},
					suggestionItemSelect: function(oEvent) {
						// console.log("Event suggestionItemSelect fired for Input with parameters: ", oEvent.getParameters());
					}
				}),
				startButton: new Button({
					icon: "employee",
					text: "Some text...",
					click: function(oEvent) {
						// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
					}
				}),
				coPilotClick: function(oEvent) {
					// console.log("Event coPilotClick fired for ShellBar with parameters: ", oEvent.getParameters());
				},
				logoClick: function(oEvent) {
					// console.log("Event logoClick fired for ShellBar with parameters: ", oEvent.getParameters());
				},
				menuItemClick: function(oEvent) {
					// console.log("Event menuItemClick fired for ShellBar with parameters: ", oEvent.getParameters());
				},
				notificationsClick: function(oEvent) {
					// console.log("Event notificationsClick fired for ShellBar with parameters: ", oEvent.getParameters());
				},
				productSwitchClick: function(oEvent) {
					// console.log("Event productSwitchClick fired for ShellBar with parameters: ", oEvent.getParameters());
				},
				profileClick: function(oEvent) {
					// console.log("Event profileClick fired for ShellBar with parameters: ", oEvent.getParameters());
				}
			});
			this.oShellBar.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oShellBar.destroy();
			this.oShellBar = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oShellBar.$(), "Rendered");
	});
});