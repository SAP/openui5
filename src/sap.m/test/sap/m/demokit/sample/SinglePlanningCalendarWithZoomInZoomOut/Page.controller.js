sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library"
],
function(Controller, JSONModel, unifiedLibrary) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;

	return Controller.extend("sap.m.sample.SinglePlanningCalendarWithZoomInZoomOut.Page", {

		onInit: function() {

			var oModel = new JSONModel();
			oModel.setData({
					startDate: new Date("2018", "6", "24"),
					types: (function() {
						var aTypes = [];
						for (var key in CalendarDayType) {
							aTypes.push({
								type: CalendarDayType[key]
							});
						}
						return aTypes;
					})(),
					appointments: [{
						title: "Meet John Miller",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "24", "8", "0"),
						endDate: new Date("2018", "6", "24", "8", "5")
					}, {
						title: "Discussion of the plan",
						type: CalendarDayType.Type08,
						startDate: new Date("2018", "6", "24", "8", "5"),
						endDate: new Date("2018", "6", "24", "8", "10")
					}, {
						title: "Lunch",
						text: "canteen",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "24", "8", "10"),
						endDate: new Date("2018", "6", "24", "8", "15")
					}, {
						title: "New Product",
						text: "room 105",
						type: CalendarDayType.Type01,
						icon: "sap-icon://meeting-room",
						startDate: new Date("2018", "6", "24", "8", "15"),
						endDate: new Date("2018", "6", "24", "8", "20")
					}, {
						title: "Team meeting",
						text: "Regular",
						type: CalendarDayType.Type01,
						icon: "sap-icon://home",
						startDate: new Date("2018", "6", "24", "8", "20"),
						endDate: new Date("2018", "6", "24", "8", "25")
					}, {
						title: "Discussion with clients",
						text: "Online meeting",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						startDate: new Date("2018", "6", "24", "8", "25"),
						endDate: new Date("2018", "6", "24", "8", "30")
					}, {
						title: "Discussion of the plan",
						text: "Online meeting",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						tentative: true,
						startDate: new Date("2018", "6", "24", "8", "30"),
						endDate: new Date("2018", "6", "24", "8", "35")
					}, {
						title: "Discussion with clients",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						startDate: new Date("2018", "6", "24", "8", "35"),
						endDate: new Date("2018", "6", "24", "8", "40")
					}, {
						title: "Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "24", "8", "40"),
						endDate: new Date("2018", "6", "24", "8", "45")
					}, {
						title: "Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "24", "8", "45"),
						endDate: new Date("2018", "6", "24", "8", "50")
					}, {
						title: "Lunch",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "24", "8", "50"),
						endDate: new Date("2018", "6", "24", "8", "55")
					}, {
						title: "Team meeting",
						text: "online",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "24", "8", "55"),
						endDate: new Date("2018", "6", "24", "9", "0")
					}, {
						title: "Discussion with clients",
						type: CalendarDayType.Type08,
						startDate: new Date("2018", "6", "25", "8", "0"),
						endDate: new Date("2018", "6", "25", "9", "0")
					}, {
						title: "Team meeting",
						text: "room 5",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "26", "8", "0"),
						endDate: new Date("2018", "6", "26", "8", "30")
					}, {
						title: "Daily standup meeting",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "26", "8", "30"),
						endDate: new Date("2018", "6", "26", "9", "0")
					}, {
						title: "Private meeting",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "27", "8", "0"),
						endDate: new Date("2018", "6", "27", "8", "20")
					},
					{
						title: "Team meeting",
						text: "room 5",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "27", "8", "20"),
						endDate: new Date("2018", "6", "27", "8", "40")
					},
					{
						title: "Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "27", "8", "40"),
						endDate: new Date("2018", "6", "27", "9", "00")
					}
				],
				legendItems: [
					{
						text: "Public holiday",
						type: "Type07"
					},
					{
						text: "Team building",
						type: "Type08"
					},
					{
						text: "Work from office 1",
						type: "Type09"
					},
					{
						text: "Work from office 2",
						type: "Type14"
					},
					{
						text: "Home office",
						type: "Type03",
						color: "#add8e6"
					}
				],
				legendAppointmentItems: [
					{
						text: "Team Meeting",
						type: CalendarDayType.Type01
					},
					{
						text: "Personal",
						type: CalendarDayType.Type05
					},
					{
						text: "Discussions",
						type: CalendarDayType.Type08
					},
					{
						text: "Out of office",
						type: CalendarDayType.Type09
					},
					{
						text: "Private meeting",
						type: CalendarDayType.Type03
					}
				]
			});
			this.getView().setModel(oModel);

			var oStateModel = new JSONModel();
			oStateModel.setData({
				legendShown: false
			});
			this.getView().setModel(oStateModel, "stateModel");
		},

		toggleFullDay: function () {
			var oSPC = this.getView().byId("SPC1");
			oSPC.setFullDay(!oSPC.getFullDay());
		},

		zoomIn: function() {
			var oSPC = this.getView().byId("SPC1");
			var iCurrentScaleFoucs = oSPC.getScaleFactor();
			oSPC.setScaleFactor(++iCurrentScaleFoucs);
		},

		zoomOut: function() {
			var oSPC = this.getView().byId("SPC1");
			var iCurrentScaleFoucs = oSPC.getScaleFactor();
			oSPC.setScaleFactor(--iCurrentScaleFoucs);
		}

	});

});
