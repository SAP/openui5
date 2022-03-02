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
						async: true
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

    var iComponent = 0;

    var aTestSettings = [
        {
            name: "StandAlone",
            id: "---app--actionToolbarId"
        },
        {
            name: "Table",
            id: "---app--actionToolbarTable-toolbar"
        },
        {
            name: "Chart",
            id: "---app--actionToolbarChart--toolbar"
        }
    ];

    aTestSettings.forEach(function(oTestSetting) {
        QUnit.module("ActionToolbar RTA - " + oTestSetting.name, {
            after: function() {
                iComponent++;
            }
        });

        opaTest("Check initial state", function(Given, When, Then) {
            Given.iStartMyUIComponentInViewMode();
            Given.iEnableTheLocalLRep();
            Given.iClearTheLocalStorageFromRtaRestart();

            Then.onTheApp.iShouldSeeActionToolbarWithActions("__component" + iComponent + oTestSetting.id, {
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

        opaTest("Hide 'Test Action 1'"/*, move 'Test Action 2' down, move 'Test Action 8' to top"*/, function(Given, When, Then) {
            When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("__component" + iComponent + "---app");
            Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("__component" + iComponent + "---app", undefined);

            // Open Context Menu of ActionToolbar
            When.onPageWithRTA.iRightClickOnAnElementOverlay("__component" + iComponent + oTestSetting.id);

            Then.onPageWithRTA.iShouldSeetheContextMenu();
            When.onPageWithRTA.iClickOnAContextMenuEntryWithText("Toolbar Actions");

            // Check if Dialog opened (included in personalization)
            // Do personalization
            When.onTheApp.iSelectActions([
                "Action 4",
                "Action 5",
                "Action 2",
                "Action 3"
            ]);

            //When.onTheApp.iMoveActionDown("__component" + iComponent + "---app--idAction2");
            //When.onTheApp.iMoveActionToTop("__component" + iComponent + "---app--idAction5");

            // Close dialog
            When.onTheApp.iPressOkButtonOnP13nDialog();

            // Close RTA
            When.onPageWithRTA.iExitRtaMode();

            // Check button order
            Then.onTheApp.iShouldSeeActionToolbarWithActions("__component" + iComponent + oTestSetting.id, {
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

            Then.iTeardownMyUIComponent();
        });
    });

});