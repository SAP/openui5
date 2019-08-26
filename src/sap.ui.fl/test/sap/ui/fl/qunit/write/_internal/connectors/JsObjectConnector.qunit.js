/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/thirdparty/jquery"
], function(
	JsObjectConnector,
	jQuery
) {
	"use strict";

	QUnit.module("Loading of Connector", {}, function() {
		QUnit.test("the storage is configured", function(assert) {
			assert.equal(typeof JsObjectConnector.oStorage.setItem, "function", "the storage has the setItem function");
			assert.equal(typeof JsObjectConnector.oStorage.clear, "function", "the storage has the clear function");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
