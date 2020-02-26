sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./PlanningCalendarJourney",
	"./SinglePlanningCalendarJourney",
	"./NotFoundJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "teamCalendar.view.",
		autoWait: true
	});

});