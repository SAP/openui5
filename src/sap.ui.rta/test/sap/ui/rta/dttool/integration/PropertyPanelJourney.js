/*global QUnit*/

sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("PropertyPanel");

		opaTest("Palette should have 8 groups", function (Given, When, Then) {
			Given.iStartMyApp({autoWait: true, hash: "#sample/sap.m.sample.Switch"});

			Then.onTheAppView.theSampleSelectShouldBeShown();
			Then.onTheAppView.thePaletteShouldHaveTheGivenNumberOfGroups(8);


		});
		// opaTest("Properties of the selected Control are shown", function (Given, When, Then) {
		//
		// 	When.onTheAppView.iSelectTheNthTreeItem(8);
		//
		//
		// });

		opaTest("Select the Tree Item and check the PropertyPanel", function (Given, When, Then) {
			When.onTheAppView.iExpandTheOutlineByNLevels(6, [1, 2, 3, 4, 8, 9, 12], [0, 1, 2, 3, 5, 6])
				.and.iSelectTheNthTreeItem(8);
			Then.onTheAppView.theCorrectOverlayIsSelected("__overlay14");
			Then.onTheAppView.thePropertyPanelToolbarShouldDisplayTheCorrectLabel("Switch");
			Then.onTheAppView.thePassedPropertyShouldBeDisplayedInPropertyPanel("state");
			Then.onTheAppView.thePassedPropertyInPropertyPanelItemHasContent("state");
			When.onTheAppView.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex("state", 0);
			When.onTheAppView.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex("type", 1);

		});

		opaTest("Select another Tree Item and check the PropertyPanel", function (Given, When, Then) {
			When.onTheAppView.iSelectTheNthTreeItem(5);
			Then.onTheAppView.theCorrectOverlayIsSelected("__overlay5");
			Then.onTheAppView.thePropertyPanelToolbarShouldDisplayTheCorrectLabel("H Box");
			Then.onTheAppView.thePassedPropertyShouldBeDisplayedInPropertyPanel("wrap");
			Then.onTheAppView.thePassedPropertyInPropertyPanelItemHasContent("wrap");
			When.onTheAppView.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex("wrap", 1);
			When.onTheAppView.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex("direction", 1);
			When.onTheAppView.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex("alignItems", 2);


		});




	}
);