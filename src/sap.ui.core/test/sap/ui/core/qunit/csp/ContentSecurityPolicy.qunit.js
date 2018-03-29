sap.ui.define([], function() {

	"use strict";
	/*global QUnit*/

	QUnit.module("CSP Compliance");

	QUnit.test("Check for occured CSP Violations", function(assert) {
		var done = assert.async(),
			sErrorMsg = "Please make sure to execute the ContentSecurityPolicy.qunit.html\n test with removing the sap-ui-debug " +
				"URL parameter (if present) and with adding the following URL parameters\n sap-ui-xx-libraryPreloadFiles=none and " + "sap-ui-xx-csp-policy=almost-default:report-only (if not yet present) to\n not load library preload files and to " +
				"tell the web server to set required CSP headers.";

		// Make sure that the CSP headers (CSP or CSP-Report-Only) are set by web server
		// and that the test fails in case none of them is set.

		var oReq = new XMLHttpRequest();
		oReq.open("GET", document.documentURI, true);
		oReq.send();

		oReq.onreadystatechange = function () {
			if (this.readyState == this.HEADERS_RECEIVED) {
				var sCsp = oReq.getResponseHeader("Content-Security-Policy");
				var sCspReportOnly = oReq.getResponseHeader("Content-Security-Policy-Report-Only");

				if (sCsp || sCspReportOnly) {
					// Check for reported CSP violations
					assert.ok(sap.ui.getCore(), "UI5 Core has been booted");
					assert.ok(window["ui5-core-csp-violations"] && window["ui5-core-csp-violations"].length === 0,
						"CSP compliant - Just in case the test fails: " + sErrorMsg
					);

					done();
				} else {
					// Fail test as headers are not set as required
					oReq.abort();
					assert.ok(
						false,
						"CSP headers are not set by web server as required for this test. " +
						sErrorMsg + "\n There might be also a server-side problem which leeds\n to not setting headers correctly."
					);

					done();
				}
			}
		};
	});

});