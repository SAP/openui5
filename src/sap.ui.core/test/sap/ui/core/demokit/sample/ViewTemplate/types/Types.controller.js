/*!
 * ${copyright}
 */

sap.ui.controller("sap.ui.core.sample.ViewTemplate.types.Types", {
	onSave: function () {
		this.getView().getModel().submitChanges({
			success: function () {
				sap.m.MessageToast.show("Data successfully saved");
			},
			error: function (oError) {
				jQuery.sap.log.error("Error on saving EdmType: " + oError.message,
					oError.stack,
					"sap.ui.core.sample.ViewTemplate.types.Types");
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.show(oError.message, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error on save"
				});
			}
		});
	}
});