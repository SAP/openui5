/* global QUnit */

sap.ui.define([
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/thirdparty/sinon-4"
], function(
	KeyUserConnector,
	Utils,
	Version,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("KeyUserConnector loadFeatures", {
		afterEach() {
			KeyUserConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("get Response", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser"
			};
			sandbox.stub(Utils, "sendRequest").resolves({response: {someFeature: true}});
			return KeyUserConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, {isContextSharingEnabled: true, someFeature: true}, "the settings object is returned correctly");
			});
		});

		QUnit.test("receives the flags 'isPublicLayerAvailable' false and 'isVariantAdaptationEnabled' false", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser"
			};
			var oSettingsResponse = {
				isPublicLayerAvailable: false,
				isVariantAdaptationEnabled: false
			};

			sandbox.stub(Utils, "sendRequest").resolves({response: oSettingsResponse});
			return KeyUserConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.equal(oResponse.isPublicLayerAvailable, false, "the isPublicLayerAvailable is correct");
				assert.equal(oResponse.isVariantAdaptationEnabled, false, "the isVariantAdaptationEnabled is correct");
			});
		});

		QUnit.test("receives the flags 'isPublicLayerAvailable' false and 'isVariantAdaptationEnabled' true", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser"
			};
			var oSettingsResponse = {
				isPublicLayerAvailable: false,
				isVariantAdaptationEnabled: true
			};

			sandbox.stub(Utils, "sendRequest").resolves({response: oSettingsResponse});
			return KeyUserConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.equal(oResponse.isPublicLayerAvailable, false, "the isPublicLayerAvailable is correct");
				assert.equal(oResponse.isVariantAdaptationEnabled, true, "the isVariantAdaptationEnabled is correct");
			});
		});

		QUnit.test("receives the flags 'isPublicLayerAvailable' true and 'isVariantAdaptationEnabled' false", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser"
			};
			var oSettingsResponse = {
				isPublicLayerAvailable: true,
				isVariantAdaptationEnabled: false
			};

			sandbox.stub(Utils, "sendRequest").resolves({response: oSettingsResponse});
			return KeyUserConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.equal(oResponse.isPublicLayerAvailable, true, "the isPublicLayerAvailable is correct");
				assert.equal(oResponse.isVariantAdaptationEnabled, false, "the isVariantAdaptationEnabled is correct");
			});
		});

		QUnit.test("receives the flags 'isPublicLayerAvailable' true and 'isVariantAdaptationEnabled' true", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser"
			};
			var oSettingsResponse = {
				isPublicLayerAvailable: true,
				isVariantAdaptationEnabled: true
			};

			sandbox.stub(Utils, "sendRequest").resolves({response: oSettingsResponse});
			return KeyUserConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.equal(oResponse.isPublicLayerAvailable, true, "the isPublicLayerAvailable is correct");
				assert.equal(oResponse.isVariantAdaptationEnabled, true, "the isVariantAdaptationEnabled is correct");
			});
		});

		QUnit.test("get Response does not send when the settings already stored in apply connector", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser"
			};
			var oStubSendRequest = sandbox.stub(Utils, "sendRequest").resolves({response: "something"});
			KeyUserConnector.settings = {isKeyUser: true};
			return KeyUserConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.ok(oStubSendRequest.notCalled, "no request is sent to back end");
				assert.deepEqual(oResponse.response, {isKeyUser: true}, "the settings object is obtain from apply connector correctly");
			});
		});
	});

	QUnit.module("KeyUserConnector loadData", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("loadFlexData trigger the correct request to back end then:" +
			"- store the token and settings values" +
			"- return cacheKey value" +
			"- merges the compVariants in the changes", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "reference",
				version: Version.Number.Draft
			};
			var mParameter = {
				version: Version.Number.Draft,
				"sap-language": "en"
			};
			var sExpectedUrl = `/flexKeyuser/flex/keyuser/v2/data/reference?version=${Version.Number.Draft}`;
			var oStubGetUrlWithQueryParameters = sandbox.stub(Utils, "getUrl").returns(sExpectedUrl);
			var oStubSendRequest = sandbox.stub(Utils, "sendRequest").resolves({
				response: {
					contents: [
						{
							changes: [1],
							compVariants: [3]
						},
						{
							compVariants: [2]
						}
					],
					settings: {
						isKeyUser: true,
						isVariantSharingEnabled: true
					}
				},
				status: "200",
				etag: "abc123"
			});
			return KeyUserConnector.loadFlexData(mPropertyBag).then(function(oFlexData) {
				assert.ok(oStubGetUrlWithQueryParameters.calledOnce, "getUrl is called once");
				assert.equal(oStubGetUrlWithQueryParameters.getCall(0).args[0], "/flex/keyuser/v2/data/", "with correct route path");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[2], mParameter, "with correct parameters input");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "with correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "with correct method");
				assert.equal(oStubSendRequest.getCall(0).args[2].xsrfToken, undefined, "with correct token");
				assert.equal(oStubSendRequest.getCall(0).args[2].cacheable, true, "with correct cacheable value");
				assert.deepEqual(KeyUserConnector.settings, { isKeyUser: true, isVariantSharingEnabled: true}, "new settings is stored");
				assert.equal(oFlexData[0].changes.length, 2, "two entries are in the customer change section");
				assert.equal(oFlexData[0].changes[0], 1, "the change entry is contained");
				assert.equal(oFlexData[0].changes[1], 3, "the compVariant entry is contained");
				assert.equal(oFlexData[1].changes.length, 1, "one entries are in the public change section");
				assert.equal(oFlexData[1].changes[0], 2, "the compVariant entry is contained");
				assert.equal(oFlexData[0].cacheKey, "abc123", "the cacheKey value is returned in a sub content");
			});
		});

		QUnit.test("loadFlexData requests the 'Original App'", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "reference",
				version: Version.Number.Original
			};

			var sExpectedUrl = `/flexKeyuser/flex/keyuser/v1/data/reference?version=${Version.Number.Original}`;
			sandbox.stub(Utils, "getUrl").returns(sExpectedUrl);
			var oStubSendRequest = sandbox.stub(Utils, "sendRequest").resolves({
				response: {
					contents: [
						{
							changes: [],
							compVariants: []
						}
					]
				},
				status: "200",
				etag: "abc123"
			});
			return KeyUserConnector.loadFlexData(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "with correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "with correct method");
			});
		});

		QUnit.test("given loadVariantsAuthors is called", function(assert) {
			return KeyUserConnector.loadVariantsAuthors().then(function() {
			}).catch((sError) => {
				assert.equal(sError, "loadVariantsAuthors is not implemented", "correct error is returned");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});