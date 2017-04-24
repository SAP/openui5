/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/MasterTreeBaseController",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/model/json/JSONModel"
	], function (MasterTreeBaseController, APIInfo, JSONModel) {
		"use strict";

		return MasterTreeBaseController.extend("sap.ui.documentation.sdk.controller.TopicMaster", {

			/**
			 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
			 * @public
			 */
			onInit : function () {
				this.oJSONContent = this._fetchDocuIndex();
				var oModel = new JSONModel(this.oJSONContent);
				this.getView().setModel(oModel);

				this._initTreeUtil("key", "links");

				this.getRouter().getRoute("topic").attachPatternMatched(this._onMatched, this);
				this.getRouter().getRoute("topicId").attachPatternMatched(this._onTopicMatched, this);
			},

			_onTopicMatched: function (event) {

				try {
					this.showMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					jQuery.sap.log.error(e);
				}

				this._topicId = event.getParameter("arguments").id;

				this._expandTreeToNode(this._topicId);
			},

			_onMatched: function () {
				var splitApp = this.getView().getParent().getParent();
				splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);

				// When no particular topic is selected, expand the first node of the tree only
				this._expandFirstNodeOnly();
			},

			_fetchDocuIndex : function () {
				var oData = jQuery.sap.syncGetJSON(this.getConfig().docuPath + "index.json").data.links;

				// Remove all top-level entries with an empty text property
				return oData.filter(function (oEntry) {
					return oEntry.text !== "";
				});
			},

			onNodeSelect : function (oEvent) {
				var node = oEvent.getParameter("listItem");
				var topicId = node.getCustomData()[0].getValue();

				if (!topicId) {
					jQuery.sap.log.warning("Missing key for entity: " + node.getId() + " - cannot navigate to topic");
					return;
				}

				this.getRouter().navTo("topicId", {id : topicId}, false);
			}

		});
	}
);