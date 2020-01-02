/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/thirdparty/jquery"
], function(
	JsObjectConnector,
	StorageUtils,
	JsObjectWriteConnector,
	jQuery
) {
	"use strict";

	QUnit.module("Loading of Connector", {}, function() {
		QUnit.test("given a custom connector is configured", function(assert) {
			return StorageUtils.getApplyConnectors().then(function (aConnectors) {
				assert.equal(aConnectors.length, 2, "two connectors are loaded");
				assert.equal(aConnectors[0].connector, "StaticFileConnector", "the StaticFileConnector is the first connector");
				assert.equal(aConnectors[1].connector, "JsObjectConnector", "the JsObjectConnector is the second connector");
			});
		});
	});

	QUnit.module("Storage functions - both connectors mixed", function() {
		QUnit.test("setItem / getItem / clear", function(assert) {
			JsObjectWriteConnector.oStorage.setItem("key1", "value1");
			JsObjectWriteConnector.oStorage.setItem("key2", "value2");

			assert.equal(JsObjectConnector.oStorage.getItem("key1"), "value1", "the value was set and retrieved");
			assert.equal(JsObjectConnector.oStorage.getItem("key2"), "value2", "the value was set and retrieved");

			JsObjectConnector.oStorage.clear();
			assert.equal(Object.keys(JsObjectConnector.oStorage.getItems()).length, 0, "the object again has no items");

			JsObjectConnector.oStorage.setItem("key1", "value1");
			JsObjectWriteConnector.oStorage.clear();
			assert.equal(Object.keys(JsObjectConnector.oStorage.getItems()).length, 0, "the object again has no items");
		});
	});

	function parameterizedTest(oConnectorStorage, sConnector) {
		QUnit.module("Storage functions - " + sConnector, function() {
			QUnit.test("setItem / getItem / clear", function(assert) {
				oConnectorStorage.setItem("key1", "value1");
				oConnectorStorage.setItem("key2", "value2");

				assert.equal(oConnectorStorage.getItem("key1"), "value1", "the value was set and retrieved");
				assert.equal(oConnectorStorage.getItem("key2"), "value2", "the value was set and retrieved");

				oConnectorStorage.clear();
				assert.equal(Object.keys(oConnectorStorage.getItems()).length, 0, "the object again has no items");
				assert.equal(typeof oConnectorStorage.setItem, "function", "the storage has the setItem function");
				assert.equal(typeof oConnectorStorage.clear, "function", "the storage has the clear function");
				assert.equal(typeof oConnectorStorage.getItem, "function", "the storage has the clear function");
			});
		});
	}

	parameterizedTest(JsObjectConnector.oStorage, "ApplyConnector");
	parameterizedTest(JsObjectWriteConnector.oStorage, "WriteConnector");

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
