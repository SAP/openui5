/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/compVariants/prepareCompVariantsMap",
	"sap/ui/thirdparty/sinon-4"
], function(
	prepareCompVariantsMap,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	function fakeFlexObject(sId, sPersistencyKey) {
		return {
			fileName: sId,
			selector: {
				persistencyKey: sPersistencyKey
			}
		};
	}

	QUnit.module("prepareCompVariantsMap", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given an empty response", function(assert) {
			var mPropertyBag = {
				storageResponse: {
					changes: {
						comp: {
							variants: [],
							changes: [],
							defaultVariants: [],
							standardVariants: []
						}
					}
				}
			};
			var mCompVariants = prepareCompVariantsMap(mPropertyBag);
			assert.equal(Object.keys(mCompVariants).length, 2, "the map is returned, with two entries");
			assert.equal(typeof mCompVariants._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants._initialize, "function", "and the other entry is the helper function '_initialize'");
		});

		QUnit.test("given a response with favorite changes", function(assert) {
			var sPersistencyKey1 = "persistencyKey1";
			var sId1 = "addFavorite1";
			var oAddFavoriteChange1 = fakeFlexObject(sId1, sPersistencyKey1);
			var sId2 = "addFavorite2";
			var oRemoveFavoriteChange1 = fakeFlexObject(sId2, sPersistencyKey1);

			var sPersistencyKey2 = "persistencyKey2";
			var sId3 = "addFavorite3";
			var oAddFavoriteChange2 = fakeFlexObject(sId3, sPersistencyKey2);

			var mPropertyBag = {
				storageResponse: {
					changes: {
						comp: {
							variants: [],
							changes: [oAddFavoriteChange1, oRemoveFavoriteChange1, oAddFavoriteChange2],
							defaultVariants: [],
							standardVariants: []
						}
					}
				}
			};

			var mCompVariants = prepareCompVariantsMap(mPropertyBag);
			assert.deepEqual(mCompVariants[sPersistencyKey1].byId[sId1].getId(), sId1, "which is the provided variant under its ID");
			assert.equal(Object.keys(mCompVariants).length, 4, "the map is returned, with four entry");
			assert.equal(typeof mCompVariants._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants._initialize, "function", "and the other entry is the helper function '_initialize'");
			assert.equal(typeof mCompVariants[sPersistencyKey1], "object", "another is the persistency key");
			assert.equal(mCompVariants[sPersistencyKey1].changes.length, 2, "under the first persistencyKey with two change");
			assert.equal(mCompVariants[sPersistencyKey1].changes[0].getId(), sId1, "which is the first provided addFavorite change");
			assert.equal(mCompVariants[sPersistencyKey1].changes[1].getId(), sId2, "which is the second provided addFavorite change");
			assert.deepEqual(Object.keys(mCompVariants[sPersistencyKey1].byId).length, 2, "the first persistency key map contains two items");
			assert.equal(typeof mCompVariants[sPersistencyKey2], "object", "another is the persistency key");
			assert.equal(mCompVariants[sPersistencyKey2].changes.length, 1, "under the second persistencyKey with one change");
			assert.equal(mCompVariants[sPersistencyKey2].changes[0].getId(), sId3, "which is the third provided addFavorite change");
			assert.deepEqual(Object.keys(mCompVariants[sPersistencyKey2].byId).length, 1, "the second persistency key map contains one item");
		});

		QUnit.test("given a response with a defaultVariant change", function(assert) {
			var sPersistencyKey = "persistencyKey1";
			var sId1 = "defaultVariant1";
			var oDefaultVariantChange1 = fakeFlexObject(sId1, sPersistencyKey);
			var sId2 = "defaultVariant2";
			var oDefaultVariantChange2 = fakeFlexObject(sId2, sPersistencyKey);

			var mPropertyBag = {
				storageResponse: {
					changes: {
						comp: {
							variants: [],
							changes: [],
							defaultVariants: [oDefaultVariantChange1, oDefaultVariantChange2],
							standardVariants: []
						}
					}
				}
			};
			var mCompVariants = prepareCompVariantsMap(mPropertyBag);
			assert.equal(Object.keys(mCompVariants).length, 3, "the map is returned, with three entries");
			assert.equal(typeof mCompVariants._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants._initialize, "function", "and the other entry is the helper function '_initialize'");
			assert.equal(typeof mCompVariants[sPersistencyKey], "object", "another is the persistency key");
			assert.deepEqual(Object.keys(mCompVariants[sPersistencyKey].byId).length, 2, "the specific persistency key map contains two items");
			assert.deepEqual(mCompVariants[sPersistencyKey].byId[sId1].getId(), sId1, "which is the provided defaultVariant1 under its ID");
			assert.deepEqual(mCompVariants[sPersistencyKey].byId[sId2].getId(), sId2, "which is the provided defaultVariant2 under its ID");
			assert.equal(mCompVariants[sPersistencyKey].defaultVariants[1].getId(), sId2, "and with the latest provided defaultVariant change");
		});

		QUnit.test("given a response with a standardVariant change", function(assert) {
			var sPersistencyKey = "persistencyKey1";
			var sId1 = "standardVariant1";
			var oStandardVariantChange1 = fakeFlexObject(sId1, sPersistencyKey);
			var sId2 = "standardVariant2";
			var oStandardVariantChange2 = fakeFlexObject(sId2, sPersistencyKey);

			var mPropertyBag = {
				storageResponse: {
					changes: {
						comp: {
							variants: [],
							changes: [],
							defaultVariants: [],
							standardVariants: [oStandardVariantChange1, oStandardVariantChange2]
						}
					}
				}
			};
			var mCompVariants = prepareCompVariantsMap(mPropertyBag);
			assert.equal(Object.keys(mCompVariants).length, 3, "the map is returned, with three entries");
			assert.equal(typeof mCompVariants._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants._initialize, "function", "and the other entry is the helper function '_initialize'");
			assert.equal(typeof mCompVariants[sPersistencyKey], "object", "another is the persistency key");
			assert.deepEqual(Object.keys(mCompVariants[sPersistencyKey].byId).length, 2, "the specific persistency key map contains two items");
			assert.deepEqual(mCompVariants[sPersistencyKey].byId[sId1].getId(), sId1, "which is the provided defaultVariant1 under its ID");
			assert.deepEqual(mCompVariants[sPersistencyKey].byId[sId2].getId(), sId2, "which is the provided defaultVariant2 under its ID");
			assert.equal(mCompVariants[sPersistencyKey].standardVariantChange.getId(), sId2, "and with the latest provided standardVariant change");
		});

		QUnit.test("given a response with a variant", function(assert) {
			var sPersistencyKey = "persistencyKey1";
			var sId1 = "variant1";
			var oVariant1 = fakeFlexObject(sId1, sPersistencyKey);
			var sId2 = "variant2";
			var oVariant2 = fakeFlexObject(sId2, sPersistencyKey);

			var mPropertyBag = {
				storageResponse: {
					changes: {
						comp: {
							variants: [oVariant1, oVariant2],
							changes: [],
							defaultVariants: [],
							standardVariants: []
						}
					}
				}
			};
			var mCompVariants = prepareCompVariantsMap(mPropertyBag);
			assert.equal(Object.keys(mCompVariants).length, 3, "the map is returned, with three entries");
			assert.equal(typeof mCompVariants._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants._initialize, "function", "and the other entry is the helper function '_initialize'");
			assert.equal(typeof mCompVariants[sPersistencyKey], "object", "another is the persistency key");
			assert.equal(mCompVariants[sPersistencyKey].variants.length, 2, "with two variants");
			assert.equal(mCompVariants[sPersistencyKey].variants[0].getVariantId(), sId1, "which is the provided variant1");
			assert.equal(mCompVariants[sPersistencyKey].variants[1].getVariantId(), sId2, "which is the provided variant2");
			assert.deepEqual(Object.keys(mCompVariants[sPersistencyKey].byId).length, 2, "the specific persistency key map contains two items");
			assert.deepEqual(mCompVariants[sPersistencyKey].byId[sId1].getVariantId(), sId1, "which is the provided defaultVariant1 under its ID");
			assert.deepEqual(mCompVariants[sPersistencyKey].byId[sId2].getVariantId(), sId2, "which is the provided defaultVariant2 under its ID");
		});

		QUnit.test("given a response with an overwritten standard variant", function(assert) {
			var sPersistencyKey = "persistencyKey1";
			var sId1 = "variant1";
			var oVariant1 = fakeFlexObject(sId1, sPersistencyKey);
			var sId2 = "variant2";
			var oVariant2 = fakeFlexObject(sId2, sPersistencyKey);
			var sStandardVariantId = "standardVariant";
			var oStandardVariant = fakeFlexObject(sStandardVariantId, sPersistencyKey);
			oStandardVariant.content = {
				standardvariant: true
			};

			var mPropertyBag = {
				storageResponse: {
					changes: {
						comp: {
							variants: [oVariant1, oStandardVariant, oVariant2],
							changes: [],
							defaultVariants: [],
							standardVariants: []
						}
					}
				}
			};
			var mCompVariants = prepareCompVariantsMap(mPropertyBag);
			assert.equal(Object.keys(mCompVariants).length, 3, "the map is returned, with three entries");
			assert.equal(typeof mCompVariants._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants._initialize, "function", "and the other entry is the helper function '_initialize'");
			assert.equal(typeof mCompVariants[sPersistencyKey], "object", "another is the persistency key");
			assert.equal(mCompVariants[sPersistencyKey].variants.length, 3, "with three variants");
			assert.equal(mCompVariants[sPersistencyKey].variants[0].getVariantId(), sId1, "which is the provided variant1");
			assert.equal(mCompVariants[sPersistencyKey].variants[1].getVariantId(), sStandardVariantId, "which is the provided standardVariant");
			assert.equal(mCompVariants[sPersistencyKey].variants[2].getVariantId(), sId2, "which is the provided variant2");
			assert.deepEqual(Object.keys(mCompVariants[sPersistencyKey].byId).length, 3, "the specific persistency key map contains three items");
			assert.deepEqual(mCompVariants[sPersistencyKey].byId[sId1].getVariantId(), sId1, "which is the provided defaultVariant1 under its ID");
			assert.deepEqual(mCompVariants[sPersistencyKey].byId[sId2].getVariantId(), sId2, "which is the provided defaultVariant2 under its ID");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});