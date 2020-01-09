/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/Device",
		"sap/ui/documentation/sdk/controller/MasterTreeBaseController",
		"sap/ui/model/json/JSONModel",
		"sap/m/library",
		"sap/base/Log",
		"sap/ui/documentation/sdk/controller/util/Highlighter"
	], function (Device, MasterTreeBaseController, JSONModel, mobileLibrary, Log, Highlighter) {
		"use strict";

		// shortcut for sap.m.SplitAppMode
		var SplitAppMode = mobileLibrary.SplitAppMode;

		return MasterTreeBaseController.extend("sap.ui.documentation.sdk.controller.TopicMaster", {

			/**
			 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
			 * @public
			 */
			onInit : function () {
				this._oTree = this.byId("tree");

				var oModel = new JSONModel();
				oModel.setSizeLimit(10000);
				this.getView().setModel(oModel);

				this.getRouter().getRoute("topic").attachPatternMatched(this._onMatched, this);
				this.getRouter().getRoute("topicId").attachPatternMatched(this._onTopicMatched, this);

				// Async data load
				this._oIndexPromise = this._getDocuIndexPromise()
					.then(function (oData) {
						// Add search metadata
						oData = this._addSearchMetadata(oData, "");

						// Add data to model and initialize tree
						oModel.setData(oData);
						this._initTreeUtil("key", "links");
					}.bind(this))
					.catch(function () {
						this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
					}.bind(this));
			},

			_onTopicMatched: function (event) {

				try {
					this.showMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					Log.error(e);
				}

				this._topicId = event.getParameter("arguments").id;
				this._oIndexPromise.then(function () {
					this._expandTreeToNode(this._preProcessTopicID(this._topicId), this.getModel());
				}.bind(this));
			},

			onAfterRendering: function () {
				if (!this.highlighter) {
					this.highlighter = new Highlighter(this._oTree.getDomRef(), {
						shouldBeObserved: true
					});
				}
			},

			onExit: function () {
				this.highlighter.destroy();
			},

			onTreeFilter: function () {
				MasterTreeBaseController.prototype.onTreeFilter.apply(this, arguments);

				if (this.highlighter) {
					this.highlighter.highlight(this._sFilter);
				}
				return this;
			},

			_onMatched: function () {
				this.getView().getParent().getParent().setMode(SplitAppMode.ShowHideMode);

				// When no particular topic is selected, collapse all nodes
				this._collapseAllNodes();
				this._clearSelection();

				if (Device.system.desktop) {
					setTimeout(function () {
						this.getView().byId("searchField").getFocusDomRef().focus();
					}.bind(this), 0);
				}
			},

			_getDocuIndexPromise: function () {
				return new Promise(function (resolve, reject) {
					jQuery.ajax({
						async: true,
						url : this.getConfig().docuPath + "index.json",
						dataType : 'json',
						success : function(oData) {
							resolve(oData);
						},
						error : function (oError) {
							reject(oError);
						}
					});
				}.bind(this));
			},

			_addSearchMetadata: function (oData, sParentText) {
				for (var i = 0; i < oData.length; i++) {
					oData[i].name = sParentText ? sParentText + " " + oData[i].text : oData[i].text;
					if (oData[i].links) {
						oData[i].links = this._addSearchMetadata(oData[i].links, oData[i].text);
					}
				}
				return oData;
			},

			onNodeSelect : function (oEvent) {
				this.getRouter().navTo("topicId", {id : oEvent.getParameter("listItem").getTarget()}, false);
			},

			/**
			* Processes the topic ID.
			*
			* The method is used in <code>_onTopicMatched</code>.
			* The method is needed because some of the links inside the documentation topics are pointing to 'topic.html'.
			* On the other hand the master tree searches through all the nodes and tries to match the node key with the topic ID,
			* but all the keys in the tree model are without the '.html' extension.
			*
			* <b>Note:</b> If the extension parameter is not found at the end of the topic ID,
			* the extension is not cut and the provided topic ID remains unchanged.
			* @param {string} sTopicId
			* @private
			* @returns {string} The processed topic ID
			*/
			_preProcessTopicID: function(sTopicId) {
				if (!sTopicId || (typeof sTopicId !== "string")) {
					return sTopicId;
				}

				return sTopicId.replace(/\.html$/, "");
			}

		});
	}
);