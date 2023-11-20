sap.ui.define([
	"sap/m/SinglePlanningCalendarView"
], function(SinglePlanningCalendarView) {
	"use strict";

	return SinglePlanningCalendarView.extend("sap.m.sample.SinglePlanningCalendarWithCustomViews.CustomTenDaysView", {
		getEntityCount: function () {
			return 10;
		},

		getScrollEntityCount: function () {
			return 10;
		},

		calculateStartDate: function (oStartDate) {
			return oStartDate;
		}
	});

});
