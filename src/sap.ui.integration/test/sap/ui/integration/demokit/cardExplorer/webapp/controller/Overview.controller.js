sap.ui.define([
	"./Topic.controller",
	"../model/OverviewNavigationModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(
	TopicController,
	OverviewNavigationModel,
	JSONModel,
	Device
) {
	"use strict";

	return TopicController.extend("sap.ui.demo.cardExplorer.controller.Overview", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit : function () {
			TopicController.prototype.onInit.apply(this, arguments);

			this.getRouter().getRoute("overview").attachPatternMatched(this._onTopicMatched, this);
			this.getRouter().getRoute("default").attachPatternMatched(this._onTopicMatched, this);

			this.oDefaultModel = new JSONModel();
			this.getView().setModel(this.oDefaultModel);
		},

		/**
		 * @override
		 */
		getNavigationModel: function() {
			return OverviewNavigationModel;
		},

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route "default" and "overview"
		 * @private
		 */
		_onTopicMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sTopic = oArgs.topic,
				sSubTopic = oArgs.subTopic || "",
				sElementId = oArgs.id;

			if (oEvent.getParameter("name") === "default") {
				sTopic = "introduction";
			}

			var sNavigationItemKey = sTopic;

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
				routeName: "overview"
			});

			var oNavEntry = this.findNavEntry(sTopic),
				sTopicURL = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/topics/overview/" + sTopic + sSubTopic + '.html');

			var jsonObj = {
				pageTitle: oNavEntry.title,
				topicURL : sTopicURL,
				bIsPhone : Device.system.phone
			};

			this.oDefaultModel.setData(jsonObj);
			this.onFrameSourceChange();
			this.scrollTo(sElementId);
		}
	});
});