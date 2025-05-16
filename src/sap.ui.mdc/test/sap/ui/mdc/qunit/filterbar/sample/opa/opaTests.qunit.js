/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/events/KeyCodes",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (
	Opa5,
	opaTest,
	KeyCodes
) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		async: false,
		timeout: 15,
		arrangements: new Opa5({
			iStartMyApp: function () {
				return this.iStartMyUIComponent({
                    componentConfig: {
                        name: "sap.ui.mdc.qunit.filterbar.sample",
                        async: true,
                        settings: { id: "filterbarTest" }
                    },
                    hash: "",
                    autoWait: true
                });
			}
		}),
        testLibs: {
            mdcTestLibrary: {
                viewName: "sap.ui.mdc.qunit.filterbar.sample.FilterBarTest"
            }
        },
		actions: new Opa5({
		}),
		assertions: new Opa5({
		})
	});


	QUnit.module("Basic Functionality");

	const sFBId = "filterbarTest---IDView--idFilterBarCtrl";

	opaTest("1. expected initial filter bar with two filters displayed", function(Given, When, Then) {
		Given.iStartMyApp();

		const aLabelNames = ["Boolean", "String single"];
		Then.onTheMDCFilterBar.iShouldSeeFilters(sFBId, aLabelNames);

		Then.onTheMDCFilterBar.iShouldSeeTheAdaptFiltersButton();
	});

	opaTest("1.1. shows error popover correctly for invalid values without live mode", function(Given, When, Then) {

		When.onTheMDCFilterField.iEnterTextOnTheFilterField({label: "String single"}, "thisisaninvalidfilter", {
			pressEnterKey: true
		});

		Then.onTheMDCFilterBar.iShouldSeeTheErrorPopover();
		When.onTheMDCFilterBar.iCloseTheErrorPopover();
	});

	opaTest("1.2. shows error popover correctly for invalid values with live mode", function(Given, When, Then) {

		When.onTheMDCFilterBar.iSetLiveMode(true);
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({label: "String single"}, "thisisaninvalidfilter", {
			pressEnterKey: true
		});

		Then.onTheMDCFilterBar.iShouldSeeTheErrorPopover();
		When.onTheMDCFilterBar.iCloseTheErrorPopover();
		When.onTheMDCFilterBar.iSetLiveMode(false);
	});

	opaTest("2. assign filter values via Adapt Filters dialog", function(Given, When, Then) {

		When.onTheMDCFilterBar.iNavigateOnTheFilter(sFBId, {
			Basic: {
				label: "Boolean",
				keyCode: KeyCodes.ARROW_DOWN
			}
		});

		When.onTheMDCFilterBar.iEnterFilterValue(sFBId, {
			Basic: {
				label: "String single",
				values: "abc"
			}
		});

		Then.onTheMDCFilterBar.iShouldSeeFilters(sFBId, {
			"Boolean": [{
				operator: "EQ",
				values: [ true ]
			}],
			"String single": [{
				operator: "EQ",
				values: [ "abc" ]
			}]
		});
	});

	opaTest("3. assign value 'rtx' to filter 'String single'", function(Given, When, Then) {

		When.onTheMDCFilterField.iEnterTextOnTheFilterField({label: "String single"}, "rtx");

		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues({label: "String single"}, "=rtx");
	});

	opaTest("4. expected filter bar with two filters (Boolean, 'String single') displayed", function(Given, When, Then) {

		Then.onTheMDCFilterBar.iShouldSeeFilters(sFBId, {
			"Boolean": [{
				operator: "EQ",
				values: [ true ]
			}],
			"String single": [{
				operator: "EQ",
				values: [ "rtx" ]
			}]
		});
	});

	opaTest("last: FilterBar is visible terminate test", function(Given, When, Then) {

		Then.onTheMDCFilterBar.iShouldSeeTheFilterBar();

		// Shutdown
		Given.iTeardownMyApp();
	});

});
