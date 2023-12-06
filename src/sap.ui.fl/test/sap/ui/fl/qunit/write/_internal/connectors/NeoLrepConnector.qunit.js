/* global QUnit */
sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/connectors/NeoLrepConnector",
	"sap/ui/fl/write/_internal/connectors/NeoLrepConnector"
], function(
	sinon,
	InitialConnector,
	WriteConnector
) {
	"use strict";

	QUnit.module("Given a write NeoLrepConnector", {}, function() {
		QUnit.test("When the write connector was requested", function(assert) {
			assert.deepEqual(WriteConnector.initialConnector, InitialConnector, "then the initialConnector is set");
		});
	});
	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

