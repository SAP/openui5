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
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/I18NText",
	"sap/ui/model/resource/ResourceModel"
], function (Device, Opa5, opaTest, Press, EnterText, PropertyStrictEquals, Ancestor, I18NText, ResourceModel) {
	"use strict";

	var sTestPageURL = "TechnicalInfoTestbench.html",
		sOpenUI5BetaKey = "https://openui5beta.hana.ondemand.com/resources/sap/ui/support/";

	Opa5.extendConfig({
		autoWait : true
	});

	/**
	 * Finds a tree node in the debug modules selection tree
	 * @param {object} oContext The context of the tree to be checked
	 * @param {string} sWhich Module string like "sap/ui/Device.js"
	 * @return {object|null} The context of the found or null if module string was not found
	 */
	function findNode(oContext, sWhich) {
		if (!oContext.children) {
			return null;
		}
		if (sWhich === "All") {
			return oContext;
		}
		for (var j = 0; j < oContext.children.length; j++) {
			if (oContext.children[j].context.getObject().text === sWhich) {
				// found the right node
				return oContext.children[j];
			}
		}
	}

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

							// Fallback: Load TechnicalInfo dialog manually with some static mock data
							// Chrome passes the above code but does not support creating custom keyCode Event
							if (!bOpened || Device.browser.chrome) {
								oWindow.sap.ui.require(['sap/ui/core/support/techinfo/TechnicalInfo'], function (TechnicalInfo) {
									TechnicalInfo.open(function() {
										return {
											modules : {
												"sap/ui/Device.js": {
													"name": "sap/ui/Device.js",
													"state": 4,
													"group": null,
													"data": null,
													"loaded": null,
													"content": {}
												},
												"sap/ui/core/Configuration": {
													"name": "sap/ui/core/Configuration.js",
													"state": 4,
													"group": null,
													"loaded": null,
													"url": "../../../../../../../resources/sap/ui/core/Configuration.js"
												},
												"sap/ui/core/Locale.js": {
													"name": "sap/ui/core/Locale.js",
													"state": 4,
													"group": null,
													"loaded": null,
													"url": "../../../../../../../resources/sap/ui/core/Locale.js"
												},
												"sap/m/Button.js": {
													"name": "sap/m/Button.js",
													"state": 4,
													"group": null,
													"loaded": null,
													"url":"../../../../../../../resources/sap/m/Button.js"
												},
												"sap/m/Text.js" : {
													"name": "sap/m/Text.js",
													"state": 4,
													"group": null,
													"loaded": null,
													"url": "../../../../../../../resources/sap/m/Text.js"
												}
											}
										};
									});
									// Workaround: load library resource bundles for core and m manually for voter
									oWindow.sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");
									oWindow.sap.ui.getCore().getLibraryResourceBundle("sap.m");
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

		/* =========================================================== */
		/* Technical Information Dialog                                */
		/* =========================================================== */
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
				iPressStartSupportAssistantButton : function () {
					return this.waitFor({
						id : "technicalInfoDialog--Dialog",
						success : function () {
							return this.waitFor({
								id : "technicalInfoDialog--startSupportAssistantButton",
								actions : new Press(),
								success : function () {
									Opa5.assert.ok(true, "Pressed the support assistant start button");
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
				},
				iPressTheDebugModulesLink: function () {
					return this.waitFor({
						id : "technicalInfoDialog--Dialog",
						success : function (oDialog) {
							return this.waitFor({
								controlType : "sap.m.Link",
								matchers: [
									new Ancestor(oDialog),
									new I18NText({
										propertyName : "text",
										key: "TechInfo.DebugSourcesModules.Link"
									})
								],
								actions : new Press(),
								success : function () {
									Opa5.assert.ok(true, "Pressed the debug modules link");
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
				iShouldSeeTheDebugModulesConfigurationDialog: function () {
					return this.waitFor({
						id: "TechnicalInfoDialogDebugModules--Dialog",
						success: function (oDialog) {
							Opa5.assert.ok(true, "Found the Debug Modules ConfigurationDialog");

							return this.waitFor({
								controlType: "sap.m.Title",
								matchers: [
									new Ancestor(oDialog),
									new I18NText({
										propertyName : "text",
										key: "TechInfo.DebugModulesConfigPopup.SelectionCounter",
										parameters: [(window["sap-ui-debug"] ? 1 : 0)]
									})
								],
								success: function () {
									Opa5.assert.ok(true, "Found the dialog title");
								}
							});
						}
					});
				}
			}
		},

		/* =========================================================== */
		/* Configure Support Asssistant Popover                        */
		/* =========================================================== */
		onTheConfigDialog: {
			actions: {
				iSelectBootstrapOption: function (sWhich) {
					return this.waitFor({
						id: "technicalInfoDialogAssistantPopover--" + sWhich,
						actions: new Press(),
						success: function () {
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
				},
				iEnterCustomBootstrapUrl: function (sValue) {
					return this.waitFor({
						id : "technicalInfoDialogAssistantPopover--customBootstrapURL",
						actions : new EnterText({
							text: sValue
						}),
						success : function () {
							Opa5.assert.ok(true, "Entered the custom debug value " + sValue);
						}
					});
				},
				iCloseThePopup: function () {
					return this.waitFor({
						id : "technicalInfoDialogAssistantPopover--Popover",
						actions : function (oPopover) {
							oPopover.close();
						},
						success : function () {
							Opa5.assert.ok(true, "Popopver is closed.");
						}
					});
				}
			},
			assertions: {
				theBootstrapOptionIsInTheRightState: function (sWhich, bEnabled) {
					return this.waitFor({
						id: "technicalInfoDialogAssistantPopover--" + sWhich + "BootstrapURL",
						autoWait: false,
						matchers: new PropertyStrictEquals({name: "enabled", value: bEnabled}),
						success: function () {
							Opa5.assert.ok(true, "The " + sWhich + " boostrap option is " + (bEnabled ? "enabled" : "disabled"));
						}
					});
				},
				theStandardBootstrapOptionIsSelected: function (sKey) {
					return this.waitFor({
						id: "technicalInfoDialogAssistantPopover--standardBootstrapURL",
						matchers: new PropertyStrictEquals({name: "selectedKey", value: sKey}),
						success: function () {
							Opa5.assert.ok(true, "Item with key is selected: " + sKey);
						}
					});
				},
				theCustomBootstrapOptionIsInState: function (sState) {
					return this.waitFor({
						id: "technicalInfoDialogAssistantPopover--customBootstrapURL",
						autoWait: false,
						matchers: new PropertyStrictEquals({name: "valueState", value: sState}),
						success: function () {
							Opa5.assert.ok(true, "The bootstrap option is in " + sState);
						}
					});
				},
				theErrorMessageIsCorrect: function () {
					return this.waitFor({
						id: "technicalInfoDialogAssistantPopover--customBootstrapURL",
						autoWait: false,
						matchers: new I18NText({
							propertyName : "valueStateText",
							key: "TechInfo.SupportAssistantConfigPopup.URLValidationMessage"
						}),
						success: function () {
							Opa5.assert.ok(true, "The bootstrap option has correct value state message");
						}
					});
				},
				theMessageIs: function (sMessage) {
					return this.waitFor({
						id: "technicalInfoDialogAssistantPopover--customBootstrapURL",
						autoWait: false,
						matchers: new PropertyStrictEquals({name: "valueStateText", value: sMessage}),
						success: function () {
							Opa5.assert.ok(true, "The message is correct");
						}
					});
				}
			}
		},

		/* =========================================================== */
		/* Select Debug Packages Dialog                                */
		/* =========================================================== */
		onTheModuleDialog: {
			actions: {
				iPressTheButton: function (sIcon) {
					return this.waitFor({
						id : "technicalInfoDialog--Dialog",
						success : function (oDialog) {
							return this.waitFor({
								controlType : "sap.m.Button",
								matchers: [
									new Ancestor(oDialog),
									new PropertyStrictEquals({
										name: "icon",
										value: "sap-icon://" + sIcon
									})
								],
								actions : new Press(),
								success : function () {
									Opa5.assert.ok(true, "Pressed the " + sIcon + " button");
								}
							});
						}
					});
				},
				iSelectATreeNode: function (sWhich) {
					return this.waitFor({
						id : "TechnicalInfoDialogDebugModules--tree",
						actions : function(oTree) {
							oTree.expandToLevel(3);
							var aNodePaths = sWhich.split("/"),
								oRootContext = oTree.getItems()[0].getItemNodeContext(),
								oSubContext = oRootContext,
								oTreeItems = oTree.getItems(),
								oNodePath, i;

							for (i = 0; i < aNodePaths.length; i++) {
								oSubContext = findNode(oSubContext, aNodePaths[i]);
							}

							if (oSubContext) {
								oNodePath = oSubContext.context.getPath();
								for (i = 0; i < oTreeItems.length; i++) {
									if (oTreeItems[i].getBindingContextPath() === oNodePath) {
										return new Press().executeOn(oTreeItems[i]);
									}
								}
							}
						},
						success : function () {
							Opa5.assert.ok(true, "Selected the tree node " + sWhich );
						}
					});
				},
				iPressConfirm: function () {
					return this.waitFor({
						id: "TechnicalInfoDialogDebugModules--Dialog",
						success: function (oDialog) {
							return this.waitFor({
								controlType: "sap.m.Button",
								matchers: [
									new Ancestor(oDialog),
									new I18NText({
										propertyName: "text",
										key: "TechInfo.DebugModulesConfigPopup.Confirm"
									})
								],
								actions: new Press(),
								success: function () {
									Opa5.assert.ok(true, "Pressed the confirmation button");
								}
							});
						}
					});
				},
				iPressClose: function () {
					return this.waitFor({
						id: "TechnicalInfoDialogDebugModules--Dialog",
						success: function (oDialog) {
							return this.waitFor({
								controlType: "sap.m.Button",
								matchers: [
									new Ancestor(oDialog),
									new I18NText({
										propertyName: "text",
										key: "CLOSE"
									})
								],
								actions: new Press(),
								success: function () {
									Opa5.assert.ok(true, "Pressed the close button");
								}
							});
						}
					});
				},
				iEnterCustomDebugValue: function (sValue) {
					return this.waitFor({
						id : "TechnicalInfoDialogDebugModules--customDebugValue",
						actions : new EnterText({
							text: sValue
						}),
						success : function () {
							Opa5.assert.ok(true, "Entered the custom debug value " + sValue);
						}
					});
				}
			},
			assertions: {
				theTreeNodeIsSelected: function (sWhich, bSelected) {
					return this.waitFor({
						id : "TechnicalInfoDialogDebugModules--tree",
						success : function(oTree) {
							var aNodePaths = sWhich.split("/"),
								oRootContext = oTree.getItems()[0].getItemNodeContext(),
								oSubContext = oRootContext,
								oTreeItems = oTree.getItems(),
								oNodePath, i;

							for (i = 0; i < aNodePaths.length; i++) {
								oSubContext = findNode(oSubContext, aNodePaths[i]);
							}

							if (oSubContext) {
								oNodePath = oSubContext.context.getPath();
								for (i = 0; i < oTreeItems.length; i++) {
									if (oTreeItems[i].getBindingContextPath() === oNodePath) {
										Opa5.assert.strictEqual(oTreeItems[i].getSelected(), bSelected, "The tree node " + oTreeItems[i].getTitle() + " is " + (bSelected ? "" : "not") + " selected");
									}
								}
							}
						}
					});
				},
				theCustomDebugValueShouldBe: function (sValue) {
					return this.waitFor({
						id : "TechnicalInfoDialogDebugModules--customDebugValue",
						success : function (sCustomDebugValue) {
							if (sCustomDebugValue) {
								var modules = sValue.split(",");
								for (var i = 0; i < modules.length; i++) {
									var bFound = sCustomDebugValue.getValue().indexOf(modules[i]) !== -1;
									Opa5.assert.ok(bFound, "The custom debug value contains: " + modules[i]);
								}
							} else {
								Opa5.assert.ok(false, "customDebugValue is empty");
							}
						}
					});
				},
				theSelectedModulesShouldBe: function (iAmount) {
					return this.waitFor({
						id: "TechnicalInfoDialogDebugModules--Dialog",
						success: function (oDialog) {
							Opa5.assert.ok(true, "Found the Debug Modules ConfigurationDialog");

							return this.waitFor({
								controlType: "sap.m.Title",
								matchers: [
									new Ancestor(oDialog),
									new I18NText({
										propertyName: "text",
										key: "TechInfo.DebugModulesConfigPopup.SelectionCounter",
										parameters: [iAmount]
									})
								],
								success: function () {
									Opa5.assert.ok(true, "Found the dialog title");
								}
							});
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
		Then.anywhere.iShouldSeeAConfirmationMessageBox();
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
		Then.iTeardownMyAppFrame();
	});

	opaTest("Should open the support assistant setting when a invalid custom url is entered.", function(Given, When, Then) {
		// Arrange
		When.iStartMyAppInAFrame(sTestPageURL);
		When.anywhere.iPressCtrlAltShiftP();
		Then.anywhere.iShouldSeeTheTechnicalInformationDialog();
		When.onTheDialog.iOpenSupportAssistantSettings();
		Then.onTheDialog.iShouldSeeTheSupportAssistantConfigurationDialog();
		When.onTheConfigDialog.iSelectBootstrapOption("custom").
		and.iEnterCustomBootstrapUrl("invalidCustomUrl");
		// Assert
		Then.onTheConfigDialog.theCustomBootstrapOptionIsInState("Error").
		and.theErrorMessageIsCorrect();
		When.onTheDialog.iPressTheCloseButton();
		When.anywhere.iPressCtrlAltShiftP();
		Then.anywhere.iShouldSeeTheTechnicalInformationDialog();

		// Act
		When.onTheDialog.iPressStartSupportAssistantButton();

		// Assert
		Then.onTheDialog.iShouldSeeTheSupportAssistantConfigurationDialog();
		Then.onTheConfigDialog.theCustomBootstrapOptionIsInState("Error").
		and.theErrorMessageIsCorrect();
	});

	opaTest("Should show error when a valid syntax's is provided", function(Given, When, Then) {
		// Act
		When.onTheConfigDialog.iEnterCustomBootstrapUrl(sOpenUI5BetaKey);

		//Assert
		Then.onTheConfigDialog.theCustomBootstrapOptionIsInState("None");
	});

	opaTest("Should show error when trying to start support assistant with empty custom bootstrap URL", function(Given, When, Then) {
		var oI18nModel = new ResourceModel({
			bundleName: "sap.ui.core.messagebundle"
		});
		var sErrorForResourceNotFound = oI18nModel.getProperty("TechInfo.SupportAssistantConfigPopup.SupportAssistantNotFound") +
			oI18nModel.getProperty("TechInfo.SupportAssistantConfigPopup.ErrorNotFound");

		// Arrange
		When.onTheConfigDialog.iEnterCustomBootstrapUrl("").iCloseThePopup();
		Then.onTheConfigDialog.theCustomBootstrapOptionIsInState("None");

		// Act
		When.onTheDialog.iPressStartSupportAssistantButton();

		// Assert
		Then.onTheDialog.iShouldSeeTheSupportAssistantConfigurationDialog();
		Then.onTheConfigDialog.theCustomBootstrapOptionIsInState("Error").
		and.theMessageIs(sErrorForResourceNotFound);
	});

	QUnit.module("Debug Modules Configuration");

	opaTest("Should open the debug modules configuration dialog", function(Given, When, Then) {
		// Act
		When.onTheDialog.iPressTheDebugModulesLink();

		// Assert
		Then.onTheDialog.iShouldSeeTheDebugModulesConfigurationDialog();
	});

	opaTest("Should initially see a tree that matches the value of sap-ui-debug", function(Given, When, Then) {
		var bDebug = !!window['sap-ui-debug'];

		// Assert
		Then.onTheModuleDialog.theCustomDebugValueShouldBe(bDebug.toString()).
		and.theTreeNodeIsSelected("All", bDebug).
		and.theSelectedModulesShouldBe(bDebug ? 1 : 0);
	});

	opaTest("Should apply a custom debug configuration selected in the tree", function(Given, When, Then) {
		var bDebug = !!window['sap-ui-debug'];

		// first deselect the all node in debug mode
		if (bDebug) {
			When.onTheModuleDialog.iSelectATreeNode("All");
		}

		// Act
		When.onTheModuleDialog.iSelectATreeNode("sap/ui").
		and.iSelectATreeNode("sap/m/Button.js");

		// Assert
		Then.onTheModuleDialog.theCustomDebugValueShouldBe("sap/ui/,sap/m/Button.js").
		and.theSelectedModulesShouldBe(2);
	});

	opaTest("Should apply a custom string debug configuration entered in the input field", function(Given, When, Then) {
		// Act
		When.onTheModuleDialog.iEnterCustomDebugValue("sap/ui/Device.js,sap/m/Button.js");

		// Assert
		Then.onTheModuleDialog.theTreeNodeIsSelected("sap/ui/Device.js", true).
		and.theTreeNodeIsSelected("sap/m/Button.js", true).
		and.theSelectedModulesShouldBe(2);
	});

	opaTest("Should clear the tree and the input field when pressing the reset button", function(Given, When, Then) {
		// Act
		When.onTheModuleDialog.iPressTheButton("reset");

		// Assert
		Then.onTheModuleDialog.theCustomDebugValueShouldBe("false").
		and.theTreeNodeIsSelected("All", false).
		and.theSelectedModulesShouldBe(0);
	});

	opaTest("Should apply a custom boolean debug configuration entered in the input field", function(Given, When, Then) {
		// Act
		When.onTheModuleDialog.iEnterCustomDebugValue("true");

		// Assert
		Then.onTheModuleDialog.theTreeNodeIsSelected("All", true).
		and.theSelectedModulesShouldBe(1);
	});

	opaTest("Should display a message toast when pressing the copy button", function(Given, When, Then) {
		// Act
		When.onTheModuleDialog.iPressTheButton("copy");

		// Assert
		Then.anywhere.iShouldSeeAMessageToast();
	});

	opaTest("Should display a confirmation dialog when pressing the confirm button", function(Given, When, Then) {
		// Act
		When.onTheModuleDialog.iPressConfirm();

		// Assert
		Then.anywhere.iShouldSeeAConfirmationMessageBox();
	});

	opaTest("Should close the debug modules configuration dialog", function(Given, When, Then) {
		// Act
		When.onTheModuleDialog.iPressClose();

		// Assert
		Then.anywhere.iShouldSeeTheTechnicalInformationDialog().
		and.iTeardownMyAppFrame();
	});

	QUnit.start();
});