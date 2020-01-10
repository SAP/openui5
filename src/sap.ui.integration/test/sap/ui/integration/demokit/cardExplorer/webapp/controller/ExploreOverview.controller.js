sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"../model/ExploreNavigationModel",
	"sap/ui/Device"
], function (BaseController,
             JSONModel,
             ExploreNavigationModel,
             Device) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cardExplorer.controller.ExploreOverview", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("exploreOverview").attachMatched(this._onRouteMatched, this);

			this.jsonDefModel = new JSONModel();
			this.getView().setModel(this.jsonDefModel);
		},
		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sSampleKey = oArgs["key"],
				topicURL = "./topics/explore/" + sSampleKey + '.html',
				topicTitle;

			var navEntries = ExploreNavigationModel.getProperty('/navigation');
			navEntries.forEach(function (element) {
				if (element.key == sSampleKey) {
					topicTitle = element.title;
				}
			});

			var jsonObj = {
				pageTitle: topicTitle ? topicTitle : "Section",
				topicURL: topicURL,
				bIsPhone: Device.system.phone
			};

			this.jsonDefModel.setData(jsonObj);
			this.onFrameSourceChange();

		}
	});
});