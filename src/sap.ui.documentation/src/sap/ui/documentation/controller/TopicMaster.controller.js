/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/controller/BaseController",
		"sap/ui/documentation/controller/util/APIInfo",
		"sap/ui/model/json/JSONModel"
	], function (BaseController, APIInfo, JSONModel) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.controller.TopicMaster", {

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
			 * @public
			 */
			onInit : function () {
				this.oJSONContent = this._fetchDocuIndex();
				var oModel = new JSONModel(this.oJSONContent);
				this.getView().setModel(oModel);

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

				for (var i = 0; i < this.oJSONContent.length; i++) {
					this._findNodeByKey(this.oJSONContent[i], this._topicId);
				}
				var treeModel = this.byId("tree").getModel();
				treeModel.refresh();
			},

			_onMatched: function () {
				var splitApp = this.getView().getParent().getParent();
				splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
			},

			_fetchDocuIndex : function () {
				return jQuery.sap.syncGetJSON(this.getConfig().docuPath + "index.json").data.links;
			},

			_findNodeByKey: function (oNode, sKey) {
				if (oNode.key === sKey) {
					oNode.isSelected = true;
				} else {
					oNode.isSelected = false;
				}
				if (oNode.links) {
					for (var i = 0; i < oNode.links.length; i++) {
						this._findNodeByKey(oNode.links[i], sKey);
					}
				}
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * After list data is available, this handler method updates the
			 * master list counter and hides the pull to refresh control, if
			 * necessary.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			onUpdateFinished : function (oEvent) {
				// update the master list object counter after new data is loaded
				// this._updateListItemCount(oEvent.getParameter("total"));
				// hide pull to refresh if necessary
				this.byId("pullToRefresh").hide();
			},

			onNodeSelect : function (oEvent) {
				var node = oEvent.getSource();
				var ref = node.getRef();

				this._currentId = ref;

				this.getRouter().navTo("topicId", {id : ref}, false);
			}
		});
	}
);