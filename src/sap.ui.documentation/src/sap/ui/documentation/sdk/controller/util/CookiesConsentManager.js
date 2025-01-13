/*!
 * ${copyright}
 */

/**
 * @fileOverview This module provides a factory for creating a consent manager based on the configuration.
 * The consent manager is responsible for checking the user's consent for using cookies and tracking.
 * The consent manager is also responsible for showing the consent dialog.
 * The consent manager is created based on the configuration.
 * If the configuration includes usage tracking, a third-party consent manager is created.
 * If the configuration does not include usage tracking, a default consent manager is created.
 * The third-party consent manager is responsible for checking the user's consent for using cookies and tracking
 * by using the TrustArc API.
 * The default consent manager is responsible for checking the user's consent for using cookies and tracking
 * by using the cookie settings dialog.
 **/
sap.ui.define(
    ["sap/ui/base/Object", "sap/ui/thirdparty/URI", "sap/base/Log"],
    function (BaseObject, URI, Log) {
        "use strict";

        const TRUST_ARC = {
            BASE_URL: "https://consent.trustarc.com/notice",
            URL_QUERY: "?domain=ui5.sap.com&c=teconsent&gtm=1&pcookie&js=nj&noticeType=bb&pn=1-0&privacypolicylink=https%3A%2F%2Fwww.sap.com%2Fabout%2Flegal%2Fprivacy.html&text=true&gtm=1",
            get COMPLETE_URL() {
                return this.BASE_URL + this.URL_QUERY;
            },
            CONSENT_BAR_ID: "teconsent",
            get CONSENT_BAR_HTML() {
                return `<div id="consent_blackbar" style="position: fixed; bottom: 0px; z-index: 1000000; width: 100%;"></div>
                    <div id="${this.CONSENT_BAR_ID}"></div>`;
            }
        };

        const CONSENT_DECISION = {
            PENDING: 0,
            REQUIRED_COOKIES_PERMITTED: 1,
            FUNCTIONAL_COOKIES_PERMITTED: 2,
            ADVERTISING_COOKIES_PERMITTED: 3
        };

        const TRACKED_HOSTNAMES = {
            // complementary list and regex for the hostnames that should be tracked
            "LIST": ["ui5.sap.com", "sdk.openui5.org"],
            "REGEX": /^(sapui5|openui5)([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?\.hana\.ondemand\.com$/
        };

        var DefaultConsentManager = BaseObject.extend(
            "sap.ui.documentation.sdk.controller.util.DefaultConsentManager",
            {
                constructor: function (oComponent, oConfig) {
                    this._oCmponent = oComponent;
                    this._oConfigUtil = oComponent.getConfigUtil();
                    this._sConsentDialogComponentId = oConfig.defaultConsentDialogComponentId;
                    this._oConsentDialogComponent = null;
                    this._oLoadPromise = null;
                    this._load();
                },
                _load: function() {
                    if (!this._oLoadPromise) {
                        this._oLoadPromise = this._oCmponent.createComponent({
                            usage: "cookieSettingsDialog",
                            id: 'cookiesComp-' + this._sConsentDialogComponentId
                        }).then(function(oConsentDialogComponent) {
                            this._oConsentDialogComponent = oConsentDialogComponent;
                            oConsentDialogComponent.enable(this._oCmponent.getRootControl());
                        }.bind(this));
                    }

                    return this._oLoadPromise;
                },
                checkUserAcceptsRequiredCookies(fnCallback) {
                    var bAccepts = this._oConfigUtil.getCookieValue(this._oConfigUtil.COOKIE_NAMES.ALLOW_REQUIRED_COOKIES) === "1";
                    fnCallback(bAccepts);
                },
                checkUserAcceptsUsageTracking(fnCallback) {
                    fnCallback(false); // no usage tracking provisioned in this case
                },
                showDialog: function(oRootView) {
                    this._load().then(function() {
                        this._oConsentDialogComponent.cookieSettingsDialogOpen({ showCookieDetails: true }, oRootView);
                    });
                },
                exit: function () {
                  if (this._oConsentDialogComponent) {
                    this._oConsentDialogComponent.destroy();
                  }
                }
            }
        );

        var ThirdPartyConsentManager = DefaultConsentManager.extend(
            "sap.ui.documentation.sdk.controller.util.ThirdPartyConsentManager",
            {
                constructor: function () {
                    this._oGetDecisionPromise = null;
                },
                // override
                checkUserAcceptsRequiredCookies(fnCallback) {
                    this.getConsentDecision(function(iConsentDecision) {
                         fnCallback(iConsentDecision >= CONSENT_DECISION.REQUIRED_COOKIES_PERMITTED);
                     });
                 },
                checkUserAcceptsUsageTracking(fnCallback) {
                     this.getConsentDecision(function(iConsentDecision) {
                         fnCallback(iConsentDecision >= CONSENT_DECISION.FUNCTIONAL_COOKIES_PERMITTED);
                     });
                },
                getConsentDecision: function (fnCallback) {
                    var iConsentDecision = this._getConsentDecisionSync(),
                        bDecisionAvailable = iConsentDecision > CONSENT_DECISION.PENDING;
                    if (bDecisionAvailable) {
                        fnCallback(iConsentDecision);
                        return;
                    }
                    this._getConsentDecisionAsync().then(fnCallback);
                },
                _getConsentDecisionSync: function() {
                    return window.truste?.cma?.callApi("getConsentDecision", document.domain)?.consentDecision;
                },
                _getConsentDecisionAsync: function () {
                    if (!this._oGetDecisionPromise) {
                        this._oGetDecisionPromise = new Promise(function(resolve, reject) {
                            function onTrustArcReady() {
                                var iConsentDecision = this._getConsentDecisionSync();
                                if (iConsentDecision === CONSENT_DECISION.PENDING) { // user has not made a decision yet
                                    this._waitForSubmitPreferences()
                                    .then(function() {
                                        resolve(this._getConsentDecisionSync());
                                    }.bind(this));
                                } else {
                                    resolve(iConsentDecision);
                                }
                            }

                            if (!this._isTrustArcReady()) {
                                this._load()
                                .then(this._waitForTrustArcReady.bind(this))
                                .then(onTrustArcReady.bind(this));
                            } else {
                                onTrustArcReady.call(this);
                            }
                        }.bind(this));
                    }
                    return this._oGetDecisionPromise;
                },
                _isTrustArcReady: function() {
                    return typeof truste !== 'undefined' && window.truste.cma;
                },
                _waitForTrustArcReady: function () {
                    return new Promise(function(resolve, reject) {
                        var checkInterval = setInterval(function() {
                            if (typeof truste !== 'undefined' && window.truste.cma) {
                                clearInterval(checkInterval);
                                Log.trace('TrustArc API is ready');
                                resolve();
                            }
                        }, 100); // Check every 100 milliseconds
                    });
                },
                _waitForSubmitPreferences: function() {
                    return new Promise(function(resolve, reject) {
                        var oMessage = this._composeApiRequest("getConsentDecision");
                        window.top.postMessage(oMessage,"*");
                        var fnListener = function(oEvent) {
                            var oData = JSON.parse(oEvent.data);
                            if (oData.source === "preference_manager" && oData.message === "submit_preferences") {
                                resolve();
                                window.removeEventListener("message", fnListener);
                            }
                        };
                        window.addEventListener("message", fnListener, false);
                    }.bind(this));
                },
                _composeApiRequest: function(sAction) {
                    const apiObject = {
                        PrivacyManagerAPI:{
                            action: sAction,
                            timestamp: new Date().getTime(),
                            self: document.domain
                        }
                    };
                    return JSON.stringify(apiObject);
                },
                // override
                _load: function() {
                    return new Promise(function(resolve, reject) {
                        if (this._isTrustArcScriptIncluded()) {
                            resolve();
                            return;
                        }
                        var oConsetBarElement = this._appendTrustArcConsentBar(),
                            oScript = this._createTrustArcScriptElement();
                        oScript.addEventListener("load", function() {
                            Log.trace('TrustArc initialization stript loaded successfully');
                            resolve();
                        });
                        oScript.addEventListener('error', function(oError) {
                            Log.error("Error loading TrustArc initialization stript ", oError);
                            reject();
                        });
                        this._appendDOMElementAfter(oScript, oConsetBarElement);
                    }.bind(this));
                },
                _appendTrustArcConsentBar: function() {
                    var oConsentElement = document.getElementById(TRUST_ARC.CONSENT_BAR_ID);
                    if (!oConsentElement) {
                        var oRootDOMElement = this._createHTMLforTrustArc();
                        document.body.insertBefore(oRootDOMElement, document.body.firstChild);
                        oConsentElement = document.getElementById(TRUST_ARC.CONSENT_BAR_ID);
                    }
                    return oConsentElement;
                },
                _createHTMLforTrustArc: function() {
                    var oRootDOMElement = document.createElement("div");
                    oRootDOMElement.innerHTML = TRUST_ARC.CONSENT_BAR_HTML;
                    return oRootDOMElement;
                },
                _appendDOMElementAfter: function(newElement, referenceElement) {
                    const parent = referenceElement.parentNode;
                    if (parent.lastChild === referenceElement) {
                        parent.appendChild(newElement);
                    } else {
                        parent.insertBefore(newElement, referenceElement.nextSibling);
                    }
                },
                _createTrustArcScriptElement: function() {
                    var oScript = document.createElement("script");
                    oScript.src = TRUST_ARC.COMPLETE_URL;
                    oScript.async = true;
                    oScript.crossOrigin = "anonymous";
                    return oScript;
                },
                _isTrustArcScriptIncluded: function() {
                    const scripts = document.getElementsByTagName('script');
                    for (let i = 0; i < scripts.length; i++) {
                        const src = scripts[i].getAttribute('src');
                        if (src && src.startsWith(TRUST_ARC.BASE_URL)) {
                            return true;
                        }
                    }
                    return false;
                },
                // override
                showDialog: function() {
                    // not supported
                }
            }
        );

        var CookiesConsentManager = {
            create: function (oComponent, oConfig) {
                if (this._configIncludesUsageTracking()) {
                    return new ThirdPartyConsentManager(oComponent, oConfig);
                } else {
                    return new DefaultConsentManager(oComponent, oConfig);
                }
            },

            _configIncludesUsageTracking: function () {
                var oUri = new URI(window.location.href);
                if (oUri.hasQuery("sap-ui-xx-tracking")) {
                    var trackingValue = oUri.query(true)["sap-ui-xx-tracking"];
                    if (trackingValue === "true" || trackingValue === "false") {
                        return trackingValue === "true";
                    }
                }

                var sHostname = oUri.hostname();
                return TRACKED_HOSTNAMES.LIST.includes(sHostname) ||
                    TRACKED_HOSTNAMES.REGEX.test(sHostname);
            }
        };

        return CookiesConsentManager;
    }
);
