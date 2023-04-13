sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/library",
	"sap/ui/core/date/UI5Date"
], function(Controller, JSONModel, CoreLibrary, UI5Date) {
	"use strict";

	var ValueState = CoreLibrary.ValueState;

	return Controller.extend("sap.m.sample.DateRangeSelection.C", {

		onInit: function () {
			var oDRS2 = this.byId("DRS2"),
				dateFrom = UI5Date.getInstance(),
				dateTo = UI5Date.getInstance(),
				oModel = new JSONModel();

			dateFrom.setUTCDate(2);
			dateFrom.setUTCMonth(1);
			dateFrom.setUTCFullYear(2014);

			dateTo.setUTCDate(17);
			dateTo.setUTCMonth(1);
			dateTo.setUTCFullYear(2014);

			oModel.setData({
				start: dateFrom,
				end: dateTo,

				oDRS2Start: UI5Date.getInstance(2016, 1, 16),
				oDRS2End: UI5Date.getInstance(2016, 1, 18),

				oDRS3Start: UI5Date.getInstance(2014, 1, 2),
				oDRS3End: UI5Date.getInstance(2014, 1, 17),

				oDRS4Start: UI5Date.getInstance(2019, 3, 2),
				oDRS4End: UI5Date.getInstance(2019, 9, 17),

				oDRS5Start: UI5Date.getInstance(2009, 1, 2),
				oDRS5End: UI5Date.getInstance(2015, 1, 17)
			});
			this.getView().setModel(oModel);

			oDRS2.setMinDate(UI5Date.getInstance(2016, 0, 1));
			oDRS2.setMaxDate(UI5Date.getInstance(2016, 11, 31));

			this._iEvent = 0;
		},

		handleChange: function (oEvent) {
			var sFrom = oEvent.getParameter("from"),
				sTo = oEvent.getParameter("to"),
				bValid = oEvent.getParameter("valid"),
				oEventSource = oEvent.getSource(),
				oText = this.byId("TextEvent");

			this._iEvent++;

			oText.setText("Id: " + oEventSource.getId() + "\nFrom: " + sFrom + "\nTo: " + sTo);

			if (bValid) {
				oEventSource.setValueState(ValueState.None);
			} else {
				oEventSource.setValueState(ValueState.Error);
			}
		}

	});

});
