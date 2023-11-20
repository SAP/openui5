sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.sample.NotificationListItem.C", {

		handleClose: function (oEvent) {
			var oList = this.getView().byId("notificationList");
			oList.removeItem(oEvent.oSource);
			var oToast = this.getView().byId("demoToast");
			oToast.setText("Notification closed.");
			oToast.show();
		}

	});
});