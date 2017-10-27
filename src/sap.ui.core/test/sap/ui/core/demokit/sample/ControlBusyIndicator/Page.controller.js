sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'jquery.sap.script'],
	function(jQuery, Controller/*, jQuerySapScript*/) {
	"use strict";

	var PageController = Controller.extend("sap.ui.core.sample.ControlBusyIndicator.Page", {

		onAction : function (oEvt) {

			var oPanel = this.byId("panel1");
			oPanel.setBusy(true);

			var oIcon = this.byId("panel2-icon");
			oIcon.setBusy(true)

			// simulate delayed end of operation
			jQuery.sap.delayedCall(5000, this, function () {
				oPanel.setBusy(false);
				oIcon.setBusy(false)
			});
		}
	});

	return PageController;

});
