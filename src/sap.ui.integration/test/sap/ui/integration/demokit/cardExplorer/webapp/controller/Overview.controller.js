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
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route "default" and "overview"
		 * @private
		 */
		_onTopicMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sTopic = oArgs.topic,
				sSubTopic = oArgs.subTopic || "",
				sId = oArgs.id;

			if (oEvent.getParameter("name") === "default") {
				sTopic = "introduction";
			}

			// Note: oArgs.id shouldn't equal any subTopic, else it won't work.
			if (sSubTopic && this._isSubTopic(sSubTopic)) {
				sSubTopic = "/" + sSubTopic;
			} else if (oArgs.key) {
				sId = oArgs.sSubTopic; // right shift subTopic to id
			}

			var oNavEntry = this._findNavEntry(sTopic),
				sTopicURL = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/topics/overview/" + sTopic + sSubTopic + '.html');

			var jsonObj = {
				pageTitle: oNavEntry.title,
				topicURL : sTopicURL,
				bIsPhone : Device.system.phone
			};

			this.oDefaultModel.setData(jsonObj);
			this.onFrameSourceChange();
			this.scrollTo(sId);
		},

		_findNavEntry: function (key) {
			var navEntries = OverviewNavigationModel.getProperty("/navigation"),
				navEntry,
				subItems,
				i,
				j;

			for (i = 0; i < navEntries.length; i++) {
				navEntry  = navEntries[i];

				if (navEntry.key === key) {
					return navEntry;
				}

				subItems = navEntry.items;

				if (subItems) {
					for (j = 0; j < subItems.length; j++) {
						if (subItems[j].key === key) {
							return subItems[j];
						}
					}
				}
			}
		},

		/**
		 * Checks if the given key is subtopic key
		 * "/overview/{topic}/:subTopic:/:id:",
		 */
		_isSubTopic: function (sKey) {
			var aNavEntries = OverviewNavigationModel.getProperty('/navigation');

			return aNavEntries.some(function (oNavEntry) {
				return oNavEntry.items && oNavEntry.items.some(function (oSubEntry) {
					return oSubEntry.key === sKey;
				});
			});
		}
	});
});