/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/internal/Connector",
	"sap/ui/fl/apply/internal/connectors/LrepConnector"
], function(
	sinon,
	Connector,
	LrepConnector
) {
	"use strict";

	var FLEX_DATA_RESPONSE = {
		changes : [],
		variantSection : {}
	};

	var sandbox = sinon.sandbox.create();

	QUnit.module("Connector", {
		beforeEach : function () {
			sandbox.stub(LrepConnector, "loadFlexData").resolves(FLEX_DATA_RESPONSE);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given no property bag was passed on loadFlexData", function (assert) {
			return assert.throws(Connector.loadFlexData());
		});
		QUnit.test("given no reference within the property bag was passed on loadFlexData", function (assert) {
			return assert.throws(Connector.loadFlexData({}));
		});

		QUnit.test("given no static changes-bundle.json placed for 'reference' resource roots, when loading flex data", function (assert) {
			var oFlexDataPromise = Connector.loadFlexData({reference: "reference", appVersion: "1.0.0"}).then(function (oResult) {
				assert.deepEqual(oResult, FLEX_DATA_RESPONSE, "the default response was returned");
			});

			return oFlexDataPromise;
		});

		QUnit.test("given only a static changes-bundle.json with dummy data placed for 'test.app' resource roots, when loading flex data", function (assert) {
			// simulate a component-preload
			jQuery.sap.registerPreloadedModules({
				version : "2.0",
				name : "sap/ui/fl/qunit/internal/Connector",
				modules : {
					"test/app/changes/changes-bundle.json" : '[{"dummy":true}]'
				}
			})
			;
			var oFlexDataPromise = Connector.loadFlexData({reference: "test.app", appVersion: "1.0.0"}).then(function (oResult) {
				assert.equal(oResult.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
			});

			return oFlexDataPromise;
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
