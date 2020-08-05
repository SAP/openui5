/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/MainView"
], function (opaTest) {
	"use strict";

	QUnit.module("PersonalizationAPI Journey");

	opaTest("Complete test to check isPersonalization on control, reset personalization on control, reset personalization for whole component", function (Given, When, Then) {
		// Starting the app
		Given.iStartMyApp();

		// There should be no personalization at beginning
		Then.onTheAppPage.iShouldSeeTheApp();
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("MainView", "overallPersStatus", false);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("FirstSubView", "overallPersStatus", false);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("FirstSubView", "labelPersStatus", false);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("FirstSubView", "labelInVariantPersStatus", false);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("SecondSubView", "overallPersStatus", false);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("SecondSubView", "labelPersStatus", false);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("SecondSubView", "labelInVariantPersStatus", false);

		// Create 1 change to FirstSubView - label
		When.onTheAppPage.iClickButton("FirstSubView", "createPersonalization");
		Then.onTheAppPage.iChangesAreApplied("FirstSubView", "label", "X");
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("MainView", "overallPersStatus", true);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("FirstSubView", "overallPersStatus", true);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("FirstSubView", "labelPersStatus", true);

		// Create 2 changes to FirstSubView - labelInVariant
		When.onTheAppPage.iClickButton("FirstSubView", "createVariantPersonalization");
		When.onTheAppPage.iClickButton("FirstSubView", "createVariantPersonalization");
		Then.onTheAppPage.iChangesAreApplied("FirstSubView", "variantLabel", "X X");
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("FirstSubView", "labelInVariantPersStatus", true);

		// Create 3 changes to SecondSubView - label
		When.onTheAppPage.iClickButton("SecondSubView", "createPersonalization");
		When.onTheAppPage.iClickButton("SecondSubView", "createPersonalization");
		When.onTheAppPage.iClickButton("SecondSubView", "createPersonalization");
		Then.onTheAppPage.iChangesAreApplied("SecondSubView", "label", "X X X");
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("SecondSubView", "overallPersStatus", true);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("SecondSubView", "labelPersStatus", true);

		// Create 4 changes to SecondSubView - labelInVariant
		When.onTheAppPage.iClickButton("SecondSubView", "createVariantPersonalization");
		When.onTheAppPage.iClickButton("SecondSubView", "createVariantPersonalization");
		When.onTheAppPage.iClickButton("SecondSubView", "createVariantPersonalization");
		When.onTheAppPage.iClickButton("SecondSubView", "createVariantPersonalization");
		Then.onTheAppPage.iChangesAreApplied("SecondSubView", "variantLabel", "X X X X");
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("SecondSubView", "labelInVariantPersStatus", true);

		// Reset changes for SecondSubView - labelInVariant
		When.onTheAppPage.iClickButton("SecondSubView", "resetVariantPersonalization");
		Then.onTheAppPage.iNoChangeIsApplied("SecondSubView", "variantLabel");
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("SecondSubView", "overallPersStatus", true);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("SecondSubView", "labelInVariantPersStatus", false);

		// Reset changes for SecondSubView - label
		When.onTheAppPage.iClickButton("SecondSubView", "resetPersonalization");
		Then.onTheAppPage.iNoChangeIsApplied("SecondSubView", "label");
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("SecondSubView", "overallPersStatus", false);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("SecondSubView", "labelPersStatus", false);

		// Reset whole application component
		When.onTheAppPage.iClickButton("MainView", "resetAllButton");
		Then.onTheAppPage.iNoChangeIsApplied("FirstSubView", "label");
		Then.onTheAppPage.iNoChangeIsApplied("FirstSubView", "variantLabel");
		Then.onTheAppPage.iNoChangeIsApplied("SecondSubView", "label");
		Then.onTheAppPage.iNoChangeIsApplied("SecondSubView", "variantLabel");
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("MainView", "overallPersStatus", false);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("FirstSubView", "overallPersStatus", false);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("FirstSubView", "labelPersStatus", false);
		Then.onTheAppPage.iPersonalizationStatusShouldBeCorrect("FirstSubView", "labelInVariantPersStatus", false);

		//Cleanup
		Then.iTeardownMyApp();
	});
});