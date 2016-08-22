sap.ui.define([
	'sap/ui/test/opaQunit'
], function (opaTest) {
	"use strict";

	QUnit.module("Smoke Test Journey");

	var sCategory = "Arrows",
		sIcon = "slim-arrow-right",
		sIconCode = "e1ed";

	opaTest("Display Categories", function (Given, When, Then) {
		Given.iStartTheApp();
		When.onTheMaster.iLookAtTheScreen();
		Then.onTheMaster.iShallSeeTheLevel1Item(sCategory)
			.and.iShallSeeTheLevel1Item("All")
			.and.iShallSeeTheLevel1Item("Travel");
	});

	opaTest("Navigate to a Category", function (Given, When, Then) {
		When.onTheMaster.iPressTheLevel1Item(sCategory);
		Then.onTheMaster.iShallSeeTheLevel2Item(sIcon);
	});

	opaTest("Preview Icon", function (Given, When, Then) {
		When.onTheMaster.iPressTheLevel2Item(sIcon);
		Then.onTheDetail.iShallSeeTwelveButtonsWithIcon(sIcon)
			.and.iShallSeeTheIconCode(sIconCode);
	});

	opaTest("Favorite Icon", function (Given, When, Then) {
		When.onTheDetail.iFavoriteTheIcon();
		Then.onTheDetail.iShouldSeeAMessageToast();
	});

	opaTest("Show Favorites", function (Given, When, Then) {
		When.onTheMaster.iOpenTheFavoritesFromACategory();
		Then.onTheMaster.iShallSeeTheFavoriteItem(sIcon)
			.and.iShallSeeTheCorrectNumberOfFavorites(1);
	});

	opaTest("Delete Favorites", function (Given, When, Then) {
		When.onTheMaster.iEditTheFavorites()
			.and.iDeleteTheFavorite(sIcon)
			.and.iEndEditingTheFavorites(sIcon);
		Then.onTheMaster.iShallSeeNoFavoriteItems()
			.and.iShallSeeTheCorrectNumberOfFavorites(0);
	});

	opaTest("Close Favorites", function (Given, When, Then) {
		When.onTheMaster.iPressBrowserBack();
		Then.onTheMaster.iShallSeeTheLevel2Item(sIcon);
	});

	opaTest("Go to Home", function (Given, When, Then) {
		When.onTheMaster.iPressBrowserBack();
		Then.onTheMaster.iShallSeeTheLevel1Item("Arrows");
	});

	opaTest("Search for Icon", function (Given, When, Then) {
		When.onTheMaster.iSearchFor(sIcon);
		Then.onTheMaster.iShallOnlySeeTheLevel1Item(sIcon)
			.and.iTeardownMyAppFrame();
	});
});