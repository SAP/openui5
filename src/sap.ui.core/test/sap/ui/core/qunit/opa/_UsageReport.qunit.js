/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/_UsageReport"
], function (_UsageReport) {
	"use strict";

	QUnit.module("_UsageReport", {
		beforeEach: function () {
			this.xhr = sinon.useFakeXMLHttpRequest();
			this.requests = [];
			this.xhr.onCreate = function (xhr) {
				this.requests.push(xhr);
			}.bind(this);
		},
		afterEach: function () {
			this.xhr.restore();
		}
	});

	QUnit.test("Should be disabled by default", function (assert) {
		var oUsageReport = new _UsageReport();
		oUsageReport.begin();
		oUsageReport.testStart();
		oUsageReport.opaEmpty();
		oUsageReport.testDone();
		oUsageReport.done();
		assert.strictEqual(this.requests.length, 0, "Should send no requests when disabled");
	});

	QUnit.test("Should be enabled explicitly", function (assert) {
		var oUsageReport = new _UsageReport({enableUsageReport: true});
		oUsageReport.begin();
		assert.strictEqual(this.requests.length, 1, "Should send requests when enabled");
	});

	QUnit.test("Should change reporter URL", function (assert) {
		var oUsageReport = new _UsageReport({enableUsageReport: true, usageReportUrl: "myURL"});
		oUsageReport.begin();
		assert.strictEqual(this.requests[0].url, "myURL/api/opa/suites/begin", "Should use configured URL");
	});

	QUnit.test("Should wait for suite to begin before adding more suite data", function (assert) {
		var oUsageReport = new _UsageReport({enableUsageReport: true, usageReportUrl: "myURL"});
		oUsageReport.begin({uri: "foo"});
		oUsageReport.moduleStart({name: "module"});
		assert.strictEqual(this.requests.length, 1, "Should only send the first request");
		assert.strictEqual(this.requests[0].requestBody, "uri=foo", "Should only send the first request");
		this.requests[0].respond(200, {"Content-Type": "application/json"}, "{\"id\": 1}");
		assert.strictEqual(this.requests.length, 2, "Should send the second request only when suite data is received");
		assert.strictEqual(this.requests[1].requestBody, "name=module", "Should send the second request only when suite data is received");
	});

	QUnit.test("Should send data for test on QUnit timeout", function (assert) {
		var oUsageReport = new _UsageReport({enableUsageReport: true, usageReportUrl: "myURL"});
		oUsageReport.begin({uri: "foo"});
		this.requests[0].respond(200, {"Content-Type": "application/json"}, "{\"id\": 1}");
		oUsageReport.testDone({
			name: "Should navigate",
			assertions: [{message: "Assertion"}]
		});
		oUsageReport.opaEmpty({qunitTimeout: true, errorMessage: "Qunit Timeout"});
		assert.strictEqual(this.requests.length, 2, "Should send requests");
		assert.ok(this.requests[1].requestBody.match("name=Should.navigate&assertions.*message.*=Assertion.*Qunit.Timeout"), "Should send test details");
	});

	QUnit.test("Should send data for test when there isn't a QUnit timeout", function (assert) {
		var oUsageReport = new _UsageReport({enableUsageReport: true, usageReportUrl: "myURL"});
		oUsageReport.begin({uri: "foo"});
		this.requests[0].respond(200, {"Content-Type": "application/json"}, "{\"id\": 1}");
		oUsageReport.opaEmpty({errorMessage: "Message"});
		oUsageReport.testDone({
			name: "Should navigate",
			assertions: [{message: "Assertion"}]
		});
		assert.strictEqual(this.requests.length, 2, "Should send requests");
		assert.ok(this.requests[1].requestBody.match("name=Should.navigate&assertions.*message.*=Assertion"), "Should send test details");
	});

	QUnit.test("Should send data only for OPA tests", function (assert) {
		var oUsageReport = new _UsageReport({enableUsageReport: true, usageReportUrl: "myURL"});
		var reportQUnit = function () {
			oUsageReport.testStart({
				name: "Should clear"
			});
			oUsageReport.testDone({
				name: "Should clear",
				assertions: [{message: "Assertion"}]
			});
		};
		var reportOPA = function (bWithQUnitTimeout) {
			var mTestDone = {
				name: "Should navigate",
				assertions: [{message: "Assertion"}]
			};
			oUsageReport.testStart({
				name: "Should navigate"
			});
			if (bWithQUnitTimeout) {
				oUsageReport.testDone(mTestDone);
				oUsageReport.opaEmpty({errorMessage: "Message", qunitTimeout: true});
			} else {
				oUsageReport.opaEmpty({errorMessage: "Message"});
				oUsageReport.testDone(mTestDone);
			}
		};

		oUsageReport.begin({uri: "foo"});
		this.requests[0].respond(200, {"Content-Type": "application/json"}, "{\"id\": 1}");
		reportQUnit();
		reportOPA();
		reportQUnit();
		reportOPA(true);

		assert.strictEqual(this.requests.length, 3, "Should send requests only for OPA tests");
		assert.ok(this.requests[1].requestBody.match("name=Should.navigate&assertions.*message.*=Assertion"), "Should send test details");
		assert.ok(this.requests[2].requestBody.match("name=Should.navigate&assertions.*message.*=Assertion"), "Should send test details");
	});

	QUnit.test("Should send XHR requests that will be ignored by autoWaiter", function (assert) {
		var oUsageReport = new _UsageReport({enableUsageReport: true, usageReportUrl: "myURL"});
		oUsageReport.begin();
		assert.strictEqual(this.requests[0].method, "XHR_WAITER_IGNORE:POST", "Should use autoWaiter ignore prefix");
	});
});
