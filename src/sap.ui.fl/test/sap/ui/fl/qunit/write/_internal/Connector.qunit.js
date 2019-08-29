/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/_internal/Connector",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector"
], function(
	sinon,
	Connector,
	LrepConnector,
	JsObjectConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given Connector when .write is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("THEN it calls write of the connector", function(assert) {
			var oPayload = {};

			var mPropertyBag = {
				layer: "VENDOR",
				payload: oPayload
			};
			var sUrl = "/some/url";
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connectorName: "LrepConnector", layerFilter: ["VENDOR"], url: sUrl}
			]);

			var oWriteStub = sandbox.stub(LrepConnector, "write").resolves();

			return Connector.write(mPropertyBag).then(function () {
				assert.equal(oWriteStub.callCount, 1, "the write was triggered once");
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.equal(oWriteCallArgs.url, sUrl, "the url was added to the property bag");
				assert.equal(oWriteCallArgs.payload, oPayload, "the payload was passed in the property bag");
			});
		});

		QUnit.test("THEN it fails in case no connector is available for the layer", function(assert) {
			var oPayload = {};

			var mPropertyBag = {
				layer: "CUSTOMER",
				payload: oPayload
			};
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connectorName: "LrepConnector", layerFilter: ["VENDOR"]}
			]);

			return Connector.write(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "No Connector could be found to write into layer: CUSTOMER");
				});
		});

		QUnit.test("then it fails in case multiple connectors are available for the layer", function(assert) {
			var oPayload = {};

			var mPropertyBag = {
				layer: "VENDOR",
				payload: oPayload
			};
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connectorName: "LrepConnector", layerFilter: ["VENDOR"]},
				{connectorName: "JsObjectConnector", layerFilter: ["VENDOR", "CUSTOMER"]}
			]);

			return Connector.write(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: " +
						"Multiple Connectors were found to write into layer: VENDOR");
				});
		});
	});

	QUnit.module("Given Connector when .loadFeatures is called", {
		beforeEach : function() {
			this.url = "/some/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connectorName: "LrepConnector", layerFilter: ["VENDOR"], url: this.url},
				{connectorName: "JsObjectConnector", layerFilter: ["CUSTOMER"]}
			]);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("then it calls loadFeatures of the configured connectors", function(assert) {
			var oLrepConnectorLoadFeaturesStub = sandbox.stub(LrepConnector, "loadFeatures").resolves({});
			var oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadFeatures").resolves({});

			return Connector.loadFeatures().then(function () {
				assert.equal(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				var oLrepConnectorCallArgs = oLrepConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oLrepConnectorCallArgs, {url: this.url}, "the url was passed");
				assert.equal(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				var oJsObjectConnectorCallArgs = oJsObjectConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oJsObjectConnectorCallArgs, {url: undefined}, "no url was passed");
			}.bind(this));
		});

		QUnit.test("then merges the response of the connectors", function(assert) {
			sandbox.stub(LrepConnector, "loadFeatures").resolves({
				isKeyUser: true
			});
			sandbox.stub(JsObjectConnector, "loadFeatures").resolves({
				someProperty: "foo"
			});

			return Connector.loadFeatures().then(function (mFeatures) {
				assert.equal(mFeatures.isKeyUser, true, "the property of the LrepConnector was added");
				assert.equal(mFeatures.someProperty, "foo", "the property of the JsObjectConnector was added");
			});
		});

		QUnit.test("then higher layer overrule the lower layer", function(assert) {
			sandbox.stub(LrepConnector, "loadFeatures").resolves({
				isProductiveSystem: false
			});
			sandbox.stub(JsObjectConnector, "loadFeatures").resolves({
				isProductiveSystem: true
			});

			return Connector.loadFeatures().then(function (mFeatures) {
				assert.equal(Object.keys(mFeatures).length, 1, "only 1 feature was provided");
				assert.equal(mFeatures.isProductiveSystem, true, "the property was overruled by the second connector");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});