/* global QUnit */
sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/connectors/NeoLrepConnector",
	"sap/ui/fl/write/_internal/connectors/NeoLrepConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils"
], function(
	sinon,
	InitialConnector,
	WriteConnector,
	Utils
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("Given a write NeoLrepConnector", {}, function() {
		QUnit.test("When the write connector was requested", function(assert) {
			assert.deepEqual(WriteConnector.initialConnector, InitialConnector, "then the initialConnector is set");
		});

		QUnit.test("given a mock server, when loadFeatures is triggered", function (assert) {
			var oServerResponse = {
				isKeyUser: true,
				isVersioningEnabled: false,
				isContextSharingEnabled: true,
				isContextSharingEnabledForComp: true,
				isPublicLayerAvailable: false,
				isLocalResetEnabled: true
			};

			var oExpectedResponse = Object.assign({}, oServerResponse);
			oExpectedResponse.isContextSharingEnabled = false;
			var oStubSendRequest = sandbox.stub(Utils, "sendRequest").resolves({response: oServerResponse});
			var mPropertyBag = {url: "/sap/bc/lrep"};
			var sUrl = "/sap/bc/lrep/flex/settings";

			return WriteConnector.loadFeatures(mPropertyBag).then(function (oResponse) {
				assert.ok(oStubSendRequest.calledOnce, "a request is sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "request method is GET");
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl, "Url is correct");
				assert.deepEqual(oResponse, oExpectedResponse, "loadFeatures response flow is correct");
			});
		});
	});
	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});


