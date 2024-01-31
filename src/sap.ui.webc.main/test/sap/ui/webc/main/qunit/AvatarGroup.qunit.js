/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/AvatarGroup",
	"sap/ui/webc/main/Avatar",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, nextUIUpdate, AvatarGroup, Avatar, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oAvatarGroup = new AvatarGroup({
				items: [
					new Avatar({
						icon: "employee",
						badge: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						}),
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
					new Avatar({
						icon: "employee",
						badge: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						}),
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
					new Avatar({
						icon: "employee",
						badge: new Button({
							icon: "employee",
							text: "Some text...",
							click: function(oEvent) {
								// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
							}
						}),
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
					})
				],
				overflowButton: new Button({
					icon: "employee",
					text: "Some text...",
					click: function(oEvent) {
						// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
					}
				}),
				click: function(oEvent) {
					// console.log("Event click fired for AvatarGroup with parameters: ", oEvent.getParameters());
				},
				overflow: function(oEvent) {
					// console.log("Event overflow fired for AvatarGroup with parameters: ", oEvent.getParameters());
				}
			});
			this.oAvatarGroup.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oAvatarGroup.destroy();
			this.oAvatarGroup = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oAvatarGroup.$(), "Rendered");
	});
});