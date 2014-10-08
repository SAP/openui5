sap.ui.controller("sap.m.sample.DatePicker.Group", {

	onInit: function () {
		// create model
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			dateValue: new Date()
		});
		this.getView().setModel(oModel);

		this.byId("DP3").setDateValue(new Date());

		this._iEvent = 0;

		// for the data binding example do not use the change event for check but the data binding parsing events
		sap.ui.getCore().attachParseError(
				function(oEvent) {
					var oElement = oEvent.getParameter("element");

					if (oElement.setValueState) {
						oElement.setValueState(sap.ui.core.ValueState.Error);
					}
				});

		sap.ui.getCore().attachValidationSuccess(
				function(oEvent) {
					var oElement = oEvent.getParameter("element");

					if (oElement.setValueState) {
						oElement.setValueState(sap.ui.core.ValueState.None);
					}
				});
	},

	handleChange: function (oEvent) {
		var oText = this.byId("T1");
		var oDP = oEvent.oSource;
		var sValue = oEvent.getParameter("value");
		var bValid = oEvent.getParameter("valid");
		this._iEvent++;
		oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);

		if (bValid) {
			oDP.setValueState(sap.ui.core.ValueState.None);
		} else {
			oDP.setValueState(sap.ui.core.ValueState.Error);
		}
	}
});