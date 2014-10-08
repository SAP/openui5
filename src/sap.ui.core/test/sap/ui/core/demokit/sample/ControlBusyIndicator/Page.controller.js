sap.ui.controller("sap.ui.core.sample.ControlBusyIndicator.Page", {

	onAction : function (oEvt) {

		var oPanel = this.getView().byId("panel1");
		oPanel.setBusy(true);

		// simulate delayed end of operation
		jQuery.sap.delayedCall(5000, this, function () {
			oPanel.setBusy(false);
		});
	}
});