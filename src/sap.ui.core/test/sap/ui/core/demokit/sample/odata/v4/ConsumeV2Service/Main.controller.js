/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageBox'
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.ConsumeV2Service.Main", {
		onResetEntity : function () {
			var oView = this.getView();

			oView.byId("resetEntityButton").getObjectBinding().execute()
				.then(function () {
					// Note: refresh is needed as long as there is no cache synchronization
					oView.getModel().refresh();
					MessageBox.alert("Data successfully reset", {
						icon : MessageBox.Icon.SUCCESS,
						title : "Success"
					});
				}, function (oError) {
					MessageBox.alert(oError.message, {
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});
				});
		}
	});
});