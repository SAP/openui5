/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/mdc/test/sample/test/pages/TestReport"
], function(
	Opa5,
	opaTest
) {
	"use strict";

	Opa5.extendConfig({

		// TODO: increase the timeout timer from 15 (default) to 45 seconds
		// to see whether it influences the success rate of the first test on
		// the build infrastructure.
		// As currently, the underlying service takes some time for the
		// creation and initialization of tenants.
		// You might want to remove this timeout timer after the underlying
		// service has been optimized or if the timeout timer increase does
		// not have any effect on the success rate of the tests.
		timeout: 45,


		appParams: {
			"sap-ui-xx-complexP13n": true
		},

		arrangements: {
			iStartMyUIComponentInViewMode: function() {

				// In some cases when a test fails in a success function,
				// the UI component is not properly teardown.
				// As a side effect, all the following tests in the stack
				// fails when the UI component is started, as only one UI
				// component can be started at a time.
				// Teardown the UI component to ensure it is not started
				// twice without a teardown, which results in less false
				// positives and more reliable reporting.
				if (this.hasUIComponentStarted()) {
					this.iTeardownMyUIComponent();
				}

				return this.iStartMyUIComponent({
					componentConfig: {
						name: "sap.ui.mdc.sample.FieldEditMode",
						async: true
					},
					hash: "",
					autowait: true
				});
			}
		}
	});

	// var oModuleSettings = {
	// 	beforeEach: function() {},
	// 	afterEach: function() {

	// 		// in case the flex/variant changes are stored in the local browser storage
	// 		localStorage.clear();
	// 	}
	// };

	// QUnit.module("ListReport - Books Page Table", oModuleSettings);

	opaTest("Field - EditMode - Check if editable Field can be changed", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var sId = "__xmlview0--F1";
		Then.onThePage.iShouldSeeTheFieldWithValues(sId, "Pride and Prejudice");

		When.onThePage.iEnterTextOnTheField(sId, "foo");
		Then.onThePage.iShouldSeeTheFieldWithValues(sId, "foo");
		Then.onThePage.iShouldSeeTheFieldWithValues("__xmlview0--F2", "foo");
		Then.onThePage.iShouldSeeTheFieldWithValues("__xmlview0--F3", "foo");
		Then.onThePage.iShouldSeeTheFieldWithValues("__xmlview0--F4", "foo");

		// TODO test if the editmode of the Fields is as expected
		// Then.onThePage.iShouldSeeTheFieldWithEditMode(sId, "Editable");
		// Then.onThePage.iShouldSeeTheFieldWithEditMode("__xmlview0--F2", "Display");
		// Then.onThePage.iShouldSeeTheFieldWithEditMode("__xmlview0--F3", "ReadOnly");
		// Then.onThePage.iShouldSeeTheFieldWithEditMode("__xmlview0--F4", "Disabled");

		// TODO try to modify a readonly field
		When.onThePage.iEnterTextOnTheField("__xmlview0--F3", "bar");
		Then.onThePage.iShouldSeeTheFieldWithValues("__xmlview0--F3", "foo");

		// TODO testing currency Field
		sId = "__xmlview0--F2_1";
		Then.onThePage.iShouldSeeTheFieldWithValues(sId, ["18.57", "USD"]);

		// TODO entering complex values on the field does not work. We need special functions or actions to manipulate the inner controls.
		// When.onThePage.iEnterTextOnTheField(sId, ["10", "EUR"]);
		// Then.onThePage.iShouldSeeTheFieldWithValues(sId, ["10", "EUR"]);

		// setTimeout(function(){
			Then.iTeardownMyUIComponent();
		// }, 10000);

	});

});
