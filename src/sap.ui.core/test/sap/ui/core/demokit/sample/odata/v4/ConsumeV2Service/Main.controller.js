/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller"
], function (MessageBox, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.ConsumeV2Service.Main", {
		onResetEntity : function () {
			var oView = this.getView();

			oView.byId("resetEntityButton").getObjectBinding().invoke()
				.then(function () {
					// Note: refresh is needed as long as there is no cache synchronization
					oView.getModel().refresh();
					MessageBox.success("Data successfully reset");
				}, function (oError) {
					MessageBox.error(oError.message);
				});
		}
	});
});
