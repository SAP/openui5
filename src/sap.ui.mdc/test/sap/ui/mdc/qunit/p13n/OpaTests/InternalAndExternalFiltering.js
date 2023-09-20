sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary'
], function (Opa5, opaTest, Arrangement, TestUtil, Action, Assertion, TestLibrary) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/mdc");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view.",
		autoWait: true
	});

	const sTableID = "IDTableOfInternalSampleApp_01";

	opaTest("When I start the 'appUnderTestTable' app, the table should appear and contain some columns", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		When.iLookAtTheScreen();

		Then.theVariantManagementIsDirty(false);
    });

    opaTest("Open FilterBar 'Adapt Filters' dialog to enter condition values", function(Given, When, Then){
        When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
        When.iChangeAdaptFiltersView("sap-icon://group-2");
        When.iEnterTextInFilterDialog("Founding Year", "192*");

        When.iPressDialogOk();

        When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.go);

        //Table should be filtered
        Then.iShouldSeeVisibleItemsInTable(15);

        Then.theVariantManagementIsDirty(true);
    });

    opaTest("Open Table inbuilt 'Filters' dialog to enter condition values", function(Given, When, Then){
		When.onTheMDCTable.iPersonalizeFilter(sTableID, [
			{key : "Founding Year", values: ["*6"], inputControl: "IDTableOfInternalSampleApp_01--filter--foundingYear"}
		]);

        //Table should be filtered and take both filters into consideration, 'Go' not required here
        Then.iShouldSeeVisibleItemsInTable(3);

        Then.theVariantManagementIsDirty(true);
    });

    opaTest("Save p13n changes in a new variant", function(Give, When, Then){
		Then.iShouldSeeSelectedVariant("Standard");
		When.iSaveVariantAs("Standard", "FilterIntegrationTest");
        Then.iShouldSeeSelectedVariant("FilterIntegrationTest");

        Then.theVariantManagementIsDirty(false);

        //App restarts in next test
        Then.iTeardownMyAppFrame();
    });

    opaTest("Restart the application to check the variant appliance", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		When.iLookAtTheScreen();

        Then.iShouldSeeSelectedVariant("Standard");

        //Table not filtered
        Then.iShouldSeeVisibleItemsInTable(100);

		Then.theVariantManagementIsDirty(false);
    });

    opaTest("Select the variant 'FilterIntegrationTest'", function (Given, When, Then) {
        When.iSelectVariant("FilterIntegrationTest");

        //Table filtered taking both filter sources into consideration
        Then.iShouldSeeVisibleItemsInTable(3);

        Then.theVariantManagementIsDirty(false);

		Given.enableAndDeleteLrepLocalStorage();
        Then.iTeardownMyAppFrame();
    });

});
