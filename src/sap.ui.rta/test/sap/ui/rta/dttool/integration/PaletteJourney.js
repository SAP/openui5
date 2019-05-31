/*global QUnit*/

sap.ui.require([
	"sap/ui/test/opaQunit"
], function (
	opaTest
) {
	"use strict";

	QUnit.module("PaletteJourney");

	opaTest("Palette should have 8 groups", function (Given, When, Then) {
		Then.onTheAppView.thePaletteShouldHaveTheGivenNumberOfGroups(8);
	});

	opaTest("Adding a Custom Control should work", function (Given, When, Then) {
		When.onTheAppView.iClickTheAddControlButton()
			.and.iEnterAModulePathIntoTheInput("sap/ui/rta/dttool/controls/CustomButton")
			.and.iPressTheAddButton();
		Then.onTheAppView.theControlWasAddedToThePalette();
	});
});