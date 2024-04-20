/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
    "sap/ui/core/Lib",
    "sap/ui/core/message/MessageType",
    "sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
    "sap/ui/mdc/enums/ActionToolbarActionAlignment",
    "sap/ui/mdc/ActionToolbarTesting/pages/App",
    "test-resources/sap/ui/rta/integration/pages/Adaptation"
], function(
    Library,
    MessageType,
	Opa5,
	opaTest,
    ActionToolbarActionAlignment
) {
	"use strict";

    const oRb = Library.getResourceBundleFor("sap.m");

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
            iClearTheLocalStorageFromRtaRestart: function() {
                window.localStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
                window.localStorage.removeItem("sap.ui.rta.restart.USER");
                localStorage.clear();
            }
		}
	});

    const aTestSettings = [
        {
            name: "StandAlone",
            toolbarID: "---app--actionToolbarId",
            contextMenuEntries: ["Cut", "Paste", "Toolbar Actions"],
            renameActionID: "standaloneButton4",
            blockAdaptationActionID: "standaloneButton3"
        },
        {
            name: "Table",
            toolbarID: "---app--actionToolbarTable-toolbar",
            contextMenuEntries: ["Toolbar Actions"],
            renameActionID: "tableButton4",
            blockAdaptationActionID: "tableButton3",
            variantManagementID: "ActionToolbarTesting---app--IDVariantManagementOfTable"
        },
        {
            name: "Chart",
            toolbarID: "---app--actionToolbarChart--toolbar",
            contextMenuEntries: ["Toolbar Actions"],
            renameActionID: "chartButton4",
            blockAdaptationActionID: "chartButton3",
            variantManagementID: "ActionToolbarTesting---app--IDVariantManagementOfChart"
        }
    ];

    aTestSettings.forEach(function(oTestSetting) {
        QUnit.module("ActionToolbar RTA - " + oTestSetting.name, {});

        opaTest("Check initial state", function(Given, When, Then) {
            Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/actiontoolbar/index.html");
            Given.iClearTheLocalStorageFromRtaRestart();

            Then.onTheApp.iShouldSeeActionToolbarWithActions("ActionToolbarTesting" + oTestSetting.toolbarID, {
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
            When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
            Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);

            // Open Context Menu of ActionToolbar
            When.onPageWithRTA.iRightClickOnAnElementOverlay("ActionToolbarTesting" + oTestSetting.toolbarID);

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
            Then.onTheApp.iShouldSeeActionToolbarWithActions("ActionToolbarTesting" + oTestSetting.toolbarID, {
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
            When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
            Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);

            // Open Context Menu of ActionToolbar
            When.onPageWithRTA.iRightClickOnAnElementOverlay("ActionToolbarTesting" + oTestSetting.toolbarID);

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
            Then.onTheApp.iShouldSeeActionToolbarWithActions("ActionToolbarTesting" + oTestSetting.toolbarID, {
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

        opaTest("cannot move 'Action 3'", function(Given, When, Then) {
            When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
            Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);

            // Open Context Menu of ActionToolbar
            When.onPageWithRTA.iRightClickOnAnElementOverlay("ActionToolbarTesting" + oTestSetting.toolbarID);

            Then.onPageWithRTA.iShouldSeetheContextMenu();
            Then.onPageWithRTA.iShouldSeetheContextMenuEntries(oTestSetting.contextMenuEntries);
            When.onPageWithRTA.iClickOnAContextMenuEntryWithText("Toolbar Actions");

            // Change button order
            When.onTheApp.iCannotMoveAction("Action 3");
            Then.onPageWithRTA.iShouldSeeTheMessageStrip(oRb.getText("p13n.MESSAGE_DISABLED_ITEMS"), MessageType.Warning);

            // Close dialog
            When.onTheApp.iPressOkButtonOnP13nDialog();

            // Close RTA
            When.onPageWithRTA.iExitRtaMode(true);

            // Check button order
            Then.onTheApp.iShouldSeeActionToolbarWithActions("ActionToolbarTesting" + oTestSetting.toolbarID, {
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
            When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
            Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);

            // Open Context Menu of ActionToolbarAction
            When.onPageWithRTA.iRightClickOnAnElementOverlay("ActionToolbarTesting---app--" + oTestSetting.renameActionID);
            Then.onPageWithRTA.iShouldSeetheContextMenu();
            Then.onPageWithRTA.iShouldSeetheContextMenuEntries(["Rename"]);
            When.onPageWithRTA.iClickOnAContextMenuEntryWithText("Rename");

            When.onPageWithRTA.iEnterANewName("Rename Test");

            // Close RTA
            When.onPageWithRTA.iExitRtaMode();

             // Check button order
             Then.onTheApp.iShouldSeeActionToolbarWithActions("ActionToolbarTesting" + oTestSetting.toolbarID, {
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
        });

        opaTest("cannot adapt 'Action 3'", function(Given, When, Then) {
            When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
            Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);

            // Check if I can open the Context Menu of the element
            When.onPageWithRTA.iCanNotRightClickOnAnElementOverlay("ActionToolbarTesting---app--" + oTestSetting.blockAdaptationActionID);

            // Close RTA
            When.onPageWithRTA.iExitRtaMode(true);

             // Check button order
             Then.onTheApp.iShouldSeeActionToolbarWithActions("ActionToolbarTesting" + oTestSetting.toolbarID, {
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

            Then.iTeardownMyAppFrame();
        });

        if (oTestSetting.variantManagementID) {
            opaTest("check if contextMenu opens for VariantMangement in 'between' aggregation of ActionToolbar", function(Given, When, Then) {
                Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/actiontoolbar/index.html");
                Given.iClearTheLocalStorageFromRtaRestart();

                When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");

                // Open Context Menu of VariantManagement
                When.onPageWithRTA.iRightClickOnAnElementOverlay(oTestSetting.variantManagementID);
                Then.onPageWithRTA.iShouldSeetheContextMenu();
                Then.onPageWithRTA.iShouldSeetheContextMenuEntries(["Rename", "Save View", "Save View As", "Manage Views", "Switch Views"]);

                // Close RTA
                When.onPageWithRTA.iExitRtaMode(false, /*bNoChanges =*/true);

                Then.iTeardownMyAppFrame();
            });
        }

    });

});