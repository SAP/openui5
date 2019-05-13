sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(
	BaseController,
	JSONModel,
	Device
) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cardExplorer.controller.LearnDetail", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit : function () {
			this.getRouter().getRoute("learnDetail").attachPatternMatched(this._onTopicMatched, this);

			this.jsonDefModel = new JSONModel();
			this.getView().setModel(this.jsonDefModel);
		},

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} event pattern match event in route 'topicId'
		 * @private
		 */
		_onTopicMatched: function (event) {
			var topicId = event.getParameter("arguments").key,
				topicURL = "./topics/learn/" + topicId + '.html';

			var jsonObj = {
				topicURL : topicURL,
				iframeAttribute : Device.os.name === Device.os.OS.IOS ? ' scrolling="no" ' : "",
				bIsPhone : Device.system.phone
			};

			this.jsonDefModel.setData(jsonObj);
		}
	});
});