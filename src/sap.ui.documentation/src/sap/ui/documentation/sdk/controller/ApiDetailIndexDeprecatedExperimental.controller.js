/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/documentation/sdk/model/formatter"
	], function (BaseController, JSONModel, APIInfo, globalFormatter) {
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
			},

			_onTopicMatched: function (oEvent) {
				var sRouteName = oEvent.getParameter("name"),
				fnDataGetterRef = {
					experimental: APIInfo.getExperimentalPromise,
					deprecated: APIInfo.getDeprecatedPromise,
					since: APIInfo.getSincePromise
				}[sRouteName];

				if (this._hasMatched) {
					return;
				}
				this._hasMatched = true;

				this.getOwnerComponent().loadVersionInfo().then(function () {
					// Cache allowed members for the filtering
					this._aAllowedMembers = this.getModel("versionData").getProperty("/allowedMembers");

					fnDataGetterRef().then(function (oData) {
						oData = this._filterVisibleElements(oData);
						this._oModel.setData(oData);
					}.bind(this));
				}.bind(this));
			},

			/**
			 * Filter all items to be listed depending on their visibility.
			 * Note: This method modifies the passed oData reference object.
			 * @param {object} oData the data object to be filtered
			 * @return {object} filtered data object
			 * @private
			 */
			_filterVisibleElements: function (oData) {
				var oFilteredData = {},
				    oАscendingOrderData;

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

				oАscendingOrderData = Object.keys(oFilteredData).sort(function(sVersionA, sVersionB) {
					// Split the version name by dot
					var aPartsA = sVersionA.split('.'),
						aPartsB = sVersionB.split('.');

					// Compare the major version part
					var iMajorA = parseInt(aPartsA[0]),
						iMajorB = parseInt(aPartsB[0]);

					if (iMajorA !== iMajorB) {
						return iMajorB - iMajorA;
					}

					// Compare the minor version part
					var iMinorA = parseInt(aPartsA[1]),
						iMinorB = parseInt(aPartsB[1]);
					return iMinorB - iMinorA;
				  }).reduce(function(oSortedData, sKey) {
					oSortedData[sKey] = oFilteredData[sKey];
					return oSortedData;
				}, {});

				return oАscendingOrderData;
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