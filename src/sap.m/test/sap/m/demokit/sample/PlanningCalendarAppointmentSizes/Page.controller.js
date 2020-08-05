sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
],
function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.PlanningCalendarAppointmentSizes.Page", {

		onInit: function () {
			// create model
			var oModel = new JSONModel();
			oModel.setData({
				startDate: new Date("2017", "2", "08", "8", "0"),
				people: [{
					pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
					name: "John Miller",
					role: "team member",
					appointments: [
						{
							start: new Date("2017", "2", "7", "18", "00"),
							end: new Date("2017", "2", "7", "19", "10"),
							title: "Discussion of the plan",
							info: "Online meeting",
							type: "Type04",
							tentative: false
						},
						{
							start: new Date("2017", "2", "7", "14", "00"),
							end: new Date("2017", "2", "7", "15", "15"),
							title: "Department meeting",
							type: "Type04",
							tentative: false
						},
						{
							start: new Date("2017", "2", "3", "10", "0"),
							end: new Date("2017", "2", "7", "12", "0"),
							title: "Workshop out of the country",
							type: "Type07",
							pic: "sap-icon://sap-ui5",
							tentative: false
						},
						{
							start: new Date("2017", "2", "8", "9", "0"),
							end: new Date("2017", "2", "8", "11", "0"),
							title: "Team meeting",
							info: "room 105",
							type: "Type01",
							pic: "sap-icon://sap-ui5",
							tentative: false
						},
						{
							start: new Date("2017", "2", "8", "9", "30"),
							end: new Date("2017", "2", "8", "11", "30"),
							title: "Meeting with Max",
							type: "Type02",
							pic: "sap-icon://sap-ui5",
							tentative: false
						},
						{
							start: new Date("2017", "2", "8", "11", "0"),
							end: new Date("2017", "2", "8", "13", "0"),
							title: "Lunch",
							info: "info",
							description: "description",
							type: "Type03",
							pic: "",
							tentative: true
						},
						{
							start: new Date("2017", "2", "8", "11", "0"),
							end: new Date("2017", "2", "8", "13", "0"),
							title: "Meeting with the crew",
							type: "Type04",
							pic: "",
							tentative: false
						},
						{
							start: new Date("2017", "2", "9", "9", "0"),
							end: new Date("2017", "2", "9", "16", "0"),
							title: "Busy",
							type: "Type08",
							tentative: false
						},
						{
							start: new Date("2017", "2", "10", "9", "0"),
							end: new Date("2017", "2", "10", "11", "0"),
							title: "Team meeting",
							info: "room 105",
							type: "Type01",
							pic: "sap-icon://sap-ui5",
							tentative: false
						},
						{
							start: new Date("2017", "2", "10", "9", "30"),
							end: new Date("2017", "2", "10", "16", "30"),
							title: "Meeting with Max",
							type: "Type02",
							tentative: false
						},
						{
							start: new Date("2017", "2", "11", "0", "0"),
							end: new Date("2017", "2", "13", "23", "59"),
							title: "Vacation",
							info: "out of office",
							type: "Type04",
							tentative: false
						},
						{
							start: new Date("2017", "2", "16", "00", "30"),
							end: new Date("2017", "2", "16", "23", "30"),
							title: "New Colleague",
							info: "room 115",
							type: "Type10",
							tentative: true
						},
						{
							start: new Date("2017", "9", "11", "0", "0"),
							end: new Date("2017", "10", "13", "23", "59"),
							title: "Vacation",
							info: "out of office",
							type: "Type04",
							tentative: false
						},
						{
							start: new Date("2017", "2", "8", "14", "0"),
							end: new Date("2017", "2", "8", "15", "0"),
							title: "Reminder",
							type: "Type06"
						}
					]
				},
					{
						pic: "sap-icon://employee",
						name: "Max Mustermann",
						role: "team member",
						appointments: [{
							start: new Date("2016", "11", "1", "00", "30"),
							end: new Date("2017", "0", "31", "23", "30"),
							title: "New product release",
							info: "room 105",
							type: "Type03",
							tentative: true
						},
							{
								start: new Date("2017", "2", "2", "08", "0"),
								end: new Date("2017", "2", "2", "17", "0"),
								title: "Education",
								type: "Type05",
								tentative: false
							},
							{
								start: new Date("2017", "2", "3", "09", "00"),
								end: new Date("2017", "2", "3", "10", "00"),
								title: "New Product",
								info: "room 105",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date("2017", "2", "8", "08", "0"),
								end: new Date("2017", "2", "8", "13", "0"),
								title: "Meet Donna",
								type: "Type06",
								tentative: false
							},
							{
								start: new Date("2017", "2", "8", "13", "0"),
								end: new Date("2017", "2", "9", "11", "0"),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "2", "8", "13", "0"),
								end: new Date("2017", "2", "8", "14", "59"),
								title: "Team meeting2",
								info: "room 2",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "2", "9", "00", "00"),
								end: new Date("2017", "2", "9", "23", "59"),
								title: "Department meeting",
								type: "Type04",
								tentative: false
							},
							{
								start: new Date("2017", "2", "12", "00", "00"),
								end: new Date("2017", "2", "12", "12", "00"),
								title: "Meeting with John",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date("2017", "2", "12", "12", "00"),
								end: new Date("2017", "2", "12", "23", "59"),
								title: "Team Building",
								info: "out of office",
								type: "Type10",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "2", "13", "00", "00"),
								end: new Date("2017", "2", "13", "12", "00"),
								title: "New Product",
								info: "room 325",
								type: "Type07",
								tentative: true
							},
							{
								start: new Date("2017", "2", "13", "12", "00"),
								end: new Date("2017", "2", "13", "23", "30"),
								title: "New Product",
								info: "room 105",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date("2017", "2", "14", "0", "0"),
								end: new Date("2017", "2", "14", "12", "00"),
								title: "Vacation",
								info: "out of office",
								type: "Type04",
								tentative: false
							},
							{
								start: new Date("2017", "2", "14", "12", "00"),
								end: new Date("2017", "2", "14", "23", "30"),
								title: "New product release",
								info: "room 105",
								type: "Type03",
								tentative: true
							}
						],
						headers: [{
							start: new Date("2017", "2", "8", "8", "0"),
							end: new Date("2017", "2", "8", "10", "0"),
							title: "Development of UI5",
							pic: "sap-icon://sap-ui5",
							type: "Type07"
						},
							{
								start: new Date("2017", "4", "1", "0", "0"),
								end: new Date("2017", "7", "30", "23", "59"),
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

		handleAppointmentHeightChange: function (oEvent) {

			var oPC = this.byId("PC1"),
				sAppointmentHeight = oEvent.getParameter("selectedItem").getKey();

			oPC.setAppointmentHeight(sAppointmentHeight);
		},

		handleSortChange: function (oEvent) {
			//make a custom sort regarding alphabetical order
			var oPC = this.byId("PC1"),
				fnSelectedSort = oEvent.getParameter("selectedItem").getKey() === "custom" ? this.fnAlphabeticalOrder : null;

			oPC.setCustomAppointmentsSorterCallback(fnSelectedSort);

		},

		handleAppointmentRoundingChange: function (oEvent){
			var oPC = this.byId("PC1"),
				sAppointmentRoundingWidth = oEvent.getParameter("selectedItem").getKey();
			oPC.setAppointmentRoundWidth(sAppointmentRoundingWidth);
		},

		// custom function for appointments sort by alphabetical order
		fnAlphabeticalOrder : function(oApp1, oApp2) {
			if (oApp1.getTitle().toLowerCase() > oApp2.getTitle().toLowerCase()) {
				return 1;
			}
			if (oApp1.getTitle().toLowerCase() < oApp2.getTitle().toLowerCase()) {
				return -1;
			}
			return 0;
		}
	});

});