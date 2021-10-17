import Log from "sap/base/Log";
import Helper from "sap/ui/core/sample/common/Helper";
import QUnitUtils from "sap/ui/qunit/QUnitUtils";
import RuleAnalyzer from "sap/ui/support/RuleAnalyzer";
import Press from "sap/ui/test/actions/Press";
import Opa from "sap/ui/test/Opa";
import Opa5 from "sap/ui/test/Opa5";
import TestUtils from "sap/ui/test/TestUtils";
import Properties from "sap/ui/test/matchers/Properties";
function checkLog(aExpected) {
    var aLogEntries = Log.getLogEntries(), iStartIndex = Opa.getContext().iNextLogIndex || 0;
    function isExpected(oLog) {
        if (!aExpected) {
            return false;
        }
        return aExpected.some(function (oExpected, i) {
            if (oLog.component === oExpected.component && oLog.level === oExpected.level && matches(oLog.message, oExpected.message) && (!oExpected.details || matches(oLog.details, oExpected.details))) {
                aExpected.splice(i, 1);
                return true;
            }
        });
    }
    function matches(sActual, vExpected) {
        return vExpected instanceof RegExp ? vExpected.test(sActual) : sActual.includes(vExpected);
    }
    function replacer(_sKey, vValue) {
        return vValue instanceof RegExp ? vValue.toString() : vValue;
    }
    Opa.getContext().iNextLogIndex = aLogEntries.length;
    aLogEntries.splice(iStartIndex).forEach(function (oLog) {
        var sComponent = oLog.component || "";
        if (Helper.isRelevantLog(oLog)) {
            if (isExpected(oLog)) {
                Opa5.assert.ok(true, "Expected Warning or error found: " + sComponent + " Level: " + oLog.level + " Message: " + oLog.message + (oLog.details ? " Details: " + oLog.details : ""));
            }
            else {
                Opa5.assert.ok(false, "Unexpected warning or error found: " + sComponent + " Level: " + oLog.level + " Message: " + oLog.message + (oLog.details ? " Details: " + oLog.details : "") + "\r\nExpected one of: " + JSON.stringify(aExpected, replacer, "\t"));
            }
        }
    });
    if (aExpected) {
        aExpected.forEach(function (oExpected) {
            if (Log.isLoggable(oExpected.level, oExpected.component)) {
                Opa5.assert.ok(false, "Expected warning or error not logged: " + oExpected.component + " Level: " + oExpected.level + " Message: " + oExpected.message + (oExpected.details ? " Details: " + oExpected.details : ""));
            }
        });
    }
    Opa5.assert.ok(true, "Log checked");
}
function getConfig(bSupportAssistant) {
    return {
        appParams: { "sap-ui-support": bSupportAssistant ? "true,silent" : "false" },
        autoWait: true,
        extensions: bSupportAssistant ? ["sap/ui/core/support/RuleEngineOpaExtension"] : [],
        timeout: TestUtils.isRealOData() ? 30 : undefined
    };
}
Opa5.extendConfig(getConfig());
Opa5.createPageObjects({
    onAnyPage: {
        actions: {
            applySupportAssistant: function () {
                Opa.getContext().bSupportAssistant = TestUtils.isSupportAssistant() && !TestUtils.isRealOData();
                Opa5.extendConfig(getConfig(Opa.getContext().bSupportAssistant));
            },
            cleanUp: function (sControlId) {
                this.waitFor({
                    controlType: "sap.m.Table",
                    autoWait: false,
                    id: sControlId,
                    success: function (oTable) {
                        var aCreatedEntityPaths = Opa.getContext().aCreatedEntityPaths || [], oModel = oTable.getModel(), aPromises, oRequestor = oModel.oRequestor;
                        Opa5.assert.ok(true, "cleanUp created entities");
                        aPromises = aCreatedEntityPaths.map(function (sPath) {
                            return oRequestor.request("DELETE", sPath, oModel.lockGroup("$direct", "Any.js"), { "If-Match": "*" }).then(function () {
                                Opa5.assert.ok(true, "deleted: " + sPath);
                            }, function (oError) {
                                if (oError.status !== 404) {
                                    Opa5.assert.ok(false, "cleanUp failed: " + sPath + " error: " + oError.message);
                                }
                                else {
                                    Opa5.assert.ok(true, "already deleted: " + sPath);
                                }
                            });
                        });
                        delete Opa.getContext().aCreatedEntityPaths;
                        this.iWaitForPromise(Promise.all(aPromises));
                    },
                    viewName: Opa.getContext().sViewName
                });
            }
        },
        assertions: {
            checkLog: function (aExpected) {
                this.waitFor({
                    success: function () {
                        checkLog(aExpected);
                    }
                });
            },
            analyzeSupportAssistant: function () {
                this.waitFor({
                    success: function () {
                        var bFinished = false;
                        function analyse() {
                            Opa5.assert.ok(true, "Support assistant analysis started");
                            return RuleAnalyzer.analyze({ type: "global" }).then(function () {
                                var oIssues = RuleAnalyzer.getLastAnalysisHistory().issues || [];
                                oIssues = oIssues.filter(function (oIssue) {
                                    return oIssue.severity === "High";
                                });
                                Opa5.assert.strictEqual(oIssues.length, 0, "No support assistant prio high issues");
                                if (oIssues.length) {
                                    Opa5.assert.getFinalReport();
                                }
                                Opa5.assert.ok(true, "Support assistant analysis finished");
                                Opa5.extendConfig(getConfig(false));
                                Opa.getContext().bSupportAssistant = false;
                            });
                        }
                        if (!Opa.getContext().bSupportAssistant) {
                            Opa5.assert.ok(true, "Support assistant inactive, - check skipped");
                            return;
                        }
                        analyse().then(function () {
                            bFinished = true;
                        });
                        this.waitFor({
                            check: function () {
                                return bFinished;
                            },
                            timeout: 60
                        });
                    }
                });
            }
        }
    },
    onTheErrorInfo: {
        actions: {
            confirm: function () {
                this.waitFor({
                    controlType: "sap.m.Dialog",
                    matchers: new Properties({ icon: "sap-icon://error" }),
                    success: function (aControls) {
                        aControls[0].getButtons()[0].$().tap();
                        Opa5.assert.ok(true, "Confirm 'Error'");
                    }
                });
            }
        }
    },
    onTheMessagePopover: {
        actions: {
            back: function (sMessage) {
                this.waitFor({
                    controlType: "sap.m.Page",
                    id: /-messageView-detailsPage/,
                    success: function (aPages) {
                        var oPage = aPages[0].getDomRef();
                        QUnitUtils.triggerEvent("tap", oPage.getElementsByClassName("sapMMsgViewBackBtn")[0]);
                        Opa5.assert.ok(true, "Back to Messages button pressed");
                    }
                });
            },
            close: function () {
                this.waitFor({
                    controlType: "sap.m.MessagePopover",
                    success: function (aControls) {
                        var oPopover = aControls[0];
                        if (oPopover && oPopover.isOpen()) {
                            oPopover.close();
                            Opa5.assert.ok(true, "Message Popover closed");
                        }
                    }
                });
            },
            selectMessage: function (sMessage) {
                this.waitFor({
                    controlType: "sap.m.MessagePopover",
                    success: function (aMessagePopover) {
                        this.waitFor({
                            controlType: "sap.m.StandardListItem",
                            matchers: new Properties({ title: sMessage }),
                            success: function (aItems) {
                                if (aItems.length === 1) {
                                    QUnitUtils.triggerEvent("tap", aItems[0].getDomRef());
                                    Opa5.assert.ok(true, "Message selected: " + sMessage);
                                }
                                else {
                                    Opa5.assert.ok(false, "Duplicate Message: " + sMessage);
                                }
                            }
                        });
                    }
                });
            },
            selectMessageTitle: function (sMessage, sId, iRow) {
                this.waitFor({
                    controlType: "sap.m.Input",
                    id: sId,
                    matchers: function (oControl) {
                        return oControl.getBindingContext().getIndex() === iRow;
                    },
                    success: function (aControls) {
                        var sTargetId = aControls[0].getId();
                        Opa5.assert.ok(aControls.length === 1, "Found: " + sTargetId);
                        this.waitFor({
                            actions: new Press(),
                            controlType: "sap.m.Link",
                            matchers: new Properties({ text: sMessage }),
                            success: function () {
                                var bDocumentHasFocus;
                                Opa5.assert.ok(true, "Message link pressed: " + sMessage);
                                this.waitFor({
                                    controlType: "sap.m.Input",
                                    check: function () {
                                        bDocumentHasFocus = document.hasFocus();
                                        return !bDocumentHasFocus || sTargetId === sap.ui.getCore().getCurrentFocusedControlId();
                                    },
                                    id: sTargetId,
                                    success: function () {
                                        Opa5.assert.ok(true, bDocumentHasFocus ? "Control focused: " + sTargetId : "Document lost focus, check skipped");
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
        assertions: {
            checkMessages: function (aExpectedMessages) {
                this.waitFor({
                    controlType: "sap.m.MessagePopover",
                    success: function (aMessagePopover) {
                        var iExpectedCount = aExpectedMessages.length, aItems = aMessagePopover[0].getItems();
                        Opa5.assert.ok(aMessagePopover.length === 1);
                        Opa5.assert.strictEqual(aItems.length, iExpectedCount, "Check Messages: message count is as expected: " + iExpectedCount);
                        aExpectedMessages.forEach(function (oExpectedMessage, i) {
                            var bFound;
                            bFound = aItems.some(function (oItem) {
                                return oItem.getTitle() === oExpectedMessage.message && oItem.getType() === oExpectedMessage.type;
                            });
                            Opa5.assert.ok(bFound, "Check Messages: expected message[" + i + "]: " + oExpectedMessage.message + " type: " + oExpectedMessage.type);
                        });
                    }
                });
            },
            checkMessageDetails: function (sMessage, sExpectedDetails) {
                this.waitFor({
                    id: /-messageViewMarkupDescription/,
                    success: function (aDetailsHtml) {
                        Opa5.assert.strictEqual(aDetailsHtml.length, 1);
                        Opa5.assert.ok(aDetailsHtml[0].getContent().includes(sExpectedDetails), "Check Message Details: includes '" + sExpectedDetails + "'");
                    }
                });
            },
            checkMessageHasTechnicalDetails: function (oExpectedDetails) {
                this.waitFor({
                    id: /technicalDetailsLink-/,
                    controlType: "sap.m.Link",
                    success: function (aLinks) {
                        Opa5.assert.strictEqual(aLinks.length, 1);
                        TestUtils.deepContains(aLinks[0].data("technicalDetails"), oExpectedDetails, "Check Message has Technical Details: " + JSON.stringify(oExpectedDetails));
                    }
                });
            }
        }
    },
    onTheSuccessInfo: {
        actions: {
            confirm: function () {
                this.waitFor({
                    controlType: "sap.m.Dialog",
                    matchers: new Properties({ icon: "sap-icon://sys-enter-2" }),
                    success: function (aControls) {
                        aControls[0].getButtons()[0].$().tap();
                        Opa5.assert.ok(true, "Confirm 'Success'");
                    }
                });
            }
        },
        assertions: {
            checkMessage: function (rMessage) {
                this.waitFor({
                    controlType: "sap.m.Dialog",
                    matchers: new Properties({ icon: "sap-icon://sys-enter-2" }),
                    success: function (aControls) {
                        var sText = aControls[0].getContent()[0].getText();
                        Opa5.assert.ok(rMessage.test(sText), "Message text '" + sText + "' matches " + rMessage);
                    }
                });
            }
        }
    }
});