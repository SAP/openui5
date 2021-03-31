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
						name: "sap.ui.mdc.sample.FilterFieldTypes",
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

	opaTest("Filter Field - Check condition and change value", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		// var sId = "__xmlview0--FF1";
		var sLabel = "myFF1";

		var aConditions = [{
			"operator": "EQ",
			"values": ["4711"],
			"isEmpty": false,
			"validated": undefined
		}];

		var aFormattedValues = ["=4711"];

		//TODO the testLib only supports to find filterfield via the label property.
		// either we have a new assertion
		//   Then.onThePage.iShouldSeeTheFilterFieldByIdWithValues(sLabel, {
		// or
		//   Then.onThePage.iShouldSeeTheFilterFieldWithValues({ id: "myId"}, {

		Then.onThePage.iShouldSeeTheFilterFieldWithValues(sLabel, {
			conditions: aConditions,
			formattedValues: aFormattedValues
		});

		When.onThePage.iEnterTextOnTheFilterField(sLabel, ">1001");

		Then.onThePage.iShouldSeeTheFilterFieldWithValues(sLabel, {
			conditions: [{
				"operator": "EQ",
				"values": ["4711"],
				"isEmpty": false,
				"validated": undefined
			},{
				"operator": "GT",
				"values": ["1001"],
				"isEmpty": null, // TODO why does this have isEmpty==null and not undefined?
				"validated": "NotValidated" //TODO why is this not undefined?
			}],
			formattedValues: ["=4711", ">1001"]
		});

		When.onThePage.iPressOnTheFilterFieldValueHelpButton(sLabel);

		// TODO make other tests on the VH dialog...

		setTimeout(function(){
			Then.iTeardownMyUIComponent();
		}, 10000);

	});

});
