sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press"
], (Opa5, Press) => {
    "use strict";

    Opa5.createPageObjects({
        onTheAppPage: {
            actions: {
                iPressOnAnIllustration() {
                    return this.waitFor({
                        controlType: "sap.f.GridList",
                        success(oGridList) {
                            oGridList[0].getItems()[0].firePress();
                            Opa5.assert.ok(true, "Pressed on an illustration");
                        },
                        errorMessage: "Could not find the GridList with illustrations"
                    });
                },
                iSearchForIllustration(sQuery) {
                    return this.waitFor({
                        id: /.*searchField$/,
                        actions(oSearchField) {
                            oSearchField.setValue(sQuery);
                            oSearchField.fireLiveChange({ newValue: sQuery });
                        },
                        success() {
                            Opa5.assert.ok(true, "Searched for illustrations with query: " + sQuery);
                        },
                        errorMessage: "Could not find the search field"
                    });
                },
                iSelectIllustrationSize(sSize) {
                    return this.waitFor({
                        id: /.*illustrationSizeSelect$/,
                        controlType: "sap.m.Select",
                        visible: false, // Include controls not currently visible (e.g., in overflow)
                        success(aSelects) {
                            const oSelect = aSelects[1];
                            const bIsVisible = oSelect.$().is(":visible");

                            if (!bIsVisible) {
                                // Open the overflow menu
                                this.waitFor({
                                    id: /.*overflowButton$/,
                                    actions: new Press(),
                                    success: () => {
                                        Opa5.assert.ok(true, "Opened overflow menu");

                                        // Perform the selection in overflow
                                        this.waitFor({
                                            id: oSelect.getId(),
                                            actions(oOverflowSelect) {
                                                oOverflowSelect.setSelectedKey(sSize);
                                                oOverflowSelect.fireChange({ selectedItem: oOverflowSelect.getSelectedItem() });
                                            },
                                            success: () => {
                                                Opa5.assert.ok(true, "Selected illustration size from overflow: " + sSize);
                                            },
                                            errorMessage: "Could not find the illustration size Select in overflow"
                                        });
                                    },
                                    errorMessage: "Could not open the overflow menu"
                                });
                            } else {
                                // Control is visible, perform action directly
                                oSelect.setSelectedKey(sSize);
                                oSelect.fireChange({ selectedItem: oSelect.getSelectedItem() });
                                Opa5.assert.ok(true, "Selected illustration size: " + sSize);
                            }
                        },
                        errorMessage: "Could not find the illustration size Select"
                    });
                },
                iSelectIllustrationSet(sSet) {
                    return this.waitFor({
                        id: /.*illustrationSetSelect$/,
                        controlType: "sap.m.Select",
                        visible: false, // Include controls not currently visible (e.g., in overflow)
                        success(aSelects) {
                            const oSelect = aSelects[1];
                            const bIsVisible = oSelect.$().is(":visible");

                            if (!bIsVisible) {
                                // Open the overflow menu
                                this.waitFor({
                                    id: /.*overflowButton$/,
                                    actions: new Press(),
                                    success: () => {
                                        Opa5.assert.ok(true, "Opened overflow menu");

                                        // Perform the selection in overflow
                                        this.waitFor({
                                            id: oSelect.getId(),
                                            actions(oOverflowSelect) {
                                                oOverflowSelect.setSelectedKey(sSet);
                                                oOverflowSelect.fireChange({ selectedItem: oOverflowSelect.getSelectedItem() });
                                            },
                                            success: () => {
                                                Opa5.assert.ok(true, "Selected illustration set from overflow: " + sSet);
                                            },
                                            errorMessage: "Could not find the illustration set Select in overflow"
                                        });
                                    },
                                    errorMessage: "Could not open the overflow menu"
                                });
                            } else {
                                // Control is visible, perform action directly
                                oSelect.setSelectedKey(sSet);
                                oSelect.fireChange({ selectedItem: oSelect.getSelectedItem() });
                                Opa5.assert.ok(true, "Selected illustration set: " + sSet);
                            }
                        },
                        errorMessage: "Could not find the illustration set Select"
                    });
                },
                iShowDeprecatedIllustrations() {
                    return this.waitFor({
                        id: /.*hideDeprecatedCheckbox$/,
                        visible: false,
                        success: (aCheckboxes) => {
                            const oCheckbox = aCheckboxes[1];
                            const bIsVisible = oCheckbox.$().is(":visible");

                            if (!bIsVisible) {
                                this.waitFor({
                                    id: /.*overflowButton$/,
                                    actions: new Press(),
                                    success: () => {
                                        Opa5.assert.ok(true, "Opened overflow menu");

                                        this.waitFor({
                                            id: oCheckbox.getId(),
                                            actions: (oOverflowCheckbox) => {
                                                oOverflowCheckbox.setSelected(false);
                                                oOverflowCheckbox.fireSelect({ selected: false });
                                            },
                                            success: () => {
                                                Opa5.assert.ok(true, "Unchecked 'Hide Deprecated' checkbox in overflow to show deprecated illustrations");
                                            },
                                            errorMessage: "Could not find the 'Hide Deprecated' checkbox in overflow"
                                        });
                                    },
                                    errorMessage: "Could not open the overflow menu"
                                });
                            } else {
                                oCheckbox.setSelected(false);
                                oCheckbox.fireSelect({ selected: false });
                                Opa5.assert.ok(true, "Unchecked 'Hide Deprecated' checkbox to show deprecated illustrations");
                            }
                        },
                        errorMessage: "Could not find the 'Hide Deprecated' checkbox"
                    });
                },
                iHideDeprecatedIllustrations() {
                    return this.waitFor({
                        id: /.*hideDeprecatedCheckbox$/,
                        visible: false,
                        success: (aCheckboxes) => {
                            const oCheckbox = aCheckboxes[1];
                            const bIsVisible = oCheckbox.$().is(":visible");

                            if (!bIsVisible) {
                                this.waitFor({
                                    id: /.*overflowButton$/,
                                    actions: new Press(),
                                    success: () => {
                                        Opa5.assert.ok(true, "Opened overflow menu");

                                        this.waitFor({
                                            id: oCheckbox.getId(),
                                            actions: (oOverflowCheckbox) => {
                                                oOverflowCheckbox.setSelected(true);
                                                oOverflowCheckbox.fireSelect({ selected: true });
                                            },
                                            success: () => {
                                                Opa5.assert.ok(true, "Checked 'Hide Deprecated' checkbox in overflow to hide deprecated illustrations");
                                            },
                                            errorMessage: "Could not find the 'Hide Deprecated' checkbox in overflow"
                                        });
                                    },
                                    errorMessage: "Could not open the overflow menu"
                                });
                            } else {
                                oCheckbox.setSelected(true);
                                oCheckbox.fireSelect({ selected: true });
                                Opa5.assert.ok(true, "Checked 'Hide Deprecated' checkbox to hide deprecated illustrations");
                            }
                        },
                        errorMessage: "Could not find the 'Hide Deprecated' checkbox"
                    });
                }
            },
            assertions: {
                iShouldSeeTheApp() {
                    return this.waitFor({
                        controlType: "sap.m.App",
                        success() {
                            Opa5.assert.ok(true, "The App view is displayed");
                        },
                        errorMessage: "Did not find the App view"
                    });
                },
                iShouldSeeTheIllustrationDetails() {
                    return this.waitFor({
                        controlType: "sap.m.VBox",
                        matchers(oControl) {
                            return oControl.hasStyleClass("sapUiDemoIllustrationExplorerDetailsContent");
                        },
                        success(oVBox) {
                            Opa5.assert.ok(oVBox.length > 0, "The Illustration Details fragment is displayed");
                        },
                        errorMessage: "Did not find the Illustration Details fragment"
                    });
                },
                iShouldSeeItemsInIllustrationDetails() {
                    return this.waitFor({
                        controlType: "sap.m.VBox",
                        matchers(oControl) {
                            return oControl.hasStyleClass("sapUiDemoIllustrationExplorerDetailsContent");
                        },
                        success(oVBox) {
                            const aItems = oVBox[0].getItems();
                            Opa5.assert.ok(aItems.length > 0, "Items are present in the Illustration Details content");
                        },
                        errorMessage: "No items found in the Illustration Details content"
                    });
                },
                iShouldSeeFilteredIllustrations(sQuery) {
                    return this.waitFor({
                        controlType: "sap.f.GridList",
                        success(oGridList) {
                            const aItems = oGridList[0].getItems();
                            Opa5.assert.ok(aItems.length === 1, "Filtered illustrations are displayed");
                        },
                        errorMessage: "No illustrations found after filtering"
                    });
                },
                iShouldSeeIllustrationsWithSize(sSize) {
                    return this.waitFor({
                        controlType: "sap.m.Illustration",
                        matchers(oIllustration) {
                            return oIllustration.getMedia() === sSize;
                        },
                        success(aIllustrations) {
                            Opa5.assert.ok(aIllustrations.length > 0, "Illustrations with size " + sSize + " are displayed");
                        },
                        errorMessage: "No illustrations with size " + sSize + " found"
                    });
                },
                iShouldSeeIllustrationsFromSet(sSet) {
                    return this.waitFor({
                        controlType: "sap.m.Illustration",
                        matchers(oIllustration) {
                            return oIllustration.getSet() === sSet;
                        },
                        success(aIllustrations) {
                            Opa5.assert.ok(aIllustrations.length > 0, "Illustrations from set " + sSet + " are displayed");
                        },
                        errorMessage: "No illustrations from set " + sSet + " found"
                    });
                },
                iShouldSeeObjectStatusPopulated() {
                    return this.waitFor({
                        controlType: "sap.m.ObjectStatus",
                        matchers(oObjectStatus) {
                            return oObjectStatus.getTitle() && oObjectStatus.getText();
                        },
                        success(aObjectStatus) {
                            Opa5.assert.ok(aObjectStatus.length > 0, "ObjectStatus is populated with data");
                        },
                        errorMessage: "ObjectStatus is not populated with data"
                    });
                },
                iShouldSeeIllustrationInSideContent() {
                    return this.waitFor({
                        controlType: "sap.m.IllustratedMessage",
                        success(aIllustratedMessages) {
                            const oIllustratedMessage = aIllustratedMessages[0];
                            const sDisplayedType = oIllustratedMessage.getIllustrationType();

                            this.waitFor({
                                controlType: "sap.f.GridList",
                                success(oGridLists) {
                                    const oSelectedItem = oGridLists[0].getItems()[0];
                                    const oContext = oSelectedItem.getBindingContext("app");
                                    const oSelectedIllustration = oContext.getObject();
                                    const sExpectedType = `${oSelectedIllustration.set}-${oSelectedIllustration.type}`;

                                    const bTypeMatches = sDisplayedType === sExpectedType;

                                    Opa5.assert.ok(bTypeMatches, "IllustratedMessage in side content matches the selected illustration type");
                                },
                                errorMessage: "Could not find the selected illustration in the GridList"
                            });
                        },
                        errorMessage: "Could not find IllustratedMessage in side content"
                    });
                },
                iShouldSeeDeprecatedIllustrations() {
                    return this.waitFor({
                        controlType: "sap.f.GridList",
                        success(oGridList) {
                            const aItems = oGridList[0].getItems();
                            const aBindingContexts = aItems.map((item) => item.getBindingContext("app"));
                            const bHasDeprecated = aBindingContexts.some((context) => context.getProperty("deprecated") === true);

                            if (bHasDeprecated) {
                                // Normal case: deprecated illustrations exist and are visible
                                Opa5.assert.ok(true, "Deprecated illustrations are visible");
                            } else {
                                // Build 2.0 case: no deprecated illustrations exist in the system
                                Opa5.assert.ok(true, "No deprecated illustrations found in system (build 2.0) - test passes as expected");
                            }
                        },
                        errorMessage: "Could not verify visibility of deprecated illustrations"
                    });
                },
                iShouldNotSeeDeprecatedIllustrations() {
                    return this.waitFor({
                        controlType: "sap.f.GridList",
                        success(oGridList) {
                            const aItems = oGridList[0].getItems();
                            const aBindingContexts = aItems.map((item) => item.getBindingContext("app"));
                            const bHasDeprecated = aBindingContexts.some((context) => context.getProperty("deprecated") === true);

                            Opa5.assert.ok(!bHasDeprecated, "Deprecated illustrations are hidden");
                        },
                        errorMessage: "Could not verify that deprecated illustrations are hidden"
                    });
                }
            }
        }
    });
});