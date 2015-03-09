/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
[
	'sap/ui/test/Opa5',
	'sap/ui/demo/mdtemplate/test/integration/action/BusyAction',
	'sap/ui/demo/mdtemplate/test/integration/arrangement/StartAppArrangement',
	'sap/ui/demo/mdtemplate/test/integration/assertion/BusyAssertion'
],
function (Opa5, BusyAction, StartAppArrangement, BusyAssertion) {

	module("Phone busy indication", { setup : function () {
		Opa5.extendConfig({
			actions : new BusyAction(),
			arrangements : new StartAppArrangement(),
			assertions : new BusyAssertion(),
			viewNamespace : "sap.ui.demo.mdtemplate.view."
		});
	}});

	opaTest("Should see a global busy indication while loading the metadata", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheAppOnAPhoneWithDelay("", 10000);

		//Actions
		When.iLookAtTheScreen();

		// Assertions
		Then.iShouldSeeTheAppBusyIndicator().
			and.iTeardownMyAppFrame();
	});

	opaTest("Should see a busy indication on the master and detail after loading the metadata", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheAppOnAPhoneWithDelay("", 10000);

		//Actions
		When.iWaitUntilTheAppBusyIndicatorIsGone();

		// Assertions
		Then.iShouldSeeTheMasterBusyIndicator().
			and.iTeardownMyAppFrame();
	});

});
