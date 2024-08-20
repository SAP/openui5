sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/date/UI5Date"
],
function(Controller, JSONModel, MessageToast, UI5Date) {
	"use strict";


	return Controller.extend("sap.m.sample.SinglePlanningCalendarRecurringItem.Page", {

		onInit: function() {

			var oModel = new JSONModel();
			oModel.setData({
					startDate: UI5Date.getInstance("2019", "8", "1"),
					nonWorkingPeriods: [
							{
								recurrenceType: "Daily",
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								recurrencePattern: 1,
								date: UI5Date.getInstance(2019, 8 ,1),
								start: "12:55",
								end:"13:15",
								valueFormat:"HH:mm"
							},
							{
								recurrenceType: "Daily",
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								recurrencePattern: 1,
								date: UI5Date.getInstance(2019, 8 ,1),
								start: "16:30",
								end:"16:45",
								valueFormat:"HH:mm"
							}
					]
			});

			this.getView().setModel(oModel);

			oModel = new JSONModel();
			oModel.setData({allDay: false});
			this.getView().setModel(oModel, "allDay");
		},

		handleViewChange: function () {
			MessageToast.show("'viewChange' event fired.");
		}

	});
});
