/*global QUnit*/

sap.ui.require([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	QUnit.module("DragDropJourney");

	opaTest("Load the sample app", function (Given, When, Then) {
		When.onTheAppView.iCollapseTheTree();
		Then.onTheAppView.theHashWasChanged()
				.and.theUndoStateShouldBeCorrect(false);
		Then.onTheCodeView.theViewsXMLFileShouldBeDisplayed("Main.view.xml");
	});

	opaTest("Drag an item from the palette into the iframe", function (Given, When, Then) {
		When.onTheAppView.iSelectAnItemFromThePalette(8)
				.and.iStartDragging();
		Then.onTheAppView.theDraggedItemShouldBePartOfTheTargetGroup()
				.and.theUndoStateShouldBeCorrect(true);
	});

	opaTest("Display the new element in the outline and code editor", function (Given, When, Then) {
		When.onTheAppView.iExpandTheOutlineByNLevels(6, [1, 2, 3, 4, 6, 7, 11], [0, 1, 2, 3, 4, 5])
				.and.iSelectTheNthTreeItem(9);
		Then.onTheAppView.theNewElementShouldBeDisplayedInTheOutline();
		Then.onTheCodeView.theElementsDesigntimeShouldBeDisplayed("Button.designtime.js")
				.and.theElementsComputedPropertiesShouldBeDisplayed("sap.ui.rta.dttool.sample");
	});

	opaTest("Should move element inside frame", function (Given, When, Then) {
		When.onTheAppView.iDragAnItemInsideFrame();
		Then.onTheAppView.theElementPositionShouldChange()
				.and.theElementShouldBeInTheOutline(1);
	});

		// opaTest("Should remove an element", function (Given, When, Then) {
		// 	//Select an element to remove and remove it by setting its visible attribute to false
		// 	When.onTheAppView.iSelectTheNthTreeItem(9)
		// 		.and.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex();
		// 	Then.onTheAppView.theElementShouldBeRemoved();
		// });

		// opaTest("Should undo changes", function (Given, When, Then) {
		// 	When.onTheAppView.iUndoTheLastChange();
		// 	Then.onTheAppView.theElementShouldBeInTheOutline(1)
		// 		.and.theRedoStateShouldBeCorrect(true);
		// });

	opaTest("Should save all changes (1/2)", function (Given, When, Then) {
		When.onTheAppView.iStopRta();
		Then.onTheAppView.theAppShouldContainNChanges(2)
				.and.and.theUndoStateShouldBeCorrect(false);
	});

	opaTest("Should save all changes (2/2)", function (Given, When, Then) {
		Then.onTheAppView.anAddXMLChangeShouldExist()
				.and.aMoveControlsChangeShouldExist();
	});

		//FIXME: Currently commented out because the AddXML command cannot save the fragment in the Fake-LRep
		// opaTest("Check the changes", function (Given, When, Then) {
		// 	//Restart app and check if changes are applied
		// 	Given.iTeardownMyUIComponent();
		// 	Given.iStartMyApp({autoWait: true, hash: "#sample/sap.ui.rta.dttool.sample"});
		// 	When.onTheAppView.thePaletteIsLoaded()
		// 		.and.theOutlineIsLoaded();
		// 	Then.onTheAppView.theDraggedItemShouldBePartOfTheTargetGroup();
		// });

	opaTest("Cleanup the changes", function (Given, When, Then) {
		When.onTheAppView.iCleanupLocalChanges();
		Then.onTheAppView.theAppShouldBeClean();
	});
}
);