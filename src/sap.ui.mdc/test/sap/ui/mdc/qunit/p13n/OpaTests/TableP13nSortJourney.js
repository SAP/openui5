sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'sap/ui/Device'
], function (Opa5, opaTest, Arrangement, TestUtil, Action, Assertion, Device) {
	'use strict';

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view.",
		autoWait: true
	});

	var aSortItems = [
		{p13nItem: "artistUUID", descending: false},
		{p13nItem: "Breakout Year", descending: false},
		{p13nItem: "Changed By", descending: false},
		{p13nItem: "Changed On", descending: false},
		{p13nItem: "City of Origin", descending: false},
		{p13nItem: "Country", descending: false},
		{p13nItem: "Created By", descending: false},
		{p13nItem: "Created On", descending: false},
		{p13nItem: "Founding Year", descending: false},
		{p13nItem: "Name", descending: false},
		{p13nItem: "regionOfOrigin_code", descending: false}
	];

	opaTest("Open TableOpaApp", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		When.iLookAtTheScreen();

		Then.theVariantManagementIsDirty(false);
	});

    opaTest("Check empty sort tab", function(Given, When, Then){
        //Open settings Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		//open 'sort' tab
		When.iSwitchToP13nTab("Sort");

		//check that dialog is open
		Then.thePersonalizationDialogOpens();

		//open the select control in the sort tab
		When.iClickOnP13nSelect("");

		//check that the expected keys are visible in the sort dialog
		Then.iShouldSeeP13nMenuItems(aSortItems);

        //close Dialog
		When.iPressDialogOk();
    });

    opaTest("Add a sorter for 'Founding Year'", function(Given, When, Then){
        //Open settings Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

        //open 'sort' tab
		When.iSwitchToP13nTab("Sort");

        //check that dialog is open
		Then.thePersonalizationDialogOpens();

		//open select (empty) select control in sort panel and select 'Founding Year'
		When.iClickOnP13nSelect("");
		When.iSelectP13nMenuItem("Founding Year");

        //close Dialog
		When.iPressDialogOk();

        //Check sorter on Table column
        Then.iShouldSeeColumnSorted("Founding Year", true);

    });

	opaTest("Add a second sorter for 'Name'", function(Given, When, Then){
        //Open settings Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

        //open 'sort' tab
		When.iSwitchToP13nTab("Sort");

        //check that dialog is open
		Then.thePersonalizationDialogOpens();

		//open select (empty) select control in sort panel and select 'Founding Year'
		When.iClickOnP13nSelect("");
		When.iSelectP13nMenuItem("Name");

        //close Dialog
		When.iPressDialogOk();

        //Check sorter on Table column
		Then.iShouldSeeColumnSorted("Founding Year", true);
        Then.iShouldSeeColumnSorted("Name", true);

    });

    opaTest("Remove the sorter for 'Founding Year' and 'Name'", function(Given, When, Then){
        //Open settings Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

        //open 'sort' tab
		When.iSwitchToP13nTab("Sort");

        //check that dialog is open
		Then.thePersonalizationDialogOpens();

        When.iRemoveSorting();

        //close Dialog
		When.iPressDialogOk();

        //Check sorter has been removed on Table column
		Then.iShouldSeeColumnSorted("Founding Year", false);
        Then.iShouldSeeColumnSorted("Name", false);

		//shut down app frame for next test
		Given.enableAndDeleteLrepLocalStorage();
		Then.iTeardownMyAppFrame();
    });

});
