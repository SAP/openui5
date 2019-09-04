/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/Connector",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/fl/StandardVariant",
	"sap/ui/fl/apply/_internal/ConnectorResultMerger",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/apply/_internal/connectors/StaticFileConnector",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/apply/_internal/connectors/JsObjectConnector",
	"sap/base/util/merge"
], function(
	sinon,
	Connector,
	Change,
	Variant,
	StandardVariant,
	ConnectorResultMerger,
	Utils,
	StaticFileConnector,
	LrepConnector,
	JsObjectConnector,
	merge
) {
	"use strict";

	var EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION = {
		changes : [],
		variantSection : {}
	};
	var EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA = {
		changes : [],
		variants: [],
		variantChanges: [],
		variantDependentControlChanges: [],
		variantManagementChanges: []
	};

	var EMPTY_LOAD_FLEX_DATA_RESULT = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);

	var sandbox = sinon.sandbox.create();

	QUnit.module("Connector checks the input parameters", {
		beforeEach : function () {
			sandbox.stub(LrepConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given no property bag was passed on loadFlexData", function (assert) {
			return assert.throws(Connector.loadFlexData());
		});

		QUnit.test("given no reference within the property bag was passed on loadFlexData", function (assert) {
			return assert.throws(Connector.loadFlexData({}));
		});
	});

	QUnit.module("Connector handles changes-bundle.json", {}, function () {
		QUnit.test("given no static changes-bundle.json placed for 'reference' resource roots, when loading flex data", function (assert) {
			return Connector.loadFlexData({reference: "reference", appVersion: "1.0.0"}).then(function (oResult) {
				assert.deepEqual(oResult, EMPTY_LOAD_FLEX_DATA_RESULT, "the default response was returned");
			});
		});

		QUnit.test("given only a static changes-bundle.json with dummy data placed for 'test.app' resource roots, when loading flex data", function (assert) {
			// simulate a component-preload
			jQuery.sap.registerPreloadedModules({
				version : "2.0",
				name : "sap/ui/fl/qunit/_internal/Connector",
				modules : {
					"test/app/changes/changes-bundle.json" : '[{"dummy":true}]'
				}
			});
			return Connector.loadFlexData({reference: "test.app", appVersion: "1.0.0"}).then(function (oResult) {
				assert.equal(oResult.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
			});
		});
	});

	QUnit.module("Connector merges results from a single connector", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a connector provides multiple layers", function (assert) {
			sandbox.stub(Utils, "getApplyConnectors").resolves([{
				connectorName : "JsObjectConnector",
				connector : JsObjectConnector
			}]);

			var sChangeId1 = "change1";
			var oChange1 = new Change({
				fileName : sChangeId1,
				fileType : "change",
				layer : "VENDOR",
				reference : "app.id",
				content : {},
				changeType : "hideControl",
				selector : {
					id : "control.id"
				}
			});

			var sChangeId2 = "change2";
			var oChange2 = new Change({
				fileName : sChangeId2,
				fileType : "change",
				layer : "CUSTOMER",
				reference : "app.id",
				content : {},
				changeType : "hideControl",
				selector : {
					id : "control.id"
				}
			});

			sandbox.stub(JsObjectConnector, "loadFlexData").resolves([{
				changes : [oChange1.getDefinition()]
			}, {
				changes : [oChange2.getDefinition()]
			}]);

			return Connector.loadFlexData({reference : "app.id"}).then(function (oResult) {
				assert.equal(oResult.changes.length, 2, "both changes were added to the result");
				assert.deepEqual(oResult.changes[0], oChange1.getDefinition(), "the change from the first bundle is the first change in the response");
				assert.deepEqual(oResult.changes[1], oChange2.getDefinition(), "the change from the second bundle is the second change in the response");
			});
		});
	});

	QUnit.module("Connector merges results from different connectors", {
		beforeEach : function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given all connectors provide empty variant properties", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);

			return Connector.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, EMPTY_LOAD_FLEX_DATA_RESULT);
			});
		});

		QUnit.test("Given all connectors provide empty variant sections", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);

			return Connector.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, EMPTY_LOAD_FLEX_DATA_RESULT);
			});
		});

		QUnit.test("Given the first connector provide an empty variant section and the second provides variant data in separate properties", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);

			return Connector.loadFlexData({reference: "app.id"}).then(function (oResult) {
				assert.deepEqual(oResult, EMPTY_LOAD_FLEX_DATA_RESULT);
			});
		});

		QUnit.test("Given only one connector provides variant data in a variantSection", function (assert) {
			var oStaticFileConnectorResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);
			var sVariantManagementKey = "management1";

			var oVariant = Variant.createInitialFileContent({
				content : {
					fileName : "variant1",
					fileType : "ctrl_variant",
					layer : "VENDOR",
					title: "title",
					reference : "app.id",
					variantReference : "",
					content: {},
					variantManagementReference : sVariantManagementKey
				}
			});

			var oStandardVariant = ConnectorResultMerger._createStandardVariant(sVariantManagementKey);

			oStaticFileConnectorResponse.variantSection[sVariantManagementKey] = {
				variants: [oStandardVariant, oVariant],
				variantManagementChanges: {}
			};

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves({changes: []});

			return Connector.loadFlexData({reference: "app.id"}).then(function (oResult) {
				var oResultKeys = Object.keys(oResult);
				assert.equal(oResultKeys.length, 2, "two entries are in the result");
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
			var oStaticFileConnectorResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			var oLrepConnectorResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			var sVariantManagementKey = "management1";

			var oVariant1 = Variant.createInitialFileContent({
				content : {
					fileName : "variant1",
					fileType : "ctrl_variant",
					layer : "VENDOR",
					title: "title",
					reference : "app.id",
					variantReference : "",
					content: {},
					variantManagementReference : sVariantManagementKey
				}
			});
			oStaticFileConnectorResponse.variants = [oVariant1.content];

			var oVariant2 = Variant.createInitialFileContent({
				content : {
					fileName : "variant2",
					fileType : "ctrl_variant",
					layer : "VENDOR",
					title: "title",
					reference : "app.id",
					variantReference : "",
					content: {},
					variantManagementReference : sVariantManagementKey
				}
			});
			oLrepConnectorResponse.variants = [oVariant2.content];

			var oStandardVariant = ConnectorResultMerger._createStandardVariant(sVariantManagementKey);

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oLrepConnectorResponse);

			return Connector.loadFlexData({reference: "app.id"}).then(function (oResult) {
				var oResultKeys = Object.keys(oResult);
				assert.equal(oResultKeys.length, 2, "two entries are in the result");
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
			var oStaticFileConnectorResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			var oLrepConnectorResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);

			var oChange1 = new Change({
				fileName : "rename_id_123",
				fileType : "ctrl_variant",
				layer : "VENDOR",
				reference : "app.id",
				content: {}
			});
			oStaticFileConnectorResponse.changes = [oChange1.getDefinition()];

			var oChange2 = new Change({
				fileName : "rename_id_123",
				fileType : "ctrl_variant",
				layer : "VENDOR",
				reference : "app.id",
				content: {}
			});
			oLrepConnectorResponse.changes = [oChange2.getDefinition()];

			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oLrepConnectorResponse);

			return Connector.loadFlexData({reference: "app.id"}).then(function (oResult) {
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
			 * - variant1 in 'variantManagementReference'
			 * - variantChange1_1 on variant1
			 *
			 * ----------------------------------------
			 */
			var sVariantManagementKey = "management1";
			var oStandardVariant = ConnectorResultMerger._createStandardVariant(sVariantManagementKey);

			// Static File Connector

			var oStaticFileConnectorResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(oStaticFileConnectorResponse);

			var oVariant1 = Variant.createInitialFileContent({
				content : {
					fileName : "variant1",
					fileType : "ctrl_variant",
					layer : "BASE",
					title: "title",
					reference : "app.id",
					variantReference : "",
					content: {},
					variantManagementReference : sVariantManagementKey
				}
			});
			oStaticFileConnectorResponse.variants = [oVariant1.content];

			var oVariantChange1_1 = Change.createInitialFileContent({
				fileName : "variantChange1",
				fileType : "ctrl_variant_change",
				layer : "BASE",
				changeType: "setTitle",
				reference : "app.id",
				content: {},
				selector: {
					id: oVariant1.content.fileName
				}
			});
			oStaticFileConnectorResponse.variantChanges = [oVariantChange1_1];

			// Lrep Connector

			var oLrepConnectorVendorResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			var oLrepConnectorCustomerBaseResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			var oLrepConnectorCustomerResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			var oLrepConnectorUserResponse = merge({}, EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			var oLrepConnectorResponse = [
				oLrepConnectorVendorResponse,
				oLrepConnectorCustomerBaseResponse,
				oLrepConnectorCustomerResponse,
				oLrepConnectorUserResponse
			];
			sandbox.stub(LrepConnector, "loadFlexData").resolves(oLrepConnectorResponse);

			// VENDOR
			var oVariantManagementChange1 = Change.createInitialFileContent({
				fileName : "variantManagementChange1",
				fileType : "ctrl_variant_management_change",
				layer : "VENDOR",
				changeType: "setDefault",
				reference : "app.id",
				content: {},
				selector: {
					id: sVariantManagementKey
				}
			});
			oLrepConnectorVendorResponse.variantManagementChanges = [oVariantManagementChange1];

			// CUSTOMER_BASE

			var oVariantChange1_2 = Change.createInitialFileContent({
				fileName : "variantChange1_2",
				fileType : "ctrl_variant_change",
				layer : "CUSTOMER_BASE",
				changeType: "setTitle",
				reference : "app.id",
				content: {},
				selector: {
					id: oVariant1.content.fileName
				}
			});
			oLrepConnectorCustomerBaseResponse.variantChanges = [oVariantChange1_2];

			var oVariant2 = Variant.createInitialFileContent({
				content : {
					fileName : "variant2",
					fileType : "ctrl_variant",
					layer : "CUSTOMER_BASE",
					title: "title",
					reference : "app.id",
					variantReference: oVariant1.content.fileName,
					content: {},
					variantManagementReference : sVariantManagementKey
				}
			});
			oLrepConnectorCustomerBaseResponse.variants = [oVariant2.content];

			var oVariantDependentChange1 = Change.createInitialFileContent({
				fileName : "variantDependentChange1",
				fileType : "change",
				layer : "CUSTOMER_BASE",
				changeType: "property_change",
				reference : "app.id",
				content: {},
				selector: {
					id: "a.control"
				},
				variantReference: oVariant1.content.fileName
			});

			var oVariantDependentChange2 = Change.createInitialFileContent({
				fileName : "variantDependentChange2",
				fileType : "change",
				layer : "CUSTOMER_BASE",
				changeType: "showControl",
				reference : "app.id",
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
				content : {
					fileName : "variant3",
					fileType : "ctrl_variant",
					layer : "CUSTOMER",
					title: "title",
					reference : "app.id",
					variantReference: oVariant1.content.fileName,
					content: {},
					variantManagementReference : sVariantManagementKey
				}
			});
			oLrepConnectorCustomerResponse.variants = [oVariant3.content];

			var oVariantDependentChange3 = Change.createInitialFileContent({
				fileName : "variantDependentChange3",
				fileType : "change",
				layer : "CUSTOMER",
				changeType: "hideControl",
				reference : "app.id",
				content: {},
				selector: {
					id: "a.control"
				},
				variantReference: oVariant1.content.fileName

			});
			oLrepConnectorCustomerResponse.variantDependentControlChanges = [oVariantDependentChange3];

			// USER

			var oVariantManagementChange2 = Change.createInitialFileContent({
				fileName : "variantManagementChange2",
				fileType : "ctrl_variant_management_change",
				layer : "USER",
				changeType: "setDefault",
				reference : "app.id",
				content: {},
				selector: {
					id: sVariantManagementKey
				}
			});
			oLrepConnectorUserResponse.variantManagementChanges = [oVariantManagementChange2];

			// TEST RUN

			return Connector.loadFlexData({reference: "app.id"}).then(function (oResult) {
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
				assert.equal(aVariants[0].controlChanges.length, 0, "no control changes are present for the standard variant");
				mVariantChanges = aVariants[0].variantChanges;
				assert.equal(Object.keys(mVariantChanges).length, 0, "no variant changes are present for the standard variant");

				assert.deepEqual(aVariants[1].content, oVariant1.content, "the variant 1 is added");
				assert.equal(aVariants[1].controlChanges.length, 3, "three control changes are present for the variant 1");
				assert.deepEqual(aVariants[1].controlChanges[0], oVariantDependentChange1, "the control change 1 was added");
				assert.deepEqual(aVariants[1].controlChanges[1], oVariantDependentChange2, "the control change 2 was added");
				assert.deepEqual(aVariants[1].controlChanges[2], oVariantDependentChange3, "the control change 3 was added");
				mVariantChanges = aVariants[1].variantChanges;
				assert.equal(Object.keys(mVariantChanges).length, 1, "one type of changes are present for variant 1");
				var aSetTitleChanges = mVariantChanges.setTitle;
				assert.equal(aSetTitleChanges.length, 2, "two set title variant changes are present for the variant 1");
				assert.deepEqual(aSetTitleChanges[0], oVariantChange1_1, "the variant change 1_1 was added");
				assert.deepEqual(aSetTitleChanges[1], oVariantChange1_2, "the variant change 1_2 was added");

				assert.deepEqual(aVariants[2].content, oVariant2.content, "the variant 2 is added");
				assert.equal(aVariants[2].controlChanges.length, 0, "no control changes are present for the variant 2");
				mVariantChanges = aVariants[2].variantChanges;
				assert.equal(Object.keys(mVariantChanges).length, 1, "one type of changes are present for variant 2");
				aSetTitleChanges = mVariantChanges.setTitle;
				assert.equal(aSetTitleChanges.length, 1, "two set title variant changes are present for the variant 2");
				assert.deepEqual(aSetTitleChanges[0], oVariantChange1_1, "the variant change 1_1 was added");

				assert.deepEqual(aVariants[3].content, oVariant3.content, "the variant 3 is added");
				assert.equal(aVariants[3].controlChanges.length, 2, "no control changes are present for the variant 3");
				assert.deepEqual(aVariants[1].controlChanges[1], oVariantDependentChange2, "the control change 2 was added");
				assert.deepEqual(aVariants[1].controlChanges[2], oVariantDependentChange3, "the control change 3 was added");
				mVariantChanges = aVariants[3].variantChanges;
				assert.equal(Object.keys(mVariantChanges).length, 1, "one type of changes are present for variant 3");
				aSetTitleChanges = mVariantChanges.setTitle;
				assert.equal(aSetTitleChanges.length, 2, "two set title variant changes are present for the variant 3");
				assert.deepEqual(aSetTitleChanges[0], oVariantChange1_1, "the variant change 1_1 was added");
				assert.deepEqual(aSetTitleChanges[1], oVariantChange1_2, "the variant change 1_2 was added");
			});
		});

		// TODO: enable test after the Disassembler is ready
		QUnit.skip("Given a connector provide variant data in the variantSection which referencing to each other", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves();
			sandbox.stub(LrepConnector, "loadFlexData").resolves();

			return Connector.loadFlexData({reference: "app.id"}).then(function (/*oResult*/) {
				assert.ok(false);
			});
		});
	});


	// TODO: enable module after the Disassembler is ready
	QUnit.module("Connector disassembles the variantSections", {
		beforeEach : function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.skip("Given the first connector provide an variant in a variant property and the second provides a variant section", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);

			return Connector.loadFlexData({reference : "app.id"}).then(function (/*oResult*/) {
				assert.ok(false);
			});
		});

		QUnit.skip("Given two connectors provide variants in the variant section", function (assert) {
			sandbox.stub(StaticFileConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_DATA);
			sandbox.stub(LrepConnector, "loadFlexData").resolves(EMPTY_FLEX_DATA_RESPONSE_WITH_VARIANT_SECTION);

			return Connector.loadFlexData({reference : "app.id"}).then(function (/*oResult*/) {
				assert.ok(false);
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});