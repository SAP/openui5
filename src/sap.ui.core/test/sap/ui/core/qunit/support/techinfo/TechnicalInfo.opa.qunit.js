/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require('sap.ui.qunit.QUnitUtils');

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/Device",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/I18NText"
],
function (Device, Opa5, opaTest, Press, PropertyStrictEquals, Ancestor, I18NText) {
	"use strict";

	var sTestPageURL = "TechnicalInfoTestbench.html";
	var sOpenUI5BetaKey = "https://openui5beta.hana.ondemand.com/resources/sap/ui/support/";

	Opa5.extendConfig({
		autoWait : true
	});

	Opa5.createPageObjects({
		anywhere: {
			actions: {
				iPressCtrlAltShiftP: function () {
					return this.waitFor({
						actions: function () {
							var oWindow = Opa5.getWindow(),
								bOpened = false;

							try {
								// trigger left ALT key (there is a separate check in jQuery.sap.global for this)
								var oEvent = new KeyboardEvent("keydown", {
									bubbles: true,
									cancelable: true,
									keyCode: 18,
									location: 1
								});
								oWindow.document.dispatchEvent(oEvent);

								// trigger CTRL+ALT+SHIFT+P
								oEvent = new KeyboardEvent("keydown", {
									bubbles: true,
									cancelable: true,
									keyCode: 80,
									ctrlKey: true,
									altKey: true,
									shiftKey: true
								});
								oWindow.document.dispatchEvent(oEvent);
							} catch (oException) {
								// IE does not support this and will go here
								bOpened = false;
							}

							// Fallback: Load TechnicalInfo dialog manually
							// Chrome passes the above code but does not support creating custom keyCode Event
							if (!bOpened || Device.browser.chrome) {
								oWindow.sap.ui.require(['sap/ui/core/support/techinfo/TechnicalInfo'], function (TechnicalInfo) {
									TechnicalInfo.open();
								});
							}
						},
						errorMessage: "Could not open Technical Information Dialog",
						success: function () {
							Opa5.assert.ok(true, "Opened the Technical Information Dialog");
						}
					});
				}
			},
			assertions: {
				iShouldSeeTheTechnicalInformationDialog: function () {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						success: function (aDialogs) {
							var oDialog = aDialogs[0];

							Opa5.assert.strictEqual(aDialogs.length, 1, "Found the Technical Information Dialog");

							return this.waitFor({
								controlType: "sap.m.Title",
								matchers: [
									new Ancestor(oDialog),
									new I18NText({
										propertyName : "text",
										key: "TechInfo.DialogTitle"
									})
								],
								success: function () {
									Opa5.assert.ok(true, "Found the dialog title");
								}
							});
						}
					});
				},
				iShouldSeeAMessageToast: function () {
					return this.waitFor({
						pollingInterval: 100,
						check: function() {
							return !!Opa5.getJQuery()(".sapMMessageToast").length;
						},
						success: function() {
							Opa5.assert.ok(true, "The message toast was displayed");
						},
						errorMessage: "The message toast was not displayed"
					});
				}
			}
		},
		onTheDialog: {
			actions: {
				iPressTheCopyTechnicalInformationButton: function () {
					return this.waitFor({
						id : "technicalInfoDialog--Dialog",
						success : function (oDialog) {
							return this.waitFor({
								controlType : "sap.m.Button",
								matchers: [
									new Ancestor(oDialog),
									new PropertyStrictEquals({
										name: "icon",
										value: "sap-icon://copy"
									})
								],
								actions : new Press(),
								success : function () {
									Opa5.assert.ok(true, "Pressed the copy button");
								}
							});
						}
					});
				},
				iOpenSupportAssistantSettings: function () {
					return this.waitFor({
						id : "technicalInfoDialog--Dialog",
						success : function (oDialog) {
							return this.waitFor({
								controlType : "sap.m.Button",
								matchers: [
									new Ancestor(oDialog),
									new PropertyStrictEquals({
										name: "icon",
										value: "sap-icon://settings"
									})
								],
								actions : new Press(),
								success : function () {
									Opa5.assert.ok(true, "Pressed the support assistant settings button");
								}
							});
						}
					});
				},
				iSelectTheDebugSourcesCheckBox: function () {
					return this.waitFor({
						id : "technicalInfoDialog--Dialog",
						success : function (oDialog) {
							return this.waitFor({
								id : "technicalInfoDialog--debugMode",
								matchers: [
									new Ancestor(oDialog)
								],
								actions : new Press(),
								success : function () {
									Opa5.assert.ok(true, "Pressed the debug sources checkbox");
								}
							});
						}
					});
				},
				iPressTheCloseButton: function () {
					return this.waitFor({
						id : "technicalInfoDialog--Dialog",
						success : function (oDialog) {
							return this.waitFor({
								controlType : "sap.m.Button",
								matchers: [
									new Ancestor(oDialog),
									new I18NText({
										propertyName : "text",
										key: "CLOSE"
									})
								],
								actions : new Press(),
								success : function () {
									Opa5.assert.ok(true, "Pressed the close button");
								}
							});
						}
					});
				}
			},
			assertions: {
				iShouldSeeTheSupportAssistantConfigurationDialog : function () {
					return this.waitFor({
						controlType : "sap.m.Popover",
						matchers: new I18NText({
							propertyName : "title",
							key: "TechInfo.SupportAssistantConfigPopup.Title"
						}),
						success : function () {
							Opa5.assert.ok(true, "Found the support assistant configuration popover");
						}
					});
				},
				iShouldSeeAConfirmationMessageBox: function () {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers: new PropertyStrictEquals({name: "title", value: "Reload App"}),
						success : function (oDialog) {
							Opa5.assert.ok(true, "Found the reload app confirmation dialog");
							return this.waitFor({
								controlType : "sap.m.Button",
								matchers: [
									new Ancestor(oDialog[0]),
									new PropertyStrictEquals({name: "text", value: "Cancel"})
								],
								actions : new Press(),
								success : function () {
									Opa5.assert.ok(true, "Pressed the close button of the confirmation dialog");
								}
							});
						}
					});
				}
			}
		},
		onTheConfigDialog: {
			actions: {
				iSelectBootstrapOption: function (sWhich) {
					return this.waitFor({
						id : "technicalInfoDialogAssistantPopover--" + sWhich,
						actions : new Press(),
						success : function () {
							Opa5.assert.ok(true, "Selected the " + sWhich + " bootstrap option");
						}
					});
				},
				iSelectTheStandardBootstrapOption: function (sKey) {
					return this.waitFor({
						id: "technicalInfoDialogAssistantPopover--standardBootstrapURL",
						actions: new Press(),
						success: function () {
							return this.waitFor({
								controlType: "sap.ui.core.Item",
								matchers: [
									new PropertyStrictEquals({
										name: "key",
										value: sKey
									})
								],
								actions: new Press(),
								success: function () {
									Opa5.assert.ok(true, "Selected key: " + sKey);
								}
							});
						}
					});
				}
			},
			assertions: {
				theBootstrapOptionIsInTheRightState: function (sWhich, bEnabled) {
					return this.waitFor({
						id : "technicalInfoDialogAssistantPopover--" + sWhich + "BootstrapURL",
						autoWait: false,
						matchers: new PropertyStrictEquals({name: "enabled", value: bEnabled}),
						success : function () {
							Opa5.assert.ok(true, "The " + sWhich + " boostrap option is " + (bEnabled ? "enabled" : "disabled"));
						}
					});
				},
				theStandardBootstrapOptionIsSelected: function (sKey) {
					return this.waitFor({
						id : "technicalInfoDialogAssistantPopover--standardBootstrapURL",
						matchers: new PropertyStrictEquals({name: "selectedKey", value: sKey}),
						success : function () {
							Opa5.assert.ok(true, "Item with key is selected: " + sKey);
						}
					});
				}
			}
		}
	});

	QUnit.module("Opening/Closing");

	opaTest("Should open the Technical Information Dialog when pressing CTRL+ALT+SHIFT+P", function(Given, When, Then) {
		// Act
		Given.iStartMyAppInAFrame(sTestPageURL);

		// Action
		When.anywhere.iPressCtrlAltShiftP();

		// Assert
		Then.anywhere.iShouldSeeTheTechnicalInformationDialog();
	});

	QUnit.module("Main Features");

	opaTest("Should display a message toast when pressing the copy button", function(Given, When, Then) {
		// Act
		When.onTheDialog.iPressTheCopyTechnicalInformationButton();

		// Assert
		Then.anywhere.iShouldSeeAMessageToast();
	});

	opaTest("Should display a confirmation dialog when pressing the debug sources checkbox", function(Given, When, Then) {
		// Act
		When.onTheDialog.iSelectTheDebugSourcesCheckBox();

		// Assert
		Then.onTheDialog.iShouldSeeAConfirmationMessageBox();
	});

	QUnit.module("Support Assistant");

	opaTest("Should open the support assistant configuration popover when pressing the settings button", function(Given, When, Then) {
		// Act
		When.onTheDialog.iOpenSupportAssistantSettings();

		// Assert
		Then.onTheDialog.iShouldSeeTheSupportAssistantConfigurationDialog();
	});

	opaTest("Should disable the standard option in the support assistant configuration popover when selecting the custom option", function(Given, When, Then) {
		// Act
		When.onTheConfigDialog.iSelectBootstrapOption("custom");

		// Assert
		Then.onTheConfigDialog.theBootstrapOptionIsInTheRightState("custom", true).
		and.theBootstrapOptionIsInTheRightState("standard", false);
	});

	opaTest("Should disable the custom option in the support assistant configuration popover when selecting the standard option", function(Given, When, Then) {
		// Act
		When.onTheConfigDialog.iSelectBootstrapOption("standard");

		// Assert
		Then.onTheConfigDialog.theBootstrapOptionIsInTheRightState("custom", false).
		and.theBootstrapOptionIsInTheRightState("standard", true);
	});

	QUnit.module("Closing");

	opaTest("Should close the Technical Information Dialog when pressing the close button", function(Given, When, Then) {
		// Act
		When.onTheDialog.iPressTheCloseButton();
		Then.iTeardownMyAppFrame();
	});

	QUnit.module("State keeping");

	opaTest("Should set Standard Support Assistant bootstrap option", function(Given, When, Then) {
		// Arrange
		Given.iStartMyAppInAFrame(sTestPageURL);
		When.anywhere.iPressCtrlAltShiftP();
		Then.anywhere.iShouldSeeTheTechnicalInformationDialog();
		When.onTheDialog.iOpenSupportAssistantSettings();
		Then.onTheDialog.iShouldSeeTheSupportAssistantConfigurationDialog();

		// Act
		When.onTheConfigDialog.iSelectTheStandardBootstrapOption(sOpenUI5BetaKey);
		Then.iTeardownMyAppFrame();
	});

	opaTest("Should see the previously selected Support Assistant bootstrap option", function(Given, When, Then) {
		// Arrange
		When.iStartMyAppInAFrame(sTestPageURL);
		When.anywhere.iPressCtrlAltShiftP();
		Then.anywhere.iShouldSeeTheTechnicalInformationDialog();
		When.onTheDialog.iOpenSupportAssistantSettings();
		Then.onTheDialog.iShouldSeeTheSupportAssistantConfigurationDialog();

		// Assert
		Then.onTheConfigDialog.theStandardBootstrapOptionIsSelected(sOpenUI5BetaKey);
	});

	opaTest("Should keep the standard option if custom option is set without custom url", function(Given, When, Then) {
		// Act
		When.onTheConfigDialog.iSelectBootstrapOption("custom");

		// Arrange
		Then.iTeardownMyAppFrame();
		Then.iStartMyAppInAFrame(sTestPageURL);
		When.anywhere.iPressCtrlAltShiftP();
		Then.anywhere.iShouldSeeTheTechnicalInformationDialog();
		When.onTheDialog.iOpenSupportAssistantSettings();
		Then.onTheDialog.iShouldSeeTheSupportAssistantConfigurationDialog();

		// Assert
		Then.onTheConfigDialog.theBootstrapOptionIsInTheRightState("custom", false).
		and.theBootstrapOptionIsInTheRightState("standard", true);

		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});