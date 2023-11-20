/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/fiori/Wizard",
	"sap/ui/webc/fiori/WizardStep",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, Wizard, WizardStep, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oWizard = new Wizard({
				steps: [
					new WizardStep({
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
						]
					}),
					new WizardStep({
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
						]
					}),
					new WizardStep({
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
						]
					})
				],
				stepChange: function(oEvent) {
					// console.log("Event stepChange fired for Wizard with parameters: ", oEvent.getParameters());
				}
			});
			this.oWizard.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oWizard.destroy();
			this.oWizard = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oWizard.$(), "Rendered");
	});
});