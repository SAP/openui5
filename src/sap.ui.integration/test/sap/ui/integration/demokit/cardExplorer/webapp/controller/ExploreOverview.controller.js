sap.ui.define([
	"./Topic.controller",
	"../model/ExploreNavigationModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (
	TopicController,
	ExploreNavigationModel,
	JSONModel,
	Device
) {
	"use strict";

	return TopicController.extend("sap.ui.demo.cardExplorer.controller.ExploreOverview", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			TopicController.prototype.onInit.apply(this, arguments);

			var oRouter = this.getRouter();
			oRouter.getRoute("exploreOverview").attachMatched(this._onRouteMatched, this);

			this.oDefaultModel = new JSONModel();
			this.getView().setModel(this.oDefaultModel);
		},
		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sTopic = oArgs.topic,
				topicURL = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/topics/explore/" + sTopic + '.html'),
				sTitle;

			var navEntries = ExploreNavigationModel.getProperty('/navigation');
			navEntries.forEach(function (element) {
				if (element.key === sTopic) {
					sTitle = element.title;
				}
			});

			var jsonObj = {
				pageTitle: sTitle,
				topicURL: topicURL,
				bIsPhone: Device.system.phone
			};

			this.oDefaultModel.setData(jsonObj);
			this.onFrameSourceChange();
			this.scrollTo(oArgs.id);
		}
	});
});