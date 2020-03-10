/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/apply/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/write/_internal/connectors/PersonalizationConnector"
], function(
	sinon,
	Layer,
	Storage,
	StorageUtils,
	ApplyUtils,
	WriteUtils,
	FeaturesAPI,
	ApplyLrepConnector,
	WriteLrepConnector,
	ApplyKeyUserConnector,
	WriteKeyUserConnector,
	JsObjectConnector,
	ApplyPersonalizationConnector,
	WritePersonalizationConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("ApplyStorage.getWriteConnectors", {
		beforeEach : function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getWriteConnectors", function (assert) {
			var oStubGetConnectors = sandbox.stub(StorageUtils, "getConnectors").resolves([]);
			return Storage.loadFeatures().then(function () {
				assert.ok(oStubGetConnectors.calledWith("sap/ui/fl/write/_internal/connectors/", false), "StorageUtils getConnectors is called with correct params");
			});
		});
	});

	QUnit.module("Given Storage when write is called", {
		beforeEach: function () {
			ApplyLrepConnector.xsrfToken = "123";
			ApplyKeyUserConnector.xsrfToken = "123";
			ApplyPersonalizationConnector.xsrfToken = "123";
		},
		afterEach: function() {
			ApplyLrepConnector.xsrfToken = undefined;
			ApplyKeyUserConnector.xsrfToken = undefined;
			ApplyPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no is layer provided", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				appVersion: "1.0.0"
			};

			return Storage.write(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it fails in case no connector is available for the layer", function(assert) {
			var oFlexObjects = [{}];

			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: oFlexObjects
			};
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [Layer.USER]}
			]);

			return Storage.write(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
				});
		});

		QUnit.test("then it fails in case multiple connectors are available for the layer", function(assert) {
			var oFlexObjects = {};

			var mPropertyBag = {
				layer: Layer.VENDOR,
				flexObjects: oFlexObjects
			};
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector"},
				{connector: "JsObjectConnector"}
			]);

			return Storage.write(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: " +
						"Multiple Connector configurations were found to write into layer: VENDOR");
				});
		});

		QUnit.test("then it calls write of the connector", function(assert) {
			var oFlexObjects = {};

			var mPropertyBag = {
				layer: Layer.VENDOR,
				flexObjects: oFlexObjects
			};
			var sUrl = "/some/url";
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);

			var oWriteStub = sandbox.stub(WriteLrepConnector, "write").resolves({});

			return Storage.write(mPropertyBag).then(function () {
				assert.equal(oWriteStub.callCount, 1, "the write was triggered once");
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.equal(oWriteCallArgs.url, sUrl, "the url was added to the property bag");
				assert.equal(oWriteCallArgs.flexObjects, oFlexObjects, "the flexObjects were passed in the property bag");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector aiming for USER layer when writing", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				flexObjects: [{}]
			};
			var sUrl = "/PersonalizationConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl}
			]);

			var sExpectedUrl = sUrl + "/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(ApplyUtils, "getUrl").returns(sExpectedUrl);
			//sandbox.stub(WriteUtils, "getRequestOptions").returns({});

			return Storage.write(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.equal(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetUrlCallArgs[1].url, sUrl, "the correct url was added");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.equal(oSendRequestCallArgs[2].payload, "[{}]", "with correct payload");
				assert.equal(oSendRequestCallArgs[2].xsrfToken, "123", "with correct token");
				assert.equal(oSendRequestCallArgs[2].contentType, "application/json; charset=utf-8", "with correct contentType");
				assert.equal(oSendRequestCallArgs[2].dataType, "json", "with correct dataType");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: KeyUserConnector aiming for CUSTOMER layer when writing", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			var sUrl = "/KeyUserConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl}
			]);

			var sExpectedWriteUrl = sUrl + "/v1/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(ApplyUtils, "getUrl").returns(sExpectedWriteUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetWriteUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetWriteUrlCallArgs[0], "/flex/keyuser/v1/changes/", "with correct route path");
				assert.equal(oGetWriteUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetWriteUrlCallArgs[1].url, sUrl, "the correct url was added");
				assert.equal(oGetTokenUrlCallArgs[0], "/flex/keyuser/v1/settings", "with correct route path");
				assert.equal(oGetTokenUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oSendRequestCallArgs[0], sExpectedWriteUrl, "with correct url");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});



		QUnit.test("with valid mPropertyBag and Connector: KeyUserConnector aiming for CUSTOMER layer when writing draft changes", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}],
				draft: true
			};
			var oWriteStub = sandbox.stub(WriteKeyUserConnector, "write").resolves();

			return Storage.write(mPropertyBag).then(function() {
				assert.equal(oWriteStub.getCall(0).args[0].draft, true, "then the draft flag is passed");
			});
		});

		QUnit.test("when creating changes without a draft flag", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			var oIsDraftEnabledStub = sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			sandbox.stub(WriteKeyUserConnector, "write").resolves();

			return Storage.write(mPropertyBag)
				.then(function () {
					assert.equal(oIsDraftEnabledStub.callCount, 0, "then draftEnabled is not checked");
				});
		});

		QUnit.test("when creating changes for a draft but the layer does not support a draft", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(false);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}],
				draft: true
			};

			return Storage.write(mPropertyBag)
				.catch(function (sRejectionMessage) {
					assert.equal(sRejectionMessage, "Draft is not supported for the given layer: CUSTOMER",
						"then request is rejected with an error message");
				});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				flexObjects: [{}]
			};
			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedUrl = sUrl1 + "/v1/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(ApplyUtils, "getUrl").returns(sExpectedUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.equal(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetUrlCallArgs[1].url, sUrl2, "the correct url was added");
				assert.equal(oStubSendRequest.callCount, 1, "sendRequest is called once");
				assert.equal(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for CUSTOMER layer ", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedUrl = sUrl1 + "/flex/keyuser/v1/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(ApplyUtils, "getUrl").returns(sExpectedUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetWriteUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetWriteUrlCallArgs[0], "/flex/keyuser/v1/changes/", "with correct route path");
				assert.equal(oGetWriteUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetWriteUrlCallArgs[1].url, sUrl1, "the correct url was added");
				assert.equal(oGetTokenUrlCallArgs[0], "/flex/keyuser/v1/settings", "with correct route path");
				assert.equal(oGetTokenUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oStubSendRequest.callCount, 1, "sendRequest is called once");
				assert.equal(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});
	});

	QUnit.module("Given Storage when loadFeatures is called", {
		beforeEach : function() {
			this.url = "/some/url";
			ApplyLrepConnector.xsrfToken = "123";
			ApplyPersonalizationConnector.xsrfToken = "123";
		},
		afterEach: function() {
			ApplyLrepConnector.xsrfToken = undefined;
			ApplyPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with a failing connector", function (assert) {
			var oLrepConnectorLoadFeaturesStub = sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({isKeyUser : true});
			var oPersonalizationConnectorLoadFeaturesStub = sandbox.stub(WritePersonalizationConnector, "loadFeatures").resolves({isVariantSharingEnabled : false});
			var oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadFeatures").rejects({});

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{
					connector: "LrepConnector",
					url: this.url,
					layers: []
				}, {
					connector: "JsObjectConnector",
					layers: [Layer.CUSTOMER]
				}, {
					connector : "PersonalizationConnector",
					url : this.url,
					layers : [Layer.USER]
				}
			]);

			var oExpectedResponse = {
				isKeyUser: true,
				isVariantSharingEnabled: false,
				isAtoAvailable: false,
				isAtoEnabled: false,
				versioning: {
					CUSTOMER: false,
					USER: false
				},
				isProductiveSystem: true,
				isZeroDowntimeUpgradeRunning: false,
				system: "",
				client: ""
			};
			var oLogResolveSpy = sandbox.spy(StorageUtils, "logAndResolveDefault");

			return Storage.loadFeatures().then(function (oResponse) {
				assert.equal(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.equal(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.equal(oPersonalizationConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.equal(oLogResolveSpy.callCount, 1, "the logAndResolveDefault called once");
				assert.deepEqual(oResponse, oExpectedResponse, "response was merged even with one connector failing");
			});
		});

		QUnit.test("then it calls loadFeatures of the configured connectors", function(assert) {
			var oLrepConnectorLoadFeaturesStub = sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({});
			var oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadFeatures").resolves({});
			var sUrl = "/some/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl},
				{connector: "JsObjectConnector"}
			]);

			return Storage.loadFeatures().then(function () {
				assert.equal(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				var oLrepConnectorCallArgs = oLrepConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oLrepConnectorCallArgs, {url: sUrl}, "the url was passed");
				assert.equal(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				var oJsObjectConnectorCallArgs = oJsObjectConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oJsObjectConnectorCallArgs, {url: undefined}, "no url was passed");
			});
		});

		QUnit.test("then merges the response of the connectors", function(assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: this.url},
				{connector: "JsObjectConnector"}
			]);

			sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({
				isKeyUser: true
			});
			sandbox.stub(JsObjectConnector, "loadFeatures").resolves({
				system: "foo"
			});

			return Storage.loadFeatures().then(function (mFeatures) {
				assert.equal(mFeatures.isKeyUser, true, "the property of the LrepConnector was added");
				assert.equal(mFeatures.system, "foo", "the property of the JsObjectConnector was added");
			});
		});

		QUnit.test("then higher layer overrule the lower layer", function(assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: this.url},
				{connector: "JsObjectConnector"}
			]);

			sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({
				isProductiveSystem: false
			});
			sandbox.stub(JsObjectConnector, "loadFeatures").resolves({
				isProductiveSystem: true
			});

			var DEFAULT_FEATURES = {
				isKeyUser: false,
				isVariantSharingEnabled: false,
				isAtoAvailable: false,
				isAtoEnabled: false,
				draft: {},
				isProductiveSystem: true,
				isZeroDowntimeUpgradeRunning: false,
				system: "",
				client: ""
			};

			return Storage.loadFeatures().then(function (mFeatures) {
				assert.equal(Object.keys(mFeatures).length, Object.keys(DEFAULT_FEATURES).length, "only 9 feature was provided");
				assert.equal(mFeatures.isProductiveSystem, true, "the property was overruled by the second connector");
			});
		});
	});

	QUnit.module("Given Storage when versions.load is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of versions is returned", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var aReturnedVersions = [];
			sandbox.stub(JsObjectConnector.versions, "load").resolves(aReturnedVersions);

			return Storage.versions.load(mPropertyBag).then(function (aVersions) {
				assert.equal(aVersions, aReturnedVersions);
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			return Storage.versions.load(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "versions.load is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.activate is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of versions is returned", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var oActivatedVersion = {};
			sandbox.stub(JsObjectConnector.versions, "activate").resolves(oActivatedVersion);

			return Storage.versions.activate(mPropertyBag).then(function (oReturnedActivatedVersion) {
				assert.equal(oReturnedActivatedVersion, oActivatedVersion);
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			return Storage.versions.activate(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "versions.activate is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.discardDraft is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and discarding takes place", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var oDiscardStub = sandbox.stub(JsObjectConnector.versions, "discardDraft").resolves();

			return Storage.versions.discardDraft(mPropertyBag).then(function () {
				assert.equal(oDiscardStub.callCount, 1, "the discarding of the connector was called");
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			return Storage.versions.discardDraft(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "versions.discardDraft is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when reset is called", {
		beforeEach: function () {
			ApplyLrepConnector.xsrfToken = "123";
			ApplyKeyUserConnector.xsrfToken = "123";
			ApplyPersonalizationConnector.xsrfToken = "123";
		},
		afterEach: function() {
			ApplyLrepConnector.xsrfToken = undefined;
			ApplyKeyUserConnector.xsrfToken = undefined;
			ApplyPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no layer is provided", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				appVersion: "1.0.0"
			};

			return Storage.reset(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it fails in case no connector is available for the layer", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference",
				appVersion: "1.0.0"
			};
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", layers: [Layer.USER]}
			]);

			return Storage.reset(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
				});
		});

		QUnit.test("then it fails in case no connector is available for the layer by default layer settings of the connector", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference",
				appVersion: "1.0.0"
			};
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector"}
			]);

			return Storage.reset(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
				});
		});

		QUnit.test("then it fails in case multiple connectors are available for the layer", function(assert) {
			var mPropertyBag = {
				layer: Layer.VENDOR,
				reference: "reference",
				appVersion: "1.0.0"
			};

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector"},
				{connector: "JsObjectConnector"}
			]);

			return Storage.reset(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: " +
						"Multiple Connector configurations were found to write into layer: VENDOR");
				});
		});

		QUnit.test("with valid mPropertyBag and Connector: LrepConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference",
				appVersion: "1.0.0",
				changeTypes: "Rename",
				generator: "test",
				selectorIds: "id1"
			};

			var mParameter = {
				layer: Layer.USER,
				reference: "reference",
				appVersion: "1.0.0",
				changeType: "Rename",
				generator: "test",
				selector: "id1"
			};

			var sUrl = "/LrepConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);

			var sExpectedUrl = sUrl + "/changes/";
			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(ApplyUtils, "getUrl").returns(sExpectedUrl);

			return Storage.reset(mPropertyBag).then(function () {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetUrlCallArgs[0], "/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference",
				appVersion: "1.0.0"
			};

			var mParameter = {
				reference: "reference",
				appVersion: "1.0.0"
			};

			var sUrl = "/LrepConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({});
			var oSpyGetUrl = sandbox.spy(ApplyUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function () {
				var oGetUrlCallArgs = oSpyGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oSpyGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference",
				appVersion: "1.0.0"
			};

			var mParameter = {
				reference: "reference",
				appVersion: "1.0.0"
			};

			var sUrl = "/LrepConnector/url";
			var sUrl2 = "/KeyUserConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl},
				{connector: "KeyUserConnector", url: sUrl2}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({});
			var oSpyGetUrl = sandbox.spy(ApplyUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function () {
				var oGetUrlCallArgs = oSpyGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oSpyGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for CUSTOMER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference",
				appVersion: "1.0.0"
			};

			var mParameter = {
				reference: "reference",
				appVersion: "1.0.0"
			};

			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.spy(ApplyUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function () {
				var oGetResetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetResetUrlCallArgs[0], "/flex/keyuser/v1/changes/", "with correct route path");
				assert.equal(oGetResetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetResetUrlCallArgs[1].url, sUrl1, "the correct url was added");
				assert.equal(oGetTokenUrlCallArgs[0], "/flex/keyuser/v1/settings", "with correct route path");
				assert.deepEqual(oGetResetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetResetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.equal(oStubSendRequest.callCount, 1, "sendRequest is called once");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});