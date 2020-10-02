sap.ui.define([
	"./Topic.controller",
	"../model/DesigntimeNavigationModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (
	TopicController,
	DesigntimeNavigationModel,
	JSONModel,
	Device
) {
	"use strict";

	return TopicController.extend("sap.ui.demo.cardExplorer.controller.Designtime", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("designtime").attachMatched(this._onRouteMatched, this);

			this.oDefaultModel = new JSONModel();
			this.setModel(this.oDefaultModel);
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sTopic = oArgs.topic,
				sTopicURL = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/topics/designtime/" + sTopic + '.html'),
				oCurrentEntry;

			var aNavEntries = DesigntimeNavigationModel.getProperty('/navigation');

			oCurrentEntry = aNavEntries.find(function (oElement) {
				return oElement.key === sTopic;
			});

			var oJsonObj = {
				pageTitle: oCurrentEntry.title,
				topicURL: sTopicURL,
				bIsPhone: Device.system.phone
			};

			this.oDefaultModel.setData(oJsonObj);
			this.onFrameSourceChange();
			this.scrollTo(oArgs.id);
		}
	});
});