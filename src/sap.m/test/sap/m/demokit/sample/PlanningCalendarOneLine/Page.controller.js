sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.PlanningCalendarOneLine.Page", {

		onInit: function () {
			// create model
			var oModel = new JSONModel();
			oModel.setData({
				startDate: new Date("2016", "2", "8", "8", "0"),
				people: [{
									pic: "sap-icon://employee",
									name: "Max Mustermann",
									role: "team member",
									appointments: [
									               {
									              	 start: new Date("2016", "2", "8", "9", "0"),
									              	 end: new Date("2016", "2", "8", "11", "0"),
									              	 title: "Team meeting",
									              	 info: "room 1",
									              	 type: "Type01",
									              	 pic: "sap-icon://sap-ui5",
									              	 tentative: false
									               },
									               {
									              	 start: new Date("2016", "2", "8", "9", "30"),
									              	 end: new Date("2016", "2", "8", "11", "30"),
									              	 title: "Meeting 1",
									              	 type: "Type02",
									              	 pic: "sap-icon://sap-ui5",
									              	 tentative: false
									               },
									               {
									              	 start: new Date("2016", "2", "8", "11", "0"),
									              	 end: new Date("2016", "2", "8", "13", "0"),
									              	 title: "Meeting 2",
									              	 type: "Type03",
									              	 pic: "",
									              	 tentative: true
									               },
									               {
									              	 start: new Date("2016", "2", "8", "11", "0"),
									              	 end: new Date("2016", "2", "8", "13", "0"),
									              	 title: "Meeting 3",
									              	 type: "Type04",
									              	 pic: "",
									              	 tentative: false
									               },
									               {
									              	 start: new Date("2016", "2", "9", "9", "0"),
									              	 end: new Date("2016", "2", "9", "16", "0"),
									              	 title: "Busy",
									              	 type: "Type08",
									              	 tentative: false
									               }
									          ],
									headers: [
									          {
									          	start: new Date("2016", "2", "9", "8", "0"),
									          	end: new Date("2016", "2", "9", "9", "0"),
									          	title: "UI5",
									          	pic: "sap-icon://sap-ui5",
									          	type: "Type05"
									          }
									               ]
								},
								{
									pic: "test-resources/sap/ui/demokit/explored/img/johnDoe.png",
									name: "John Doe",
									role: "team member",
									appointments: [
									               {
									              	 start: new Date("2016", "2", "8", "07", "0"),
									              	 end: new Date("2016", "2", "8", "09", "0"),
									              	 title: "Meeting 1",
									              	 type: "Type05",
									              	 tentative: false
									               },
									               {
									              	 start: new Date("2016", "2", "8", "08", "0"),
									              	 end: new Date("2016", "2", "8", "09", "0"),
									              	 title: "Meeting 2",
									              	 type: "Type06",
									              	 tentative: false
									               },
									               {
									              	 start: new Date("2016", "2", "8", "9", "0"),
									              	 end: new Date("2016", "2", "8", "11", "0"),
									              	 title: "Team meeting",
									              	 info: "room 1",
									              	 type: "Type01",
									              	 pic: "sap-icon://sap-ui5",
									              	 tentative: false
									               }
									          ],
									headers: [
									          {
									          	start: new Date("2016", "2", "8", "8", "0"),
									          	end: new Date("2016", "2", "8", "9", "0"),
									          	title: "UI5",
									          	pic: "sap-icon://sap-ui5",
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