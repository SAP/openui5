import UriParameters from "sap/base/util/UriParameters";
import utils from "./_utils";
var has = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
function makeArray(arg) {
    return Array.isArray(arg) ? arg : [arg];
}
function requireP(deps) {
    return new Promise(function (resolve, reject) {
        sap.ui.require(makeArray(deps), function () {
            resolve(Array.prototype.slice.call(arguments));
        }, reject);
    });
}
function copyFiltered(target, source, filter) {
    if (source) {
        for (var key in source) {
            if (has(filter, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}
function ensureDOM() {
    function insertDIV(id) {
        if (document.body.querySelector("#" + id) == null) {
            var elem = document.createElement("div");
            elem.id = id;
            document.body.insertBefore(elem, document.body.firstChild);
        }
    }
    return utils.whenDOMReady().then(function () {
        insertDIV("qunit");
        insertDIV("qunit-fixture");
    });
}
function onCSPViolation(e) {
    var location = e.sourceFile + ":" + e.lineNumber + ":" + e.columnNumber, msg = "Security policy violation: directive '" + e.violatedDirective + "'";
    if (e.blockedURI) {
        msg += " violated by '" + String(e.blockedURI).slice(0, 20) + "'";
    }
    if (QUnit.config.current) {
        QUnit.pushFailure(msg, location);
    }
    else {
        throw new Error(msg + " at " + location);
    }
}
var QUNIT_KNOWN_OPTIONS = {
    altertitle: 1,
    collapse: 1,
    filter: 1,
    fixture: 1,
    hidepassed: 1,
    maxDepth: 1,
    module: 1,
    moduleId: 1,
    notrycatch: 1,
    noglobals: 1,
    seed: 1,
    reorder: 1,
    requireExpects: 1,
    testId: 1,
    testTimeout: 1,
    scrolltop: 1
};
function getActiveVersion(componentConfig, componentName) {
    var versionsMap = componentConfig.versions;
    var version = componentConfig.version || null;
    while (typeof version !== "object") {
        if (!has(versionsMap, version)) {
            throw new TypeError("unsupported " + componentName + " version " + componentConfig.version);
        }
        version = versionsMap[version];
    }
    return version;
}
function initTestModule(oConfig) {
    var pAfterLoader, pQUnit, pSinon, pSinonQUnitBridge, pSinonConfig, pCoverage, pTestEnv, oQUnitConfig, aJUnitDoneCallbacks;
    document.title = oConfig.title;
    if (oConfig.loader) {
        sap.ui.loader.config(oConfig.loader);
    }
    if (oConfig.runAfterLoader) {
        pAfterLoader = requireP(oConfig.runAfterLoader);
    }
    else {
        pAfterLoader = Promise.resolve();
    }
    oQUnitConfig = getActiveVersion(oConfig.qunit, "qunit");
    if (oQUnitConfig != null) {
        window.QUnit = window.QUnit || {};
        QUnit.config = QUnit.config || {};
        if (oConfig.qunit != null && typeof oConfig.qunit === "object") {
            copyFiltered(QUnit.config, oConfig.qunit, QUNIT_KNOWN_OPTIONS);
        }
        QUnit.config.autostart = false;
        pQUnit = pAfterLoader.then(function () {
            return requireP("sap/ui/test/qunitPause");
        }).then(function () {
            utils.addStylesheet(oQUnitConfig.css);
            return requireP(oQUnitConfig.module);
        }).then(function () {
            aJUnitDoneCallbacks = [];
            QUnit.jUnitDone = function (cb) {
                aJUnitDoneCallbacks.push(cb);
            };
            return requireP("sap/ui/qunit/qunit-junit");
        }).then(function () {
            delete QUnit.jUnitDone;
            return requireP("sap/ui/thirdparty/qunit-reporter-junit");
        }).then(function () {
            aJUnitDoneCallbacks.forEach(function (cb) {
                QUnit.jUnitDone(cb);
            });
            aJUnitDoneCallbacks = undefined;
        });
    }
    var oSinonConfig = getActiveVersion(oConfig.sinon, "sinon");
    if (oSinonConfig != null) {
        pSinon = pAfterLoader.then(function () {
            return requireP(oSinonConfig.module);
        });
        if (oConfig.sinon.qunitBridge && pQUnit) {
            pSinonQUnitBridge = Promise.all([
                pQUnit,
                pSinon
            ]).then(function () {
                return requireP(oSinonConfig.bridge);
            });
        }
        if (oConfig.sinon != null && typeof oConfig.sinon === "object") {
            pSinonConfig = Promise.all([
                pSinon,
                pSinonQUnitBridge
            ]).then(function () {
                sinon.config = copyFiltered(sinon.config || {}, oConfig.sinon, sinon.defaultConfig);
                return arguments;
            });
        }
    }
    else if (oQUnitConfig != null) {
        sap.ui.loader.config({
            shim: {
                "sap/ui/thirdparty/sinon-qunit": {
                    deps: [oQUnitConfig.module, "sap/ui/thirdparty/sinon"]
                },
                "sap/ui/qunit/sinon-qunit-bridge": {
                    deps: [oQUnitConfig.module, "sap/ui/thirdparty/sinon-4"]
                }
            }
        });
    }
    pCoverage = pQUnit.then(function () {
        if (QUnit.urlParams.coverage) {
            return requireP("sap/ui/thirdparty/blanket").then(function () {
                if (oConfig.coverage && window.blanket) {
                    if (oConfig.coverage.only != null) {
                        window.blanket.options("sap-ui-cover-only", oConfig.coverage.only);
                    }
                    if (oConfig.coverage.never != null) {
                        window.blanket.options("sap-ui-cover-never", oConfig.coverage.never);
                    }
                    if (oConfig.coverage.branchTracking) {
                        window.blanket.options("branchTracking", true);
                    }
                }
                return requireP("sap/ui/qunit/qunit-coverage");
            }).then(function () {
                QUnit.config.autostart = false;
            });
        }
        else {
            return requireP(["sap/ui/qunit/qunit-coverage"]);
        }
    }).then(function () {
        if (QUnit.urlParams["sap-ui-xx-csp-policy"]) {
            document.addEventListener("securitypolicyviolation", onCSPViolation);
            QUnit.done(function () {
                document.removeEventListener("securitypolicyviolation", onCSPViolation);
            });
        }
        QUnit.config.urlConfig.push({
            id: "sap-ui-xx-csp-policy",
            label: "CSP",
            value: {
                "sap-target-level-1:report-only": "Level 1",
                "sap-target-level-2:report-only": "Level 2"
            },
            tooltip: "What Content-Security-Policy should the server send"
        });
        if (QUnit.urlParams["rtf"] || QUnit.urlParams["repeat-to-failure"]) {
            QUnit.done(function (results) {
                if (results.failed === 0) {
                    setTimeout(function () {
                        location.reload();
                    }, 100);
                }
            });
        }
        QUnit.config.urlConfig.push({
            id: "repeat-to-failure",
            label: "Repeat",
            value: false,
            tooltip: "Whether this test should auto-repeat until it fails"
        });
    });
    pTestEnv = Promise.all([
        pAfterLoader,
        pQUnit,
        pSinon,
        pSinonQUnitBridge,
        pSinonConfig,
        pCoverage
    ]);
    if (oConfig.beforeBootstrap) {
        pTestEnv = pTestEnv.then(function () {
            return requireP(oConfig.beforeBootstrap);
        });
    }
    window["sap-ui-config"] = oConfig.ui5 || {};
    if (Array.isArray(window["sap-ui-config"].libs)) {
        window["sap-ui-config"].libs = window["sap-ui-config"].libs.join(",");
    }
    if (oConfig.bootCore) {
        pTestEnv = pTestEnv.then(function () {
            return new Promise(function (resolve, reject) {
                sap.ui.require(["sap/ui/core/Core"], function (core) {
                    core.boot();
                    core.attachInit(resolve);
                }, reject);
            });
        });
    }
    return pTestEnv.then(function () {
        if (oConfig.autostart) {
            return requireP(oConfig.module).then(function (aTestModules) {
                return Promise.all(aTestModules);
            }).then(function () {
                return ensureDOM();
            }).then(function () {
                if (oConfig.ui5["xx-waitfortheme"] === "init") {
                    return new Promise(function (resolve, reject) {
                        sap.ui.require(["sap/ui/qunit/utils/waitForThemeApplied"], resolve, reject);
                    }).then(function (waitForThemeApplied) {
                        return waitForThemeApplied();
                    });
                }
            }).then(function () {
                QUnit.start();
            });
        }
        else {
            return ensureDOM().then(function () {
                return requireP(oConfig.module).then(function (aTestModules) {
                    return Promise.all(aTestModules);
                });
            });
        }
    });
}
var oParams = UriParameters.fromQuery(window.location.search), sSuiteName = utils.getAttribute("data-sap-ui-testsuite") || oParams.get("testsuite"), sTestName = utils.getAttribute("data-sap-ui-test") || oParams.get("test");
utils.getSuiteConfig(sSuiteName).then(function (oSuiteConfig) {
    var oTestConfig = oSuiteConfig.tests[sTestName];
    if (!oTestConfig) {
        throw new TypeError("Invalid test name");
    }
    return initTestModule(oTestConfig);
}).catch(function (oErr) {
    console.error(oErr.stack || oErr);
    if (typeof QUnit !== "undefined") {
        QUnit.test("Test Starter", function () {
            throw oErr;
        });
        QUnit.start();
    }
    else {
        utils.whenDOMReady().then(function () {
            document.body.style.color = "red";
            document.body.innerHTML = "<pre>" + utils.encode(oErr.stack || oErr.message || String(oErr)) + "</pre>";
        });
    }
});