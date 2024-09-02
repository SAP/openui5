/* global QUnit */
sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/connectors/NeoLrepConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils"
], function(
	sinon,
	NeoLrepConnector,
	Utils
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	QUnit.module("Given a initial NeoLrepConnector", {}, function() {
		QUnit.test("given a mock server, when loadFeatures is triggered", function(assert) {
			const oServerResponse = {
				isKeyUser: true,
				isVersioningEnabled: false,
				isContextSharingEnabled: true,
				isPublicLayerAvailable: false,
				isLocalResetEnabled: true
			};

			const oExpectedResponse = { ...oServerResponse };
			oExpectedResponse.isContextSharingEnabled = false;
			const oStubSendRequest = sandbox.stub(Utils, "sendRequest").resolves({ response: oServerResponse });
			const mPropertyBag = { url: "/sap/bc/lrep" };
			const sUrl = "/sap/bc/lrep/flex/settings";

			return NeoLrepConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.ok(oStubSendRequest.calledOnce, "a request is sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "request method is GET");
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl, "Url is correct");
				assert.deepEqual(oResponse, oExpectedResponse, "loadFeatures response flow is correct");
			});
		});

		QUnit.test("given loadVariantsAuthors is called", function(assert) {
			return NeoLrepConnector.loadVariantsAuthors().then(function() {
			}).catch((sError) => {
				assert.equal(sError, "loadVariantsAuthors is not implemented", "correct error is returned");
			});
		});
	});
	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

