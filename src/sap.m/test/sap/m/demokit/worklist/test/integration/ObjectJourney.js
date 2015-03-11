/*global opaTest */
//declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
[
	'sap/ui/test/Opa5'
],
function (Opa5) {

	QUnit.module("Object");
	
	opaTest("Should see the busy indicator on app view while object view metadata is loaded", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			delay: 10000,
			hash: "#/object/ObjectID_10"
		});

		//Actions
		When.onTheObjectPage.iLookAtTheScreen();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicatorForTheWholeApp().
			and.iTeardownMyAppFrame();
	});
	
	opaTest("Should see the busy indicator on object view after metadata is loaded", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			delay: 1000,
			hash: "#/object/ObjectID_10"
		});

		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();

		// Assertions
		Then.onTheObjectPage.iShouldSeeTheObjectViewsBusyIndicator().
		    and.theObjectViewsBusyIndicatorDelayIsRestored(). 
			and.iTeardownMyAppFrame();
	});

});
