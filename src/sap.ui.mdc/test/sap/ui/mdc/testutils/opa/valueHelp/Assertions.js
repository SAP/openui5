/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define(["./doWait", "sap/ui/test/matchers/Ancestor"
], function (doWait, Ancestor
) {
	"use strict";

    return {
        iShouldSeeValueHelpListItems: function(vTexts, sValueHelp) {
            var aTexts = [].concat(vTexts);
            return Promise.all(aTexts.map(function (vValues) {
                return doWait(this).forValueHelpListItemWithTexts(vValues, undefined, sValueHelp);
            }.bind(this))).then(function (aResult) {
                QUnit.assert.equal(aResult.length, aTexts.length, "Found all listitems for strings: " + aTexts.join(", "));
            });
        },
        iShouldSeeTheValueHelpDialog: function(sValueHelp) {
            return doWait(this).forValueHelpDialog(undefined, sValueHelp);
        },
        iShouldSeeValueHelpContent: function(oProperties, sValueHelp) {
            return doWait(this).forValueHelpContent({ properties: oProperties, success: function (oValueHelp) {
                return this.waitFor({
                    matchers: [
                        new Ancestor(oValueHelp, false)
                    ],
                    success: function(aResults) {
                        QUnit.assert.ok(aResults.length, "Matching displaycontent is rendered.");
                    },
                    errorMessage: "Could not find a matching displaycontent"
                });
            }}, sValueHelp);
        },
        iShouldNotSeeTheValueHelp: function (sValueHelp) {
            return doWait(this).forValueHelp({
                visible: false,
                matchers: function (oValueHelp) {
                    return !oValueHelp.isOpen();
                }
            }, sValueHelp);
        },
        iShouldSeeTheValueHelpDialogSearchField: function (sValue, sValueHelp) {
            return doWait(this).forValueHelpDialogSearchField({
                success: function(oSearchField) {
                    if (typeof sValue !== "undefined") {
                        QUnit.assert.equal(oSearchField.getValue(), sValue, "SearchField has value " + sValue + ".");
                    } else {
                        QUnit.assert.ok(oSearchField, "SearchField found.");
                    }
                }
            }, sValueHelp);
        },
        iShouldSeeValueHelpToken: function (sValue, sValueHelp) {
            return doWait(this).forValueHelpDialog({
                success: function(oDialog) {
                    return this.waitFor({
                        controlType: "sap.m.Token",
                        matchers: new Ancestor(oDialog.getParent()),
                        properties: {
                            text: sValue
                        },
                        success: function (aTokens) {
                            QUnit.assert.ok(aTokens[0], "Found requested token with text '" + sValue + "'");
                        }
                    });
                }
            }, sValueHelp);
        }
    };
});