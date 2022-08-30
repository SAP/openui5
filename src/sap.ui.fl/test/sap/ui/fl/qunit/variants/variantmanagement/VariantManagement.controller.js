sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/registry/Settings",
	"sap/base/Log",
	"sap/ui/core/Core",
	"sap/ui/model/resource/ResourceModel"
], function(
	Controller,
	FlSettings,
	Log,
	oCore,
	ResourceModel
) {
	"use strict";

	return Controller.extend("sap.ui.fl.sample.variantmanagement.VariantManagement", {
		onInit: function() {
			var sResourceUrl = "i18n/i18n.properties";
			var sLocale = oCore.getConfiguration().getLanguage();
			var oResourceModel = new ResourceModel({
				bundleUrl: sResourceUrl,
				bundleLocale: sLocale
			});
			this.getView().setModel(oResourceModel, "i18n");

			this.oVM = this.getView().byId("idVariantManagementCtrl");
			this._sModelName = this.oVM.getModelName();

			this.oVM.setShowExecuteOnSelection(true);

			FlSettings.getInstance().then(function () {
				if (this.oVM) {
					this.oVM._oVM.setSupportPublic(true);
				}
			}.bind(this)).catch(function(oEx) {
				Log.error(oEx);
			});
		}
	});
});