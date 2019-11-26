/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/fl/apply/_internal/StorageResultMerger",
	"sap/ui/fl/apply/_internal/connectors/Utils",
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
	ApplyUtils,
	StaticFileConnector,
	LrepConnector,
	JsObjectConnector,
	ObjectStorageUtils,
	merge
) {
	"use strict";

	var EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION = {
		changes: [],
		variantSection: {},
		ui2personalization: {}
	};

	var EMPTY_LOAD_FLEX_DATA_RESULT = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);

	var sandbox = sinon.sandbox.create();

	QUnit.module("Storage checks the input parameters", {
		beforeEach: function () {
			sandbox.stub(LrepConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);
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
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(ApplyUtils.getEmptyFlexDataResponse());
			sandbox.stub(JsObjectConnector, "loadFlexData").resolves(ApplyUtils.getEmptyFlexDataResponse());
			sandbox.stub(LrepConnector, "loadFlexData").resolves(ApplyUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, EMPTY_LOAD_FLEX_DATA_RESULT);
			});
		});

		QUnit.test("Given some connector provides multiple layers", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(ApplyUtils.getEmptyFlexDataResponse());
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
					variantManagementReference: "someVarMangementControlId"
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
				var aVariants = oResult.variantSection.someVarMangementControlId.variants;
				assert.equal(aVariants.length, 2, "then the returned response has a variant section containing the standard variant and the variant1");
				assert.equal(aVariants[1].content.fileName, sVariant1);
				assert.equal(aVariants[1].controlChanges.length, 1, "then the control change is added to the variant1");
				assert.deepEqual(aVariants[1].controlChanges[0], mChange1);
			});
		});

		QUnit.test("Given all connectors provide empty variant sections", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, EMPTY_LOAD_FLEX_DATA_RESULT);
			});
		});

		QUnit.test("Given the first connector provide an empty variant section and the second provides variant data in separate properties", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(ApplyUtils.getEmptyFlexDataResponse());

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, EMPTY_LOAD_FLEX_DATA_RESULT);
			});
		});

		QUnit.test("Given only one connector provides variant data in a variantSection", function (assert) {
			var oStaticFileConnectorResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);
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

			var oStandardVariant = StorageResultMerger._createStandardVariant(sVariantManagementKey);

			oStaticFileConnectorResponse.variantSection[sVariantManagementKey] = {
				variants: [oStandardVariant, oVariant],
				variantManagementChanges: {}
			};

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves({changes: []});

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				var oResultKeys = Object.keys(oResult);
				assert.equal(oResultKeys.length, 3, "three entries are in the result");
				assert.ok(oResultKeys.indexOf("changes") !== -1, "the changes section was included");
				assert.ok(oResultKeys.indexOf("variantSection") !== -1, "the variantSection was included");
				var oResultVariantSectionKeys = Object.keys(oResult.variantSection);
				assert.equal(oResultVariantSectionKeys.length, 1, "one entry is in the variant section");
				assert.equal(oResultVariantSectionKeys[0], sVariantManagementKey, "the variant management was determined correct");
				var variants = oResult.variantSection[sVariantManagementKey].variants;
				assert.equal(variants.length, 2, "two variants are included in the variant section");
				assert.deepEqual(variants[0], oStandardVariant, "the standard variant was generated and is within the response at the first position");
				assert.equal(variants[1], oVariant, "the passed variant is contained");
			});
		});

		QUnit.test("Given 2 connectors provide variant data in variants properties", function (assert) {
			var oStaticFileConnectorResponse = merge({}, ApplyUtils.getEmptyFlexDataResponse());
			var oLrepConnectorResponse = merge({}, ApplyUtils.getEmptyFlexDataResponse());
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

			var oStandardVariant = StorageResultMerger._createStandardVariant(sVariantManagementKey);

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oLrepConnectorResponse);

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				var oResultKeys = Object.keys(oResult);
				assert.equal(oResultKeys.length, 3, "three entries are in the result");
				assert.ok(oResultKeys.indexOf("changes") !== -1, "the changes section was included");
				assert.ok(oResultKeys.indexOf("variantSection") !== -1, "the variantSection was included");
				var oResultVariantSectionKeys = Object.keys(oResult.variantSection);
				assert.equal(oResultVariantSectionKeys.length, 1, "one entry is in the variant section");
				assert.equal(oResultVariantSectionKeys[0], sVariantManagementKey, "the variant management was determined correct");
				var variants = oResult.variantSection[sVariantManagementKey].variants;
				assert.equal(variants.length, 3, "three variants are included in the variant section");
				assert.deepEqual(variants[0], oStandardVariant, "the standard variant was generated and is within the response at the first position");
				assert.deepEqual(variants[1], oVariant1, "the passed variant from the first connector is contained");
				assert.deepEqual(variants[2], oVariant2, "the passed variant from the second connector is contained");
			});
		});

		QUnit.test("Given 2 connectors provide a change with the same id - i.e. not deleted file from changes-bundle.json", function (assert) {
			var oStaticFileConnectorResponse = merge({}, ApplyUtils.getEmptyFlexDataResponse());
			var oLrepConnectorResponse = merge({}, ApplyUtils.getEmptyFlexDataResponse());

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

		QUnit.test("Given 2 connectors provide variant data in variants properties  - one with multiple layers - which reference to each other", function (assert) {
			/* Data stricture by layer:
			 * ----------------------------------------
			 * USER (via LrepConnector)
			 * - variantManagementChange2 on the 'variantManagementReference'
			 *
			 * ----------------------------------------
			 * CUSTOMER (via LrepConnector)
			 * - variant3 referencing variant1
			 * - variantDependentChange3 on variant1
			 *
			 * ----------------------------------------
			 * CUSTOMER_BASE (via LrepConnector)
			 * - variant2 referencing variant1 in 'variantManagementReference'
			 * - variantDependentChange1 on variant1
			 * - variantDependentChange2 on variant2
			 *
			 * ----------------------------------------
			 * VENDOR (via LrepConnector)
			 * - variantChange1_2 on variant1
			 * - variantManagementChange1 on the 'variantManagementReference'
			 *
			 * ----------------------------------------
			 * BASE (changes-bundle.json)
			 * - variantChange0 on StandardVariant
			 * - variant1 in 'variantManagementReference'
			 * - variantChange1_1 on variant1
			 *
			 * ----------------------------------------
			 */

			var sVariantManagementKey = "management1";
			var oStandardVariant = StorageResultMerger._createStandardVariant(sVariantManagementKey);

			// Static File Connector

			var oStaticFileConnectorResponse = merge({}, ApplyUtils.getEmptyFlexDataResponse());
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);

			var oVariant1 = Variant.createInitialFileContent({
				content: {
					fileName: "variant1",
					fileType: "ctrl_variant",
					layer: "BASE",
					title: "title",
					reference: "app.id",
					variantReference: "",
					content: {},
					variantManagementReference: sVariantManagementKey
				}
			});
			oStaticFileConnectorResponse.variants = [oVariant1.content];

			var oVariantChange0 = Change.createInitialFileContent({
				fileName: "variantChange0",
				fileType: "ctrl_variant_change",
				layer: "BASE",
				changeType: "setTitle",
				reference: "app.id",
				content: {},
				selector: {
					id: sVariantManagementKey
				}
			});
			oStandardVariant.variantChanges.setTitle = [oVariantChange0];

			var oVariantChange1_1 = Change.createInitialFileContent({
				fileName: "variantChange1",
				fileType: "ctrl_variant_change",
				layer: "BASE",
				changeType: "setTitle",
				reference: "app.id",
				content: {},
				selector: {
					id: oVariant1.content.fileName
				}
			});
			oStaticFileConnectorResponse.variantChanges = [oVariantChange0, oVariantChange1_1];

			// Lrep Connector

			var oLrepConnectorVendorResponse = merge({}, ApplyUtils.getEmptyFlexDataResponse());
			var oLrepConnectorCustomerBaseResponse = merge({}, ApplyUtils.getEmptyFlexDataResponse());
			var oLrepConnectorCustomerResponse = merge({}, ApplyUtils.getEmptyFlexDataResponse());
			var oLrepConnectorUserResponse = merge({}, ApplyUtils.getEmptyFlexDataResponse());
			var oLrepConnectorResponse = [
				oLrepConnectorVendorResponse,
				oLrepConnectorCustomerBaseResponse,
				oLrepConnectorCustomerResponse,
				oLrepConnectorUserResponse
			];
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oLrepConnectorResponse);

			// VENDOR
			var oVariantManagementChange1 = Change.createInitialFileContent({
				fileName: "variantManagementChange1",
				fileType: "ctrl_variant_management_change",
				layer: "VENDOR",
				changeType: "setDefault",
				reference: "app.id",
				content: {},
				selector: {
					id: sVariantManagementKey
				}
			});
			oLrepConnectorVendorResponse.variantManagementChanges = [oVariantManagementChange1];

			// CUSTOMER_BASE

			var oVariantChange1_2 = Change.createInitialFileContent({
				fileName: "variantChange1_2",
				fileType: "ctrl_variant_change",
				layer: "CUSTOMER_BASE",
				changeType: "setTitle",
				reference: "app.id",
				content: {},
				selector: {
					id: oVariant1.content.fileName
				}
			});
			oLrepConnectorCustomerBaseResponse.variantChanges = [oVariantChange1_2];

			var oVariant2 = Variant.createInitialFileContent({
				content: {
					fileName: "variant2",
					fileType: "ctrl_variant",
					layer: "CUSTOMER_BASE",
					content: {
						title: "title"
					},
					reference: "app.id",
					variantReference: oVariant1.content.fileName,
					variantManagementReference: sVariantManagementKey
				}
			});
			oLrepConnectorCustomerBaseResponse.variants = [oVariant2.content];

			var oVariantDependentChange1 = Change.createInitialFileContent({
				fileName: "variantDependentChange1",
				fileType: "change",
				layer: "CUSTOMER_BASE",
				changeType: "property_change",
				reference: "app.id",
				content: {},
				selector: {
					id: "a.control"
				},
				variantReference: oVariant1.content.fileName
			});

			var oVariantDependentChange2 = Change.createInitialFileContent({
				fileName: "variantDependentChange2",
				fileType: "change",
				layer: "CUSTOMER_BASE",
				changeType: "showControl",
				reference: "app.id",
				content: {},
				selector: {
					id: "a.control"
				},
				variantReference: oVariant1.content.fileName
			});
			oLrepConnectorCustomerBaseResponse.variantDependentControlChanges = [
				oVariantDependentChange1,
				oVariantDependentChange2
			];

			// CUSTOMER

			var oVariant3 = Variant.createInitialFileContent({
				content: {
					fileName: "variant3",
					fileType: "ctrl_variant",
					layer: "CUSTOMER",
					reference: "app.id",
					variantReference: oVariant1.content.fileName,
					content: {
						title: "title"
					},
					variantManagementReference: sVariantManagementKey
				}
			});
			oLrepConnectorCustomerResponse.variants = [oVariant3.content];

			var oVariantDependentChange3 = Change.createInitialFileContent({
				fileName: "variantDependentChange3",
				fileType: "change",
				layer: "CUSTOMER",
				changeType: "hideControl",
				reference: "app.id",
				content: {},
				selector: {
					id: "a.control"
				},
				variantReference: oVariant1.content.fileName

			});
			oLrepConnectorCustomerResponse.variantDependentControlChanges = [oVariantDependentChange3];

			// USER

			var oVariantManagementChange2 = Change.createInitialFileContent({
				fileName: "variantManagementChange2",
				fileType: "ctrl_variant_management_change",
				layer: "USER",
				changeType: "setDefault",
				reference: "app.id",
				content: {},
				selector: {
					id: sVariantManagementKey
				}
			});
			oLrepConnectorUserResponse.variantManagementChanges = [oVariantManagementChange2];

			// TEST RUN

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				var oVariantSection = oResult.variantSection;
				assert.equal(Object.keys(oVariantSection).length, 1, "only one variant management subsection was created");
				assert.equal(Object.keys(oVariantSection)[0], sVariantManagementKey, "the variant management key was set correct");

				var oVariantManagementSubSection = oVariantSection[sVariantManagementKey];
				var oVariantManagementChanges = oVariantManagementSubSection.variantManagementChanges;
				var aVariantManagementChangeTypes = Object.keys(oVariantManagementChanges);
				assert.equal(aVariantManagementChangeTypes.length, 1, "only one type of variant management changes was added");
				assert.equal(aVariantManagementChangeTypes[0], "setDefault", "the variant management change type was set correct");
				var aVariants = oVariantManagementSubSection.variants;

				var mVariantChanges;

				assert.equal(aVariants.length, 4, "four variants are in the management");

				assert.deepEqual(aVariants[0], oStandardVariant, "the standard variant is the first");
				assert.deepEqual(aVariants[0].content.content, oStandardVariant.content.content, "content field is present");
				assert.equal(aVariants[0].content.content.title, oStandardVariant.content.content.title, "title is present in content field");

				assert.equal(aVariants[0].controlChanges.length, 0, "no control changes are present for the standard variant");
				mVariantChanges = aVariants[0].variantChanges;
				assert.equal(Object.keys(mVariantChanges).length, 1, "one type of changes are present for the standard variant");
				var aSetTitleChanges = mVariantChanges.setTitle;
				assert.equal(aSetTitleChanges.length, 1, "one set title variant changes are present for the standard variant");
				assert.deepEqual(aSetTitleChanges[0], oVariantChange0, "the variant change 0 was added");

				assert.deepEqual(aVariants[1].content, oVariant1.content, "the variant 1 is added");
				assert.equal(aVariants[1].controlChanges.length, 3, "three control changes are present for the variant 1");
				assert.deepEqual(aVariants[1].controlChanges[0], oVariantDependentChange1, "the control change 1 was added");
				assert.deepEqual(aVariants[1].controlChanges[1], oVariantDependentChange2, "the control change 2 was added");
				assert.deepEqual(aVariants[1].controlChanges[2], oVariantDependentChange3, "the control change 3 was added");
				mVariantChanges = aVariants[1].variantChanges;
				assert.equal(Object.keys(mVariantChanges).length, 1, "one type of changes are present for variant 1");
				aSetTitleChanges = mVariantChanges.setTitle;
				assert.equal(aSetTitleChanges.length, 2, "two set title variant changes are present for the variant 1");
				assert.deepEqual(aSetTitleChanges[0], oVariantChange1_1, "the variant change 1_1 was added");
				assert.deepEqual(aSetTitleChanges[1], oVariantChange1_2, "the variant change 1_2 was added");

				assert.deepEqual(aVariants[2].content, oVariant2.content, "the variant 2 is added");
				assert.equal(aVariants[2].controlChanges.length, 0, "no control changes are present for the variant 2");
				mVariantChanges = aVariants[2].variantChanges;
				assert.deepEqual(mVariantChanges, {}, "no variant change for variant 2");

				assert.deepEqual(aVariants[3].content, oVariant3.content, "the variant 3 is added");
				assert.equal(aVariants[3].controlChanges.length, 2, "no control changes are present for the variant 3");
				assert.deepEqual(aVariants[1].controlChanges[1], oVariantDependentChange2, "the control change 2 was added");
				assert.deepEqual(aVariants[1].controlChanges[2], oVariantDependentChange3, "the control change 3 was added");
				mVariantChanges = aVariants[3].variantChanges;
				assert.deepEqual(mVariantChanges, {}, "no variant change for variant 3");
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
		QUnit.test("Given the first connector provide an variant in a variant property and the second provides a variant section with a variant", function (assert) {
			var oVariant1 = ApplyUtils.getEmptyFlexDataResponse();
			oVariant1.variants.push({
				fileName: "variant1",
				fileType: "ctrl_variant",
				layer: "CUSTOMER",
				variantManagementReference: "variantManagement1",
				creation: "2019-07-22T10:33:19.7491090Z"
			});
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oVariant1);
			var oVariant2 = EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION;
			oVariant2.variantSection = {
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
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oVariant2);

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				var aVariants = oResult.variantSection.variantManagement1.variants;
				assert.equal(3, aVariants.length, "then the returned response has a variant section containing three variants");
				assert.equal("variantManagement1", aVariants[0].content.fileName);
				assert.equal(0, aVariants[0].controlChanges.length);
				assert.deepEqual({}, aVariants[0].variantChanges);
				assert.equal("variant1", aVariants[1].content.fileName);
				assert.equal(0, aVariants[1].controlChanges.length);
				assert.deepEqual({}, aVariants[1].variantChanges);
				assert.equal("variant2", aVariants[2].content.fileName);
				assert.equal(0, aVariants[2].controlChanges.length);
				assert.deepEqual({}, aVariants[2].variantChanges);
				assert.equal(0, oResult.changes.length);
			});
		});

		QUnit.test("Given two connectors provide variants in the variant section", function (assert) {
			var oVariant1 = {
				changes: [],
				variantSection: {},
				ui2personalization: {}
			};
			oVariant1.variantSection = {
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
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oVariant1);
			var oVariant2 = {
				changes: [],
				variantSection: {},
				ui2personalization: {}
			};
			oVariant2.variantSection = {
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
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oVariant2);

			return Storage.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.equal(0, oResult.changes.length);
				var aVariants = oResult.variantSection.variantManagement1.variants;
				assert.equal(3, aVariants.length);
				assert.equal("variantManagement1", aVariants[0].content.fileName);
				assert.equal(0, aVariants[0].controlChanges.length);
				assert.deepEqual({}, aVariants[0].variantChanges);
				assert.equal("variant1", aVariants[1].content.fileName);
				assert.equal(0, aVariants[1].controlChanges.length);
				assert.deepEqual({}, aVariants[1].variantChanges);
				assert.equal("variant2", aVariants[2].content.fileName);
				assert.equal(0, aVariants[2].controlChanges.length);
				assert.deepEqual({}, aVariants[2].variantChanges);
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
