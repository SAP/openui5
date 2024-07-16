// Note: the HTML page 'SinglePlanningCalendarStickyHeader.html' loads this module via data-sap-ui-on-init

var oSPC;
sap.ui.define([
	"sap/ui/core/Element",
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/ListItem',
	'sap/m/SinglePlanningCalendar',
	'sap/m/SinglePlanningCalendarGridRenderer',
	'sap/m/SinglePlanningCalendarDayView',
	'sap/m/SinglePlanningCalendarWorkWeekView',
	'sap/m/SinglePlanningCalendarWeekView',
	'sap/m/Button',
	'sap/m/MessageToast',
	'sap/m/App',
	'sap/m/Page',
	'sap/m/ToolbarSeparator',
	'sap/m/Label',
	'sap/m/Select',
	'sap/m/OverflowToolbarLayoutData',
	'sap/ui/unified/CalendarAppointment',
	'sap/ui/core/date/UI5Date',
	"sap/ui/core/Core"
], function(
	Element,
	JSONModel,
	ListItem,
	SinglePlanningCalendar,
	SinglePlanningCalendarGridRenderer,
	SinglePlanningCalendarDayView,
	SinglePlanningCalendarWorkWeekView,
	SinglePlanningCalendarWeekView,
	Button,
	MessageToast,
	App,
	Page,
	ToolbarSeparator,
	Label,
	Select,
	OverflowToolbarLayoutData,
	CalendarAppointment,
	UI5Date,
	Core
) {
	"use strict";
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
			key: "scroll-to-top",
			title: "[Scroll to top] 20 min. appointment 24",
			type: "Type20",
			startDate: UI5Date.getInstance(2018, 6, 9, 20, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 9, 20, 20, 0)
		},
		{
			title: "25 min. appointment 25 with custom color",
			color: "#f230b1",
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
			title: "1 hour and 30 min. appointment  30",
			type: "Type02",
			startDate: UI5Date.getInstance(2018, 6, 11, 11, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 11, 12, 30, 0)
		},
		{
			title: "Long appointment 31",
			type: "Type03",
			startDate: UI5Date.getInstance(2018, 6, 11, 11, 30, 0),
			endDate: UI5Date.getInstance(2018, 6, 11, 15, 0, 0)
		},
		{
			title: "Long appointment 32",
			type: "Type04",
			startDate: UI5Date.getInstance(2018, 6, 12, 7, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 12, 15, 30, 0)
		},
		{
			title: "Long appointment 33",
			type: "Type05",
			startDate: UI5Date.getInstance(2018, 6, 12, 18, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 12, 22, 30, 0)
		},
		{
			title: "Appointment in two days 34",
			type: "Type06",
			startDate: UI5Date.getInstance(2018, 6, 12, 23, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 13, 0, 30, 0)
		},
		{
			title: "Appointment in 3 days 35",
			type: "Type07",
			text: "Additional info 2",
			startDate: UI5Date.getInstance(2018, 6, 11, 15, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 13, 17, 0, 0)
		},

		/* Full day appointments/blockers */
		{
			title: "2 days - from 12th afternoon until 13th afternoon",
			startDate: UI5Date.getInstance(2018, 6, 12, 0, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 13, 0, 0, 0)
		},
		{
			title: "3 days - from72th afternoon until 11th afternoon",
			startDate: UI5Date.getInstance(2018, 6, 7, 0, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 11, 0, 0, 0)
		},
		{
			key: "scroll-to-bottom",
			title: "[Scroll to bottom] 10 days - from 6th afternoon until 16th afternoon with custom color",
			color: "#f230b1",
			startDate: UI5Date.getInstance(2018, 6, 6, 15, 30, 0),
			endDate: UI5Date.getInstance(2018, 6, 16, 16, 30, 0)
		},
		{
			title: "6 full days from 00 to 00h",
			startDate: UI5Date.getInstance(2018, 6, 14, 0, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 20, 0, 0, 0)
		},
		{
			title: "2 full days from 00 to 00h",
			startDate: UI5Date.getInstance(2018, 6, 15, 0, 0, 0),
			endDate: UI5Date.getInstance(2018, 6, 17, 0, 0, 0)
		},
		{
			title: "2 days - from 7th afternoon until 8th afternoon",
			startDate: UI5Date.getInstance(2018, 6, 7, 15, 30, 0),
			endDate: UI5Date.getInstance(2018, 6, 8, 16, 30, 0)
		}
	];
	var oModel = new JSONModel();
	oModel.setData({modelData: aAppointments});

	var oDayView = new SinglePlanningCalendarDayView({
				key: "DayView",
				title: "Day"
			}),
			oWorkWeekView = new SinglePlanningCalendarWorkWeekView({
				key: "WorkWeekView",
				title: "Work Week"
			}),
			// "Full Week" used instead of "Week" as per guidelines for visual tests reasons
			oWeekView = new SinglePlanningCalendarWeekView({
				key: "WeekView",
				title: "Full Week"
			});

	SinglePlanningCalendar.prototype._updateRowHeaderAndNowMarker = function () {};
	SinglePlanningCalendarGridRenderer.renderNowMarker = function () {};
	oSPC = new SinglePlanningCalendar("SinglePlanningCalendar", {
		title: "SinglePlanningCalendar with sticky header",
		startDate: UI5Date.getInstance(2018, 6, 9),
		views: [oDayView, oWorkWeekView, oWeekView],
		actions: [
			new ToolbarSeparator(),
			new Label({
				text: "Sticky mode: ",
				labelFor: "sticky-mode-select",
				layoutData: new OverflowToolbarLayoutData({
					group: 2
				})
			}),
			new Select("sticky-mode-select", {
				selectedKey: "None",
				items: [
					new ListItem({
						text: "None",
						key: "None"
					}),
					new ListItem({
						text: "All",
						key: "All"
					}),
					new ListItem({
						text: "NavBarAndColHeaders",
						key: "NavBarAndColHeaders"
					})
				],
				layoutData: new OverflowToolbarLayoutData({
					group: 2
				}),
				change: function (oEvent) {
					var sMode = oEvent.getParameter("selectedItem").getKey();
					oSPC.setStickyMode(sMode);
				}
			}),
			new ToolbarSeparator(),
			new Select("size-mode-select", {
				items: [
					new ListItem({text: "Cozy"}),
					new ListItem({text: "Compact"})
				],
				change: function (oEvent) {
					var bCompactMode = oEvent.getParameter("selectedItem").getText() === "Compact";

					oSPC.toggleStyleClass("sapUiSizeCompact", bCompactMode);
					oSPC.invalidate();
				}
			})
		],
		appointments: {
			path: '/modelData',
			template: new CalendarAppointment({
				key: "{key}",
				title: "{title}",
				text: "{text}",
				type: "{type}",
				icon: "{icon}",
				color: "{color}",
				startDate: "{startDate}",
				endDate: "{endDate}"
			})
		},
		appointmentSelect: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				sAppointmentKey,
				oPage;

			if (!oAppointment) {
				return;
			}

			sAppointmentKey = oAppointment.getKey();
			oPage = Element.getElementById("test-page");

			if (sAppointmentKey === "scroll-to-bottom") {
				oPage.scrollTo(10000, 0);
			} else if (sAppointmentKey === "scroll-to-top") {
				oPage.scrollTo(0, 0)
			}
		}
	});

	new App({
		pages: new Page("test-page", {
			title: "SinglePlanningCalendarStickyHeader test page",
			content: oSPC
		}),
		models: oModel
	}).placeAt("body");
});