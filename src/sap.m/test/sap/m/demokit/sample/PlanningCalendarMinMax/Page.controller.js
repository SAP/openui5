sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox'
	],
	function (Controller, JSONModel, MessageBox) {
		"use strict";

		var PageController = Controller.extend("sap.m.sample.PlanningCalendarMinMax.Page", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					startDate: new Date(2017, 0, 15, 8, 0),
					minDate: new Date(2000, 0, 1, 0, 0, 0),
					maxDate: new Date(2050, 11, 31, 23, 59, 59),
					people: [{
						pic: "test-resources/sap/ui/demokit/explored/img/John_Miller.png",
						name: "John Miller",
						role: "team member",
						appointments: [{
							start: new Date(2016, 9, 20, 10, 0),
							end: new Date(2016, 11, 15, 12, 0),
							title: "Working out of the building",
							type: "Type07",
							pic: "sap-icon://sap-ui5",
							tentative: false
						},
							{
								start: new Date(2017, 0, 15, 8, 30),
								end: new Date(2017, 0, 15, 9, 30),
								title: "Meeting with Max Mustermann",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date(2017, 0, 15, 10, 0),
								end: new Date(2017, 0, 15, 12, 0),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date(2017, 0, 15, 11, 30),
								end: new Date(2017, 0, 15, 13, 30),
								title: "Lunch",
								info: "canteen",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date(2017, 0, 15, 13, 30),
								end: new Date(2017, 0, 15, 17, 30),
								title: "Discussion with clients",
								info: "online meeting",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date(2017, 0, 16, 0, 1),
								end: new Date(2017, 0, 16, 23, 59),
								title: "Discussion",
								info: "Online meeting",
								type: "Type04",
								tentative: false
							},
							{
								start: new Date(2017, 0, 18, 8, 30),
								end: new Date(2017, 0, 18, 9, 30),
								title: "Meeting with the manager",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date(2017, 0, 18, 11, 0),
								end: new Date(2017, 0, 18, 13, 30),
								title: "Lunch",
								info: "canteen",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date(2017, 0, 18, 1, 0),
								end: new Date(2017, 0, 18, 22, 0),
								title: "Team meeting",
								info: "regular",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date(2017, 0, 21, 0, 30),
								end: new Date(2017, 0, 21, 23, 30),
								title: "New Product",
								info: "room 105",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date(2017, 0, 25, 11, 30),
								end: new Date(2017, 0, 25, 13, 30),
								title: "Lunch",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date(2017, 0, 29, 10, 0),
								end: new Date(2017, 0, 29, 12, 0),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date(2017, 0, 30, 8, 0),
								end: new Date(2017, 0, 30, 9, 30),
								title: "Meet Max Mustermann",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date(2017, 0, 30, 10, 0),
								end: new Date(2017, 0, 30, 12, 0),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date(2017, 0, 30, 11, 30),
								end: new Date(2017, 0, 30, 13, 30),
								title: "Lunch",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date(2017, 0, 30, 13, 30),
								end: new Date(2017, 0, 30, 17, 30),
								title: "Discussion with clients",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date(2017, 0, 31, 10, 0),
								end: new Date(2017, 0, 31, 11, 30),
								title: "Discussion of the plan",
								info: "Online meeting",
								type: "Type04",
								tentative: false
							},
							{
								start: new Date(2017, 1, 1, 1, 0),
								end: new Date(2017, 1, 2, 22, 0),
								title: "Workshop",
								info: "regular",
								type: "Type07",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date(2017, 1, 3, 8, 30),
								end: new Date(2017, 1, 13, 9, 30),
								title: "Meeting with the manager",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date(2017, 1, 4, 10, 0),
								end: new Date(2017, 1, 4, 12, 0),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date(2017, 2, 30, 10, 0),
								end: new Date(2017, 4, 31, 12, 0),
								title: "Working out of the building",
								type: "Type07",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date(2017, 8, 1, 0, 30),
								end: new Date(2017, 10, 15, 23, 30),
								title: "Development of a new Product",
								info: "room 207",
								type: "Type03",
								tentative: true
							}
						]
					},
						{
							pic: "sap-icon://employee",
							name: "Max Mustermann",
							role: "team member",
							appointments: [{
								start: new Date(2016, 7, 15, 10, 0),
								end: new Date(2016, 8, 25, 12, 0),
								title: "Team collaboration",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
								{
									start: new Date(2017, 0, 15, 8, 30),
									end: new Date(2017, 0, 15, 9, 30),
									title: "Meeting with John Miller",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date(2017, 0, 15, 10, 0),
									end: new Date(2017, 0, 15, 12, 0),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date(2017, 0, 15, 13, 0),
									end: new Date(2017, 0, 15, 16, 0),
									title: "Discussion with clients",
									info: "online",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date(2017, 0, 16, 0, 0),
									end: new Date(2017, 0, 16, 23, 59),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date(2017, 0, 17, 1, 0),
									end: new Date(2017, 0, 18, 22, 0),
									title: "Workshop",
									info: "regular",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date(2017, 0, 19, 8, 30),
									end: new Date(2017, 0, 19, 18, 30),
									title: "Meet John Miller",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date(2017, 0, 19, 0, 1),
									end: new Date(2017, 0, 19, 23, 59),
									title: "Team meeting",
									info: "room 102",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date(2017, 0, 19, 7, 0),
									end: new Date(2017, 0, 19, 17, 30),
									title: "Discussion with clients",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date(2017, 0, 20, 0, 0),
									end: new Date(2017, 0, 20, 23, 59),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date(2017, 0, 22, 7, 0),
									end: new Date(2017, 0, 27, 17, 30),
									title: "Discussion with clients",
									info: "out of office",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date(2017, 1, 15, 10, 0),
									end: new Date(2017, 2, 25, 12, 0),
									title: "Team collaboration",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date(2017, 2, 13, 9, 0),
									end: new Date(2017, 3, 9, 10, 0),
									title: "Reminder",
									type: "Type06"
								},
								{
									start: new Date(2017, 3, 10, 0, 0),
									end: new Date(2017, 5, 16, 23, 59),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date(2017, 7, 1, 0, 0),
									end: new Date(2017, 9, 31, 23, 59),
									title: "New quarter",
									type: "Type10",
									tentative: false
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
			}

		});

		return PageController;

	});