sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/library"
], function(Controller, JSONModel, CoreLibrary) {
	"use strict";

	var ValueState = CoreLibrary.ValueState;

	return Controller.extend("sap.m.sample.DateRangeSelection.C", {

		onInit: function () {
			var oDRS2 = this.byId("DRS2"),
				dateFrom = new Date(),
				dateTo = new Date(),
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

				oDRS2Start: new Date(2016, 1, 16),
				oDRS2End: new Date(2016, 1, 18),

				oDRS3Start: new Date(2014, 1, 2),
				oDRS3End: new Date(2014, 1, 17),

				oDRS4Start: new Date(2019, 3, 2),
				oDRS4End: new Date(2019, 9, 17),

				oDRS5Start: new Date(2009, 1, 2),
				oDRS5End: new Date(2015, 1, 17)
			});
			this.getView().setModel(oModel);

			oDRS2.setMinDate(new Date(2016, 0, 1));
			oDRS2.setMaxDate(new Date(2016, 11, 31));

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
