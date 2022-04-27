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
			TopicController.prototype.onInit.apply(this, arguments);

			this.getRouter().getRoute("designtime").attachPatternMatched(this._onTopicMatched, this);

			this.oDefaultModel = new JSONModel();
			this.setModel(this.oDefaultModel);
		},

		/**
		 * @override
		 */
		getNavigationModel: function() {
			return DesigntimeNavigationModel;
		},

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} event pattern match event in route 'topicId'
		 * @private
		 */
		_onTopicMatched: function (event) {
			var oArgs = event.getParameter("arguments"),
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
				routeName: "designtime"
			});

			var oNavEntry = this.findNavEntry(sTopic),
				sTopicURL = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/topics/designtime/" + sTopic + sSubTopic + '.html');

			var jsonObj = {
				pageTitle: oNavEntry.title,
				topicURL: sTopicURL,
				bIsPhone: Device.system.phone
			};

			this.oDefaultModel.setData(jsonObj);
			this.onFrameSourceChange();
			this.scrollTo(sElementId);
		}
	});
});