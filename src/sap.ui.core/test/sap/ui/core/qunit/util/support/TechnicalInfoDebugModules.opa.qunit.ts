import Device from "sap/ui/Device";
import Opa5 from "sap/ui/test/Opa5";
import opaTest from "sap/ui/test/opaQunit";
import Press from "sap/ui/test/actions/Press";
import EnterText from "sap/ui/test/actions/EnterText";
import PropertyStrictEquals from "sap/ui/test/matchers/PropertyStrictEquals";
import Ancestor from "sap/ui/test/matchers/Ancestor";
import I18NText from "sap/ui/test/matchers/I18NText";
var sTestPageURL = sap.ui.require.toUrl("static/TechnicalInfoTestbench.html");
Opa5.extendConfig({
    autoWait: true
});
function findNode(oContext, sWhich) {
    if (!oContext.children) {
        return null;
    }
    if (sWhich === "All") {
        return oContext;
    }
    for (var j = 0; j < oContext.children.length; j++) {
        if (oContext.children[j].context.getObject().text === sWhich) {
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
                        var oWindow = Opa5.getWindow(), bOpened = false;
                        try {
                            var oEvent = new KeyboardEvent("keydown", {
                                bubbles: true,
                                cancelable: true,
                                keyCode: 18,
                                location: 1
                            });
                            oWindow.document.dispatchEvent(oEvent);
                            oEvent = new KeyboardEvent("keydown", {
                                bubbles: true,
                                cancelable: true,
                                keyCode: 80,
                                ctrlKey: true,
                                altKey: true,
                                shiftKey: true
                            });
                            oWindow.document.dispatchEvent(oEvent);
                        }
                        catch (oException) {
                            bOpened = false;
                        }
                        if (!bOpened || Device.browser.chrome) {
                            oWindow.sap.ui.require(["sap/ui/core/support/techinfo/TechnicalInfo"], function (TechnicalInfo) {
                                TechnicalInfo.open(function () {
                                    return {
                                        modules: {
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
                                                "url": "../../../../../../../resources/sap/m/Button.js"
                                            },
                                            "sap/m/Text.js": {
                                                "name": "sap/m/Text.js",
                                                "state": 4,
                                                "group": null,
                                                "loaded": null,
                                                "url": "../../../../../../../resources/sap/m/Text.js"
                                            }
                                        }
                                    };
                                });
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
                                    propertyName: "text",
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
                    check: function () {
                        return !!Opa5.getJQuery()(".sapMMessageToast").length;
                    },
                    success: function () {
                        Opa5.assert.ok(true, "The message toast was displayed");
                    },
                    errorMessage: "The message toast was not displayed"
                });
            },
            iShouldSeeAConfirmationMessageBox: function () {
                return this.waitFor({
                    controlType: "sap.m.Dialog",
                    matchers: new PropertyStrictEquals({ name: "title", value: "Reload App" }),
                    success: function (oDialog) {
                        Opa5.assert.ok(true, "Found the reload app confirmation dialog");
                        return this.waitFor({
                            controlType: "sap.m.Button",
                            matchers: [
                                new Ancestor(oDialog[0]),
                                new PropertyStrictEquals({ name: "text", value: "Cancel" })
                            ],
                            actions: new Press(),
                            success: function () {
                                Opa5.assert.ok(true, "Pressed the close button of the confirmation dialog");
                            }
                        });
                    }
                });
            }
        }
    },
    onTheDialog: {
        actions: {
            iPressTheDebugModulesLink: function () {
                return this.waitFor({
                    id: "technicalInfoDialog--Dialog",
                    success: function (oDialog) {
                        return this.waitFor({
                            controlType: "sap.m.Link",
                            matchers: [
                                new Ancestor(oDialog),
                                new I18NText({
                                    propertyName: "text",
                                    key: "TechInfo.DebugSourcesModules.Link"
                                })
                            ],
                            actions: new Press(),
                            success: function () {
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
                                    propertyName: "text",
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
    onTheModuleDialog: {
        actions: {
            iPressTheButton: function (sIcon) {
                return this.waitFor({
                    id: "technicalInfoDialog--Dialog",
                    success: function (oDialog) {
                        return this.waitFor({
                            controlType: "sap.m.Button",
                            matchers: [
                                new Ancestor(oDialog),
                                new PropertyStrictEquals({
                                    name: "icon",
                                    value: "sap-icon://" + sIcon
                                })
                            ],
                            actions: new Press(),
                            success: function () {
                                Opa5.assert.ok(true, "Pressed the " + sIcon + " button");
                            }
                        });
                    }
                });
            },
            iSelectATreeNode: function (sWhich) {
                return this.waitFor({
                    id: "TechnicalInfoDialogDebugModules--tree",
                    actions: function (oTree) {
                        oTree.expandToLevel(3);
                        var aNodePaths = sWhich.split("/"), oRootContext = oTree.getItems()[0].getItemNodeContext(), oSubContext = oRootContext, oTreeItems = oTree.getItems(), oNodePath, i;
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
                    success: function () {
                        Opa5.assert.ok(true, "Selected the tree node " + sWhich);
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
                    id: "TechnicalInfoDialogDebugModules--customDebugValue",
                    actions: new EnterText({
                        text: sValue
                    }),
                    success: function () {
                        Opa5.assert.ok(true, "Entered the custom debug value " + sValue);
                    }
                });
            }
        },
        assertions: {
            theTreeNodeIsSelected: function (sWhich, bSelected) {
                return this.waitFor({
                    id: "TechnicalInfoDialogDebugModules--tree",
                    success: function (oTree) {
                        var aNodePaths = sWhich.split("/"), oRootContext = oTree.getItems()[0].getItemNodeContext(), oSubContext = oRootContext, oTreeItems = oTree.getItems(), oNodePath, i;
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
                    id: "TechnicalInfoDialogDebugModules--customDebugValue",
                    success: function (sCustomDebugValue) {
                        if (sCustomDebugValue) {
                            var modules = sValue.split(",");
                            for (var i = 0; i < modules.length; i++) {
                                var bFound = sCustomDebugValue.getValue().indexOf(modules[i]) !== -1;
                                Opa5.assert.ok(bFound, "The custom debug value contains: " + modules[i]);
                            }
                        }
                        else {
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
opaTest("Should open the Technical Information Dialog when pressing CTRL+ALT+SHIFT+P", function (Given, When, Then) {
    Given.iStartMyAppInAFrame(sTestPageURL);
    When.anywhere.iPressCtrlAltShiftP();
    Then.anywhere.iShouldSeeTheTechnicalInformationDialog();
});
QUnit.module("Debug Modules Configuration");
opaTest("Should open the debug modules configuration dialog", function (Given, When, Then) {
    When.onTheDialog.iPressTheDebugModulesLink();
    Then.onTheDialog.iShouldSeeTheDebugModulesConfigurationDialog();
});
opaTest("Should initially see a tree that matches the value of sap-ui-debug", function (Given, When, Then) {
    var bDebug = !!window["sap-ui-debug"];
    Then.onTheModuleDialog.theCustomDebugValueShouldBe(bDebug.toString()).and.theTreeNodeIsSelected("All", bDebug).and.theSelectedModulesShouldBe(bDebug ? 1 : 0);
});
opaTest("Should apply a custom debug configuration selected in the tree", function (Given, When, Then) {
    var bDebug = !!window["sap-ui-debug"];
    if (bDebug) {
        When.onTheModuleDialog.iSelectATreeNode("All");
    }
    When.onTheModuleDialog.iSelectATreeNode("sap/ui").and.iSelectATreeNode("sap/m/Button.js");
    Then.onTheModuleDialog.theCustomDebugValueShouldBe("sap/ui/,sap/m/Button.js").and.theSelectedModulesShouldBe(2);
});
opaTest("Should apply a custom string debug configuration entered in the input field", function (Given, When, Then) {
    When.onTheModuleDialog.iEnterCustomDebugValue("sap/ui/Device.js,sap/m/Button.js");
    Then.onTheModuleDialog.theTreeNodeIsSelected("sap/ui/Device.js", true).and.theTreeNodeIsSelected("sap/m/Button.js", true).and.theSelectedModulesShouldBe(2);
});
opaTest("Should clear the tree and the input field when pressing the reset button", function (Given, When, Then) {
    When.onTheModuleDialog.iPressTheButton("reset");
    Then.onTheModuleDialog.theCustomDebugValueShouldBe("false").and.theTreeNodeIsSelected("All", false).and.theSelectedModulesShouldBe(0);
});
opaTest("Should apply a custom boolean debug configuration entered in the input field", function (Given, When, Then) {
    When.onTheModuleDialog.iEnterCustomDebugValue("true");
    Then.onTheModuleDialog.theTreeNodeIsSelected("All", true).and.theSelectedModulesShouldBe(1);
});
opaTest("Should display a message toast when pressing the copy button", function (Given, When, Then) {
    When.onTheModuleDialog.iPressTheButton("copy");
    Then.anywhere.iShouldSeeAMessageToast();
});
opaTest("Should display a confirmation dialog when pressing the confirm button", function (Given, When, Then) {
    When.onTheModuleDialog.iPressConfirm();
    Then.anywhere.iShouldSeeAConfirmationMessageBox();
});
opaTest("Should close the debug modules configuration dialog", function (Given, When, Then) {
    When.onTheModuleDialog.iPressClose();
    Then.anywhere.iShouldSeeTheTechnicalInformationDialog().and.iTeardownMyAppFrame();
});