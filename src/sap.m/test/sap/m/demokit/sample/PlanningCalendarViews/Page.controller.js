sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox'
	],
	function (Controller, JSONModel, MessageBox) {
		"use strict";

		var PageController = Controller.extend("sap.m.sample.PlanningCalendarViews.Page", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					startDate: new Date(2017, 1, 8, 8, 0),
					people: [{
						pic: "test-resources/sap/ui/demokit/explored/img/John_Miller.png",
						name: "John Miller",
						role: "team member",
						freeDays: [5, 6],
						freeHours: [0, 1, 2, 3, 4, 5, 6, 17, 19, 20, 21, 22, 23],
						appointments: [{
							start: new Date(2016, 11, 2, 11, 30),
							end: new Date(2016, 11, 2, 13, 30),
							title: "Online Meeting",
							type: "Type03",
							tentative: true
						},
							{
								start: new Date(2017, 0, 15, 13, 30),
								end: new Date(2017, 0, 29, 17, 30),
								title: "Discussion with clients",
								info: "online meeting",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date(2017, 1, 7, 0, 1),
								end: new Date(2017, 1, 7, 23, 59),
								title: "Vacation",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date(2017, 1, 8, 8, 30),
								end: new Date(2017, 1, 8, 15, 0),
								title: "Meeting",
								type: "Type05",
								tentative: false
							},
							{
								start: new Date(2017, 1, 8, 8, 0),
								end: new Date(2017, 1, 8, 17, 0),
								title: "Team meeting",
								info: "room 106",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date(2017, 1, 9, 7, 30),
								end: new Date(2017, 1, 9, 16, 30),
								title: "Meet Donna Moore",
								info: "regular",
								type: "Type08",
								tentative: false
							},
							{
								start: new Date(2017, 1, 10, 0, 0),
								end: new Date(2017, 1, 11, 23, 29),
								title: "Private appointment",
								type: "Type06",
								tentative: true
							},
							{
								start: new Date(2017, 3, 17, 8, 30),
								end: new Date(2017, 3, 17, 15, 30),
								title: "Meet Max Mustermann",
								type: "Type02",
								tentative: true
							},
							{
								start: new Date(2017, 3, 3, 10, 0),
								end: new Date(2017, 3, 3, 12, 0),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date(2017, 2, 4, 11, 30),
								end: new Date(201, 2, 4, 13, 30),
								title: "Online Meeting",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date(2017, 0, 15, 13, 30),
								end: new Date(2017, 0, 29, 17, 30),
								title: "Discussion with clients",
								info: "online meeting",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date(2017, 1, 7, 0, 1),
								end: new Date(2017, 1, 7, 23, 59),
								title: "Vacation",
								type: "Type02",
								tentative: false
							},
						],
						headers: [
							{
								start: new Date(2017, 1, 9, 11, 30),
								end: new Date(2017, 1, 9, 14, 0),
								title: "Lunch",
								type: "Type03"
							}
						]
					},
						{
							pic: "sap-icon://employee",
							name: "Max Mustermann",
							role: "team member",
							freeDays: [0, 6],
							freeHours: [0, 1, 2, 3, 4, 5, 6, 7, 18, 19, 20, 21, 22, 23],
							appointments: [{
								start: new Date(2017, 0, 2, 11, 30),
								end: new Date(2017, 0, 2, 13, 30),
								title: "Online Meeting",
								type: "Type03",
								tentative: true
							},
								{
									start: new Date(2017, 0, 15, 13, 30),
									end: new Date(2017, 0, 29, 11, 30),
									title: "Meeting with managers",
									info: "online meeting",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date(2017, 1, 5, 0, 1),
									end: new Date(2017, 1, 5, 23, 59),
									title: "Education",
									type: "Type03",
									tentative: false
								},
								{
									start: new Date(2017, 1, 8, 8, 0),
									end: new Date(2017, 1, 8, 17, 0),
									title: "Team meeting",
									info: "room 106",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date(2017, 1, 9, 10, 0),
									end: new Date(2017, 1, 9, 16, 30),
									title: "Meeting",
									info: "phone",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date(2017, 1, 10, 0, 0),
									end: new Date(2017, 1, 0, 23, 59),
									title: "Blocker",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date(2017, 1, 10, 7, 30),
									end: new Date(2017, 1, 10, 16, 30),
									title: "Meet Donna Moore",
									info: "regular",
									type: "Type08",
									tentative: false
								},
								{
									start: new Date(2017, 1, 12, 0, 1),
									end: new Date(2017, 1, 12, 23, 59),
									title: "New Product",
									info: "room 105",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date(2017, 2, 2, 11, 30),
									end: new Date(2017, 2, 2, 13, 30),
									title: "Online Meeting",
									type: "Type03",
									tentative: true
								},
								{
									start: new Date(2017, 2, 15, 13, 30),
									end: new Date(2017, 2, 29, 17, 30),
									title: "Meeting with managers",
									info: "online meeting",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date(2017, 4, 2, 11, 30),
									end: new Date(2017, 4, 2, 13, 30),
									title: "Online Meeting",
									type: "Type03",
									tentative: true
								},
								{
									start: new Date(2017, 2, 15, 13, 30),
									end: new Date(2017, 2, 29, 17, 30),
									title: "Discussion with clients",
									info: "online meeting",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date(2017, 3, 7, 0, 1),
									end: new Date(2017, 3, 7, 23, 59),
									title: "Vacation",
									type: "Type02",
									tentative: false
								}
							],
							headers: [
								{
									start: new Date(2017, 1, 14, 0, 0),
									end: new Date(2017, 1, 14, 23, 59),
									title: "Valentine's Day",
									type: "Type03"
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
					MessageBox.show("Appointment selected: " + oAppointment.getTitle());
				} else {
					var aAppointments = oEvent.getParameter("appointments");
					var sValue = aAppointments.length + " Appointments selected";
					MessageBox.show(sValue);
				}
			},

			handleIntervalSelect: function (oEvent) {
				var oPC = oEvent.oSource;
				var oStartDate = oEvent.getParameter("startDate");
				var oEndDate = oEvent.getParameter("endDate");
				var oRow = oEvent.getParameter("row");
				var oModel = this.getView().getModel();
				var oData = oModel.getData();
				var iIndex = -1;
				var oAppointment = {
					start: oStartDate,
					end: oEndDate,
					title: "new appointment",
					type: "Type09"
				};

				if (oRow) {
					iIndex = oPC.indexOfRow(oRow);
					oData.people[iIndex].appointments.push(oAppointment);
				} else {
					var aSelectedRows = oPC.getSelectedRows();
					for (var i = 0; i < aSelectedRows.length; i++) {
						iIndex = oPC.indexOfRow(aSelectedRows[i]);
						oData.people[iIndex].appointments.push(oAppointment);
					}
				}

				oModel.setData(oData);

			}

		});

		return PageController;

	});