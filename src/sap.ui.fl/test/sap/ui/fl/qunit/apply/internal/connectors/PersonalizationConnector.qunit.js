/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/merge",
	"sap/ui/fl/apply/internal/connectors/PersonalizationConnector"
], function(
	sinon,
	merge,
	PersonalizationConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function fnReturnData(oServer, sData) {
		sandbox.server.respondWith(sData);
	}

	QUnit.module("Connector", {
		beforeEach : function () {
			this.xhr = sinon.fakeServer.create();
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
			fnReturnData(this.xhr, "{}");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given no static changes-bundle.json placed for 'reference' resource roots and a mock server, when loading flex data is triggered and an empty response is returned", function (assert) {
			return PersonalizationConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function (oServer, oResult) {
				assert.deepEqual(oResult, {}, "the default response resolves the request Promise");
			}.bind(undefined, sandbox.server));
		});

		QUnit.test("given a mock server, when loading flex data is triggered with the correct url", function (assert) {
			return PersonalizationConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function (oServer) {
				assert.equal(oServer.getRequest(0).url, "/sap/bc/lrep/flex/data/reference?appVersion=1.0.0", "url is correct");
			}.bind(undefined, sandbox.server));
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
