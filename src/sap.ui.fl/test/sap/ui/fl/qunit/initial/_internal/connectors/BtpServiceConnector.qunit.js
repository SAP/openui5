/* global QUnit */

sap.ui.define([
	"sap/ui/fl/initial/_internal/connectors/BtpServiceConnector",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/thirdparty/sinon-4"
], function(
	BtpServiceConnector,
	KeyUserConnector,
	Utils,
	Version,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("BtpServiceConnector", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("loadFlVariant trigger the correct request to back end with version and context", function(assert) {
			const mPropertyBag = {
				url: "/btp",
				reference: "reference",
				version: Version.Number.Draft,
				variantReference: "variantId1"
			};
			const mExpectedParameter = {
				version: Version.Number.Draft,
				id: "variantId1",
				"sap-language": "en"
			};
			const oStubGetUrlWithQueryParameters = sandbox.spy(Utils, "getUrl");
			const oStubSendRequest = sandbox.stub(Utils, "sendRequest").resolves({
				response: {
					variants: [1],
					variantChanges: [1],
					variantManagementChanges: [1],
					variantDependentControlChanges: [1]
				}
			});

			return BtpServiceConnector.loadFlVariant(mPropertyBag).then(function(oFlexData) {
				assert.ok(oStubGetUrlWithQueryParameters.calledOnce, "getUrl is called once");
				assert.equal(oStubGetUrlWithQueryParameters.getCall(0).args[0], "/flex/all/v3/variantdata", "with correct route path");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[2], mExpectedParameter, "with correct parameters input");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "with correct method");
				assert.equal(oStubSendRequest.getCall(0).args[2].xsrfToken, undefined, "with correct token");
				assert.equal(oFlexData.variants, 1, "variants exits");
				assert.equal(oFlexData.variantChanges, 1, "variantChanges exits");
				assert.equal(oFlexData.variantManagementChanges, 1, "variantManagementChanges exits");
				assert.equal(oFlexData.variantDependentControlChanges, 1, "variantDependentControlChanges exits");
			});
		});

		QUnit.test("loadFlVariant trigger the correct request to back end with version", function(assert) {
			const mPropertyBag = {
				url: "/btp",
				reference: "reference",
				version: Version.Number.Draft,
				variantReference: "variantId1"
			};
			const mExpectedParameter = {
				version: Version.Number.Draft,
				id: "variantId1",
				"sap-language": "en"
			};
			const oStubGetUrlWithQueryParameters = sandbox.spy(Utils, "getUrl");
			const oStubSendRequest = sandbox.stub(Utils, "sendRequest").resolves({
				response: {
					contents: [
						{
							variants: [],
							variantChanges: [],
							variantManagementChanges: [],
							variantDependentControlChanges: []
						}
					]
				},
				status: "200"
			});
			return BtpServiceConnector.loadFlVariant(mPropertyBag).then(function() {
				assert.ok(oStubGetUrlWithQueryParameters.calledOnce, "getUrl is called once");
				assert.equal(oStubGetUrlWithQueryParameters.getCall(0).args[0], "/flex/all/v3/variantdata", "with correct route path");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[2], mExpectedParameter, "with correct parameters input");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "with correct method");
				assert.equal(oStubSendRequest.getCall(0).args[2].xsrfToken, undefined, "with correct token");
			});
		});

		QUnit.test("loadFlVariant trigger the correct request to back end to get active version", function(assert) {
			const mPropertyBag = {
				url: "/btp",
				reference: "reference",
				variantReference: "variantId1"
			};
			const mExpectedParameter = {
				id: "variantId1",
				"sap-language": "en"
			};
			const oStubGetUrlWithQueryParameters = sandbox.spy(Utils, "getUrl");
			const oStubSendRequest = sandbox.stub(Utils, "sendRequest").resolves({
				response: {
					contents: [
						{
							variants: [],
							variantChanges: [],
							variantManagementChanges: [],
							variantDependentControlChanges: []
						}
					]
				},
				status: "200"
			});
			return BtpServiceConnector.loadFlVariant(mPropertyBag).then(function() {
				assert.ok(oStubGetUrlWithQueryParameters.calledOnce, "getUrl is called once");
				assert.equal(oStubGetUrlWithQueryParameters.getCall(0).args[0], "/flex/all/v3/variantdata", "with correct route path");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[2], mExpectedParameter, "with correct parameters input");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "with correct method");
				assert.equal(oStubSendRequest.getCall(0).args[2].xsrfToken, undefined, "with correct token");
			});
		});

		QUnit.test("loadFeatures", async function(assert) {
			sandbox.stub(KeyUserConnector, "loadFeatures").resolves({
				isCondensingEnabledOnBtp: true
			});
			const oFeatures = await BtpServiceConnector.loadFeatures();
			assert.strictEqual(oFeatures.isCondensingEnabled, true, "then the condensing flag is set to the value from the backend");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});