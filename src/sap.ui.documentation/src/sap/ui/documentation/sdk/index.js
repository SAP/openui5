/*!
 * ${copyright}
 */

(function(){
    "use strict";
    var getUrlParam = function(sParamName) {
        return new window.URLSearchParams(window.location.search).get(sParamName);
    },

    sSampleId = getUrlParam('sap-ui-xx-sample-id'),
    sOrigin = getUrlParam('sap-ui-xx-sample-origin'),
    sPresetTheme = getUrlParam('sap-ui-theme') || 'sap_fiori_3',
    sPresetRTL = getUrlParam('sap-ui-rtl') || false,
    sPresetDensity = getUrlParam('sap-ui-density'),
    oPath = {},
    bIsStandAlone = window.location === window.parent.location,

    postMessageToOrigin = function(data) {
        if (!bIsStandAlone) {
            window.parent.postMessage(data, getUrlParam('sap-ui-xx-dk-origin'));
        }
    };

    window.onInit = function() {
        postMessageToOrigin({
            type: "LOAD"
        });
            sap.ui.require([
                "sap/ui/core/ComponentContainer",
                "sap/ui/core/Component",
                "sap/ui/documentation/library",
                "sap/base/Log",
                "sap/ui/thirdparty/jquery"
            ], function (ComponentContainer, Component, library, Log, jQuery) {
                var setDensityClass = function(sDensityClass) {
                    var sBodyDensityClass = Array.prototype.find.call(document.body.classList, function(el){
                        return el.includes("sapUiSize");
                    });
                    return sBodyDensityClass ? document.body.classList.replace(sBodyDensityClass, sDensityClass) :
                    document.body.classList.add(sDensityClass);
                };

                if (sPresetDensity) {
                    setDensityClass(sPresetDensity);
                }
                var oLibraryInfoSingleton = library._getLibraryInfoSingleton();
                oLibraryInfoSingleton.getResourceUrl = undefined;

                var loadInfo = function() {
                    return new Promise(function (resolve) {
                        var fnCallback = function(oAppInfo) {
                            var aLibPromises = [];
                            if (oAppInfo && oAppInfo.libraries) {
                                oAppInfo.libraries.forEach(function(oLib) {
                                    var oLibPromise = new Promise(function(innResolve) {
                                        oLibraryInfoSingleton._getDocuIndex(oLib.name, function(oDoc) {
                                        if (!oDoc.explored) {
                                            innResolve();
                                            return;
                                        }

                                        if (Array.isArray(oDoc.explored.samplesRef)) {
                                            // register an array of namespaces
                                            oDoc.explored.samplesRef.forEach(function (oItem) {
                                                var paths = {};
                                                paths[oItem.namespace.replace(/\./g, "/")] = "" + (oItem.ref || ".");
                                                sap.ui.loader.config({paths: paths});
                                            });
                                        } else {
                                            // register a single namespace

                                            var paths = {};
                                            paths[oDoc.explored.samplesRef.namespace.replace(/\./g, "/")] = "" + (oDoc.explored.samplesRef.ref || ".");
                                            sap.ui.loader.config({paths: paths});
                                        }
                                        innResolve();
                                        });
                                    });
                                    aLibPromises.push(oLibPromise);
                                });
                            }
                            Promise.all(aLibPromises).then(function(){
                                resolve();
                            });
                        };
                        var sUrl = sap.ui.require.toUrl("sap-ui-version.json");
                        jQuery.ajax({
                            url: sUrl,
                            dataType: "json",
                            error: function(xhr, status, e) {
                                Log.error("failed to load library list from '" + sUrl + "': " + status + ", " + e);
                                resolve();
                            },
                            success : function(oAppInfo, sStatus, oXHR) {
                                if (!oAppInfo) {
                                    Log.error("failed to load library list from '" + sUrl + "': " + sStatus + ", Data: " + oAppInfo);
                                    resolve();
                                    return;
                                }

                                fnCallback(oAppInfo);
                            }
                        });
                    });
                };

                loadInfo().then(function(){

                    Log.info("Samples paths added successfully");
                    var sCompId = 'sampleComp-' + sSampleId;
                    var sCompName = sSampleId;

                    Promise.all([
                        sap.ui.getCore().loadLibrary("sap.ui.fl", {async: true}),
                        sap.ui.getCore().loadLibrary("sap.ui.rta", {async: true})
                    ]).then(function () {
                        sap.ui.require([
                            "sap/ui/fl/Utils",
                            "sap/ui/fl/FakeLrepConnectorLocalStorage",
                            "sap/ui/core/util/reflection/JsControlTreeModifier"
                        ], function(Utils,
                                FakeLrepConnectorLocalStorage,
                                JsControlTreeModifier) {
                                // fake stable IDs
                                JsControlTreeModifier.checkControlId = function () {
                                    return true;
                                };
                                Utils.checkControlId = function() {
                                    return true;
                                };
                                FakeLrepConnectorLocalStorage.enableFakeConnector({
                                    "isProductiveSystem": true
                                });
                                postMessageToOrigin({
                                type: "RTA",
                                data: {
                                    "msg": "RTA is loaded"
                                }
                            });
                        });
                    });

                    Component.create({
                        id: sCompId,
                        name: sCompName
                    }).then(function (oComponent) {

                        var oContainer = new ComponentContainer({component : oComponent, height: "100%"})
                                .placeAt("content");

                        var oConfig = oComponent.getMetadata().getConfig();
                        var bOpenStandalone = new URLSearchParams(window.location.search).has("dk-sample-standalone");
                        // if dk-sample-standalone is used,
                        // display message for samples with own index.html
                        if (bOpenStandalone && oConfig.sample && oConfig.sample.iframe) {
                            sap.ui.require([
                                "sap/m/IllustratedMessage",
                                "sap/m/IllustratedMessageType"
                            ], function (IllustratedMessage, IllustratedMessageType) {
                                oContainer.destroy();
                                new IllustratedMessage({
                                    title: "Sample unsupported",
                                    description: "Samples with own index.html are currently unsupported by dk-sample-standalone.",
                                    illustrationType: IllustratedMessageType.PageNotFound
                                }).placeAt("content");
                            });
                        }
                        var oMessage = {};
                        var objRta = null;
                        oMessage.type = "INIT";
                        oMessage.data = {
                            "msg": "fired after component container is placed in DOM"
                        };

                        oMessage.config = oComponent.getMetadata().getConfig();
                        postMessageToOrigin(oMessage);
                        window.addEventListener("message", function(eMessage){
                            if (eMessage.data.type === "EXIT") {
                                oComponent.destroy();
                            } else if (eMessage.data.type === "RTA") {
                                enableRta();
                            } else if (eMessage.data.type === "SETTINGS") {
                                if (eMessage.data.reason === "get") {
                                    postMessageToOrigin({
                                    type: "SETTINGS",
                                    data: {
                                        "density": document.body.classList[1],
                                        "theme": sap.ui.getCore().getConfiguration().getTheme(),
                                        "RTL": sap.ui.getCore().getConfiguration().getRTL()
                                    }
                                });
                                } else if (eMessage.data.reason === "set") {
                                    setDensityClass(eMessage.data.data.density);
                                    sap.ui.getCore().getConfiguration().setRTL(eMessage.data.data.RTL);
                                    sap.ui.getCore().applyTheme(eMessage.data.data.theme);
                                }
                            }
                        });

                        function enableRta() {
                            if (objRta) {
                                objRta.stop();
                                objRta = null;
                                return;
                            }
                            sap.ui.require([
                                "sap/ui/rta/api/startKeyUserAdaptation"
                            ], function (
                                startKeyUserAdaptation
                            ) {
                                startKeyUserAdaptation({
                                    rootControl: oContainer.getComponentInstance()
                                }).then(function (oRta) {
                                    objRta = oRta;
                                    oContainer.$().css({
                                        "padding-top": "2.5rem",
                                        "box-sizing": "border-box"
                                    });
                                    oRta.attachStop(function () {
                                        oContainer.$().css({
                                            "padding-top": "0",
                                            "box-sizing": "content-box"
                                        });
                                        oRta.destroy();
                                    });
                                });
                            });
                        }
                    }).catch(function(err){
                        postMessageToOrigin({
                            type: "ERR",
                            data: {
                                "msg": err
                            }
                        });
                    });
                });
            });
        };

    if (sOrigin === "" || sOrigin === ".") {
        var sHref = document.location.href;
        sOrigin = sHref.substring(0, sHref.lastIndexOf('resources/sap/ui/documentation/sdk/') - 1);
    } else {
        sOrigin = new URL(sOrigin, document.baseURI).pathname;
    }

    var sOriginEncoded = encodeURI(sOrigin);

    oPath["sap/ui/demo/mock"] = sOriginEncoded + "/test-resources/sap/ui/documentation/sdk";
    oPath["test-resources/sap/ui/documentation/sdk"] = ".";

    var oBaseTag = document.createElement("base");
    oBaseTag.setAttribute("href", sOriginEncoded + "/");
    document.head.appendChild(oBaseTag);

    var oScriptTag = document.createElement("script");
    oScriptTag.setAttribute("src", sOriginEncoded + "/resources/sap-ui-core.js");
    oScriptTag.setAttribute("id", "sap-ui-bootstrap");
    oScriptTag.dataset.sapUiLibs = "sap.m";
    oScriptTag.dataset.sapUiAsync = true;
    oScriptTag.dataset.sapUiRtl = sPresetRTL;
    oScriptTag.dataset.sapUiResourceroots = JSON.stringify(oPath);
    oScriptTag.dataset.sapUiTheme = sPresetTheme;
    oScriptTag.dataset.sapUiCompatversion = "edge";
    oScriptTag.dataset.sapUiOninit = "onInit";
    oScriptTag.dataset.sapUiBindingsyntax = "complex";

    document.write(oScriptTag.outerHTML);

})();
