/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexObject,
	FlexInfoSession,
	Layer,
	LayerUtils,
	Settings,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function getURLParsingService(mParsedShellHash) {
		return {
			getHash() {
				return "";
			},
			parseShellHash() {
				return mParsedShellHash;
			}
		};
	}

	QUnit.module("sap.ui.fl.LayerUtils", {
		beforeEach() {
			Settings._instance = new Settings({});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("isSapUiLayerParameterProvided shall return true if the sap-ui-layer parameter is set", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-layer").returns(Layer.VENDOR);
			var bIsSapUiParameterProvided = LayerUtils.isSapUiLayerParameterProvided();
			assert.equal(bIsSapUiParameterProvided, true);
		});

		QUnit.test("isSapUiLayerParameterProvided shall return false if the sap-ui-layer parameter is NOT set", function(assert) {
			var bIsSapUiParameterProvided = LayerUtils.isSapUiLayerParameterProvided();
			assert.equal(bIsSapUiParameterProvided, false);
		});

		QUnit.test("getCurrentLayer shall return sap-ui-layer parameter", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-layer").returns(Layer.VENDOR);
			var sLayer = LayerUtils.getCurrentLayer();
			assert.equal(sLayer, Layer.VENDOR);
		});

		QUnit.test("getCurrentLayer shall return sap-ui-layer parameter and turn it to upper case", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-layer").returns(Layer.VENDOR.toLowerCase());
			var sLayer = LayerUtils.getCurrentLayer();
			assert.equal(sLayer, Layer.VENDOR);
		});

		QUnit.test("getCurrentLayer shall return default CUSTOMER layer", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-layer").returns(null);
			var sLayer = LayerUtils.getCurrentLayer();
			assert.equal(sLayer, Layer.CUSTOMER);
		});

		QUnit.test("compareAgainstCurrentLayer shall return a layer comparision between current (CUSTOMER) and passed layers", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-layer").returns(Layer.CUSTOMER);
			assert.equal(LayerUtils.compareAgainstCurrentLayer(""), -1, "then with VENDOR layer -1 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer(Layer.VENDOR), -1, "then with VENDOR layer -1 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer(Layer.CUSTOMER), 0, "then with CUSTOMER layer 0 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer(Layer.USER), 1, "then with USER layer 1 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer("", Layer.CUSTOMER_BASE), -1, "then with VENDOR layer -1 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer(Layer.VENDOR, Layer.CUSTOMER_BASE), -1, "then with VENDOR layer -1 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer(Layer.CUSTOMER_BASE, Layer.CUSTOMER_BASE), 0, "then with CUSTOMER_BASE layer 0 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer(Layer.CUSTOMER, Layer.CUSTOMER_BASE), 1, "then with CUSTOMER layer 1 is returned");
		});

		QUnit.test("doesCurrentLayerRequirePackageCustomer", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);

			assert.strictEqual(LayerUtils.doesCurrentLayerRequirePackage(), false);
		});

		QUnit.test("doesCurrentLayerRequirePackageCustomerBase", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER_BASE);

			assert.strictEqual(LayerUtils.doesCurrentLayerRequirePackage(), true);
		});

		QUnit.test("isDeveloperLayer", function(assert) {
			assert.strictEqual(LayerUtils.isDeveloperLayer(Layer.USER), false, "the USER Layer is not a developer layer");
			assert.strictEqual(LayerUtils.isDeveloperLayer(Layer.CUSTOMER), false, "the CUSTOMER Layer is not a developer layer");
			assert.strictEqual(LayerUtils.isDeveloperLayer(Layer.PUBLIC), false, "the PUBLIC Layer is not a developer layer");
			assert.strictEqual(LayerUtils.isDeveloperLayer(Layer.CUSTOMER_BASE), true, "the CUSTOMER_BASE is a developer layer");
			assert.strictEqual(LayerUtils.isDeveloperLayer(Layer.VENDOR), true, "the VENDOR is a developer layer");
		});
	});

	QUnit.module("LayerUtils.isValidLayer", function() {
		QUnit.test("isValidLayer", function(assert) {
			assert.ok(LayerUtils.isValidLayer(Layer.CUSTOMER), "with 'CUSTOMER' layer the function returns 'true'");
			assert.notOk(LayerUtils.isValidLayer("INVALID"), "with 'INVALID' layer the function returns 'false'");
		});
	});

	QUnit.module("LayerUtils.isCustomerDependentLayer", function() {
		QUnit.test("isCustomerDependentLayer", function(assert) {
			assert.ok(LayerUtils.isCustomerDependentLayer(Layer.CUSTOMER), "'CUSTOMER' layer is detected as customer dependent");
			assert.ok(LayerUtils.isCustomerDependentLayer(Layer.CUSTOMER_BASE), "'CUSTOMER_BASE' layer is detected as customer dependent");
			assert.strictEqual(LayerUtils.isCustomerDependentLayer(Layer.VENDOR), false, "'VENDOR' layer is detected as not customer dependent layer");
		});
	});

	QUnit.module("LayerUtils.isLayerFilteringRequired", {
		afterEach() {
			FlexInfoSession.remove();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when maxLayer is CUSTOMER", function(assert) {
			sandbox.stub(FlexInfoSession, "getByReference").returns({maxLayer: Layer.CUSTOMER});
			assert.equal(LayerUtils.isLayerFilteringRequired(), true, "maxLayer is not equal topLayer");
		});

		QUnit.test("when maxLayer is USER", function(assert) {
			sandbox.stub(FlexInfoSession, "getByReference").returns({maxLayer: Layer.USER});
			assert.equal(LayerUtils.isLayerFilteringRequired(), false, "maxLayer is equal topLayer");
		});
	});

	/**
	 * @deprecated As of version 1.118
	 */
	QUnit.module("LayerUtils.isOverMaxLayer", {
		beforeEach() {
			this.oURLParsingService = getURLParsingService();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("compare maxLayer: CUSTOMER with layer BASE", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-fl-max-layer").returns(Layer.CUSTOMER);

			assert.equal(LayerUtils.isOverMaxLayer(Layer.BASE, this.oURLParsingService), false, "false");
		});

		QUnit.test("compare maxLayer: CUSTOMER with layer CUSTOMER", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-fl-max-layer").returns(Layer.CUSTOMER);

			assert.equal(LayerUtils.isOverMaxLayer(Layer.CUSTOMER, this.oURLParsingService), false, "false");
		});

		QUnit.test("compare maxLayer: CUSTOMER with layer USER", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-fl-max-layer").returns(Layer.CUSTOMER);

			assert.equal(LayerUtils.isOverMaxLayer(Layer.USER, this.oURLParsingService), true, "true");
		});
	});

	QUnit.module("LayerUtils.isOverLayer", function() {
		QUnit.test("compare CUSTOMER with layer BASE", function(assert) {
			assert.equal(LayerUtils.isOverLayer(Layer.BASE, Layer.CUSTOMER), false, "false");
		});

		QUnit.test("compare CUSTOMER with layer CUSTOMER", function(assert) {
			assert.equal(LayerUtils.isOverLayer(Layer.CUSTOMER, Layer.CUSTOMER), false, "false");
		});

		QUnit.test("compare CUSTOMER with layer USER", function(assert) {
			assert.equal(LayerUtils.isOverLayer(Layer.USER, Layer.CUSTOMER), true, "true");
		});
	});

	/**
	 * @deprecated As of version 1.118
	 */
	QUnit.module("LayerUtils.getMaxLayer", {
		beforeEach() {
			this.oURLParsingService = getURLParsingService();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sap-ui-fl-max-layer is not available", function(assert) {
			assert.equal(LayerUtils.getMaxLayer(this.oURLParsingService), Layer.USER, "return topLayer");
		});

		QUnit.test("sap-ui-fl-max-layer is set as url parameter", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-fl-max-layer").returns(Layer.VENDOR);
			assert.equal(LayerUtils.getMaxLayer(this.oURLParsingService), Layer.VENDOR, "get UriParamter");
		});

		QUnit.test("sap-ui-fl-max-layer is set as hash parameter", function(assert) {
			this.oURLParsingService = getURLParsingService({
				params: {
					"sap-ui-fl-max-layer": [Layer.CUSTOMER]
				}
			});
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-fl-max-layer").returns(Layer.VENDOR);
			assert.equal(LayerUtils.getMaxLayer(this.oURLParsingService), Layer.CUSTOMER, "get UriParamter");
		});
	});

	QUnit.module("LayerUtils.doesCurrentLayerRequirePackage", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with current layer VENDOR", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.VENDOR);
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), true, "return true");
		});

		QUnit.test("with current layer PARTNER", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.PARTNER);
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), true, "return true");
		});

		QUnit.test("with current layer CUSTOMER_BASE", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER_BASE);
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), true, "return true");
		});

		QUnit.test("with current layer CUSTOMER", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), false, "return false");
		});

		QUnit.test("with current layer PUBLIC", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.PUBLIC);
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), false, "return false");
		});

		QUnit.test("with current layer USER", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.USER);
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), false, "return false");
		});
	});

	/**
	 * @deprecated As of version 1.118
	 */
	QUnit.module("LayerUtils.filterChangeDefinitionsByMaxLayer", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with max layer = ", function(assert) {
			var oDummyURLParsingService = "DummyURLParsingService";
			var aChangeDefinitions = [
				{fileName: "user1", layer: Layer.USER},
				{fileName: "customer1", layer: Layer.CUSTOMER},
				{fileName: "customer_base1", layer: Layer.CUSTOMER_BASE},
				{fileName: "vendor1", layer: Layer.VENDOR},
				{fileName: "user2", layer: Layer.USER}
			];
			var oMaxLayerStub = sandbox.stub(LayerUtils, "getMaxLayer").returns(Layer.USER);
			var aFilteredChanges = LayerUtils.filterChangeDefinitionsByMaxLayer(aChangeDefinitions, oDummyURLParsingService);
			assert.equal(aFilteredChanges.length, 5, "USER: all 5 changes are returned");
			assert.ok(oMaxLayerStub.withArgs(oDummyURLParsingService), "then getMaxLayer was called with the URLParsingService");

			oMaxLayerStub.returns(Layer.CUSTOMER);
			aFilteredChanges = LayerUtils.filterChangeDefinitionsByMaxLayer(aChangeDefinitions);
			assert.equal(aFilteredChanges.length, 3, "CUSTOMER: 3 changes are returned");
			assert.equal(aFilteredChanges[0].fileName, "customer1");
			assert.equal(aFilteredChanges[1].fileName, "customer_base1");
			assert.equal(aFilteredChanges[2].fileName, "vendor1");

			oMaxLayerStub.returns(Layer.CUSTOMER_BASE);
			aFilteredChanges = LayerUtils.filterChangeDefinitionsByMaxLayer(aChangeDefinitions);
			assert.equal(aFilteredChanges.length, 2, "CUSTOMER_BASE: 2 changes are returned");
			assert.equal(aFilteredChanges[0].fileName, "customer_base1");
			assert.equal(aFilteredChanges[1].fileName, "vendor1");

			oMaxLayerStub.returns(Layer.VENDOR);
			aFilteredChanges = LayerUtils.filterChangeDefinitionsByMaxLayer(aChangeDefinitions);
			assert.equal(aFilteredChanges.length, 1, "VENDOR: 1 change is returned");
			assert.equal(aFilteredChanges[0].fileName, "vendor1");
		});
	});

	QUnit.module("LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer", {
		beforeEach() {
			this.vChanges = [
				{layer: Layer.USER},
				{layer: Layer.CUSTOMER},
				new FlexObject({layer: Layer.USER}),
				new FlexObject({layer: Layer.CUSTOMER})
			];
		}
	}, function() {
		QUnit.test("without current layer passed", function(assert) {
			assert.deepEqual(LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer(this.vChanges), this.vChanges, "the changes were returned without filtering");
		});

		QUnit.test("with current layer passed", function(assert) {
			var aExpectedChanges1 = [this.vChanges[0], this.vChanges[2]];
			var aExpectedChanges2 = [this.vChanges[1], this.vChanges[3]];
			assert.deepEqual(LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer(this.vChanges, Layer.USER), aExpectedChanges1, "the changes were returned with filtering");
			assert.deepEqual(LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer(this.vChanges, Layer.CUSTOMER), aExpectedChanges2, "the changes were returned with filtering");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});