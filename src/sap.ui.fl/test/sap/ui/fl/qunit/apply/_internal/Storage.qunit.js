/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/fl/apply/_internal/StorageResultMerger",
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/connectors/StaticFileConnector",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/apply/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/apply/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/base/util/merge"
], function (
	sinon,
	Storage,
	Change,
	Variant,
	StorageResultMerger,
	StorageUtils,
	FlUtils,
	StaticFileConnector,
	LrepConnector,
	JsObjectConnector,
	KeyUserConnector,
	PersonalizationConnector,
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
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
			JsObjectConnector.oStorage.clear();
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
				{connector: "KeyUserConnector", layers: ["CUSTOMER"]},
				{connector: "PersonalizationConnector", layers: ["USER"]}
			]);
			sandbox.stub(KeyUserConnector, "loadFlexData").resolves(merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: "abc"}));
			sandbox.stub(PersonalizationConnector, "loadFlexData").resolves(merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: "123"}));

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, merge(StorageUtils.getEmptyFlexDataResponse(), {cacheKey: "abc123"}));
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
					layer: "VENDOR",
					title: "title",
					reference: "app.id",
					variantReference: "",
					content: {},
					variantManagementReference: "someVarManagementControlId"
				}
			});
			var mVariant1 = oVariant1.content;
			JsObjectConnector.oStorage.setItem(ObjectStorageUtils.createFlexObjectKey(mVariant1), mVariant1);

			var sChangeId1 = "change1";
			var oChange1 = new Change({
				fileName: sChangeId1,
				fileType: "change",
				layer: "VENDOR",
				reference: "app.id",
				content: {},
				changeType: "hideControl",
				selector: {
					id: "control.id"
				},
				variantReference: sVariant1
			});
			var mChange1 = oChange1.getDefinition();
			JsObjectConnector.oStorage.setItem(ObjectStorageUtils.createFlexObjectKey(mChange1), mChange1);

			var sChangeId2 = "change2";
			var oChange2 = new Change({
				fileName: sChangeId2,
				fileType: "change",
				layer: "CUSTOMER",
				reference: "app.id",
				content: {},
				changeType: "hideControl",
				selector: {
					id: "control.id"
				}
			});
			var mChange2 = oChange2.getDefinition();
			JsObjectConnector.oStorage.setItem(ObjectStorageUtils.createFlexObjectKey(mChange2), mChange2);

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
					layer: "VENDOR",
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
				assert.equal(Object.keys(oResult).length, 8, "seven entries are in the result");
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
					layer: "VENDOR",
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
					layer: "VENDOR",
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
				assert.equal(Object.keys(oResult).length, 8, "seven entries are in the result");
			});
		});

		QUnit.test("Given 2 connectors provide a change with the same id - i.e. not deleted file from changes-bundle.json", function (assert) {
			var oStaticFileConnectorResponse = StorageUtils.getEmptyFlexDataResponse();
			var oLrepConnectorResponse = StorageUtils.getEmptyFlexDataResponse();

			var oChange1 = new Change({
				fileName: "rename_id_123",
				fileType: "ctrl_variant",
				layer: "VENDOR",
				reference: "app.id",
				content: {}
			});
			oStaticFileConnectorResponse.changes = [oChange1.getDefinition()];

			var oChange2 = new Change({
				fileName: "rename_id_123",
				fileType: "ctrl_variant",
				layer: "VENDOR",
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
				layer: "CUSTOMER",
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
							layer: "CUSTOMER",
							variantManagementReference: "variantManagement1",
							creation:"2019-07-22T10:34:19.7491090Z"
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
							layer: "CUSTOMER",
							variantManagementReference: "variantManagement1",
							creation: "2019-07-22T10:33:19.7491090Z"
						},
						controlChanges: [],
						variantChanges:{}
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
							layer: "CUSTOMER",
							variantManagementReference: "variantManagement1",
							creation: "2019-07-22T10:34:19.7491090Z"
						},
						controlChanges: [],
						variantChanges:{}
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

		QUnit.test("Given two connectors are provided and one is in charge of a draft layer", function (assert) {
			var sDraftLayer = "CUSTOMER";
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [sDraftLayer]},
				{connector: "JsObjectConnector", layers: ["USER"]}
			]);

			var oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			var oLrepConnectorStub = sandbox.stub(LrepConnector, "loadFlexData").resolves();
			var oJsObjectConnectorStub = sandbox.stub(JsObjectConnector, "loadFlexData").resolves();

			return Storage.loadFlexData({
				reference: "app.id",
				draftLayer: sDraftLayer
			}).then(function () {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].draftLayer, undefined, "the StaticFileConnector has the draft flag NOT set");
				assert.equal(oLrepConnectorStub.getCall(0).args[0].draftLayer, sDraftLayer, "the connector for draft layer has the draft flag set");
				assert.equal(oJsObjectConnectorStub.getCall(0).args[0].draftLayer, undefined, "the connector NOT in charge for draft layer has the draft flag NOT set");
			});
		});

		QUnit.test("Given two connectors are provided and one is in charge of all layers and a draft layer is set", function (assert) {
			var sDraftLayer = "CUSTOMER";
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector"},
				{connector: "LrepConnector", layers: ["ALL"]}
			]);

			var oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			var oLrepConnectorStub = sandbox.stub(LrepConnector, "loadFlexData").resolves();
			var oJsObjectConnectorStub = sandbox.stub(JsObjectConnector, "loadFlexData").resolves();

			return Storage.loadFlexData({
				reference: "app.id",
				draftLayer: sDraftLayer
			}).then(function () {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].draftLayer, undefined, "the StaticFileConnector has the draft flag NOT set");
				assert.equal(oJsObjectConnectorStub.getCall(0).args[0].draftLayer, undefined, "the connector NOT in charge for draft layer has the draft flag NOT set");
				assert.equal(oLrepConnectorStub.getCall(0).args[0].draftLayer, sDraftLayer, "the connector for draft layer has the draft flag set");
			});
		});

		QUnit.test("Given two connectors are provided and one is in charge of a draft layer provided by a url parameter", function (assert) {
			var sDraftLayer = "CUSTOMER";
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [sDraftLayer]},
				{connector: "JsObjectConnector", layers: ["USER"]}
			]);

			var oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			var oLrepConnectorStub = sandbox.stub(LrepConnector, "loadFlexData").resolves();
			var oJsObjectConnectorStub = sandbox.stub(JsObjectConnector, "loadFlexData").resolves();

			sandbox.stub(FlUtils, "getUrlParameter").returns(sDraftLayer);

			return Storage.loadFlexData({
				reference: "app.id"
			}).then(function () {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].draftLayer, undefined, "the StaticFileConnector has the draft flag NOT set");
				assert.equal(oLrepConnectorStub.getCall(0).args[0].draftLayer, sDraftLayer, "the connector for draft layer has the draft flag set");
				assert.equal(oJsObjectConnectorStub.getCall(0).args[0].draftLayer, undefined, "the connector NOT in charge for draft layer has the draft flag NOT set");
			});
		});

		QUnit.test("Given two connectors are provided and one is in charge of all layers and a draft layer provided by a url parameter", function (assert) {
			var sDraftLayer = "CUSTOMER";
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector"},
				{connector: "LrepConnector", layers: ["ALL"]}
			]);

			var oStaticFileConnectorStub = sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			var oLrepConnectorStub = sandbox.stub(LrepConnector, "loadFlexData").resolves();
			var oJsObjectConnectorStub = sandbox.stub(JsObjectConnector, "loadFlexData").resolves();

			sandbox.stub(FlUtils, "getUrlParameter").returns(sDraftLayer);

			return Storage.loadFlexData({
				reference: "app.id"
			}).then(function () {
				assert.equal(oStaticFileConnectorStub.getCall(0).args[0].draftLayer, undefined, "the StaticFileConnector has the draft flag NOT set");
				assert.equal(oJsObjectConnectorStub.getCall(0).args[0].draftLayer, undefined, "the connector NOT in charge for draft layer has the draft flag NOT set");
				assert.equal(oLrepConnectorStub.getCall(0).args[0].draftLayer, sDraftLayer, "the connector for draft layer has the draft flag set");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
