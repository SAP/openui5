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
			Settings._instance = undefined;
			sandbox.restore();
		}
	}, function () {
		[true, false].forEach(function (bValueToBeSet) {
			QUnit.test("when isPublishAvailable() is called for " + (bValueToBeSet ? "a" : "not a") + " productive system", function (assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isProductiveSystem: function () {
						return bValueToBeSet;
					}
				});

				return FeaturesAPI.isPublishAvailable().then(function (bReturnValue) {
					assert.strictEqual(bReturnValue, !bValueToBeSet, "then " + !bValueToBeSet + " is returned");
				});
			});

			QUnit.test("when isKeyUser() is called for " + (bValueToBeSet ? "a" : "not a") + " key user", function (assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isKeyUser: function () {
						return bValueToBeSet;
					}
				});
				return FeaturesAPI.isKeyUser()
					.then(function (bReturnValue) {
						assert.strictEqual(bReturnValue, bValueToBeSet, "then " + bValueToBeSet + " is returned");
					});
			});

			QUnit.test("when isDraftEnabled(sLayer) is called in a " +
					(bValueToBeSet ? "draft enabled" : "non draft enabled") + " layer", function (assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isDraftEnabled: function () {
						return bValueToBeSet;
					}
				});
				return FeaturesAPI.isDraftEnabled("CUSTOMER")
					.then(function (bReturnValue) {
						assert.strictEqual(bReturnValue, bValueToBeSet, "then " + bValueToBeSet + " is returned");
					});
			});
		});
	});
});