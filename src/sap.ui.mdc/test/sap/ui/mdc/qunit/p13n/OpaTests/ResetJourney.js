sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Util",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/AppUnderTestMDCTable"
], function (Opa5, opaTest, TestLibrary, Action, Arrangement, TableUtil, TableTestLibrary) {
	'use strict';

	Opa5.extendConfig({
		assertions: {
            checkResetEnablementInDialog: function(bEnabled) {
                return this.waitFor({
                    controlType: "sap.m.Dialog",
                    success: function (aDialog) {
                        var oResetBtn = aDialog[0].getParent().getResetButton();
                        const sEnableStatus = bEnabled ? "enabled" : "disabled";
                        Opa5.assert.ok(oResetBtn.getEnabled() === bEnabled, `The reset button should be ${sEnableStatus}`);
                    }
                });
            },
            checkResetEnablementInColumnMenu: function(bEnabled) {
                return this.waitFor({
                    searchOpenDialogs: true,
                    controlType: "sap.m.table.columnmenu.Menu",
                    success: function (oColumnMenu) {
                        var oResetBtn = oColumnMenu[0].getDependents()[2].getHeader().getContentRight()[0];
                        const sEnableStatus = bEnabled ? "enabled" : "disabled";
                        Opa5.assert.ok(oResetBtn.getEnabled() === bEnabled, `The reset button should be ${sEnableStatus}`);
                    }
                });
            }
        },
        arrangements: new Arrangement(),
        actions: new Action(),
		viewNamespace: "view.",
		autoWait: true
	});

    const sTableID = "IDTableOfInternalSampleApp_01";
    const sFilterBarID = "IDFilterBar";

	opaTest("Table: Open the dialog, check the reset button enablement before and after some changes and after reset", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});

        //no changes --> reset is disabled
        When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
        Then.checkResetEnablementInDialog(false);
        When.iPressDialogOk();

		When.onTheMDCTable.iPersonalizeColumns(sTableID, ["Name", "Founding Year", "Changed By", "Created On", "Country"]);

        //some changes done --> reset is enabled
        When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
        Then.checkResetEnablementInDialog(true);
        When.iPressDialogOk();

        When.onTheMDCTable.iResetThePersonalization(sTableID);

        //reset executed --> reset disabled again
        When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
        Then.checkResetEnablementInDialog(false);
        When.iPressDialogOk();
	});

    opaTest("Table (ColumnMenu): Open the menu, check the reset button enablement before and after some changes and after reset", function(Given, When, Then){

        //no changes yet --> reset disabled
        When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableID, "Founding Year");
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheColumnMenu();
        When.onTheAppUnderTestMDCTable.iPressOnColumnMenuItem(TableUtil.P13nDialogInfo.Titles.columns);
        Then.checkResetEnablementInColumnMenu(false);

        //do some changes --> reset enabled
		When.onTheAppUnderTestMDCTable.iSelectColumns(["Name", "Founding Year", "Changed By", "Created On", "Country"], false);
        Then.checkResetEnablementInColumnMenu(true);
        When.onTheAppUnderTestMDCTable.iConfirmColumnMenuItemContent();

        //reset the changes --> reset disabled again
        When.onTheMDCTable.iResetThePersonalization(sTableID);
        When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableID, "Founding Year");
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheColumnMenu();
        When.onTheAppUnderTestMDCTable.iPressOnColumnMenuItem(TableUtil.P13nDialogInfo.Titles.columns);
        Then.checkResetEnablementInColumnMenu(false);
    });

    opaTest("FilterBar: Open the dialog, check the reset button enablement before and after some changes and after reset", function (Given, When, Then) {

        //no changes --> reset is disabled
        When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
        Then.checkResetEnablementInDialog(false);
        When.iPressDialogOk();

		When.onTheMDCFilterBar.iPersonalizeFilter(sFilterBarID, {Artists: ["Name"] });

        //some changes done --> reset is enabled
        When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
        Then.checkResetEnablementInDialog(true);
        When.iPressDialogOk();

        When.onTheMDCFilterBar.iResetThePersonalization(sFilterBarID);

        //reset executed --> reset disabled again
        When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
        Then.checkResetEnablementInDialog(false);
        When.iPressDialogOk();

        Given.enableAndDeleteLrepLocalStorage();
		Then.iTeardownMyAppFrame();
	});

});
