/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/connectors/ObjectPathConnector",
	"sap/base/util/LoaderExtensions",
	"sap/ui/thirdparty/sinon-4"
], function(
	ObjectPathConnector,
	LoaderExtensions,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

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
