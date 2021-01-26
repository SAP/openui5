/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/initial/_internal/StorageUtils"
], function(
	sinon,
	Layer,
	Utils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var TEST_CONNECTORS = ["apply/someConnector", "write/someConnector"];

	function sortConnectors (mConnectors) {
		return mConnectors.sort(function(oConnectorA, oConnectorB) {
			return oConnectorA.connector > oConnectorB.connector ? -1 : 1;
		});
	}

	function getEmptyFlexDataWithIndex (iIndex) {
		return {
			appDescriptorChanges: [],
			index: iIndex,
			changes: [],
			comp: {
				changes: [],
				variants: [],
				defaultVariants: [],
				standardVariants: []
			},
			variants: [],
			variantChanges: [],
			variantDependentControlChanges: [],
			variantManagementChanges: [],
			ui2personalization: {}
		};
	}

	function requireConnectorsFake (vDependencies, fnCallback) {
		if ([].concat(vDependencies).some(function(sDependency) {
			return (
				/sap\/ui\/fl.*connectors/i.test(sDependency)
				|| TEST_CONNECTORS.indexOf(sDependency) > -1
			);
		})) {
			fnCallback();
			return undefined;
		}

		return sap.ui.require.wrappedMethod.apply(this, arguments);
	}

	QUnit.module("getGroupedFlexObjects (including getEmptyFlexDataResponse)", {
		beforeEach: function() {
			this.oEmptyResponse = {
				USER: getEmptyFlexDataWithIndex(6),
				PUBLIC: getEmptyFlexDataWithIndex(5),
				CUSTOMER: getEmptyFlexDataWithIndex(4),
				CUSTOMER_BASE: getEmptyFlexDataWithIndex(3),
				PARTNER: getEmptyFlexDataWithIndex(2),
				VENDOR: getEmptyFlexDataWithIndex(1),
				BASE: getEmptyFlexDataWithIndex(0)
			};

			this.oVariantManagementRef = "varManRef";
			this.oCtrlVariantUser = {
				fileType: "ctrl_variant",
				layer: Layer.USER
			};
			this.oCtrlVariantCustomer = {
				fileType: "ctrl_variant",
				layer: Layer.CUSTOMER
			};
			this.oCtrlVariantUserWithVMR = {
				fileType: "ctrl_variant",
				layer: Layer.USER,
				variantManagementReference: this.oVariantManagementRef
			};
			this.oCtrlVariantCustomerWithVMR = {
				fileType: "ctrl_variant",
				layer: Layer.CUSTOMER,
				variantManagementReference: this.oVariantManagementRef
			};
			this.oCtrlVariantManagUser = {
				fileType: "ctrl_variant_management_change",
				layer: Layer.USER
			};
			this.oCtrlVariantManagCustomer = {
				fileType: "ctrl_variant_management_change",
				layer: Layer.CUSTOMER
			};
			this.oChangeUser = {
				fileType: "change",
				layer: Layer.USER
			};
			this.oChangeCustomer = {
				fileType: "change",
				layer: Layer.CUSTOMER
			};
			this.oChangeUserWithVMR = {
				fileType: "change",
				layer: Layer.USER,
				variantReference: this.oVariantManagementRef
			};
			this.oChangeCustomerWithVMR = {
				fileType: "change",
				layer: Layer.CUSTOMER,
				variantReference: this.oVariantManagementRef
			};
			this.oVariantUser = {
				fileType: "variant",
				layer: Layer.USER
			};
			this.oVariantCustomer = {
				fileType: "variant",
				layer: Layer.CUSTOMER
			};
			this.oCtrlVariantChangeUser = {
				fileType: "ctrl_variant_change",
				layer: Layer.USER
			};
			this.oCtrlVariantChangeCustomer = {
				fileType: "ctrl_variant_change",
				layer: Layer.CUSTOMER
			};
			this.oOtherType = {
				fileType: "other"
			};
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("with all kinds of changes", function (assert) {
			var aTestData = [
				this.oCtrlVariantUser, this.oCtrlVariantCustomer, this.oCtrlVariantUserWithVMR, this.oCtrlVariantCustomerWithVMR,
				this.oCtrlVariantManagUser, this.oCtrlVariantManagCustomer, this.oChangeUser, this.oChangeCustomer,
				this.oChangeUserWithVMR, this.oChangeCustomerWithVMR, this.oVariantUser, this.oVariantCustomer,
				this.oCtrlVariantChangeUser, this.oCtrlVariantChangeCustomer, this.oOtherType
			];

			this.oEmptyResponse.USER.changes = [this.oChangeUser];
			this.oEmptyResponse.USER.comp.variants = [this.oVariantUser];
			this.oEmptyResponse.USER.variants = [this.oCtrlVariantUserWithVMR];
			this.oEmptyResponse.USER.variantChanges = [this.oCtrlVariantChangeUser];
			this.oEmptyResponse.USER.variantDependentControlChanges = [this.oChangeUserWithVMR];
			this.oEmptyResponse.USER.variantManagementChanges = [this.oCtrlVariantManagUser];

			this.oEmptyResponse.CUSTOMER.changes = [this.oChangeCustomer];
			this.oEmptyResponse.CUSTOMER.comp.variants = [this.oVariantCustomer];
			this.oEmptyResponse.CUSTOMER.variants = [this.oCtrlVariantCustomerWithVMR];
			this.oEmptyResponse.CUSTOMER.variantChanges = [this.oCtrlVariantChangeCustomer];
			this.oEmptyResponse.CUSTOMER.variantDependentControlChanges = [this.oChangeCustomerWithVMR];
			this.oEmptyResponse.CUSTOMER.variantManagementChanges = [this.oCtrlVariantManagCustomer];

			assert.deepEqual(Utils.getGroupedFlexObjects(aTestData), this.oEmptyResponse, "the return is correct");
		});

		QUnit.test("with an empty array", function(assert) {
			assert.deepEqual(Utils.getGroupedFlexObjects([]), this.oEmptyResponse, "the return is correct");
		});
	});

	QUnit.module("Given the default configuration", {
		beforeEach: function() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationSpy = sandbox.spy(sap.ui.getCore().getConfiguration(), "getFlexibilityServices");
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getStaticFileConnector is called", function(assert) {
			return Utils.getStaticFileConnector().then(function(mConnectors) {
				assert.equal(this.oGetConnectorsSpy.callCount, 0, "the getConnector is NOT called");
				assert.equal(this.oConfigurationSpy.callCount, 0, "configuration is not called");
				assert.equal(mConnectors.length, 1, "result contains only one connector");
				assert.equal(mConnectors[0].connector, "StaticFileConnector", "connector is of type StaticFileConnector");
			}.bind(this));
		});

		QUnit.test("when getLoadConnectors is called", function(assert) {
			return Utils.getLoadConnectors().then(function(mConnectors) {
				var mConnectorsSorted = sortConnectors(mConnectors);
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationSpy.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 2, "result contains only one connector");
				assert.equal(mConnectorsSorted[0].connector, "StaticFileConnector", "first connector is of type StaticFileConnector");
				assert.equal(mConnectorsSorted[1].connector, "LrepConnector", "second connector is of type LrepConnector");
			}.bind(this));
		});
	});

	QUnit.module("Given a KeyUserConnector and PersonalizationConnector is configured", {
		beforeEach: function() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER]},
				{connector: "PersonalizationConnector", layers: [Layer.USER]}
			]);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getStaticFileConnector is called", function(assert) {
			return Utils.getStaticFileConnector().then(function(mConnectors) {
				assert.equal(this.oGetConnectorsSpy.callCount, 0, "the getConnector is NOT called");
				assert.equal(this.oConfigurationStub.callCount, 0, "configuration is not called");
				assert.equal(mConnectors.length, 1, "result contains only one connector");
				assert.equal(mConnectors[0].connector, "StaticFileConnector", "connector is of type StaticFileConnector");
			}.bind(this));
		});

		QUnit.test("when getLoadConnectors is called", function(assert) {
			return Utils.getLoadConnectors().then(function(mConnectors) {
				var mConnectorsSorted = sortConnectors(mConnectors);
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationStub.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 3, "result contains three connector");
				assert.equal(mConnectorsSorted[0].connector, "StaticFileConnector", "first connector is of type StaticFileConnector");
				assert.equal(mConnectorsSorted[1].connector, "PersonalizationConnector", "second connector is of type PersonalizationConnector");
				assert.equal(mConnectorsSorted[2].connector, "KeyUserConnector", "third connector is of type KeyUserConnector");
			}.bind(this));
		});
	});

	QUnit.module("Given a NeoLrepConnector is configured", {
		beforeEach: function() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "NeoLrepConnector", layers: [Layer.ALL]}
			]);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getLoadConnectors is called", function(assert) {
			return Utils.getLoadConnectors().then(function(mConnectors) {
				var mConnectorsSorted = sortConnectors(mConnectors);
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationStub.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 2, "result contains two connector");
				assert.equal(mConnectorsSorted[0].connector, "StaticFileConnector", "first connector is of type StaticFileConnector");
				assert.equal(mConnectorsSorted[1].connector, "NeoLrepConnector", "second connector is of type Neo Connector");
			}.bind(this));
		});
	});

	QUnit.module("Given a custom connector (legacy with applyConnector) is configured", {
		beforeEach: function() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{applyConnector: "apply/someConnector", writeConnector: "write/someConnector", layers: [Layer.ALL]}
			]);
			this.oRequireStub = sandbox.stub(sap.ui, "require").callsFake(requireConnectorsFake);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getLoadConnectors is called", function(assert) {
			return Utils.getLoadConnectors().then(function(mConnectors) {
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationStub.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 2, "result contains two connector");
				var aRequiredModules = this.oRequireStub.getCall(0).args[0];
				assert.equal(aRequiredModules.length, 2, "two connectors were required");
				assert.equal(aRequiredModules[0], "sap/ui/fl/initial/_internal/connectors/StaticFileConnector", "first connector is of type StaticFileConnector");
				assert.equal(aRequiredModules[1], "apply/someConnector", "second connector is the applyConnector");
			}.bind(this));
		});

		QUnit.test("when getWriteConnectors is called", function(assert) {
			return Utils.getConnectors().then(function(mConnectors) {
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationStub.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 1, "result contains only one connector");
				var aRequiredModules = this.oRequireStub.getCall(0).args[0];
				assert.equal(aRequiredModules.length, 1, "one connector was required");
				assert.equal(aRequiredModules[0], "write/someConnector", "second connector is the applyConnector");
			}.bind(this));
		});
	});

	QUnit.module("Given a custom connector (with loadConnector) is configured", {
		beforeEach: function() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{loadConnector: "apply/someConnector", writeConnector: "write/someConnector", layers: [Layer.ALL]}
			]);
			this.oRequireStub = sandbox.stub(sap.ui, "require").callsFake(requireConnectorsFake);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getLoadConnectors is called", function(assert) {
			return Utils.getLoadConnectors().then(function(mConnectors) {
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationStub.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 2, "result contains two connector");
				var aRequiredModules = this.oRequireStub.getCall(0).args[0];
				assert.equal(aRequiredModules.length, 2, "two connectors were required");
				assert.equal(aRequiredModules[0], "sap/ui/fl/initial/_internal/connectors/StaticFileConnector", "first connector is of type StaticFileConnector");
				assert.equal(aRequiredModules[1], "apply/someConnector", "second connector is the applyConnector");
			}.bind(this));
		});

		QUnit.test("when getWriteConnectors is called", function(assert) {
			return Utils.getConnectors().then(function(mConnectors) {
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationStub.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 1, "result contains only one connector");
				var aRequiredModules = this.oRequireStub.getCall(0).args[0];
				assert.equal(aRequiredModules.length, 1, "one connector was required");
				assert.equal(aRequiredModules[0], "write/someConnector", "second connector is the applyConnector");
			}.bind(this));
		});
	});

	QUnit.module("Given a custom connector (without a writeConnector) is configured", {
		beforeEach: function() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{loadConnector: "apply/someConnector", layers: [Layer.ALL]}
			]);
			this.oRequireStub = sandbox.stub(sap.ui, "require").callsFake(requireConnectorsFake);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getLoadConnectors is called", function(assert) {
			return Utils.getConnectors().then(function(mConnectors) {
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationStub.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 1, "result contains only one connector");
				var aRequiredModules = this.oRequireStub.getCall(0).args[0];
				assert.equal(aRequiredModules.length, 1, "one connector was required");
				assert.equal(aRequiredModules[0], "sap/ui/fl/write/connectors/BaseConnector", "which is the write BaseConnector");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
