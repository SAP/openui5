/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/NotificationListItem",
	"sap/ui/webc/fiori/NotificationAction",
	"sap/ui/webc/main/Avatar",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, NotificationListItem, NotificationAction, Avatar, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oNotificationListItem = new NotificationListItem({
				titleText: "Some text...",
				actions: [
					new NotificationAction({
						icon: "employee",
						text: "Some text..."
					}),
					new NotificationAction({
						icon: "employee",
						text: "Some text..."
					}),
					new NotificationAction({
						icon: "employee",
						text: "Some text..."
					})
				],
				avatar: new Avatar({
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
				footnotes: [
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
				close: function(oEvent) {
					// console.log("Event close fired for NotificationListItem with parameters: ", oEvent.getParameters());
				}
			});
			this.oNotificationListItem.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oNotificationListItem.destroy();
			this.oNotificationListItem = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oNotificationListItem.$(), "Rendered");
	});
});