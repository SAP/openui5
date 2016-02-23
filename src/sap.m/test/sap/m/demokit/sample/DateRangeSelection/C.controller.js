sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.DateRangeSelection.C", {

		onInit: function () {
			var dateFrom = new Date();
			dateFrom.setUTCDate(2);
			dateFrom.setUTCMonth(1);
			dateFrom.setUTCFullYear(2014);

			var dateTo = new Date();
			dateTo.setUTCDate(17);
			dateTo.setUTCMonth(1);
			dateTo.setUTCFullYear(2014);

			var oModel = new JSONModel();
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
			var sFrom = oEvent.getParameter("from");
			var sTo = oEvent.getParameter("to");
			var bValid = oEvent.getParameter("valid");

			this._iEvent++;

			var oText = this.byId("TextEvent");
			oText.setText("Id: " + oEvent.oSource.getId() + "\nFrom: " + sFrom + "\nTo: " + sTo);

			var oDRS = oEvent.oSource;
			if (bValid) {
				oDRS.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDRS.setValueState(sap.ui.core.ValueState.Error);
			}
		}

	});

	return CController;

});
