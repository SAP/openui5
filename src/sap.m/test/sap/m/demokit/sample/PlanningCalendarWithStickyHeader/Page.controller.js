sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox'
	],
	function (Controller, JSONModel, MessageBox) {
		"use strict";

		return Controller.extend("sap.m.sample.PlanningCalendarWithStickyHeader.Page", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					startDate: new Date("2017", "0", "15", "8", "0"),
					people: [{
						pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
						name: "John Miller",
						role: "team member",
						appointments: [
							{
								start: new Date("2017", "0", "8", "08", "30"),
								end: new Date("2017", "0", "8", "09", "30"),
								title: "Meet Max Mustermann",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date("2017", "0", "11", "10", "0"),
								end: new Date("2017", "0", "11", "12", "0"),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "0", "12", "11", "30"),
								end: new Date("2017", "0", "12", "13", "30"),
								title: "Lunch",
								info: "canteen",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date("2017", "0", "15", "08", "30"),
								end: new Date("2017", "0", "15", "09", "30"),
								title: "Meet Max Mustermann",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date("2017", "0", "15", "10", "0"),
								end: new Date("2017", "0", "15", "12", "0"),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "0", "15", "11", "30"),
								end: new Date("2017", "0", "15", "13", "30"),
								title: "Lunch",
								info: "canteen",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date("2017", "0", "15", "13", "30"),
								end: new Date("2017", "0", "15", "17", "30"),
								title: "Discussion with clients",
								info: "online meeting",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date("2017", "0", "16", "04", "00"),
								end: new Date("2017", "0", "16", "22", "30"),
								title: "Discussion of the plan",
								info: "Online meeting",
								type: "Type04",
								tentative: false
							},
							{
								start: new Date("2017", "0", "18", "08", "30"),
								end: new Date("2017", "0", "18", "09", "30"),
								title: "Meeting with the manager",
								type: "Type02",
								tentative: false
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
								start: new Date("2017", "0", "18", "1", "0"),
								end: new Date("2017", "0", "18", "22", "0"),
								title: "Team meeting",
								info: "regular",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "0", "21", "00", "30"),
								end: new Date("2017", "0", "21", "23", "30"),
								title: "New Product",
								info: "room 105",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date("2017", "0", "25", "11", "30"),
								end: new Date("2017", "0", "25", "13", "30"),
								title: "Lunch",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date("2017", "0", "29", "10", "0"),
								end: new Date("2017", "0", "29", "12", "0"),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "0", "30", "08", "30"),
								end: new Date("2017", "0", "30", "09", "30"),
								title: "Meet Max Mustermann",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date("2017", "0", "30", "10", "0"),
								end: new Date("2017", "0", "30", "12", "0"),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: new Date("2017", "0", "30", "11", "30"),
								end: new Date("2017", "0", "30", "13", "30"),
								title: "Lunch",
								type: "Type03",
								tentative: true
							},
							{
								start: new Date("2017", "0", "30", "13", "30"),
								end: new Date("2017", "0", "30", "17", "30"),
								title: "Discussion with clients",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date("2017", "0", "31", "10", "00"),
								end: new Date("2017", "0", "31", "11", "30"),
								title: "Discussion of the plan",
								info: "Online meeting",
								type: "Type04",
								tentative: false
							},
							{
								start: new Date("2017", "1", "3", "08", "30"),
								end: new Date("2017", "1", "13", "09", "30"),
								title: "Meeting with the manager",
								type: "Type02",
								tentative: false
							},
							{
								start: new Date("2017", "1", "4", "10", "0"),
								end: new Date("2017", "1", "4", "12", "0"),
								title: "Team meeting",
								info: "room 1",
								type: "Type01",
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
							}
						],
						headers: [
							{
								start: new Date("2017", "0", "15", "8", "0"),
								end: new Date("2017", "0", "15", "10", "0"),
								title: "Reminder",
								type: "Type06"
							},
							{
								start: new Date("2017", "0", "15", "17", "0"),
								end: new Date("2017", "0", "15", "19", "0"),
								title: "Reminder",
								type: "Type06"
							},
							{
								start: new Date("2017", "8", "1", "0", "0"),
								end: new Date("2017", "10", "30", "23", "59"),
								title: "New quarter",
								type: "Type10",
								tentative: false
							},
							{
								start: new Date("2018", "1", "1", "0", "0"),
								end: new Date("2018", "3", "30", "23", "59"),
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
							appointments: [
								{
									start: new Date("2017", "0", "10", "18", "00"),
									end: new Date("2017", "0", "10", "19", "10"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "9", "10", "0"),
									end: new Date("2017", "0", "13", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "08", "00"),
									end: new Date("2017", "0", "15", "09", "30"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "10", "0"),
									end: new Date("2017", "0", "15", "12", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "18", "00"),
									end: new Date("2017", "0", "15", "19", "10"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "16", "10", "0"),
									end: new Date("2017", "0", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2018", "0", "1", "0", "0"),
									end: new Date("2018", "2", "31", "23", "59"),
									title: "New quarter",
									type: "Type10",
									tentative: false
								},
								{
									start: new Date("2017", "01", "11", "10", "0"),
									end: new Date("2017", "02", "20", "12", "0"),
									title: "Team collaboration",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "3", "01", "10", "0"),
									end: new Date("2017", "3", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "4", "01", "10", "0"),
									end: new Date("2017", "4", "31", "12", "0"),
									title: "Out of the office",
									type: "Type08",
									tentative: false
								},
								{
									start: new Date("2017", "7", "1", "0", "0"),
									end: new Date("2017", "7", "31", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								}
							],
							headers: [
								{
									start: new Date("2017", "0", "15", "9", "0"),
									end: new Date("2017", "0", "15", "10", "0"),
									title: "Payment reminder",
									type: "Type06"
								},
								{
									start: new Date("2017", "0", "15", "16", "30"),
									end: new Date("2017", "0", "15", "18", "00"),
									title: "Private appointment",
									type: "Type06"
								}
							]
						},
						{
							pic: "sap-icon://employee",
							name: "Nancy Davolio",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "0", "15", "10", "00"),
									end: new Date("2017", "0", "15", "10", "30"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "17", "10", "0"),
									end: new Date("2017", "0", "17", "12", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "18", "00"),
									end: new Date("2017", "0", "15", "19", "10"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "18", "10", "0"),
									end: new Date("2017", "0", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2018", "0", "1", "0", "0"),
									end: new Date("2018", "2", "31", "23", "59"),
									title: "New quarter",
									type: "Type10",
									tentative: false
								},
								{
									start: new Date("2017", "01", "11", "10", "0"),
									end: new Date("2017", "02", "20", "12", "0"),
									title: "Team collaboration",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "3", "01", "10", "0"),
									end: new Date("2017", "3", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "4", "01", "10", "0"),
									end: new Date("2017", "4", "31", "12", "0"),
									title: "Out of the office",
									type: "Type08",
									tentative: false
								},
								{
									start: new Date("2017", "7", "1", "0", "0"),
									end: new Date("2017", "7", "31", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								}
							],
							headers: [
								{
									start: new Date("2017", "0", "12", "16", "30"),
									end: new Date("2017", "0", "12", "18", "00"),
									title: "Private appointment",
									type: "Type06"
								}
							]
						},
						{
							pic: "sap-icon://employee",
							name: "Andrew Fuller",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "0", "15", "10", "00"),
									end: new Date("2017", "0", "15", "10", "30"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "18", "00"),
									end: new Date("2017", "0", "15", "19", "10"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "18", "10", "0"),
									end: new Date("2017", "0", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "01", "11", "10", "0"),
									end: new Date("2017", "02", "20", "12", "0"),
									title: "Team collaboration",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "3", "01", "10", "0"),
									end: new Date("2017", "3", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "4", "01", "10", "0"),
									end: new Date("2017", "4", "31", "12", "0"),
									title: "Out of the office",
									type: "Type08",
									tentative: false
								},
								{
									start: new Date("2017", "7", "1", "0", "0"),
									end: new Date("2017", "7", "31", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								}
							]
						},
						{
							pic: "sap-icon://employee",
							name: "Robert King",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "0", "15", "10", "00"),
									end: new Date("2017", "0", "15", "12", "00"),
									title: "Planning",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "17", "10", "0"),
									end: new Date("2017", "0", "17", "12", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "18", "10", "0"),
									end: new Date("2017", "0", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2018", "0", "1", "0", "0"),
									end: new Date("2018", "2", "31", "23", "59"),
									title: "New quarter",
									type: "Type10",
									tentative: false
								},
								{
									start: new Date("2017", "01", "11", "10", "0"),
									end: new Date("2017", "02", "20", "12", "0"),
									title: "Team collaboration",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "3", "01", "10", "0"),
									end: new Date("2017", "3", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "4", "01", "10", "0"),
									end: new Date("2017", "4", "31", "12", "0"),
									title: "Out of the office",
									type: "Type08",
									tentative: false
								},
								{
									start: new Date("2017", "7", "1", "0", "0"),
									end: new Date("2017", "7", "31", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								}
							],
							headers: [
								{
									start: new Date("2017", "0", "12", "16", "30"),
									end: new Date("2017", "0", "12", "18", "00"),
									title: "Private appointment",
									type: "Type06"
								}
							]
						},
						{
							pic: "sap-icon://employee",
							name: "Janet Leverling",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "0", "16", "9", "00"),
									end: new Date("2017", "0", "16", "10", "00"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "18", "10", "10"),
									end: new Date("2017", "0", "18", "10", "40"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "12", "00"),
									end: new Date("2017", "0", "15", "13", "10"),
									title: "Discussion",
									info: "Online meeting",
									type: "Type04",
									tentative: true
								},
								{
									start: new Date("2017", "0", "18", "10", "0"),
									end: new Date("2017", "0", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "3", "01", "10", "0"),
									end: new Date("2017", "3", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "4", "01", "10", "0"),
									end: new Date("2017", "4", "31", "12", "0"),
									title: "Out of the office",
									type: "Type08",
									tentative: false
								}
							],
							headers: [
								{
									start: new Date("2017", "0", "15", "17", "00"),
									end: new Date("2017", "0", "15", "18", "00"),
									title: "Private appointment",
									type: "Type06"
								}
							]
						},
						{
							pic: "sap-icon://employee",
							name: "Robert King",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "0", "15", "08", "30"),
									end: new Date("2017", "0", "15", "09", "30"),
									title: "Meet John Miller",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "10", "0"),
									end: new Date("2017", "0", "15", "12", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "13", "00"),
									end: new Date("2017", "0", "15", "16", "00"),
									title: "Discussion with clients",
									info: "online",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "16", "0", "0"),
									end: new Date("2017", "0", "16", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "17", "1", "0"),
									end: new Date("2017", "0", "18", "22", "0"),
									title: "Workshop",
									info: "regular",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "19", "08", "30"),
									end: new Date("2017", "0", "19", "18", "30"),
									title: "Meet John Doe",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "19", "10", "0"),
									end: new Date("2017", "0", "19", "16", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "19", "07", "00"),
									end: new Date("2017", "0", "19", "17", "30"),
									title: "Discussion with clients",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "20", "0", "0"),
									end: new Date("2017", "0", "20", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "22", "07", "00"),
									end: new Date("2017", "0", "27", "17", "30"),
									title: "Discussion with clients",
									info: "out of office",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "2", "13", "9", "0"),
									end: new Date("2017", "2", "17", "10", "0"),
									title: "Payment week",
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
									start: new Date("2017", "0", "16", "0", "0"),
									end: new Date("2017", "0", "16", "23", "59"),
									title: "Private",
									type: "Type05"
								}
							]
						},
						{
							pic: "sap-icon://employee",
							name: "Max Mustermann",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "0", "15", "08", "30"),
									end: new Date("2017", "0", "15", "09", "30"),
									title: "Meet John Miller",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "10", "0"),
									end: new Date("2017", "0", "15", "12", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "13", "00"),
									end: new Date("2017", "0", "15", "16", "00"),
									title: "Discussion with clients",
									info: "online",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "16", "0", "0"),
									end: new Date("2017", "0", "16", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "17", "1", "0"),
									end: new Date("2017", "0", "18", "22", "0"),
									title: "Workshop",
									info: "regular",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "19", "08", "30"),
									end: new Date("2017", "0", "19", "18", "30"),
									title: "Meet John Doe",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "19", "10", "0"),
									end: new Date("2017", "0", "19", "16", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "19", "07", "00"),
									end: new Date("2017", "0", "19", "17", "30"),
									title: "Discussion with clients",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "20", "0", "0"),
									end: new Date("2017", "0", "20", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "22", "07", "00"),
									end: new Date("2017", "0", "27", "17", "30"),
									title: "Discussion with clients",
									info: "out of office",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "2", "13", "9", "0"),
									end: new Date("2017", "2", "17", "10", "0"),
									title: "Payment week",
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
									start: new Date("2017", "0", "16", "0", "0"),
									end: new Date("2017", "0", "16", "23", "59"),
									title: "Private",
									type: "Type05"
								}
							]
						},
						{
							pic: "sap-icon://employee",
							name: "Laura Callahan",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "0", "16", "9", "00"),
									end: new Date("2017", "0", "16", "10", "00"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "18", "10", "10"),
									end: new Date("2017", "0", "18", "10", "40"),
									title: "Discussion of the plan",
									info: "Online meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "12", "00"),
									end: new Date("2017", "0", "15", "13", "10"),
									title: "Discussion",
									info: "Online meeting",
									type: "Type04",
									tentative: true
								},
								{
									start: new Date("2017", "0", "18", "10", "0"),
									end: new Date("2017", "0", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "3", "01", "10", "0"),
									end: new Date("2017", "3", "31", "12", "0"),
									title: "Workshop out of the country",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "4", "01", "10", "0"),
									end: new Date("2017", "4", "31", "12", "0"),
									title: "Out of the office",
									type: "Type08",
									tentative: false
								}
							],
							headers: [
								{
									start: new Date("2017", "0", "15", "17", "00"),
									end: new Date("2017", "0", "15", "18", "00"),
									title: "Private appointment",
									type: "Type06"
								}
							]
						},
						{
							pic: "sap-icon://employee",
							name: "Anne Dodsworth",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "0", "15", "09", "30"),
									end: new Date("2017", "0", "15", "10", "30"),
									title: "Meeting",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "13", "30"),
									end: new Date("2017", "0", "15", "15", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "17", "0", "0"),
									end: new Date("2017", "0", "17", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "19", "10", "0"),
									end: new Date("2017", "0", "19", "16", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "22", "07", "00"),
									end: new Date("2017", "0", "27", "17", "30"),
									title: "Discussion with clients",
									info: "out of office",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "2", "13", "9", "0"),
									end: new Date("2017", "2", "17", "10", "0"),
									title: "Payment week",
									type: "Type06"
								}
							]
						},
						{
							pic: "sap-icon://employee",
							name: "Michael Suyama",
							role: "team member",
							appointments: [
								{
									start: new Date("2017", "0", "15", "09", "00"),
									end: new Date("2017", "0", "15", "10", "30"),
									title: "Meet new colleague",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "10", "30"),
									end: new Date("2017", "0", "15", "12", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "15", "15", "00"),
									end: new Date("2017", "0", "15", "16", "00"),
									title: "Discussion with clients",
									info: "online",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "17", "0", "0"),
									end: new Date("2017", "0", "17", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "19", "08", "30"),
									end: new Date("2017", "0", "19", "18", "30"),
									title: "Meet John Doe",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "19", "10", "0"),
									end: new Date("2017", "0", "19", "16", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: new Date("2017", "0", "19", "07", "00"),
									end: new Date("2017", "0", "19", "17", "30"),
									title: "Discussion with clients",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "0", "20", "0", "0"),
									end: new Date("2017", "0", "20", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: new Date("2017", "0", "22", "07", "00"),
									end: new Date("2017", "0", "27", "17", "30"),
									title: "Discussion with clients",
									info: "out of office",
									type: "Type02",
									tentative: false
								},
								{
									start: new Date("2017", "2", "13", "9", "0"),
									end: new Date("2017", "2", "17", "10", "0"),
									title: "Payment week",
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
									start: new Date("2017", "0", "16", "0", "0"),
									end: new Date("2017", "0", "16", "23", "59"),
									title: "Private",
									type: "Type05"
								}
							]
						}
					]
				});
				this.getView().setModel(oModel);

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

			handleSelectionFinish: function(oEvent) {
				var aSelectedKeys = oEvent.getSource().getSelectedKeys();
				this.byId("PC1").setBuiltInViews(aSelectedKeys);
			}

		});

	});