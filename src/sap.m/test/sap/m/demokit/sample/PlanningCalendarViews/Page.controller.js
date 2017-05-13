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
							}
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

				this.determineControlsVisibility();
			},

			handleGroupModeChange: function (oEvent) {
				var selectedItem = oEvent.getParameter("selectedItem");
				if (selectedItem) {
					var oPC1 = this.getView().byId("PC1");
					oPC1.setGroupAppointmentsMode(selectedItem.getKey());
				}
			},

			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment");
				if (oAppointment) {
					MessageBox.show("Appointment selected: " + oAppointment.getTitle());
				} else {
					var aAppointments = oEvent.getParameter("appointments"),
						sValue = aAppointments.length + " Appointments selected";
					MessageBox.show(sValue);
				}
			},

			handleIntervalSelect: function (oEvent) {
				if (this.getView().byId("PC1").getViewKey() === "nonWorking"){
					this.handleNonWorkingSpecialDates(oEvent);
				} else {
					var oPC = oEvent.oSource,
						oStartDate = oEvent.getParameter("startDate"),
						oEndDate = oEvent.getParameter("endDate"),
						oRow = oEvent.getParameter("row"),
						oModel = this.getView().getModel(),
						oData = oModel.getData(),
						iIndex = -1,
						oAppointment = {
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
			},

			handleViewChange: function (oEvent) {
				this.determineControlsVisibility();
			},

			/*
			 For "days with non-working dates" view only.
			 When handleIntervalSelect on a certain date header for a first time - it becomes a non-working day.
			 When it's for a second time - it removes it.
			 */
			handleNonWorkingSpecialDates: function (oEvent){
				var oPC1 = this.getView().byId("PC1"),
					aSpecialDates = oPC1.getSpecialDates() || [],
					oStartDate = oEvent.getParameter("startDate");

				//determine add or remove
				var oFound = aSpecialDates.find(function(oDateRange) {
					return oDateRange.getStartDate().getTime() === oStartDate.getTime();
				});

				if (!oFound) {
					oPC1.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: new Date(oStartDate.getTime()),
						type: sap.ui.unified.CalendarDayType.NonWorking
					}));
				} else {
					oPC1.removeSpecialDate(oFound);
				}
			},

			/*
			sap.m.Label should be visible only for non-working days view.
			sap.m.Select should be visible only for months view because only there is a grouping.
			 */
			determineControlsVisibility: function () {
				var bLabelVisible = this.getView().byId("PC1").getViewKey() === "nonWorking",
					bSelectVisible = this.getView().byId("PC1").getViewKey() === "M";
				this.getView().byId("label").setVisible(bLabelVisible);
				this.getView().byId("select").setVisible(bSelectVisible);
			}

		});

		return PageController;

	});