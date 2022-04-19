sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion",
	"sap/ui/core/library"
], function(Opa5, opaTest, Arrangement, TestUtil, Action, Assertion, coreLibrary) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view.",
		autoWait: true
	});

	opaTest("Open app", function(Given, When, Then) {
		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?sap-ui-xx-columnmenu=true",
			autoWait: true
		});
		Given.enableAndDeleteLrepLocalStorage();

		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);
		Then.theVariantManagementIsDirty(false);
	});

	opaTest("Open column menu", function(Given, When, Then) {
		When.iClickOnColumn("Name");
		Then.iShouldSeeOneColumnMenu();
		Then.iShouldSeeNumberOfColumnMenuQuickActions(2);
		Then.iShouldSeeColumnMenuQuickSort({key: "name", label: "Name", sortOrder: coreLibrary.SortOrder.None});
		Then.iShouldSeeColumnMenuQuickGroup({key: "name", label: "Name", grouped: false});
		Then.iShouldSeeNumberOfColumnMenuItems(4);
		Then.iShouldSeeColumnMenuItems([
			Arrangement.P13nDialog.Titles.sort,
			Arrangement.P13nDialog.Titles.filter,
			Arrangement.P13nDialog.Titles.group,
			Arrangement.P13nDialog.Titles.columns
		]);
	});

	opaTest("Sort with column menu quick action", function(Given, When, Then) {
		When.iUseColumnMenuQuickSort({key: "name", sortOrder: coreLibrary.SortOrder.Ascending});
		Then.iShouldSeeColumnSorted("Name", true, false);
	});

	opaTest("Group with column menu quick action", function(Given, When, Then) {
		When.iUseColumnMenuQuickGroup({key: "name", grouped: true});
		Then.iShouldSeeGroupConditions({groupLevels: [{name: "name"}]});
	});

	opaTest("Sort with column menu item", function(Given, When, Then) {
		When.iPressOnColumnMenuItem(Arrangement.P13nDialog.Titles.sort);
		Then.iShouldSeeColumnMenuItemContent(Arrangement.P13nDialog.Titles.sort);
		Then.iShouldSeeP13nSortItems([
			{p13nItem: "Name", sorted: true, descending: false}
		]);
		When.iRemoveSorting();
		When.iConfirmColumnMenuItemContent();
		Then.iShouldNotSeeTheColumnMenu();
		Then.iShouldSeeColumnSorted("Name", false, false);
		When.iClickOnColumn("Name");
		Then.iShouldSeeOneColumnMenu();
		Then.iShouldSeeColumnMenuQuickSort({key: "name", label: "Name", sortOrder: coreLibrary.SortOrder.None});
		Then.iShouldSeeColumnMenuQuickGroup({key: "name", label: "Name", grouped: true});
	});

	opaTest("Close column menu", function(Given, When, Then) {
		When.iCloseTheColumnMenu();
		Then.iShouldNotSeeTheColumnMenu();

		// Teardown
		Given.enableAndDeleteLrepLocalStorage();
		Then.iTeardownMyAppFrame();
	});
});
