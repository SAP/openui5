/* eslint-disable no-alert, no-console */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/Popover",
	"sap/m/CalendarAppointment",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
],
function(jQuery, Button, Dialog, Label, Popover, CalendarAppointment, Fragment, Controller, JSONModel, Device) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.SinglePlanningCalendar.Page", {

		onInit: function() {
			var oModel = new JSONModel();
				oModel.setData({
					startDate: new Date(2018, 6, 9),
					appointments: [
						{
							title: "Meet John Miller",
							startDate: new Date(2018, 6, 8, 8, 0, 0),
							endDate: new Date(2018, 6, 8, 9, 0, 0)
						},
						{
							title: "Discussion of the plan",
							type: "Type01",
							startDate: new Date(2018, 6, 8, 9, 0, 0),
							endDate: new Date(2018, 6, 8, 10, 0, 0)
						},
						{
							title: "Lunch",
							text: "canteen",
							type: "Type02",
							startDate: new Date(2018, 6, 8, 10, 0, 0),
							endDate: new Date(2018, 6, 8, 11, 0, 0)
						},
						{
							title: "New Product",
							text: "room 105",
							type: "Type03",
							icon: "sap-icon://meeting-room",
							startDate: new Date(2018, 6, 8, 11, 0, 0),
							endDate: new Date(2018, 6, 8, 12, 0, 0)
						},
						{
							title: "Team meeting",
							text: "Regular",
							type: "Type04",
							icon: "sap-icon://home",
							startDate: new Date(2018, 6, 8, 12, 0, 0),
							endDate: new Date(2018, 6, 8, 13, 0, 0)
						},
						{
							title: "Discussion with clients",
							text: "Online meeting",
							type: "Type05",
							icon: "sap-icon://home",
							startDate: new Date(2018, 6, 8, 13, 0, 0),
							endDate: new Date(2018, 6, 8, 14, 0, 0)
						},
						{
							title: "Discussion of the plan",
							text: "Online meeting",
							type: "Type06",
							icon: "sap-icon://home",
							tentative: true,
							startDate: new Date(2018, 6, 8, 14, 0, 0),
							endDate: new Date(2018, 6, 8, 15, 0, 0)
						},
						{
							title: "Discussion with clients",
							type: "Type07",
							icon: "sap-icon://home",
							startDate: new Date(2018, 6, 8, 15, 0, 0),
							endDate: new Date(2018, 6, 8, 16, 0, 0)
						},
						{
							title: "Meeting with the manager",
							type: "Type08",
							startDate: new Date(2018, 6, 8, 16, 0, 0),
							endDate: new Date(2018, 6, 8, 17, 0, 0)
						},
						{
							title: "Meeting with the manager",
							type: "Type14",
							startDate: new Date(2018, 6, 9, 9, 30, 0),
							endDate: new Date(2018, 6, 9, 10, 0, 0)
						},
						{
							title: "Lunch",
							type: "Type15",
							startDate: new Date(2018, 6, 9, 10, 0, 0),
							endDate: new Date(2018, 6, 9, 11, 0, 0)
						},
						{
							title: "Team meeting",
							text: "online",
							type: "Type16",
							startDate: new Date(2018, 6, 9, 11, 0, 0),
							endDate: new Date(2018, 6, 9, 12, 0, 0)
						},
						{
							title: "Discussion with clients",
							type: "Type17",
							startDate: new Date(2018, 6, 9, 12, 0, 0),
							endDate: new Date(2018, 6, 9, 13, 0, 0)
						},
						{
							title: "Team meeting",
							text: "room 5",
							type: "Type18",
							startDate: new Date(2018, 6, 9, 14, 0, 0),
							endDate: new Date(2018, 6, 9, 17, 0, 0)
						},
						{
							title: "Daily standup meeting",
							type: "Type20",
							startDate: new Date(2018, 6, 9, 12, 0, 0),
							endDate: new Date(2018, 6, 9, 12, 15, 0)
						},
						{
							title: "Private meeting",
							type: "Type20",
							startDate: new Date(2018, 6, 11, 12, 0, 0),
							endDate: new Date(2018, 6, 11, 12, 20, 0)
						},
						{
							title: "Private meeting",
							color: "#f230b1",
							startDate: new Date(2018, 6, 10, 9, 0, 0),
							endDate: new Date(2018, 6, 10, 10, 0, 0)
						},
						{
							title: "Meeting with the manager",
							type: "Type20",
							startDate: new Date(2018, 6, 10, 18, 0, 0),
							endDate: new Date(2018, 6, 10, 18, 30, 0)
						},
						{
							title: "Meet John Doe",
							type: "Type01",
							icon: "sap-icon://home",
							startDate: new Date(2018, 6, 11, 10, 0, 0),
							endDate: new Date(2018, 6, 11, 10, 30, 0)
						},
						{
							title: "Team meeting",
							text: "online",
							type: "Type02",
							startDate: new Date(2018, 6, 11, 11, 0, 0),
							endDate: new Date(2018, 6, 11, 12, 30, 0)
						},
						{
							title: "Workshop",
							type: "Type03",
							startDate: new Date(2018, 6, 11, 11, 30, 0),
							endDate: new Date(2018, 6, 11, 15, 0, 0)
						},
						{
							title: "Team collaboration",
							type: "Type04",
							startDate: new Date(2018, 6, 12, 7, 0, 0),
							endDate: new Date(2018, 6, 12, 15, 30, 0)
						},
						{
							title: "Out of the office",
							type: "Type05",
							startDate: new Date(2018, 6, 12, 18, 0, 0),
							endDate: new Date(2018, 6, 12, 22, 30, 0)
						},
						{
							title: "Working out of the building",
							type: "Type06",
							startDate: new Date(2018, 6, 12, 23, 0, 0),
							endDate: new Date(2018, 6, 13, 0, 30, 0)
						},
						{
							title: "Vacation",
							type: "Type07",
							text: "out of office",
							startDate: new Date(2018, 6, 11, 15, 0, 0),
							endDate: new Date(2018, 6, 13, 17, 0, 0)
						},

						// Full day appointments/blockers
						{
							title: "Reminder",
							fullDay: true,
							startDate: new Date(2018, 6, 12, 15, 30, 0),
							endDate: new Date(2018, 6, 13, 16, 30, 0)
						},
						{
							title: "Team collaboration",
							fullDay: true,
							color: "#f230b1",
							startDate: new Date(2018, 6, 6, 15, 30, 0),
							endDate: new Date(2018, 6, 16, 16, 30, 0)
						},
						{
							title: "Workshop out of the country",
							fullDay: true,
							startDate: new Date(2018, 6, 14, 15, 30, 0),
							endDate: new Date(2018, 6, 20, 16, 30, 0)
						},
						{
							title: "Working out of the building",
							fullDay: true,
							startDate: new Date(2018, 6, 15, 15, 30, 0),
							endDate: new Date(2018, 6, 17, 16, 30, 0)
						},
						{
							title: "Payment reminder",
							fullDay: true,
							startDate: new Date(2018, 6, 7, 15, 30, 0),
							endDate: new Date(2018, 6, 8, 16, 30, 0)
						}
					]
				});

				this.getView().setModel(oModel);
		},

		handleStickyModeChange: function (oEvent) {
			var oSPC = this.byId("SPC1"),
				sNewStickyMode = oEvent.getParameter("selectedItem").getText();

			oSPC.setStickyMode(sNewStickyMode);
		},

		handleAppointmentCreate: function (oEvent) {
			var oFrag = sap.ui.core.Fragment,
				oDateTimePickerStart,
				oDateTimePickerEnd,
				oBeginButton;

			if (!this.oNewAppointmentDialog) {
				this._createDialog();
			}

			oDateTimePickerStart = oFrag.byId("myFrag", "startDate");
			oDateTimePickerEnd =  oFrag.byId("myFrag", "endDate");
			oBeginButton = this.oNewAppointmentDialog.getBeginButton();

			oDateTimePickerStart.setValue("");
			oDateTimePickerEnd.setValue("");
			oDateTimePickerStart.setValueState("None");
			oDateTimePickerEnd.setValueState("None");

			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, oBeginButton);
			this.oNewAppointmentDialog.open();
		},

		_validateDateTimePicker: function (sValue, oDateTimePicker) {
			if (sValue === "") {
				oDateTimePicker.setValueState("Error");
			} else {
				oDateTimePicker.setValueState("None");
			}
		},

		updateButtonEnabledState: function (oDateTimePickerStart, oDateTimePickerEnd, oButton) {
			var bEnabled = oDateTimePickerStart.getValueState() !== "Error"
				&& oDateTimePickerStart.getValue() !== ""
				&& oDateTimePickerEnd.getValue() !== ""
				&& oDateTimePickerEnd.getValueState() !== "Error";

			oButton.setEnabled(bEnabled);
		},

		handleCreateFragmentDateChange: function (oEvent) {
			var oFrag =  sap.ui.core.Fragment,
				oDateTimePickerStart = oFrag.byId("myFrag", "startDate"),
				oDateTimePickerEnd = oFrag.byId("myFrag", "endDate"),
				oBeginButton = this.oNewAppointmentDialog.getBeginButton();

			if (sap.ui.getCore().byId(oEvent.getParameter("id")) === oDateTimePickerStart &&
				!oDateTimePickerEnd.getProperty("value")) {
				oDateTimePickerEnd.setValue(oDateTimePickerStart.getProperty("value"));
			}
			this._validateDateTimePicker(oEvent.getParameter("value"), oEvent.getSource());
			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, oBeginButton);
		},

		_createDialog: function () {
			var oFrag =  sap.ui.core.Fragment,
				that = this,
				sPath = "/appointments",
				oStartDate,
				oEndDate,
				oTitle,
				oInfo,
				bFullDay,
				oNewAppointment,
				oModel,
				oAppointments;

			that.oNewAppointmentDialog = new Dialog({
				title: 'Add a new appointment',
				content: [
					sap.ui.xmlfragment("myFrag", "sap.m.sample.SinglePlanningCalendar.Create", this)
				],
				beginButton: new Button({
					text: 'Create',
					enabled: false,
					press: function () {
						oStartDate = oFrag.byId("myFrag", "startDate").getDateValue();
						oEndDate = oFrag.byId("myFrag", "endDate").getDateValue();
						oTitle = oFrag.byId("myFrag", "inputTitle");
						oInfo = oFrag.byId("myFrag", "moreInfo");
						bFullDay = oFrag.byId("myFrag", "fullDay").getProperty("selected");

						if (oFrag.byId("myFrag", "startDate").getValueState() !== "Error"
							&& oFrag.byId("myFrag", "endDate").getValueState() !== "Error") {

							oNewAppointment = {
								startDate: oStartDate,
								endDate: oEndDate,
								title: oTitle.getValue(),
								text: oInfo.getValue(),
								fullDay: bFullDay
							};

							oModel = that.getView().getModel();
							oAppointments = oModel.getProperty(sPath);
							oAppointments.push(oNewAppointment);

							oTitle.setValue("");
							oInfo.setValue("");

							oModel.setProperty(sPath, oAppointments);
							that.oNewAppointmentDialog.close();
						}
					}
				}),
				endButton: new Button({
					text: 'Close',
					press: function () {
						that.oNewAppointmentDialog.close();
					}
				})
			});

			that.oNewAppointmentDialog.addStyleClass("sapUiContentPadding");
			this.getView().addDependent(that.oNewAppointmentDialog);
		}
	});

	return PageController;
});