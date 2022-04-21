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
	var aGroupItems = [
		{p13nItem: "artistUUID"},
		{p13nItem: "Breakout Year"},
		{p13nItem: "Changed By"},
		{p13nItem: "Changed On"},
		{p13nItem: "City of Origin"},
		{p13nItem: "Country"},
		{p13nItem: "Created By"},
		{p13nItem: "Created On"},
		{p13nItem: "Founding Year"},
		{p13nItem: "Name"},
		{p13nItem: "regionOfOrigin_code"}
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

    opaTest("Check empty group tab", function(Given, When, Then){
        //Open settings Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		//open 'group' tab
		When.iSwitchToP13nTab("Group");

		//check that dialog is open
		Then.thePersonalizationDialogOpens();

		//open the select control in the group tab
		When.iClickOnP13nSelect("");

		//check that the expected keys are visible in the group dialog
		Then.iShouldSeeP13nMenuItems(aGroupItems);

        //close Dialog
		When.iPressDialogOk();

    });

    opaTest("Add a grouping for 'Founding Year'", function(Given, When, Then){
        //Open settings Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

        //open 'group' tab
		When.iSwitchToP13nTab("Group");

        //check that dialog is open
		Then.thePersonalizationDialogOpens();

		//open select (empty) select control in group panel and select 'Founding Year'
		When.iClickOnP13nSelect("");
		When.iSelectP13nMenuItem("Founding Year");

        //close Dialog
		When.iPressDialogOk();

        //Check grouping on Table column
		var oGroupConditions = {
			groupLevels: [
				{name: "foundingYear"}
			]
		};
        Then.iShouldSeeGroupConditions(oGroupConditions);
    });

	opaTest("Remove the grouping for 'Founding Year'", function(Given, When, Then){
        //Open settings Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

        //open 'group' tab
		When.iSwitchToP13nTab("Group");

        //check that dialog is open
		Then.thePersonalizationDialogOpens();

        When.iRemoveSorting();

        //close Dialog
		When.iPressDialogOk();

        //Check grouping on Table column
		var oGroupConditions = {
			groupLevels: []
		};
        Then.iShouldSeeGroupConditions(oGroupConditions);

		//shut down app frame for next test
		Given.enableAndDeleteLrepLocalStorage();
		Then.iTeardownMyAppFrame();
    });

});
