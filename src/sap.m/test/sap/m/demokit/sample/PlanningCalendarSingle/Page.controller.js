sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox'
	],
	function (Controller, JSONModel, MessageBox) {
		"use strict";

		var PageController = Controller.extend("sap.m.sample.PlanningCalendarSingle.Page", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					startDate: new Date("2017", "0", "08", "8", "0"),
					people: [{
						name: "John Miller",
						appointments: [{
							start: new Date("2016", "10", "15", "10", "0"),
							end: new Date("2016", "11", "25", "12", "0"),
							title: "Team collaboration",
							info: "room 1",
							type: "Type01",
							pic: "sap-icon://sap-ui5",
							tentative: false
						},
							{
								start: new Date("2016", "09", "13", "9", "0"),
								end: new Date("2016", "01", "09", "10", "0"),
								title: "Reminder",
								type: "Type06"
							},
							{
								start: new Date("2016", "07", "10", "0", "0"),
								end: new Date("2016", "09", "16", "23", "59"),
								title: "Vacation",
								info: "out of office",
								type: "Type04",
								tentative: false
							},
							{
								start: new Date("2016", "07", "1", "0", "0"),
								end: new Date("2016", "09", "31", "23", "59"),
								title: "New quarter",
								type: "Type10",
								tentative: false
							},
							{
								start: new Date("2017", "0", "03", "0", "01"),
								end: new Date("2017", "0", "04", "23", "59"),
								title: "Workshop",
								info: "regular",
								type: "Type07",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "0", "05", "08", "30"),
								end: new Date("2017", "0", "05", "09", "30"),
								title: "Meet Donna Moore",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date("2017", "0", "08", "10", "0"),
								end: new Date("2017", "0", "08", "12", "0"),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "0", "09", "0", "0"),
								end: new Date("2017", "0", "09", "23", "59"),
								title: "Vacation",
								info: "out of office",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date("2017", "0", "11", "0", "0"),
								end: new Date("2017", "0", "12", "23", "59"),
								title: "Education",
								info: "",
								type: "Type03",
								tentative: false
							},
							{
								start: new Date("2017", "0", "16", "00", "30"),
								end: new Date("2017", "0", "16", "23", "30"),
								title: "New Product",
								info: "room 105",
								type: "Type04",
								tentative: true
							},
							{
								start: new Date("2017", "0", "18", "11", "30"),
								end: new Date("2017", "0", "18", "13", "30"),
								title: "Lunch",
								info: "canteen",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date("2017", "0", "20", "11", "30"),
								end: new Date("2017", "0", "20", "13", "30"),
								title: "Lunch",
								info: "canteen",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date("2017", "0", "18", "0", "01"),
								end: new Date("2017", "0", "19", "23", "59"),
								title: "Working out of the building",
								type: "Type07",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "0", "23", "08", "00"),
								end: new Date("2017", "0", "24", "18", "30"),
								title: "Discussion of the plan",
								info: "Online meeting",
								type: "Type04",
								tentative: false
							},
							{
								start: new Date("2017", "0", "25", "0", "01"),
								end: new Date("2017", "0", "26", "23", "59"),
								title: "Workshop",
								info: "regular",
								type: "Type07",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "2", "30", "10", "0"),
								end: new Date("2017", "4", "33", "12", "0"),
								title: "Working out of the building",
								type: "Type07",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "8", "1", "00", "30"),
								end: new Date("2017", "10", "15", "23", "30"),
								title: "Development of a new Product",
								info: "room 207",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date("2017", "1", "15", "10", "0"),
								end: new Date("2017", "2", "25", "12", "0"),
								title: "Team collaboration",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "2", "13", "9", "0"),
								end: new Date("2017", "3", "09", "10", "0"),
								title: "Reminder",
								type: "Type06"
							},
							{
								start: new Date("2017", "03", "10", "0", "0"),
								end: new Date("2017", "05", "16", "23", "59"),
								title: "Vacation",
								info: "out of office",
								type: "Type04",
								tentative: false
							},
							{
								start: new Date("2017", "07", "1", "0", "0"),
								end: new Date("2017", "09", "31", "23", "59"),
								title: "New quarter",
								type: "Type10",
								tentative: false
							}
						],
						headers: [
							{
								start: new Date("2017", "0", "08", "0", "0"),
								end: new Date("2017", "0", "08", "23", "59"),
								title: "National holiday",
								type: "Type04"
							},
							{
								start: new Date("2017", "0", "10", "0", "0"),
								end: new Date("2017", "0", "10", "23", "59"),
								title: "Birthday",
								type: "Type06"
							},
							{
								start: new Date("2017", "0", "17", "0", "0"),
								end: new Date("2017", "0", "17", "23", "59"),
								title: "Reminder",
								type: "Type06"
							}
						]
					}
					]
				});
				this.getView().setModel(oModel);

			},

			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment");
				if (oAppointment) {
					var sSelected = oAppointment.getSelected() ? "selected" : "deselected";
					MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n Selected appointments: " + this.byId("PC1").getSelectedAppointments().length);
				} else {
					var aAppointments = oEvent.getParameter("appointments");
					var sValue = aAppointments.length + " Appointments selected";
					MessageBox.show(sValue);
				}
			},

			handleIntervalSelect: function (oEvent) {
				var oStartDate = oEvent.getParameter("startDate");
				var oEndDate = oEvent.getParameter("endDate");
				var oModel = this.getView().getModel();
				var oData = oModel.getData();
				var oAppointment = {
					start: oStartDate,
					end: oEndDate,
					title: "new appointment",
					type: "Type09"
				};

				oData.people[0].appointments.push(oAppointment);
				oModel.setData(oData);
			},

			toggleDayNamesLine: function (oEvent) {
				var oPC = this.byId("PC1");
				oPC.setShowDayNamesLine(!oPC.getShowDayNamesLine());
			}

		});

		return PageController;

	});