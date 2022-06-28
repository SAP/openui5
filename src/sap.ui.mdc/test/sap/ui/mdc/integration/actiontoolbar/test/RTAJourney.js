/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
    "sap/ui/mdc/enum/ActionToolbarActionAlignment",
    "sap/ui/fl/FakeLrepConnectorLocalStorage",
    "sap/ui/mdc/ActionToolbarTesting/pages/App",
    "test-resources/sap/ui/rta/internal/integration/pages/Adaptation"
], function(
	Opa5,
	opaTest,
    ActionToolbarActionAlignment,
    FakeLrepConnectorLocalStorage
) {
	"use strict";

    Opa5.extendConfig({

		// TODO: increase the timeout timer from 15 (default) to 45 seconds
		// to see whether it influences the success rate of the first test on
		// the build infrastructure.
		// As currently, the underlying service takes some time for the
		// creation and initialization of tenants.
		// You might want to remove this timeout timer after the underlying
		// service has been optimized or if the timeout timer increase does
		// not have any effect on the success rate of the tests.
		timeout: 45,

		arrangements: {
			iStartMyUIComponentInViewMode: function() {

				// In some cases when a test fails in a success function,
				// the UI component is not properly teardown.
				// As a side effect, all the following tests in the stack
				// fails when the UI component is started, as only one UI
				// component can be started at a time.
				// Teardown the UI component to ensure it is not started
				// twice without a teardown, which results in less false
				// positives and more reliable reporting.
				if (this.hasUIComponentStarted()) {
					this.iTeardownMyUIComponent();
				}

				return this.iStartMyUIComponent({
					componentConfig: {
						name: "sap.ui.mdc.ActionToolbarTesting",
						async: true,
                        settings: {
                            id: "testingComponent"
                        }
					},
					hash: "",
					autowait: true
				});
			},
            iEnableTheLocalLRep: function() {
                // Init LRep for VariantManagement (we have to fake the connection to LRep in order to be independent from backend)
                FakeLrepConnectorLocalStorage.enableFakeConnector();
                FakeLrepConnectorLocalStorage.forTesting.synchronous.clearAll();
            },

            iClearTheLocalStorageFromRtaRestart: function() {
                window.localStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
                window.localStorage.removeItem("sap.ui.rta.restart.USER");
            }
		}
	});

    var aTestSettings = [
        {
            name: "StandAlone",
            toolbarID: "---app--actionToolbarId",
            contextMenuEntries: ["Cut", "Paste", "Toolbar Actions"],
            renameActionID: "standaloneButton4"
        },
        {
            name: "Table",
            toolbarID: "---app--actionToolbarTable-toolbar",
            contextMenuEntries: ["Toolbar Actions"],
            renameActionID: "tableButton4",
            variantManagementID: "testingComponent---app--IDVariantManagementOfTable"
        },
        {
            name: "Chart",
            toolbarID: "---app--actionToolbarChart--toolbar",
            contextMenuEntries: ["Toolbar Actions"],
            renameActionID: "chartButton4",
            variantManagementID: "testingComponent---app--IDVariantManagementOfChart"
        }
    ];

    aTestSettings.forEach(function(oTestSetting) {
        QUnit.module("ActionToolbar RTA - " + oTestSetting.name, {});

        opaTest("Check initial state", function(Given, When, Then) {
            Given.iStartMyUIComponentInViewMode();
            Given.iEnableTheLocalLRep();
            Given.iClearTheLocalStorageFromRtaRestart();

            Then.onTheApp.iShouldSeeActionToolbarWithActions("testingComponent" + oTestSetting.toolbarID, {
                "Action 1": {
                    alignment: ActionToolbarActionAlignment.Begin,
                    aggregationName: "end"
                },
                "Action 4": {
                    alignment: ActionToolbarActionAlignment.Begin,
                    aggregationName: "end"
                },
                "Action 5": {
                    alignment: ActionToolbarActionAlignment.Begin,
                    aggregationName: "end"
                },
                "Action 2": {
                    alignment: ActionToolbarActionAlignment.End,
                    aggregationName: "end"
                },
                "Action 3": {
                    alignment: ActionToolbarActionAlignment.End,
                    aggregationName: "end"
                }
            });
        });

        opaTest("Hide 'Action 1'", function(Given, When, Then) {
            When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("testingComponent---app");
            Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("testingComponent---app", undefined);

            // Open Context Menu of ActionToolbar
            When.onPageWithRTA.iRightClickOnAnElementOverlay("testingComponent" + oTestSetting.toolbarID);

            Then.onPageWithRTA.iShouldSeetheContextMenu();
            Then.onPageWithRTA.iShouldSeetheContextMenuEntries(oTestSetting.contextMenuEntries);
            When.onPageWithRTA.iClickOnAContextMenuEntryWithText("Toolbar Actions");

            // Check if Dialog opened (included in personalization)
            // Do personalization
            When.onTheApp.iSelectActions([
                "Action 4",
                "Action 5",
                "Action 2",
                "Action 3"
            ]);

            // Close dialog
            When.onTheApp.iPressOkButtonOnP13nDialog();

            // Close RTA
            When.onPageWithRTA.iExitRtaMode();

            // Check button order
            Then.onTheApp.iShouldSeeActionToolbarWithActions("testingComponent" + oTestSetting.toolbarID, {
                "Action 4": {
                    alignment: ActionToolbarActionAlignment.Begin,
                    aggregationName: "end"
                },
                "Action 5": {
                    alignment: ActionToolbarActionAlignment.Begin,
                    aggregationName: "end"
                },
                "Action 2": {
                    alignment: ActionToolbarActionAlignment.End,
                    aggregationName: "end"
                },
                "Action 3": {
                    alignment: ActionToolbarActionAlignment.End,
                    aggregationName: "end"
                }
            });
        });

        opaTest("move 'Action 2' down, move 'Action 5' to top", function(Given, When, Then) {
            When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("testingComponent---app");
            Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("testingComponent---app", undefined);

            // Open Context Menu of ActionToolbar
            When.onPageWithRTA.iRightClickOnAnElementOverlay("testingComponent" + oTestSetting.toolbarID);

            Then.onPageWithRTA.iShouldSeetheContextMenu();
            Then.onPageWithRTA.iShouldSeetheContextMenuEntries(oTestSetting.contextMenuEntries);
            When.onPageWithRTA.iClickOnAContextMenuEntryWithText("Toolbar Actions");

            // Change button order
            When.onTheApp.iMoveActionDown("Action 2");
            When.onTheApp.iMoveActionToTop("Action 5");

            // Close dialog
            When.onTheApp.iPressOkButtonOnP13nDialog();

            // Close RTA
            When.onPageWithRTA.iExitRtaMode();

            // Check button order
            Then.onTheApp.iShouldSeeActionToolbarWithActions("testingComponent" + oTestSetting.toolbarID, {
                "Action 5": {
                    alignment: ActionToolbarActionAlignment.Begin,
                    aggregationName: "end"
                },
                "Action 4": {
                    alignment: ActionToolbarActionAlignment.Begin,
                    aggregationName: "end"
                },
                "Action 3": {
                    alignment: ActionToolbarActionAlignment.End,
                    aggregationName: "end"
                },
                "Action 2": {
                    alignment: ActionToolbarActionAlignment.End,
                    aggregationName: "end"
                }
            });
        });

        opaTest("rename 'Action 4'", function(Given, When, Then) {
            When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("testingComponent---app");
            Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("testingComponent---app", undefined);

            // Open Context Menu of ActionToolbarAction
            When.onPageWithRTA.iRightClickOnAnElementOverlay("testingComponent---app--" + oTestSetting.renameActionID);
            Then.onPageWithRTA.iShouldSeetheContextMenu();
            Then.onPageWithRTA.iShouldSeetheContextMenuEntries(["Rename"]);
            When.onPageWithRTA.iClickOnAContextMenuEntryWithText("Rename");

            When.onPageWithRTA.iEnterANewName("Rename Test");

            // Close RTA
            When.onPageWithRTA.iExitRtaMode();

             // Check button order
             Then.onTheApp.iShouldSeeActionToolbarWithActions("testingComponent" + oTestSetting.toolbarID, {
                "Action 5": {
                    alignment: ActionToolbarActionAlignment.Begin,
                    aggregationName: "end"
                },
                "Rename Test": {
                    alignment: ActionToolbarActionAlignment.Begin,
                    aggregationName: "end"
                },
                "Action 3": {
                    alignment: ActionToolbarActionAlignment.End,
                    aggregationName: "end"
                },
                "Action 2": {
                    alignment: ActionToolbarActionAlignment.End,
                    aggregationName: "end"
                }
            });

            Then.iTeardownMyUIComponent();
        });

        if (oTestSetting.variantManagementID) {
            opaTest("check if contextMenu opens for VariantMangement in 'between' aggregation of ActionToolbar", function(Given, When, Then) {
                Given.iStartMyUIComponentInViewMode();
                Given.iEnableTheLocalLRep();
                Given.iClearTheLocalStorageFromRtaRestart();

                When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("testingComponent---app");

                // Open Context Menu of VariantManagement
                When.onPageWithRTA.iRightClickOnAnElementOverlay(oTestSetting.variantManagementID);
                Then.onPageWithRTA.iShouldSeetheContextMenu();
                Then.onPageWithRTA.iShouldSeetheContextMenuEntries(["Rename", "Save View", "Save View As", "Manage Views", "Switch Views"]);

                // Close RTA
                When.onPageWithRTA.iExitRtaMode();

                Then.iTeardownMyUIComponent();
            });
        }

    });

});