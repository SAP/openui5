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
	"sap/ui/core/Element",
	"sap/ui/mdc/ActionToolbarTesting/pages/App",
	"test-resources/sap/ui/rta/integration/pages/Adaptation"
], function(
	Library,
	MessageType,
	Opa5,
	opaTest,
	ActionToolbarActionAlignment,
	Element,
	App,
	Adaptation
) {
	"use strict";

	// const oRb = Library.getResourceBundleFor("sap.m");

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
			toolbarID: "ActionToolbarTesting---app--actionToolbarId",
			contextMenuEntriesKeys: ["CTX_CUT", "CTX_PASTE", "CTX_SETTINGS"],
			renameActionID: "standaloneButton4",
			splitActionID: "standaloneMenuButton",
			blockAdaptationActionID: "standaloneButton3"
		},
		{
			name: "Table",
			toolbarID: "ActionToolbarTesting---app--actionToolbarTable-toolbar",
			contextMenuEntriesKeys: ["CTX_SETTINGS"],
			renameActionID: "tableButton4",
			splitActionID: "tableMenuButton",
			blockAdaptationActionID: "tableButton3",
			variantManagementID: "ActionToolbarTesting---app--IDVariantManagementOfTable"
		},
		{
			name: "Chart",
			toolbarID: "ActionToolbarTesting---app--actionToolbarChart--toolbar",
			contextMenuEntriesKeys: ["CTX_SETTINGS"],
			renameActionID: "chartButton4",
			splitActionID: "chartMenuButton",
			blockAdaptationActionID: "chartButton3",
			variantManagementID: "ActionToolbarTesting---app--IDVariantManagementOfChart"
		}
	];

	aTestSettings.forEach(function(oTestSetting) {
		QUnit.module("ActionToolbar RTA - " + oTestSetting.name, {});

		opaTest("should have correct initial state", function(Given, When, Then) {
			Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/actiontoolbar/index.html");
			Given.iClearTheLocalStorageFromRtaRestart();

			Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
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
				"Action 6": {
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
			Then.iTeardownMyAppFrame();
		});

		// opaTest("should hide 'Action 1'", function(Given, When, Then) {
		// 	When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
		// 	Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);
		//
		// 	// Open Context Menu of ActionToolbar
		// 	When.onPageWithRTA.iRightClickOnAnElementOverlay(oTestSetting.toolbarID);
		//
		// 	Then.onPageWithRTA.iShouldSeetheContextMenu();
		// 	Then.onPageWithRTA.iShouldSeetheContextMenuEntriesWithKeys(oTestSetting.contextMenuEntriesKeys);
		// 	When.onPageWithRTA.iClickOnAContextMenuEntryWithKey("CTX_SETTINGS");
		//
		// 	// Check if Dialog opened (included in personalization)
		// 	// Do personalization
		// 	When.onTheApp.iSelectActions([
		// 		"Action 4",
		// 		"Action 5",
		// 		"Action 6",
		// 		"Action 2",
		// 		"Action 3"
		// 	]);
		//
		// 	// Close dialog
		// 	When.onTheApp.iPressOkButtonOnP13nDialog();
		//
		// 	// Close RTA
		// 	When.onPageWithRTA.iExitRtaMode();
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 4": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 5": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 6": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		// });
		//
		// opaTest("should move 'Action 2' down, move 'Action 5' to top", function(Given, When, Then) {
		// 	When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
		// 	Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);
		//
		// 	// Open Context Menu of ActionToolbar
		// 	When.onPageWithRTA.iRightClickOnAnElementOverlay(oTestSetting.toolbarID);
		//
		// 	Then.onPageWithRTA.iShouldSeetheContextMenu();
		// 	Then.onPageWithRTA.iShouldSeetheContextMenuEntriesWithKeys(oTestSetting.contextMenuEntriesKeys);
		// 	When.onPageWithRTA.iClickOnAContextMenuEntryWithKey("CTX_SETTINGS");
		//
		// 	// Change button order
		// 	When.onTheApp.iMoveActionDown("Action 2");
		// 	When.onTheApp.iMoveActionToTop("Action 5");
		//
		// 	// Close dialog
		// 	When.onTheApp.iPressOkButtonOnP13nDialog();
		//
		// 	// Close RTA
		// 	When.onPageWithRTA.iExitRtaMode();
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 5": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 4": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 6": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		// });
		//
		// opaTest("should not move 'Action 3'", function(Given, When, Then) {
		// 	When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
		// 	Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);
		//
		// 	// Open Context Menu of ActionToolbar
		// 	When.onPageWithRTA.iRightClickOnAnElementOverlay(oTestSetting.toolbarID);
		//
		// 	Then.onPageWithRTA.iShouldSeetheContextMenu();
		// 	Then.onPageWithRTA.iShouldSeetheContextMenuEntriesWithKeys(oTestSetting.contextMenuEntriesKeys);
		// 	When.onPageWithRTA.iClickOnAContextMenuEntryWithKey("CTX_SETTINGS");
		//
		// 	// Change button order
		// 	When.onTheApp.iCannotMoveAction("Action 3");
		// 	Then.onPageWithRTA.iShouldSeeTheMessageStrip(oRb.getText("p13n.MESSAGE_DISABLED_ITEMS"), MessageType.Warning);
		//
		// 	// Close dialog
		// 	When.onTheApp.iPressOkButtonOnP13nDialog();
		//
		// 	// Close RTA
		// 	When.onPageWithRTA.iExitRtaMode(true);
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 5": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 4": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 6": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		// });
		//
		// opaTest("should rename 'Action 4'", function(Given, When, Then) {
		// 	When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
		// 	Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);
		//
		// 	// Open Context Menu of ActionToolbarAction
		// 	When.onPageWithRTA.iRightClickOnAnElementOverlay("ActionToolbarTesting---app--" + oTestSetting.renameActionID);
		// 	Then.onPageWithRTA.iShouldSeetheContextMenu();
		// 	Then.onPageWithRTA.iShouldSeetheContextMenuEntriesWithKeys(["CTX_RENAME"]);
		// 	When.onPageWithRTA.iClickOnAContextMenuEntryWithKey("CTX_RENAME");
		//
		// 	When.onPageWithRTA.iEnterANewName("Rename Test");
		//
		// 	// Close RTA
		// 	When.onPageWithRTA.iExitRtaMode();
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 5": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Rename Test": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 6": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		// });
		//
		// opaTest("should split 'Action 6'", function(Given, When, Then) {
		// 	When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
		// 	Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);
		//
		// 	When.onPageWithRTA.iRightClickOnAnElementOverlay("ActionToolbarTesting---app--" + oTestSetting.splitActionID);
		// 	Then.onPageWithRTA.iShouldSeetheContextMenu();
		// 	Then.onPageWithRTA.iShouldSeetheContextMenuEntriesWithKeys(["CTX_UNGROUP_FIELDS"]);
		// 	When.onPageWithRTA.iClickOnAContextMenuEntryWithKey("CTX_UNGROUP_FIELDS");
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 5": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Rename Test": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Export as PDF": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Export to Excel": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		//
		// 	When.onPageWithRTA.iClickTheUndoButton();
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 5": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Rename Test": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 6": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		//
		// 	When.onPageWithRTA.iClickTheRedoButton();
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 5": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Rename Test": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Export as PDF": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Export to Excel": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		//
		// 	// Close RTA
		// 	When.onPageWithRTA.iExitRtaMode();
		//
		// });
		//
		// opaTest("should combine 'Action 5', 'Export as PDF' and 'Export to Excel'", function(Given, When, Then) {
		// 	When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
		// 	Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);
		//
		// 	When.onTheApp.iSelectElementOverlaysOfActions(oTestSetting.toolbarID, [
		// 		"Action 5", "Export as PDF", "Export to Excel"
		// 	]);
		//
		// 	Then.onPageWithRTA.iShouldSeetheContextMenu();
		// 	Then.onPageWithRTA.iShouldSeetheContextMenuEntriesWithKeys(["CTX_RENAME", "CTX_GROUP_FIELDS"]);
		// 	When.onPageWithRTA.iClickOnAContextMenuEntryWithKey("CTX_GROUP_FIELDS");
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 5/Export as PDF/Export to Excel": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Rename Test": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		//
		// 	When.onPageWithRTA.iClickTheUndoButton();
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 5": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Rename Test": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Export as PDF": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Export to Excel": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		//
		// 	When.onPageWithRTA.iClickTheRedoButton();
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 5/Export as PDF/Export to Excel": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Rename Test": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		//
		// 	// Close RTA
		// 	When.onPageWithRTA.iExitRtaMode();
		// });
		//
		// opaTest("should not adapt 'Action 3'", function(Given, When, Then) {
		// 	When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
		// 	Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("ActionToolbarTesting---app", undefined);
		//
		// 	// Check if I can open the Context Menu of the element
		// 	When.onPageWithRTA.iCanNotRightClickOnAnElementOverlay("ActionToolbarTesting---app--" + oTestSetting.blockAdaptationActionID);
		//
		// 	// Close RTA
		// 	When.onPageWithRTA.iExitRtaMode(true);
		//
		// 	// Check button order
		// 	Then.onTheApp.iShouldSeeActionToolbarWithActions(oTestSetting.toolbarID, {
		// 		"Action 5/Export as PDF/Export to Excel": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Rename Test": {
		// 			alignment: ActionToolbarActionAlignment.Begin,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 3": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		},
		// 		"Action 2": {
		// 			alignment: ActionToolbarActionAlignment.End,
		// 			aggregationName: "end"
		// 		}
		// 	});
		//
		// 	Then.iTeardownMyAppFrame();
		// });

		// if (oTestSetting.variantManagementID) {
		// 	opaTest("should open contextMenu for VariantMangement in 'between' aggregation of ActionToolbar", function(Given, When, Then) {
		// 		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/actiontoolbar/index.html");
		// 		Given.iClearTheLocalStorageFromRtaRestart();
		//
		// 		When.onTheApp.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("ActionToolbarTesting---app");
		//
		// 		// Open Context Menu of VariantManagement
		// 		When.onPageWithRTA.iRightClickOnAnElementOverlay(oTestSetting.variantManagementID);
		// 		Then.onPageWithRTA.iShouldSeetheContextMenu();
		// 		Then.onPageWithRTA.iShouldSeetheContextMenuEntriesWithKeys(["CTX_VARIANT_SET_TITLE", "CTX_VARIANT_SAVE", "CTX_VARIANT_SAVEAS", "CTX_VARIANT_MANAGE", "CTX_VARIANT_SWITCH_SUBMENU"]);
		//
		// 		// Close RTA
		// 		When.onPageWithRTA.iExitRtaMode(false, /*bNoChanges =*/true);
		//
		// 		Then.iTeardownMyAppFrame();
		// 	});
		// }

	});

});