/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/connectors/ObjectPathConnector",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ObjectPathConnector,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("When loading flex settings", {}, function() {
		QUnit.test("then settings are returned", function(assert) {
			var oReturnedSettings = {
				isVariantSharingEnabled: true
			};
			var oReturnedJson = {
				settings: oReturnedSettings
			};
			sandbox.stub(jQuery, "get").returns(jQuery.Deferred().resolve(oReturnedJson));

			return ObjectPathConnector.loadFeatures({path: "somePath"}).then(function (oSettings) {
				assert.deepEqual(oSettings, oReturnedSettings, "the settings are correct");
				jQuery.get.restore();
			});
		});

		QUnit.test("then settings are not returned", function(assert) {
			var oReturnedSettings = {};
			var oReturnedJson = {};
			sandbox.stub(jQuery, "get").returns(jQuery.Deferred().resolve(oReturnedJson));

			return ObjectPathConnector.loadFeatures({path: "somePath"}).then(function (oSettings) {
				assert.deepEqual(oSettings, oReturnedSettings, "the settings are correct");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
