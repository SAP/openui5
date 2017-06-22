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

				this._expandTreeToNode(this._topicId, this.getModel());
			},

			_onMatched: function () {
				var splitApp = this.getView().getParent().getParent();
				splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);

				// When no particular topic is selected, expand the first node of the tree only
				this._expandFirstNodeOnly();
			},

			_fetchDocuIndex : function () {
				var oResponse = jQuery.sap.syncGetJSON(this.getConfig().docuPath + "index.json");
				if (oResponse.data === undefined) {
					return [];
				}

				var oData = oResponse.data.links;
				return this._preProcessDocuIndex(oData);
			},

			_preProcessDocuIndex: function (oData) {
				var sMainSectionId = "95d113be50ae40d5b0b562b84d715227",
					sTestPagesSectionId = "1b4124400a764ec0a8623d0d5c585321",
					oProcessedData,
					iTestPagesSectionIndex,
					oTestPagesSection,
					oMainSection;

				// Remove dummy top-level elements (either empty text, or key=index)
				oProcessedData = oData.filter(function (oEntry) {
					return oEntry.text !== "" && oEntry.key !== "index";
				});

				// Search for the sections that we're interested in (main and test pages)
				for (var i = 0; i < oProcessedData.length; i++) {
					if (oProcessedData[i].key === sMainSectionId) {
						oMainSection = oProcessedData[i];
					} else if (oProcessedData[i].key === sTestPagesSectionId) {
						oTestPagesSection = oProcessedData[i];
						iTestPagesSectionIndex = i;
					}
				}

				// If there is a "Test Pages" section, move it as the last element of the main section
				if (oMainSection && oTestPagesSection) {
					oProcessedData.splice(iTestPagesSectionIndex, 1);
					oMainSection.links.push(oTestPagesSection);
				}

				return oProcessedData;
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

			onTreeFilter: function (oEvent) {
				MasterTreeBaseController.prototype.onTreeFilter.apply(this, [oEvent, "text"]);
			}

		});
	}
);