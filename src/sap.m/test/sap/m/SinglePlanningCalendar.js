sap.ui.define([
	"sap/m/App",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageItem",
	"sap/m/MessageToast",
	"sap/m/MessageView",
	"sap/m/Page",
	"sap/m/PlanningCalendarLegend",
	"sap/m/Popover",
	"sap/m/Select",
	"sap/m/SinglePlanningCalendar",
	"sap/m/SinglePlanningCalendarDayView",
	"sap/m/SinglePlanningCalendarMonthView",
	"sap/m/SinglePlanningCalendarWeekView",
	"sap/m/SinglePlanningCalendarWorkWeekView",
	"sap/m/SinglePlanningCalendarView",
	"sap/m/Text",
	"sap/m/ToggleButton",
	"sap/ui/core/Element",
	"sap/ui/core/Item",
	"sap/ui/core/library",
	"sap/ui/core/message/MessageType",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library",
	"sap/ui/core/date/UI5Date"
], function(
	App,
	Bar,
	Button,
	Dialog,
	Label,
	mobileLibrary,
	MessageItem,
	MessageToast,
	MessageView,
	Page,
	PlanningCalendarLegend,
	Popover,
	Select,
	SinglePlanningCalendar,
	SinglePlanningCalendarDayView,
	SinglePlanningCalendarMonthView,
	SinglePlanningCalendarWeekView,
	SinglePlanningCalendarWorkWeekView,
	SinglePlanningCalendarView,
	MText,
	ToggleButton,
	Element,
	Item,
	coreLibrary,
	MessageType,
	JSONModel,
	CalendarAppointment,
	CalendarLegendItem,
	DateTypeRange,
	unifiedLibrary,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	var oSPC,
		oDialog,
		oLegend;

	var aAppointments = [
		{
			title: "1 hour app. 0 without type and color",
			startDate: UI5Date.getInstance(2018, 6, 8, 8, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 9, 0, 0)
		},
		{
			title: "1 hour app. 1",
			type: "Type01",
			startDate: UI5Date.getInstance(2018, 6, 8, 9, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 10, 0, 0)
		},
		{
			title: "1 hour app. 2 with additional info",
			text: "Additional info 2",
			type: "Type02",
			startDate: UI5Date.getInstance(2018, 6, 8, 10, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 11, 0, 0)
		},
		{
			title: "1 hour app. 3 with icon and additional info",
			text: "Additional info 3",
			type: "Type03",
			icon: "../ui/unified/images/m_01.png",
			startDate: UI5Date.getInstance(2018, 6, 8, 11, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 12, 0, 0)
		},
		{
			title: "1 hour app. 4 with icon and additional info",
			text: "Additional info 4",
			type: "Type04",
			icon: "sap-icon://home",
			startDate: UI5Date.getInstance(2018, 6, 8, 12, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 13, 0, 0)
		},
		{
			title: "1 hour app. 5 with icon and additional info",
			text: "Additional info 5",
			type: "Type05",
			icon: "sap-icon://home",
			startDate: UI5Date.getInstance(2018, 6, 8, 13, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 14, 0, 0)
		},
		{
			title: "1 hour 30 min. app. 5a with icon and additional info",
			text: "Additional info 5a",
			type: "Type05",
			icon: "sap-icon://home",
			startDate: UI5Date.getInstance(2018, 6, 8, 13, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 14, 30, 0)
		},
		{
			title: "1 hour app. 6 with icon and additional info",
			text: "Additional info 6",
			type: "Type06",
			icon: "sap-icon://home",
			tentative: true,
			startDate: UI5Date.getInstance(2018, 6, 8, 14, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 15, 0, 0)
		},
		{
			title: "1 hour appointment 7 with icon",
			type: "Type07",
			icon: "sap-icon://home",
			startDate: UI5Date.getInstance(2018, 6, 8, 15, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 16, 0, 0)
		},
		{
			title: "1 hour appointment 8",
			type: "Type08",
			startDate: UI5Date.getInstance(2018, 6, 8, 16, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 17, 0, 0)
		},
		{
			title: "1 h. app 8a",
			text: "Additional info 8a",
			type: "Type08",
			startDate: UI5Date.getInstance(2018, 6, 8, 16, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 17, 0, 0)
		},
		{
			title: "1 hour appointment 9",
			type: "Type09",
			startDate: UI5Date.getInstance(2018, 6, 8, 17, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 18, 0, 0)
		},
		{
			title: "1 hour appointment 10",
			type: "Type10",
			startDate: UI5Date.getInstance(2018, 6, 8, 18, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 19, 0, 0)
		},
		{
			title: "1 hour appointment 11",
			type: "Type11",
			startDate: UI5Date.getInstance(2018, 6, 8, 19, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 20, 0, 0)
		},
		{
			title: "1 hour appointment 12",
			type: "Type12",
			startDate: UI5Date.getInstance(2018, 6, 8, 20, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 21, 0, 0)
		},
		{
			title: "1 hour appointment 13",
			type: "Type13",
			startDate: UI5Date.getInstance(2018, 6, 9, 8, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 9, 0, 0)
		},
		{
			title: "1.20 hour appointment 13a",
			text: "Some additional info",
			type: "Type13",
			startDate: UI5Date.getInstance(2018, 6, 9, 8, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 9, 20, 0)
		},
		{
			title: "1 hour appointment 14",
			type: "Type14",
			startDate: UI5Date.getInstance(2018, 6, 9, 9, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 10, 0, 0)
		},
		{
			title: "1 hour appointment 15",
			type: "Type15",
			startDate: UI5Date.getInstance(2018, 6, 9, 10, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 11, 0, 0)
		},
		{
			title: "1 hour appointment 16",
			type: "Type16",
			startDate: UI5Date.getInstance(2018, 6, 9, 11, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 12, 0, 0)
		},
		{
			title: "1 hour appointment 17",
			type: "Type17",
			startDate: UI5Date.getInstance(2018, 6, 9, 12, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 13, 0, 0)
		},
		{
			title: "1 hour appointment 18",
			type: "Type18",
			startDate: UI5Date.getInstance(2018, 6, 9, 13, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 14, 0, 0)
		},
		{
			title: "1 hour appointment 19",
			type: "Type19",
			startDate: UI5Date.getInstance(2018, 6, 9, 14, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 15, 0, 0)
		},
		{
			title: "1 hour appointment 20",
			type: "Type20",
			startDate: UI5Date.getInstance(2018, 6, 9, 15, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 16, 0, 0)
		},
		{
			title: "5 min. appointment 21",
			type: "Type20",
			startDate: UI5Date.getInstance(2018, 6, 9, 17, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 17, 5, 0)
		},
		{
			title: "10 min. appointment 22",
			type: "Type20",
			startDate: UI5Date.getInstance(2018, 6, 9, 18, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 18, 10, 0)
		},
		{
			title: "15 min. appointment 23",
			type: "Type20",
			startDate: UI5Date.getInstance(2018, 6, 9, 19, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 19, 15, 0)
		},
		{
			title: "20 min. appointment 24",
			type: "Type20",
			startDate: UI5Date.getInstance(2018, 6, 9, 20, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 20, 20, 0)
		},
		{
			title: "1 hour appointment 25a with custom color",
			text: "Some addional info for app. 25a",
			color: "#87CEEB",
			startDate: UI5Date.getInstance(2018, 6, 10, 8, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 10, 9, 0, 0)
		},
		{
			title: "25 min. appointment 25 with custom color",
			color: "#87CEEB",
			startDate: UI5Date.getInstance(2018, 6, 10, 9, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 10, 10, 0, 0)
		},
		{
			title: "25 min. appointment 26",
			type: "Type20",
			startDate: UI5Date.getInstance(2018, 6, 10, 17, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 10, 17, 25, 0)
		},
		{
			title: "30 min. appointment 27",
			type: "Type20",
			startDate: UI5Date.getInstance(2018, 6, 10, 18, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 10, 18, 30, 0)
		},
		{
			title: "35 min. appointment 28",
			type: "Type20",
			startDate: UI5Date.getInstance(2018, 6, 10, 19, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 10, 19, 35, 0)
		},
		{
			title: "30 min. appointment 29 with icon",
			type: "Type01",
			icon: "sap-icon://home",
			startDate: UI5Date.getInstance(2018, 6, 11, 10, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 11, 10, 30, 0)
		},
		{
			title: "30 min. second half hour appointment 30 with icon",
			type: "Type04",
			icon: "sap-icon://work-history",
			startDate: UI5Date.getInstance(2018, 6, 11, 10, 30, 0),
			endDate: UI5Date.getInstance(2018, 6, 11, 11, 0, 0)
		},
		{
			title: "1 hour and 30 min. appointment  31",
			type: "Type02",
			startDate: UI5Date.getInstance(2018, 6, 11, 11, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 11, 12, 30, 0)
		},
		{
			title: "Long appointment 32",
			type: "Type03",
			startDate: UI5Date.getInstance(2018, 6, 11, 11, 30, 0),
			endDate: UI5Date.getInstance(2018, 6, 11, 15, 0, 0)
		},
		{
			title: "Long appointment 33",
			type: "Type04",
			startDate: UI5Date.getInstance(2018, 6, 12, 7, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 12, 15, 30, 0)
		},
		{
			title: "Long appointment 34",
			type: "Type05",
			startDate: UI5Date.getInstance(2018, 6, 12, 18, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 12, 22, 30, 0)
		},
		{
			title: "Appointment in two days 35",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 12, 23, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 13, 0, 30, 0)
		},
		{
			title: "Appointment in 3 days 36",
			type: "Type07",
			icon: "sap-icon://work-history",
			text: "Additional info 2",
			startDate: UI5Date.getInstance(2018, 6, 11, 15, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 13, 17, 0, 0)
		},

		{
			title: "Appointment 1 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 5, 0)
		},
		{
			title: "Appointment 2 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 5, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 10, 0)
		},
		{
			title: "Appointment 3 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 10, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 15, 0)
		},
		{
			title: "Appointment 4 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 15, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 20, 0)
		},
		{
			title: "Appointment 5 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 20, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 25, 0)
		},
		{
			title: "Appointment 6 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 25, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 30, 0)
		},
		{
			title: "Appointment 7 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 30, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 35, 0)
		},
		{
			title: "Appointment 8 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 35, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 40, 0)
		},
		{
			title: "Appointment 9 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 40, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 45, 0)
		},
		{
			title: "Appointment 10 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 45, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 50, 0)
		},
		{
			title: "Appointment 11 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 50, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 8, 55, 0)
		},
		{
			title: "Appointment 12 5min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 23, 8, 55, 0),
			endDate: UI5Date.getInstance(2018, 6, 23, 9, 0, 0)
		},
		{
			title: "Appointment 1 30min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 24, 8, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 24, 8, 30, 0)
		},
		{
			title: "Appointment 2 30min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 24, 8, 30, 0),
			endDate: UI5Date.getInstance(2018, 6, 24, 9, 0, 0)
		},
		{
			title: "Appointment 1 1hour",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 25, 8, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 25, 9, 0, 0)
		},
		{
			title: "Appointment 1 20min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 26, 8, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 26, 8, 20, 0)
		},
		{
			title: "Appointment 2 20min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 26, 8, 20, 0),
			endDate: UI5Date.getInstance(2018, 6, 26, 8, 40, 0)
		},
		{
			title: "Appointment 3 20min",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 26, 8, 40, 0),
			endDate: UI5Date.getInstance(2018, 6, 26, 9, 0, 0)
		},

		/* Full day appointments/blockers */
		{
			title: "4 full days - from 23th until 26th",
			startDate: UI5Date.getInstance(2018, 6, 23),
			endDate: UI5Date.getInstance(2018, 6, 26)
		},
		{
			title: "3 full days - from 11th until 13th",
			startDate: UI5Date.getInstance(2018, 6, 11),
			endDate: UI5Date.getInstance(2018, 6, 13)
		},
		{
			title: "5 full days - from 7th until 11th",
			icon: "sap-icon://work-history",
			startDate: UI5Date.getInstance(2018, 6, 7),
			endDate: UI5Date.getInstance(2018, 6, 11)
		},
		{
			title: "11 full days - from 6th to 16th",
			color: "#f230b1",
			startDate: UI5Date.getInstance(2018, 6, 6),
			endDate: UI5Date.getInstance(2018, 6, 16)
		},
		{
			title: "7 full days - from 14th until 10th",
			startDate: UI5Date.getInstance(2018, 6, 14),
			endDate: UI5Date.getInstance(2018, 6, 20)
		},
		{
			title: "3 full days - from 15th until 17th",
			startDate: UI5Date.getInstance(2018, 6, 15),
			endDate: UI5Date.getInstance(2018, 6, 17)
		},
		{
			title: "2 full days - from 7th until 8th",
			startDate: UI5Date.getInstance(2018, 6, 7),
			endDate: UI5Date.getInstance(2018, 6, 8)
		},
		{
			title: "1 full day - from 9th until 9th",
			icon: "sap-icon://home",
			startDate: UI5Date.getInstance(2018, 6, 9),
			endDate: UI5Date.getInstance(2018, 6, 9)
		},
		{
			title: "1 full day - from 9th until 9th - second appointment",
			startDate: UI5Date.getInstance(2018, 6, 9),
			endDate: UI5Date.getInstance(2018, 6, 9)
		},
		{
			title: "5h appointment",
			type: CalendarDayType.Type05,
			startDate: UI5Date.getInstance(2018, 7, 8, 5, 0),
			endDate: UI5Date.getInstance(2018, 7, 8, 10, 0)
		},
		{
			title: "2 day appointment",
			type: CalendarDayType.Type05,
			startDate: UI5Date.getInstance("2018", "7", "8", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "9", "10", "0")
		},
		{
			title: "5h appointment",
			type: CalendarDayType.Type05,
			startDate: UI5Date.getInstance("2018", "7", "8", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "8", "10", "0")
		},
		{
			title: "7 day appointment",
			type: CalendarDayType.Type05,
			startDate: UI5Date.getInstance("2018", "7", "8", "5", "1"),
			endDate: UI5Date.getInstance("2018", "7", "14", "1", "0")
		},
		{
			title: "6 day appointment",
			type: CalendarDayType.Type05,
			startDate: UI5Date.getInstance("2018", "7", "8", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "13", "1", "0")
		},
		{
			title: "5 day appointment",
			type: CalendarDayType.Type05,
			startDate: UI5Date.getInstance("2018", "7", "8", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "12", "1", "0")
		},
		{
			title: "4 day appointment",
			type: CalendarDayType.Type05,
			startDate: UI5Date.getInstance("2018", "7", "8", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "11", "6", "0")
		},
		{
			title: "1h appointment",
			type: CalendarDayType.Type05,
			startDate: UI5Date.getInstance("2018", "7", "8", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "8", "6", "0")
		},
		{
			title: "Workshop out of the country",
			type: CalendarDayType.Type05,
			startDate: UI5Date.getInstance("2018", "7", "11", "00", "00"),
			endDate: UI5Date.getInstance("2018", "7", "20", "00", "00")
		},
		{
			title: "2 day appointment 31st to 1st",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "6", "31", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "1", "6", "0")
		},
		{
			title: "2 day appointment 31st to 1st",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "6", "31", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "1", "6", "0")
		},
		{
			title: "2 day appointment 31st to 1st",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "6", "31", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "1", "6", "0")
		},
		{
			title: "2 day appointment 31st to 1st",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "6", "31", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "1", "6", "0")
		},
		{
			title: "2 day appointment 31st to 1st",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "6", "31", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "1", "6", "0")
		},
		{
			title: "1h appointment",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "7", "2", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "2", "6", "0")
		},
		{
			title: "1h appointment",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "7", "2", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "2", "6", "0")
		},
		{
			title: "1h appointment",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "7", "2", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "2", "6", "0")
		},
		{
			title: "1h appointment",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "7", "2", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "2", "6", "0")
		},
		{
			title: "4 day appointment",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "7", "2", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "5", "6", "0")
		},
		{
			title: "1h appointment",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "7", "3", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "3", "6", "0")
		},
		{
			title: "1h appointment",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "7", "3", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "3", "6", "0")
		},
		{
			title: "1h appointment",
			type: CalendarDayType.Type04,
			startDate: UI5Date.getInstance("2018", "7", "3", "5", "0"),
			endDate: UI5Date.getInstance("2018", "7", "3", "6", "0")
		}


	];
	var oModel = new JSONModel();
	oModel.setData({modelData: aAppointments});

	var oStateModel = new JSONModel();
	oStateModel.setData({legendShown: false});

	var oDayView = new SinglePlanningCalendarDayView({
			key: "DayView",
			title: "Day"
		}),
		oWorkWeekView = new SinglePlanningCalendarWorkWeekView({
			key: "WorkWeekView",
			title: "Work Week"
		}),
		oWeekView = new SinglePlanningCalendarWeekView({
			key: "WeekView",
			// "Full Week" used instead of "Week" as per guidelines for visual tests reasons
			title: "Full Week"
		}),
		oMonthView = new SinglePlanningCalendarMonthView({
			key: "Month",
			title: "Month"
		});

	var CustomView = SinglePlanningCalendarView.extend("sap.custom.CustomView", {
		getEntityCount: function () {
			return 10;
		},

		getScrollEntityCount: function () {
			return 10;
		},

		calculateStartDate: function (oStartDate) {
			return oStartDate;
		}
	});

	var oCustomView = new CustomView({
		title: "10 days",
		key: "10Days"
	});

	oLegend = new PlanningCalendarLegend({
		items: [
			new CalendarLegendItem("T1", {
				type: CalendarDayType.Type02,
				text: "Working in office 1"
			}),
			new CalendarLegendItem("T2", {
				type: CalendarDayType.Type05,
				text: "Working in office 2"
			}),
			new CalendarLegendItem("T3", {
				type: CalendarDayType.Type08,
				text: "Working in office 3"
			})
		],
		appointmentItems: [
			new CalendarLegendItem({
				type: CalendarDayType.Type01,
				text: "Type Private Appointment"
			}),
			new CalendarLegendItem({
				type: CalendarDayType.Type02,
				text: "Type Face2Face Appointment"
			}),
			new CalendarLegendItem({
				type: CalendarDayType.Type03,
				text: "Type Public Appointment"
			}),
			new CalendarLegendItem({
				type: CalendarDayType.Type04,
				text: "Client Meeting"
			}),
			new CalendarLegendItem({
				type: CalendarDayType.Type05,
				text: "Team Meeting"
			}),
			new CalendarLegendItem({
				type: CalendarDayType.Type06,
				text: "Planning"
			}),
			new CalendarLegendItem({
				type: CalendarDayType.Type07,
				text: "Out Of Office"
			})
		]
	});

	oDialog = new Dialog("D1", {
		title: "Legend",
		content: [oLegend],
		endButton: new Button({
			text: "Close",
			press: function () {
				oDialog.close();
			}
		})
	});

	var createMessage = function(sTitle, sSubtitle) {
			return new MessageItem({
				type: MessageType.None,
				title: sTitle,
				subtitle: sSubtitle
			});
		},
		oMessageView = new MessageView({}),
		oPopover = new Popover({
			customHeader: new Bar({
				contentLeft: [],
				contentMiddle: [
					new MText({
						text: "Messages"
					})
				]
			}),
			placement: PlacementType.Auto,
			verticalScrolling: false,
			contentWidth: "440px",
			contentHeight: "440px",
			content: [oMessageView],
			footer: new Bar({
				contentRight: [new Button({
					text: "Close",
					press: function () {
						oPopover.close();
					}
				})]
			})
		});

	oSPC = new SinglePlanningCalendar("SinglePlanningCalendar", {
		title: "SinglePlanningCalendar",
		dateSelectionMode: "MultiSelect",
		startDate: UI5Date.getInstance(2018, 6, 9),
		startHour: 8,
		endHour: 20,
		fullDay: false,
		views: [oDayView, oWorkWeekView,oWeekView, oCustomView, oMonthView],
		actions: [
			new Button("resetScaleFactor",{
				icon: "sap-icon://reset",
				press: function() {
					var oSPC = Element.getElementById("SinglePlanningCalendar");
					oSPC.setScaleFactor(1);

				}
			}),
			new Button("zoomIn",{
				icon: "sap-icon://zoom-in",
				press: function() {
				var oSPC = Element.getElementById("SinglePlanningCalendar");
				var iCurrentScaleFactor = oSPC.getScaleFactor();
				oSPC.setScaleFactor(++iCurrentScaleFactor);
				}
			}),
			new Button("zoomOut",{
				icon: "sap-icon://zoom-out",
				press: function() {
					var oSPC = Element.getElementById("SinglePlanningCalendar");
					var iCurrentScaleFactor = oSPC.getScaleFactor();
					oSPC.setScaleFactor(--iCurrentScaleFactor);
				}
			}),
			new ToggleButton("fullDay", {
				text: "Full day",
				press: function () {
					var oSPC = Element.getElementById("SinglePlanningCalendar");
					oSPC.setFullDay(!oSPC.getFullDay());
				}
			}),
			new Button("overrideTime", {
				text: "Override current time",
				press: function () {
					var oGrid = Element.getElementById("SinglePlanningCalendar").getAggregation("_grid");

					oGrid._updateRowHeaderAndNowMarker = function () {
						var oCurrentDate = UI5Date.getInstance(2018, 6, 8, 0, 30, 0, 0);

						this._updateNowMarker(oCurrentDate);
						this._updateRowHeaders(oCurrentDate);
					};
					oGrid._updateRowHeaderAndNowMarker();
				}
			}),
			new Button({
				icon: "sap-icon://legend",
				tooltip: "Open PlanningCalendar legend",
				press: function () {
					oDialog.open();
				}
			}),
			new Label({
				text: "Form factor: ",
				labelFor: "formFactorSelect"
			}),
			new Select("formFactorSelect", {
				items: [
					new Item({text: "Cozy"}),
					new Item({text: "Compact"})
				],
				change: function (oEvent) {
					var bCompactMode = oEvent.getParameter("selectedItem").getText() === "Compact";

					oPage.toggleStyleClass("sapUiSizeCompact", bCompactMode);
					oPage.invalidate();
				}
			})
		],
		appointments: {
			path: '/modelData',
			template: new CalendarAppointment({
				title: "{title}",
				text: "{text}",
				type: "{type}",
				icon: "{icon}",
				color: "{color}",
				startDate: "{startDate}",
				endDate: "{endDate}"
			})
		},
		specialDates: [
			new DateTypeRange({
				startDate: UI5Date.getInstance(2018, 6, 8),
				endDate: UI5Date.getInstance(2018, 6, 9),
				type: CalendarDayType.Type02,
				tooltip: "Special date Type02"
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2018, 6, 10),
				endDate: UI5Date.getInstance(2018, 6, 10),
				type: CalendarDayType.Type05
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2018, 6, 12),
				endDate: UI5Date.getInstance(2018, 6, 13),
				type: CalendarDayType.Type08
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2018, 6, 15),
				endDate: UI5Date.getInstance(2018, 6, 15),
				type: CalendarDayType.Type08,
				color:"#86D8F0"
			})
		],

		appointmentSelect: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				aAppointments = oEvent.getParameter("appointments");

			if (!oAppointment && aAppointments && aAppointments.length) {
				oMessageView.destroyItems();
				oMessageView.navigateBack();

				aAppointments.forEach(function(oApp) {
					if (oApp.getSelected()) {
						oMessageView.addItem(createMessage("Selected: " + oApp.getTitle(), oApp.getText()));
					} else {
						oMessageView.addItem(createMessage("Deselected: " + oApp.getTitle(), oApp.getText()));
					}
				});

				oPopover.openBy(aAppointments[aAppointments.length - 1]);
			}
		},
		enableAppointmentsDragAndDrop: true,
		enableAppointmentsResize: true,
		legend: oLegend,
		enableAppointmentsCreate: true,
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
		},
		appointmentResize: function(oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				sAppointmentTitle = oAppointment.getTitle();

			oAppointment.setStartDate(oStartDate);
			oAppointment.setEndDate(oEndDate);

			MessageToast.show("Appointment with title \n'"
				+ sAppointmentTitle
				+ "'\n has been resized"
			);
		},
		appointmentCreate: function(oEvent) {
			var oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				sAppointmentTitle = "New Appointment";

			var oAppointment = new CalendarAppointment({
				title: sAppointmentTitle,
				startDate: oStartDate,
				endDate: oEndDate
			});

			oSPC.addAppointment(oAppointment);

			MessageToast.show("Appointment with title \n'"
					+ sAppointmentTitle
					+ "'\n has been created"
			);
		},
		headerDateSelect: function (oEvent) {
			var oDate = oEvent.getParameter("date");

			MessageToast.show("Header date selected: '" + oDate + "'.");
		},
		startDateChange: function (oEvent) {
			var oDate = oEvent.getParameter("date");

			MessageToast.show("Start date changed to '" + oDate + "'.");
		},
		cellPress: function (oEvent) {
			var oAppStartDate = oEvent.getParameter("startDate"),
				oAppEndDate = oEvent.getParameter("endDate");

			MessageToast.show("startDate: '" + oAppStartDate + "'. endDate: '" + oAppEndDate + "'.");
		},
		moreLinkPress: function(oEvent) {
			var oDate = oEvent.getParameter("date");
			MessageToast.show("Date of more link '" + oDate + "'.");
		}
	});

	var oPage = new Page({
		title: "SinglePlanningCalendar test page",
		titleLevel: TitleLevel.H1,
		content: oSPC,
		footer: new Bar()
	});
	new App({
		pages: oPage,
		models: {
			"undefined": oModel,
			"stateModel": oStateModel
		}
	}).placeAt("body");
});
