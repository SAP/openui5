/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/connectors/StaticFileConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/base/Log"
], function(
	sinon,
	StaticFileConnector,
	Utils,
	Log
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function _simulateComponentPreload(sReference, mModules) {
		jQuery.sap.registerPreloadedModules({
			version : "2.0",
			name : sReference,
			modules : mModules
		});
	}

	QUnit.module("Storage handles flexibility-bundle.json and changes-bundle.json", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("given no static flexibility-bundle.json and changes-bundle.json placed for 'reference' resource roots, when loading flex data", function (assert) {
			return StaticFileConnector.loadFlexData({reference: "reference", appVersion: "1.0.0"}).then(function (oResult) {
				assert.deepEqual(oResult, Utils.getEmptyFlexDataResponse(), "the default response was returned");
			});
		});

		QUnit.test("given a broken bundle.json for 'test.app' resource roots, when loading flex data", function (assert) {
			_simulateComponentPreload("test.app.broken", {
				"test/app/broken/changes/changes-bundle.json" : '[{:true}]'
			});

			var oLogSpy = sandbox.spy(Log, "error");
			var oLogWarning = sandbox.spy(Log, "warning");

			return StaticFileConnector.loadFlexData({reference: "test.app.broken", appVersion: "1.0.0"}).then(function (oResult) {
				assert.deepEqual(oResult, Utils.getEmptyFlexDataResponse(), "the default response was returned");
				if (oLogSpy.callCount !== 1) {
					assert.equal(oLogWarning.callCount, 1, "an error or warning was logged");
				}
			});
		});

		QUnit.test("given only a static changes-bundle.json with dummy data placed for 'test.app' resource roots, when loading flex data", function (assert) {
			_simulateComponentPreload("test.app", {
				"test/app/changes/changes-bundle.json" : '[{"dummy":true}]'
			});
			return StaticFileConnector.loadFlexData({reference: "test.app", appVersion: "1.0.0"}).then(function (oResult) {
				assert.equal(oResult.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
			});
		});

		QUnit.test("given only a static flexibility-bundle.json with dummy data placed for 'test.app2' resource roots, when loading flex data", function (assert) {
			// simulate a component-preload
			_simulateComponentPreload("test.app2", {
				"test/app2/changes/flexibility-bundle.json" : '{' +
					'"changes": [{"dummy1":true}],' +
					'"compVariants": [{"dummy2":true}],' +
					'"variantChanges": [{"dummy3":true}],' +
					'"variantDependentControlChanges": [{"dummy4":true}],' +
					'"variantManagementChanges": [{"dummy5":true}],' +
					'"variants": [{"dummy6":true}]' +
					'}'
			});

			return StaticFileConnector.loadFlexData({reference: "test.app2", appVersion: "1.0.0"}).then(function (oResult) {
				assert.equal(oResult.changes.length, 1, "one change was loaded");
				assert.equal(oResult.changes[0].dummy1, true, "the change dummy data is correctly loaded");
				assert.equal(oResult.compVariants[0].dummy2, true, "the compVariant dummy data is correctly loaded");
				assert.equal(oResult.variantChanges[0].dummy3, true, "the variantChange dummy data is correctly loaded");
				assert.equal(oResult.variantDependentControlChanges[0].dummy4, true, "the variantDependentControlChange dummy data is correctly loaded");
				assert.equal(oResult.variantManagementChanges[0].dummy5, true, "the variantManagementChange dummy data is correctly loaded");
				assert.equal(oResult.variants[0].dummy6, true, "the variant dummy data is correctly loaded");
			});
		});
	});


	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
