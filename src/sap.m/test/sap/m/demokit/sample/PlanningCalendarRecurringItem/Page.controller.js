sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox',
		'sap/ui/core/date/UI5Date'
	],
	function (Controller, JSONModel, MessageBox, UI5Date) {
		"use strict";

		return Controller.extend("sap.m.sample.PlanningCalendarRecurringItem.Page", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					startDate: UI5Date.getInstance("2019", "8", "1", "0", "0"),
					people: [{
						pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
						name: "John Miller",
						role: "team member",
						nonWorkingPeriods: [
							{
								recurrenceType: "Daily",
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								recurrencePattern: 1,
								date: UI5Date.getInstance(2019, 8 ,1),
								start: "12:55",
								end:"13:15",
								valueFormat:"HH:mm"
							},
							{
								recurrenceType: "Daily",
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								recurrencePattern: 1,
								date: UI5Date.getInstance(2019, 8 ,1),
								start: "04:30",
								end:"04:45",
								valueFormat:"HH:mm"
							}
					],
						headers: [
							{
								start: UI5Date.getInstance("2017", "0", "15", "8", "0"),
								end: UI5Date.getInstance("2017", "0", "15", "10", "0"),
								title: "Reminder",
								type: "Type06"
							},
							{
								start: UI5Date.getInstance("2017", "0", "15", "17", "0"),
								end: UI5Date.getInstance("2017", "0", "15", "19", "0"),
								title: "Reminder",
								type: "Type06"
							},
							{
								start: UI5Date.getInstance("2017", "8", "1", "0", "0"),
								end: UI5Date.getInstance("2017", "10", "30", "23", "59"),
								title: "New quarter",
								type: "Type10",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2018", "1", "1", "0", "0"),
								end: UI5Date.getInstance("2018", "3", "30", "23", "59"),
								title: "New quarter",
								type: "Type10",
								tentative: false
							}
						]
					},
						{
							pic: "test-resources/sap/ui/documentation/sdk/images/Donna_Moore.jpg",
							name: "Donna Moore",
							role: "team member",
							nonWorkingPeriods: [
								{
									recurrenceType: "Daily",
									recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
									recurrencePattern: 1,
									date: UI5Date.getInstance(2019, 8 ,1),
									start: "11:55",
									end:"13:15",
									valueFormat:"HH:mm"
								},
								{
									recurrenceType: "Daily",
									recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
									recurrencePattern: 1,
									date: UI5Date.getInstance(2019, 8 ,1),
									start: "03:30",
									end:"03:45",
									valueFormat:"HH:mm"
								}
						],
							headers: [
								{
									start: UI5Date.getInstance("2017", "0", "15", "9", "0"),
									end: UI5Date.getInstance("2017", "0", "15", "10", "0"),
									title: "Payment reminder",
									type: "Type06"
								},
								{
									start: UI5Date.getInstance("2017", "0", "15", "16", "30"),
									end: UI5Date.getInstance("2017", "0", "15", "18", "00"),
									title: "Private appointment",
									type: "Type06"
								}
							]
						},
						{
							pic: "sap-icon://employee",
							name: "Max Mustermann",
							role: "team member",
							headers: [
								{
									start: UI5Date.getInstance("2017", "0", "16", "0", "0"),
									end: UI5Date.getInstance("2017", "0", "16", "23", "59"),
									title: "Private",
									type: "Type05"
								}
							]
						}
					]
				});
				this.getView().setModel(oModel);
			},

			handleRowHeaderPress: function (oEvent) {
				MessageBox.show("rowHeaderPressed on row: " + oEvent.getParameter("row").getId());
			}

		});

	});