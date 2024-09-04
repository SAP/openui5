/* global QUnit */
sap.ui.define([
	"sap/ui/fl/registry/Settings",
	"sap/ui/rta/util/whatsNew/whatsNewContent/WhatsNewFeatures",
	"sap/ui/rta/util/whatsNew/WhatsNewUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Settings,
	WhatsNewFeatures,
	WhatsNewUtils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("WhatsNewUtils", {
		afterEach() {
			sandbox.restore();
		}
	});

	QUnit.test("getLearnMoreURL should return the correct S4Hana Learn more URL", function(assert) {
		const sPath = "0";
		const aFeatureCollection = [
			{
				featureId: "feature1",
				documentationUrls: {
					s4HanaCloudUrl: "s4HanaCloudUrlTestString",
					s4HanaOnPremUrl: "s4HanaOnPremUrlTestString",
					btpUrl: "btpUrlTestString"
				}
			}
		];
		const oSettings = {
			isAtoEnabled: () => true,
			getSystem: () => "test"
		};
		sandbox.stub(Settings, "getInstanceOrUndef").returns(oSettings);
		const sActualURL = WhatsNewUtils.getLearnMoreURL(sPath, aFeatureCollection);
		assert.strictEqual(sActualURL, aFeatureCollection[0].documentationUrls.s4HanaCloudUrl, "Returned URL should be correct");
	});

	QUnit.test("getLearnMoreURL should return the correct ABAP on-Premise Learn more URL", function(assert) {
		const sPath = "0";
		const aFeatureCollection = [
			{
				featureId: "feature1",
				documentationUrls: {
					s4HanaCloudUrl: "s4HanaCloudUrlTestString",
					s4HanaOnPremUrl: "s4HanaOnPremUrlTestString",
					btpUrl: "btpUrlTestString"
				}
			}
		];
		const oSettings = {
			isAtoEnabled: () => false,
			getSystem: () => "test"
		};
		sandbox.stub(Settings, "getInstanceOrUndef").returns(oSettings);
		const sActualURL = WhatsNewUtils.getLearnMoreURL(sPath, aFeatureCollection);
		assert.strictEqual(sActualURL, aFeatureCollection[0].documentationUrls.s4HanaOnPremUrl, "Returned URL should be correct");
	});

	QUnit.test("getLearnMoreURL should return the correct BTP Learn more URL", function(assert) {
		const sPath = "0";
		const aFeatureCollection = [
			{
				featureId: "feature1",
				documentationUrls: {
					s4HanaCloudUrl: "s4HanaCloudUrlTestString",
					s4HanaOnPremUrl: "s4HanaOnPremUrlTestString",
					btpUrl: "btpUrlTestString"
				}
			}
		];
		const oSettings = {
			isAtoEnabled: () => undefined,
			getSystem: () => undefined
		};
		sandbox.stub(Settings, "getInstanceOrUndef").returns(oSettings);
		const sActualURL = WhatsNewUtils.getLearnMoreURL(sPath, aFeatureCollection);
		assert.strictEqual(sActualURL, aFeatureCollection[0].documentationUrls.btpUrl, "Returned URL should be correct");
	});

	QUnit.test("getFilteredFeatures should return an array of features", function(assert) {
		const aFeatures = WhatsNewUtils.getFilteredFeatures([]);
		assert.ok(Array.isArray(aFeatures), "Returned value should be an array");
	});

	QUnit.test("getFilteredFeatures should exclude already seen features", function(assert) {
		sandbox.stub(WhatsNewFeatures, "getAllFeatures").returns([
			{ featureId: "feature1" },
			{ featureId: "feature2" },
			{ featureId: "feature3" }
		]);
		const sExcludedFeatureId = "feature2";
		const aFilteredFeatures = WhatsNewUtils.getFilteredFeatures([sExcludedFeatureId]);
		assert.strictEqual(aFilteredFeatures.length, 2, "Excluded feature is not included in the filtered result");
		assert.strictEqual(
			aFilteredFeatures.map((aFilteredFeature) => aFilteredFeature.featureId).includes(sExcludedFeatureId),
			false,
			"Already seen feature is excluded from the filtered result"
		);
	});

	QUnit.test("getFilteredFeatures should exclude technically not applicable features", function(assert) {
		sandbox.stub(WhatsNewFeatures, "getAllFeatures").returns([
			{
				featureId: "feature1",
				isFeatureApplicable(oSettings) {
					return oSettings.isAtoEnabled();
				}
			},
			{
				featureId: "feature2",
				isFeatureApplicable(oSettings) {
					return !oSettings.isAtoEnabled();
				}
			},
			{
				featureId: "feature3"
			}
		]);
		const oSettings = {
			isAtoEnabled: () => true
		};
		sandbox.stub(Settings, "getInstanceOrUndef").returns(oSettings);

		const aFilteredFeatures = WhatsNewUtils.getFilteredFeatures([]);
		assert.strictEqual(
			aFilteredFeatures.map((oFeature) => oFeature.featureId).includes("feature1"),
			true,
			"Technically applicable feature is included from the filtered result"
		);
		assert.strictEqual(
			aFilteredFeatures.map((oFeature) => oFeature.featureId).includes("feature2"),
			false,
			"Technically not applicable feature is excluded from the filtered result"
		);
		assert.strictEqual(
			aFilteredFeatures.map((oFeature) => oFeature.featureId).includes("feature3"),
			true,
			"Feature without isFeatureApplicable function is included in the filtered result"
		);
	});
});