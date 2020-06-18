/*global QUnit, opaTest*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/App"
], function(opaQunit) {
	"use strict";

	QUnit.module("");

	opaTest("it should display some fields", function(Given, When, Then) {

		// arrangement
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "test.sap.ui.mdc.field.Field",
				async: true
			},
			autoWait: true
		});

		// assert
		Then.onTheAppPage.iShouldSeeTheArtistFieldWithValue("Wolf Honolulu Blue").
		and
		.iShouldSeeTheCountryFieldWithValues("DE", "DE (Germany)");

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest("it should open the value help dialog control and display some controls", function(Given, When, Then) {

		// arrangement
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "test.sap.ui.mdc.field.Field",
				async: true
			},
			autoWait: true
		});

		// act
		When.onTheAppPage.iPressTheCountryValueHelpButton();

		// assert
		Then.onTheAppPage.iShouldSeeTheCountryValueHelpDialog();

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest("it should close the value help dialog control when the cancel button is activated", function(Given, When, Then) {

		// arrangement
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "test.sap.ui.mdc.field.Field",
				async: true
			},
			autoWait: true
		});

		// act
		When.onTheAppPage.iPressTheCountryValueHelpButton().
		and
		.iPressTheCountryValueHelpDialogCancelButton();

		// assert
		Then.onTheAppPage.iShouldNotSeeTheValueHelpDialog();

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest("it should select the first country listed in the value help dialog", function(Given, When, Then) {

		// arrangement
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "test.sap.ui.mdc.field.Field",
				async: true
			},
			autoWait: true
		});

		// act
		When.onTheAppPage.iPressTheCountryValueHelpButton().and.iSelectTheFirstCountryInTheValueHelpDialog();
		When.onTheAppPage.iPressTheCountryValueHelpDialogOKButton();

		// assert
		Then.onTheAppPage.iShouldSeeTheCountryFieldWithValues("AD", "AD (Andorra)");
		Then.onTheAppPage.iShouldNotSeeTheValueHelpDialog();

		// cleanup
		Then.iTeardownMyUIComponent();
	});
});
