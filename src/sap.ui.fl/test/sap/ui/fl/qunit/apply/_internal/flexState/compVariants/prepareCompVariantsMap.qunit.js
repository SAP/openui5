/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/compVariants/prepareCompVariantsMap",
	"sap/ui/thirdparty/sinon-4"
], function(
	prepareCompVariantsMap,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	function fakeFlexObject(sId, sPersistencyKey) {
		return {
			fileName: sId,
			selector: {
				persistencyKey: sPersistencyKey
			}
		};
	}

	QUnit.module("prepareCompVariantsMap", {
		beforeEach: function() {},
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
			assert.deepEqual(mCompVariants.byId, {}, "then the by ID list is provided,");
			assert.equal(Object.keys(mCompVariants.map).length, 1, "the map is returned, with one entry");
			assert.equal(typeof mCompVariants.map._getOrCreate, "function", "and the entry is the helper function '_getOrCreate'");
		});

		QUnit.test("given an response with favorite changes", function(assert) {
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
			assert.deepEqual(Object.keys(mCompVariants.byId).length, 3, "then the by ID list with one entry is provided,");
			assert.deepEqual(mCompVariants.byId[sId1].getId(), sId1, "which is the provided variant under its ID");
			assert.equal(Object.keys(mCompVariants.map).length, 3, "the map is returned, with three entry");
			assert.equal(typeof mCompVariants.map._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants.map[sPersistencyKey1], "object", "another is the persistency key");
			assert.equal(mCompVariants.map[sPersistencyKey1].changes.length, 2, "under the first persistencyKey with two change");
			assert.equal(mCompVariants.map[sPersistencyKey1].changes[0].getId(), sId1, "which is the first provided addFavorite change");
			assert.equal(mCompVariants.map[sPersistencyKey1].changes[1].getId(), sId2, "which is the second provided addFavorite change");
			assert.equal(typeof mCompVariants.map[sPersistencyKey2], "object", "another is the persistency key");
			assert.equal(mCompVariants.map[sPersistencyKey2].changes.length, 1, "under the second persistencyKey with one change");
			assert.equal(mCompVariants.map[sPersistencyKey2].changes[0].getId(), sId3, "which is the third provided addFavorite change");
		});

		QUnit.test("given an response with a defaultVariant change", function(assert) {
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
			assert.deepEqual(Object.keys(mCompVariants.byId).length, 2, "then the by ID list with one entry is provided,");
			assert.deepEqual(mCompVariants.byId[sId1].getId(), sId1, "which is the provided defaultVariant1 under its ID");
			assert.deepEqual(mCompVariants.byId[sId2].getId(), sId2, "which is the provided defaultVariant2 under its ID");
			assert.equal(Object.keys(mCompVariants.map).length, 2, "the map is returned, with two entry");
			assert.equal(typeof mCompVariants.map._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants.map[sPersistencyKey], "object", "another is the persistency key");
			assert.equal(mCompVariants.map[sPersistencyKey].defaultVariant.getId(), sId2, "and with the latest provided defaultVariant change");
		});

		QUnit.test("given an response with a standardVariant change", function(assert) {
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
			assert.deepEqual(Object.keys(mCompVariants.byId).length, 2, "then the by ID list with one entry is provided,");
			assert.deepEqual(mCompVariants.byId[sId1].getId(), sId1, "which is the provided standardVariant1 under its ID");
			assert.deepEqual(mCompVariants.byId[sId2].getId(), sId2, "which is the provided standardVariant2 under its ID");
			assert.equal(Object.keys(mCompVariants.map).length, 2, "the map is returned, with two entry");
			assert.equal(typeof mCompVariants.map._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants.map[sPersistencyKey], "object", "another is the persistency key");
			assert.equal(mCompVariants.map[sPersistencyKey].standardVariant.getId(), sId2, "and with the latest provided standardVariant change");
		});

		QUnit.test("given an response with a variant", function(assert) {
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
			assert.deepEqual(Object.keys(mCompVariants.byId).length, 2, "then the by ID list with two entries is provided,");
			assert.deepEqual(mCompVariants.byId[sId1].getId(), sId1, "which is the provided variant1 under its ID");
			assert.deepEqual(mCompVariants.byId[sId2].getId(), sId2, "which is the provided variant2 under its ID");
			assert.equal(Object.keys(mCompVariants.map).length, 2, "the map is returned, with two entry");
			assert.equal(typeof mCompVariants.map._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants.map[sPersistencyKey], "object", "another is the persistency key");
			assert.equal(mCompVariants.map[sPersistencyKey].variants.length, 2, "with two variant");
			assert.equal(mCompVariants.map[sPersistencyKey].variants[0].getId(), sId1, "which is the provided variant1");
			assert.equal(mCompVariants.map[sPersistencyKey].variants[1].getId(), sId2, "which is the provided variant2");
		});

		QUnit.test("given an response with a overwritten standard variant", function(assert) {
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
			assert.deepEqual(Object.keys(mCompVariants.byId).length, 3, "then the by ID list with three entries is provided,");
			assert.deepEqual(mCompVariants.byId[sId1].getId(), sId1, "which is the provided variant1 under its ID");
			assert.deepEqual(mCompVariants.byId[sId2].getId(), sId2, "which is the provided variant2 under its ID");
			assert.equal(Object.keys(mCompVariants.map).length, 2, "the map is returned, with two entry");
			assert.equal(typeof mCompVariants.map._getOrCreate, "function", "and one entry is the helper function '_getOrCreate'");
			assert.equal(typeof mCompVariants.map[sPersistencyKey], "object", "another is the persistency key");
			assert.equal(mCompVariants.map[sPersistencyKey].variants.length, 3, "with three variant");
			assert.equal(mCompVariants.map[sPersistencyKey].variants[0].getId(), sId1, "which is the provided variant1");
			assert.equal(mCompVariants.map[sPersistencyKey].variants[1].getId(), sStandardVariantId, "which is the provided standardVariant");
			assert.equal(mCompVariants.map[sPersistencyKey].variants[2].getId(), sId2, "which is the provided variant2");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});