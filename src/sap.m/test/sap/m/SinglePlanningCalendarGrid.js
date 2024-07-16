// Note: the HTML page 'SinglePlanningCalendarGrid.html' loads this module via data-sap-ui-on-init

var oSPCGrid;
sap.ui.define([
	'sap/ui/model/json/JSONModel',
	'sap/m/SinglePlanningCalendarGrid',
	'sap/ui/unified/CalendarAppointment',
	'sap/m/App',
	'sap/m/Page',
	'sap/ui/core/date/UI5Date',
	"sap/m/MessageToast"
],
function(JSONModel, SinglePlanningCalendarGrid, CalendarAppointment, App, Page, UI5Date, MessageToast) {
	"use strict";
	var aAppointments = [
		{
			title: "App 0",
			type: "Type02",
			startDate: UI5Date.getInstance(2018, 5, 20, 14, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 20, 18, 30, 0)
		},
		{
			title: "App 1",
			type: "Type02",
			startDate: UI5Date.getInstance(2018, 5, 20, 11, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 20, 12, 0, 0)
		},


		{
			type: "Type01",
			title: "App 2",
			startDate: UI5Date.getInstance(2018, 5, 18, 11, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 16, 0, 0)
		},
		{
			type: "Type02",
			title: "App 31",
			startDate: UI5Date.getInstance(2018, 5, 18, 12, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 17, 0, 0)
		},
		{
			type: "Type02",
			title: "App 3",
			startDate: UI5Date.getInstance(2018, 5, 18, 12, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 16, 0, 0)
		},
		{
			type: "Type03",
			title: "App 4",
			startDate: UI5Date.getInstance(2018, 5, 18, 13, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 17, 0, 0)
		},
		{
			type: "Type04",
			title: "App 5",
			startDate: UI5Date.getInstance(2018, 5, 18, 16, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 17, 0, 0)
		},
		{
			type: "Type05",
			title: "App 6",
			startDate: UI5Date.getInstance(2018, 5, 18, 11, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 12, 0, 0)
		},
		{
			type: "Type06",
			title: "App 7",
			startDate: UI5Date.getInstance(2018, 5, 18, 11, 30, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 12, 30, 0)
		},
		{
			type: "Type07",
			title: "App 8",
			startDate: UI5Date.getInstance(2018, 5, 18, 12, 30, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 14, 30, 0)
		},
		{
			type: "Type08",
			title: "App 9",
			startDate: UI5Date.getInstance(2018, 5, 18, 12, 30, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 13, 0, 0)
		},
		{
			type: "Type09",
			title: "App 10",
			startDate: UI5Date.getInstance(2018, 5, 18, 16, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 17, 0, 0)
		},
		{
			type: "Type09",
			title: "App 11",
			startDate: UI5Date.getInstance(2018, 5, 18, 17, 30, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 18, 0, 0)
		},
		{
			type: "Type09",
			title: "App 12",
			startDate: UI5Date.getInstance(2018, 5, 18, 15, 30, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 16, 30, 0)
		},

		{
			title: "Full 1 (22-23)",
			startDate: UI5Date.getInstance(2018, 5, 22, 0, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 23, 0, 0, 0)
		},
		{
			title: "Full 2 (17-21)",
			startDate: UI5Date.getInstance(2018, 5, 17, 0, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 21, 0, 0, 0)
		},
		{
			title: "Full 3 (16-26)",
			startDate: UI5Date.getInstance(2018, 5, 16, 0, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 26, 0, 0, 0)
		},
		{
			title: "Full 4 (24-30)",
			startDate: UI5Date.getInstance(2018, 5, 24, 0, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 30, 0, 0, 0)
		},
		{
			title: "Full 5 (25-27)",
			startDate: UI5Date.getInstance(2018, 5, 25, 0, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 27, 0, 0, 0)
		},
		{
			title: "Full 6 (17-18)",
			startDate: UI5Date.getInstance(2018, 5, 17, 0, 0, 0),
			endDate: UI5Date.getInstance(2018, 5, 18, 0, 0, 0)
		}
	];
	var oModel = new JSONModel();
	oModel.setData({modelData: aAppointments});

	oSPCGrid = new SinglePlanningCalendarGrid("SinglePlanningCalendarGrid", {
		startDate: UI5Date.getInstance(2018, 5, 18),
		startHour: 8,
		endHour: 20,
		appointments : {
			path : '/modelData',
			template : new CalendarAppointment({
				title: "{title}",
				text: "{text}",
				type: "{type}",
				icon: "{icon}",
				color: "{color}",
				startDate: "{startDate}",
				endDate: "{endDate}"
			})
		},
		enableAppointmentsDragAndDrop: true,
		appointmentDrop: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				sAppointmentTitle = oAppointment.getTitle();

			oAppointment.setStartDate(oStartDate);
			oAppointment.setEndDate(oEndDate);

			MessageToast.show("Appointment with title \n'"
					+ sAppointmentTitle
					+ "'\n has been dropped"
			);
		}
	});
	new App({
		pages: new Page({
			title: "SinglePlanningCalendarGrid test page",
			content: oSPCGrid
		}),
		models: oModel
	}).placeAt("body");
});