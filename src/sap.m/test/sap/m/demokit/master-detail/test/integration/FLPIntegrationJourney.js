/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
	[
		'sap/ui/test/Opa5'
	],
	function (Opa5) {

		QUnit.module("FLP Integration");

		opaTest("Should open the share menu and display the share buttons on the detail page", function (Given, When, Then) {
			// Arrangements
			Given.iStartTheApp();

			// Actions
			When.onTheDetailPage.iLookAtTheScreen();

			// Assertions
			Then.onTheDetailPage.theObjectPageShowsTheFirstObject();

			// Actions
			When.onTheDetailPage.iPressOnTheShareButton();

			// Assertions
			Then.onTheDetailPage.iShouldSeeTheShareEmailButton().
				and.iShouldSeeTheShareTileButton().
				and.iShouldSeeTheShareJamButton().
				and.iTeardownMyAppFrame();
		});
	});
