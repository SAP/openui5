sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
    'test-resources/sap/ui/mdc/testutils/opa/TestLibrary',
    'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
    'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement'
], function (Opa5, opaTest, TestLibrary, Action, Arrangement) {
	'use strict';

	Opa5.extendConfig({
		assertions: {
            checkResetEnablement: function(bEnabled) {
                return this.waitFor({
                    controlType: "sap.m.Dialog",
                    success: function (aDialog) {
                        var oResetBtn = aDialog[0].getParent().getResetButton();
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
        Then.checkResetEnablement(false);
        When.iPressDialogOk();

		When.onTheMDCTable.iPersonalizeColumns(sTableID, ["Name", "Founding Year", "Changed By", "Created On", "Country"]);

        //some changes done --> reset is enabled
        When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
        Then.checkResetEnablement(true);
        When.iPressDialogOk();

        When.onTheMDCTable.iResetThePersonalization(sTableID);

        //reset executed --> reset disabled again
        When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
        Then.checkResetEnablement(false);
        When.iPressDialogOk();
	});

    opaTest("FilterBar: Open the dialog, check the reset button enablement before and after some changes and after reset", function (Given, When, Then) {

        //no changes --> reset is disabled
        When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
        Then.checkResetEnablement(false);
        When.iPressDialogOk();

		When.onTheMDCFilterBar.iPersonalizeFilter(sFilterBarID, {Artists: ["Name"] });

        //some changes done --> reset is enabled
        When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
        Then.checkResetEnablement(true);
        When.iPressDialogOk();

        When.onTheMDCFilterBar.iResetThePersonalization(sFilterBarID);

        //reset executed --> reset disabled again
        When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
        Then.checkResetEnablement(false);
        When.iPressDialogOk();

        Given.enableAndDeleteLrepLocalStorage();
		Then.iTeardownMyAppFrame();
	});

});
