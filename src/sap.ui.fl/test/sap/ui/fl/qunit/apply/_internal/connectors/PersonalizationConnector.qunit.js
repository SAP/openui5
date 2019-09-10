/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/connectors/PersonalizationConnector"
], function(
	sinon,
	PersonalizationConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var newToken = "newToken";

	function fnReturnData(oServer, sData) {
		sandbox.server.respondWith([200, { "X-CSRF-Token": newToken, "Content-Type": "application/json" }, sData]);
	}

	QUnit.module("Connector", {
		beforeEach : function () {
			this.xhr = sinon.fakeServer.create();
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
			fnReturnData(this.xhr, '{}');
		},
		afterEach: function() {
			PersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given no static changes-bundle.json placed for 'reference' resource roots and a mock server, when loading flex data is triggered and an empty response is returned", function (assert) {
			return PersonalizationConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function (oResult) {
				assert.deepEqual(oResult, {}, "the default response resolves the request Promise");
			});
		});

		QUnit.test("given a mock server, when loading flex data is triggered with the correct url", function (assert) {
			return PersonalizationConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function () {
				assert.equal(sandbox.server.getRequest(0).url, "/sap/bc/lrep/flex/data/reference?appVersion=1.0.0", "url is correct");
			});
		});

		QUnit.test("loadFlexData also requests and stores an xsrf token", function (assert) {
			return PersonalizationConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function () {
				assert.equal(PersonalizationConnector.xsrfToken, newToken, "the token was stored correct");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
