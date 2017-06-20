/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
        "jquery.sap.global",
        "sap/ui/documentation/sdk/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/documentation/sdk/controller/util/JSDocUtil"
    ], function (jQuery, BaseController, JSONModel, JSDocUtil) {
        "use strict";

        return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetailDeprecatedExperimental", {

            /* =========================================================== */
            /* lifecycle methods										   */
            /* =========================================================== */

            onInit: function () {
                this.setModel(new JSONModel(), "deprecatedAPIs");
                this.setModel(new JSONModel(), "experimentalAPIs");

                this.getRouter().getRoute("deprecated").attachPatternMatched(this._onTopicMatched, this);
                this.getRouter().getRoute("experimental").attachPatternMatched(this._onTopicMatched, this);

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

            _onTopicMatched: function (oEvent) {
                if (this._hasMatched) {
                    return;
                }

                this._hasMatched = true;

                this.getOwnerComponent().fetchAPIInfoAndBindModels().then(function () {
                    var aLibsData = this.getOwnerComponent().getModel("libsData").getData();

                    this.getModel("deprecatedAPIs").setData(aLibsData.deprecated);
                    this.getModel("experimentalAPIs").setData(aLibsData.experimental);

                    setTimeout(this._prettify, 0);
                }.bind(this));
            },

            _prettify: function () {
				// Google Prettify requires this class
				jQuery('pre').addClass('prettyprint');

				window.prettyPrint();
			},

            compareVersions: function (version1, version2) {
                var sWithoutVersion = "WITHOUT VERSION";
                if (version1 === sWithoutVersion) {
                    return -1;
                }

                if (version2 === sWithoutVersion) {
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
                if (sEntityType === "method") {
                    return sControlName + "#" + sEntityName;
                }

                if (sEntityType === "event") {
                    return sControlName + "#event:" + sEntityName;
                }
            },

            onApiPress: function (oControlEvent) {
                var oCustomData = oControlEvent.getSource().getCustomData();

                this.getRouter().navTo("apiId", {
                    id: oCustomData[0].getValue(),
                    entityId: oCustomData[1].getValue(),
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

                var sFormattedTextBlock = JSDocUtil.formatTextBlock(sText, {
                    linkFormatter: function (target, text) {

                        var p;

                        // If the link has a protocol, do not modify, but open in a new window
                        if (target.match("://")) {
                            return '<a target="_blank" href="' + target + '">' + (text || target) + '</a>';
                        }

                        target = target.trim().replace(/\.prototype\./g, "#");
                        p = target.indexOf("#");
                        if (p === 0) {
                            // a relative reference - we can't support that
                            return "<code>" + target.slice(1) + "</code>";
                        }

                        if (p > 0) {
                            text = text || target; // keep the full target in the fallback text
                            target = target.slice(0, p);
                        }

                        return "<a class=\"jsdoclink\" href=\"javascript:void(0);\">" + (text || target) + "</a>";

                    }
                });

                return sFormattedTextBlock;
            },

            onJSDocLinkClick: function (oEvt) {
                // get target
                var bJSDocLink = oEvt.target.classList.contains("jsdoclink"),
                    sType = oEvt.target.text,
                    sEntity,
                    sMethod,
                    iDelitemeterIndex;

                if (!bJSDocLink) {
                    return;
                }

                if (sType) {
                    if (sType.indexOf('#') >= 0) {
                        iDelitemeterIndex = sType.indexOf('#');
                    } else {
                        iDelitemeterIndex = sType.lastIndexOf('.');
                    }

                    sEntity = sType.substring(0, iDelitemeterIndex);
                    sMethod = sType.substring(iDelitemeterIndex + 1);

                    this.getRouter().navTo("apiId", {
                        id: sEntity,
                        entityId: sMethod,
                        entityType: "method"
                    }, false);
                    oEvt.preventDefault();
                }
            },

            _resizeMessageStrip: function (oMedia) {
                var oView = this.getView();

                oMedia = oMedia || oView._getCurrentMediaContainerRange();

                var sName = oMedia.name,
                    oMessageStripContainer = this.getView().byId("deprecatedAPIStripContainer")
                        || this.getView().byId("experimentalAPIStripContainer");

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
