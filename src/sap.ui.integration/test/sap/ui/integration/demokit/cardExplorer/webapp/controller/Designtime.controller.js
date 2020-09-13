sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"../model/DesigntimeNavigationModel",
	"sap/ui/Device"
], function (
	BaseController,
	JSONModel,
	DesigntimeNavigationModel,
	Device
) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cardExplorer.controller.Designtime", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("designtime").attachMatched(this._onRouteMatched, this);

			this.oJsonDefModel = new JSONModel();
			this.setModel(this.oJsonDefModel);
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sSampleKey = oArgs["key"],
				sTopicURL = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/topics/designtime/" + sSampleKey + '.html'),
				oCurrentEntry;

			var aNavEntries = DesigntimeNavigationModel.getProperty('/navigation');

			oCurrentEntry = aNavEntries.find(function (oElement) {
				return oElement.key === sSampleKey;
			});

			var oJsonObj = {
				pageTitle: oCurrentEntry ? oCurrentEntry.title : "Section",
				topicURL: sTopicURL,
				bIsPhone: Device.system.phone
			};

			this.oJsonDefModel.setData(oJsonObj);
			this.onFrameSourceChange();
		}
	});
});