sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	var PageController = Controller.extend("sap.ui.core.sample.ControlBusyIndicator.Page", {

		onAction : function (oEvt) {

			var oPanel = this.getView().byId("panel1");
			oPanel.setBusy(true);

			// simulate delayed end of operation
			jQuery.sap.delayedCall(5000, this, function () {
				oPanel.setBusy(false);
			});
		}
	});

	return PageController;

});
