sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library",
	"sap/m/library",
	"sap/m/MessageToast"
],
function(coreLibrary, Fragment, Controller, DateFormat, JSONModel, unifiedLibrary, mobileLibrary, MessageToast) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var ValueState = coreLibrary.ValueState;
	var StickyMode = mobileLibrary.PlanningCalendarStickyMode;

	return Controller.extend("sap.m.sample.SinglePlanningCalendar.Page", {

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
						title: "Discussion with clients regarding our new purpose",
						text: "room 234 and Online meeting",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						startDate: new Date("2018", "6", "8", "10", "0"),
						endDate: new Date("2018", "6", "8", "11", "30")
					}, {
						title: "Discussion of the plan",
						text: "Online meeting with partners and colleagues",
						type: CalendarDayType.Type01,
						icon: "sap-icon://home",
						tentative: true,
						startDate: new Date("2018", "6", "8", "11", "30"),
						endDate: new Date("2018", "6", "8", "13", "00")
					}, {
						title: "Discussion with clients",
						type: CalendarDayType.Type08,
						icon: "sap-icon://home",
						startDate: new Date("2018", "6", "8", "12", "30"),
						endDate: new Date("2018", "6", "8", "13", "15")
					}, {
						title: "Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "8", "13", "9"),
						endDate: new Date("2018", "6", "8", "13", "9")
					}, {
						title: "Meeting with the HR",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "8", "14", "0"),
						endDate: new Date("2018", "6", "8", "14", "15")
					}, {
						title: "Call with customer",
						type: CalendarDayType.Type08,
						startDate: new Date("2018", "6", "8", "14", "15"),
						endDate: new Date("2018", "6", "8", "14", "30")
					}, {
						title: "Prepare documentation",
						text: "At my desk",
						icon: "sap-icon://meeting-room",
						type: CalendarDayType.Type03,
						startDate: new Date("2018", "6", "8", "14", "10"),
						endDate: new Date("2018", "6", "8", "15", "30")
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
						title: "Discussion with clients for the new release dates",
						text: "Online meeting",
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
				],
				supportedAppointmentItems: [
					{
						text: "Team Meeting",
						type: CalendarDayType.Type01
					},
					{
						text: "Personal",
						type: CalendarDayType.Type05
					},
					{
						text: "Discussions",
						type: CalendarDayType.Type08
					},
					{
						text: "Out of office",
						type: CalendarDayType.Type09
					},
					{
						text: "Private meeting",
						type: CalendarDayType.Type03
					}
				]
			});

			this.getView().setModel(oModel);

			oModel = new JSONModel();
			oModel.setData({allDay: false});
			this.getView().setModel(oModel, "allDay");

			oModel = new JSONModel();
			oModel.setData({ stickyMode: StickyMode.None, enableAppointmentsDragAndDrop: true, enableAppointmentsResize: true, enableAppointmentsCreate: true });
			this.getView().setModel(oModel, "settings");
		},

		_typeFormatter: function(sType) {
			var sTypeText = "",
				aTypes = this.getView().getModel().getData().supportedAppointmentItems;

			for (var  i = 0; i < aTypes.length; i++){
				if (aTypes[i].type === sType){
					sTypeText = aTypes[i].text;
				}
			}

			if (sTypeText !== ""){
				return sTypeText;
			} else {
				return sType;
			}
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

			MessageToast.show("Appointment with title \n'"
				+ sAppointmentTitle
				+ "'\n has been created"
			);
		},

		handleViewChange: function () {
			MessageToast.show("'viewChange' event fired.");
		},

		handleAppointmentSelect: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate,
				oEndDate,
				oTrimmedStartDate,
				oTrimmedEndDate,
				bAllDate,
				oModel,
				oView = this.getView();

			if (oAppointment === undefined) {
				return;
			}

			oStartDate = oAppointment.getStartDate();
			oEndDate = oAppointment.getEndDate();
			oTrimmedStartDate = new Date(oStartDate);
			oTrimmedEndDate = new Date(oEndDate);
			bAllDate = false;
			oModel = this.getView().getModel("allDay");

			if (!oAppointment.getSelected() && this._pDetailsPopover) {
				this._pDetailsPopover.then(function(oResponsivePopover){
					oResponsivePopover.close();
				});
				return;
			}

			this._setHoursToZero(oTrimmedStartDate);
			this._setHoursToZero(oTrimmedEndDate);

			if (oStartDate.getTime() === oTrimmedStartDate.getTime() && oEndDate.getTime() === oTrimmedEndDate.getTime()) {
				bAllDate = true;
			}

			oModel.getData().allDay = bAllDate;
			oModel.updateBindings();

			if (!this._pDetailsPopover) {
				this._pDetailsPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.SinglePlanningCalendar.Details",
					controller: this
				}).then(function(oResponsivePopover){
					oView.addDependent(oResponsivePopover);
					return oResponsivePopover;
				});
			}
			this._pDetailsPopover.then(function (oResponsivePopover) {
				oResponsivePopover.setBindingContext(oAppointment.getBindingContext());
				oResponsivePopover.openBy(oAppointment);
			});
		},

		handleMoreLinkPress: function(oEvent) {
			var oDate = oEvent.getParameter("date"),
				oSinglePlanningCalendar = this.getView().byId("SPC1");

			oSinglePlanningCalendar.setSelectedView(oSinglePlanningCalendar.getViews()[2]); // DayView

			this.getView().getModel().setData({ startDate: oDate }, true);
		},

		handleEditButton: function () {
			// The sap.m.Popover has to be closed before the sap.m.Dialog gets opened
			var oDetailsPopover = this.byId("detailsPopover");
			oDetailsPopover.close();
			this.sPath = oDetailsPopover.getBindingContext().getPath();
			this._arrangeDialogFragment("Edit appointment");
		},

		handlePopoverDeleteButton: function () {
			var oModel = this.getView().getModel(),
				oAppointments = oModel.getData().appointments,
				oDetailsPopover = this.byId("detailsPopover"),
				oAppointment = oDetailsPopover._getBindingContext().getObject();

			oDetailsPopover.close();

			oAppointments.splice(oAppointments.indexOf(oAppointment), 1);
			oModel.updateBindings();
		},

		_arrangeDialogFragment: function (sTitle) {
			var oView = this.getView();

			if (!this._pNewAppointmentDialog) {
				this._pNewAppointmentDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.SinglePlanningCalendar.Modify",
					controller: this
				}).then(function(oNewAppointmentDialog){
					oView.addDependent(oNewAppointmentDialog);
					return oNewAppointmentDialog;
				});
			}

			this._pNewAppointmentDialog.then(function(oNewAppointmentDialog) {
				this._arrangeDialog(sTitle, oNewAppointmentDialog);
			}.bind(this));
		},

		_arrangeDialog: function (sTitle, oNewAppointmentDialog) {
			this._setValuesToDialogContent(oNewAppointmentDialog);
			oNewAppointmentDialog.setTitle(sTitle);
			oNewAppointmentDialog.open();
		},

		_setValuesToDialogContent: function (oNewAppointmentDialog) {
			var oAllDayAppointment = this.byId("allDay"),
				sStartDatePickerID = oAllDayAppointment.getSelected() ? "DPStartDate" : "DTPStartDate",
				sEndDatePickerID = oAllDayAppointment.getSelected() ? "DPEndDate" : "DTPEndDate",
				oTitleControl = this.byId("appTitle"),
				oTextControl = this.byId("moreInfo"),
				oTypeControl = this.byId("appType"),
				oStartDateControl = this.byId(sStartDatePickerID),
				oEndDateControl = this.byId(sEndDatePickerID),
				oEmptyError = {errorState:false, errorMessage: ""},
				oContext,
				oContextObject,
				oSPCStartDate,
				sTitle,
				sText,
				oStartDate,
				oEndDate,
				sType;


			if (this.sPath) {
				oContext = this.byId("detailsPopover").getBindingContext();
				oContextObject = oContext.getObject();
				sTitle = oContextObject.title;
				sText = oContextObject.text;
				oStartDate = oContextObject.startDate;
				oEndDate = oContextObject.endDate;
				sType = oContextObject.type;
			} else {
				sTitle = "";
				sText = "";
				if (this._oChosenDayData) {
					oStartDate = this._oChosenDayData.start;
					oEndDate = this._oChosenDayData.end;

					delete this._oChosenDayData;
				} else {
					oSPCStartDate = this.getView().byId("SPC1").getStartDate();
					oStartDate = new Date(oSPCStartDate);
					oStartDate.setHours(this._getDefaultAppointmentStartHour());
					oEndDate = new Date(oSPCStartDate);
					oEndDate.setHours(this._getDefaultAppointmentEndHour());
				}
				oAllDayAppointment.setSelected(false);
				sType = "Type01";
			}

			oTitleControl.setValue(sTitle);
			oTextControl.setValue(sText);
			oStartDateControl.setDateValue(oStartDate);
			oEndDateControl.setDateValue(oEndDate);
			oTypeControl.setSelectedKey(sType);
			this._setDateValueState(oStartDateControl, oEmptyError);
			this._setDateValueState(oEndDateControl, oEmptyError);
			this.updateButtonEnabledState(oStartDateControl, oEndDateControl, oNewAppointmentDialog.getBeginButton());
		},

		handleDialogOkButton: function () {
			var bAllDayAppointment = (this.byId("allDay")).getSelected(),
				sStartDate = bAllDayAppointment ? "DPStartDate" : "DTPStartDate",
				sEndDate = bAllDayAppointment ? "DPEndDate" : "DTPEndDate",
				sTitle = this.byId("appTitle").getValue(),
				sText = this.byId("moreInfo").getValue(),
				sType = this.byId("appType").getSelectedItem().getKey(),
				oStartDate = this.byId(sStartDate).getDateValue(),
				oEndDate = this.byId(sEndDate).getDateValue(),
				oModel = this.getView().getModel(),
				sAppointmentPath;

			if (this.byId(sStartDate).getValueState() !== ValueState.Error
				&& this.byId(sEndDate).getValueState() !== ValueState.Error) {

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

				this.byId("modifyDialog").close();
			}
		},

		formatDate: function (oDate) {
			if (oDate) {
				var iHours = oDate.getHours(),
					iMinutes = oDate.getMinutes(),
					iSeconds = oDate.getSeconds();

				if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
					return DateFormat.getDateTimeInstance({ style: "medium" }).format(oDate);
				} else  {
					return DateFormat.getDateInstance({ style: "medium" }).format(oDate);
				}
			}
		},

		handleDialogCancelButton:  function () {
			this.sPath = null;
			this.byId("modifyDialog").close();
		},

		handleCheckBoxSelect: function (oEvent) {
			var bSelected = oEvent.getSource().getSelected(),
				sStartDatePickerID = bSelected ? "DTPStartDate" : "DPStartDate",
				sEndDatePickerID = bSelected ? "DTPEndDate" : "DPEndDate",
				oOldStartDate = this.byId(sStartDatePickerID).getDateValue(),
				oNewStartDate = new Date(oOldStartDate),
				oOldEndDate = this.byId(sEndDatePickerID).getDateValue(),
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
			this.byId(sStartDatePickerID).setDateValue(oNewStartDate);
			this.byId(sEndDatePickerID).setDateValue(oNewEndDate);
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
			this._oChosenDayData = {start: oStartDate, end: oEndDate };
			this.sPath = null;

			this._arrangeDialogFragment("Create appointment");
		},

		handleStartDateChange: function (oEvent) {
			var oStartDate = oEvent.getParameter("date");
			MessageToast.show("'startDateChange' event fired.\n\nNew start date is "  + oStartDate.toString());
		},

		updateButtonEnabledState: function (oDateTimePickerStart, oDateTimePickerEnd, oButton) {
			var bEnabled = oDateTimePickerStart.getValueState() !== ValueState.Error
				&& oDateTimePickerStart.getValue() !== ""
				&& oDateTimePickerEnd.getValue() !== ""
				&& oDateTimePickerEnd.getValueState() !== ValueState.Error;

			oButton.setEnabled(bEnabled);
		},

		handleDateTimePickerChange: function(oEvent) {
			var oDateTimePickerStart = this.byId("DTPStartDate"),
				oDateTimePickerEnd = this.byId("DTPEndDate"),
				oStartDate = oDateTimePickerStart.getDateValue(),
				oEndDate = oDateTimePickerEnd.getDateValue(),
				oErrorState = {errorState: false, errorMessage: ""};

			if (!oStartDate){
				oErrorState.errorState = true;
				oErrorState.errorMessage = "Please pick a date";
				this._setDateValueState(oDateTimePickerStart, oErrorState);
			} else if (!oEndDate){
				oErrorState.errorState = true;
				oErrorState.errorMessage = "Please pick a date";
				this._setDateValueState(oDateTimePickerEnd, oErrorState);
			} else if (!oEvent.getParameter("valid")){
				oErrorState.errorState = true;
				oErrorState.errorMessage = "Invalid date";
				if (oEvent.getSource() === oDateTimePickerStart){
					this._setDateValueState(oDateTimePickerStart, oErrorState);
				} else {
					this._setDateValueState(oDateTimePickerEnd, oErrorState);
				}
			} else if (oStartDate && oEndDate && (oEndDate.getTime() <= oStartDate.getTime())){
				oErrorState.errorState = true;
				oErrorState.errorMessage = "Start date should be before End date";
				this._setDateValueState(oDateTimePickerStart, oErrorState);
				this._setDateValueState(oDateTimePickerEnd, oErrorState);
			} else {
				this._setDateValueState(oDateTimePickerStart, oErrorState);
				this._setDateValueState(oDateTimePickerEnd, oErrorState);
			}

			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, this.byId("modifyDialog").getBeginButton());
		},

		handleDatePickerChange: function () {
			var oDatePickerStart = this.byId("DPStartDate"),
				oDatePickerEnd = this.byId("DPEndDate"),
				oStartDate = oDatePickerStart.getDateValue(),
				oEndDate = oDatePickerEnd.getDateValue(),
				bEndDateBiggerThanStartDate = oEndDate.getTime() < oStartDate.getTime(),
				oErrorState = {errorState: false, errorMessage: ""};

			if (oStartDate && oEndDate && bEndDateBiggerThanStartDate){
				oErrorState.errorState = true;
				oErrorState.errorMessage = "Start date should be before End date";
			}
			this._setDateValueState(oDatePickerStart, oErrorState);
			this._setDateValueState(oDatePickerEnd, oErrorState);
			this.updateButtonEnabledState(oDatePickerStart, oDatePickerEnd, this.byId("modifyDialog").getBeginButton());
		},

		_setDateValueState: function(oPicker, oErrorState) {
			if (oErrorState.errorState) {
				oPicker.setValueState(ValueState.Error);
				oPicker.setValueStateText(oErrorState.errorMessage);
			} else {
				oPicker.setValueState(ValueState.None);
			}
		},

		handleOpenLegend: function (oEvent) {
			var oSource = oEvent.getSource(),
				oView = this.getView();

			if (!this._pLegendPopover) {
				this._pLegendPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.SinglePlanningCalendar.Legend",
					controller: this
				}).then(function(oLegendPopover) {
					oView.addDependent(oLegendPopover);
					return oLegendPopover;
				});
			}

			this._pLegendPopover.then(function(oLegendPopover) {
				if (oLegendPopover.isOpen()){
					oLegendPopover.close();
				} else {
					oLegendPopover.openBy(oSource);
				}
			});
		}
	});
});
