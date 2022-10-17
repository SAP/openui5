/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/matchers/Ancestor",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "sap/ui/test/actions/Press",
    "../actions/TriggerEvent",
    "sap/ui/test/actions/EnterText",
	"sap/ui/events/KeyCodes",
    "./Util",
    "./doWait",
    "sap/ui/test/matchers/Properties",
    "sap/ui/test/matchers/Matcher"
], function (Opa5, Ancestor, PropertyStrictEquals, Press, TriggerEvent, EnterText, KeyCodes, Util, doWait, fnMatchProperties, Matcher) {
	"use strict";

    var oActions = {
        iCloseTheValueHelpDialog: function(bCancel, sValueHelpId) {
            return doWait(this).forValueHelp({
                success: function(oValueHelp) {
                    Opa5.assert.ok(oValueHelp, "sap.ui.mdc.ValueHelp found.");
                    var sContainerType = oValueHelp.getDialog().getMetadata().getName(); // may also be popover based
                    this.waitFor({
                        controlType: sContainerType,
                        matchers: new Ancestor(oValueHelp),
                        success: function(aVHDialogs) {
                            Opa5.assert.equal(aVHDialogs.length, 1, "ValueHelp dialog found.");
                            this.waitFor({
                                controlType: "sap.m.Button",
                                matchers: [
                                    new Ancestor(aVHDialogs[0], false),
                                    new PropertyStrictEquals({
                                        name: "text",
                                        value: bCancel ? Util.texts.cancel : Util.texts.ok
                                    })
                                ],
                                actions: new Press()
                           });
                        }
                    });
                }
            });
        },
        iNavigateToValueHelpContent: function(oProperties, sValueHelpId) {
            return doWait(this).forValueHelpDialog({
                success: function(oDialog) {
                    Opa5.assert.ok(oDialog, "ValueHelp dialog found.");

                    var oValueHelpDialog = oDialog.getParent();
                    var oNextContent = oValueHelpDialog.getContent().find(function (oControl) {
                        return fnMatchProperties(oProperties)(oControl);
                    });
                    Opa5.assert.ok(oNextContent, "Matching dialog content found.");
                    this.iWaitForPromise(oValueHelpDialog._handleContentSelectionChange(oNextContent.getId()));

                    return doWait(this).forValueHelpContent({
                        properties: oProperties
                    }, sValueHelpId);
                }.bind(this)
            });
        },
        iToggleTheValueHelpListItem: function (sText, sValueHelpId) {
            return doWait(this).forValueHelpListItemWithTexts(sText, {
                success: function(oResult) {
                    if (oResult.isA('sap.m.ColumnListItem')) {
                        new Press().executeOn(oResult);
                    } else {
                        new TriggerEvent({event: "click"}).executeOn(oResult.getCells()[0]);
                    }
                    Opa5.assert.ok(oResult, "The listitem with text " + sText + " was pressed. ");
                }
            }, sValueHelpId);
        },
        iEnterTextOnTheValueHelpDialogSearchField: function(sValue, oConfig, sValueHelp) {
			return doWait(this).forValueHelpDialogSearchField({
                success: function(oSearchField) {
                    new EnterText(oConfig ? Object.assign({
                        text: sValue
                    }, oConfig) : {
                        text: sValue
                    }).executeOn(oSearchField.getParent());
                    Opa5.assert.ok(true, 'The text "' + sValue + '" was entered into the SearchField');
                },
                errorMessage: 'The text "' + sValue + '" could not be entered into the SearchField'
            }, sValueHelp);
		},
        iFireTheValueHelpDialogFilterBarSearch: function (sValue, sValueHelp) {
            return doWait(this).forValueHelpDialogFilterBar({
                success: function(oFilterBar) {
                    oFilterBar.validate();
                    QUnit.assert.ok(oFilterBar, "FilterBar search triggered.");
                }
            }, sValueHelp);
        },

        iAddADefineConditionRow: function (sValue, sValueHelp) {
            return doWait(this).forValueHelpDefineConditionPanel({
                success: function(aResults) {
                    var oDefineConditionPanel = aResults[0];
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        matchers: new Ancestor(oDefineConditionPanel),
                        properties: {
                            text: "Add"
                        },
                        success: function(aResults) {
                            Opa5.assert.ok(aResults[0], "DefineConditionPanel Row Add Button pressed.");
                        },
                        actions: new Press()
                    });
                }
            }, sValueHelp);
        },
        iEnterDefineConditionValuesInRow: function (iIndex, vValues, sValueHelp) {
            var aValues = [].concat(vValues);
            return doWait(this).forValueHelpDefineConditionPanel({
                success: function(aResults) {
                    var oDefineConditionPanel = aResults[0];
                    var sPanelId = oDefineConditionPanel.getId();
                    return this.waitFor({
                        properties: {
                            id: {
                                regex: {
                                    source: sPanelId + "--" + iIndex + "-values[0-9]$",  //__conditions0-DCP--0-values0
                                    flags: "g"
                                }
                            }
                        },
                        success: function (aResults) {
                            aResults.forEach(function (oField, iIndex) {
                                if (typeof aValues[iIndex] !== "undefined") {
                                    new EnterText({
                                        text: aValues[iIndex]
                                    }).executeOn(oField);
                                    Opa5.assert.ok(1, "Wrote value '" + aValues[iIndex] + "' to " + oField.getId());
                                }
                            });
                            // Focus ok button to confirm values
                            return oActions.iConfirmDefineConditionRowValues.call(this);
                        }
                    });
                }
            }, sValueHelp);
        },
        iConfirmDefineConditionRowValues: function () {
            return this.waitFor({
                controlType: "sap.m.Button",
                properties: {
                    text: "OK"
                },
                success: function (aResults) {
                    aResults[0].focus();
                    Opa5.assert.ok(1, "Focussed OK to confirm values");
                }
            });
        },
        iChangeDefineConditionOperatorInRow: function (iIndex, sValue, sValueHelp) {
            return doWait(this).forValueHelpDefineConditionPanel({
                success: function(aResults) {
                    var oDefineConditionPanel = aResults[0];
                    var sPanelId = oDefineConditionPanel.getId();
                    return this.waitFor({
                        properties: {
                            id: {
                                regex: {
                                    source: sPanelId + "--" + iIndex + "-operator$",  //__conditions0-DCP--0-operator
                                    flags: "g"
                                }
                            }
                        },
                        success: function (aResults) {
                           var oField = aResults[0];
                           oField.setValue(sValue);
                           Opa5.assert.ok(oField, "Set value " + sValue + " on " + oField.getId() + "");
                        }
                    });
                }
            }, sValueHelp);
        },
        iRemoveDefineConditionRow: function (iIndex, sValueHelp) {
            return doWait(this).forValueHelpDefineConditionPanel({
                success: function(aResults) {
                    var oDefineConditionPanel = aResults[0];
                    var sPanelId = oDefineConditionPanel.getId();
                    return this.waitFor({

                        properties: {
                            id: {
                                regex: {
                                    source: sPanelId + "--" + iIndex + "--removeBtnLarge|" + sPanelId + "--" + iIndex + "--removeBtnSmall",  //__conditions0-DCP--1--removeBtnLarge
                                    flags: "g"
                                }
                            }
                        },
                        success: function (aResults) {
                           Opa5.assert.ok(aResults[0], "Pressed remove button" + sPanelId + "--" + iIndex);
                        },
                        actions: new Press()
                    });
                }
            }, sValueHelp);
        },
        iRemoveValueHelpToken: function (sValue, sValueHelp) {
            return doWait(this).forValueHelpDialog({
                success: function(oDialog) {
                    return this.waitFor({
                        controlType: "sap.m.Token",
                        matchers: new Ancestor(oDialog.getParent()),
                        properties: {
                            text: sValue
                        },
                        success: function (aTokens) {
                            return this.waitFor({
                                controlType: "sap.ui.core.Icon",
                                matchers: new Ancestor(aTokens[0]),
                                properties: {
                                    src: "sap-icon://decline"
                                },
                                success: function (aResults) {
                                   Opa5.assert.ok(aResults[0], "Pressed icon on token " + aTokens[0].getId());
                                },
                                actions: new Press()
                            });
                        }
                    });
                }
            }, sValueHelp);
        },

        iRemoveAllValueHelpTokens: function (sValueHelp) {
            return doWait(this).forValueHelpDialog({
                success: function(oDialog) {
                    var oValueHelpDialog = oDialog.getParent();
                    return this.waitFor({
                        id: oValueHelpDialog.getId() + "-TokenRemoveAll",
                         searchOpenDialogs: true,
                         success: function (oToken) {
                            return this.waitFor({
                                controlType: "sap.ui.core.Icon",
                                matchers: new Ancestor(oToken),
                                properties: {
                                    src: "sap-icon://decline"
                                },
                                success: function (aResults) {
                                    Opa5.assert.ok(aResults[0], "Pressed icon on token " + oValueHelpDialog.getId() + "-TokenRemoveAll");
                                },
                                actions: new Press()
                            });
                        }
                    });
                }
            }, sValueHelp);
        }
    };

    return oActions;
});