/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/Layer"
], function (
	UIComponent,
	Layer
) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.fl.support.apps.contentbrowser.Component", {
		init: function () {
			var that = this;
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// set i18n
			var oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "sap.ui.fl.support.apps.contentbrowser.i18n.i18n.properties"
			});
			this.setModel("i18n", oI18nModel);

			var sMessages = [];
			var oMessagesModel = new sap.ui.model.json.JSONModel(sMessages);
			this.setModel(oMessagesModel, "messages");
			sap.ui.require(["sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils"], function (ErrorUtils) {
				ErrorUtils.setMessagesModel(that, oMessagesModel);
			});


			var oContentJson = {};
			var oContentJsonModel = new sap.ui.model.json.JSONModel(oContentJson);
			this.setModel(oContentJsonModel, "content");

			var oLayersJson = [
				{
					name: "All",
					icon: "sap-icon://world"
				},
				{
					name: Layer.VENDOR,
					icon: "sap-icon://sap-logo-shape"
				},
				{
					name: "VENDOR_LOAD",
					icon: "sap-icon://share-2"
				},
				{
					name: Layer.PARTNER,
					icon: "sap-icon://supplier"
				},
				{
					name: Layer.CUSTOMER_BASE,
					icon: "sap-icon://customer-and-supplier"
				},
				{
					name: Layer.CUSTOMER,
					icon: "sap-icon://customer"
				},
				{
					name: "LOAD",
					icon: "sap-icon://database"
				},
				{
					name: Layer.USER,
					icon: "sap-icon://person-placeholder"
				}
			];
			var oLayersJsonModel = new sap.ui.model.json.JSONModel(oLayersJson);
			this.setModel(oLayersJsonModel, "layers");

			// create the views based on the url/hash
			this.getRouter().initialize();
		},
		metadata: {
			manifest: "json"
		}
	});


	return Component;
});
