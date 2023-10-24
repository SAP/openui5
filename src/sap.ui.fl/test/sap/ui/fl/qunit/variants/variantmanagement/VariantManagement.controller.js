sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/registry/Settings",
	"sap/ui/model/resource/ResourceModel"
], function(
	Log,
	Localization,
	Controller,
	FlSettings,
	ResourceModel
) {
	"use strict";

	return Controller.extend("sap.ui.fl.sample.variantmanagement.VariantManagement", {
		onInit() {
			var sResourceUrl = "i18n/i18n.properties";
			var sLocale = Localization.getLanguage();
			var oResourceModel = new ResourceModel({
				bundleUrl: sResourceUrl,
				bundleLocale: sLocale
			});
			this.getView().setModel(oResourceModel, "i18n");

			this.oVM = this.getView().byId("idVariantManagementCtrl");
			this._sModelName = this.oVM.getModelName();

			this.oVM.setShowExecuteOnSelection(true);

			FlSettings.getInstance().then(function() {
				if (this.oVM) {
					this.oVM._oVM.setSupportPublic(true);
				}
			}.bind(this)).catch(function(oEx) {
				Log.error(oEx);
			});
		}
	});
});