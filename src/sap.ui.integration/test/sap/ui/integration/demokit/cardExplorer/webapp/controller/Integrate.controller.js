sap.ui.define([
	"./Topic.controller",
	"../model/IntegrateNavigationModel",
	'sap/ui/model/json/JSONModel',
	"sap/ui/Device"
], function (
	TopicController,
	IntegrateNavigationModel,
	JSONModel,
	Device
) {
	"use strict";

	return TopicController.extend("sap.ui.demo.cardExplorer.controller.Integrate", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			TopicController.prototype.onInit.apply(this, arguments);

			var oRouter = this.getRouter();
			oRouter.getRoute("integrate").attachMatched(this._onRouteMatched, this);

			this.oDefaultModel = new JSONModel();
			this.setModel(this.oDefaultModel);
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sTopic = oArgs.topic,
				sTopicURL = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/topics/integrate/" + sTopic + '.html'),
				oCurrentEntry;

			var aNavEntries = IntegrateNavigationModel.getProperty('/navigation');

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