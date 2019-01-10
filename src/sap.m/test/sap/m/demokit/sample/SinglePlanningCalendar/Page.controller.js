sap.ui.define([
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/Library",
	"sap/m/MessageToast"
],
function(Button, Dialog, Fragment, Controller, JSONModel, unifiedLibrary, MessageToast) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;

	var PageController = Controller.extend("sap.m.sample.SinglePlanningCalendar.Page", {

		onInit: function() {

			var oModel = new JSONModel();
			oModel.setData({
					startDate: new Date("2018", "6", "9"),
					types: (function() {
						var aTypes = [];
						for (var key in CalendarDayType) {
							aTypes.push({
								type: CalendarDayType[key]
							});
						}
						return aTypes;
					})(),
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
						title: "Vacation",
						type: CalendarDayType.Type09,
						text: "out of office",
						startDate: new Date("2018", "6", "11", "12", "0"),
						endDate: new Date("2018", "6", "13", "14", "0")
					}, {
						title: "Reminder",
						fullDay: true,
						type: CalendarDayType.Type09,
						startDate: new Date("2018", "6", "12", "12", "30"),
						endDate: new Date("2018", "6", "13", "13", "30")
					}, {
						title: "Team collaboration",
						fullDay: true,
						type: CalendarDayType.Type01,
						startDate: new Date("2018", "6", "6", "12", "30"),
						endDate:  new Date("2018", "6", "16", "13", "30")
					}, {
						title: "Workshop out of the country",
						fullDay: true,
						type: CalendarDayType.Type05,
						startDate: new Date("2018", "6", "14", "12", "30"),
						endDate: new Date("2018", "6", "20", "13", "30")
					}, {
						title: "Payment reminder",
						fullDay: true,
						type: CalendarDayType.Type09,
						startDate: new Date("2018", "6", "7", "12", "30"),
						endDate: new Date("2018", "6", "8", "13", "30")
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
		},

		handleStickyModeChange: function (oEvent) {
			var oSPC = this.byId("SPC1"),
				sNewStickyMode = oEvent.getParameter("selectedItem").getText();

			oSPC.setStickyMode(sNewStickyMode);
		},

		handleAppointmentSelect: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment");

			if (!this._oDetailsPopover) {
				Fragment.load({
					id: "myPopoverFrag",
					name: "sap.m.sample.SinglePlanningCalendar.Details",
					controller: this
				})
				.then(function(oPopoverContent){
					this._oDetailsPopover = oPopoverContent;
					this.getView().addDependent(this._oDetailsPopover);
					// To edit an appointment through the form input fields,
					// the Details.fragment.xml must be loaded
					this._setPopoverInitialState(oAppointment);
				}.bind(this));
			} else {
				this._setPopoverInitialState(oAppointment);
			}
		},

		/*
		 * Sets the default values of the fields in the popover.
		 */
		_setPopoverInitialState: function(oAppointment) {
			var oAppBC = oAppointment.getBindingContext(),
				oTitleInput = Fragment.byId("myPopoverFrag", "appTitle"),
				oTypeInput = Fragment.byId("myPopoverFrag", "appType"),
				oDateTimePickerStart = Fragment.byId("myPopoverFrag", "startDate"),
				oDateTimePickerEnd = Fragment.byId("myPopoverFrag", "endDate"),
				oInfoInput = Fragment.byId("myPopoverFrag", "moreInfo"),
				oOKButton = this._oDetailsPopover.getBeginButton(),
				aTypes = oTypeInput.getItems(),
				oSelectedItem = aTypes[0],
				i;

			for (i = 0; i < aTypes.length; ++i) {
				if (aTypes[i].getKey() === oAppointment.getType()) {
					oSelectedItem = aTypes[i];
					break;
				}
			}
			this._oDetailsPopover.setBindingContext(oAppBC);

			oTitleInput.setValue(oAppointment.getTitle());
			oTypeInput.setSelectedItem(oSelectedItem);
			oDateTimePickerStart.setDateValue(oAppointment.getStartDate());
			oDateTimePickerEnd.setDateValue(oAppointment.getEndDate());
			oInfoInput.setValue(oAppointment.getText());

			oDateTimePickerStart.setValueState("None");
			oDateTimePickerEnd.setValueState("None");

			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, oOKButton);
			this._oDetailsPopover.openBy(oAppointment);
		},

		handleAppointmentCreate: function () {
			this._loadDialogFragment(this.getView().byId("SPC1").getStartDate());
		},

		handleHeaderDateSelect: function (oEvent) {
			this._loadDialogFragment(oEvent.getParameter("date"));
		},

		/*
		 * Loads the dialog fragment for creation of an appointment.
		 */
		_loadDialogFragment: function (oAppStartDate) {
			if (!this._oNewAppointmentDialog) {
				Fragment.load({
					id: "myDialogFrag",
					name: "sap.m.sample.SinglePlanningCalendar.Create",
					controller: this
				})
				.then(function(oDialogContent){
					this._createDialog(oDialogContent);
					// To set the form input fields values,
					// the Create.fragment.xml must be loaded
					this._setDialogInitialState(oAppStartDate);
				}.bind(this));
			} else {
				this._setDialogInitialState(oAppStartDate);
			}
		},

		_createDialog: function (oDialogContent) {
			var oDateTimePickerStart,
				oDateTimePickerEnd,
				oInputTitle,
				sInputType,
				oInputInfo,
				oNewAppointment,
				oModel,
				aAppointments;

			this._oNewAppointmentDialog = new Dialog({
				title: 'Add appointment',
				content: [
					oDialogContent
				],
				beginButton: new Button({
					text: 'Create',
					enabled: false,
					press: function () {
						oDateTimePickerStart = Fragment.byId("myDialogFrag", "startDate").getDateValue();
						oDateTimePickerEnd = Fragment.byId("myDialogFrag", "endDate").getDateValue();
						oInputTitle = Fragment.byId("myDialogFrag", "appTitle");
						sInputType = Fragment.byId("myDialogFrag", "appType").getSelectedItem().getText();
						oInputInfo = Fragment.byId("myDialogFrag", "moreInfo");

						if (Fragment.byId("myDialogFrag", "startDate").getValueState() !== "Error"
							&& Fragment.byId("myDialogFrag", "endDate").getValueState() !== "Error") {

							oNewAppointment = {
								title: oInputTitle.getValue(),
								text: oInputInfo.getValue(),
								type: sInputType,
								startDate: oDateTimePickerStart,
								endDate: oDateTimePickerEnd
							};

							oModel = this.getView().getModel();
							aAppointments = oModel.getData().appointments;
							aAppointments.push(oNewAppointment);
							oModel.updateBindings();

							this._oNewAppointmentDialog.close();
						}
					}.bind(this)
				}),
				endButton: new Button({
					text: 'Close',
					press: function () {
						this._oNewAppointmentDialog.close();
					}.bind(this)
				})
			});

			this._oNewAppointmentDialog.addStyleClass("sapUiContentPadding");
			this.getView().addDependent(this._oNewAppointmentDialog);
		},

		/*
		 * Sets the default values of the fields in the dialog.
		 */
		_setDialogInitialState: function(oAppStartDate) {
			var oInputTitle = Fragment.byId("myDialogFrag", "appTitle"),
				oDateTimePickerStart = Fragment.byId("myDialogFrag", "startDate"),
				oDateTimePickerEnd =  Fragment.byId("myDialogFrag", "endDate"),
				oInputInfo = Fragment.byId("myDialogFrag", "moreInfo"),
				oBeginButton = this._oNewAppointmentDialog.getBeginButton(),
				oEndDate = new Date(oAppStartDate);

			oInputTitle.setValue("");
			oDateTimePickerStart.setDateValue(oAppStartDate);
			// Default end hour is an hour later than the start hour
			oEndDate.setHours(oEndDate.getHours() + 1);
			oDateTimePickerEnd.setDateValue(oEndDate);

			oDateTimePickerStart.setValueState("None");
			oDateTimePickerEnd.setValueState("None");
			oInputInfo.setValue("");

			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, oBeginButton);
			this._oNewAppointmentDialog.open();
		},

		handleDetailsDateChange: function (oEvent) {
			this._dateChange(oEvent, "myPopoverFrag", this._oDetailsPopover.getBeginButton());
		},

		handleCreateDateChange: function (oEvent) {
			this._dateChange(oEvent, "myDialogFrag", this._oNewAppointmentDialog.getBeginButton());
		},

		_dateChange: function(oEvent, sFragmentId, oSubmitButton) {
			var oDateTimePickerStart = Fragment.byId(sFragmentId, "startDate"),
				oDateTimePickerEnd = Fragment.byId(sFragmentId, "endDate");

			// Check if the DateTimePicker for the start date is changed and
			// apply this date incremented by one hour in the DateTimePicker for the end date.
			if (sap.ui.getCore().byId(oEvent.getParameter("id")) === oDateTimePickerStart) {
				var oEndDate = new Date(oDateTimePickerStart.getDateValue().getTime());
				oEndDate.setHours(oEndDate.getHours() + 1);
				oDateTimePickerEnd.setDateValue(oEndDate);
			}
			this._validateDateTimePicker(oDateTimePickerStart, oDateTimePickerEnd);
			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, oSubmitButton);
		},

		_validateDateTimePicker: function (oDateTimePickerStart, oDateTimePickerEnd) {
			var oStartDate = oDateTimePickerStart.getDateValue(),
				oEndDate = oDateTimePickerEnd.getDateValue(),
				sValueStateText = "Start date should be before End date";

			if (oStartDate && oEndDate && oEndDate.getTime() <= oStartDate.getTime()) {
				oDateTimePickerStart.setValueState("Error");
				oDateTimePickerEnd.setValueState("Error");
				oDateTimePickerStart.setValueStateText(sValueStateText);
				oDateTimePickerEnd.setValueStateText(sValueStateText);
			} else {
				oDateTimePickerStart.setValueState("None");
				oDateTimePickerEnd.setValueState("None");
			}
		},

		updateButtonEnabledState: function (oDateTimePickerStart, oDateTimePickerEnd, oButton) {
			var bEnabled = oDateTimePickerStart.getValueState() !== "Error"
				&& oDateTimePickerStart.getValue() !== ""
				&& oDateTimePickerEnd.getValue() !== ""
				&& oDateTimePickerEnd.getValueState() !== "Error";

			oButton.setEnabled(bEnabled);
		},

		handleOkButton: function () {
			var sTitleValue = Fragment.byId("myPopoverFrag", "appTitle").getValue(),
				sTypeValue = Fragment.byId("myPopoverFrag", "appType").getSelectedItem().getKey(),
				oStartValue = Fragment.byId("myPopoverFrag", "startDate").getDateValue(),
				oEndValue = Fragment.byId("myPopoverFrag", "endDate").getDateValue(),
				sInfoValue = Fragment.byId("myPopoverFrag", "moreInfo").getValue(),
				sAppointmentPath = this._oDetailsPopover.getBindingContext().sPath,
				oModel = this.getView().getModel();

			oModel.setProperty(sAppointmentPath + "/title", sTitleValue);
			oModel.setProperty(sAppointmentPath + "/type", sTypeValue);
			oModel.setProperty(sAppointmentPath + "/startDate", oStartValue);
			oModel.setProperty(sAppointmentPath + "/endDate", oEndValue);
			oModel.setProperty(sAppointmentPath + "/text", sInfoValue);
			this._oDetailsPopover.close();
		},

		handleCancelButton: function () {
			this._oDetailsPopover.close();
		},

		handleStartDateChange: function (oEvent) {
			var oStartDate = oEvent.getParameter("date");
			MessageToast.show("'startDateChange' event fired.\n\nNew start date is "  + oStartDate.toString());
		}
	});

	return PageController;
});