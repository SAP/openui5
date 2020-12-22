/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/model/ContextModel",
	"sap/ui/integration/Host",
	"sap/ui/integration/util/Utils",
	"sap/ui/integration/widgets/Card"
],
function (
	Core,
	ContextModel,
	Host,
	Utils,
	Card
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifestSampleWithParameter = {
		"sap.app": {
			"id": "card.explorer.integration.hostContext",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"supplierId": {
						"value": "{context>/sample/supplier/id/value}"
					}
				}
			}
		}
	};

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

			// cleanup
			oModel.destroy();
			oHost.destroy();
			fnSpy.restore();
			done();
		});
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

			// cleanup
			oModel.destroy();
			oHost.destroy();
			done();
		});

		// act
		this.clock.tick(Utils.DEFAULT_PROMISE_TIMEOUT + 100);
	});

	QUnit.module("In card context", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.oCard = new Card();
			this.oHost = new Host();

			this.oCard.setHost(this.oHost);
		},
		afterEach:  function () {
			this.clock.restore();
			this.oCard.destroy();
			this.oHost.destroy();
		}
	});

	QUnit.test("Calling refresh() must clean the context model", function (assert) {
		// arrange
		var done = assert.async(),
			oCard = this.oCard,
			oHost = this.oHost,
			fnGetContextSpy;

		oHost.getContextValue = function (sPath) {
			return Promise.resolve("value");
		};

		fnGetContextSpy = sinon.spy(oHost, "getContextValue");

		// assert
		oCard.attachEventOnce("_ready", function () {
			assert.ok(fnGetContextSpy.called, "Method getContextValue is called once.");

			fnGetContextSpy.resetHistory();

			oCard.attachEventOnce("_ready", function () {
				assert.ok(fnGetContextSpy.called, "Method getContextValue is called again after refresh.");

				done();
			});

			oCard.refresh();
			Core.applyChanges();
		});

		// act
		oCard.setManifest(oManifestSampleWithParameter);
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});
});