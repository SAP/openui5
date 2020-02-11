/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/apply/_internal/storageResultDisassemble"
], function(
	sinon,
	Utils,
	storageResultDisassemble
) {
	"use strict";

	QUnit.module("storageResultDisassemble", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	}, function() {
		QUnit.test("Given storageResultDisassemble is called for an empty response", function(assert) {
			var oResponse = {
				changes: [],
				variantSection: {}
			};
			assert.equal(0, storageResultDisassemble(oResponse).length, "then an empty array is returned");
		});
		QUnit.test("Given storageResultDisassemble is called for a response with VENDOR and CUSTOMER changes and an empty variant section", function(assert) {
			var oResponse = {
				changes: [{
					fileName: "change2",
					fileType: "change",
					layer: "VENDOR",
					creation: "2019-07-22T10:33:19.7491090Z"
				}, {
					fileName: "change1",
					fileType: "change",
					layer: "VENDOR",
					creation: "2019-07-22T10:32:19.7491090Z"
				}, {
					fileName: "change4",
					fileType: "change",
					layer: "CUSTOMER",
					creation: "2019-07-22T10:35:19.7491090Z"
				}, {
					fileName: "change3",
					fileType: "change",
					layer: "CUSTOMER",
					creation: "2019-07-22T10:34:19.7491090Z"
				}],
				variantSection: {}
			};
			// test
			var aResponses = storageResultDisassemble(oResponse);
			assert.equal(2, aResponses.length, "then an array with two response objects is returned");
			// VENDOR response object
			var oFlexDataResponse = aResponses[0];
			assert.equal(2, oFlexDataResponse.changes.length, "and the first response object is for the VENDOR layer and contains the changes sorted by creation timestamp in ascending order");
			assert.equal("change1", oFlexDataResponse.changes[0].fileName, "and change1 is the first change in the array");
			assert.equal("change2", oFlexDataResponse.changes[1].fileName, "and change2 is the second change in the array");
			assert.equal(0, oFlexDataResponse.variants.length, "and the variants array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantChanges.length, "and the variantChanges array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantDependentControlChanges.length, "and the variantDependentControlChanges array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantManagementChanges.length, "and the variantManagementChanges array of the first response object is empty");
			// CUSTOMER response object
			oFlexDataResponse = aResponses[1];
			assert.equal(2, oFlexDataResponse.changes.length, "and the second response object is for the CUSTOMER layer and contains the changes sorted by creation timestamp in ascending order");
			assert.equal("change3", oFlexDataResponse.changes[0].fileName, "and change3 is the first change in the array");
			assert.equal("change4", oFlexDataResponse.changes[1].fileName, "and change4 is the second change in the array");
			assert.equal(0, oFlexDataResponse.variants.length, "and the variants array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantChanges.length, "and the variantChanges array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantDependentControlChanges.length, "and the variantDependentControlChanges array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantManagementChanges.length, "and the variantManagementChanges array of the second response object is empty");
		});
		QUnit.test("Given storageResultDisassemble is called for a response with an empty changes array and a variant section with VENDOR and CUSTOMER variants and a standard variant", function(assert) {
			var oResponse = {
				changes: [],
				variantSection: {
					variantManagement1: {
						variantManagementChanges: {},
						variants:[{
							content:{
								fileName: "variantManagement1",
								fileType: "ctrl_variant",
								layer: "VENDOR",
								variantManagementReference: "variantManagement1",
								creation: "1000"
							},
							controlChanges: [],
							variantChanges: {}
						}, {
							content: {
								fileName: "variant2",
								fileType: "ctrl_variant",
								layer: "VENDOR",
								variantManagementReference: "variantManagement1",
								creation: "2019-07-22T10:33:19.7491090Z"
							},
							controlChanges: [],
							variantChanges: {}
						}, {
							content: {
								fileName: "variant1",
								fileType: "ctrl_variant",
								layer: "VENDOR",
								variantManagementReference: "variantManagement1",
								creation: "2019-07-22T10:32:19.7491090Z"},
							controlChanges: [],
							variantChanges: {}
						}, {
							content: {
								fileName: "variant4",
								fileType: "ctrl_variant",
								layer: "CUSTOMER",
								variantManagementReference: "variantManagement1",
								creation: "2019-07-22T10:35:19.7491090Z"
							},
							controlChanges: [],
							variantChanges: {}
						}, {
							content: {
								fileName: "variant3",
								fileType: "ctrl_variant",
								layer: "CUSTOMER",
								variantManagementReference: "variantManagement1",
								creation: "2019-07-22T10:34:19.7491090Z"
							},
							controlChanges: [],
							variantChanges: {}
						}]
					}
				},
				ui2personalization: {
					key: "value"
				},
				cacheKey: "abc123"
			};
			// test
			var aResponses = storageResultDisassemble(oResponse);
			assert.equal(2, aResponses.length, "then an array with two response objects is returned");
			// VENDOR response object
			var oFlexDataResponse = aResponses[0];
			assert.equal(2, oFlexDataResponse.variants.length, "and the first response object is for the VENDOR layer and contains the variants (but not the standard variant) sorted by creation timestamp in ascending order");
			assert.equal("variant1", oFlexDataResponse.variants[0].fileName, "and variant1 is the first variant in the array");
			assert.equal("variant2", oFlexDataResponse.variants[1].fileName, "and variant2 is the second variant in the array");
			assert.equal(0, oFlexDataResponse.changes.length, "and the changes array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantChanges.length, "and the variantChanges array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantDependentControlChanges.length, "and the variantDependentControlChanges array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantManagementChanges.length, "and the variantManagementChanges array of the first response object is empty");
			assert.equal("abc123", oFlexDataResponse.cacheKey, "the cacheKey is kept in the first response");
			assert.deepEqual({key: "value"}, oFlexDataResponse.ui2personalization, "the ui2personalization is kept in the first response");
			// CUSTOMER response object
			oFlexDataResponse = aResponses[1];
			assert.equal(2, oFlexDataResponse.variants.length, "and the second response object is for the CUSTOMER layer and contains the variants (but not the standard variant) sorted by creation timestamp in ascending order");
			assert.equal("variant3", oFlexDataResponse.variants[0].fileName, "and variant3 is the first variant in the array");
			assert.equal("variant4", oFlexDataResponse.variants[1].fileName, "and variant4 is the second variant in the array");
			assert.equal(0, oFlexDataResponse.changes.length, "and the changes array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantChanges.length, "and the variantChanges array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantDependentControlChanges.length, "and the variantDependentControlChanges array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantManagementChanges.length, "and the variantManagementChanges array of the second response object is empty");
		});
		QUnit.test("Given storageResultDisassemble is called for a response with empty changes array and a variant section with a CUSTOMER variant that has CUSTOMER and USER variant management changes", function(assert) {
			var oResponse = {
				changes: [],
				variantSection: {
					variantManagement1: {
						variantManagementChanges: {
							setTitle: [{
								fileName: "change2",
								fileType: "ctrl_variant_management_change",
								layer: "CUSTOMER",
								creation: "2019-07-22T10:33:19.7491090Z"
							}, {
								fileName: "change1",
								fileType: "ctrl_variant_management_change",
								layer: "CUSTOMER",
								creation: "2019-07-22T10:32:19.7491090Z"
							}, {
								fileName: "change4",
								fileType: "ctrl_variant_management_change",
								layer: "USER",
								creation: "2019-07-22T10:35:19.7491090Z"
							}, {
								fileName: "change3",
								fileType: "ctrl_variant_management_change",
								layer: "USER",
								creation: "2019-07-22T10:34:19.7491090Z"
							}]
						},
						variants: [{
							content: {
								fileName: "variant1",
								fileType: "ctrl_variant",
								layer: "CUSTOMER",
								variantManagementReference: "variantManagement1",
								creation: "2019-07-22T10:33:19.7491090Z"
							},
							controlChanges: [],
							variantChanges: {}
						}]
					}
				}
			};

			// test
			var aResponses = storageResultDisassemble(oResponse);
			assert.equal(2, aResponses.length, "then an array with two response objects is returned");
			// CUSTOMER response object
			var oFlexDataResponse = aResponses[0];
			assert.equal(1, oFlexDataResponse.variants.length, "and the first response object is for the CUSTOMER layer");
			assert.equal("variant1", oFlexDataResponse.variants[0].fileName, "and variant1 is contained in the variants array");
			assert.equal(2, oFlexDataResponse.variantManagementChanges.length, "and the variant managements changes are contained in the variantManagementChanges array sorted by creation timestamp in ascending order");
			assert.equal("change1", oFlexDataResponse.variantManagementChanges[0].fileName, "and change1 is the first variant management change in the array");
			assert.equal("change2", oFlexDataResponse.variantManagementChanges[1].fileName, "and change2 is the second variant management change in the array");
			assert.equal(0, oFlexDataResponse.changes.length, "and the changes array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantChanges.length, "and the variantChanges array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantDependentControlChanges.length, "and the variantDependentControlChanges array of the first response object is empty");
			// USER response object
			oFlexDataResponse = aResponses[1];
			assert.equal(2, oFlexDataResponse.variantManagementChanges.length, "and the second response object is for the USER layer and contains the variant managements changes in the variantManagementChanges array sorted by creation timestamp in ascending order");
			assert.equal("change3", oFlexDataResponse.variantManagementChanges[0].fileName, "and change3 is the first variant management change in the array");
			assert.equal("change4", oFlexDataResponse.variantManagementChanges[1].fileName, "and change4 is the second variant management change in the array");
			assert.equal(0, oFlexDataResponse.variants.length, "and the variants array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.changes.length, "and the changes array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantChanges.length, "and the variantChanges array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantDependentControlChanges.length, "and the variantDependentControlChanges array of the second response object is empty");
		});
		QUnit.test("Given storageResultDisassemble is called for a response with empty changes array and a variant section with a CUSTOMER variant that has CUSTOMER and USER variant changes", function(assert) {
			var oResponse = {
				changes: [],
				variantSection: {
					variantManagement1: {
						variantManagementChanges: {},
						variants: [{
							content: {
								fileName:"variant1",
								fileType:"ctrl_variant",
								layer:"CUSTOMER",
								variantManagementReference:"variantManagement1",
								creation:"2019-07-22T10:33:19.7491090Z"
							},
							controlChanges: [],
							variantChanges:{
								setTitle: [{
									fileName:"change2",
									fileType:"ctrl_variant_change",
									layer:"CUSTOMER",
									creation:"2019-07-22T10:33:19.7491090Z"
								}, {
									fileName:"change3",
									fileType:"ctrl_variant_change",
									layer:"USER",
									creation:"2019-07-22T10:34:19.7491090Z"
								}],
								move: [{
									fileName:"change1",
									fileType:"ctrl_variant_change",
									layer:"CUSTOMER",
									creation:"2019-07-22T10:32:19.7491090Z"
								}, {
									fileName:"change4",
									fileType:"ctrl_variant_change",
									layer:"USER",
									creation:"2019-07-22T10:35:19.7491090Z"
								}]
							}
						}]
					}
				}
			};

			// test
			var aResponses = storageResultDisassemble(oResponse);
			assert.equal(2, aResponses.length, "then an array with two response objects is returned");
			// CUSTOMER response object
			var oFlexDataResponse = aResponses[0];
			assert.equal(1, oFlexDataResponse.variants.length, "and the first response object is for the CUSTOMER layer");
			assert.equal("variant1", oFlexDataResponse.variants[0].fileName, "and variant1 is contained in the variants array");
			assert.equal(2, oFlexDataResponse.variantChanges.length, "and the variant changes are contained in the variantChanges array sorted by creation timestamp in ascending order");
			assert.equal("change1", oFlexDataResponse.variantChanges[0].fileName, "and change1 is the first variant change in the array");
			assert.equal("change2", oFlexDataResponse.variantChanges[1].fileName, "and change2 is the second variant change in the array");
			assert.equal(0, oFlexDataResponse.changes.length, "and the changes array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantDependentControlChanges.length, "and the variantDependentControlChanges array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantManagementChanges.length, "and the variantManagementChanges array of the first response object is empty");
			// USER response object
			oFlexDataResponse = aResponses[1];
			assert.equal(2, oFlexDataResponse.variantChanges.length, "and the second response object is for the USER layer and contains the variant changes in the variantChanges array sorted by creation timestamp in ascending order");
			assert.equal("change3", oFlexDataResponse.variantChanges[0].fileName, "and change3 is the first variant change in the array");
			assert.equal("change4", oFlexDataResponse.variantChanges[1].fileName, "and change4 is the second variant change in the array");
			assert.equal(0, oFlexDataResponse.variants.length, "and the variants array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.changes.length, "and the changes array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantDependentControlChanges.length, "and the variantDependentControlChanges array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantManagementChanges.length, "and the variantManagementChanges array of the second response object is empty");
		});
		QUnit.test("Given storageResultDisassemble is called for a response with empty changes array and a variant section with a CUSTOMER variant that has CUSTOMER and USER control changes", function(assert) {
			var oResponse = {changes:[], variantSection:{}};
			oResponse.variantSection = {variantManagement1:{variantManagementChanges:{}, variants:[]}};
			var oVariant = {content:{fileName:"variant1", fileType:"ctrl_variant", layer:"CUSTOMER", variantManagementReference:"variantManagement1", creation:"2019-07-22T10:33:19.7491090Z"}, controlChanges:[], variantChanges:{}};
			oResponse.variantSection.variantManagement1.variants.push(oVariant);
			var aControlChanges = oVariant.controlChanges;
			aControlChanges.push({fileName:"change2", fileType:"change", layer:"CUSTOMER", variantReference:"variant1", creation:"2019-07-22T10:33:19.7491090Z"});
			aControlChanges.push({fileName:"change1", fileType:"change", layer:"CUSTOMER", variantReference:"variant1", creation:"2019-07-22T10:33:18.7491090Z"});
			aControlChanges.push({fileName:"change4", fileType:"change", layer:"USER", variantReference:"variant1", creation:"2019-07-22T10:33:21.7491090Z"});
			aControlChanges.push({fileName:"change3", fileType:"change", layer:"USER", variantReference:"variant1", creation:"2019-07-22T10:33:20.7491090Z"});
			// test
			var aResponses = storageResultDisassemble(oResponse);
			assert.equal(2, aResponses.length, "then an array with two response objects is returned");
			// CUSTOMER response object
			var oFlexDataResponse = aResponses[0];
			assert.equal(1, oFlexDataResponse.variants.length, "and the first response object is for the CUSTOMER layer");
			assert.equal("variant1", oFlexDataResponse.variants[0].fileName, "and variant1 is contained in the variants array");
			assert.equal(2, oFlexDataResponse.variantDependentControlChanges.length, "and the control changes are contained in the variantDependentControlChanges array sorted by creation timestamp in ascending order");
			assert.equal("change1", oFlexDataResponse.variantDependentControlChanges[0].fileName, "and change1 is the first control change in the array");
			assert.equal("change2", oFlexDataResponse.variantDependentControlChanges[1].fileName, "and change2 is the second control change in the array");
			assert.equal(0, oFlexDataResponse.changes.length, "and the changes array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantChanges.length, "and the variantChanges array of the first response object is empty");
			assert.equal(0, oFlexDataResponse.variantManagementChanges.length, "and the variantManagementChanges array of the first response object is empty");
			// USER response object
			oFlexDataResponse = aResponses[1];
			assert.equal(2, oFlexDataResponse.variantDependentControlChanges.length, "and the second response object is for the USER layer and contains the control changes in the variantDEpendentControlChanges array sorted by creation timestamp in ascending order");
			assert.equal("change3", oFlexDataResponse.variantDependentControlChanges[0].fileName, "and change3 is the first control change in the array");
			assert.equal("change4", oFlexDataResponse.variantDependentControlChanges[1].fileName, "and change4 is the second control change in the array");
			assert.equal(0, oFlexDataResponse.variants.length, "and the variants array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.changes.length, "and the changes array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantChanges.length, "and the variantChanges array of the second response object is empty");
			assert.equal(0, oFlexDataResponse.variantManagementChanges.length, "and the variantManagementChanges array of the second response object is empty");
		});
		QUnit.test("Given storageResultDisassemble is called for a response with duplicate VENDOR changes", function(assert) {
			var oResponse = {
				changes:[
					{
						fileName:"change1",
						fileType:"change",
						layer:"VENDOR",
						creation:"2019-07-22T10:32:19.7491090Z"},
					{
						fileName:"change1",
						fileType:"change",
						layer:"VENDOR",
						creation:"2019-07-22T10:32:19.7491090Z"}
				],
				variantSection: {}
			};
			// test
			var aResponses = storageResultDisassemble(oResponse);
			assert.equal(1, aResponses.length);
			// VENDOR response object
			var oFlexDataResponse = aResponses[0];
			assert.equal(2, oFlexDataResponse.changes.length, "then the response object contains the duplicate changes in its changes array");
			assert.equal("change1", oFlexDataResponse.changes[0].fileName);
			assert.equal("change1", oFlexDataResponse.changes[1].fileName);
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
