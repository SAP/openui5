/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/Layer",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	merge,
	sinon,
	FlexConfiguration,
	Layer,
	Utils,
	FlQUnitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var TEST_CONNECTORS = ["apply/someConnector", "write/someConnector"];

	function sortConnectors(mConnectors) {
		return mConnectors.sort(function(oConnectorA, oConnectorB) {
			return oConnectorA.connector > oConnectorB.connector ? -1 : 1;
		});
	}

	function getEmptyFlexDataWithIndex(iIndex) {
		return {
			appDescriptorChanges: [],
			annotationChanges: [],
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

	function checkModuleName(vDependencies) {
		return [].concat(vDependencies).some(function(sDependency) {
			return (
				/sap\/ui\/fl.*connectors/i.test(sDependency)
				|| TEST_CONNECTORS.indexOf(sDependency) > -1
			);
		});
	}

	QUnit.module("getGroupedFlexObjects (including getEmptyFlexDataResponse)", {
		beforeEach() {
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
			this.oAppDescriptorCustomer = {
				fileType: "change",
				appDescriptorChange: true,
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
				layer: Layer.USER,
				creation: "2021-01-01T12:00:00.000Z"
			};
			this.oVariantChangeUser1 = {
				fileType: "change",
				changeType: "updateVariant",
				layer: Layer.USER,
				creation: "2021-01-01T12:00:00.000Z"
			};
			this.oVariantChangeUser2 = {
				fileType: "change",
				changeType: "updateVariant",
				layer: Layer.USER,
				creation: "2021-01-02T12:00:00.000Z"
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
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with all kinds of changes", function(assert) {
			var aTestData = [
				this.oCtrlVariantUser, this.oCtrlVariantCustomer, this.oCtrlVariantUserWithVMR, this.oCtrlVariantCustomerWithVMR,
				// oVariantChangeUser2 & oVariantChangeUser1 are set in this order to check the sort functionality
				this.oCtrlVariantManagUser, this.oCtrlVariantManagCustomer, this.oVariantChangeUser2, this.oVariantChangeUser1,
				this.oChangeUser, this.oChangeCustomer,	this.oChangeUserWithVMR, this.oChangeCustomerWithVMR, this.oVariantUser,
				this.oVariantCustomer, this.oCtrlVariantChangeUser, this.oCtrlVariantChangeCustomer, this.oOtherType,
				this.oAppDescriptorCustomer
			];

			this.oEmptyResponse.USER.changes = [this.oChangeUser];
			this.oEmptyResponse.USER.comp.variants = [this.oVariantUser];
			this.oEmptyResponse.USER.comp.changes = [this.oVariantChangeUser1, this.oVariantChangeUser2];
			this.oEmptyResponse.USER.variants = [this.oCtrlVariantUserWithVMR];
			this.oEmptyResponse.USER.variantChanges = [this.oCtrlVariantChangeUser];
			this.oEmptyResponse.USER.variantDependentControlChanges = [this.oChangeUserWithVMR];
			this.oEmptyResponse.USER.variantManagementChanges = [this.oCtrlVariantManagUser];

			this.oEmptyResponse.CUSTOMER.changes = [this.oChangeCustomer];
			this.oEmptyResponse.CUSTOMER.appDescriptorChanges = [this.oAppDescriptorCustomer];
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

		QUnit.test("filterAndSortResponses", function(assert) {
			var oEmptyResponse1 = merge({}, this.oEmptyResponse);
			oEmptyResponse1.USER.changes = [this.oChangeUser];
			oEmptyResponse1.PUBLIC.appDescriptorChanges = [this.oAppDescriptorCustomer];
			oEmptyResponse1.CUSTOMER.variants = [this.oAppDescriptorCustomer];
			oEmptyResponse1.CUSTOMER_BASE.variantChanges = [this.oAppDescriptorCustomer];
			oEmptyResponse1.VENDOR.variantManagementChanges = [this.oAppDescriptorCustomer];
			oEmptyResponse1.BASE.variantDependentControlChanges = [this.oAppDescriptorCustomer];
			assert.strictEqual(Utils.filterAndSortResponses(oEmptyResponse1).length, 6, "no response was filtered out");

			var oEmptyResponse2 = merge({}, this.oEmptyResponse);
			oEmptyResponse2.USER.comp.variants = [this.oChangeUser];
			oEmptyResponse2.PUBLIC.comp.changes = [this.oAppDescriptorCustomer];
			oEmptyResponse2.CUSTOMER.comp.defaultVariants = [this.oAppDescriptorCustomer];
			oEmptyResponse2.CUSTOMER_BASE.comp.standardVariants = [this.oAppDescriptorCustomer];

			assert.strictEqual(Utils.filterAndSortResponses(oEmptyResponse2).length, 4, "two responses were filtered out");
		});
	});

	QUnit.module("Given the default configuration", {
		beforeEach() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationSpy = sandbox.spy(FlexConfiguration, "getFlexibilityServices");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
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
		beforeEach() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"},
				{connector: "PersonalizationConnector", layers: [Layer.USER]}
			]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
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
				var oKeyUserLayers = [
					Layer.CUSTOMER,
					Layer.PUBLIC
				];
				var mConnectorsSorted = sortConnectors(mConnectors);
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationStub.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 3, "result contains three connector");
				assert.equal(mConnectorsSorted[0].connector, "StaticFileConnector", "first connector is of type StaticFileConnector");
				assert.equal(mConnectorsSorted[1].connector, "PersonalizationConnector", "second connector is of type PersonalizationConnector");
				assert.equal(mConnectorsSorted[2].connector, "KeyUserConnector", "third connector is of type KeyUserConnector");
				assert.deepEqual(mConnectorsSorted[2].layers, oKeyUserLayers, "the KeyUserConnector contains the right layer");
			}.bind(this));
		});
	});

	QUnit.module("Given a NeoLrepConnector is configured", {
		beforeEach() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "NeoLrepConnector", layers: [Layer.ALL]}
			]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
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

	QUnit.module("Given a BtpServiceConnector is configured", {
		beforeEach() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "BtpServiceConnector"}
			]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getLoadConnectors is called", function(assert) {
			return Utils.getLoadConnectors().then(function(mConnectors) {
				var mConnectorsSorted = sortConnectors(mConnectors);
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationStub.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 2, "result contains two connector");
				assert.equal(mConnectorsSorted[0].connector, "StaticFileConnector", "first connector is of type StaticFileConnector");
				assert.equal(mConnectorsSorted[1].connector, "BtpServiceConnector", "second connector is of type Btp Service Connector");
			}.bind(this));
		});

		QUnit.test("when getWriteConnectors is called", function(assert) {
			return Utils.getConnectors().then(function(mConnectors) {
				assert.equal(this.oGetConnectorsSpy.callCount, 1, "the getConnector is called once");
				assert.equal(this.oConfigurationStub.callCount, 1, "configuration is called once");
				assert.equal(mConnectors.length, 1, "result contains only one connector");
				assert.equal(mConnectors[0].connector, "BtpServiceConnector", "second connector is of type Btp Service Connector");
			}.bind(this));
		});
	});

	QUnit.module("Given a custom connector (legacy with applyConnector) is configured", {
		beforeEach() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{applyConnector: "apply/someConnector", writeConnector: "write/someConnector", layers: [Layer.ALL]}
			]);
			this.oRequireStub = FlQUnitUtils.stubSapUiRequireDynamically(sandbox, checkModuleName);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
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
		beforeEach() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{loadConnector: "apply/someConnector", writeConnector: "write/someConnector", layers: [Layer.ALL]}
			]);
			this.oRequireStub = FlQUnitUtils.stubSapUiRequireDynamically(sandbox, checkModuleName);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
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
		beforeEach() {
			this.oGetConnectorsSpy = sandbox.spy(Utils, "getConnectors");
			this.oConfigurationStub = sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{loadConnector: "apply/someConnector", layers: [Layer.ALL]}
			]);
			this.oRequireStub = FlQUnitUtils.stubSapUiRequireDynamically(sandbox, checkModuleName);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
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

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
