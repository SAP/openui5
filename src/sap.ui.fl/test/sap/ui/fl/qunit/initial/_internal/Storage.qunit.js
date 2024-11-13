/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/Component",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/initial/_internal/connectors/BtpServiceConnector",
	"sap/ui/fl/initial/_internal/connectors/StaticFileConnector",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/write/_internal/connectors/ObjectPathConnector",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	Component,
	FlexConfiguration,
	ObjectStorageUtils,
	FlexObjectFactory,
	KeyUserConnector,
	LrepConnector,
	PersonalizationConnector,
	BtpServiceConnector,
	StaticFileConnector,
	Storage,
	StorageUtils,
	FlexInfoSession,
	Version,
	JsObjectConnector,
	ObjectPathConnector,
	Layer,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sFlexReference = "app.id";

	function cleanUp() {
		FlexInfoSession.removeByReference(sFlexReference);
		Object.keys(window.sessionStorage)
		.filter((sKey) => sKey.startsWith("sap.ui.rta.restart."))
		.forEach((sKey) => window.sessionStorage.removeItem(sKey));
		sandbox.restore();
	}

	QUnit.module("Storage checks the input parameters", {
		beforeEach() {
			sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
		},
		afterEach() {
			cleanUp();
		}
	}, function() {
		QUnit.test("given no property bag was passed on loadFlexData", function(assert) {
			return assert.throws(Storage.loadFlexData());
		});

		QUnit.test("given no reference within the property bag was passed on loadFlexData", function(assert) {
			return assert.throws(Storage.loadFlexData({}));
		});
	});

	QUnit.module("Given Storage when loadFeatures is called", {
		beforeEach() {
			this.url = "/some/url";
			LrepConnector.xsrfToken = "123";
			PersonalizationConnector.xsrfToken = "123";
		},
		afterEach() {
			cleanUp();
			LrepConnector.xsrfToken = undefined;
			PersonalizationConnector.xsrfToken = undefined;
		}
	}, function() {
		QUnit.test("with a failing connector", function(assert) {
			const oLrepConnectorLoadFeaturesStub = sandbox.stub(LrepConnector, "loadFeatures").resolves({isKeyUser: true});
			delete PersonalizationConnector.loadFeatures;
			const oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadFeatures").rejects({});

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{
					connector: "LrepConnector",
					url: this.url,
					layers: []
				}, {
					connector: "JsObjectConnector",
					layers: [Layer.CUSTOMER]
				}, {
					connector: "PersonalizationConnector",
					url: this.url,
					layers: [Layer.USER]
				}
			]);

			const oExpectedResponse = {
				isKeyUser: true,
				isKeyUserTranslationEnabled: false,
				isVariantSharingEnabled: false,
				isContextSharingEnabled: true,
				isPublicFlVariantEnabled: false,
				isVariantPersonalizationEnabled: true,
				isVariantAuthorNameAvailable: false,
				isLocalResetEnabled: false,
				isAtoAvailable: false,
				isAtoEnabled: false,
				versioning: {
					CUSTOMER: false
				},
				isProductiveSystem: true,
				isPublicLayerAvailable: false,
				isZeroDowntimeUpgradeRunning: false,
				system: "",
				client: ""
			};
			const oLogResolveSpy = sandbox.spy(StorageUtils, "logAndResolveDefault");

			return Storage.loadFeatures().then(function(oResponse) {
				assert.strictEqual(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.strictEqual(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.strictEqual(oLogResolveSpy.callCount, 2, "the logAndResolveDefault called twice");
				assert.deepEqual(oResponse, oExpectedResponse, "response was merged even with one connector failing");
			});
		});

		QUnit.test("then it calls loadFeatures of the configured connectors", function(assert) {
			const oLrepConnectorLoadFeaturesStub = sandbox.stub(LrepConnector, "loadFeatures").resolves({});
			const oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadFeatures").resolves({});
			const sUrl = "/some/url";

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl},
				{connector: "JsObjectConnector"}
			]);

			return Storage.loadFeatures().then(function() {
				assert.strictEqual(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				const oLrepConnectorCallArgs = oLrepConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oLrepConnectorCallArgs, {url: sUrl}, "the url was passed");
				assert.strictEqual(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				const oJsObjectConnectorCallArgs = oJsObjectConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oJsObjectConnectorCallArgs, {url: undefined}, "no url was passed");
			});
		});

		QUnit.test("then merges the response of the connectors", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: this.url},
				{connector: "JsObjectConnector"}
			]);

			sandbox.stub(LrepConnector, "loadFeatures").resolves({
				isKeyUser: true
			});
			sandbox.stub(JsObjectConnector, "loadFeatures").resolves({
				system: "foo"
			});

			return Storage.loadFeatures().then(function(mFeatures) {
				assert.strictEqual(mFeatures.isKeyUser, true, "the property of the LrepConnector was added");
				assert.strictEqual(mFeatures.system, "foo", "the property of the JsObjectConnector was added");
			});
		});

		QUnit.test("then higher layer overrule the lower layer", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: this.url},
				{connector: "JsObjectConnector"}
			]);

			sandbox.stub(LrepConnector, "loadFeatures").resolves({
				isProductiveSystem: false
			});
			sandbox.stub(JsObjectConnector, "loadFeatures").resolves({
				isProductiveSystem: true
			});

			const DEFAULT_FEATURES = {
				isKeyUser: false,
				isKeyUserTranslationEnabled: false,
				isVariantSharingEnabled: false,
				isContextSharingEnabled: false,
				isPublicFlVariantEnabled: false,
				isVariantPersonalizationEnabled: true,
				isVariantAuthorNameAvailable: false,
				isAtoAvailable: false,
				isAtoEnabled: false,
				draft: {},
				isProductiveSystem: true,
				isPublicLayerAvailable: false,
				isLocalResetEnabled: false,
				isZeroDowntimeUpgradeRunning: false,
				system: "",
				client: ""
			};

			return Storage.loadFeatures().then(function(mFeatures) {
				assert.strictEqual(Object.keys(mFeatures).length, Object.keys(DEFAULT_FEATURES).length, "only 13 feature was provided");
				assert.strictEqual(mFeatures.isProductiveSystem, true, "the property was overruled by the second connector");
			});
		});
	});

	QUnit.module("Given Storage when loadVariantsAuthors is called", {
		beforeEach() {
			this.url = "/some/url";
			LrepConnector.xsrfToken = "123";
			PersonalizationConnector.xsrfToken = "123";
		},
		afterEach() {
			cleanUp();
			LrepConnector.xsrfToken = undefined;
			PersonalizationConnector.xsrfToken = undefined;
		}
	}, function() {
		QUnit.test("without reference param", function(assert) {
			return Storage.loadVariantsAuthors().then(function() {
			}).catch((sError) => {
				assert.equal(sError, "No reference was provided", "correct error is returned");
			});
		});

		QUnit.test("with a failing connector", function(assert) {
			const oLrepConnectorLoadFeaturesStub = sandbox.stub(LrepConnector, "loadVariantsAuthors").resolves({id1: "name1"});
			const oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadVariantsAuthors").rejects({});
			delete PersonalizationConnector.loadVariantsAuthors;

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{
					connector: "LrepConnector",
					url: this.url,
					layers: []
				}, {
					connector: "JsObjectConnector",
					layers: [Layer.CUSTOMER]
				}, {
					connector: "PersonalizationConnector",
					url: this.url,
					layers: [Layer.USER]
				}
			]);

			const oExpectedResponse = {
				id1: "name1"
			};
			const oLogResolveSpy = sandbox.spy(StorageUtils, "logAndResolveDefault");

			return Storage.loadVariantsAuthors("reference").then(function(oResponse) {
				assert.strictEqual(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadVariantsAuthors was triggered once");
				assert.strictEqual(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadVariantsAuthors was triggered once");
				assert.strictEqual(oLogResolveSpy.callCount, 3, "the logAndResolveDefault called three time");
				assert.deepEqual(oResponse, oExpectedResponse, "response was merged even with one connector failing");
			});
		});

		QUnit.test("then merges the response of the connectors", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: this.url},
				{connector: "JsObjectConnector"}
			]);

			const oLrepConnectorLoadFeaturesStub = sandbox.stub(LrepConnector, "loadVariantsAuthors").resolves({
				id1: "name1",
				id2: "name2"
			});
			const oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadVariantsAuthors").resolves({
				id3: "name3"
			});

			const oExpectedResponse = {
				id1: "name1",
				id2: "name2",
				id3: "name3"
			};
			return Storage.loadVariantsAuthors("reference").then(function(oResponse) {
				assert.strictEqual(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadVariantsAuthors was triggered once");
				const oLrepConnectorCallArgs = oLrepConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oLrepConnectorCallArgs, {url: this.url, reference: "reference"}, "the url was passed");
				assert.strictEqual(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadVariantsAuthors was triggered once");
				const oJsObjectConnectorCallArgs = oJsObjectConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oJsObjectConnectorCallArgs.url, undefined, "no url was passed");
				assert.deepEqual(oResponse, oExpectedResponse, "response was merged correctly");
			}.bind(this));
		});
	});

	QUnit.module("Storage merges results from different connectors", {
		afterEach() {
			cleanUp();
			JsObjectConnector.storage.clear();
		}
	}, function() {
		QUnit.test("Given all connectors provide empty variant properties", function(assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(JsObjectConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null}));
			});
		});

		QUnit.test("Given 2 connectors provide their own cacheKey values", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER]},
				{connector: "PersonalizationConnector", layers: [Layer.USER]}
			]);
			sandbox.stub(KeyUserConnector, "loadFlexData").resolves(merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: "abc"}));
			sandbox.stub(PersonalizationConnector, "loadFlexData").resolves(merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: "123"}));

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: "abc123"}));
				FlexConfiguration.getFlexibilityServices.restore();
			});
		});

		QUnit.test("Given 2 connectors provide url and path properties", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "ObjectPathConnector", path: "path/to/data"},
				{connector: "PersonalizationConnector", url: "url/to/something"}
			]);
			const oObjectStorageStub = sandbox.stub(ObjectPathConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			const oPersoStub = sandbox.stub(PersonalizationConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: sFlexReference, cacheKey: "cache"}).then(function() {
				assert.equal(oObjectStorageStub.lastCall.args[0].path, "path/to/data", "the path parameter was passed");
				assert.equal(oPersoStub.lastCall.args[0].url, "url/to/something", "the url parameter was passed");
				FlexConfiguration.getFlexibilityServices.restore();
			});
		});

		QUnit.test("Given LrepConnector when loading data with cacheKey and version together", function(assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			const oLrepStub = sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: sFlexReference, cacheKey: "cache", version: "version"}).then(function() {
				assert.notOk(oLrepStub.lastCall.args[0].cacheKey, "the cache key was removed");
			});
		});

		QUnit.test("Given some connector provides multiple layers", function(assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			const sVariant1 = "variant1";
			const mVariant1 = {
				fileName: sVariant1,
				fileType: "ctrl_variant",
				layer: Layer.VENDOR,
				title: "title",
				reference: sFlexReference,
				variantReference: "",
				variantManagementReference: "someVarManagementControlId"
			};
			JsObjectConnector.storage.setItem(ObjectStorageUtils.createFlexObjectKey(mVariant1), mVariant1);

			const sChangeId1 = "change1";
			const oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: sChangeId1,
				fileType: "change",
				layer: Layer.VENDOR,
				reference: sFlexReference,
				content: {},
				changeType: "hideControl",
				selector: {
					id: "control.id"
				},
				variantReference: sVariant1
			});
			const mChange1 = oChange1.convertToFileContent();
			JsObjectConnector.storage.setItem(ObjectStorageUtils.createFlexObjectKey(mChange1), mChange1);

			const sChangeId2 = "change2";
			const oChange2 = FlexObjectFactory.createFromFileContent({
				fileName: sChangeId2,
				fileType: "change",
				layer: Layer.CUSTOMER,
				reference: sFlexReference,
				content: {},
				changeType: "hideControl",
				selector: {
					id: "control.id"
				}
			});
			const mChange2 = oChange2.convertToFileContent();
			JsObjectConnector.storage.setItem(ObjectStorageUtils.createFlexObjectKey(mChange2), mChange2);

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.equal(oResult.changes.length, 1, "only the UI change was added to the result");
				assert.deepEqual(oResult.changes[0], mChange2, "the 2. change is in the response");
				assert.equal(oResult.variants.length, 1, "then the returned response has the variant");
				assert.equal(oResult.variants[0].fileName, sVariant1);
				assert.equal(oResult.variantDependentControlChanges.length, 1, "then the control change is added to the variant");
				assert.deepEqual(oResult.variantDependentControlChanges[0], mChange1);
			});
		});

		QUnit.test("Given all connectors provide empty variant sections", function(assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null}));
			});
		});

		QUnit.test("Given allContextsProvided false", function(assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(merge(StorageUtils.getEmptyFlexDataResponse(), {info: {allContextsProvided: false}}));

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null, info: {allContextsProvided: false}}));
			});
		});

		QUnit.test("Given allContextsProvided true", function(assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(merge(StorageUtils.getEmptyFlexDataResponse(), {info: {allContextsProvided: true}}));

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null, info: {allContextsProvided: true}}));
			});
		});

		QUnit.test("Given info.adaptationId and info.isEndUserAdaptation is filled", function(assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(merge(StorageUtils.getEmptyFlexDataResponse(), {info: {adaptationId: "id_1234", isEndUserAdaptation: true}}));

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null, info: {adaptationId: "id_1234", isEndUserAdaptation: true}}));
			});
		});

		QUnit.test("Given the first connector provide an empty variant section and the second provides variant data in separate properties", function(assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null}));
			});
		});

		QUnit.test("Given only one connector provides variant data in a variantSection", function(assert) {
			const oStaticFileConnectorResponse = { ...StorageUtils.getEmptyFlexDataResponse(), variantSection: {} };
			const sVariantManagementKey = "management1";

			const oVariant = {
				content: {
					fileName: "variant1",
					fileType: "ctrl_variant",
					layer: Layer.VENDOR,
					title: "title",
					reference: sFlexReference,
					variantReference: "",
					variantManagementReference: sVariantManagementKey
				},
				controlChanges: [],
				variantChanges: {}
			};

			oStaticFileConnectorResponse.variantSection[sVariantManagementKey] = {
				variants: [oVariant],
				variantManagementChanges: {}
			};

			const oExpectedStorageResponse = {
				...StorageUtils.getEmptyFlexDataResponse(),
				variants: [oVariant.content]
			};

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves({changes: []});

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.equal(Object.keys(oResult).length, 10, "ten entries are in the result");
			});
		});

		QUnit.test("Given only one connector provides UI2 personalization change and a variant change", function(assert) {
			const oContent = {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					text: "First Name",
					order: 2,
					visible: true,
					id: "testId",
					group: null
				}],
				oHeader: {
					text: "All",
					visible: true,
					id: "testControlId"
				}
			};

			const oUI2PersonalizationResponse = {
				"nw.core.iam.busr.userlist": {
					reference: "customer.reference.app.id_123456",
					content: oContent,
					itemName: "userTable",
					category: "I",
					containerKey: "nw.core.iam.busr.userlist",
					containerCategory: "U"
				}
			};

			const oVariantContent = {
				fileName: "fileName1",
				fileType: "ctrl_variant",
				layer: Layer.CUSTOMER,
				variantManagementReference: "variantManagement1",
				creation: "2020-04-17T13:10:20.1234567Z"
			};

			const oExpectedStorageResponse = {
				...StorageUtils.getEmptyFlexDataResponse(),
				ui2personalization: oUI2PersonalizationResponse,
				variants: [oVariantContent]
			};

			sandbox.stub(LrepConnector, "loadFlexData").resolves({
				ui2personalization: oUI2PersonalizationResponse,
				variantSection: {
					variantManagement1: {
						variantManagementChanges: {},
						variants: [{
							content: oVariantContent,
							controlChanges: [],
							variantChanges: {}
						}]
					}
				}
			});

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.deepEqual(oResult.ui2personalization, oUI2PersonalizationResponse, "then the UI2 personalization change is correct");
				assert.deepEqual(oResult.variants[0], oVariantContent, "then the variant change is correct");
				assert.equal(Object.keys(oResult).length, 10, "ten entries are in the result");
			});
		});

		QUnit.test("Given only one connector provides only UI2 personalization change", function(assert) {
			const oContent = {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					text: "First Name",
					order: 2,
					visible: true,
					id: "testId",
					group: null
				}],
				oHeader: {
					text: "All",
					visible: true,
					id: "testControlId"
				}
			};

			const oUI2PersonalizationResponse = {
				"nw.core.iam.busr.userlist": {
					reference: "customer.reference.app.id_123456",
					content: oContent,
					itemName: "userTable",
					category: "I",
					containerKey: "nw.core.iam.busr.userlist",
					containerCategory: "U"
				}
			};

			const oExpectedStorageResponse = {
				...StorageUtils.getEmptyFlexDataResponse(),
				ui2personalization: oUI2PersonalizationResponse
			};

			sandbox.stub(LrepConnector, "loadFlexData").resolves({
				ui2personalization: oUI2PersonalizationResponse
			});

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.deepEqual(oResult.ui2personalization, oUI2PersonalizationResponse, "then the UI2 personalization change is correct");
				assert.equal(Object.keys(oResult).length, 10, "ten entries are in the result");
			});
		});

		QUnit.test("Given only one connector provides only UI2 personalization change and variant section is empty object", function(assert) {
			const oContent = {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					text: "First Name",
					order: 2,
					visible: true,
					id: "testId",
					group: null
				}],
				oHeader: {
					text: "All",
					visible: true,
					id: "testControlId"
				}
			};

			const oUI2PersonalizationResponse = {
				"nw.core.iam.busr.userlist": {
					reference: "customer.reference.app.id_123456",
					content: oContent,
					itemName: "userTable",
					category: "I",
					containerKey: "nw.core.iam.busr.userlist",
					containerCategory: "U"
				}
			};

			const oExpectedStorageResponse = {
				...StorageUtils.getEmptyFlexDataResponse(),
				ui2personalization: oUI2PersonalizationResponse
			};

			sandbox.stub(LrepConnector, "loadFlexData").resolves({
				ui2personalization: oUI2PersonalizationResponse,
				variantSection: {}
			});

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.deepEqual(oResult.ui2personalization, oUI2PersonalizationResponse, "then the UI2 personalization change is correct");
				assert.equal(Object.keys(oResult).length, 10, "ten entries are in the result");
			});
		});

		QUnit.test("Given only one connector provides all types of changes", function(assert) {
			const oContent = {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					text: "First Name",
					order: 2,
					visible: true,
					id: "testId",
					group: null
				}],
				oHeader: {
					text: "All",
					visible: true,
					id: "testControlId"
				}
			};

			const oUI2PersonalizationResponse = {
				"nw.core.iam.busr.userlist": {
					reference: "customer.reference.app.id_123456",
					content: oContent,
					itemName: "userTable",
					category: "I",
					containerKey: "nw.core.iam.busr.userlist",
					containerCategory: "U"
				}
			};

			const oExpectedStorageResponse = {
				...StorageUtils.getEmptyFlexDataResponse(),
				ui2personalization: oUI2PersonalizationResponse
			};

			sandbox.stub(LrepConnector, "loadFlexData").resolves({
				ui2personalization: oUI2PersonalizationResponse,
				variantSection: {}
			});

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.deepEqual(oResult.ui2personalization, oUI2PersonalizationResponse, "then the UI2 personalization change is correct");
				assert.equal(Object.keys(oResult).length, 10, "ten entries are in the result");
			});
		});

		QUnit.test("Given 2 connectors provide variant data in variants properties", function(assert) {
			const oStaticFileConnectorResponse = StorageUtils.getEmptyFlexDataResponse();
			const oLrepConnectorResponse = StorageUtils.getEmptyFlexDataResponse();
			const sVariantManagementKey = "management1";

			const oVariant1 = {
				content: {
					fileName: "variant1",
					fileType: "ctrl_variant",
					layer: Layer.VENDOR,
					title: "title",
					reference: sFlexReference,
					variantReference: "",
					variantManagementReference: sVariantManagementKey
				}
			};
			oStaticFileConnectorResponse.variants = [oVariant1.content];

			const oVariant2 = {
				content: {
					fileName: "variant2",
					fileType: "ctrl_variant",
					layer: Layer.VENDOR,
					title: "title",
					reference: sFlexReference,
					variantReference: "",
					variantManagementReference: sVariantManagementKey
				}
			};
			oLrepConnectorResponse.variants = [oVariant2.content];

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oLrepConnectorResponse);

			const oExpectedStorageResponse = {
				...StorageUtils.getEmptyFlexDataResponse(),
				variants: [oVariant1.content, oVariant2.content]
			};

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.equal(Object.keys(oResult).length, 10, "ten entries are in the result");
			});
		});

		QUnit.test("Given 2 connectors provide a change with the same id - i.e. not deleted file from changes-bundle.json", function(assert) {
			const oStaticFileConnectorResponse = StorageUtils.getEmptyFlexDataResponse();
			const oLrepConnectorResponse = StorageUtils.getEmptyFlexDataResponse();

			const oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "rename_id_123",
				fileType: "ctrl_variant",
				layer: Layer.VENDOR,
				reference: sFlexReference,
				content: {}
			});
			oStaticFileConnectorResponse.changes = [oChange1.convertToFileContent()];

			const oChange2 = FlexObjectFactory.createFromFileContent({
				fileName: "rename_id_123",
				fileType: "ctrl_variant",
				layer: Layer.VENDOR,
				reference: sFlexReference,
				content: {}
			});
			oLrepConnectorResponse.changes = [oChange2.convertToFileContent()];

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oLrepConnectorResponse);

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.equal(oResult.changes.length, 1, "only one change was returned");
			});
		});
	});

	QUnit.module("Given all connector stubs", {
		beforeEach() {
			this.oGetStaticFileConnectorSpy = sandbox.spy(StorageUtils, "getStaticFileConnector");
		},
		afterEach() {
			cleanUp();
		}
	}, function() {
		QUnit.test("completeFlexData with mocked partialFlexData", function(assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.completeFlexData({reference: sFlexReference, partialFlexData: StorageUtils.getEmptyFlexDataResponse()}).then(function(oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null}));
			});
		});

		QUnit.test("loadFlexData", function(assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null}));
			});
		});
	});

	QUnit.module("Connector disassembles the variantSections", {
		afterEach() {
			cleanUp();
		}
	}, function() {
		QUnit.test("Given the first connector provide a variant in a variants property and the second provides a variant section with a variant", function(assert) {
			const oResponse1 = StorageUtils.getEmptyFlexDataResponse();
			oResponse1.variants.push({
				fileName: "variant1",
				fileType: "ctrl_variant",
				layer: Layer.CUSTOMER,
				variantManagementReference: "variantManagement1",
				creation: "2019-07-22T10:33:19.7491090Z"
			});
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oResponse1);
			const oResponse2 = StorageUtils.getEmptyFlexDataResponse();
			oResponse2.variantSection = {
				variantManagement1: {
					variantManagementChanges: {},
					variants: [{
						content: {
							fileName: "variant2",
							fileType: "ctrl_variant",
							layer: Layer.CUSTOMER,
							variantManagementReference: "variantManagement1",
							creation: "2019-07-22T10:34:19.7491090Z"
						},
						controlChanges: [],
						variantChanges: {}
					}]
				}
			};

			sandbox.stub(LrepConnector, "loadFlexData").resolves(oResponse2);

			const oExpectedResponse = merge({}, StorageUtils.getEmptyFlexDataResponse(), {
				variants: [oResponse1.variants[0], oResponse2.variantSection.variantManagement1.variants[0].content]
			});
			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(oExpectedResponse, {cacheKey: null}), "then the expected result is returned");
			});
		});

		QUnit.test("Given two connectors provide variants in the variant section", function(assert) {
			const oResponse1 = [{
				changes: [],
				variantSection: {},
				ui2personalization: {
					key1: "value1"
				},
				cacheKey: "key1"
			},
			{
				changes: [],
				variantSection: {},
				ui2personalization: {}
			}];
			oResponse1[0].variantSection = {
				variantManagement1: {
					variantManagementChanges: {},
					variants: [{
						content: {
							fileName: "variant1",
							fileType: "ctrl_variant",
							layer: Layer.CUSTOMER,
							variantManagementReference: "variantManagement1",
							creation: "2019-07-22T10:33:19.7491090Z"
						},
						controlChanges: [],
						variantChanges: {}
					}]
				}
			};
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oResponse1);
			const oResponse2 = {
				changes: [],
				variantSection: {},
				ui2personalization: {
					key2: "value2"
				},
				cacheKey: "key2"
			};
			oResponse2.variantSection = {
				variantManagement1: {
					variantManagementChanges: {},
					variants: [{
						content: {
							fileName: "variant2",
							fileType: "ctrl_variant",
							layer: Layer.CUSTOMER,
							variantManagementReference: "variantManagement1",
							creation: "2019-07-22T10:34:19.7491090Z"
						},
						controlChanges: [],
						variantChanges: {}
					}]
				}
			};
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oResponse2);

			const oExpectedResponse = {
				...StorageUtils.getEmptyFlexDataResponse(),
				variants: [
					oResponse1[0].variantSection.variantManagement1.variants[0].content,
					oResponse2.variantSection.variantManagement1.variants[0].content
				]
			};
			oExpectedResponse.ui2personalization = {
				key1: "value1",
				key2: "value2"
			};
			oExpectedResponse.cacheKey = "key1key2";
			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, oExpectedResponse, "then the expected result is returned");
			});
		});

		QUnit.test("Given two connectors are provided and one is in charge of all layers and a draft layer is set", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: []},
				{connector: "LrepConnector", layers: ["ALL"]}
			]);
			FlexInfoSession.setByReference({version: Version.Number.Draft, initialAllContexts: true, maxLayer: Layer.CUSTOMER, saveChangeKeepSession: false}, sFlexReference);

			const oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			const oLrepConnectorStub = sandbox.stub(LrepConnector, "loadFlexData").resolves();
			const oJsObjectConnectorStub = sandbox.stub(JsObjectConnector, "loadFlexData").resolves();

			return Storage.loadFlexData({
				reference: sFlexReference,
				version: Version.Number.Draft
			}).then(function() {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].version, undefined, "the StaticFileConnector has the version property NOT set");
				assert.equal(oJsObjectConnectorStub.getCall(0).args[0].version, undefined, "the connector NOT in charge for draft layer has the version property NOT set");
				assert.equal(oLrepConnectorStub.getCall(0).args[0].version, Version.Number.Draft, "the connector for draft layer has the version property set");
				assert.equal(FlexInfoSession.getByReference(sFlexReference).version, undefined, "version is deleted in flex info session");
				assert.equal(FlexInfoSession.getByReference(sFlexReference).maxLayer, undefined, "max layer is deleted in flex info session");
				assert.equal(FlexInfoSession.getByReference(sFlexReference).initialAllContexts, true, "initialAllContexts still in flex info session");
			});
		});

		QUnit.test("Given a maxLayer set for VENDOR", async function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: []}
			]);
			sandbox.stub(JsObjectConnector, "loadFlexData").resolves();
			FlexInfoSession.setByReference({maxLayer: Layer.VENDOR}, sFlexReference);
			window.sessionStorage.setItem("sap.ui.rta.restart.VENDOR", true);
			const oSetInfoSessionSpy = sandbox.spy(FlexInfoSession, "setByReference");
			await Storage.loadFlexData({reference: sFlexReference});
			assert.equal(oSetInfoSessionSpy.callCount, 0, "then the FlexInfoSession is not updated");
		});

		QUnit.test("Given two connectors are provided and one is in charge of a draft layer provided by flex info session", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER]},
				{connector: "JsObjectConnector", layers: [Layer.USER]}
			]);

			const oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			const oKeyUserConnectorStub = sandbox.stub(KeyUserConnector, "loadFlexData").resolves();
			const oJsObjectConnectorStub = sandbox.stub(JsObjectConnector, "loadFlexData").resolves();

			FlexInfoSession.setByReference({version: Version.Number.Draft}, sFlexReference);
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", true);

			return Storage.loadFlexData({
				reference: sFlexReference
			}).then(function() {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].version, undefined, "the StaticFileConnector has the version property NOT set");
				assert.equal(oKeyUserConnectorStub.getCall(0).args[0].version, Version.Number.Draft, "the connector for draft layer has the version number set");
				assert.equal(oJsObjectConnectorStub.getCall(0).args[0].version, undefined, "the connector NOT in charge for draft layer has the version property NOT set");
			});
		});

		QUnit.test("Given two connectors are provided and one is in charge of all layers and a draft layer provided by flex info session", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: []},
				{connector: "LrepConnector", layers: ["ALL"]}
			]);

			const oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			const oLrepConnectorStub = sandbox.stub(LrepConnector, "loadFlexData").resolves();
			const oJsObjectConnectorStub = sandbox.stub(JsObjectConnector, "loadFlexData").resolves();

			FlexInfoSession.setByReference({version: Version.Number.Draft}, sFlexReference);
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", true);

			return Storage.loadFlexData({
				reference: sFlexReference
			}).then(function() {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].version, undefined, "the StaticFileConnector has the version property NOT set");
				assert.equal(oJsObjectConnectorStub.getCall(0).args[0].version, undefined, "the connector NOT in charge for draft layer has the version property NOT set");
				assert.equal(oLrepConnectorStub.getCall(0).args[0].version, Version.Number.Draft, "the connector for draft layer has the version property set");
			});
		});

		QUnit.test("Given one connector are provided version parameter are not set in flex info session and saveChangeKeepSession is set", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER]}
			]);

			const oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			const oKeyUserConnectorStub = sandbox.stub(KeyUserConnector, "loadFlexData").resolves();

			FlexInfoSession.setByReference({maxLayer: Layer.CUSTOMER, saveChangeKeepSession: true}, sFlexReference);

			return Storage.loadFlexData({
				reference: sFlexReference
			}).then(function() {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].version, undefined, "the StaticFileConnector has the version property NOT set");
				assert.equal(oKeyUserConnectorStub.getCall(0).args[0].version, undefined, "version property NOT set for the connector");
				assert.equal(FlexInfoSession.getByReference(sFlexReference).version, undefined, "version is not set in flex info session");
				assert.equal(FlexInfoSession.getByReference(sFlexReference).maxLayer, Layer.CUSTOMER, "max layer is still in flex info session");
			});
		});
	});

	QUnit.module("Disassemble & merge the comp variants", {
		afterEach() {
			cleanUp();
		}
	}, function() {
		QUnit.test("Given the first connector provide a comp variant in the changes and the second provides a comp section with a variant", function(assert) {
			const oResponse1 = StorageUtils.getEmptyFlexDataResponse();
			delete oResponse1.comp; // simulate legacy response
			const oVariant1 = {
				fileName: "variant1",
				fileType: "variant",
				layer: Layer.CUSTOMER,
				creation: "2019-07-22T10:33:19.7491090Z"
			};
			oResponse1.changes.push(oVariant1);
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oResponse1);
			const oResponse2 = StorageUtils.getEmptyFlexDataResponse();
			const oVariant2 = {
				fileName: "variant2",
				fileType: "variant",
				layer: Layer.CUSTOMER,
				creation: "2019-07-22T10:34:19.7491091Z"
			};
			oResponse2.comp = {
				variants: [oVariant2]
			};

			sandbox.stub(LrepConnector, "loadFlexData").resolves(oResponse2);

			const oExpectedResponse = merge({}, StorageUtils.getEmptyFlexDataResponse(), {
				comp: {
					variants: [oVariant1, oVariant2]
				}
			});
			return Storage.loadFlexData({reference: sFlexReference}).then(function(oResult) {
				assert.deepEqual(oResult, merge(oExpectedResponse, {cacheKey: null}), "then the expected result is returned");
			});
		});
	});

	QUnit.module("Storage with a custom & broken connector", {
		beforeEach() {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([{
				loadConnector: "my/connectors/BrokenInitialConnector",
				layers: []}
			]);
			// enforce the bundle loading by simulating the no-preload scenario
			sandbox.stub(Component, "getComponentPreloadMode").returns("off");
		},
		afterEach() {
			cleanUp();
		}
	}, function() {
		QUnit.test("given a custom connector is configured when loading load connectors", function(assert) {
			return StorageUtils.getLoadConnectors().then(function(aConnectors) {
				assert.equal(aConnectors.length, 2, "two connectors are loaded");
				assert.equal(aConnectors[0].connector, "StaticFileConnector", "the StaticFileConnector is the first connector");
				assert.equal(aConnectors[1].loadConnector, "my/connectors/BrokenInitialConnector", "the BrokenConnector is the second connector");
				assert.equal(aConnectors[1].loadConnectorModule.testInitialCheckProperty, true, "the test property identifying the BrokenConnector is present");
			});
		});

		QUnit.test("given the BrokenConnector is registered and a changes-bundle.json is present for the application when Connector.loadFlexData is called", function(assert) {
			return Storage.loadFlexData({reference: "test.app", componentName: "test.app"}).then(function(oResult) {
				assert.equal(oResult.changes.length, 1, "then one change is returned");
				assert.deepEqual(oResult.changes[0], {dummy: true}, "and the data from the changes bundle is included");
			});
		});
	});

	QUnit.module("loadFlVariant", {
		beforeEach() {
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when there are multiple connectors configured", async function(assert) {
			const sUrl = "some/url";
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{
					connector: "BtpServiceConnector",
					url: sUrl,
					layers: [Layer.PUBLIC, Layer.CUSTOMER]
				},
				// the JsObjectConnector does not extend the BaseLoadConnector and has no loadFlVariant function
				{
					connector: "JsObjectConnector",
					layers: [Layer.CUSTOMER]
				}
			]);
			sandbox.stub(BtpServiceConnector, "loadFlVariant").resolves({
				variants: [{fileName: "variant1"}],
				variantDependentControlChanges: [{fileName: "change1"}, {fileName: "change2"}],
				variantChanges: [{fileName: "variantChange1"}, {fileName: "variantChange2"}],
				changes: [{fileName: "change1"}]
			});
			const oResult = await Storage.loadFlVariant({reference: sFlexReference, variantReference: "variant1"});
			assert.deepEqual(oResult, {
				variants: [{fileName: "variant1"}],
				variantDependentControlChanges: [{fileName: "change1"}, {fileName: "change2"}],
				variantChanges: [{fileName: "variantChange1"}, {fileName: "variantChange2"}]
			}, "the result is correct");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
