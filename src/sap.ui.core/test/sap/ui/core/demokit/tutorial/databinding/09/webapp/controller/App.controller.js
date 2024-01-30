sap.ui.define([
	"sap/m/library",
	"sap/ui/core/mvc/Controller"
], (mobileLibrary, Controller) => {
	"use strict";

	return Controller.extend("ui5.databinding.controller.App", {
		formatMail(sFirstName, sLastName) {
			const oBundle = this.getView().getModel("i18n").getResourceBundle();

			return mobileLibrary.URLHelper.normalizeEmail(
				`${sFirstName}.${sLastName}@example.com`,
				oBundle.getText("mailSubject", [sFirstName]),
				oBundle.getText("mailBody"));
		}
	});
});