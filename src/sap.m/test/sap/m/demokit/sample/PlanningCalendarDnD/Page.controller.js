sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	],
	function (Controller, JSONModel, MessageToast) {
		"use strict";

		return Controller.extend("sap.m.sample.PlanningCalendarDnD.Page", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					startDate: new Date("2017", "10", "13", "8", "0"),
					people: [
						{
							pic: "test-resources/sap/ui/demokit/explored/img/John_Miller.png",
							name: "John Miller",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "10", "13", "08", "00"),
									end: new Date("2017", "10", "13", "09", "00"),
									title: "Team sync",
									info: "Canteen",
									type: "Type07",
									pic: "sap-icon://family-care"
								},
								{
									start: new Date("2017", "10", "13", "09", "0"),
									end: new Date("2017", "10", "13", "11", "0"),
									title: "Morning Sync",
									info: "I call you",
									type: "Type01",
									pic: "sap-icon://call"
								},
								{
									start: new Date("2017", "10", "13", "10", "00"),
									end: new Date("2017", "10", "13", "12", "00"),
									title: "Sync Bill",
									info: "Online",
									type: "Type03"
								},
								{
									start: new Date("2017", "10", "13", "10", "00"),
									end: new Date("2017", "10", "13", "13", "00"),
									title: "Check Flights",
									info: "no room",
									type: "Type09",
									pic: "sap-icon://flight"
								},
								{
									start: new Date("2017", "10", "13", "13", "00"),
									end: new Date("2017", "10", "13", "14", "00"),
									title: "Lunch",
									info: "canteen",
									type: "Type05",
									pic: "sap-icon://private"
								},
								{
									start: new Date("2017", "10", "13", "18", "00"),
									end: new Date("2017", "10", "13", "20", "00"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04"
								},
								{
									start: new Date("2017", "10", "14", "03", "00"),
									end: new Date("2017", "10", "14", "23", "00"),
									title: "Deadline",
									type: "Type05"
								},
								{
									start: new Date("2017", "10", "14", "09", "00"),
									end: new Date("2017", "10", "14", "14", "00"),
									title: "Blocker",
									info: "room 6",
									type: "Type08"
								},
								{
									start: new Date("2017", "10", "17", "09", "00"),
									end: new Date("2017", "10", "17", "18", "00"),
									title: "Boss Birthday",
									type: "Type02"
								},
								{
									start: new Date("2017", "10", "24", "09", "00"),
									end: new Date("2017", "10", "24", "18", "00"),
									title: "Urgent Planning",
									type: "Type08"
								},
								{
									start: new Date("2017", "10", "20", "01", "00"),
									end: new Date("2017", "10", "20", "23", "00"),
									title: "Planning",
									type: "Type09"
								}
							]
						},
						{
							pic: "test-resources/sap/ui/demokit/explored/img/Donna_Moore.jpg",
							name: "Donna Moore",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "10", "13", "08", "00"),
									end: new Date("2017", "10", "13", "09", "26"),
									title: "Team sync",
									info: "Canteen",
									type: "Type07",
									pic: "sap-icon://family-care"
								},
								{
									start: new Date("2017", "10", "13", "10", "00"),
									end: new Date("2017", "10", "13", "12", "00"),
									title: "Sync John",
									info: "Online",
									type: "Type03"
								},
								{
									start: new Date("2017", "10", "13", "11", "00"),
									end: new Date("2017", "10", "13", "12", "00"),
									title: "Prep for planning",
									info: "room 5",
									type: "Type01",
									pic: "sap-icon://family-care"
								},
								{
									start: new Date("2017", "10", "13", "18", "00"),
									end: new Date("2017", "10", "13", "20", "00"),
									title: "Check Flights",
									info: "no room",
									type: "Type09",
									pic: "sap-icon://flight"
								},
								{
									start: new Date("2017", "10", "13", "18", "00"),
									end: new Date("2017", "10", "13", "20", "00"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04"
								},
								{
									start: new Date("2017", "10", "20", "01", "00"),
									end: new Date("2017", "10", "20", "23", "00"),
									title: "Planning",
									type: "Type09"
								},
								{
									start: new Date("2018", "2", "20", "01", "00"),
									end: new Date("2018", "2", "20", "23", "00"),
									title: "Off",
									type: "Type08"
								}
							]
						}
					]
				});
				this.getView().setModel(oModel);

			},

			handleAppointmentDrop: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					startDate = oEvent.getParameter("startDate"),
					endDate = oEvent.getParameter("endDate");

				MessageToast.show("Appointment '" + oAppointment.getTitle() + "' now starts at " + startDate + ".");

				oAppointment
					.setStartDate(startDate)
					.setEndDate(endDate);
			}

		});

	});