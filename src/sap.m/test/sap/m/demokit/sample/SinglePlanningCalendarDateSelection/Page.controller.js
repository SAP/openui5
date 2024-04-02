sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/ui/unified/DateRange",
	"sap/ui/core/date/UI5Date"
],
function(coreLibrary, Fragment, Controller, DateFormat, JSONModel, unifiedLibrary, mobileLibrary, MessageToast, DateRange, UI5Date) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var ValueState = coreLibrary.ValueState;
	var SinglePlanningCalendarSelectionMode = mobileLibrary.SinglePlanningCalendarSelectionMode;

	return Controller.extend("sap.m.sample.SinglePlanningCalendarDateSelection.Page", {

		onInit: function() {

			var oModel = new JSONModel();
			oModel.setData({
					startDate: UI5Date.getInstance("2018", "6", "9"),
					appointments: [
						{
							title: "Discussion of the plan",
							type: CalendarDayType.Type01,
							startDate: UI5Date.getInstance(),
							endDate: UI5Date.getInstance()
						},
						{
						title: "Meet John Miller",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "8", "5", "0"),
						endDate: UI5Date.getInstance("2018", "6", "8", "6", "0")
					}, {
						title: "Lunch",
						text: "canteen",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "8", "7", "0"),
						endDate: UI5Date.getInstance("2018", "6", "8", "8", "0")
					}, {
						title: "New Product",
						text: "room 105",
						type: CalendarDayType.Type01,
						icon: "sap-icon://meeting-room",
						startDate: UI5Date.getInstance("2018", "6", "8", "8", "0"),
						endDate: UI5Date.getInstance("2018", "6", "8", "9", "0")
					}, {
						title: "Discussion with clients for the new release dates",
						text: "Online meeting",
						type: CalendarDayType.Type08,
						startDate: UI5Date.getInstance("2018", "6", "9", "9", "0"),
						endDate: UI5Date.getInstance("2018", "6", "9", "10", "0")
					},  {
						title:"Meeting with the manager",
						type: CalendarDayType.Type03,
						startDate: UI5Date.getInstance("2018", "6", "6", "9", "0"),
						endDate: UI5Date.getInstance("2018", "6", "6", "10", "0")
					}, {
						title:"Daily standup meeting",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "7", "10", "0"),
						endDate: UI5Date.getInstance("2018", "6", "7", "10", "30")
					}, {
						title:"Private meeting",
						type: CalendarDayType.Type03,
						startDate: UI5Date.getInstance("2018", "6", "6", "11", "30"),
						endDate: UI5Date.getInstance("2018", "6", "6", "12", "0")
					}, {
						title:"Lunch",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "6", "12", "0"),
						endDate: UI5Date.getInstance("2018", "6", "6", "13", "0")
					}, {
						title:"Discussion of the plan",
						type: CalendarDayType.Type01,
						startDate: UI5Date.getInstance("2018", "6", "16", "11", "0"),
						endDate: UI5Date.getInstance("2018", "6", "16", "12", "0")
					}, {
						title:"Lunch",
						text: "canteen",
						type: CalendarDayType.Type05,
						startDate: UI5Date.getInstance("2018", "6", "16", "12", "0"),
						endDate: UI5Date.getInstance("2018", "6", "16", "13", "0")
					}
				]
			});

			this.getView().setModel(oModel);

			oModel = new JSONModel();
			oModel.setData({allDay: false});
			this.getView().setModel(oModel, "allDay");
		},

		onPress: function (oEvent) {
			var oSPC = this.byId("SPC1"),
				oButton = this.byId("MultiSelect");
			if (oSPC.getDateSelectionMode() ===  SinglePlanningCalendarSelectionMode.SingleSelect) {
				oSPC.setDateSelectionMode(SinglePlanningCalendarSelectionMode.MultiSelect);
			} else {
				oSPC.setDateSelectionMode(SinglePlanningCalendarSelectionMode.SingleSelect);
			}
			if (oEvent.getParameter("pressed")) {
				oButton.setTooltip("Disable multi-day selection");
			} else {
				oButton.setTooltip("Enable multi-day selection");
			}
		},

		handleViewChange: function () {
			MessageToast.show("'viewChange' event fired.");
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

		handleWeekSelection: function (oEvent) {
			const iWeekNumber = oEvent.getParameter("weekNumber");

			MessageToast.show("'weekNumberPress' event fired.\n\nweek number is "  + iWeekNumber);
		},

		handleSelectedDateChange: function (oEvent) {
			const aCurrentSelectedDates = oEvent.getParameter("selectedDates");
			let sOutput = "";

			aCurrentSelectedDates?.forEach((oRange, iIndex) => {
				sOutput += `${iIndex + 1}: ${oRange.getStartDate().toDateString()}\n`;
			});

			sOutput.trim();
			MessageToast.show(`'selectedDatesChange' event fired.\n\nNew selected dates: \n${sOutput}`);
		},

		_setDateValueState: function(oPicker, oErrorState) {
			if (oErrorState.errorState) {
				oPicker.setValueState(ValueState.Error);
				oPicker.setValueStateText(oErrorState.errorMessage);
			} else {
				oPicker.setValueState(ValueState.None);
			}
		}
	});
});
