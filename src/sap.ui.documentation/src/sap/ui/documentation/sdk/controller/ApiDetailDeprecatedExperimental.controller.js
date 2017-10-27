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

		return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetailDeprecatedExperimental", {

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.setModel(new JSONModel(), "deprecatedAPIs");
				this.setModel(new JSONModel(), "experimentalAPIs");

				this.getRouter().getRoute("deprecated").attachPatternMatched(this._onTopicDeprecatedMatched, this);
				this.getRouter().getRoute("experimental").attachPatternMatched(this._onTopicExperimentalMatched, this);

				// click handler for @link tags in JSdoc fragments
				this.getView().attachBrowserEvent("click", this.onJSDocLinkClick, this);

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
				this.getView().detachBrowserEvent("click", this.onJSDocLinkClick, this);
				this.getView()._detachMediaContainerWidthChange(this._resizeMessageStrip, this);
			},

			_onTopicDeprecatedMatched: function (oEvent) {
				if (this._hasMatched) {
					return;
				}

				this._hasMatched = true;

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

				APIInfo.getExperimentalPromise().then(function (oData) {
					this.getModel("experimentalAPIs").setData(oData);
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
				if (sTitle === "Without Version") {
					return sTitle;
				} else {
					return "As of " + sTitle;
				}
			},

			formatDescription: function (sText, sSince) {
				if (sSince) {
					sText = "As of version " + sSince + ", " + sText;
				}

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

			onApiPress: function (oControlEvent) {
				var oCustomData = oControlEvent.getSource().getCustomData(),
					sClassName = oCustomData[0].getValue(),
					sEntityId = oCustomData[1].getValue();

				// oCustomData[3].getValue() is true if method is static, else it is false
				if (oCustomData[3].getValue()) {
					sEntityId = sClassName + "." + sEntityId;
				}

				this.getRouter().navTo("apiId", {
					id: sClassName,
					entityId: sEntityId,
					entityType: oCustomData[2].getValue()
				}, false);
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

						return "<a class=\"jsdoclink\" href=\"javascript:void(0);\" target=\"" + target + "\">" + text + "</a>";

					}
				});
			},

			onJSDocLinkClick: function (oEvent) {
				// get target
				var sRoute = "apiId",
					bJSDocLink = oEvent.target.classList.contains("jsdoclink"),
					oComponent = this.getOwnerComponent(),
					sTarget = oEvent.target.getAttribute("target"),
					aNavInfo;

				if (!bJSDocLink || !sTarget) {
					return;
				}

				if (sTarget.indexOf('/') >= 0) {
					// link refers to a method or event target="<class name>/methods/<method name>" OR
					// target="<class name>/events/<event name>
					aNavInfo = sTarget.split('/');

					oComponent.getRouter().navTo(sRoute, {
						id: aNavInfo[0],
						entityType: aNavInfo[1],
						entityId: aNavInfo[2]
					}, false);
				} else {
					oComponent.getRouter().navTo(sRoute, { id: sTarget }, false);
				}

				oEvent.preventDefault();
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
			}
		});

	}
);
