sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.PlanningCalendarViews.Page", {

		onInit: function () {
			// create model
			var oModel = new JSONModel();
			oModel.setData({
				startDate: new Date(2016, 1, 8, 8, 0),
				people: [{
									pic: "sap-icon://employee",
									name: "Max Mustermann",
									role: "team member",
									freeDays: [0, 6],
									freeHours: [0, 1, 2, 3, 4, 5, 6, 7, 18, 19, 20, 21, 22, 23],
									appointments: [
									               {
									              	 start: new Date(2016, 1, 8, 8, 0),
									              	 end: new Date(2016, 1, 8, 17, 0),
									              	 title: "Team meeting",
									              	 info: "room 1",
									              	 type: "Type01",
									              	 pic: "sap-icon://sap-ui5",
									              	 tentative: false
									               },
									               {
									              	 start: new Date(2016, 1, 9, 10, 0),
									              	 end: new Date(2016, 1, 9, 16, 30),
									              	 title: "Meeting",
									              	 info: "phone",
									              	 type: "Type02",
									              	 tentative: false
									               },
									               {
									              	 start: new Date(2016, 1, 10, 0, 0),
									              	 end: new Date(2016, 1, 0, 23, 59),
									              	 title: "Blocker",
									              	 type: "Type04",
									              	 tentative: false
									               }
									               ],
									headers: [
									          {
									          	start: new Date(2016, 1, 14, 0, 0),
									          	end: new Date(2016, 1, 14, 23, 59),
									          	title: "Valentine's Day",
									          	type: "Type03"
									          }
									          ]
								},
								{
									pic: "test-resources/sap/ui/demokit/explored/img/johnDoe.png",
									name: "John Doe",
									role: "team member",
									freeDays: [5, 6],
									freeHours: [0, 1, 2, 3, 4, 5, 6, 17, 19, 20, 21, 22, 23],
									appointments: [
									               {
									              	 start: new Date(2016, 1, 8, 8, 30),
									              	 end: new Date(2016, 1, 8, 10, 30),
									              	 title: "Meeting",
									              	 type: "Type05",
									              	 tentative: false
									               },
									               {
									              	 start: new Date(2016, 1, 8, 8, 0),
									              	 end: new Date(2016, 1, 8, 17, 0),
									              	 title: "Team meeting",
									              	 info: "room 1",
									              	 type: "Type01",
									              	 pic: "sap-icon://sap-ui5",
									              	 tentative: false
									               },
									               {
									              	 start: new Date(2016, 1, 10, 0, 0),
									              	 end: new Date(2016, 1, 11, 23, 29),
									              	 title: "Private",
									              	 type: "Type06",
									              	 tentative: true
									               }
									               ],
									headers: [
									          {
									          	start: new Date(2016, 1, 8, 11, 0),
									          	end: new Date(2016, 1, 8, 13, 0),
									          	title: "Lunch",
									          	type: "Type07"
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
				alert("Appointment selected: " + oAppointment.getTitle());
			}else {
				var aAppointments = oEvent.getParameter("appointments");
				var sValue = aAppointments.length + " Appointments selected";
				alert(sValue);
			}
		},

		handleIntervalSelect: function (oEvent) {
			var oPC = oEvent.oSource;
			var oStartDate = oEvent.getParameter("startDate");
			var oEndDate = oEvent.getParameter("endDate");
			var oRow = oEvent.getParameter("row");
			var oSubInterval = oEvent.getParameter("subInterval");
			var oModel = this.getView().getModel();
			var oData = oModel.getData();
			var iIndex = -1;
			var oAppointment = {start: oStartDate,
					                end: oEndDate,
					                title: "new appointment",
					                type: "Type09"};

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