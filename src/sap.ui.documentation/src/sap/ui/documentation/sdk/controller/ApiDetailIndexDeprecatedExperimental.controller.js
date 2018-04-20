/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"jquery.sap.global",
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
				var oModel = new JSONModel();
				oModel.setSizeLimit(10000);
				this.setModel(oModel, "deprecatedAPIs");
				this.setModel(oModel, "experimentalAPIs");
				this.setModel(oModel, "sinceAPIs");

				this.getRouter().getRoute("deprecated").attachPatternMatched(this._onTopicDeprecatedMatched, this);
				this.getRouter().getRoute("experimental").attachPatternMatched(this._onTopicExperimentalMatched, this);
				this.getRouter().getRoute("since").attachPatternMatched(this._onTopicSinceMatched, this);

				this._currentMedia = this.getView()._getCurrentMediaContainerRange();

				this._hasMatched = false;
			},

			onBeforeRendering: function () {
				this.getView()._detachMediaContainerWidthChange(this._resizeMessageStrip, this);
			},

			onAfterRendering: function () {
				this._resizeMessageStrip();
				this.getView()._attachMediaContainerWidthChange(this._resizeMessageStrip, this);
			},

			onExit: function () {
				this.getView()._detachMediaContainerWidthChange(this._resizeMessageStrip, this);
			},

			_onTopicDeprecatedMatched: function (oEvent) {
				if (this._hasMatched) {
					return;
				}

				this._hasMatched = true;

				this.getView().byId("deprecatedList").attachUpdateFinished(this._modifyLinks, this);

				APIInfo.getDeprecatedPromise().then(function (oData) {
					this.getModel("deprecatedAPIs").setData(oData);
					jQuery.sap.delayedCall(0, this, this._prettify);
				}.bind(this));
			},

			_onTopicExperimentalMatched: function (oEvent) {
				if (this._hasMatched) {
					return;
				}

				this._hasMatched = true;

				this.getView().byId("experimentalList").attachUpdateFinished(this._modifyLinks, this);

				APIInfo.getExperimentalPromise().then(function (oData) {
					this.getModel("experimentalAPIs").setData(oData);
					jQuery.sap.delayedCall(0, this, this._prettify);
				}.bind(this));
			},

			_onTopicSinceMatched: function (oEvent) {
				if (this._hasMatched) {
					return;
				}

				this._hasMatched = true;

				this.getView().byId("sinceList").attachUpdateFinished(this._modifyLinks, this);

				APIInfo.getSincePromise().then(function (oData) {
					if (!oData['noVersion'].apis.length) {
						delete oData['noVersion'];
					}
					this.getModel("sinceAPIs").setData(oData);
					jQuery.sap.delayedCall(0, this, this._prettify);
				}.bind(this));
			},

			_prettify: function () {
				// Google Prettify requires this class
				jQuery('pre').addClass('prettyprint');

				window.prettyPrint();
			},

			compareVersions: function (version1, version2) {
				var sWithoutVersion = "WITHOUT VERSION";
				if (version1 === sWithoutVersion || !version1) {
					return -1;
				}

				if (version2 === sWithoutVersion || !version2) {
					return 1;
				}

				var version1Arr = version1.split(".");
				var version2Arr = version2.split(".");
				var version1Major = parseInt(version1Arr[0], 10);
				var version1Minor = parseInt(version1Arr[1], 10);
				var version2Major = parseInt(version2Arr[0], 10);
				var version2Minor = parseInt(version2Arr[1], 10);

				if (version1Major > version2Major ||
					(version1Major === version2Major && version1Minor > version2Minor)) {
					return -1;
				}

				if (version2Major > version1Major ||
					(version2Major === version1Major && version2Minor > version1Minor)) {
					return 1;
				}

				return 0;
			},

			formatTitle: function (sTitle) {
				return sTitle ? "As of " + sTitle : "Version N/A";
			},

			formatDescription: function (sText) {
				sText = this.formatLinks(sText);
				sText = sText.replace("<p>", '');
				sText = sText.replace("</p>", '');

				return sText;
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

			_resizeMessageStrip: function (oMedia) {
				var oView = this.getView();

				oMedia = oMedia || oView._getCurrentMediaContainerRange();

				var sName = oMedia.name,
					oMessageStripContainer = this.byId("deprecatedAPIStripContainer")
						|| this.byId("experimentalAPIStripContainer");

				if (!oMessageStripContainer) {
					return;
				}

				if (sName === "Desktop" || sName === "LargeDesktop") {
					oMessageStripContainer.setWidth("calc(100% - 3rem)");
				} else if (sName === "Tablet" || sName === "Phone") {
					oMessageStripContainer.setWidth("calc(100% - 2rem)");
				}
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
