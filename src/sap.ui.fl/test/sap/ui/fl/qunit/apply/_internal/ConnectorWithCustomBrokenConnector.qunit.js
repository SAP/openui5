/* global QUnit */

/*
 This qunit test is targeting
 sap/ui/fl/apply/_internal/Connector.js
 since the test setup requires a specific ui5 bootstrapping the testsuite.qunit.js contains specific parameters for these tests.
*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/Connector",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"my/lib/BrokenConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils"
], function(
	sinon,
	Connector,
	BaseConnector,
	BrokenConnector,
	ConnectorUtils
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
		QUnit.test("given a custom connector is configured", function(assert) {
			return ConnectorUtils.getApplyConnectors().then(function (aConnectors) {
				assert.equal(aConnectors.length, 2, "two connectors are loaded");
				assert.equal(aConnectors[0].connector, "StaticFileConnector", "the StaticFileConnector is the first connector");
				assert.equal(aConnectors[1].connector, "my/lib/BrokenConnector", "the BrokenConnector is the second connector");
				assert.equal(aConnectors[1].connectorModule.testCheckProperty, true, "the test property identifying the BrokenConnector is present");
			});
		});

		QUnit.test("given the BrokenConnector when BrokenConnector.loadFlexData is called", function(assert) {
			var done = assert.async();

			return BrokenConnector.loadFlexData().catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "loadFlexData is not implemented", "then the connector fails");
				done();
			});
		});

		QUnit.test("given the BrokenConnector is registered and a changes-bundle.json is present for the application when Connector.loadFlexData is called", function(assert) {
			return Connector.loadFlexData({reference: "test.app", appVersion: "1.0.0"}).then(function (oResult) {
				assert.equal(oResult.changes.length, 1, "then one change is returned");
				assert.deepEqual(oResult.changes[0], {dummy: true}, "and the data from the changes bundle is included");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
