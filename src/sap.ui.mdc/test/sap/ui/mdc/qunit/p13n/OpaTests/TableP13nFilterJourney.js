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

	var aFilterItems = [
		{p13nItem: "artistUUID", value: null},
		{p13nItem: "Breakout Year", value: null},
		{p13nItem: "Changed By", value: null},
		{p13nItem: "Changed On", value: null},
		{p13nItem: "City of Origin", value: null},
		{p13nItem: "Country", value: null},
		{p13nItem: "Created By", value: null},
		{p13nItem: "Created On", value: null},
		{p13nItem: "Founding Year", value: null},
		{p13nItem: "Name", value: null},
		{p13nItem: "regionOfOrigin_code", value: null}
	];

	opaTest("Open TableOpaApp", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		Given.enableAndDeleteLrepLocalStorage();
		When.iLookAtTheScreen();

		//check icons
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		Then.theVariantManagementIsDirty(false);
	});

	opaTest("Open the filter personalization dialog", function (Given, When, Then) {
		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Filter");

		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeP13nFilterItems(aFilterItems);
	});

	opaTest("Open the filter personalization dialog using column header", function (Given, When, Then) {
		//close Dialog
		When.iPressDialogOk();

		When.iClickOnColumn("Founding Year");

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Icon);

		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.filter);

		Then.iShouldSeeP13nFilterItems(aFilterItems);
	});

	opaTest("Open the filter personalization dialog and enter a value", function (Given, When, Then) {
		//close Dialog
		When.iPressDialogOk();

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Filter");

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.settings);

		When.iEnterTextInFilterDialog("Founding Year", "1989");
		When.iEnterTextInFilterDialog("Country", "DE");

		aFilterItems[5].value = ["DE"];
		aFilterItems[8].value = ["1989"];

		Then.iShouldSeeP13nFilterItems(aFilterItems);
	});

	opaTest("Cancel and open the filter dialog to check if the values have been discarded", function (Given, When, Then) {
		//close Dialog
		When.iPressDialogCancel();

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Filter");

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.settings);

		Then.iShouldSeeP13nFilterItem({
			itemText: "Country",
			index: 5,
			values: [undefined]
		});
		Then.iShouldSeeP13nFilterItem({
			itemText: "Founding Year",
			index: 8,
			values: [undefined]
		});

	});

	opaTest("Confirm and open the filter dialog to check if the value is still there", function (Given, When, Then) {

		When.iEnterTextInFilterDialog("Founding Year", "1989");
		When.iEnterTextInFilterDialog("Country", "DE");

		//close Dialog
		When.iPressDialogOk();

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Filter");

		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeP13nFilterItem({
			itemText: "Country",
			index: 5,
			values: ["DE"]
		});
		Then.iShouldSeeP13nFilterItem({
			itemText: "Founding Year",
			index: 8,
			values: ["1989"]
		});

		//shut down app frame for next test
		Given.enableAndDeleteLrepLocalStorage();
		Then.iTeardownMyAppFrame();
	});
});
