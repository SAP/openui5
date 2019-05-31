/*global QUnit*/

sap.ui.require([
	"sap/ui/test/opaQunit"
], function (
	opaTest
) {
	"use strict";

	QUnit.module("PropertyPanel");

	opaTest("Select the Tree Item and check the PropertyPanel", function (Given, When, Then) {
		When.onTheAppView.iExpandTheOutlineByNLevels(6, [1, 2, 3, 4, 6, 7, 10], [0, 1, 2, 3, 4, 5])
			.and.iSelectTheNthTreeItem(7);
		Then.onTheAppView.theCorrectOverlayIsSelected("__overlay8")
			.and.thePropertyPanelToolbarShouldDisplayTheCorrectLabel("Switch")
			.and.thePassedPropertyShouldBeDisplayedInPropertyPanel("state")
			.and.thePassedPropertyInPropertyPanelItemHasContent("state");
		When.onTheAppView.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex("state", 0)
			.and.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex("type", 1);
	});

	opaTest("Select another Tree Item and check the PropertyPanel", function (Given, When, Then) {
		When.onTheAppView.iSelectTheNthTreeItem(9);
		Then.onTheAppView.theCorrectOverlayIsSelected("__overlay5")
			.and.thePropertyPanelToolbarShouldDisplayTheCorrectLabel("H Box")
			.and.thePassedPropertyShouldBeDisplayedInPropertyPanel("wrap")
			.and.thePassedPropertyInPropertyPanelItemHasContent("wrap");
		When.onTheAppView.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex("wrap", 1)
			.and.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex("direction", 1)
			.and.iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex("alignItems", 2);
	});
});