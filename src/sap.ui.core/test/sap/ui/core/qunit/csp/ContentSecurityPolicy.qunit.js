sap.ui.define(["sap/ui/Device"], function(Device) {

	"use strict";
	/*global QUnit*/

	QUnit.module("CSP Compliance");

	if (Device.browser.msie || Device.browser.edge) {
		QUnit.test("Skip CSP Test", function (assert) {
			assert.ok(true, "Skip actual CSP Test for MS Internet Explorer and Edge Browser, as they expect non-standard CSP Headers");
		});
	} else {
		QUnit.test("Check for occured CSP Violations", function (assert) {
			var done = assert.async();

			// Make sure that the CSP headers (CSP or CSP-Report-Only) are set by web server
			// and that the test fails in case none of them is set.

			var oReq = new XMLHttpRequest();
			oReq.open("GET", document.documentURI, true);
			oReq.send();

			oReq.onreadystatechange = function () {
				if (this.readyState == this.HEADERS_RECEIVED) {
					var sCsp = oReq.getResponseHeader("Content-Security-Policy");
					var sCspReportOnly = oReq.getResponseHeader("Content-Security-Policy-Report-Only");

					// Either the normal header needs to be present or
					// the "Report-Only" header with a report-uri as otherwise
					// the browser completely ignores the header and won't report violations
					if (sCsp || (sCspReportOnly && sCspReportOnly.indexOf("report-uri") !== -1)) {
						// Check for reported CSP violations
						assert.ok(sap.ui.getCore().isInitialized(), "UI5 Core has been initialized");
						assert.ok(window["ui5-core-csp-violations"].length === 0,
							"Found " + window["ui5-core-csp-violations"].length + " CSP violation(s)"
						);
						window["ui5-core-csp-violations"].forEach(function(oViolation) {
							assert.ok(
								false,
								oViolation.sourceFile + ":" + oViolation.lineNumber + ":" +
								oViolation.columnNumber + ": " +
								oViolation.effectiveDirective + " - " + oViolation.blockedURI
							);
						});

						done();
					} else {
						// Fail test as headers are not set as required
						oReq.abort();
						assert.ok(
							false,
							"CSP headers are not set by web server as required for this test.\n" +
							"Please make sure to execute the ContentSecurityPolicy.qunit.html test with\n" +
							"the following URL parameter to tell the web server to send CSP headers:\n\n" +
							"sap-ui-xx-csp-policy=almost-default:report-only\n\n" +
							"There might be also a server-side problem which leads to not setting headers correctly."
						);

						done();
					}
				}
			};
		});
	}
});