/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/Timeline",
	"sap/ui/webc/fiori/TimelineItem",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, Timeline, TimelineItem, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oTimeline = new Timeline({
				items: [
					new TimelineItem({
						icon: "employee",
						subtitleText: "Some text...",
						titleText: "Some text...",
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
						nameClick: function(oEvent) {
							// console.log("Event nameClick fired for TimelineItem with parameters: ", oEvent.getParameters());
						}
					}),
					new TimelineItem({
						icon: "employee",
						subtitleText: "Some text...",
						titleText: "Some text...",
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
						nameClick: function(oEvent) {
							// console.log("Event nameClick fired for TimelineItem with parameters: ", oEvent.getParameters());
						}
					}),
					new TimelineItem({
						icon: "employee",
						subtitleText: "Some text...",
						titleText: "Some text...",
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
						nameClick: function(oEvent) {
							// console.log("Event nameClick fired for TimelineItem with parameters: ", oEvent.getParameters());
						}
					})
				]
			});
			this.oTimeline.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTimeline.destroy();
			this.oTimeline = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oTimeline.$(), "Rendered");
	});
});