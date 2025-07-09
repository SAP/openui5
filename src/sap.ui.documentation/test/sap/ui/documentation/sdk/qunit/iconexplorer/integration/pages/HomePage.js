sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/EnterText",
    "sap/ui/test/actions/Press"
], function (Opa5, EnterText, Press) {
    "use strict";

    var sViewName = "Home";

    Opa5.createPageObjects({
        onTheHomePage: {
            actions: {
                iSearchForInput: function (sSearchTerm) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Input",
                        id: "search",
                        actions: [new EnterText({
                            text: sSearchTerm,
                            keepFocus: true
                        })],
                        success: function () {
                            Opa5.assert.ok(true, "Successfully searched for: " + sSearchTerm);
                        },
                        errorMessage: "Could not search for icons"
                    });
                },

                iPressSearchButton: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        id: "searchButton",
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Search button pressed");
                        },
                        errorMessage: "Could not press search button"
                    });
                },

                iClearSearch: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.ui.core.Icon",
                        matchers: function (oIcon) {
                            return oIcon.getSrc() === "sap-icon://decline";
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Search cleared");
                        },
                        errorMessage: "Could not clear search"
                    });
                },

                iSelectARowFromTheSuggestionTable: function (iRowIndex) {
                   iRowIndex = iRowIndex || 0;

                    return this.waitFor({
                        controlType: "sap.m.Table",
                        success: function (aTables) {
                            var oTable = aTables[0];

                            this.waitFor({
                                controlType: "sap.m.ColumnListItem",
                                matchers: function (oItem) {
                                    return oItem.getParent() === oTable;
                                },
                                actions: new Press(),
                                success: function (aItems) {
                                    if (aItems[iRowIndex]) {
                                        Opa5.assert.ok(true, "Successfully selected row " + iRowIndex);
                                    } else {
                                        Opa5.assert.ok(false, "Row " + iRowIndex + " not found");
                                    }
                                },
                                errorMessage: "Could not select row " + iRowIndex
                            });
                        },
                        errorMessage: "Could not find table"
                    });
                },

                 iPressLibraryButton: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        matchers: function (oButton) {
                            var oBinding = oButton.getBinding("text");
                            return oBinding && oBinding.getPath() === "iconExplorerBrowseLibrary";
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Pressed Browse Library button");
                        },
                        errorMessage: "Could not press Browse Library button"
                    });
                },

                iPressInfoButton: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        matchers: function (oButton) {
                            var oBinding = oButton.getBinding("text");
                            return oBinding && oBinding.getPath() === "infoTitle";
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Pressed Info button");
                        },
                        errorMessage: "Could not press Info button"
                    });
                }
            },

            assertions: {
                iShouldSeeRadioButtons: function (iCount, aExpectedI18nKeys) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.RadioButton",
                        success: function (aRadioButtons) {
                            Opa5.assert.ok(aRadioButtons.length === iCount, "Found " + aRadioButtons.length + " radio buttons");

                            if (aExpectedI18nKeys && aExpectedI18nKeys.length > 0) {
                                aExpectedI18nKeys.forEach(function(sI18nKey, index) {
                                    if (aRadioButtons[index]) {
                                        var oBinding = aRadioButtons[index].getBinding("text");
                                        if (oBinding) {
                                            var sBindingPath = oBinding.getPath();
                                            Opa5.assert.ok(sBindingPath === sI18nKey,
                                                "Radio button " + index + " has correct i18n binding: " + sI18nKey);
                                        }
                                    }
                                });
                            }
                        },
                        errorMessage: "Radio buttons validation failed"
                    });
                },

                iShouldSeeTheSearchInput: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Input",
                        id: "search",
                        success: function (oSearchInput) {
                            Opa5.assert.ok(oSearchInput, "Search input is visible");
                        },
                        errorMessage: "Search input not found"
                    });
                },

                iShouldSeeSearchResults: function () {
                    return this.waitFor({
                        controlType: "sap.m.Table",
                        success: function (aResults) {
                            Opa5.assert.ok(aResults[0].getItems().length > 0, "Found search results");
                        },
                        errorMessage: "Did not find expected search results"
                    });
                },

                iShouldSeeBrowseLibraryButton: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        matchers: function (oButton) {
                            var oBinding = oButton.getBinding("text");
                            return oBinding && oBinding.getPath() === "iconExplorerBrowseLibrary";
                        },
                        success: function (aButtons) {
                            Opa5.assert.ok(aButtons.length === 1, "Found Browse Library button with correct i18n binding");
                        },
                        errorMessage: "Browse Library button not found"
                    });
                },

                iShouldSeeInfoButton: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        matchers: function (oButton) {
                            var oBinding = oButton.getBinding("text");
                            return oBinding && oBinding.getPath() === "infoTitle";
                        },
                        success: function (aButtons) {
                            Opa5.assert.ok(aButtons.length === 1, "Found Info button with correct i18n binding");

                            var oButton = aButtons[0];
                            Opa5.assert.strictEqual(oButton.getIcon(), "sap-icon://forward",
                                "Info button has correct icon");
                            Opa5.assert.strictEqual(oButton.getIconFirst(), false,
                                "Info button has icon positioned after text");
                        },
                        errorMessage: "Info button not found"
                    });
                },

                iShouldSeeNavigationButtons: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        matchers: function (oButton) {
                            var oBinding = oButton.getBinding("text");
                            return oBinding && (
                                oBinding.getPath() === "iconExplorerBrowseLibrary" ||
                                oBinding.getPath() === "infoTitle"
                            );
                        },
                        success: function (aButtons) {
                            Opa5.assert.ok(aButtons.length === 2, "Found both navigation buttons with correct i18n bindings");
                        },
                        errorMessage: "Navigation buttons not found"
                    });
                }
            }
        }
    });
});