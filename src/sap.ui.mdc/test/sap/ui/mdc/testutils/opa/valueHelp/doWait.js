/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
    "sap/ui/test/matchers/Descendant",
    "sap/ui/test/matchers/Properties",
    "sap/ui/test/matchers/Matcher"
], function(Opa5, Ancestor, Descendant, fnMatchProperties, Matcher) {
	"use strict";

    var _getActiveValueHelpContainer = function (oValueHelp) {
        var oTypeahead = oValueHelp.getTypeahead();
        var oDialog = oValueHelp.getDialog();

        if (oTypeahead && oTypeahead.isOpen()) {
            return oTypeahead;
        }

        if (oDialog && oDialog.isOpen()) {
            return oDialog;
        }
    };
    var _getActiveValueHelpContent = function (oValueHelp) {
        var oTypeahead = oValueHelp.getTypeahead();
        var oDialog = oValueHelp.getDialog();

        if (oTypeahead && oTypeahead.isOpen()) {
            return oTypeahead.getSelectedContent();
        }

        if (oDialog && oDialog.isOpen()) {
            return oDialog.getSelectedContent();
        }
    };


    var fnWait = function (oScope) {
        var oWaiters = {

            forValueHelp: function (oConfig, sValueHelpId) {
                return oScope.waitFor({
                    controlType: "sap.ui.mdc.ValueHelp",
                    visible: oConfig && oConfig.hasOwnProperty("visible") ? oConfig.visible : true,
                    matchers: oConfig && oConfig.matchers,
                    properties: sValueHelpId && {
                        id: sValueHelpId
                    },
                    success: function (aResult) {
                        return oConfig && oConfig.success ? oConfig.success.call(oScope, aResult[0]) : aResult[0];
                    },
                    errorMessage: 'Could not find ValueHelp "' + sValueHelpId + '"'
                });
            },

            forValueHelpDialog: function (oConfig, sValueHelpId) {
                return oWaiters.forValueHelp({success: function (oValueHelp) {
                    return oScope.waitFor({
                        controlType: "sap.m.Dialog",
                        matchers: [
                            new Ancestor(oValueHelp, false)
                        ],
                        success: function(aResult) {
                            return oConfig && oConfig.success ? oConfig.success.call(oScope, aResult[0]) : aResult[0];

                        },
                        errorMessage: "The valuehelp dialog is not visible"
                    });
                }}, sValueHelpId);
            },

            forValueHelpDialogFilterBar: function (oConfig, sValueHelpId) {
                return oWaiters.forValueHelp({success: function (oValueHelp) {
                    var oActiveValueHelpContent = _getActiveValueHelpContent(oValueHelp);
                    var oFilterBar = oActiveValueHelpContent && oActiveValueHelpContent.getFilterBar && oActiveValueHelpContent._getPriorityFilterBar();

                    return oScope.waitFor({
                        searchOpenDialogs: true,
                        id: oFilterBar.getId(),
                        matchers: [
                            new Ancestor(oActiveValueHelpContent, false)
                        ],
                        success: function(oResult) {
                            return oConfig && oConfig.success ? oConfig.success.call(oScope, oResult) : oResult;
                        },
                        errorMessage: oConfig && oConfig.errorMessage || "The valuehelp dialog filterbar is not visible"
                    });
                }}, sValueHelpId);
            },

            forValueHelpContent: function (oConfig, sValueHelpId) {
                return oWaiters.forValueHelp({success: function (oValueHelp) {
                    var oActiveValueHelpContainer = _getActiveValueHelpContainer(oValueHelp);
                    var oContent = oActiveValueHelpContainer.getContent().find(function (oControl) {
                        return fnMatchProperties(oConfig.properties)(oControl);
                    });
                    Opa5.assert.ok(oContent, "Matching valuehelp content found");

                    var oDisplayContent = oContent.getDisplayContent();
                    Opa5.assert.ok(oDisplayContent, "Matching valuehelp content has displaycontent");


                    return oScope.waitFor({
                        id: oDisplayContent.getId(),
                        searchOpenDialogs: true,
                        success: function(oResult) {
                            Opa5.assert.ok(oResult, "Found expected displaycontent to be rendered.");
                        },
                        errorMessage: "The valuehelp contents displaycontent is not visible"
                    });
                }}, sValueHelpId);
            },

            forValueHelpDialogSearchField: function (oConfig, sValueHelpId) {
                return oWaiters.forValueHelpDialogFilterBar({success: function (oFilterBar) {
                    return oScope.waitFor({
                        controlType: "sap.m.SearchField",
                        searchOpenDialogs: true,
                        matchers: [
                            new Ancestor(oFilterBar, false)
                        ],
                        success: function(aResult) {
                            return oConfig && oConfig.success ? oConfig.success.call(oScope, aResult[0]) : aResult[0];
                        },
                        errorMessage: oConfig && oConfig.errorMessage || "The valuehelp dialog searchfield is not visible"
                    });
                },
                errorMessage: "The valuehelp dialog searchfield is not visible"
            }, sValueHelpId);
            },

            forValueHelpPopover: function (oConfig, sValueHelpId) {
                return oWaiters.forValueHelp({success: function (oValueHelp) {
                    return oScope.waitFor({
                        controlType: "sap.ui.mdc.valuehelp.Popover", // we do not care for the actual sap.m.Popover
                        matchers: [
                            new Ancestor(oValueHelp, false)
                        ],
                        success: function(aResult) {
                            return oConfig && oConfig.success ? oConfig.success.call(oScope, aResult[0]) : aResult[0];
                        },
                        errorMessage: "The valuehelp popover is not visible"
                    });
                }}, sValueHelpId);
            },

            forValueHelpList: function (oConfig, sValueHelpId) {
                return oWaiters.forValueHelp({success: function (oValueHelp) {
                    var oActiveValueHelpContent = _getActiveValueHelpContent(oValueHelp);
                    var oTable = oActiveValueHelpContent && oActiveValueHelpContent.getTable && oActiveValueHelpContent.getTable(); // we search for some kind of table based content
                    return oActiveValueHelpContent && oTable ? oScope.waitFor({
                        controlType: oTable.getMetadata().getName(),
                        matchers: [
                            new Ancestor(oActiveValueHelpContent, false)
                        ],
                        properties: {
                            id: oTable.getId()
                        },
                        success: function(aResult) {
                            return oConfig && oConfig.success ? oConfig.success.call(oScope, aResult[0]) : aResult[0];
                        },
                        errorMessage: "No valuehelp content is visible"
                    }) : Promise.reject("No valuehelp content is visible / No list for given content available");
                }}, sValueHelpId);
            },

            forValueHelpListItemWithTexts: function (vText, oConfig, sValueHelpId) {
                var aTexts = [].concat(vText);

                return oWaiters.forValueHelpList({success: function (oTable) {
                    var bMDCTable = oTable.isA("sap.ui.mdc.Table");
                    var oRelevantTable = bMDCTable ? oTable._oTable : oTable;
                    var oTableAncestor = new Ancestor(oRelevantTable);

                    var bIsGridTable = oRelevantTable && oRelevantTable.isA("sap.ui.table.Table");

                    var oMatcher = new Matcher();
                    oMatcher.isMatching = function(oListItem) {
                        return oListItem.getCells().filter(function (oCell) {
                            return aTexts.indexOf(oCell.mProperties["text"]) !== -1;
                        }).length === aTexts.length;
                    };

                    return oScope.waitFor({
                        searchOpenDialogs: true,
                        controlType: bIsGridTable ? "sap.ui.table.Row" : "sap.m.ColumnListItem",
                        matchers: [oTableAncestor, oMatcher],
                        success: function (aResults) {
                            Opa5.assert.equal(aResults.length, 1, "exactly 1 listitem for " + aResults[0] + "found.");
                            return oConfig && oConfig.success && oConfig.success(aResults[0]);
                        }
                    });
                }}, sValueHelpId);
            },
            forValueHelpDefineConditionPanel: function (oConfig, sValueHelpId) {
                return oWaiters.forValueHelp({
                    success: function (oValueHelp) {
                        return this.waitFor(Object.assign({}, {
                            controlType: "sap.ui.mdc.field.DefineConditionPanel",
                            matchers: new Ancestor(oValueHelp)
                        }, oConfig));
                    }
                }, sValueHelpId);
            },
            forValueHelpToken: function (sValue, sValueHelpId) {
                return oWaiters.forValueHelpDialog({
                    success: function(oDialog) {
                        return this.waitFor({
                            controlType: "sap.m.Token",
                            matchers: new Ancestor(oDialog.getParent()),
                            properties: {
                                text: sValue
                            },
                            success: function (aTokens) {
                                Opa5.assert.ok(aTokens[0], "Found token with text '" + sValue + "'");
                            }
                        });
                    }
                }, sValueHelpId);
            }
        };

        return oWaiters;
    };

	return fnWait;
});