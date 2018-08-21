/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/thirdparty/jquery",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/JSDocUtil",
		"sap/ui/documentation/sdk/controller/util/APIInfo"
	], function (jQuery, BaseController, JSONModel, JSDocUtil, APIInfo) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetailIndexDeprecatedExperimental", {

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

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
				var fnDataGetterRef = {
						experimental: APIInfo.getExperimentalPromise,
						deprecated: APIInfo.getDeprecatedPromise,
						since: APIInfo.getSincePromise
					}[oEvent.getParameter("name")];

				if (this._hasMatched) {
					return;
				}
				this._hasMatched = true;

				// Cache allowed members for the filtering
				this._aAllowedMembers = this.getModel("versionData").getProperty("/allowedMembers");

				fnDataGetterRef().then(function (oData) {
					this._filterVisibleElements(oData);
					this._oModel.setData(oData);
					setTimeout(this._prettify.bind(this), 1000);
				}.bind(this));
			},

			/**
			 * Filter all items to be listed depending on their visibility.
			 * Note: This method modifies the passed oData reference object.
			 * @param {object} oData the data object to be filtered
			 * @private
			 */
			_filterVisibleElements: function (oData) {
				Object.keys(oData).forEach(function(sVersion) {
					oData[sVersion].apis = oData[sVersion].apis.filter(function (oElement) {
						return this._aAllowedMembers.indexOf(oElement.visibility) >= 0;
					}.bind(this));
				}.bind(this));
			},

			_prettify: function () {
				// Google Prettify requires this class
				jQuery('pre').addClass('prettyprint');

				window.prettyPrint();
			},

			formatTitle: function (sTitle) {
				return sTitle ? "As of " + sTitle : "Version N/A";
			},

			formatSenderLink: function (sControlName, sEntityName, sEntityType) {
				if (sEntityType === "methods") {
					return sControlName + "#" + sEntityName;
				}

				if (sEntityType === "events") {
					return sControlName + "#events:" + sEntityName;
				}

				if (sEntityType === "class") {
					return sControlName;
				}

				return "";
			},

			/**
			 * This function wraps a text in a span tag so that it can be represented in an HTML control.
			 * @param {string} sText
			 * @returns {string}
			 * @private
			 */
			formatLinks: function (sText) {
				return JSDocUtil.formatTextBlock(sText, {
					linkFormatter: function (target, text) {

						var iHashIndex;

						// If the link has a protocol, do not modify, but open in a new window
						if (target.match("://")) {
							return '<a target="_blank" href="' + target + '">' + (text || target) + '</a>';
						}

						target = target.trim().replace(/\.prototype\./g, "#");
						iHashIndex = target.indexOf("#");

						text = text || target; // keep the full target in the fallback text

						if (iHashIndex < 0) {
							var iLastDotIndex = target.lastIndexOf("."),
								sClassName = target.substring(0, iLastDotIndex),
								sMethodName = target.substring(iLastDotIndex + 1),
								targetMethod = sMethodName;

							if (targetMethod) {
								if (targetMethod.static === true) {
									target = sClassName + '/methods/' + sClassName + '.' + sMethodName;
								} else {
									target = sClassName + '/methods/' + sMethodName;
								}
							}
						}

						if (iHashIndex === 0) {
							// a relative reference - we can't support that
							return "<code>" + target.slice(1) + "</code>";
						}

						if (iHashIndex > 0) {
							target = target.slice(0, iHashIndex) + '/methods/' + target.slice(iHashIndex + 1);
						}

						return "<a class=\"jsdoclink\" href=\"#/api/" + target + "\" target=\"_self\">" + text + "</a>";

					}
				});
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

						sHref = "#/api/" + sClassName;
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