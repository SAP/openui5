/*global QUnit*/

sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("DT Tool");

		opaTest("Palette should have 8 groups", function (Given, When, Then) {
			Given.iStartMyApp();

			Then.onTheAppView.thePaletteShouldHaveTheGivenNumberOfGroups(8);
		});

		opaTest("Should change the hash", function (Given, When, Then) {
			When.onTheAppView.iChangeTheHashToTheSwitchSample();

			Then.onTheAppView.theHashWasChanged();
		});

		opaTest("Adding a Custom Control should work", function (Given, When, Then) {
			When.onTheAppView.iClickTheAddControlButton()
				.and.iEnterAModulePathIntoTheInput("sap/ui/rta/dttool/CustomButton")
				.and.iPressTheAddButton();

			Then.onTheAppView.theControlWasAddedToThePalette();
		});


		opaTest("Should expand the outline and select a Tree Item", function (Given, When, Then) {
			When.onTheAppView.iExpandTheOutlineByNLevels(6, [1, 2, 3, 4, 8, 9, 12], [0, 1, 2, 3, 5, 6])
				.and.iSelectTheNthTreeItem(8);

			Then.onTheAppView.theCorrectOverlayIsSelected("__overlay24");
		});
	}
);