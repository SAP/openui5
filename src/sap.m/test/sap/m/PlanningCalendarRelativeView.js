sap.ui.define([
  "sap/m/PlanningCalendar",
  "sap/m/PlanningCalendarView",
  "sap/m/PlanningCalendarRow",
  "sap/ui/unified/CalendarAppointment",
  "sap/ui/unified/DateTypeRange",
  "sap/ui/unified/library",
  "sap/m/ToggleButton"
], function(
  PlanningCalendar,
  PlanningCalendarView,
  PlanningCalendarRow,
  CalendarAppointment,
  DateTypeRange,
  unifiedLibrary,
  ToggleButton
) {
  "use strict";

  // shortcut for sap.ui.unified.CalendarDayType
  const CalendarDayType = unifiedLibrary.CalendarDayType;

  // Note: the HTML page 'PlanningCalendarRelativeView.html' loads this module via data-sap-ui-on-init

  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");
  var getFirstWeekOfYear = function() {
	  return UI5Date.getInstance(2021, 0, 4);
  };

  var PC = new PlanningCalendar("PC2",{
	  viewKey: "test",
	  appointmentsVisualization: "Filled",
	  showIntervalHeaders: false,
	  startDate: getFirstWeekOfYear(),
	  minDate: getFirstWeekOfYear(),
	  builtInViews: [
		  "Day",
		  "Hour"
	  ],
	  views: [
		  new PlanningCalendarView({
			  key: "test",
			  intervalType: "Day",
			  relative: true,
			  description: "Project in Weeks",
			  intervalSize: 7,
			  intervalLabelFormatter: function(iIntervalIndex) {
				  return "Week " + (iIntervalIndex + 1);
			  },
			  intervalsS: 4,
			  intervalsM: 8,
			  intervalsL: 13
		  }),
		  new PlanningCalendarView({
			  key: "not",
			  intervalType: "Day",
			  description: "Shifts",
			  relative: true,
			  intervalSize: 1,
			  intervalLabelFormatter: function(iIntervalIndex) {
				  return "Shift " + (iIntervalIndex + 1);
			  },
			  intervalsS: 4,
			  intervalsM: 8,
			  intervalsL: 11
		  })
	  ],
	  rows: [
		  new PlanningCalendarRow({
			  appointments: [
				  new CalendarAppointment({
					  startDate: UI5Date.getInstance(2021, 0, 4),
					  endDate: UI5Date.getInstance(2021, 1, 1),
					  type: "Type05",
					  text: "first"
				  }),
				  new CalendarAppointment({
					  startDate: UI5Date.getInstance(2021, 1, 1),
					  endDate: UI5Date.getInstance(2021, 2, 1),
					  type: "Type08",
					  text: "second"
				  })
			  ]
		  })
	  ],
	  specialDates: [ new DateTypeRange({
					  startDate: getFirstWeekOfYear(),
					  endDate: getFirstWeekOfYear(),
					  type: CalendarDayType.Type01,
					  tooltip: "Lunch"
				  })
				],
	  toolbarContent: [
		  new ToggleButton({
			  text: "Do the thing",
			  press: function() {
				  //filter and apply a custom class on your custom control
				  PC.getRows()[0].getAppointments().forEach(app => {
					  if (app.getType() === "Type05") {
						  app.getCustomControl().toggleStyleClass("sapUiCalendarAppDimmed", this.getPressed());
					  }
				  })
			  }})
		  ]
  });
  PC.placeAt('body');
});