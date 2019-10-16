sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library",
	"sap/m/MessageToast"
],
function(Fragment, Controller, DateFormat, JSONModel, unifiedLibrary, MessageToast) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;

	return Controller.extend("sap.m.sample.SinglePlanningCalendarCreateApp.Page", {

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
			oModel.setData({allDay: false});
			this.getView().setModel(oModel, "allDay");
		},

		onExit: function () {
			this.sPath = null;
			if (this._oDetailsPopover) {
				this._oDetailsPopover.destroy();
			}
			if (this._oNewAppointmentDialog) {
				this._oNewAppointmentDialog.destroy();
			}
		},

		handleAppointmentSelect: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate,
				oEndDate,
				oTrimmedStartDate,
				oTrimmedEndDate,
				bAllDate,
				oModel;

			if (!oAppointment || !oAppointment.getSelected()){
				if (this._oDetailsPopover){
					this._oDetailsPopover.close();
				}
				return;
			}

			oStartDate = oAppointment.getStartDate();
			oEndDate = oAppointment.getEndDate();
			oTrimmedStartDate = new Date(oStartDate);
			oTrimmedEndDate = new Date(oEndDate);
			bAllDate = false;
			oModel = this.getView().getModel("allDay");

			this._setHoursToZero(oTrimmedStartDate);
			this._setHoursToZero(oTrimmedEndDate);

			if (oStartDate.getTime() === oTrimmedStartDate.getTime() && oEndDate.getTime() === oTrimmedEndDate.getTime()) {
				bAllDate = true;
			}

			oModel.getData().allDay = bAllDate;
			oModel.updateBindings();

			if (!this._oDetailsPopover) {
				Fragment.load({
					id: "popoverFrag",
					name: "sap.m.sample.SinglePlanningCalendarCreateApp.Details",
					controller: this
				})
				.then(function(oPopoverContent){
					this._oDetailsPopover = oPopoverContent;
					this._oDetailsPopover.setBindingContext(oAppointment.getBindingContext());
					this.getView().addDependent(this._oDetailsPopover);
					this._oDetailsPopover.openBy(oAppointment);
				}.bind(this));
			} else {
				this._oDetailsPopover.setBindingContext(oAppointment.getBindingContext());
				this._oDetailsPopover.openBy(oAppointment);
			}
		},

		handleEditButton: function () {
			// The sap.m.Popover has to be closed before the sap.m.Dialog gets opened
			this._oDetailsPopover.close();
			this.sPath = this._oDetailsPopover.getBindingContext().getPath();
			this._arrangeDialogFragment("Edit appointment");
		},

		handlePopoverDeleteButton: function () {
			var oModel = this.getView().getModel(),
				oAppointments = oModel.getData().appointments,
				oAppointment = this._oDetailsPopover._getBindingContext().getObject();

			this._oDetailsPopover.close();

			oAppointments.splice(oAppointments.indexOf(oAppointment), 1);
			oModel.updateBindings();
		},

		_arrangeDialogFragment: function (sTitle) {
			if (!this._oNewAppointmentDialog) {
				Fragment.load({
					id: "dialogFrag",
					name: "sap.m.sample.SinglePlanningCalendarCreateApp.Modify",
					controller: this
				})
				.then(function(oDialog){
					this._oNewAppointmentDialog = oDialog;
					this.getView().addDependent(this._oNewAppointmentDialog);
					this._arrangeDialog(sTitle);
				}.bind(this));
			} else {
				this._arrangeDialog(sTitle);
			}
		},

		_arrangeDialog: function (sTitle) {
			this._setValuesToDialogContent();
			this._oNewAppointmentDialog.setTitle(sTitle);
			this._oNewAppointmentDialog.open();
		},

		_setValuesToDialogContent: function () {
			var bAllDayAppointment = (Fragment.byId("dialogFrag", "allDay")).getSelected(),
				sStartDatePickerID = bAllDayAppointment ? "DPStartDate" : "DTPStartDate",
				sEndDatePickerID = bAllDayAppointment ? "DPEndDate" : "DTPEndDate",
				oTitleControl = Fragment.byId("dialogFrag", "appTitle"),
				oTextControl = Fragment.byId("dialogFrag", "moreInfo"),
				oTypeControl = Fragment.byId("dialogFrag", "appType"),
				oStartDateControl = Fragment.byId("dialogFrag", sStartDatePickerID),
				oEndDateControl = Fragment.byId("dialogFrag", sEndDatePickerID),
				oContext,
				oContextObject,
				oSPCStartDate,
				sTitle,
				sText,
				oStartDate,
				oEndDate,
				sType;


			if (this.sPath) {
				oContext = this._oDetailsPopover.getBindingContext();
				oContextObject = oContext.getObject();
				sTitle = oContextObject.title;
				sText = oContextObject.text;
				oStartDate = oContextObject.startDate;
				oEndDate = oContextObject.endDate;
				sType = oContextObject.type;
			} else {
				sTitle = "";
				sText = "";
				oSPCStartDate = this.getView().byId("SPC1").getStartDate();
				oStartDate = new Date(oSPCStartDate);
				oStartDate.setHours(this._getDefaultAppointmentStartHour());
				oEndDate = new Date(oSPCStartDate);
				oEndDate.setHours(this._getDefaultAppointmentEndHour());
				sType = "Type01";
			}

			oTitleControl.setValue(sTitle);
			oTextControl.setValue(sText);
			oStartDateControl.setDateValue(oStartDate);
			oEndDateControl.setDateValue(oEndDate);
			oTypeControl.setSelectedKey(sType);
		},

		handleDialogOkButton: function () {
			var bAllDayAppointment = (Fragment.byId("dialogFrag", "allDay")).getSelected(),
				sStartDate = bAllDayAppointment ? "DPStartDate" : "DTPStartDate",
				sEndDate = bAllDayAppointment ? "DPEndDate" : "DTPEndDate",
				sTitle = Fragment.byId("dialogFrag", "appTitle").getValue(),
				sText = Fragment.byId("dialogFrag", "moreInfo").getValue(),
				sType = Fragment.byId("dialogFrag", "appType").getSelectedItem().getText(),
				oStartDate = Fragment.byId("dialogFrag", sStartDate).getDateValue(),
				oEndDate = Fragment.byId("dialogFrag", sEndDate).getDateValue(),
				oModel = this.getView().getModel(),
				sAppointmentPath;

			if (Fragment.byId("dialogFrag", sStartDate).getValueState() !== "Error"
				&& Fragment.byId("dialogFrag", sEndDate).getValueState() !== "Error") {

				if (this.sPath) {
					sAppointmentPath = this.sPath;
					oModel.setProperty(sAppointmentPath + "/title", sTitle);
					oModel.setProperty(sAppointmentPath + "/text", sText);
					oModel.setProperty(sAppointmentPath + "/type", sType);
					oModel.setProperty(sAppointmentPath + "/startDate", oStartDate);
					oModel.setProperty(sAppointmentPath + "/endDate", oEndDate);
				} else {
					oModel.getData().appointments.push({
						title: sTitle,
						text: sText,
						type: sType,
						startDate: oStartDate,
						endDate: oEndDate
					});
				}

				oModel.updateBindings();

				this._oNewAppointmentDialog.close();
			}
		},

		formatDate: function (oDate) {
			var iHours = oDate.getHours(),
				iMinutes = oDate.getMinutes(),
				iSeconds = oDate.getSeconds();

			if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
				return DateFormat.getDateTimeInstance({ style: "medium" }).format(oDate);
			} else  {
				return DateFormat.getDateInstance({ style: "medium" }).format(oDate);
			}
		},

		handleDialogCancelButton:  function () {
			this.sPath = null;
			this._oNewAppointmentDialog.close();
		},

		handleCheckBoxSelect: function (oEvent) {
			var bSelected = oEvent.getSource().getSelected(),
				sStartDatePickerID = bSelected ? "DTPStartDate" : "DPStartDate",
				sEndDatePickerID = bSelected ? "DTPEndDate" : "DPEndDate",
				oOldStartDate = Fragment.byId("dialogFrag", sStartDatePickerID).getDateValue(),
				oNewStartDate = new Date(oOldStartDate),
				oOldEndDate = Fragment.byId("dialogFrag", sEndDatePickerID).getDateValue(),
				oNewEndDate = new Date(oOldEndDate);

			if (!bSelected) {
				oNewStartDate.setHours(this._getDefaultAppointmentStartHour());
				oNewEndDate.setHours(this._getDefaultAppointmentEndHour());
			} else {
				this._setHoursToZero(oNewStartDate);
				this._setHoursToZero(oNewEndDate);
			}

			sStartDatePickerID = !bSelected ? "DTPStartDate" : "DPStartDate";
			sEndDatePickerID = !bSelected ? "DTPEndDate" : "DPEndDate";
			Fragment.byId("dialogFrag", sStartDatePickerID).setDateValue(oNewStartDate);
			Fragment.byId("dialogFrag", sEndDatePickerID).setDateValue(oNewEndDate);
		},

		_getDefaultAppointmentStartHour: function() {
			return 9;
		},

		_getDefaultAppointmentEndHour: function() {
			return 10;
		},

		_setHoursToZero: function (oDate) {
			oDate.setHours(0, 0, 0, 0);
		},

		handleAppointmentCreate: function () {
			this._createInitialDialogValues(this.getView().byId("SPC1").getStartDate());
		},

		handleHeaderDateSelect: function (oEvent) {
			this._createInitialDialogValues(oEvent.getParameter("date"));
		},

		_createInitialDialogValues: function (oDate) {
			var oStartDate = new Date(oDate),
				oEndDate = new Date(oStartDate);

			oStartDate.setHours(this._getDefaultAppointmentStartHour());
			oEndDate.setHours(this._getDefaultAppointmentEndHour());
			this.sPath = null;

			this._arrangeDialogFragment("Create appointment");
		},

		handleStartDateChange: function (oEvent) {
			var oStartDate = oEvent.getParameter("date");
			MessageToast.show("'startDateChange' event fired.\n\nNew start date is "  + oStartDate.toString());
		},

		updateButtonEnabledState: function (oDateTimePickerStart, oDateTimePickerEnd, oButton) {
			var bEnabled = oDateTimePickerStart.getValueState() !== "Error"
				&& oDateTimePickerStart.getValue() !== ""
				&& oDateTimePickerEnd.getValue() !== ""
				&& oDateTimePickerEnd.getValueState() !== "Error";

			oButton.setEnabled(bEnabled);
		},

		handleDateTimePickerChange: function() {
			var oDateTimePickerStart = Fragment.byId("dialogFrag", "DTPStartDate"),
				oDateTimePickerEnd = Fragment.byId("dialogFrag", "DTPEndDate"),
				oStartDate = oDateTimePickerStart.getDateValue(),
				oEndDate = oDateTimePickerEnd.getDateValue(),
				bEndDateBiggerThanStartDate = oEndDate.getTime() <= oStartDate.getTime(),
				bErrorState = oStartDate && oEndDate && bEndDateBiggerThanStartDate;

			this._setDateValueState(oDateTimePickerStart, bErrorState);
			this._setDateValueState(oDateTimePickerEnd, bErrorState);
			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, this._oNewAppointmentDialog.getBeginButton());
		},

		handleDatePickerChange: function () {
			var oDatePickerStart = Fragment.byId("dialogFrag", "DPStartDate"),
				oDatePickerEnd = Fragment.byId("dialogFrag", "DPEndDate"),
				oStartDate = oDatePickerStart.getDateValue(),
				oEndDate = oDatePickerEnd.getDateValue(),
				bEndDateBiggerThanStartDate = oEndDate.getTime() <= oStartDate.getTime(),
				bErrorState = oStartDate && oEndDate && bEndDateBiggerThanStartDate;

			this._setDateValueState(oDatePickerStart, bErrorState);
			this._setDateValueState(oDatePickerEnd, bErrorState);
			this.updateButtonEnabledState(oDatePickerStart, oDatePickerEnd, this._oNewAppointmentDialog.getBeginButton());
		},

		_setDateValueState: function(oPicker, bErrorState) {
			var sValueStateText = "Start date should be before End date";

			if (bErrorState) {
				oPicker.setValueState("Error");
				oPicker.setValueStateText(sValueStateText);
			} else {
				oPicker.setValueState("None");
			}
		}

	});
});
