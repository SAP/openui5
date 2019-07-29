/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/sinon-4"
], function(
	FeaturesAPI,
	Settings,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given FeaturesAPI", {
		afterEach : function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when isPublishAvailable is called with a NOT productive system", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves({
				isProductiveSystem: function () {
					return false;
				}
			});

			return FeaturesAPI.isPublishAvailable().then(function (bIsPublishAvailable) {
				assert.equal(bIsPublishAvailable, true, "then publish is  available");
			});
		});
		QUnit.test("when isPublishAvailable is called with a productive system", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves({
				isProductiveSystem: function () {
					return true;
				}
			});

			return FeaturesAPI.isPublishAvailable().then(function (bIsPublishAvailable) {
				assert.equal(bIsPublishAvailable, false, "then publish is not available");
			});
		});
	});
});