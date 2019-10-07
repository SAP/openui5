sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library",
	"sap/m/MessageToast"
],
function(Controller, JSONModel, unifiedLibrary, MessageToast) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;

	return Controller.extend("sap.m.sample.SinglePlanningCalendarDND.Page", {

		onInit: function() {

			var oModel = new JSONModel();
			oModel.setData({
					startDate: new Date("2018", "6", "9"),
					appointments: [{
						title: "Meet John Miller",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "8", "5", "0"),
						endDate: new Date("2018", "6", "8", "6", "0")
					}, {
						title: "Discussion of the plan",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "8", "6", "0"),
						endDate: new Date("2018", "6", "8", "7", "9")
					}, {
						title: "Lunch",
						text: "canteen",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "8", "7", "0"),
						endDate: new Date("2018", "6", "8", "8", "0")
					}, {
						title: "New Product",
						text: "room 105",
						type: CalendarDayType.Type01,
						icon: "sap-icon://meeting-room",
						startDate: new Date("2018", "6", "8", "8", "0"),
						endDate: new Date("2018", "6", "8", "9", "0")
					}, {
						title: "Team meeting",
						text: "Regular",
						type: CalendarDayType.Type01,
						icon: "sap-icon://home",
						startDate: new Date("2018", "6", "8", "9", "9"),
						endDate: new Date("2018", "6", "8", "10", "0")
					}, {
						title: "Discussion with clients",
						text: "Online meeting",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						startDate: new Date("2018", "6", "8", "10", "0"),
						endDate: new Date("2018", "6", "8", "11", "0")
					}, {
						title: "Discussion of the plan",
						text: "Online meeting",
						type: CalendarDayType.Type01,
						icon: "sap-icon://home",
						tentative: true,
						startDate: new Date("2018", "6", "8", "11", "0"),
						endDate: new Date("2018", "6", "8", "12", "0")
					}, {
						title: "Discussion with clients",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						startDate: new Date("2018", "6", "8", "12", "0"),
						endDate: new Date("2018", "6", "8", "13", "9")
					}, {
						title: "Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "8", "13", "9"),
						endDate: new Date("2018", "6", "8", "13", "9")
					}, {
						title: "Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "9", "6", "30"),
						endDate: new Date("2018", "6", "9", "7", "0")
					}, {
						title: "Lunch",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "9", "7", "0"),
						endDate: new Date("2018", "6", "9", "8", "0")
					}, {
						title: "Team meeting",
						text: "online",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "9", "8", "0"),
						endDate: new Date("2018", "6", "9", "9", "0")
					}, {
						title: "Discussion with clients",
						type: CalendarDayType.Type08,
						startDate: new Date("2018", "6", "9", "9", "0"),
						endDate: new Date("2018", "6", "9", "10", "0")
					}, {
						title: "Team meeting",
						text: "room 5",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "9", "11", "0"),
						endDate: new Date("2018", "6", "9", "14", "0")
					}, {
						title: "Daily standup meeting",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "9", "9", "0"),
						endDate: new Date("2018", "6", "9", "9", "15", "0")
					}, {
						title: "Private meeting",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "11", "9", "9"),
						endDate: new Date("2018", "6", "11", "9", "20")
					}, {
						title: "Private meeting",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "10", "6", "0"),
						endDate: new Date("2018", "6", "10", "7", "0")
					}, {
						title: "Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "10", "15", "0"),
						endDate: new Date("2018", "6", "10", "15", "30")
					}, {
						title: "Meet John Doe",
						type: CalendarDayType.Type05,
						icon: "sap-icon://home",
						startDate: new Date("2018", "6", "11", "7", "0"),
						endDate: new Date("2018", "6", "11", "7", "30")
					}, {
						title: "Team meeting",
						text: "online",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "11", "8", "0"),
						endDate: new Date("2018", "6", "11", "9", "30")
					}, {
						title: "Workshop",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "11", "8", "30"),
						endDate: new Date("2018", "6", "11", "12", "0")
					}, {
						title: "Team collaboration",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "12", "4", "0"),
						endDate: new Date("2018", "6", "12", "12", "30")
					}, {
						title: "Out of the office",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "12", "15", "0"),
						endDate: new Date("2018", "6", "12", "19", "30")
					}, {
						title: "Working out of the building",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "12", "20", "0"),
						endDate: new Date("2018", "6", "12", "21", "30")
					}, {
						title: "Reminder",
						type: CalendarDayType.Type09,
						startDate: new Date("2018", "6", "12", "00", "00"),
						endDate: new Date("2018", "6", "13", "00", "00")
					}, {
						title: "Team collaboration",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "6", "00", "00"),
						endDate:  new Date("2018", "6", "16", "00", "00")
					}, {
						title: "Workshop out of the country",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "14", "00", "00"),
						endDate: new Date("2018", "6", "20", "00", "00")
					}, {
						title: "Payment reminder",
						type: CalendarDayType.Type09,
						startDate: new Date("2018", "6", "7", "00", "00"),
						endDate: new Date("2018", "6", "8", "00", "00")
					}, {
						title:"Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "6", "9", "0"),
						endDate: new Date("2018", "6", "6", "10", "0")
					}, {
						title:"Daily standup meeting",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "7", "10", "0"),
						endDate: new Date("2018", "6", "7", "10", "30")
					}, {
						title:"Private meeting",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "6", "11", "30"),
						endDate: new Date("2018", "6", "6", "12", "0")
					}, {
						title:"Lunch",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "6", "12", "0"),
						endDate: new Date("2018", "6", "6", "13", "0")
					}, {
						title:"Discussion of the plan",
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "16", "11", "0"),
						endDate: new Date("2018", "6", "16", "12", "0")
					}, {
						title:"Lunch",
						text: "canteen",
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "16", "12", "0"),
						endDate: new Date("2018", "6", "16", "13", "0")
					}, {
						title:"Team meeting",
						text: "room 200",
						type: CalendarDayType.Type01,
						icon: "sap-icon://meeting-room",
						startDate:  new Date("2018", "6", "16", "16", "0"),
						endDate: new Date("2018", "6", "16", "17", "0")
					}, {
						title:"Discussion with clients",
						text: "Online meeting",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						startDate: new Date("2018", "6", "17", "15", "30"),
						endDate: new Date("2018", "6", "17", "16", "30")
					}
				]
			});
			this.getView().setModel(oModel);

			oModel = new JSONModel();
			oModel.setData({
				stickyMode: "None",
				enableAppointmentsDragAndDrop: true,
				enableAppointmentsResize: true,
				enableAppointmentsCreate: true
			});
			this.getView().setModel(oModel, "settings");
		},

		handleAppointmentDrop: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				bCopy = oEvent.getParameter("copy"),
				sAppointmentTitle = oAppointment.getTitle(),
				oModel = this.getView().getModel(),
				oNewAppointment;

			if (bCopy) {
				oNewAppointment = {
					title: sAppointmentTitle,
					icon: oAppointment.getIcon(),
					text: oAppointment.getText(),
					type: oAppointment.getType(),
					startDate: oStartDate,
					endDate: oEndDate
				};
				oModel.getData().appointments.push(oNewAppointment);
				oModel.updateBindings();
			} else {
				oAppointment.setStartDate(oStartDate);
				oAppointment.setEndDate(oEndDate);
			}

			MessageToast.show("Appointment with title \n'"
				+ sAppointmentTitle
				+ "'\n has been " + (bCopy ? "create" : "moved")
			);
		},

		handleAppointmentResize: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				sAppointmentTitle = oAppointment.getTitle();

			oAppointment.setStartDate(oStartDate);
			oAppointment.setEndDate(oEndDate);

			MessageToast.show("Appointment with title \n'"
				+ sAppointmentTitle
				+ "'\n has been resized"
			);
		},

		handleAppointmentCreateDnD: function(oEvent) {
			var oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				sAppointmentTitle = "New Appointment",
				oModel = this.getView().getModel(),
				oNewAppointment = {
					title: sAppointmentTitle,
					startDate: oStartDate,
					endDate: oEndDate
				};

			oModel.getData().appointments.push(oNewAppointment);
			oModel.updateBindings();

			sap.m.MessageToast.show("Appointment with title \n'"
				+ sAppointmentTitle
				+ "'\n has been created"
			);
		}
	});
});
