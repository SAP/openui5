/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/ContextModel",
	"sap/ui/integration/Host",
	"sap/ui/integration/util/Utils"
],
function (
	ContextModel,
	Host,
	Utils
) {
	"use strict";

	QUnit.module("Creating instance");

	QUnit.test("Call #createBindingInfos with values, that don't contain binding", function (assert) {
		// act
		var oModel = new ContextModel();

		// assert
		assert.ok(oModel, "The model is created.");

		// cleanup
		oModel.destroy();
	});

	QUnit.module("Test #getProperty", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach:  function () {
			this.clock.restore();
		}
	});

	QUnit.test("Call #getProperty without Host", function (assert) {
		// act
		var oModel = new ContextModel({"property": "value"});

		// assert
		assert.strictEqual(oModel.getProperty("/property"), "value", "The property is correct.");

		// cleanup
		oModel.destroy();
	});

	QUnit.test("Call #getProperty with Host and #waitForPendingProperties", function (assert) {
		// act
		var done = assert.async(),
			oModel = new ContextModel(),
			oHost = new Host(),
			sSamplePath = "/sap.host/property/value",
			sSampleResult = "value",
			fnSpy;

		oHost.getContextValue = function (sPath) {
			if (sPath === sSamplePath.substring(1)) {
				return Promise.resolve(sSampleResult);
			}
		};

		fnSpy = sinon.spy(oHost, "getContextValue");

		oModel.setHost(oHost);

		// assert
		assert.strictEqual(oModel.getProperty(sSamplePath), null, "The property returns null the first time.");
		assert.ok(fnSpy.calledOnce, "Host#getContextValue is called once.");

		oModel.waitForPendingProperties().then(function () {
			assert.strictEqual(oModel.getProperty(sSamplePath), sSampleResult, "The property returns the sample result the second time.");
			assert.ok(fnSpy.calledOnce, "Host#getContextValue is called once.");

			done();
		});

		// cleanup
		oModel.destroy();
		oHost.destroy();
		fnSpy.restore();
	});

	QUnit.test("Call #getProperty with Host which never resolves", function (assert) {
		// arrange
		var done = assert.async(),
			oModel = new ContextModel(),
			oHost = new Host(),
			sSamplePath = "/sap.host/property/value";

		oHost.getContextValue = function (sPath) {
			return new Promise(function () {});
		};

		oModel.setHost(oHost);

		// assert
		assert.strictEqual(oModel.getProperty(sSamplePath), null, "The property returns null the first time.");

		oModel.waitForPendingProperties().then(function () {
			assert.strictEqual(oModel.getProperty(sSamplePath), null, "The property is null. The promise has timed out.");
			done();
		});

		// act
		this.clock.tick(Utils.DEFAULT_PROMISE_TIMEOUT + 100);

		// cleanup
		oModel.destroy();
		oHost.destroy();
	});
});