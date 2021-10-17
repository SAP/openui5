import Log from "sap/base/Log";
import jQuery from "sap/ui/thirdparty/jquery";
function TestSuite() {
    this.aPages = [];
}
TestSuite.prototype.getTestPages = function () {
    return this.aPages;
};
TestSuite.prototype.addTestPage = function (sTestPage, oConfig) {
    if (sTestPage.startsWith("/test-resources/test-resources") || sTestPage.startsWith("/test-resources/resources")) {
        sTestPage = sTestPage.slice("/test-resources".length);
    }
    this.aPages.push(Object.assign({ fullpage: sTestPage }, oConfig));
};
function findPages(sEntryPage, progressCallback) {
    function checkTestPage(oTestPageConfig) {
        return new Promise(function (resolve, reject) {
            const url = new URL(oTestPageConfig.fullpage, window.location.href);
            if (!/testsuite[_.]/.test(url.pathname)) {
                resolve(oTestPageConfig);
                return;
            }
            if (progressCallback) {
                progressCallback(oTestPageConfig.fullpage);
            }
            jQuery.get(oTestPageConfig.fullpage).done(function (sData) {
                if (/(?:window\.suite\s*=|function\s*suite\s*\(\s*\)\s*{)/.test(sData) || (/data-sap-ui-testsuite/.test(sData) && !/sap\/ui\/test\/starter\/runTest/.test(sData)) || /sap\/ui\/test\/starter\/createSuite/.test(sData)) {
                    var $frame = jQuery("<iframe>");
                    var onSuiteReady = function onSuiteReady(oIFrame) {
                        findTestPages(oIFrame).then(function (aTests) {
                            $frame.remove();
                            resolve(Object.assign({
                                tests: aTests,
                                simple: aTests.every((test) => !test.suite)
                            }, oTestPageConfig));
                        }, function (oError) {
                            Log.error("failed to load page '" + oTestPageConfig.fullpage + "'");
                            $frame.remove();
                            resolve(Object.assign({ error: oError }, oTestPageConfig));
                        });
                    };
                    $frame.css("display", "none");
                    $frame.one("load", function () {
                        if (typeof this.contentWindow.suite === "function") {
                            onSuiteReady(this);
                        }
                        else {
                            this.contentWindow.addEventListener("sap-ui-testsuite-ready", function () {
                                onSuiteReady(this);
                            }.bind(this));
                        }
                    });
                    const url = new URL(oTestPageConfig.fullpage, document.baseURI);
                    url.searchParams.set("sap-ui-xx-noless", "true");
                    $frame.attr("src", url);
                    $frame.appendTo(document.body);
                }
                else {
                    resolve(oTestPageConfig);
                }
            }).fail(function (xhr, status, msg) {
                var text = (xhr ? xhr.status + " " : "") + (msg || status || "unspecified error");
                Log.error("Failed to load page '" + oTestPageConfig.fullpage + "': " + text);
                resolve(Object.assign({ error: text }, oTestPageConfig));
            });
        });
    }
    function sequence(aPages) {
        return aPages.reduce((lastPromise, pageConfig) => {
            return lastPromise.then((lastResult) => {
                return checkTestPage(pageConfig).then((pageResult) => {
                    lastResult.push(pageResult);
                    return lastResult;
                });
            });
        }, Promise.resolve([])).then((a) => {
            return a;
        });
    }
    function decorateWithTestsuite(aPages, sTestsuite) {
        aPages.forEach((test) => {
            if (test.testsuite === undefined) {
                test.testsuite = sTestsuite;
            }
        });
        return aPages;
    }
    function findTestPages(oIFrame) {
        return Promise.resolve(oIFrame.contentWindow.suite()).then((oSuite) => (oSuite && oSuite.getTestPages() || [])).then((aPages) => (decorateWithTestsuite(aPages, oIFrame.src))).then((aPages) => sequence(aPages)).catch(() => []);
    }
    var origTestSuite = window.jsUnitTestSuite;
    window.jsUnitTestSuite = TestSuite;
    return checkTestPage({ fullpage: sEntryPage }).finally(function () {
        window.jsUnitTestSuite = origTestSuite;
    });
}