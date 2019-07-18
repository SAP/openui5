/* global QUnit */

/*
 This qunit test is targeting
 sap/ui/fl/apply/internal/Connector.js
 since the test setup requires a specific ui5 bootstrapping the testsuite.qunit.js contains specific parameters for these tests.
*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/internal/Connector"
], function(
	sinon,
	Connector
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
		QUnit.test("given only a static changes bundle with dummy data placed for test.app resource roots, when loading flex data", function(assert) {
			return Connector.loadFlexData({reference: "test.app", appVersion: "1.0.0"}).then(function (oResult) {
				assert.equal(oResult.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
