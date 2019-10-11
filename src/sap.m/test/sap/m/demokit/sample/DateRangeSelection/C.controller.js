sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/library"
], function(Controller, JSONModel, CoreLibrary) {
	"use strict";

	var ValueState = CoreLibrary.ValueState;

	return Controller.extend("sap.m.sample.DateRangeSelection.C", {

		onInit: function () {
			var dateFrom = new Date(),
				dateTo = new Date(),
				oModel = new JSONModel();

			dateFrom.setUTCDate(2);
			dateFrom.setUTCMonth(1);
			dateFrom.setUTCFullYear(2014);

			dateTo.setUTCDate(17);
			dateTo.setUTCMonth(1);
			dateTo.setUTCFullYear(2014);

			oModel.setData({
				delimiterDRS1: "@",
				dateValueDRS1: dateFrom,
				secondDateValueDRS1: dateTo,
				dateFormatDRS1: "yyyy/MM/dd",
				dateValueDRS2: new Date(2016, 1, 16),
				secondDateValueDRS2: new Date(2016, 1, 18),
				dateMinDRS2: new Date(2016, 0, 1),
				dateMaxDRS2: new Date(2016, 11, 31)
			});
			this.getView().setModel(oModel);

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
