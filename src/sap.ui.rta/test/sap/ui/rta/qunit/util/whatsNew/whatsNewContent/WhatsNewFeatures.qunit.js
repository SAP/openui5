/* global QUnit */
sap.ui.define([
	"sap/ui/rta/util/whatsNew/whatsNewContent/WhatsNewFeatures",
	"sap/ui/thirdparty/sinon-4"
], function(
	WhatsNewFeatures,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("WhatsNewFeatures", {
		afterEach() {
			sandbox.restore();
		}
	});

	QUnit.test("getAllFeatures should return an array of features", function(assert) {
		const aFeatures = WhatsNewFeatures.getAllFeatures();
		assert.ok(Array.isArray(aFeatures), "Returned value should be an array");
	});

	QUnit.test("getAllFeatures should return at least one feature", function(assert) {
		const aFeatures = WhatsNewFeatures.getAllFeatures();
		assert.ok(aFeatures.length > 0, "Returned array should not be empty");
	});

	QUnit.test("getAllFeatures should return features with valid properties", function(assert) {
		const aFeatures = WhatsNewFeatures.getAllFeatures();
		aFeatures.forEach(function(oFeature) {
			assert.ok(oFeature.featureId, "Feature should have a unique featureId");
			assert.ok(oFeature.title, "Feature should have a title");
			assert.ok(oFeature.description, "Feature should have a description");
			if (oFeature.isFeatureApplicable) {
				assert.ok(typeof oFeature.isFeatureApplicable === "function", "Feature isFeatureApplicable should be a function");
			}
		});
	});
});