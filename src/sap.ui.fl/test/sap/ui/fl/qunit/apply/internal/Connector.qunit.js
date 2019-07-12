/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/internal/Connector",
	"sap/ui/fl/apply/connectors/BaseConnector"
], function(
	sinon,
	Connector,
	BaseConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Connector", {
		beforeEach : function() {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("loadFlexData", function(assert) {
			return Connector.loadFlexData("reference", "1.0.0").then(function (oResult) {
				assert.deepEqual(oResult, BaseConnector._RESPONSES.FLEX_DATA, "the default response was merged and returned");
			});
		});

		QUnit.test("loadSettings", function(assert) {
			return Connector.loadFeatures().then(function (oResult) {
				assert.deepEqual(oResult, BaseConnector._RESPONSES.FEATURES, "the default response was merged and returned");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
