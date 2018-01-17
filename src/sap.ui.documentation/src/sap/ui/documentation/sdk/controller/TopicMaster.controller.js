/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/Device",
		"sap/ui/documentation/sdk/controller/MasterTreeBaseController",
		"sap/ui/model/json/JSONModel",
		"sap/m/library"
	], function (jQuery, Device, MasterTreeBaseController, JSONModel, mobileLibrary) {
		"use strict";

		// shortcut for sap.m.SplitAppMode
		var SplitAppMode = mobileLibrary.SplitAppMode;

		return MasterTreeBaseController.extend("sap.ui.documentation.sdk.controller.TopicMaster", {

			/**
			 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
			 * @public
			 */
			onInit : function () {
				this.oJSONContent = this._fetchDocuIndex();
				var oModel = new JSONModel(this.oJSONContent);
				oModel.setSizeLimit(10000);
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

				this._expandTreeToNode(this._preProcessTopicID(this._topicId), this.getModel());
			},

			_onMatched: function () {
				var splitApp = this.getView().getParent().getParent();
				splitApp.setMode(SplitAppMode.ShowHideMode);

				// When no particular topic is selected, collapse all nodes
				this._collapseAllNodes();
				this._clearSelection();

				if (Device.system.desktop) {
					jQuery.sap.delayedCall(0, this, function () {
						this.getView().byId("searchField").getFocusDomRef().focus();
					});
				}
			},

			_fetchDocuIndex : function () {
				var oResponse = jQuery.sap.syncGetJSON(this.getConfig().docuPath + "index.json");
				if (oResponse.data === undefined) {
					return [];
				}

				var oData = oResponse.data.links;
				oData = this._reorderDocuIndex(oData);
				oData = this._addSearchMetadata(oData, "");
				return oData;
			},

			_reorderDocuIndex: function (oData) {

				var sMainSectionId = "95d113be50ae40d5b0b562b84d715227",
					sTestPagesSectionId = "1b4124400a764ec0a8623d0d5c585321",
					oProcessedData = [],
					oTestPagesSection,
					oMainSection;

				// Search for the sections that we're interested in (main and test pages)
				for (var i = 0; i < oData.length; i++) {
					if (oData[i].key === sMainSectionId) {
						oMainSection = oData[i];
					} else if (oData[i].key === sTestPagesSectionId) {
						oTestPagesSection = oData[i];
					}
				}

				// If the main section is found, move its content as top-level content of the resulting array
				if (oMainSection) {
					oProcessedData = oMainSection.links;

					// If there is a "Test Pages" section, move it as the last element of the resulting array
					if (oTestPagesSection) {
						oProcessedData.push(oTestPagesSection);
					}
				}

				return oProcessedData;
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
				var oNode = oEvent.getParameter("listItem"),
					sTopicId = oNode.getCustomData()[0].getValue(),
					oRouter;

				if (!sTopicId) {
					jQuery.sap.log.warning("Missing key for entity: " + oNode.getId() + " - cannot navigate to topic");
					return;
				}

				oRouter = this.getRouter();

				// Special case for release notes - we need to navigate to a different route
				if (sTopicId === "a6a78b7e104348b4bb94fb8bcf003480") {
					oRouter.navTo("releaseNotes");
					return;
				}

				oRouter.navTo("topicId", {id : sTopicId}, false);
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