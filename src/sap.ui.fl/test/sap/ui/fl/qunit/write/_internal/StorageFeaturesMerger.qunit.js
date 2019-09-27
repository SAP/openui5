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
				isZeroDowntimeUpgradeRunning: false,
				system: "",
				client: ""
			};
			var aResponse = [];

			var oResult = StorageFeaturesMerger.mergeResults(aResponse);

			assert.deepEqual(oResult, DEFAULT_FEATURES, "get default values");
		});

		QUnit.test("mergeResults with different responses", function (assert) {
			var oResponse_1 = {isProductiveSystem: false, isKeyUser: false};
			var oResponse_2 = {isAtoAvailable: true, isKeyUser: true};
			var oResponse_3 = {newKey: true};
			var aResponse = [oResponse_1, oResponse_2, oResponse_3];

			var oResult = StorageFeaturesMerger.mergeResults(aResponse);

			assert.equal(oResult.newKey, true, "get new key");
			assert.equal(oResult.isKeyUser, true, "last isKeyuser is true");
			assert.equal(oResult.isAtoAvailable, true, "isAtoAvailable to true");
			assert.equal(oResult.isProductiveSystem, false, "isProductiveSystem is false");
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
