/* globals opaTest */

sap.ui.define([
	'sap/ui/test/Opa5', 'sap/ui/test/opaQunit', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Arrangement', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Action', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Assertion', 'sap/ui/Device'
], function(Opa5, opaQunit, Arrangement, Action, Assertion, Device) {
	'use strict';

	if (window.blanket) {
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view.",
		autoWait: true
	});

	//set execution delay for Internet Explorer and Edge
	if (Device.browser.msie || Device.browser.edge) {
		Opa5.extendConfig({
			executionDelay: 50
		});
	}

	opaTest("When I look at the screen, a table with links should appear", function(Given, When, Then) {
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/link/opa/appUnderTestContactAnnotation/start.html');
		Given.iEnableTheLocalLRep();
		Given.iClearTheLocalStorageFromRtaRestart();

		Then.iShouldSeeVisibleColumnsInOrder("sap.m.Column", [
			"Product ID", "Product Name", "Supplier ID", "Empty ID"
		]);
		Then.iShouldSeeColumnWithName("Product ID");
		Then.iShouldSeeColumnWithName("Product Name");
		Then.iShouldSeeColumnWithName("Supplier ID");
		Then.iShouldSeeColumnWithName("Empty ID");

		Then.theCellWithTextIsOfType("1239102", "sap.m.Link");
		Then.theCellWithTextIsOfType("Power Projector 4713", "sap.m.Link");
		Then.theCellWithTextIsOfType("1234567890.0", "sap.m.Link");
		Then.theCellWithTextIsOfType("ABC", "sap.m.Text");
	});

	opaTest("When I click on '1239102' link in the 'Product ID' column, popover should show contact annotation", function(Given, When, Then) {
		When.iClickOnLink("1239102");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.contactInformationExists();
	});

	opaTest("When I click on 'Power Projector 4713' link in the 'Product Name' column, popover should show contact annotation defined in 'Supplier' EntityType via navigation property", function(Given, When, Then) {
		Given.closeAllNavigationPopovers();
		When.iClickOnLink("Power Projector 4713");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.contactInformationExists();
	});

	opaTest("When I click on '1234567890.0' link in the 'Supplier ID' column, popover should show contact annotation defined in 'Supplier' EntityType via EntitySet", function(Given, When, Then) {
		Given.closeAllNavigationPopovers();
		When.iClickOnLink("1234567890.0");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.contactInformationExists();

		Given.closeAllNavigationPopovers();
	});

});
