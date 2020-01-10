/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/_internal/StorageFeaturesMerger"
], function(
	sinon,
	StorageFeaturesMerger
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Basic functions", {
		beforeEach : function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("mergeResults with empty aResponse", function (assert) {
			var DEFAULT_FEATURES = {
				isKeyUser: false,
				isVariantSharingEnabled: false,
				isAtoAvailable: false,
				isAtoEnabled: false,
				isProductiveSystem: true,
				draft: {},
				isZeroDowntimeUpgradeRunning: false,
				system: "",
				client: ""
			};
			var aResponse = [];

			var oResult = StorageFeaturesMerger.mergeResults(aResponse);

			assert.deepEqual(oResult, DEFAULT_FEATURES, "get default values");
		});

		QUnit.test("mergeResults with different responses", function (assert) {
			var oResponse1 = {
				layers: [],
				features: {isProductiveSystem: false}
			};
			var oResponse2 = {
				layers : [],
				features : {isAtoAvailable : true, isKeyUser : true}
			};
			var oResponse3 = {
				layers : [],
				features : {newKey : true}
			};
			var aResponse = [oResponse1, oResponse2, oResponse3];

			var oResult = StorageFeaturesMerger.mergeResults(aResponse);

			assert.equal(oResult.newKey, true, "get new key");
			assert.equal(oResult.isKeyUser, true, "last isKeyuser is true");
			assert.equal(oResult.isAtoAvailable, true, "isAtoAvailable to true");
			assert.equal(oResult.isProductiveSystem, false, "isProductiveSystem is false");
		});

		QUnit.test("mergeResults handles the draft flag", function (assert) {
			var oResponse1 = {
				layers: ["VENDOR", "CUSTOMER_BASE"],
				features: {isDraftEnabled: false}
			};
			var oResponse2 = {
				layers: ["CUSTOMER"],
				features: {isDraftEnabled: true}
			};
			var oResponse3 = {
				layers: ["USER"],
				features: {isDraftEnabled: false}
			};
			var aResponse = [oResponse1, oResponse2, oResponse3];

			var oResult = StorageFeaturesMerger.mergeResults(aResponse);

			assert.equal(oResult.draft.VENDOR, false);
			assert.equal(oResult.draft.CUSTOMER_BASE, false);
			assert.equal(oResult.draft.PARTNER, undefined);
			assert.equal(oResult.draft.CUSTOMER, true);
			assert.equal(oResult.draft.USER, false);
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
