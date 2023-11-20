sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library",
	"sap/ui/core/date/UI5Date"
],
function(Controller, JSONModel, unifiedLibrary, UI5Date) {
	"use strict";
	var CalendarDayType = unifiedLibrary.CalendarDayType;
	return Controller.extend("sap.m.sample.SinglePlanningCalendarWeekNumbering.Page", {
		onInit: function() {
			var oModel = new JSONModel();
			oModel.setData({
					startDate: UI5Date.getInstance("2018", "6", "9"),
					appointments: [{
						title: "Meet John Miller",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "8", "5", "0"),
						endDate: UI5Date.getInstance("2018", "6", "8", "6", "0")
					}, {
						title: "Discussion of the plan",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "8", "6", "0"),
						endDate: UI5Date.getInstance("2018", "6", "8", "7", "9")
					}, {
						title: "Lunch",
						text: "canteen",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "8", "7", "0"),
						endDate: UI5Date.getInstance("2018", "6", "8", "8", "0")
					}, {
						title: "New Product",
						text: "room 105",
						type: CalendarDayType.Type01,
						icon: "sap-icon://meeting-room",
						startDate: UI5Date.getInstance("2018", "6", "8", "8", "0"),
						endDate: UI5Date.getInstance("2018", "6", "8", "9", "0")
					}, {
						title: "Team meeting",
						text: "Regular",
						type: CalendarDayType.Type01,
						icon: "sap-icon://home",
						startDate: UI5Date.getInstance("2018", "6", "8", "9", "9"),
						endDate: UI5Date.getInstance("2018", "6", "8", "10", "0")
					}, {
						title: "Discussion with clients",
						text: "Online meeting",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						startDate: UI5Date.getInstance("2018", "6", "8", "10", "0"),
						endDate: UI5Date.getInstance("2018", "6", "8", "11", "0")
					}, {
						title: "Discussion of the plan",
						text: "Online meeting",
						type: CalendarDayType.Type01,
						icon: "sap-icon://home",
						tentative: true,
						startDate: UI5Date.getInstance("2018", "6", "8", "11", "0"),
						endDate: UI5Date.getInstance("2018", "6", "8", "12", "0")
					}, {
						title: "Discussion with clients",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						startDate: UI5Date.getInstance("2018", "6", "8", "12", "0"),
						endDate: UI5Date.getInstance("2018", "6", "8", "13", "9")
					}, {
						title: "Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: UI5Date.getInstance("2018", "6", "8", "13", "9"),
						endDate: UI5Date.getInstance("2018", "6", "8", "13", "9")
					}, {
						title: "Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: UI5Date.getInstance("2018", "6", "9", "6", "30"),
						endDate: UI5Date.getInstance("2018", "6", "9", "7", "0")
					}, {
						title: "Lunch",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "9", "7", "0"),
						endDate: UI5Date.getInstance("2018", "6", "9", "8", "0")
					}, {
						title: "Team meeting",
						text: "online",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "9", "8", "0"),
						endDate: UI5Date.getInstance("2018", "6", "9", "9", "0")
					}, {
						title: "Discussion with clients",
						type: CalendarDayType.Type08,
						startDate: UI5Date.getInstance("2018", "6", "9", "9", "0"),
						endDate: UI5Date.getInstance("2018", "6", "9", "10", "0")
					}, {
						title: "Team meeting",
						text: "room 5",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "9", "11", "0"),
						endDate: UI5Date.getInstance("2018", "6", "9", "14", "0")
					}, {
						title: "Daily standup meeting",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "9", "9", "0"),
						endDate: UI5Date.getInstance("2018", "6", "9", "9", "15", "0")
					}, {
						title: "Private meeting",
						type: CalendarDayType.Type03,
						startDate: UI5Date.getInstance("2018", "6", "11", "9", "9"),
						endDate: UI5Date.getInstance("2018", "6", "11", "9", "20")
					}, {
						title: "Private meeting",
						type: CalendarDayType.Type03,
						startDate: UI5Date.getInstance("2018", "6", "10", "6", "0"),
						endDate: UI5Date.getInstance("2018", "6", "10", "7", "0")
					}, {
						title: "Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: UI5Date.getInstance("2018", "6", "10", "15", "0"),
						endDate: UI5Date.getInstance("2018", "6", "10", "15", "30")
					}, {
						title: "Meet John Doe",
						type: CalendarDayType.Type05,
						icon: "sap-icon://home",
						startDate: UI5Date.getInstance("2018", "6", "11", "7", "0"),
						endDate: UI5Date.getInstance("2018", "6", "11", "7", "30")
					}, {
						title: "Team meeting",
						text: "online",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "11", "8", "0"),
						endDate: UI5Date.getInstance("2018", "6", "11", "9", "30")
					}, {
						title: "Workshop",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "11", "8", "30"),
						endDate: UI5Date.getInstance("2018", "6", "11", "12", "0")
					}, {
						title: "Team collaboration",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "12", "4", "0"),
						endDate: UI5Date.getInstance("2018", "6", "12", "12", "30")
					}, {
						title: "Out of the office",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "12", "15", "0"),
						endDate: UI5Date.getInstance("2018", "6", "12", "19", "30")
					}, {
						title: "Working out of the building",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "12", "20", "0"),
						endDate: UI5Date.getInstance("2018", "6", "12", "21", "30")
					}, {
						title: "Vacation",
						type: CalendarDayType.Type09,
						text: "out of office",
						startDate: UI5Date.getInstance("2018", "6", "11", "12", "0"),
						endDate: UI5Date.getInstance("2018", "6", "13", "14", "0")
					}, {
						title: "Reminder",
						type: CalendarDayType.Type09,
						startDate: UI5Date.getInstance("2018", "6", "12", "00", "00"),
						endDate: UI5Date.getInstance("2018", "6", "13", "00", "00")
					}, {
						title: "Team collaboration",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "6", "00", "00"),
						endDate:  UI5Date.getInstance("2018", "6", "16", "00", "00")
					}, {
						title: "Workshop out of the country",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "14", "00", "00"),
						endDate: UI5Date.getInstance("2018", "6", "20", "00", "00")
					}, {
						title: "Payment reminder",
						type: CalendarDayType.Type09,
						startDate: UI5Date.getInstance("2018", "6", "7", "00", "00"),
						endDate: UI5Date.getInstance("2018", "6", "8", "00", "00")
					}, {
						title:"Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: UI5Date.getInstance("2018", "6", "6", "9", "0"),
						endDate: UI5Date.getInstance("2018", "6", "6", "10", "0")
					}, {
						title:"Daily standup meeting",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "7", "10", "0"),
						endDate: UI5Date.getInstance("2018", "6", "7", "10", "30")
					}, {
						title:"Private meeting",
						type: CalendarDayType.Type03,
						startDate: UI5Date.getInstance("2018", "6", "6", "11", "30"),
						endDate: UI5Date.getInstance("2018", "6", "6", "12", "0")
					}, {
						title:"Lunch",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "6", "12", "0"),
						endDate: UI5Date.getInstance("2018", "6", "6", "13", "0")
					}, {
						title:"Discussion of the plan",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "16", "11", "0"),
						endDate: UI5Date.getInstance("2018", "6", "16", "12", "0")
					}, {
						title:"Lunch",
						text: "canteen",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "16", "12", "0"),
						endDate: UI5Date.getInstance("2018", "6", "16", "13", "0")
					}, {
						title:"Team meeting",
						text: "room 200",
						type: CalendarDayType.Type01,
						icon: "sap-icon://meeting-room",
						startDate:  UI5Date.getInstance("2018", "6", "16", "16", "0"),
						endDate: UI5Date.getInstance("2018", "6", "16", "17", "0")
					}, {
						title:"Discussion with clients",
						text: "Online meeting",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						startDate: UI5Date.getInstance("2018", "6", "17", "15", "30"),
						endDate: UI5Date.getInstance("2018", "6", "17", "16", "30")
					}
				]
			});
			this.getView().setModel(oModel);
			oModel = new JSONModel();
			oModel.setData({allDay: false});
			this.getView().setModel(oModel, "allDay");
		},
		onChange: function (oEvent) {
			this.byId('SPC1').setCalendarWeekNumbering(oEvent.getParameter("selectedItem").getKey());
		}
	});
});
