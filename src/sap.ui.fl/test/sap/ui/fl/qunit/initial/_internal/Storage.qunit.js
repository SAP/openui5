/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Variant",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/initial/_internal/connectors/StaticFileConnector",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/write/_internal/connectors/ObjectPathConnector",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/base/util/merge"
], function (
	sinon,
	Storage,
	Change,
	Layer,
	Variant,
	StorageUtils,
	FlUtils,
	StaticFileConnector,
	LrepConnector,
	JsObjectConnector,
	KeyUserConnector,
	PersonalizationConnector,
	ObjectPathConnector,
	ObjectStorageUtils,
	merge
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Storage checks the input parameters", {
		beforeEach: function () {
			sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("given no property bag was passed on loadFlexData", function (assert) {
			return assert.throws(Storage.loadFlexData());
		});

		QUnit.test("given no reference within the property bag was passed on loadFlexData", function (assert) {
			return assert.throws(Storage.loadFlexData({}));
		});
	});


	QUnit.module("Storage merges results from different connectors", {
		afterEach: function () {
			sandbox.restore();
			JsObjectConnector.storage.clear();
		}
	}, function () {
		QUnit.test("Given all connectors provide empty variant properties", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(JsObjectConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null}));
			});
		});

		QUnit.test("Given 2 connectors provide their own cacheKey values", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER]},
				{connector: "PersonalizationConnector", layers: [Layer.USER]}
			]);
			sandbox.stub(KeyUserConnector, "loadFlexData").resolves(merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: "abc"}));
			sandbox.stub(PersonalizationConnector, "loadFlexData").resolves(merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: "123"}));

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: "abc123"}));
				sap.ui.getCore().getConfiguration().getFlexibilityServices.restore();
			});
		});

		QUnit.test("Given 2 connectors provide url and path properties", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "ObjectPathConnector", path: "path/to/data"},
				{connector: "PersonalizationConnector", url: "url/to/something"}
			]);
			var oObjectStorageStub = sandbox.stub(ObjectPathConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			var oPersoStub = sandbox.stub(PersonalizationConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: "app.id"}).then(function () {
				assert.equal(oObjectStorageStub.lastCall.args[0].path, "path/to/data", "the path parameter was passed");
				assert.equal(oPersoStub.lastCall.args[0].url, "url/to/something", "the url parameter was passed");
				sap.ui.getCore().getConfiguration().getFlexibilityServices.restore();
			});
		});

		QUnit.test("Given some connector provides multiple layers", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			var sVariant1 = "variant1";
			var oVariant1 = Variant.createInitialFileContent({
				content: {
					fileName: sVariant1,
					fileType: "ctrl_variant",
					layer: Layer.VENDOR,
					title: "title",
					reference: "app.id",
					variantReference: "",
					content: {},
					variantManagementReference: "someVarManagementControlId"
				}
			});
			var mVariant1 = oVariant1.content;
			JsObjectConnector.storage.setItem(ObjectStorageUtils.createFlexObjectKey(mVariant1), mVariant1);

			var sChangeId1 = "change1";
			var oChange1 = new Change({
				fileName: sChangeId1,
				fileType: "change",
				layer: Layer.VENDOR,
				reference: "app.id",
				content: {},
				changeType: "hideControl",
				selector: {
					id: "control.id"
				},
				variantReference: sVariant1
			});
			var mChange1 = oChange1.getDefinition();
			JsObjectConnector.storage.setItem(ObjectStorageUtils.createFlexObjectKey(mChange1), mChange1);

			var sChangeId2 = "change2";
			var oChange2 = new Change({
				fileName: sChangeId2,
				fileType: "change",
				layer: Layer.CUSTOMER,
				reference: "app.id",
				content: {},
				changeType: "hideControl",
				selector: {
					id: "control.id"
				}
			});
			var mChange2 = oChange2.getDefinition();
			JsObjectConnector.storage.setItem(ObjectStorageUtils.createFlexObjectKey(mChange2), mChange2);

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.equal(oResult.changes.length, 1, "only the UI change was added to the result");
				assert.deepEqual(oResult.changes[0], mChange2, "the 2. change is in the response");
				assert.equal(oResult.variants.length, 1, "then the returned response has the variant");
				assert.equal(oResult.variants[0].fileName, sVariant1);
				assert.equal(oResult.variantDependentControlChanges.length, 1, "then the control change is added to the variant");
				assert.deepEqual(oResult.variantDependentControlChanges[0], mChange1);
			});
		});

		QUnit.test("Given all connectors provide empty variant sections", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null}));
			});
		});

		QUnit.test("Given the first connector provide an empty variant section and the second provides variant data in separate properties", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null}));
			});
		});

		QUnit.test("Given only one connector provides variant data in a variantSection", function (assert) {
			var oStaticFileConnectorResponse = Object.assign(StorageUtils.getEmptyFlexDataResponse(), {variantSection: {}});
			var sVariantManagementKey = "management1";

			var oVariant = Variant.createInitialFileContent({
				content: {
					fileName: "variant1",
					fileType: "ctrl_variant",
					layer: Layer.VENDOR,
					title: "title",
					reference: "app.id",
					variantReference: "",
					content: {},
					variantManagementReference: sVariantManagementKey
				}
			});

			oStaticFileConnectorResponse.variantSection[sVariantManagementKey] = {
				variants: [oVariant],
				variantManagementChanges: {}
			};

			var oExpectedStorageResponse = Object.assign(StorageUtils.getEmptyFlexDataResponse(), {
				variants: [oVariant.content]
			});

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves({changes: []});

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.equal(Object.keys(oResult).length, 9, "nine entries are in the result");
			});
		});

		QUnit.test("Given only one connector provides UI2 personalization change and a variant change", function (assert) {
			var oContent = {
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

			var oUI2PersonalizationResponse = {
				"nw.core.iam.busr.userlist": {
					reference: "customer.reference.app.id_123456",
					content: oContent,
					itemName: "userTable",
					category: "I",
					containerKey: "nw.core.iam.busr.userlist",
					containerCategory: "U"
				}
			};

			var oVariantContent = {
				fileName: "fileName1",
				fileType: "ctrl_variant",
				layer: Layer.CUSTOMER,
				variantManagementReference: "variantManagement1",
				creation: "2020-04-17T13:10:20.1234567Z"
			};

			var oExpectedStorageResponse = Object.assign(StorageUtils.getEmptyFlexDataResponse(), {
				ui2personalization: oUI2PersonalizationResponse,
				variants: [oVariantContent]
			});

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

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.deepEqual(oResult.ui2personalization, oUI2PersonalizationResponse, "then the UI2 personalization change is correct");
				assert.deepEqual(oResult.variants[0], oVariantContent, "then the variant change is correct");
				assert.equal(Object.keys(oResult).length, 9, "nine entries are in the result");
			});
		});

		QUnit.test("Given only one connector provides only UI2 personalization change", function (assert) {
			var oContent = {
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

			var oUI2PersonalizationResponse = {
				"nw.core.iam.busr.userlist": {
					reference: "customer.reference.app.id_123456",
					content: oContent,
					itemName: "userTable",
					category: "I",
					containerKey: "nw.core.iam.busr.userlist",
					containerCategory: "U"
				}
			};

			var oExpectedStorageResponse = Object.assign(StorageUtils.getEmptyFlexDataResponse(), {
				ui2personalization: oUI2PersonalizationResponse
			});

			sandbox.stub(LrepConnector, "loadFlexData").resolves({
				ui2personalization: oUI2PersonalizationResponse
			});

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.deepEqual(oResult.ui2personalization, oUI2PersonalizationResponse, "then the UI2 personalization change is correct");
				assert.equal(Object.keys(oResult).length, 9, "nine entries are in the result");
			});
		});

		QUnit.test("Given only one connector provides only UI2 personalization change and variant section is empty object", function (assert) {
			var oContent = {
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

			var oUI2PersonalizationResponse = {
				"nw.core.iam.busr.userlist": {
					reference: "customer.reference.app.id_123456",
					content: oContent,
					itemName: "userTable",
					category: "I",
					containerKey: "nw.core.iam.busr.userlist",
					containerCategory: "U"
				}
			};

			var oExpectedStorageResponse = Object.assign(StorageUtils.getEmptyFlexDataResponse(), {
				ui2personalization: oUI2PersonalizationResponse
			});

			sandbox.stub(LrepConnector, "loadFlexData").resolves({
				ui2personalization: oUI2PersonalizationResponse,
				variantSection: {}
			});

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.deepEqual(oResult.ui2personalization, oUI2PersonalizationResponse, "then the UI2 personalization change is correct");
				assert.equal(Object.keys(oResult).length, 9, "nine entries are in the result");
			});
		});

		QUnit.test("Given only one connector provides all types of changes", function (assert) {
			var oContent = {
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

			var oUI2PersonalizationResponse = {
				"nw.core.iam.busr.userlist": {
					reference: "customer.reference.app.id_123456",
					content: oContent,
					itemName: "userTable",
					category: "I",
					containerKey: "nw.core.iam.busr.userlist",
					containerCategory: "U"
				}
			};

			var oExpectedStorageResponse = Object.assign(StorageUtils.getEmptyFlexDataResponse(), {
				ui2personalization: oUI2PersonalizationResponse
			});

			sandbox.stub(LrepConnector, "loadFlexData").resolves({
				ui2personalization: oUI2PersonalizationResponse,
				variantSection: {}
			});

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.deepEqual(oResult.ui2personalization, oUI2PersonalizationResponse, "then the UI2 personalization change is correct");
				assert.equal(Object.keys(oResult).length, 9, "nine entries are in the result");
			});
		});

		QUnit.test("Given 2 connectors provide variant data in variants properties", function (assert) {
			var oStaticFileConnectorResponse = StorageUtils.getEmptyFlexDataResponse();
			var oLrepConnectorResponse = StorageUtils.getEmptyFlexDataResponse();
			var sVariantManagementKey = "management1";

			var oVariant1 = Variant.createInitialFileContent({
				content: {
					fileName: "variant1",
					fileType: "ctrl_variant",
					layer: Layer.VENDOR,
					title: "title",
					reference: "app.id",
					variantReference: "",
					content: {},
					variantManagementReference: sVariantManagementKey
				}
			});
			oStaticFileConnectorResponse.variants = [oVariant1.content];

			var oVariant2 = Variant.createInitialFileContent({
				content: {
					fileName: "variant2",
					fileType: "ctrl_variant",
					layer: Layer.VENDOR,
					title: "title",
					reference: "app.id",
					variantReference: "",
					content: {},
					variantManagementReference: sVariantManagementKey
				}
			});
			oLrepConnectorResponse.variants = [oVariant2.content];

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oLrepConnectorResponse);

			var oExpectedStorageResponse = Object.assign(StorageUtils.getEmptyFlexDataResponse(), {
				variants: [oVariant1.content, oVariant2.content]
			});

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(oExpectedStorageResponse, {cacheKey: null}), "then the expected result is returned");
				assert.equal(Object.keys(oResult).length, 9, "nine entries are in the result");
			});
		});

		QUnit.test("Given 2 connectors provide a change with the same id - i.e. not deleted file from changes-bundle.json", function (assert) {
			var oStaticFileConnectorResponse = StorageUtils.getEmptyFlexDataResponse();
			var oLrepConnectorResponse = StorageUtils.getEmptyFlexDataResponse();

			var oChange1 = new Change({
				fileName: "rename_id_123",
				fileType: "ctrl_variant",
				layer: Layer.VENDOR,
				reference: "app.id",
				content: {}
			});
			oStaticFileConnectorResponse.changes = [oChange1.getDefinition()];

			var oChange2 = new Change({
				fileName: "rename_id_123",
				fileType: "ctrl_variant",
				layer: Layer.VENDOR,
				reference: "app.id",
				content: {}
			});
			oLrepConnectorResponse.changes = [oChange2.getDefinition()];

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oLrepConnectorResponse);

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.equal(oResult.changes.length, 1, "only one change was returned");
			});
		});
	});

	QUnit.module("Given all connector stubs", {
		beforeEach: function () {
			this.oGetStaticFileConnectorSpy = sandbox.spy(StorageUtils, "getStaticFileConnector");
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("completeFlexData with mocked partialFlexData", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.completeFlexData({reference: "app.id", partialFlexData: StorageUtils.getEmptyFlexDataResponse()}).then(function (oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null}));
			});
		});

		QUnit.test("loadFlexData", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: null}));
			});
		});
	});

	QUnit.module("Connector disassembles the variantSections", {
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("Given the first connector provide a variant in a variants property and the second provides a variant section with a variant", function (assert) {
			var oResponse1 = StorageUtils.getEmptyFlexDataResponse();
			oResponse1.variants.push({
				fileName: "variant1",
				fileType: "ctrl_variant",
				layer: Layer.CUSTOMER,
				variantManagementReference: "variantManagement1",
				creation: "2019-07-22T10:33:19.7491090Z"
			});
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oResponse1);
			var oResponse2 = StorageUtils.getEmptyFlexDataResponse();
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

			var oExpectedResponse = merge({}, StorageUtils.getEmptyFlexDataResponse(), {
				variants: [oResponse1.variants[0], oResponse2.variantSection.variantManagement1.variants[0].content]
			});
			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(oExpectedResponse, {cacheKey: null}), "then the expected result is returned");
			});
		});

		QUnit.test("Given two connectors provide variants in the variant section", function (assert) {
			var oResponse1 = {
				changes: [],
				variantSection: {},
				ui2personalization: {
					key1: "value1"
				},
				cacheKey: "key1"
			};
			oResponse1.variantSection = {
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
			var oResponse2 = {
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

			var oExpectedResponse = Object.assign({}, StorageUtils.getEmptyFlexDataResponse(), {
				variants: [oResponse1.variantSection.variantManagement1.variants[0].content, oResponse2.variantSection.variantManagement1.variants[0].content]
			});
			oExpectedResponse.ui2personalization = {
				key1: "value1",
				key2: "value2"
			};
			oExpectedResponse.cacheKey = "key1key2";
			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, oExpectedResponse, "then the expected result is returned");
			});
		});

		QUnit.test("Given two connectors are provided and one is in charge of all layers and a draft layer is set", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: []},
				{connector: "LrepConnector", layers: ["ALL"]}
			]);

			var oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			var oLrepConnectorStub = sandbox.stub(LrepConnector, "loadFlexData").resolves();
			var oJsObjectConnectorStub = sandbox.stub(JsObjectConnector, "loadFlexData").resolves();

			return Storage.loadFlexData({
				reference: "app.id",
				version: sap.ui.fl.Versions.Draft
			}).then(function () {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].version, undefined, "the StaticFileConnector has the version property NOT set");
				assert.equal(oJsObjectConnectorStub.getCall(0).args[0].version, undefined, "the connector NOT in charge for draft layer has the version property NOT set");
				assert.equal(oLrepConnectorStub.getCall(0).args[0].version, sap.ui.fl.Versions.Draft.toString(), "the connector for draft layer has the version property set");
			});
		});

		QUnit.test("Given two connectors are provided and one is in charge of a draft layer provided by a url parameter", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER]},
				{connector: "JsObjectConnector", layers: [Layer.USER]}
			]);

			var oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			var oKeyUserConnectorStub = sandbox.stub(KeyUserConnector, "loadFlexData").resolves();
			var oJsObjectConnectorStub = sandbox.stub(JsObjectConnector, "loadFlexData").resolves();

			sandbox.stub(FlUtils, "getUrlParameter").returns(sap.ui.fl.Versions.Draft.toString());

			return Storage.loadFlexData({
				reference: "app.id"
			}).then(function () {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].version, undefined, "the StaticFileConnector has the version property NOT set");
				assert.equal(oKeyUserConnectorStub.getCall(0).args[0].version, sap.ui.fl.Versions.Draft.toString(), "the connector for draft layer has the version number set");
				assert.equal(oJsObjectConnectorStub.getCall(0).args[0].version, undefined, "the connector NOT in charge for draft layer has the version property NOT set");
			});
		});

		QUnit.test("Given two connectors are provided and one is in charge of all layers and a draft layer provided by a url parameter", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: []},
				{connector: "LrepConnector", layers: ["ALL"]}
			]);

			var oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			var oLrepConnectorStub = sandbox.stub(LrepConnector, "loadFlexData").resolves();
			var oJsObjectConnectorStub = sandbox.stub(JsObjectConnector, "loadFlexData").resolves();

			sandbox.stub(FlUtils, "getUrlParameter").returns(sap.ui.fl.Versions.Draft.toString());

			return Storage.loadFlexData({
				reference: "app.id"
			}).then(function () {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].version, undefined, "the StaticFileConnector has the version property NOT set");
				assert.equal(oJsObjectConnectorStub.getCall(0).args[0].version, undefined, "the connector NOT in charge for draft layer has the version property NOT set");
				assert.equal(oLrepConnectorStub.getCall(0).args[0].version, sap.ui.fl.Versions.Draft.toString(), "the connector for draft layer has the version property set");
			});
		});

		QUnit.test("Given one connector are provided version parameter are not set in url parameter", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER]}
			]);

			var oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			var oKeyUserConnectorStub = sandbox.stub(KeyUserConnector, "loadFlexData").resolves();

			return Storage.loadFlexData({
				reference: "app.id"
			}).then(function () {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].version, undefined, "the StaticFileConnector has the version property NOT set");
				assert.equal(oKeyUserConnectorStub.getCall(0).args[0].version, undefined, "version property NOT set for the connector");
			});
		});
	});


	QUnit.module("Disassemble & merge the comp variants", {
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("Given the first connector provide a comp variant in the changes and the second provides a comp section with a variant", function (assert) {
			var oResponse1 = StorageUtils.getEmptyFlexDataResponse();
			delete oResponse1.comp; // simulate legacy response
			var oVariant1 = {
				fileName: "variant1",
				fileType: "variant",
				layer: Layer.CUSTOMER,
				creation: "2019-07-22T10:33:19.7491090Z"
			};
			oResponse1.changes.push(oVariant1);
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oResponse1);
			var oResponse2 = StorageUtils.getEmptyFlexDataResponse();
			var oVariant2 = {
				fileName: "variant2",
				fileType: "variant",
				layer: Layer.CUSTOMER,
				creation: "2019-07-22T10:34:19.7491091Z"
			};
			oResponse2.comp = {
				variants: [oVariant2]
			};

			sandbox.stub(LrepConnector, "loadFlexData").resolves(oResponse2);

			var oExpectedResponse = merge({}, StorageUtils.getEmptyFlexDataResponse(), {
				comp: {
					variants: [oVariant1, oVariant2]
				}
			});
			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(oExpectedResponse, {cacheKey: null}), "then the expected result is returned");
			});
		});
	});

	QUnit.module("Storage with a custom & broken connector", {
		beforeEach: function() {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([{
				loadConnector: "my/connectors/BrokenInitialConnector",
				layers: []}
			]);
			// enforce the bundle loading by simulating the no-preload scenario
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getComponentPreload").returns("off");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given a custom connector is configured when loading load connectors", function(assert) {
			return StorageUtils.getLoadConnectors().then(function (aConnectors) {
				assert.equal(aConnectors.length, 2, "two connectors are loaded");
				assert.equal(aConnectors[0].connector, "StaticFileConnector", "the StaticFileConnector is the first connector");
				assert.equal(aConnectors[1].loadConnector, "my/connectors/BrokenInitialConnector", "the BrokenConnector is the second connector");
				assert.equal(aConnectors[1].loadConnectorModule.testInitialCheckProperty, true, "the test property identifying the BrokenConnector is present");
			});
		});

		QUnit.test("given the BrokenConnector is registered and a changes-bundle.json is present for the application when Connector.loadFlexData is called", function(assert) {
			return Storage.loadFlexData({reference: "test.app", componentName: "test.app"}).then(function (oResult) {
				assert.equal(oResult.changes.length, 1, "then one change is returned");
				assert.deepEqual(oResult.changes[0], {dummy: true}, "and the data from the changes bundle is included");
			});
		});
	});


	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
