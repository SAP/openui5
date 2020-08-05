sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	'sap/ui/test/matchers/Properties'
], function (Opa5,
			 opaTest,
			 Press,
			 Properties) {
	"use strict";

	var arrangements = new Opa5({
		iStartMyApp: function () {
			return this.iStartMyAppInAFrame("test-resources/sap/m/qunit/planningcalendar/index.html");
		}
	});

	var actions = new Opa5({
		iLookAtTheScreen: function () {
			return this;
		},
		iChooseViewSelect: function () {
			return this.waitFor({
				controlType: "sap.m.Select",
				actions: new Press(),
				errorMessage: "Could not find View Select."
			});
		},
		iChangeToDaysView: function () {
			return this.waitFor({
				controlType: "sap.ui.core.Item",
				matchers: new Properties({text: "Days"}),
				actions: new Press(),
				errorMessage: "Could not select Days View."
			});
		},
		iChangeToMonthsView: function () {
			return this.waitFor({
				controlType: "sap.ui.core.Item",
				matchers: new Properties({text: "Months"}),
				actions: new Press(),
				errorMessage: "Could not select Months View."
			});

		},
		iChangeToWeekView: function () {
			return this.waitFor({
				controlType: "sap.ui.core.Item",
				matchers: new Properties({text: "1 Week"}),
				actions: new Press(),
				errorMessage: "Could not select Week View."
			});

		},
		iChangeToOneMonthView: function () {
			return this.waitFor({
				controlType: "sap.ui.core.Item",
				matchers: new Properties({text: "1 Month"}),
				actions: new Press(),
				errorMessage: "Could not select 1 Month View."
			});
		},
		iPressOnRightArrow: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new Properties({ icon: "sap-icon://slim-arrow-right" }),
				actions: new Press(),
				errorMessage: "Could not find Next Button."
			});
		}
	});
	var assertions = new sap.ui.test.Opa5({
		iShouldCheckThatNextButtonOnHoursViewIsPressed: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					Opa5.assert.strictEqual(oPC[0].$('TimesRow-201512152000').text(), "8PM", "Cell is changed to 8PM");
				},
				errorMessage: "I should see the change on Hours View."
			});
		},
		iShouldCheckThatNextButtonOnDaysViewIsPressed: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					Opa5.assert.strictEqual(oPC[0].$('DatesRow-20151229').text(), "29Tue", "Cell is changed to 29Tue");
				},
				errorMessage: "I should see the change on Days View."
			});
		},
		iShouldCheckThatNextButtonOnMonthsViewIsPressed: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					Opa5.assert.strictEqual(oPC[0].$('Header-NavToolbar-PickerBtn').text(), "2016 - 2017", "Cell is changed to 2016 – 2017");
					Opa5.assert.strictEqual(oPC[0].$('MonthsRow-20161201').text(), "December", "Month in the cell is December");
				},
				errorMessage: "I should see the change on Months View."
			});
		},
		iShouldCheckThatNextButtonOnWeekViewIsPressed: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					Opa5.assert.strictEqual(oPC[0].$('WeeksRow-20161204').text(), "4Sun", "Cell is changed to 4Sun");
				},
				errorMessage: "I should see the change on Week View."
			});
		},
		iShouldCheckThatNextButtonOn1MonthViewIsPressed: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					Opa5.assert.strictEqual(oPC[0].$('OneMonthsRow-20170101').text(), "1Sun", "Cell is changed to 1Sun");
					Opa5.assert.strictEqual(oPC[0].$('Header-NavToolbar-PickerBtn').text(), "January 2017", "Cell is changed to 2017");
				},
				errorMessage: "I should see the change on 1Month View."
			});
		}
	});

	Opa5.extendConfig({
		arrangements: arrangements,
		actions: actions,
		assertions: assertions,
		autoWait: true
	});

	return new Promise(function(resolve, reject) {
		sap.ui.require(["sap/ui/demo/PlanningCalendar/test/integration/PlanningCalendarJourney"], resolve, reject);
	});
});
