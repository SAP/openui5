/*global sinon*/

sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/actions/Press'
], function (Opa5, PropertyStrictEquals, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheCodePage: {
			viewName: "Code",
			actions: {
				iPressOnShowCode : function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers : new PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://source-code"
						}),
						success : function (aButtons) {
							aButtons[0].$().trigger("tap");
						},
						errorMessage: "Did not find the show code button"
					});
				},

				iShouldSeeCodeEditor: function() {
					return this.waitFor({
						controlType: "sap.ui.codeeditor.CodeEditor",
						matchers: [

						],
						success: function (aControl) {
							const oCodeEditor = aControl[0];
							Opa5.assert.ok(true, "Found the editor ");
							oCodeEditor.setValue(`<mvc:View
							controllerName="sap.m.sample.GenericTag.Page"
							xmlns:mvc="sap.ui.core.mvc"
							xmlns="sap.m"
							xmlns:l="sap.ui.layout"</mvc:View>`);

							Opa5.assert.ok(oCodeEditor.getValue() == `<mvc:View
							controllerName="sap.m.sample.GenericTag.Page"
							xmlns:mvc="sap.ui.core.mvc"
							xmlns="sap.m"
							xmlns:l="sap.ui.layout"</mvc:View>`, "File content was changed");
						},
						errorMessage: "The code editor button was not found"
					});
				}
			},

			assertions: {
				iCheckThatTheDownloadButtonWorks : function () {
					return this.waitFor({
						viewName: "Code",
						controlType: "sap.m.Button",
						matchers : new PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://download"
						}),
						success : function (aButtons) {
							var oControllerPrototype = Opa5.getWindow().sap.ui.documentation.sdk.controller.SampleBaseController.prototype,
							oAssert =  Opa5.assert,
							fnDone = oAssert.async(),
							oOpenFileStub = sinon.stub(oControllerPrototype, "_openGeneratedFile", function() {
								oAssert.strictEqual(oOpenFileStub.callCount, 1, "did open the generated file");
								oOpenFileStub.restore();
								fnDone();
							});
							aButtons[0].fireEvent("press");
							return this.waitFor({
								viewName: "Code",
								controlType: "sap.ui.unified.MenuItem",
								matchers : new PropertyStrictEquals({
									name: "icon",
									value: "sap-icon://attachment-zip-file"
								}),
								success : function (aItems) {
									aItems[0].$().trigger("click");
								},
								errorMessage: "Did not find the download Select Button"
							});

						},
						errorMessage: "Did not find the download Button"
					});

				},

				iShouldSeeResetChangesButton: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new PropertyStrictEquals({
								name: "Text",
								value: "Reset all Changes"
							})
						],
						success: function (aButtons) {
							Opa5.assert.ok(true, "Found the button " + aButtons[0].getText());
						},
						errorMessage: "The reset settings button was not found"
					});
				},

				iShouldBeAbleToSwitchFiles: function(sFileName) {
					return this.waitFor({
						controlType: "sap.m.IconTabFilter",
						actions: new Press(),
						matchers: [
							new PropertyStrictEquals({
								name: "Text",
								value: sFileName
							})
						],
						success: function (aControl) {
							Opa5.assert.ok(true, "Found the tab " + aControl[0].getText());
						},
						errorMessage: "The tab filter was not found"
					});
				},

				iShouldSeeEditedNotification: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new PropertyStrictEquals({
								name: "icon",
								value: "sap-icon://warning"
							})
						],
						success: function (aControl) {
							Opa5.assert.ok(true, "Found the visual notification of the edited sample");
						},
						errorMessage: "The tab filter was not found"
					});
				},

				iShouldSeeAnErrorOnThePage: function() {
					return this.waitFor({
						controlType: "sap.m.MessageStrip",
						matchers: [
							new PropertyStrictEquals({
								name: "Type",
								value: "Error"
							})
						],
						success: function (aControl) {
							Opa5.assert.ok(true, "An error appeared when entering invalid code");
						},
						errorMessage: "An error MessageStrip was not found on the page"
					});
				}
			}
		}
	});

});
