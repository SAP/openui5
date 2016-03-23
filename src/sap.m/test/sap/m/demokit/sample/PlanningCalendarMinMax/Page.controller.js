sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.PlanningCalendarMinMax.Page", {

		onInit: function () {
			// create model
			var oModel = new JSONModel();
			oModel.setData({
				startDate: new Date(2016, 2, 23, 8, 0, 0),
				minDate: new Date(2000, 0, 1, 0, 0, 0),
				maxDate: new Date(2050, 11, 31, 23, 59, 59),
				people: [{
									pic: "sap-icon://employee",
									name: "Max Mustermann",
									role: "team member",
									appointments: [
									               {
									              	 start: new Date(2016, 2, 23, 9, 0),
									              	 end: new Date(2016, 2, 23, 11, 0),
									              	 title: "Team meeting",
									              	 info: "room 1",
									              	 type: "Type01",
									              	 pic: "sap-icon://sap-ui5",
									              	 tentative: false
									               },
									               {
									              	 start: new Date(2016, 2, 23, 9, 30),
									              	 end: new Date(2016, 2, 23, 11, 30),
									              	 title: "Meeting 1",
									              	 type: "Type02",
									              	 pic: "sap-icon://sap-ui5",
									              	 tentative: false
									               },
									               {
									              	 start: new Date(2016, 2, 24, 9, 0),
									              	 end: new Date(2016, 2, 24, 16, 0),
									              	 title: "Busy",
									              	 type: "Type08",
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
									              	 start: new Date(2016, 2, 23, 9, 0),
									              	 end: new Date(2016, 2, 23, 11, 0),
									              	 title: "Team meeting",
									              	 info: "room 1",
									              	 type: "Type01",
									              	 pic: "sap-icon://sap-ui5",
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
				alert("Appointment selected: " + oAppointment.getTitle());
			}else {
				var aAppointments = oEvent.getParameter("appointments");
				var sValue = aAppointments.length + " Appointments selected";
				alert(sValue);
			}
		}

	});

	return PageController;

});