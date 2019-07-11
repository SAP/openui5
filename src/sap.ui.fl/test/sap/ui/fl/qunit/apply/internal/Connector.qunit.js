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
		QUnit.test("given no static changes-bundle.json placed for 'reference' resource roots, when loading flex data", function(assert) {
			return Connector.loadFlexData("reference", "1.0.0").then(function (oResult) {
				assert.deepEqual(oResult, BaseConnector._RESPONSES.FLEX_DATA, "the default response was returned");
			});
		});

		QUnit.test("given only a static changes-bundle.json with dummy data placed for 'test.app' resource roots, when loading flex data", function(assert) {
			// simulate a component-preload
			jQuery.sap.registerPreloadedModules({
				version:"2.0",
				name:"sap/ui/fl/qunit/internal/Connector",
				modules:{
					"test/app/changes/changes-bundle.json": '[{"dummy":true}]'
				}
			})
;
			return Connector.loadFlexData("test.app", "1.0.0").then(function (oResult) {
				assert.equal(oResult.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
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
