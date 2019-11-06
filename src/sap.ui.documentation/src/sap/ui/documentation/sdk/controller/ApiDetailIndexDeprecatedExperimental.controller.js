/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/thirdparty/jquery",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/JSDocUtil",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/documentation/sdk/model/formatter"
	], function (jQuery, BaseController, JSONModel, JSDocUtil, APIInfo, globalFormatter) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetailIndexDeprecatedExperimental", {

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			formatter: globalFormatter,

			onInit: function () {
				var oRouter = this.getRouter();

				this._oModel = new JSONModel();
				this._oModel .setSizeLimit(10000); /* This will become too small for the since list in time */
				this.setModel(this._oModel);

				oRouter.getRoute("deprecated").attachPatternMatched(this._onTopicMatched, this);
				oRouter.getRoute("experimental").attachPatternMatched(this._onTopicMatched, this);
				oRouter.getRoute("since").attachPatternMatched(this._onTopicMatched, this);

				this._hasMatched = false;
				this._aVisitedTabs = [];
			},

			_onTopicMatched: function (oEvent) {
				var sRouteName = oEvent.getParameter("name"),
				fnDataGetterRef = {
					experimental: APIInfo.getExperimentalPromise,
					deprecated: APIInfo.getDeprecatedPromise,
					since: APIInfo.getSincePromise
				}[sRouteName],
				oPage;

				if (this._hasMatched) {
					return;
				}
				this._hasMatched = true;

				// Cache allowed members for the filtering
				this._aAllowedMembers = this.getModel("versionData").getProperty("/allowedMembers");
				oPage = this.getView().byId("objectPage");

				fnDataGetterRef().then(function (oData) {
					oData = this._filterVisibleElements(oData);
					this._oModel.setData(oData);

					oPage.addEventDelegate({"onAfterRendering": this._prettify.bind(this)});
					if (oPage.getUseIconTabBar()) {
						// add support to prettify tab content lazily (i.e. only for *opened* tabs) to avoid traversing *all* tabs in advance
						oPage.attachNavigate(this._attachPrettifyTab.bind(this));
					}
				}.bind(this));
			},

			/**
			 * Attach listeners that prettify the tab content upon its rendering
			 * @param {oEvent} tab navigate event
			 * @private
			 */
			_attachPrettifyTab: function(oEvent) {
				// in our use-case each tab contains a single subSection => only this subSection needs to be processed
				var oSubSection = oEvent.getParameter("subSection"),
					sId = oSubSection.getId(),
					aBlocks;

				//attach listeners that prettify the tab content upon its rendering
				if (this._aVisitedTabs.indexOf(sId) < 0) { // avoid adding listeners to the same tab twice
					aBlocks = oSubSection.getBlocks();
					aBlocks.forEach(function(oBlock) {
						oBlock.addEventDelegate({"onAfterRendering": this._prettify.bind(this)});
					}.bind(this));

					this._aVisitedTabs.push(sId);
				}
			},

			/**
			 * Filter all items to be listed depending on their visibility.
			 * Note: This method modifies the passed oData reference object.
			 * @param {object} oData the data object to be filtered
			 * @return {object} filtered data object
			 * @private
			 */
			_filterVisibleElements: function (oData) {
				var oFilteredData = {};

				Object.keys(oData).forEach(function(sVersion) {
					var oVersion = oData[sVersion];

					// Is API allowed to be shown based on it's visibility
					oVersion.apis = oVersion.apis.filter(function (oElement) {
						return this._aAllowedMembers.indexOf(oElement.visibility) > -1;
					}.bind(this));

					// If we have remaining API's after the filter we add them to the new filtered object.
					if (oVersion.apis.length > 0) {
						oFilteredData[sVersion] = oVersion;
					}
				}.bind(this));

				return oFilteredData;
			},

			_prettify: function () {
				// Google Prettify requires this class
				jQuery('pre').addClass('prettyprint');

				window.prettyPrint();
			},

			/**
			 * Modify all deprecated and experimental links
			 * @private
			 */
			_modifyLinks: function (oEvent) {
				var aItems = oEvent.getSource().getItems(),
					iLen = aItems.length,
					oItem;

				while (iLen--) {
					oItem = aItems[iLen];
					// Access control lazy loading method if available
					if (oItem._getLinkSender) {
						var oCustomData = oItem.getCustomData(),
							sClassName = oCustomData[0].getValue(),
							sEntityId = oCustomData[1].getValue(),
							sEntityType = oCustomData[2].getValue(),
							sHref;

						// oCustomData[3].getValue() is true if method is static, else it is false
						if (oCustomData[3].getValue()) {
							sEntityId = sClassName + "." + sEntityId;
						}

						sHref = "api/" + sClassName;
						if (sEntityType !== "class") {
							sHref += "/" + sEntityType + "/" + sEntityId;
						}

						// Set link href to allow open in new window functionality
						oItem._getLinkSender().setHref(sHref);
					}
				}
			}
		});

	}
);