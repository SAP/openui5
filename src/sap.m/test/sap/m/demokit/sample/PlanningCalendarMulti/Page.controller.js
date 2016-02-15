sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.PlanningCalendarMulti.Page", {

		onInit: function () {
			// create model
			var oModel = new JSONModel();
			oModel.setData({
				startDate: new Date("2015", "11", "15", "8", "0"),
				people: [{
									pic: "sap-icon://employee",
									name: "Max Mustermann",
									role: "team member",
									appointments: [
									               {
									              	 start: new Date("2015", "11", "15", "10", "0"),
									              	 end: new Date("2015", "11", "15", "12", "0"),
									              	 title: "Team meeting",
									              	 info: "room 1",
									              	 type: "Type01",
									              	 pic: "sap-icon://sap-ui5",
									              	 tentative: false
									               },
									               {
									              	 start: new Date("2015", "11", "16", "0", "0"),
									              	 end: new Date("2015", "11", "16", "23", "59"),
									              	 title: "Vacation",
									              	 info: "out of office",
									              	 type: "Type04",
									              	 tentative: false
									               }
									               ]
								},
								{
									pic: "test-resources/sap/ui/demokit/explored/img/johnDoe.png",
									name: "John Doe",
									role: "team member",
									appointments: [
									               {
									              	 start: new Date("2015", "11", "15", "08", "30"),
									              	 end: new Date("2015", "11", "15", "09", "30"),
									              	 title: "Meeting",
									              	 type: "Type02",
									              	 tentative: false
									               },
									               {
									              	 start: new Date("2015", "11", "15", "10", "0"),
									              	 end: new Date("2015", "11", "15", "12", "0"),
									              	 title: "Team meeting",
									              	 info: "room 1",
									              	 type: "Type01",
									              	 pic: "sap-icon://sap-ui5",
									              	 tentative: false
									               },
									               {
									              	 start: new Date("2015", "11", "15", "11", "30"),
									              	 end: new Date("2015", "11", "15", "13", "30"),
									              	 title: "Lunch",
									              	 type: "Type03",
									              	 tentative: true
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