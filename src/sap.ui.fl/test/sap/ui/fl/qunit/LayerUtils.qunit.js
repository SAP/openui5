/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/LayerUtils",
	"sap/base/util/UriParameters",
	"sap/ui/thirdparty/sinon-4"
],
function(
	LayerUtils,
	UriParameters,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var aControls = [];

	QUnit.module("sap.ui.fl.LayerUtils", {
		beforeEach: function () {
		},
		afterEach: function () {
			aControls.forEach(function (oControl) {
				oControl.destroy();
			});
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sap.ui.fl.LayerUtils", function (assert) {
			var oInstance = LayerUtils;
			assert.ok(oInstance);
		});

		QUnit.test("getCurrentLayer shall return sap-ui-layer parameter", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns("VENDOR");
			var sLayer = LayerUtils.getCurrentLayer();
			assert.equal(sLayer, "VENDOR");
		});

		QUnit.test("getCurrentLayer shall return sap-ui-layer parameter and turn it to upper case", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns("vendor");
			var sLayer = LayerUtils.getCurrentLayer();
			assert.equal(sLayer, "VENDOR");
		});

		QUnit.test("getCurrentLayer shall return USER layer if endUser flag is set ", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns("VENDOR");
			var sLayer = LayerUtils.getCurrentLayer(true);
			assert.equal(sLayer, "USER");
		});

		QUnit.test("getCurrentLayer shall return default CUSTOMER layer ", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns(null);
			var sLayer = LayerUtils.getCurrentLayer(false);
			assert.equal(sLayer, "CUSTOMER");
		});

		QUnit.test("compareAgainstCurrentLayer shall return a layer comparision between current (CUSTOMER) and passed layers", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns("CUSTOMER");
			assert.equal(LayerUtils.compareAgainstCurrentLayer(""), -1, "then with VENDOR layer -1 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer("VENDOR"), -1, "then with VENDOR layer -1 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer("CUSTOMER"), 0, "then with CUSTOMER layer 0 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer("USER"), 1, "then with USER layer 1 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer("", "CUSTOMER_BASE"), -1, "then with VENDOR layer -1 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer("VENDOR", "CUSTOMER_BASE"), -1, "then with VENDOR layer -1 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer("CUSTOMER_BASE", "CUSTOMER_BASE"), 0, "then with CUSTOMER_BASE layer 0 is returned");
			assert.equal(LayerUtils.compareAgainstCurrentLayer("CUSTOMER", "CUSTOMER_BASE"), 1, "then with CUSTOMER layer 1 is returned");
		});

		QUnit.test("doesCurrentLayerRequirePackageCustomer", function (assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns("CUSTOMER");

			assert.strictEqual(LayerUtils.doesCurrentLayerRequirePackage(), false);
		});

		QUnit.test("doesCurrentLayerRequirePackageCustomerBase", function (assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns("CUSTOMER_BASE");

			assert.strictEqual(LayerUtils.doesCurrentLayerRequirePackage(), true);
		});
	});

	QUnit.module("LayerUtils.isCustomerDependentLayer", {
		beforeEach: function () {},
		afterEach: function () {}
	}, function() {
		QUnit.test("isCustomerDependentLayer", function(assert) {
			assert.ok(LayerUtils.isCustomerDependentLayer("CUSTOMER"), "'CUSTOMER' layer is detected as customer dependent");
			assert.ok(LayerUtils.isCustomerDependentLayer("CUSTOMER_BASE"), "'CUSTOMER_BASE' layer is detected as customer dependent");
			assert.strictEqual(LayerUtils.isCustomerDependentLayer("VENDOR"), false, "'VENDOR' layer is detected as not customer dependent layer");
		});
	});

	QUnit.module("LayerUtils.isLayerFilteringRequired", {
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when maxLayer is CUSTOMER", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-fl-max-layer").returns("CUSTOMER");

			assert.equal(LayerUtils.isLayerFilteringRequired(), true, "maxLayer is not equal topLayer");
		});

		QUnit.test("when maxLayer is USER", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-fl-max-layer").returns("USER");

			assert.equal(LayerUtils.isLayerFilteringRequired(), false, "maxLayer is equal topLayer");
		});
	});

	QUnit.module("LayerUtils.isOverMaxLayer", {
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("compare maxLayer: CUSTOMER with layer BASE", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-fl-max-layer").returns("CUSTOMER");

			assert.equal(LayerUtils.isOverMaxLayer("BASE"), false, "false");
		});

		QUnit.test("compare maxLayer: CUSTOMER with layer CUSTOMER", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-fl-max-layer").returns("CUSTOMER");

			assert.equal(LayerUtils.isOverMaxLayer("CUSTOMER"), false, "false");
		});

		QUnit.test("compare maxLayer: CUSTOMER with layer USER", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-fl-max-layer").returns("CUSTOMER");

			assert.equal(LayerUtils.isOverMaxLayer("USER"), true, "true");
		});
	});

	QUnit.module("LayerUtils.getMaxLayer", {
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sap-ui-fl-max-layer is not available", function (assert) {
			assert.equal(LayerUtils.getMaxLayer(), "USER", "return topLayer");
		});

		QUnit.test("sap-ui-fl-max-layer is set as url parameter", function (assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-fl-max-layer").returns("VENDOR");
			assert.equal(LayerUtils.getMaxLayer(), "VENDOR", "get UriParamter");
		});

		QUnit.test("sap-ui-fl-max-layer is set as hash parameter", function (assert) {
			var oParameters = {
				params: {
					"sap-ui-fl-max-layer": ["CUSTOMER"]
				}
			};
			sandbox.stub(LayerUtils, "getUshellContainer").returns({
				getService: function () {
					return {
						getHash: function () {
							return "";
						},
						parseShellHash: function () {
							return oParameters;
						}
					};
				}
			});
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-fl-max-layer").returns("VENDOR");
			assert.equal(LayerUtils.getMaxLayer(), "CUSTOMER", "get UriParamter");
		});
	});

	QUnit.module("LayerUtils.doesCurrentLayerRequirePackage", {
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with current layer VENDOR", function (assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").withArgs(false).returns("VENDOR");
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), true, "return true");
		});

		QUnit.test("with current layer PARTNER", function (assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").withArgs(false).returns("PARTNER");
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), true, "return true");
		});

		QUnit.test("with current layer CUSTOMER_BASE", function (assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").withArgs(false).returns("CUSTOMER_BASE");
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), true, "return true");
		});

		QUnit.test("with current layer CUSTOMER", function (assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").withArgs(false).returns("CUSTOMER");
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), false, "return false");
		});

		QUnit.test("with current layer USER", function (assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").withArgs(false).returns("USER");
			assert.equal(LayerUtils.doesCurrentLayerRequirePackage(), false, "return false");
		});
	});

	QUnit.module("LayerUtils.filterChangeDefinitionsByMaxLayer", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with max layer = ", function(assert) {
			var aChangeDefinitions = [
				{fileName: "user1", layer: "USER"},
				{fileName: "customer1", layer: "CUSTOMER"},
				{fileName: "customer_base1", layer: "CUSTOMER_BASE"},
				{fileName: "vendor1", layer: "VENDOR"},
				{fileName: "user2", layer: "USER"}
			];
			var oMaxLayerStub = sandbox.stub(LayerUtils, "getMaxLayer").returns("USER");
			var aFilteredChanges = LayerUtils.filterChangeDefinitionsByMaxLayer(aChangeDefinitions);
			assert.equal(aFilteredChanges.length, 5, "USER: all 5 changes are returned");

			oMaxLayerStub.returns("CUSTOMER");
			aFilteredChanges = LayerUtils.filterChangeDefinitionsByMaxLayer(aChangeDefinitions);
			assert.equal(aFilteredChanges.length, 3, "CUSTOMER: 3 changes are returned");
			assert.equal(aFilteredChanges[0].fileName, "customer1");
			assert.equal(aFilteredChanges[1].fileName, "customer_base1");
			assert.equal(aFilteredChanges[2].fileName, "vendor1");

			oMaxLayerStub.returns("CUSTOMER_BASE");
			aFilteredChanges = LayerUtils.filterChangeDefinitionsByMaxLayer(aChangeDefinitions);
			assert.equal(aFilteredChanges.length, 2, "CUSTOMER_BASE: 2 changes are returned");
			assert.equal(aFilteredChanges[0].fileName, "customer_base1");
			assert.equal(aFilteredChanges[1].fileName, "vendor1");

			oMaxLayerStub.returns("VENDOR");
			aFilteredChanges = LayerUtils.filterChangeDefinitionsByMaxLayer(aChangeDefinitions);
			assert.equal(aFilteredChanges.length, 1, "VENDOR: 1 change is returned");
			assert.equal(aFilteredChanges[0].fileName, "vendor1");
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
