sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"../model/IntegrateNavigationModel",
	"sap/ui/Device"
], function (
	BaseController,
	JSONModel,
	IntegrateNavigationModel,
	Device
) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cardExplorer.controller.Integrate", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("integrate").attachMatched(this._onRouteMatched, this);

			this.oJsonDefModel = new JSONModel();
			this.setModel(this.oJsonDefModel);
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sSampleKey = oArgs["key"],
				sTopicURL = "./topics/integrate/" + sSampleKey + '.html',
				oCurrentEntry;

			var aNavEntries = IntegrateNavigationModel.getProperty('/navigation');

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