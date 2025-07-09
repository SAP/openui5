sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/EnterText",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, EnterText, Press, PropertyStrictEquals) {
    "use strict";

    var sViewName = "Overview";

    Opa5.createPageObjects({
        onTheOverviewPage: {
            actions: {
                iSearchForInput: function (sSearchTerm) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.SearchField",
                        id: "searchField",
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

                iShouldCopyIcon: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.f.GridList",
                        id: "results",
                        success: function (oGridList) {
                            var oItem = oGridList.getItems()[0];
                            var aButtons = oItem.findAggregatedObjects(true, function (oControl) {
                                return oControl.getMetadata().getName() === "sap.m.Button" && oControl.getIcon() === "sap-icon://copy";
                            });
                            if (aButtons.length > 0) {
                                aButtons[0].firePress();
                                Opa5.assert.ok(true, "Copy icon button pressed");
                            } else {
                                Opa5.assert.ok(false, "Copy icon button not found");
                            }
                        },
                        errorMessage: "Could not find the copy icon button"
                    });
                },

                iShouldOpenSidePanel: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        id: "mySidePanel-expandCollapseButton",
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Side panel opened");
                        },
                        errorMessage: "Could not open side panel"
                    });
                }

            },

            assertions: {
                iShouldSeeOverviewPage: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.f.DynamicPage",
                        id: "page",
                        success: function (oPage) {
                            Opa5.assert.ok(oPage, "Overview page is visible");
                        },
                        errorMessage: "Overview page not found"
                    });
                },

                iShouldSeePageTitle: function (sTitle) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Title",
                        matchers: new PropertyStrictEquals({
                            name: "text",
                            value: sTitle
                        }),
                        success: function (oTitle) {
                            Opa5.assert.ok(oTitle, "Page title is: " + sTitle);

                        },
                        errorMessage: "Page title not found or does not match: " + sTitle
                    });
                },

                iShouldSeeNavBackButton: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        matchers: new PropertyStrictEquals({
                            name: "icon",
                            value: "sap-icon://nav-back"
                        }),
                        success: function (oButton) {
                            Opa5.assert.ok(oButton, "Navigation back button is visible");
                        },
                        errorMessage: "Navigation back button not found"
                    });
                },

                IShouldSeeNavigationButton: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        matchers: function (oButton) {
                            var oBinding = oButton.getBinding("text");
                            return oBinding?.getPath() === "infoTitle" && oButton.getIcon() === "sap-icon://forward";
                        },
                        success: function (oButton) {
                            Opa5.assert.ok(oButton, "Found navigation button with correct i18n binding and icon");
                        },
                        errorMessage: "Navigation button not found"
                    });
                },

                iShouldSeeFilters: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Select",
                        id: "libraryPicker",
                        success: function (oSelect) {
                            Opa5.assert.ok(oSelect, "Library picker is visible");
                        },
                        errorMessage: "Library picker not found"
                    }).and.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Select",
                        id: "themePicker",
                        success: function (oSelect) {
                            Opa5.assert.ok(oSelect, "Theme picker is visible");
                        },
                        errorMessage: "Theme picker not found"
                    }).and.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.ComboBox",
                        id: "categorySelection",
                        success: function (oComboBox) {
                            Opa5.assert.ok(oComboBox, "Category selection is visible");
                        },
                        errorMessage: "Category selection not found"
                    });
                },

                iShouldSeeSuggestedTags: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Tokenizer",
                        id: "tagSelection",
                        success: function (oTonekizer) {
                            Opa5.assert.ok(oTonekizer, "Suggested tags are visible");
                            Opa5.assert.ok(oTonekizer.getTokens().length > 0, "Found suggested tags");
                        },
                        errorMessage: "Suggested tags not found"
                    });
                },

                iShouldSeeTheSearchField: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.SearchField",
                        id: "searchField",
                        success: function (oSearchField) {
                            Opa5.assert.ok(oSearchField, "Search field is visible");
                        },
                        errorMessage: "Search field not found"
                    });
                },

                iShouldSeeSearchResults: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.f.GridList",
                        id: "results",
                        success: function (oGridList) {
                            Opa5.assert.ok(oGridList.getItems().length > 0, "Found search results");
                        },
                        errorMessage: "Did not find expected search results"
                    });
                },

                iShouldSeeSidePanelOpened: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.f.SidePanel",
                        id: "mySidePanel",
                        success: function (oSidePanel) {
                            var oSideContent = oSidePanel.getDomRef().querySelector(".sapFSPSideContent");
                            Opa5.assert.ok(oSideContent, "Side panel is opened");
                        },
                        errorMessage: "Side panel is not opened"
                    });
                },

                iShouldSeeIconPreview: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.f.GridList",
                        id: "preview",
                        success: function (oGridList) {
                            Opa5.assert.ok(oGridList, "Icon preview is visible");
                            var aButtons = oGridList.findAggregatedObjects(true, function (oControl) {
                                return oControl.getMetadata().getName() === "sap.m.Button" && oControl.getIcon() === "sap-icon://copy";
                            });
                            if (aButtons.length === 3) {
                                Opa5.assert.ok(true, "Copy icon buttons are present");
                            } else {
                                Opa5.assert.ok(false, "Copy icon buttons not found");
                            }
                        },
                        errorMessage: "Icon preview not found"
                    });
                },

                IShouldSeeIconInformation: function (sName) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.ui.core.Icon",
                        id: "previewIcon",
                        success: function (oIcon) {
                            Opa5.assert.ok(oIcon.getSrc() === "sap-icon://" + sName, "Correct icon is displayed in preview");
                        },
                        errorMessage: "Icon information not found"
                    }).and.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Title",
                        matchers: new PropertyStrictEquals({
                            name: "text",
                            value: sName
                        }),
                        success: function (oTitle) {
                            Opa5.assert.ok(oTitle, "Title with correct text found: " + sName);
                        },
                        errorMessage: "Title with text '" + sName + "' not found"
                    }).and.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Text",
                        matchers: new PropertyStrictEquals({
                            name: "text",
                            value: "SAP Icons"
                        }),
                        success: function (oText) {
                            Opa5.assert.ok(oText, "Text control with 'SAP Icons' found");
                        },
                        errorMessage: "Text control with 'SAP Icons' not found"
                    });
                },

                IShouldSeeCopyIconPanel: function (sName) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.f.GridList",
                        id: "previewCopy",
                        success: function (oGridList) {
                            Opa5.assert.ok(oGridList, "Copy icon panel is visible");
                        },
                        errorMessage: "Copy icon panel not found"
                    }).and.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Input",
                        id: "previewCopyCode",
                        success: function (oInput) {
                            Opa5.assert.ok(oInput.getValue() === "sap-icon://" + sName, "Input with correct value found");
                        },
                        errorMessage: "Input with value '" + sName + "' not found"
                    }).and.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Input",
                        id: "previewCopyIcon",
                        success: function (oInput) {
                            Opa5.assert.ok(oInput.getValue() === sName + " (Symbol)", "Input with correct value found");
                        },
                        errorMessage: "Input with value '" + sName + "' not found"
                    }).and.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Input",
                        id: "previewCopyUnicode",
                        success: function (oInput) {
                            Opa5.assert.ok(oInput, "Input for unicode is visible");
                        },
                        errorMessage: "Input for unicode not found"
                    });
                }

            }
        }
    });
});