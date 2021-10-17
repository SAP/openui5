QUnit.module("CSP Compliance");
QUnit.test("Check for occurred CSP violations", function (assert) {
    var done = assert.async();
    var oReq = new XMLHttpRequest();
    oReq.open("GET", document.documentURI, true);
    oReq.send();
    oReq.onreadystatechange = function () {
        if (this.readyState == this.HEADERS_RECEIVED) {
            var sCsp = oReq.getResponseHeader("Content-Security-Policy");
            var sCspReportOnly = oReq.getResponseHeader("Content-Security-Policy-Report-Only");
            if (sCsp || (sCspReportOnly && sCspReportOnly.indexOf("report-uri") !== -1)) {
                assert.ok(sap.ui.getCore().isInitialized(), "UI5 Core has been initialized");
                assert.ok(window["ui5-core-csp-violations"].length === 0, "Found " + window["ui5-core-csp-violations"].length + " CSP violation(s)");
                window["ui5-core-csp-violations"].forEach(function (oViolation) {
                    assert.ok(false, oViolation.sourceFile + ":" + oViolation.lineNumber + ":" + oViolation.columnNumber + ": " + oViolation.effectiveDirective + " - " + oViolation.blockedURI);
                });
                done();
            }
            else {
                oReq.abort();
                assert.ok(false, "CSP headers are not set by web server as required for this test.\n" + "Please make sure to execute the ContentSecurityPolicy.qunit.html test with\n" + "the following URL parameter to tell the web server to send CSP headers:\n\n" + "sap-ui-xx-csp-policy=sap-target-level-2:report-only\n\n" + "There might be also a server-side problem which leads to not setting headers correctly.");
                done();
            }
        }
    };
});