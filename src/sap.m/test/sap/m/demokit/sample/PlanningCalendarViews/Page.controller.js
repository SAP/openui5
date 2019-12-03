sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox',
		'sap/ui/Device',
		'sap/ui/unified/library',
		'sap/ui/unified/DateTypeRange',
		'sap/m/PlanningCalendarView'
	],
	function (Controller, JSONModel, MessageBox, Device, unifiedLibrary, DateTypeRange, PlanningCalendarView) {
		"use strict";

		var CalendarIntervalType = unifiedLibrary.CalendarIntervalType;
		var CalendarDayType = unifiedLibrary.CalendarDayType;

		return Controller.extend("sap.m.sample.PlanningCalendarViews.Page", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					startDate: new Date(2017, 1, 8, 8, 0),
					people: [{
						pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
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
				var oSelectedItem = oEvent.getParameter("selectedItem");
				if (oSelectedItem) {
					this.byId("PC1").setGroupAppointmentsMode(oSelectedItem.getKey());
				}
			},

			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					sSelected,
					aAppointments,
					sValue;

				if (oAppointment) {
					sSelected = oAppointment.getSelected() ? "selected" : "deselected";
					MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n Selected appointments: " + this.byId("PC1").getSelectedAppointments().length);
				} else {
					aAppointments = oEvent.getParameter("appointments");
					sValue = aAppointments.length + " Appointments selected";
					MessageBox.show(sValue);
				}
			},

			handleIntervalSelect: function (oEvent) {
				if (this.byId("PC1").getViewKey() === "nonWorking"){
					this.handleNonWorkingSpecialDates(oEvent);
				} else {
					var oPC = oEvent.getSource(),
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
						},
						aSelectedRows,
						i;

					if (oRow) {
						iIndex = oPC.indexOfRow(oRow);
						oData.people[iIndex].appointments.push(oAppointment);
					} else {
						aSelectedRows = oPC.getSelectedRows();
						for (i = 0; i < aSelectedRows.length; i++) {
							iIndex = oPC.indexOfRow(aSelectedRows[i]);
							oData.people[iIndex].appointments.push(oAppointment);
						}
					}

					oModel.setData(oData);
				}
			},

			handleViewChange: function () {
				this.determineControlsVisibility();
			},

			/*
			 For "days with non-working dates" view only.
			 When handleIntervalSelect on a certain date header for a first time - it becomes a non-working day.
			 When it's for a second time - it removes it.
			 */
			handleNonWorkingSpecialDates: function (oEvent){
				var oPC1 = this.byId("PC1"),
					aSpecialDates = oPC1.getSpecialDates() || [],
					oStartDate = oEvent.getParameter("startDate"),
					//determine add or remove
					oFound = aSpecialDates.find(function(oDateRange) {
						return oDateRange.getStartDate().getTime() === oStartDate.getTime();
					});

				if (!oFound) {
					oPC1.addSpecialDate(new DateTypeRange({
						startDate: new Date(oStartDate.getTime()),
						type: CalendarDayType.NonWorking
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
				var bLabelVisible = this.byId("PC1").getViewKey() === "nonWorking",
					bSelectVisible = false;
				this.byId("label").setVisible(bLabelVisible);
				if (Device.system.desktop){
					bSelectVisible = this.byId("PC1").getViewKey() === "M";
				}
				this.byId("select").setVisible(bSelectVisible);
			},

			handleSelectionFinish: function(oEvent) {
				var aSelectedKeys = oEvent.getSource().getSelectedKeys();
				this.byId("PC1").setBuiltInViews(aSelectedKeys);
			},

			onPress: function (oEvent) {
				if (!oEvent.getParameter("pressed")) {
					this.byId("PC1").addView(
						new PlanningCalendarView({
							key: "A",
							intervalType: CalendarIntervalType.Hour,
							description: "hours view",
							intervalsS: 2,
							intervalsM: 4,
							intervalsL: 6,
							showSubIntervals: true
						})
					);
					this.byId("PC1").addView(
						new PlanningCalendarView({
							key: "D",
							intervalType: CalendarIntervalType.Day,
							description: "days view",
							intervalsS: 1,
							intervalsM: 3,
							intervalsL: 7,
							showSubIntervals: true
						})
					);
					this.byId("PC1").addView(
						new PlanningCalendarView({
							key: "M",
							intervalType: CalendarIntervalType.Month,
							description: "months view",
							intervalsS: 1,
							intervalsM: 2,
							intervalsL: 3,
							showSubIntervals: true
						})
					);
					this.byId("PC1").addView(
						new PlanningCalendarView({
							key: "nonWorking",
							intervalType: CalendarIntervalType.Day,
							description: "days with non-working dates",
							intervalsS: 1,
							intervalsM: 5,
							intervalsL: 9
						})
					);
					this.byId("PC1").setViewKey("D");
				} else {
					this.byId("PC1").destroyViews();
				}
				this.byId("select").setVisible(false);
				this.byId("label").setVisible(false);
			}

		});

	});