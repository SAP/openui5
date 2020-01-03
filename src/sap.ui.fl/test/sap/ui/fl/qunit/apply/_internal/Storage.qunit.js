/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/fl/apply/_internal/StorageResultMerger",
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/ui/fl/apply/_internal/connectors/StaticFileConnector",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/apply/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/base/util/merge"
], function (
	sinon,
	Storage,
	Change,
	Variant,
	StorageResultMerger,
	Utils,
	StaticFileConnector,
	LrepConnector,
	JsObjectConnector,
	ObjectStorageUtils,
	merge
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Storage checks the input parameters", {
		beforeEach: function () {
			sandbox.stub(LrepConnector, "loadFlexData").resolves(Utils.getEmptyFlexDataResponse());
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
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(Utils.getEmptyFlexDataResponse());
			sandbox.stub(JsObjectConnector, "loadFlexData").resolves(Utils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(Utils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, Utils.getEmptyFlexDataResponse());
			});
		});

		QUnit.test("Given some connector provides multiple layers", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(Utils.getEmptyFlexDataResponse());
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
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(Utils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(Utils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, Utils.getEmptyFlexDataResponse());
			});
		});

		QUnit.test("Given the first connector provide an empty variant section and the second provides variant data in separate properties", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(Utils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(Utils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, Utils.getEmptyFlexDataResponse());
			});
		});

		QUnit.test("Given only one connector provides variant data in a variantSection", function (assert) {
			var oStaticFileConnectorResponse = Object.assign(Utils.getEmptyFlexDataResponse(), {variantSection: {}});
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

			var oExpectedStorageResponse = Object.assign(Utils.getEmptyFlexDataResponse(), {
				variants: [oVariant.content]
			});

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves({changes: []});

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, oExpectedStorageResponse, "then the expected result is returned");
				assert.equal(Object.keys(oResult).length, 7, "seven entries are in the result");
			});
		});

		QUnit.test("Given 2 connectors provide variant data in variants properties", function (assert) {
			var oStaticFileConnectorResponse = Utils.getEmptyFlexDataResponse();
			var oLrepConnectorResponse = Utils.getEmptyFlexDataResponse();
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

			var oExpectedStorageResponse = Object.assign(Utils.getEmptyFlexDataResponse(), {
				variants: [oVariant1.content, oVariant2.content]
			});

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, oExpectedStorageResponse, "then the expected result is returned");
				assert.equal(Object.keys(oResult).length, 7, "seven entries are in the result");
			});
		});

		QUnit.test("Given 2 connectors provide a change with the same id - i.e. not deleted file from changes-bundle.json", function (assert) {
			var oStaticFileConnectorResponse = Utils.getEmptyFlexDataResponse();
			var oLrepConnectorResponse = Utils.getEmptyFlexDataResponse();

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

	QUnit.module("Connector disassembles the variantSections", {
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("Given the first connector provide a variant in a variants property and the second provides a variant section with a variant", function (assert) {
			var oResponse1 = Utils.getEmptyFlexDataResponse();
			oResponse1.variants.push({
				fileName: "variant1",
				fileType: "ctrl_variant",
				layer: "CUSTOMER",
				variantManagementReference: "variantManagement1",
				creation: "2019-07-22T10:33:19.7491090Z"
			});
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oResponse1);
			var oResponse2 = Utils.getEmptyFlexDataResponse();
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

			var oExpectedResponse = merge({}, Utils.getEmptyFlexDataResponse(), {
				variants: [oResponse1.variants[0], oResponse2.variantSection.variantManagement1.variants[0].content]
			});
			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, oExpectedResponse, "then the expected result is returned");
			});
		});

		QUnit.test("Given two connectors provide variants in the variant section", function (assert) {
			var oResponse1 = {
				changes: [],
				variantSection: {},
				ui2personalization: {}
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
				ui2personalization: {}
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

			var oExpectedResponse = Object.assign({}, Utils.getEmptyFlexDataResponse(), {
				variants: [oResponse1.variantSection.variantManagement1.variants[0].content, oResponse2.variantSection.variantManagement1.variants[0].content]
			});

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, oExpectedResponse, "then the expected result is returned");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
