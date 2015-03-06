/*global opaTest */
//declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
	[
		'sap/ui/test/Opa5'
	],
	function (Opa5) {

		QUnit.module("Not found Journey");

		opaTest("Should see the resource not found page when changing to an invalid hash", function (Given, When, Then) {
			//Arrangement
			Given.iStartMyApp();

			//Actions
			When.onTheWorklistPage.iWaitUntilTheTableIsLoaded();
			When.onTheBrowser.iChangeTheHashToSomethingInvalid();

			// Assertions
			Then.onTheNotFoundPage.iShouldSeeResourceNotFound().
				and.iTeardownMyAppFrame();
		});


		opaTest("Should see the not found page if the hash is something that matches no route", function (Given, When, Then) {
			Given.iStartMyApp({ hash: "#somethingThatDoesNotExist" });

			When.onTheNotFoundPage.iLookAtTheScreen();

			Then.onTheNotFoundPage.iShouldSeeResourceNotFound().
				and.iTeardownMyAppFrame();
		});

		opaTest("Should see the not found master and detail page if an invalid object id has been called", function (Given, When, Then) {
			Given.iStartMyApp({
				hash: "#/object/SomeInvalidObjectId"
			});

			//Actions
			When.onTheNotFoundPage.iLookAtTheScreen();

			// Assertions
			Then.onTheNotFoundPage.iShouldSeeObjectNotFound().
				and.iTeardownMyAppFrame();
		});

	});
