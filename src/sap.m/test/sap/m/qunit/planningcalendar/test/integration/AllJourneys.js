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
		iPressOnRightArrowOnHoursView: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					oPC[0].$("TimeInt--Head-next").trigger("click");
				},
				errorMessage: "I should press Next button on Header Interval on Hours View."
			});
		},
		iPressOnRightArrowOnDaysView: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					oPC[0].$("DateInt--Head-next").trigger("click");
				},
				errorMessage: "I should press Next button on Header Interval on Days View."
			});
		},
		iPressOnRightArrowOnMonthsView: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					oPC[0].$("MonthInt--Head-next").trigger("click");
				},
				errorMessage: "I should press Next button on Header Interval on Months View."
			});
		},
		iPressOnRightArrowOnWeekView: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					oPC[0].$("WeekInt--Head-next").trigger("click");
				},
				errorMessage: "I should press Next button on Header Interval on Week View."
			});
		},
		iPressOnRightArrowOn1MonthView: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					oPC[0].$("OneMonthInt--Head-next").trigger("click");
				},
				errorMessage: "I should press Next button on Header Interval on 1Month View."
			});
		}

	});
	var assertions = new sap.ui.test.Opa5({
		iShouldCheckThatNextButtonOnHoursViewIsPressed: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					sap.ui.test.Opa5.assert.strictEqual(oPC[0].$('TimeInt--TimesRow-201512152000').text(), "8PM", "Cell is changed to 8PM");
				},
				errorMessage: "I should see the change on Hours View."
			});
		},
		iShouldCheckThatNextButtonOnDaysViewIsPressed: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					sap.ui.test.Opa5.assert.strictEqual(oPC[0].$('DateInt--Month0-20151229').text(), "29Tue", "Cell is changed to 29Tue");
				},
				errorMessage: "I should see the change on Days View."
			});
		},
		iShouldCheckThatNextButtonOnMonthsViewIsPressed: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					sap.ui.test.Opa5.assert.strictEqual(oPC[0].$('MonthInt--Head-B2').text(), "2016 – 2017", "Cell is changed to 2016 – 2017");
					sap.ui.test.Opa5.assert.strictEqual(oPC[0].$('MonthInt--MonthsRow-20161201').text(), "December", "Month in the cell is December");
				},
				errorMessage: "I should see the change on Months View."
			});
		},
		iShouldCheckThatNextButtonOnWeekViewIsPressed: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					sap.ui.test.Opa5.assert.strictEqual(oPC[0].$('WeekInt--Month0-20161204').text(), "4Sun", "Cell is changed to 4Sun");
				},
				errorMessage: "I should see the change on Week View."
			});
		},
		iShouldCheckThatNextButtonOn1MonthViewIsPressed: function () {
			return this.waitFor({
				controlType: "sap.m.PlanningCalendar",
				success: function (oPC) {
					sap.ui.test.Opa5.assert.strictEqual(oPC[0].$('OneMonthInt--Month0-20170101').text(), "1Sun", "Cell is changed to 1Sun");
					sap.ui.test.Opa5.assert.strictEqual(oPC[0].$('OneMonthInt--Head-B1').text(), "January 2017", "Cell is changed to 2017");
				},
				errorMessage: "I should see the change on 1Month View."
			});
		}
	});

	sap.ui.test.Opa5.extendConfig({
		arrangements: arrangements,
		actions: actions,
		assertions: assertions,
		autoWait: true
	});

	sap.ui.require([
		"sap/ui/demo/PlanningCalendar/test/integration/PlanningCalendarJourney"
	]);
});
