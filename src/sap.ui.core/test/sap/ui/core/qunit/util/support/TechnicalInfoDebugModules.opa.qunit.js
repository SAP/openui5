/*global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/I18NText"
], function (Opa5, opaTest, Press, EnterText, PropertyStrictEquals, Ancestor, I18NText) {
	"use strict";

	var sTestPageURL = sap.ui.require.toUrl("static/TechnicalInfoTestbench.html");

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
							var oWindow = Opa5.getWindow();

							// trigger left ALT key (there is a separate check in Hotkeys.js for this)
							oWindow.document.dispatchEvent(new KeyboardEvent("keydown", {
								bubbles: true,
								cancelable: true,
								keyCode: 18,
								location: 1
							}));

							// trigger CTRL+ALT+SHIFT+P
							oWindow.document.dispatchEvent(new KeyboardEvent("keydown", {
								bubbles: true,
								cancelable: true,
								keyCode: 80,
								ctrlKey: true,
								altKey: true,
								shiftKey: true
							}));
						},
						errorMessage: "Could not press Technical Information Dialog keyboard combination",
						success: function () {
							Opa5.assert.ok(true, "Pressed the Technical Information Dialog keyboard combination");
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
						autoWait: false,
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

});