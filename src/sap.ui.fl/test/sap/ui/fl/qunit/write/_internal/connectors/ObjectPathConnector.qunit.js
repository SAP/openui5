/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/connectors/ObjectPathConnector",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/base/util/LoaderExtensions",
	"sap/ui/thirdparty/sinon-4"
], function(
	ObjectPathConnector,
	StorageUtils,
	LoaderExtensions,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	QUnit.module("When loading flex response", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when json path is set", function(assert) {
			var sPath = "/somePath";
			var oReturnObj = {returnObjProp: "return"};
			ObjectPathConnector.setJsonPath(sPath);
			sandbox.stub(LoaderExtensions, "loadResource")
				.callThrough()
				.withArgs({
					dataType: "json",
					url: sPath,
					async: true
				})
				.resolves(oReturnObj);

			return ObjectPathConnector.loadFlexData()
				.then(function(oResponse) {
					assert.deepEqual(oResponse, Object.assign(StorageUtils.getEmptyFlexDataResponse(), oReturnObj), "then the correct response is received");
				});
		});

		QUnit.test("when json path is passed", function(assert) {
			var sPath = "/somePath";
			var oReturnObj = {returnObjProp: "return"};
			sandbox.stub(LoaderExtensions, "loadResource")
				.callThrough()
				.withArgs({
					dataType: "json",
					url: sPath,
					async: true
				})
				.resolves(oReturnObj);

			return ObjectPathConnector.loadFlexData({path: sPath})
				.then(function(oResponse) {
					assert.deepEqual(oResponse, Object.assign(StorageUtils.getEmptyFlexDataResponse(), oReturnObj), "then the correct response is received");
				});
		});

		QUnit.test("when no path is passed", function(assert) {
			ObjectPathConnector.setJsonPath();

			return ObjectPathConnector.loadFlexData({})
				.then(function(oResponse) {
					assert.deepEqual(oResponse, undefined, "then no data is returned");
				});
		});
	});

	QUnit.module("When loading flex settings", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("then settings are returned", function(assert) {
			var oReturnedSettings = {
				isVariantSharingEnabled: true
			};
			var oReturnedJson = {
				settings: oReturnedSettings
			};
			var sPath = "somePath";

			sandbox.stub(LoaderExtensions, "loadResource")
				.callThrough()
				.withArgs({
					dataType: "json",
					url: sPath,
					async: true
				})
				.resolves(oReturnedJson);

			return ObjectPathConnector.loadFeatures({path: sPath})
				.then(function (oSettings) {
					assert.deepEqual(oSettings, oReturnedSettings, "the settings are correct");
				});
		});

		QUnit.test("then settings are not returned", function (assert) {
			var oReturnedSettings = {};
			var oReturnedJson = {};
			var sPath = "somePath";

			sandbox.stub(LoaderExtensions, "loadResource")
				.callThrough()
				.withArgs({
					dataType: "json",
					url: sPath,
					async: true
				})
				.resolves(oReturnedJson);

			return ObjectPathConnector.loadFeatures({path: sPath})
				.then(function (oSettings) {
					assert.deepEqual(oSettings, oReturnedSettings, "the settings are correct");
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
