/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/documentation/sdk/controller/util/ResourcesInfo",
	"sap/ui/documentation/sdk/model/formatter",
	"sap/ui/util/openWindow",
	"sap/ui/model/json/JSONModel"
], function (BaseController, ResourcesInfo, formatter, openWindow, JSONModel) {
	"use strict";

	return BaseController.extend("sap.ui.documentation.sdk.controller.Resources", {

		formatter: formatter,

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			BaseController.prototype.onInit.call(this);

			this._oRouter = this.getRouter();
			this._oResourcesModel = new JSONModel();
			this.setModel(this._oResourcesModel, "resources");

			ResourcesInfo.getResourcesConfig().then(this.onResourceConfigLoaded.bind(this));

			this._oRouter.getRoute("tools").attachPatternMatched(function() {
				this._oRouter.navTo("resources");
			}, this);

			this._oRouter.getRoute("resources").attachPatternMatched(this.onPatternMatched, this);
		},

		/**
		 * Called when the configuration for tools are loaded.
		 * @param {object[]} aResourcesConfig - An array of objects where each object represents the configuration for a tool.
		 */
		onResourceConfigLoaded: function (aResourcesConfig) {
			var oData = {};

			aResourcesConfig.forEach(function (oEntry) {
				oData[oEntry.id] = oEntry;
			}, this);

			this._oResourcesModel.setData(oData);
			this._oResourcesModel.setProperty("/_raw", aResourcesConfig);
		},

		/**
		 * Handles the press event of the card action button.
		 * Formats and opens the URL in a new window if it starts with "topic/".
		 *
		 * @param {sap.ui.base.Event} oEvent - The event object.
		 */
		onButtonPress: function (oEvent) {
			var sUrl = oEvent.getSource().data("href");

			if (!sUrl) { return; }

			if (sUrl.startsWith("topic/")) {
				sUrl = formatter.formatHttpHrefForNewWindow(sUrl);
			}

			openWindow(sUrl, "_blank");
		},

		/**
		 * Called when the user navigates to this view.
		 */
		onPatternMatched: function () {
			this.hideMasterSide();
		}
	});
});