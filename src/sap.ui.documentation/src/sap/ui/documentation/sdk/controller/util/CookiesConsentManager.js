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
            },
            CATEGORIES: {
                "REQUIRED_COOKIES": "Required Cookies",
                "FUNCTIONAL_COOKIES": "Functional Cookies",
                "ADVERTISING_COOKIES": "Advertising Cookies"
            },
            CONSENT_DECISION:{
                FOR_CATEGORY: {
                    "PENDING": 0,
                    "REQUIRED_COOKIES_PERMITTED": 1,
                    "FUNCTIONAL_COOKIES_PERMITTED": 2,
                    "ADVERTISING_COOKIES_PERMITTED": 3
                },
                FOR_DOMAIN: {
                    "OPTED_OUT": 0,
                    "OPTED_IN": 1,
                    "NO_PREFERENCE": 2
                }
            },
            DOMAINS: {
                FOR_DISPLAY_SETTINGS: ["ui5.sap.com", "openui5.hana.ondemand.com"],
                FOR_VIDEOS: ["youtube.com", "www.youtube.com"],
                OF_THIRD_PARTY_INTEREST: ["google.com"]
            },
            CONSENT_PREFERENCES_ORIGIN_WHITELIST: ["https://consent-pref.trustarc.com", window.origin]
        };

        const TRACKED_HOSTNAMES = {
            // complementary list and regex for the hostnames that should be tracked
            "LIST": ["ui5.sap.com", "sdk.openui5.org"],
            "REGEX": /^(sapui5|openui5)([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?\.hana\.ondemand\.com$/
        };

        // shorthand for TrustArc constants
        const oCookieCategories = TRUST_ARC.CATEGORIES,
            oCategoryDecisionType = TRUST_ARC.CONSENT_DECISION.FOR_CATEGORY,
            oDomainDecisionType = TRUST_ARC.CONSENT_DECISION.FOR_DOMAIN;

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
                checkUserAcceptsToPersistDisplaySettings(fnCallback) {
                    var bAccepts = this._oConfigUtil.getCookieValue(this._oConfigUtil.COOKIE_NAMES.ALLOW_FUNCTIONAL_COOKIES) === "1";
                    fnCallback(bAccepts);
                },
                checkUserAcceptsUsageTracking(fnCallback) {
                    fnCallback(false); // no usage tracking provisioned in this case
                },
                showPreferencesDialog: function(oRootView) {
                    this._load().then(function() {
                        this._oConsentDialogComponent.openCookieSettingsDialog({ showCookieDetails: true }, oRootView);
                    }.bind(this));
                },
                supportsWaitForPreferencesSubmission() {
                    return false;
                },
                waitForPreferencesSubmission: function () {
                    throw new Error("Not supported. Check supportsWaitForPreferencesSubmission method first.");
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
                checkUserAcceptsToPersistDisplaySettings(fnCallback) {
                    this.getConsentDecision(function(iConsentDecision) {
                        var bAcceptsCategory = iConsentDecision >= oCategoryDecisionType.FUNCTIONAL_COOKIES_PERMITTED,
                            bAccepts = false;
                        if (bAcceptsCategory) {
                            bAccepts = !this._areAdditionalPreferencesSpecified(oCookieCategories.FUNCTIONAL_COOKIES)
                            || this._checkAdditionalPreferencesAllowDisplaySettings();
                        }
                        fnCallback(bAccepts);
                    }.bind(this));
                },
                // override
                checkUserAcceptsUsageTracking(fnCallback) {
                    this.getConsentDecision(function(iConsentDecision) {
                        var bAcceptsCategory = iConsentDecision >= oCategoryDecisionType.FUNCTIONAL_COOKIES_PERMITTED,
                            bAccepts = false;
                        if (bAcceptsCategory) {
                            bAccepts = !this._areAdditionalPreferencesSpecified(oCookieCategories.FUNCTIONAL_COOKIES)
                            || this._checkAdditionalPreferencesAllowUsageTracking();
                        }
                        fnCallback(bAccepts);
                    }.bind(this));
                },
                getConsentDecision: function (fnCallback) {
                    var iConsentDecision = this._getConsentDecisionSync(),
                        bDecisionAvailable = iConsentDecision > oCategoryDecisionType.PENDING;
                    if (bDecisionAvailable) {
                        fnCallback(iConsentDecision);
                        return;
                    }
                    this._getConsentDecisionAsync().then(fnCallback);
                },
                _checkAdditionalPreferencesAllowUsageTracking: function () {
                    var oPreferencesPerDomain = this._getAdditionalPreferencesPerDomain(oCookieCategories.FUNCTIONAL_COOKIES),
                        aUsageTrackingDomains = Object.keys(oPreferencesPerDomain).filter(this._isDomainForUsageTracking),
                        fnIsDomainOptedIn = function(sDomain) {
                            return parseInt(oPreferencesPerDomain[sDomain]) === oDomainDecisionType.OPTED_IN;
                        };
                    return aUsageTrackingDomains.every(fnIsDomainOptedIn);
                },
                _checkAdditionalPreferencesAllowDisplaySettings: function () {
                    var oPreferencesPerDomain = this._getAdditionalPreferencesPerDomain(oCookieCategories.FUNCTIONAL_COOKIES);
                    return TRUST_ARC.DOMAINS.FOR_DISPLAY_SETTINGS.every(function(sDomain) {
                        return this._isDomainOptedIn(sDomain, oPreferencesPerDomain);
                    }.bind(this));
                },
                _isDomainOptedIn: function (sDomain, oPreferencesPerDomain) {
                    return parseInt(oPreferencesPerDomain[sDomain]) === oDomainDecisionType.OPTED_IN;
                },
                _getConsentDecisionSync: function() {
                    return window.truste?.cma?.callApi("getConsentDecision", getHostName())?.consentDecision;
                },
                _getConsentDecisionAsync: function () {
                    if (!this._oGetDecisionPromise) {
                        this._oGetDecisionPromise = new Promise(function(resolve, reject) {
                            function onTrustArcReady() {
                                var iConsentDecision = this._getConsentDecisionSync();
                                if (iConsentDecision === oCategoryDecisionType.PENDING) { // user has not made a decision yet
                                    this.waitForPreferencesSubmission()
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
                _areAdditionalPreferencesSpecified: function (sConsentCategory) {
                    var oPreferencesPerDomain = this._getAdditionalPreferencesPerDomain(sConsentCategory);
                    return Object.keys(oPreferencesPerDomain).length > 0;
                },
                _getAdditionalPreferencesPerDomain: function (sConsentCategory) {
                    var oCategories = window.truste?.cma?.callApi("getConsentCategories",getHostName())?.categories,
                        bAdditionalPreferencesDefined = oCategories && oCategories[sConsentCategory],
                        oPreferencesPerDomain = {};
                    if (bAdditionalPreferencesDefined) {
                        oPreferencesPerDomain = oCategories[sConsentCategory]?.domains;
                        oPreferencesPerDomain = Object.assign({}, oPreferencesPerDomain); // keep the original object intact
                    }
                    return oPreferencesPerDomain;
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
                // override
                supportsWaitForPreferencesSubmission() {
                    return true;
                },
                // override
                waitForPreferencesSubmission: function () {
                    return new Promise(function(resolve, reject) {
                        var oMessage = this._composeApiRequest("getConsentDecision");
                        window.top.postMessage(oMessage,"*");
                        var fnListener = function(oEvent) {
                            if (!TRUST_ARC.CONSENT_PREFERENCES_ORIGIN_WHITELIST.includes(oEvent.origin)) {
                                return;
                            }
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
                            self: getHostName()
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
                showPreferencesDialog: function() {
                    this._load().then(function () {
                        var consentBarLinkSelector = "#" + TRUST_ARC.CONSENT_BAR_ID + " a",
                            consentBarLink = document.querySelector(consentBarLinkSelector);
                        if (consentBarLink) {
                            this._simulateClick(consentBarLink);
                        }
                    }.bind(this));
                },
                _simulateClick: function (element) {
                    var event = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    element.dispatchEvent(event);
                },
                _isDomainForUsageTracking: function(sDomain) {
                    return !TRUST_ARC.DOMAINS.FOR_DISPLAY_SETTINGS.includes(sDomain)
                        && !TRUST_ARC.DOMAINS.FOR_VIDEOS.includes(sDomain)
                        && !TRUST_ARC.DOMAINS.OF_THIRD_PARTY_INTEREST.includes(sDomain);
                }
            }
        );

        // utility function
        function getHostName() {
            return new URI(window.location.href).hostname();
        }

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
                return CookiesConsentManager._checkHostnameIsTracked(sHostname);
            },

            _checkHostnameIsTracked: function (sHostname) {
                return TRACKED_HOSTNAMES.LIST.includes(sHostname) ||
                    TRACKED_HOSTNAMES.REGEX.test(sHostname);
            }
        };

        return CookiesConsentManager;
    }
);
