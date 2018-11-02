/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/_UsageReport",
	"./utils/phantomJS"
], function (_UsageReport, phantomJSUtils) {
	"use strict";

	phantomJSUtils.introduceSinonXHR();

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
		oUsageReport.moduleUpdate();
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
		oUsageReport.moduleUpdate({name: "module"});
		assert.strictEqual(this.requests.length, 1, "Should only send the first request");
		assert.strictEqual(this.requests[0].requestBody, "uri=foo", "Should only send the first request");
		this.requests[0].respond(200, { "Content-Type": "application/json" }, '{ "id": 1}');
		assert.strictEqual(this.requests.length, 2, "Should send the second request only when suite data is received");
		assert.strictEqual(this.requests[1].requestBody, "name=module", "Should send the second request only when suite data is received");
	});

	QUnit.test("Should send XHR requests that will be ignored by autoWaiter", function (assert) {
		var oUsageReport = new _UsageReport({enableUsageReport: true, usageReportUrl: "myURL"});
		oUsageReport.begin();
		assert.strictEqual(this.requests[0].method, "XHR_WAITER_IGNORE:POST", "Should use autoWaiter ignore prefix");
	});

});
