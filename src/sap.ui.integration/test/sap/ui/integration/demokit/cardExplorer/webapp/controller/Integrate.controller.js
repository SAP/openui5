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

		/**
		 * @override
		 */
		getNavigationModel: function() {
			return IntegrateNavigationModel;
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sTopic = oArgs.topic,
				sSubTopic = oArgs.subTopic || "",
				sElementId = oArgs.id,
				sNavigationItemKey = sTopic;

			// Check for deep link (id of element inside the page)
			// Note: id of element shouldn't equal any subTopic, else it won't work.
			if (sSubTopic) {
				if (this.isSubTopic(sSubTopic)) {
					sNavigationItemKey = sSubTopic;
					sSubTopic = "/" + sSubTopic;
				} else {
					sElementId = sSubTopic;
					sSubTopic = "";
				}
			}

			this.getOwnerComponent().getEventBus().publish("navEntryChanged", {
				navigationItemKey: sNavigationItemKey,
				routeName: "integrate"
			});

			var oNavEntry = this.findNavEntry(sTopic),
				sTopicURL = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/topics/integrate/" + sTopic + sSubTopic + '.html');

			var oJsonObj = {
				pageTitle: oNavEntry.title,
				topicURL : sTopicURL,
				bIsPhone : Device.system.phone
			};

			this.oDefaultModel.setData(oJsonObj);
			this.onFrameSourceChange();
			this.scrollTo(sElementId);
		}
	});

});